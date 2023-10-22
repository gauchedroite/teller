
import * as App from "../../core/app.js"
import * as Router from "../../core/router.js"
import * as Misc from "../../core/misc.js"
import { waitAsync } from "../../utils.js"
import { UI } from "../game-ui.js"
import { Game } from "../game-loop.js"

export const NS = "Game_story"

let storyStarted = false
let buttonClicked = false


const myLayout = () => {
    return `
<div style="width:100vw; height:100vh; background-color:whitesmoke;">
    <a href="#/">Home</a><br>

    <button onclick="${NS}.onButtonClick()">Continue</button>
</div>
`
}



export const fetch = (args: string[] | undefined) => {
    App.prepareRender(NS, "Story")
    App.render()
}



export const render = () => {
    if (!App.inContext(NS)) return ""

    return myLayout()
}

export const postRender = () => {
    if (!App.inContext(NS)) return

    if (!storyStarted) {
        storyStarted = true
        setTimeout(startStoryLoopAsync, 0)
    }
}


export const onButtonClick = () => {
    buttonClicked = true;
}


const waitUserInput = async () => {
    while (!buttonClicked)
        await waitAsync(20)
    buttonClicked = false
}

const startStoryLoopAsync = async () => {
    console.log("Waiting")
    await waitUserInput()
    console.log("Waiting done")
}




const ui = new UI()
const game = new Game(ui, true)
//game.initialize()
