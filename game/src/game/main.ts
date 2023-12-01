
import * as router from "../core/router.js"
import * as home from "./story/home.js"
import * as story from "./story/story.js"


(window as any)[home.NS] = home;
(window as any)[story.NS] = story;



export const startup = () => {
    router.addRoute("^#/story/?(.*)$", params => story.fetch(params));
    router.addRoute("^#/home/?(.*)$", params => home.fetch(params));
}

export const render = () => {
    return `
${home.render()}
${story.render()}
`
}

export const postRender = () => {
    home.postRender();
    story.postRender();
}

