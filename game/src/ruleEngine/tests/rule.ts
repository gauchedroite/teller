
import { expect } from "chai";
import Symbols from "../symbol.js";
import { FactSet, Facts, FactKind, Rules, Rule, Response, Line, Actors, Actor } from "../ruler.js";

describe('Rules', () => {

    var dummyResponse: Response;
    
    beforeEach(() => {
        Symbols.clear();
        dummyResponse = new Response().add(new Line("whatever"));
    });

    it("should add criteria to a rule", () => {
        var femme = new Actor("femme");
        var rule = new Rule(femme).eq("G", 77).eq("A", 11).eq("B", 22)
            .response(dummyResponse);
        expect(rule.criteriaLength).to.equal(3);
    });

    it("should add criteria sorted by symbol", () => {
        Symbols.add("A");
        Symbols.add("B");
        Symbols.add("G");
        
        var femme = new Actor("femme");
        var rule = new Rule(femme).eq("G", 77).eq("A", 11).eq("B", 22)
            .response(dummyResponse);
        
        rule.initIterator();
        rule.next();
        rule.next();
        var crit = rule.getcrit();
        
        expect(crit?.k).to.equal(2);
    });

    it("should not insert duplicate criterion to a rule", () => {
        Symbols.add("A");
        Symbols.add("B");
        Symbols.add("G");
        
        var test = () => {
            var femme = new Actor("femme");
            var rule = new Rule(femme).eq("G", 77).eq("A", 11).eq("B", 22)
                .response(dummyResponse);
            rule.eq("B", 242);
        };
        expect(test).to.throw("Criterion already exist: 1");
    });

    it("should have an action when added to Rules", () => {        
        var test = () => {
            var femme = new Actor("femme");
            var rules = new Rules("Rules for some dialog");
            var rule = new Rule(femme).eq("G", 77).eq("A", 11).eq("B", 22);
            rules.add(rule);
        };
        expect(test).to.throw("Rule doesn't have any action");
    });

    it("should find a matching rule in a single factset", () => {
        var actors = new Actors();
        var jack = new Actor("jack");
        actors.add(jack);
        
        var factset = new FactSet();
        var facts = new Facts(jack);
        facts.add("E", 55).add("F", 66).add("A", 11).add("D", 44);
        factset.add(facts);
        
        var rules = new Rules("Rules for some dialog");
        var rule1 = new Rule(jack)
            .eq("D", 44).eq("A", 11).eq("xxxx", 66)
            .response(dummyResponse);
        rules.add(rule1);
        
        var rule2 = new Rule(jack)
            .eq("D", 44).eq("A", 11).eq("F", 66)
            .response(dummyResponse);
        rules.add(rule2);
        
        var matchingRule = rules.findMatchingRule(factset);
        
        expect(matchingRule).to.equal(rule2);
    });

    it("should find the best matching rule in a single factset", () => {
        var actors = new Actors();
        var jack = new Actor("jack");
        actors.add(jack);
        
        var factset = new FactSet();
        var facts = new Facts(jack)
        facts.add("E", 55).add("F", 66).add("A", 11).add("D", 44);
        factset.add(facts);
        
        var rules = new Rules("Rules for some dialog");
        var rule1 = new Rule(jack)
            .eq("A", 11).eq("F", 66)
            .response(dummyResponse);
        rules.add(rule1);
        
        var rule2 = new Rule(jack)
            .eq("A", 11).eq("F", 66).eq("E", 55)
            .response(dummyResponse);
        rules.add(rule2);
        
        var matchingRule = rules.findMatchingRule(factset);
        
        expect(matchingRule).to.equal(rule2);
    });

    it("should not find any matching rule when none is matching", () => {
        var actors = new Actors();
        var jack = new Actor("jack");
        actors.add(jack);
        
        var factset = new FactSet();
        var facts = new Facts(jack)
        facts.add("E", 55).add("F", 66).add("A", 11).add("D", 44);
        factset.add(facts);
        
        var rules = new Rules("Rules for some dialog");
        var rule1 = new Rule(jack)
            .eq("xx", 11).eq("F", 66)
            .response(dummyResponse);
        rules.add(rule1);
        
        var rule2 = new Rule(jack)
            .eq("A", 11).eq("F", 66).eq("yy", 55)
            .response(dummyResponse);
        rules.add(rule2);
        
        var matchingRule = rules.findMatchingRule(factset);
        
        expect(matchingRule).to.equal(null);
    });

    it("should remember a fact when a matching rule is executed", () => {
        var actors = new Actors();
        var jack = new Actor("jack");
        actors.add(jack);
        
        var factset = new FactSet();
        var facts = new Facts(jack);
        facts.add("E", 55).add("F", 66).add("A", 11).add("D", 44);
        var mem = new Facts(jack, FactKind.Memory);
        factset.add(facts).add(mem);
        
        var rules = new Rules("Rules for some dialog");
        var rule1 = new Rule(jack)
            .eq("A", 11).eq("F", 66)
            .remember("B", 42); 
        rules.add(rule1);
        
        var matchingRule = rules.findMatchingRule(factset);
        matchingRule?.execute(factset, actors);
        
        mem.initIterator();
        var memB = mem.getstate();
        var memKey = Symbols.getById(memB.k);
        
        expect(memKey).to.equal("B");
    });

    it("should raise events when a matching rule is executed", () => {
        var actors = new Actors();
        var jack = new Actor("jack");
        var femme = new Actor("femme");
        actors.add(jack).add(femme);
        
        var factset = new FactSet();
        var facts = new Facts(jack);
        facts.add("E", 55).add("F", 66).add("A", 11).add("D", 44);
        factset.add(facts);
        
        var rules = new Rules("Rules for some dialog");
        var rule1 = new Rule(jack)
            .eq("A", 11).eq("F", 66)
            .trigger(femme, "on some concept"); 
        rules.add(rule1);
        
        var matchingRule = rules.findMatchingRule(factset);
        matchingRule?.execute(factset, actors);
        
        femme.initIterator();
        var evt = femme.getevt();
        
        expect(evt).to.equal("on some concept");
    });

    it("should raise events for a line when a matching rule is executed", () => {
        var actors = new Actors();
        var jack = new Actor("jack");
        var femme = new Actor("femme");
        actors.add(jack).add(femme);
        
        var factset = new FactSet();
        var facts = new Facts(jack);
        facts.add("E", 55).add("F", 66).add("A", 11).add("D", 44);
        factset.add(facts);
        
        var rules = new Rules("Rules for some dialog");
        var rule1 = new Rule(jack)
            .eq("A", 11).eq("F", 66)
            .response(new Response()
                .add(new Line("le cheval").then(femme, "concept linéaire")))
        rules.add(rule1);
        
        var matchingRule = rules.findMatchingRule(factset);
        matchingRule?.execute(factset, actors);
        
        femme.initIterator();
        var evt = femme.getevt();
        
        expect(evt).to.equal("concept linéaire");
    });
});
