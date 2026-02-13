import {
  o as P,
  p as E,
  f as j,
  e as A,
  g as W,
  i as _e,
  q as le,
  s as ue,
  T as Ce,
  t as ke,
  u as Se,
  w as Re,
  U,
  n as K,
  h as $,
  D as Ie,
  x as Te,
  y as Oe,
  k as qe,
} from "./index-CGwOAdyT.js";
import {
  u as Q,
  o as v,
  c as X,
  f as ye,
  s as c,
  n as y,
  b as be,
  a as q,
  _ as Me,
  r as z,
  l as Ue,
} from "./main-B2XpWmPF.js";
import "./types-CUi3gq4E.js";
import "./TerminalRouterContext-CeKE7fio.js";
var Ee = v({
    error: v({
      message: c(),
      type: c().nullish(),
      param: ye().nullish(),
      code: Q([c(), y()]).nullish(),
    }),
  }),
  B = { errorSchema: Ee, errorToMessage: (e) => e.error.message };
function de(e) {
  var n, o, a, l, u, r;
  if (e == null)
    return {
      inputTokens: { total: void 0, noCache: void 0, cacheRead: void 0, cacheWrite: void 0 },
      outputTokens: { total: void 0, text: void 0, reasoning: void 0 },
      raw: void 0,
    };
  const p = (n = e.prompt_tokens) != null ? n : 0,
    m = (o = e.completion_tokens) != null ? o : 0,
    t = (l = (a = e.prompt_tokens_details) == null ? void 0 : a.cached_tokens) != null ? l : 0,
    i =
      (r = (u = e.completion_tokens_details) == null ? void 0 : u.reasoning_tokens) != null ? r : 0;
  return {
    inputTokens: { total: p, noCache: p - t, cacheRead: t, cacheWrite: void 0 },
    outputTokens: { total: m, text: m - i, reasoning: i },
    raw: e,
  };
}
function N(e) {
  var n, o;
  return (o = (n = e?.providerOptions) == null ? void 0 : n.openaiCompatible) != null ? o : {};
}
function Ae(e) {
  switch (e) {
    case "audio/wav":
      return "wav";
    case "audio/mp3":
    case "audio/mpeg":
      return "mp3";
    default:
      return null;
  }
}
function He(e) {
  var n, o, a;
  const l = [];
  for (const { role: u, content: r, ...p } of e) {
    const m = N({ ...p });
    switch (u) {
      case "system": {
        l.push({ role: "system", content: r, ...m });
        break;
      }
      case "user": {
        if (r.length === 1 && r[0].type === "text") {
          l.push({ role: "user", content: r[0].text, ...N(r[0]) });
          break;
        }
        l.push({
          role: "user",
          content: r.map((t) => {
            var i;
            const d = N(t);
            switch (t.type) {
              case "text":
                return { type: "text", text: t.text, ...d };
              case "file": {
                if (t.mediaType.startsWith("image/")) {
                  const s = t.mediaType === "image/*" ? "image/jpeg" : t.mediaType;
                  return {
                    type: "image_url",
                    image_url: {
                      url:
                        t.data instanceof URL ? t.data.toString() : `data:${s};base64,${K(t.data)}`,
                    },
                    ...d,
                  };
                }
                if (t.mediaType.startsWith("audio/")) {
                  if (t.data instanceof URL)
                    throw new U({ functionality: "audio file parts with URLs" });
                  const s = Ae(t.mediaType);
                  if (s === null) throw new U({ functionality: `audio media type ${t.mediaType}` });
                  return { type: "input_audio", input_audio: { data: K(t.data), format: s }, ...d };
                }
                if (t.mediaType === "application/pdf") {
                  if (t.data instanceof URL)
                    throw new U({ functionality: "PDF file parts with URLs" });
                  return {
                    type: "file",
                    file: {
                      filename: (i = t.filename) != null ? i : "document.pdf",
                      file_data: `data:application/pdf;base64,${K(t.data)}`,
                    },
                    ...d,
                  };
                }
                if (t.mediaType.startsWith("text/"))
                  return {
                    type: "text",
                    text:
                      t.data instanceof URL
                        ? t.data.toString()
                        : typeof t.data == "string"
                          ? t.data
                          : new TextDecoder().decode(t.data),
                    ...d,
                  };
                throw new U({ functionality: `file part media type ${t.mediaType}` });
              }
            }
          }),
          ...m,
        });
        break;
      }
      case "assistant": {
        let t = "",
          i = "";
        const d = [];
        for (const s of r) {
          const f = N(s);
          switch (s.type) {
            case "text": {
              t += s.text;
              break;
            }
            case "reasoning": {
              i += s.text;
              break;
            }
            case "tool-call": {
              const _ =
                (o = (n = s.providerOptions) == null ? void 0 : n.google) == null
                  ? void 0
                  : o.thoughtSignature;
              d.push({
                id: s.toolCallId,
                type: "function",
                function: { name: s.toolName, arguments: JSON.stringify(s.input) },
                ...f,
                ...(_ ? { extra_content: { google: { thought_signature: String(_) } } } : {}),
              });
              break;
            }
          }
        }
        l.push({
          role: "assistant",
          content: t,
          ...(i.length > 0 ? { reasoning_content: i } : {}),
          tool_calls: d.length > 0 ? d : void 0,
          ...m,
        });
        break;
      }
      case "tool": {
        for (const t of r) {
          if (t.type === "tool-approval-response") continue;
          const i = t.output;
          let d;
          switch (i.type) {
            case "text":
            case "error-text":
              d = i.value;
              break;
            case "execution-denied":
              d = (a = i.reason) != null ? a : "Tool execution denied.";
              break;
            case "content":
            case "json":
            case "error-json":
              d = JSON.stringify(i.value);
              break;
          }
          const s = N(t);
          l.push({ role: "tool", tool_call_id: t.toolCallId, content: d, ...s });
        }
        break;
      }
      default: {
        const t = u;
        throw new Error(`Unsupported role: ${t}`);
      }
    }
  }
  return l;
}
function ce({ id: e, model: n, created: o }) {
  return {
    id: e ?? void 0,
    modelId: n ?? void 0,
    timestamp: o != null ? new Date(o * 1e3) : void 0,
  };
}
function pe(e) {
  switch (e) {
    case "stop":
      return "stop";
    case "length":
      return "length";
    case "content_filter":
      return "content-filter";
    case "function_call":
    case "tool_calls":
      return "tool-calls";
    default:
      return "other";
  }
}
var F = v({
  user: c().optional(),
  reasoningEffort: c().optional(),
  textVerbosity: c().optional(),
  strictJsonSchema: be().optional(),
});
function je({ tools: e, toolChoice: n }) {
  e = e?.length ? e : void 0;
  const o = [];
  if (e == null) return { tools: void 0, toolChoice: void 0, toolWarnings: o };
  const a = [];
  for (const u of e)
    u.type === "provider"
      ? o.push({ type: "unsupported", feature: `provider-defined tool ${u.id}` })
      : a.push({
          type: "function",
          function: {
            name: u.name,
            description: u.description,
            parameters: u.inputSchema,
            ...(u.strict != null ? { strict: u.strict } : {}),
          },
        });
  if (n == null) return { tools: a, toolChoice: void 0, toolWarnings: o };
  const l = n.type;
  switch (l) {
    case "auto":
    case "none":
    case "required":
      return { tools: a, toolChoice: l, toolWarnings: o };
    case "tool":
      return {
        tools: a,
        toolChoice: { type: "function", function: { name: n.toolName } },
        toolWarnings: o,
      };
    default: {
      const u = l;
      throw new U({ functionality: `tool choice type: ${u}` });
    }
  }
}
var Ne = class {
    constructor(e, n) {
      this.specificationVersion = "v3";
      var o, a;
      ((this.modelId = e), (this.config = n));
      const l = (o = n.errorStructure) != null ? o : B;
      ((this.chunkSchema = Be(l.errorSchema)),
        (this.failedResponseHandler = P(l)),
        (this.supportsStructuredOutputs = (a = n.supportsStructuredOutputs) != null ? a : !1));
    }
    get provider() {
      return this.config.provider;
    }
    get providerOptionsName() {
      return this.config.provider.split(".")[0].trim();
    }
    get supportedUrls() {
      var e, n, o;
      return (o = (n = (e = this.config).supportedUrls) == null ? void 0 : n.call(e)) != null
        ? o
        : {};
    }
    transformRequestBody(e) {
      var n, o, a;
      return (a = (o = (n = this.config).transformRequestBody) == null ? void 0 : o.call(n, e)) !=
        null
        ? a
        : e;
    }
    async getArgs({
      prompt: e,
      maxOutputTokens: n,
      temperature: o,
      topP: a,
      topK: l,
      frequencyPenalty: u,
      presencePenalty: r,
      providerOptions: p,
      stopSequences: m,
      responseFormat: t,
      seed: i,
      toolChoice: d,
      tools: s,
    }) {
      var f, _, g, h, w;
      const x = [],
        S = await E({ provider: "openai-compatible", providerOptions: p, schema: F });
      S != null &&
        x.push({
          type: "other",
          message:
            "The 'openai-compatible' key in providerOptions is deprecated. Use 'openaiCompatible' instead.",
        });
      const C = Object.assign(
          S ?? {},
          (f = await E({ provider: "openaiCompatible", providerOptions: p, schema: F })) != null
            ? f
            : {},
          (_ = await E({ provider: this.providerOptionsName, providerOptions: p, schema: F })) !=
            null
            ? _
            : {}
        ),
        k = (g = C?.strictJsonSchema) != null ? g : !0;
      (l != null && x.push({ type: "unsupported", feature: "topK" }),
        t?.type === "json" &&
          t.schema != null &&
          !this.supportsStructuredOutputs &&
          x.push({
            type: "unsupported",
            feature: "responseFormat",
            details: "JSON response format schema is only supported with structuredOutputs",
          }));
      const { tools: b, toolChoice: O, toolWarnings: V } = je({ tools: s, toolChoice: d });
      return {
        args: {
          model: this.modelId,
          user: C.user,
          max_tokens: n,
          temperature: o,
          top_p: a,
          frequency_penalty: u,
          presence_penalty: r,
          response_format:
            t?.type === "json"
              ? this.supportsStructuredOutputs === !0 && t.schema != null
                ? {
                    type: "json_schema",
                    json_schema: {
                      schema: t.schema,
                      strict: k,
                      name: (h = t.name) != null ? h : "response",
                      description: t.description,
                    },
                  }
                : { type: "json_object" }
              : void 0,
          stop: m,
          seed: i,
          ...Object.fromEntries(
            Object.entries((w = p?.[this.providerOptionsName]) != null ? w : {}).filter(
              ([D]) => !Object.keys(F.shape).includes(D)
            )
          ),
          reasoning_effort: C.reasoningEffort,
          verbosity: C.textVerbosity,
          messages: He(e),
          tools: b,
          tool_choice: O,
        },
        warnings: [...x, ...V],
      };
    }
    async doGenerate(e) {
      var n, o, a, l, u, r, p, m;
      const { args: t, warnings: i } = await this.getArgs({ ...e }),
        d = this.transformRequestBody(t),
        s = JSON.stringify(d),
        {
          responseHeaders: f,
          value: _,
          rawValue: g,
        } = await j({
          url: this.config.url({ path: "/chat/completions", modelId: this.modelId }),
          headers: A(this.config.headers(), e.headers),
          body: d,
          failedResponseHandler: this.failedResponseHandler,
          successfulResponseHandler: $(Pe),
          abortSignal: e.abortSignal,
          fetch: this.config.fetch,
        }),
        h = _.choices[0],
        w = [],
        x = h.message.content;
      x != null && x.length > 0 && w.push({ type: "text", text: x });
      const S = (n = h.message.reasoning_content) != null ? n : h.message.reasoning;
      if (
        (S != null && S.length > 0 && w.push({ type: "reasoning", text: S }),
        h.message.tool_calls != null)
      )
        for (const b of h.message.tool_calls) {
          const O =
            (a = (o = b.extra_content) == null ? void 0 : o.google) == null
              ? void 0
              : a.thought_signature;
          w.push({
            type: "tool-call",
            toolCallId: (l = b.id) != null ? l : W(),
            toolName: b.function.name,
            input: b.function.arguments,
            ...(O
              ? { providerMetadata: { [this.providerOptionsName]: { thoughtSignature: O } } }
              : {}),
          });
        }
      const C = {
          [this.providerOptionsName]: {},
          ...(await ((r =
            (u = this.config.metadataExtractor) == null ? void 0 : u.extractMetadata) == null
            ? void 0
            : r.call(u, { parsedBody: g }))),
        },
        k = (p = _.usage) == null ? void 0 : p.completion_tokens_details;
      return (
        k?.accepted_prediction_tokens != null &&
          (C[this.providerOptionsName].acceptedPredictionTokens = k?.accepted_prediction_tokens),
        k?.rejected_prediction_tokens != null &&
          (C[this.providerOptionsName].rejectedPredictionTokens = k?.rejected_prediction_tokens),
        {
          content: w,
          finishReason: {
            unified: pe(h.finish_reason),
            raw: (m = h.finish_reason) != null ? m : void 0,
          },
          usage: de(_.usage),
          providerMetadata: C,
          request: { body: s },
          response: { ...ce(_), headers: f, body: g },
          warnings: i,
        }
      );
    }
    async doStream(e) {
      var n;
      const { args: o, warnings: a } = await this.getArgs({ ...e }),
        l = this.transformRequestBody({
          ...o,
          stream: !0,
          stream_options: this.config.includeUsage ? { include_usage: !0 } : void 0,
        }),
        u = (n = this.config.metadataExtractor) == null ? void 0 : n.createStreamExtractor(),
        { responseHeaders: r, value: p } = await j({
          url: this.config.url({ path: "/chat/completions", modelId: this.modelId }),
          headers: A(this.config.headers(), e.headers),
          body: l,
          failedResponseHandler: this.failedResponseHandler,
          successfulResponseHandler: _e(this.chunkSchema),
          abortSignal: e.abortSignal,
          fetch: this.config.fetch,
        }),
        m = [];
      let t = { unified: "other", raw: void 0 },
        i,
        d = !0;
      const s = this.providerOptionsName;
      let f = !1,
        _ = !1;
      return {
        stream: p.pipeThrough(
          new TransformStream({
            start(g) {
              g.enqueue({ type: "stream-start", warnings: a });
            },
            transform(g, h) {
              var w, x, S, C, k, b, O, V, D, Y, Z, ee, te, ne, oe, se, ae, ie;
              if (
                (e.includeRawChunks && h.enqueue({ type: "raw", rawValue: g.rawValue }), !g.success)
              ) {
                ((t = { unified: "error", raw: void 0 }),
                  h.enqueue({ type: "error", error: g.error }));
                return;
              }
              if ((u?.processChunk(g.rawValue), "error" in g.value)) {
                ((t = { unified: "error", raw: void 0 }),
                  h.enqueue({ type: "error", error: g.value.error.message }));
                return;
              }
              const L = g.value;
              (d && ((d = !1), h.enqueue({ type: "response-metadata", ...ce(L) })),
                L.usage != null && (i = L.usage));
              const M = L.choices[0];
              if (
                (M?.finish_reason != null &&
                  (t = {
                    unified: pe(M.finish_reason),
                    raw: (w = M.finish_reason) != null ? w : void 0,
                  }),
                M?.delta == null)
              )
                return;
              const H = M.delta,
                re = (x = H.reasoning_content) != null ? x : H.reasoning;
              if (
                (re &&
                  (f || (h.enqueue({ type: "reasoning-start", id: "reasoning-0" }), (f = !0)),
                  h.enqueue({ type: "reasoning-delta", id: "reasoning-0", delta: re })),
                H.content &&
                  (f && (h.enqueue({ type: "reasoning-end", id: "reasoning-0" }), (f = !1)),
                  _ || (h.enqueue({ type: "text-start", id: "txt-0" }), (_ = !0)),
                  h.enqueue({ type: "text-delta", id: "txt-0", delta: H.content })),
                H.tool_calls != null)
              ) {
                f && (h.enqueue({ type: "reasoning-end", id: "reasoning-0" }), (f = !1));
                for (const R of H.tool_calls) {
                  const J = (S = R.index) != null ? S : m.length;
                  if (m[J] == null) {
                    if (R.id == null)
                      throw new le({ data: R, message: "Expected 'id' to be a string." });
                    if (((C = R.function) == null ? void 0 : C.name) == null)
                      throw new le({
                        data: R,
                        message: "Expected 'function.name' to be a string.",
                      });
                    (h.enqueue({ type: "tool-input-start", id: R.id, toolName: R.function.name }),
                      (m[J] = {
                        id: R.id,
                        type: "function",
                        function: {
                          name: R.function.name,
                          arguments: (k = R.function.arguments) != null ? k : "",
                        },
                        hasFinished: !1,
                        thoughtSignature:
                          (V =
                            (O = (b = R.extra_content) == null ? void 0 : b.google) == null
                              ? void 0
                              : O.thought_signature) != null
                            ? V
                            : void 0,
                      }));
                    const T = m[J];
                    ((D = T.function) == null ? void 0 : D.name) != null &&
                      ((Y = T.function) == null ? void 0 : Y.arguments) != null &&
                      (T.function.arguments.length > 0 &&
                        h.enqueue({
                          type: "tool-input-delta",
                          id: T.id,
                          delta: T.function.arguments,
                        }),
                      ue(T.function.arguments) &&
                        (h.enqueue({ type: "tool-input-end", id: T.id }),
                        h.enqueue({
                          type: "tool-call",
                          toolCallId: (Z = T.id) != null ? Z : W(),
                          toolName: T.function.name,
                          input: T.function.arguments,
                          ...(T.thoughtSignature
                            ? {
                                providerMetadata: { [s]: { thoughtSignature: T.thoughtSignature } },
                              }
                            : {}),
                        }),
                        (T.hasFinished = !0)));
                    continue;
                  }
                  const I = m[J];
                  I.hasFinished ||
                    (((ee = R.function) == null ? void 0 : ee.arguments) != null &&
                      (I.function.arguments +=
                        (ne = (te = R.function) == null ? void 0 : te.arguments) != null ? ne : ""),
                    h.enqueue({
                      type: "tool-input-delta",
                      id: I.id,
                      delta: (oe = R.function.arguments) != null ? oe : "",
                    }),
                    ((se = I.function) == null ? void 0 : se.name) != null &&
                      ((ae = I.function) == null ? void 0 : ae.arguments) != null &&
                      ue(I.function.arguments) &&
                      (h.enqueue({ type: "tool-input-end", id: I.id }),
                      h.enqueue({
                        type: "tool-call",
                        toolCallId: (ie = I.id) != null ? ie : W(),
                        toolName: I.function.name,
                        input: I.function.arguments,
                        ...(I.thoughtSignature
                          ? { providerMetadata: { [s]: { thoughtSignature: I.thoughtSignature } } }
                          : {}),
                      }),
                      (I.hasFinished = !0)));
                }
              }
            },
            flush(g) {
              var h, w, x, S, C;
              (f && g.enqueue({ type: "reasoning-end", id: "reasoning-0" }),
                _ && g.enqueue({ type: "text-end", id: "txt-0" }));
              for (const b of m.filter((O) => !O.hasFinished))
                (g.enqueue({ type: "tool-input-end", id: b.id }),
                  g.enqueue({
                    type: "tool-call",
                    toolCallId: (h = b.id) != null ? h : W(),
                    toolName: b.function.name,
                    input: b.function.arguments,
                    ...(b.thoughtSignature
                      ? { providerMetadata: { [s]: { thoughtSignature: b.thoughtSignature } } }
                      : {}),
                  }));
              const k = { [s]: {}, ...u?.buildMetadata() };
              (((w = i?.completion_tokens_details) == null
                ? void 0
                : w.accepted_prediction_tokens) != null &&
                (k[s].acceptedPredictionTokens =
                  (x = i?.completion_tokens_details) == null
                    ? void 0
                    : x.accepted_prediction_tokens),
                ((S = i?.completion_tokens_details) == null
                  ? void 0
                  : S.rejected_prediction_tokens) != null &&
                  (k[s].rejectedPredictionTokens =
                    (C = i?.completion_tokens_details) == null
                      ? void 0
                      : C.rejected_prediction_tokens),
                g.enqueue({ type: "finish", finishReason: t, usage: de(i), providerMetadata: k }));
            },
          })
        ),
        request: { body: l },
        response: { headers: r },
      };
    }
  },
  we = X({
    prompt_tokens: y().nullish(),
    completion_tokens: y().nullish(),
    total_tokens: y().nullish(),
    prompt_tokens_details: v({ cached_tokens: y().nullish() }).nullish(),
    completion_tokens_details: v({
      reasoning_tokens: y().nullish(),
      accepted_prediction_tokens: y().nullish(),
      rejected_prediction_tokens: y().nullish(),
    }).nullish(),
  }).nullish(),
  Pe = X({
    id: c().nullish(),
    created: y().nullish(),
    model: c().nullish(),
    choices: q(
      v({
        message: v({
          role: Ue("assistant").nullish(),
          content: c().nullish(),
          reasoning_content: c().nullish(),
          reasoning: c().nullish(),
          tool_calls: q(
            v({
              id: c().nullish(),
              function: v({ name: c(), arguments: c() }),
              extra_content: v({
                google: v({ thought_signature: c().nullish() }).nullish(),
              }).nullish(),
            })
          ).nullish(),
        }),
        finish_reason: c().nullish(),
      })
    ),
    usage: we,
  }),
  $e = X({
    id: c().nullish(),
    created: y().nullish(),
    model: c().nullish(),
    choices: q(
      v({
        delta: v({
          role: Me(["assistant"]).nullish(),
          content: c().nullish(),
          reasoning_content: c().nullish(),
          reasoning: c().nullish(),
          tool_calls: q(
            v({
              index: y().nullish(),
              id: c().nullish(),
              function: v({ name: c().nullish(), arguments: c().nullish() }),
              extra_content: v({
                google: v({ thought_signature: c().nullish() }).nullish(),
              }).nullish(),
            })
          ).nullish(),
        }).nullish(),
        finish_reason: c().nullish(),
      })
    ),
    usage: we,
  }),
  Be = (e) => Q([$e, e]);
