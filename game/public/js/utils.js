export function d6() {
    return Math.floor(Math.random() * 6) + 1;
}
export function d6x2() {
    return (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1);
}
export function d3() {
    return Math.floor(Math.random() * 3) + 1;
}
export function clamp6(roll) {
    return Math.min(Math.max(roll, 1), 6);
}
export function clamp12(roll) {
    return Math.min(Math.max(roll, 1), 12);
}
export async function waitAsync(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}
export function emitEvent(name, detail) {
    const event = new CustomEvent(name, { detail });
    document.dispatchEvent(event);
}
export function log(...data) {
    const timeOnly = new Date().toISOString().substring(11).replace("Z", " --");
    console.log(timeOnly, ...data);
}
//# sourceMappingURL=utils.js.map