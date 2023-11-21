import { isObjectEmpty } from "../utils.js";
import { IOptions } from "./igame.js";


export default class UserData {

    constructor (private gameid: string) {
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


    //
    // clear continue location and state
    //
    clearContinueData = () => {
        this.localStorage_removeItem("continueLocations");
        this.localStorage_removeItem("continueState");
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
}
