import * as App from "../core/app.js";
import UserData from "./game-user.js";
import { IGameMeta, ISituation, IScene, IActor, IAction, IMoment, IMessageFrom, IMessageTo, Kind, AKind, IGameData } from "./igame-data.js"


export default class GameData extends UserData implements IGameData {
    game: IGameMeta = <IGameMeta> {};
    situations: Array<ISituation> = [];
    scenes: Array<IScene> = [];
    actors: Array<IActor> = [];
    moments: Array<IMoment> = [];

    constructor(gameid: string) {
        super(gameid);
    }

    load_Game = (text: string) => {
        var gdata = <IGameData> JSON.parse(text);
        this.game = gdata.game;
        this.situations = gdata.situations;
        this.scenes = gdata.scenes;
        this.actors = gdata.actors;
        this.moments = gdata.moments;
    }

    update_Game = (gdata: IGameData) => {
        const json = JSON.stringify(gdata)
        this.load_Game(json)

        this.persistGame(<IGameData>{
            game: this.game,
            situations: this.situations,
            scenes: this.scenes,
            actors: this.actors,
            moments: this.moments
        })
    }


//
// situations
//
    addSituation = () => {
        var id = -1;
        var sits = this.situations;
        for (var sit of sits) {
            if (sit.id > id) id = sit.id;
        }
        id++;
        var sit: ISituation = { id: id, name: "", when: "", text: "", sids: [], aids: [], aid: -1 };
        sits.push(sit);
        this.situations = sits;
        //
        var aid = this.addActor(id, AKind.Player);
        this.saveSituationPlayerId(aid, id);
        //
        return id;
    }

    deleteSituation = (id: number) => {
        var sits = this.situations;
        var index = this.getSituationIndex(sits, id);
        var sit = sits[index];
        //
        for (var sid of sit.sids) {
            this.deleteScene(sid);
        }
        //
        this.deleteActor(sit.aid);
        for (var aid of sit.aids) {
            this.deleteActor(aid);
        }
        //
        sits.splice(index, 1);
        this.situations = sits;
    }

    saveSituationName = (name: string, id: number) => {
        var sits = this.situations;
        var sit = this.getSituation(sits, id);
        sit.name = name;
        this.situations = sits;
    }

    saveSituationWhen = (when: string, id: number) => {
        var sits = this.situations;
        var sit = this.getSituation(sits, id);
        sit.when = when;
        this.situations = sits;
    }

    saveSituationPlayerId = (aid: number, id: number) => {
        var sits = this.situations;
        var sit = this.getSituation(sits, id);
        sit.aid = aid;
        sit.aids = [];
        this.situations = sits;
    }

    saveSituationText = (text: string, id: number) => {
        var sits = this.situations;
        var sit = this.getSituation(sits, id);
        sit.text = text;
        this.situations = sits;
    }

    getSituation = (sits: Array<ISituation>, id: number) => {
        return (sits[this.getSituationIndex(sits, id)]);
    }

    getSituationIndex = (sits: Array<ISituation>, id: number) => {
        for (var i = 0; i < sits.length; i++) {
            if (sits[i].id == id)
                return i;
        }
        return -1;
    }

    getSituationOfMessageTo = (sits: Array<ISituation>, msg: IMessageTo) => {
        var aid = msg.parentid;
    }


//
// scenes
//
    addScene = (sitid: number) => {
        var id = -1;
        var scns = this.scenes;
        for (var scn of scns) {
            if (scn.id > id) id = scn.id;
        }
        id++;
        var scn: IScene = { id: id, sitid: sitid, name: "", text: "", mids: [] };
        scns.push(scn);
        this.scenes = scns;
        //
        var sits = this.situations;
        var sit = this.getSituation(sits, sitid);
        sit.sids.push(id);
        this.situations = sits;
        return id;
    }

    deleteScene = (id: number) => {
        var scns = this.scenes;
        var index = this.getSceneIndex(scns, id);
        var scn = scns[index];
        //
        for (var mid of scn.mids) {
            this.deleteSceneMoment(mid);
        }
        //
        scns.splice(index, 1);
        this.scenes = scns;
        //
        var sits = this.situations;
        for (var sit of sits) {
            for (var i = 0; i < sit.sids.length; i++) {
                if (sit.sids[i] == id) {
                    sit.sids.splice(i, 1);
                    break;
                }
            }
        }
        this.situations = sits;
    }

