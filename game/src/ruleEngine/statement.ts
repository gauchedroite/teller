

export class Statement {
    k: number = Number.MIN_VALUE;
    v: number = Number.MIN_VALUE;
}

export interface IStatementIterator {
    initIterator(): void;
    next(): void;
    getstate(): Statement;
    getdone(): boolean;
}
