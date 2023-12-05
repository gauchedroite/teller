
import * as App from "../../core/app.js"

export const NS = "GMENU"


let gameid: string = "";


const myLayout = (id: string) => {
    const doc = (assetName: string) => {
        if (id == "dev")
            return `repos_game-dev/${assetName}`
        return `repos/game-${id}/${assetName}`
    }

    const isAdmin = (window as any).APP.admin;

    return `
<div class="solid">
    <iframe title="Menu Background" src="${doc("menu-bg.html")}" class="full-viewport"></iframe>
</div>
<div class="menu-panel">
    <ul>
        <li><a href="#/story/${id}" data-action="continue">Continuer la partie</a></li>
        <li><a href="#/story/${id}/restart" data-action="restart">Nouvelle partie</a></li>
${isAdmin ? `
        <li><a href="#/editor/${id}" data-action="editor">Editeur</a></li>
        <li><a href="#/" data-action="index">Index</a></li>
` : ``}
    </ul>
</div>
`
}


const addGameCss = (id: string) => {
    const cssid = `gamecss_${id}`
    const cssElement = document.getElementById(cssid)
    if (cssElement != undefined)
        return

    // Remove existing game specific css
    const tags = document.querySelectorAll("[tag=gamecss]")
    for (let ix = tags.length - 1; ix >= 0; ix--) {
        const tag = tags[ix]
        tag.parentNode?.removeChild(tag)
    }

    // Add game specific css
    const link = document.createElement("link")
    link.id = cssid
    link.href = (id != "dev" ? `repos/game-${id}/css/index.css` : `repos_game-dev/css/index.css`)
    link.type = "text/css"
    link.rel = "stylesheet"
    link.setAttribute("tag", "gamecss")

    document.getElementsByTagName("head")[0].appendChild(link)
}


export const fetch = (args: string[] | undefined) => {
    gameid = (args ? args[0] : "");
    App.prepareRender(NS, "Menu", "game_menu")
    addGameCss(gameid)
    App.render()
}



export const render = () => {
    if (!App.inContext(NS)) return ""

    return myLayout(gameid)
}

export const postRender = () => {
    if (!App.inContext(NS)) return
}
