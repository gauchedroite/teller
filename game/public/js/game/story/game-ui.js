import { ChoiceKind } from "../iui.js";
import { ChunkKind } from "../igame.js";
import { waitforMsecAsync, waitforClickAsync, waitforValueAsync } from "../../utils.js";
import { NS } from "./story.js";
let UX; // Replaces ${NS} for events
export class UI {
    myStoryInner() { return document.querySelector(".story-inner"); }
    myModal() { return document.querySelector(".modal"); }
    myModalInner() { return document.querySelector(".modal-inner"); }
    myChoicePanel() { return document.querySelector(".choice-panel"); }
    myArticle() { return document.querySelector("article"); }
    myContent() { return document.querySelector(".content"); }
    myHeading() { return document.querySelector(".heading"); }
    myHeadingInner() { return document.querySelector(".heading-inner"); }
    myTitleInner() { return document.querySelector(".title-inner"); }
    myWbg() { return document.querySelector(".wbg"); }
    myWbgInner() { return document.querySelector(".wbg-inner"); }
    constructor() {
        this.portrait = false;
        this.alertAsync = async (text, ready) => {
            document.body.classList.add("showing-alert");
            let storyInner = this.myStoryInner();
            let inner = this.myModalInner();
            let panel = inner.querySelector("span");
            panel.innerHTML = "<p>" + text + "</p>";
            let modal = this.myModal();
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
            await waitforClickAsync(modal);
            panel.innerHTML = `<div class="bounce1"></div><div class="bounce2"></div>`;
            if (ready) {
                minimizer.removeEventListener("click", waitToMinimize);
                modal.classList.remove("show");
                modal.classList.remove("disable");
                await waitforMsecAsync(250);
                document.body.classList.remove("showing-alert");
            }
            else {
                modal.classList.add("disable");
            }
        };
        this.showChoicesAsync = async (sceneChoices) => {
            let panel = this.myChoicePanel();
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
            let storyInner = this.myStoryInner();
            storyInner.classList.remove("minimized");
            let article = this.myArticle();
            article.style.marginBottom = panel.offsetHeight + "px";
            this.scrollContent(article.parentElement);
            let me = this;
            let lis = this.myChoicePanel().querySelectorAll("li");
            let indexClicked = undefined;
            const onChoice = (i) => () => { indexClicked = i; };
            for (var i = 0; i < lis.length; i++) {
                lis[i].addEventListener("click", onChoice(i));
                lis[i].classList.remove("hidden");
            }
            await waitforValueAsync(() => indexClicked);
            var li;
            for (var i = 0; i < lis.length; i++) {
                lis[i].removeEventListener("click", onChoice(i));
                if (i == indexClicked)
                    li = lis[i];
            }
            li.classList.add("selected");
            await waitforMsecAsync(500);
            return {
                kind: parseInt(li.getAttribute("data-kind")),
                id: parseInt(li.getAttribute("data-id")),
                text: ""
            };
        };
        this.hideChoicesAsync = async () => {
            document.body.classList.remove("showing-choices");
            // make sure the first blurb will be visible
            var content = this.myContent();
            let storyInner = this.myStoryInner();
            storyInner.scrollTop = content.offsetTop;
            //storyInner.style.height = "25%";
            var panel = this.myChoicePanel();
            panel.style.top = "100%";
            var article = this.myArticle();
            article.style.marginBottom = "0";
            article.setAttribute("style", "");
            await waitforMsecAsync(250);
        };
        this.initSceneAsync = async (data) => {
            this.setTitle(data.title);
            if (data.image == undefined)
                return Promise.resolve();
            return this.changeBackgroundAsync(data.image, undefined);
        };
        this.addBlurbAsync = async (chunk) => {
            let html = this.markupChunk(chunk);
            let content = this.myContent();
            let article = this.myArticle();
            let div = document.createElement("div");
            div.innerHTML = html;
            let section = div.firstChild;
            if (chunk.kind == ChunkKind.background) {
                let bg = chunk;
                if (bg.wide)
                    this.changeWideBackground(bg.asset, bg.metadata);
                else
                    return this.changeBackgroundAsync(bg.asset, bg.metadata);
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
                image.src = assetName;
                await image.decode();
                let img = section.firstElementChild;
                img.style.backgroundImage = `url(${assetName})`;
                img.classList.add("ready");
            }
            else if (chunk.kind == ChunkKind.text || chunk.kind == ChunkKind.dialog || chunk.kind == ChunkKind.gameresult) {
                section.style.opacity = "0";
                article.appendChild(section);
                this.scrollContent(article.parentElement);
                section.style.transition = "all 0.915s ease";
                section.style.opacity = "1";
                if (chunk.kind == ChunkKind.dialog) {
                    let dialog = chunk;
                    if (dialog.metadata != undefined && dialog.metadata.image != undefined) {
                        let assetName = "game/assets/" + dialog.metadata.image.replace(/ /g, "%20").replace(/'/g, "%27");
                        if (assetName.indexOf(".") == -1)
                            assetName += ".jpg";
                        let head = section.getElementsByClassName("head")[0];
                        let image = new Image();
                        await waitforMsecAsync(100);
                        image.src = assetName;
                        await image.decode();
                        head.style.backgroundImage = "url(" + assetName + ")";
                        head.classList.add("show");
                    }
                }
                let spans = section.querySelectorAll("span");
                if (spans.length == 0) {
                    await waitforClickAsync(content);
                }
                else {
                    await waitforMsecAsync(100);
                    let ispan = 0;
                    await waitforClickAsync(content, 25, () => {
                        if (ispan < spans.length)
                            spans[ispan++].removeAttribute("style");
                    });
                    while (ispan < spans.length)
                        spans[ispan++].removeAttribute("style");
                }
            }
            else if (chunk.kind == ChunkKind.heading) {
                let hchunk = chunk;
                let heading = this.myHeading();
                let inner = this.myHeadingInner();
                inner.innerHTML = html;
                document.body.classList.add("showing-heading");
                if (hchunk.metadata != undefined && hchunk.metadata.class != undefined)
                    heading.classList.add(hchunk.metadata.class);
                await waitforClickAsync(heading);
                document.body.classList.remove("showing-heading");
                if (hchunk.metadata != undefined && hchunk.metadata.class != undefined)
                    heading.classList.remove(hchunk.metadata.class);
                await waitforMsecAsync(500);
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
                await this.showChoicesAsync(choices);
                return this.hideChoicesAsync();
            }
            else if (chunk.kind == ChunkKind.minigame) {
                return this.runMinigameAsync(chunk);
            }
            else if (chunk.kind == ChunkKind.waitclick) {
                return waitforClickAsync(content);
            }
            else if (chunk.kind == ChunkKind.title) {
                this.setTitle(chunk.text);
            }
            else if (chunk.kind == ChunkKind.style) {
                let style = chunk;
                let article = this.myArticle();
                if (style.metadata != undefined && style.metadata.class != undefined)
                    article.classList.add(style.metadata.class);
                if (style.metadata != undefined && style.metadata.style != undefined)
                    article.setAttribute("style", style.metadata.style);
            }
            else {
                return;
            }
        };
        this.addBlurbFast = (chunk) => {
            var html = this.markupChunk(chunk)
                .replace(/ style\="visibility:hidden"/g, "")
                .replace(/<span>/g, "")
                .replace(/<\/span>/g, "");
            var article = this.myArticle();
            var div = document.createElement("div");
            div.innerHTML = html;
            var section = div.firstChild;
            article.appendChild(section);
        };
        this.clearBlurb = () => {
            var article = this.myArticle();
            article.innerHTML = "";
        };
        this.render = () => {
            return this.myLayout();
        };
        this.myLayout = () => {
            return `
<div class="game-body" style="display:none;">
    <div class="wbg">
        <div class="wbg-inner">
            <iframe title="cheval"></iframe>
        </div>
    </div>
</div>
    
<div class="game-story">
    <div class="bg" style="display:none;">
        <div class="bg-inner">
            <iframe title="cheval"></iframe>
        </div>
        <div class="game">
            <iframe title="cheval"></iframe>
        </div>
    </div>
    
    <div class="story">
        <div class="navbar">
            <div class="navbar-inner">
                <div class="goto-menu">
                    <i class="icon ion-navicon-round"></i> 
                </div>
                <div class="title">
                    <div class="title-inner"></div>
                </div>
            </div>
        </div>
        <div class="story-inner">
            <div class="content">
                <article></article>
            </div>
            <div class="choice-panel">
            </div>
            <div class="modal">
                <div class="modal-inner">
                    <span></span>
                    <div class="minimizer"><i class="ion ion-arrow-down-b"></i></div>
                </div>
            </div>
            <div class="heading">
                <div class="heading-inner"></div>
            </div>
        </div>
    </div>
    
    <div class="story-window hidden">
    </div>
    
    <div class="preloader">
        <div class="loader-ring">
            <div class="loader-ring-light"></div>
            <div class="loader-ring-track"></div>
        </div>
    </div>
</div>
    `;
        };
        this.setTitle = (title) => {
            let inner = this.myTitleInner();
            if (inner.innerHTML != title) {
                setTimeout(function () {
                    inner.innerHTML = title;
                    inner.classList.remove("out");
                }, 500);
                inner.classList.add("out");
            }
        };
        this.changeBackgroundAsync = (assetName, metadata) => {
            return Promise.resolve();
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
        this.changeWideBackground = (assetName, metadata) => {
            if (assetName == undefined)
                return;
            if (window.getComputedStyle(this.myWbg()).display == "none")
                return;
            let bg = this.myWbgInner();
            let zero = bg.firstElementChild;
            assetName = encodeURIComponent(assetName);
            if (assetName.indexOf(".") == -1)
                assetName += ".jpg";
            let sceneUrl = `game/teller-image.html?${assetName}`;
            if (assetName.endsWith(".html"))
                sceneUrl = `game/${assetName}`;
            if (zero.src.endsWith(sceneUrl))
                return;
            document.body.classList.add("change-wbg");
            // (<any>window).eventHubAction = (result: any) => {
            //     if (result.asset == assetName && result.content == "ready") {
            //         document.body.classList.remove("change-wbg");
            //         bg.removeChild(zero);
            //         callback();
            //     }
            // };
            let one = document.createElement("iframe");
            if (metadata != undefined && metadata.class != undefined)
                one.setAttribute("class", metadata.class);
            if (metadata != undefined && metadata.style != undefined)
                one.setAttribute("style", metadata.style);
            bg.appendChild(one);
            one.setAttribute("src", sceneUrl);
        };
        this.runMinigameAsync = async (chunk) => {
            return Promise.resolve(true);
            /*
            let minigame = <IMiniGame>chunk;
            let gameReady = false;
            let choiceMade = false;
            
            const fireMinigame = (url: string, callback: (result: any) => void) => {
                let game = document.querySelector(".game")!;
                let gameFrame = <HTMLIFrameElement>game.firstElementChild;
    
                (<any>window).eventHubAction = (result: any) => {
                    setTimeout(() => { callback(result); }, 0);
                };
    
                let src = `game/${url.replace(/ /g, "%20").replace(/'/g, "%27")}`;
                gameFrame.setAttribute("src", src);
            };
    
            fireMinigame(minigame.url, (result: any) => {
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
                    this.hideChoicesAsync(() => {
                        let text = (result.win == true ? minigame.winText : minigame.loseText);
                        setTimeout(() => { callback(result); }, 0);
                    });
                }
            });
    
            let choices = Array<IChoice>();
            choices.push(<IChoice> {
                kind: ChoiceKind.action,
                id: 0,
                text: minigame.text
            });
    
            this.showChoicesAsync(choices, (chosen: IChoice) => {
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
            */
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
        UX = `${NS}.ux`;
    }
}
//# sourceMappingURL=game-ui.js.map