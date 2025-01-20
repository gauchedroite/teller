import { isObjectEmpty } from "../utils.js";
import { IGameData } from "./igame-data.js";
import { IOptions } from "./igame.js";
import * as App from "../core/app.js";


export default class UserData {

    constructor (public gameid: string) {
    }


    //
    // state
    //
    get state() : any {
        const _state_ = JSON.parse(this.localStorage_getItem("state") ?? "{}");
        return isObjectEmpty(_state_) ? null : _state_
    }

    set state(moms: any) {
        this.localStorage_setItem("state", JSON.stringify(moms));
    }

    clearState = () => {
        this.localStorage_removeItem("state");
    }


    //
    // history
    //
    get history() : Array<number> {
        return JSON.parse(this.localStorage_getItem("history") ?? "[]")
    }

    set history(mids: Array<number>) {
        this.localStorage_setItem("history", JSON.stringify(mids));
    }

    clearHistory = () => {
        this.localStorage_removeItem("history");
    }


    //
    // options
    //
    get options() : IOptions {
        return JSON.parse(this.localStorage_getItem("options") ?? "{}")
    }

    set options(options: IOptions) {
        this.localStorage_setItem("options", JSON.stringify(options));
    }


    //
    // continue location
    //
    getContinueLocation() : any {
        let locs: Array<any> = JSON.parse(this.localStorage_getItem("continueLocations") ?? "{}")
        if (isObjectEmpty(locs)) return null;
        let key = "root";
        let loc = null;
        locs.forEach((item: any) => {
            if (item.source == key) {
                loc = item.loc;
            }
        });
        return loc;
    }

    setContinueLocation(loc: any) {
        let locs: Array<any> = JSON.parse(this.localStorage_getItem("continueLocations") ?? "{}")
        let key = "root";
        if (isObjectEmpty(locs)) 
            locs = new Array<any>();
        let found = false;
        locs.forEach((item: any) => {
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

    
    //
    // continue state
    //
    get continueState() : any {
        const _state_ = JSON.parse(this.localStorage_getItem("continueState") ?? "{}")
        return isObjectEmpty(_state_) ? null : _state_
    }

    set continueState(state: any) {
        this.localStorage_setItem("continueState", JSON.stringify(state));
    }

    canResumeGame() {
        return this.continueState != null
    }


    //
    // erase everything but the actual game file and options from localStorage
    //
    eraseAllUserStorage = () => {
        this.localStorage_removeItem("continueLocations");
        this.localStorage_removeItem("continueState");
        this.localStorage_removeItem("history");
        this.localStorage_removeItem("state");
    }


    //
    // localStorage get/set/remove
    //
    localStorage_getItem(key: string) {
        return localStorage.getItem(`${this.gameid}_${key}`)
    }

    localStorage_setItem(key: string, json: string) {
        localStorage.setItem(`${this.gameid}_${key}`, json);
    }

    localStorage_removeItem(key: string) {
        localStorage.removeItem(`${this.gameid}_${key}`);
    }

    clearStorage = () => {
        localStorage.clear();
    }


    //
    // game file persistence
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

    publishGameFileAsync = async () => {
        const url = `save-game-script/${this.doc("game-script.json")}`
        await App.POST(url, JSON.parse(this.localStorage_getItem("_game")!))
    }

    persistGame = (data: IGameData) => {
        this.localStorage_setItem("_game", JSON.stringify(data))
    }

    private doc = (assetName: string) => {
        return `/tellergame-${this.gameid}/${assetName}`
    }
}
