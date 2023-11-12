
import { expect } from "chai";
import Symbols from "../symbol.js";

describe('Symbols', () => {

    beforeEach(() => {
        Symbols.clear();
    });

    it("should add one symbol", () => {
        var id = Symbols.add("first symbol");
        expect(id).to.equal(0);
    });

    it("should add more than one symbol", () => {
        Symbols.add("first symbol");
        var id = Symbols.add("second symbol");
        expect(id).to.equal(1);
    });

    it("should not add the same symbol twice", () => {
        Symbols.add("one symbol");
        Symbols.add("another symbol");
        var id = Symbols.add("one symbol");
        expect(id).to.equal(0);
    });

    it("should get symbols by id", () => {
        var id = Symbols.add("one symbol");
        Symbols.add("another symbol");
        var text = Symbols.getById(id);
        expect(text).to.equal("one symbol");
    });

    it("should find symbols by name", () => {
        Symbols.add("one symbol");
        Symbols.add("another symbol");
        var id = Symbols.getId("one symbol");
        expect(id).to.equal(0);
    });
});
