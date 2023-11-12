import { SceneViewer } from "./_sceneViewer.js";
import Parser from "./parser.js";
import Scanner from "./scanner.js";
import { script } from "./test-script.js";


export class Sample {
    static run1() {
        var scriptHtml = wrapHtml(script)
        var scene = parseHtmlScript(script)
        var renderedHtml = SceneViewer.render(scene)
        console.log(renderedHtml)
    }
}



var stripHtml = (html: string) => {
    var text = html
        .replace(/\<div\>/g, "\n")
        .replace(/<.*?>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&gt;/g, ">")
        .replace(/&lt;/g, "<")
        + "\n";
    return text;
};

var wrapHtml = (text: string) => {
    var lines = text.split("\n");
    var lines2 = new Array<string>();
    for (var ix = 0;  ix < lines.length; ix++) {
        var line = lines[ix];
        if (line == "") line = "<br>";
        lines2.push(`<div>${line}</div>`);
    }
    return lines2.join("");
};

var parseHtmlScript = (html: string) => {
    var script = stripHtml(html);
    var scanner = new Scanner(script);
    var parser = new Parser(scanner);
    return parser.parse();
};
