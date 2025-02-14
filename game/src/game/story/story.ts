import * as App from "../../core/app.js"
import { UI } from "./game-ui.js"
import { Game } from "./game-loop.js"
import * as router from "../../core/router.js"

export const NS = "GSTORY"

let storyStarted = false



let ui: UI
let game: Game



const addGameCss = (id: string) => {
    const cssid = `gamecss_${id}`
    const cssElement = document.getElementById(cssid)
    if (cssElement != undefined)
        return

    const doc = (assetName: string) => `/tellergame-${id}/${assetName}`;

    const link = document.createElement("link")
    link.id = cssid
    link.href = doc("css/index.css")
    link.type = "text/css"
    link.rel = "stylesheet"

    document.getElementsByTagName("head")[0].appendChild(link)
}

const fetchState = async (id: string) => {
    ui = new UI(id)
    game = new Game(id, ui)
    await game.gdata.fetchGameFileAsync()
}

export const fetch = async (args: string[] | undefined) => {
    App.prepareRender(NS, "Story", "game_story")

    if (args != undefined && args.length > 0) {
        const name = args[0]
        const action = args[1];
        
        addGameCss(name)

        if (action == "restart") {
            game?.eraseGame()
            storyStarted = false
            router.goto(`#/story/${name}`, 1)
            router.reload(10) // this makes sure to "release" any pending wait for click in the previous game instance
            return
        }
        else {
            await fetchState(name)
        }
    }


    // We only render/postRender the first time we fetch
    // After it's started, methods in the UI class mutate the DOM and so calling render() would destroy the DOM state
    // After the story is started, we still need to set the body id because of the CSS (that would usually be done in App.render())
    if (!storyStarted) {
        App.render()
    }
    else {
        document.body.id = NS.toLowerCase().replace("_", "-")
    }
}

export const render = () => {
    if (!App.inContext(NS) || storyStarted) return ""

    return ui.render()
}

export const postRender = () => {
    if (!App.inContext(NS)) return

    if (!storyStarted && game != undefined) {
        storyStarted = true
        setTimeout(game.runGameAsync, 1)
    }
}



const bc2 = new BroadcastChannel("editor:reload-story")
bc2.onmessage = event => setTimeout(() => { router.reload() }, 0);

