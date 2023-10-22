
import * as App from "../core/app.js"
import * as Router from "../core/router.js"
import * as Misc from "../core/misc.js"
import { IGameData, IAction } from "../game/igame-data.js"
import gdata from "../game/game-data.js"
import GameHelper from "../game/game-helper.js"

export const NS = "Game_editor";

const SAVEFILE_KEY = "Teller"


let state = <IGameData>{};


interface GIDs {
    gameid: number | null
    sits: boolean
    sitid: number | null
    scenes: boolean
    sceneid: number | null
    moments: boolean
    momentid: number | null
    actions: boolean
    actionid: number | null
}
let gids: GIDs;
let modalWhat: string | null;
let state_json: string;



const myInputRow = (id: string, value: string, label: string | null, ph: string | null = null) => {
    return `
    <div class="item-content">
        <div class="item-inner">
            ${label ? `<div class="item-title label">${label}</div>` : ""}
            <div class="item-input">
                <input type="text" placeholder="${ph ?? ""}" value="${value ?? ""}" id="${NS}_${id}" onclick="${NS}.onchange(this)">
            </div>
        </div>
    </div>
    `
}

const myInputAreaRow = (id: string, value: string, ph: string | null = null, style: string | null = null) => {
    return `
    <div class="item-content">
    <div class="item-inner">
        <div class="item-input">
            <textarea placeholder="${ph ?? ""}" spellcheck="false" style="${style ?? ""}font-family: monospace; font-size: small;" id="${NS}_${id}" onclick="${NS}.onchange(this)">${value ?? ""}</textarea>
        </div>
    </div>
    </div>
    `
}

const mySelectRow = (label: string, url: string, disabled = false, text: string | null = null, subtitle: string | null = null) => {
    return `
    <a href="${url}" class="item-link" ${disabled ? "disabled" : ""}>
        <div class="item-content">
            <div class="item-inner">
                <div class="item-title">${label}</div>
                ${subtitle ? `<div class="item-subtitle">${subtitle}</div>` : ""}
                ${text ? `<div class="item-text">${text}</div>` : ""}
            </div>
        </div>
    </a>
`
}



