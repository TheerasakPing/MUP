import { OpenAICompatibleImageModel as Se } from "./index-CGumWTDx.js";
import {
  a as L,
  w as ke,
  N as Te,
  b as M,
  g as pe,
  k as Ie,
  z as O,
  p as fe,
  f as Y,
  e as Q,
  h as ye,
  A as ne,
  J as Ce,
  K as qe,
  i as ge,
  j as Re,
  n as xe,
  U as te,
  o as Ne,
  v as G,
} from "./index-CmuXKG3k.js";
import {
  o as t,
  e as Ee,
  s as e,
  a as b,
  n as a,
  u as re,
  f as F,
  b as W,
  _ as K,
  l as r,
  d as ve,
  r as Ae,
} from "./main-CrYcxu2d.js";
import "./types-BUZRD7XI.js";
import "./TerminalRouterContext-CeKE7fio.js";
function He(o) {
  var h;
  const m = [],
    p = [];
  for (const { role: u, content: d } of o)
    switch (u) {
      case "system": {
        m.push({ role: "system", content: d });
        break;
      }
      case "user": {
        if (d.length === 1 && d[0].type === "text") {
          m.push({ role: "user", content: d[0].text });
          break;
        }
        m.push({
          role: "user",
          content: d.map((l) => {
            switch (l.type) {
              case "text":
                return { type: "text", text: l.text };
              case "file":
                if (l.mediaType.startsWith("image/")) {
                  const i = l.mediaType === "image/*" ? "image/jpeg" : l.mediaType;
                  return {
                    type: "image_url",
                    image_url: {
                      url:
                        l.data instanceof URL
                          ? l.data.toString()
                          : `data:${i};base64,${xe(l.data)}`,
                    },
                  };
                } else throw new te({ functionality: `file part media type ${l.mediaType}` });
            }
          }),
        });
        break;
      }
      case "assistant": {
        let l = "";
        const i = [];
        for (const s of d)
          switch (s.type) {
            case "text": {
              l += s.text;
              break;
            }
            case "tool-call": {
              i.push({
                id: s.toolCallId,
                type: "function",
                function: { name: s.toolName, arguments: JSON.stringify(s.input) },
              });
              break;
            }
          }
        m.push({ role: "assistant", content: l, tool_calls: i.length > 0 ? i : void 0 });
        break;
      }
      case "tool": {
        for (const l of d) {
          if (l.type === "tool-approval-response") continue;
          const i = l.output;
          let s;
          switch (i.type) {
            case "text":
            case "error-text":
              s = i.value;
              break;
            case "execution-denied":
              s = (h = i.reason) != null ? h : "Tool execution denied.";
              break;
            case "content":
            case "json":
            case "error-json":
              s = JSON.stringify(i.value);
              break;
          }
          m.push({ role: "tool", tool_call_id: l.toolCallId, content: s });
        }
        break;
      }
      default: {
        const l = u;
        throw new Error(`Unsupported role: ${l}`);
      }
    }
  return { messages: m, warnings: p };
}
function de(o) {
  var h, m, p, u;
  const d = (m = (h = o.prompt_tokens_details) == null ? void 0 : h.cached_tokens) != null ? m : 0,
    l =
      (u = (p = o.completion_tokens_details) == null ? void 0 : p.reasoning_tokens) != null ? u : 0;
  return {
    inputTokens: {
      total: o.prompt_tokens,
      noCache: o.prompt_tokens - d,
      cacheRead: d,
      cacheWrite: void 0,
    },
    outputTokens: { total: o.completion_tokens, text: o.completion_tokens - l, reasoning: l },
    raw: o,
  };
}
function Z({ id: o, model: h, created: m, created_at: p }) {
  const u = m ?? p;
  return {
    id: o ?? void 0,
    modelId: h ?? void 0,
    timestamp: u != null ? new Date(u * 1e3) : void 0,
  };
}
function _e(o) {
  switch (o) {
    case "stop":
      return "stop";
    case "length":
      return "length";
    case "tool_calls":
    case "function_call":
      return "tool-calls";
    case "content_filter":
      return "content-filter";
    default:
      return "other";
  }
}
var $e = t({
    type: r("web"),
    country: e().length(2).optional(),
    excludedWebsites: b(e()).max(5).optional(),
    allowedWebsites: b(e()).max(5).optional(),
    safeSearch: W().optional(),
  }),
  je = t({
    type: r("x"),
    excludedXHandles: b(e()).optional(),
    includedXHandles: b(e()).optional(),
    postFavoriteCount: a().int().optional(),
    postViewCount: a().int().optional(),
    xHandles: b(e()).optional(),
  }),
  Pe = t({
    type: r("news"),
    country: e().length(2).optional(),
    excludedWebsites: b(e()).max(5).optional(),
    safeSearch: W().optional(),
  }),
  Ue = t({ type: r("rss"), links: b(e().url()).max(1) }),
  Me = ve("type", [$e, je, Pe, Ue]),
  Oe = t({
    reasoningEffort: K(["low", "high"]).optional(),
    parallel_function_calling: W().optional(),
    searchParameters: t({
      mode: K(["off", "auto", "on"]),
      returnCitations: W().optional(),
      fromDate: e().optional(),
      toDate: e().optional(),
      maxSearchResults: a().min(1).max(50).optional(),
      sources: b(Me).optional(),
    }).optional(),
  }),
  be = t({
    error: t({
      message: e(),
      type: e().nullish(),
      param: F().nullish(),
      code: re([e(), a()]).nullish(),
    }),
  }),
  ee = Ne({ errorSchema: be, errorToMessage: (o) => o.error.message });
