import { IMoment } from "./igame-data.js"


export interface IGameInstance {
    initialize: (source: string, parent: IGameInstance) => void
    startGame: () => void
    resumeGame: () => void
    clearAllGameData: () => void
    tick: () => boolean
    doUIAction: (payload: any) => void
}

export interface IGameManInstance {
    raiseActionEvent: (op: any, param?: any) => void
    showMenu: () =>  void
}

export interface IEditorInstance {
    initialize: () => void
    preprocess: (content: string, url: any, next: any) => void
    setup: (app: any, leftView: any, centerView: any, rightView: any) => void
    gotoMoment: (moment: IMoment) => void
}
