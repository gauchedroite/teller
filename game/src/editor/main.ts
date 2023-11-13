import * as router from "../core/router.js"
import * as editor from "./editor.js"
import * as dsleditor from "./dsleditor.js"


(window as any)[editor.NS] = editor;



export const startup = () => {
    router.addRoute("^#/editor/?(.*)$", params => editor.fetch(params));
    router.addRoute("^#/dsleditor/?(.*)$", params => dsleditor.fetch(params));
}

export const render = () => {
    return `
    ${editor.render()}
    ${dsleditor.render()}
`
}

export const postRender = () => {
    editor.postRender();
    dsleditor.postRender();
}

