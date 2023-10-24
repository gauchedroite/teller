import * as App from "../../core/app.js";
import { waitforMsecAsync } from "../../utils.js";
import { UI } from "./game-ui.js";
import { Game } from "./game-loop.js";
export const NS = "Game_story";
let storyStarted = false;
let buttonClicked = false;
const ui = new UI();
const game = new Game(ui);
const myLayout = () => {
    return `
<div style="width:100vw; xheight:100vh; background-color:whitesmoke;">
    <a href="#/">Home</a><br>

    <button type="button" onclick="${NS}.onButtonClick()">OK ></button>

    <br><br>
</div>

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
export const fetch = (args) => {
    App.prepareRender(NS, "Story");
    App.render();
};
export const render = () => {
    if (!App.inContext(NS))
        return "";
    return myLayout();
};
export const postRender = () => {
    if (!App.inContext(NS))
        return;
    if (!storyStarted) {
        storyStarted = true;
        setTimeout(startStoryLoopAsync, 0);
    }
};
export const onButtonClick = () => {
    buttonClicked = true;
};
const waitUserInput = async () => {
    while (!buttonClicked)
        await waitforMsecAsync(20);
    buttonClicked = false;
};
const startStoryLoopAsync = async () => {
    await game.startGameAsync();
    //console.log("Waiting")
    //await waitUserInput()
    //console.log("Waiting done")
};
//# sourceMappingURL=story.js.map