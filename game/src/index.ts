import * as App from "./core/app.js"
import * as Layout from "./layout.js"
import * as router from "./core/router.js"
//
import * as GameMain from "./game/main.js"
import * as EditorMain from "./editor/main.js"

export const NS = "GINDEX";


declare const FastClick: any;
FastClick.attach(document.body);


// Global reference to the app. Used for some event handlers.
(window as any)[App.NS] = App;




const fetch = (args: string[] | undefined) => {
    App.prepareRender(NS, "Index", "game_index")
    App.render()
}

export const render = () => {
    if (!App.inContext(NS)) return "";

    return `
    <div><a href="#/story/moon-limbo">Moon Limbo</a></div>
    <div><a href="#/story/coudon">Coudon</a></div>
`
}

export const postRender = () => { }





// Resize window
const onresize = () => {
    const portrait = window.innerWidth < window.innerHeight;
    document.body.classList.remove("portrait", "landscape");
    document.body.classList.add(portrait ? "portrait" : "landscape");
};
addEventListener("resize", onresize);
onresize();


// Initialize the app and configure routes
await App.initialize(Layout.render, Layout.postRender, "Teller");
EditorMain.startup();
GameMain.startup();

// Add a catchall route
router.addRoute("^#/(.*)$", params => fetch(params));
