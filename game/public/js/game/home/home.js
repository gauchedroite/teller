"use strict";
import * as App from "../../core/app.js";
import WebglRunner from "../webgl-runner.js";
export const NS = "Game_home";
let runner = undefined;
const myLayout = () => {
    return `
<div>
    <a href="#/story" style="color:whitesmoke;">Continuer</a><br>
    <a href="#/story/new" style="color:whitesmoke;">Nouvelle partie</a><br>
    <a href="#/editor" style="color:whitesmoke;">Editeur</a><br>
</div>
`;
};
const vertexShader = () => {
    return `
    attribute vec3 a_square;
    void main() {
        gl_Position = vec4(a_square, 1.0);
    }
`;
};
const fragmentShader = () => {
    return `
    precision mediump float;
    uniform float time;
    uniform vec2 resolution;

    mat2 m = mat2( 0.90,  0.110, -0.70,  1.00 );

    float hash( float n ) {
        return fract(sin(n)*758.5453);
    }

    float noise( in vec3 x ) {
        vec3 p = floor(x);
        vec3 f = fract(x); 
        float n = p.x + p.y*57.0 + p.z*800.0;
        float res = mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x), mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y),
                mix(mix( hash(n+800.0), hash(n+801.0),f.x), mix( hash(n+857.0), hash(n+858.0),f.x),f.y),f.z);
        return res;
    }

    float fbm( vec3 p ) {
        float f = 0.0;
        f += 0.50000*noise( p ); p = p*2.02;
        f -= 0.25000*noise( p ); p = p*2.03;
        f += 0.12500*noise( p ); p = p*2.01;
        f += 0.06250*noise( p ); p = p*2.04;
        f -= 0.03125*noise( p );
        return f/0.984375;
    }

    float cloud(vec3 p) {
        p -= fbm(vec3(p.x,p.y,0.0)*0.5)*2.25;
        
        float a = 0.0;
        a -= fbm(p*3.0)*2.2-1.1;
        return a * a;
    }

    vec3 f2(vec3 c) {
        c += hash(gl_FragCoord.x+gl_FragCoord.y*9.9)*0.01;
        c *= 0.7-length(gl_FragCoord.xy / resolution.xy -0.5)*0.7;
        float w = length(c);
        c = mix(c*vec3(1.0,1.0,1.6), vec3(w,w,w)*vec3(1.4,1.2,1.0), w*1.1-0.2);
        return c;
    }

    void main( void ) {
        vec2 position = (gl_FragCoord.xy / resolution.xy);
        position.y += 0.2;

        vec2 coord= vec2((position.x-0.5)/position.y,1.0/(position.y+0.2));
        coord += time * 0.015;

        float q = cloud(vec3(coord*1.0,0.222));

        vec3 col = vec3(0.2,0.7,0.8) + vec3(q*vec3(0.2,0.4,0.1));
        gl_FragColor = vec4( f2(col), 1.0 );
    }
`;
};
export const fetch = (args) => {
    App.prepareRender(NS, "Home");
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
    if (runner == undefined) {
        const canvas = document.getElementById("canvas");
        runner = new WebglRunner();
        runner.run(canvas, fragmentShader(), vertexShader());
    }
};
window.addEventListener("hashchange", () => {
    let hash = window.location.hash;
    if (hash.length == 0)
        hash = "#/";
    if (hash == "#/")
        runner === null || runner === void 0 ? void 0 : runner.resume();
    else
        runner === null || runner === void 0 ? void 0 : runner.pause();
});
//# sourceMappingURL=home.js.map