function Ve({ tools: o, toolChoice: h }) {
  o = o?.length ? o : void 0;
  const m = [];
  if (o == null) return { tools: void 0, toolChoice: void 0, toolWarnings: m };
  const p = [];
  for (const d of o)
    d.type === "provider"
      ? m.push({ type: "unsupported", feature: `provider-defined tool ${d.name}` })
      : p.push({
          type: "function",
          function: { name: d.name, description: d.description, parameters: d.inputSchema },
        });
  if (h == null) return { tools: p, toolChoice: void 0, toolWarnings: m };
  const u = h.type;
  switch (u) {
    case "auto":
    case "none":
      return { tools: p, toolChoice: u, toolWarnings: m };
    case "required":
      return { tools: p, toolChoice: "required", toolWarnings: m };
    case "tool":
      return {
        tools: p,
        toolChoice: { type: "function", function: { name: h.toolName } },
        toolWarnings: m,
      };
    default: {
      const d = u;
      throw new te({ functionality: `tool choice type: ${d}` });
    }
  }
}
var Xe = class {
    constructor(o, h) {
      ((this.specificationVersion = "v3"),
        (this.supportedUrls = { "image/*": [/^https?:\/\/.*$/] }),
        (this.modelId = o),
        (this.config = h));
    }
    get provider() {
      return this.config.provider;
    }
    async getArgs({
      prompt: o,
      maxOutputTokens: h,
      temperature: m,
      topP: p,
      topK: u,
      frequencyPenalty: d,
      presencePenalty: l,
      stopSequences: i,
      seed: s,
      responseFormat: c,
      providerOptions: y,
      tools: g,
      toolChoice: N,
    }) {
      var R, P, q;
      const f = [],
        v = (R = await fe({ provider: "xai", providerOptions: y, schema: Oe })) != null ? R : {};
      (u != null && f.push({ type: "unsupported", feature: "topK" }),
        d != null && f.push({ type: "unsupported", feature: "frequencyPenalty" }),
        l != null && f.push({ type: "unsupported", feature: "presencePenalty" }),
        i != null && f.push({ type: "unsupported", feature: "stopSequences" }));
      const { messages: S, warnings: k } = He(o);
      f.push(...k);
      const { tools: x, toolChoice: C, toolWarnings: E } = Ve({ tools: g, toolChoice: N });
      return (
        f.push(...E),
        {
          args: {
            model: this.modelId,
            max_completion_tokens: h,
            temperature: m,
            top_p: p,
            seed: s,
            reasoning_effort: v.reasoningEffort,
            parallel_function_calling: v.parallel_function_calling,
            response_format:
              c?.type === "json"
                ? c.schema != null
                  ? {
                      type: "json_schema",
                      json_schema: {
                        name: (P = c.name) != null ? P : "response",
                        schema: c.schema,
                        strict: !0,
                      },
                    }
                  : { type: "json_object" }
                : void 0,
            search_parameters: v.searchParameters
              ? {
                  mode: v.searchParameters.mode,
                  return_citations: v.searchParameters.returnCitations,
                  from_date: v.searchParameters.fromDate,
                  to_date: v.searchParameters.toDate,
                  max_search_results: v.searchParameters.maxSearchResults,
                  sources:
                    (q = v.searchParameters.sources) == null
                      ? void 0
                      : q.map((w) => {
                          var V;
                          return {
                            type: w.type,
                            ...(w.type === "web" && {
                              country: w.country,
                              excluded_websites: w.excludedWebsites,
                              allowed_websites: w.allowedWebsites,
                              safe_search: w.safeSearch,
                            }),
                            ...(w.type === "x" && {
                              excluded_x_handles: w.excludedXHandles,
                              included_x_handles: (V = w.includedXHandles) != null ? V : w.xHandles,
                              post_favorite_count: w.postFavoriteCount,
                              post_view_count: w.postViewCount,
                            }),
                            ...(w.type === "news" && {
                              country: w.country,
                              excluded_websites: w.excludedWebsites,
                              safe_search: w.safeSearch,
                            }),
                            ...(w.type === "rss" && { links: w.links }),
                          };
                        }),
                }
              : void 0,
            messages: S,
            tools: x,
            tool_choice: C,
          },
          warnings: f,
        }
      );
    }
    async doGenerate(o) {
      var h, m;
      const { args: p, warnings: u } = await this.getArgs(o),
        d = `${(h = this.config.baseURL) != null ? h : "https://api.x.ai/v1"}/chat/completions`,
        {
          responseHeaders: l,
          value: i,
          rawValue: s,
        } = await Y({
          url: d,
          headers: Q(this.config.headers(), o.headers),
          body: p,
          failedResponseHandler: ee,
          successfulResponseHandler: ye(We),
          abortSignal: o.abortSignal,
          fetch: this.config.fetch,
        });
      if (i.error != null)
        throw new ne({
          message: i.error,
          url: d,
          requestBodyValues: p,
          statusCode: 200,
          responseHeaders: l,
          responseBody: JSON.stringify(s),
          isRetryable: i.code === "The service is currently unavailable",
        });
      const c = i.choices[0],
        y = [];
      if (c.message.content != null && c.message.content.length > 0) {
        let g = c.message.content;
        const N = p.messages[p.messages.length - 1];
        (N?.role === "assistant" && g === N.content && (g = ""),
          g.length > 0 && y.push({ type: "text", text: g }));
      }
      if (
        (c.message.reasoning_content != null &&
          c.message.reasoning_content.length > 0 &&
          y.push({ type: "reasoning", text: c.message.reasoning_content }),
        c.message.tool_calls != null)
      )
        for (const g of c.message.tool_calls)
          y.push({
            type: "tool-call",
            toolCallId: g.id,
            toolName: g.function.name,
            input: g.function.arguments,
          });
      if (i.citations != null)
        for (const g of i.citations)
          y.push({ type: "source", sourceType: "url", id: this.config.generateId(), url: g });
      return {
        content: y,
        finishReason: {
          unified: _e(c.finish_reason),
          raw: (m = c.finish_reason) != null ? m : void 0,
        },
        usage: de(i.usage),
        request: { body: p },
        response: { ...Z(i), headers: l, body: s },
        warnings: u,
      };
    }
    async doStream(o) {
      var h;
      const { args: m, warnings: p } = await this.getArgs(o),
        u = { ...m, stream: !0, stream_options: { include_usage: !0 } },
        d = `${(h = this.config.baseURL) != null ? h : "https://api.x.ai/v1"}/chat/completions`,
        { responseHeaders: l, value: i } = await Y({
          url: d,
          headers: Q(this.config.headers(), o.headers),
          body: u,
          failedResponseHandler: ee,
          successfulResponseHandler: async ({ response: q }) => {
            const f = Ce(q),
              v = q.headers.get("content-type");
            if (v?.includes("application/json")) {
              const S = await q.text(),
                k = await qe({ text: S, schema: Le });
              throw k.success
                ? new ne({
                    message: k.value.error,
                    url: d,
                    requestBodyValues: u,
                    statusCode: 200,
                    responseHeaders: f,
                    responseBody: S,
                    isRetryable: k.value.code === "The service is currently unavailable",
                  })
                : new ne({
                    message: "Invalid JSON response",
                    url: d,
                    requestBodyValues: u,
                    statusCode: 200,
                    responseHeaders: f,
                    responseBody: S,
                  });
            }
            return ge(De)({ response: q, url: d, requestBodyValues: u });
          },
          abortSignal: o.abortSignal,
          fetch: this.config.fetch,
        });
      let s = { unified: "other", raw: void 0 },
        c,
        y = !0;
      const g = {},
        N = {};
      let R;
      const P = this;
      return {
        stream: i.pipeThrough(
          new TransformStream({
            start(q) {
              q.enqueue({ type: "stream-start", warnings: p });
            },
            transform(q, f) {
              if (
                (o.includeRawChunks && f.enqueue({ type: "raw", rawValue: q.rawValue }), !q.success)
              ) {
                f.enqueue({ type: "error", error: q.error });
                return;
              }
              const v = q.value;
              if (
                (y && (f.enqueue({ type: "response-metadata", ...Z(v) }), (y = !1)),
                v.citations != null)
              )
                for (const C of v.citations)
                  f.enqueue({
                    type: "source",
                    sourceType: "url",
                    id: P.config.generateId(),
                    url: C,
                  });
              v.usage != null && (c = de(v.usage));
              const S = v.choices[0];
              if (
                (S?.finish_reason != null &&
                  (s = { unified: _e(S.finish_reason), raw: S.finish_reason }),
                S?.delta == null)
              )
                return;
              const k = S.delta,
                x = S.index;
              if (k.content != null && k.content.length > 0) {
                const C = k.content;
                R != null &&
                  !g[R].ended &&
                  (f.enqueue({ type: "reasoning-end", id: R }), (g[R].ended = !0), (R = void 0));
                const E = u.messages[u.messages.length - 1];
                if (E?.role === "assistant" && C === E.content) return;
                const U = `text-${v.id || x}`;
                (g[U] == null &&
                  ((g[U] = { type: "text", ended: !1 }), f.enqueue({ type: "text-start", id: U })),
                  f.enqueue({ type: "text-delta", id: U, delta: C }));
              }
              if (k.reasoning_content != null && k.reasoning_content.length > 0) {
                const C = `reasoning-${v.id || x}`;
                if (N[C] === k.reasoning_content) return;
                ((N[C] = k.reasoning_content),
                  g[C] == null &&
                    ((g[C] = { type: "reasoning", ended: !1 }),
                    (R = C),
                    f.enqueue({ type: "reasoning-start", id: C })),
                  f.enqueue({ type: "reasoning-delta", id: C, delta: k.reasoning_content }));
              }
              if (k.tool_calls != null) {
                R != null &&
                  !g[R].ended &&
                  (f.enqueue({ type: "reasoning-end", id: R }), (g[R].ended = !0), (R = void 0));
                for (const C of k.tool_calls) {
                  const E = C.id;
                  (f.enqueue({ type: "tool-input-start", id: E, toolName: C.function.name }),
                    f.enqueue({ type: "tool-input-delta", id: E, delta: C.function.arguments }),
                    f.enqueue({ type: "tool-input-end", id: E }),
                    f.enqueue({
                      type: "tool-call",
                      toolCallId: E,
                      toolName: C.function.name,
                      input: C.function.arguments,
                    }));
                }
              }
            },
            flush(q) {
              for (const [f, v] of Object.entries(g))
                v.ended ||
                  q.enqueue({ type: v.type === "text" ? "text-end" : "reasoning-end", id: f });
              q.enqueue({ type: "finish", finishReason: s, usage: c });
            },
          })
        ),
        request: { body: u },
        response: { headers: l },
      };
    }
  },
  we = t({
    prompt_tokens: a(),
    completion_tokens: a(),
    total_tokens: a(),
    prompt_tokens_details: t({
      text_tokens: a().nullish(),
      audio_tokens: a().nullish(),
      image_tokens: a().nullish(),
      cached_tokens: a().nullish(),
    }).nullish(),
    completion_tokens_details: t({
      reasoning_tokens: a().nullish(),
      audio_tokens: a().nullish(),
      accepted_prediction_tokens: a().nullish(),
      rejected_prediction_tokens: a().nullish(),
    }).nullish(),
  }),
  We = t({
    id: e().nullish(),
    created: a().nullish(),
    model: e().nullish(),
    choices: b(
      t({
        message: t({
          role: r("assistant"),
          content: e().nullish(),
          reasoning_content: e().nullish(),
          tool_calls: b(
            t({ id: e(), type: r("function"), function: t({ name: e(), arguments: e() }) })
          ).nullish(),
        }),
        index: a(),
        finish_reason: e().nullish(),
      })
    ).nullish(),
    object: r("chat.completion").nullish(),
    usage: we.nullish(),
    citations: b(e().url()).nullish(),
    code: e().nullish(),
    error: e().nullish(),
  }),
  De = t({
    id: e().nullish(),
    created: a().nullish(),
    model: e().nullish(),
    choices: b(
      t({
        delta: t({
          role: K(["assistant"]).optional(),
          content: e().nullish(),
          reasoning_content: e().nullish(),
          tool_calls: b(
            t({ id: e(), type: r("function"), function: t({ name: e(), arguments: e() }) })
          ).nullish(),
        }),
        finish_reason: e().nullish(),
        index: a(),
      })
    ),
    usage: we.nullish(),
    citations: b(e().url()).nullish(),
  }),
  Le = t({ code: e(), error: e() });
