
export enum ChunkKind {
    dialog,
    text,
    background,
    inline,
    heading,
    doo,
    minigame,
    gameresult,
    waitclick,
    title,
    style
}
export interface IChunkKind {
    kind: ChunkKind
}
export interface IDialog extends IChunkKind {
    kind: ChunkKind
    actor: string
    parenthetical: string
    lines: Array<string>
    metadata: IMetadata | null
}
export interface IText extends IChunkKind {
    kind: ChunkKind
    lines: Array<string>
}
export interface IBackground extends IChunkKind {
    kind: ChunkKind
    asset: string
    wide: boolean
    metadata: IMetadata
}
export interface IInline extends IChunkKind {
    kind: ChunkKind
    image: string
    metadata: IMetadata
}
export interface IHeading extends IChunkKind {
    kind: ChunkKind
    title: string
    subtitle: string
    metadata: IMetadata
}
export interface IDo extends IChunkKind {
    kind: ChunkKind
    text: string
    metadata: IMetadata
}
export interface IMiniGame extends IChunkKind {
    kind: ChunkKind
    text: string
    url: string
    winText: string
    winCommand: string
    loseText: string
    loseCommand: string
}
export interface IGameResult extends IChunkKind {
    kind: ChunkKind
    text: string
}
export interface IWaitClick extends IChunkKind {
    kind: ChunkKind
}
export interface ITitle extends IChunkKind {
    kind: ChunkKind
    text: string
}
export interface IStyle extends IChunkKind {
    kind: ChunkKind
    metadata: IMetadata
}

export type IMomentData = IDialog | IText | IBackground | IInline | IHeading | IDo | IMiniGame | IGameResult | IWaitClick | ITitle | IStyle;

export enum Op {
    START_BLURBING,         //0
    BLURB,                  //1
    BUILD_CHOICES,          //2
}

export interface IOptions {
    skipFileLoad: boolean,
    skipMenu: boolean,
    syncEditor: boolean,
    fastStory: boolean
}

export interface ISceneData {
    title: string,
    image: string
}

export enum OpAction {
    SHOWING_CHOICES,
    GAME_START,
    SHOWING_MOMENT
}

export interface IMetadata {
    class: string,
    style: string,
    css: string
    image: string
}