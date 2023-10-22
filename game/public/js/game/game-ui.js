import { ChoiceKind } from "./iui.js";
import { ChunkKind } from "./igame.js";
export class UI {
    constructor() {
        this.portrait = false;
        this.alert = (text, canclose, onalert) => {
            document.body.classList.add("showing-alert");
            let storyInner = document.querySelector(".story-inner");
            let inner = document.querySelector(".modal-inner");
            let panel = inner.querySelector("span");
            panel.innerHTML = "<p>" + text + "</p>";
            let modal = document.querySelector(".modal");
            modal.classList.add("show");
            const waitToMinimize = (e) => {
                e.stopPropagation();
                if (storyInner.classList.contains("minimized"))
                    storyInner.classList.remove("minimized");
                else
                    storyInner.classList.add("minimized");
            };
            let minimizer = inner.querySelector(".minimizer");
            minimizer.addEventListener("click", waitToMinimize);
            const waitForClick = (done) => {
                const onclick = () => {
                    modal.removeEventListener("click", onclick);
                    return done();
                };
                modal.addEventListener("click", onclick);
            };
            waitForClick(() => {
                panel.innerHTML = `<div class="bounce1"></div><div class="bounce2"></div>`;
                const waitForClose = () => {
                    var ready = canclose();
                    if (ready) {
                        minimizer.removeEventListener("click", waitToMinimize);
                        modal.classList.remove("show");
                        modal.classList.remove("disable");
                        setTimeout(() => {
                            document.body.classList.remove("showing-alert");
                            setTimeout(onalert, 0);
                        }, 250);
                    }
                    else {
                        modal.classList.add("disable");
                        setTimeout(waitForClose, 100);
                    }
                };
                waitForClose();
            });
        };
        this.showChoices = (sceneChoices, onchoice) => {
            let panel = document.querySelector(".choice-panel");
            panel.innerHTML = "";
            let ul = document.createElement("ul");
            for (var i = 0; i < sceneChoices.length; i++) {
                let choice = sceneChoices[i];
                var icon = "ion-ios-location";
                if (choice.kind == ChoiceKind.action)
                    icon = "ion-flash";
                if (choice.kind == ChoiceKind.messageTo)
                    icon = "ion-android-person";
                if (choice.kind == ChoiceKind.messageFrom)
                    icon = "ion-chatbubble-working";
                icon = "ion-arrow-right-b";
                let li = document.createElement("li");
                if (choice.metadata != undefined && choice.metadata.class != undefined)
                    li.classList.add(choice.metadata.class);
                if (choice.metadata != undefined && choice.metadata.style != undefined)
                    li.setAttribute("style", choice.metadata.style);
                li.setAttribute("data-kind", choice.kind.toString());
                li.setAttribute("data-id", choice.id.toString());
                li.classList.add("hidden");
                let html = `
                <div class="kind"><div><i class="icon ${icon}"></i></div></div>
                <div class="choice">${choice.text}</div>`;
                if (choice.subtext != undefined) {
                    html = `${html}<div class="choice subtext">${choice.subtext}</div>`;
                }
                li.innerHTML = html;
                ul.appendChild(li);
            }
            panel.appendChild(ul);
            document.body.classList.add("showing-choices");
            panel.style.top = "calc(100% - " + panel.offsetHeight + "px)";
            let storyInner = document.querySelector(".story-inner");
            storyInner.classList.remove("minimized");
            let article = document.querySelector("article");
            article.style.marginBottom = panel.offsetHeight + "px";
            this.scrollContent(article.parentElement);
            let me = this;
            let lis = document.querySelectorAll(".choice-panel li");
            const onChoice = (e) => {
                for (var i = 0; i < lis.length; i++) {
                    lis[i].removeEventListener("click", onChoice);
                }
                var target = e.target;
                var li = target;
                while (true) {
                    if (li.nodeName == "LI")
                        break;
                    li = li.parentElement;
                }
                li.classList.add("selected");
                setTimeout(() => {
                    onchoice({
                        kind: parseInt(li.getAttribute("data-kind")),
                        id: parseInt(li.getAttribute("data-id")),
                        text: ""
                    });
                }, 500);
            };
            for (var i = 0; i < lis.length; i++) {
                lis[i].addEventListener("click", onChoice);
                lis[i].classList.remove("hidden");
            }
        };
        this.hideChoices = (callback) => {
            document.body.classList.remove("showing-choices");
            // make sure the first blurb will be visible
            var content = document.querySelector(".content");
            let storyInner = document.querySelector(".story-inner");
            storyInner.scrollTop = content.offsetTop;
            //storyInner.style.height = "25%";
            var panel = document.querySelector(".choice-panel");
            panel.style.top = "100%";
            var article = document.querySelector("article");
            article.style.marginBottom = "0";
            article.setAttribute("style", "");
            setTimeout(callback, 250 /*matches .choice-panel transition*/);
        };
        this.initScene = (data, callback) => {
            this.setTitle(data.title);
            if (data.image == undefined)
                return callback();
            this.changeBackground(data.image, undefined, callback);
        };
        this.addBlurb = (chunk, callback) => {
            let html = this.markupChunk(chunk);
            let content = document.querySelector(".content");
            let article = document.querySelector("article");
            let div = document.createElement("div");
            div.innerHTML = html;
            let section = div.firstChild;
            const waitForClick = (done) => {
                const onclick = () => {
                    content.removeEventListener("click", onclick);
                    return done();
                };
                content.addEventListener("click", onclick);
            };
            if (chunk.kind == ChunkKind.background) {
                let bg = chunk;
                if (bg.wide)
                    this.changeWideBackground(bg.asset, bg.metadata, callback);
                else
                    this.changeBackground(bg.asset, bg.metadata, callback);
            }
            else if (chunk.kind == ChunkKind.inline) {
                let inline = chunk;
                if (inline.metadata != undefined && inline.metadata.class != undefined)
                    section.classList.add(inline.metadata.class);
                if (inline.metadata != undefined && inline.metadata.style != undefined)
                    section.setAttribute("style", inline.metadata.style);
                article.appendChild(section);
                this.scrollContent(article.parentElement);
                let assetName = inline.image.replace(/ /g, "%20").replace(/'/g, "%27");
                if (assetName.indexOf(".") == -1)
                    assetName += ".jpg";
                assetName = `game/assets/${assetName}`;
                let image = new Image();
                image.onload = () => {
                    let img = section.firstElementChild;
                    img.style.backgroundImage = `url(${assetName})`;
                    img.classList.add("ready");
                    return callback();
                };
                image.src = assetName;
            }
            else if (chunk.kind == ChunkKind.text || chunk.kind == ChunkKind.dialog || chunk.kind == ChunkKind.gameresult) {
                section.style.opacity = "0";
                article.appendChild(section);
                this.scrollContent(article.parentElement);
                section.style.opacity = "1";
                section.style.transition = "all 0.15s ease";
                if (chunk.kind == ChunkKind.dialog) {
                    let dialog = chunk;
                    if (dialog.metadata != undefined && dialog.metadata.image != undefined) {
                        let assetName = "game/assets/" + dialog.metadata.image.replace(/ /g, "%20").replace(/'/g, "%27");
                        if (assetName.indexOf(".") == -1)
                            assetName += ".jpg";
                        let head = section.getElementsByClassName("head")[0];
                        let image = new Image();
                        image.onload = function () {
                            head.style.backgroundImage = "url(" + assetName + ")";
                            head.classList.add("show");
                        };
                        setTimeout(() => { image.src = assetName; }, 100);
                    }
                }
                let spans = section.querySelectorAll("span");
                if (spans.length == 0) {
                    waitForClick(callback);
                }
                else {
                    let ispan = 0;
                    waitForClick(() => {
                        clearTimeout(showTimer);
                        while (ispan < spans.length)
                            spans[ispan++].removeAttribute("style");
                        return callback();
                    });
                    var showTimer = setTimeout(function show() {
                        spans[ispan++].removeAttribute("style");
                        if (ispan < spans.length)
                            showTimer = setTimeout(show, 25);
                    }, 100);
                }
            }
            else if (chunk.kind == ChunkKind.heading) {
                let hchunk = chunk;
                let heading = document.querySelector(".heading");
                let inner = document.querySelector(".heading-inner");
                inner.innerHTML = html;
                document.body.classList.add("showing-heading");
                if (hchunk.metadata != undefined && hchunk.metadata.class != undefined)
                    heading.classList.add(hchunk.metadata.class);
                heading.addEventListener("click", function onclick() {
                    heading.removeEventListener("click", onclick);
                    document.body.classList.remove("showing-heading");
                    if (hchunk.metadata != undefined && hchunk.metadata.class != undefined)
                        heading.classList.remove(hchunk.metadata.class);
                    setTimeout(() => { callback(); }, 500);
                });
            }
            else if (chunk.kind == ChunkKind.doo) {
                let doo = chunk;
                let choices = Array();
                choices.push({
                    kind: ChoiceKind.action,
                    id: 0,
                    text: doo.text,
                    metadata: doo.metadata
                });
                this.showChoices(choices, (chosen) => {
                    this.hideChoices(callback);
                });
            }
            else if (chunk.kind == ChunkKind.minigame) {
                this.runMinigame(chunk, callback);
            }
            else if (chunk.kind == ChunkKind.waitclick) {
                waitForClick(callback);
            }
            else if (chunk.kind == ChunkKind.title) {
                this.setTitle(chunk.text);
                callback();
            }
            else if (chunk.kind == ChunkKind.style) {
                let style = chunk;
                let article = document.querySelector("article");
                if (style.metadata != undefined && style.metadata.class != undefined)
                    article.classList.add(style.metadata.class);
                if (style.metadata != undefined && style.metadata.style != undefined)
                    article.setAttribute("style", style.metadata.style);
                callback();
            }
            else {
                callback();
            }
        };
        this.addBlurbFast = (chunk, callback) => {
            var html = this.markupChunk(chunk)
                .replace(/ style\="visibility:hidden"/g, "")
                .replace(/<span>/g, "")
                .replace(/<\/span>/g, "");
            var article = document.querySelector("article");
            var div = document.createElement("div");
            div.innerHTML = html;
            var section = div.firstChild;
            article.appendChild(section);
            callback();
        };
        this.clearBlurb = () => {
            var article = document.querySelector("article");
            article.innerHTML = "";
        };
        this.addChildWindow = (source, callback) => {
            let storyWindow = document.querySelector(".story-window");
            let iframe = document.createElement("iframe");
            iframe.setAttribute("src", source);
            storyWindow.appendChild(iframe);
            setTimeout(function retry() {
                let doc = iframe.contentWindow;
                if (doc.GameInstance == undefined)
                    setTimeout(retry, 50);
                else
                    callback(doc.GameInstance);
            }, 0);
        };
        this.setTitle = (title) => {
            let inner = document.querySelector(".title-inner");
            if (inner.innerHTML != title) {
                setTimeout(function () {
                    inner.innerHTML = title;
                    inner.classList.remove("out");
                }, 500);
                inner.classList.add("out");
            }
        };
        this.changeBackground = (assetName, metadata, callback) => {
            callback();
            /*
            if (assetName == undefined) return callback();
            if (window.getComputedStyle(document.querySelector(".bg")!).display == "none") return callback();
    
            let bg = <HTMLDivElement>document.querySelector(".bg-inner");
            let zero = <HTMLIFrameElement>bg.firstElementChild;
    
            assetName = encodeURIComponent(assetName);
            if (assetName.indexOf(".") == -1) assetName += ".jpg";
    
            let sceneUrl = `game/teller-image.html?${assetName}`;
            if (assetName.endsWith(".html")) sceneUrl = `game/${assetName}`;
                
            if (zero.src.endsWith(sceneUrl)) return callback();
    
            document.body.classList.add("change-bg");
    
            (<any>window).eventHubAction = (result: any) => {
                if (result.asset == assetName && result.content == "ready") {
                    setTimeout(function() {
                        document.body.classList.remove("change-bg");
                        bg.removeChild(zero);
                        callback();
                    }, 250);
                }
            };
    
            let one = document.createElement("iframe");
            if (metadata != undefined && metadata.class != undefined) one.setAttribute("class", metadata.class);
            if (metadata != undefined && metadata.style != undefined) one.setAttribute("style", metadata.style);
            bg.appendChild(one);
            one.setAttribute("src", sceneUrl);
            */
        };
        this.changeWideBackground = (assetName, metadata, callback) => {
            if (assetName == undefined)
                return callback();
            if (window.getComputedStyle(document.querySelector(".wbg")).display == "none")
                return callback();
            let bg = document.querySelector(".wbg-inner");
            let zero = bg.firstElementChild;
            assetName = encodeURIComponent(assetName);
            if (assetName.indexOf(".") == -1)
                assetName += ".jpg";
            let sceneUrl = `game/teller-image.html?${assetName}`;
            if (assetName.endsWith(".html"))
                sceneUrl = `game/${assetName}`;
            if (zero.src.endsWith(sceneUrl))
                return callback();
            document.body.classList.add("change-wbg");
            window.eventHubAction = (result) => {
                if (result.asset == assetName && result.content == "ready") {
                    document.body.classList.remove("change-wbg");
                    bg.removeChild(zero);
                    callback();
                }
            };
            let one = document.createElement("iframe");
            if (metadata != undefined && metadata.class != undefined)
                one.setAttribute("class", metadata.class);
            if (metadata != undefined && metadata.style != undefined)
                one.setAttribute("style", metadata.style);
            bg.appendChild(one);
            one.setAttribute("src", sceneUrl);
        };
        this.runMinigame = (chunk, callback) => {
            let minigame = chunk;
            let gameReady = false;
            let choiceMade = false;
            const fireMinigame = (url, callback) => {
                let game = document.querySelector(".game");
                let gameFrame = game.firstElementChild;
                window.eventHubAction = (result) => {
                    setTimeout(() => { callback(result); }, 0);
                };
                let src = `game/${url.replace(/ /g, "%20").replace(/'/g, "%27")}`;
                gameFrame.setAttribute("src", src);
            };
            fireMinigame(minigame.url, (result) => {
                if (result.ready != undefined) {
                    if (choiceMade) {
                        document.body.classList.add("show-game");
                        document.body.classList.remove("change-bg");
                        document.body.classList.remove("disabled");
                    }
                    gameReady = true;
                }
                else {
                    document.body.classList.remove("show-game");
                    this.hideChoices(() => {
                        let text = (result.win == true ? minigame.winText : minigame.loseText);
                        setTimeout(() => { callback(result); }, 0);
                    });
                }
            });
            let choices = Array();
            choices.push({
                kind: ChoiceKind.action,
                id: 0,
                text: minigame.text
            });
            this.showChoices(choices, (chosen) => {
                if (gameReady) {
                    document.body.classList.add("show-game");
                    document.body.classList.remove("disabled");
                }
                else {
                    document.body.classList.add("change-bg");
                    document.body.classList.add("disabled");
                }
                choiceMade = true;
            });
        };
        this.markupChunk = (chunk) => {
            let html = Array();
            if (chunk.kind == ChunkKind.text) {
                let text = chunk;
                html.push("<section class='text'>");
                for (var line of text.lines) {
                    html.push(`<p>${line}</p>`);
                }
                html.push("</section>");
            }
            else if (chunk.kind == ChunkKind.dialog) {
                let dialog = chunk;
                let hasImage = (dialog.metadata != undefined && dialog.metadata.image != undefined);
                html.push("<section class='dialog'>");
                if (hasImage) {
                    html.push(`<div class='head-placeholder'></div>`);
                    html.push(`<div class='head'></div>`);
                    html.push("<div class='text'>");
                }
                html.push(`<h1>${dialog.actor}</h1>`);
                if (dialog.parenthetical != undefined)
                    html.push(`<h2>${dialog.parenthetical}</h2>`);
                for (var line of dialog.lines) {
                    var spans = Array.prototype.map.call(line, function (char) {
                        return `<span style='visibility:hidden'>${char}</span>`;
                    });
                    html.push(`<p>${spans.join("")}</p>`);
                }
                if (hasImage)
                    html.push("</div>");
                html.push("</section>");
            }
            else if (chunk.kind == ChunkKind.gameresult) {
                let result = chunk;
                html.push("<section class='result'>");
                html.push(`<p>${result.text}</p>`);
                html.push("</section>");
            }
            else if (chunk.kind == ChunkKind.inline) {
                html.push("<section class='image'>");
                html.push("<div></div>");
                html.push("</section>");
            }
            else if (chunk.kind == ChunkKind.heading) {
                let heading = chunk;
                html.push(`<h1>${heading.title}</h1>`);
                if (heading.subtitle != undefined)
                    html.push(`<h2>${heading.subtitle}</h2>`);
            }
            return html.join("");
        };
        this.scrollContent = (element) => {
            var start = element.scrollTop;
            var end = (element.scrollHeight - element.clientHeight);
            if (end <= start)
                return;
            var top = start;
            setTimeout(function scroll() {
                top += 10;
                element.scrollTop = top + 1;
                if (top < end)
                    setTimeout(scroll, 10);
            }, 10);
        };
        FastClick.attach(document.body);
    }
}
//# sourceMappingURL=game-ui.js.map