async function Be({ prompt: o }) {
  var h, m, p, u, d;
  const l = [],
    i = [];
  for (const s of o)
    switch (s.role) {
      case "system": {
        l.push({ role: "system", content: s.content });
        break;
      }
      case "user": {
        const c = [];
        for (const y of s.content)
          switch (y.type) {
            case "text": {
              c.push({ type: "input_text", text: y.text });
              break;
            }
            case "file": {
              if (y.mediaType.startsWith("image/")) {
                const g = y.mediaType === "image/*" ? "image/jpeg" : y.mediaType,
                  N = y.data instanceof URL ? y.data.toString() : `data:${g};base64,${xe(y.data)}`;
                c.push({ type: "input_image", image_url: N });
              } else throw new te({ functionality: `file part media type ${y.mediaType}` });
              break;
            }
            default:
              i.push({
                type: "other",
                message: "xAI Responses API does not support this content type in user messages",
              });
          }
        l.push({ role: "user", content: c });
        break;
      }
      case "assistant": {
        for (const c of s.content)
          switch (c.type) {
            case "text": {
              const y =
                typeof ((m = (h = c.providerOptions) == null ? void 0 : h.xai) == null
                  ? void 0
                  : m.itemId) == "string"
                  ? c.providerOptions.xai.itemId
                  : void 0;
              l.push({ role: "assistant", content: c.text, id: y });
              break;
            }
            case "tool-call": {
              if (c.providerExecuted) break;
              const y =
                typeof ((u = (p = c.providerOptions) == null ? void 0 : p.xai) == null
                  ? void 0
                  : u.itemId) == "string"
                  ? c.providerOptions.xai.itemId
                  : void 0;
              l.push({
                type: "function_call",
                id: y ?? c.toolCallId,
                call_id: c.toolCallId,
                name: c.toolName,
                arguments: JSON.stringify(c.input),
                status: "completed",
              });
              break;
            }
            case "tool-result":
              break;
            case "reasoning":
            case "file": {
              i.push({
                type: "other",
                message: `xAI Responses API does not support ${c.type} in assistant messages`,
              });
              break;
            }
            default:
              i.push({
                type: "other",
                message:
                  "xAI Responses API does not support this content type in assistant messages",
              });
          }
        break;
      }
      case "tool": {
        for (const c of s.content) {
          if (c.type === "tool-approval-response") continue;
          const y = c.output;
          let g;
          switch (y.type) {
            case "text":
            case "error-text":
              g = y.value;
              break;
            case "execution-denied":
              g = (d = y.reason) != null ? d : "tool execution denied";
              break;
            case "json":
            case "error-json":
              g = JSON.stringify(y.value);
              break;
            case "content":
              g = y.value.map((N) => (N.type === "text" ? N.text : "")).join("");
              break;
            default:
              g = "";
          }
          l.push({ type: "function_call_output", call_id: c.toolCallId, output: g });
        }
        break;
      }
      default:
        i.push({ type: "other", message: "unsupported message role" });
    }
  return { input: l, inputWarnings: i };
}
function me(o) {
  var h, m, p, u;
  const d = (m = (h = o.input_tokens_details) == null ? void 0 : h.cached_tokens) != null ? m : 0,
    l = (u = (p = o.output_tokens_details) == null ? void 0 : p.reasoning_tokens) != null ? u : 0;
  return {
    inputTokens: {
      total: o.input_tokens,
      noCache: o.input_tokens - d,
      cacheRead: d,
      cacheWrite: void 0,
    },
    outputTokens: { total: o.output_tokens, text: o.output_tokens - l, reasoning: l },
    raw: o,
  };
}
function he(o) {
  switch (o) {
    case "stop":
    case "completed":
      return "stop";
    case "length":
      return "length";
    case "tool_calls":
    case "function_call":
      return "tool-calls";
    case "content_filter":
      return "content-filter";
    default:
      return "other";
  }
}
var oe = re([t({ type: r("url_citation"), url: e(), title: e().optional() }), t({ type: e() })]),
  ae = t({
    type: e(),
    text: e().optional(),
    logprobs: b(F()).optional(),
    annotations: b(oe).optional(),
  }),
  se = t({ type: e(), text: e() }),
  D = t({
    name: e().optional(),
    arguments: e().optional(),
    input: e().optional(),
    call_id: e().optional(),
    id: e(),
    status: e(),
    action: F().optional(),
  }),
  Je = t({
    name: e().optional(),
    arguments: e().optional(),
    output: e().optional(),
    error: e().optional(),
    id: e(),
    status: e(),
    server_label: e().optional(),
  }),
  ie = ve("type", [
    t({ type: r("web_search_call"), ...D.shape }),
    t({ type: r("x_search_call"), ...D.shape }),
    t({ type: r("code_interpreter_call"), ...D.shape }),
    t({ type: r("code_execution_call"), ...D.shape }),
    t({ type: r("view_image_call"), ...D.shape }),
    t({ type: r("view_x_video_call"), ...D.shape }),
    t({
      type: r("file_search_call"),
      id: e(),
      status: e(),
      queries: b(e()).optional(),
      results: b(t({ file_id: e(), filename: e(), score: a(), text: e() })).nullish(),
    }),
    t({ type: r("custom_tool_call"), ...D.shape }),
    t({ type: r("mcp_call"), ...Je.shape }),
    t({ type: r("message"), role: e(), content: b(ae), id: e(), status: e() }),
    t({ type: r("function_call"), name: e(), arguments: e(), call_id: e(), id: e() }),
    t({
      type: r("reasoning"),
      id: e(),
      summary: b(se),
      status: e(),
      encrypted_content: e().nullish(),
    }),
  ]),
  ze = t({
    input_tokens: a(),
    output_tokens: a(),
    total_tokens: a().optional(),
    input_tokens_details: t({ cached_tokens: a().optional() }).optional(),
    output_tokens_details: t({ reasoning_tokens: a().optional() }).optional(),
    num_sources_used: a().optional(),
    num_server_side_tools_used: a().optional(),
  }),
  z = t({
    id: e().nullish(),
    created_at: a().nullish(),
    model: e().nullish(),
    object: r("response"),
    output: b(ie),
    usage: ze.nullish(),
    status: e(),
  }),
  Fe = re([
    t({ type: r("response.created"), response: z.partial({ usage: !0, status: !0 }) }),
    t({ type: r("response.in_progress"), response: z.partial({ usage: !0, status: !0 }) }),
    t({ type: r("response.output_item.added"), item: ie, output_index: a() }),
    t({ type: r("response.output_item.done"), item: ie, output_index: a() }),
    t({
      type: r("response.content_part.added"),
      item_id: e(),
      output_index: a(),
      content_index: a(),
      part: ae,
    }),
    t({
      type: r("response.content_part.done"),
      item_id: e(),
      output_index: a(),
      content_index: a(),
      part: ae,
    }),
    t({
      type: r("response.output_text.delta"),
      item_id: e(),
      output_index: a(),
      content_index: a(),
      delta: e(),
      logprobs: b(F()).optional(),
    }),
    t({
      type: r("response.output_text.done"),
      item_id: e(),
      output_index: a(),
      content_index: a(),
      text: e(),
      logprobs: b(F()).optional(),
      annotations: b(oe).optional(),
    }),
    t({
      type: r("response.output_text.annotation.added"),
      item_id: e(),
      output_index: a(),
      content_index: a(),
      annotation_index: a(),
      annotation: oe,
    }),
    t({
      type: r("response.reasoning_summary_part.added"),
      item_id: e(),
      output_index: a(),
      summary_index: a(),
      part: se,
    }),
    t({
      type: r("response.reasoning_summary_part.done"),
      item_id: e(),
      output_index: a(),
      summary_index: a(),
      part: se,
    }),
    t({
      type: r("response.reasoning_summary_text.delta"),
      item_id: e(),
      output_index: a(),
      summary_index: a(),
      delta: e(),
    }),
    t({
      type: r("response.reasoning_summary_text.done"),
      item_id: e(),
      output_index: a(),
      summary_index: a(),
      text: e(),
    }),
    t({ type: r("response.web_search_call.in_progress"), item_id: e(), output_index: a() }),
    t({ type: r("response.web_search_call.searching"), item_id: e(), output_index: a() }),
    t({ type: r("response.web_search_call.completed"), item_id: e(), output_index: a() }),
    t({ type: r("response.x_search_call.in_progress"), item_id: e(), output_index: a() }),
    t({ type: r("response.x_search_call.searching"), item_id: e(), output_index: a() }),
    t({ type: r("response.x_search_call.completed"), item_id: e(), output_index: a() }),
    t({ type: r("response.file_search_call.in_progress"), item_id: e(), output_index: a() }),
    t({ type: r("response.file_search_call.searching"), item_id: e(), output_index: a() }),
    t({ type: r("response.file_search_call.completed"), item_id: e(), output_index: a() }),
    t({ type: r("response.code_execution_call.in_progress"), item_id: e(), output_index: a() }),
    t({ type: r("response.code_execution_call.executing"), item_id: e(), output_index: a() }),
    t({ type: r("response.code_execution_call.completed"), item_id: e(), output_index: a() }),
    t({ type: r("response.code_interpreter_call.in_progress"), item_id: e(), output_index: a() }),
    t({ type: r("response.code_interpreter_call.executing"), item_id: e(), output_index: a() }),
    t({ type: r("response.code_interpreter_call.interpreting"), item_id: e(), output_index: a() }),
    t({ type: r("response.code_interpreter_call.completed"), item_id: e(), output_index: a() }),
    t({
      type: r("response.code_interpreter_call_code.delta"),
      item_id: e(),
      output_index: a(),
      delta: e(),
    }),
    t({
      type: r("response.code_interpreter_call_code.done"),
      item_id: e(),
      output_index: a(),
      code: e(),
    }),
    t({
      type: r("response.custom_tool_call_input.delta"),
      item_id: e(),
      output_index: a(),
      delta: e(),
    }),
    t({
      type: r("response.custom_tool_call_input.done"),
      item_id: e(),
      output_index: a(),
      input: e(),
    }),
    t({ type: r("response.mcp_call.in_progress"), item_id: e(), output_index: a() }),
    t({ type: r("response.mcp_call.executing"), item_id: e(), output_index: a() }),
    t({ type: r("response.mcp_call.completed"), item_id: e(), output_index: a() }),
    t({ type: r("response.mcp_call.failed"), item_id: e(), output_index: a() }),
    t({
      type: r("response.mcp_call_arguments.delta"),
      item_id: e(),
      output_index: a(),
      delta: e(),
    }),
    t({
      type: r("response.mcp_call_arguments.done"),
      item_id: e(),
      output_index: a(),
      arguments: e().optional(),
    }),
    t({ type: r("response.mcp_call_output.delta"), item_id: e(), output_index: a(), delta: e() }),
    t({
      type: r("response.mcp_call_output.done"),
      item_id: e(),
      output_index: a(),
      output: e().optional(),
    }),
    t({ type: r("response.done"), response: z }),
    t({ type: r("response.completed"), response: z }),
  ]),
  Ke = t({
    reasoningEffort: K(["low", "medium", "high"]).optional(),
    store: W().optional(),
    previousResponseId: e().optional(),
    include: b(K(["file_search_call.results"])).nullish(),
  }),
  Ge = M(() => O(t({ vectorStoreIds: b(e()), maxNumResults: a().optional() }))),
  Ye = M(() =>
    O(
      t({
        queries: b(e()),
        results: b(
          t({ fileId: e(), filename: e(), score: a().min(0).max(1), text: e() })
        ).nullable(),
      })
    )
  ),
  Qe = L({ id: "xai.file_search", inputSchema: M(() => O(t({}))), outputSchema: Ye }),
  Ze = (o) => Qe(o),
  et = M(() =>
    O(
      t({
        serverUrl: e().describe("The URL of the MCP server"),
        serverLabel: e().optional().describe("A label for the MCP server"),
        serverDescription: e().optional().describe("Description of the MCP server"),
        allowedTools: b(e()).optional().describe("List of allowed tool names"),
        headers: Ae(e(), e()).optional().describe("Custom headers to send"),
        authorization: e().optional().describe("Authorization header value"),
      })
    )
  ),
  tt = M(() => O(t({ name: e(), arguments: e(), result: Ee() }))),
  nt = L({ id: "xai.mcp", inputSchema: M(() => O(t({}))), outputSchema: tt }),
  ot = (o) => nt(o),
  at = M(() =>
    O(
      t({
        allowedDomains: b(e()).max(5).optional(),
        excludedDomains: b(e()).max(5).optional(),
        enableImageUnderstanding: W().optional(),
      })
    )
  ),
  st = M(() => O(t({ query: e(), sources: b(t({ title: e(), url: e(), snippet: e() })) }))),
  it = L({ id: "xai.web_search", inputSchema: M(() => O(t({}))), outputSchema: st }),
  rt = (o = {}) => it(o),
  lt = M(() =>
    O(
      t({
        allowedXHandles: b(e()).max(10).optional(),
        excludedXHandles: b(e()).max(10).optional(),
        fromDate: e().optional(),
        toDate: e().optional(),
        enableImageUnderstanding: W().optional(),
        enableVideoUnderstanding: W().optional(),
      })
    )
  ),
  ut = M(() => O(t({ query: e(), posts: b(t({ author: e(), text: e(), url: e(), likes: a() })) }))),
  ct = L({ id: "xai.x_search", inputSchema: M(() => O(t({}))), outputSchema: ut }),
  pt = (o = {}) => ct(o);
