import { startup } from "./main.js"
import { Sample as ruleEngineSample } from "./ruleEngine/_sample.js"
import { Sample as dslEngineSample } from "./dslEngine/_sample.js"

declare const FastClick: any;



FastClick.attach(document.body);


const onresize = () => {
    const portrait = window.innerWidth < window.innerHeight;
    document.body.classList.remove("portrait", "landscape");
    document.body.classList.add(portrait ? "portrait" : "landscape");
};
addEventListener("resize", onresize);
onresize();


startup()



//ruleEngineSample.run1()
//dslEngineSample.run1()
