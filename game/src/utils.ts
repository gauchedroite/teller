
export function d6 () {
    return Math.floor(Math.random() * 6) + 1;
}

export function d6x2 () {
    return (Math.floor(Math.random() * 6) + 1) + ( Math.floor(Math.random() * 6) + 1);
}

export function d3 () {
    return Math.floor(Math.random() * 3) + 1;
}

export function clamp6(roll: number) {
    return Math.min(Math.max(roll, 1), 6)
}

export function clamp12(roll: number) {
    return Math.min(Math.max(roll, 1), 12)
}

export async function waitAsync(msec: number) {
    return new Promise(resolve => setTimeout(resolve, msec));
}

export function emitEvent(name: string, detail?: any) {
    const event = new CustomEvent(name, { detail });
    document.dispatchEvent(event);
}

export function log(...data: any[]) {
    const timeOnly = new Date().toISOString().substring(11).replace ("Z", " --")
    console.log(timeOnly, ...data)
}

export function isObjectEmpty (objectName: any) {
    return Object.keys(objectName).length === 0
}
