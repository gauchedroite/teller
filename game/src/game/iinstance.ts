import { IMoment } from "./igame-data.js"


export interface IGameInstance {
    runGameAsync: () => void
    eraseGame: () => void
}

export interface IEditorInstance {
    initialize: () => void
    preprocess: (content: string, url: any, next: any) => void
    setup: (app: any, leftView: any, centerView: any, rightView: any) => void
    gotoMoment: (moment: IMoment) => void
}
