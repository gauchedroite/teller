import { startup } from "./main.js"
import { Sample } from "./ruleEngine/sample.js"

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

Sample.run1()

