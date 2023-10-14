"use strict";
import * as router from "../core/router.js";
import * as ide from "./ide.js";
window[ide.NS] = ide;
export const startup = () => {
    router.addRoute("^#/ide/?(.*)$", params => ide.fetch(params));
};
export const render = () => {
    return `
<div>
    ${ide.render()}
</div>
`;
};
export const postRender = () => {
    ide.postRender();
};
//# sourceMappingURL=main.js.map