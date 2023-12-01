
import * as App from "../../core/app.js"
import * as Router from "../../core/router.js"
import * as Misc from "../../core/misc.js"
import WebglRunner from "../webgl-runner.js"

export const NS = "GMENU"


let gameid: string = "";
let runner: WebglRunner | undefined = undefined;


const myLayout = (id: string) => {
    return `
<canvas id="menu_canvas" class="full-viewport"></canvas>
<div id="game_menu">
    <a href="#/story/${id}" style="color:whitesmoke;">Continuer</a><br>
    <a href="#/story/${id}/restart" style="color:whitesmoke;">Restart</a><br>
    <a href="#/editor/${id}" style="color:whitesmoke;">Editeur</a><br>
    <a href="#/" style="color:whitesmoke;">Index</a><br>
</div>
`
}

const vertexShader = () => {
    return `
    attribute vec3 a_square;
    void main() {
        gl_Position = vec4(a_square, 1.0);
    }
`
}

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
`
}



export const fetch = (args: string[] | undefined) => {
    gameid = (args ? args[0] : "");
    App.prepareRender(NS, "Menu", "game_menu")
    App.render()
}



export const render = () => {
    if (!App.inContext(NS)) return ""

    return myLayout(gameid)
}

export const postRender = () => {
    if (!App.inContext(NS)) return

    if (runner == undefined) {
        setTimeout(() => {
            const canvas = <HTMLCanvasElement>document.getElementById("menu_canvas")
            runner = new WebglRunner()
            runner.run(canvas, fragmentShader(), vertexShader())
        }, 0);
    }
}


window.addEventListener("hashchange", () => {
    let hash = window.location.hash;
    if (hash.length == 0)
        hash = `#/menu/${gameid}`;

    if (hash == `#/menu/${gameid}`)
        runner?.resume()
    else
        runner?.pause()
})
