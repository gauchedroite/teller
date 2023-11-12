
import Symbols from "./symbol.js";
import insertSorted from "./sorter.js";

export enum FactKind {
    EventParams,
    State,
    Memory
}

export class Statement {
    k: number = Number.MIN_VALUE;
    v: number = Number.MIN_VALUE;
}

export class Criterion {
    k: number = Number.MIN_VALUE;
    a: number = Number.MIN_VALUE;
    b: number = Number.MIN_VALUE;
}

export interface IStatementIterator {
    initIterator(): void;
    next(): void;
    getstate(): Statement;
    getdone(): boolean;
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

export class Rule {
    private whoid: number;
    private nameid: number;
    private criteria = new Array<Criterion>();
    private _response: Response | undefined;
    private memid: number = 0;
    private memval: number | undefined;
    private actorid: number = 0;
    private conceptid: number = 0;
    private index = 0;
    private crit: Criterion | null = null;
    private done = false;
    constructor(who: Actor, name: string = "rulename") {
        this.whoid = who.id;
        this.nameid = Symbols.add(name);
    }
    eq(key: string, val: number): Rule {
        this.insertSorted({ k: Symbols.add(key), a: val, b: val });
        return this;
    }
    le(key: string, val: number): Rule {
        this.insertSorted({ k: Symbols.add(key), a: Number.MIN_VALUE, b: val });
        return this;
    }
    ge(key: string, val: number): Rule {
        this.insertSorted({ k: Symbols.add(key), a: val, b: Number.MAX_VALUE });
        return this;
    }
    private insertSorted(criterion: Criterion) {
        insertSorted(criterion, this.criteria, function(a: Criterion, b: Criterion): number {
            if (a.k < b.k) return -1;
            if (a.k > b.k) return +1;
            throw "Criterion already exist: " + a.k;
        });
    }
    get criteriaLength() {
        return this.criteria.length;
    }
    response(response: Response): Rule {
        this._response = response;
        return this;
    }
    get hasAction(): boolean {
        if (this._response != undefined && this._response != null && this._response.hasResponse)
            return true;
        if (this.memid != 0)
            return true;
        if (this.actorid != 0)
            return true;
        return false;
    }
    remember(key: string, val: number): Rule {
        this.memid = Symbols.add(key);
        this.memval = val;
        return this;
    }
    trigger(actor: Actor, concept: string): Rule {
        this.actorid = actor.id;
        this.conceptid = Symbols.add(concept);
        return this;
    }
    private isMatchingOne(facts: Facts): boolean {
        var iter = <IStatementIterator>facts;
        return this._isMatching(iter);
    }
    isMatching(factset: FactSet): boolean {
        var iter = <IStatementIterator>factset;
        return this._isMatching(iter);
    }
    private _isMatching(iter: IStatementIterator): boolean {
        iter.initIterator();
        for(var ic = 0; ic < this.criteria.length; ic++) {
            var crit = this.criteria[ic];
            while (true) {
                if (iter.getdone())
                    return false;
                var fact = iter.getstate();
                if (fact.k == crit.k) {
                    if (((fact.v >= crit.a) && (fact.v <= crit.b)) == false)
                        return false;
                    iter.next();
                    break;
                }
                else if (fact.k > crit.k)
                    return false;
                iter.next();
            }
        }
        return true;
    }
    private _apply(factSet: FactSet, actors: Actors) {
        if (this.memid != 0) {
            var facts = factSet.getFacts(this.whoid, FactKind.Memory);
            if (facts)
                facts.update(this.memid, this.memval);
        }
        if (this.actorid != 0 && this.conceptid != 0) {
            var actor = actors.getById(this.actorid);
            var concept = Symbols.getById(this.conceptid);
            actor.addEvent(concept);
        }
        return false;
    }
    execute(factSet: FactSet, actors: Actors) {
        if (this._response != undefined) {
            var line = this._response.selectOneLine(); 
            if (line != null)
                line._apply(actors);
        }
        this._apply(factSet, actors);
    }
    initIterator() {
        this.index = 0;
        this.crit = null;
        this.done = false;
        this.next();
    }
    next() {
        if (this.index < this.criteria.length) {
            this.done = false;
            this.crit = this.criteria[this.index++];
        } else {
            this.done = true;
            this.crit = null;
        }
    }
    getcrit() { return this.crit; }
    getdone() { return this.done; }
}

export class Rules {
    private name: number;
    private rules = Array<Rule>();
    constructor(name: string) {
        this.name = Symbols.add(name);
    }
    add(rule: Rule) {
        if (rule.hasAction == false)
            throw "Rule doesn't have any action";
        // insert rule in rules making sure they're always sorted DESC by the number of criterion
        insertSorted(rule, this.rules, function(a: Rule, b: Rule): number {
            if (a.criteriaLength > b.criteriaLength) return -1;
            if (a.criteriaLength < b.criteriaLength) return +1;
            return 0;
        });
    }
    findMatchingRule(factset: FactSet): Rule | null {
        var matchedRules = Array<Rule>();
        var len = this.rules.length;
        for (var i= 0; i < len; i++) {
            var rule = this.rules[i];
            if (rule.isMatching(factset)) {
                if (matchedRules.length == 0 || rule.criteriaLength == matchedRules[0].criteriaLength)
                    matchedRules.push(rule);
                else if (rule.criteriaLength < matchedRules[0].criteriaLength)
                    break;
            }
        }
        if (matchedRules.length == 0)
            return null;
        return matchedRules[Math.floor(Math.random() * matchedRules.length)];
    }
    get length() { return this.rules.length; }
}


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

export class Response {
    private responses = Array<Line>();
    add(response: Line): Response {
        this.responses.push(response);
        return this;
    }
    selectOneLine(): Line | null {
        if (this.hasResponse == false)
            return null;
        return this.responses[Math.floor(Math.random() * this.responses.length)];
    }
    get hasResponse(): boolean {
        return (this.responses.length != 0);
    }
}


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
