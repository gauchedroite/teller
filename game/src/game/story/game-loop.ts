import { IGameInstance } from "../iinstance.js";
import GameData from "../game-data.js";
import { IAction, IActor, IGameData, IMessageTo, IMoment, IScene, ISituation, Kind } from "../igame-data.js";
import { ChoiceKind, IChoice, IUI } from "../iui.js";
import { ChunkKind, IBackground, IDialog, IDo, IGameResult, IHeading, IInline, IMetadata, IMiniGame, IMomentData, IOptions, ISceneData, IStyle, IText, ITitle, IWaitClick, Op } from "../igame.js";
import { isObjectEmpty, log, waitforMsecAsync } from "../../utils.js";


export class Game implements IGameInstance {
    gdata: GameData;
    ui: IUI;
    data!: IGameData;
    currentMoment: IMoment | null = null;
    currentScene: IScene | null = null;
    forbiddenSceneId: number | null = null;
    chunks: Array<IMomentData> = [];
    cix: number = 0;
    sitWindows: Array<string>;
    gameWindows: Array<IGameInstance>;
    started: boolean;
    bc: BroadcastChannel;

    constructor(id: string, ui: IUI) {
        (<any>window).GameInstance = this;

        this.gdata = new GameData(id);
        this.ui = ui

        this.sitWindows = new Array<string>();
        this.gameWindows = new Array<IGameInstance>();
        this.started = false;

        this.bc = new BroadcastChannel("game-loop:")
    }

    // Called when starting a game cold, or after a new game is created.
    // Not called when the game is already running and the user just continue the game from the menu screen.
    runGameAsync = async () => {
        const text = await this.gdata.fetchGameFileAsync();
        if (text == undefined || text.length == 0)
            return;

        this.gdata.parseGameFile(text);

        if (this.gdata.state == undefined || isObjectEmpty(this.gdata.state)) {
            return this.startNewGameAsync();
        }
        else {
            return this.resumeGameAsync();
        }
    };

    // Called when the user has confirmed a new game.
    eraseGame = () => {
        var options = this.gdata.options;
        this.gdata.eraseAllUserStorage();
        this.gdata.options = options;
    };


    
    private startNewGameAsync = async () => {
        this.gdata.eraseAllUserStorage();

        let options = this.gdata.options;
        if (isObjectEmpty(options)) options = <IOptions>{ 
            fastStory: false
        };
        this.gdata.options = options;

        let state = { intro: true };
        (state as any)[this.gdata.game.initialstate] = true;
        this.gdata.state = state;

        // list of showed moments
        this.gdata.history = [];

        this.bc.postMessage({ op: "GAME_START" })

        this.data = this.gdata;
        this.bc.postMessage({ op: "SHOWING_CHOICES" })
        this.currentMoment = Game.selectOne(this.getAllPossibleEverything());
        if (this.currentMoment != null) {
            await this.startGameLoopAsync(Op.START_BLURBING);
        }
        else {
            await this.refreshGameAndAlertAsync("AUCUN POINT DE DEPART POUR LE JEU");
            await this.startGameLoopAsync(Op.BUILD_CHOICES)
        }
    };

    private resumeGameAsync = async () => {
        this.restoreContinueData();
        this.data = this.gdata;
        await this.ui.initSceneAsync(Game.parseScene(this.currentScene!));
        await this.startGameLoopAsync(this.currentMoment != null ? Op.START_BLURBING : Op.BUILD_CHOICES)
    };



