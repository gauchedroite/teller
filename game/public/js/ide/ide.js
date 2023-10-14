"use strict";
import * as App from "../core/app.js";
export const NS = "Game_ide";
const myLayout = () => {
    return `
    <a href="#/">Game</a><br>
    <a href="#/editor">Editor</a><br>
    IDE
`;
};
export const fetch = (args) => {
    App.prepareRender(NS, "IDE");
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
//# sourceMappingURL=ide.js.map