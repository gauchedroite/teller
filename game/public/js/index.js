import { startup } from "./main.js";
FastClick.attach(document.body);
const onresize = () => {
    const portrait = window.innerWidth < window.innerHeight;
    document.body.classList.remove("portrait", "landscape");
    document.body.classList.add(portrait ? "portrait" : "landscape");
};
addEventListener("resize", onresize);
onresize();
startup();
//# sourceMappingURL=index.js.map