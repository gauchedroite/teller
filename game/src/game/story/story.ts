import * as App from "../../core/app.js"
import { UI } from "./game-ui.js"
import { Game } from "./game-loop.js"

export const NS = "GSTORY"

let storyStarted = false



let ui: UI
let game: Game



const fetchState = async (id: string) => {
    ui = new UI()
    game = new Game(id, ui)
}

export const fetch = async (args: string[] | undefined) => {
    App.prepareRender(NS, "Story", "game_story")

    if (args != undefined && args.length > 0) {
        const name = args[0]
        const action = args[1];
        if (action == "restart") {
            game?.clearAllGameData()
            storyStarted = false;
            (<any>document).location = `#/story/${name}`;
            location.reload();
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
        setTimeout(game.startGameAsync, 0)
    }
}
