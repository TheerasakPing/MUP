import { _ as e, l as o, N as i, h as n, O as p } from "./mermaid-LQXJBOYN-DZHv-CM8.js";
import { p as g } from "./treemap-KMMF4GRG-CBbwuGfn.js";
import "./TerminalRouterContext-CeKE7fio.js";
import "./main-CrYcxu2d.js";
import "./__vite-browser-external-2447137e-Cc6rXV8U.js";
import "./coerce-DqyYPfRC.js";
import "./_baseUniq-BfzZL76d.js";
import "./_basePickBy-DcXOyUwY.js";
import "./clone-BvApX1i5.js";
var m = {
    parse: e(async (r) => {
      const a = await g("info", r);
      o.debug(a);
    }, "parse"),
  },
  v = { version: p.version + "" },
  d = e(() => v.version, "getVersion"),
  c = { getVersion: d },
  l = e((r, a, s) => {
    o.debug(
      `rendering info diagram
` + r
    );
    const t = i(a);
    (n(t, 100, 400, !0),
      t
        .append("g")
        .append("text")
        .attr("x", 100)
        .attr("y", 40)
        .attr("class", "version")
        .attr("font-size", 32)
        .style("text-anchor", "middle")
        .text(`v${s}`));
  }, "draw"),
  f = { draw: l },
  E = { parser: m, db: c, renderer: f };
export { E as diagram };
