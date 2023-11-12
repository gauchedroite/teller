
export default class Scanner {
    symbol: string | null = null;
    op = "";
    script: string;
    
    constructor(script: String) {
        var lines = script.split("\n");
        var lines2 = new Array<string>();
        for (var ix = 0;  ix < lines.length; ix++) {
            var line = lines[ix].trim();
            if (line.length > 0 && line.substring(0, 2) != "//") {
                if (line.charAt(0) == ".")
                    lines2.push(line);
                else
                    lines2.push(".line " + line);
            } 
        }
        this.script = lines2.join("\n");
    }
    
    separators!: (op: string) => Array<string>;

    nextSymbol(): string | null {
        var line = this.script;
        if (line.length == 0) {
            this.symbol = null;
            return this.symbol;
        }
        
        var seps = this.separators(this.op);
            
        var symbol = line;
        var ix = Number.MAX_VALUE;
        for (var xx = 0; xx < seps.length; xx++) {
            var index = line.indexOf(seps[xx]);
            if (index != -1 && index < ix)
                ix = index;
        }
        
        if (ix == Number.MAX_VALUE/*very last symbol*/)
            ix = line.length;
        else if (ix == 0/*first character is separator*/)
            ix = 1;

        this.symbol = line.substr(0, ix).trim();
        this.script = line.substr(ix).trim();
        
        if (this.script.charAt(0) == ".")
            this.op = "";
        else if (this.symbol.charAt(0) == ".")
            this.op = this.symbol;
            
        return this.symbol;
    }

    accept(symbol: string): boolean {
        if (symbol == this.symbol) {
            this.nextSymbol();
            return true;
        }
        return false;
    }

    skipToNextLine() {
        var ix = this.script.indexOf("\n");
        if (ix > 0) {
            this.script = this.script.substr(ix + 1);
            this.op = "";
            this.nextSymbol();
        }
    }
}
