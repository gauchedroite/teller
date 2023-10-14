"use strict";
import * as router from "../core/router.js";
import * as editor from "./editor.js";
window[editor.NS] = editor;
export const startup = () => {
    router.addRoute("^#/editor/?(.*)$", params => editor.fetch(params));
};
export const render = () => {
    return `
<div>
    ${editor.render()}
</div>
`;
};
export const postRender = () => {
    editor.postRender();
};
//# sourceMappingURL=main.js.map