    saveSceneName = (name: string, id: number) => {
        var scns = this.scenes;
        var scn = this.getScene(scns, id);
        scn.name = name;
        this.scenes = scns;
    }

    saveSceneText = (text: string, id: number) => {
        var scns = this.scenes;
        var scn = this.getScene(scns, id);
        scn.text = text;
        this.scenes = scns;
    }

    getScene = (scns: Array<IScene>, id: number) => {
        return (scns[this.getSceneIndex(scns, id)]);
    }

    getSceneIndex = (scns: Array<IScene>, id: number) => {
        for (var i = 0; i < scns.length; i++) {
            if (scns[i].id == id)
                return i;
        }
        return -1;
    }

    getScenesOf = (sit: ISituation): Array<IScene> => {
        var scenes = this.scenes;
        var scns: Array<IScene> = [];
        for (var sid of sit.sids) {
            for (var scene of scenes) {
                if (scene.id == sid) {
                    scns.push(scene);
                    break;
                }
            }
        }
        return scns;
    }


//
// actors
//
    addActor = (sitid: number, akind?: AKind) => {
        var id = -1;
        var acts = this.actors;
        for (var act of acts) {
            if (act.id > id) id = act.id;
        }
        id++;
        var kind: AKind =  (akind == undefined ? AKind.NPC : akind);
        var act: IActor = { id: id, sitid: sitid, kind: kind, name: "", text: "", mids: [] };
        acts.push(act);
        this.actors = acts;
        //
        var sits = this.situations;
        var sit = this.getSituation(sits, sitid);
        sit.aids.push(id);
        this.situations = sits;
        return id;
    }

    deleteActor = (id: number) => {
        if (id == undefined)
            return

        var acts = this.actors;
        var index = this.getActorIndex(acts, id);
        var act = acts[index];
        //
        for (var mid of act.mids) {
            this.deleteActorMoment(mid);
        }
        //
        acts.splice(index, 1);
        this.actors = acts;
        //
        var sits = this.situations;
        for (var sit of sits) {
            for (var i = 0; i < sit.aids.length; i++) {
                if (sit.aids[i] == id) {
                    sit.aids.splice(i, 1);
                    break;
                }
            }
        }
        this.situations = sits;
    }

    saveActorName = (name: string, id: number) => {
        var acts = this.actors;
        var act = this.getActor(acts, id);
        act.name = name;
        this.actors = acts;
    }

    saveActorText = (text: string, id: number) => {
        var acts = this.actors;
        var act = this.getActor(acts, id);
        act.text = text;
        this.actors = acts;
    }

    getActor = (acts: Array<IActor>, id: number) => {
        return (acts[this.getActorIndex(acts, id)]);
    }

    getActorIndex = (acts: Array<IActor>, id: number) => {
        for (var i = 0; i < acts.length; i++) {
            if (acts[i].id == id)
                return i;
        }
        return -1;
    }

    getActorsOf = (sit: ISituation): Array<IActor> => {
        var actors = this.actors;
        var acts: Array<IActor> = [];
        for (var aid of sit.aids) {
            for (var actor of actors) {
                if (actor.id == aid) {
                    acts.push(actor);
                    break;
                }
            }
        }
        return acts;
    }


//
// moments
//
    addMoment = (scnid: number) => {
        var id = -1;
        var moms = this.moments;
        for (var mom of moms) {
            if (mom.id > id) id = mom.id;
        }
        id++;
        var mom: IMoment = { kind: Kind.Moment, id: id, parentid: scnid, when: "", text: "" };
        moms.push(mom);
        this.moments = moms;
        //
        var scns = this.scenes;
        var scn = this.getScene(scns, scnid);
        scn.mids.push(id);
        this.scenes = scns;
        return id;
    }

