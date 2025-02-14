import { isObjectEmpty } from "../utils.js";
import * as App from "../core/app.js";
export default class UserData {
    constructor(gameid) {
        this.gameid = gameid;
        this.clearState = () => {
            this.localStorage_removeItem("state");
        };
        this.clearHistory = () => {
            this.localStorage_removeItem("history");
        };
        this.eraseAllUserStorage = () => {
            this.localStorage_removeItem("continueLocations");
            this.localStorage_removeItem("continueState");
            this.localStorage_removeItem("history");
            this.localStorage_removeItem("state");
        };
        this.clearStorage = () => {
            localStorage.clear();
        };
        this.fetchGameFileAsync = async () => {
            const savedjson = this.localStorage_getItem("_game");
            if (savedjson) {
                return savedjson;
            }
            const url = this.doc("game-script.json");
            try {
                const response = await fetch(url);
                const text = await response.text();
                this.localStorage_setItem("_game", text);
                return text;
            }
            catch (ex) {
                return "";
            }
        };
        this.publishGameFileAsync = async () => {
            const url = `save-game-script/${this.doc("game-script.json")}`;
            await App.POST(url, JSON.parse(this.localStorage_getItem("_game")));
        };
        this.persistGame = (data) => {
            this.localStorage_setItem("_game", JSON.stringify(data));
        };
        this.doc = (assetName) => {
            return `/tellergame-${this.gameid}/${assetName}`;
        };
    }
    get state() {
        var _a;
        const _state_ = JSON.parse((_a = this.localStorage_getItem("state")) !== null && _a !== void 0 ? _a : "{}");
        return isObjectEmpty(_state_) ? null : _state_;
    }
    set state(moms) {
        this.localStorage_setItem("state", JSON.stringify(moms));
    }
    get history() {
        var _a;
        return JSON.parse((_a = this.localStorage_getItem("history")) !== null && _a !== void 0 ? _a : "[]");
    }
    set history(mids) {
        this.localStorage_setItem("history", JSON.stringify(mids));
    }
    get options() {
        var _a;
        return JSON.parse((_a = this.localStorage_getItem("options")) !== null && _a !== void 0 ? _a : "{}");
    }
    set options(options) {
        this.localStorage_setItem("options", JSON.stringify(options));
    }
    getContinueLocation() {
        var _a;
        let locs = JSON.parse((_a = this.localStorage_getItem("continueLocations")) !== null && _a !== void 0 ? _a : "{}");
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
        let locs = JSON.parse((_a = this.localStorage_getItem("continueLocations")) !== null && _a !== void 0 ? _a : "{}");
        let key = "root";
        if (isObjectEmpty(locs))
            locs = new Array();
        let found = false;
        locs.forEach((item) => {
            if (found == false && item.source == key) {
                item.loc = loc;
                this.localStorage_setItem("continueLocations", JSON.stringify(locs));
                found = true;
            }
        });
        if (found == false) {
            locs.push({ source: key, loc: loc });
            this.localStorage_setItem("continueLocations", JSON.stringify(locs));
        }
    }
    get continueState() {
        var _a;
        const _state_ = JSON.parse((_a = this.localStorage_getItem("continueState")) !== null && _a !== void 0 ? _a : "{}");
        return isObjectEmpty(_state_) ? null : _state_;
    }
    set continueState(state) {
        this.localStorage_setItem("continueState", JSON.stringify(state));
    }
    canResumeGame() {
        return this.continueState != null;
    }
    localStorage_getItem(key) {
        return localStorage.getItem(`${this.gameid}_${key}`);
    }
    localStorage_setItem(key, json) {
        localStorage.setItem(`${this.gameid}_${key}`, json);
    }
    localStorage_removeItem(key) {
        localStorage.removeItem(`${this.gameid}_${key}`);
    }
}
