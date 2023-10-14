"use strict"

import * as App from "../core/app.js"
import * as Router from "../core/router.js"
import * as Misc from "../core/misc.js"

export const NS = "Game_runner"



const myLayout = () => {
    return `
    GAME TIME<br>
    <a href="#/editor">Editor</a><br>
    <a href="#/ide">IDE</a><br>
`
}



export const fetch = (args: string[] | undefined) => {
    App.prepareRender(NS, "Runner")
    // Router.registerDirtyExit(null)
    // fetchState(args)
    //     .then(App.render)
    //     .catch(App.render)
    App.render()
}



export const render = () => {
    if (!App.inContext(NS)) return ""

    return myLayout()
}

export const postRender = () => {
    if (!App.inContext(NS)) return
}