    deleteSceneMoment = (id: number) => {
        var moms = this.moments;
        var index = this.getMomentIndex(moms, id);
        var mom = moms[index];
        //
        moms.splice(index, 1);
        this.moments = moms;
        //
        var scns = this.scenes;
        for (var scn of scns) {
            for (var i = 0; i < scn.mids.length; i++) {
                if (scn.mids[i] == id) {
                    scn.mids.splice(i, 1);
                    break;
                }
            }
        }
        this.scenes = scns;
    }

    deleteActorMoment = (id: number) => {
        var moms = this.moments;
        var index = this.getMomentIndex(moms, id);
        var mom = moms[index];
        //
        moms.splice(index, 1);
        this.moments = moms;
        //
        var acts = this.actors;
        for (var act of acts) {
            for (var i = 0; i < act.mids.length; i++) {
                if (act.mids[i] == id) {
                    act.mids.splice(i, 1);
                    break;
                }
            }
        }
        this.actors = acts;
    }

    saveMomentWhen = (when: string, id: number) => {
        var moms = this.moments;
        var mom = this.getMoment(moms, id);
        mom.when = when;
        this.moments = moms;
    }

    saveMomentText = (text: string, id: number) => {
        var moms = this.moments;
        var mom = this.getMoment(moms, id);
        mom.text = text;
        this.moments = moms;
    }

    getMoment = (moms: Array<IMoment>, id: number) => {
        return (moms[this.getMomentIndex(moms, id)]);
    }

    getMomentIndex = (moms: Array<IMoment>, id: number) => {
        for (var i = 0; i < moms.length; i++) {
            if (moms[i].id == id)
                return i;
        }
        return -1;
    }

    getMomentsOf = (scn: IScene): Array<IMoment> => {
        var moments = this.moments;
        var moms: Array<IMoment> = [];
        for (var mid of scn.mids) {
            for (var moment of moments) {
                if (moment.id == mid && moment.kind == Kind.Moment) {
                    moms.push(moment);
                    break;
                }
            }
        }
        return moms;
    }


//
// actions
//
    addAction = (scnid: number) => {
        var id = -1;
        var moms = this.moments;
        for (var mom of moms) {
            if (mom.id > id) id = mom.id;
        }
        id++;
        var act: IAction = { kind: Kind.Action, id: id, parentid: scnid, when: "", text: "", name: "" };
        moms.push(act);
        this.moments = moms;
        //
        var scns = this.scenes;
        var scn = this.getScene(scns, scnid);
        scn.mids.push(id);
        this.scenes = scns;
        return id;
    }

    deleteAction = (id: number) => {
        this.deleteSceneMoment(id);
    }

    saveActionWhen = (when: string, id: number) => {
        this.saveMomentWhen(when, id);
    }

    saveActionName = (text: string, id: number) => {
        var moms = <Array<IAction>>this.moments;
        var act = this.getAction(moms, id);
        act.name = text;
        this.moments = moms;
    }

    saveActionText = (text: string, id: number) => {
        this.saveMomentText(text, id);
    }

    getAction = (acts: Array<IMoment>, id: number) => {
        return <IAction>this.getMoment(acts, id);
    }

    getActionsOf = (scn: IScene): Array<IAction> => {
        var moments = this.moments;
        var moms: Array<IMoment> = [];
        for (var mid of scn.mids) {
            for (var moment of moments) {
                if (moment.id == mid && moment.kind == Kind.Action) {
                    moms.push(moment);
                    break;
                }
            }
        }
        return <Array<IAction>>moms;
    }


//
// messages TO
//
    addMessageTo = (actid: number) => {
        var id = -1;
        var moms = this.moments;
        for (var mom of moms) {
            if (mom.id > id) id = mom.id;
        }
        id++;
        var msg: IMessageTo = { kind: Kind.MessageTo, id: id, parentid: actid, when: "", text: "", name: "", to: -1 };
        moms.push(msg);
        this.moments = moms;
        //
        var acts = this.actors;
        var act = this.getActor(acts, actid);
        act.mids.push(id);
        this.actors = acts;
        return id;
    }

    deleteMessageTo = (id: number) => {
        this.deleteActorMoment(id);
    }

    saveMessageToWhen = (when: string, id: number) => {
        this.saveMomentWhen(when, id);
    }

