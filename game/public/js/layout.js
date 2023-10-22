"use strict";
import * as GameMain from "./game/main.js";
import * as EditorMain from "./editor/main.js";
import * as IDEMain from "./ide/main.js";
export const render = () => {
    return `
    <canvas id="canvas" style="position:absolute; width:100vw; height:100vh;"></canvas>
    <div style="position:absolute;">
        ${GameMain.render()}
        ${EditorMain.render()}
        ${IDEMain.render()}
    </div>
`;
};
export const postRender = () => {
    GameMain.postRender();
    EditorMain.postRender();
    IDEMain.postRender();
};
//# sourceMappingURL=layout.js.map