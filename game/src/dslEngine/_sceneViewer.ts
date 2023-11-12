
import { marked } from "marked"
import DOMPurify from "dompurify"


var rawMarkup = (text: string) => {
    return DOMPurify.sanitize(marked.parse(text));
};

class Action {
    static render(node: any, dkey: number) {
        var doAction = (action: any) => {
            if (action) {
                return `<div class="${"ed-text " + action.style}">
                    ${rawMarkup(action.text)}
                </div>`;
            }
            return ""
        };
        var doStyle = (style: any) => {
            if (style == undefined) return null;
            if (style.err) return Error.render(style.err)
            return `<span className="ed-style">style ${style}</span>`;
        };
        return `
        <div className="ed-action" key="${dkey}">
            ${When.render(node.when)}
            ${doAction(node.action)}
            ${doStyle(node.action.style)}
        </div>`;
    }
}

class Character {
    static render(node: any) {
        if (node == undefined) return null;
        if (node.err) return Error.render(node.err)
            
        var doId = (id: any) => {
            return null;
            if (id)
                return `<span className="ed-id">[${id}]</span>`;
        };

        var doMood = (mood: any) => {
            if (mood)
                return `<span className="ed-mood">${mood}</span>`;
            return ""
        };

        var doParenthetical = (parenthetical: any) => {
            if (parenthetical)
                return `<div className="ed-parenthetical">(${parenthetical})</div>`;
            return ""
        };

        return `<div className="ed-character">
            <div>${doId(node.id)}${node.actor}${doMood(node.mood)}</div>
            ${doParenthetical(node.parenthetical)}
        </div>`;
    }
}

class DialogLine {
    static render(line: any) {
        if (line == undefined) return null;
        if (line.err) return Error.render(line.err)

        return `<div className="ed-dialog-line">${line}</div>`;
    }
}

class Dialog {
    static render(node: any, dkey: number) {
        if (node.err) return Error.render(node.err)
        if (node.dialog.err) return Error.render(node.dialog.err)

        return `<div className="ed-dialog" key="${dkey}">
            ${When.render(node.when)}
            ${Character.render(node.dialog.character)}
            ${DialogLine.render(node.dialog.line)}
        </div>`;
    }
}

class RandomLine {
    static render(node: any, jey: number) {
        
        var doOdds = (odds: any) => {
            if (odds == undefined) return null;
            if (odds.err) return Error.render(odds.err)
            return `<div className="ed-odds">odds ${odds}</div>`;
        };

        return `<div className="ed-random-line">
            <div>${node.line}</div>
            ${doOdds(node.odds)}
            ${Then.render(node.then)}
            ${Remember.render(node.remember)}
        </div>`;
    }
}

class Random {
    static render(node: any, dkey: number) {
        if (node.err) return Error.render(node.err)
        if (node.random.err) Error.render(node.random.err)

        var key = 0;
        const lines = node.random.lines.map((item: any) => {
            return RandomLine.render(item, key++)
        })

        return `
        <div className="ed-random" key="${dkey}">
            ${When.render(node.when)}
            ${Character.render(node.random.character)}
            <div className="ed-random-lines">${lines}</div>
        </div>`;
    }
}

class ChoiceLine {
    static render(node: any, dkey: number) {
        
        var doDef = (def: any) => {
            if (def)
                return `<div className="ed-def">default answer</div>`;
            return ""
        };

        return `
        <div className="ed-choice-line" key="${dkey}">
            <div>${node.line}</div>
            ${doDef(node.def)}
            ${Then.render(node.then)}
            ${Remember.render(node.remember)} />
        </div>
        `;
    }
}

class Ask {
    static render(ask: any) {
        if (ask.err) return Error.render(ask.err)
        return `<div className="ed-ask">${ask}</div>`;
    }
}

class Question {
    static render(node: any, dkey: number) {
        var question = node.question;
        if (node.err) return Error.render(node.err)
        
        var key = 0;
        const lines = question.choices.map((item: any) => {
            return ChoiceLine.render(item, key++)
        })

        return `
        <div className="ed-question" key="${dkey}">
            ${When.render(node.when)}
            ${Character.render(question.character)}
            ${Ask.render(question.ask)}
            <div className="ed-choice-lines">${lines}</div>    
        </div>
        `
    }
}

class Body {
    static render(node: any) {
        if (node == undefined) return null;
        
        var key = 0;
        var body = node.map((item: any) => {
            if (item.dialog)
                return Dialog.render(item, key++)
            if (item.random)
                return Random.render(item, key++)
            if (item.question)
                return Question.render(item, key++)     
            return Action.render(item, key++) 
        })

        return `<div className="ed-body">${body}</div>`
    }
}

class Then {
    static render(node: any) {
        if (node == undefined) return null;
        if (node.err) return Error.render(node.err)

        return `
        <div className="ed-then">then&nbsp;
            <span>${node.character}</span>&nbsp;
            <span>${node.concept}</span>
        </div>
        `;
    }
}

class Remember {
    static render(node: any) {
        if (node == undefined) return null;
        if (node.err) return Error.render(node.err)
        return `
        <div className="ed-remember">remember&nbsp;
            <span>{node.key}</span>= 
            <span>{node.value}</span>
        </div>
        `
    }
}

class Timeout {
    static render(timeout: any) {
        if (timeout == undefined) return null;
        if (timeout.err) return Error.render(timeout.err)

        return `
        <div className="ed-timeout">timeout&nbsp;
            <span>${timeout}</span>
        </div>
        `
    }
}

class Extra {
    static render(node: any) {
        if (node == undefined) return null;
        return `
        <div className="ed-extra">
            ${Then.render(node.then)}
            ${Remember.render(node.remember)}
            ${Timeout.render(node.timeout)}
        </div>
        `
    }
}

class When {
    static render(node: any) {
        if (node == undefined) return null;
        if (node.err) return Error.render(node.err)
            
        var key = 0;
        const when = node.map((item: string) => {
            return `<span key=${key++}>${item}&nbsp;</span>`
        })

        return `
        <div className="ed-when">when ${when}</div>
        `
    }
}

class Location {
    static render(node: any) {
        if (node.err) return Error.render(node.err);

        var location = node.text;
        const lockey = node.key;
        location = location + (lockey ? "/" + lockey : "");

        var doId = (id: any) => {
            return null;
            if (id)
                return `<span className="ed-id">[${id}]</span>`
        };

        return `
        <div className="ed-location">
            ${doId(node.id)}
            ${location}
        </div>
        `
    }
}

class Main {
    static render(node: any) {
        return `
        <div className="ed-main">
            ${Location.render(node.location)}
            ${When.render(node.when)}}
        </div>
        `
    }
}

class Error {
    static render(error: any) {
        return `<div className="ed-error">${error}</div>`
    }
}

export class SceneViewer {
    static render(scene: any) {
        return `
        <div className="scene-viewer">
            ${Main.render(scene.main)}
            ${Extra.render(scene.extra)}
            ${Body.render(scene.body)}
        </div>
        `
    }
}
