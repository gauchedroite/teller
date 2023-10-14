"use strict";
import * as App from "../core/app.js";
export const NS = "Game_runner";
const myLayout = () => {
    return `
    <a href="#/editor">Editor</a><br>
    GAME TIME
`;
};
export const fetch = (args) => {
    App.prepareRender(NS, "Runner");
    // Router.registerDirtyExit(null)
    // fetchState(args)
    //     .then(App.render)
    //     .catch(App.render)
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
};
//# sourceMappingURL=game.js.map