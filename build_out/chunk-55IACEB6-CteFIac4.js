import { _ as a, e } from "./mermaid-LQXJBOYN-DZHv-CM8.js";
var g = a((o, t) => {
  let n;
  return (
    t === "sandbox" && (n = e("#i" + o)),
    (t === "sandbox" ? e(n.nodes()[0].contentDocument.body) : e("body")).select(`[id="${o}"]`)
  );
}, "getDiagramElement");
export { g };
