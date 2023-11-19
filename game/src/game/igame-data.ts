
export enum Kind {
    Moment,
    Action,
    MessageTo,
    MessageFrom
}

export enum AKind {
    Player,
    NPC
}

export interface IGameMeta {
    name: string
    initialstate: string
    text: string
}

export interface ISituation {
    id: number
    gameid: number
    name: string
    when: string
    text: string
    sids: Array<number>
    aids: Array<number>
    aid: number
}

export interface IScene {
    id: number
    sitid: number
    name: string
    text: string
    mids: Array<number>
}

export interface IActor {
    kind: AKind
    id: number
    sitid: number
    name: string
    text: string
    mids: Array<number>
}

export interface IMoment {
    kind: Kind
    id: number
    parentid: number
    when: string
    text: string
}

export interface IAction extends IMoment {
    name: string
}

export interface IMessageTo extends IMoment {
    name: string
    to: number
}

export interface IMessageFrom extends IMoment {
}

export interface IGameData {
    game: IGameMeta
    situations: Array<ISituation>
    scenes: Array<IScene>
    actors: Array<IActor>
    moments: Array<IMoment>
    me: any
    meid?: number
}