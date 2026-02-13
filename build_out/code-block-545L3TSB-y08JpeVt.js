import { T as J, p as M, f as y, C as O, F as U, a as D } from "./mermaid-LQXJBOYN-DVCVGgd1.js";
import { r as h, j as u } from "./TerminalRouterContext-CeKE7fio.js";
import { c as A, a as H } from "./engine-compile-BVDp4_F_.js";
import I from "./github-dark-DHJKELXO.js";
import P from "./github-light-DAi9KRSo.js";
import "./main-B2XpWmPF.js";
import "./__vite-browser-external-2447137e-B8az0FDV.js";
import "./coerce-CyuT_8C8.js";
var L = y(
    "block",
    "before:content-[counter(line)]",
    "before:inline-block",
    "before:[counter-increment:line]",
    "before:w-6",
    "before:mr-4",
    "before:text-[13px]",
    "before:text-right",
    "before:text-muted-foreground/50",
    "before:font-mono",
    "before:select-none"
  ),
  R = h.memo(
    ({ children: e, result: r, language: n, className: s, ...a }) => {
      let t = h.useMemo(() => ({ backgroundColor: r.bg, color: r.fg }), [r.bg, r.fg]);
      return u.jsx("pre", {
        className: y(s, "p-4 text-sm dark:bg-(--shiki-dark-bg)!"),
        "data-language": n,
        "data-streamdown": "code-block-body",
        style: t,
        ...a,
        children: u.jsx("code", {
          className: "[counter-increment:line_0] [counter-reset:line]",
          children: r.tokens.map((l, d) =>
            u.jsx(
              "span",
              {
                className: L,
                children: l.map((o, c) =>
                  u.jsx(
                    "span",
                    {
                      className: "dark:bg-(--shiki-dark-bg)! dark:text-(--shiki-dark)!",
                      style: { color: o.color, backgroundColor: o.bgColor, ...o.htmlStyle },
                      ...o.htmlAttrs,
                      children: o.content,
                    },
                    c
                  )
                ),
              },
              d
            )
          ),
        }),
      });
    },
    (e, r) => e.result === r.result && e.language === r.language && e.className === r.className
  ),
  B = ({ className: e, language: r, style: n, ...s }) =>
    u.jsx("div", {
      className: y("my-4 w-full overflow-hidden rounded-xl border border-border", e),
      "data-language": r,
      "data-streamdown": "code-block",
      style: { contentVisibility: "auto", containIntrinsicSize: "auto 200px", ...n },
      ...s,
    }),
  _ = ({ language: e, children: r }) =>
    u.jsxs("div", {
      className: "flex items-center justify-between bg-muted/80 p-3 text-muted-foreground text-xs",
      "data-language": e,
      "data-streamdown": "code-block-header",
      children: [
        u.jsx("span", { className: "ml-1 font-mono lowercase", children: e }),
        u.jsx("div", { className: "flex items-center gap-2", children: r }),
      ],
    }),
  b = { "github-light": P, "github-dark": I },
  q = (e) => e in b,
  z = D.dependencies.shiki.replace(/^\^/, ""),
  C = 5e3,
  v = (e) => `${e}/shiki/${z}`,
  f = new Map(),
  k = new Map(),
  x = new Set(),
  S = new Set(),
  E = /JSON\.parse\(("(?:[^"\\]|\\.)*")\)/,
  T = /import\s+\w+\s+from\s+['"]\.\/([\w-]+)\.mjs['"]/g,
  w = new Set();
async function K(e, r, n) {
  let s = `${r}/${e}.mjs`,
    a = new AbortController(),
    t = setTimeout(() => a.abort(), n),
    l = await fetch(s, { signal: a.signal });
  if ((clearTimeout(t), !l.ok)) throw new Error(`HTTP ${l.status}: ${l.statusText}`);
  let d = await l.text(),
    o = [],
    c;
  for (; (c = T.exec(d)) !== null; ) o.push(c[1]);
  T.lastIndex = 0;
  let i = d.match(E);
  if (!i) throw new Error("Could not find JSON.parse() in CDN response");
  let g = JSON.parse(i[1]);
  return { grammar: JSON.parse(g), dependencies: o };
}
async function F(e, r, n = C) {
  if (r == null) return null;
  let s = `${v(r)}/langs`,
    a = `${s}/${e}`;
  if (f.has(a)) return f.get(a);
  if (x.has(a) || w.has(a)) return null;
  try {
    w.add(a);
    let t = await K(e, s, n);
    if (!t) throw new Error("Failed to load language");
    let { grammar: l, dependencies: d } = t,
      o = [];
    for (let c of d) {
      let i = `${s}/${c}`;
      if (f.has(i)) {
        let p = f.get(i);
        o.push(...p);
        continue;
      }
      if (w.has(i) || x.has(i)) continue;
      let g = await F(c, r, n);
      g && o.push(...g);
    }
    return (o.push(l), f.set(a, [l]), o);
  } catch (t) {
    x.add(a);
    let l = t instanceof Error ? t.message : "Unknown error";
    return (console.warn(`[Streamdown] Failed to load language "${e}" from CDN: ${l}`), null);
  } finally {
    w.delete(a);
  }
}
async function Q(e, r, n = C) {
  if (r == null) return null;
  let s = `${v(r)}/themes`,
    a = `${s}/${e}`;
  if (k.has(a)) return k.get(a);
  if (S.has(a)) return null;
  try {
    let t = `${s}/${e}.mjs`,
      l = new AbortController(),
      d = setTimeout(() => l.abort(), n),
      o = await fetch(t, { signal: l.signal });
    if ((clearTimeout(d), !o.ok)) throw new Error(`HTTP ${o.status}: ${o.statusText}`);
    let c = await o.text();
    try {
      let i = c.match(E);
      if (!i) throw new Error("Could not find JSON.parse() in CDN response");
      let g = JSON.parse(i[1]),
        p = JSON.parse(g);
      return (k.set(a, p), p);
    } catch (i) {
      throw new Error(`Failed to parse theme: ${i instanceof Error ? i.message : "Unknown error"}`);
    }
  } catch (t) {
    S.add(a);
    let l = t instanceof Error ? t.message : "Unknown error";
    return (console.warn(`[Streamdown] Failed to load theme "${e}" from CDN: ${l}`), null);
  }
}
var V = H({ forgiving: !0 }),
  $ = new Map(),
  N = new Map(),
  m = new Map(),
  W = (e, r) => `${e}-${r[0]}-${r[1]}`,
  X = (e, r, n) => {
    let s = e.slice(0, 100),
      a = e.length > 100 ? e.slice(-100) : "";
    return `${r}:${n[0]}:${n[1]}:${e.length}:${s}:${a}`;
  };
async function G(e, r) {
  return q(e)
    ? b[e]
    : (await Q(e, r)) ||
        (console.warn(
          `[Streamdown] Theme "${e}" not found. Falling back to ${e.includes("dark") ? "github-dark" : "github-light"}.`
        ),
        e.includes("dark") ? b["github-dark"] : b["github-light"]);
}
async function Y(e, r) {
  if (O(e)) return U[e];
  let n = await F(e, r);
  return (
    n ||
      console.warn(
        `[Streamdown] Language "${e}" not found in bundled languages or CDN. Falling back to plain text.`
      ),
    n
  );
}
var Z = (e, r, n) => {
    let s = W(e, r);
    if ($.has(s)) return $.get(s);
    let a = (async () => {
      let t = await Y(e, n),
        l = t ? [t] : ["text"],
        d = await Promise.all(r.map((o) => G(o, n)));
      return await A({ themes: d, langs: l, engine: V });
    })();
    return ($.set(s, a), a);
  },
  j = ({ code: e, language: r, shikiTheme: n, cdnUrl: s, callback: a }) => {
    let t = X(e, r, n);
    return N.has(t)
      ? N.get(t)
      : (a && (m.has(t) || m.set(t, new Set()), m.get(t).add(a)),
        Z(r, n, s)
          .then((l) => {
            let d = l.getLoadedLanguages().includes(r) ? r : "text",
              o = l.codeToTokens(e, { lang: d, themes: { light: n[0], dark: n[1] } });
            N.set(t, o);
            let c = m.get(t);
            if (c) {
              for (let i of c) i(o);
              m.delete(t);
            }
          })
          .catch((l) => {
            (console.error("Failed to highlight code:", l), m.delete(t));
          }),
        null);
  },
  ie = ({ code: e, language: r, className: n, children: s, ...a }) => {
    let { shikiTheme: t, cdnUrl: l } = h.useContext(J),
      d = h.useMemo(
        () => ({
          bg: "transparent",
          fg: "inherit",
          tokens: e
            .split(
              `
`
            )
            .map((i) => [
              { content: i, color: "inherit", bgColor: "transparent", htmlStyle: {}, offset: 0 },
            ]),
        }),
        [e]
      ),
      [o, c] = h.useState(d);
    return (
      h.useEffect(() => {
        let i = j({ code: e, language: r, shikiTheme: t, cdnUrl: l });
        if (i) {
          c(i);
          return;
        }
        j({
          code: e,
          language: r,
          shikiTheme: t,
          cdnUrl: l,
          callback: (g) => {
            c(g);
          },
        });
      }, [e, r, t, l]),
      u.jsx(M.Provider, {
        value: { code: e },
        children: u.jsxs(B, {
          language: r,
          children: [
            u.jsx(_, { language: r, children: s }),
            u.jsx(R, { className: n, language: r, result: o, ...a }),
          ],
        }),
      })
    );
  };
export { ie as CodeBlock };
