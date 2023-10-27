import * as App from "../../core/app.js"
import { waitforMsecAsync } from "../../utils.js"
import { UI } from "./game-ui.js"
import { Game } from "./game-loop.js"

export const NS = "GSTORY"

let storyStarted = false



const ui = new UI()
const game = new Game(ui)


export const ux = ui;


const myLayout = (uirender: string) => {
    return uirender
}

export const fetch = (args: string[] | undefined) => {
    App.prepareRender(NS, "Story", "game_story")

    // We only render/postRender the first time we fetch
    // After it's started, methods in the UI class mutate the DOM and calling render() would destroy the DOM state
    // After the story is started, we still need to set the body id because of the CSS (that would usually be done in App.render())
    if (!storyStarted) {
        App.render()
    }
    else {
        document.body.id = NS.toLowerCase().replace("_", "-");
    }
}

export const render = () => {
    if (!App.inContext(NS) || storyStarted) return ""

    const uirender = ui.render()
    return myLayout(uirender)
}

export const postRender = () => {
    if (!App.inContext(NS)) return

    if (!storyStarted) {
        storyStarted = true
        setTimeout(game.startGameAsync, 0)
    }
}
