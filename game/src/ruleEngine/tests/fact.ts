
import { expect } from "chai"
import Symbols from "../symbol.js";
import { FactSet, Facts, FactKind, Rules, Rule, Response, Line, Actors, Actor } from "../ruler.js";

describe('Facts', () => {

    beforeEach(() => {
        Symbols.clear();
    });

    it("should add facts", () => {
        var concept = new Actor("f()");
        var facts = new Facts(concept, FactKind.EventParams)
        facts.add("E", 55).add("F", 66).add("A", 11).add("D", 44);
        expect(facts.length).to.equal(4);
    });

    it("should add facts sorted by symbol", () => {
        Symbols.add("A");
        Symbols.add("D");
        Symbols.add("E");
        Symbols.add("F");
        
        var concept = new Actor("f()");
        var facts = new Facts(concept, FactKind.EventParams)
        facts.add("E", 55).add("F", 66).add("A", 11).add("D", 44);
        
        facts.initIterator();
        facts.next();
        facts.next();
        facts.next();
        var state = facts.getstate();
        
        expect(state.v).to.equal(66);
    });

    it("should not insert duplicate facts", () => {
        var test = () => {
            var concept = new Actor("f()");
            var facts = new Facts(concept, FactKind.EventParams)
            facts.add("E", 55).add("F", 66).add("A", 11).add("D", 44);
            facts.add("F", 242);
        };
        expect(test).to.throw("Statement already exist: 3");
    });
});
