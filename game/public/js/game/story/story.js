import * as App from "../../core/app.js";
import { waitforMsecAsync } from "../../utils.js";
import { UI } from "./game-ui.js";
import { Game } from "./game-loop.js";
export const NS = "GSTORY";
let storyStarted = false;
let buttonClicked = false;
const ui = new UI();
const game = new Game(ui);
export const ux = ui;
const myLayout = (gamebody) => {
    return `
<div style="width:100vw; xheight:100vh; background-color:whitesmoke;">
    <a href="#/">Home</a><br>
    <button type="button" onclick="${NS}.onButtonClick()">OK ></button>
    <br><br>
</div>
${gamebody}
`;
};
export const fetch = (args) => {
    App.prepareRender(NS, "Story");
    App.render();
};
export const render = () => {
    if (!App.inContext(NS))
        return "";
    const gamebody = ui.render();
    return myLayout(gamebody);
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
};
//# sourceMappingURL=story.js.map