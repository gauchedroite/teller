
export default class GameHelper {

    static getCommands = (text: string): Array<string> => {
        if (text == undefined) return [];
        var inComment = false
        var commands = new Array<string>();
        var parts = text.split("\n");
        for (var part of parts) {
            if (part.length > 0) {
                if (part.startsWith("/*")) { inComment = true; }
                else if (inComment) { inComment = (part.startsWith("*/") == false); }
                else if (part.startsWith(".r ") || part.startsWith(".f ") || part.startsWith(".x ")) {
                    commands.push(part);
                }
            }
        }
        return commands;
    };

    static getWhens = (text: string): Array<string> => {
        if (text == undefined) return [];
        var whens = new Array<string>();
        var parts = text.split(",");
        for (var part of parts) {
            if (part.length > 0) {
                whens.push(part.trim());
            }
        }
        return whens;
    };
}