async function dt({ tools: o, toolChoice: h }) {
  const m = o?.length ? o : void 0,
    p = [];
  if (m == null) return { tools: void 0, toolChoice: void 0, toolWarnings: p };
  const u = [],
    d = new Map();
  for (const i of m)
    if ((d.set(i.name, i), i.type === "provider"))
      switch (i.id) {
        case "xai.web_search": {
          const s = await G({ value: i.args, schema: at });
          u.push({
            type: "web_search",
            allowed_domains: s.allowedDomains,
            excluded_domains: s.excludedDomains,
            enable_image_understanding: s.enableImageUnderstanding,
          });
          break;
        }
        case "xai.x_search": {
          const s = await G({ value: i.args, schema: lt });
          u.push({
            type: "x_search",
            allowed_x_handles: s.allowedXHandles,
            excluded_x_handles: s.excludedXHandles,
            from_date: s.fromDate,
            to_date: s.toDate,
            enable_image_understanding: s.enableImageUnderstanding,
            enable_video_understanding: s.enableVideoUnderstanding,
          });
          break;
        }
        case "xai.code_execution": {
          u.push({ type: "code_interpreter" });
          break;
        }
        case "xai.view_image": {
          u.push({ type: "view_image" });
          break;
        }
        case "xai.view_x_video": {
          u.push({ type: "view_x_video" });
          break;
        }
        case "xai.file_search": {
          const s = await G({ value: i.args, schema: Ge });
          u.push({
            type: "file_search",
            vector_store_ids: s.vectorStoreIds,
            max_num_results: s.maxNumResults,
          });
          break;
        }
        case "xai.mcp": {
          const s = await G({ value: i.args, schema: et });
          u.push({
            type: "mcp",
            server_url: s.serverUrl,
            server_label: s.serverLabel,
            server_description: s.serverDescription,
            allowed_tools: s.allowedTools,
            headers: s.headers,
            authorization: s.authorization,
          });
          break;
        }
        default: {
          p.push({ type: "unsupported", feature: `provider-defined tool ${i.name}` });
          break;
        }
      }
    else
      u.push({
        type: "function",
        name: i.name,
        description: i.description,
        parameters: i.inputSchema,
      });
  if (h == null) return { tools: u, toolChoice: void 0, toolWarnings: p };
  const l = h.type;
  switch (l) {
    case "auto":
    case "none":
      return { tools: u, toolChoice: l, toolWarnings: p };
    case "required":
      return { tools: u, toolChoice: "required", toolWarnings: p };
    case "tool": {
      const i = d.get(h.toolName);
      return i == null
        ? { tools: u, toolChoice: void 0, toolWarnings: p }
        : i.type === "provider"
          ? (p.push({
              type: "unsupported",
              feature: `toolChoice for server-side tool "${i.name}"`,
            }),
            { tools: u, toolChoice: void 0, toolWarnings: p })
          : { tools: u, toolChoice: { type: "function", name: i.name }, toolWarnings: p };
    }
    default: {
      const i = l;
      throw new te({ functionality: `tool choice type: ${i}` });
    }
  }
}
var _t = class {
    constructor(o, h) {
      ((this.specificationVersion = "v3"),
        (this.supportedUrls = { "image/*": [/^https?:\/\/.*$/] }),
        (this.modelId = o),
        (this.config = h));
    }
    get provider() {
      return this.config.provider;
    }
    async getArgs({
      prompt: o,
      maxOutputTokens: h,
      temperature: m,
      topP: p,
      stopSequences: u,
      seed: d,
      responseFormat: l,
      providerOptions: i,
      tools: s,
      toolChoice: c,
    }) {
      var y, g, N, R, P, q, f;
      const v = [],
        S = (y = await fe({ provider: "xai", providerOptions: i, schema: Ke })) != null ? y : {};
      u != null && v.push({ type: "unsupported", feature: "stopSequences" });
      const k =
          (g = s?.find((H) => H.type === "provider" && H.id === "xai.web_search")) == null
            ? void 0
            : g.name,
        x =
          (N = s?.find((H) => H.type === "provider" && H.id === "xai.x_search")) == null
            ? void 0
            : N.name,
        C =
          (R = s?.find((H) => H.type === "provider" && H.id === "xai.code_execution")) == null
            ? void 0
            : R.name,
        E =
          (P = s?.find((H) => H.type === "provider" && H.id === "xai.mcp")) == null
            ? void 0
            : P.name,
        U =
          (q = s?.find((H) => H.type === "provider" && H.id === "xai.file_search")) == null
            ? void 0
            : q.name,
        { input: w, inputWarnings: V } = await Be({ prompt: o });
      v.push(...V);
      const { tools: X, toolChoice: _, toolWarnings: A } = await dt({ tools: s, toolChoice: c });
      v.push(...A);
      let I = S.include ? [...S.include] : void 0;
      S.store === !1 &&
        (I == null
          ? (I = ["reasoning.encrypted_content"])
          : (I = [...I, "reasoning.encrypted_content"]));
      const B = {
        model: this.modelId,
        input: w,
        max_output_tokens: h,
        temperature: m,
        top_p: p,
        seed: d,
        ...(l?.type === "json" && {
          text: {
            format:
              l.schema != null
                ? {
                    type: "json_schema",
                    strict: !0,
                    name: (f = l.name) != null ? f : "response",
                    description: l.description,
                    schema: l.schema,
                  }
                : { type: "json_object" },
          },
        }),
        ...(S.reasoningEffort != null && { reasoning: { effort: S.reasoningEffort } }),
        ...(S.store === !1 && { store: S.store }),
        ...(I != null && { include: I }),
        ...(S.previousResponseId != null && { previous_response_id: S.previousResponseId }),
      };
      return (
        X && X.length > 0 && (B.tools = X),
        _ != null && (B.tool_choice = _),
        {
          args: B,
          warnings: v,
          webSearchToolName: k,
          xSearchToolName: x,
          codeExecutionToolName: C,
          mcpToolName: E,
          fileSearchToolName: U,
        }
      );
    }
    async doGenerate(o) {
      var h, m, p, u, d, l, i, s, c, y, g, N, R;
      const {
          args: P,
          warnings: q,
          webSearchToolName: f,
          xSearchToolName: v,
          codeExecutionToolName: S,
          mcpToolName: k,
          fileSearchToolName: x,
        } = await this.getArgs(o),
        {
          responseHeaders: C,
          value: E,
          rawValue: U,
        } = await Y({
          url: `${(h = this.config.baseURL) != null ? h : "https://api.x.ai/v1"}/responses`,
          headers: Q(this.config.headers(), o.headers),
          body: P,
          failedResponseHandler: ee,
          successfulResponseHandler: ye(z),
          abortSignal: o.abortSignal,
          fetch: this.config.fetch,
        }),
        w = [],
        V = ["web_search", "web_search_with_snippets", "browse_page"],
        X = ["x_user_search", "x_keyword_search", "x_semantic_search", "x_thread_fetch"];
      for (const _ of E.output) {
        if (_.type === "file_search_call") {
          const A = x ?? "file_search";
          (w.push({
            type: "tool-call",
            toolCallId: _.id,
            toolName: A,
            input: "",
            providerExecuted: !0,
          }),
            w.push({
              type: "tool-result",
              toolCallId: _.id,
              toolName: A,
              result: {
                queries: (m = _.queries) != null ? m : [],
                results:
                  (u =
                    (p = _.results) == null
                      ? void 0
                      : p.map((I) => ({
                          fileId: I.file_id,
                          filename: I.filename,
                          score: I.score,
                          text: I.text,
                        }))) != null
                    ? u
                    : null,
              },
            }));
          continue;
        }
        if (
          _.type === "web_search_call" ||
          _.type === "x_search_call" ||
          _.type === "code_interpreter_call" ||
          _.type === "code_execution_call" ||
          _.type === "view_image_call" ||
          _.type === "view_x_video_call" ||
          _.type === "custom_tool_call" ||
          _.type === "mcp_call"
        ) {
          let A = (d = _.name) != null ? d : "";
          V.includes((l = _.name) != null ? l : "") || _.type === "web_search_call"
            ? (A = f ?? "web_search")
            : X.includes((i = _.name) != null ? i : "") || _.type === "x_search_call"
              ? (A = v ?? "x_search")
              : _.name === "code_execution" ||
                  _.type === "code_interpreter_call" ||
                  _.type === "code_execution_call"
                ? (A = S ?? "code_execution")
                : _.type === "mcp_call" && (A = (s = k ?? _.name) != null ? s : "mcp");
          const I =
            _.type === "custom_tool_call"
              ? (c = _.input) != null
                ? c
                : ""
              : _.type === "mcp_call"
                ? (y = _.arguments) != null
                  ? y
                  : ""
                : (g = _.arguments) != null
                  ? g
                  : "";
          w.push({
            type: "tool-call",
            toolCallId: _.id,
            toolName: A,
            input: I,
            providerExecuted: !0,
          });
          continue;
        }
        switch (_.type) {
          case "message": {
            for (const A of _.content)
              if ((A.text && w.push({ type: "text", text: A.text }), A.annotations))
                for (const I of A.annotations)
                  I.type === "url_citation" &&
                    "url" in I &&
                    w.push({
                      type: "source",
                      sourceType: "url",
                      id: this.config.generateId(),
                      url: I.url,
                      title: (N = I.title) != null ? N : I.url,
                    });
            break;
          }
          case "function_call": {
            w.push({
              type: "tool-call",
              toolCallId: _.call_id,
              toolName: _.name,
              input: _.arguments,
            });
            break;
          }
          case "reasoning": {
            const A = _.summary.map((I) => I.text).filter((I) => I && I.length > 0);
            if (A.length > 0) {
              const I = A.join("");
              _.encrypted_content || _.id
                ? w.push({
                    type: "reasoning",
                    text: I,
                    providerMetadata: {
                      xai: {
                        ...(_.encrypted_content && {
                          reasoningEncryptedContent: _.encrypted_content,
                        }),
                        ...(_.id && { itemId: _.id }),
                      },
                    },
                  })
                : w.push({ type: "reasoning", text: I });
            }
            break;
          }
        }
      }
      return {
        content: w,
        finishReason: { unified: he(E.status), raw: (R = E.status) != null ? R : void 0 },
        usage: E.usage
          ? me(E.usage)
          : {
              inputTokens: { total: 0, noCache: 0, cacheRead: 0, cacheWrite: 0 },
              outputTokens: { total: 0, text: 0, reasoning: 0 },
            },
        request: { body: P },
        response: { ...Z(E), headers: C, body: U },
        warnings: q,
      };
    }
    async doStream(o) {
      var h;
      const {
          args: m,
          warnings: p,
          webSearchToolName: u,
          xSearchToolName: d,
          codeExecutionToolName: l,
          mcpToolName: i,
          fileSearchToolName: s,
        } = await this.getArgs(o),
        c = { ...m, stream: !0 },
        { responseHeaders: y, value: g } = await Y({
          url: `${(h = this.config.baseURL) != null ? h : "https://api.x.ai/v1"}/responses`,
          headers: Q(this.config.headers(), o.headers),
          body: c,
          failedResponseHandler: ee,
          successfulResponseHandler: ge(Fe),
          abortSignal: o.abortSignal,
          fetch: this.config.fetch,
        });
      let N = { unified: "other", raw: void 0 },
        R,
        P = !0;
      const q = {},
        f = new Set(),
        v = {},
        S = this;
      return {
        stream: g.pipeThrough(
          new TransformStream({
            start(k) {
              k.enqueue({ type: "stream-start", warnings: p });
            },
            transform(k, x) {
              var C, E, U, w, V, X, _, A, I, B, H, le, ue;
              if (
                (o.includeRawChunks && x.enqueue({ type: "raw", rawValue: k.rawValue }), !k.success)
              ) {
                x.enqueue({ type: "error", error: k.error });
                return;
              }
              const T = k.value;
              if (T.type === "response.created" || T.type === "response.in_progress") {
                P && (x.enqueue({ type: "response-metadata", ...Z(T.response) }), (P = !1));
                return;
              }
              if (T.type === "response.reasoning_summary_part.added") {
                const n = `reasoning-${T.item_id}`;
                ((v[T.item_id] = {}),
                  x.enqueue({
                    type: "reasoning-start",
                    id: n,
                    providerMetadata: { xai: { itemId: T.item_id } },
                  }));
              }
              if (T.type === "response.reasoning_summary_text.delta") {
                const n = `reasoning-${T.item_id}`;
                x.enqueue({
                  type: "reasoning-delta",
                  id: n,
                  delta: T.delta,
                  providerMetadata: { xai: { itemId: T.item_id } },
                });
                return;
              }
              if (T.type !== "response.reasoning_summary_text.done") {
                if (T.type === "response.output_text.delta") {
                  const n = `text-${T.item_id}`;
                  (q[n] == null &&
                    ((q[n] = { type: "text" }), x.enqueue({ type: "text-start", id: n })),
                    x.enqueue({ type: "text-delta", id: n, delta: T.delta }));
                  return;
                }
                if (T.type === "response.output_text.done") {
                  if (T.annotations)
                    for (const n of T.annotations)
                      n.type === "url_citation" &&
                        "url" in n &&
                        x.enqueue({
                          type: "source",
                          sourceType: "url",
                          id: S.config.generateId(),
                          url: n.url,
                          title: (C = n.title) != null ? C : n.url,
                        });
                  return;
                }
                if (T.type === "response.output_text.annotation.added") {
                  const n = T.annotation;
                  n.type === "url_citation" &&
                    "url" in n &&
                    x.enqueue({
                      type: "source",
                      sourceType: "url",
                      id: S.config.generateId(),
                      url: n.url,
                      title: (E = n.title) != null ? E : n.url,
                    });
                  return;
                }
                if (T.type === "response.done" || T.type === "response.completed") {
                  const n = T.response;
                  (n.usage && (R = me(n.usage)),
                    n.status && (N = { unified: he(n.status), raw: n.status }));
                  return;
                }
                if (
                  !(
                    T.type === "response.custom_tool_call_input.delta" ||
                    T.type === "response.custom_tool_call_input.done"
                  ) &&
                  (T.type === "response.output_item.added" ||
                    T.type === "response.output_item.done")
                ) {
                  const n = T.item;
                  if (n.type === "reasoning") {
                    if (T.type === "response.output_item.done") {
                      const j = `reasoning-${n.id}`;
                      (n.id in v ||
                        ((v[n.id] = {}),
                        x.enqueue({
                          type: "reasoning-start",
                          id: j,
                          providerMetadata: { xai: { ...(n.id && { itemId: n.id }) } },
                        })),
                        x.enqueue({
                          type: "reasoning-end",
                          id: j,
                          providerMetadata: {
                            xai: {
                              ...(n.encrypted_content && {
                                reasoningEncryptedContent: n.encrypted_content,
                              }),
                              ...(n.id && { itemId: n.id }),
                            },
                          },
                        }),
                        delete v[n.id]);
                    }
                    return;
                  }
                  if (n.type === "file_search_call") {
                    const j = s ?? "file_search";
                    (f.has(n.id) ||
                      (f.add(n.id),
                      x.enqueue({ type: "tool-input-start", id: n.id, toolName: j }),
                      x.enqueue({ type: "tool-input-delta", id: n.id, delta: "" }),
                      x.enqueue({ type: "tool-input-end", id: n.id }),
                      x.enqueue({
                        type: "tool-call",
                        toolCallId: n.id,
                        toolName: j,
                        input: "",
                        providerExecuted: !0,
                      })),
                      T.type === "response.output_item.done" &&
                        x.enqueue({
                          type: "tool-result",
                          toolCallId: n.id,
                          toolName: j,
                          result: {
                            queries: (U = n.queries) != null ? U : [],
                            results:
                              (V =
                                (w = n.results) == null
                                  ? void 0
                                  : w.map(($) => ({
                                      fileId: $.file_id,
                                      filename: $.filename,
                                      score: $.score,
                                      text: $.text,
                                    }))) != null
                                ? V
                                : null,
                          },
                        }));
                    return;
                  }
                  if (
                    n.type === "web_search_call" ||
                    n.type === "x_search_call" ||
                    n.type === "code_interpreter_call" ||
                    n.type === "code_execution_call" ||
                    n.type === "view_image_call" ||
                    n.type === "view_x_video_call" ||
                    n.type === "custom_tool_call" ||
                    n.type === "mcp_call"
                  ) {
                    const j = ["web_search", "web_search_with_snippets", "browse_page"],
                      $ = [
                        "x_user_search",
                        "x_keyword_search",
                        "x_semantic_search",
                        "x_thread_fetch",
                      ];
                    let J = (X = n.name) != null ? X : "";
                    j.includes((_ = n.name) != null ? _ : "") || n.type === "web_search_call"
                      ? (J = u ?? "web_search")
                      : $.includes((A = n.name) != null ? A : "") || n.type === "x_search_call"
                        ? (J = d ?? "x_search")
                        : n.name === "code_execution" ||
                            n.type === "code_interpreter_call" ||
                            n.type === "code_execution_call"
                          ? (J = l ?? "code_execution")
                          : n.type === "mcp_call" && (J = (I = i ?? n.name) != null ? I : "mcp");
                    const ce =
                      n.type === "custom_tool_call"
                        ? (B = n.input) != null
                          ? B
                          : ""
                        : n.type === "mcp_call"
                          ? (H = n.arguments) != null
                            ? H
                            : ""
                          : (le = n.arguments) != null
                            ? le
                            : "";
                    (n.type === "custom_tool_call"
                      ? T.type === "response.output_item.done"
                      : !f.has(n.id)) &&
                      !f.has(n.id) &&
                      (f.add(n.id),
                      x.enqueue({ type: "tool-input-start", id: n.id, toolName: J }),
                      x.enqueue({ type: "tool-input-delta", id: n.id, delta: ce }),
                      x.enqueue({ type: "tool-input-end", id: n.id }),
                      x.enqueue({
                        type: "tool-call",
                        toolCallId: n.id,
                        toolName: J,
                        input: ce,
                        providerExecuted: !0,
                      }));
                    return;
                  }
                  if (n.type === "message")
                    for (const j of n.content) {
                      if (j.text && j.text.length > 0) {
                        const $ = `text-${n.id}`;
                        q[$] == null &&
                          ((q[$] = { type: "text" }),
                          x.enqueue({ type: "text-start", id: $ }),
                          x.enqueue({ type: "text-delta", id: $, delta: j.text }));
                      }
                      if (j.annotations)
                        for (const $ of j.annotations)
                          $.type === "url_citation" &&
                            "url" in $ &&
                            x.enqueue({
                              type: "source",
                              sourceType: "url",
                              id: S.config.generateId(),
                              url: $.url,
                              title: (ue = $.title) != null ? ue : $.url,
                            });
                    }
                  else
                    n.type === "function_call" &&
                      (f.has(n.call_id) ||
                        (f.add(n.call_id),
                        x.enqueue({ type: "tool-input-start", id: n.call_id, toolName: n.name }),
                        x.enqueue({ type: "tool-input-delta", id: n.call_id, delta: n.arguments }),
                        x.enqueue({ type: "tool-input-end", id: n.call_id }),
                        x.enqueue({
                          type: "tool-call",
                          toolCallId: n.call_id,
                          toolName: n.name,
                          input: n.arguments,
                        })));
                }
              }
            },
            flush(k) {
              for (const [x, C] of Object.entries(q))
                C.type === "text" && k.enqueue({ type: "text-end", id: x });
              k.enqueue({ type: "finish", finishReason: N, usage: R });
            },
          })
        ),
        request: { body: c },
        response: { headers: y },
      };
    }
  },
  mt = t({
    output: e().describe("the output of the code execution"),
    error: e().optional().describe("any error that occurred"),
  }),
  ht = L({
    id: "xai.code_execution",
    inputSchema: t({}).describe("no input parameters"),
    outputSchema: mt,
  }),
  ft = (o = {}) => ht(o),
  yt = t({
    description: e().describe("description of the image"),
    objects: b(e()).optional().describe("objects detected in the image"),
  }),
  gt = L({
    id: "xai.view_image",
    inputSchema: t({}).describe("no input parameters"),
    outputSchema: yt,
  }),
  xt = (o = {}) => gt(o),
  vt = t({
    transcript: e().optional().describe("transcript of the video"),
    description: e().describe("description of the video content"),
    duration: a().optional().describe("duration in seconds"),
  }),
  bt = L({
    id: "xai.view_x_video",
    inputSchema: t({}).describe("no input parameters"),
    outputSchema: vt,
  }),
  wt = (o = {}) => bt(o),
  St = {
    codeExecution: ft,
    fileSearch: Ze,
    mcpServer: ot,
    viewImage: xt,
    viewXVideo: wt,
    webSearch: rt,
    xSearch: pt,
  },
  kt = "3.0.47",
  Tt = { errorSchema: be, errorToMessage: (o) => o.error.message };
