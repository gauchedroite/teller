
// Turn strings into numbers
export default class Symbols {
    private static keys: any = {};
    private static strings = new Array<string>();
    private static keyCount: number = 0;
    
    static add(key: string): number {
        if (this.keys[key] != undefined)
            return this.keys[key];
        var id = Symbols.keyCount++;
        this.keys[key] = id;
        this.strings.push(key);
        return id;
    }

    static getId(key: string): number {
        return this.keys[key];
    }

    static getById(id: number): string {
        return this.strings[id];
    }

    static clear(): void {
        this.keys = {};
        this.strings = new Array<string>();
        this.keyCount = 0;
    }
}
