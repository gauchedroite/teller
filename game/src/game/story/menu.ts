
import * as App from "../../core/app.js"
import * as Router from "../../core/router.js"
import * as Misc from "../../core/misc.js"
import WebglRunner from "../webgl-runner.js"

export const NS = "GMENU"


let gameid: string = "";
let runner: WebglRunner | undefined = undefined;


const myLayout = (id: string) => {
    const doc = (assetName: string) => {
        if (id == "dev")
            return `repos_game-dev/${assetName}`
        return `repos/game-${id}/${assetName}`
    }

    return `
<div class="solid">
    <iframe title="Menu Background" src="${doc("menu-bg.html")}" class="full-viewport"></iframe>
</div>
<div class="solid">
    <a href="#/story/${id}" style="color:whitesmoke;">Continuer</a><br>
    <a href="#/story/${id}/restart" style="color:whitesmoke;">Restart</a><br>
    <a href="#/editor/${id}" style="color:whitesmoke;">Editeur</a><br>
    <a href="#/" style="color:whitesmoke;">Index</a><br>
</div>
`
}



export const fetch = (args: string[] | undefined) => {
    gameid = (args ? args[0] : "");
    App.prepareRender(NS, "Menu", "game_menu")
    App.render()
}



export const render = () => {
    if (!App.inContext(NS)) return ""

    return myLayout(gameid)
}

export const postRender = () => {
    if (!App.inContext(NS)) return
}


window.addEventListener("hashchange", () => {
    let hash = window.location.hash;
    if (hash.length == 0)
        hash = `#/menu/${gameid}`;

    if (hash == `#/menu/${gameid}`)
        runner?.resume()
    else
        runner?.pause()
})
