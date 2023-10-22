"use strict"

import * as router from "../core/router.js"
import * as home from "./home/home.js"
import * as story from "./story/story.js"


(window as any)[home.NS] = home;
(window as any)[story.NS] = story;



export const startup = () => {
    router.addRoute("^#/story/?(.*)$", params => story.fetch(params));

    // Must be the last route because it's a catchall
    router.addRoute("^#/?(.*)$", params => home.fetch(params));
}

export const render = () => {
    return `
<div>
${home.render()}
${story.render()}
</div>
`
}

export const postRender = () => {
    home.postRender();
    story.postRender();
}

