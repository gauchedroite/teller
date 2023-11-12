
import Symbols from "./symbol.js";


export class Actor {
    private _id: number;
    private events = new Array<string>();
    private index = 0;
    private evt: string | null = null;
    private done = false;
    
    constructor(name: string) {
        this._id = Symbols.add(name);
    }

    addEvent(concept: string) {
        this.events.push(concept);
    }

    get id(): number {
        return this._id;
    }

    initIterator() {
        this.index = 0;
        this.evt = null;
        this.done = false;
        this.next();
    }

    next() {
        if (this.index < this.events.length) {
            this.done = false;
            this.evt = this.events[this.index++];
        } else {
            this.done = true;
            this.evt = null;
        }
    }

    getevt() { return this.evt; }
    getdone() { return this.done; }
}


export class Actors {
    private actors = Array<Actor>();

    add(actor: Actor): Actors {
        this.actors.push(actor);
        return this;
    }

    getById(id: number): Actor {
        var len = this.actors.length;
        for (var i = 0; i < len; i++) {
            if (this.actors[i].id == id)
                return this.actors[i];
        }
        throw "Actor doesn't exist: " + id
    }
}
