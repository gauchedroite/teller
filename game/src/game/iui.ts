
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
    alertAsync: (text: string, ready: boolean) => Promise<void>,
    showChoicesAsync: (sceneChoices: Array<IChoice>) => Promise<IChoice>,
    hideChoicesAsync: () => Promise<void>,
    initSceneAsync: (data: ISceneData) => Promise<void>,
    addBlurbAsync: (chunk: IMomentData) => Promise<any>,
    addBlurbFast: (chunk: IMomentData) => void,
    clearBlurb: () => void
    addChildWindow: (value: string, callback: (game: IGameInstance) => void) => void
}
