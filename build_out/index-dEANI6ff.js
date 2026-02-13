import {
  w as Jn,
  a as bo,
  r as fe,
  f as ea,
  o as Et,
  h as Vt,
  e as ta,
  l as ga,
  k as je,
  H as Mr,
  b as He,
  A as Io,
  R as Ze,
  E as aa,
  i as Wn,
  z as Ye,
  g as To,
  S as xo,
  y as Rt,
  M as jt,
  O as ba,
  F as G,
  V as ra,
  N as ke,
  m as Bn,
  W as Ea,
  X as Ra,
  K as nt,
  v as xt,
  Y as Qe,
  G as nr,
  I as Ln,
  Z as Ja,
  P as Ct,
  D as Ut,
  _ as Hn,
  $ as Be,
  a0 as _o,
  U as Ca,
  a1 as Ia,
  a2 as Sr,
  a3 as Yn,
  a4 as Kn,
} from "./index-CGwOAdyT.js";
import {
  Q as Ep,
  q as Rp,
  a5 as Cp,
  a6 as Ap,
  a7 as Np,
  T as Op,
  a8 as kp,
  a9 as Pp,
  aa as qp,
} from "./index-CGwOAdyT.js";
import {
  f as pt,
  o as I,
  r as ft,
  a as oe,
  s as f,
  l as w,
  _ as ct,
  n as Pe,
  u as ce,
  e as J,
  g as zn,
  p as Ta,
  b as L,
  d as Xn,
  q as H,
  v as Mo,
  h as Qn,
  w as re,
} from "./main-B2XpWmPF.js";
import "./types-CUi3gq4E.js";
import "./TerminalRouterContext-CeKE7fio.js";
var Wa, Er;
function Zn() {
  if (Er) return Wa;
  Er = 1;
  var e = Object.defineProperty,
    t = Object.getOwnPropertyDescriptor,
    a = Object.getOwnPropertyNames,
    r = Object.prototype.hasOwnProperty,
    s = (p, c) => {
      for (var d in c) e(p, d, { get: c[d], enumerable: !0 });
    },
    o = (p, c, d, h) => {
      if ((c && typeof c == "object") || typeof c == "function")
        for (let m of a(c))
          !r.call(p, m) &&
            m !== d &&
            e(p, m, { get: () => c[m], enumerable: !(h = t(c, m)) || h.enumerable });
      return p;
    },
    i = (p) => o(e({}, "__esModule", { value: !0 }), p),
    n = {};
  (s(n, { SYMBOL_FOR_REQ_CONTEXT: () => l, getContext: () => u }), (Wa = i(n)));
  const l = Symbol.for("@vercel/request-context");
  function u() {
    return globalThis[l]?.get?.() ?? {};
  }
  return Wa;
}
var Ba, Rr;
function ei() {
  if (Rr) return Ba;
  Rr = 1;
  var e = Object.defineProperty,
    t = Object.getOwnPropertyDescriptor,
    a = Object.getOwnPropertyNames,
    r = Object.prototype.hasOwnProperty,
    s = (c, d) => {
      for (var h in d) e(c, h, { get: d[h], enumerable: !0 });
    },
    o = (c, d, h, m) => {
      if ((d && typeof d == "object") || typeof d == "function")
        for (let v of a(d))
          !r.call(c, v) &&
            v !== h &&
            e(c, v, { get: () => d[v], enumerable: !(m = t(d, v)) || m.enumerable });
      return c;
    },
    i = (c) => o(e({}, "__esModule", { value: !0 }), c),
    n = {};
  (s(n, {
    getContext: () => l.getContext,
    getVercelOidcToken: () => u,
    getVercelOidcTokenSync: () => p,
  }),
    (Ba = i(n)));
  var l = Zn();
  async function u() {
    return "";
  }
  function p() {
    return "";
  }
  return Ba;
}
var So = ei(),
  ti = "vercel.ai.gateway.error",
  La = Symbol.for(ti),
  Cr,
  Ar,
  Ue = class Eo extends ((Ar = Error), (Cr = La), Ar) {
    constructor({ message: t, statusCode: a = 500, cause: r, generationId: s }) {
      (super(s ? `${t} [${s}]` : t),
        (this[Cr] = !0),
        (this.statusCode = a),
        (this.cause = r),
        (this.generationId = s));
    }
    static isInstance(t) {
      return Eo.hasMarker(t);
    }
    static hasMarker(t) {
      return typeof t == "object" && t !== null && La in t && t[La] === !0;
    }
  },
  Ro = "GatewayAuthenticationError",
  ai = `vercel.ai.gateway.error.${Ro}`,
  Nr = Symbol.for(ai),
  Or,
  kr,
  ir = class Co extends ((kr = Ue), (Or = Nr), kr) {
    constructor({
      message: t = "Authentication failed",
      statusCode: a = 401,
      cause: r,
      generationId: s,
    } = {}) {
      (super({ message: t, statusCode: a, cause: r, generationId: s }),
        (this[Or] = !0),
        (this.name = Ro),
        (this.type = "authentication_error"));
    }
    static isInstance(t) {
      return Ue.hasMarker(t) && Nr in t;
    }
    static createContextualError({
      apiKeyProvided: t,
      oidcTokenProvided: a,
      message: r = "Authentication failed",
      statusCode: s = 401,
      cause: o,
      generationId: i,
    }) {
      let n;
      return (
        t
          ? (n = `AI Gateway authentication failed: Invalid API key.

Create a new API key: https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fapi-keys

Provide via 'apiKey' option or 'AI_GATEWAY_API_KEY' environment variable.`)
          : a
            ? (n = `AI Gateway authentication failed: Invalid OIDC token.

Run 'npx vercel link' to link your project, then 'vc env pull' to fetch the token.

Alternatively, use an API key: https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fapi-keys`)
            : (n = `AI Gateway authentication failed: No authentication provided.

Option 1 - API key:
Create an API key: https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fapi-keys
Provide via 'apiKey' option or 'AI_GATEWAY_API_KEY' environment variable.

Option 2 - OIDC token:
Run 'npx vercel link' to link your project, then 'vc env pull' to fetch the token.`),
        new Co({ message: n, statusCode: s, cause: o, generationId: i })
      );
    }
  },
  Ao = "GatewayInvalidRequestError",
  ri = `vercel.ai.gateway.error.${Ao}`,
  Pr = Symbol.for(ri),
  qr,
  Dr,
  oi = class extends ((Dr = Ue), (qr = Pr), Dr) {
    constructor({
      message: e = "Invalid request",
      statusCode: t = 400,
      cause: a,
      generationId: r,
    } = {}) {
      (super({ message: e, statusCode: t, cause: a, generationId: r }),
        (this[qr] = !0),
        (this.name = Ao),
        (this.type = "invalid_request_error"));
    }
    static isInstance(e) {
      return Ue.hasMarker(e) && Pr in e;
    }
  },
  No = "GatewayRateLimitError",
  si = `vercel.ai.gateway.error.${No}`,
  $r = Symbol.for(si),
  jr,
  Ur,
  ni = class extends ((Ur = Ue), (jr = $r), Ur) {
    constructor({
      message: e = "Rate limit exceeded",
      statusCode: t = 429,
      cause: a,
      generationId: r,
    } = {}) {
      (super({ message: e, statusCode: t, cause: a, generationId: r }),
        (this[jr] = !0),
        (this.name = No),
        (this.type = "rate_limit_exceeded"));
    }
    static isInstance(e) {
      return Ue.hasMarker(e) && $r in e;
    }
  },
  Oo = "GatewayModelNotFoundError",
  ii = `vercel.ai.gateway.error.${Oo}`,
  Fr = Symbol.for(ii),
  li = He(() => Ye(I({ modelId: f() }))),
  Vr,
  Gr,
  ui = class extends ((Gr = Ue), (Vr = Fr), Gr) {
    constructor({
      message: e = "Model not found",
      statusCode: t = 404,
      modelId: a,
      cause: r,
      generationId: s,
    } = {}) {
      (super({ message: e, statusCode: t, cause: r, generationId: s }),
        (this[Vr] = !0),
        (this.name = Oo),
        (this.type = "model_not_found"),
        (this.modelId = a));
    }
    static isInstance(e) {
      return Ue.hasMarker(e) && Fr in e;
    }
  },
  ko = "GatewayInternalServerError",
  di = `vercel.ai.gateway.error.${ko}`,
  Jr = Symbol.for(di),
  Wr,
  Br,
  Lr = class extends ((Br = Ue), (Wr = Jr), Br) {
    constructor({
      message: e = "Internal server error",
      statusCode: t = 500,
      cause: a,
      generationId: r,
    } = {}) {
      (super({ message: e, statusCode: t, cause: a, generationId: r }),
        (this[Wr] = !0),
        (this.name = ko),
        (this.type = "internal_server_error"));
    }
    static isInstance(e) {
      return Ue.hasMarker(e) && Jr in e;
    }
  },
  Po = "GatewayResponseError",
  pi = `vercel.ai.gateway.error.${Po}`,
  Hr = Symbol.for(pi),
  Yr,
  Kr,
  ci = class extends ((Kr = Ue), (Yr = Hr), Kr) {
    constructor({
      message: e = "Invalid response from Gateway",
      statusCode: t = 502,
      response: a,
      validationError: r,
      cause: s,
      generationId: o,
    } = {}) {
      (super({ message: e, statusCode: t, cause: s, generationId: o }),
        (this[Yr] = !0),
        (this.name = Po),
        (this.type = "response_error"),
        (this.response = a),
        (this.validationError = r));
    }
    static isInstance(e) {
      return Ue.hasMarker(e) && Hr in e;
    }
  };
async function zr({
  response: e,
  statusCode: t,
  defaultMessage: a = "Gateway request failed",
  cause: r,
  authMethod: s,
}) {
  var o;
  const i = await Ze({ value: e, schema: fi });
  if (!i.success) {
    const c = typeof e == "object" && e !== null && "generationId" in e ? e.generationId : void 0;
    return new ci({
      message: `Invalid error response format: ${a}`,
      statusCode: t,
      response: e,
      validationError: i.error,
      cause: r,
      generationId: c,
    });
  }
  const n = i.value,
    l = n.error.type,
    u = n.error.message,
    p = (o = n.generationId) != null ? o : void 0;
  switch (l) {
    case "authentication_error":
      return ir.createContextualError({
        apiKeyProvided: s === "api-key",
        oidcTokenProvided: s === "oidc",
        statusCode: t,
        cause: r,
        generationId: p,
      });
    case "invalid_request_error":
      return new oi({ message: u, statusCode: t, cause: r, generationId: p });
    case "rate_limit_exceeded":
      return new ni({ message: u, statusCode: t, cause: r, generationId: p });
    case "model_not_found": {
      const c = await Ze({ value: n.error.param, schema: li });
      return new ui({
        message: u,
        statusCode: t,
        modelId: c.success ? c.value.modelId : void 0,
        cause: r,
        generationId: p,
      });
    }
    case "internal_server_error":
      return new Lr({ message: u, statusCode: t, cause: r, generationId: p });
    default:
      return new Lr({ message: u, statusCode: t, cause: r, generationId: p });
  }
}
var fi = He(() =>
  Ye(
    I({
      error: I({
        message: f(),
        type: f().nullish(),
        param: J().nullish(),
        code: ce([f(), Pe()]).nullish(),
      }),
      generationId: f().nullish(),
    })
  )
);
function mt(e, t) {
  var a;
  return Ue.isInstance(e)
    ? e
    : Io.isInstance(e)
      ? zr({
          response: mi(e),
          statusCode: (a = e.statusCode) != null ? a : 500,
          defaultMessage: "Gateway request failed",
          cause: e,
          authMethod: t,
        })
      : zr({
          response: {},
          statusCode: 500,
          defaultMessage:
            e instanceof Error ? `Gateway request failed: ${e.message}` : "Unknown Gateway error",
          cause: e,
          authMethod: t,
        });
}
function mi(e) {
  if (e.data !== void 0) return e.data;
  if (e.responseBody != null)
    try {
      return JSON.parse(e.responseBody);
    } catch {
      return e.responseBody;
    }
  return {};
}
var qo = "ai-gateway-auth-method";
async function At(e) {
  const t = await Ze({ value: e[qo], schema: vi });
  return t.success ? t.value : void 0;
}
var vi = He(() => Ye(ce([w("api-key"), w("oidc")]))),
  Xr = class {
    constructor(e) {
      this.config = e;
    }
    async getAvailableModels() {
      try {
        const { value: e } = await Mr({
          url: `${this.config.baseURL}/config`,
          headers: await fe(this.config.headers()),
          successfulResponseHandler: Vt(hi),
          failedResponseHandler: Et({ errorSchema: pt(), errorToMessage: (t) => t }),
          fetch: this.config.fetch,
        });
        return e;
      } catch (e) {
        throw await mt(e);
      }
    }
    async getCredits() {
      try {
        const e = new URL(this.config.baseURL),
          { value: t } = await Mr({
            url: `${e.origin}/v1/credits`,
            headers: await fe(this.config.headers()),
            successfulResponseHandler: Vt(gi),
            failedResponseHandler: Et({ errorSchema: pt(), errorToMessage: (a) => a }),
            fetch: this.config.fetch,
          });
        return t;
      } catch (e) {
        throw await mt(e);
      }
    }
  },
  hi = He(() =>
    Ye(
      I({
        models: oe(
          I({
            id: f(),
            name: f(),
            description: f().nullish(),
            pricing: I({
              input: f(),
              output: f(),
              input_cache_read: f().nullish(),
              input_cache_write: f().nullish(),
            })
              .transform(({ input: e, output: t, input_cache_read: a, input_cache_write: r }) => ({
                input: e,
                output: t,
                ...(a ? { cachedInputTokens: a } : {}),
                ...(r ? { cacheCreationInputTokens: r } : {}),
              }))
              .nullish(),
            specification: I({ specificationVersion: w("v3"), provider: f(), modelId: f() }),
            modelType: ct(["embedding", "image", "language", "video"]).nullish(),
          })
        ),
      })
    )
  ),
  gi = He(() =>
    Ye(
      I({ balance: f(), total_used: f() }).transform(({ balance: e, total_used: t }) => ({
        balance: e,
        totalUsed: t,
      }))
    )
  ),
  yi = class {
    constructor(e, t) {
      ((this.modelId = e),
        (this.config = t),
        (this.specificationVersion = "v3"),
        (this.supportedUrls = { "*/*": [/.*/] }));
    }
    get provider() {
      return this.config.provider;
    }
    async getArgs(e) {
      const { abortSignal: t, ...a } = e;
      return { args: this.maybeEncodeFileParts(a), warnings: [] };
    }
    async doGenerate(e) {
      const { args: t, warnings: a } = await this.getArgs(e),
        { abortSignal: r } = e,
        s = await fe(this.config.headers());
      try {
        const {
          responseHeaders: o,
          value: i,
          rawValue: n,
        } = await ea({
          url: this.getUrl(),
          headers: ta(
            s,
            e.headers,
            this.getModelConfigHeaders(this.modelId, !1),
            await fe(this.config.o11yHeaders)
          ),
          body: t,
          successfulResponseHandler: Vt(pt()),
          failedResponseHandler: Et({ errorSchema: pt(), errorToMessage: (l) => l }),
          ...(r && { abortSignal: r }),
          fetch: this.config.fetch,
        });
        return { ...i, request: { body: t }, response: { headers: o, body: n }, warnings: a };
      } catch (o) {
        throw await mt(o, await At(s));
      }
    }
    async doStream(e) {
      const { args: t, warnings: a } = await this.getArgs(e),
        { abortSignal: r } = e,
        s = await fe(this.config.headers());
      try {
        const { value: o, responseHeaders: i } = await ea({
          url: this.getUrl(),
          headers: ta(
            s,
            e.headers,
            this.getModelConfigHeaders(this.modelId, !0),
            await fe(this.config.o11yHeaders)
          ),
          body: t,
          successfulResponseHandler: Wn(pt()),
          failedResponseHandler: Et({ errorSchema: pt(), errorToMessage: (n) => n }),
          ...(r && { abortSignal: r }),
          fetch: this.config.fetch,
        });
        return {
          stream: o.pipeThrough(
            new TransformStream({
              start(n) {
                a.length > 0 && n.enqueue({ type: "stream-start", warnings: a });
              },
              transform(n, l) {
                if (n.success) {
                  const u = n.value;
                  if (u.type === "raw" && !e.includeRawChunks) return;
                  (u.type === "response-metadata" &&
                    u.timestamp &&
                    typeof u.timestamp == "string" &&
                    (u.timestamp = new Date(u.timestamp)),
                    l.enqueue(u));
                } else l.error(n.error);
              },
            })
          ),
          request: { body: t },
          response: { headers: i },
        };
      } catch (o) {
        throw await mt(o, await At(s));
      }
    }
    isFilePart(e) {
      return e && typeof e == "object" && "type" in e && e.type === "file";
    }
    maybeEncodeFileParts(e) {
      for (const t of e.prompt)
        for (const a of t.content)
          if (this.isFilePart(a)) {
            const r = a;
            if (r.data instanceof Uint8Array) {
              const s = Uint8Array.from(r.data),
                o = Buffer.from(s).toString("base64");
              r.data = new URL(`data:${r.mediaType || "application/octet-stream"};base64,${o}`);
            }
          }
      return e;
    }
    getUrl() {
      return `${this.config.baseURL}/language-model`;
    }
    getModelConfigHeaders(e, t) {
      return {
        "ai-language-model-specification-version": "3",
        "ai-language-model-id": e,
        "ai-language-model-streaming": String(t),
      };
    }
  },
  wi = class {
    constructor(e, t) {
      ((this.modelId = e),
        (this.config = t),
        (this.specificationVersion = "v3"),
        (this.maxEmbeddingsPerCall = 2048),
        (this.supportsParallelCalls = !0));
    }
    get provider() {
      return this.config.provider;
    }
    async doEmbed({ values: e, headers: t, abortSignal: a, providerOptions: r }) {
      var s;
      const o = await fe(this.config.headers());
      try {
        const {
          responseHeaders: i,
          value: n,
          rawValue: l,
        } = await ea({
          url: this.getUrl(),
          headers: ta(o, t ?? {}, this.getModelConfigHeaders(), await fe(this.config.o11yHeaders)),
          body: { values: e, ...(r ? { providerOptions: r } : {}) },
          successfulResponseHandler: Vt(bi),
          failedResponseHandler: Et({ errorSchema: pt(), errorToMessage: (u) => u }),
          ...(a && { abortSignal: a }),
          fetch: this.config.fetch,
        });
        return {
          embeddings: n.embeddings,
          usage: (s = n.usage) != null ? s : void 0,
          providerMetadata: n.providerMetadata,
          response: { headers: i, body: l },
          warnings: [],
        };
      } catch (i) {
        throw await mt(i, await At(o));
      }
    }
    getUrl() {
      return `${this.config.baseURL}/embedding-model`;
    }
    getModelConfigHeaders() {
      return { "ai-embedding-model-specification-version": "3", "ai-model-id": this.modelId };
    }
  },
  bi = He(() =>
    Ye(
      I({
        embeddings: oe(oe(Pe())),
        usage: I({ tokens: Pe() }).nullish(),
        providerMetadata: ft(f(), ft(f(), J())).optional(),
      })
    )
  ),
  Ii = class {
    constructor(e, t) {
      ((this.modelId = e),
        (this.config = t),
        (this.specificationVersion = "v3"),
        (this.maxImagesPerCall = Number.MAX_SAFE_INTEGER));
    }
    get provider() {
      return this.config.provider;
    }
    async doGenerate({
      prompt: e,
      n: t,
      size: a,
      aspectRatio: r,
      seed: s,
      files: o,
      mask: i,
      providerOptions: n,
      headers: l,
      abortSignal: u,
    }) {
      var p;
      const c = await fe(this.config.headers());
      try {
        const {
          responseHeaders: d,
          value: h,
          rawValue: m,
        } = await ea({
          url: this.getUrl(),
          headers: ta(c, l ?? {}, this.getModelConfigHeaders(), await fe(this.config.o11yHeaders)),
          body: {
            prompt: e,
            n: t,
            ...(a && { size: a }),
            ...(r && { aspectRatio: r }),
            ...(s && { seed: s }),
            ...(n && { providerOptions: n }),
            ...(o && { files: o.map((v) => Qr(v)) }),
            ...(i && { mask: Qr(i) }),
          },
          successfulResponseHandler: Vt(xi),
          failedResponseHandler: Et({ errorSchema: pt(), errorToMessage: (v) => v }),
          ...(u && { abortSignal: u }),
          fetch: this.config.fetch,
        });
        return {
          images: h.images,
          warnings: (p = h.warnings) != null ? p : [],
          providerMetadata: h.providerMetadata,
          response: { timestamp: new Date(), modelId: this.modelId, headers: d },
        };
      } catch (d) {
        throw mt(d, await At(c));
      }
    }
    getUrl() {
      return `${this.config.baseURL}/image-model`;
    }
    getModelConfigHeaders() {
      return { "ai-image-model-specification-version": "3", "ai-model-id": this.modelId };
    }
  };
function Qr(e) {
  return e.type === "file" && e.data instanceof Uint8Array ? { ...e, data: aa(e.data) } : e;
}
var Ti = I({ images: oe(J()).optional() }).catchall(J()),
  xi = I({
    images: oe(f()),
    warnings: oe(I({ type: w("other"), message: f() })).optional(),
    providerMetadata: ft(f(), Ti).optional(),
  }),
  _i = class {
    constructor(e, t) {
      ((this.modelId = e),
        (this.config = t),
        (this.specificationVersion = "v3"),
        (this.maxVideosPerCall = Number.MAX_SAFE_INTEGER));
    }
    get provider() {
      return this.config.provider;
    }
    async doGenerate({
      prompt: e,
      n: t,
      aspectRatio: a,
      resolution: r,
      duration: s,
      fps: o,
      seed: i,
      image: n,
      providerOptions: l,
      headers: u,
      abortSignal: p,
    }) {
      var c;
      const d = await fe(this.config.headers());
      try {
        const {
          responseHeaders: h,
          value: m,
          rawValue: v,
        } = await ea({
          url: this.getUrl(),
          headers: ta(d, u ?? {}, this.getModelConfigHeaders(), await fe(this.config.o11yHeaders)),
          body: {
            prompt: e,
            n: t,
            ...(a && { aspectRatio: a }),
            ...(r && { resolution: r }),
            ...(s && { duration: s }),
            ...(o && { fps: o }),
            ...(i && { seed: i }),
            ...(l && { providerOptions: l }),
            ...(n && { image: Mi(n) }),
          },
          successfulResponseHandler: Vt(Ri),
          failedResponseHandler: Et({ errorSchema: pt(), errorToMessage: (y) => y }),
          ...(p && { abortSignal: p }),
          fetch: this.config.fetch,
        });
        return {
          videos: m.videos,
          warnings: (c = m.warnings) != null ? c : [],
          providerMetadata: m.providerMetadata,
          response: { timestamp: new Date(), modelId: this.modelId, headers: h },
        };
      } catch (h) {
        throw mt(h, await At(d));
      }
    }
    getUrl() {
      return `${this.config.baseURL}/video-model`;
    }
    getModelConfigHeaders() {
      return { "ai-video-model-specification-version": "3", "ai-model-id": this.modelId };
    }
  };
function Mi(e) {
  return e.type === "file" && e.data instanceof Uint8Array ? { ...e, data: aa(e.data) } : e;
}
var Si = I({ videos: oe(J()).optional() }).catchall(J()),
  Ei = ce([
    I({ type: w("url"), url: f(), mediaType: f() }),
    I({ type: w("base64"), data: f(), mediaType: f() }),
  ]),
  Ri = I({
    videos: oe(Ei),
    warnings: oe(I({ type: w("other"), message: f() })).optional(),
    providerMetadata: ft(f(), Si).optional(),
  }),
  Ci = He(() =>
    Ye(
      I({
        objective: f().describe(
          "Natural-language description of the web research goal, including source or freshness guidance and broader context from the task. Maximum 5000 characters."
        ),
        search_queries: oe(f())
          .optional()
          .describe(
            "Optional search queries to supplement the objective. Maximum 200 characters per query."
          ),
        mode: ct(["one-shot", "agentic"])
          .optional()
          .describe(
            'Mode preset: "one-shot" for comprehensive results with longer excerpts (default), "agentic" for concise, token-efficient results for multi-step workflows.'
          ),
        max_results: Pe()
          .optional()
          .describe("Maximum number of results to return (1-20). Defaults to 10 if not specified."),
        source_policy: I({
          include_domains: oe(f())
            .optional()
            .describe("List of domains to include in search results."),
          exclude_domains: oe(f())
            .optional()
            .describe("List of domains to exclude from search results."),
          after_date: f()
            .optional()
            .describe("Only include results published after this date (ISO 8601 format)."),
        })
          .optional()
          .describe(
            "Source policy for controlling which domains to include/exclude and freshness."
          ),
        excerpts: I({
          max_chars_per_result: Pe().optional().describe("Maximum characters per result."),
          max_chars_total: Pe().optional().describe("Maximum total characters across all results."),
        })
          .optional()
          .describe("Excerpt configuration for controlling result length."),
        fetch_policy: I({
          max_age_seconds: Pe()
            .optional()
            .describe(
              "Maximum age in seconds for cached content. Set to 0 to always fetch fresh content."
            ),
        })
          .optional()
          .describe("Fetch policy for controlling content freshness."),
      })
    )
  ),
  Ai = He(() =>
    Ye(
      ce([
        I({
          searchId: f(),
          results: oe(
            I({
              url: f(),
              title: f(),
              excerpt: f(),
              publishDate: f().nullable().optional(),
              relevanceScore: Pe().optional(),
            })
          ),
        }),
        I({
          error: ct([
            "api_error",
            "rate_limit",
            "timeout",
            "invalid_input",
            "configuration_error",
            "unknown",
          ]),
          statusCode: Pe().optional(),
          message: f(),
        }),
      ])
    )
  ),
  Ni = bo({ id: "gateway.parallel_search", inputSchema: Ci, outputSchema: Ai }),
  Oi = (e = {}) => Ni(e),
  ki = He(() =>
    Ye(
      I({
        query: ce([f(), oe(f())]).describe(
          "Search query (string) or multiple queries (array of up to 5 strings). Multi-query searches return combined results from all queries."
        ),
        max_results: Pe()
          .optional()
          .describe("Maximum number of search results to return (1-20, default: 10)"),
        max_tokens_per_page: Pe()
          .optional()
          .describe(
            "Maximum number of tokens to extract per search result page (256-2048, default: 2048)"
          ),
        max_tokens: Pe()
          .optional()
          .describe(
            "Maximum total tokens across all search results (default: 25000, max: 1000000)"
          ),
        country: f()
          .optional()
          .describe(
            "Two-letter ISO 3166-1 alpha-2 country code for regional search results (e.g., 'US', 'GB', 'FR')"
          ),
        search_domain_filter: oe(f())
          .optional()
          .describe(
            "List of domains to include or exclude from search results (max 20). To include: ['nature.com', 'science.org']. To exclude: ['-example.com', '-spam.net']"
          ),
        search_language_filter: oe(f())
          .optional()
          .describe(
            "List of ISO 639-1 language codes to filter results (max 10, lowercase). Examples: ['en', 'fr', 'de']"
          ),
        search_after_date: f()
          .optional()
          .describe(
            "Include only results published after this date. Format: 'MM/DD/YYYY' (e.g., '3/1/2025'). Cannot be used with search_recency_filter."
          ),
        search_before_date: f()
          .optional()
          .describe(
            "Include only results published before this date. Format: 'MM/DD/YYYY' (e.g., '3/15/2025'). Cannot be used with search_recency_filter."
          ),
        last_updated_after_filter: f()
          .optional()
          .describe(
            "Include only results last updated after this date. Format: 'MM/DD/YYYY' (e.g., '3/1/2025'). Cannot be used with search_recency_filter."
          ),
        last_updated_before_filter: f()
          .optional()
          .describe(
            "Include only results last updated before this date. Format: 'MM/DD/YYYY' (e.g., '3/15/2025'). Cannot be used with search_recency_filter."
          ),
        search_recency_filter: ct(["day", "week", "month", "year"])
          .optional()
          .describe(
            "Filter results by relative time period. Cannot be used with search_after_date or search_before_date."
          ),
      })
    )
  ),
  Pi = He(() =>
    Ye(
      ce([
        I({
          results: oe(
            I({
              title: f(),
              url: f(),
              snippet: f(),
              date: f().optional(),
              lastUpdated: f().optional(),
            })
          ),
          id: f(),
        }),
        I({
          error: ct(["api_error", "rate_limit", "timeout", "invalid_input", "unknown"]),
          statusCode: Pe().optional(),
          message: f(),
        }),
      ])
    )
  ),
  qi = bo({ id: "gateway.perplexity_search", inputSchema: ki, outputSchema: Pi }),
  Di = (e = {}) => qi(e),
  $i = { parallelSearch: Oi, perplexitySearch: Di };
async function ji() {
  var e;
  return (e = So.getContext().headers) == null ? void 0 : e["x-vercel-id"];
}
var Ui = "3.0.35",
  Fi = "0.0.1";
function Vi(e = {}) {
  var t, a;
  let r = null,
    s = null;
  const o = (t = e.metadataCacheRefreshMillis) != null ? t : 1e3 * 60 * 5;
  let i = 0;
  const n = (a = Jn(e.baseURL)) != null ? a : "https://ai-gateway.vercel.sh/v3/ai",
    l = async () => {
      try {
        const v = await Ji(e);
        return je(
          {
            Authorization: `Bearer ${v.token}`,
            "ai-gateway-protocol-version": Fi,
            [qo]: v.authMethod,
            ...e.headers,
          },
          `ai-sdk/gateway/${Ui}`
        );
      } catch (v) {
        throw ir.createContextualError({
          apiKeyProvided: !1,
          oidcTokenProvided: !1,
          statusCode: 401,
          cause: v,
        });
      }
    },
    u = () => {
      const v = ga({ settingValue: void 0, environmentVariableName: "VERCEL_DEPLOYMENT_ID" }),
        y = ga({ settingValue: void 0, environmentVariableName: "VERCEL_ENV" }),
        b = ga({ settingValue: void 0, environmentVariableName: "VERCEL_REGION" });
      return async () => {
        const R = await ji();
        return {
          ...(v && { "ai-o11y-deployment-id": v }),
          ...(y && { "ai-o11y-environment": y }),
          ...(b && { "ai-o11y-region": b }),
          ...(R && { "ai-o11y-request-id": R }),
        };
      };
    },
    p = (v) =>
      new yi(v, { provider: "gateway", baseURL: n, headers: l, fetch: e.fetch, o11yHeaders: u() }),
    c = async () => {
      var v, y, b;
      const R =
        (b =
          (y = (v = e._internal) == null ? void 0 : v.currentDate) == null
            ? void 0
            : y.call(v).getTime()) != null
          ? b
          : Date.now();
      return (
        (!r || R - i > o) &&
          ((i = R),
          (r = new Xr({ baseURL: n, headers: l, fetch: e.fetch })
            .getAvailableModels()
            .then((g) => ((s = g), g))
            .catch(async (g) => {
              throw await mt(g, await At(await l()));
            }))),
        s ? Promise.resolve(s) : r
      );
    },
    d = async () =>
      new Xr({ baseURL: n, headers: l, fetch: e.fetch }).getCredits().catch(async (v) => {
        throw await mt(v, await At(await l()));
      }),
    h = function (v) {
      if (new.target)
        throw new Error(
          "The Gateway Provider model function cannot be called with the new keyword."
        );
      return p(v);
    };
  ((h.specificationVersion = "v3"),
    (h.getAvailableModels = c),
    (h.getCredits = d),
    (h.imageModel = (v) =>
      new Ii(v, { provider: "gateway", baseURL: n, headers: l, fetch: e.fetch, o11yHeaders: u() })),
    (h.languageModel = p));
  const m = (v) =>
    new wi(v, { provider: "gateway", baseURL: n, headers: l, fetch: e.fetch, o11yHeaders: u() });
  return (
    (h.embeddingModel = m),
    (h.textEmbeddingModel = m),
    (h.videoModel = (v) =>
      new _i(v, { provider: "gateway", baseURL: n, headers: l, fetch: e.fetch, o11yHeaders: u() })),
    (h.chat = h.languageModel),
    (h.embedding = h.embeddingModel),
    (h.image = h.imageModel),
    (h.video = h.videoModel),
    (h.tools = $i),
    h
  );
}
var Gi = Vi();
async function Ji(e) {
  const t = ga({ settingValue: e.apiKey, environmentVariableName: "AI_GATEWAY_API_KEY" });
  return t
    ? { token: t, authMethod: "api-key" }
    : { token: await So.getVercelOidcToken(), authMethod: "oidc" };
}
var Wi =
    typeof globalThis == "object"
      ? globalThis
      : typeof self == "object"
        ? self
        : typeof window == "object"
          ? window
          : typeof global == "object"
            ? global
            : {},
  _t = "1.9.0",
  Zr = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
function Bi(e) {
  var t = new Set([e]),
    a = new Set(),
    r = e.match(Zr);
  if (!r)
    return function () {
      return !1;
    };
  var s = { major: +r[1], minor: +r[2], patch: +r[3], prerelease: r[4] };
  if (s.prerelease != null)
    return function (l) {
      return l === e;
    };
  function o(n) {
    return (a.add(n), !1);
  }
  function i(n) {
    return (t.add(n), !0);
  }
  return function (l) {
    if (t.has(l)) return !0;
    if (a.has(l)) return !1;
    var u = l.match(Zr);
    if (!u) return o(l);
    var p = { major: +u[1], minor: +u[2], patch: +u[3], prerelease: u[4] };
    return p.prerelease != null || s.major !== p.major
      ? o(l)
      : s.major === 0
        ? s.minor === p.minor && s.patch <= p.patch
          ? i(l)
          : o(l)
        : s.minor <= p.minor
          ? i(l)
          : o(l);
  };
}
var Li = Bi(_t),
  Hi = _t.split(".")[0],
  oa = Symbol.for("opentelemetry.js.api." + Hi),
  sa = Wi;
function lr(e, t, a, r) {
  var s;
  r === void 0 && (r = !1);
  var o = (sa[oa] = (s = sa[oa]) !== null && s !== void 0 ? s : { version: _t });
  if (!r && o[e]) {
    var i = new Error("@opentelemetry/api: Attempted duplicate registration of API: " + e);
    return (a.error(i.stack || i.message), !1);
  }
  if (o.version !== _t) {
    var i = new Error(
      "@opentelemetry/api: Registration of version v" +
        o.version +
        " for " +
        e +
        " does not match previously registered API v" +
        _t
    );
    return (a.error(i.stack || i.message), !1);
  }
  return (
    (o[e] = t),
    a.debug("@opentelemetry/api: Registered a global for " + e + " v" + _t + "."),
    !0
  );
}
function na(e) {
  var t,
    a,
    r = (t = sa[oa]) === null || t === void 0 ? void 0 : t.version;
  if (!(!r || !Li(r))) return (a = sa[oa]) === null || a === void 0 ? void 0 : a[e];
}
function ur(e, t) {
  t.debug("@opentelemetry/api: Unregistering a global for " + e + " v" + _t + ".");
  var a = sa[oa];
  a && delete a[e];
}
var Yi = function (e, t) {
    var a = typeof Symbol == "function" && e[Symbol.iterator];
    if (!a) return e;
    var r = a.call(e),
      s,
      o = [],
      i;
    try {
      for (; (t === void 0 || t-- > 0) && !(s = r.next()).done; ) o.push(s.value);
    } catch (n) {
      i = { error: n };
    } finally {
      try {
        s && !s.done && (a = r.return) && a.call(r);
      } finally {
        if (i) throw i.error;
      }
    }
    return o;
  },
  Ki = function (e, t, a) {
    if (a || arguments.length === 2)
      for (var r = 0, s = t.length, o; r < s; r++)
        (o || !(r in t)) && (o || (o = Array.prototype.slice.call(t, 0, r)), (o[r] = t[r]));
    return e.concat(o || Array.prototype.slice.call(t));
  },
  zi = (function () {
    function e(t) {
      this._namespace = t.namespace || "DiagComponentLogger";
    }
    return (
      (e.prototype.debug = function () {
        for (var t = [], a = 0; a < arguments.length; a++) t[a] = arguments[a];
        return Qt("debug", this._namespace, t);
      }),
      (e.prototype.error = function () {
        for (var t = [], a = 0; a < arguments.length; a++) t[a] = arguments[a];
        return Qt("error", this._namespace, t);
      }),
      (e.prototype.info = function () {
        for (var t = [], a = 0; a < arguments.length; a++) t[a] = arguments[a];
        return Qt("info", this._namespace, t);
      }),
      (e.prototype.warn = function () {
        for (var t = [], a = 0; a < arguments.length; a++) t[a] = arguments[a];
        return Qt("warn", this._namespace, t);
      }),
      (e.prototype.verbose = function () {
        for (var t = [], a = 0; a < arguments.length; a++) t[a] = arguments[a];
        return Qt("verbose", this._namespace, t);
      }),
      e
    );
  })();
function Qt(e, t, a) {
  var r = na("diag");
  if (r) return (a.unshift(t), r[e].apply(r, Ki([], Yi(a), !1)));
}
var De;
(function (e) {
  ((e[(e.NONE = 0)] = "NONE"),
    (e[(e.ERROR = 30)] = "ERROR"),
    (e[(e.WARN = 50)] = "WARN"),
    (e[(e.INFO = 60)] = "INFO"),
    (e[(e.DEBUG = 70)] = "DEBUG"),
    (e[(e.VERBOSE = 80)] = "VERBOSE"),
    (e[(e.ALL = 9999)] = "ALL"));
})(De || (De = {}));
function Xi(e, t) {
  (e < De.NONE ? (e = De.NONE) : e > De.ALL && (e = De.ALL), (t = t || {}));
  function a(r, s) {
    var o = t[r];
    return typeof o == "function" && e >= s ? o.bind(t) : function () {};
  }
  return {
    error: a("error", De.ERROR),
    warn: a("warn", De.WARN),
    info: a("info", De.INFO),
    debug: a("debug", De.DEBUG),
    verbose: a("verbose", De.VERBOSE),
  };
}
var Qi = function (e, t) {
    var a = typeof Symbol == "function" && e[Symbol.iterator];
    if (!a) return e;
    var r = a.call(e),
      s,
      o = [],
      i;
    try {
      for (; (t === void 0 || t-- > 0) && !(s = r.next()).done; ) o.push(s.value);
    } catch (n) {
      i = { error: n };
    } finally {
      try {
        s && !s.done && (a = r.return) && a.call(r);
      } finally {
        if (i) throw i.error;
      }
    }
    return o;
  },
  Zi = function (e, t, a) {
    if (a || arguments.length === 2)
      for (var r = 0, s = t.length, o; r < s; r++)
        (o || !(r in t)) && (o || (o = Array.prototype.slice.call(t, 0, r)), (o[r] = t[r]));
    return e.concat(o || Array.prototype.slice.call(t));
  },
  el = "diag",
  xa = (function () {
    function e() {
      function t(s) {
        return function () {
          for (var o = [], i = 0; i < arguments.length; i++) o[i] = arguments[i];
          var n = na("diag");
          if (n) return n[s].apply(n, Zi([], Qi(o), !1));
        };
      }
      var a = this,
        r = function (s, o) {
          var i, n, l;
          if ((o === void 0 && (o = { logLevel: De.INFO }), s === a)) {
            var u = new Error(
              "Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation"
            );
            return (a.error((i = u.stack) !== null && i !== void 0 ? i : u.message), !1);
          }
          typeof o == "number" && (o = { logLevel: o });
          var p = na("diag"),
            c = Xi((n = o.logLevel) !== null && n !== void 0 ? n : De.INFO, s);
          if (p && !o.suppressOverrideMessage) {
            var d =
              (l = new Error().stack) !== null && l !== void 0
                ? l
                : "<failed to generate stacktrace>";
            (p.warn("Current logger will be overwritten from " + d),
              c.warn("Current logger will overwrite one already registered from " + d));
          }
          return lr("diag", c, a, !0);
        };
      ((a.setLogger = r),
        (a.disable = function () {
          ur(el, a);
        }),
        (a.createComponentLogger = function (s) {
          return new zi(s);
        }),
        (a.verbose = t("verbose")),
        (a.debug = t("debug")),
        (a.info = t("info")),
        (a.warn = t("warn")),
        (a.error = t("error")));
    }
    return (
      (e.instance = function () {
        return (this._instance || (this._instance = new e()), this._instance);
      }),
      e
    );
  })();
function tl(e) {
  return Symbol.for(e);
}
var al = (function () {
    function e(t) {
      var a = this;
      ((a._currentContext = t ? new Map(t) : new Map()),
        (a.getValue = function (r) {
          return a._currentContext.get(r);
        }),
        (a.setValue = function (r, s) {
          var o = new e(a._currentContext);
          return (o._currentContext.set(r, s), o);
        }),
        (a.deleteValue = function (r) {
          var s = new e(a._currentContext);
          return (s._currentContext.delete(r), s);
        }));
    }
    return e;
  })(),
  rl = new al(),
  ol = function (e, t) {
    var a = typeof Symbol == "function" && e[Symbol.iterator];
    if (!a) return e;
    var r = a.call(e),
      s,
      o = [],
      i;
    try {
      for (; (t === void 0 || t-- > 0) && !(s = r.next()).done; ) o.push(s.value);
    } catch (n) {
      i = { error: n };
    } finally {
      try {
        s && !s.done && (a = r.return) && a.call(r);
      } finally {
        if (i) throw i.error;
      }
    }
    return o;
  },
  sl = function (e, t, a) {
    if (a || arguments.length === 2)
      for (var r = 0, s = t.length, o; r < s; r++)
        (o || !(r in t)) && (o || (o = Array.prototype.slice.call(t, 0, r)), (o[r] = t[r]));
    return e.concat(o || Array.prototype.slice.call(t));
  },
  nl = (function () {
    function e() {}
    return (
      (e.prototype.active = function () {
        return rl;
      }),
      (e.prototype.with = function (t, a, r) {
        for (var s = [], o = 3; o < arguments.length; o++) s[o - 3] = arguments[o];
        return a.call.apply(a, sl([r], ol(s), !1));
      }),
      (e.prototype.bind = function (t, a) {
        return a;
      }),
      (e.prototype.enable = function () {
        return this;
      }),
      (e.prototype.disable = function () {
        return this;
      }),
      e
    );
  })(),
  il = function (e, t) {
    var a = typeof Symbol == "function" && e[Symbol.iterator];
    if (!a) return e;
    var r = a.call(e),
      s,
      o = [],
      i;
    try {
      for (; (t === void 0 || t-- > 0) && !(s = r.next()).done; ) o.push(s.value);
    } catch (n) {
      i = { error: n };
    } finally {
      try {
        s && !s.done && (a = r.return) && a.call(r);
      } finally {
        if (i) throw i.error;
      }
    }
    return o;
  },
  ll = function (e, t, a) {
    if (a || arguments.length === 2)
      for (var r = 0, s = t.length, o; r < s; r++)
        (o || !(r in t)) && (o || (o = Array.prototype.slice.call(t, 0, r)), (o[r] = t[r]));
    return e.concat(o || Array.prototype.slice.call(t));
  },
  Ha = "context",
  ul = new nl(),
  dr = (function () {
    function e() {}
    return (
      (e.getInstance = function () {
        return (this._instance || (this._instance = new e()), this._instance);
      }),
      (e.prototype.setGlobalContextManager = function (t) {
        return lr(Ha, t, xa.instance());
      }),
      (e.prototype.active = function () {
        return this._getContextManager().active();
      }),
      (e.prototype.with = function (t, a, r) {
        for (var s, o = [], i = 3; i < arguments.length; i++) o[i - 3] = arguments[i];
        return (s = this._getContextManager()).with.apply(s, ll([t, a, r], il(o), !1));
      }),
      (e.prototype.bind = function (t, a) {
        return this._getContextManager().bind(t, a);
      }),
      (e.prototype._getContextManager = function () {
        return na(Ha) || ul;
      }),
      (e.prototype.disable = function () {
        (this._getContextManager().disable(), ur(Ha, xa.instance()));
      }),
      e
    );
  })(),
  Za;
(function (e) {
  ((e[(e.NONE = 0)] = "NONE"), (e[(e.SAMPLED = 1)] = "SAMPLED"));
})(Za || (Za = {}));
var Do = "0000000000000000",
  $o = "00000000000000000000000000000000",
  dl = { traceId: $o, spanId: Do, traceFlags: Za.NONE },
  Zt = (function () {
    function e(t) {
      (t === void 0 && (t = dl), (this._spanContext = t));
    }
    return (
      (e.prototype.spanContext = function () {
        return this._spanContext;
      }),
      (e.prototype.setAttribute = function (t, a) {
        return this;
      }),
      (e.prototype.setAttributes = function (t) {
        return this;
      }),
      (e.prototype.addEvent = function (t, a) {
        return this;
      }),
      (e.prototype.addLink = function (t) {
        return this;
      }),
      (e.prototype.addLinks = function (t) {
        return this;
      }),
      (e.prototype.setStatus = function (t) {
        return this;
      }),
      (e.prototype.updateName = function (t) {
        return this;
      }),
      (e.prototype.end = function (t) {}),
      (e.prototype.isRecording = function () {
        return !1;
      }),
      (e.prototype.recordException = function (t, a) {}),
      e
    );
  })(),
  pr = tl("OpenTelemetry Context Key SPAN");
function cr(e) {
  return e.getValue(pr) || void 0;
}
function pl() {
  return cr(dr.getInstance().active());
}
function fr(e, t) {
  return e.setValue(pr, t);
}
function cl(e) {
  return e.deleteValue(pr);
}
function fl(e, t) {
  return fr(e, new Zt(t));
}
function jo(e) {
  var t;
  return (t = cr(e)) === null || t === void 0 ? void 0 : t.spanContext();
}
var ml = /^([0-9a-f]{32})$/i,
  vl = /^[0-9a-f]{16}$/i;
function hl(e) {
  return ml.test(e) && e !== $o;
}
function gl(e) {
  return vl.test(e) && e !== Do;
}
function Uo(e) {
  return hl(e.traceId) && gl(e.spanId);
}
function yl(e) {
  return new Zt(e);
}
var Ya = dr.getInstance(),
  Fo = (function () {
    function e() {}
    return (
      (e.prototype.startSpan = function (t, a, r) {
        r === void 0 && (r = Ya.active());
        var s = !!a?.root;
        if (s) return new Zt();
        var o = r && jo(r);
        return wl(o) && Uo(o) ? new Zt(o) : new Zt();
      }),
      (e.prototype.startActiveSpan = function (t, a, r, s) {
        var o, i, n;
        if (!(arguments.length < 2)) {
          arguments.length === 2
            ? (n = a)
            : arguments.length === 3
              ? ((o = a), (n = r))
              : ((o = a), (i = r), (n = s));
          var l = i ?? Ya.active(),
            u = this.startSpan(t, o, l),
            p = fr(l, u);
          return Ya.with(p, n, void 0, u);
        }
      }),
      e
    );
  })();
function wl(e) {
  return (
    typeof e == "object" &&
    typeof e.spanId == "string" &&
    typeof e.traceId == "string" &&
    typeof e.traceFlags == "number"
  );
}
var bl = new Fo(),
  Il = (function () {
    function e(t, a, r, s) {
      ((this._provider = t), (this.name = a), (this.version = r), (this.options = s));
    }
    return (
      (e.prototype.startSpan = function (t, a, r) {
        return this._getTracer().startSpan(t, a, r);
      }),
      (e.prototype.startActiveSpan = function (t, a, r, s) {
        var o = this._getTracer();
        return Reflect.apply(o.startActiveSpan, o, arguments);
      }),
      (e.prototype._getTracer = function () {
        if (this._delegate) return this._delegate;
        var t = this._provider.getDelegateTracer(this.name, this.version, this.options);
        return t ? ((this._delegate = t), this._delegate) : bl;
      }),
      e
    );
  })(),
  Tl = (function () {
    function e() {}
    return (
      (e.prototype.getTracer = function (t, a, r) {
        return new Fo();
      }),
      e
    );
  })(),
  xl = new Tl(),
  eo = (function () {
    function e() {}
    return (
      (e.prototype.getTracer = function (t, a, r) {
        var s;
        return (s = this.getDelegateTracer(t, a, r)) !== null && s !== void 0
          ? s
          : new Il(this, t, a, r);
      }),
      (e.prototype.getDelegate = function () {
        var t;
        return (t = this._delegate) !== null && t !== void 0 ? t : xl;
      }),
      (e.prototype.setDelegate = function (t) {
        this._delegate = t;
      }),
      (e.prototype.getDelegateTracer = function (t, a, r) {
        var s;
        return (s = this._delegate) === null || s === void 0 ? void 0 : s.getTracer(t, a, r);
      }),
      e
    );
  })(),
  _a;
(function (e) {
  ((e[(e.UNSET = 0)] = "UNSET"), (e[(e.OK = 1)] = "OK"), (e[(e.ERROR = 2)] = "ERROR"));
})(_a || (_a = {}));
var to = dr.getInstance(),
  Ka = "trace",
  _l = (function () {
    function e() {
      ((this._proxyTracerProvider = new eo()),
        (this.wrapSpanContext = yl),
        (this.isSpanContextValid = Uo),
        (this.deleteSpan = cl),
        (this.getSpan = cr),
        (this.getActiveSpan = pl),
        (this.getSpanContext = jo),
        (this.setSpan = fr),
        (this.setSpanContext = fl));
    }
    return (
      (e.getInstance = function () {
        return (this._instance || (this._instance = new e()), this._instance);
      }),
      (e.prototype.setGlobalTracerProvider = function (t) {
        var a = lr(Ka, this._proxyTracerProvider, xa.instance());
        return (a && this._proxyTracerProvider.setDelegate(t), a);
      }),
      (e.prototype.getTracerProvider = function () {
        return na(Ka) || this._proxyTracerProvider;
      }),
      (e.prototype.getTracer = function (t, a) {
        return this.getTracerProvider().getTracer(t, a);
      }),
      (e.prototype.disable = function () {
        (ur(Ka, xa.instance()), (this._proxyTracerProvider = new eo()));
      }),
      e
    );
  })(),
  Ml = _l.getInstance(),
  Sl = Object.defineProperty,
  El = (e, t) => {
    for (var a in t) Sl(e, a, { get: t[a], enumerable: !0 });
  },
  Vo = "AI_InvalidArgumentError",
  Go = `vercel.ai.error.${Vo}`,
  Rl = Symbol.for(Go),
  Jo,
  ae = class extends G {
    constructor({ parameter: e, value: t, message: a }) {
      (super({ name: Vo, message: `Invalid argument for parameter ${e}: ${a}` }),
        (this[Jo] = !0),
        (this.parameter = e),
        (this.value = t));
    }
    static isInstance(e) {
      return G.hasMarker(e, Go);
    }
  };
Jo = Rl;
var Wo = "AI_InvalidStreamPartError",
  Bo = `vercel.ai.error.${Wo}`,
  Cl = Symbol.for(Bo),
  Lo,
  Fd = class extends G {
    constructor({ chunk: e, message: t }) {
      (super({ name: Wo, message: t }), (this[Lo] = !0), (this.chunk = e));
    }
    static isInstance(e) {
      return G.hasMarker(e, Bo);
    }
  };
Lo = Cl;
var Ho = "AI_InvalidToolApprovalError",
  Yo = `vercel.ai.error.${Ho}`,
  Al = Symbol.for(Yo),
  Ko,
  Nl = class extends G {
    constructor({ approvalId: e }) {
      (super({
        name: Ho,
        message: `Tool approval response references unknown approvalId: "${e}". No matching tool-approval-request found in message history.`,
      }),
        (this[Ko] = !0),
        (this.approvalId = e));
    }
    static isInstance(e) {
      return G.hasMarker(e, Yo);
    }
  };
Ko = Al;
var zo = "AI_InvalidToolInputError",
  Xo = `vercel.ai.error.${zo}`,
  Ol = Symbol.for(Xo),
  Qo,
  mr = class extends G {
    constructor({
      toolInput: e,
      toolName: t,
      cause: a,
      message: r = `Invalid input for tool ${t}: ${ra(a)}`,
    }) {
      (super({ name: zo, message: r, cause: a }),
        (this[Qo] = !0),
        (this.toolInput = e),
        (this.toolName = t));
    }
    static isInstance(e) {
      return G.hasMarker(e, Xo);
    }
  };
Qo = Ol;
var Zo = "AI_ToolCallNotFoundForApprovalError",
  es = `vercel.ai.error.${Zo}`,
  kl = Symbol.for(es),
  ts,
  vr = class extends G {
    constructor({ toolCallId: e, approvalId: t }) {
      (super({ name: Zo, message: `Tool call "${e}" not found for approval request "${t}".` }),
        (this[ts] = !0),
        (this.toolCallId = e),
        (this.approvalId = t));
    }
    static isInstance(e) {
      return G.hasMarker(e, es);
    }
  };
ts = kl;
var as = "AI_MissingToolResultsError",
  rs = `vercel.ai.error.${as}`,
  Pl = Symbol.for(rs),
  os,
  ao = class extends G {
    constructor({ toolCallIds: e }) {
      (super({
        name: as,
        message: `Tool result${e.length > 1 ? "s are" : " is"} missing for tool call${e.length > 1 ? "s" : ""} ${e.join(", ")}.`,
      }),
        (this[os] = !0),
        (this.toolCallIds = e));
    }
    static isInstance(e) {
      return G.hasMarker(e, rs);
    }
  };
os = Pl;
var ss = "AI_NoImageGeneratedError",
  ns = `vercel.ai.error.${ss}`,
  ql = Symbol.for(ns),
  is,
  Dl = class extends G {
    constructor({ message: e = "No image generated.", cause: t, responses: a }) {
      (super({ name: ss, message: e, cause: t }), (this[is] = !0), (this.responses = a));
    }
    static isInstance(e) {
      return G.hasMarker(e, ns);
    }
  };
is = ql;
var ls = "AI_NoObjectGeneratedError",
  us = `vercel.ai.error.${ls}`,
  $l = Symbol.for(us),
  ds,
  $e = class extends G {
    constructor({
      message: e = "No object generated.",
      cause: t,
      text: a,
      response: r,
      usage: s,
      finishReason: o,
    }) {
      (super({ name: ls, message: e, cause: t }),
        (this[ds] = !0),
        (this.text = a),
        (this.response = r),
        (this.usage = s),
        (this.finishReason = o));
    }
    static isInstance(e) {
      return G.hasMarker(e, us);
    }
  };
ds = $l;
var ps = "AI_NoOutputGeneratedError",
  cs = `vercel.ai.error.${ps}`,
  jl = Symbol.for(cs),
  fs,
  ms = class extends G {
    constructor({ message: e = "No output generated.", cause: t } = {}) {
      (super({ name: ps, message: e, cause: t }), (this[fs] = !0));
    }
    static isInstance(e) {
      return G.hasMarker(e, cs);
    }
  };
fs = jl;
var vs = "AI_NoSpeechGeneratedError",
  hs = `vercel.ai.error.${vs}`,
  Ul = Symbol.for(hs),
  gs,
  Fl = class extends G {
    constructor(e) {
      (super({ name: vs, message: "No speech audio generated." }),
        (this[gs] = !0),
        (this.responses = e.responses));
    }
    static isInstance(e) {
      return G.hasMarker(e, hs);
    }
  };
gs = Ul;
var ys = "AI_NoTranscriptGeneratedError",
  ws = `vercel.ai.error.${ys}`,
  Vl = Symbol.for(ws),
  bs,
  Gl = class extends G {
    constructor(e) {
      (super({ name: ys, message: "No transcript generated." }),
        (this[bs] = !0),
        (this.responses = e.responses));
    }
    static isInstance(e) {
      return G.hasMarker(e, ws);
    }
  };
bs = Vl;
var er = "AI_NoVideoGeneratedError",
  Is = `vercel.ai.error.${er}`,
  Jl = Symbol.for(Is),
  Ts,
  Wl = class extends G {
    constructor({ message: e = "No video generated.", cause: t, responses: a }) {
      (super({ name: er, message: e, cause: t }), (this[Ts] = !0), (this.responses = a));
    }
    static isInstance(e) {
      return G.hasMarker(e, Is);
    }
    static isNoVideoGeneratedError(e) {
      return e instanceof Error && e.name === er && typeof e.responses < "u";
    }
    toJSON() {
      return {
        name: this.name,
        message: this.message,
        stack: this.stack,
        cause: this.cause,
        responses: this.responses,
      };
    }
  };
Ts = Jl;
var xs = "AI_NoSuchToolError",
  _s = `vercel.ai.error.${xs}`,
  Bl = Symbol.for(_s),
  Ms,
  tr = class extends G {
    constructor({
      toolName: e,
      availableTools: t = void 0,
      message:
        a = `Model tried to call unavailable tool '${e}'. ${t === void 0 ? "No tools are available." : `Available tools: ${t.join(", ")}.`}`,
    }) {
      (super({ name: xs, message: a }),
        (this[Ms] = !0),
        (this.toolName = e),
        (this.availableTools = t));
    }
    static isInstance(e) {
      return G.hasMarker(e, _s);
    }
  };
Ms = Bl;
var Ss = "AI_ToolCallRepairError",
  Es = `vercel.ai.error.${Ss}`,
  Ll = Symbol.for(Es),
  Rs,
  Hl = class extends G {
    constructor({
      cause: e,
      originalError: t,
      message: a = `Error repairing tool call: ${ra(e)}`,
    }) {
      (super({ name: Ss, message: a, cause: e }), (this[Rs] = !0), (this.originalError = t));
    }
    static isInstance(e) {
      return G.hasMarker(e, Es);
    }
  };
Rs = Ll;
var Wt = class extends G {
    constructor(e) {
      (super({
        name: "AI_UnsupportedModelVersionError",
        message: `Unsupported model version ${e.version} for provider "${e.provider}" and model "${e.modelId}". AI SDK 5 only supports models that implement specification version "v2".`,
      }),
        (this.version = e.version),
        (this.provider = e.provider),
        (this.modelId = e.modelId));
    }
  },
  Cs = "AI_UIMessageStreamError",
  As = `vercel.ai.error.${Cs}`,
  Yl = Symbol.for(As),
  Ns,
  Ft = class extends G {
    constructor({ chunkType: e, chunkId: t, message: a }) {
      (super({ name: Cs, message: a }), (this[Ns] = !0), (this.chunkType = e), (this.chunkId = t));
    }
    static isInstance(e) {
      return G.hasMarker(e, As);
    }
  };
Ns = Yl;
var Os = "AI_InvalidDataContentError",
  ks = `vercel.ai.error.${Os}`,
  Kl = Symbol.for(ks),
  Ps,
  ro = class extends G {
    constructor({
      content: e,
      cause: t,
      message:
        a = `Invalid data content. Expected a base64 string, Uint8Array, ArrayBuffer, or Buffer, but got ${typeof e}.`,
    }) {
      (super({ name: Os, message: a, cause: t }), (this[Ps] = !0), (this.content = e));
    }
    static isInstance(e) {
      return G.hasMarker(e, ks);
    }
  };
Ps = Kl;
var qs = "AI_InvalidMessageRoleError",
  Ds = `vercel.ai.error.${qs}`,
  zl = Symbol.for(Ds),
  $s,
  Xl = class extends G {
    constructor({
      role: e,
      message:
        t = `Invalid message role: '${e}'. Must be one of: "system", "user", "assistant", "tool".`,
    }) {
      (super({ name: qs, message: t }), (this[$s] = !0), (this.role = e));
    }
    static isInstance(e) {
      return G.hasMarker(e, Ds);
    }
  };
$s = zl;
var js = "AI_MessageConversionError",
  Us = `vercel.ai.error.${js}`,
  Ql = Symbol.for(Us),
  Fs,
  Zl = class extends G {
    constructor({ originalMessage: e, message: t }) {
      (super({ name: js, message: t }), (this[Fs] = !0), (this.originalMessage = e));
    }
    static isInstance(e) {
      return G.hasMarker(e, Us);
    }
  };
Fs = Ql;
var Vs = "AI_RetryError",
  Gs = `vercel.ai.error.${Vs}`,
  eu = Symbol.for(Gs),
  Js,
  oo = class extends G {
    constructor({ message: e, reason: t, errors: a }) {
      (super({ name: Vs, message: e }),
        (this[Js] = !0),
        (this.reason = t),
        (this.errors = a),
        (this.lastError = a[a.length - 1]));
    }
    static isInstance(e) {
      return G.hasMarker(e, Gs);
    }
  };
Js = eu;
function tu({ warning: e, provider: t, model: a }) {
  const r = `AI SDK Warning (${t} / ${a}):`;
  switch (e.type) {
    case "unsupported": {
      let s = `${r} The feature "${e.feature}" is not supported.`;
      return (e.details && (s += ` ${e.details}`), s);
    }
    case "compatibility": {
      let s = `${r} The feature "${e.feature}" is used in a compatibility mode.`;
      return (e.details && (s += ` ${e.details}`), s);
    }
    case "other":
      return `${r} ${e.message}`;
    default:
      return `${r} ${JSON.stringify(e, null, 2)}`;
  }
}
var au =
    "AI SDK Warning System: To turn off warning logging, set the AI_SDK_LOG_WARNINGS global to false.",
  so = !1,
  Fe = (e) => {
    if (e.warnings.length === 0) return;
    const t = globalThis.AI_SDK_LOG_WARNINGS;
    if (t !== !1) {
      if (typeof t == "function") {
        t(e);
        return;
      }
      so || ((so = !0), console.info(au));
      for (const a of e.warnings)
        console.warn(tu({ warning: a, provider: e.provider, model: e.model }));
    }
  };
function ua({ provider: e, modelId: t }) {
  Fe({
    warnings: [
      {
        type: "compatibility",
        feature: "specificationVersion",
        details: "Using v2 specification compatibility mode. Some features may not be available.",
      },
    ],
    provider: e,
    model: t,
  });
}
function Ws(e) {
  return e.specificationVersion === "v3"
    ? e
    : (ua({ provider: e.provider, modelId: e.modelId }),
      new Proxy(e, {
        get(t, a) {
          return a === "specificationVersion" ? "v3" : t[a];
        },
      }));
}
function Bs(e) {
  return e.specificationVersion === "v3"
    ? e
    : (ua({ provider: e.provider, modelId: e.modelId }),
      new Proxy(e, {
        get(t, a) {
          return a === "specificationVersion" ? "v3" : t[a];
        },
      }));
}
function Ls(e) {
  return e.specificationVersion === "v3"
    ? e
    : (ua({ provider: e.provider, modelId: e.modelId }),
      new Proxy(e, {
        get(t, a) {
          switch (a) {
            case "specificationVersion":
              return "v3";
            case "doGenerate":
              return async (...r) => {
                const s = await t.doGenerate(...r);
                return { ...s, finishReason: Hs(s.finishReason), usage: Ys(s.usage) };
              };
            case "doStream":
              return async (...r) => {
                const s = await t.doStream(...r);
                return { ...s, stream: ru(s.stream) };
              };
            default:
              return t[a];
          }
        },
      }));
}
function ru(e) {
  return e.pipeThrough(
    new TransformStream({
      transform(t, a) {
        switch (t.type) {
          case "finish":
            a.enqueue({ ...t, finishReason: Hs(t.finishReason), usage: Ys(t.usage) });
            break;
          default:
            a.enqueue(t);
            break;
        }
      },
    })
  );
}
function Hs(e) {
  return { unified: e === "unknown" ? "other" : e, raw: void 0 };
}
function Ys(e) {
  return {
    inputTokens: {
      total: e.inputTokens,
      noCache: void 0,
      cacheRead: e.cachedInputTokens,
      cacheWrite: void 0,
    },
    outputTokens: { total: e.outputTokens, text: void 0, reasoning: e.reasoningTokens },
  };
}
function Ks(e) {
  return e.specificationVersion === "v3"
    ? e
    : (ua({ provider: e.provider, modelId: e.modelId }),
      new Proxy(e, {
        get(t, a) {
          return a === "specificationVersion" ? "v3" : t[a];
        },
      }));
}
function zs(e) {
  return e.specificationVersion === "v3"
    ? e
    : (ua({ provider: e.provider, modelId: e.modelId }),
      new Proxy(e, {
        get(t, a) {
          return a === "specificationVersion" ? "v3" : t[a];
        },
      }));
}
function Gt(e) {
  if (typeof e != "string") {
    if (e.specificationVersion !== "v3" && e.specificationVersion !== "v2") {
      const t = e;
      throw new Wt({ version: t.specificationVersion, provider: t.provider, modelId: t.modelId });
    }
    return Ls(e);
  }
  return da().languageModel(e);
}
function Xs(e) {
  if (typeof e != "string") {
    if (e.specificationVersion !== "v3" && e.specificationVersion !== "v2") {
      const t = e;
      throw new Wt({ version: t.specificationVersion, provider: t.provider, modelId: t.modelId });
    }
    return Ws(e);
  }
  return da().embeddingModel(e);
}
function ou(e) {
  var t, a;
  if (typeof e != "string") {
    if (e.specificationVersion !== "v3" && e.specificationVersion !== "v2") {
      const r = e;
      throw new Wt({ version: r.specificationVersion, provider: r.provider, modelId: r.modelId });
    }
    return zs(e);
  }
  return (a = (t = da()).transcriptionModel) == null ? void 0 : a.call(t, e);
}
function su(e) {
  var t, a;
  if (typeof e != "string") {
    if (e.specificationVersion !== "v3" && e.specificationVersion !== "v2") {
      const r = e;
      throw new Wt({ version: r.specificationVersion, provider: r.provider, modelId: r.modelId });
    }
    return Ks(e);
  }
  return (a = (t = da()).speechModel) == null ? void 0 : a.call(t, e);
}
function nu(e) {
  if (typeof e != "string") {
    if (e.specificationVersion !== "v3" && e.specificationVersion !== "v2") {
      const t = e;
      throw new Wt({ version: t.specificationVersion, provider: t.provider, modelId: t.modelId });
    }
    return Bs(e);
  }
  return da().imageModel(e);
}
function iu(e) {
  if (typeof e == "string")
    throw new Error(
      'Video models cannot be resolved from strings. Please use a Experimental_VideoModelV3 object from a provider (e.g., fal.video("model-id")).'
    );
  if (e.specificationVersion !== "v3") {
    const t = e;
    throw new Wt({ version: t.specificationVersion, provider: t.provider, modelId: t.modelId });
  }
  return e;
}
function da() {
  var e;
  return (e = globalThis.AI_SDK_DEFAULT_PROVIDER) != null ? e : Gi;
}
function hr(e) {
  if (e != null) return typeof e == "number" ? e : e.totalMs;
}
function Qs(e) {
  if (!(e == null || typeof e == "number")) return e.stepMs;
}
function lu(e) {
  if (!(e == null || typeof e == "number")) return e.chunkMs;
}
var Jt = [
    { mediaType: "image/gif", bytesPrefix: [71, 73, 70] },
    { mediaType: "image/png", bytesPrefix: [137, 80, 78, 71] },
    { mediaType: "image/jpeg", bytesPrefix: [255, 216] },
    {
      mediaType: "image/webp",
      bytesPrefix: [82, 73, 70, 70, null, null, null, null, 87, 69, 66, 80],
    },
    { mediaType: "image/bmp", bytesPrefix: [66, 77] },
    { mediaType: "image/tiff", bytesPrefix: [73, 73, 42, 0] },
    { mediaType: "image/tiff", bytesPrefix: [77, 77, 0, 42] },
    { mediaType: "image/avif", bytesPrefix: [0, 0, 0, 32, 102, 116, 121, 112, 97, 118, 105, 102] },
    { mediaType: "image/heic", bytesPrefix: [0, 0, 0, 32, 102, 116, 121, 112, 104, 101, 105, 99] },
  ],
  Zs = [
    { mediaType: "audio/mpeg", bytesPrefix: [255, 251] },
    { mediaType: "audio/mpeg", bytesPrefix: [255, 250] },
    { mediaType: "audio/mpeg", bytesPrefix: [255, 243] },
    { mediaType: "audio/mpeg", bytesPrefix: [255, 242] },
    { mediaType: "audio/mpeg", bytesPrefix: [255, 227] },
    { mediaType: "audio/mpeg", bytesPrefix: [255, 226] },
    {
      mediaType: "audio/wav",
      bytesPrefix: [82, 73, 70, 70, null, null, null, null, 87, 65, 86, 69],
    },
    { mediaType: "audio/ogg", bytesPrefix: [79, 103, 103, 83] },
    { mediaType: "audio/flac", bytesPrefix: [102, 76, 97, 67] },
    { mediaType: "audio/aac", bytesPrefix: [64, 21, 0, 0] },
    { mediaType: "audio/mp4", bytesPrefix: [102, 116, 121, 112] },
    { mediaType: "audio/webm", bytesPrefix: [26, 69, 223, 163] },
  ],
  no = [
    { mediaType: "video/mp4", bytesPrefix: [0, 0, 0, null, 102, 116, 121, 112] },
    { mediaType: "video/webm", bytesPrefix: [26, 69, 223, 163] },
    { mediaType: "video/quicktime", bytesPrefix: [0, 0, 0, 20, 102, 116, 121, 112, 113, 116] },
    { mediaType: "video/x-msvideo", bytesPrefix: [82, 73, 70, 70] },
  ],
  uu = (e) => {
    const t = typeof e == "string" ? Rt(e) : e,
      a = ((t[6] & 127) << 21) | ((t[7] & 127) << 14) | ((t[8] & 127) << 7) | (t[9] & 127);
    return t.slice(a + 10);
  };
function du(e) {
  return (typeof e == "string" && e.startsWith("SUQz")) ||
    (typeof e != "string" && e.length > 10 && e[0] === 73 && e[1] === 68 && e[2] === 51)
    ? uu(e)
    : e;
}
function it({ data: e, signatures: t }) {
  const a = du(e),
    r = typeof a == "string" ? Rt(a.substring(0, Math.min(a.length, 24))) : a;
  for (const s of t)
    if (r.length >= s.bytesPrefix.length && s.bytesPrefix.every((o, i) => o === null || r[i] === o))
      return s.mediaType;
}
var Le = "6.0.72",
  gr = async ({ url: e }) => {
    var t;
    const a = e.toString();
    try {
      const r = await fetch(a, { headers: je({}, `ai-sdk/${Le}`, ba()) });
      if (!r.ok) throw new Ja({ url: a, statusCode: r.status, statusText: r.statusText });
      return {
        data: new Uint8Array(await r.arrayBuffer()),
        mediaType: (t = r.headers.get("content-type")) != null ? t : void 0,
      };
    } catch (r) {
      throw Ja.isInstance(r) ? r : new Ja({ url: a, cause: r });
    }
  },
  pu =
    (e = gr) =>
    (t) =>
      Promise.all(t.map(async (a) => (a.isUrlSupportedByModel ? null : e(a))));
function yr(e) {
  try {
    const [t, a] = e.split(",");
    return { mediaType: t.split(";")[0].split(":")[1], base64Content: a };
  } catch {
    return { mediaType: void 0, base64Content: void 0 };
  }
}
var en = ce([
  f(),
  Ta(Uint8Array),
  Ta(ArrayBuffer),
  Mo(
    (e) => {
      var t, a;
      return (a = (t = globalThis.Buffer) == null ? void 0 : t.isBuffer(e)) != null ? a : !1;
    },
    { message: "Must be a Buffer" }
  ),
]);
function tn(e) {
  if (e instanceof Uint8Array) return { data: e, mediaType: void 0 };
  if (e instanceof ArrayBuffer) return { data: new Uint8Array(e), mediaType: void 0 };
  if (typeof e == "string")
    try {
      e = new URL(e);
    } catch {}
  if (e instanceof URL && e.protocol === "data:") {
    const { mediaType: t, base64Content: a } = yr(e.toString());
    if (t == null || a == null)
      throw new G({
        name: "InvalidDataContentError",
        message: `Invalid data URL format in content ${e.toString()}`,
      });
    return { data: a, mediaType: t };
  }
  return { data: e, mediaType: void 0 };
}
function cu(e) {
  return typeof e == "string" ? e : e instanceof ArrayBuffer ? aa(new Uint8Array(e)) : aa(e);
}
function an(e) {
  if (e instanceof Uint8Array) return e;
  if (typeof e == "string")
    try {
      return Rt(e);
    } catch (t) {
      throw new ro({
        message: "Invalid data content. Content string is not a base64-encoded media.",
        content: e,
        cause: t,
      });
    }
  if (e instanceof ArrayBuffer) return new Uint8Array(e);
  throw new ro({ content: e });
}
function wt(e) {
  return e === void 0 ? [] : Array.isArray(e) ? e : [e];
}
async function Aa({ prompt: e, supportedUrls: t, download: a = pu() }) {
  const r = await mu(e.messages, a, t),
    s = new Map();
  for (const u of e.messages)
    if (u.role === "assistant" && Array.isArray(u.content))
      for (const p of u.content)
        p.type === "tool-approval-request" &&
          "approvalId" in p &&
          "toolCallId" in p &&
          s.set(p.approvalId, p.toolCallId);
  const o = new Set();
  for (const u of e.messages)
    if (u.role === "tool") {
      for (const p of u.content)
        if (p.type === "tool-approval-response") {
          const c = s.get(p.approvalId);
          c && o.add(c);
        }
    }
  const i = [
      ...(e.system != null
        ? typeof e.system == "string"
          ? [{ role: "system", content: e.system }]
          : wt(e.system).map((u) => ({
              role: "system",
              content: u.content,
              providerOptions: u.providerOptions,
            }))
        : []),
      ...e.messages.map((u) => fu({ message: u, downloadedAssets: r })),
    ],
    n = [];
  for (const u of i) {
    if (u.role !== "tool") {
      n.push(u);
      continue;
    }
    const p = n.at(-1);
    p?.role === "tool" ? p.content.push(...u.content) : n.push(u);
  }
  const l = new Set();
  for (const u of n)
    switch (u.role) {
      case "assistant": {
        for (const p of u.content)
          p.type === "tool-call" && !p.providerExecuted && l.add(p.toolCallId);
        break;
      }
      case "tool": {
        for (const p of u.content) p.type === "tool-result" && l.delete(p.toolCallId);
        break;
      }
      case "user":
      case "system":
        for (const p of o) l.delete(p);
        if (l.size > 0) throw new ao({ toolCallIds: Array.from(l) });
        break;
    }
  for (const u of o) l.delete(u);
  if (l.size > 0) throw new ao({ toolCallIds: Array.from(l) });
  return n.filter((u) => u.role !== "tool" || u.content.length > 0);
}
function fu({ message: e, downloadedAssets: t }) {
  const a = e.role;
  switch (a) {
    case "system":
      return { role: "system", content: e.content, providerOptions: e.providerOptions };
    case "user":
      return typeof e.content == "string"
        ? {
            role: "user",
            content: [{ type: "text", text: e.content }],
            providerOptions: e.providerOptions,
          }
        : {
            role: "user",
            content: e.content
              .map((r) => vu(r, t))
              .filter((r) => r.type !== "text" || r.text !== ""),
            providerOptions: e.providerOptions,
          };
    case "assistant":
      return typeof e.content == "string"
        ? {
            role: "assistant",
            content: [{ type: "text", text: e.content }],
            providerOptions: e.providerOptions,
          }
        : {
            role: "assistant",
            content: e.content
              .filter((r) => r.type !== "text" || r.text !== "" || r.providerOptions != null)
              .filter((r) => r.type !== "tool-approval-request")
              .map((r) => {
                const s = r.providerOptions;
                switch (r.type) {
                  case "file": {
                    const { data: o, mediaType: i } = tn(r.data);
                    return {
                      type: "file",
                      data: o,
                      filename: r.filename,
                      mediaType: i ?? r.mediaType,
                      providerOptions: s,
                    };
                  }
                  case "reasoning":
                    return { type: "reasoning", text: r.text, providerOptions: s };
                  case "text":
                    return { type: "text", text: r.text, providerOptions: s };
                  case "tool-call":
                    return {
                      type: "tool-call",
                      toolCallId: r.toolCallId,
                      toolName: r.toolName,
                      input: r.input,
                      providerExecuted: r.providerExecuted,
                      providerOptions: s,
                    };
                  case "tool-result":
                    return {
                      type: "tool-result",
                      toolCallId: r.toolCallId,
                      toolName: r.toolName,
                      output: io(r.output),
                      providerOptions: s,
                    };
                }
              }),
            providerOptions: e.providerOptions,
          };
    case "tool":
      return {
        role: "tool",
        content: e.content
          .filter((r) => r.type !== "tool-approval-response" || r.providerExecuted)
          .map((r) => {
            switch (r.type) {
              case "tool-result":
                return {
                  type: "tool-result",
                  toolCallId: r.toolCallId,
                  toolName: r.toolName,
                  output: io(r.output),
                  providerOptions: r.providerOptions,
                };
              case "tool-approval-response":
                return {
                  type: "tool-approval-response",
                  approvalId: r.approvalId,
                  approved: r.approved,
                  reason: r.reason,
                };
            }
          }),
        providerOptions: e.providerOptions,
      };
    default: {
      const r = a;
      throw new Xl({ role: r });
    }
  }
}
async function mu(e, t, a) {
  const r = e
      .filter((o) => o.role === "user")
      .map((o) => o.content)
      .filter((o) => Array.isArray(o))
      .flat()
      .filter((o) => o.type === "image" || o.type === "file")
      .map((o) => {
        var i;
        const n = (i = o.mediaType) != null ? i : o.type === "image" ? "image/*" : void 0;
        let l = o.type === "image" ? o.image : o.data;
        if (typeof l == "string")
          try {
            l = new URL(l);
          } catch {}
        return { mediaType: n, data: l };
      })
      .filter((o) => o.data instanceof URL)
      .map((o) => ({
        url: o.data,
        isUrlSupportedByModel:
          o.mediaType != null &&
          Yn({ url: o.data.toString(), mediaType: o.mediaType, supportedUrls: a }),
      })),
    s = await t(r);
  return Object.fromEntries(
    s
      .map((o, i) =>
        o == null ? null : [r[i].url.toString(), { data: o.data, mediaType: o.mediaType }]
      )
      .filter((o) => o != null)
  );
}
function vu(e, t) {
  var a;
  if (e.type === "text") return { type: "text", text: e.text, providerOptions: e.providerOptions };
  let r;
  const s = e.type;
  switch (s) {
    case "image":
      r = e.image;
      break;
    case "file":
      r = e.data;
      break;
    default:
      throw new Error(`Unsupported part type: ${s}`);
  }
  const { data: o, mediaType: i } = tn(r);
  let n = i ?? e.mediaType,
    l = o;
  if (l instanceof URL) {
    const u = t[l.toString()];
    u && ((l = u.data), n ?? (n = u.mediaType));
  }
  switch (s) {
    case "image":
      return (
        (l instanceof Uint8Array || typeof l == "string") &&
          (n = (a = it({ data: l, signatures: Jt })) != null ? a : n),
        {
          type: "file",
          mediaType: n ?? "image/*",
          filename: void 0,
          data: l,
          providerOptions: e.providerOptions,
        }
      );
    case "file": {
      if (n == null) throw new Error("Media type is missing for file part");
      return {
        type: "file",
        mediaType: n,
        filename: e.filename,
        data: l,
        providerOptions: e.providerOptions,
      };
    }
  }
}
function io(e) {
  return e.type !== "content"
    ? e
    : {
        type: "content",
        value: e.value.map((t) =>
          t.type !== "media"
            ? t
            : t.mediaType.startsWith("image/")
              ? { type: "image-data", data: t.data, mediaType: t.mediaType }
              : { type: "file-data", data: t.data, mediaType: t.mediaType }
        ),
      };
}
async function Mt({ toolCallId: e, input: t, output: a, tool: r, errorMode: s }) {
  return s === "text"
    ? { type: "error-text", value: ra(a) }
    : s === "json"
      ? { type: "error-json", value: lo(a) }
      : r?.toModelOutput
        ? await r.toModelOutput({ toolCallId: e, input: t, output: a })
        : typeof a == "string"
          ? { type: "text", value: a }
          : { type: "json", value: lo(a) };
}
function lo(e) {
  return e === void 0 ? null : e;
}
function Nt({
  maxOutputTokens: e,
  temperature: t,
  topP: a,
  topK: r,
  presencePenalty: s,
  frequencyPenalty: o,
  seed: i,
  stopSequences: n,
}) {
  if (e != null) {
    if (!Number.isInteger(e))
      throw new ae({
        parameter: "maxOutputTokens",
        value: e,
        message: "maxOutputTokens must be an integer",
      });
    if (e < 1)
      throw new ae({
        parameter: "maxOutputTokens",
        value: e,
        message: "maxOutputTokens must be >= 1",
      });
  }
  if (t != null && typeof t != "number")
    throw new ae({ parameter: "temperature", value: t, message: "temperature must be a number" });
  if (a != null && typeof a != "number")
    throw new ae({ parameter: "topP", value: a, message: "topP must be a number" });
  if (r != null && typeof r != "number")
    throw new ae({ parameter: "topK", value: r, message: "topK must be a number" });
  if (s != null && typeof s != "number")
    throw new ae({
      parameter: "presencePenalty",
      value: s,
      message: "presencePenalty must be a number",
    });
  if (o != null && typeof o != "number")
    throw new ae({
      parameter: "frequencyPenalty",
      value: o,
      message: "frequencyPenalty must be a number",
    });
  if (i != null && !Number.isInteger(i))
    throw new ae({ parameter: "seed", value: i, message: "seed must be an integer" });
  return {
    maxOutputTokens: e,
    temperature: t,
    topP: a,
    topK: r,
    presencePenalty: s,
    frequencyPenalty: o,
    stopSequences: n,
    seed: i,
  };
}
function hu(e) {
  return e != null && Object.keys(e).length > 0;
}
async function rn({ tools: e, toolChoice: t, activeTools: a }) {
  if (!hu(e)) return { tools: void 0, toolChoice: void 0 };
  const r = a != null ? Object.entries(e).filter(([o]) => a.includes(o)) : Object.entries(e),
    s = [];
  for (const [o, i] of r) {
    const n = i.type;
    switch (n) {
      case void 0:
      case "dynamic":
      case "function":
        s.push({
          type: "function",
          name: o,
          description: i.description,
          inputSchema: await Ct(i.inputSchema).jsonSchema,
          ...(i.inputExamples != null ? { inputExamples: i.inputExamples } : {}),
          providerOptions: i.providerOptions,
          ...(i.strict != null ? { strict: i.strict } : {}),
        });
        break;
      case "provider":
        s.push({ type: "provider", name: o, id: i.id, args: i.args });
        break;
      default: {
        const l = n;
        throw new Error(`Unsupported tool type: ${l}`);
      }
    }
  }
  return {
    tools: s,
    toolChoice:
      t == null
        ? { type: "auto" }
        : typeof t == "string"
          ? { type: t }
          : { type: "tool", toolName: t.toolName },
  };
}
var ia = zn(() => ce([Qn(), f(), Pe(), L(), ft(f(), ia.optional()), oe(ia)])),
  N = ft(f(), ft(f(), ia.optional())),
  on = I({ type: w("text"), text: f(), providerOptions: N.optional() }),
  gu = I({
    type: w("image"),
    image: ce([en, Ta(URL)]),
    mediaType: f().optional(),
    providerOptions: N.optional(),
  }),
  sn = I({
    type: w("file"),
    data: ce([en, Ta(URL)]),
    filename: f().optional(),
    mediaType: f(),
    providerOptions: N.optional(),
  }),
  yu = I({ type: w("reasoning"), text: f(), providerOptions: N.optional() }),
  wu = I({
    type: w("tool-call"),
    toolCallId: f(),
    toolName: f(),
    input: J(),
    providerOptions: N.optional(),
    providerExecuted: L().optional(),
  }),
  bu = Xn("type", [
    I({ type: w("text"), value: f(), providerOptions: N.optional() }),
    I({ type: w("json"), value: ia, providerOptions: N.optional() }),
    I({ type: w("execution-denied"), reason: f().optional(), providerOptions: N.optional() }),
    I({ type: w("error-text"), value: f(), providerOptions: N.optional() }),
    I({ type: w("error-json"), value: ia, providerOptions: N.optional() }),
    I({
      type: w("content"),
      value: oe(
        ce([
          I({ type: w("text"), text: f(), providerOptions: N.optional() }),
          I({ type: w("media"), data: f(), mediaType: f() }),
          I({
            type: w("file-data"),
            data: f(),
            mediaType: f(),
            filename: f().optional(),
            providerOptions: N.optional(),
          }),
          I({ type: w("file-url"), url: f(), providerOptions: N.optional() }),
          I({ type: w("file-id"), fileId: ce([f(), ft(f(), f())]), providerOptions: N.optional() }),
          I({ type: w("image-data"), data: f(), mediaType: f(), providerOptions: N.optional() }),
          I({ type: w("image-url"), url: f(), providerOptions: N.optional() }),
          I({
            type: w("image-file-id"),
            fileId: ce([f(), ft(f(), f())]),
            providerOptions: N.optional(),
          }),
          I({ type: w("custom"), providerOptions: N.optional() }),
        ])
      ),
    }),
  ]),
  nn = I({
    type: w("tool-result"),
    toolCallId: f(),
    toolName: f(),
    output: bu,
    providerOptions: N.optional(),
  }),
  Iu = I({ type: w("tool-approval-request"), approvalId: f(), toolCallId: f() }),
  Tu = I({
    type: w("tool-approval-response"),
    approvalId: f(),
    approved: L(),
    reason: f().optional(),
  }),
  xu = I({ role: w("system"), content: f(), providerOptions: N.optional() }),
  _u = I({
    role: w("user"),
    content: ce([f(), oe(ce([on, gu, sn]))]),
    providerOptions: N.optional(),
  }),
  Mu = I({
    role: w("assistant"),
    content: ce([f(), oe(ce([on, sn, yu, wu, nn, Iu]))]),
    providerOptions: N.optional(),
  }),
  Su = I({ role: w("tool"), content: oe(ce([nn, Tu])), providerOptions: N.optional() }),
  Eu = ce([xu, _u, Mu, Su]);
async function Na(e) {
  if (e.prompt == null && e.messages == null)
    throw new Ut({ prompt: e, message: "prompt or messages must be defined" });
  if (e.prompt != null && e.messages != null)
    throw new Ut({ prompt: e, message: "prompt and messages cannot be defined at the same time" });
  if (
    e.system != null &&
    typeof e.system != "string" &&
    !wt(e.system).every(
      (r) => typeof r == "object" && r !== null && "role" in r && r.role === "system"
    )
  )
    throw new Ut({
      prompt: e,
      message: "system must be a string, SystemModelMessage, or array of SystemModelMessage",
    });
  let t;
  if (e.prompt != null && typeof e.prompt == "string") t = [{ role: "user", content: e.prompt }];
  else if (e.prompt != null && Array.isArray(e.prompt)) t = e.prompt;
  else if (e.messages != null) t = e.messages;
  else throw new Ut({ prompt: e, message: "prompt or messages must be defined" });
  if (t.length === 0) throw new Ut({ prompt: e, message: "messages must not be empty" });
  const a = await Ze({ value: t, schema: oe(Eu) });
  if (!a.success)
    throw new Ut({
      prompt: e,
      message: "The messages do not match the ModelMessage[] schema.",
      cause: a.error,
    });
  return { messages: t, system: e.system };
}
function Oa(e) {
  if (!ir.isInstance(e)) return e;
  const t = (process == null ? void 0 : "production") === "production",
    a = "https://ai-sdk.dev/unauthenticated-ai-gateway";
  return t
    ? new G({
        name: "GatewayError",
        message: `Unauthenticated. Configure AI_GATEWAY_API_KEY or use a provider module. Learn more: ${a}`,
      })
    : Object.assign(
        new Error(`\x1B[1m\x1B[31mUnauthenticated request to AI Gateway.\x1B[0m

To authenticate, set the \x1B[33mAI_GATEWAY_API_KEY\x1B[0m environment variable with your API key.

Alternatively, you can use a provider module instead of the AI Gateway.

Learn more: \x1B[34m${a}\x1B[0m

`),
        { name: "GatewayAuthenticationError" }
      );
}
function Ee({ operationId: e, telemetry: t }) {
  return {
    "operation.name": `${e}${t?.functionId != null ? ` ${t.functionId}` : ""}`,
    "resource.name": t?.functionId,
    "ai.operationId": e,
    "ai.telemetry.functionId": t?.functionId,
  };
}
function Ot({ model: e, settings: t, telemetry: a, headers: r }) {
  var s;
  return {
    "ai.model.provider": e.provider,
    "ai.model.id": e.modelId,
    ...Object.entries(t).reduce((o, [i, n]) => {
      if (i === "timeout") {
        const l = hr(n);
        l != null && (o[`ai.settings.${i}`] = l);
      } else o[`ai.settings.${i}`] = n;
      return o;
    }, {}),
    ...Object.entries((s = a?.metadata) != null ? s : {}).reduce(
      (o, [i, n]) => ((o[`ai.telemetry.metadata.${i}`] = n), o),
      {}
    ),
    ...Object.entries(r ?? {}).reduce(
      (o, [i, n]) => (n !== void 0 && (o[`ai.request.headers.${i}`] = n), o),
      {}
    ),
  };
}
var Ru = {
    startSpan() {
      return ha;
    },
    startActiveSpan(e, t, a, r) {
      if (typeof t == "function") return t(ha);
      if (typeof a == "function") return a(ha);
      if (typeof r == "function") return r(ha);
    },
  },
  ha = {
    spanContext() {
      return Cu;
    },
    setAttribute() {
      return this;
    },
    setAttributes() {
      return this;
    },
    addEvent() {
      return this;
    },
    addLink() {
      return this;
    },
    addLinks() {
      return this;
    },
    setStatus() {
      return this;
    },
    updateName() {
      return this;
    },
    end() {
      return this;
    },
    isRecording() {
      return !1;
    },
    recordException() {
      return this;
    },
  },
  Cu = { traceId: "", spanId: "", traceFlags: 0 };
function kt({ isEnabled: e = !1, tracer: t } = {}) {
  return e ? t || Ml.getTracer("ai") : Ru;
}
async function Re({ name: e, tracer: t, attributes: a, fn: r, endWhenDone: s = !0 }) {
  return t.startActiveSpan(e, { attributes: await a }, async (o) => {
    const i = to.active();
    try {
      const n = await to.with(i, () => r(o));
      return (s && o.end(), n);
    } catch (n) {
      try {
        ln(o, n);
      } finally {
        o.end();
      }
      throw n;
    }
  });
}
function ln(e, t) {
  t instanceof Error
    ? (e.recordException({ name: t.name, message: t.message, stack: t.stack }),
      e.setStatus({ code: _a.ERROR, message: t.message }))
    : e.setStatus({ code: _a.ERROR });
}
async function Y({ telemetry: e, attributes: t }) {
  if (e?.isEnabled !== !0) return {};
  const a = {};
  for (const [r, s] of Object.entries(t))
    if (s != null) {
      if (typeof s == "object" && "input" in s && typeof s.input == "function") {
        if (e?.recordInputs === !1) continue;
        const o = await s.input();
        o != null && (a[r] = o);
        continue;
      }
      if (typeof s == "object" && "output" in s && typeof s.output == "function") {
        if (e?.recordOutputs === !1) continue;
        const o = await s.output();
        o != null && (a[r] = o);
        continue;
      }
      a[r] = s;
    }
  return a;
}
function ka(e) {
  return JSON.stringify(
    e.map((t) => ({
      ...t,
      content:
        typeof t.content == "string"
          ? t.content
          : t.content.map((a) =>
              a.type === "file"
                ? { ...a, data: a.data instanceof Uint8Array ? cu(a.data) : a.data }
                : a
            ),
    }))
  );
}
function la(e) {
  return {
    inputTokens: e.inputTokens.total,
    inputTokenDetails: {
      noCacheTokens: e.inputTokens.noCache,
      cacheReadTokens: e.inputTokens.cacheRead,
      cacheWriteTokens: e.inputTokens.cacheWrite,
    },
    outputTokens: e.outputTokens.total,
    outputTokenDetails: {
      textTokens: e.outputTokens.text,
      reasoningTokens: e.outputTokens.reasoning,
    },
    totalTokens: Oe(e.inputTokens.total, e.outputTokens.total),
    raw: e.raw,
    reasoningTokens: e.outputTokens.reasoning,
    cachedInputTokens: e.inputTokens.cacheRead,
  };
}
function ya() {
  return {
    inputTokens: void 0,
    inputTokenDetails: { noCacheTokens: void 0, cacheReadTokens: void 0, cacheWriteTokens: void 0 },
    outputTokens: void 0,
    outputTokenDetails: { textTokens: void 0, reasoningTokens: void 0 },
    totalTokens: void 0,
    raw: void 0,
  };
}
function un(e, t) {
  var a, r, s, o, i, n, l, u, p, c;
  return {
    inputTokens: Oe(e.inputTokens, t.inputTokens),
    inputTokenDetails: {
      noCacheTokens: Oe(
        (a = e.inputTokenDetails) == null ? void 0 : a.noCacheTokens,
        (r = t.inputTokenDetails) == null ? void 0 : r.noCacheTokens
      ),
      cacheReadTokens: Oe(
        (s = e.inputTokenDetails) == null ? void 0 : s.cacheReadTokens,
        (o = t.inputTokenDetails) == null ? void 0 : o.cacheReadTokens
      ),
      cacheWriteTokens: Oe(
        (i = e.inputTokenDetails) == null ? void 0 : i.cacheWriteTokens,
        (n = t.inputTokenDetails) == null ? void 0 : n.cacheWriteTokens
      ),
    },
    outputTokens: Oe(e.outputTokens, t.outputTokens),
    outputTokenDetails: {
      textTokens: Oe(
        (l = e.outputTokenDetails) == null ? void 0 : l.textTokens,
        (u = t.outputTokenDetails) == null ? void 0 : u.textTokens
      ),
      reasoningTokens: Oe(
        (p = e.outputTokenDetails) == null ? void 0 : p.reasoningTokens,
        (c = t.outputTokenDetails) == null ? void 0 : c.reasoningTokens
      ),
    },
    totalTokens: Oe(e.totalTokens, t.totalTokens),
    reasoningTokens: Oe(e.reasoningTokens, t.reasoningTokens),
    cachedInputTokens: Oe(e.cachedInputTokens, t.cachedInputTokens),
  };
}
function Oe(e, t) {
  return e == null && t == null ? void 0 : (e ?? 0) + (t ?? 0);
}
function Au(e, t) {
  return {
    inputTokens: Oe(e.inputTokens, t.inputTokens),
    outputTokens: Oe(e.outputTokens, t.outputTokens),
    totalTokens: Oe(e.totalTokens, t.totalTokens),
  };
}
function Bt(e, t) {
  if (e === void 0 && t === void 0) return;
  if (e === void 0) return t;
  if (t === void 0) return e;
  const a = { ...e };
  for (const r in t)
    if (Object.prototype.hasOwnProperty.call(t, r)) {
      const s = t[r];
      if (s === void 0) continue;
      const o = r in e ? e[r] : void 0,
        i =
          s !== null &&
          typeof s == "object" &&
          !Array.isArray(s) &&
          !(s instanceof Date) &&
          !(s instanceof RegExp),
        n =
          o != null &&
          typeof o == "object" &&
          !Array.isArray(o) &&
          !(o instanceof Date) &&
          !(o instanceof RegExp);
      i && n ? (a[r] = Bt(o, s)) : (a[r] = s);
    }
  return a;
}
function Nu({ error: e, exponentialBackoffDelay: t }) {
  const a = e.responseHeaders;
  if (!a) return t;
  let r;
  const s = a["retry-after-ms"];
  if (s) {
    const i = parseFloat(s);
    Number.isNaN(i) || (r = i);
  }
  const o = a["retry-after"];
  if (o && r === void 0) {
    const i = parseFloat(o);
    Number.isNaN(i) ? (r = Date.parse(o) - Date.now()) : (r = i * 1e3);
  }
  return r != null && !Number.isNaN(r) && 0 <= r && (r < 60 * 1e3 || r < t) ? r : t;
}
var Ou =
  ({ maxRetries: e = 2, initialDelayInMs: t = 2e3, backoffFactor: a = 2, abortSignal: r } = {}) =>
  async (s) =>
    dn(s, { maxRetries: e, delayInMs: t, backoffFactor: a, abortSignal: r });
async function dn(e, { maxRetries: t, delayInMs: a, backoffFactor: r, abortSignal: s }, o = []) {
  try {
    return await e();
  } catch (i) {
    if (_o(i) || t === 0) throw i;
    const n = Ea(i),
      l = [...o, i],
      u = l.length;
    if (u > t)
      throw new oo({
        message: `Failed after ${u} attempts. Last error: ${n}`,
        reason: "maxRetriesExceeded",
        errors: l,
      });
    if (i instanceof Error && Io.isInstance(i) && i.isRetryable === !0 && u <= t)
      return (
        await nr(Nu({ error: i, exponentialBackoffDelay: a }), { abortSignal: s }),
        dn(e, { maxRetries: t, delayInMs: r * a, backoffFactor: r, abortSignal: s }, l)
      );
    throw u === 1
      ? i
      : new oo({
          message: `Failed after ${u} attempts with non-retryable error: '${n}'`,
          reason: "errorNotRetryable",
          errors: l,
        });
  }
}
function et({ maxRetries: e, abortSignal: t }) {
  if (e != null) {
    if (!Number.isInteger(e))
      throw new ae({ parameter: "maxRetries", value: e, message: "maxRetries must be an integer" });
    if (e < 0)
      throw new ae({ parameter: "maxRetries", value: e, message: "maxRetries must be >= 0" });
  }
  const a = e ?? 2;
  return { maxRetries: a, retry: Ou({ maxRetries: a, abortSignal: t }) };
}
function pn({ messages: e }) {
  const t = e.at(-1);
  if (t?.role != "tool") return { approvedToolApprovals: [], deniedToolApprovals: [] };
  const a = {};
  for (const l of e)
    if (l.role === "assistant" && typeof l.content != "string") {
      const u = l.content;
      for (const p of u) p.type === "tool-call" && (a[p.toolCallId] = p);
    }
  const r = {};
  for (const l of e)
    if (l.role === "assistant" && typeof l.content != "string") {
      const u = l.content;
      for (const p of u) p.type === "tool-approval-request" && (r[p.approvalId] = p);
    }
  const s = {};
  for (const l of t.content) l.type === "tool-result" && (s[l.toolCallId] = l);
  const o = [],
    i = [],
    n = t.content.filter((l) => l.type === "tool-approval-response");
  for (const l of n) {
    const u = r[l.approvalId];
    if (u == null) throw new Nl({ approvalId: l.approvalId });
    if (s[u.toolCallId] != null) continue;
    const p = a[u.toolCallId];
    if (p == null) throw new vr({ toolCallId: u.toolCallId, approvalId: u.approvalId });
    const c = { approvalRequest: u, approvalResponse: l, toolCall: p };
    l.approved ? o.push(c) : i.push(c);
  }
  return { approvedToolApprovals: o, deniedToolApprovals: i };
}
async function wr({
  toolCall: e,
  tools: t,
  tracer: a,
  telemetry: r,
  messages: s,
  abortSignal: o,
  experimental_context: i,
  onPreliminaryToolResult: n,
}) {
  const { toolName: l, toolCallId: u, input: p } = e,
    c = t?.[l];
  if (c?.execute != null)
    return Re({
      name: "ai.toolCall",
      attributes: Y({
        telemetry: r,
        attributes: {
          ...Ee({ operationId: "ai.toolCall", telemetry: r }),
          "ai.toolCall.name": l,
          "ai.toolCall.id": u,
          "ai.toolCall.args": { output: () => JSON.stringify(p) },
        },
      }),
      tracer: a,
      fn: async (d) => {
        let h;
        try {
          const m = Kn({
            execute: c.execute.bind(c),
            input: p,
            options: { toolCallId: u, messages: s, abortSignal: o, experimental_context: i },
          });
          for await (const v of m)
            v.type === "preliminary"
              ? n?.({ ...e, type: "tool-result", output: v.output, preliminary: !0 })
              : (h = v.output);
        } catch (m) {
          return (
            ln(d, m),
            {
              type: "tool-error",
              toolCallId: u,
              toolName: l,
              input: p,
              error: m,
              dynamic: c.type === "dynamic",
              ...(e.providerMetadata != null ? { providerMetadata: e.providerMetadata } : {}),
            }
          );
        }
        try {
          d.setAttributes(
            await Y({
              telemetry: r,
              attributes: { "ai.toolCall.result": { output: () => JSON.stringify(h) } },
            })
          );
        } catch {}
        return {
          type: "tool-result",
          toolCallId: u,
          toolName: l,
          input: p,
          output: h,
          dynamic: c.type === "dynamic",
          ...(e.providerMetadata != null ? { providerMetadata: e.providerMetadata } : {}),
        };
      },
    });
}
function ar(e) {
  const t = e.filter((a) => a.type === "text");
  if (t.length !== 0) return t.map((a) => a.text).join("");
}
var St = class {
    constructor({ data: e, mediaType: t }) {
      const a = e instanceof Uint8Array;
      ((this.base64Data = a ? void 0 : e),
        (this.uint8ArrayData = a ? e : void 0),
        (this.mediaType = t));
    }
    get base64() {
      return (
        this.base64Data == null && (this.base64Data = aa(this.uint8ArrayData)),
        this.base64Data
      );
    }
    get uint8Array() {
      return (
        this.uint8ArrayData == null && (this.uint8ArrayData = Rt(this.base64Data)),
        this.uint8ArrayData
      );
    }
  },
  ku = class extends St {
    constructor(e) {
      (super(e), (this.type = "file"));
    }
  };
async function cn({ tool: e, toolCall: t, messages: a, experimental_context: r }) {
  return e.needsApproval == null
    ? !1
    : typeof e.needsApproval == "boolean"
      ? e.needsApproval
      : await e.needsApproval(t.input, {
          toolCallId: t.toolCallId,
          messages: a,
          experimental_context: r,
        });
}
var Pu = {};
El(Pu, { array: () => $u, choice: () => ju, json: () => Uu, object: () => Du, text: () => Ma });
function qu(e) {
  const t = ["ROOT"];
  let a = -1,
    r = null;
  function s(l, u, p) {
    switch (l) {
      case '"': {
        ((a = u), t.pop(), t.push(p), t.push("INSIDE_STRING"));
        break;
      }
      case "f":
      case "t":
      case "n": {
        ((a = u), (r = u), t.pop(), t.push(p), t.push("INSIDE_LITERAL"));
        break;
      }
      case "-": {
        (t.pop(), t.push(p), t.push("INSIDE_NUMBER"));
        break;
      }
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9": {
        ((a = u), t.pop(), t.push(p), t.push("INSIDE_NUMBER"));
        break;
      }
      case "{": {
        ((a = u), t.pop(), t.push(p), t.push("INSIDE_OBJECT_START"));
        break;
      }
      case "[": {
        ((a = u), t.pop(), t.push(p), t.push("INSIDE_ARRAY_START"));
        break;
      }
    }
  }
  function o(l, u) {
    switch (l) {
      case ",": {
        (t.pop(), t.push("INSIDE_OBJECT_AFTER_COMMA"));
        break;
      }
      case "}": {
        ((a = u), t.pop());
        break;
      }
    }
  }
  function i(l, u) {
    switch (l) {
      case ",": {
        (t.pop(), t.push("INSIDE_ARRAY_AFTER_COMMA"));
        break;
      }
      case "]": {
        ((a = u), t.pop());
        break;
      }
    }
  }
  for (let l = 0; l < e.length; l++) {
    const u = e[l];
    switch (t[t.length - 1]) {
      case "ROOT":
        s(u, l, "FINISH");
        break;
      case "INSIDE_OBJECT_START": {
        switch (u) {
          case '"': {
            (t.pop(), t.push("INSIDE_OBJECT_KEY"));
            break;
          }
          case "}": {
            ((a = l), t.pop());
            break;
          }
        }
        break;
      }
      case "INSIDE_OBJECT_AFTER_COMMA": {
        switch (u) {
          case '"': {
            (t.pop(), t.push("INSIDE_OBJECT_KEY"));
            break;
          }
        }
        break;
      }
      case "INSIDE_OBJECT_KEY": {
        switch (u) {
          case '"': {
            (t.pop(), t.push("INSIDE_OBJECT_AFTER_KEY"));
            break;
          }
        }
        break;
      }
      case "INSIDE_OBJECT_AFTER_KEY": {
        switch (u) {
          case ":": {
            (t.pop(), t.push("INSIDE_OBJECT_BEFORE_VALUE"));
            break;
          }
        }
        break;
      }
      case "INSIDE_OBJECT_BEFORE_VALUE": {
        s(u, l, "INSIDE_OBJECT_AFTER_VALUE");
        break;
      }
      case "INSIDE_OBJECT_AFTER_VALUE": {
        o(u, l);
        break;
      }
      case "INSIDE_STRING": {
        switch (u) {
          case '"': {
            (t.pop(), (a = l));
            break;
          }
          case "\\": {
            t.push("INSIDE_STRING_ESCAPE");
            break;
          }
          default:
            a = l;
        }
        break;
      }
      case "INSIDE_ARRAY_START": {
        switch (u) {
          case "]": {
            ((a = l), t.pop());
            break;
          }
          default: {
            ((a = l), s(u, l, "INSIDE_ARRAY_AFTER_VALUE"));
            break;
          }
        }
        break;
      }
      case "INSIDE_ARRAY_AFTER_VALUE": {
        switch (u) {
          case ",": {
            (t.pop(), t.push("INSIDE_ARRAY_AFTER_COMMA"));
            break;
          }
          case "]": {
            ((a = l), t.pop());
            break;
          }
          default: {
            a = l;
            break;
          }
        }
        break;
      }
      case "INSIDE_ARRAY_AFTER_COMMA": {
        s(u, l, "INSIDE_ARRAY_AFTER_VALUE");
        break;
      }
      case "INSIDE_STRING_ESCAPE": {
        (t.pop(), (a = l));
        break;
      }
      case "INSIDE_NUMBER": {
        switch (u) {
          case "0":
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9": {
            a = l;
            break;
          }
          case "e":
          case "E":
          case "-":
          case ".":
            break;
          case ",": {
            (t.pop(),
              t[t.length - 1] === "INSIDE_ARRAY_AFTER_VALUE" && i(u, l),
              t[t.length - 1] === "INSIDE_OBJECT_AFTER_VALUE" && o(u, l));
            break;
          }
          case "}": {
            (t.pop(), t[t.length - 1] === "INSIDE_OBJECT_AFTER_VALUE" && o(u, l));
            break;
          }
          case "]": {
            (t.pop(), t[t.length - 1] === "INSIDE_ARRAY_AFTER_VALUE" && i(u, l));
            break;
          }
          default: {
            t.pop();
            break;
          }
        }
        break;
      }
      case "INSIDE_LITERAL": {
        const c = e.substring(r, l + 1);
        !"false".startsWith(c) && !"true".startsWith(c) && !"null".startsWith(c)
          ? (t.pop(),
            t[t.length - 1] === "INSIDE_OBJECT_AFTER_VALUE"
              ? o(u, l)
              : t[t.length - 1] === "INSIDE_ARRAY_AFTER_VALUE" && i(u, l))
          : (a = l);
        break;
      }
    }
  }
  let n = e.slice(0, a + 1);
  for (let l = t.length - 1; l >= 0; l--)
    switch (t[l]) {
      case "INSIDE_STRING": {
        n += '"';
        break;
      }
      case "INSIDE_OBJECT_KEY":
      case "INSIDE_OBJECT_AFTER_KEY":
      case "INSIDE_OBJECT_AFTER_COMMA":
      case "INSIDE_OBJECT_START":
      case "INSIDE_OBJECT_BEFORE_VALUE":
      case "INSIDE_OBJECT_AFTER_VALUE": {
        n += "}";
        break;
      }
      case "INSIDE_ARRAY_START":
      case "INSIDE_ARRAY_AFTER_COMMA":
      case "INSIDE_ARRAY_AFTER_VALUE": {
        n += "]";
        break;
      }
      case "INSIDE_LITERAL": {
        const p = e.substring(r, e.length);
        "true".startsWith(p)
          ? (n += "true".slice(p.length))
          : "false".startsWith(p)
            ? (n += "false".slice(p.length))
            : "null".startsWith(p) && (n += "null".slice(p.length));
      }
    }
  return n;
}
async function Lt(e) {
  if (e === void 0) return { value: void 0, state: "undefined-input" };
  let t = await nt({ text: e });
  return t.success
    ? { value: t.value, state: "successful-parse" }
    : ((t = await nt({ text: qu(e) })),
      t.success
        ? { value: t.value, state: "repaired-parse" }
        : { value: void 0, state: "failed-parse" });
}
var Ma = () => ({
    name: "text",
    responseFormat: Promise.resolve({ type: "text" }),
    async parseCompleteOutput({ text: e }) {
      return e;
    },
    async parsePartialOutput({ text: e }) {
      return { partial: e };
    },
    createElementStreamTransform() {},
  }),
  Du = ({ schema: e, name: t, description: a }) => {
    const r = Ct(e);
    return {
      name: "object",
      responseFormat: fe(r.jsonSchema).then((s) => ({
        type: "json",
        schema: s,
        ...(t != null && { name: t }),
        ...(a != null && { description: a }),
      })),
      async parseCompleteOutput({ text: s }, o) {
        const i = await nt({ text: s });
        if (!i.success)
          throw new $e({
            message: "No object generated: could not parse the response.",
            cause: i.error,
            text: s,
            response: o.response,
            usage: o.usage,
            finishReason: o.finishReason,
          });
        const n = await Ze({ value: i.value, schema: r });
        if (!n.success)
          throw new $e({
            message: "No object generated: response did not match schema.",
            cause: n.error,
            text: s,
            response: o.response,
            usage: o.usage,
            finishReason: o.finishReason,
          });
        return n.value;
      },
      async parsePartialOutput({ text: s }) {
        const o = await Lt(s);
        switch (o.state) {
          case "failed-parse":
          case "undefined-input":
            return;
          case "repaired-parse":
          case "successful-parse":
            return { partial: o.value };
        }
      },
      createElementStreamTransform() {},
    };
  },
  $u = ({ element: e, name: t, description: a }) => {
    const r = Ct(e);
    return {
      name: "array",
      responseFormat: fe(r.jsonSchema).then((s) => {
        const { $schema: o, ...i } = s;
        return {
          type: "json",
          schema: {
            $schema: "http://json-schema.org/draft-07/schema#",
            type: "object",
            properties: { elements: { type: "array", items: i } },
            required: ["elements"],
            additionalProperties: !1,
          },
          ...(t != null && { name: t }),
          ...(a != null && { description: a }),
        };
      }),
      async parseCompleteOutput({ text: s }, o) {
        const i = await nt({ text: s });
        if (!i.success)
          throw new $e({
            message: "No object generated: could not parse the response.",
            cause: i.error,
            text: s,
            response: o.response,
            usage: o.usage,
            finishReason: o.finishReason,
          });
        const n = i.value;
        if (n == null || typeof n != "object" || !("elements" in n) || !Array.isArray(n.elements))
          throw new $e({
            message: "No object generated: response did not match schema.",
            cause: new Qe({ value: n, cause: "response must be an object with an elements array" }),
            text: s,
            response: o.response,
            usage: o.usage,
            finishReason: o.finishReason,
          });
        for (const l of n.elements) {
          const u = await Ze({ value: l, schema: r });
          if (!u.success)
            throw new $e({
              message: "No object generated: response did not match schema.",
              cause: u.error,
              text: s,
              response: o.response,
              usage: o.usage,
              finishReason: o.finishReason,
            });
        }
        return n.elements;
      },
      async parsePartialOutput({ text: s }) {
        const o = await Lt(s);
        switch (o.state) {
          case "failed-parse":
          case "undefined-input":
            return;
          case "repaired-parse":
          case "successful-parse": {
            const i = o.value;
            if (
              i == null ||
              typeof i != "object" ||
              !("elements" in i) ||
              !Array.isArray(i.elements)
            )
              return;
            const n =
                o.state === "repaired-parse" && i.elements.length > 0
                  ? i.elements.slice(0, -1)
                  : i.elements,
              l = [];
            for (const u of n) {
              const p = await Ze({ value: u, schema: r });
              p.success && l.push(p.value);
            }
            return { partial: l };
          }
        }
      },
      createElementStreamTransform() {
        let s = 0;
        return new TransformStream({
          transform({ partialOutput: o }, i) {
            if (o != null) for (; s < o.length; s++) i.enqueue(o[s]);
          },
        });
      },
    };
  },
  ju = ({ options: e, name: t, description: a }) => ({
    name: "choice",
    responseFormat: Promise.resolve({
      type: "json",
      schema: {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "object",
        properties: { result: { type: "string", enum: e } },
        required: ["result"],
        additionalProperties: !1,
      },
      ...(t != null && { name: t }),
      ...(a != null && { description: a }),
    }),
    async parseCompleteOutput({ text: r }, s) {
      const o = await nt({ text: r });
      if (!o.success)
        throw new $e({
          message: "No object generated: could not parse the response.",
          cause: o.error,
          text: r,
          response: s.response,
          usage: s.usage,
          finishReason: s.finishReason,
        });
      const i = o.value;
      if (
        i == null ||
        typeof i != "object" ||
        !("result" in i) ||
        typeof i.result != "string" ||
        !e.includes(i.result)
      )
        throw new $e({
          message: "No object generated: response did not match schema.",
          cause: new Qe({
            value: i,
            cause: "response must be an object that contains a choice value.",
          }),
          text: r,
          response: s.response,
          usage: s.usage,
          finishReason: s.finishReason,
        });
      return i.result;
    },
    async parsePartialOutput({ text: r }) {
      const s = await Lt(r);
      switch (s.state) {
        case "failed-parse":
        case "undefined-input":
          return;
        case "repaired-parse":
        case "successful-parse": {
          const o = s.value;
          if (o == null || typeof o != "object" || !("result" in o) || typeof o.result != "string")
            return;
          const i = e.filter((n) => n.startsWith(o.result));
          return s.state === "successful-parse"
            ? i.includes(o.result)
              ? { partial: o.result }
              : void 0
            : i.length === 1
              ? { partial: i[0] }
              : void 0;
        }
      }
    },
    createElementStreamTransform() {},
  }),
  Uu = ({ name: e, description: t } = {}) => ({
    name: "json",
    responseFormat: Promise.resolve({
      type: "json",
      ...(e != null && { name: e }),
      ...(t != null && { description: t }),
    }),
    async parseCompleteOutput({ text: a }, r) {
      const s = await nt({ text: a });
      if (!s.success)
        throw new $e({
          message: "No object generated: could not parse the response.",
          cause: s.error,
          text: a,
          response: r.response,
          usage: r.usage,
          finishReason: r.finishReason,
        });
      return s.value;
    },
    async parsePartialOutput({ text: a }) {
      const r = await Lt(a);
      switch (r.state) {
        case "failed-parse":
        case "undefined-input":
          return;
        case "repaired-parse":
        case "successful-parse":
          return r.value === void 0 ? void 0 : { partial: r.value };
      }
    },
    createElementStreamTransform() {},
  });
async function fn({ toolCall: e, tools: t, repairToolCall: a, system: r, messages: s }) {
  var o;
  try {
    if (t == null) {
      if (e.providerExecuted && e.dynamic) return await mn(e);
      throw new tr({ toolName: e.toolName });
    }
    try {
      return await uo({ toolCall: e, tools: t });
    } catch (i) {
      if (a == null || !(tr.isInstance(i) || mr.isInstance(i))) throw i;
      let n = null;
      try {
        n = await a({
          toolCall: e,
          tools: t,
          inputSchema: async ({ toolName: l }) => {
            const { inputSchema: u } = t[l];
            return await Ct(u).jsonSchema;
          },
          system: r,
          messages: s,
          error: i,
        });
      } catch (l) {
        throw new Hl({ cause: l, originalError: i });
      }
      if (n == null) throw i;
      return await uo({ toolCall: n, tools: t });
    }
  } catch (i) {
    const n = await nt({ text: e.input }),
      l = n.success ? n.value : e.input;
    return {
      type: "tool-call",
      toolCallId: e.toolCallId,
      toolName: e.toolName,
      input: l,
      dynamic: !0,
      invalid: !0,
      error: i,
      title: (o = t?.[e.toolName]) == null ? void 0 : o.title,
      providerExecuted: e.providerExecuted,
      providerMetadata: e.providerMetadata,
    };
  }
}
async function mn(e) {
  const t = e.input.trim() === "" ? { success: !0, value: {} } : await nt({ text: e.input });
  if (t.success === !1) throw new mr({ toolName: e.toolName, toolInput: e.input, cause: t.error });
  return {
    type: "tool-call",
    toolCallId: e.toolCallId,
    toolName: e.toolName,
    input: t.value,
    providerExecuted: !0,
    dynamic: !0,
    providerMetadata: e.providerMetadata,
  };
}
async function uo({ toolCall: e, tools: t }) {
  const a = e.toolName,
    r = t[a];
  if (r == null) {
    if (e.providerExecuted && e.dynamic) return await mn(e);
    throw new tr({ toolName: e.toolName, availableTools: Object.keys(t) });
  }
  const s = Ct(r.inputSchema),
    o =
      e.input.trim() === ""
        ? await Ze({ value: {}, schema: s })
        : await nt({ text: e.input, schema: s });
  if (o.success === !1) throw new mr({ toolName: a, toolInput: e.input, cause: o.error });
  return r.type === "dynamic"
    ? {
        type: "tool-call",
        toolCallId: e.toolCallId,
        toolName: e.toolName,
        input: o.value,
        providerExecuted: e.providerExecuted,
        providerMetadata: e.providerMetadata,
        dynamic: !0,
        title: r.title,
      }
    : {
        type: "tool-call",
        toolCallId: e.toolCallId,
        toolName: a,
        input: o.value,
        providerExecuted: e.providerExecuted,
        providerMetadata: e.providerMetadata,
        title: r.title,
      };
}
var vn = class {
  constructor({
    content: e,
    finishReason: t,
    rawFinishReason: a,
    usage: r,
    warnings: s,
    request: o,
    response: i,
    providerMetadata: n,
  }) {
    ((this.content = e),
      (this.finishReason = t),
      (this.rawFinishReason = a),
      (this.usage = r),
      (this.warnings = s),
      (this.request = o),
      (this.response = i),
      (this.providerMetadata = n));
  }
  get text() {
    return this.content
      .filter((e) => e.type === "text")
      .map((e) => e.text)
      .join("");
  }
  get reasoning() {
    return this.content.filter((e) => e.type === "reasoning");
  }
  get reasoningText() {
    return this.reasoning.length === 0 ? void 0 : this.reasoning.map((e) => e.text).join("");
  }
  get files() {
    return this.content.filter((e) => e.type === "file").map((e) => e.file);
  }
  get sources() {
    return this.content.filter((e) => e.type === "source");
  }
  get toolCalls() {
    return this.content.filter((e) => e.type === "tool-call");
  }
  get staticToolCalls() {
    return this.toolCalls.filter((e) => e.dynamic !== !0);
  }
  get dynamicToolCalls() {
    return this.toolCalls.filter((e) => e.dynamic === !0);
  }
  get toolResults() {
    return this.content.filter((e) => e.type === "tool-result");
  }
  get staticToolResults() {
    return this.toolResults.filter((e) => e.dynamic !== !0);
  }
  get dynamicToolResults() {
    return this.toolResults.filter((e) => e.dynamic === !0);
  }
};
function br(e) {
  return ({ steps: t }) => t.length === e;
}
function Vd(e) {
  return ({ steps: t }) => {
    var a, r, s;
    return (s =
      (r = (a = t[t.length - 1]) == null ? void 0 : a.toolCalls) == null
        ? void 0
        : r.some((o) => o.toolName === e)) != null
      ? s
      : !1;
  };
}
async function hn({ stopConditions: e, steps: t }) {
  return (await Promise.all(e.map((a) => a({ steps: t })))).some((a) => a);
}
async function rr({ content: e, tools: t }) {
  const a = [],
    r = [];
  for (const o of e)
    if (
      o.type !== "source" &&
      !((o.type === "tool-result" || o.type === "tool-error") && !o.providerExecuted) &&
      !(o.type === "text" && o.text.length === 0)
    )
      switch (o.type) {
        case "text":
          r.push({ type: "text", text: o.text, providerOptions: o.providerMetadata });
          break;
        case "reasoning":
          r.push({ type: "reasoning", text: o.text, providerOptions: o.providerMetadata });
          break;
        case "file":
          r.push({
            type: "file",
            data: o.file.base64,
            mediaType: o.file.mediaType,
            providerOptions: o.providerMetadata,
          });
          break;
        case "tool-call":
          r.push({
            type: "tool-call",
            toolCallId: o.toolCallId,
            toolName: o.toolName,
            input: o.input,
            providerExecuted: o.providerExecuted,
            providerOptions: o.providerMetadata,
          });
          break;
        case "tool-result": {
          const i = await Mt({
            toolCallId: o.toolCallId,
            input: o.input,
            tool: t?.[o.toolName],
            output: o.output,
            errorMode: "none",
          });
          r.push({
            type: "tool-result",
            toolCallId: o.toolCallId,
            toolName: o.toolName,
            output: i,
            providerOptions: o.providerMetadata,
          });
          break;
        }
        case "tool-error": {
          const i = await Mt({
            toolCallId: o.toolCallId,
            input: o.input,
            tool: t?.[o.toolName],
            output: o.error,
            errorMode: "json",
          });
          r.push({
            type: "tool-result",
            toolCallId: o.toolCallId,
            toolName: o.toolName,
            output: i,
            providerOptions: o.providerMetadata,
          });
          break;
        }
        case "tool-approval-request":
          r.push({
            type: "tool-approval-request",
            approvalId: o.approvalId,
            toolCallId: o.toolCall.toolCallId,
          });
          break;
      }
  r.length > 0 && a.push({ role: "assistant", content: r });
  const s = [];
  for (const o of e) {
    if (!(o.type === "tool-result" || o.type === "tool-error") || o.providerExecuted) continue;
    const i = await Mt({
      toolCallId: o.toolCallId,
      input: o.input,
      tool: t?.[o.toolName],
      output: o.type === "tool-result" ? o.output : o.error,
      errorMode: o.type === "tool-error" ? "text" : "none",
    });
    s.push({
      type: "tool-result",
      toolCallId: o.toolCallId,
      toolName: o.toolName,
      output: i,
      ...(o.providerMetadata != null ? { providerOptions: o.providerMetadata } : {}),
    });
  }
  return (s.length > 0 && a.push({ role: "tool", content: s }), a);
}
function gn(...e) {
  const t = e.filter((r) => r != null);
  if (t.length === 0) return;
  if (t.length === 1) return t[0];
  const a = new AbortController();
  for (const r of t) {
    if (r.aborted) return (a.abort(r.reason), a.signal);
    r.addEventListener(
      "abort",
      () => {
        a.abort(r.reason);
      },
      { once: !0 }
    );
  }
  return a.signal;
}
var Fu = Ra({ prefix: "aitxt", size: 24 });
async function Vu({
  model: e,
  tools: t,
  toolChoice: a,
  system: r,
  prompt: s,
  messages: o,
  maxRetries: i,
  abortSignal: n,
  timeout: l,
  headers: u,
  stopWhen: p = br(1),
  experimental_output: c,
  output: d = c,
  experimental_telemetry: h,
  providerOptions: m,
  experimental_activeTools: v,
  activeTools: y = v,
  experimental_prepareStep: b,
  prepareStep: R = b,
  experimental_repairToolCall: g,
  experimental_download: M,
  experimental_context: S,
  experimental_include: T,
  _internal: { generateId: x = Fu } = {},
  onStepFinish: P,
  onFinish: j,
  ...A
}) {
  const C = Gt(e),
    U = wt(p),
    F = hr(l),
    $ = Qs(l),
    ue = $ != null ? new AbortController() : void 0,
    K = gn(n, F != null ? AbortSignal.timeout(F) : void 0, ue?.signal),
    { maxRetries: se, retry: Z } = et({ maxRetries: i, abortSignal: K }),
    he = Nt(A),
    ge = je(u ?? {}, `ai/${Le}`),
    Ke = Ot({ model: C, telemetry: h, headers: ge, settings: { ...he, maxRetries: se } }),
    Ce = await Na({ system: r, prompt: s, messages: o }),
    _e = kt(h);
  try {
    return await Re({
      name: "ai.generateText",
      attributes: Y({
        telemetry: h,
        attributes: {
          ...Ee({ operationId: "ai.generateText", telemetry: h }),
          ...Ke,
          "ai.model.provider": C.provider,
          "ai.model.id": C.modelId,
          "ai.prompt": { input: () => JSON.stringify({ system: r, prompt: s, messages: o }) },
        },
      }),
      tracer: _e,
      fn: async (we) => {
        var X, Ae, ze, Me, ye, de, Ne, Ve, Ge, tt, lt;
        const O = Ce.messages,
          D = [],
          { approvedToolApprovals: Je, deniedToolApprovals: ne } = pn({ messages: O }),
          te = Je.filter((z) => !z.toolCall.providerExecuted);
        if (ne.length > 0 || te.length > 0) {
          const z = await po({
              toolCalls: te.map((q) => q.toolCall),
              tools: t,
              tracer: _e,
              telemetry: h,
              messages: O,
              abortSignal: K,
              experimental_context: S,
            }),
            be = [];
          for (const q of z) {
            const ee = await Mt({
              toolCallId: q.toolCallId,
              input: q.input,
              tool: t?.[q.toolName],
              output: q.type === "tool-result" ? q.output : q.error,
              errorMode: q.type === "tool-error" ? "json" : "none",
            });
            be.push({
              type: "tool-result",
              toolCallId: q.toolCallId,
              toolName: q.toolName,
              output: ee,
            });
          }
          for (const q of ne)
            be.push({
              type: "tool-result",
              toolCallId: q.toolCall.toolCallId,
              toolName: q.toolCall.toolName,
              output: {
                type: "execution-denied",
                reason: q.approvalResponse.reason,
                ...(q.toolCall.providerExecuted && {
                  providerOptions: { openai: { approvalId: q.approvalResponse.approvalId } },
                }),
              },
            });
          D.push({ role: "tool", content: be });
        }
        const W = [...Je, ...ne].filter((z) => z.toolCall.providerExecuted);
        W.length > 0 &&
          D.push({
            role: "tool",
            content: W.map((z) => ({
              type: "tool-approval-response",
              approvalId: z.approvalResponse.approvalId,
              approved: z.approvalResponse.approved,
              reason: z.approvalResponse.reason,
              providerExecuted: !0,
            })),
          });
        const ie = Nt(A);
        let E,
          me = [],
          qe = [];
        const _ = [],
          Q = new Map();
        do {
          const z = $ != null ? setTimeout(() => ue.abort(), $) : void 0;
          try {
            const be = [...O, ...D],
              q = await R?.({
                model: C,
                steps: _,
                stepNumber: _.length,
                messages: be,
                experimental_context: S,
              }),
              ee = Gt((X = q?.model) != null ? X : C),
              le = await Aa({
                prompt: {
                  system: (Ae = q?.system) != null ? Ae : Ce.system,
                  messages: (ze = q?.messages) != null ? ze : be,
                },
                supportedUrls: await ee.supportedUrls,
                download: M,
              });
            S = (Me = q?.experimental_context) != null ? Me : S;
            const { toolChoice: ht, tools: Pt } = await rn({
              tools: t,
              toolChoice: (ye = q?.toolChoice) != null ? ye : a,
              activeTools: (de = q?.activeTools) != null ? de : y,
            });
            E = await Z(() => {
              var V;
              return Re({
                name: "ai.generateText.doGenerate",
                attributes: Y({
                  telemetry: h,
                  attributes: {
                    ...Ee({ operationId: "ai.generateText.doGenerate", telemetry: h }),
                    ...Ke,
                    "ai.model.provider": ee.provider,
                    "ai.model.id": ee.modelId,
                    "ai.prompt.messages": { input: () => ka(le) },
                    "ai.prompt.tools": { input: () => Pt?.map((Se) => JSON.stringify(Se)) },
                    "ai.prompt.toolChoice": {
                      input: () => (ht != null ? JSON.stringify(ht) : void 0),
                    },
                    "gen_ai.system": ee.provider,
                    "gen_ai.request.model": ee.modelId,
                    "gen_ai.request.frequency_penalty": A.frequencyPenalty,
                    "gen_ai.request.max_tokens": A.maxOutputTokens,
                    "gen_ai.request.presence_penalty": A.presencePenalty,
                    "gen_ai.request.stop_sequences": A.stopSequences,
                    "gen_ai.request.temperature": (V = A.temperature) != null ? V : void 0,
                    "gen_ai.request.top_k": A.topK,
                    "gen_ai.request.top_p": A.topP,
                  },
                }),
                tracer: _e,
                fn: async (Se) => {
                  var Tt, ut, fa, ma, Yt, qt, dt, Kt;
                  const Da = Bt(m, q?.providerOptions),
                    Te = await ee.doGenerate({
                      ...ie,
                      tools: Pt,
                      toolChoice: ht,
                      responseFormat: await d?.responseFormat,
                      prompt: le,
                      providerOptions: Da,
                      abortSignal: K,
                      headers: ge,
                    }),
                    We = {
                      id: (ut = (Tt = Te.response) == null ? void 0 : Tt.id) != null ? ut : x(),
                      timestamp:
                        (ma = (fa = Te.response) == null ? void 0 : fa.timestamp) != null
                          ? ma
                          : new Date(),
                      modelId:
                        (qt = (Yt = Te.response) == null ? void 0 : Yt.modelId) != null
                          ? qt
                          : ee.modelId,
                      headers: (dt = Te.response) == null ? void 0 : dt.headers,
                      body: (Kt = Te.response) == null ? void 0 : Kt.body,
                    };
                  return (
                    Se.setAttributes(
                      await Y({
                        telemetry: h,
                        attributes: {
                          "ai.response.finishReason": Te.finishReason.unified,
                          "ai.response.text": { output: () => ar(Te.content) },
                          "ai.response.toolCalls": {
                            output: () => {
                              const yt = co(Te.content);
                              return yt == null ? void 0 : JSON.stringify(yt);
                            },
                          },
                          "ai.response.id": We.id,
                          "ai.response.model": We.modelId,
                          "ai.response.timestamp": We.timestamp.toISOString(),
                          "ai.response.providerMetadata": JSON.stringify(Te.providerMetadata),
                          "ai.usage.promptTokens": Te.usage.inputTokens.total,
                          "ai.usage.completionTokens": Te.usage.outputTokens.total,
                          "gen_ai.response.finish_reasons": [Te.finishReason.unified],
                          "gen_ai.response.id": We.id,
                          "gen_ai.response.model": We.modelId,
                          "gen_ai.usage.input_tokens": Te.usage.inputTokens.total,
                          "gen_ai.usage.output_tokens": Te.usage.outputTokens.total,
                        },
                      })
                    ),
                    { ...Te, response: We }
                  );
                },
              });
            });
            const gt = await Promise.all(
                E.content
                  .filter((V) => V.type === "tool-call")
                  .map((V) =>
                    fn({ toolCall: V, tools: t, repairToolCall: g, system: r, messages: be })
                  )
              ),
              at = {};
            for (const V of gt) {
              if (V.invalid) continue;
              const Se = t?.[V.toolName];
              Se != null &&
                (Se?.onInputAvailable != null &&
                  (await Se.onInputAvailable({
                    input: V.input,
                    toolCallId: V.toolCallId,
                    messages: be,
                    abortSignal: K,
                    experimental_context: S,
                  })),
                (await cn({ tool: Se, toolCall: V, messages: be, experimental_context: S })) &&
                  (at[V.toolCallId] = {
                    type: "tool-approval-request",
                    approvalId: x(),
                    toolCall: V,
                  }));
            }
            const qa = gt.filter((V) => V.invalid && V.dynamic);
            qe = [];
            for (const V of qa)
              qe.push({
                type: "tool-error",
                toolCallId: V.toolCallId,
                toolName: V.toolName,
                input: V.input,
                error: Ea(V.error),
                dynamic: !0,
              });
            ((me = gt.filter((V) => !V.providerExecuted)),
              t != null &&
                qe.push(
                  ...(await po({
                    toolCalls: me.filter((V) => !V.invalid && at[V.toolCallId] == null),
                    tools: t,
                    tracer: _e,
                    telemetry: h,
                    messages: be,
                    abortSignal: K,
                    experimental_context: S,
                  }))
                ));
            for (const V of gt) {
              if (!V.providerExecuted) continue;
              const Se = t?.[V.toolName];
              Se?.type === "provider" &&
                Se.supportsDeferredResults &&
                (E.content.some(
                  (ut) => ut.type === "tool-result" && ut.toolCallId === V.toolCallId
                ) ||
                  Q.set(V.toolCallId, { toolName: V.toolName }));
            }
            for (const V of E.content) V.type === "tool-result" && Q.delete(V.toolCallId);
            const Ht = Ju({
              content: E.content,
              toolCalls: gt,
              toolOutputs: qe,
              toolApprovalRequests: Object.values(at),
              tools: t,
            });
            D.push(...(await rr({ content: Ht, tools: t })));
            const ca =
                (Ne = T?.requestBody) == null || Ne
                  ? (Ve = E.request) != null
                    ? Ve
                    : {}
                  : { ...E.request, body: void 0 },
              It = {
                ...E.response,
                messages: structuredClone(D),
                body:
                  (Ge = T?.responseBody) == null || Ge
                    ? (tt = E.response) == null
                      ? void 0
                      : tt.body
                    : void 0,
              },
              Ie = new vn({
                content: Ht,
                finishReason: E.finishReason.unified,
                rawFinishReason: E.finishReason.raw,
                usage: la(E.usage),
                warnings: E.warnings,
                providerMetadata: E.providerMetadata,
                request: ca,
                response: It,
              });
            (Fe({
              warnings: (lt = E.warnings) != null ? lt : [],
              provider: ee.provider,
              model: ee.modelId,
            }),
              _.push(Ie),
              await P?.(Ie));
          } finally {
            z != null && clearTimeout(z);
          }
        } while (
          ((me.length > 0 && qe.length === me.length) || Q.size > 0) &&
          !(await hn({ stopConditions: U, steps: _ }))
        );
        we.setAttributes(
          await Y({
            telemetry: h,
            attributes: {
              "ai.response.finishReason": E.finishReason.unified,
              "ai.response.text": { output: () => ar(E.content) },
              "ai.response.toolCalls": {
                output: () => {
                  const z = co(E.content);
                  return z == null ? void 0 : JSON.stringify(z);
                },
              },
              "ai.response.providerMetadata": JSON.stringify(E.providerMetadata),
              "ai.usage.promptTokens": E.usage.inputTokens.total,
              "ai.usage.completionTokens": E.usage.outputTokens.total,
            },
          })
        );
        const B = _[_.length - 1],
          vt = _.reduce((z, be) => un(z, be.usage), {
            inputTokens: void 0,
            outputTokens: void 0,
            totalTokens: void 0,
            reasoningTokens: void 0,
            cachedInputTokens: void 0,
          });
        await j?.({
          finishReason: B.finishReason,
          rawFinishReason: B.rawFinishReason,
          usage: B.usage,
          content: B.content,
          text: B.text,
          reasoningText: B.reasoningText,
          reasoning: B.reasoning,
          files: B.files,
          sources: B.sources,
          toolCalls: B.toolCalls,
          staticToolCalls: B.staticToolCalls,
          dynamicToolCalls: B.dynamicToolCalls,
          toolResults: B.toolResults,
          staticToolResults: B.staticToolResults,
          dynamicToolResults: B.dynamicToolResults,
          request: B.request,
          response: B.response,
          warnings: B.warnings,
          providerMetadata: B.providerMetadata,
          steps: _,
          totalUsage: vt,
          experimental_context: S,
        });
        let bt;
        return (
          B.finishReason === "stop" &&
            (bt = await (d ?? Ma()).parseCompleteOutput(
              { text: B.text },
              { response: B.response, usage: B.usage, finishReason: B.finishReason }
            )),
          new Gu({ steps: _, totalUsage: vt, output: bt })
        );
      },
    });
  } catch (we) {
    throw Oa(we);
  }
}
async function po({
  toolCalls: e,
  tools: t,
  tracer: a,
  telemetry: r,
  messages: s,
  abortSignal: o,
  experimental_context: i,
}) {
  return (
    await Promise.all(
      e.map(async (l) =>
        wr({
          toolCall: l,
          tools: t,
          tracer: a,
          telemetry: r,
          messages: s,
          abortSignal: o,
          experimental_context: i,
        })
      )
    )
  ).filter((l) => l != null);
}
var Gu = class {
  constructor(e) {
    ((this.steps = e.steps), (this._output = e.output), (this.totalUsage = e.totalUsage));
  }
  get finalStep() {
    return this.steps[this.steps.length - 1];
  }
  get content() {
    return this.finalStep.content;
  }
  get text() {
    return this.finalStep.text;
  }
  get files() {
    return this.finalStep.files;
  }
  get reasoningText() {
    return this.finalStep.reasoningText;
  }
  get reasoning() {
    return this.finalStep.reasoning;
  }
  get toolCalls() {
    return this.finalStep.toolCalls;
  }
  get staticToolCalls() {
    return this.finalStep.staticToolCalls;
  }
  get dynamicToolCalls() {
    return this.finalStep.dynamicToolCalls;
  }
  get toolResults() {
    return this.finalStep.toolResults;
  }
  get staticToolResults() {
    return this.finalStep.staticToolResults;
  }
  get dynamicToolResults() {
    return this.finalStep.dynamicToolResults;
  }
  get sources() {
    return this.finalStep.sources;
  }
  get finishReason() {
    return this.finalStep.finishReason;
  }
  get rawFinishReason() {
    return this.finalStep.rawFinishReason;
  }
  get warnings() {
    return this.finalStep.warnings;
  }
  get providerMetadata() {
    return this.finalStep.providerMetadata;
  }
  get response() {
    return this.finalStep.response;
  }
  get request() {
    return this.finalStep.request;
  }
  get usage() {
    return this.finalStep.usage;
  }
  get experimental_output() {
    return this.output;
  }
  get output() {
    if (this._output == null) throw new ms();
    return this._output;
  }
};
function co(e) {
  const t = e.filter((a) => a.type === "tool-call");
  if (t.length !== 0)
    return t.map((a) => ({ toolCallId: a.toolCallId, toolName: a.toolName, input: a.input }));
}
function Ju({ content: e, toolCalls: t, toolOutputs: a, toolApprovalRequests: r, tools: s }) {
  const o = [];
  for (const i of e)
    switch (i.type) {
      case "text":
      case "reasoning":
      case "source":
        o.push(i);
        break;
      case "file": {
        o.push({
          type: "file",
          file: new St(i),
          ...(i.providerMetadata != null ? { providerMetadata: i.providerMetadata } : {}),
        });
        break;
      }
      case "tool-call": {
        o.push(t.find((n) => n.toolCallId === i.toolCallId));
        break;
      }
      case "tool-result": {
        const n = t.find((l) => l.toolCallId === i.toolCallId);
        if (n == null) {
          const l = s?.[i.toolName];
          if (!(l?.type === "provider" && l.supportsDeferredResults))
            throw new Error(`Tool call ${i.toolCallId} not found.`);
          i.isError
            ? o.push({
                type: "tool-error",
                toolCallId: i.toolCallId,
                toolName: i.toolName,
                input: void 0,
                error: i.result,
                providerExecuted: !0,
                dynamic: i.dynamic,
              })
            : o.push({
                type: "tool-result",
                toolCallId: i.toolCallId,
                toolName: i.toolName,
                input: void 0,
                output: i.result,
                providerExecuted: !0,
                dynamic: i.dynamic,
              });
          break;
        }
        i.isError
          ? o.push({
              type: "tool-error",
              toolCallId: i.toolCallId,
              toolName: i.toolName,
              input: n.input,
              error: i.result,
              providerExecuted: !0,
              dynamic: n.dynamic,
            })
          : o.push({
              type: "tool-result",
              toolCallId: i.toolCallId,
              toolName: i.toolName,
              input: n.input,
              output: i.result,
              providerExecuted: !0,
              dynamic: n.dynamic,
            });
        break;
      }
      case "tool-approval-request": {
        const n = t.find((l) => l.toolCallId === i.toolCallId);
        if (n == null) throw new vr({ toolCallId: i.toolCallId, approvalId: i.approvalId });
        o.push({ type: "tool-approval-request", approvalId: i.approvalId, toolCall: n });
        break;
      }
    }
  return [...o, ...a, ...r];
}
function pa(e, t) {
  const a = new Headers(e ?? {});
  for (const [r, s] of Object.entries(t)) a.has(r) || a.set(r, s);
  return a;
}
function yn({ status: e, statusText: t, headers: a, textStream: r }) {
  return new Response(r.pipeThrough(new TextEncoderStream()), {
    status: e ?? 200,
    statusText: t,
    headers: pa(a, { "content-type": "text/plain; charset=utf-8" }),
  });
}
function wn({ response: e, status: t, statusText: a, headers: r, stream: s }) {
  const o = t ?? 200;
  a !== void 0 ? e.writeHead(o, a, r) : e.writeHead(o, r);
  const i = s.getReader();
  (async () => {
    try {
      for (;;) {
        const { done: l, value: u } = await i.read();
        if (l) break;
        e.write(u) ||
          (await new Promise((c) => {
            e.once("drain", c);
          }));
      }
    } catch (l) {
      throw l;
    } finally {
      e.end();
    }
  })();
}
function bn({ response: e, status: t, statusText: a, headers: r, textStream: s }) {
  wn({
    response: e,
    status: t,
    statusText: a,
    headers: Object.fromEntries(pa(r, { "content-type": "text/plain; charset=utf-8" }).entries()),
    stream: s.pipeThrough(new TextEncoderStream()),
  });
}
var In = class extends TransformStream {
    constructor() {
      super({
        transform(e, t) {
          t.enqueue(`data: ${JSON.stringify(e)}

`);
        },
        flush(e) {
          e.enqueue(`data: [DONE]

`);
        },
      });
    }
  },
  Tn = {
    "content-type": "text/event-stream",
    "cache-control": "no-cache",
    connection: "keep-alive",
    "x-vercel-ai-ui-message-stream": "v1",
    "x-accel-buffering": "no",
  };
function xn({ status: e, statusText: t, headers: a, stream: r, consumeSseStream: s }) {
  let o = r.pipeThrough(new In());
  if (s) {
    const [i, n] = o.tee();
    ((o = i), s({ stream: n }));
  }
  return new Response(o.pipeThrough(new TextEncoderStream()), {
    status: e,
    statusText: t,
    headers: pa(a, Tn),
  });
}
function Wu({ originalMessages: e, responseMessageId: t }) {
  if (e == null) return;
  const a = e[e.length - 1];
  return a?.role === "assistant" ? a.id : typeof t == "function" ? t() : t;
}
var _n = He(() =>
  Ye(
    ce([
      re({ type: w("text-start"), id: f(), providerMetadata: N.optional() }),
      re({ type: w("text-delta"), id: f(), delta: f(), providerMetadata: N.optional() }),
      re({ type: w("text-end"), id: f(), providerMetadata: N.optional() }),
      re({ type: w("error"), errorText: f() }),
      re({
        type: w("tool-input-start"),
        toolCallId: f(),
        toolName: f(),
        providerExecuted: L().optional(),
        providerMetadata: N.optional(),
        dynamic: L().optional(),
        title: f().optional(),
      }),
      re({ type: w("tool-input-delta"), toolCallId: f(), inputTextDelta: f() }),
      re({
        type: w("tool-input-available"),
        toolCallId: f(),
        toolName: f(),
        input: J(),
        providerExecuted: L().optional(),
        providerMetadata: N.optional(),
        dynamic: L().optional(),
        title: f().optional(),
      }),
      re({
        type: w("tool-input-error"),
        toolCallId: f(),
        toolName: f(),
        input: J(),
        providerExecuted: L().optional(),
        providerMetadata: N.optional(),
        dynamic: L().optional(),
        errorText: f(),
        title: f().optional(),
      }),
      re({ type: w("tool-approval-request"), approvalId: f(), toolCallId: f() }),
      re({
        type: w("tool-output-available"),
        toolCallId: f(),
        output: J(),
        providerExecuted: L().optional(),
        dynamic: L().optional(),
        preliminary: L().optional(),
      }),
      re({
        type: w("tool-output-error"),
        toolCallId: f(),
        errorText: f(),
        providerExecuted: L().optional(),
        dynamic: L().optional(),
      }),
      re({ type: w("tool-output-denied"), toolCallId: f() }),
      re({ type: w("reasoning-start"), id: f(), providerMetadata: N.optional() }),
      re({ type: w("reasoning-delta"), id: f(), delta: f(), providerMetadata: N.optional() }),
      re({ type: w("reasoning-end"), id: f(), providerMetadata: N.optional() }),
      re({
        type: w("source-url"),
        sourceId: f(),
        url: f(),
        title: f().optional(),
        providerMetadata: N.optional(),
      }),
      re({
        type: w("source-document"),
        sourceId: f(),
        mediaType: f(),
        title: f(),
        filename: f().optional(),
        providerMetadata: N.optional(),
      }),
      re({ type: w("file"), url: f(), mediaType: f(), providerMetadata: N.optional() }),
      re({
        type: Mo((e) => typeof e == "string" && e.startsWith("data-"), {
          message: 'Type must start with "data-"',
        }),
        id: f().optional(),
        data: J(),
        transient: L().optional(),
      }),
      re({ type: w("start-step") }),
      re({ type: w("finish-step") }),
      re({ type: w("start"), messageId: f().optional(), messageMetadata: J().optional() }),
      re({
        type: w("finish"),
        finishReason: ct([
          "stop",
          "length",
          "content-filter",
          "tool-calls",
          "error",
          "other",
        ]).optional(),
        messageMetadata: J().optional(),
      }),
      re({ type: w("abort"), reason: f().optional() }),
      re({ type: w("message-metadata"), messageMetadata: J() }),
    ])
  )
);
function Bu(e) {
  return e.type.startsWith("data-");
}
function za(e) {
  return e.type.startsWith("data-");
}
function Xa(e) {
  return e.type === "text";
}
function Qa(e) {
  return e.type === "file";
}
function fo(e) {
  return e.type === "reasoning";
}
function or(e) {
  return e.type.startsWith("tool-");
}
function Mn(e) {
  return e.type === "dynamic-tool";
}
function st(e) {
  return or(e) || Mn(e);
}
var Gd = st;
function sr(e) {
  return e.type.split("-").slice(1).join("-");
}
function wa(e) {
  return Mn(e) ? e.toolName : sr(e);
}
var Jd = wa;
function Ir({ lastMessage: e, messageId: t }) {
  return {
    message:
      e?.role === "assistant" ? e : { id: t, metadata: void 0, role: "assistant", parts: [] },
    activeTextParts: {},
    activeReasoningParts: {},
    partialToolCalls: {},
  };
}
function Tr({
  stream: e,
  messageMetadataSchema: t,
  dataPartSchemas: a,
  runUpdateMessageJob: r,
  onError: s,
  onToolCall: o,
  onData: i,
}) {
  return e.pipeThrough(
    new TransformStream({
      async transform(n, l) {
        await r(async ({ state: u, write: p }) => {
          var c, d, h, m;
          function v(g) {
            const S = u.message.parts.filter(st).find((T) => T.toolCallId === g);
            if (S == null)
              throw new Ft({
                chunkType: "tool-invocation",
                chunkId: g,
                message: `No tool invocation found for tool call ID "${g}".`,
              });
            return S;
          }
          function y(g) {
            var M;
            const S = u.message.parts.find((P) => or(P) && P.toolCallId === g.toolCallId),
              T = g,
              x = S;
            S != null
              ? ((S.state = g.state),
                (x.input = T.input),
                (x.output = T.output),
                (x.errorText = T.errorText),
                (x.rawInput = T.rawInput),
                (x.preliminary = T.preliminary),
                g.title !== void 0 && (x.title = g.title),
                (x.providerExecuted = (M = T.providerExecuted) != null ? M : S.providerExecuted),
                T.providerMetadata != null && (S.callProviderMetadata = T.providerMetadata))
              : u.message.parts.push({
                  type: `tool-${g.toolName}`,
                  toolCallId: g.toolCallId,
                  state: g.state,
                  title: g.title,
                  input: T.input,
                  output: T.output,
                  rawInput: T.rawInput,
                  errorText: T.errorText,
                  providerExecuted: T.providerExecuted,
                  preliminary: T.preliminary,
                  ...(T.providerMetadata != null
                    ? { callProviderMetadata: T.providerMetadata }
                    : {}),
                });
          }
          function b(g) {
            var M, S;
            const T = u.message.parts.find(
                (j) => j.type === "dynamic-tool" && j.toolCallId === g.toolCallId
              ),
              x = g,
              P = T;
            T != null
              ? ((T.state = g.state),
                (P.toolName = g.toolName),
                (P.input = x.input),
                (P.output = x.output),
                (P.errorText = x.errorText),
                (P.rawInput = (M = x.rawInput) != null ? M : P.rawInput),
                (P.preliminary = x.preliminary),
                g.title !== void 0 && (P.title = g.title),
                (P.providerExecuted = (S = x.providerExecuted) != null ? S : T.providerExecuted),
                x.providerMetadata != null && (T.callProviderMetadata = x.providerMetadata))
              : u.message.parts.push({
                  type: "dynamic-tool",
                  toolName: g.toolName,
                  toolCallId: g.toolCallId,
                  state: g.state,
                  input: x.input,
                  output: x.output,
                  errorText: x.errorText,
                  preliminary: x.preliminary,
                  providerExecuted: x.providerExecuted,
                  title: g.title,
                  ...(x.providerMetadata != null
                    ? { callProviderMetadata: x.providerMetadata }
                    : {}),
                });
          }
          async function R(g) {
            if (g != null) {
              const M = u.message.metadata != null ? Bt(u.message.metadata, g) : g;
              (t != null &&
                (await xt({
                  value: M,
                  schema: t,
                  context: { field: "message.metadata", entityId: u.message.id },
                })),
                (u.message.metadata = M));
            }
          }
          switch (n.type) {
            case "text-start": {
              const g = {
                type: "text",
                text: "",
                providerMetadata: n.providerMetadata,
                state: "streaming",
              };
              ((u.activeTextParts[n.id] = g), u.message.parts.push(g), p());
              break;
            }
            case "text-delta": {
              const g = u.activeTextParts[n.id];
              if (g == null)
                throw new Ft({
                  chunkType: "text-delta",
                  chunkId: n.id,
                  message: `Received text-delta for missing text part with ID "${n.id}". Ensure a "text-start" chunk is sent before any "text-delta" chunks.`,
                });
              ((g.text += n.delta),
                (g.providerMetadata = (c = n.providerMetadata) != null ? c : g.providerMetadata),
                p());
              break;
            }
            case "text-end": {
              const g = u.activeTextParts[n.id];
              if (g == null)
                throw new Ft({
                  chunkType: "text-end",
                  chunkId: n.id,
                  message: `Received text-end for missing text part with ID "${n.id}". Ensure a "text-start" chunk is sent before any "text-end" chunks.`,
                });
              ((g.state = "done"),
                (g.providerMetadata = (d = n.providerMetadata) != null ? d : g.providerMetadata),
                delete u.activeTextParts[n.id],
                p());
              break;
            }
            case "reasoning-start": {
              const g = {
                type: "reasoning",
                text: "",
                providerMetadata: n.providerMetadata,
                state: "streaming",
              };
              ((u.activeReasoningParts[n.id] = g), u.message.parts.push(g), p());
              break;
            }
            case "reasoning-delta": {
              const g = u.activeReasoningParts[n.id];
              if (g == null)
                throw new Ft({
                  chunkType: "reasoning-delta",
                  chunkId: n.id,
                  message: `Received reasoning-delta for missing reasoning part with ID "${n.id}". Ensure a "reasoning-start" chunk is sent before any "reasoning-delta" chunks.`,
                });
              ((g.text += n.delta),
                (g.providerMetadata = (h = n.providerMetadata) != null ? h : g.providerMetadata),
                p());
              break;
            }
            case "reasoning-end": {
              const g = u.activeReasoningParts[n.id];
              if (g == null)
                throw new Ft({
                  chunkType: "reasoning-end",
                  chunkId: n.id,
                  message: `Received reasoning-end for missing reasoning part with ID "${n.id}". Ensure a "reasoning-start" chunk is sent before any "reasoning-end" chunks.`,
                });
              ((g.providerMetadata = (m = n.providerMetadata) != null ? m : g.providerMetadata),
                (g.state = "done"),
                delete u.activeReasoningParts[n.id],
                p());
              break;
            }
            case "file": {
              (u.message.parts.push({ type: "file", mediaType: n.mediaType, url: n.url }), p());
              break;
            }
            case "source-url": {
              (u.message.parts.push({
                type: "source-url",
                sourceId: n.sourceId,
                url: n.url,
                title: n.title,
                providerMetadata: n.providerMetadata,
              }),
                p());
              break;
            }
            case "source-document": {
              (u.message.parts.push({
                type: "source-document",
                sourceId: n.sourceId,
                mediaType: n.mediaType,
                title: n.title,
                filename: n.filename,
                providerMetadata: n.providerMetadata,
              }),
                p());
              break;
            }
            case "tool-input-start": {
              const g = u.message.parts.filter(or);
              ((u.partialToolCalls[n.toolCallId] = {
                text: "",
                toolName: n.toolName,
                index: g.length,
                dynamic: n.dynamic,
                title: n.title,
              }),
                n.dynamic
                  ? b({
                      toolCallId: n.toolCallId,
                      toolName: n.toolName,
                      state: "input-streaming",
                      input: void 0,
                      providerExecuted: n.providerExecuted,
                      title: n.title,
                      providerMetadata: n.providerMetadata,
                    })
                  : y({
                      toolCallId: n.toolCallId,
                      toolName: n.toolName,
                      state: "input-streaming",
                      input: void 0,
                      providerExecuted: n.providerExecuted,
                      title: n.title,
                      providerMetadata: n.providerMetadata,
                    }),
                p());
              break;
            }
            case "tool-input-delta": {
              const g = u.partialToolCalls[n.toolCallId];
              if (g == null)
                throw new Ft({
                  chunkType: "tool-input-delta",
                  chunkId: n.toolCallId,
                  message: `Received tool-input-delta for missing tool call with ID "${n.toolCallId}". Ensure a "tool-input-start" chunk is sent before any "tool-input-delta" chunks.`,
                });
              g.text += n.inputTextDelta;
              const { value: M } = await Lt(g.text);
              (g.dynamic
                ? b({
                    toolCallId: n.toolCallId,
                    toolName: g.toolName,
                    state: "input-streaming",
                    input: M,
                    title: g.title,
                  })
                : y({
                    toolCallId: n.toolCallId,
                    toolName: g.toolName,
                    state: "input-streaming",
                    input: M,
                    title: g.title,
                  }),
                p());
              break;
            }
            case "tool-input-available": {
              (n.dynamic
                ? b({
                    toolCallId: n.toolCallId,
                    toolName: n.toolName,
                    state: "input-available",
                    input: n.input,
                    providerExecuted: n.providerExecuted,
                    providerMetadata: n.providerMetadata,
                    title: n.title,
                  })
                : y({
                    toolCallId: n.toolCallId,
                    toolName: n.toolName,
                    state: "input-available",
                    input: n.input,
                    providerExecuted: n.providerExecuted,
                    providerMetadata: n.providerMetadata,
                    title: n.title,
                  }),
                p(),
                o && !n.providerExecuted && (await o({ toolCall: n })));
              break;
            }
            case "tool-input-error": {
              (n.dynamic
                ? b({
                    toolCallId: n.toolCallId,
                    toolName: n.toolName,
                    state: "output-error",
                    input: n.input,
                    errorText: n.errorText,
                    providerExecuted: n.providerExecuted,
                    providerMetadata: n.providerMetadata,
                  })
                : y({
                    toolCallId: n.toolCallId,
                    toolName: n.toolName,
                    state: "output-error",
                    input: void 0,
                    rawInput: n.input,
                    errorText: n.errorText,
                    providerExecuted: n.providerExecuted,
                    providerMetadata: n.providerMetadata,
                  }),
                p());
              break;
            }
            case "tool-approval-request": {
              const g = v(n.toolCallId);
              ((g.state = "approval-requested"), (g.approval = { id: n.approvalId }), p());
              break;
            }
            case "tool-output-denied": {
              const g = v(n.toolCallId);
              ((g.state = "output-denied"), p());
              break;
            }
            case "tool-output-available": {
              const g = v(n.toolCallId);
              (g.type === "dynamic-tool"
                ? b({
                    toolCallId: n.toolCallId,
                    toolName: g.toolName,
                    state: "output-available",
                    input: g.input,
                    output: n.output,
                    preliminary: n.preliminary,
                    providerExecuted: n.providerExecuted,
                    title: g.title,
                  })
                : y({
                    toolCallId: n.toolCallId,
                    toolName: sr(g),
                    state: "output-available",
                    input: g.input,
                    output: n.output,
                    providerExecuted: n.providerExecuted,
                    preliminary: n.preliminary,
                    title: g.title,
                  }),
                p());
              break;
            }
            case "tool-output-error": {
              const g = v(n.toolCallId);
              (g.type === "dynamic-tool"
                ? b({
                    toolCallId: n.toolCallId,
                    toolName: g.toolName,
                    state: "output-error",
                    input: g.input,
                    errorText: n.errorText,
                    providerExecuted: n.providerExecuted,
                    title: g.title,
                  })
                : y({
                    toolCallId: n.toolCallId,
                    toolName: sr(g),
                    state: "output-error",
                    input: g.input,
                    rawInput: g.rawInput,
                    errorText: n.errorText,
                    providerExecuted: n.providerExecuted,
                    title: g.title,
                  }),
                p());
              break;
            }
            case "start-step": {
              u.message.parts.push({ type: "step-start" });
              break;
            }
            case "finish-step": {
              ((u.activeTextParts = {}), (u.activeReasoningParts = {}));
              break;
            }
            case "start": {
              (n.messageId != null && (u.message.id = n.messageId),
                await R(n.messageMetadata),
                (n.messageId != null || n.messageMetadata != null) && p());
              break;
            }
            case "finish": {
              (n.finishReason != null && (u.finishReason = n.finishReason),
                await R(n.messageMetadata),
                n.messageMetadata != null && p());
              break;
            }
            case "message-metadata": {
              (await R(n.messageMetadata), n.messageMetadata != null && p());
              break;
            }
            case "error": {
              s?.(new Error(n.errorText));
              break;
            }
            default:
              if (Bu(n)) {
                if (a?.[n.type] != null) {
                  const S = u.message.parts.findIndex(
                      (x) => "id" in x && "data" in x && x.id === n.id && x.type === n.type
                    ),
                    T = S >= 0 ? S : u.message.parts.length;
                  await xt({
                    value: n.data,
                    schema: a[n.type],
                    context: {
                      field: `message.parts[${T}].data`,
                      entityName: n.type,
                      entityId: n.id,
                    },
                  });
                }
                const g = n;
                if (g.transient) {
                  i?.(g);
                  break;
                }
                const M =
                  g.id != null
                    ? u.message.parts.find((S) => g.type === S.type && g.id === S.id)
                    : void 0;
                (M != null ? (M.data = g.data) : u.message.parts.push(g), i?.(g), p());
              }
          }
          l.enqueue(n);
        });
      },
    })
  );
}
function Sn({ messageId: e, originalMessages: t = [], onFinish: a, onError: r, stream: s }) {
  let o = t?.[t.length - 1];
  o?.role !== "assistant" ? (o = void 0) : (e = o.id);
  let i = !1;
  const n = s.pipeThrough(
    new TransformStream({
      transform(d, h) {
        if (d.type === "start") {
          const m = d;
          m.messageId == null && e != null && (m.messageId = e);
        }
        (d.type === "abort" && (i = !0), h.enqueue(d));
      },
    })
  );
  if (a == null) return n;
  const l = Ir({ lastMessage: o ? structuredClone(o) : void 0, messageId: e ?? "" }),
    u = async (d) => {
      await d({ state: l, write: () => {} });
    };
  let p = !1;
  const c = async () => {
    if (p || !a) return;
    p = !0;
    const d = l.message.id === o?.id;
    await a({
      isAborted: i,
      isContinuation: d,
      responseMessage: l.message,
      messages: [...(d ? t.slice(0, -1) : t), l.message],
      finishReason: l.finishReason,
    });
  };
  return Tr({ stream: n, runUpdateMessageJob: u, onError: r }).pipeThrough(
    new TransformStream({
      transform(d, h) {
        h.enqueue(d);
      },
      async cancel() {
        await c();
      },
      async flush() {
        await c();
      },
    })
  );
}
function En({ response: e, status: t, statusText: a, headers: r, stream: s, consumeSseStream: o }) {
  let i = s.pipeThrough(new In());
  if (o) {
    const [n, l] = i.tee();
    ((i = n), o({ stream: l }));
  }
  wn({
    response: e,
    status: t,
    statusText: a,
    headers: Object.fromEntries(pa(r, Tn).entries()),
    stream: i.pipeThrough(new TextEncoderStream()),
  });
}
function ot(e) {
  const t = e.pipeThrough(new TransformStream());
  return (
    (t[Symbol.asyncIterator] = function () {
      const a = this.getReader();
      let r = !1;
      async function s(o) {
        var i;
        if (!r) {
          r = !0;
          try {
            o && (await ((i = a.cancel) == null ? void 0 : i.call(a)));
          } finally {
            try {
              a.releaseLock();
            } catch {}
          }
        }
      }
      return {
        async next() {
          if (r) return { done: !0, value: void 0 };
          const { done: o, value: i } = await a.read();
          return o ? (await s(!0), { done: !0, value: void 0 }) : { done: !1, value: i };
        },
        async return() {
          return (await s(!0), { done: !0, value: void 0 });
        },
        async throw(o) {
          throw (await s(!0), o);
        },
      };
    }),
    t
  );
}
async function Pa({ stream: e, onError: t }) {
  const a = e.getReader();
  try {
    for (;;) {
      const { done: r } = await a.read();
      if (r) break;
    }
  } catch (r) {
    t?.(r);
  } finally {
    a.releaseLock();
  }
}
function mo() {
  let e, t;
  return {
    promise: new Promise((r, s) => {
      ((e = r), (t = s));
    }),
    resolve: e,
    reject: t,
  };
}
function Rn() {
  let e = [],
    t = null,
    a = !1,
    r = mo();
  const s = () => {
      ((a = !0), r.resolve(), e.forEach((i) => i.cancel()), (e = []), t?.close());
    },
    o = async () => {
      if (a && e.length === 0) {
        t?.close();
        return;
      }
      if (e.length === 0) return ((r = mo()), await r.promise, o());
      try {
        const { value: i, done: n } = await e[0].read();
        n ? (e.shift(), e.length === 0 && a ? t?.close() : await o()) : t?.enqueue(i);
      } catch (i) {
        (t?.error(i), e.shift(), s());
      }
    };
  return {
    stream: new ReadableStream({
      start(i) {
        t = i;
      },
      pull: o,
      async cancel() {
        for (const i of e) await i.cancel();
        ((e = []), (a = !0));
      },
    }),
    addStream: (i) => {
      if (a) throw new Error("Cannot add inner stream: outer stream is closed");
      (e.push(i.getReader()), r.resolve());
    },
    close: () => {
      ((a = !0), r.resolve(), e.length === 0 && t?.close());
    },
    terminate: s,
  };
}
function Cn() {
  var e, t;
  return (t = (e = globalThis?.performance) == null ? void 0 : e.now()) != null ? t : Date.now();
}
function Lu({
  tools: e,
  generatorStream: t,
  tracer: a,
  telemetry: r,
  system: s,
  messages: o,
  abortSignal: i,
  repairToolCall: n,
  experimental_context: l,
  generateId: u,
}) {
  let p = null;
  const c = new ReadableStream({
      start(g) {
        p = g;
      },
    }),
    d = new Set(),
    h = new Map(),
    m = new Map();
  let v = !1,
    y;
  function b() {
    v && d.size === 0 && (y != null && p.enqueue(y), p.close());
  }
  const R = new TransformStream({
    async transform(g, M) {
      const S = g.type;
      switch (S) {
        case "stream-start":
        case "text-start":
        case "text-delta":
        case "text-end":
        case "reasoning-start":
        case "reasoning-delta":
        case "reasoning-end":
        case "tool-input-start":
        case "tool-input-delta":
        case "tool-input-end":
        case "source":
        case "response-metadata":
        case "error":
        case "raw": {
          M.enqueue(g);
          break;
        }
        case "file": {
          M.enqueue({ type: "file", file: new ku({ data: g.data, mediaType: g.mediaType }) });
          break;
        }
        case "finish": {
          y = {
            type: "finish",
            finishReason: g.finishReason.unified,
            rawFinishReason: g.finishReason.raw,
            usage: la(g.usage),
            providerMetadata: g.providerMetadata,
          };
          break;
        }
        case "tool-approval-request": {
          const T = m.get(g.toolCallId);
          if (T == null) {
            p.enqueue({
              type: "error",
              error: new vr({ toolCallId: g.toolCallId, approvalId: g.approvalId }),
            });
            break;
          }
          M.enqueue({ type: "tool-approval-request", approvalId: g.approvalId, toolCall: T });
          break;
        }
        case "tool-call": {
          try {
            const T = await fn({
              toolCall: g,
              tools: e,
              repairToolCall: n,
              system: s,
              messages: o,
            });
            if ((m.set(T.toolCallId, T), M.enqueue(T), T.invalid)) {
              p.enqueue({
                type: "tool-error",
                toolCallId: T.toolCallId,
                toolName: T.toolName,
                input: T.input,
                error: Ea(T.error),
                dynamic: !0,
                title: T.title,
              });
              break;
            }
            const x = e?.[T.toolName];
            if (x == null) break;
            if (
              (x.onInputAvailable != null &&
                (await x.onInputAvailable({
                  input: T.input,
                  toolCallId: T.toolCallId,
                  messages: o,
                  abortSignal: i,
                  experimental_context: l,
                })),
              await cn({ tool: x, toolCall: T, messages: o, experimental_context: l }))
            ) {
              p.enqueue({ type: "tool-approval-request", approvalId: u(), toolCall: T });
              break;
            }
            if ((h.set(T.toolCallId, T.input), x.execute != null && T.providerExecuted !== !0)) {
              const P = u();
              (d.add(P),
                wr({
                  toolCall: T,
                  tools: e,
                  tracer: a,
                  telemetry: r,
                  messages: o,
                  abortSignal: i,
                  experimental_context: l,
                  onPreliminaryToolResult: (j) => {
                    p.enqueue(j);
                  },
                })
                  .then((j) => {
                    p.enqueue(j);
                  })
                  .catch((j) => {
                    p.enqueue({ type: "error", error: j });
                  })
                  .finally(() => {
                    (d.delete(P), b());
                  }));
            }
          } catch (T) {
            p.enqueue({ type: "error", error: T });
          }
          break;
        }
        case "tool-result": {
          const T = g.toolName;
          g.isError
            ? p.enqueue({
                type: "tool-error",
                toolCallId: g.toolCallId,
                toolName: T,
                input: h.get(g.toolCallId),
                providerExecuted: !0,
                error: g.result,
                dynamic: g.dynamic,
              })
            : M.enqueue({
                type: "tool-result",
                toolCallId: g.toolCallId,
                toolName: T,
                input: h.get(g.toolCallId),
                output: g.result,
                providerExecuted: !0,
                dynamic: g.dynamic,
              });
          break;
        }
        default: {
          const T = S;
          throw new Error(`Unhandled chunk type: ${T}`);
        }
      }
    },
    flush() {
      ((v = !0), b());
    },
  });
  return new ReadableStream({
    async start(g) {
      return Promise.all([
        t.pipeThrough(R).pipeTo(
          new WritableStream({
            write(M) {
              g.enqueue(M);
            },
            close() {},
          })
        ),
        c.pipeTo(
          new WritableStream({
            write(M) {
              g.enqueue(M);
            },
            close() {
              g.close();
            },
          })
        ),
      ]);
    },
  });
}
var Hu = Ra({ prefix: "aitxt", size: 24 });
function Yu({
  model: e,
  tools: t,
  toolChoice: a,
  system: r,
  prompt: s,
  messages: o,
  maxRetries: i,
  abortSignal: n,
  timeout: l,
  headers: u,
  stopWhen: p = br(1),
  experimental_output: c,
  output: d = c,
  experimental_telemetry: h,
  prepareStep: m,
  providerOptions: v,
  experimental_activeTools: y,
  activeTools: b = y,
  experimental_repairToolCall: R,
  experimental_transform: g,
  experimental_download: M,
  includeRawChunks: S = !1,
  onChunk: T,
  onError: x = ({ error: K }) => {
    console.error(K);
  },
  onFinish: P,
  onAbort: j,
  onStepFinish: A,
  experimental_context: C,
  experimental_include: U,
  _internal: { now: F = Cn, generateId: $ = Hu } = {},
  ...ue
}) {
  const K = hr(l),
    se = Qs(l),
    Z = lu(l),
    he = se != null ? new AbortController() : void 0,
    ge = Z != null ? new AbortController() : void 0;
  return new zu({
    model: Gt(e),
    telemetry: h,
    headers: u,
    settings: ue,
    maxRetries: i,
    abortSignal: gn(n, K != null ? AbortSignal.timeout(K) : void 0, he?.signal, ge?.signal),
    stepTimeoutMs: se,
    stepAbortController: he,
    chunkTimeoutMs: Z,
    chunkAbortController: ge,
    system: r,
    prompt: s,
    messages: o,
    tools: t,
    toolChoice: a,
    transforms: wt(g),
    activeTools: b,
    repairToolCall: R,
    stopConditions: wt(p),
    output: d,
    providerOptions: v,
    prepareStep: m,
    includeRawChunks: S,
    onChunk: T,
    onError: x,
    onFinish: P,
    onAbort: j,
    onStepFinish: A,
    now: F,
    generateId: $,
    experimental_context: C,
    download: M,
    include: U,
  });
}
function Ku(e) {
  let t,
    a = "",
    r = "",
    s,
    o = "";
  function i({ controller: n, partialOutput: l = void 0 }) {
    (n.enqueue({
      part: { type: "text-delta", id: t, text: r, providerMetadata: s },
      partialOutput: l,
    }),
      (r = ""));
  }
  return new TransformStream({
    async transform(n, l) {
      var u;
      if (
        (n.type === "finish-step" && r.length > 0 && i({ controller: l }),
        n.type !== "text-delta" && n.type !== "text-start" && n.type !== "text-end")
      ) {
        l.enqueue({ part: n, partialOutput: void 0 });
        return;
      }
      if (t == null) t = n.id;
      else if (n.id !== t) {
        l.enqueue({ part: n, partialOutput: void 0 });
        return;
      }
      if (n.type === "text-start") {
        l.enqueue({ part: n, partialOutput: void 0 });
        return;
      }
      if (n.type === "text-end") {
        (r.length > 0 && i({ controller: l }), l.enqueue({ part: n, partialOutput: void 0 }));
        return;
      }
      ((a += n.text), (r += n.text), (s = (u = n.providerMetadata) != null ? u : s));
      const p = await e.parsePartialOutput({ text: a });
      if (p !== void 0) {
        const c = JSON.stringify(p.partial);
        c !== o && (i({ controller: l, partialOutput: p.partial }), (o = c));
      }
    },
  });
}
var zu = class {
    constructor({
      model: e,
      telemetry: t,
      headers: a,
      settings: r,
      maxRetries: s,
      abortSignal: o,
      stepTimeoutMs: i,
      stepAbortController: n,
      chunkTimeoutMs: l,
      chunkAbortController: u,
      system: p,
      prompt: c,
      messages: d,
      tools: h,
      toolChoice: m,
      transforms: v,
      activeTools: y,
      repairToolCall: b,
      stopConditions: R,
      output: g,
      providerOptions: M,
      prepareStep: S,
      includeRawChunks: T,
      now: x,
      generateId: P,
      onChunk: j,
      onError: A,
      onFinish: C,
      onAbort: U,
      onStepFinish: F,
      experimental_context: $,
      download: ue,
      include: K,
    }) {
      ((this._totalUsage = new Be()),
        (this._finishReason = new Be()),
        (this._rawFinishReason = new Be()),
        (this._steps = new Be()),
        (this.outputSpecification = g),
        (this.includeRawChunks = T),
        (this.tools = h));
      let se,
        Z = [];
      const he = [];
      let ge,
        Ke,
        Ce,
        _e = {},
        we = [];
      const X = [],
        Ae = new Map();
      let ze,
        Me = {},
        ye = {};
      const de = new TransformStream({
          async transform(te, W) {
            var ie, E, me, qe;
            W.enqueue(te);
            const { part: _ } = te;
            if (
              ((_.type === "text-delta" ||
                _.type === "reasoning-delta" ||
                _.type === "source" ||
                _.type === "tool-call" ||
                _.type === "tool-result" ||
                _.type === "tool-input-start" ||
                _.type === "tool-input-delta" ||
                _.type === "raw") &&
                (await j?.({ chunk: _ })),
              _.type === "error" && (await A({ error: Oa(_.error) })),
              _.type === "text-start" &&
                ((Me[_.id] = { type: "text", text: "", providerMetadata: _.providerMetadata }),
                Z.push(Me[_.id])),
              _.type === "text-delta")
            ) {
              const Q = Me[_.id];
              if (Q == null) {
                W.enqueue({
                  part: { type: "error", error: `text part ${_.id} not found` },
                  partialOutput: void 0,
                });
                return;
              }
              ((Q.text += _.text),
                (Q.providerMetadata = (ie = _.providerMetadata) != null ? ie : Q.providerMetadata));
            }
            if (_.type === "text-end") {
              const Q = Me[_.id];
              if (Q == null) {
                W.enqueue({
                  part: { type: "error", error: `text part ${_.id} not found` },
                  partialOutput: void 0,
                });
                return;
              }
              ((Q.providerMetadata = (E = _.providerMetadata) != null ? E : Q.providerMetadata),
                delete Me[_.id]);
            }
            if (
              (_.type === "reasoning-start" &&
                ((ye[_.id] = { type: "reasoning", text: "", providerMetadata: _.providerMetadata }),
                Z.push(ye[_.id])),
              _.type === "reasoning-delta")
            ) {
              const Q = ye[_.id];
              if (Q == null) {
                W.enqueue({
                  part: { type: "error", error: `reasoning part ${_.id} not found` },
                  partialOutput: void 0,
                });
                return;
              }
              ((Q.text += _.text),
                (Q.providerMetadata = (me = _.providerMetadata) != null ? me : Q.providerMetadata));
            }
            if (_.type === "reasoning-end") {
              const Q = ye[_.id];
              if (Q == null) {
                W.enqueue({
                  part: { type: "error", error: `reasoning part ${_.id} not found` },
                  partialOutput: void 0,
                });
                return;
              }
              ((Q.providerMetadata = (qe = _.providerMetadata) != null ? qe : Q.providerMetadata),
                delete ye[_.id]);
            }
            if (
              (_.type === "file" && Z.push({ type: "file", file: _.file }),
              _.type === "source" && Z.push(_),
              _.type === "tool-call" && Z.push(_),
              _.type === "tool-result" && !_.preliminary && Z.push(_),
              _.type === "tool-approval-request" && Z.push(_),
              _.type === "tool-error" && Z.push(_),
              _.type === "start-step" &&
                ((Z = []), (ye = {}), (Me = {}), (_e = _.request), (we = _.warnings)),
              _.type === "finish-step")
            ) {
              const Q = await rr({ content: Z, tools: h }),
                B = new vn({
                  content: Z,
                  finishReason: _.finishReason,
                  rawFinishReason: _.rawFinishReason,
                  usage: _.usage,
                  warnings: we,
                  request: _e,
                  response: { ..._.response, messages: [...he, ...Q] },
                  providerMetadata: _.providerMetadata,
                });
              (await F?.(B),
                Fe({ warnings: we, provider: e.provider, model: e.modelId }),
                X.push(B),
                he.push(...Q),
                se.resolve());
            }
            _.type === "finish" &&
              ((Ce = _.totalUsage), (ge = _.finishReason), (Ke = _.rawFinishReason));
          },
          async flush(te) {
            try {
              if (X.length === 0) {
                const me = o?.aborted
                  ? o.reason
                  : new ms({ message: "No output generated. Check the stream for errors." });
                (ne._finishReason.reject(me),
                  ne._rawFinishReason.reject(me),
                  ne._totalUsage.reject(me),
                  ne._steps.reject(me));
                return;
              }
              const W = ge ?? "other",
                ie = Ce ?? ya();
              (ne._finishReason.resolve(W),
                ne._rawFinishReason.resolve(Ke),
                ne._totalUsage.resolve(ie),
                ne._steps.resolve(X));
              const E = X[X.length - 1];
              (await C?.({
                finishReason: E.finishReason,
                rawFinishReason: E.rawFinishReason,
                totalUsage: ie,
                usage: E.usage,
                content: E.content,
                text: E.text,
                reasoningText: E.reasoningText,
                reasoning: E.reasoning,
                files: E.files,
                sources: E.sources,
                toolCalls: E.toolCalls,
                staticToolCalls: E.staticToolCalls,
                dynamicToolCalls: E.dynamicToolCalls,
                toolResults: E.toolResults,
                staticToolResults: E.staticToolResults,
                dynamicToolResults: E.dynamicToolResults,
                request: E.request,
                response: E.response,
                warnings: E.warnings,
                providerMetadata: E.providerMetadata,
                steps: X,
                experimental_context: $,
              }),
                ze.setAttributes(
                  await Y({
                    telemetry: t,
                    attributes: {
                      "ai.response.finishReason": W,
                      "ai.response.text": { output: () => E.text },
                      "ai.response.toolCalls": {
                        output: () => {
                          var me;
                          return (me = E.toolCalls) != null && me.length
                            ? JSON.stringify(E.toolCalls)
                            : void 0;
                        },
                      },
                      "ai.response.providerMetadata": JSON.stringify(E.providerMetadata),
                      "ai.usage.inputTokens": ie.inputTokens,
                      "ai.usage.outputTokens": ie.outputTokens,
                      "ai.usage.totalTokens": ie.totalTokens,
                      "ai.usage.reasoningTokens": ie.reasoningTokens,
                      "ai.usage.cachedInputTokens": ie.cachedInputTokens,
                    },
                  })
                ));
            } catch (W) {
              te.error(W);
            } finally {
              ze.end();
            }
          },
        }),
        Ne = Rn();
      ((this.addStream = Ne.addStream), (this.closeStream = Ne.close));
      const Ve = Ne.stream.getReader();
      let Ge = new ReadableStream({
        async start(te) {
          te.enqueue({ type: "start" });
        },
        async pull(te) {
          function W() {
            (U?.({ steps: X }),
              te.enqueue({
                type: "abort",
                ...(o?.reason !== void 0 ? { reason: ra(o.reason) } : {}),
              }),
              te.close());
          }
          try {
            const { done: ie, value: E } = await Ve.read();
            if (ie) {
              te.close();
              return;
            }
            if (o?.aborted) {
              W();
              return;
            }
            te.enqueue(E);
          } catch (ie) {
            _o(ie) && o?.aborted ? W() : te.error(ie);
          }
        },
        cancel(te) {
          return Ne.stream.cancel(te);
        },
      });
      for (const te of v)
        Ge = Ge.pipeThrough(
          te({
            tools: h,
            stopStream() {
              Ne.terminate();
            },
          })
        );
      this.baseStream = Ge.pipeThrough(Ku(g ?? Ma())).pipeThrough(de);
      const { maxRetries: tt, retry: lt } = et({ maxRetries: s, abortSignal: o }),
        O = kt(t),
        D = Nt(r),
        Je = Ot({ model: e, telemetry: t, headers: a, settings: { ...D, maxRetries: tt } }),
        ne = this;
      Re({
        name: "ai.streamText",
        attributes: Y({
          telemetry: t,
          attributes: {
            ...Ee({ operationId: "ai.streamText", telemetry: t }),
            ...Je,
            "ai.prompt": { input: () => JSON.stringify({ system: p, prompt: c, messages: d }) },
          },
        }),
        tracer: O,
        endWhenDone: !1,
        fn: async (te) => {
          ze = te;
          const W = await Na({ system: p, prompt: c, messages: d }),
            ie = W.messages,
            E = [],
            { approvedToolApprovals: me, deniedToolApprovals: qe } = pn({ messages: ie });
          if (qe.length > 0 || me.length > 0) {
            const Q = [...me, ...qe].filter((q) => q.toolCall.providerExecuted),
              B = me.filter((q) => !q.toolCall.providerExecuted),
              vt = qe.filter((q) => !q.toolCall.providerExecuted),
              bt = qe.filter((q) => q.toolCall.providerExecuted);
            let z;
            const be = new ReadableStream({
              start(q) {
                z = q;
              },
            });
            ne.addStream(be);
            try {
              for (const ee of [...vt, ...bt])
                z?.enqueue({
                  type: "tool-output-denied",
                  toolCallId: ee.toolCall.toolCallId,
                  toolName: ee.toolCall.toolName,
                });
              const q = [];
              if (
                (await Promise.all(
                  B.map(async (ee) => {
                    const le = await wr({
                      toolCall: ee.toolCall,
                      tools: h,
                      tracer: O,
                      telemetry: t,
                      messages: ie,
                      abortSignal: o,
                      experimental_context: $,
                      onPreliminaryToolResult: (ht) => {
                        z?.enqueue(ht);
                      },
                    });
                    le != null && (z?.enqueue(le), q.push(le));
                  })
                ),
                Q.length > 0 &&
                  E.push({
                    role: "tool",
                    content: Q.map((ee) => ({
                      type: "tool-approval-response",
                      approvalId: ee.approvalResponse.approvalId,
                      approved: ee.approvalResponse.approved,
                      reason: ee.approvalResponse.reason,
                      providerExecuted: !0,
                    })),
                  }),
                q.length > 0 || vt.length > 0)
              ) {
                const ee = [];
                for (const le of q)
                  ee.push({
                    type: "tool-result",
                    toolCallId: le.toolCallId,
                    toolName: le.toolName,
                    output: await Mt({
                      toolCallId: le.toolCallId,
                      input: le.input,
                      tool: h?.[le.toolName],
                      output: le.type === "tool-result" ? le.output : le.error,
                      errorMode: le.type === "tool-error" ? "json" : "none",
                    }),
                  });
                for (const le of vt)
                  ee.push({
                    type: "tool-result",
                    toolCallId: le.toolCall.toolCallId,
                    toolName: le.toolCall.toolName,
                    output: { type: "execution-denied", reason: le.approvalResponse.reason },
                  });
                E.push({ role: "tool", content: ee });
              }
            } finally {
              z?.close();
            }
          }
          he.push(...E);
          async function _({ currentStep: Q, responseMessages: B, usage: vt }) {
            var bt, z, be, q, ee, le, ht;
            const Pt = ne.includeRawChunks,
              gt = i != null ? setTimeout(() => n.abort(), i) : void 0;
            let at;
            function qa() {
              l != null && (at != null && clearTimeout(at), (at = setTimeout(() => u.abort(), l)));
            }
            function Ht() {
              at != null && (clearTimeout(at), (at = void 0));
            }
            function ca() {
              gt != null && clearTimeout(gt);
            }
            try {
              se = new Be();
              const It = [...ie, ...B],
                Ie = await S?.({
                  model: e,
                  steps: X,
                  stepNumber: X.length,
                  messages: It,
                  experimental_context: $,
                }),
                V = Gt((bt = Ie?.model) != null ? bt : e),
                Se = await Aa({
                  prompt: {
                    system: (z = Ie?.system) != null ? z : W.system,
                    messages: (be = Ie?.messages) != null ? be : It,
                  },
                  supportedUrls: await V.supportedUrls,
                  download: ue,
                }),
                { toolChoice: Tt, tools: ut } = await rn({
                  tools: h,
                  toolChoice: (q = Ie?.toolChoice) != null ? q : m,
                  activeTools: (ee = Ie?.activeTools) != null ? ee : y,
                });
              $ = (le = Ie?.experimental_context) != null ? le : $;
              const fa = Bt(M, Ie?.providerOptions),
                {
                  result: { stream: ma, response: Yt, request: qt },
                  doStreamSpan: dt,
                  startTimestampMs: Kt,
                } = await lt(() =>
                  Re({
                    name: "ai.streamText.doStream",
                    attributes: Y({
                      telemetry: t,
                      attributes: {
                        ...Ee({ operationId: "ai.streamText.doStream", telemetry: t }),
                        ...Je,
                        "ai.model.provider": V.provider,
                        "ai.model.id": V.modelId,
                        "ai.prompt.messages": { input: () => ka(Se) },
                        "ai.prompt.tools": { input: () => ut?.map((k) => JSON.stringify(k)) },
                        "ai.prompt.toolChoice": {
                          input: () => (Tt != null ? JSON.stringify(Tt) : void 0),
                        },
                        "gen_ai.system": V.provider,
                        "gen_ai.request.model": V.modelId,
                        "gen_ai.request.frequency_penalty": D.frequencyPenalty,
                        "gen_ai.request.max_tokens": D.maxOutputTokens,
                        "gen_ai.request.presence_penalty": D.presencePenalty,
                        "gen_ai.request.stop_sequences": D.stopSequences,
                        "gen_ai.request.temperature": D.temperature,
                        "gen_ai.request.top_k": D.topK,
                        "gen_ai.request.top_p": D.topP,
                      },
                    }),
                    tracer: O,
                    endWhenDone: !1,
                    fn: async (k) => ({
                      startTimestampMs: x(),
                      doStreamSpan: k,
                      result: await V.doStream({
                        ...D,
                        tools: ut,
                        toolChoice: Tt,
                        responseFormat: await g?.responseFormat,
                        prompt: Se,
                        providerOptions: fa,
                        abortSignal: o,
                        headers: a,
                        includeRawChunks: Pt,
                      }),
                    }),
                  })
                ),
                Da = Lu({
                  tools: h,
                  generatorStream: ma,
                  tracer: O,
                  telemetry: t,
                  system: p,
                  messages: It,
                  repairToolCall: b,
                  abortSignal: o,
                  experimental_context: $,
                  generateId: P,
                }),
                Te = (ht = K?.requestBody) == null || ht ? (qt ?? {}) : { ...qt, body: void 0 },
                We = [],
                yt = [];
              let $a;
              const ja = {};
              let Dt = "other",
                Ua,
                Xe = ya(),
                Fa,
                xr = !0,
                rt = { id: P(), timestamp: new Date(), modelId: e.modelId },
                _r = "";
              ne.addStream(
                Da.pipeThrough(
                  new TransformStream({
                    async transform(k, xe) {
                      var zt, Xt, va, ve, $t;
                      if ((qa(), k.type === "stream-start")) {
                        $a = k.warnings;
                        return;
                      }
                      if (xr) {
                        const pe = x() - Kt;
                        ((xr = !1),
                          dt.addEvent("ai.stream.firstChunk", { "ai.response.msToFirstChunk": pe }),
                          dt.setAttributes({ "ai.response.msToFirstChunk": pe }),
                          xe.enqueue({ type: "start-step", request: Te, warnings: $a ?? [] }));
                      }
                      const Va = k.type;
                      switch (Va) {
                        case "tool-approval-request":
                        case "text-start":
                        case "text-end": {
                          xe.enqueue(k);
                          break;
                        }
                        case "text-delta": {
                          k.delta.length > 0 &&
                            (xe.enqueue({
                              type: "text-delta",
                              id: k.id,
                              text: k.delta,
                              providerMetadata: k.providerMetadata,
                            }),
                            (_r += k.delta));
                          break;
                        }
                        case "reasoning-start":
                        case "reasoning-end": {
                          xe.enqueue(k);
                          break;
                        }
                        case "reasoning-delta": {
                          xe.enqueue({
                            type: "reasoning-delta",
                            id: k.id,
                            text: k.delta,
                            providerMetadata: k.providerMetadata,
                          });
                          break;
                        }
                        case "tool-call": {
                          (xe.enqueue(k), We.push(k));
                          break;
                        }
                        case "tool-result": {
                          (xe.enqueue(k), k.preliminary || yt.push(k));
                          break;
                        }
                        case "tool-error": {
                          (xe.enqueue(k), yt.push(k));
                          break;
                        }
                        case "response-metadata": {
                          rt = {
                            id: (zt = k.id) != null ? zt : rt.id,
                            timestamp: (Xt = k.timestamp) != null ? Xt : rt.timestamp,
                            modelId: (va = k.modelId) != null ? va : rt.modelId,
                          };
                          break;
                        }
                        case "finish": {
                          ((Xe = k.usage),
                            (Dt = k.finishReason),
                            (Ua = k.rawFinishReason),
                            (Fa = k.providerMetadata));
                          const pe = x() - Kt;
                          (dt.addEvent("ai.stream.finish"),
                            dt.setAttributes({
                              "ai.response.msToFinish": pe,
                              "ai.response.avgOutputTokensPerSecond":
                                (1e3 * ((ve = Xe.outputTokens) != null ? ve : 0)) / pe,
                            }));
                          break;
                        }
                        case "file": {
                          xe.enqueue(k);
                          break;
                        }
                        case "source": {
                          xe.enqueue(k);
                          break;
                        }
                        case "tool-input-start": {
                          ja[k.id] = k.toolName;
                          const pe = h?.[k.toolName];
                          (pe?.onInputStart != null &&
                            (await pe.onInputStart({
                              toolCallId: k.id,
                              messages: It,
                              abortSignal: o,
                              experimental_context: $,
                            })),
                            xe.enqueue({
                              ...k,
                              dynamic: ($t = k.dynamic) != null ? $t : pe?.type === "dynamic",
                              title: pe?.title,
                            }));
                          break;
                        }
                        case "tool-input-end": {
                          (delete ja[k.id], xe.enqueue(k));
                          break;
                        }
                        case "tool-input-delta": {
                          const pe = ja[k.id],
                            Ga = h?.[pe];
                          (Ga?.onInputDelta != null &&
                            (await Ga.onInputDelta({
                              inputTextDelta: k.delta,
                              toolCallId: k.id,
                              messages: It,
                              abortSignal: o,
                              experimental_context: $,
                            })),
                            xe.enqueue(k));
                          break;
                        }
                        case "error": {
                          (xe.enqueue(k), (Dt = "error"));
                          break;
                        }
                        case "raw": {
                          Pt && xe.enqueue(k);
                          break;
                        }
                        default: {
                          const pe = Va;
                          throw new Error(`Unknown chunk type: ${pe}`);
                        }
                      }
                    },
                    async flush(k) {
                      const xe = We.length > 0 ? JSON.stringify(We) : void 0;
                      try {
                        dt.setAttributes(
                          await Y({
                            telemetry: t,
                            attributes: {
                              "ai.response.finishReason": Dt,
                              "ai.response.text": { output: () => _r },
                              "ai.response.toolCalls": { output: () => xe },
                              "ai.response.id": rt.id,
                              "ai.response.model": rt.modelId,
                              "ai.response.timestamp": rt.timestamp.toISOString(),
                              "ai.response.providerMetadata": JSON.stringify(Fa),
                              "ai.usage.inputTokens": Xe.inputTokens,
                              "ai.usage.outputTokens": Xe.outputTokens,
                              "ai.usage.totalTokens": Xe.totalTokens,
                              "ai.usage.reasoningTokens": Xe.reasoningTokens,
                              "ai.usage.cachedInputTokens": Xe.cachedInputTokens,
                              "gen_ai.response.finish_reasons": [Dt],
                              "gen_ai.response.id": rt.id,
                              "gen_ai.response.model": rt.modelId,
                              "gen_ai.usage.input_tokens": Xe.inputTokens,
                              "gen_ai.usage.output_tokens": Xe.outputTokens,
                            },
                          })
                        );
                      } catch {
                      } finally {
                        dt.end();
                      }
                      k.enqueue({
                        type: "finish-step",
                        finishReason: Dt,
                        rawFinishReason: Ua,
                        usage: Xe,
                        providerMetadata: Fa,
                        response: { ...rt, headers: Yt?.headers },
                      });
                      const zt = un(vt, Xe);
                      await se.promise;
                      const Xt = We.filter((ve) => ve.providerExecuted !== !0),
                        va = yt.filter((ve) => ve.providerExecuted !== !0);
                      for (const ve of We) {
                        if (ve.providerExecuted !== !0) continue;
                        const $t = h?.[ve.toolName];
                        $t?.type === "provider" &&
                          $t.supportsDeferredResults &&
                          (yt.some(
                            (pe) =>
                              (pe.type === "tool-result" || pe.type === "tool-error") &&
                              pe.toolCallId === ve.toolCallId
                          ) ||
                            Ae.set(ve.toolCallId, { toolName: ve.toolName }));
                      }
                      for (const ve of yt)
                        (ve.type === "tool-result" || ve.type === "tool-error") &&
                          Ae.delete(ve.toolCallId);
                      if (
                        (ca(),
                        Ht(),
                        ((Xt.length > 0 && va.length === Xt.length) || Ae.size > 0) &&
                          !(await hn({ stopConditions: R, steps: X })))
                      ) {
                        B.push(...(await rr({ content: X[X.length - 1].content, tools: h })));
                        try {
                          await _({ currentStep: Q + 1, responseMessages: B, usage: zt });
                        } catch (ve) {
                          (k.enqueue({ type: "error", error: ve }), ne.closeStream());
                        }
                      } else
                        (k.enqueue({
                          type: "finish",
                          finishReason: Dt,
                          rawFinishReason: Ua,
                          totalUsage: zt,
                        }),
                          ne.closeStream());
                    },
                  })
                )
              );
            } finally {
              (ca(), Ht());
            }
          }
          await _({ currentStep: 0, responseMessages: E, usage: ya() });
        },
      }).catch((te) => {
        (ne.addStream(
          new ReadableStream({
            start(W) {
              (W.enqueue({ type: "error", error: te }), W.close());
            },
          })
        ),
          ne.closeStream());
      });
    }
    get steps() {
      return (this.consumeStream(), this._steps.promise);
    }
    get finalStep() {
      return this.steps.then((e) => e[e.length - 1]);
    }
    get content() {
      return this.finalStep.then((e) => e.content);
    }
    get warnings() {
      return this.finalStep.then((e) => e.warnings);
    }
    get providerMetadata() {
      return this.finalStep.then((e) => e.providerMetadata);
    }
    get text() {
      return this.finalStep.then((e) => e.text);
    }
    get reasoningText() {
      return this.finalStep.then((e) => e.reasoningText);
    }
    get reasoning() {
      return this.finalStep.then((e) => e.reasoning);
    }
    get sources() {
      return this.finalStep.then((e) => e.sources);
    }
    get files() {
      return this.finalStep.then((e) => e.files);
    }
    get toolCalls() {
      return this.finalStep.then((e) => e.toolCalls);
    }
    get staticToolCalls() {
      return this.finalStep.then((e) => e.staticToolCalls);
    }
    get dynamicToolCalls() {
      return this.finalStep.then((e) => e.dynamicToolCalls);
    }
    get toolResults() {
      return this.finalStep.then((e) => e.toolResults);
    }
    get staticToolResults() {
      return this.finalStep.then((e) => e.staticToolResults);
    }
    get dynamicToolResults() {
      return this.finalStep.then((e) => e.dynamicToolResults);
    }
    get usage() {
      return this.finalStep.then((e) => e.usage);
    }
    get request() {
      return this.finalStep.then((e) => e.request);
    }
    get response() {
      return this.finalStep.then((e) => e.response);
    }
    get totalUsage() {
      return (this.consumeStream(), this._totalUsage.promise);
    }
    get finishReason() {
      return (this.consumeStream(), this._finishReason.promise);
    }
    get rawFinishReason() {
      return (this.consumeStream(), this._rawFinishReason.promise);
    }
    teeStream() {
      const [e, t] = this.baseStream.tee();
      return ((this.baseStream = t), e);
    }
    get textStream() {
      return ot(
        this.teeStream().pipeThrough(
          new TransformStream({
            transform({ part: e }, t) {
              e.type === "text-delta" && t.enqueue(e.text);
            },
          })
        )
      );
    }
    get fullStream() {
      return ot(
        this.teeStream().pipeThrough(
          new TransformStream({
            transform({ part: e }, t) {
              t.enqueue(e);
            },
          })
        )
      );
    }
    async consumeStream(e) {
      var t;
      try {
        await Pa({ stream: this.fullStream, onError: e?.onError });
      } catch (a) {
        (t = e?.onError) == null || t.call(e, a);
      }
    }
    get experimental_partialOutputStream() {
      return this.partialOutputStream;
    }
    get partialOutputStream() {
      return ot(
        this.teeStream().pipeThrough(
          new TransformStream({
            transform({ partialOutput: e }, t) {
              e != null && t.enqueue(e);
            },
          })
        )
      );
    }
    get elementStream() {
      var e, t, a;
      const r = (e = this.outputSpecification) == null ? void 0 : e.createElementStreamTransform();
      if (r == null)
        throw new Ca({
          functionality: `element streams in ${(a = (t = this.outputSpecification) == null ? void 0 : t.name) != null ? a : "text"} mode`,
        });
      return ot(this.teeStream().pipeThrough(r));
    }
    get output() {
      return this.finalStep.then((e) => {
        var t;
        return ((t = this.outputSpecification) != null ? t : Ma()).parseCompleteOutput(
          { text: e.text },
          { response: e.response, usage: e.usage, finishReason: e.finishReason }
        );
      });
    }
    toUIMessageStream({
      originalMessages: e,
      generateMessageId: t,
      onFinish: a,
      messageMetadata: r,
      sendReasoning: s = !0,
      sendSources: o = !1,
      sendStart: i = !0,
      sendFinish: n = !0,
      onError: l = ra,
    } = {}) {
      const u = t != null ? Wu({ originalMessages: e, responseMessageId: t }) : void 0,
        p = (d) => {
          var h;
          const m = (h = this.tools) == null ? void 0 : h[d.toolName];
          return m == null ? d.dynamic : m?.type === "dynamic" ? !0 : void 0;
        },
        c = this.fullStream.pipeThrough(
          new TransformStream({
            transform: async (d, h) => {
              const m = r?.({ part: d }),
                v = d.type;
              switch (v) {
                case "text-start": {
                  h.enqueue({
                    type: "text-start",
                    id: d.id,
                    ...(d.providerMetadata != null ? { providerMetadata: d.providerMetadata } : {}),
                  });
                  break;
                }
                case "text-delta": {
                  h.enqueue({
                    type: "text-delta",
                    id: d.id,
                    delta: d.text,
                    ...(d.providerMetadata != null ? { providerMetadata: d.providerMetadata } : {}),
                  });
                  break;
                }
                case "text-end": {
                  h.enqueue({
                    type: "text-end",
                    id: d.id,
                    ...(d.providerMetadata != null ? { providerMetadata: d.providerMetadata } : {}),
                  });
                  break;
                }
                case "reasoning-start": {
                  h.enqueue({
                    type: "reasoning-start",
                    id: d.id,
                    ...(d.providerMetadata != null ? { providerMetadata: d.providerMetadata } : {}),
                  });
                  break;
                }
                case "reasoning-delta": {
                  s &&
                    h.enqueue({
                      type: "reasoning-delta",
                      id: d.id,
                      delta: d.text,
                      ...(d.providerMetadata != null
                        ? { providerMetadata: d.providerMetadata }
                        : {}),
                    });
                  break;
                }
                case "reasoning-end": {
                  h.enqueue({
                    type: "reasoning-end",
                    id: d.id,
                    ...(d.providerMetadata != null ? { providerMetadata: d.providerMetadata } : {}),
                  });
                  break;
                }
                case "file": {
                  h.enqueue({
                    type: "file",
                    mediaType: d.file.mediaType,
                    url: `data:${d.file.mediaType};base64,${d.file.base64}`,
                  });
                  break;
                }
                case "source": {
                  (o &&
                    d.sourceType === "url" &&
                    h.enqueue({
                      type: "source-url",
                      sourceId: d.id,
                      url: d.url,
                      title: d.title,
                      ...(d.providerMetadata != null
                        ? { providerMetadata: d.providerMetadata }
                        : {}),
                    }),
                    o &&
                      d.sourceType === "document" &&
                      h.enqueue({
                        type: "source-document",
                        sourceId: d.id,
                        mediaType: d.mediaType,
                        title: d.title,
                        filename: d.filename,
                        ...(d.providerMetadata != null
                          ? { providerMetadata: d.providerMetadata }
                          : {}),
                      }));
                  break;
                }
                case "tool-input-start": {
                  const y = p(d);
                  h.enqueue({
                    type: "tool-input-start",
                    toolCallId: d.id,
                    toolName: d.toolName,
                    ...(d.providerExecuted != null ? { providerExecuted: d.providerExecuted } : {}),
                    ...(d.providerMetadata != null ? { providerMetadata: d.providerMetadata } : {}),
                    ...(y != null ? { dynamic: y } : {}),
                    ...(d.title != null ? { title: d.title } : {}),
                  });
                  break;
                }
                case "tool-input-delta": {
                  h.enqueue({
                    type: "tool-input-delta",
                    toolCallId: d.id,
                    inputTextDelta: d.delta,
                  });
                  break;
                }
                case "tool-call": {
                  const y = p(d);
                  d.invalid
                    ? h.enqueue({
                        type: "tool-input-error",
                        toolCallId: d.toolCallId,
                        toolName: d.toolName,
                        input: d.input,
                        ...(d.providerExecuted != null
                          ? { providerExecuted: d.providerExecuted }
                          : {}),
                        ...(d.providerMetadata != null
                          ? { providerMetadata: d.providerMetadata }
                          : {}),
                        ...(y != null ? { dynamic: y } : {}),
                        errorText: l(d.error),
                        ...(d.title != null ? { title: d.title } : {}),
                      })
                    : h.enqueue({
                        type: "tool-input-available",
                        toolCallId: d.toolCallId,
                        toolName: d.toolName,
                        input: d.input,
                        ...(d.providerExecuted != null
                          ? { providerExecuted: d.providerExecuted }
                          : {}),
                        ...(d.providerMetadata != null
                          ? { providerMetadata: d.providerMetadata }
                          : {}),
                        ...(y != null ? { dynamic: y } : {}),
                        ...(d.title != null ? { title: d.title } : {}),
                      });
                  break;
                }
                case "tool-approval-request": {
                  h.enqueue({
                    type: "tool-approval-request",
                    approvalId: d.approvalId,
                    toolCallId: d.toolCall.toolCallId,
                  });
                  break;
                }
                case "tool-result": {
                  const y = p(d);
                  h.enqueue({
                    type: "tool-output-available",
                    toolCallId: d.toolCallId,
                    output: d.output,
                    ...(d.providerExecuted != null ? { providerExecuted: d.providerExecuted } : {}),
                    ...(d.preliminary != null ? { preliminary: d.preliminary } : {}),
                    ...(y != null ? { dynamic: y } : {}),
                  });
                  break;
                }
                case "tool-error": {
                  const y = p(d);
                  h.enqueue({
                    type: "tool-output-error",
                    toolCallId: d.toolCallId,
                    errorText: l(d.error),
                    ...(d.providerExecuted != null ? { providerExecuted: d.providerExecuted } : {}),
                    ...(y != null ? { dynamic: y } : {}),
                  });
                  break;
                }
                case "tool-output-denied": {
                  h.enqueue({ type: "tool-output-denied", toolCallId: d.toolCallId });
                  break;
                }
                case "error": {
                  h.enqueue({ type: "error", errorText: l(d.error) });
                  break;
                }
                case "start-step": {
                  h.enqueue({ type: "start-step" });
                  break;
                }
                case "finish-step": {
                  h.enqueue({ type: "finish-step" });
                  break;
                }
                case "start": {
                  i &&
                    h.enqueue({
                      type: "start",
                      ...(m != null ? { messageMetadata: m } : {}),
                      ...(u != null ? { messageId: u } : {}),
                    });
                  break;
                }
                case "finish": {
                  n &&
                    h.enqueue({
                      type: "finish",
                      finishReason: d.finishReason,
                      ...(m != null ? { messageMetadata: m } : {}),
                    });
                  break;
                }
                case "abort": {
                  h.enqueue(d);
                  break;
                }
                case "tool-input-end":
                  break;
                case "raw":
                  break;
                default: {
                  const y = v;
                  throw new Error(`Unknown chunk type: ${y}`);
                }
              }
              m != null &&
                v !== "start" &&
                v !== "finish" &&
                h.enqueue({ type: "message-metadata", messageMetadata: m });
            },
          })
        );
      return ot(
        Sn({ stream: c, messageId: u ?? t?.(), originalMessages: e, onFinish: a, onError: l })
      );
    }
    pipeUIMessageStreamToResponse(
      e,
      {
        originalMessages: t,
        generateMessageId: a,
        onFinish: r,
        messageMetadata: s,
        sendReasoning: o,
        sendSources: i,
        sendFinish: n,
        sendStart: l,
        onError: u,
        ...p
      } = {}
    ) {
      En({
        response: e,
        stream: this.toUIMessageStream({
          originalMessages: t,
          generateMessageId: a,
          onFinish: r,
          messageMetadata: s,
          sendReasoning: o,
          sendSources: i,
          sendFinish: n,
          sendStart: l,
          onError: u,
        }),
        ...p,
      });
    }
    pipeTextStreamToResponse(e, t) {
      bn({ response: e, textStream: this.textStream, ...t });
    }
    toUIMessageStreamResponse({
      originalMessages: e,
      generateMessageId: t,
      onFinish: a,
      messageMetadata: r,
      sendReasoning: s,
      sendSources: o,
      sendFinish: i,
      sendStart: n,
      onError: l,
      ...u
    } = {}) {
      return xn({
        stream: this.toUIMessageStream({
          originalMessages: e,
          generateMessageId: t,
          onFinish: a,
          messageMetadata: r,
          sendReasoning: s,
          sendSources: o,
          sendFinish: i,
          sendStart: n,
          onError: l,
        }),
        ...u,
      });
    }
    toTextStreamResponse(e) {
      return yn({ textStream: this.textStream, ...e });
    }
  },
  Wd = class {
    constructor(e) {
      ((this.version = "agent-v1"), (this.settings = e));
    }
    get id() {
      return this.settings.id;
    }
    get tools() {
      return this.settings.tools;
    }
    async prepareCall(e) {
      var t, a, r, s;
      const { onStepFinish: o, ...i } = this.settings,
        n = { ...i, stopWhen: (t = this.settings.stopWhen) != null ? t : br(20), ...e },
        l =
          (s = await ((r = (a = this.settings).prepareCall) == null ? void 0 : r.call(a, n))) !=
          null
            ? s
            : n,
        { instructions: u, messages: p, prompt: c, ...d } = l;
      return { ...d, system: u, messages: p, prompt: c };
    }
    mergeOnStepFinishCallbacks(e) {
      const t = this.settings.onStepFinish;
      return e && t
        ? async (a) => {
            (await t(a), await e(a));
          }
        : (e ?? t);
    }
    async generate({ abortSignal: e, timeout: t, onStepFinish: a, ...r }) {
      return Vu({
        ...(await this.prepareCall(r)),
        abortSignal: e,
        timeout: t,
        onStepFinish: this.mergeOnStepFinishCallbacks(a),
      });
    }
    async stream({ abortSignal: e, timeout: t, experimental_transform: a, onStepFinish: r, ...s }) {
      return Yu({
        ...(await this.prepareCall(s)),
        abortSignal: e,
        timeout: t,
        experimental_transform: a,
        onStepFinish: this.mergeOnStepFinishCallbacks(r),
      });
    }
  };
function Bd({ execute: e, onError: t = Ea, originalMessages: a, onFinish: r, generateId: s = To }) {
  let o;
  const i = [],
    n = new ReadableStream({
      start(p) {
        o = p;
      },
    });
  function l(p) {
    try {
      o.enqueue(p);
    } catch {}
  }
  try {
    const p = e({
      writer: {
        write(c) {
          l(c);
        },
        merge(c) {
          i.push(
            (async () => {
              const d = c.getReader();
              for (;;) {
                const { done: h, value: m } = await d.read();
                if (h) break;
                l(m);
              }
            })().catch((d) => {
              l({ type: "error", errorText: t(d) });
            })
          );
        },
        onError: t,
      },
    });
    p &&
      i.push(
        p.catch((c) => {
          l({ type: "error", errorText: t(c) });
        })
      );
  } catch (p) {
    l({ type: "error", errorText: t(p) });
  }
  return (
    new Promise(async (p) => {
      for (; i.length > 0; ) await i.shift();
      p();
    }).finally(() => {
      try {
        o.close();
      } catch {}
    }),
    Sn({ stream: n, messageId: s(), originalMessages: a, onFinish: r, onError: t })
  );
}
function Ld({ message: e, stream: t, onError: a, terminateOnError: r = !1 }) {
  var s;
  let o,
    i = !1;
  const n = new ReadableStream({
      start(p) {
        o = p;
      },
    }),
    l = Ir({ messageId: (s = e?.id) != null ? s : "", lastMessage: e }),
    u = (p) => {
      (a?.(p), !i && r && ((i = !0), o?.error(p)));
    };
  return (
    Pa({
      stream: Tr({
        stream: t,
        runUpdateMessageJob(p) {
          return p({
            state: l,
            write: () => {
              o?.enqueue(structuredClone(l.message));
            },
          });
        },
        onError: u,
      }),
      onError: u,
    }).finally(() => {
      i || o?.close();
    }),
    ot(n)
  );
}
async function An(e, t) {
  const a = [];
  t?.ignoreIncompleteToolCalls &&
    (e = e.map((r) => ({
      ...r,
      parts: r.parts.filter(
        (s) => !st(s) || (s.state !== "input-streaming" && s.state !== "input-available")
      ),
    })));
  for (const r of e)
    switch (r.role) {
      case "system": {
        const s = r.parts.filter((i) => i.type === "text"),
          o = s.reduce(
            (i, n) => (n.providerMetadata != null ? { ...i, ...n.providerMetadata } : i),
            {}
          );
        a.push({
          role: "system",
          content: s.map((i) => i.text).join(""),
          ...(Object.keys(o).length > 0 ? { providerOptions: o } : {}),
        });
        break;
      }
      case "user": {
        a.push({
          role: "user",
          content: r.parts
            .map((s) => {
              var o;
              if (Xa(s))
                return {
                  type: "text",
                  text: s.text,
                  ...(s.providerMetadata != null ? { providerOptions: s.providerMetadata } : {}),
                };
              if (Qa(s))
                return {
                  type: "file",
                  mediaType: s.mediaType,
                  filename: s.filename,
                  data: s.url,
                  ...(s.providerMetadata != null ? { providerOptions: s.providerMetadata } : {}),
                };
              if (za(s)) return (o = t?.convertDataPart) == null ? void 0 : o.call(t, s);
            })
            .filter(Bn),
        });
        break;
      }
      case "assistant": {
        if (r.parts != null) {
          let s = [];
          async function o() {
            var i, n, l, u, p, c;
            if (s.length === 0) return;
            const d = [];
            for (const m of s)
              if (Xa(m))
                d.push({
                  type: "text",
                  text: m.text,
                  ...(m.providerMetadata != null ? { providerOptions: m.providerMetadata } : {}),
                });
              else if (Qa(m))
                d.push({ type: "file", mediaType: m.mediaType, filename: m.filename, data: m.url });
              else if (fo(m))
                d.push({ type: "reasoning", text: m.text, providerOptions: m.providerMetadata });
              else if (st(m)) {
                const v = wa(m);
                m.state !== "input-streaming" &&
                  (d.push({
                    type: "tool-call",
                    toolCallId: m.toolCallId,
                    toolName: v,
                    input:
                      m.state === "output-error"
                        ? (i = m.input) != null
                          ? i
                          : "rawInput" in m
                            ? m.rawInput
                            : void 0
                        : m.input,
                    providerExecuted: m.providerExecuted,
                    ...(m.callProviderMetadata != null
                      ? { providerOptions: m.callProviderMetadata }
                      : {}),
                  }),
                  m.approval != null &&
                    d.push({
                      type: "tool-approval-request",
                      approvalId: m.approval.id,
                      toolCallId: m.toolCallId,
                    }),
                  m.providerExecuted === !0 &&
                    m.state !== "approval-responded" &&
                    (m.state === "output-available" || m.state === "output-error") &&
                    d.push({
                      type: "tool-result",
                      toolCallId: m.toolCallId,
                      toolName: v,
                      output: await Mt({
                        toolCallId: m.toolCallId,
                        input: m.input,
                        output: m.state === "output-error" ? m.errorText : m.output,
                        tool: (n = t?.tools) == null ? void 0 : n[v],
                        errorMode: m.state === "output-error" ? "json" : "none",
                      }),
                      ...(m.callProviderMetadata != null
                        ? { providerOptions: m.callProviderMetadata }
                        : {}),
                    }));
              } else if (za(m)) {
                const v = (l = t?.convertDataPart) == null ? void 0 : l.call(t, m);
                v != null && d.push(v);
              } else {
                const v = m;
                throw new Error(`Unsupported part: ${v}`);
              }
            a.push({ role: "assistant", content: d });
            const h = s.filter((m) => {
              var v;
              return (
                st(m) &&
                (m.providerExecuted !== !0 ||
                  ((v = m.approval) == null ? void 0 : v.approved) != null)
              );
            });
            if (h.length > 0) {
              const m = [];
              for (const v of h)
                if (
                  (((u = v.approval) == null ? void 0 : u.approved) != null &&
                    m.push({
                      type: "tool-approval-response",
                      approvalId: v.approval.id,
                      approved: v.approval.approved,
                      reason: v.approval.reason,
                      providerExecuted: v.providerExecuted,
                    }),
                  v.providerExecuted !== !0)
                )
                  switch (v.state) {
                    case "output-denied": {
                      m.push({
                        type: "tool-result",
                        toolCallId: v.toolCallId,
                        toolName: wa(v),
                        output: {
                          type: "error-text",
                          value: (p = v.approval.reason) != null ? p : "Tool execution denied.",
                        },
                        ...(v.callProviderMetadata != null
                          ? { providerOptions: v.callProviderMetadata }
                          : {}),
                      });
                      break;
                    }
                    case "output-error":
                    case "output-available": {
                      const y = wa(v);
                      m.push({
                        type: "tool-result",
                        toolCallId: v.toolCallId,
                        toolName: y,
                        output: await Mt({
                          toolCallId: v.toolCallId,
                          input: v.input,
                          output: v.state === "output-error" ? v.errorText : v.output,
                          tool: (c = t?.tools) == null ? void 0 : c[y],
                          errorMode: v.state === "output-error" ? "text" : "none",
                        }),
                        ...(v.callProviderMetadata != null
                          ? { providerOptions: v.callProviderMetadata }
                          : {}),
                      });
                      break;
                    }
                  }
              m.length > 0 && a.push({ role: "tool", content: m });
            }
            s = [];
          }
          for (const i of r.parts)
            Xa(i) || fo(i) || Qa(i) || st(i) || za(i)
              ? s.push(i)
              : i.type === "step-start" && (await o());
          await o();
          break;
        }
        break;
      }
      default: {
        const s = r.role;
        throw new Zl({ originalMessage: r, message: `Unsupported role: ${s}` });
      }
    }
  return a;
}
var Xu = He(() =>
  Ye(
    oe(
      I({
        id: f(),
        role: ct(["system", "user", "assistant"]),
        metadata: J().optional(),
        parts: oe(
          ce([
            I({
              type: w("text"),
              text: f(),
              state: ct(["streaming", "done"]).optional(),
              providerMetadata: N.optional(),
            }),
            I({
              type: w("reasoning"),
              text: f(),
              state: ct(["streaming", "done"]).optional(),
              providerMetadata: N.optional(),
            }),
            I({
              type: w("source-url"),
              sourceId: f(),
              url: f(),
              title: f().optional(),
              providerMetadata: N.optional(),
            }),
            I({
              type: w("source-document"),
              sourceId: f(),
              mediaType: f(),
              title: f(),
              filename: f().optional(),
              providerMetadata: N.optional(),
            }),
            I({
              type: w("file"),
              mediaType: f(),
              filename: f().optional(),
              url: f(),
              providerMetadata: N.optional(),
            }),
            I({ type: w("step-start") }),
            I({ type: f().startsWith("data-"), id: f().optional(), data: J() }),
            I({
              type: w("dynamic-tool"),
              toolName: f(),
              toolCallId: f(),
              state: w("input-streaming"),
              input: J().optional(),
              providerExecuted: L().optional(),
              callProviderMetadata: N.optional(),
              output: H().optional(),
              errorText: H().optional(),
              approval: H().optional(),
            }),
            I({
              type: w("dynamic-tool"),
              toolName: f(),
              toolCallId: f(),
              state: w("input-available"),
              input: J(),
              providerExecuted: L().optional(),
              output: H().optional(),
              errorText: H().optional(),
              callProviderMetadata: N.optional(),
              approval: H().optional(),
            }),
            I({
              type: w("dynamic-tool"),
              toolName: f(),
              toolCallId: f(),
              state: w("approval-requested"),
              input: J(),
              providerExecuted: L().optional(),
              output: H().optional(),
              errorText: H().optional(),
              callProviderMetadata: N.optional(),
              approval: I({ id: f(), approved: H().optional(), reason: H().optional() }),
            }),
            I({
              type: w("dynamic-tool"),
              toolName: f(),
              toolCallId: f(),
              state: w("approval-responded"),
              input: J(),
              providerExecuted: L().optional(),
              output: H().optional(),
              errorText: H().optional(),
              callProviderMetadata: N.optional(),
              approval: I({ id: f(), approved: L(), reason: f().optional() }),
            }),
            I({
              type: w("dynamic-tool"),
              toolName: f(),
              toolCallId: f(),
              state: w("output-available"),
              input: J(),
              providerExecuted: L().optional(),
              output: J(),
              errorText: H().optional(),
              callProviderMetadata: N.optional(),
              preliminary: L().optional(),
              approval: I({ id: f(), approved: w(!0), reason: f().optional() }).optional(),
            }),
            I({
              type: w("dynamic-tool"),
              toolName: f(),
              toolCallId: f(),
              state: w("output-error"),
              input: J(),
              rawInput: J().optional(),
              providerExecuted: L().optional(),
              output: H().optional(),
              errorText: f(),
              callProviderMetadata: N.optional(),
              approval: I({ id: f(), approved: w(!0), reason: f().optional() }).optional(),
            }),
            I({
              type: w("dynamic-tool"),
              toolName: f(),
              toolCallId: f(),
              state: w("output-denied"),
              input: J(),
              providerExecuted: L().optional(),
              output: H().optional(),
              errorText: H().optional(),
              callProviderMetadata: N.optional(),
              approval: I({ id: f(), approved: w(!1), reason: f().optional() }),
            }),
            I({
              type: f().startsWith("tool-"),
              toolCallId: f(),
              state: w("input-streaming"),
              providerExecuted: L().optional(),
              callProviderMetadata: N.optional(),
              input: J().optional(),
              output: H().optional(),
              errorText: H().optional(),
              approval: H().optional(),
            }),
            I({
              type: f().startsWith("tool-"),
              toolCallId: f(),
              state: w("input-available"),
              providerExecuted: L().optional(),
              input: J(),
              output: H().optional(),
              errorText: H().optional(),
              callProviderMetadata: N.optional(),
              approval: H().optional(),
            }),
            I({
              type: f().startsWith("tool-"),
              toolCallId: f(),
              state: w("approval-requested"),
              input: J(),
              providerExecuted: L().optional(),
              output: H().optional(),
              errorText: H().optional(),
              callProviderMetadata: N.optional(),
              approval: I({ id: f(), approved: H().optional(), reason: H().optional() }),
            }),
            I({
              type: f().startsWith("tool-"),
              toolCallId: f(),
              state: w("approval-responded"),
              input: J(),
              providerExecuted: L().optional(),
              output: H().optional(),
              errorText: H().optional(),
              callProviderMetadata: N.optional(),
              approval: I({ id: f(), approved: L(), reason: f().optional() }),
            }),
            I({
              type: f().startsWith("tool-"),
              toolCallId: f(),
              state: w("output-available"),
              providerExecuted: L().optional(),
              input: J(),
              output: J(),
              errorText: H().optional(),
              callProviderMetadata: N.optional(),
              preliminary: L().optional(),
              approval: I({ id: f(), approved: w(!0), reason: f().optional() }).optional(),
            }),
            I({
              type: f().startsWith("tool-"),
              toolCallId: f(),
              state: w("output-error"),
              providerExecuted: L().optional(),
              input: J(),
              rawInput: J().optional(),
              output: H().optional(),
              errorText: f(),
              callProviderMetadata: N.optional(),
              approval: I({ id: f(), approved: w(!0), reason: f().optional() }).optional(),
            }),
            I({
              type: f().startsWith("tool-"),
              toolCallId: f(),
              state: w("output-denied"),
              providerExecuted: L().optional(),
              input: J(),
              output: H().optional(),
              errorText: H().optional(),
              callProviderMetadata: N.optional(),
              approval: I({ id: f(), approved: w(!1), reason: f().optional() }),
            }),
          ])
        ).nonempty("Message must contain at least one part"),
      })
    ).nonempty("Messages array must not be empty")
  )
);
async function Qu({ messages: e, metadataSchema: t, dataSchemas: a, tools: r }) {
  try {
    if (e == null)
      return {
        success: !1,
        error: new ae({
          parameter: "messages",
          value: e,
          message: "messages parameter must be provided",
        }),
      };
    const s = await xt({ value: e, schema: Xu });
    if (t)
      for (const [o, i] of s.entries())
        await xt({
          value: i.metadata,
          schema: t,
          context: { field: `messages[${o}].metadata`, entityId: i.id },
        });
    if (a || r)
      for (const [o, i] of s.entries())
        for (const [n, l] of i.parts.entries()) {
          if (a && l.type.startsWith("data-")) {
            const u = l,
              p = u.type.slice(5),
              c = a[p];
            if (!c)
              return {
                success: !1,
                error: new Qe({
                  value: u.data,
                  cause: `No data schema found for data part ${p}`,
                  context: {
                    field: `messages[${o}].parts[${n}].data`,
                    entityName: p,
                    entityId: u.id,
                  },
                }),
              };
            await xt({
              value: u.data,
              schema: c,
              context: { field: `messages[${o}].parts[${n}].data`, entityName: p, entityId: u.id },
            });
          }
          if (r && l.type.startsWith("tool-")) {
            const u = l,
              p = u.type.slice(5),
              c = r[p];
            if (!c)
              return {
                success: !1,
                error: new Qe({
                  value: u.input,
                  cause: `No tool schema found for tool part ${p}`,
                  context: {
                    field: `messages[${o}].parts[${n}].input`,
                    entityName: p,
                    entityId: u.toolCallId,
                  },
                }),
              };
            ((u.state === "input-available" ||
              u.state === "output-available" ||
              (u.state === "output-error" && u.input !== void 0)) &&
              (await xt({
                value: u.input,
                schema: c.inputSchema,
                context: {
                  field: `messages[${o}].parts[${n}].input`,
                  entityName: p,
                  entityId: u.toolCallId,
                },
              })),
              u.state === "output-available" &&
                c.outputSchema &&
                (await xt({
                  value: u.output,
                  schema: c.outputSchema,
                  context: {
                    field: `messages[${o}].parts[${n}].output`,
                    entityName: p,
                    entityId: u.toolCallId,
                  },
                })));
          }
        }
    return { success: !0, data: s };
  } catch (s) {
    return { success: !1, error: s };
  }
}
async function Nn({ messages: e, metadataSchema: t, dataSchemas: a, tools: r }) {
  const s = await Qu({ messages: e, metadataSchema: t, dataSchemas: a, tools: r });
  if (!s.success) throw s.error;
  return s.data;
}
async function On({
  agent: e,
  uiMessages: t,
  options: a,
  abortSignal: r,
  timeout: s,
  experimental_transform: o,
  onStepFinish: i,
  ...n
}) {
  var l;
  const u = await Nn({ messages: t, tools: e.tools }),
    p = await An(u, { tools: e.tools });
  return (
    await e.stream({
      prompt: p,
      options: a,
      abortSignal: r,
      timeout: s,
      experimental_transform: o,
      onStepFinish: i,
    })
  ).toUIMessageStream({ ...n, originalMessages: (l = n.originalMessages) != null ? l : u });
}
async function Hd({ headers: e, status: t, statusText: a, consumeSseStream: r, ...s }) {
  return xn({ headers: e, status: t, statusText: a, consumeSseStream: r, stream: await On(s) });
}
async function Yd({
  response: e,
  headers: t,
  status: a,
  statusText: r,
  consumeSseStream: s,
  ...o
}) {
  En({
    response: e,
    headers: t,
    status: a,
    statusText: r,
    consumeSseStream: s,
    stream: await On(o),
  });
}
async function Kd({
  model: e,
  value: t,
  providerOptions: a,
  maxRetries: r,
  abortSignal: s,
  headers: o,
  experimental_telemetry: i,
}) {
  const n = Xs(e),
    { maxRetries: l, retry: u } = et({ maxRetries: r, abortSignal: s }),
    p = je(o ?? {}, `ai/${Le}`),
    c = Ot({ model: n, telemetry: i, headers: p, settings: { maxRetries: l } }),
    d = kt(i);
  return Re({
    name: "ai.embed",
    attributes: Y({
      telemetry: i,
      attributes: {
        ...Ee({ operationId: "ai.embed", telemetry: i }),
        ...c,
        "ai.value": { input: () => JSON.stringify(t) },
      },
    }),
    tracer: d,
    fn: async (h) => {
      const {
        embedding: m,
        usage: v,
        warnings: y,
        response: b,
        providerMetadata: R,
      } = await u(() =>
        Re({
          name: "ai.embed.doEmbed",
          attributes: Y({
            telemetry: i,
            attributes: {
              ...Ee({ operationId: "ai.embed.doEmbed", telemetry: i }),
              ...c,
              "ai.values": { input: () => [JSON.stringify(t)] },
            },
          }),
          tracer: d,
          fn: async (g) => {
            var M;
            const S = await n.doEmbed({
                values: [t],
                abortSignal: s,
                headers: p,
                providerOptions: a,
              }),
              T = S.embeddings[0],
              x = (M = S.usage) != null ? M : { tokens: NaN };
            return (
              g.setAttributes(
                await Y({
                  telemetry: i,
                  attributes: {
                    "ai.embeddings": { output: () => S.embeddings.map((P) => JSON.stringify(P)) },
                    "ai.usage.tokens": x.tokens,
                  },
                })
              ),
              {
                embedding: T,
                usage: x,
                warnings: S.warnings,
                providerMetadata: S.providerMetadata,
                response: S.response,
              }
            );
          },
        })
      );
      return (
        h.setAttributes(
          await Y({
            telemetry: i,
            attributes: {
              "ai.embedding": { output: () => JSON.stringify(m) },
              "ai.usage.tokens": v.tokens,
            },
          })
        ),
        Fe({ warnings: y, provider: n.provider, model: n.modelId }),
        new Zu({ value: t, embedding: m, usage: v, warnings: y, providerMetadata: R, response: b })
      );
    },
  });
}
var Zu = class {
  constructor(e) {
    ((this.value = e.value),
      (this.embedding = e.embedding),
      (this.usage = e.usage),
      (this.warnings = e.warnings),
      (this.providerMetadata = e.providerMetadata),
      (this.response = e.response));
  }
};
function vo(e, t) {
  if (t <= 0) throw new Error("chunkSize must be greater than 0");
  const a = [];
  for (let r = 0; r < e.length; r += t) a.push(e.slice(r, r + t));
  return a;
}
async function zd({
  model: e,
  values: t,
  maxParallelCalls: a = 1 / 0,
  maxRetries: r,
  abortSignal: s,
  headers: o,
  providerOptions: i,
  experimental_telemetry: n,
}) {
  const l = Xs(e),
    { maxRetries: u, retry: p } = et({ maxRetries: r, abortSignal: s }),
    c = je(o ?? {}, `ai/${Le}`),
    d = Ot({ model: l, telemetry: n, headers: c, settings: { maxRetries: u } }),
    h = kt(n);
  return Re({
    name: "ai.embedMany",
    attributes: Y({
      telemetry: n,
      attributes: {
        ...Ee({ operationId: "ai.embedMany", telemetry: n }),
        ...d,
        "ai.values": { input: () => t.map((m) => JSON.stringify(m)) },
      },
    }),
    tracer: h,
    fn: async (m) => {
      var v;
      const [y, b] = await Promise.all([l.maxEmbeddingsPerCall, l.supportsParallelCalls]);
      if (y == null || y === 1 / 0) {
        const {
          embeddings: j,
          usage: A,
          warnings: C,
          response: U,
          providerMetadata: F,
        } = await p(() =>
          Re({
            name: "ai.embedMany.doEmbed",
            attributes: Y({
              telemetry: n,
              attributes: {
                ...Ee({ operationId: "ai.embedMany.doEmbed", telemetry: n }),
                ...d,
                "ai.values": { input: () => t.map(($) => JSON.stringify($)) },
              },
            }),
            tracer: h,
            fn: async ($) => {
              var ue;
              const K = await l.doEmbed({
                  values: t,
                  abortSignal: s,
                  headers: c,
                  providerOptions: i,
                }),
                se = K.embeddings,
                Z = (ue = K.usage) != null ? ue : { tokens: NaN };
              return (
                $.setAttributes(
                  await Y({
                    telemetry: n,
                    attributes: {
                      "ai.embeddings": { output: () => se.map((he) => JSON.stringify(he)) },
                      "ai.usage.tokens": Z.tokens,
                    },
                  })
                ),
                {
                  embeddings: se,
                  usage: Z,
                  warnings: K.warnings,
                  providerMetadata: K.providerMetadata,
                  response: K.response,
                }
              );
            },
          })
        );
        return (
          m.setAttributes(
            await Y({
              telemetry: n,
              attributes: {
                "ai.embeddings": { output: () => j.map(($) => JSON.stringify($)) },
                "ai.usage.tokens": A.tokens,
              },
            })
          ),
          Fe({ warnings: C, provider: l.provider, model: l.modelId }),
          new ho({
            values: t,
            embeddings: j,
            usage: A,
            warnings: C,
            providerMetadata: F,
            responses: [U],
          })
        );
      }
      const R = vo(t, y),
        g = [],
        M = [],
        S = [];
      let T = 0,
        x;
      const P = vo(R, b ? a : 1);
      for (const j of P) {
        const A = await Promise.all(
          j.map((C) =>
            p(() =>
              Re({
                name: "ai.embedMany.doEmbed",
                attributes: Y({
                  telemetry: n,
                  attributes: {
                    ...Ee({ operationId: "ai.embedMany.doEmbed", telemetry: n }),
                    ...d,
                    "ai.values": { input: () => C.map((U) => JSON.stringify(U)) },
                  },
                }),
                tracer: h,
                fn: async (U) => {
                  var F;
                  const $ = await l.doEmbed({
                      values: C,
                      abortSignal: s,
                      headers: c,
                      providerOptions: i,
                    }),
                    ue = $.embeddings,
                    K = (F = $.usage) != null ? F : { tokens: NaN };
                  return (
                    U.setAttributes(
                      await Y({
                        telemetry: n,
                        attributes: {
                          "ai.embeddings": { output: () => ue.map((se) => JSON.stringify(se)) },
                          "ai.usage.tokens": K.tokens,
                        },
                      })
                    ),
                    {
                      embeddings: ue,
                      usage: K,
                      warnings: $.warnings,
                      providerMetadata: $.providerMetadata,
                      response: $.response,
                    }
                  );
                },
              })
            )
          )
        );
        for (const C of A)
          if (
            (g.push(...C.embeddings),
            M.push(...C.warnings),
            S.push(C.response),
            (T += C.usage.tokens),
            C.providerMetadata)
          )
            if (!x) x = { ...C.providerMetadata };
            else
              for (const [U, F] of Object.entries(C.providerMetadata))
                x[U] = { ...((v = x[U]) != null ? v : {}), ...F };
      }
      return (
        m.setAttributes(
          await Y({
            telemetry: n,
            attributes: {
              "ai.embeddings": { output: () => g.map((j) => JSON.stringify(j)) },
              "ai.usage.tokens": T,
            },
          })
        ),
        Fe({ warnings: M, provider: l.provider, model: l.modelId }),
        new ho({
          values: t,
          embeddings: g,
          usage: { tokens: T },
          warnings: M,
          providerMetadata: x,
          responses: S,
        })
      );
    },
  });
}
var ho = class {
  constructor(e) {
    ((this.values = e.values),
      (this.embeddings = e.embeddings),
      (this.usage = e.usage),
      (this.warnings = e.warnings),
      (this.providerMetadata = e.providerMetadata),
      (this.responses = e.responses));
  }
};
async function ed({
  model: e,
  prompt: t,
  n: a = 1,
  maxImagesPerCall: r,
  size: s,
  aspectRatio: o,
  seed: i,
  providerOptions: n,
  maxRetries: l,
  abortSignal: u,
  headers: p,
}) {
  var c, d;
  const h = nu(e),
    m = je(p ?? {}, `ai/${Le}`),
    { retry: v } = et({ maxRetries: l, abortSignal: u }),
    y = (c = r ?? (await ad(h))) != null ? c : 1,
    b = Math.ceil(a / y),
    R = Array.from({ length: b }, (j, A) => {
      if (A < b - 1) return y;
      const C = a % y;
      return C === 0 ? y : C;
    }),
    g = await Promise.all(
      R.map(async (j) =>
        v(() => {
          const { prompt: A, files: C, mask: U } = rd(t);
          return h.doGenerate({
            prompt: A,
            files: C,
            mask: U,
            n: j,
            abortSignal: u,
            headers: m,
            size: s,
            aspectRatio: o,
            seed: i,
            providerOptions: n ?? {},
          });
        })
      )
    ),
    M = [],
    S = [],
    T = [],
    x = {};
  let P = { inputTokens: void 0, outputTokens: void 0, totalTokens: void 0 };
  for (const j of g) {
    if (
      (M.push(
        ...j.images.map((A) => {
          var C;
          return new St({
            data: A,
            mediaType: (C = it({ data: A, signatures: Jt })) != null ? C : "image/png",
          });
        })
      ),
      S.push(...j.warnings),
      j.usage != null && (P = Au(P, j.usage)),
      j.providerMetadata)
    )
      for (const [A, C] of Object.entries(j.providerMetadata))
        if (A === "gateway") {
          const U = x[A];
          U != null && typeof U == "object" ? (x[A] = { ...U, ...C }) : (x[A] = C);
          const F = x[A].images;
          Array.isArray(F) && F.length === 0 && delete x[A].images;
        } else
          ((d = x[A]) != null || (x[A] = { images: [] }),
            x[A].images.push(...j.providerMetadata[A].images));
    T.push(j.response);
  }
  if ((Fe({ warnings: S, provider: h.provider, model: h.modelId }), !M.length))
    throw new Dl({ responses: T });
  return new td({ images: M, warnings: S, responses: T, providerMetadata: x, usage: P });
}
var td = class {
  constructor(e) {
    ((this.images = e.images),
      (this.warnings = e.warnings),
      (this.responses = e.responses),
      (this.providerMetadata = e.providerMetadata),
      (this.usage = e.usage));
  }
  get image() {
    return this.images[0];
  }
};
async function ad(e) {
  return e.maxImagesPerCall instanceof Function
    ? e.maxImagesPerCall({ modelId: e.modelId })
    : e.maxImagesPerCall;
}
function rd(e) {
  return typeof e == "string"
    ? { prompt: e, files: void 0, mask: void 0 }
    : { prompt: e.text, files: e.images.map(go), mask: e.mask ? go(e.mask) : void 0 };
}
function go(e) {
  if (typeof e == "string" && e.startsWith("http")) return { type: "url", url: e };
  if (typeof e == "string" && e.startsWith("data:")) {
    const { mediaType: a, base64Content: r } = yr(e);
    if (r != null) {
      const s = Rt(r);
      return {
        type: "file",
        data: s,
        mediaType: a || it({ data: s, signatures: Jt }) || "image/png",
      };
    }
  }
  const t = an(e);
  return { type: "file", data: t, mediaType: it({ data: t, signatures: Jt }) || "image/png" };
}
var Xd = ed;
function od(e) {
  const t = e.filter((a) => a.type === "reasoning");
  return t.length === 0
    ? void 0
    : t.map((a) => a.text).join(`
`);
}
var sd = {
    type: "no-schema",
    jsonSchema: async () => {},
    async validatePartialResult({ value: e, textDelta: t }) {
      return { success: !0, value: { partial: e, textDelta: t } };
    },
    async validateFinalResult(e, t) {
      return e === void 0
        ? {
            success: !1,
            error: new $e({
              message: "No object generated: response did not match schema.",
              text: t.text,
              response: t.response,
              usage: t.usage,
              finishReason: t.finishReason,
            }),
          }
        : { success: !0, value: e };
    },
    createElementStream() {
      throw new Ca({ functionality: "element streams in no-schema mode" });
    },
  },
  nd = (e) => ({
    type: "object",
    jsonSchema: async () => await e.jsonSchema,
    async validatePartialResult({ value: t, textDelta: a }) {
      return { success: !0, value: { partial: t, textDelta: a } };
    },
    async validateFinalResult(t) {
      return Ze({ value: t, schema: e });
    },
    createElementStream() {
      throw new Ca({ functionality: "element streams in object mode" });
    },
  }),
  id = (e) => ({
    type: "array",
    jsonSchema: async () => {
      const { $schema: t, ...a } = await e.jsonSchema;
      return {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "object",
        properties: { elements: { type: "array", items: a } },
        required: ["elements"],
        additionalProperties: !1,
      };
    },
    async validatePartialResult({ value: t, latestObject: a, isFirstDelta: r, isFinalDelta: s }) {
      var o;
      if (!Ia(t) || !Sr(t.elements))
        return {
          success: !1,
          error: new Qe({
            value: t,
            cause: "value must be an object that contains an array of elements",
          }),
        };
      const i = t.elements,
        n = [];
      for (let p = 0; p < i.length; p++) {
        const c = i[p],
          d = await Ze({ value: c, schema: e });
        if (!(p === i.length - 1 && !s)) {
          if (!d.success) return d;
          n.push(d.value);
        }
      }
      const l = (o = a?.length) != null ? o : 0;
      let u = "";
      return (
        r && (u += "["),
        l > 0 && (u += ","),
        (u += n
          .slice(l)
          .map((p) => JSON.stringify(p))
          .join(",")),
        s && (u += "]"),
        { success: !0, value: { partial: n, textDelta: u } }
      );
    },
    async validateFinalResult(t) {
      if (!Ia(t) || !Sr(t.elements))
        return {
          success: !1,
          error: new Qe({
            value: t,
            cause: "value must be an object that contains an array of elements",
          }),
        };
      const a = t.elements;
      for (const r of a) {
        const s = await Ze({ value: r, schema: e });
        if (!s.success) return s;
      }
      return { success: !0, value: a };
    },
    createElementStream(t) {
      let a = 0;
      return ot(
        t.pipeThrough(
          new TransformStream({
            transform(r, s) {
              switch (r.type) {
                case "object": {
                  const o = r.object;
                  for (; a < o.length; a++) s.enqueue(o[a]);
                  break;
                }
                case "text-delta":
                case "finish":
                case "error":
                  break;
                default: {
                  const o = r;
                  throw new Error(`Unsupported chunk type: ${o}`);
                }
              }
            },
          })
        )
      );
    },
  }),
  ld = (e) => ({
    type: "enum",
    jsonSchema: async () => ({
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: { result: { type: "string", enum: e } },
      required: ["result"],
      additionalProperties: !1,
    }),
    async validateFinalResult(t) {
      if (!Ia(t) || typeof t.result != "string")
        return {
          success: !1,
          error: new Qe({
            value: t,
            cause: 'value must be an object that contains a string in the "result" property.',
          }),
        };
      const a = t.result;
      return e.includes(a)
        ? { success: !0, value: a }
        : { success: !1, error: new Qe({ value: t, cause: "value must be a string in the enum" }) };
    },
    async validatePartialResult({ value: t, textDelta: a }) {
      if (!Ia(t) || typeof t.result != "string")
        return {
          success: !1,
          error: new Qe({
            value: t,
            cause: 'value must be an object that contains a string in the "result" property.',
          }),
        };
      const r = t.result,
        s = e.filter((o) => o.startsWith(r));
      return t.result.length === 0 || s.length === 0
        ? { success: !1, error: new Qe({ value: t, cause: "value must be a string in the enum" }) }
        : { success: !0, value: { partial: s.length > 1 ? r : s[0], textDelta: a } };
    },
    createElementStream() {
      throw new Ca({ functionality: "element streams in enum mode" });
    },
  });
function kn({ output: e, schema: t, enumValues: a }) {
  switch (e) {
    case "object":
      return nd(Ct(t));
    case "array":
      return id(Ct(t));
    case "enum":
      return ld(a);
    case "no-schema":
      return sd;
    default: {
      const r = e;
      throw new Error(`Unsupported output: ${r}`);
    }
  }
}
async function yo(e, t, a) {
  const r = await nt({ text: e });
  if (!r.success)
    throw new $e({
      message: "No object generated: could not parse the response.",
      cause: r.error,
      text: e,
      response: a.response,
      usage: a.usage,
      finishReason: a.finishReason,
    });
  const s = await t.validateFinalResult(r.value, { text: e, response: a.response, usage: a.usage });
  if (!s.success)
    throw new $e({
      message: "No object generated: response did not match schema.",
      cause: s.error,
      text: e,
      response: a.response,
      usage: a.usage,
      finishReason: a.finishReason,
    });
  return s.value;
}
async function Pn(e, t, a, r) {
  try {
    return await yo(e, t, r);
  } catch (s) {
    if (a != null && $e.isInstance(s) && (Hn.isInstance(s.cause) || Qe.isInstance(s.cause))) {
      const o = await a({ text: e, error: s.cause });
      if (o === null) throw s;
      return await yo(o, t, r);
    }
    throw s;
  }
}
function qn({ output: e, schema: t, schemaName: a, schemaDescription: r, enumValues: s }) {
  if (e != null && e !== "object" && e !== "array" && e !== "enum" && e !== "no-schema")
    throw new ae({ parameter: "output", value: e, message: "Invalid output type." });
  if (e === "no-schema") {
    if (t != null)
      throw new ae({
        parameter: "schema",
        value: t,
        message: "Schema is not supported for no-schema output.",
      });
    if (r != null)
      throw new ae({
        parameter: "schemaDescription",
        value: r,
        message: "Schema description is not supported for no-schema output.",
      });
    if (a != null)
      throw new ae({
        parameter: "schemaName",
        value: a,
        message: "Schema name is not supported for no-schema output.",
      });
    if (s != null)
      throw new ae({
        parameter: "enumValues",
        value: s,
        message: "Enum values are not supported for no-schema output.",
      });
  }
  if (e === "object") {
    if (t == null)
      throw new ae({
        parameter: "schema",
        value: t,
        message: "Schema is required for object output.",
      });
    if (s != null)
      throw new ae({
        parameter: "enumValues",
        value: s,
        message: "Enum values are not supported for object output.",
      });
  }
  if (e === "array") {
    if (t == null)
      throw new ae({
        parameter: "schema",
        value: t,
        message: "Element schema is required for array output.",
      });
    if (s != null)
      throw new ae({
        parameter: "enumValues",
        value: s,
        message: "Enum values are not supported for array output.",
      });
  }
  if (e === "enum") {
    if (t != null)
      throw new ae({
        parameter: "schema",
        value: t,
        message: "Schema is not supported for enum output.",
      });
    if (r != null)
      throw new ae({
        parameter: "schemaDescription",
        value: r,
        message: "Schema description is not supported for enum output.",
      });
    if (a != null)
      throw new ae({
        parameter: "schemaName",
        value: a,
        message: "Schema name is not supported for enum output.",
      });
    if (s == null)
      throw new ae({
        parameter: "enumValues",
        value: s,
        message: "Enum values are required for enum output.",
      });
    for (const o of s)
      if (typeof o != "string")
        throw new ae({
          parameter: "enumValues",
          value: o,
          message: "Enum values must be strings.",
        });
  }
}
var ud = Ra({ prefix: "aiobj", size: 24 });
async function Qd(e) {
  const {
      model: t,
      output: a = "object",
      system: r,
      prompt: s,
      messages: o,
      maxRetries: i,
      abortSignal: n,
      headers: l,
      experimental_repairText: u,
      experimental_telemetry: p,
      experimental_download: c,
      providerOptions: d,
      _internal: { generateId: h = ud, currentDate: m = () => new Date() } = {},
      ...v
    } = e,
    y = Gt(t),
    b = "enum" in e ? e.enum : void 0,
    { schema: R, schemaDescription: g, schemaName: M } = "schema" in e ? e : {};
  qn({ output: a, schema: R, schemaName: M, schemaDescription: g, enumValues: b });
  const { maxRetries: S, retry: T } = et({ maxRetries: i, abortSignal: n }),
    x = kn({ output: a, schema: R, enumValues: b }),
    P = Nt(v),
    j = je(l ?? {}, `ai/${Le}`),
    A = Ot({ model: y, telemetry: p, headers: j, settings: { ...P, maxRetries: S } }),
    C = kt(p),
    U = await x.jsonSchema();
  try {
    return await Re({
      name: "ai.generateObject",
      attributes: Y({
        telemetry: p,
        attributes: {
          ...Ee({ operationId: "ai.generateObject", telemetry: p }),
          ...A,
          "ai.prompt": { input: () => JSON.stringify({ system: r, prompt: s, messages: o }) },
          "ai.schema": U != null ? { input: () => JSON.stringify(U) } : void 0,
          "ai.schema.name": M,
          "ai.schema.description": g,
          "ai.settings.output": x.type,
        },
      }),
      tracer: C,
      fn: async (F) => {
        var $;
        let ue, K, se, Z, he, ge, Ke, Ce;
        const _e = await Na({ system: r, prompt: s, messages: o }),
          we = await Aa({ prompt: _e, supportedUrls: await y.supportedUrls, download: c }),
          X = await T(() =>
            Re({
              name: "ai.generateObject.doGenerate",
              attributes: Y({
                telemetry: p,
                attributes: {
                  ...Ee({ operationId: "ai.generateObject.doGenerate", telemetry: p }),
                  ...A,
                  "ai.prompt.messages": { input: () => ka(we) },
                  "gen_ai.system": y.provider,
                  "gen_ai.request.model": y.modelId,
                  "gen_ai.request.frequency_penalty": P.frequencyPenalty,
                  "gen_ai.request.max_tokens": P.maxOutputTokens,
                  "gen_ai.request.presence_penalty": P.presencePenalty,
                  "gen_ai.request.temperature": P.temperature,
                  "gen_ai.request.top_k": P.topK,
                  "gen_ai.request.top_p": P.topP,
                },
              }),
              tracer: C,
              fn: async (ze) => {
                var Me, ye, de, Ne, Ve, Ge, tt, lt;
                const O = await y.doGenerate({
                    responseFormat: { type: "json", schema: U, name: M, description: g },
                    ...Nt(v),
                    prompt: we,
                    providerOptions: d,
                    abortSignal: n,
                    headers: j,
                  }),
                  D = {
                    id: (ye = (Me = O.response) == null ? void 0 : Me.id) != null ? ye : h(),
                    timestamp:
                      (Ne = (de = O.response) == null ? void 0 : de.timestamp) != null ? Ne : m(),
                    modelId:
                      (Ge = (Ve = O.response) == null ? void 0 : Ve.modelId) != null
                        ? Ge
                        : y.modelId,
                    headers: (tt = O.response) == null ? void 0 : tt.headers,
                    body: (lt = O.response) == null ? void 0 : lt.body,
                  },
                  Je = ar(O.content),
                  ne = od(O.content);
                if (Je === void 0)
                  throw new $e({
                    message: "No object generated: the model did not return a response.",
                    response: D,
                    usage: la(O.usage),
                    finishReason: O.finishReason.unified,
                  });
                return (
                  ze.setAttributes(
                    await Y({
                      telemetry: p,
                      attributes: {
                        "ai.response.finishReason": O.finishReason.unified,
                        "ai.response.object": { output: () => Je },
                        "ai.response.id": D.id,
                        "ai.response.model": D.modelId,
                        "ai.response.timestamp": D.timestamp.toISOString(),
                        "ai.response.providerMetadata": JSON.stringify(O.providerMetadata),
                        "ai.usage.promptTokens": O.usage.inputTokens.total,
                        "ai.usage.completionTokens": O.usage.outputTokens.total,
                        "gen_ai.response.finish_reasons": [O.finishReason.unified],
                        "gen_ai.response.id": D.id,
                        "gen_ai.response.model": D.modelId,
                        "gen_ai.usage.input_tokens": O.usage.inputTokens.total,
                        "gen_ai.usage.output_tokens": O.usage.outputTokens.total,
                      },
                    })
                  ),
                  { ...O, objectText: Je, reasoning: ne, responseData: D }
                );
              },
            })
          );
        ((ue = X.objectText),
          (K = X.finishReason.unified),
          (se = la(X.usage)),
          (Z = X.warnings),
          (Ke = X.providerMetadata),
          (ge = ($ = X.request) != null ? $ : {}),
          (he = X.responseData),
          (Ce = X.reasoning),
          Fe({ warnings: Z, provider: y.provider, model: y.modelId }));
        const Ae = await Pn(ue, x, u, { response: he, usage: se, finishReason: K });
        return (
          F.setAttributes(
            await Y({
              telemetry: p,
              attributes: {
                "ai.response.finishReason": K,
                "ai.response.object": { output: () => JSON.stringify(Ae) },
                "ai.response.providerMetadata": JSON.stringify(Ke),
                "ai.usage.promptTokens": se.inputTokens,
                "ai.usage.completionTokens": se.outputTokens,
              },
            })
          ),
          new dd({
            object: Ae,
            reasoning: Ce,
            finishReason: K,
            usage: se,
            warnings: Z,
            request: ge,
            response: he,
            providerMetadata: Ke,
          })
        );
      },
    });
  } catch (F) {
    throw Oa(F);
  }
}
var dd = class {
  constructor(e) {
    ((this.object = e.object),
      (this.finishReason = e.finishReason),
      (this.usage = e.usage),
      (this.warnings = e.warnings),
      (this.providerMetadata = e.providerMetadata),
      (this.response = e.response),
      (this.request = e.request),
      (this.reasoning = e.reasoning));
  }
  toJsonResponse(e) {
    var t;
    return new Response(JSON.stringify(this.object), {
      status: (t = e?.status) != null ? t : 200,
      headers: pa(e?.headers, { "content-type": "application/json; charset=utf-8" }),
    });
  }
};
function Zd(e, t) {
  if (e.length !== t.length)
    throw new ae({
      parameter: "vector1,vector2",
      value: { vector1Length: e.length, vector2Length: t.length },
      message: "Vectors must have the same length",
    });
  const a = e.length;
  if (a === 0) return 0;
  let r = 0,
    s = 0,
    o = 0;
  for (let i = 0; i < a; i++) {
    const n = e[i],
      l = t[i];
    ((r += n * n), (s += l * l), (o += n * l));
  }
  return r === 0 || s === 0 ? 0 : o / (Math.sqrt(r) * Math.sqrt(s));
}
function ep(e) {
  const [t, a] = e.split(",");
  if (t.split(";")[0].split(":")[1] == null || a == null)
    throw new Error("Invalid data URL format");
  try {
    return window.atob(a);
  } catch {
    throw new Error("Error decoding data URL");
  }
}
function Sa(e, t) {
  if (e === t) return !0;
  if (e == null || t == null) return !1;
  if (typeof e != "object" && typeof t != "object") return e === t;
  if (e.constructor !== t.constructor) return !1;
  if (e instanceof Date && t instanceof Date) return e.getTime() === t.getTime();
  if (Array.isArray(e)) {
    if (e.length !== t.length) return !1;
    for (let s = 0; s < e.length; s++) if (!Sa(e[s], t[s])) return !1;
    return !0;
  }
  const a = Object.keys(e),
    r = Object.keys(t);
  if (a.length !== r.length) return !1;
  for (const s of a) if (!r.includes(s) || !Sa(e[s], t[s])) return !1;
  return !0;
}
var pd = class {
  constructor() {
    ((this.queue = []), (this.isProcessing = !1));
  }
  async processQueue() {
    if (!this.isProcessing) {
      for (this.isProcessing = !0; this.queue.length > 0; )
        (await this.queue[0](), this.queue.shift());
      this.isProcessing = !1;
    }
  }
  async run(e) {
    return new Promise((t, a) => {
      (this.queue.push(async () => {
        try {
          (await e(), t());
        } catch (r) {
          a(r);
        }
      }),
        this.processQueue());
    });
  }
};
function tp({ chunks: e, initialDelayInMs: t = 0, chunkDelayInMs: a = 0, _internal: r }) {
  var s;
  const o = (s = r?.delay) != null ? s : nr;
  let i = 0;
  return new ReadableStream({
    async pull(n) {
      i < e.length ? (await o(i === 0 ? t : a), n.enqueue(e[i++])) : n.close();
    },
  });
}
var cd = Ra({ prefix: "aiobj", size: 24 });
function ap(e) {
  const {
      model: t,
      output: a = "object",
      system: r,
      prompt: s,
      messages: o,
      maxRetries: i,
      abortSignal: n,
      headers: l,
      experimental_repairText: u,
      experimental_telemetry: p,
      experimental_download: c,
      providerOptions: d,
      onError: h = ({ error: P }) => {
        console.error(P);
      },
      onFinish: m,
      _internal: { generateId: v = cd, currentDate: y = () => new Date(), now: b = Cn } = {},
      ...R
    } = e,
    g = "enum" in e && e.enum ? e.enum : void 0,
    { schema: M, schemaDescription: S, schemaName: T } = "schema" in e ? e : {};
  qn({ output: a, schema: M, schemaName: T, schemaDescription: S, enumValues: g });
  const x = kn({ output: a, schema: M, enumValues: g });
  return new fd({
    model: t,
    telemetry: p,
    headers: l,
    settings: R,
    maxRetries: i,
    abortSignal: n,
    outputStrategy: x,
    system: r,
    prompt: s,
    messages: o,
    schemaName: T,
    schemaDescription: S,
    providerOptions: d,
    repairText: u,
    onError: h,
    onFinish: m,
    download: c,
    generateId: v,
    currentDate: y,
    now: b,
  });
}
var fd = class {
    constructor({
      model: e,
      headers: t,
      telemetry: a,
      settings: r,
      maxRetries: s,
      abortSignal: o,
      outputStrategy: i,
      system: n,
      prompt: l,
      messages: u,
      schemaName: p,
      schemaDescription: c,
      providerOptions: d,
      repairText: h,
      onError: m,
      onFinish: v,
      download: y,
      generateId: b,
      currentDate: R,
      now: g,
    }) {
      ((this._object = new Be()),
        (this._usage = new Be()),
        (this._providerMetadata = new Be()),
        (this._warnings = new Be()),
        (this._request = new Be()),
        (this._response = new Be()),
        (this._finishReason = new Be()));
      const M = Gt(e),
        { maxRetries: S, retry: T } = et({ maxRetries: s, abortSignal: o }),
        x = Nt(r),
        P = Ot({ model: M, telemetry: a, headers: t, settings: { ...x, maxRetries: S } }),
        j = kt(a),
        A = this,
        C = Rn(),
        U = new TransformStream({
          transform(F, $) {
            ($.enqueue(F), F.type === "error" && m({ error: Oa(F.error) }));
          },
        });
      ((this.baseStream = C.stream.pipeThrough(U)),
        Re({
          name: "ai.streamObject",
          attributes: Y({
            telemetry: a,
            attributes: {
              ...Ee({ operationId: "ai.streamObject", telemetry: a }),
              ...P,
              "ai.prompt": { input: () => JSON.stringify({ system: n, prompt: l, messages: u }) },
              "ai.schema": { input: async () => JSON.stringify(await i.jsonSchema()) },
              "ai.schema.name": p,
              "ai.schema.description": c,
              "ai.settings.output": i.type,
            },
          }),
          tracer: j,
          endWhenDone: !1,
          fn: async (F) => {
            const $ = await Na({ system: n, prompt: l, messages: u }),
              ue = {
                responseFormat: {
                  type: "json",
                  schema: await i.jsonSchema(),
                  name: p,
                  description: c,
                },
                ...Nt(r),
                prompt: await Aa({ prompt: $, supportedUrls: await M.supportedUrls, download: y }),
                providerOptions: d,
                abortSignal: o,
                headers: t,
                includeRawChunks: !1,
              },
              K = {
                transform: (O, D) => {
                  switch (O.type) {
                    case "text-delta":
                      D.enqueue(O.delta);
                      break;
                    case "response-metadata":
                    case "finish":
                    case "error":
                    case "stream-start":
                      D.enqueue(O);
                      break;
                  }
                },
              },
              {
                result: { stream: se, response: Z, request: he },
                doStreamSpan: ge,
                startTimestampMs: Ke,
              } = await T(() =>
                Re({
                  name: "ai.streamObject.doStream",
                  attributes: Y({
                    telemetry: a,
                    attributes: {
                      ...Ee({ operationId: "ai.streamObject.doStream", telemetry: a }),
                      ...P,
                      "ai.prompt.messages": { input: () => ka(ue.prompt) },
                      "gen_ai.system": M.provider,
                      "gen_ai.request.model": M.modelId,
                      "gen_ai.request.frequency_penalty": x.frequencyPenalty,
                      "gen_ai.request.max_tokens": x.maxOutputTokens,
                      "gen_ai.request.presence_penalty": x.presencePenalty,
                      "gen_ai.request.temperature": x.temperature,
                      "gen_ai.request.top_k": x.topK,
                      "gen_ai.request.top_p": x.topP,
                    },
                  }),
                  tracer: j,
                  endWhenDone: !1,
                  fn: async (O) => ({
                    startTimestampMs: g(),
                    doStreamSpan: O,
                    result: await M.doStream(ue),
                  }),
                })
              );
            A._request.resolve(he ?? {});
            let Ce,
              _e = ya(),
              we,
              X,
              Ae,
              ze,
              Me = "",
              ye = "",
              de = { id: b(), timestamp: R(), modelId: M.modelId },
              Ne,
              Ve,
              Ge = !0,
              tt = !0;
            const lt = se.pipeThrough(new TransformStream(K)).pipeThrough(
              new TransformStream({
                async transform(O, D) {
                  var Je, ne, te;
                  if (typeof O == "object" && O.type === "stream-start") {
                    Ce = O.warnings;
                    return;
                  }
                  if (Ge) {
                    const W = g() - Ke;
                    ((Ge = !1),
                      ge.addEvent("ai.stream.firstChunk", { "ai.stream.msToFirstChunk": W }),
                      ge.setAttributes({ "ai.stream.msToFirstChunk": W }));
                  }
                  if (typeof O == "string") {
                    ((Me += O), (ye += O));
                    const { value: W, state: ie } = await Lt(Me);
                    if (W !== void 0 && !Sa(Ne, W)) {
                      const E = await i.validatePartialResult({
                        value: W,
                        textDelta: ye,
                        latestObject: Ve,
                        isFirstDelta: tt,
                        isFinalDelta: ie === "successful-parse",
                      });
                      E.success &&
                        !Sa(Ve, E.value.partial) &&
                        ((Ne = W),
                        (Ve = E.value.partial),
                        D.enqueue({ type: "object", object: Ve }),
                        D.enqueue({ type: "text-delta", textDelta: E.value.textDelta }),
                        (ye = ""),
                        (tt = !1));
                    }
                    return;
                  }
                  switch (O.type) {
                    case "response-metadata": {
                      de = {
                        id: (Je = O.id) != null ? Je : de.id,
                        timestamp: (ne = O.timestamp) != null ? ne : de.timestamp,
                        modelId: (te = O.modelId) != null ? te : de.modelId,
                      };
                      break;
                    }
                    case "finish": {
                      (ye !== "" && D.enqueue({ type: "text-delta", textDelta: ye }),
                        (we = O.finishReason.unified),
                        (_e = la(O.usage)),
                        (X = O.providerMetadata),
                        D.enqueue({
                          ...O,
                          finishReason: O.finishReason.unified,
                          usage: _e,
                          response: de,
                        }),
                        Fe({ warnings: Ce ?? [], provider: M.provider, model: M.modelId }),
                        A._usage.resolve(_e),
                        A._providerMetadata.resolve(X),
                        A._warnings.resolve(Ce),
                        A._response.resolve({ ...de, headers: Z?.headers }),
                        A._finishReason.resolve(we ?? "other"));
                      try {
                        ((Ae = await Pn(Me, i, h, { response: de, usage: _e, finishReason: we })),
                          A._object.resolve(Ae));
                      } catch (W) {
                        ((ze = W), A._object.reject(W));
                      }
                      break;
                    }
                    default: {
                      D.enqueue(O);
                      break;
                    }
                  }
                },
                async flush(O) {
                  try {
                    const D = _e ?? { promptTokens: NaN, completionTokens: NaN, totalTokens: NaN };
                    (ge.setAttributes(
                      await Y({
                        telemetry: a,
                        attributes: {
                          "ai.response.finishReason": we,
                          "ai.response.object": { output: () => JSON.stringify(Ae) },
                          "ai.response.id": de.id,
                          "ai.response.model": de.modelId,
                          "ai.response.timestamp": de.timestamp.toISOString(),
                          "ai.response.providerMetadata": JSON.stringify(X),
                          "ai.usage.inputTokens": D.inputTokens,
                          "ai.usage.outputTokens": D.outputTokens,
                          "ai.usage.totalTokens": D.totalTokens,
                          "ai.usage.reasoningTokens": D.reasoningTokens,
                          "ai.usage.cachedInputTokens": D.cachedInputTokens,
                          "gen_ai.response.finish_reasons": [we],
                          "gen_ai.response.id": de.id,
                          "gen_ai.response.model": de.modelId,
                          "gen_ai.usage.input_tokens": D.inputTokens,
                          "gen_ai.usage.output_tokens": D.outputTokens,
                        },
                      })
                    ),
                      ge.end(),
                      F.setAttributes(
                        await Y({
                          telemetry: a,
                          attributes: {
                            "ai.usage.inputTokens": D.inputTokens,
                            "ai.usage.outputTokens": D.outputTokens,
                            "ai.usage.totalTokens": D.totalTokens,
                            "ai.usage.reasoningTokens": D.reasoningTokens,
                            "ai.usage.cachedInputTokens": D.cachedInputTokens,
                            "ai.response.object": { output: () => JSON.stringify(Ae) },
                            "ai.response.providerMetadata": JSON.stringify(X),
                          },
                        })
                      ),
                      await v?.({
                        usage: D,
                        object: Ae,
                        error: ze,
                        response: { ...de, headers: Z?.headers },
                        warnings: Ce,
                        providerMetadata: X,
                      }));
                  } catch (D) {
                    O.enqueue({ type: "error", error: D });
                  } finally {
                    F.end();
                  }
                },
              })
            );
            C.addStream(lt);
          },
        })
          .catch((F) => {
            C.addStream(
              new ReadableStream({
                start($) {
                  ($.enqueue({ type: "error", error: F }), $.close());
                },
              })
            );
          })
          .finally(() => {
            C.close();
          }),
        (this.outputStrategy = i));
    }
    get object() {
      return this._object.promise;
    }
    get usage() {
      return this._usage.promise;
    }
    get providerMetadata() {
      return this._providerMetadata.promise;
    }
    get warnings() {
      return this._warnings.promise;
    }
    get request() {
      return this._request.promise;
    }
    get response() {
      return this._response.promise;
    }
    get finishReason() {
      return this._finishReason.promise;
    }
    get partialObjectStream() {
      return ot(
        this.baseStream.pipeThrough(
          new TransformStream({
            transform(e, t) {
              switch (e.type) {
                case "object":
                  t.enqueue(e.object);
                  break;
                case "text-delta":
                case "finish":
                case "error":
                  break;
                default: {
                  const a = e;
                  throw new Error(`Unsupported chunk type: ${a}`);
                }
              }
            },
          })
        )
      );
    }
    get elementStream() {
      return this.outputStrategy.createElementStream(this.baseStream);
    }
    get textStream() {
      return ot(
        this.baseStream.pipeThrough(
          new TransformStream({
            transform(e, t) {
              switch (e.type) {
                case "text-delta":
                  t.enqueue(e.textDelta);
                  break;
                case "object":
                case "finish":
                case "error":
                  break;
                default: {
                  const a = e;
                  throw new Error(`Unsupported chunk type: ${a}`);
                }
              }
            },
          })
        )
      );
    }
    get fullStream() {
      return ot(this.baseStream);
    }
    pipeTextStreamToResponse(e, t) {
      bn({ response: e, textStream: this.textStream, ...t });
    }
    toTextStreamResponse(e) {
      return yn({ textStream: this.textStream, ...e });
    }
  },
  md = class extends St {
    constructor({ data: e, mediaType: t }) {
      super({ data: e, mediaType: t });
      let a = "mp3";
      if (t) {
        const r = t.split("/");
        r.length === 2 && t !== "audio/mpeg" && (a = r[1]);
      }
      if (!a) throw new Error("Audio format must be provided or determinable from media type");
      this.format = a;
    }
  };
async function rp({
  model: e,
  text: t,
  voice: a,
  outputFormat: r,
  instructions: s,
  speed: o,
  language: i,
  providerOptions: n = {},
  maxRetries: l,
  abortSignal: u,
  headers: p,
}) {
  var c;
  const d = su(e);
  if (!d) throw new Error("Model could not be resolved");
  const h = je(p ?? {}, `ai/${Le}`),
    { retry: m } = et({ maxRetries: l, abortSignal: u }),
    v = await m(() =>
      d.doGenerate({
        text: t,
        voice: a,
        outputFormat: r,
        instructions: s,
        speed: o,
        language: i,
        abortSignal: u,
        headers: h,
        providerOptions: n,
      })
    );
  if (!v.audio || v.audio.length === 0) throw new Fl({ responses: [v.response] });
  return (
    Fe({ warnings: v.warnings, provider: d.provider, model: d.modelId }),
    new vd({
      audio: new md({
        data: v.audio,
        mediaType: (c = it({ data: v.audio, signatures: Zs })) != null ? c : "audio/mp3",
      }),
      warnings: v.warnings,
      responses: [v.response],
      providerMetadata: v.providerMetadata,
    })
  );
}
var vd = class {
  constructor(e) {
    var t;
    ((this.audio = e.audio),
      (this.warnings = e.warnings),
      (this.responses = e.responses),
      (this.providerMetadata = (t = e.providerMetadata) != null ? t : {}));
  }
};
function op({
  messages: e,
  reasoning: t = "none",
  toolCalls: a = [],
  emptyMessages: r = "remove",
}) {
  ((t === "all" || t === "before-last-message") &&
    (e = e.map((s, o) =>
      s.role !== "assistant" ||
      typeof s.content == "string" ||
      (t === "before-last-message" && o === e.length - 1)
        ? s
        : { ...s, content: s.content.filter((i) => i.type !== "reasoning") }
    )),
    a === "none"
      ? (a = [])
      : a === "all"
        ? (a = [{ type: "all" }])
        : a === "before-last-message"
          ? (a = [{ type: "before-last-message" }])
          : typeof a == "string" && (a = [{ type: a }]));
  for (const s of a) {
    const o =
        s.type === "all"
          ? void 0
          : s.type === "before-last-message"
            ? 1
            : Number(s.type.slice(12).slice(0, -9)),
      i = new Set(),
      n = new Set();
    if (o != null) {
      for (const l of e.slice(-o))
        if ((l.role === "assistant" || l.role === "tool") && typeof l.content != "string")
          for (const u of l.content)
            u.type === "tool-call" || u.type === "tool-result"
              ? i.add(u.toolCallId)
              : (u.type === "tool-approval-request" || u.type === "tool-approval-response") &&
                n.add(u.approvalId);
    }
    e = e.map((l, u) => {
      if (
        (l.role !== "assistant" && l.role !== "tool") ||
        typeof l.content == "string" ||
        (o && u >= e.length - o)
      )
        return l;
      const p = {},
        c = {};
      return {
        ...l,
        content: l.content.filter((d) =>
          (d.type !== "tool-call" &&
            d.type !== "tool-result" &&
            d.type !== "tool-approval-request" &&
            d.type !== "tool-approval-response") ||
          (d.type === "tool-call"
            ? (p[d.toolCallId] = d.toolName)
            : d.type === "tool-approval-request" && (c[d.approvalId] = p[d.toolCallId]),
          ((d.type === "tool-call" || d.type === "tool-result") && i.has(d.toolCallId)) ||
            ((d.type === "tool-approval-request" || d.type === "tool-approval-response") &&
              n.has(d.approvalId)))
            ? !0
            : s.tools != null &&
              !s.tools.includes(
                d.type === "tool-call" || d.type === "tool-result" ? d.toolName : c[d.approvalId]
              )
        ),
      };
    });
  }
  return (r === "remove" && (e = e.filter((s) => s.content.length > 0)), e);
}
var hd = { word: /\S+\s+/m, line: /\n+/m };
function sp({ delayInMs: e = 10, chunking: t = "word", _internal: { delay: a = nr } = {} } = {}) {
  let r;
  if (t != null && typeof t == "object" && "segment" in t && typeof t.segment == "function") {
    const s = t;
    r = (o) => {
      if (o.length === 0) return null;
      const n = s.segment(o)[Symbol.iterator]().next().value;
      return n?.segment || null;
    };
  } else if (typeof t == "function")
    r = (s) => {
      const o = t(s);
      if (o == null) return null;
      if (!o.length) throw new Error("Chunking function must return a non-empty string.");
      if (!s.startsWith(o))
        throw new Error(
          `Chunking function must return a match that is a prefix of the buffer. Received: "${o}" expected to start with "${s}"`
        );
      return o;
    };
  else {
    const s = typeof t == "string" ? hd[t] : t instanceof RegExp ? t : void 0;
    if (s == null)
      throw new Ln({
        argument: "chunking",
        message: `Chunking must be "word", "line", a RegExp, an Intl.Segmenter, or a ChunkDetector function. Received: ${t}`,
      });
    r = (o) => {
      const i = s.exec(o);
      return i ? o.slice(0, i.index) + i?.[0] : null;
    };
  }
  return () => {
    let s = "",
      o = "",
      i,
      n;
    function l(u) {
      s.length > 0 &&
        i !== void 0 &&
        (u.enqueue({ type: i, text: s, id: o, ...(n != null ? { providerMetadata: n } : {}) }),
        (s = ""),
        (n = void 0));
    }
    return new TransformStream({
      async transform(u, p) {
        if (u.type !== "text-delta" && u.type !== "reasoning-delta") {
          (l(p), p.enqueue(u));
          return;
        }
        ((u.type !== i || u.id !== o) && s.length > 0 && l(p),
          (s += u.text),
          (o = u.id),
          (i = u.type),
          u.providerMetadata != null && (n = u.providerMetadata));
        let c;
        for (; (c = r(s)) != null; )
          (p.enqueue({ type: i, text: c, id: o }), (s = s.slice(c.length)), await a(e));
      },
    });
  };
}
async function np({
  model: e,
  prompt: t,
  n: a = 1,
  maxVideosPerCall: r,
  aspectRatio: s,
  resolution: o,
  duration: i,
  fps: n,
  seed: l,
  providerOptions: u,
  maxRetries: p,
  abortSignal: c,
  headers: d,
}) {
  var h;
  const m = iu(e),
    v = je(d ?? {}, `ai/${Le}`),
    { retry: y } = et({ maxRetries: p, abortSignal: c }),
    { prompt: b, image: R } = gd(t),
    g = (h = r ?? (await yd(m))) != null ? h : 1,
    M = Math.ceil(a / g),
    S = Array.from({ length: M }, (C, U) => {
      const F = a - U * g;
      return Math.min(F, g);
    }),
    T = await Promise.all(
      S.map(async (C) =>
        y(() =>
          m.doGenerate({
            prompt: b,
            n: C,
            aspectRatio: s,
            resolution: o,
            duration: i,
            fps: n,
            seed: l,
            image: R,
            providerOptions: u ?? {},
            headers: v,
            abortSignal: c,
          })
        )
      )
    ),
    x = [],
    P = [],
    j = [],
    A = {};
  for (const C of T) {
    for (const U of C.videos)
      switch (U.type) {
        case "url": {
          const { data: F, mediaType: $ } = await gr({ url: new URL(U.url) }),
            ue = (se) => !!se && se !== "application/octet-stream",
            K =
              (ue(U.mediaType) && U.mediaType) ||
              (ue($) && $) ||
              it({ data: F, signatures: no }) ||
              "video/mp4";
          x.push(new St({ data: F, mediaType: K }));
          break;
        }
        case "base64": {
          x.push(new St({ data: U.data, mediaType: U.mediaType || "video/mp4" }));
          break;
        }
        case "binary": {
          const F = U.mediaType || it({ data: U.data, signatures: no }) || "video/mp4";
          x.push(new St({ data: U.data, mediaType: F }));
          break;
        }
      }
    if (
      (P.push(...C.warnings),
      j.push({
        timestamp: C.response.timestamp,
        modelId: C.response.modelId,
        headers: C.response.headers,
        providerMetadata: C.providerMetadata,
      }),
      C.providerMetadata != null)
    )
      for (const [U, F] of Object.entries(C.providerMetadata)) {
        const $ = A[U];
        $ != null && typeof $ == "object"
          ? ((A[U] = { ...$, ...F }),
            "videos" in $ &&
              Array.isArray($.videos) &&
              "videos" in F &&
              Array.isArray(F.videos) &&
              (A[U].videos = [...$.videos, ...F.videos]))
          : (A[U] = F);
      }
  }
  if (x.length === 0) throw new Wl({ responses: j });
  return (
    P.length > 0 && Fe({ warnings: P, provider: m.provider, model: m.modelId }),
    { video: x[0], videos: x, warnings: P, responses: j, providerMetadata: A }
  );
}
function gd(e) {
  var t, a;
  if (typeof e == "string") return { prompt: e, image: void 0 };
  let r;
  if (e.image != null) {
    const s = e.image;
    if (typeof s == "string")
      if (s.startsWith("http://") || s.startsWith("https://")) r = { type: "url", url: s };
      else if (s.startsWith("data:")) {
        const { mediaType: o, base64Content: i } = yr(s);
        r = { type: "file", mediaType: o ?? "image/png", data: Rt(i ?? "") };
      } else {
        const o = Rt(s);
        r = {
          type: "file",
          mediaType: (t = it({ data: o, signatures: Jt })) != null ? t : "image/png",
          data: o,
        };
      }
    else
      s instanceof Uint8Array &&
        (r = {
          type: "file",
          mediaType: (a = it({ data: s, signatures: Jt })) != null ? a : "image/png",
          data: s,
        });
  }
  return { prompt: e.text, image: r };
}
async function yd(e) {
  return typeof e.maxVideosPerCall == "function"
    ? await e.maxVideosPerCall({ modelId: e.modelId })
    : e.maxVideosPerCall;
}
function ip({ settings: e }) {
  return { specificationVersion: "v3", transformParams: async ({ params: t }) => Bt(e, t) };
}
function lp({ settings: e }) {
  return { specificationVersion: "v3", transformParams: async ({ params: t }) => Bt(e, t) };
}
function wd(e) {
  return e
    .replace(/^```(?:json)?\s*\n?/, "")
    .replace(/\n?```\s*$/, "")
    .trim();
}
function up(e) {
  var t;
  const a = (t = e?.transform) != null ? t : wd,
    r = e?.transform !== void 0;
  return {
    specificationVersion: "v3",
    wrapGenerate: async ({ doGenerate: s }) => {
      const { content: o, ...i } = await s(),
        n = [];
      for (const l of o) {
        if (l.type !== "text") {
          n.push(l);
          continue;
        }
        n.push({ ...l, text: a(l.text) });
      }
      return { content: n, ...i };
    },
    wrapStream: async ({ doStream: s }) => {
      const { stream: o, ...i } = await s(),
        n = {},
        l = 12;
      return {
        stream: o.pipeThrough(
          new TransformStream({
            transform: (u, p) => {
              if (u.type === "text-start") {
                n[u.id] = {
                  startEvent: u,
                  phase: r ? "buffering" : "prefix",
                  buffer: "",
                  prefixStripped: !1,
                };
                return;
              }
              if (u.type === "text-delta") {
                const c = n[u.id];
                if (!c) {
                  p.enqueue(u);
                  return;
                }
                if (((c.buffer += u.delta), c.phase === "buffering")) return;
                if (c.phase === "prefix")
                  if (c.buffer.length > 0 && !c.buffer.startsWith("`"))
                    ((c.phase = "streaming"), p.enqueue(c.startEvent));
                  else if (c.buffer.startsWith("```")) {
                    if (
                      c.buffer.includes(`
`)
                    ) {
                      const d = c.buffer.match(/^```(?:json)?\s*\n/);
                      d
                        ? ((c.buffer = c.buffer.slice(d[0].length)),
                          (c.prefixStripped = !0),
                          (c.phase = "streaming"),
                          p.enqueue(c.startEvent))
                        : ((c.phase = "streaming"), p.enqueue(c.startEvent));
                    }
                  } else
                    c.buffer.length >= 3 &&
                      !c.buffer.startsWith("```") &&
                      ((c.phase = "streaming"), p.enqueue(c.startEvent));
                if (c.phase === "streaming" && c.buffer.length > l) {
                  const d = c.buffer.slice(0, -l);
                  ((c.buffer = c.buffer.slice(-l)),
                    p.enqueue({ type: "text-delta", id: u.id, delta: d }));
                }
                return;
              }
              if (u.type === "text-end") {
                const c = n[u.id];
                if (c) {
                  (c.phase === "prefix" || c.phase === "buffering") && p.enqueue(c.startEvent);
                  let d = c.buffer;
                  (c.phase === "buffering"
                    ? (d = a(d))
                    : c.prefixStripped
                      ? (d = d.replace(/\n?```\s*$/, "").trimEnd())
                      : (d = a(d)),
                    d.length > 0 && p.enqueue({ type: "text-delta", id: u.id, delta: d }),
                    p.enqueue(u),
                    delete n[u.id]);
                  return;
                }
              }
              p.enqueue(u);
            },
          })
        ),
        ...i,
      };
    },
  };
}
function bd(e, t) {
  if (t.length === 0) return null;
  const a = e.indexOf(t);
  if (a !== -1) return a;
  for (let r = e.length - 1; r >= 0; r--) {
    const s = e.substring(r);
    if (t.startsWith(s)) return r;
  }
  return null;
}
function dp({
  tagName: e,
  separator: t = `
`,
  startWithReasoning: a = !1,
}) {
  const r = `<${e}>`,
    s = `</${e}>`;
  return {
    specificationVersion: "v3",
    wrapGenerate: async ({ doGenerate: o }) => {
      const { content: i, ...n } = await o(),
        l = [];
      for (const u of i) {
        if (u.type !== "text") {
          l.push(u);
          continue;
        }
        const p = a ? r + u.text : u.text,
          c = new RegExp(`${r}(.*?)${s}`, "gs"),
          d = Array.from(p.matchAll(c));
        if (!d.length) {
          l.push(u);
          continue;
        }
        const h = d.map((v) => v[1]).join(t);
        let m = p;
        for (let v = d.length - 1; v >= 0; v--) {
          const y = d[v],
            b = m.slice(0, y.index),
            R = m.slice(y.index + y[0].length);
          m = b + (b.length > 0 && R.length > 0 ? t : "") + R;
        }
        (l.push({ type: "reasoning", text: h }), l.push({ type: "text", text: m }));
      }
      return { content: l, ...n };
    },
    wrapStream: async ({ doStream: o }) => {
      const { stream: i, ...n } = await o(),
        l = {};
      let u;
      return {
        stream: i.pipeThrough(
          new TransformStream({
            transform: (p, c) => {
              if (p.type === "text-start") {
                u = p;
                return;
              }
              if (
                (p.type === "text-end" && u && (c.enqueue(u), (u = void 0)),
                p.type !== "text-delta")
              ) {
                c.enqueue(p);
                return;
              }
              l[p.id] == null &&
                (l[p.id] = {
                  isFirstReasoning: !0,
                  isFirstText: !0,
                  afterSwitch: !1,
                  isReasoning: a,
                  buffer: "",
                  idCounter: 0,
                  textId: p.id,
                });
              const d = l[p.id];
              d.buffer += p.delta;
              function h(m) {
                if (m.length > 0) {
                  const v =
                    d.afterSwitch && (d.isReasoning ? !d.isFirstReasoning : !d.isFirstText)
                      ? t
                      : "";
                  (d.isReasoning &&
                    (d.afterSwitch || d.isFirstReasoning) &&
                    c.enqueue({ type: "reasoning-start", id: `reasoning-${d.idCounter}` }),
                    d.isReasoning
                      ? c.enqueue({
                          type: "reasoning-delta",
                          delta: v + m,
                          id: `reasoning-${d.idCounter}`,
                        })
                      : (u && (c.enqueue(u), (u = void 0)),
                        c.enqueue({ type: "text-delta", delta: v + m, id: d.textId })),
                    (d.afterSwitch = !1),
                    d.isReasoning ? (d.isFirstReasoning = !1) : (d.isFirstText = !1));
                }
              }
              do {
                const m = d.isReasoning ? s : r,
                  v = bd(d.buffer, m);
                if (v == null) {
                  (h(d.buffer), (d.buffer = ""));
                  break;
                }
                if ((h(d.buffer.slice(0, v)), v + m.length <= d.buffer.length))
                  ((d.buffer = d.buffer.slice(v + m.length)),
                    d.isReasoning &&
                      (d.isFirstReasoning &&
                        c.enqueue({ type: "reasoning-start", id: `reasoning-${d.idCounter}` }),
                      c.enqueue({ type: "reasoning-end", id: `reasoning-${d.idCounter++}` })),
                    (d.isReasoning = !d.isReasoning),
                    (d.afterSwitch = !0));
                else {
                  d.buffer = d.buffer.slice(v);
                  break;
                }
              } while (!0);
            },
          })
        ),
        ...n,
      };
    },
  };
}
function pp() {
  return {
    specificationVersion: "v3",
    wrapStream: async ({ doGenerate: e }) => {
      const t = await e();
      let a = 0;
      return {
        stream: new ReadableStream({
          start(s) {
            (s.enqueue({ type: "stream-start", warnings: t.warnings }),
              s.enqueue({ type: "response-metadata", ...t.response }));
            for (const o of t.content)
              switch (o.type) {
                case "text": {
                  o.text.length > 0 &&
                    (s.enqueue({ type: "text-start", id: String(a) }),
                    s.enqueue({ type: "text-delta", id: String(a), delta: o.text }),
                    s.enqueue({ type: "text-end", id: String(a) }),
                    a++);
                  break;
                }
                case "reasoning": {
                  (s.enqueue({
                    type: "reasoning-start",
                    id: String(a),
                    providerMetadata: o.providerMetadata,
                  }),
                    s.enqueue({ type: "reasoning-delta", id: String(a), delta: o.text }),
                    s.enqueue({ type: "reasoning-end", id: String(a) }),
                    a++);
                  break;
                }
                default: {
                  s.enqueue(o);
                  break;
                }
              }
            (s.enqueue({
              type: "finish",
              finishReason: t.finishReason,
              usage: t.usage,
              providerMetadata: t.providerMetadata,
            }),
              s.close());
          },
        }),
        request: t.request,
        response: t.response,
      };
    },
  };
}
function Id(e) {
  return JSON.stringify(e.input);
}
function cp({ prefix: e = "Input Examples:", format: t = Id, remove: a = !0 } = {}) {
  return {
    specificationVersion: "v3",
    transformParams: async ({ params: r }) => {
      var s;
      if (!((s = r.tools) != null && s.length)) return r;
      const o = r.tools.map((i) => {
        var n;
        if (i.type !== "function" || !((n = i.inputExamples) != null && n.length)) return i;
        const l = i.inputExamples.map((c, d) => t(c, d)).join(`
`),
          u = `${e}
${l}`,
          p = i.description
            ? `${i.description}

${u}`
            : u;
        return { ...i, description: p, inputExamples: a ? void 0 : i.inputExamples };
      });
      return { ...r, tools: o };
    },
  };
}
var Dn = ({ model: e, middleware: t, modelId: a, providerId: r }) =>
    [...wt(t)]
      .reverse()
      .reduce((s, o) => Td({ model: s, middleware: o, modelId: a, providerId: r }), e),
  Td = ({
    model: e,
    middleware: {
      transformParams: t,
      wrapGenerate: a,
      wrapStream: r,
      overrideProvider: s,
      overrideModelId: o,
      overrideSupportedUrls: i,
    },
    modelId: n,
    providerId: l,
  }) => {
    var u, p, c;
    async function d({ params: h, type: m }) {
      return t ? await t({ params: h, type: m, model: e }) : h;
    }
    return {
      specificationVersion: "v3",
      provider: (u = l ?? s?.({ model: e })) != null ? u : e.provider,
      modelId: (p = n ?? o?.({ model: e })) != null ? p : e.modelId,
      supportedUrls: (c = i?.({ model: e })) != null ? c : e.supportedUrls,
      async doGenerate(h) {
        const m = await d({ params: h, type: "generate" }),
          v = async () => e.doGenerate(m);
        return a
          ? a({ doGenerate: v, doStream: async () => e.doStream(m), params: m, model: e })
          : v();
      },
      async doStream(h) {
        const m = await d({ params: h, type: "stream" }),
          v = async () => e.doGenerate(m),
          y = async () => e.doStream(m);
        return r ? r({ doGenerate: v, doStream: y, params: m, model: e }) : y();
      },
    };
  },
  fp = ({ model: e, middleware: t, modelId: a, providerId: r }) =>
    [...wt(t)]
      .reverse()
      .reduce((s, o) => xd({ model: s, middleware: o, modelId: a, providerId: r }), e),
  xd = ({
    model: e,
    middleware: {
      transformParams: t,
      wrapEmbed: a,
      overrideProvider: r,
      overrideModelId: s,
      overrideMaxEmbeddingsPerCall: o,
      overrideSupportsParallelCalls: i,
    },
    modelId: n,
    providerId: l,
  }) => {
    var u, p, c, d;
    async function h({ params: m }) {
      return t ? await t({ params: m, model: e }) : m;
    }
    return {
      specificationVersion: "v3",
      provider: (u = l ?? r?.({ model: e })) != null ? u : e.provider,
      modelId: (p = n ?? s?.({ model: e })) != null ? p : e.modelId,
      maxEmbeddingsPerCall: (c = o?.({ model: e })) != null ? c : e.maxEmbeddingsPerCall,
      supportsParallelCalls: (d = i?.({ model: e })) != null ? d : e.supportsParallelCalls,
      async doEmbed(m) {
        const v = await h({ params: m }),
          y = async () => e.doEmbed(v);
        return a ? a({ doEmbed: y, params: v, model: e }) : y();
      },
    };
  },
  $n = ({ model: e, middleware: t, modelId: a, providerId: r }) =>
    [...wt(t)]
      .reverse()
      .reduce((s, o) => _d({ model: s, middleware: o, modelId: a, providerId: r }), e),
  _d = ({
    model: e,
    middleware: {
      transformParams: t,
      wrapGenerate: a,
      overrideProvider: r,
      overrideModelId: s,
      overrideMaxImagesPerCall: o,
    },
    modelId: i,
    providerId: n,
  }) => {
    var l, u, p;
    async function c({ params: m }) {
      return t ? await t({ params: m, model: e }) : m;
    }
    const d = (l = o?.({ model: e })) != null ? l : e.maxImagesPerCall,
      h = d instanceof Function ? d.bind(e) : d;
    return {
      specificationVersion: "v3",
      provider: (u = n ?? r?.({ model: e })) != null ? u : e.provider,
      modelId: (p = i ?? s?.({ model: e })) != null ? p : e.modelId,
      maxImagesPerCall: h,
      async doGenerate(m) {
        const v = await c({ params: m }),
          y = async () => e.doGenerate(v);
        return a ? a({ doGenerate: y, params: v, model: e }) : y();
      },
    };
  };
function jn(e) {
  if ("specificationVersion" in e && e.specificationVersion === "v3") return e;
  const t = e;
  return {
    specificationVersion: "v3",
    languageModel: (a) => Ls(t.languageModel(a)),
    embeddingModel: (a) => Ws(t.textEmbeddingModel(a)),
    imageModel: (a) => Bs(t.imageModel(a)),
    transcriptionModel: t.transcriptionModel ? (a) => zs(t.transcriptionModel(a)) : void 0,
    speechModel: t.speechModel ? (a) => Ks(t.speechModel(a)) : void 0,
    rerankingModel: void 0,
  };
}
function mp({ provider: e, languageModelMiddleware: t, imageModelMiddleware: a }) {
  const r = jn(e);
  return {
    specificationVersion: "v3",
    languageModel: (s) => Dn({ model: r.languageModel(s), middleware: t }),
    embeddingModel: r.embeddingModel,
    imageModel: (s) => {
      let o = r.imageModel(s);
      return (a != null && (o = $n({ model: o, middleware: a })), o);
    },
    transcriptionModel: r.transcriptionModel,
    speechModel: r.speechModel,
    rerankingModel: r.rerankingModel,
  };
}
function Md({
  languageModels: e,
  embeddingModels: t,
  imageModels: a,
  transcriptionModels: r,
  speechModels: s,
  rerankingModels: o,
  fallbackProvider: i,
}) {
  const n = i ? jn(i) : void 0;
  return {
    specificationVersion: "v3",
    languageModel(l) {
      if (e != null && l in e) return e[l];
      if (n) return n.languageModel(l);
      throw new ke({ modelId: l, modelType: "languageModel" });
    },
    embeddingModel(l) {
      if (t != null && l in t) return t[l];
      if (n) return n.embeddingModel(l);
      throw new ke({ modelId: l, modelType: "embeddingModel" });
    },
    imageModel(l) {
      if (a != null && l in a) return a[l];
      if (n?.imageModel) return n.imageModel(l);
      throw new ke({ modelId: l, modelType: "imageModel" });
    },
    transcriptionModel(l) {
      if (r != null && l in r) return r[l];
      if (n?.transcriptionModel) return n.transcriptionModel(l);
      throw new ke({ modelId: l, modelType: "transcriptionModel" });
    },
    speechModel(l) {
      if (s != null && l in s) return s[l];
      if (n?.speechModel) return n.speechModel(l);
      throw new ke({ modelId: l, modelType: "speechModel" });
    },
    rerankingModel(l) {
      if (o != null && l in o) return o[l];
      if (n?.rerankingModel) return n.rerankingModel(l);
      throw new ke({ modelId: l, modelType: "rerankingModel" });
    },
  };
}
var vp = Md,
  Un = "AI_NoSuchProviderError",
  Fn = `vercel.ai.error.${Un}`,
  Sd = Symbol.for(Fn),
  Vn,
  Ed = class extends ke {
    constructor({
      modelId: e,
      modelType: t,
      providerId: a,
      availableProviders: r,
      message: s = `No such provider: ${a} (available providers: ${r.join()})`,
    }) {
      (super({ errorName: Un, modelId: e, modelType: t, message: s }),
        (this[Vn] = !0),
        (this.providerId = a),
        (this.availableProviders = r));
    }
    static isInstance(e) {
      return G.hasMarker(e, Fn);
    }
  };
Vn = Sd;
function Rd(e, { separator: t = ":", languageModelMiddleware: a, imageModelMiddleware: r } = {}) {
  const s = new Cd({ separator: t, languageModelMiddleware: a, imageModelMiddleware: r });
  for (const [o, i] of Object.entries(e)) s.registerProvider({ id: o, provider: i });
  return s;
}
var hp = Rd,
  Cd = class {
    constructor({ separator: e, languageModelMiddleware: t, imageModelMiddleware: a }) {
      ((this.providers = {}),
        (this.separator = e),
        (this.languageModelMiddleware = t),
        (this.imageModelMiddleware = a));
    }
    registerProvider({ id: e, provider: t }) {
      this.providers[e] = t;
    }
    getProvider(e, t) {
      const a = this.providers[e];
      if (a == null)
        throw new Ed({
          modelId: e,
          modelType: t,
          providerId: e,
          availableProviders: Object.keys(this.providers),
        });
      return a;
    }
    splitId(e, t) {
      const a = e.indexOf(this.separator);
      if (a === -1)
        throw new ke({
          modelId: e,
          modelType: t,
          message: `Invalid ${t} id for registry: ${e} (must be in the format "providerId${this.separator}modelId")`,
        });
      return [e.slice(0, a), e.slice(a + this.separator.length)];
    }
    languageModel(e) {
      var t, a;
      const [r, s] = this.splitId(e, "languageModel");
      let o =
        (a = (t = this.getProvider(r, "languageModel")).languageModel) == null
          ? void 0
          : a.call(t, s);
      if (o == null) throw new ke({ modelId: e, modelType: "languageModel" });
      return (
        this.languageModelMiddleware != null &&
          (o = Dn({ model: o, middleware: this.languageModelMiddleware })),
        o
      );
    }
    embeddingModel(e) {
      var t;
      const [a, r] = this.splitId(e, "embeddingModel"),
        s = this.getProvider(a, "embeddingModel"),
        o = (t = s.embeddingModel) == null ? void 0 : t.call(s, r);
      if (o == null) throw new ke({ modelId: e, modelType: "embeddingModel" });
      return o;
    }
    imageModel(e) {
      var t;
      const [a, r] = this.splitId(e, "imageModel"),
        s = this.getProvider(a, "imageModel");
      let o = (t = s.imageModel) == null ? void 0 : t.call(s, r);
      if (o == null) throw new ke({ modelId: e, modelType: "imageModel" });
      return (
        this.imageModelMiddleware != null &&
          (o = $n({ model: o, middleware: this.imageModelMiddleware })),
        o
      );
    }
    transcriptionModel(e) {
      var t;
      const [a, r] = this.splitId(e, "transcriptionModel"),
        s = this.getProvider(a, "transcriptionModel"),
        o = (t = s.transcriptionModel) == null ? void 0 : t.call(s, r);
      if (o == null) throw new ke({ modelId: e, modelType: "transcriptionModel" });
      return o;
    }
    speechModel(e) {
      var t;
      const [a, r] = this.splitId(e, "speechModel"),
        s = this.getProvider(a, "speechModel"),
        o = (t = s.speechModel) == null ? void 0 : t.call(s, r);
      if (o == null) throw new ke({ modelId: e, modelType: "speechModel" });
      return o;
    }
    rerankingModel(e) {
      var t;
      const [a, r] = this.splitId(e, "rerankingModel"),
        s = this.getProvider(a, "rerankingModel"),
        o = (t = s.rerankingModel) == null ? void 0 : t.call(s, r);
      if (o == null) throw new ke({ modelId: e, modelType: "rerankingModel" });
      return o;
    }
  };
async function gp({
  model: e,
  documents: t,
  query: a,
  topN: r,
  maxRetries: s,
  abortSignal: o,
  headers: i,
  providerOptions: n,
  experimental_telemetry: l,
}) {
  if (t.length === 0)
    return new wo({
      originalDocuments: [],
      ranking: [],
      providerMetadata: void 0,
      response: { timestamp: new Date(), modelId: e.modelId },
    });
  const { maxRetries: u, retry: p } = et({ maxRetries: s, abortSignal: o }),
    c = typeof t[0] == "string" ? { type: "text", values: t } : { type: "object", values: t },
    d = Ot({ model: e, telemetry: l, headers: i, settings: { maxRetries: u } }),
    h = kt(l);
  return Re({
    name: "ai.rerank",
    attributes: Y({
      telemetry: l,
      attributes: {
        ...Ee({ operationId: "ai.rerank", telemetry: l }),
        ...d,
        "ai.documents": { input: () => t.map((m) => JSON.stringify(m)) },
      },
    }),
    tracer: h,
    fn: async () => {
      var m, v;
      const {
        ranking: y,
        response: b,
        providerMetadata: R,
        warnings: g,
      } = await p(() =>
        Re({
          name: "ai.rerank.doRerank",
          attributes: Y({
            telemetry: l,
            attributes: {
              ...Ee({ operationId: "ai.rerank.doRerank", telemetry: l }),
              ...d,
              "ai.documents": { input: () => t.map((M) => JSON.stringify(M)) },
            },
          }),
          tracer: h,
          fn: async (M) => {
            const S = await e.doRerank({
                documents: c,
                query: a,
                topN: r,
                providerOptions: n,
                abortSignal: o,
                headers: i,
              }),
              T = S.ranking;
            return (
              M.setAttributes(
                await Y({
                  telemetry: l,
                  attributes: {
                    "ai.ranking.type": c.type,
                    "ai.ranking": { output: () => T.map((x) => JSON.stringify(x)) },
                  },
                })
              ),
              {
                ranking: T,
                providerMetadata: S.providerMetadata,
                response: S.response,
                warnings: S.warnings,
              }
            );
          },
        })
      );
      return (
        Fe({ warnings: g ?? [], provider: e.provider, model: e.modelId }),
        new wo({
          originalDocuments: t,
          ranking: y.map((M) => ({
            originalIndex: M.index,
            score: M.relevanceScore,
            document: t[M.index],
          })),
          providerMetadata: R,
          response: {
            id: b?.id,
            timestamp: (m = b?.timestamp) != null ? m : new Date(),
            modelId: (v = b?.modelId) != null ? v : e.modelId,
            headers: b?.headers,
            body: b?.body,
          },
        })
      );
    },
  });
}
var wo = class {
  constructor(e) {
    ((this.originalDocuments = e.originalDocuments),
      (this.ranking = e.ranking),
      (this.response = e.response),
      (this.providerMetadata = e.providerMetadata));
  }
  get rerankedDocuments() {
    return this.ranking.map((e) => e.document);
  }
};
async function yp({
  model: e,
  audio: t,
  providerOptions: a = {},
  maxRetries: r,
  abortSignal: s,
  headers: o,
}) {
  const i = ou(e);
  if (!i) throw new Error("Model could not be resolved");
  const { retry: n } = et({ maxRetries: r, abortSignal: s }),
    l = je(o ?? {}, `ai/${Le}`),
    u = t instanceof URL ? (await gr({ url: t })).data : an(t),
    p = await n(() => {
      var c;
      return i.doGenerate({
        audio: u,
        abortSignal: s,
        headers: l,
        providerOptions: a,
        mediaType: (c = it({ data: u, signatures: Zs })) != null ? c : "audio/wav",
      });
    });
  if ((Fe({ warnings: p.warnings, provider: i.provider, model: i.modelId }), !p.text))
    throw new Gl({ responses: [p.response] });
  return new Ad({
    text: p.text,
    segments: p.segments,
    language: p.language,
    durationInSeconds: p.durationInSeconds,
    warnings: p.warnings,
    responses: [p.response],
    providerMetadata: p.providerMetadata,
  });
}
var Ad = class {
  constructor(e) {
    var t;
    ((this.text = e.text),
      (this.segments = e.segments),
      (this.language = e.language),
      (this.durationInSeconds = e.durationInSeconds),
      (this.warnings = e.warnings),
      (this.responses = e.responses),
      (this.providerMetadata = (t = e.providerMetadata) != null ? t : {}));
  }
};
async function Nd({ stream: e, onTextPart: t }) {
  const a = e.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { done: r, value: s } = await a.read();
    if (r) break;
    await t(s);
  }
}
var Od = () => fetch;
async function wp({
  api: e,
  prompt: t,
  credentials: a,
  headers: r,
  body: s,
  streamProtocol: o = "data",
  setCompletion: i,
  setLoading: n,
  setError: l,
  setAbortController: u,
  onFinish: p,
  onError: c,
  fetch: d = Od(),
}) {
  var h;
  try {
    (n(!0), l(void 0));
    const m = new AbortController();
    (u(m), i(""));
    const v = await d(e, {
      method: "POST",
      body: JSON.stringify({ prompt: t, ...s }),
      credentials: a,
      headers: je({ "Content-Type": "application/json", ...r }, `ai-sdk/${Le}`, ba()),
      signal: m.signal,
    }).catch((b) => {
      throw b;
    });
    if (!v.ok)
      throw new Error((h = await v.text()) != null ? h : "Failed to fetch the chat response.");
    if (!v.body) throw new Error("The response body is empty.");
    let y = "";
    switch (o) {
      case "text": {
        await Nd({
          stream: v.body,
          onTextPart: (b) => {
            ((y += b), i(y));
          },
        });
        break;
      }
      case "data": {
        await Pa({
          stream: xo({ stream: v.body, schema: _n }).pipeThrough(
            new TransformStream({
              async transform(b) {
                if (!b.success) throw b.error;
                const R = b.value;
                if (R.type === "text-delta") ((y += R.delta), i(y));
                else if (R.type === "error") throw new Error(R.errorText);
              },
            })
          ),
          onError: (b) => {
            throw b;
          },
        });
        break;
      }
      default: {
        const b = o;
        throw new Error(`Unknown stream protocol: ${b}`);
      }
    }
    return (p && p(t, y), u(null), y);
  } catch (m) {
    if (m.name === "AbortError") return (u(null), null);
    (m instanceof Error && c && c(m), l(m));
  } finally {
    n(!1);
  }
}
async function kd(e) {
  if (e == null) return [];
  if (!globalThis.FileList || !(e instanceof globalThis.FileList))
    throw new Error("FileList is not supported in the current environment");
  return Promise.all(
    Array.from(e).map(async (t) => {
      const { name: a, type: r } = t,
        s = await new Promise((o, i) => {
          const n = new FileReader();
          ((n.onload = (l) => {
            var u;
            o((u = l.target) == null ? void 0 : u.result);
          }),
            (n.onerror = (l) => i(l)),
            n.readAsDataURL(t));
        });
      return { type: "file", mediaType: r, filename: a, url: s };
    })
  );
}
var Gn = class {
    constructor({
      api: e = "/api/chat",
      credentials: t,
      headers: a,
      body: r,
      fetch: s,
      prepareSendMessagesRequest: o,
      prepareReconnectToStreamRequest: i,
    }) {
      ((this.api = e),
        (this.credentials = t),
        (this.headers = a),
        (this.body = r),
        (this.fetch = s),
        (this.prepareSendMessagesRequest = o),
        (this.prepareReconnectToStreamRequest = i));
    }
    async sendMessages({ abortSignal: e, ...t }) {
      var a, r, s, o, i;
      const n = await fe(this.body),
        l = await fe(this.headers),
        u = await fe(this.credentials),
        p = { ...jt(l), ...jt(t.headers) },
        c = await ((a = this.prepareSendMessagesRequest) == null
          ? void 0
          : a.call(this, {
              api: this.api,
              id: t.chatId,
              messages: t.messages,
              body: { ...n, ...t.body },
              headers: p,
              credentials: u,
              requestMetadata: t.metadata,
              trigger: t.trigger,
              messageId: t.messageId,
            })),
        d = (r = c?.api) != null ? r : this.api,
        h = c?.headers !== void 0 ? jt(c.headers) : p,
        m =
          c?.body !== void 0
            ? c.body
            : {
                ...n,
                ...t.body,
                id: t.chatId,
                messages: t.messages,
                trigger: t.trigger,
                messageId: t.messageId,
              },
        v = (s = c?.credentials) != null ? s : u,
        b = await ((o = this.fetch) != null ? o : globalThis.fetch)(d, {
          method: "POST",
          headers: je({ "Content-Type": "application/json", ...h }, `ai-sdk/${Le}`, ba()),
          body: JSON.stringify(m),
          credentials: v,
          signal: e,
        });
      if (!b.ok)
        throw new Error((i = await b.text()) != null ? i : "Failed to fetch the chat response.");
      if (!b.body) throw new Error("The response body is empty.");
      return this.processResponseStream(b.body);
    }
    async reconnectToStream(e) {
      var t, a, r, s, o;
      const i = await fe(this.body),
        n = await fe(this.headers),
        l = await fe(this.credentials),
        u = { ...jt(n), ...jt(e.headers) },
        p = await ((t = this.prepareReconnectToStreamRequest) == null
          ? void 0
          : t.call(this, {
              api: this.api,
              id: e.chatId,
              body: { ...i, ...e.body },
              headers: u,
              credentials: l,
              requestMetadata: e.metadata,
            })),
        c = (a = p?.api) != null ? a : `${this.api}/${e.chatId}/stream`,
        d = p?.headers !== void 0 ? jt(p.headers) : u,
        h = (r = p?.credentials) != null ? r : l,
        v = await ((s = this.fetch) != null ? s : globalThis.fetch)(c, {
          method: "GET",
          headers: je(d, `ai-sdk/${Le}`, ba()),
          credentials: h,
        });
      if (v.status === 204) return null;
      if (!v.ok)
        throw new Error((o = await v.text()) != null ? o : "Failed to fetch the chat response.");
      if (!v.body) throw new Error("The response body is empty.");
      return this.processResponseStream(v.body);
    }
  },
  Pd = class extends Gn {
    constructor(e = {}) {
      super(e);
    }
    processResponseStream(e) {
      return xo({ stream: e, schema: _n }).pipeThrough(
        new TransformStream({
          async transform(t, a) {
            if (!t.success) throw t.error;
            a.enqueue(t.value);
          },
        })
      );
    }
  },
  bp = class {
    constructor({
      generateId: e = To,
      id: t = e(),
      transport: a = new Pd(),
      messageMetadataSchema: r,
      dataPartSchemas: s,
      state: o,
      onError: i,
      onToolCall: n,
      onFinish: l,
      onData: u,
      sendAutomaticallyWhen: p,
    }) {
      ((this.activeResponse = void 0),
        (this.jobExecutor = new pd()),
        (this.sendMessage = async (c, d) => {
          var h, m, v, y;
          if (c == null) {
            await this.makeRequest({
              trigger: "submit-message",
              messageId: (h = this.lastMessage) == null ? void 0 : h.id,
              ...d,
            });
            return;
          }
          let b;
          if (
            ("text" in c || "files" in c
              ? (b = {
                  parts: [
                    ...(Array.isArray(c.files) ? c.files : await kd(c.files)),
                    ...("text" in c && c.text != null ? [{ type: "text", text: c.text }] : []),
                  ],
                })
              : (b = c),
            c.messageId != null)
          ) {
            const R = this.state.messages.findIndex((g) => g.id === c.messageId);
            if (R === -1) throw new Error(`message with id ${c.messageId} not found`);
            if (this.state.messages[R].role !== "user")
              throw new Error(`message with id ${c.messageId} is not a user message`);
            ((this.state.messages = this.state.messages.slice(0, R + 1)),
              this.state.replaceMessage(R, {
                ...b,
                id: c.messageId,
                role: (m = b.role) != null ? m : "user",
                metadata: c.metadata,
              }));
          } else
            this.state.pushMessage({
              ...b,
              id: (v = b.id) != null ? v : this.generateId(),
              role: (y = b.role) != null ? y : "user",
              metadata: c.metadata,
            });
          await this.makeRequest({ trigger: "submit-message", messageId: c.messageId, ...d });
        }),
        (this.regenerate = async ({ messageId: c, ...d } = {}) => {
          const h =
            c == null
              ? this.state.messages.length - 1
              : this.state.messages.findIndex((m) => m.id === c);
          if (h === -1) throw new Error(`message ${c} not found`);
          ((this.state.messages = this.state.messages.slice(
            0,
            this.messages[h].role === "assistant" ? h : h + 1
          )),
            await this.makeRequest({ trigger: "regenerate-message", messageId: c, ...d }));
        }),
        (this.resumeStream = async (c = {}) => {
          await this.makeRequest({ trigger: "resume-stream", ...c });
        }),
        (this.clearError = () => {
          this.status === "error" &&
            ((this.state.error = void 0), this.setStatus({ status: "ready" }));
        }),
        (this.addToolApprovalResponse = async ({ id: c, approved: d, reason: h }) =>
          this.jobExecutor.run(async () => {
            const m = this.state.messages,
              v = m[m.length - 1],
              y = (b) =>
                st(b) && b.state === "approval-requested" && b.approval.id === c
                  ? {
                      ...b,
                      state: "approval-responded",
                      approval: { id: c, approved: d, reason: h },
                    }
                  : b;
            (this.state.replaceMessage(m.length - 1, { ...v, parts: v.parts.map(y) }),
              this.activeResponse &&
                (this.activeResponse.state.message.parts =
                  this.activeResponse.state.message.parts.map(y)),
              this.status !== "streaming" &&
                this.status !== "submitted" &&
                this.sendAutomaticallyWhen &&
                this.shouldSendAutomatically().then((b) => {
                  var R;
                  b &&
                    this.makeRequest({
                      trigger: "submit-message",
                      messageId: (R = this.lastMessage) == null ? void 0 : R.id,
                    });
                }));
          })),
        (this.addToolOutput = async ({
          state: c = "output-available",
          tool: d,
          toolCallId: h,
          output: m,
          errorText: v,
        }) =>
          this.jobExecutor.run(async () => {
            const y = this.state.messages,
              b = y[y.length - 1],
              R = (g) =>
                st(g) && g.toolCallId === h ? { ...g, state: c, output: m, errorText: v } : g;
            (this.state.replaceMessage(y.length - 1, { ...b, parts: b.parts.map(R) }),
              this.activeResponse &&
                (this.activeResponse.state.message.parts =
                  this.activeResponse.state.message.parts.map(R)),
              this.status !== "streaming" &&
                this.status !== "submitted" &&
                this.sendAutomaticallyWhen &&
                this.shouldSendAutomatically().then((g) => {
                  var M;
                  g &&
                    this.makeRequest({
                      trigger: "submit-message",
                      messageId: (M = this.lastMessage) == null ? void 0 : M.id,
                    });
                }));
          })),
        (this.addToolResult = this.addToolOutput),
        (this.stop = async () => {
          var c;
          (this.status !== "streaming" && this.status !== "submitted") ||
            ((c = this.activeResponse) != null &&
              c.abortController &&
              this.activeResponse.abortController.abort());
        }),
        (this.id = t),
        (this.transport = a),
        (this.generateId = e),
        (this.messageMetadataSchema = r),
        (this.dataPartSchemas = s),
        (this.state = o),
        (this.onError = i),
        (this.onToolCall = n),
        (this.onFinish = l),
        (this.onData = u),
        (this.sendAutomaticallyWhen = p));
    }
    get status() {
      return this.state.status;
    }
    setStatus({ status: e, error: t }) {
      this.status !== e && ((this.state.status = e), (this.state.error = t));
    }
    get error() {
      return this.state.error;
    }
    get messages() {
      return this.state.messages;
    }
    get lastMessage() {
      return this.state.messages[this.state.messages.length - 1];
    }
    set messages(e) {
      this.state.messages = e;
    }
    async shouldSendAutomatically() {
      if (!this.sendAutomaticallyWhen) return !1;
      const e = this.sendAutomaticallyWhen({ messages: this.state.messages });
      return e && typeof e == "object" && "then" in e ? await e : e;
    }
    async makeRequest({ trigger: e, metadata: t, headers: a, body: r, messageId: s }) {
      var o, i, n;
      this.setStatus({ status: "submitted", error: void 0 });
      const l = this.lastMessage;
      let u = !1,
        p = !1,
        c = !1;
      try {
        const d = {
          state: Ir({ lastMessage: this.state.snapshot(l), messageId: this.generateId() }),
          abortController: new AbortController(),
        };
        (d.abortController.signal.addEventListener("abort", () => {
          u = !0;
        }),
          (this.activeResponse = d));
        let h;
        if (e === "resume-stream") {
          const v = await this.transport.reconnectToStream({
            chatId: this.id,
            metadata: t,
            headers: a,
            body: r,
          });
          if (v == null) {
            this.setStatus({ status: "ready" });
            return;
          }
          h = v;
        } else
          h = await this.transport.sendMessages({
            chatId: this.id,
            messages: this.state.messages,
            abortSignal: d.abortController.signal,
            metadata: t,
            headers: a,
            body: r,
            trigger: e,
            messageId: s,
          });
        const m = (v) =>
          this.jobExecutor.run(() =>
            v({
              state: d.state,
              write: () => {
                var y;
                (this.setStatus({ status: "streaming" }),
                  d.state.message.id === ((y = this.lastMessage) == null ? void 0 : y.id)
                    ? this.state.replaceMessage(this.state.messages.length - 1, d.state.message)
                    : this.state.pushMessage(d.state.message));
              },
            })
          );
        (await Pa({
          stream: Tr({
            stream: h,
            onToolCall: this.onToolCall,
            onData: this.onData,
            messageMetadataSchema: this.messageMetadataSchema,
            dataPartSchemas: this.dataPartSchemas,
            runUpdateMessageJob: m,
            onError: (v) => {
              throw v;
            },
          }),
          onError: (v) => {
            throw v;
          },
        }),
          this.setStatus({ status: "ready" }));
      } catch (d) {
        if (u || d.name === "AbortError")
          return ((u = !0), this.setStatus({ status: "ready" }), null);
        ((c = !0),
          d instanceof TypeError &&
            (d.message.toLowerCase().includes("fetch") ||
              d.message.toLowerCase().includes("network")) &&
            (p = !0),
          this.onError && d instanceof Error && this.onError(d),
          this.setStatus({ status: "error", error: d }));
      } finally {
        try {
          (i = this.onFinish) == null ||
            i.call(this, {
              message: this.activeResponse.state.message,
              messages: this.state.messages,
              isAbort: u,
              isDisconnect: p,
              isError: c,
              finishReason: (o = this.activeResponse) == null ? void 0 : o.state.finishReason,
            });
        } catch (d) {
          console.error(d);
        }
        this.activeResponse = void 0;
      }
      !c &&
        (await this.shouldSendAutomatically()) &&
        (await this.makeRequest({
          trigger: "submit-message",
          messageId: (n = this.lastMessage) == null ? void 0 : n.id,
          metadata: t,
          headers: a,
          body: r,
        }));
    }
  },
  Ip = class {
    constructor({ agent: e, options: t, ...a }) {
      ((this.agent = e), (this.agentOptions = t), (this.uiMessageStreamOptions = a));
    }
    async sendMessages({ messages: e, abortSignal: t }) {
      const a = await Nn({ messages: e, tools: this.agent.tools }),
        r = await An(a, { tools: this.agent.tools });
      return (
        await this.agent.stream({
          prompt: r,
          abortSignal: t,
          ...(this.agentOptions !== void 0 ? { options: this.agentOptions } : {}),
        })
      ).toUIMessageStream(this.uiMessageStreamOptions);
    }
    async reconnectToStream(e) {
      return null;
    }
  };
function Tp({ messages: e }) {
  const t = e[e.length - 1];
  if (!t || t.role !== "assistant") return !1;
  const a = t.parts.reduce((s, o, i) => (o.type === "step-start" ? i : s), -1),
    r = t.parts
      .slice(a + 1)
      .filter(st)
      .filter((s) => !s.providerExecuted);
  return (
    r.filter((s) => s.state === "approval-responded").length > 0 &&
    r.every(
      (s) =>
        s.state === "output-available" ||
        s.state === "output-error" ||
        s.state === "approval-responded"
    )
  );
}
function xp({ messages: e }) {
  const t = e[e.length - 1];
  if (!t || t.role !== "assistant") return !1;
  const a = t.parts.reduce((s, o, i) => (o.type === "step-start" ? i : s), -1),
    r = t.parts
      .slice(a + 1)
      .filter(st)
      .filter((s) => !s.providerExecuted);
  return (
    r.length > 0 && r.every((s) => s.state === "output-available" || s.state === "output-error")
  );
}
function qd({ stream: e }) {
  return e.pipeThrough(
    new TransformStream({
      start(t) {
        (t.enqueue({ type: "start" }),
          t.enqueue({ type: "start-step" }),
          t.enqueue({ type: "text-start", id: "text-1" }));
      },
      async transform(t, a) {
        a.enqueue({ type: "text-delta", id: "text-1", delta: t });
      },
      async flush(t) {
        (t.enqueue({ type: "text-end", id: "text-1" }),
          t.enqueue({ type: "finish-step" }),
          t.enqueue({ type: "finish" }));
      },
    })
  );
}
var _p = class extends Gn {
  constructor(e = {}) {
    super(e);
  }
  processResponseStream(e) {
    return qd({ stream: e.pipeThrough(new TextDecoderStream()) });
  }
};
export {
  G as AISDKError,
  Io as APICallError,
  bp as AbstractChat,
  Pd as DefaultChatTransport,
  St as DefaultGeneratedFile,
  Ip as DirectChatTransport,
  Ja as DownloadError,
  Ep as EmptyResponseBodyError,
  Wd as Experimental_Agent,
  Gn as HttpChatTransport,
  ae as InvalidArgumentError,
  ro as InvalidDataContentError,
  Xl as InvalidMessageRoleError,
  Ut as InvalidPromptError,
  Rp as InvalidResponseDataError,
  Fd as InvalidStreamPartError,
  Nl as InvalidToolApprovalError,
  mr as InvalidToolInputError,
  Hn as JSONParseError,
  In as JsonToSseTransformStream,
  Cp as LoadAPIKeyError,
  Ap as LoadSettingError,
  Zl as MessageConversionError,
  ao as MissingToolResultsError,
  Np as NoContentGeneratedError,
  Dl as NoImageGeneratedError,
  $e as NoObjectGeneratedError,
  ms as NoOutputGeneratedError,
  Fl as NoSpeechGeneratedError,
  ke as NoSuchModelError,
  Ed as NoSuchProviderError,
  tr as NoSuchToolError,
  Gl as NoTranscriptGeneratedError,
  Wl as NoVideoGeneratedError,
  Pu as Output,
  oo as RetryError,
  pd as SerialJobExecutor,
  _p as TextStreamChatTransport,
  Op as TooManyEmbeddingValuesForCallError,
  vr as ToolCallNotFoundForApprovalError,
  Hl as ToolCallRepairError,
  Wd as ToolLoopAgent,
  Qe as TypeValidationError,
  Ft as UIMessageStreamError,
  Tn as UI_MESSAGE_STREAM_HEADERS,
  Ca as UnsupportedFunctionalityError,
  Wt as UnsupportedModelVersionError,
  cp as addToolInputExamplesMiddleware,
  Ct as asSchema,
  Mu as assistantModelMessageSchema,
  wp as callCompletionApi,
  Pa as consumeStream,
  kd as convertFileListToFileUIParts,
  An as convertToModelMessages,
  Zd as cosineSimilarity,
  On as createAgentUIStream,
  Hd as createAgentUIStreamResponse,
  Vi as createGateway,
  Ra as createIdGenerator,
  Rd as createProviderRegistry,
  yn as createTextStreamResponse,
  Bd as createUIMessageStream,
  xn as createUIMessageStreamResponse,
  Md as customProvider,
  ip as defaultEmbeddingSettingsMiddleware,
  lp as defaultSettingsMiddleware,
  kp as dynamicTool,
  Kd as embed,
  zd as embedMany,
  hp as experimental_createProviderRegistry,
  vp as experimental_customProvider,
  Xd as experimental_generateImage,
  rp as experimental_generateSpeech,
  np as experimental_generateVideo,
  yp as experimental_transcribe,
  up as extractJsonMiddleware,
  dp as extractReasoningMiddleware,
  Gi as gateway,
  To as generateId,
  ed as generateImage,
  Qd as generateObject,
  Vu as generateText,
  sr as getStaticToolName,
  ep as getTextFromDataUrl,
  wa as getToolName,
  Jd as getToolOrDynamicToolName,
  Vd as hasToolCall,
  za as isDataUIPart,
  Sa as isDeepEqualData,
  Qa as isFileUIPart,
  fo as isReasoningUIPart,
  or as isStaticToolUIPart,
  Xa as isTextUIPart,
  Gd as isToolOrDynamicToolUIPart,
  st as isToolUIPart,
  Pp as jsonSchema,
  Tp as lastAssistantMessageIsCompleteWithApprovalResponses,
  xp as lastAssistantMessageIsCompleteWithToolCalls,
  Eu as modelMessageSchema,
  xo as parseJsonEventStream,
  Lt as parsePartialJson,
  Yd as pipeAgentUIStreamToResponse,
  bn as pipeTextStreamToResponse,
  En as pipeUIMessageStreamToResponse,
  op as pruneMessages,
  Ld as readUIMessageStream,
  gp as rerank,
  Qu as safeValidateUIMessages,
  tp as simulateReadableStream,
  pp as simulateStreamingMiddleware,
  sp as smoothStream,
  br as stepCountIs,
  ap as streamObject,
  Yu as streamText,
  xu as systemModelMessageSchema,
  qp as tool,
  Su as toolModelMessageSchema,
  _n as uiMessageChunkSchema,
  _u as userModelMessageSchema,
  Nn as validateUIMessages,
  fp as wrapEmbeddingModel,
  $n as wrapImageModel,
  Dn as wrapLanguageModel,
  mp as wrapProvider,
  Ye as zodSchema,
};