function he(e) {
  var n, o;
  if (e == null)
    return {
      inputTokens: { total: void 0, noCache: void 0, cacheRead: void 0, cacheWrite: void 0 },
      outputTokens: { total: void 0, text: void 0, reasoning: void 0 },
      raw: void 0,
    };
  const a = (n = e.prompt_tokens) != null ? n : 0,
    l = (o = e.completion_tokens) != null ? o : 0;
  return {
    inputTokens: { total: a, noCache: a, cacheRead: void 0, cacheWrite: void 0 },
    outputTokens: { total: l, text: l, reasoning: void 0 },
    raw: e,
  };
}
function Ve({ prompt: e, user: n = "user", assistant: o = "assistant" }) {
  let a = "";
  e[0].role === "system" &&
    ((a += `${e[0].content}

`),
    (e = e.slice(1)));
  for (const { role: l, content: u } of e)
    switch (l) {
      case "system":
        throw new Ie({ message: "Unexpected system message in prompt: ${content}", prompt: e });
      case "user": {
        const r = u
          .map((p) => {
            switch (p.type) {
              case "text":
                return p.text;
            }
          })
          .filter(Boolean)
          .join("");
        a += `${n}:
${r}

`;
        break;
      }
      case "assistant": {
        const r = u
          .map((p) => {
            switch (p.type) {
              case "text":
                return p.text;
              case "tool-call":
                throw new U({ functionality: "tool-call messages" });
            }
          })
          .join("");
        a += `${o}:
${r}

`;
        break;
      }
      case "tool":
        throw new U({ functionality: "tool messages" });
      default: {
        const r = l;
        throw new Error(`Unsupported role: ${r}`);
      }
    }
  return (
    (a += `${o}:
`),
    {
      prompt: a,
      stopSequences: [
        `
${n}:`,
      ],
    }
  );
}
function me({ id: e, model: n, created: o }) {
  return {
    id: e ?? void 0,
    modelId: n ?? void 0,
    timestamp: o != null ? new Date(o * 1e3) : void 0,
  };
}
function fe(e) {
  switch (e) {
    case "stop":
      return "stop";
    case "length":
      return "length";
    case "content_filter":
      return "content-filter";
    case "function_call":
    case "tool_calls":
      return "tool-calls";
    default:
      return "other";
  }
}
var De = v({
    echo: be().optional(),
    logitBias: z(c(), y()).optional(),
    suffix: c().optional(),
    user: c().optional(),
  }),
  Le = class {
    constructor(e, n) {
      this.specificationVersion = "v3";
      var o;
      ((this.modelId = e), (this.config = n));
      const a = (o = n.errorStructure) != null ? o : B;
      ((this.chunkSchema = We(a.errorSchema)), (this.failedResponseHandler = P(a)));
    }
    get provider() {
      return this.config.provider;
    }
    get providerOptionsName() {
      return this.config.provider.split(".")[0].trim();
    }
    get supportedUrls() {
      var e, n, o;
      return (o = (n = (e = this.config).supportedUrls) == null ? void 0 : n.call(e)) != null
        ? o
        : {};
    }
    async getArgs({
      prompt: e,
      maxOutputTokens: n,
      temperature: o,
      topP: a,
      topK: l,
      frequencyPenalty: u,
      presencePenalty: r,
      stopSequences: p,
      responseFormat: m,
      seed: t,
      providerOptions: i,
      tools: d,
      toolChoice: s,
    }) {
      var f;
      const _ = [],
        g =
          (f = await E({ provider: this.providerOptionsName, providerOptions: i, schema: De })) !=
          null
            ? f
            : {};
      (l != null && _.push({ type: "unsupported", feature: "topK" }),
        d?.length && _.push({ type: "unsupported", feature: "tools" }),
        s != null && _.push({ type: "unsupported", feature: "toolChoice" }),
        m != null &&
          m.type !== "text" &&
          _.push({
            type: "unsupported",
            feature: "responseFormat",
            details: "JSON response format is not supported.",
          }));
      const { prompt: h, stopSequences: w } = Ve({ prompt: e }),
        x = [...(w ?? []), ...(p ?? [])];
      return {
        args: {
          model: this.modelId,
          echo: g.echo,
          logit_bias: g.logitBias,
          suffix: g.suffix,
          user: g.user,
          max_tokens: n,
          temperature: o,
          top_p: a,
          frequency_penalty: u,
          presence_penalty: r,
          seed: t,
          ...i?.[this.providerOptionsName],
          prompt: h,
          stop: x.length > 0 ? x : void 0,
        },
        warnings: _,
      };
    }
    async doGenerate(e) {
      const { args: n, warnings: o } = await this.getArgs(e),
        {
          responseHeaders: a,
          value: l,
          rawValue: u,
        } = await j({
          url: this.config.url({ path: "/completions", modelId: this.modelId }),
          headers: A(this.config.headers(), e.headers),
          body: n,
          failedResponseHandler: this.failedResponseHandler,
          successfulResponseHandler: $(Je),
          abortSignal: e.abortSignal,
          fetch: this.config.fetch,
        }),
        r = l.choices[0],
        p = [];
      return (
        r.text != null && r.text.length > 0 && p.push({ type: "text", text: r.text }),
        {
          content: p,
          usage: he(l.usage),
          finishReason: { unified: fe(r.finish_reason), raw: r.finish_reason },
          request: { body: n },
          response: { ...me(l), headers: a, body: u },
          warnings: o,
        }
      );
    }
    async doStream(e) {
      const { args: n, warnings: o } = await this.getArgs(e),
        a = {
          ...n,
          stream: !0,
          stream_options: this.config.includeUsage ? { include_usage: !0 } : void 0,
        },
        { responseHeaders: l, value: u } = await j({
          url: this.config.url({ path: "/completions", modelId: this.modelId }),
          headers: A(this.config.headers(), e.headers),
          body: a,
          failedResponseHandler: this.failedResponseHandler,
          successfulResponseHandler: _e(this.chunkSchema),
          abortSignal: e.abortSignal,
          fetch: this.config.fetch,
        });
      let r = { unified: "other", raw: void 0 },
        p,
        m = !0;
      return {
        stream: u.pipeThrough(
          new TransformStream({
            start(t) {
              t.enqueue({ type: "stream-start", warnings: o });
            },
            transform(t, i) {
              var d;
              if (
                (e.includeRawChunks && i.enqueue({ type: "raw", rawValue: t.rawValue }), !t.success)
              ) {
                ((r = { unified: "error", raw: void 0 }),
                  i.enqueue({ type: "error", error: t.error }));
                return;
              }
              const s = t.value;
              if ("error" in s) {
                ((r = { unified: "error", raw: void 0 }),
                  i.enqueue({ type: "error", error: s.error }));
                return;
              }
              (m &&
                ((m = !1),
                i.enqueue({ type: "response-metadata", ...me(s) }),
                i.enqueue({ type: "text-start", id: "0" })),
                s.usage != null && (p = s.usage));
              const f = s.choices[0];
              (f?.finish_reason != null &&
                (r = {
                  unified: fe(f.finish_reason),
                  raw: (d = f.finish_reason) != null ? d : void 0,
                }),
                f?.text != null && i.enqueue({ type: "text-delta", id: "0", delta: f.text }));
            },
            flush(t) {
              (m || t.enqueue({ type: "text-end", id: "0" }),
                t.enqueue({ type: "finish", finishReason: r, usage: he(p) }));
            },
          })
        ),
        request: { body: a },
        response: { headers: l },
      };
    }
  },
  xe = v({ prompt_tokens: y(), completion_tokens: y(), total_tokens: y() }),
  Je = v({
    id: c().nullish(),
    created: y().nullish(),
    model: c().nullish(),
    choices: q(v({ text: c(), finish_reason: c() })),
    usage: xe.nullish(),
  }),
  We = (e) =>
    Q([
      v({
        id: c().nullish(),
        created: y().nullish(),
        model: c().nullish(),
        choices: q(v({ text: c(), finish_reason: c().nullish(), index: y() })),
        usage: xe.nullish(),
      }),
      e,
    ]),
  G = v({ dimensions: y().optional(), user: c().optional() }),
  Fe = class {
    constructor(e, n) {
      ((this.specificationVersion = "v3"), (this.modelId = e), (this.config = n));
    }
    get provider() {
      return this.config.provider;
    }
    get maxEmbeddingsPerCall() {
      var e;
      return (e = this.config.maxEmbeddingsPerCall) != null ? e : 2048;
    }
    get supportsParallelCalls() {
      var e;
      return (e = this.config.supportsParallelCalls) != null ? e : !0;
    }
    get providerOptionsName() {
      return this.config.provider.split(".")[0].trim();
    }
    async doEmbed({ values: e, headers: n, abortSignal: o, providerOptions: a }) {
      var l, u, r;
      const p = [],
        m = await E({ provider: "openai-compatible", providerOptions: a, schema: G });
      m != null &&
        p.push({
          type: "other",
          message:
            "The 'openai-compatible' key in providerOptions is deprecated. Use 'openaiCompatible' instead.",
        });
      const t = Object.assign(
        m ?? {},
        (l = await E({ provider: "openaiCompatible", providerOptions: a, schema: G })) != null
          ? l
          : {},
        (u = await E({ provider: this.providerOptionsName, providerOptions: a, schema: G })) != null
          ? u
          : {}
      );
      if (e.length > this.maxEmbeddingsPerCall)
        throw new Ce({
          provider: this.provider,
          modelId: this.modelId,
          maxEmbeddingsPerCall: this.maxEmbeddingsPerCall,
          values: e,
        });
      const {
        responseHeaders: i,
        value: d,
        rawValue: s,
      } = await j({
        url: this.config.url({ path: "/embeddings", modelId: this.modelId }),
        headers: A(this.config.headers(), n),
        body: {
          model: this.modelId,
          input: e,
          encoding_format: "float",
          dimensions: t.dimensions,
          user: t.user,
        },
        failedResponseHandler: P((r = this.config.errorStructure) != null ? r : B),
        successfulResponseHandler: $(Ke),
        abortSignal: o,
        fetch: this.config.fetch,
      });
      return {
        warnings: p,
        embeddings: d.data.map((f) => f.embedding),
        usage: d.usage ? { tokens: d.usage.prompt_tokens } : void 0,
        providerMetadata: d.providerMetadata,
        response: { headers: i, body: s },
      };
    }
  },
  Ke = v({
    data: q(v({ embedding: q(y()) })),
    usage: v({ prompt_tokens: y() }).nullish(),
    providerMetadata: z(c(), z(c(), ye())).optional(),
  }),
  Ge = class {
    constructor(e, n) {
      ((this.modelId = e),
        (this.config = n),
        (this.specificationVersion = "v3"),
        (this.maxImagesPerCall = 10));
    }
    get provider() {
      return this.config.provider;
    }
    get providerOptionsKey() {
      return this.config.provider.split(".")[0].trim();
    }
    getArgs(e) {
      return { ...e[this.providerOptionsKey], ...e[ze(this.providerOptionsKey)] };
    }
    async doGenerate({
      prompt: e,
      n,
      size: o,
      aspectRatio: a,
      seed: l,
      providerOptions: u,
      headers: r,
      abortSignal: p,
      files: m,
      mask: t,
    }) {
      var i, d, s, f, _;
      const g = [];
      (a != null &&
        g.push({
          type: "unsupported",
          feature: "aspectRatio",
          details: "This model does not support aspect ratio. Use `size` instead.",
        }),
        l != null && g.push({ type: "unsupported", feature: "seed" }));
      const h =
          (s =
            (d = (i = this.config._internal) == null ? void 0 : i.currentDate) == null
              ? void 0
              : d.call(i)) != null
            ? s
            : new Date(),
        w = this.getArgs(u);
      if (m != null && m.length > 0) {
        const { value: C, responseHeaders: k } = await ke({
          url: this.config.url({ path: "/images/edits", modelId: this.modelId }),
          headers: A(this.config.headers(), r),
          formData: Se({
            model: this.modelId,
            prompt: e,
            image: await Promise.all(m.map((b) => ve(b))),
            mask: t != null ? await ve(t) : void 0,
            n,
            size: o,
            ...w,
          }),
          failedResponseHandler: P((f = this.config.errorStructure) != null ? f : B),
          successfulResponseHandler: $(ge),
          abortSignal: p,
          fetch: this.config.fetch,
        });
        return {
          images: C.data.map((b) => b.b64_json),
          warnings: g,
          response: { timestamp: h, modelId: this.modelId, headers: k },
        };
      }
      const { value: x, responseHeaders: S } = await j({
        url: this.config.url({ path: "/images/generations", modelId: this.modelId }),
        headers: A(this.config.headers(), r),
        body: { model: this.modelId, prompt: e, n, size: o, ...w, response_format: "b64_json" },
        failedResponseHandler: P((_ = this.config.errorStructure) != null ? _ : B),
        successfulResponseHandler: $(ge),
        abortSignal: p,
        fetch: this.config.fetch,
      });
      return {
        images: x.data.map((C) => C.b64_json),
        warnings: g,
        response: { timestamp: h, modelId: this.modelId, headers: S },
      };
    }
  },
  ge = v({ data: q(v({ b64_json: c() })) });