    private startGameLoopAsync = async (op: Op): Promise<void> => {
        this.data = this.gdata;
        log("startGameLoopAsync")

        while (true) {
            if (op == Op.START_BLURBING && !this.started) {
                if (this.currentMoment != null) {
                    this.started = true;
                }
                else {
                    this.currentMoment = Game.selectOne(this.getAllPossibleEverything());
                    if (this.currentMoment != null) {
                        this.started = true;
                    }
                }
            }
            else if (op == Op.START_BLURBING && this.currentMoment != null) {
                this.chunks = this.parseMoment(this.currentMoment);
                this.cix = 0;

                let kind = this.currentMoment.kind; 
                if (kind == Kind.Moment || kind == Kind.Action) {
                    this.currentScene = this.getSceneOf(this.currentMoment)!;
                }
                this.saveContinueData();
                
                this.ui.clearBlurb();
                await this.ui.initSceneAsync(Game.parseScene(this.currentScene!));
                this.bc.postMessage({op: "SHOWING_MOMENT", moment: this.currentMoment })
                op = Op.BLURB;
            }
            else if (op == Op.BLURB) {
                if (this.cix < this.chunks.length) {
                    var chunk = this.chunks[this.cix++];

                    let first = this.cix == 1;
                    let notLast = this.cix < this.chunks.length;
                    let goFast = this.gdata.options.fastStory// && notLast;
                    if (goFast) {
                        this.ui.addBlurbFast(chunk);
                        await waitforMsecAsync(50);
                        op = Op.BLURB;
                    }
                    else {
                        if (chunk.kind == ChunkKind.minigame) {
                            let minigame = <IMiniGame>chunk;
                            const result = await this.ui.addBlurbAsync(chunk) as any;
                            let command = (result.win == true ? minigame.winCommand : minigame.loseCommand);
                            let moment = <IMoment> { id: -1, text: command, parentid: this.currentScene!.id };
                            this.executeMoment(moment);

                            let text = (result.win == true ? minigame.winText : minigame.loseText);
                            let resultChunk = <IGameResult> { kind: ChunkKind.gameresult, text: text }; 
                            this.chunks.splice(this.cix, 0, resultChunk);

                            await waitforMsecAsync(500)
                            op = Op.BLURB
                        }
                        else {
                            if (first) await waitforMsecAsync(500)
                            await this.ui.addBlurbAsync(chunk)
                            await waitforMsecAsync(50)                         
                        }
                    }
                }
                else {
                    let state = this.gdata.state;
                    if (state.intro != undefined) {
                        delete state.intro;
                        this.gdata.state = state;
                    }

                    this.currentMoment = this.gdata.getMoment(this.gdata.moments, this.currentMoment!.id); //we might have edited the moment
                    this.executeMoment(this.currentMoment!);

                    op = Op.BUILD_CHOICES;
                }
            }
            else if (op == Op.BUILD_CHOICES) {
                let moments = this.getAllPossibleMoments();
                let messages = this.getAllPossibleMessages();
                let choices = this.buildChoices(moments, messages);
                this.bc.postMessage({op: "SHOWING_CHOICES", moments, messages, choices })
                this.updateTimedState();
                if (choices.length > 0) {
                    const chosen = await this.ui.showChoicesAsync(choices)
                    await this.ui.hideChoicesAsync()
                    this.currentMoment = this.getChosenMoment(chosen);
                    op = Op.START_BLURBING
                }
                else {
                    await this.refreshGameAndAlertAsync("Il ne se passe plus rien pour le moment.");
                    op = Op.BUILD_CHOICES
                }
            }
            else {
                await this.refreshGameAndAlertAsync("!!! DEAD END !!!");
                op = Op.BUILD_CHOICES
            }
        }
    };



    private saveContinueData = () => {
        this.gdata.setContinueLocation({
            momentId: (this.currentMoment != undefined ? this.currentMoment.id : undefined),
            sceneId: (this.currentScene != undefined ? this.currentScene.id : undefined),
            forbiddenSceneId: this.forbiddenSceneId
        });
        this.gdata.continueState = {
            state: this.gdata.state,
            history: this.gdata.history
        }
    };

