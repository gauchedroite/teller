
import * as App from "../core/app.js"
import * as Router from "../core/router.js"
import * as Misc from "../core/misc.js"

export const NS = "GIDE"



const myLayout = () => {
    return `
<a href="#/">Home</a><br>
<a href="#/story">Story</a><br>
<a href="#/editor">Editor</a><br>
IDE
`
}



export const fetch = (args: string[] | undefined) => {
    App.prepareRender(NS, "IDE", "game_ide")
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