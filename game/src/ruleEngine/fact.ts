
import { Actor } from "./actor.js";
import insertSorted from "./sorter.js";
import { IStatementIterator, Statement } from "./statement.js";
import Symbols from "./symbol.js";


export enum FactKind {
    EventParams,
    State,
    Memory
}


export class Facts implements IStatementIterator {
    private whoid: number;
    private nameid: number;
    private facts = new Array<Statement>();
    private index = 0;
    private state: Statement | null = null;
    private done = false;
    constructor(who: Actor, name: FactKind = FactKind.State) {
        this.whoid = who.id;
        this.nameid = Symbols.add("" + name);
    }

    add(key: string, val: number): Facts {
        var statement: Statement = { k: Symbols.add(key), v: val };
        insertSorted(statement, this.facts, function(a: Statement, b: Statement): number {
            if (a.k < b.k) return -1;
            if (a.k > b.k) return +1;
            throw "Statement already exist: " + a.k;
        });
        return this;
    };

    initIterator() {
        this.index = 0;
        this.state = null;
        this.done = false;
        this.next();
    }

    next() {
        if (this.index < this.facts.length) {
            this.done = false;
            this.state = this.facts[this.index++];
        } else {
            this.done = true;
            this.state = null;
        }
    }

    getstate() { return this.state!; }
    getdone() { return this.done; }

    is(whoid: number, nameid: number): boolean {
        return (this.whoid == whoid && this.nameid == nameid);
    }

    update(id: number, val: number | undefined) {
        if (val == undefined)
            return;

        var len = this.facts.length;
        for (var i = 0; i < len; i++) {
            var fact = this.facts[i];
            if (fact.k == id) {
                fact.v = val;
                return;
            }
        }
        var key = Symbols.getById(id);
        this.add(key, val);
    }

    get length() { return this.facts.length; }
}


export class FactSet implements IStatementIterator {
    private factset = Array<Facts>();
    private fact: Statement | null = null;
    private done = false;

    add(facts: Facts) {
        this.factset.push(facts);
        return this;
    }

    initIterator() {
        this.fact = null;
        this.done = false;
        for (var i = 0; i < this.factset.length; i++)
            this.factset[i].initIterator();
        this.next();
    }

    next() {
        var i0 = -1;
        var mink = Number.MAX_VALUE;
        var len = this.factset.length;;
        for (var i = 0; i < len; i++) {
            var facts = this.factset[i];
            if (facts.getdone() == false) {
                var fact = facts.getstate();
                if (fact.k < mink) {
                    mink = fact.k;
                    i0 = i;
                }
            }
        }
        if (i0 != -1) {
            this.done = false;
            this.fact = this.factset[i0].getstate();
            this.factset[i0].next();
        } else {
            this.done = true;
            this.fact = null;
        }
    }

    getstate() { return this.fact!; }
    getdone() { return this.done; }

    getFacts(whoid: number, name: FactKind) {
        var nameid = Symbols.add("" + name);
        var len = this.factset.length;
        for (var i = 0; i < len; i++) {
            var facts = this.factset[i];
            if (facts.is(whoid, nameid))
                return facts;
        }
        return null;
    }
}