    private restoreContinueData = () => {
        let cstate = this.gdata.getContinueLocation();
        if (cstate != undefined) {
            this.currentMoment = (cstate.momentId != undefined ? this.gdata.getMoment(this.gdata.moments, cstate.momentId) : null);
            this.currentScene = (cstate.sceneId != undefined ? this.gdata.getScene(this.gdata.scenes, cstate.sceneId) : null);
            this.forbiddenSceneId = cstate.forbiddenSceneId;
        }
        let state = this.gdata.continueState;
        if (state != undefined) {
            this.gdata.state = state.state; 
            this.gdata.history = state.history;
        }
    };



    private refreshGameAndAlertAsync = async (text: string) => {
        const json = await this.gdata.fetchGameFileAsync()
        if (json != undefined && json.length > 0) this.gdata.parseGameFile(json);
        return this.ui.alertAsync(text); 
    };

    private getAllPossibleMoments = (): Array<IMoment> => {
        var data = this.data;

        let sits = data.situations;
        let situation: ISituation | null = null;
        for (var sit of sits) {
            if (this.isValidSituation(sit)) {
                situation = sit;
                break;
            }
        }
        if (situation == null)
            return Array<IMoment>();

        var sids = Array<number>();
        //
        for (var scene of data.scenes) {
            if (scene.sitid == situation.id) {
                sids.push(scene.id);
            }
        }

        var moments = Array<IMoment>();
        //
        for (var moment of data.moments) {
            if (moment.kind == Kind.Moment || moment.kind == Kind.Action) {
                if (sids.indexOf(moment.parentid) != -1) {
                    if (this.isValidMoment(moment)) {
                        moments.push(moment);
                    }
                }
            }
        }
        //
        return moments;
    };

    private getAllPossibleMessages = (): Array<IMoment> => {
        var data = this.data;

        let sits = data.situations;
        let situation: ISituation | null = null;
        for (var sit of sits) {
            if (this.isValidSituation(sit)) {
                situation = sit;
                break;
            }
        }
        if (situation == null)
            return Array<IMoment>();

        var aids = Array<number>();
        //
        for (var actor of data.actors) {
            if (actor.sitid == situation.id) {
                aids.push(actor.id);
            }
        }

        var messages = Array<IMoment>();
        //
        for (var moment of data.moments) {
            if (moment.kind == Kind.MessageTo || moment.kind == Kind.MessageFrom) {
                if (aids.indexOf(moment.parentid) != -1) {
                    if (this.isValidMoment(moment)) {
                        messages.push(moment);
                    }
                }
            }
        }
        //
        return messages;
    };

    private getAllPossibleEverything = (): Array<IMoment> => {
        let all = this.getAllPossibleMoments();
        Array.prototype.push.apply(all, this.getAllPossibleMessages());
        return all;
    };

    private buildChoices = (moments: Array<IMoment>, messages: Array<IMoment>): Array<IChoice> => {
        let scenes = Array<IScene>();
        let actions = Array<IAction>();
        
        for (var moment of moments) {
            if (moment.kind == Kind.Moment) {
                let scene = this.getSceneOf(moment)!;
                if (this.forbiddenSceneId == null || this.forbiddenSceneId != scene.id) {
                    if (scenes.indexOf(scene) == -1)
                        scenes.push(scene);
                }
            }
            else {
                actions.push(<IAction>moment);                
            }
        }

        let choices = Array<IChoice>();
        choices = scenes.map((obj) => { 
            return <IChoice> { 
                kind: ChoiceKind.scene,
                id: obj.id,
                text: obj.name 
            }; 
        });
        let choices2 = Array<IChoice>();
        choices2 = actions.map((obj) => { 
            return <IChoice> { 
                kind: ChoiceKind.action,
                id: obj.id,
                text: obj.name 
            }; 
        });
        choices = choices.concat(choices2);


        for (var message of messages) {
            if (message.kind == Kind.MessageFrom) {
                choices.push(<IChoice> {
                    kind: ChoiceKind.messageFrom,
                    id: message.id,
                    text: "Message de " + this.getActorOf(message)!.name
                });
            }
            else {
                let msg = (<IMessageTo>message);
                choices.push(<IChoice> {
                    kind: ChoiceKind.messageTo,
                    id: msg.id,
                    text: "Contacter " + this.getActorById(msg.to)!.name,
                    subtext: msg.name
                });
            }
        }
        
        this.forbiddenSceneId = null;
        return choices;
    };

