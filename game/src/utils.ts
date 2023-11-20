
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



export async function waitforMsecAsync(msec: number) {
    return new Promise(resolve => setTimeout(resolve, msec));
}

export async function waitforClickAsync(content: Element, msec: number = 20, ontick?: () => any) {
    content.addEventListener("click", function onclick() {
        content.removeEventListener("click", onclick);
        clicked = true;
    });

    let clicked: unknown = undefined
    return waitforValueAsync(() => clicked, ontick)
}

export async function waitforAnyClickAsync(contents: Element[], msec: number = 20, ontick?: () => any) {

    let indexClicked: unknown = undefined;
    const onChoice = (i: number) => () => { indexClicked = i };

    for (var i = 0; i < contents.length; i++) {
        contents[i].addEventListener("click", onChoice(i));
    }

    await waitforValueAsync(() => indexClicked, ontick)

    for (var i = 0; i < contents.length; i++) {
        contents[i].removeEventListener("click", onChoice(i));
    }
}

export async function waitforValueAsync(getValue: () => unknown, ontick?: () => any) {
    while (true) {
        const value = getValue()
        if (value != undefined)
            break
        await waitforMsecAsync(20)
        if (ontick != undefined) ontick()
    }
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



export function deepFreeze(object: any) {
    const propNames = Reflect.ownKeys(object);
  
    // Freeze properties before freezing self
    for (const name of propNames) {
        const value = object[name];
        if ((value && typeof value === "object") || typeof value === "function") {
            deepFreeze(value);
        }
    }
  
    return Object.freeze(object);
  }
