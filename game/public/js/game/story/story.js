import * as App from "../../core/app.js";
import { UI } from "./game-ui.js";
import { Game } from "./game-loop.js";
export const NS = "GSTORY";
let storyStarted = false;
let buttonClicked = false;
const ui = new UI();
const game = new Game(ui);
export const ux = ui;
const myLayout = (uirender) => {
    return `
<div style="width:100vw; xheight:100vh; background-color:whitesmoke;">
    <a href="#/">Home</a><br>
</div>
${uirender}
`;
};
export const fetch = (args) => {
    App.prepareRender(NS, "Story");
    App.render();
};
export const render = () => {
    if (!App.inContext(NS))
        return "";
    const uirender = ui.render();
    return myLayout(uirender);
};
export const postRender = () => {
    if (!App.inContext(NS))
        return;
    if (!storyStarted) {
        storyStarted = true;
        setTimeout(game.startGameAsync, 0);
    }
};
//# sourceMappingURL=story.js.map