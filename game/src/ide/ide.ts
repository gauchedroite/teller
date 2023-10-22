"use strict"

import * as App from "../core/app.js"
import * as Router from "../core/router.js"
import * as Misc from "../core/misc.js"

export const NS = "Game_ide"



const myLayout = () => {
    return `
<div style="width:100%; height:100%;">
    <a href="#/">Game</a><br>
    <a href="#/editor">Editor</a><br>
    IDE
</div>
`
}



export const fetch = (args: string[] | undefined) => {
    App.prepareRender(NS, "IDE")
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