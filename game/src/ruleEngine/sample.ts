
import Symbols from "./symbol.js";
import { FactSet, Facts, FactKind, Rules, Rule, Response, Line, Actors, Actor } from "./ruler.js";


export class Sample {

    static run1() {
        var actors = new Actors();
        var concept = new Actor("f()");
        var jack = new Actor("jack");
        var femme = new Actor("femme");
        var au = new Actor("Au");
        var world = new Actor("world");
        actors.add(jack).add(femme).add(au).add(world);
        
        
        var factset = new FactSet();
        var facts = new Facts(concept, FactKind.EventParams)
        facts.add("E", 55).add("F", 66).add("A", 11).add("D", 44);
        factset.add(facts);
        //
        facts = new Facts(jack, FactKind.State).add("B", 22).add("G", 77);
        factset.add(facts);
        //
        facts = new Facts(jack, FactKind.Memory).add("m.B", 22).add("m.G", 77);
        factset.add(facts);
        //
        facts = new Facts(world).add("w.B", 22).add("w.G", 77);
        factset.add(facts);
        
        
        var rules = new Rules("Rules for some dialog");
        rules.add(new Rule(femme)
            .eq("G", 77).eq("A", 11).eq("B", 22)
            .response(new Response().add(new Line("dummy line")))
        );
        rules.add(new Rule(jack)
            .eq("B", 22).eq("E", 55).eq("A", 11).eq("G", 77)
            .response(new Response()
                .add(new Line("Il était une fois dans l'ouest").then(jack, "concept"))
                .add(new Line("Il était une fois dans l'est")))
            .remember("B", 42)
            .trigger(femme, "concept")
        );
        
        
        var matchingRule = rules.findMatchingRule(factset);
        if (matchingRule != undefined)
            matchingRule.execute(factset, actors);
        
        console.log( matchingRule );
    }
}