const layoutCol_Game = () => {
    return `
    <div class="content-block-title">Game Info</div>
    <div class="list-block">
        <ul>
            <li>${myInputRow("game_name", state.game.name, "Name", "Game name", )}</li>
            <li>${myInputRow("game_initialstate", state.game.initialstate, "State", "Initial state", )}</li>
            <li>${myInputAreaRow("game_text", state.game.text, "details")}</li>
        </ul>
    </div>

    <div class="content-block-title">Game Objects</div>
    <div class="list-block">
        <ul>
            <li>${mySelectRow("Situations", `#/editor/gameid=${gids.gameid}/sits`)}</li>
            <li>${mySelectRow("Actors", `#/editor/gameid=${gids.gameid}/actors`, true)}</li>
            <li>${mySelectRow("State", `#/editor/gameid=${gids.gameid}/state`, true)}</li>
        </ul>
    </div>

    <div class="content-block-title">Game Data</div>
    <div class="list-block">
        <ul>
            <li>${myInputAreaRow("state_json", state_json)}</li>
        </ul>
    </div>
    <div style="display:flex; justify-content:flex-end;">
        <button onclick="${NS}.getState()" style="margin:0.5rem 0;">Get</button>
        <button onclick="${NS}.saveState()" style="margin:0.5rem 0.75rem;">Save</button>
    </div>
`
}

const layoutCol_Situations = () => {
    const sits = state.situations.filter(one => one.gameid == 0)
    const lines = sits.map(one => `<li>${mySelectRow(`${one.name}`, `#/editor/gameid=${gids.gameid}/sitid=${one.id}`, false, one.when)}</li>`)

    return `
    <div class="content-block-title">
        <div>Situations</div>
        <div><a href="#" onclick="${NS}.addSituation();return false;"><i title="New Situation" class="fa-regular fa-video-plus"></i></a></div>
    </div>
    <div class="list-block media-list">
        <ul>${lines.join("")}</ul>
    </div>
`
}

const layoutCol_Situation = () => {
    const sitid = gids.sitid

    const sit = state.situations.find(one => one.id == sitid)
    if (!sit)
        return "";

    const scenes = state.scenes.filter(one => one.sitid == sitid)
    const scenelines = scenes.map(one => {
        const selected = one.id == gids.sceneid
        return `<li ${selected ? `class="ted-selected"` : ""}>${mySelectRow(`${one.name}`, `#/editor/gameid=${gids.gameid}/sceneid=${one.id}`)}</li>`
    })

    const actors = state.actors.filter(one => one.sitid == sitid)
    const actorlines = actors.map(one => `<li>${mySelectRow(`${one.name}`, `#/editor/gameid=${gids.gameid}/actorid=${one.id}`, true)}</li>`)
            
    return `
    <div class="content-block-title">
        <div>Situation</div>
        <div><a href="#" onclick="${NS}.openModal('sitid');return false;"><i title="Delete Situation" class="fa-regular fa-trash"></i></a></div>
    </div>
    <div class="list-block">
        <ul>
            <li>${myInputRow("sit_name", sit.name, "Name", "Name", )}</li>
            <li>${myInputRow("sit_when", sit.when, "When", "Condition", )}</li>
            <li>${myInputAreaRow("sit_text", sit.text, "details")}</li>
        </ul>
    </div>

    <div class="content-block-title">
        <div>Scenes</div>
        <div><a href="#" onclick="${NS}.addScene();return false;"><i title="New Scene" class="fa-regular fa-camera"></i></a></div>
    </div>
    <div class="list-block media-list">
        <ul>${scenelines.join("")}</ul>
    </div>
    
    <div class="content-block-title">
        <div>Actors</div>
        <!--<div><i title="New Actor" class="fa-regular fa-user-plus"></i></div>-->
    </div>
    <div class="list-block media-list">
        <ul>${actorlines.join("")}</ul>
    </div>
`
}

const layoutCol_Scene = () => {
    const sceneid = gids.sceneid

    const scene = state.scenes.find(one => one.id == sceneid)
    if (!scene)
        return "";

    const moments = gdata.getMomentsOf(scene)
    const momlines = moments.map(one => {
        const selected = one.id == gids.momentid
        const commands = GameHelper.getCommands(one.text).join("<br>")
        return `<li ${selected ? `class="ted-selected"` : ""}>${mySelectRow(`${one.when}`, `#/editor/gameid=${gids.gameid}/momentid=${one.id}`, false, commands)}</li>`
    })

    const actions = gdata.getActionsOf(scene)
    const actlines = actions.map(one => {
        const selected = one.id == gids.actionid
        const commands = GameHelper.getCommands(one.text).join("<br>")
        return `<li ${selected ? `class="ted-selected"` : ""}>${mySelectRow(`${one.when}`, `#/editor/gameid=${gids.gameid}/actionid=${one.id}`, false, commands, one.name)}</li>`
    })
    
    return `
    <div class="content-block-title">
        <div>Scene</div>
        <div><a href="#" onclick="${NS}.openModal('sceneid');return false;"><i title="Delete Scene" class="fa-regular fa-trash"></i></a></div>
    </div>
    <div class="list-block">
        <ul>
            <li>${myInputRow("scene_name", scene.name, null, "Game name", )}</li>
            <li>${myInputAreaRow("scene_text", scene.text, "details")}</li>
        </ul>
    </div>

    <div class="content-block-title">
        <div>Moments</div>
        <div><a href="#" onclick="${NS}.addMoment();return false;"><i title="New Moment" class="fa-regular fa-clock"></i></a></div>
    </div>
    <div class="list-block media-list">
        <ul>${momlines.join("")}</ul>
    </div>

    <div class="content-block-title">
        <div>Actions</div>
        <div><a href="#" onclick="${NS}.addAction();return false;"><i title="New Action" class="fa-regular fa-bolt"></i></a></div>
    </div>
    <div class="list-block media-list">
        <ul>${actlines.join("")}</ul>
    </div>
`
}

const layoutCol_Moment = () => {
    const momentid = gids.momentid

    const moment = state.moments.find(one => one.id == momentid)
    if (!moment)
        return "";
    
    return `
    <div class="content-block-title">
        <div>Moment</div>
        <div><a href="#" onclick="${NS}.openModal('momentid');return false;"><i title="Delete Moment" class="fa-regular fa-trash"></i></a></div>
    </div>
    <div class="list-block">
        <ul>
            <li>${myInputRow("moment_when", moment.when, "When", "Condition", )}</li>
        </ul>
    </div>

    <div class="content-block-title"></div>
    <div class="list-block">
    <ul>
        <li>${myInputAreaRow("moment_text", moment.text, "Your story moment here", "height:calc(100vh - 200px); resize:vertical;")}</li>
    </ul>
</div>
    `
}

const layoutCol_Action = () => {
    const actionid = gids.actionid

    const action = state.moments.find(one => one.id == actionid) as IAction
    if (!action)
        return "";
    
    return `
    <div class="content-block-title">
        <div>Action</div>
        <div><a href="#" onclick="${NS}.openModal('actionid');return false;"><i title="Delete Action" class="fa-regular fa-trash"></i></a></div>
    </div>
    <div class="list-block">
        <ul>
            <li>${myInputRow("action_when", action.when, "When", "Condition", )}</li>
            <li>${myInputRow("action_name", action.name, null, "Name", )}</li>
        </ul>
    </div>

    <div class="content-block-title"></div>
    <div class="list-block">
    <ul>
        <li>${myInputAreaRow("action_text", action.text, "Your story action here", "height:calc(100vh - 200px); resize:vertical;")}</li>
    </ul>
</div>
    `
}

const layout_Modal = () => {
    if (modalWhat == undefined)
        return ""

    return `
    <div class="modal-overlay modal-overlay-visible" onclick="${NS}.cancelModal()"></div>
    <div class="modal" style="display: block; margin-top: -62px;">
        <div class="modal-inner">
            <div class="modal-title">Delete Game Object</div>
            <div class="modal-text">Are you sure?</div>
        </div>
        <div class="modal-buttons modal-buttons-2">
            <span class="modal-button" onclick="${NS}.cancelModal()">Cancel</span>
            <span class="modal-button modal-button-bold" onclick="${NS}.executeModal()">OK</span>
        </div>
    </div>
`
}


const pageLayout = (map: Map<string, string>, modal: string) => {
    const pages: string[] = []
    map.forEach((value, key) => pages.push(`<div class="page page-${key}">${value}</div>`)) //) cols.map(one => `<div class="page">${one}</div>`)
    return `
<div class="pages">
    ${pages.join("")}
</div>
${modal}
    `
}



const parseArgs = (args: string[] | undefined) => {
    gids = <GIDs> {}

    args?.forEach(one => {
        const parts = one.split("=")

        if ((parts.length ?? 0) == 1) {
            if (parts[0] == "sits")
                gids.sits = true
            else if (parts[0] == "scenes")
                gids.scenes = true
            else if (parts[0] == "moments")
                gids.moments = true
            else if (parts[0] == "actions")
                gids.actions = true
        }
        else if ((parts.length ?? 0) == 2) {
            const id = +parts[1]

            if (parts[0] == "gameid")
                gids.gameid = id
            else if (parts[0] == "sitid")
                gids.sitid = id
            else if (parts[0] == "sceneid") {
                gids.sceneid = id
                const scene = state.scenes.find(one => one.id == gids.sceneid)
                gids.sitid = scene?.sitid!
            }
            else if (parts[0] == "momentid") {
                gids.momentid = id
                const moment = state.moments.find(one => one.id == gids.momentid)

                gids.sceneid = moment?.parentid!
                const scene = state.scenes.find(one => one.id == gids.sceneid)
                gids.sitid = scene?.sitid!
            }
            else if (parts[0] == "actionid") {
                gids.actionid = id
                const action = state.moments.find(one => one.id == gids.actionid)

                gids.sceneid = action?.parentid!
                const scene = state.scenes.find(one => one.id == gids.sceneid)
                gids.sitid = scene?.sitid!
            }
        }
        
        gids.gameid = 0//////////
    })
}

const fetchState = (args: string[] | undefined) => {
    state = gdata.select_Game()
    parseArgs(args)
    return Promise.resolve()
}

const refresh = () => {
    state = gdata.select_Game()
    App.render()
}

export const fetch = (args: string[] | undefined) => {
    App.prepareRender(NS, "Editor");
    Router.registerDirtyExit(null);
    fetchState(args)
        .then(App.render)
        .catch(App.render)
};



export const render = () => {
    if (!App.inContext(NS)) return "";

    const map = new Map()

    if (gids.gameid != undefined)
        map.set("game", layoutCol_Game())

    if (gids.sits ?? false)
        map.set("sits", layoutCol_Situations())

    if (gids.sitid != undefined)
        map.set("sit", layoutCol_Situation())

    if (gids.sceneid != undefined)
        map.set("sceneid", layoutCol_Scene())

    if (gids.momentid != undefined)
        map.set("momentid", layoutCol_Moment())

    if (gids.actionid != undefined)
        map.set("actionid", layoutCol_Action())

    const modal = layout_Modal()

    return pageLayout(map, modal)
}

export const postRender = () => {
    if (!App.inContext(NS)) return;

    if (modalWhat == undefined)
        return;

    setTimeout(() => {
        const modalOverlay = document.querySelector(".modal") as HTMLElement;
        if (modalOverlay && !modalOverlay.classList.contains("modal-in"))
            modalOverlay.classList.add("modal-in")
    }, 10);
}


const getFormState = () => {
    let clone = Misc.clone(state) as IGameData

    clone.game.name = Misc.fromInputText(`${NS}_game_name`, state.game.name)!
    clone.game.initialstate = Misc.fromInputText(`${NS}_game_initialstate`, state.game.initialstate)!
    clone.game.text = Misc.fromInputText(`${NS}_game_text`, state.game.text)!

    if (gids.sitid) {
        const sit = state.situations.find(one => one.id == gids.sitid)!
        const clone_sit = clone.situations.find(one => one.id == gids.sitid)!
        clone_sit.name = Misc.fromInputText(`${NS}_sit_name`, sit.name)!
        clone_sit.when = Misc.fromInputText(`${NS}_sit_when`, sit.when)!
        clone_sit.text = Misc.fromInputText(`${NS}_sit_text`, sit.text)!
    }

    if (gids.sceneid) {
        const scene = state.scenes.find(one => one.id == gids.sceneid)!
        const clone_scene = clone.scenes.find(one => one.id == gids.sceneid)!
        clone_scene.name = Misc.fromInputText(`${NS}_scene_name`, scene.name)!
        clone_scene.text = Misc.fromInputText(`${NS}_scene_text`, scene.text)!
    }

    if (gids.momentid) {
        const moment = state.moments.find(one => one.id == gids.momentid)!
        const clone_moment = clone.moments.find(one => one.id == gids.momentid)!
        clone_moment.when = Misc.fromInputText(`${NS}_moment_when`, moment.when)!
        clone_moment.text = Misc.fromInputText(`${NS}_moment_text`, moment.text)!
    }

    if (gids.actionid) {
        const action = state.moments.find(one => one.id == gids.actionid)! as IAction
        const clone_action = clone.moments.find(one => one.id == gids.actionid)! as IAction
        clone_action.when = Misc.fromInputText(`${NS}_action_when`, action.when)!
        clone_action.name = Misc.fromInputText(`${NS}_action_name`, action.name)!
        clone_action.text = Misc.fromInputText(`${NS}_action_text`, action.text)!
    }

    return clone;
};

export const onchange = (input: HTMLInputElement) => {
    state = getFormState();
    gdata.update_Game(state)
    App.render();
};


export const openModal = (what: string) => {
    modalWhat = what
    App.renderOnNextTick()
}

export const cancelModal = () => {
    modalWhat = null
    App.renderOnNextTick()
}

export const executeModal = () => {
    const what = modalWhat
    modalWhat = null

    if (what == "sitid") {
        gdata.deleteSituation(gids.sitid!)
        Router.goto(`#/editor/gameid=${gids.gameid}`)
    }
    else if (what == "sceneid") {
        gdata.deleteScene(gids.sceneid!)
        Router.goto(`#/editor/gameid=${gids.gameid}/sitid=${gids.sitid}`)
    }
    else if (what == "momentid") {
        gdata.deleteSceneMoment(gids.momentid!)
        Router.goto(`#/editor/gameid=${gids.gameid}/sceneid=${gids.sceneid}`)
    }
    else if (what == "actionid") {
        gdata.deleteAction(gids.actionid!)
        Router.goto(`#/editor/gameid=${gids.gameid}/sceneid=${gids.sceneid}`)
    }
}



export const addSituation = () => {
    const id = gdata.addSituation(gids.gameid!)
    Router.goto(`#/editor/gameid=${gids.gameid}/sitid=${id}`)
}

export const addScene = () => {
    const id = gdata.addScene(gids.sitid!)
    Router.goto(`#/editor/gameid=${gids.gameid}/sceneid=${id}`)
}

export const addMoment = () => {
    const id = gdata.addMoment(gids.sceneid!)
    Router.goto(`#/editor/gameid=${gids.gameid}/momentid=${id}`)
}

export const addAction = () => {
    const id = gdata.addAction(gids.sceneid!)
    Router.goto(`#/editor/gameid=${gids.gameid}/actionid=${id}`)
}


export const getState = () => {
    state = gdata.select_Game();
    delete state.me;
    delete state.meid;
    state_json = JSON.stringify(state);
    refresh()
}

export const saveState = () => {
    const element = document.getElementById(`${NS}_state_json`)! as HTMLInputElement
    state_json = element.value.replace(/\n/g, "\\n")
    gdata.load_Game(state_json)
    refresh()
}