async function ve(e) {
  if (e.type === "url") return Te(e.url);
  const n = e.data instanceof Uint8Array ? e.data : Oe(e.data);
  return new Blob([n], { type: e.mediaType });
}
function ze(e) {
  return e.replace(/[_-]([a-z])/g, (n) => n[1].toUpperCase());
}
var Qe = "2.0.27";
function tt(e) {
  const n = Re(e.baseURL),
    o = e.name,
    a = { ...(e.apiKey && { Authorization: `Bearer ${e.apiKey}` }), ...e.headers },
    l = () => qe(a, `ai-sdk/openai-compatible/${Qe}`),
    u = (s) => ({
      provider: `${o}.${s}`,
      url: ({ path: f }) => {
        const _ = new URL(`${n}${f}`);
        return (
          e.queryParams && (_.search = new URLSearchParams(e.queryParams).toString()),
          _.toString()
        );
      },
      headers: l,
      fetch: e.fetch,
    }),
    r = (s) => p(s),
    p = (s) =>
      new Ne(s, {
        ...u("chat"),
        includeUsage: e.includeUsage,
        supportsStructuredOutputs: e.supportsStructuredOutputs,
        transformRequestBody: e.transformRequestBody,
        metadataExtractor: e.metadataExtractor,
      }),
    m = (s) => new Le(s, { ...u("completion"), includeUsage: e.includeUsage }),
    t = (s) => new Fe(s, { ...u("embedding") }),
    i = (s) => new Ge(s, u("image")),
    d = (s) => r(s);
  return (
    (d.specificationVersion = "v3"),
    (d.languageModel = r),
    (d.chatModel = p),
    (d.completionModel = m),
    (d.embeddingModel = t),
    (d.textEmbeddingModel = t),
    (d.imageModel = i),
    d
  );
}
export {
  Ne as OpenAICompatibleChatLanguageModel,
  Le as OpenAICompatibleCompletionLanguageModel,
  Fe as OpenAICompatibleEmbeddingModel,
  Ge as OpenAICompatibleImageModel,
  Qe as VERSION,
  tt as createOpenAICompatible,
};