    private getChosenMoment = (choice: IChoice): IMoment | null => {
        if (choice.kind == ChoiceKind.scene) {
            let data = this.data;
            let scene: IScene | null = null;
            for (scene of data.scenes) {
                if (scene.id == choice.id) break;
            }
            let moments = Array<IMoment>();
            for (var moment of data.moments) {
                if (moment.kind == Kind.Moment) {
                    if (scene?.mids.indexOf(moment.id) != -1) {
                        if (this.isValidMoment(moment)) {
                            moments.push(moment);
                        }
                    }
                }
            }
            return Game.selectOne(moments);
        }
        else {
            let id = choice.id;
            for (var moment of this.data.moments) {
                if (moment.id == id)
                    return moment;
            }
        }
        return null;
    };

    private static selectOne = (moments: Array<IMoment>) => {
        if (moments.length == 0) return null;
        let winner = Math.floor(Math.random() * moments.length);
        let moment = moments[winner];
        return moment;
    }

    private isValidMoment = (moment: IMoment): boolean => {
        var when = moment.when || "";
        if (when == "") return false;
        let state = this.gdata.state;
        //
        if (typeof state.intro !== "undefined") {
            if (when == "intro") return true;
            return false;
        }
        // a moment can't be played twice
        var history = this.gdata.history;
        if (history.indexOf(moment.id) != -1)
            return false;
        //
        return Game.isValidCondition(state, when);
    };

    private isValidSituation = (situation: ISituation): boolean => {
        var when = situation.when || "";
        if (when == "") return false;
        if (situation.text != undefined) return false;
        return Game.isValidCondition(this.gdata.state, when);
    }

    private static isValidCondition = (state: any, when: string) => {
        let ok = true;
        let conds = when.split(",");
        for (var cond of conds) {
            let parts = cond.replace("=", ":").split(":");
            let name = parts[0].trim();
            let value: any = (parts.length == 2 ? parts[1].trim() : "true");
            if (value == "true" || value == "false") value = (value == "true");
            let statevalue = state[name];
            if (value === "undef") {
                if (typeof statevalue !== "undefined") ok = false;
            }
            else {
                if (typeof statevalue === "undefined") ok = false;
                else if (statevalue !== value) ok = false;
            }
            if (ok == false) break;
        }
        return ok;
    }

    private getSceneOf = (moment: IMoment): IScene | null => {
        var scenes = this.data.scenes;
        for (var scene of scenes) {
            if (scene.id == moment.parentid) {
                return scene;
            }
        }
        return null
    };

    private getActorOf = (message: IMoment): IActor | null => {
        var actors = this.data.actors;
        for (var actor of actors) {
            if (actor.id == message.parentid) {
                return actor;
            }
        }
        return null
    };

    private getActorById = (id: number): IActor | null => {
        var actors = this.data.actors;
        for (var actor of actors) {
            if (actor.id == id) {
                return actor;
            }
        }
        return null
    };

