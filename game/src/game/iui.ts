
import { IMetadata, ISceneData, IMomentData } from "./igame.js"
import { IGameInstance } from "./iinstance.js"

export enum ChoiceKind {
    scene,
    action,
    messageTo,
    messageFrom
}

export interface IChoice {
    kind: ChoiceKind
    id: number
    text: string
    subtext?: string
    metadata: IMetadata
}

export interface IUI {
    alert: (text: string, canclose: () => boolean, onalert: () => void) => void,
    showChoices: (sceneChoices: Array<IChoice>, onchoice: (chosen: IChoice) => void) => void,
    hideChoices: (callback: () => void) => void,
    initScene: (data: ISceneData, callback: () => void) => void,
    addBlurb: (chunk: IMomentData, callback: (result?: any) => void) => void,
    addBlurbFast: (chunk: IMomentData, callback: () => void) => void,
    clearBlurb: () => void
    addChildWindow: (value: string, callback: (game: IGameInstance) => void) => void
}
