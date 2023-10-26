import * as App from "../../core/app.js"
import { waitforMsecAsync } from "../../utils.js"
import { UI } from "./game-ui.js"
import { Game } from "./game-loop.js"

export const NS = "GSTORY"

let storyStarted = false
let buttonClicked = false



const ui = new UI()
const game = new Game(ui)


export const ux = ui;


const myLayout = (uirender: string) => {
    return `
    ${uirender}
`
}

export const fetch = (args: string[] | undefined) => {
    App.prepareRender(NS, "Story")
    App.render()
}

export const render = () => {
    if (!App.inContext(NS)) return ""

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
