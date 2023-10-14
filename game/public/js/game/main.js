"use strict";
import * as router from "../core/router.js";
import * as game from "./game.js";
window[game.NS] = game;
export const startup = () => {
    router.addRoute("^#/?(.*)$", params => game.fetch(params));
};
export const render = () => {
    return `
<div>
    ${game.render()}
</div>
`;
};
export const postRender = () => {
    game.postRender();
};
//# sourceMappingURL=main.js.map