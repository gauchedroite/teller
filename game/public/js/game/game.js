"use strict";
import * as App from "../core/app.js";
export const NS = "Game_runner";
const myLayout = () => {
    return `
    <div class="game-body">
        <div class="wbg">
            <div class="wbg-inner">
                <iframe></iframe>
            </div>
        </div>
    </div>

    <div class="game-story">
        <div class="bg">
            <div class="bg-inner">
                <iframe></iframe>
            </div>
            <div class="game">
                <iframe></iframe>
            </div>
        </div>

        <div class="story">
            <div class="navbar">
                <div class="navbar-inner">
                    <div class="goto-menu">
                        <i class="icon ion-navicon-round"></i> 
                    </div>
                    <div class="title">
                        <div class="title-inner"></div>
                    </div>
                </div>
            </div>
            <div class="story-inner">
                <div class="content">
                    <article></article>
                </div>
                <div class="choice-panel">
                </div>
                <div class="modal">
                    <div class="modal-inner">
                        <span></span>
                        <div class="minimizer"><i class="ion ion-arrow-down-b"></i></div>
                    </div>
                </div>
                <div class="heading">
                    <div class="heading-inner"></div>
                </div>
            </div>
        </div>

        <div class="story-window hidden">
        </div>

        <div class="preloader">
            <div class="loader-ring">
                <div class="loader-ring-light"></div>
                <div class="loader-ring-track"></div>
            </div>
        </div>
    </div>
`;
};
export const fetch = (args) => {
    App.prepareRender(NS, "Runner");
    // Router.registerDirtyExit(null)
    // fetchState(args)
    //     .then(App.render)
    //     .catch(App.render)
    App.render();
};
export const render = () => {
    if (!App.inContext(NS))
        return "";
    return myLayout();
};
export const postRender = () => {
    if (!App.inContext(NS))
        return;
};
//# sourceMappingURL=game.js.map