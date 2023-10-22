import { isObjectEmpty } from "../utils.js";
import { Kind, AKind } from "./igame-data.js";
export class GameData {
    constructor() {
        this.select_Game = () => {
            var game = this.game;
            var sits = this.situations;
            var scns = this.scenes;
            var acts = this.actors;
            var moms = this.moments;
            var gdata = {
                game: game || { id: 0, name: null, initialstate: null, text: null },
                situations: sits,
                scenes: scns,
                actors: acts,
                moments: moms,
                me: null,
                meid: null
            };
            if (game == null) {
                var text = JSON.stringify(gdata);
                this.load_Game(text);
            }
            return gdata;
        };
        this.load_Game = (text) => {
            var gdata = JSON.parse(text);
            this.game = gdata.game;
            this.situations = gdata.situations;
            this.scenes = gdata.scenes;
            this.actors = gdata.actors;
            this.moments = gdata.moments;
        };
        this.update_Game = (gdata) => {
            const json = JSON.stringify(gdata);
            this.load_Game(json);
        };
        //
        // game
        //
        this.saveGameName = (name) => {
            var game = this.game;
            game.name = name;
            this.game = game;
        };
        this.saveGameInitialState = (text) => {
            var game = this.game;
            game.initialstate = text;
            this.game = game;
        };
        this.saveGameText = (text) => {
            var game = this.game;
            game.text = text;
            this.game = game;
        };
        //
        // situations
        //
        this.addSituation = (gameid) => {
            var id = -1;
            var sits = this.situations;
            for (var sit of sits) {
                if (sit.id > id)
                    id = sit.id;
            }
            id++;
            var sit = { id: id, gameid: gameid, name: "", when: "", text: "", sids: [], aids: [], aid: -1 };
            sits.push(sit);
            this.situations = sits;
            //
            var aid = this.addActor(id, AKind.Player);
            this.saveSituationPlayerId(aid, id);
            //
            return id;
        };
        this.deleteSituation = (id) => {
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
        };
        this.saveSituationName = (name, id) => {
            var sits = this.situations;
            var sit = this.getSituation(sits, id);
            sit.name = name;
            this.situations = sits;
        };
        this.saveSituationWhen = (when, id) => {
            var sits = this.situations;
            var sit = this.getSituation(sits, id);
            sit.when = when;
            this.situations = sits;
        };
        this.saveSituationPlayerId = (aid, id) => {
            var sits = this.situations;
            var sit = this.getSituation(sits, id);
            sit.aid = aid;
            sit.aids = [];
            this.situations = sits;
        };
        this.saveSituationText = (text, id) => {
            var sits = this.situations;
            var sit = this.getSituation(sits, id);
            sit.text = text;
            this.situations = sits;
        };
        this.getSituation = (sits, id) => {
            return (sits[this.getSituationIndex(sits, id)]);
        };
        this.getSituationIndex = (sits, id) => {
            for (var i = 0; i < sits.length; i++) {
                if (sits[i].id == id)
                    return i;
            }
            return -1;
        };
        this.getSituationOfMessageTo = (sits, msg) => {
            var aid = msg.parentid;
        };
        //
        // scenes
        //
        this.addScene = (sitid) => {
            var id = -1;
            var scns = this.scenes;
            for (var scn of scns) {
                if (scn.id > id)
                    id = scn.id;
            }
            id++;
            var scn = { id: id, sitid: sitid, name: "", text: "", mids: [] };
            scns.push(scn);
            this.scenes = scns;
            //
            var sits = this.situations;
            var sit = this.getSituation(sits, sitid);
            sit.sids.push(id);
            this.situations = sits;
            return id;
        };
        this.deleteScene = (id) => {
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
        };
        this.saveSceneName = (name, id) => {
            var scns = this.scenes;
            var scn = this.getScene(scns, id);
            scn.name = name;
            this.scenes = scns;
        };
        this.saveSceneText = (text, id) => {
            var scns = this.scenes;
            var scn = this.getScene(scns, id);
            scn.text = text;
            this.scenes = scns;
        };
        this.getScene = (scns, id) => {
            return (scns[this.getSceneIndex(scns, id)]);
        };
        this.getSceneIndex = (scns, id) => {
            for (var i = 0; i < scns.length; i++) {
                if (scns[i].id == id)
                    return i;
            }
            return -1;
        };
        this.getScenesOf = (sit) => {
            var scenes = this.scenes;
            var scns = [];
            for (var sid of sit.sids) {
                for (var scene of scenes) {
                    if (scene.id == sid) {
                        scns.push(scene);
                        break;
                    }
                }
            }
            return scns;
        };
        //
        // actors
        //
        this.addActor = (sitid, akind) => {
            var id = -1;
            var acts = this.actors;
            for (var act of acts) {
                if (act.id > id)
                    id = act.id;
            }
            id++;
            var kind = (akind == undefined ? AKind.NPC : akind);
            var act = { id: id, sitid: sitid, kind: kind, name: "", text: "", mids: [] };
            acts.push(act);
            this.actors = acts;
            //
            var sits = this.situations;
            var sit = this.getSituation(sits, sitid);
            sit.aids.push(id);
            this.situations = sits;
            return id;
        };
        this.deleteActor = (id) => {
            if (id == undefined)
                return;
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
        };
        this.saveActorName = (name, id) => {
            var acts = this.actors;
            var act = this.getActor(acts, id);
            act.name = name;
            this.actors = acts;
        };
        this.saveActorText = (text, id) => {
            var acts = this.actors;
            var act = this.getActor(acts, id);
            act.text = text;
            this.actors = acts;
        };
        this.getActor = (acts, id) => {
            return (acts[this.getActorIndex(acts, id)]);
        };
        this.getActorIndex = (acts, id) => {
            for (var i = 0; i < acts.length; i++) {
                if (acts[i].id == id)
                    return i;
            }
            return -1;
        };
        this.getActorsOf = (sit) => {
            var actors = this.actors;
            var acts = [];
            for (var aid of sit.aids) {
                for (var actor of actors) {
                    if (actor.id == aid) {
                        acts.push(actor);
                        break;
                    }
                }
            }
            return acts;
        };
        //
        // moments
        //
        this.addMoment = (scnid) => {
            var id = -1;
            var moms = this.moments;
            for (var mom of moms) {
                if (mom.id > id)
                    id = mom.id;
            }
            id++;
            var mom = { kind: Kind.Moment, id: id, parentid: scnid, when: "", text: "" };
            moms.push(mom);
            this.moments = moms;
            //
            var scns = this.scenes;
            var scn = this.getScene(scns, scnid);
            scn.mids.push(id);
            this.scenes = scns;
            return id;
        };
        this.deleteSceneMoment = (id) => {
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
        };
        this.deleteActorMoment = (id) => {
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
        };
        this.saveMomentWhen = (when, id) => {
            var moms = this.moments;
            var mom = this.getMoment(moms, id);
            mom.when = when;
            this.moments = moms;
        };
        this.saveMomentText = (text, id) => {
            var moms = this.moments;
            var mom = this.getMoment(moms, id);
            mom.text = text;
            this.moments = moms;
        };
        this.getMoment = (moms, id) => {
            return (moms[this.getMomentIndex(moms, id)]);
        };
        this.getMomentIndex = (moms, id) => {
            for (var i = 0; i < moms.length; i++) {
                if (moms[i].id == id)
                    return i;
            }
            return -1;
        };
        this.getMomentsOf = (scn) => {
            var moments = this.moments;
            var moms = [];
            for (var mid of scn.mids) {
                for (var moment of moments) {
                    if (moment.id == mid && moment.kind == Kind.Moment) {
                        moms.push(moment);
                        break;
                    }
                }
            }
            return moms;
        };
        //
        // actions
        //
        this.addAction = (scnid) => {
            var id = -1;
            var moms = this.moments;
            for (var mom of moms) {
                if (mom.id > id)
                    id = mom.id;
            }
            id++;
            var act = { kind: Kind.Action, id: id, parentid: scnid, when: "", text: "", name: "" };
            moms.push(act);
            this.moments = moms;
            //
            var scns = this.scenes;
            var scn = this.getScene(scns, scnid);
            scn.mids.push(id);
            this.scenes = scns;
            return id;
        };
        this.deleteAction = (id) => {
            this.deleteSceneMoment(id);
        };
        this.saveActionWhen = (when, id) => {
            this.saveMomentWhen(when, id);
        };
        this.saveActionName = (text, id) => {
            var moms = this.moments;
            var act = this.getAction(moms, id);
            act.name = text;
            this.moments = moms;
        };
        this.saveActionText = (text, id) => {
            this.saveMomentText(text, id);
        };
        this.getAction = (acts, id) => {
            return this.getMoment(acts, id);
        };
        this.getActionsOf = (scn) => {
            var moments = this.moments;
            var moms = [];
            for (var mid of scn.mids) {
                for (var moment of moments) {
                    if (moment.id == mid && moment.kind == Kind.Action) {
                        moms.push(moment);
                        break;
                    }
                }
            }
            return moms;
        };
        //
        // messages TO
        //
        this.addMessageTo = (actid) => {
            var id = -1;
            var moms = this.moments;
            for (var mom of moms) {
                if (mom.id > id)
                    id = mom.id;
            }
            id++;
            var msg = { kind: Kind.MessageTo, id: id, parentid: actid, when: "", text: "", name: "", to: -1 };
            moms.push(msg);
            this.moments = moms;
            //
            var acts = this.actors;
            var act = this.getActor(acts, actid);
            act.mids.push(id);
            this.actors = acts;
            return id;
        };
        this.deleteMessageTo = (id) => {
            this.deleteActorMoment(id);
        };
        this.saveMessageToWhen = (when, id) => {
            this.saveMomentWhen(when, id);
        };
        this.saveMessageToName = (text, id) => {
            var moms = this.moments;
            var msg = this.getMessageTo(moms, id);
            msg.name = text;
            this.moments = moms;
        };
        this.saveMessageToText = (text, id) => {
            this.saveMomentText(text, id);
        };
        this.saveMessageToActorTo = (to, id) => {
            var moms = this.moments;
            var msg = this.getMessageTo(moms, id);
            msg.to = to;
            this.moments = moms;
        };
        this.getMessageTo = (msgs, id) => {
            return this.getMoment(msgs, id);
        };
        this.getMessageToOf = (act) => {
            var moments = this.moments;
            var moms = [];
            for (var mid of act.mids) {
                for (var moment of moments) {
                    if (moment.id == mid && moment.kind == Kind.MessageTo) {
                        moms.push(moment);
                        break;
                    }
                }
            }
            return moms;
        };
        this.getActorsForMessageTo = (data, msg) => {
            var player = this.getActor(data.actors, msg.parentid);
            var sit = this.getSituation(data.situations, player.sitid);
            var actors = data.actors;
            var acts = [];
            for (var aid of sit.aids) {
                for (var actor of actors) {
                    if (actor.id == aid && actor.id != sit.aid) {
                        acts.push(actor);
                        break;
                    }
                }
            }
            return acts;
        };
        //
        // messages FROM
        //
        this.addMessageFrom = (actid) => {
            var id = -1;
            var moms = this.moments;
            for (var mom of moms) {
                if (mom.id > id)
                    id = mom.id;
            }
            id++;
            var msg = { kind: Kind.MessageFrom, id: id, parentid: actid, when: "", text: "" };
            moms.push(msg);
            this.moments = moms;
            //
            var acts = this.actors;
            var act = this.getActor(acts, actid);
            act.mids.push(id);
            this.actors = acts;
            return id;
        };
        this.deleteMessageFrom = (id) => {
            this.deleteActorMoment(id);
        };
        this.saveMessageFromWhen = (when, id) => {
            this.saveMomentWhen(when, id);
        };
        this.saveMessageFromText = (text, id) => {
            this.saveMomentText(text, id);
        };
        this.getMessageFrom = (msgs, id) => {
            return this.getMoment(msgs, id);
        };
        this.getMessageFromOf = (act) => {
            var moments = this.moments;
            var moms = [];
            for (var mid of act.mids) {
                for (var moment of moments) {
                    if (moment.id == mid && moment.kind == Kind.MessageFrom) {
                        moms.push(moment);
                        break;
                    }
                }
            }
            return moms;
        };
        //
        // localstorage
        //
        this.clearStorage = () => {
            localStorage.clear();
        };
        this.clearState = () => {
            localStorage.removeItem("state");
        };
        this.clearHistory = () => {
            localStorage.removeItem("history");
        };
        //
        // clear continue location and state
        //
        this.clearContinueData = () => {
            localStorage.removeItem("continueLocations");
            localStorage.removeItem("continueState");
        };
    }
    //
    // game
    //
    get game() {
        var _a;
        return JSON.parse((_a = localStorage.getItem("game")) !== null && _a !== void 0 ? _a : "{}");
    }
    set game(game) {
        localStorage.setItem("game", JSON.stringify(game));
    }
    //
    // situations
    //
    get situations() {
        var _a;
        return JSON.parse((_a = localStorage.getItem("situations")) !== null && _a !== void 0 ? _a : "[]");
    }
    set situations(sits) {
        localStorage.setItem("situations", JSON.stringify(sits));
    }
    //
    // scenes
    //
    get scenes() {
        var _a;
        return JSON.parse((_a = localStorage.getItem("scenes")) !== null && _a !== void 0 ? _a : "[]");
    }
    set scenes(moms) {
        localStorage.setItem("scenes", JSON.stringify(moms));
    }
    //
    // actors
    //
    get actors() {
        var _a;
        return JSON.parse((_a = localStorage.getItem("actors")) !== null && _a !== void 0 ? _a : "[]");
    }
    set actors(moms) {
        localStorage.setItem("actors", JSON.stringify(moms));
    }
    //
    // moments
    //
    get moments() {
        var _a;
        return JSON.parse((_a = localStorage.getItem("moments")) !== null && _a !== void 0 ? _a : "[]");
    }
    set moments(moms) {
        localStorage.setItem("moments", JSON.stringify(moms));
    }
    //
    // state
    //
    get state() {
        var _a;
        const _state_ = JSON.parse((_a = localStorage.getItem("state")) !== null && _a !== void 0 ? _a : "{}");
        return isObjectEmpty(_state_) ? null : _state_;
    }
    set state(moms) {
        localStorage.setItem("state", JSON.stringify(moms));
    }
    //
    // history
    //
    get history() {
        var _a;
        //const _history_ = JSON.parse(localStorage.getItem("history") ?? "{}")
        //return isObjectEmpty(_history_) ? null : _history_
        return JSON.parse((_a = localStorage.getItem("history")) !== null && _a !== void 0 ? _a : "[]");
    }
    set history(mids) {
        localStorage.setItem("history", JSON.stringify(mids));
    }
    //
    // options
    //
    get options() {
        var _a;
        return JSON.parse((_a = localStorage.getItem("options")) !== null && _a !== void 0 ? _a : "{}");
    }
    set options(options) {
        localStorage.setItem("options", JSON.stringify(options));
    }
    //
    // continue location
    //
    getContinueLocation() {
        var _a;
        let locs = JSON.parse((_a = localStorage.getItem("continueLocations")) !== null && _a !== void 0 ? _a : "{}");
        if (isObjectEmpty(locs))
            return null;
        let key = "root";
        let loc = null;
        locs.forEach((item) => {
            if (item.source == key) {
                loc = item.loc;
            }
        });
        return loc;
    }
    setContinueLocation(loc) {
        var _a;
        let locs = JSON.parse((_a = localStorage.getItem("continueLocations")) !== null && _a !== void 0 ? _a : "{}");
        let key = "root";
        if (isObjectEmpty(locs))
            locs = new Array();
        let found = false;
        locs.forEach((item) => {
            if (found == false && item.source == key) {
                item.loc = loc;
                localStorage.setItem("continueLocations", JSON.stringify(locs));
                found = true;
            }
        });
        if (found == false) {
            locs.push({ source: key, loc: loc });
            localStorage.setItem("continueLocations", JSON.stringify(locs));
        }
    }
    //
    // continue state
    //
    get continueState() {
        var _a;
        const _state_ = JSON.parse((_a = localStorage.getItem("continueState")) !== null && _a !== void 0 ? _a : "{}");
        return isObjectEmpty(_state_) ? null : _state_;
    }
    set continueState(state) {
        localStorage.setItem("continueState", JSON.stringify(state));
    }
}
const gameData = new GameData();
export default gameData;
//# sourceMappingURL=game-data.js.map