    private parseMoment = (moment: IMoment): Array<IMomentData> => {
        var parsed = Array<IMomentData>();
        var dialog = <IDialog>{};
        var fsm = "";
        var inComment = false

        if (moment.text == null)
            return parsed;
            
        var parts = moment.text.split("\n");
        for (var part of parts) {
            if (part.length > 0) {
                let parts2 = part.split("//");
                let command = (parts2.length > 0 ? parts2[0].trim() : null);
                let metadata = Game.parseMetadata(parts2.length > 1 ? parts2[1].trim() : null);

                if (command == undefined || command.length == 0) {
                }
                else if (command.startsWith("/*")) {
                    inComment = true;
                }
                else if (inComment) {
                    inComment = (command.startsWith("*/") == false);
                }
                else if (command.startsWith(".a ")) {
                    let actor = command.substring(2).trim();
                    dialog = <IDialog> { kind: ChunkKind.dialog };
                    dialog.actor = actor;
                    dialog.metadata = metadata;
                    fsm = "DIALOG";
                }
                else if (command.startsWith("(")) {
                    dialog.parenthetical = command;
                }
                else if (command.startsWith(".bb")) {
                    let asset = <IBackground> { kind: ChunkKind.background, asset: command.substring(3).trim(), wide: true, metadata: metadata };
                    parsed.push(asset);
                }
                else if (command.startsWith(".b")) {
                    let asset = <IBackground> { kind: ChunkKind.background, asset: command.substring(2).trim(), wide: false, metadata: metadata };
                    parsed.push(asset);
                }
                else if (command.startsWith(".i")) {
                    let image = <IInline> { kind: ChunkKind.inline , image: command.substring(2).trim(), metadata: metadata };
                    parsed.push(image);
                }
                else if (command.startsWith(".d ")) {
                    let text = command.substring(2).trim();
                    let pause = <IDo> { kind: ChunkKind.doo, text: text, metadata: metadata };
                    parsed.push(pause);
                }
                else if (command.startsWith(".d")) {
                    let space = command.indexOf(" ");
                    if (space != -1) {
                        let chance = parseInt(command.substring(2, space));
                        if ((Math.random() * chance) < 1) {
                            let lines = command.substr(space).trim().split("/");
                            let text = <IText> { kind: ChunkKind.text };
                            text.lines = Array<string>();
                            for (var line of lines) {
                                text.lines.push(line);
                            }
                            parsed[parsed.length - 1] = text;
                        }
                    }
                }
                else if (command.startsWith(".h")) {
                    let parts = command.substring(2).trim().split("/");
                    let title = parts[0].trim();
                    let subtitle = (parts.length > 1 ? parts[1].trim() : undefined);
                    let heading = <IHeading> { kind: ChunkKind.heading, title: title, subtitle: subtitle, metadata: metadata};
                    parsed.push(heading);
                }
                else if (command.startsWith(".m")) {
                    let minigame = <IMiniGame> { kind: ChunkKind.minigame };
                    let parts = command.substring(2).trim().split("/");
                    minigame.text = parts[0].trim(); 
                    minigame.url = parts[1].trim();
                    let parts2 = parts[2].split("=>");
                    minigame.winText = parts2[0].trim();
                    minigame.winCommand = parts2[1].trim();
                    parts2 = parts[3].split("=>");
                    minigame.loseText = parts2[0].trim();
                    minigame.loseCommand = parts2[1].trim();
                    parsed.push(minigame);
                }
                else if (command.startsWith(".w")) {
                    let pause = <IWaitClick> { kind: ChunkKind.waitclick };
                    parsed.push(pause);
                }
                else if (command.startsWith(".t ")) {
                    let text = command.substring(2).trim();
                    let title = <ITitle> { kind: ChunkKind.title, text: text };
                    parsed.push(title);
                }
                else if (command.startsWith(".")) {
                    let style = <IStyle> { kind: ChunkKind.style, metadata: metadata };
                    parsed.push(style);
                }
                else {
                    if (fsm == "DIALOG") {
                        var lines = command.split("/");

                        dialog.lines = Array<string>();
                        for (var line of lines) {
                            dialog.lines.push(line);
                        }
                        parsed.push(dialog);
                        fsm = "";
                    }
                    else {
                        var lines = command.split("/");

                        let text = <IText> { kind: ChunkKind.text };
                        text.lines = Array<string>();
                        for (var line of lines) {
                            text.lines.push(line);
                        }
                        parsed.push(text);
                    }
                }
            }
        }
        return parsed;
    };

