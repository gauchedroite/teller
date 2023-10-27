
import * as router from "../core/router.js"
import * as ide from "./ide.js"


(window as any)[ide.NS] = ide;



export const startup = () => {
    router.addRoute("^#/ide/?(.*)$", params => ide.fetch(params));
}

export const render = () => {
    return `
    ${ide.render()}
`
}

export const postRender = () => {
    ide.postRender();
}