    saveMessageToName = (text: string, id: number) => {
        var moms = <Array<IMessageTo>>this.moments;
        var msg = this.getMessageTo(moms, id);
        msg.name = text;
        this.moments = moms;
    }

    saveMessageToText = (text: string, id: number) => {
        this.saveMomentText(text, id);
    }

    saveMessageToActorTo = (to: number, id: number) => {
        var moms = <Array<IMessageTo>>this.moments;
        var msg = this.getMessageTo(moms, id);
        msg.to = to;
        this.moments = moms;
    }

    getMessageTo = (msgs: Array<IMoment>, id: number) => {
        return <IMessageTo>this.getMoment(msgs, id);
    }

    getMessageToOf = (act: IActor): Array<IMessageTo> => {
        var moments = this.moments;
        var moms: Array<IMoment> = [];
        for (var mid of act.mids) {
            for (var moment of moments) {
                if (moment.id == mid && moment.kind == Kind.MessageTo) {
                    moms.push(moment);
                    break;
                }
            }
        }
        return <Array<IMessageTo>>moms;
    }

    getActorsForMessageTo = (data: IGameData, msg: IMessageTo) => {
        var player = this.getActor(data.actors, msg.parentid);
        var sit = this.getSituation(data.situations, player.sitid);

        var actors = data.actors;
        var acts: Array<IActor> = [];
        for (var aid of sit.aids) {
            for (var actor of actors) {
                if (actor.id == aid && actor.id != sit.aid) {
                    acts.push(actor);
                    break;
                }
            }
        }
        return acts;
    }


//
// messages FROM
//
    addMessageFrom = (actid: number) => {
        var id = -1;
        var moms = this.moments;
        for (var mom of moms) {
            if (mom.id > id) id = mom.id;
        }
        id++;
        var msg: IMessageFrom = { kind: Kind.MessageFrom, id: id, parentid: actid, when: "", text: "" };
        moms.push(msg);
        this.moments = moms;
        //
        var acts = this.actors;
        var act = this.getActor(acts, actid);
        act.mids.push(id);
        this.actors = acts;
        return id;
    }

    deleteMessageFrom = (id: number) => {
        this.deleteActorMoment(id);
    }

    saveMessageFromWhen = (when: string, id: number) => {
        this.saveMomentWhen(when, id);
    }

    saveMessageFromText = (text: string, id: number) => {
        this.saveMomentText(text, id);
    }

    getMessageFrom = (msgs: Array<IMoment>, id: number) => {
        return <IMessageFrom>this.getMoment(msgs, id);
    }

    getMessageFromOf = (act: IActor): Array<IMessageFrom> => {
        var moments = this.moments;
        var moms: Array<IMoment> = [];
        for (var mid of act.mids) {
            for (var moment of moments) {
                if (moment.id == mid && moment.kind == Kind.MessageFrom) {
                    moms.push(moment);
                    break;
                }
            }
        }
        return <Array<IMessageFrom>>moms;
    }


//
// Game File management
//
    fetchGameFileAsync = async () => {
        const savedjson = this.localStorage_getItem("_game")
        if (savedjson) {
            return savedjson
        }

        const url = this.doc("game-script.json")
        try {
            const response = await fetch(url)
            const text = await response.text()
            this.localStorage_setItem("_game", text)
            return text
        }
        catch (ex) {
            return ""
         }
    }

    OLD_publishGameFileAsync = async () => {
        const url = `http://localhost:5501/save-game-script/${this.doc("game-script.json")}`
        const options = <RequestInit> {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: this.localStorage_getItem("_game")
        }
        const response = await fetch(url, options)
        const json = await response.json()
        console.log(json)
    }

    publishGameFileAsync = async () => {
        const url = `save-game-script/${this.doc("game-script.json")}`
        const qaz = await App.POST(url, JSON.parse(this.localStorage_getItem("_game")!))
        console.log(qaz)
    }

    persistGame = (data: IGameData) => {
        this.localStorage_setItem("_game", JSON.stringify(data))
    }

    doc = (assetName: string) => {
        if (this.gameid == "dev")
            return `repos_game-dev/${assetName}`
        return `repos/game-${this.gameid}/${assetName}`
    }
}
