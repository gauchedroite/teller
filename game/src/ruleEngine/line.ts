
import { Actors, Actor } from "./actor.js"
import Symbols from "./symbol.js"

export class Line {
    private text: string;
    private actorid: number = 0;
    private conceptid: number = 0;
    constructor(text: string) {
        this.text = text;
    }
    then(actor: Actor, concept: string): Line {
        this.actorid = actor.id;
        this.conceptid = Symbols.add(concept);
        return this;
    }
    _apply(actors: Actors): boolean {
        if (this.actorid != 0 && this.conceptid) {
            var actor = actors.getById(this.actorid);
            var concept = Symbols.getById(this.conceptid);
            actor.addEvent(concept);
        }
        return false;
    }
}
