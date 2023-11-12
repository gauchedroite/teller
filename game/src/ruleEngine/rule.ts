
import Symbols from "./symbol.js";
import insertSorted from "./sorter.js";
import { Actor, Actors } from "./actor.js";
import { FactKind, FactSet, Facts } from "./fact.js";
import { IStatementIterator } from "./statement.js";
import { Response } from "./response.js"


class Criterion {
    k: number = Number.MIN_VALUE;
    a: number = Number.MIN_VALUE;
    b: number = Number.MIN_VALUE;
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