function It(o = {}) {
  var h;
  const m = ke((h = o.baseURL) != null ? h : "https://api.x.ai/v1"),
    p = () =>
      Ie(
        {
          Authorization: `Bearer ${Re({ apiKey: o.apiKey, environmentVariableName: "XAI_API_KEY", description: "xAI API key" })}`,
          ...o.headers,
        },
        `ai-sdk/xai/${kt}`
      ),
    u = (s) =>
      new Xe(s, { provider: "xai.chat", baseURL: m, headers: p, generateId: pe, fetch: o.fetch }),
    d = (s) =>
      new _t(s, {
        provider: "xai.responses",
        baseURL: m,
        headers: p,
        generateId: pe,
        fetch: o.fetch,
      }),
    l = (s) =>
      new Se(s, {
        provider: "xai.image",
        url: ({ path: c }) => `${m}${c}`,
        headers: p,
        fetch: o.fetch,
        errorStructure: Tt,
      }),
    i = (s) => u(s);
  return (
    (i.specificationVersion = "v3"),
    (i.languageModel = u),
    (i.chat = u),
    (i.responses = d),
    (i.embeddingModel = (s) => {
      throw new Te({ modelId: s, modelType: "embeddingModel" });
    }),
    (i.textEmbeddingModel = i.embeddingModel),
    (i.imageModel = l),
    (i.image = l),
    (i.tools = St),
    i
  );
}
var Ht = It();
export {
  kt as VERSION,
  ft as codeExecution,
  It as createXai,
  ot as mcpServer,
  xt as viewImage,
  wt as viewXVideo,
  rt as webSearch,
  pt as xSearch,
  Ht as xai,
  St as xaiTools,
};
