
import * as App from "./core/app.js"
import * as GameMain from "./game/main.js"
import * as EditorMain from "./editor/main.js"



export const render = () => {
    return `
    ${GameMain.render()}
    ${EditorMain.render()}
`
}

export const postRender = () => {
    GameMain.postRender();
    EditorMain.postRender();
}