    private executeMoment = (moment: IMoment): void => {
        var inComment = false
        var canRepeat = false;

        var parts = moment.text.split("\n");
        for (var part of parts) {
            if (part.length > 0) {
                if (part.startsWith("/*")) {
                    inComment = true;
                }
                else if (inComment) {
                    inComment = (part.startsWith("*/") == false);
                }
                else if (part.startsWith(".r ")) {
                    let rems = part.substring(2).split(",");
                    for (var rem of rems) {
                        let parts = rem.replace("=", ":").split(":");
                        let name = parts[0].trim();
                        let value: any = (parts.length == 2 ? parts[1].trim() : "true");
                        if (value == "true" || value == "false") value = (value == "true");

                        let state = this.gdata.state ?? {};
                        if (value === "undef")
                            delete state[name];
                        else
                            state[name] = value;
                        this.gdata.state = state;
                    }
                }
                else if (part.startsWith(".f ")) {
                    let flags = part.substring(2).split(",");
                    for (var del of flags) {
                        let flag = del.trim();
                        if (flag == "can-repeat") canRepeat = true;
                        if (flag == "must-leave-scene") {
                            let scene = this.getSceneOf(moment);
                            if (scene != undefined/*e.g.message*/) this.forbiddenSceneId = scene.id;
                        }
                    }
                }
                else if (part.startsWith(".x ")) {
                    let dels = part.substring(2).split(",");
                    let state = this.gdata.state;
                    for (var del of dels) {
                        let pattern = del.trim();
                        if (pattern == "*") {
                            for (var property in state) {
                                if (property.indexOf(".") == -1) //one part names only (not inv.*)
                                    delete state[property];
                            }
                        }
                        else if (pattern.endsWith(".*")) {
                            let prefix = pattern.split(".")[0].trim();
                            for (var property in state) {
                                if (property.startsWith(prefix + "."))
                                    delete state[property];
                            }
                        }
                        else {
                            delete state[pattern];
                        }
                    }
                    this.gdata.state = state;
                }
            }
        }
        if (canRepeat == false && moment.id != -1/*minigame*/) {
            let history = this.gdata.history;
            history.push(moment.id);
            this.gdata.history = history;
        }
    };

    private static parseScene = (scene: IScene) => {
        var data = <ISceneData>{};
        data.title = scene.name;
        data.image = scene.text;
        return data;
    };

    private static parseMetadata = (text: string | null): IMetadata | null => {
        if (text == null) return null;
        let parts = text.split(",");
        if (parts.length == 0) return null;
        let metadata = <IMetadata>{};
        for (var part of parts) {
            let parts2 = part.split("=");
            if (parts2.length == 2) {
                let command = parts2[0].toLowerCase();
                let argument = parts2[1];
                if (("|class|style|css|image|").indexOf(`|${command}|`) != -1) {
                    (metadata as any)[command] = argument;
                }
            }
        }
        return metadata;
    };

    private updateTimedState = () => {
        let state = this.gdata.state;
        var change = false;
        for (var prop in state) {
            var parts = prop.split("/");
            if (parts.length == 2) {
                var value = state[prop];
                var name = parts[0];
                var countdown = parseInt(parts[1]) - 1;
                if (countdown == 0) {
                    state[name] = value;
                }
                else {
                    state[`${name}/${countdown}`] = value;
                }
                delete state[prop];
                change = true;
            }
        }
        if (change) {
            this.gdata.state = state;
        }
    };

    private getSitWindows = () => {
        let newSitWindows = new Array<string>();
        let sits = this.data.situations;
        for (var sit of sits) {
            if (sit.text != undefined && this.sitWindows.indexOf(sit.text) == -1) {
                this.sitWindows.push(sit.text);
                newSitWindows.push(sit.text);
            }
        }
        return newSitWindows;
    };
}
