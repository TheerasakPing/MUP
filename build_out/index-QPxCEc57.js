import {
  w as Je,
  l as He,
  I as Le,
  N as we,
  c as ie,
  g as Ae,
  a as _e,
  b as E,
  p as he,
  d as Pe,
  e as Ke,
  r as Ce,
  f as Te,
  h as Ve,
  i as ze,
  A as Fe,
  j as We,
  k as Ge,
  z as A,
  v as ce,
  m as Xe,
  n as Ne,
  U as me,
  o as Ye,
} from "./index-CGwOAdyT.js";
import {
  o as t,
  a as C,
  s as e,
  n as l,
  _ as le,
  d as V,
  t as de,
  l as o,
  b as W,
  u as J,
  c as xe,
  e as pe,
  r as ve,
} from "./main-B2XpWmPF.js";
import "./types-CUi3gq4E.js";
import "./TerminalRouterContext-CeKE7fio.js";
var Ze = "3.0.37",
  Qe = E(() => A(t({ type: o("error"), error: t({ type: e(), message: e() }) }))),
  Se = Ye({ errorSchema: Qe, errorToMessage: (n) => n.error.message }),
  et = E(() =>
    A(
      t({
        type: o("message"),
        id: e().nullish(),
        model: e().nullish(),
        content: C(
          V("type", [
            t({
              type: o("text"),
              text: e(),
              citations: C(
                V("type", [
                  t({
                    type: o("web_search_result_location"),
                    cited_text: e(),
                    url: e(),
                    title: e(),
                    encrypted_index: e(),
                  }),
                  t({
                    type: o("page_location"),
                    cited_text: e(),
                    document_index: l(),
                    document_title: e().nullable(),
                    start_page_number: l(),
                    end_page_number: l(),
                  }),
                  t({
                    type: o("char_location"),
                    cited_text: e(),
                    document_index: l(),
                    document_title: e().nullable(),
                    start_char_index: l(),
                    end_char_index: l(),
                  }),
                ])
              ).optional(),
            }),
            t({ type: o("thinking"), thinking: e(), signature: e() }),
            t({ type: o("redacted_thinking"), data: e() }),
            t({
              type: o("tool_use"),
              id: e(),
              name: e(),
              input: pe(),
              caller: J([
                t({ type: o("code_execution_20250825"), tool_id: e() }),
                t({ type: o("direct") }),
              ]).optional(),
            }),
            t({ type: o("server_tool_use"), id: e(), name: e(), input: ve(e(), pe()).nullish() }),
            t({ type: o("mcp_tool_use"), id: e(), name: e(), input: pe(), server_name: e() }),
            t({
              type: o("mcp_tool_result"),
              tool_use_id: e(),
              is_error: W(),
              content: C(J([e(), t({ type: o("text"), text: e() })])),
            }),
            t({
              type: o("web_fetch_tool_result"),
              tool_use_id: e(),
              content: J([
                t({
                  type: o("web_fetch_result"),
                  url: e(),
                  retrieved_at: e(),
                  content: t({
                    type: o("document"),
                    title: e().nullable(),
                    citations: t({ enabled: W() }).optional(),
                    source: J([
                      t({ type: o("base64"), media_type: o("application/pdf"), data: e() }),
                      t({ type: o("text"), media_type: o("text/plain"), data: e() }),
                    ]),
                  }),
                }),
                t({ type: o("web_fetch_tool_result_error"), error_code: e() }),
              ]),
            }),
            t({
              type: o("web_search_tool_result"),
              tool_use_id: e(),
              content: J([
                C(
                  t({
                    type: o("web_search_result"),
                    url: e(),
                    title: e(),
                    encrypted_content: e(),
                    page_age: e().nullish(),
                  })
                ),
                t({ type: o("web_search_tool_result_error"), error_code: e() }),
              ]),
            }),
            t({
              type: o("code_execution_tool_result"),
              tool_use_id: e(),
              content: J([
                t({
                  type: o("code_execution_result"),
                  stdout: e(),
                  stderr: e(),
                  return_code: l(),
                  content: C(t({ type: o("code_execution_output"), file_id: e() }))
                    .optional()
                    .default([]),
                }),
                t({ type: o("code_execution_tool_result_error"), error_code: e() }),
              ]),
            }),
            t({
              type: o("bash_code_execution_tool_result"),
              tool_use_id: e(),
              content: V("type", [
                t({
                  type: o("bash_code_execution_result"),
                  content: C(t({ type: o("bash_code_execution_output"), file_id: e() })),
                  stdout: e(),
                  stderr: e(),
                  return_code: l(),
                }),
                t({ type: o("bash_code_execution_tool_result_error"), error_code: e() }),
              ]),
            }),
            t({
              type: o("text_editor_code_execution_tool_result"),
              tool_use_id: e(),
              content: V("type", [
                t({ type: o("text_editor_code_execution_tool_result_error"), error_code: e() }),
                t({
                  type: o("text_editor_code_execution_view_result"),
                  content: e(),
                  file_type: e(),
                  num_lines: l().nullable(),
                  start_line: l().nullable(),
                  total_lines: l().nullable(),
                }),
                t({ type: o("text_editor_code_execution_create_result"), is_file_update: W() }),
                t({
                  type: o("text_editor_code_execution_str_replace_result"),
                  lines: C(e()).nullable(),
                  new_lines: l().nullable(),
                  new_start: l().nullable(),
                  old_lines: l().nullable(),
                  old_start: l().nullable(),
                }),
              ]),
            }),
            t({
              type: o("tool_search_tool_result"),
              tool_use_id: e(),
              content: J([
                t({
                  type: o("tool_search_tool_search_result"),
                  tool_references: C(t({ type: o("tool_reference"), tool_name: e() })),
                }),
                t({ type: o("tool_search_tool_result_error"), error_code: e() }),
              ]),
            }),
          ])
        ),
        stop_reason: e().nullish(),
        stop_sequence: e().nullish(),
        usage: xe({
          input_tokens: l(),
          output_tokens: l(),
          cache_creation_input_tokens: l().nullish(),
          cache_read_input_tokens: l().nullish(),
        }),
        container: t({
          expires_at: e(),
          id: e(),
          skills: C(
            t({ type: J([o("anthropic"), o("custom")]), skill_id: e(), version: e() })
          ).nullish(),
        }).nullish(),
        context_management: t({
          applied_edits: C(
            J([
              t({
                type: o("clear_tool_uses_20250919"),
                cleared_tool_uses: l(),
                cleared_input_tokens: l(),
              }),
              t({
                type: o("clear_thinking_20251015"),
                cleared_thinking_turns: l(),
                cleared_input_tokens: l(),
              }),
            ])
          ),
        }).nullish(),
      })
    )
  ),
  tt = E(() =>
    A(
      V("type", [
        t({
          type: o("message_start"),
          message: t({
            id: e().nullish(),
            model: e().nullish(),
            role: e().nullish(),
            usage: xe({
              input_tokens: l(),
              cache_creation_input_tokens: l().nullish(),
              cache_read_input_tokens: l().nullish(),
            }),
            content: C(
              V("type", [
                t({
                  type: o("tool_use"),
                  id: e(),
                  name: e(),
                  input: pe(),
                  caller: J([
                    t({ type: o("code_execution_20250825"), tool_id: e() }),
                    t({ type: o("direct") }),
                  ]).optional(),
                }),
              ])
            ).nullish(),
            stop_reason: e().nullish(),
            container: t({ expires_at: e(), id: e() }).nullish(),
          }),
        }),
        t({
          type: o("content_block_start"),
          index: l(),
          content_block: V("type", [
            t({ type: o("text"), text: e() }),
            t({ type: o("thinking"), thinking: e() }),
            t({
              type: o("tool_use"),
              id: e(),
              name: e(),
              input: ve(e(), pe()).optional(),
              caller: J([
                t({ type: o("code_execution_20250825"), tool_id: e() }),
                t({ type: o("direct") }),
              ]).optional(),
            }),
            t({ type: o("redacted_thinking"), data: e() }),
            t({ type: o("server_tool_use"), id: e(), name: e(), input: ve(e(), pe()).nullish() }),
            t({ type: o("mcp_tool_use"), id: e(), name: e(), input: pe(), server_name: e() }),
            t({
              type: o("mcp_tool_result"),
              tool_use_id: e(),
              is_error: W(),
              content: C(J([e(), t({ type: o("text"), text: e() })])),
            }),
            t({
              type: o("web_fetch_tool_result"),
              tool_use_id: e(),
              content: J([
                t({
                  type: o("web_fetch_result"),
                  url: e(),
                  retrieved_at: e(),
                  content: t({
                    type: o("document"),
                    title: e().nullable(),
                    citations: t({ enabled: W() }).optional(),
                    source: J([
                      t({ type: o("base64"), media_type: o("application/pdf"), data: e() }),
                      t({ type: o("text"), media_type: o("text/plain"), data: e() }),
                    ]),
                  }),
                }),
                t({ type: o("web_fetch_tool_result_error"), error_code: e() }),
              ]),
            }),
            t({
              type: o("web_search_tool_result"),
              tool_use_id: e(),
              content: J([
                C(
                  t({
                    type: o("web_search_result"),
                    url: e(),
                    title: e(),
                    encrypted_content: e(),
                    page_age: e().nullish(),
                  })
                ),
                t({ type: o("web_search_tool_result_error"), error_code: e() }),
              ]),
            }),
            t({
              type: o("code_execution_tool_result"),
              tool_use_id: e(),
              content: J([
                t({
                  type: o("code_execution_result"),
                  stdout: e(),
                  stderr: e(),
                  return_code: l(),
                  content: C(t({ type: o("code_execution_output"), file_id: e() }))
                    .optional()
                    .default([]),
                }),
                t({ type: o("code_execution_tool_result_error"), error_code: e() }),
              ]),
            }),
            t({
              type: o("bash_code_execution_tool_result"),
              tool_use_id: e(),
              content: V("type", [
                t({
                  type: o("bash_code_execution_result"),
                  content: C(t({ type: o("bash_code_execution_output"), file_id: e() })),
                  stdout: e(),
                  stderr: e(),
                  return_code: l(),
                }),
                t({ type: o("bash_code_execution_tool_result_error"), error_code: e() }),
              ]),
            }),
            t({
              type: o("text_editor_code_execution_tool_result"),
              tool_use_id: e(),
              content: V("type", [
                t({ type: o("text_editor_code_execution_tool_result_error"), error_code: e() }),
                t({
                  type: o("text_editor_code_execution_view_result"),
                  content: e(),
                  file_type: e(),
                  num_lines: l().nullable(),
                  start_line: l().nullable(),
                  total_lines: l().nullable(),
                }),
                t({ type: o("text_editor_code_execution_create_result"), is_file_update: W() }),
                t({
                  type: o("text_editor_code_execution_str_replace_result"),
                  lines: C(e()).nullable(),
                  new_lines: l().nullable(),
                  new_start: l().nullable(),
                  old_lines: l().nullable(),
                  old_start: l().nullable(),
                }),
              ]),
            }),
            t({
              type: o("tool_search_tool_result"),
              tool_use_id: e(),
              content: J([
                t({
                  type: o("tool_search_tool_search_result"),
                  tool_references: C(t({ type: o("tool_reference"), tool_name: e() })),
                }),
                t({ type: o("tool_search_tool_result_error"), error_code: e() }),
              ]),
            }),
          ]),
        }),
        t({
          type: o("content_block_delta"),
          index: l(),
          delta: V("type", [
            t({ type: o("input_json_delta"), partial_json: e() }),
            t({ type: o("text_delta"), text: e() }),
            t({ type: o("thinking_delta"), thinking: e() }),
            t({ type: o("signature_delta"), signature: e() }),
            t({
              type: o("citations_delta"),
              citation: V("type", [
                t({
                  type: o("web_search_result_location"),
                  cited_text: e(),
                  url: e(),
                  title: e(),
                  encrypted_index: e(),
                }),
                t({
                  type: o("page_location"),
                  cited_text: e(),
                  document_index: l(),
                  document_title: e().nullable(),
                  start_page_number: l(),
                  end_page_number: l(),
                }),
                t({
                  type: o("char_location"),
                  cited_text: e(),
                  document_index: l(),
                  document_title: e().nullable(),
                  start_char_index: l(),
                  end_char_index: l(),
                }),
              ]),
            }),
          ]),
        }),
        t({ type: o("content_block_stop"), index: l() }),
        t({ type: o("error"), error: t({ type: e(), message: e() }) }),
        t({
          type: o("message_delta"),
          delta: t({
            stop_reason: e().nullish(),
            stop_sequence: e().nullish(),
            container: t({
              expires_at: e(),
              id: e(),
              skills: C(
                t({ type: J([o("anthropic"), o("custom")]), skill_id: e(), version: e() })
              ).nullish(),
            }).nullish(),
          }),
          usage: xe({
            input_tokens: l().nullish(),
            output_tokens: l(),
            cache_creation_input_tokens: l().nullish(),
            cache_read_input_tokens: l().nullish(),
          }),
          context_management: t({
            applied_edits: C(
              J([
                t({
                  type: o("clear_tool_uses_20250919"),
                  cleared_tool_uses: l(),
                  cleared_input_tokens: l(),
                }),
                t({
                  type: o("clear_thinking_20251015"),
                  cleared_thinking_turns: l(),
                  cleared_input_tokens: l(),
                }),
              ])
            ),
          }).nullish(),
        }),
        t({ type: o("message_stop") }),
        t({ type: o("ping") }),
      ])
    )
  ),
  ot = E(() => A(t({ signature: e().optional(), redactedData: e().optional() }))),
  Ie = t({
    citations: t({ enabled: W() }).optional(),
    title: e().optional(),
    context: e().optional(),
  }),
  Oe = t({
    sendReasoning: W().optional(),
    structuredOutputMode: le(["outputFormat", "jsonTool", "auto"]).optional(),
    thinking: V("type", [
      t({ type: o("adaptive") }),
      t({ type: o("enabled"), budgetTokens: l().optional() }),
      t({ type: o("disabled") }),
    ]).optional(),
    disableParallelToolUse: W().optional(),
    cacheControl: t({ type: o("ephemeral"), ttl: J([o("5m"), o("1h")]).optional() }).optional(),
    mcpServers: C(
      t({
        type: o("url"),
        name: e(),
        url: e(),
        authorizationToken: e().nullish(),
        toolConfiguration: t({ enabled: W().nullish(), allowedTools: C(e()).nullish() }).nullish(),
      })
    ).optional(),
    container: t({
      id: e().optional(),
      skills: C(
        t({ type: J([o("anthropic"), o("custom")]), skillId: e(), version: e().optional() })
      ).optional(),
    }).optional(),
    toolStreaming: W().optional(),
    effort: le(["low", "medium", "high", "max"]).optional(),
    contextManagement: t({
      edits: C(
        V("type", [
          t({
            type: o("clear_tool_uses_20250919"),
            trigger: V("type", [
              t({ type: o("input_tokens"), value: l() }),
              t({ type: o("tool_uses"), value: l() }),
            ]).optional(),
            keep: t({ type: o("tool_uses"), value: l() }).optional(),
            clearAtLeast: t({ type: o("input_tokens"), value: l() }).optional(),
            clearToolInputs: W().optional(),
            excludeTools: C(e()).optional(),
          }),
          t({
            type: o("clear_thinking_20251015"),
            keep: J([o("all"), t({ type: o("thinking_turns"), value: l() })]).optional(),
          }),
        ])
      ),
    }).optional(),
  }),
  Me = 4;
function nt(n) {
  var c;
  const s = n?.anthropic;
  return (c = s?.cacheControl) != null ? c : s?.cache_control;
}
var be = class {
    constructor() {
      ((this.breakpointCount = 0), (this.warnings = []));
    }
    getCacheControl(n, c) {
      const s = nt(n);
      if (s) {
        if (!c.canCache) {
          this.warnings.push({
            type: "unsupported",
            feature: "cache_control on non-cacheable context",
            details: `cache_control cannot be set on ${c.type}. It will be ignored.`,
          });
          return;
        }
        if ((this.breakpointCount++, this.breakpointCount > Me)) {
          this.warnings.push({
            type: "unsupported",
            feature: "cacheControl breakpoint limit",
            details: `Maximum ${Me} cache breakpoints exceeded (found ${this.breakpointCount}). This breakpoint will be ignored.`,
          });
          return;
        }
        return s;
      }
    }
    getWarnings() {
      return this.warnings;
    }
  },
  at = E(() => A(t({ maxCharacters: l().optional() }))),
  rt = E(() =>
    A(
      t({
        command: le(["view", "create", "str_replace", "insert"]),
        path: e(),
        file_text: e().optional(),
        insert_line: l().int().optional(),
        new_str: e().optional(),
        insert_text: e().optional(),
        old_str: e().optional(),
        view_range: C(l().int()).optional(),
      })
    )
  ),
  lt = ie({ id: "anthropic.text_editor_20250728", inputSchema: rt }),
  st = (n = {}) => lt(n),
  it = E(() =>
    A(
      t({
        maxUses: l().optional(),
        allowedDomains: C(e()).optional(),
        blockedDomains: C(e()).optional(),
        userLocation: t({
          type: o("approximate"),
          city: e().optional(),
          region: e().optional(),
          country: e().optional(),
          timezone: e().optional(),
        }).optional(),
      })
    )
  ),
  je = E(() =>
    A(
      C(
        t({
          url: e(),
          title: e().nullable(),
          pageAge: e().nullable(),
          encryptedContent: e(),
          type: o("web_search_result"),
        })
      )
    )
  ),
  ut = E(() => A(t({ query: e() }))),
  ct = _e({
    id: "anthropic.web_search_20250305",
    inputSchema: ut,
    outputSchema: je,
    supportsDeferredResults: !0,
  }),
  pt = (n = {}) => ct(n),
  dt = E(() =>
    A(
      t({
        maxUses: l().optional(),
        allowedDomains: C(e()).optional(),
        blockedDomains: C(e()).optional(),
        citations: t({ enabled: W() }).optional(),
        maxContentTokens: l().optional(),
      })
    )
  ),
  $e = E(() =>
    A(
      t({
        type: o("web_fetch_result"),
        url: e(),
        content: t({
          type: o("document"),
          title: e().nullable(),
          citations: t({ enabled: W() }).optional(),
          source: J([
            t({ type: o("base64"), mediaType: o("application/pdf"), data: e() }),
            t({ type: o("text"), mediaType: o("text/plain"), data: e() }),
          ]),
        }),
        retrievedAt: e().nullable(),
      })
    )
  ),
  _t = E(() => A(t({ url: e() }))),
  ht = _e({
    id: "anthropic.web_fetch_20250910",
    inputSchema: _t,
    outputSchema: $e,
    supportsDeferredResults: !0,
  }),
  mt = (n = {}) => ht(n);
async function yt({
  tools: n,
  toolChoice: c,
  disableParallelToolUse: s,
  cacheControlValidator: m,
  supportsStructuredOutput: T,
}) {
  var j;
  n = n?.length ? n : void 0;
  const O = [],
    _ = new Set(),
    H = m || new be();
  if (n == null) return { tools: void 0, toolChoice: void 0, toolWarnings: O, betas: _ };
  const v = [];
  for (const p of n)
    switch (p.type) {
      case "function": {
        const U = H.getCacheControl(p.providerOptions, { type: "tool definition", canCache: !0 }),
          ee = (j = p.providerOptions) == null ? void 0 : j.anthropic,
          X = ee?.deferLoading,
          L = ee?.allowedCallers;
        (v.push({
          name: p.name,
          description: p.description,
          input_schema: p.inputSchema,
          cache_control: U,
          ...(T === !0 && p.strict != null ? { strict: p.strict } : {}),
          ...(X != null ? { defer_loading: X } : {}),
          ...(L != null ? { allowed_callers: L } : {}),
          ...(p.inputExamples != null
            ? { input_examples: p.inputExamples.map((R) => R.input) }
            : {}),
        }),
          T === !0 && _.add("structured-outputs-2025-11-13"),
          (p.inputExamples != null || L != null) && _.add("advanced-tool-use-2025-11-20"));
        break;
      }
      case "provider": {
        switch (p.id) {
          case "anthropic.code_execution_20250522": {
            (_.add("code-execution-2025-05-22"),
              v.push({
                type: "code_execution_20250522",
                name: "code_execution",
                cache_control: void 0,
              }));
            break;
          }
          case "anthropic.code_execution_20250825": {
            (_.add("code-execution-2025-08-25"),
              v.push({ type: "code_execution_20250825", name: "code_execution" }));
            break;
          }
          case "anthropic.computer_20250124": {
            (_.add("computer-use-2025-01-24"),
              v.push({
                name: "computer",
                type: "computer_20250124",
                display_width_px: p.args.displayWidthPx,
                display_height_px: p.args.displayHeightPx,
                display_number: p.args.displayNumber,
                cache_control: void 0,
              }));
            break;
          }
          case "anthropic.computer_20251124": {
            (_.add("computer-use-2025-11-24"),
              v.push({
                name: "computer",
                type: "computer_20251124",
                display_width_px: p.args.displayWidthPx,
                display_height_px: p.args.displayHeightPx,
                display_number: p.args.displayNumber,
                enable_zoom: p.args.enableZoom,
                cache_control: void 0,
              }));
            break;
          }
          case "anthropic.computer_20241022": {
            (_.add("computer-use-2024-10-22"),
              v.push({
                name: "computer",
                type: "computer_20241022",
                display_width_px: p.args.displayWidthPx,
                display_height_px: p.args.displayHeightPx,
                display_number: p.args.displayNumber,
                cache_control: void 0,
              }));
            break;
          }
          case "anthropic.text_editor_20250124": {
            (_.add("computer-use-2025-01-24"),
              v.push({
                name: "str_replace_editor",
                type: "text_editor_20250124",
                cache_control: void 0,
              }));
            break;
          }
          case "anthropic.text_editor_20241022": {
            (_.add("computer-use-2024-10-22"),
              v.push({
                name: "str_replace_editor",
                type: "text_editor_20241022",
                cache_control: void 0,
              }));
            break;
          }
          case "anthropic.text_editor_20250429": {
            (_.add("computer-use-2025-01-24"),
              v.push({
                name: "str_replace_based_edit_tool",
                type: "text_editor_20250429",
                cache_control: void 0,
              }));
            break;
          }
          case "anthropic.text_editor_20250728": {
            const U = await ce({ value: p.args, schema: at });
            v.push({
              name: "str_replace_based_edit_tool",
              type: "text_editor_20250728",
              max_characters: U.maxCharacters,
              cache_control: void 0,
            });
            break;
          }
          case "anthropic.bash_20250124": {
            (_.add("computer-use-2025-01-24"),
              v.push({ name: "bash", type: "bash_20250124", cache_control: void 0 }));
            break;
          }
          case "anthropic.bash_20241022": {
            (_.add("computer-use-2024-10-22"),
              v.push({ name: "bash", type: "bash_20241022", cache_control: void 0 }));
            break;
          }
          case "anthropic.memory_20250818": {
            (_.add("context-management-2025-06-27"),
              v.push({ name: "memory", type: "memory_20250818" }));
            break;
          }
          case "anthropic.web_fetch_20250910": {
            _.add("web-fetch-2025-09-10");
            const U = await ce({ value: p.args, schema: dt });
            v.push({
              type: "web_fetch_20250910",
              name: "web_fetch",
              max_uses: U.maxUses,
              allowed_domains: U.allowedDomains,
              blocked_domains: U.blockedDomains,
              citations: U.citations,
              max_content_tokens: U.maxContentTokens,
              cache_control: void 0,
            });
            break;
          }
          case "anthropic.web_search_20250305": {
            const U = await ce({ value: p.args, schema: it });
            v.push({
              type: "web_search_20250305",
              name: "web_search",
              max_uses: U.maxUses,
              allowed_domains: U.allowedDomains,
              blocked_domains: U.blockedDomains,
              user_location: U.userLocation,
              cache_control: void 0,
            });
            break;
          }
          case "anthropic.tool_search_regex_20251119": {
            (_.add("advanced-tool-use-2025-11-20"),
              v.push({ type: "tool_search_tool_regex_20251119", name: "tool_search_tool_regex" }));
            break;
          }
          case "anthropic.tool_search_bm25_20251119": {
            (_.add("advanced-tool-use-2025-11-20"),
              v.push({ type: "tool_search_tool_bm25_20251119", name: "tool_search_tool_bm25" }));
            break;
          }
          default: {
            O.push({ type: "unsupported", feature: `provider-defined tool ${p.id}` });
            break;
          }
        }
        break;
      }
      default: {
        O.push({ type: "unsupported", feature: `tool ${p}` });
        break;
      }
    }
  if (c == null)
    return {
      tools: v,
      toolChoice: s ? { type: "auto", disable_parallel_tool_use: s } : void 0,
      toolWarnings: O,
      betas: _,
    };
  const oe = c.type;
  switch (oe) {
    case "auto":
      return {
        tools: v,
        toolChoice: { type: "auto", disable_parallel_tool_use: s },
        toolWarnings: O,
        betas: _,
      };
    case "required":
      return {
        tools: v,
        toolChoice: { type: "any", disable_parallel_tool_use: s },
        toolWarnings: O,
        betas: _,
      };
    case "none":
      return { tools: void 0, toolChoice: void 0, toolWarnings: O, betas: _ };
    case "tool":
      return {
        tools: v,
        toolChoice: { type: "tool", name: c.toolName, disable_parallel_tool_use: s },
        toolWarnings: O,
        betas: _,
      };
    default: {
      const p = oe;
      throw new me({ functionality: `tool choice type: ${p}` });
    }
  }
}
function Re(n) {
  var c, s;
  const m = n.input_tokens,
    T = n.output_tokens,
    j = (c = n.cache_creation_input_tokens) != null ? c : 0,
    O = (s = n.cache_read_input_tokens) != null ? s : 0;
  return {
    inputTokens: { total: m + j + O, noCache: m, cacheRead: O, cacheWrite: j },
    outputTokens: { total: T, text: void 0, reasoning: void 0 },
    raw: n,
  };
}
var Ue = E(() =>
    A(
      t({
        type: o("code_execution_result"),
        stdout: e(),
        stderr: e(),
        return_code: l(),
        content: C(t({ type: o("code_execution_output"), file_id: e() }))
          .optional()
          .default([]),
      })
    )
  ),
  ft = E(() => A(t({ code: e() }))),
  gt = _e({ id: "anthropic.code_execution_20250522", inputSchema: ft, outputSchema: Ue }),
  xt = (n = {}) => gt(n),
  De = E(() =>
    A(
      V("type", [
        t({
          type: o("code_execution_result"),
          stdout: e(),
          stderr: e(),
          return_code: l(),
          content: C(t({ type: o("code_execution_output"), file_id: e() }))
            .optional()
            .default([]),
        }),
        t({
          type: o("bash_code_execution_result"),
          content: C(t({ type: o("bash_code_execution_output"), file_id: e() })),
          stdout: e(),
          stderr: e(),
          return_code: l(),
        }),
        t({ type: o("bash_code_execution_tool_result_error"), error_code: e() }),
        t({ type: o("text_editor_code_execution_tool_result_error"), error_code: e() }),
        t({
          type: o("text_editor_code_execution_view_result"),
          content: e(),
          file_type: e(),
          num_lines: l().nullable(),
          start_line: l().nullable(),
          total_lines: l().nullable(),
        }),
        t({ type: o("text_editor_code_execution_create_result"), is_file_update: W() }),
        t({
          type: o("text_editor_code_execution_str_replace_result"),
          lines: C(e()).nullable(),
          new_lines: l().nullable(),
          new_start: l().nullable(),
          old_lines: l().nullable(),
          old_start: l().nullable(),
        }),
      ])
    )
  ),
  vt = E(() =>
    A(
      V("type", [
        t({ type: o("programmatic-tool-call"), code: e() }),
        t({ type: o("bash_code_execution"), command: e() }),
        V("command", [
          t({ type: o("text_editor_code_execution"), command: o("view"), path: e() }),
          t({
            type: o("text_editor_code_execution"),
            command: o("create"),
            path: e(),
            file_text: e().nullish(),
          }),
          t({
            type: o("text_editor_code_execution"),
            command: o("str_replace"),
            path: e(),
            old_str: e(),
            new_str: e(),
          }),
        ]),
      ])
    )
  ),
  bt = _e({
    id: "anthropic.code_execution_20250825",
    inputSchema: vt,
    outputSchema: De,
    supportsDeferredResults: !0,
  }),
  kt = (n = {}) => bt(n),
  Be = E(() => A(C(t({ type: o("tool_reference"), toolName: e() })))),
  wt = E(() => A(t({ pattern: e(), limit: l().optional() }))),
  Ct = _e({
    id: "anthropic.tool_search_regex_20251119",
    inputSchema: wt,
    outputSchema: Be,
    supportsDeferredResults: !0,
  }),
  Tt = (n = {}) => Ct(n);
function Nt(n) {
  if (typeof n == "string") return Buffer.from(n, "base64").toString("utf-8");
  if (n instanceof Uint8Array) return new TextDecoder().decode(n);
  throw n instanceof URL
    ? new me({ functionality: "URL-based text documents are not supported for citations" })
    : new me({ functionality: `unsupported data type for text documents: ${typeof n}` });
}
function ye(n) {
  return n instanceof URL || St(n);
}
function St(n) {
  return typeof n == "string" && /^https?:\/\//i.test(n);
}
function fe(n) {
  return n instanceof URL ? n.toString() : n;
}
async function It({
  prompt: n,
  sendReasoning: c,
  warnings: s,
  cacheControlValidator: m,
  toolNameMapping: T,
}) {
  var j, O, _, H, v, oe, p, U, ee, X, L, R, re, q, ne, te, $;
  const r = new Set(),
    M = Ot(n),
    I = m || new be();
  let z;
  const g = [];
  async function ae(G) {
    var B, P;
    const h = await he({ provider: "anthropic", providerOptions: G, schema: Ie });
    return (P = (B = h?.citations) == null ? void 0 : B.enabled) != null ? P : !1;
  }
  async function ue(G) {
    const B = await he({ provider: "anthropic", providerOptions: G, schema: Ie });
    return { title: B?.title, context: B?.context };
  }
  for (let G = 0; G < M.length; G++) {
    const B = M[G],
      P = G === M.length - 1,
      h = B.type;
    switch (h) {
      case "system": {
        if (z != null)
          throw new me({
            functionality: "Multiple system messages that are separated by user/assistant messages",
          });
        z = B.messages.map(({ content: N, providerOptions: Y }) => ({
          type: "text",
          text: N,
          cache_control: I.getCacheControl(Y, { type: "system message", canCache: !0 }),
        }));
        break;
      }
      case "user": {
        const N = [];
        for (const Y of B.messages) {
          const { role: Z, content: Q } = Y;
          switch (Z) {
            case "user": {
              for (let K = 0; K < Q.length; K++) {
                const b = Q[K],
                  F = K === Q.length - 1,
                  u =
                    (j = I.getCacheControl(b.providerOptions, {
                      type: "user message part",
                      canCache: !0,
                    })) != null
                      ? j
                      : F
                        ? I.getCacheControl(Y.providerOptions, {
                            type: "user message",
                            canCache: !0,
                          })
                        : void 0;
                switch (b.type) {
                  case "text": {
                    N.push({ type: "text", text: b.text, cache_control: u });
                    break;
                  }
                  case "file": {
                    if (b.mediaType.startsWith("image/"))
                      N.push({
                        type: "image",
                        source: ye(b.data)
                          ? { type: "url", url: fe(b.data) }
                          : {
                              type: "base64",
                              media_type: b.mediaType === "image/*" ? "image/jpeg" : b.mediaType,
                              data: Ne(b.data),
                            },
                        cache_control: u,
                      });
                    else if (b.mediaType === "application/pdf") {
                      r.add("pdfs-2024-09-25");
                      const D = await ae(b.providerOptions),
                        S = await ue(b.providerOptions);
                      N.push({
                        type: "document",
                        source: ye(b.data)
                          ? { type: "url", url: fe(b.data) }
                          : { type: "base64", media_type: "application/pdf", data: Ne(b.data) },
                        title: (O = S.title) != null ? O : b.filename,
                        ...(S.context && { context: S.context }),
                        ...(D && { citations: { enabled: !0 } }),
                        cache_control: u,
                      });
                    } else if (b.mediaType === "text/plain") {
                      const D = await ae(b.providerOptions),
                        S = await ue(b.providerOptions);
                      N.push({
                        type: "document",
                        source: ye(b.data)
                          ? { type: "url", url: fe(b.data) }
                          : { type: "text", media_type: "text/plain", data: Nt(b.data) },
                        title: (_ = S.title) != null ? _ : b.filename,
                        ...(S.context && { context: S.context }),
                        ...(D && { citations: { enabled: !0 } }),
                        cache_control: u,
                      });
                    } else throw new me({ functionality: `media type: ${b.mediaType}` });
                    break;
                  }
                }
              }
              break;
            }
            case "tool": {
              for (let K = 0; K < Q.length; K++) {
                const b = Q[K];
                if (b.type === "tool-approval-response") continue;
                const F = K === Q.length - 1,
                  u =
                    (H = I.getCacheControl(b.providerOptions, {
                      type: "tool result part",
                      canCache: !0,
                    })) != null
                      ? H
                      : F
                        ? I.getCacheControl(Y.providerOptions, {
                            type: "tool result message",
                            canCache: !0,
                          })
                        : void 0,
                  D = b.output;
                let S;
                switch (D.type) {
                  case "content":
                    S = D.value
                      .map((x) => {
                        var f;
                        switch (x.type) {
                          case "text":
                            return { type: "text", text: x.text };
                          case "image-data":
                            return {
                              type: "image",
                              source: { type: "base64", media_type: x.mediaType, data: x.data },
                            };
                          case "image-url":
                            return { type: "image", source: { type: "url", url: x.url } };
                          case "file-url":
                            return { type: "document", source: { type: "url", url: x.url } };
                          case "file-data": {
                            if (x.mediaType === "application/pdf")
                              return (
                                r.add("pdfs-2024-09-25"),
                                {
                                  type: "document",
                                  source: { type: "base64", media_type: x.mediaType, data: x.data },
                                }
                              );
                            s.push({
                              type: "other",
                              message: `unsupported tool content part type: ${x.type} with media type: ${x.mediaType}`,
                            });
                            return;
                          }
                          case "custom": {
                            const y = (f = x.providerOptions) == null ? void 0 : f.anthropic;
                            if (y?.type === "tool-reference")
                              return { type: "tool_reference", tool_name: y.toolName };
                            s.push({
                              type: "other",
                              message: "unsupported custom tool content part",
                            });
                            return;
                          }
                          default: {
                            s.push({
                              type: "other",
                              message: `unsupported tool content part type: ${x.type}`,
                            });
                            return;
                          }
                        }
                      })
                      .filter(Xe);
                    break;
                  case "text":
                  case "error-text":
                    S = D.value;
                    break;
                  case "execution-denied":
                    S = (v = D.reason) != null ? v : "Tool execution denied.";
                    break;
                  case "json":
                  case "error-json":
                  default:
                    S = JSON.stringify(D.value);
                    break;
                }
                N.push({
                  type: "tool_result",
                  tool_use_id: b.toolCallId,
                  content: S,
                  is_error: D.type === "error-text" || D.type === "error-json" ? !0 : void 0,
                  cache_control: u,
                });
              }
              break;
            }
            default: {
              const K = Z;
              throw new Error(`Unsupported role: ${K}`);
            }
          }
        }
        g.push({ role: "user", content: N });
        break;
      }
      case "assistant": {
        const N = [],
          Y = new Set();
        for (let Z = 0; Z < B.messages.length; Z++) {
          const Q = B.messages[Z],
            K = Z === B.messages.length - 1,
            { content: b } = Q;
          for (let F = 0; F < b.length; F++) {
            const u = b[F],
              D = F === b.length - 1,
              S =
                (oe = I.getCacheControl(u.providerOptions, {
                  type: "assistant message part",
                  canCache: !0,
                })) != null
                  ? oe
                  : D
                    ? I.getCacheControl(Q.providerOptions, {
                        type: "assistant message",
                        canCache: !0,
                      })
                    : void 0;
            switch (u.type) {
              case "text": {
                N.push({
                  type: "text",
                  text: P && K && D ? u.text.trim() : u.text,
                  cache_control: S,
                });
                break;
              }
              case "reasoning": {
                if (c) {
                  const x = await he({
                    provider: "anthropic",
                    providerOptions: u.providerOptions,
                    schema: ot,
                  });
                  x != null
                    ? x.signature != null
                      ? (I.getCacheControl(u.providerOptions, {
                          type: "thinking block",
                          canCache: !1,
                        }),
                        N.push({ type: "thinking", thinking: u.text, signature: x.signature }))
                      : x.redactedData != null
                        ? (I.getCacheControl(u.providerOptions, {
                            type: "redacted thinking block",
                            canCache: !1,
                          }),
                          N.push({ type: "redacted_thinking", data: x.redactedData }))
                        : s.push({ type: "other", message: "unsupported reasoning metadata" })
                    : s.push({ type: "other", message: "unsupported reasoning metadata" });
                } else
                  s.push({
                    type: "other",
                    message: "sending reasoning content is disabled for this model",
                  });
                break;
              }
              case "tool-call": {
                if (u.providerExecuted) {
                  const y = T.toProviderToolName(u.toolName);
                  if (
                    ((U = (p = u.providerOptions) == null ? void 0 : p.anthropic) == null
                      ? void 0
                      : U.type) === "mcp-tool-use"
                  ) {
                    Y.add(u.toolCallId);
                    const a =
                      (X = (ee = u.providerOptions) == null ? void 0 : ee.anthropic) == null
                        ? void 0
                        : X.serverName;
                    if (a == null || typeof a != "string") {
                      s.push({
                        type: "other",
                        message: "mcp tool use server name is required and must be a string",
                      });
                      break;
                    }
                    N.push({
                      type: "mcp_tool_use",
                      id: u.toolCallId,
                      name: u.toolName,
                      input: u.input,
                      server_name: a,
                      cache_control: S,
                    });
                  } else if (
                    y === "code_execution" &&
                    u.input != null &&
                    typeof u.input == "object" &&
                    "type" in u.input &&
                    typeof u.input.type == "string" &&
                    (u.input.type === "bash_code_execution" ||
                      u.input.type === "text_editor_code_execution")
                  )
                    N.push({
                      type: "server_tool_use",
                      id: u.toolCallId,
                      name: u.input.type,
                      input: u.input,
                      cache_control: S,
                    });
                  else if (
                    y === "code_execution" &&
                    u.input != null &&
                    typeof u.input == "object" &&
                    "type" in u.input &&
                    u.input.type === "programmatic-tool-call"
                  ) {
                    const { type: a, ...w } = u.input;
                    N.push({
                      type: "server_tool_use",
                      id: u.toolCallId,
                      name: "code_execution",
                      input: w,
                      cache_control: S,
                    });
                  } else
                    y === "code_execution" || y === "web_fetch" || y === "web_search"
                      ? N.push({
                          type: "server_tool_use",
                          id: u.toolCallId,
                          name: y,
                          input: u.input,
                          cache_control: S,
                        })
                      : y === "tool_search_tool_regex" || y === "tool_search_tool_bm25"
                        ? N.push({
                            type: "server_tool_use",
                            id: u.toolCallId,
                            name: y,
                            input: u.input,
                            cache_control: S,
                          })
                        : s.push({
                            type: "other",
                            message: `provider executed tool call for tool ${u.toolName} is not supported`,
                          });
                  break;
                }
                const x = (L = u.providerOptions) == null ? void 0 : L.anthropic,
                  f = x?.caller
                    ? x.caller.type === "code_execution_20250825" && x.caller.toolId
                      ? { type: "code_execution_20250825", tool_id: x.caller.toolId }
                      : x.caller.type === "direct"
                        ? { type: "direct" }
                        : void 0
                    : void 0;
                N.push({
                  type: "tool_use",
                  id: u.toolCallId,
                  name: u.toolName,
                  input: u.input,
                  ...(f && { caller: f }),
                  cache_control: S,
                });
                break;
              }
              case "tool-result": {
                const x = T.toProviderToolName(u.toolName);
                if (Y.has(u.toolCallId)) {
                  const f = u.output;
                  if (f.type !== "json" && f.type !== "error-json") {
                    s.push({
                      type: "other",
                      message: `provider executed tool result output type ${f.type} for tool ${u.toolName} is not supported`,
                    });
                    break;
                  }
                  N.push({
                    type: "mcp_tool_result",
                    tool_use_id: u.toolCallId,
                    is_error: f.type === "error-json",
                    content: f.value,
                    cache_control: S,
                  });
                } else if (x === "code_execution") {
                  const f = u.output;
                  if (f.type === "error-text" || f.type === "error-json") {
                    let y = {};
                    try {
                      typeof f.value == "string"
                        ? (y = JSON.parse(f.value))
                        : typeof f.value == "object" && f.value !== null && (y = f.value);
                    } catch {}
                    y.type === "code_execution_tool_result_error"
                      ? N.push({
                          type: "code_execution_tool_result",
                          tool_use_id: u.toolCallId,
                          content: {
                            type: "code_execution_tool_result_error",
                            error_code: (R = y.errorCode) != null ? R : "unknown",
                          },
                          cache_control: S,
                        })
                      : N.push({
                          type: "bash_code_execution_tool_result",
                          tool_use_id: u.toolCallId,
                          cache_control: S,
                          content: {
                            type: "bash_code_execution_tool_result_error",
                            error_code: (re = y.errorCode) != null ? re : "unknown",
                          },
                        });
                    break;
                  }
                  if (f.type !== "json") {
                    s.push({
                      type: "other",
                      message: `provider executed tool result output type ${f.type} for tool ${u.toolName} is not supported`,
                    });
                    break;
                  }
                  if (
                    f.value == null ||
                    typeof f.value != "object" ||
                    !("type" in f.value) ||
                    typeof f.value.type != "string"
                  ) {
                    s.push({
                      type: "other",
                      message: `provider executed tool result output value is not a valid code execution result for tool ${u.toolName}`,
                    });
                    break;
                  }
                  if (f.value.type === "code_execution_result") {
                    const y = await ce({ value: f.value, schema: Ue });
                    N.push({
                      type: "code_execution_tool_result",
                      tool_use_id: u.toolCallId,
                      content: {
                        type: y.type,
                        stdout: y.stdout,
                        stderr: y.stderr,
                        return_code: y.return_code,
                        content: (q = y.content) != null ? q : [],
                      },
                      cache_control: S,
                    });
                  } else {
                    const y = await ce({ value: f.value, schema: De });
                    y.type === "code_execution_result"
                      ? N.push({
                          type: "code_execution_tool_result",
                          tool_use_id: u.toolCallId,
                          content: {
                            type: y.type,
                            stdout: y.stdout,
                            stderr: y.stderr,
                            return_code: y.return_code,
                            content: (ne = y.content) != null ? ne : [],
                          },
                          cache_control: S,
                        })
                      : y.type === "bash_code_execution_result" ||
                          y.type === "bash_code_execution_tool_result_error"
                        ? N.push({
                            type: "bash_code_execution_tool_result",
                            tool_use_id: u.toolCallId,
                            cache_control: S,
                            content: y,
                          })
                        : N.push({
                            type: "text_editor_code_execution_tool_result",
                            tool_use_id: u.toolCallId,
                            cache_control: S,
                            content: y,
                          });
                  }
                  break;
                }
                if (x === "web_fetch") {
                  const f = u.output;
                  if (f.type === "error-json") {
                    let i = {};
                    try {
                      typeof f.value == "string"
                        ? (i = JSON.parse(f.value))
                        : typeof f.value == "object" && f.value !== null && (i = f.value);
                    } catch {
                      const w = (te = f.value) == null ? void 0 : te.errorCode;
                      i = { errorCode: typeof w == "string" ? w : "unknown" };
                    }
                    N.push({
                      type: "web_fetch_tool_result",
                      tool_use_id: u.toolCallId,
                      content: {
                        type: "web_fetch_tool_result_error",
                        error_code: ($ = i.errorCode) != null ? $ : "unknown",
                      },
                      cache_control: S,
                    });
                    break;
                  }
                  if (f.type !== "json") {
                    s.push({
                      type: "other",
                      message: `provider executed tool result output type ${f.type} for tool ${u.toolName} is not supported`,
                    });
                    break;
                  }
                  const y = await ce({ value: f.value, schema: $e });
                  N.push({
                    type: "web_fetch_tool_result",
                    tool_use_id: u.toolCallId,
                    content: {
                      type: "web_fetch_result",
                      url: y.url,
                      retrieved_at: y.retrievedAt,
                      content: {
                        type: "document",
                        title: y.content.title,
                        citations: y.content.citations,
                        source: {
                          type: y.content.source.type,
                          media_type: y.content.source.mediaType,
                          data: y.content.source.data,
                        },
                      },
                    },
                    cache_control: S,
                  });
                  break;
                }
                if (x === "web_search") {
                  const f = u.output;
                  if (f.type !== "json") {
                    s.push({
                      type: "other",
                      message: `provider executed tool result output type ${f.type} for tool ${u.toolName} is not supported`,
                    });
                    break;
                  }
                  const y = await ce({ value: f.value, schema: je });
                  N.push({
                    type: "web_search_tool_result",
                    tool_use_id: u.toolCallId,
                    content: y.map((i) => ({
                      url: i.url,
                      title: i.title,
                      page_age: i.pageAge,
                      encrypted_content: i.encryptedContent,
                      type: i.type,
                    })),
                    cache_control: S,
                  });
                  break;
                }
                if (x === "tool_search_tool_regex" || x === "tool_search_tool_bm25") {
                  const f = u.output;
                  if (f.type !== "json") {
                    s.push({
                      type: "other",
                      message: `provider executed tool result output type ${f.type} for tool ${u.toolName} is not supported`,
                    });
                    break;
                  }
                  const i = (await ce({ value: f.value, schema: Be })).map((a) => ({
                    type: "tool_reference",
                    tool_name: a.toolName,
                  }));
                  N.push({
                    type: "tool_search_tool_result",
                    tool_use_id: u.toolCallId,
                    content: { type: "tool_search_tool_search_result", tool_references: i },
                    cache_control: S,
                  });
                  break;
                }
                s.push({
                  type: "other",
                  message: `provider executed tool result for tool ${u.toolName} is not supported`,
                });
                break;
              }
            }
          }
        }
        g.push({ role: "assistant", content: N });
        break;
      }
      default: {
        const N = h;
        throw new Error(`content type: ${N}`);
      }
    }
  }
  return { prompt: { system: z, messages: g }, betas: r };
}
function Ot(n) {
  const c = [];
  let s;
  for (const m of n) {
    const { role: T } = m;
    switch (T) {
      case "system": {
        (s?.type !== "system" && ((s = { type: "system", messages: [] }), c.push(s)),
          s.messages.push(m));
        break;
      }
      case "assistant": {
        (s?.type !== "assistant" && ((s = { type: "assistant", messages: [] }), c.push(s)),
          s.messages.push(m));
        break;
      }
      case "user": {
        (s?.type !== "user" && ((s = { type: "user", messages: [] }), c.push(s)),
          s.messages.push(m));
        break;
      }
      case "tool": {
        (s?.type !== "user" && ((s = { type: "user", messages: [] }), c.push(s)),
          s.messages.push(m));
        break;
      }
      default: {
        const j = T;
        throw new Error(`Unsupported role: ${j}`);
      }
    }
  }
  return c;
}
function ge({ finishReason: n, isJsonResponseFromTool: c }) {
  switch (n) {
    case "pause_turn":
    case "end_turn":
    case "stop_sequence":
      return "stop";
    case "refusal":
      return "content-filter";
    case "tool_use":
      return c ? "stop" : "tool-calls";
    case "max_tokens":
    case "model_context_window_exceeded":
      return "length";
    default:
      return "other";
  }
}
function qe(n, c, s) {
  var m;
  if (n.type === "web_search_result_location")
    return {
      type: "source",
      sourceType: "url",
      id: s(),
      url: n.url,
      title: n.title,
      providerMetadata: {
        anthropic: { citedText: n.cited_text, encryptedIndex: n.encrypted_index },
      },
    };
  if (n.type !== "page_location" && n.type !== "char_location") return;
  const T = c[n.document_index];
  if (T)
    return {
      type: "source",
      sourceType: "document",
      id: s(),
      mediaType: T.mediaType,
      title: (m = n.document_title) != null ? m : T.title,
      filename: T.filename,
      providerMetadata: {
        anthropic:
          n.type === "page_location"
            ? {
                citedText: n.cited_text,
                startPageNumber: n.start_page_number,
                endPageNumber: n.end_page_number,
              }
            : {
                citedText: n.cited_text,
                startCharIndex: n.start_char_index,
                endCharIndex: n.end_char_index,
              },
      },
    };
}
var Mt = class {
  constructor(n, c) {
    this.specificationVersion = "v3";
    var s;
    ((this.modelId = n),
      (this.config = c),
      (this.generateId = (s = c.generateId) != null ? s : Ae));
  }
  supportsUrl(n) {
    return n.protocol === "https:";
  }
  get provider() {
    return this.config.provider;
  }
  get providerOptionsName() {
    const n = this.config.provider,
      c = n.indexOf(".");
    return c === -1 ? n : n.substring(0, c);
  }
  get supportedUrls() {
    var n, c, s;
    return (s = (c = (n = this.config).supportedUrls) == null ? void 0 : c.call(n)) != null
      ? s
      : {};
  }
  async getArgs({
    userSuppliedBetas: n,
    prompt: c,
    maxOutputTokens: s,
    temperature: m,
    topP: T,
    topK: j,
    frequencyPenalty: O,
    presencePenalty: _,
    stopSequences: H,
    responseFormat: v,
    seed: oe,
    tools: p,
    toolChoice: U,
    providerOptions: ee,
    stream: X,
  }) {
    var L, R, re, q, ne, te;
    const $ = [];
    (O != null && $.push({ type: "unsupported", feature: "frequencyPenalty" }),
      _ != null && $.push({ type: "unsupported", feature: "presencePenalty" }),
      oe != null && $.push({ type: "unsupported", feature: "seed" }),
      m != null && m > 1
        ? ($.push({
            type: "unsupported",
            feature: "temperature",
            details: `${m} exceeds anthropic maximum of 1.0. clamped to 1.0`,
          }),
          (m = 1))
        : m != null &&
          m < 0 &&
          ($.push({
            type: "unsupported",
            feature: "temperature",
            details: `${m} is below anthropic minimum of 0. clamped to 0`,
          }),
          (m = 0)),
      v?.type === "json" &&
        v.schema == null &&
        $.push({
          type: "unsupported",
          feature: "responseFormat",
          details: "JSON response format requires a schema. The response format is ignored.",
        }));
    const r = this.providerOptionsName,
      M = await he({ provider: "anthropic", providerOptions: ee, schema: Oe }),
      I = r !== "anthropic" ? await he({ provider: r, providerOptions: ee, schema: Oe }) : null,
      z = I != null,
      g = Object.assign({}, M ?? {}, I ?? {}),
      { maxOutputTokens: ae, supportsStructuredOutput: ue, isKnownModel: G } = Rt(this.modelId),
      B = ((L = this.config.supportsNativeStructuredOutput) != null ? L : !0) && ue,
      P = (R = g?.structuredOutputMode) != null ? R : "auto",
      h = P === "outputFormat" || (P === "auto" && B),
      N =
        v?.type === "json" && v.schema != null && !h
          ? {
              type: "function",
              name: "json",
              description: "Respond with a JSON object.",
              inputSchema: v.schema,
            }
          : void 0,
      Y = g?.contextManagement,
      Z = new be(),
      Q = Pe({
        tools: p,
        providerToolNames: {
          "anthropic.code_execution_20250522": "code_execution",
          "anthropic.code_execution_20250825": "code_execution",
          "anthropic.computer_20241022": "computer",
          "anthropic.computer_20250124": "computer",
          "anthropic.text_editor_20241022": "str_replace_editor",
          "anthropic.text_editor_20250124": "str_replace_editor",
          "anthropic.text_editor_20250429": "str_replace_based_edit_tool",
          "anthropic.text_editor_20250728": "str_replace_based_edit_tool",
          "anthropic.bash_20241022": "bash",
          "anthropic.bash_20250124": "bash",
          "anthropic.memory_20250818": "memory",
          "anthropic.web_search_20250305": "web_search",
          "anthropic.web_fetch_20250910": "web_fetch",
          "anthropic.tool_search_regex_20251119": "tool_search_tool_regex",
          "anthropic.tool_search_bm25_20251119": "tool_search_tool_bm25",
        },
      }),
      { prompt: K, betas: b } = await It({
        prompt: c,
        sendReasoning: (re = g?.sendReasoning) != null ? re : !0,
        warnings: $,
        cacheControlValidator: Z,
        toolNameMapping: Q,
      }),
      F = (q = g?.thinking) == null ? void 0 : q.type,
      u = F === "enabled" || F === "adaptive";
    let D = F === "enabled" ? ((ne = g?.thinking) == null ? void 0 : ne.budgetTokens) : void 0;
    const S = s ?? ae,
      x = {
        model: this.modelId,
        max_tokens: S,
        temperature: m,
        top_k: j,
        top_p: T,
        stop_sequences: H,
        ...(u && { thinking: { type: F, ...(D != null && { budget_tokens: D }) } }),
        ...(g?.effort && { output_config: { effort: g.effort } }),
        ...(h &&
          v?.type === "json" &&
          v.schema != null && { output_format: { type: "json_schema", schema: v.schema } }),
        ...(g?.mcpServers &&
          g.mcpServers.length > 0 && {
            mcp_servers: g.mcpServers.map((d) => ({
              type: d.type,
              name: d.name,
              url: d.url,
              authorization_token: d.authorizationToken,
              tool_configuration: d.toolConfiguration
                ? {
                    allowed_tools: d.toolConfiguration.allowedTools,
                    enabled: d.toolConfiguration.enabled,
                  }
                : void 0,
            })),
          }),
        ...(g?.container && {
          container:
            g.container.skills && g.container.skills.length > 0
              ? {
                  id: g.container.id,
                  skills: g.container.skills.map((d) => ({
                    type: d.type,
                    skill_id: d.skillId,
                    version: d.version,
                  })),
                }
              : g.container.id,
        }),
        system: K.system,
        messages: K.messages,
        ...(Y && {
          context_management: {
            edits: Y.edits
              .map((d) => {
                const se = d.type;
                switch (se) {
                  case "clear_tool_uses_20250919":
                    return {
                      type: d.type,
                      ...(d.trigger !== void 0 && { trigger: d.trigger }),
                      ...(d.keep !== void 0 && { keep: d.keep }),
                      ...(d.clearAtLeast !== void 0 && { clear_at_least: d.clearAtLeast }),
                      ...(d.clearToolInputs !== void 0 && { clear_tool_inputs: d.clearToolInputs }),
                      ...(d.excludeTools !== void 0 && { exclude_tools: d.excludeTools }),
                    };
                  case "clear_thinking_20251015":
                    return { type: d.type, ...(d.keep !== void 0 && { keep: d.keep }) };
                  default:
                    $.push({
                      type: "other",
                      message: `Unknown context management strategy: ${se}`,
                    });
                    return;
                }
              })
              .filter((d) => d !== void 0),
          },
        }),
      };
    (u
      ? (F === "enabled" &&
          D == null &&
          ($.push({
            type: "compatibility",
            feature: "extended thinking",
            details:
              "thinking budget is required when thinking is enabled. using default budget of 1024 tokens.",
          }),
          (x.thinking = { type: "enabled", budget_tokens: 1024 }),
          (D = 1024)),
        x.temperature != null &&
          ((x.temperature = void 0),
          $.push({
            type: "unsupported",
            feature: "temperature",
            details: "temperature is not supported when thinking is enabled",
          })),
        j != null &&
          ((x.top_k = void 0),
          $.push({
            type: "unsupported",
            feature: "topK",
            details: "topK is not supported when thinking is enabled",
          })),
        T != null &&
          ((x.top_p = void 0),
          $.push({
            type: "unsupported",
            feature: "topP",
            details: "topP is not supported when thinking is enabled",
          })),
        (x.max_tokens = S + (D ?? 0)))
      : T != null &&
        m != null &&
        ($.push({
          type: "unsupported",
          feature: "topP",
          details: "topP is not supported when temperature is set. topP is ignored.",
        }),
        (x.top_p = void 0)),
      G &&
        x.max_tokens > ae &&
        (s != null &&
          $.push({
            type: "unsupported",
            feature: "maxOutputTokens",
            details: `${x.max_tokens} (maxOutputTokens + thinkingBudget) is greater than ${this.modelId} ${ae} max output tokens. The max output tokens have been limited to ${ae}.`,
          }),
        (x.max_tokens = ae)),
      g?.mcpServers && g.mcpServers.length > 0 && b.add("mcp-client-2025-04-04"),
      Y && b.add("context-management-2025-06-27"),
      g?.container &&
        g.container.skills &&
        g.container.skills.length > 0 &&
        (b.add("code-execution-2025-08-25"),
        b.add("skills-2025-10-02"),
        b.add("files-api-2025-04-14"),
        p?.some((d) => d.type === "provider" && d.id === "anthropic.code_execution_20250825") ||
          $.push({ type: "other", message: "code execution tool is required when using skills" })),
      g?.effort && b.add("effort-2025-11-24"),
      X &&
        ((te = g?.toolStreaming) == null || te) &&
        b.add("fine-grained-tool-streaming-2025-05-14"),
      h && v?.type === "json" && v.schema != null && b.add("structured-outputs-2025-11-13"));
    const {
        tools: y,
        toolChoice: i,
        toolWarnings: a,
        betas: w,
      } = await yt(
        N != null
          ? {
              tools: [...(p ?? []), N],
              toolChoice: { type: "required" },
              disableParallelToolUse: !0,
              cacheControlValidator: Z,
              supportsStructuredOutput: !1,
            }
          : {
              tools: p ?? [],
              toolChoice: U,
              disableParallelToolUse: g?.disableParallelToolUse,
              cacheControlValidator: Z,
              supportsStructuredOutput: B,
            }
      ),
      k = Z.getWarnings();
    return {
      args: { ...x, tools: y, tool_choice: i, stream: X === !0 ? !0 : void 0 },
      warnings: [...$, ...a, ...k],
      betas: new Set([...b, ...w, ...n]),
      usesJsonResponseTool: N != null,
      toolNameMapping: Q,
      providerOptionsName: r,
      usedCustomProviderKey: z,
    };
  }
  async getHeaders({ betas: n, headers: c }) {
    return Ke(
      await Ce(this.config.headers),
      c,
      n.size > 0 ? { "anthropic-beta": Array.from(n).join(",") } : {}
    );
  }
  async getBetasFromHeaders(n) {
    var c, s;
    const T = (c = (await Ce(this.config.headers))["anthropic-beta"]) != null ? c : "",
      j = (s = n?.["anthropic-beta"]) != null ? s : "";
    return new Set(
      [...T.toLowerCase().split(","), ...j.toLowerCase().split(",")]
        .map((O) => O.trim())
        .filter((O) => O !== "")
    );
  }
  buildRequestUrl(n) {
    var c, s, m;
    return (m =
      (s = (c = this.config).buildRequestUrl) == null
        ? void 0
        : s.call(c, this.config.baseURL, n)) != null
      ? m
      : `${this.config.baseURL}/messages`;
  }
  transformRequestBody(n) {
    var c, s, m;
    return (m = (s = (c = this.config).transformRequestBody) == null ? void 0 : s.call(c, n)) !=
      null
      ? m
      : n;
  }
  extractCitationDocuments(n) {
    const c = (s) => {
      var m, T;
      if (s.type !== "file" || (s.mediaType !== "application/pdf" && s.mediaType !== "text/plain"))
        return !1;
      const j = (m = s.providerOptions) == null ? void 0 : m.anthropic,
        O = j?.citations;
      return (T = O?.enabled) != null ? T : !1;
    };
    return n
      .filter((s) => s.role === "user")
      .flatMap((s) => s.content)
      .filter(c)
      .map((s) => {
        var m;
        const T = s;
        return {
          title: (m = T.filename) != null ? m : "Untitled Document",
          filename: T.filename,
          mediaType: T.mediaType,
        };
      });
  }
  async doGenerate(n) {
    var c, s, m, T, j, O;
    const {
        args: _,
        warnings: H,
        betas: v,
        usesJsonResponseTool: oe,
        toolNameMapping: p,
        providerOptionsName: U,
        usedCustomProviderKey: ee,
      } = await this.getArgs({
        ...n,
        stream: !1,
        userSuppliedBetas: await this.getBetasFromHeaders(n.headers),
      }),
      X = [...this.extractCitationDocuments(n.prompt)],
      {
        responseHeaders: L,
        value: R,
        rawValue: re,
      } = await Te({
        url: this.buildRequestUrl(!1),
        headers: await this.getHeaders({ betas: v, headers: n.headers }),
        body: this.transformRequestBody(_),
        failedResponseHandler: Se,
        successfulResponseHandler: Ve(et),
        abortSignal: n.abortSignal,
        fetch: this.config.fetch,
      }),
      q = [],
      ne = {},
      te = {};
    let $ = !1;
    for (const r of R.content)
      switch (r.type) {
        case "text": {
          if (!oe && (q.push({ type: "text", text: r.text }), r.citations))
            for (const M of r.citations) {
              const I = qe(M, X, this.generateId);
              I && q.push(I);
            }
          break;
        }
        case "thinking": {
          q.push({
            type: "reasoning",
            text: r.thinking,
            providerMetadata: { anthropic: { signature: r.signature } },
          });
          break;
        }
        case "redacted_thinking": {
          q.push({
            type: "reasoning",
            text: "",
            providerMetadata: { anthropic: { redactedData: r.data } },
          });
          break;
        }
        case "tool_use": {
          if (oe && r.name === "json")
            (($ = !0), q.push({ type: "text", text: JSON.stringify(r.input) }));
          else {
            const I = r.caller,
              z = I ? { type: I.type, toolId: "tool_id" in I ? I.tool_id : void 0 } : void 0;
            q.push({
              type: "tool-call",
              toolCallId: r.id,
              toolName: r.name,
              input: JSON.stringify(r.input),
              ...(z && { providerMetadata: { anthropic: { caller: z } } }),
            });
          }
          break;
        }
        case "server_tool_use": {
          if (r.name === "text_editor_code_execution" || r.name === "bash_code_execution")
            q.push({
              type: "tool-call",
              toolCallId: r.id,
              toolName: p.toCustomToolName("code_execution"),
              input: JSON.stringify({ type: r.name, ...r.input }),
              providerExecuted: !0,
            });
          else if (
            r.name === "web_search" ||
            r.name === "code_execution" ||
            r.name === "web_fetch"
          ) {
            const M =
              r.name === "code_execution" &&
              r.input != null &&
              typeof r.input == "object" &&
              "code" in r.input &&
              !("type" in r.input)
                ? { type: "programmatic-tool-call", ...r.input }
                : r.input;
            q.push({
              type: "tool-call",
              toolCallId: r.id,
              toolName: p.toCustomToolName(r.name),
              input: JSON.stringify(M),
              providerExecuted: !0,
            });
          } else
            (r.name === "tool_search_tool_regex" || r.name === "tool_search_tool_bm25") &&
              ((te[r.id] = r.name),
              q.push({
                type: "tool-call",
                toolCallId: r.id,
                toolName: p.toCustomToolName(r.name),
                input: JSON.stringify(r.input),
                providerExecuted: !0,
              }));
          break;
        }
        case "mcp_tool_use": {
          ((ne[r.id] = {
            type: "tool-call",
            toolCallId: r.id,
            toolName: r.name,
            input: JSON.stringify(r.input),
            providerExecuted: !0,
            dynamic: !0,
            providerMetadata: { anthropic: { type: "mcp-tool-use", serverName: r.server_name } },
          }),
            q.push(ne[r.id]));
          break;
        }
        case "mcp_tool_result": {
          q.push({
            type: "tool-result",
            toolCallId: r.tool_use_id,
            toolName: ne[r.tool_use_id].toolName,
            isError: r.is_error,
            result: r.content,
            dynamic: !0,
            providerMetadata: ne[r.tool_use_id].providerMetadata,
          });
          break;
        }
        case "web_fetch_tool_result": {
          r.content.type === "web_fetch_result"
            ? (X.push({
                title: (c = r.content.content.title) != null ? c : r.content.url,
                mediaType: r.content.content.source.media_type,
              }),
              q.push({
                type: "tool-result",
                toolCallId: r.tool_use_id,
                toolName: p.toCustomToolName("web_fetch"),
                result: {
                  type: "web_fetch_result",
                  url: r.content.url,
                  retrievedAt: r.content.retrieved_at,
                  content: {
                    type: r.content.content.type,
                    title: r.content.content.title,
                    citations: r.content.content.citations,
                    source: {
                      type: r.content.content.source.type,
                      mediaType: r.content.content.source.media_type,
                      data: r.content.content.source.data,
                    },
                  },
                },
              }))
            : r.content.type === "web_fetch_tool_result_error" &&
              q.push({
                type: "tool-result",
                toolCallId: r.tool_use_id,
                toolName: p.toCustomToolName("web_fetch"),
                isError: !0,
                result: { type: "web_fetch_tool_result_error", errorCode: r.content.error_code },
              });
          break;
        }
        case "web_search_tool_result": {
          if (Array.isArray(r.content)) {
            q.push({
              type: "tool-result",
              toolCallId: r.tool_use_id,
              toolName: p.toCustomToolName("web_search"),
              result: r.content.map((M) => {
                var I;
                return {
                  url: M.url,
                  title: M.title,
                  pageAge: (I = M.page_age) != null ? I : null,
                  encryptedContent: M.encrypted_content,
                  type: M.type,
                };
              }),
            });
            for (const M of r.content)
              q.push({
                type: "source",
                sourceType: "url",
                id: this.generateId(),
                url: M.url,
                title: M.title,
                providerMetadata: { anthropic: { pageAge: (s = M.page_age) != null ? s : null } },
              });
          } else
            q.push({
              type: "tool-result",
              toolCallId: r.tool_use_id,
              toolName: p.toCustomToolName("web_search"),
              isError: !0,
              result: { type: "web_search_tool_result_error", errorCode: r.content.error_code },
            });
          break;
        }
        case "code_execution_tool_result": {
          r.content.type === "code_execution_result"
            ? q.push({
                type: "tool-result",
                toolCallId: r.tool_use_id,
                toolName: p.toCustomToolName("code_execution"),
                result: {
                  type: r.content.type,
                  stdout: r.content.stdout,
                  stderr: r.content.stderr,
                  return_code: r.content.return_code,
                  content: (m = r.content.content) != null ? m : [],
                },
              })
            : r.content.type === "code_execution_tool_result_error" &&
              q.push({
                type: "tool-result",
                toolCallId: r.tool_use_id,
                toolName: p.toCustomToolName("code_execution"),
                isError: !0,
                result: {
                  type: "code_execution_tool_result_error",
                  errorCode: r.content.error_code,
                },
              });
          break;
        }
        case "bash_code_execution_tool_result":
        case "text_editor_code_execution_tool_result": {
          q.push({
            type: "tool-result",
            toolCallId: r.tool_use_id,
            toolName: p.toCustomToolName("code_execution"),
            result: r.content,
          });
          break;
        }
        case "tool_search_tool_result": {
          let M = te[r.tool_use_id];
          if (M == null) {
            const I = p.toCustomToolName("tool_search_tool_bm25"),
              z = p.toCustomToolName("tool_search_tool_regex");
            I !== "tool_search_tool_bm25"
              ? (M = "tool_search_tool_bm25")
              : (M = "tool_search_tool_regex");
          }
          r.content.type === "tool_search_tool_search_result"
            ? q.push({
                type: "tool-result",
                toolCallId: r.tool_use_id,
                toolName: p.toCustomToolName(M),
                result: r.content.tool_references.map((I) => ({
                  type: I.type,
                  toolName: I.tool_name,
                })),
              })
            : q.push({
                type: "tool-result",
                toolCallId: r.tool_use_id,
                toolName: p.toCustomToolName(M),
                isError: !0,
                result: { type: "tool_search_tool_result_error", errorCode: r.content.error_code },
              });
          break;
        }
      }
    return {
      content: q,
      finishReason: {
        unified: ge({ finishReason: R.stop_reason, isJsonResponseFromTool: $ }),
        raw: (T = R.stop_reason) != null ? T : void 0,
      },
      usage: Re(R.usage),
      request: { body: _ },
      response: {
        id: (j = R.id) != null ? j : void 0,
        modelId: (O = R.model) != null ? O : void 0,
        headers: L,
        body: re,
      },
      warnings: H,
      providerMetadata: (() => {
        var r, M, I, z, g;
        const ae = {
            usage: R.usage,
            cacheCreationInputTokens: (r = R.usage.cache_creation_input_tokens) != null ? r : null,
            stopSequence: (M = R.stop_sequence) != null ? M : null,
            container: R.container
              ? {
                  expiresAt: R.container.expires_at,
                  id: R.container.id,
                  skills:
                    (z =
                      (I = R.container.skills) == null
                        ? void 0
                        : I.map((G) => ({
                            type: G.type,
                            skillId: G.skill_id,
                            version: G.version,
                          }))) != null
                      ? z
                      : null,
                }
              : null,
            contextManagement: (g = Ee(R.context_management)) != null ? g : null,
          },
          ue = { anthropic: ae };
        return (ee && U !== "anthropic" && (ue[U] = ae), ue);
      })(),
    };
  }
  async doStream(n) {
    var c, s;
    const {
        args: m,
        warnings: T,
        betas: j,
        usesJsonResponseTool: O,
        toolNameMapping: _,
        providerOptionsName: H,
        usedCustomProviderKey: v,
      } = await this.getArgs({
        ...n,
        stream: !0,
        userSuppliedBetas: await this.getBetasFromHeaders(n.headers),
      }),
      oe = [...this.extractCitationDocuments(n.prompt)],
      p = this.buildRequestUrl(!0),
      { responseHeaders: U, value: ee } = await Te({
        url: p,
        headers: await this.getHeaders({ betas: j, headers: n.headers }),
        body: this.transformRequestBody(m),
        failedResponseHandler: Se,
        successfulResponseHandler: ze(tt),
        abortSignal: n.abortSignal,
        fetch: this.config.fetch,
      });
    let X = { unified: "other", raw: void 0 };
    const L = {
        input_tokens: 0,
        output_tokens: 0,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
      },
      R = {},
      re = {},
      q = {};
    let ne = null,
      te,
      $ = null,
      r = null,
      M = null,
      I = !1,
      z;
    const g = this.generateId,
      ae = ee.pipeThrough(
        new TransformStream({
          start(P) {
            P.enqueue({ type: "stream-start", warnings: T });
          },
          transform(P, h) {
            var N, Y, Z, Q, K, b, F, u, D, S, x, f, y;
            if (
              (n.includeRawChunks && h.enqueue({ type: "raw", rawValue: P.rawValue }), !P.success)
            ) {
              h.enqueue({ type: "error", error: P.error });
              return;
            }
            const i = P.value;
            switch (i.type) {
              case "ping":
                return;
              case "content_block_start": {
                const a = i.content_block,
                  w = a.type;
                switch (((z = w), w)) {
                  case "text": {
                    if (O) return;
                    ((R[i.index] = { type: "text" }),
                      h.enqueue({ type: "text-start", id: String(i.index) }));
                    return;
                  }
                  case "thinking": {
                    ((R[i.index] = { type: "reasoning" }),
                      h.enqueue({ type: "reasoning-start", id: String(i.index) }));
                    return;
                  }
                  case "redacted_thinking": {
                    ((R[i.index] = { type: "reasoning" }),
                      h.enqueue({
                        type: "reasoning-start",
                        id: String(i.index),
                        providerMetadata: { anthropic: { redactedData: a.data } },
                      }));
                    return;
                  }
                  case "tool_use": {
                    if (O && a.name === "json")
                      ((I = !0),
                        (R[i.index] = { type: "text" }),
                        h.enqueue({ type: "text-start", id: String(i.index) }));
                    else {
                      const d = a.caller,
                        se = d
                          ? { type: d.type, toolId: "tool_id" in d ? d.tool_id : void 0 }
                          : void 0,
                        ke =
                          a.input && Object.keys(a.input).length > 0 ? JSON.stringify(a.input) : "";
                      ((R[i.index] = {
                        type: "tool-call",
                        toolCallId: a.id,
                        toolName: a.name,
                        input: ke,
                        firstDelta: ke.length === 0,
                        ...(se && { caller: se }),
                      }),
                        h.enqueue({ type: "tool-input-start", id: a.id, toolName: a.name }));
                    }
                    return;
                  }
                  case "server_tool_use": {
                    if (
                      [
                        "web_fetch",
                        "web_search",
                        "code_execution",
                        "text_editor_code_execution",
                        "bash_code_execution",
                      ].includes(a.name)
                    ) {
                      const k =
                          a.name === "text_editor_code_execution" ||
                          a.name === "bash_code_execution"
                            ? "code_execution"
                            : a.name,
                        d = _.toCustomToolName(k);
                      ((R[i.index] = {
                        type: "tool-call",
                        toolCallId: a.id,
                        toolName: d,
                        input: "",
                        providerExecuted: !0,
                        firstDelta: !0,
                        providerToolName: a.name,
                      }),
                        h.enqueue({
                          type: "tool-input-start",
                          id: a.id,
                          toolName: d,
                          providerExecuted: !0,
                        }));
                    } else if (
                      a.name === "tool_search_tool_regex" ||
                      a.name === "tool_search_tool_bm25"
                    ) {
                      q[a.id] = a.name;
                      const k = _.toCustomToolName(a.name);
                      ((R[i.index] = {
                        type: "tool-call",
                        toolCallId: a.id,
                        toolName: k,
                        input: "",
                        providerExecuted: !0,
                        firstDelta: !0,
                        providerToolName: a.name,
                      }),
                        h.enqueue({
                          type: "tool-input-start",
                          id: a.id,
                          toolName: k,
                          providerExecuted: !0,
                        }));
                    }
                    return;
                  }
                  case "web_fetch_tool_result": {
                    a.content.type === "web_fetch_result"
                      ? (oe.push({
                          title: (N = a.content.content.title) != null ? N : a.content.url,
                          mediaType: a.content.content.source.media_type,
                        }),
                        h.enqueue({
                          type: "tool-result",
                          toolCallId: a.tool_use_id,
                          toolName: _.toCustomToolName("web_fetch"),
                          result: {
                            type: "web_fetch_result",
                            url: a.content.url,
                            retrievedAt: a.content.retrieved_at,
                            content: {
                              type: a.content.content.type,
                              title: a.content.content.title,
                              citations: a.content.content.citations,
                              source: {
                                type: a.content.content.source.type,
                                mediaType: a.content.content.source.media_type,
                                data: a.content.content.source.data,
                              },
                            },
                          },
                        }))
                      : a.content.type === "web_fetch_tool_result_error" &&
                        h.enqueue({
                          type: "tool-result",
                          toolCallId: a.tool_use_id,
                          toolName: _.toCustomToolName("web_fetch"),
                          isError: !0,
                          result: {
                            type: "web_fetch_tool_result_error",
                            errorCode: a.content.error_code,
                          },
                        });
                    return;
                  }
                  case "web_search_tool_result": {
                    if (Array.isArray(a.content)) {
                      h.enqueue({
                        type: "tool-result",
                        toolCallId: a.tool_use_id,
                        toolName: _.toCustomToolName("web_search"),
                        result: a.content.map((k) => {
                          var d;
                          return {
                            url: k.url,
                            title: k.title,
                            pageAge: (d = k.page_age) != null ? d : null,
                            encryptedContent: k.encrypted_content,
                            type: k.type,
                          };
                        }),
                      });
                      for (const k of a.content)
                        h.enqueue({
                          type: "source",
                          sourceType: "url",
                          id: g(),
                          url: k.url,
                          title: k.title,
                          providerMetadata: {
                            anthropic: { pageAge: (Y = k.page_age) != null ? Y : null },
                          },
                        });
                    } else
                      h.enqueue({
                        type: "tool-result",
                        toolCallId: a.tool_use_id,
                        toolName: _.toCustomToolName("web_search"),
                        isError: !0,
                        result: {
                          type: "web_search_tool_result_error",
                          errorCode: a.content.error_code,
                        },
                      });
                    return;
                  }
                  case "code_execution_tool_result": {
                    a.content.type === "code_execution_result"
                      ? h.enqueue({
                          type: "tool-result",
                          toolCallId: a.tool_use_id,
                          toolName: _.toCustomToolName("code_execution"),
                          result: {
                            type: a.content.type,
                            stdout: a.content.stdout,
                            stderr: a.content.stderr,
                            return_code: a.content.return_code,
                            content: (Z = a.content.content) != null ? Z : [],
                          },
                        })
                      : a.content.type === "code_execution_tool_result_error" &&
                        h.enqueue({
                          type: "tool-result",
                          toolCallId: a.tool_use_id,
                          toolName: _.toCustomToolName("code_execution"),
                          isError: !0,
                          result: {
                            type: "code_execution_tool_result_error",
                            errorCode: a.content.error_code,
                          },
                        });
                    return;
                  }
                  case "bash_code_execution_tool_result":
                  case "text_editor_code_execution_tool_result": {
                    h.enqueue({
                      type: "tool-result",
                      toolCallId: a.tool_use_id,
                      toolName: _.toCustomToolName("code_execution"),
                      result: a.content,
                    });
                    return;
                  }
                  case "tool_search_tool_result": {
                    let k = q[a.tool_use_id];
                    if (k == null) {
                      const d = _.toCustomToolName("tool_search_tool_bm25"),
                        se = _.toCustomToolName("tool_search_tool_regex");
                      d !== "tool_search_tool_bm25"
                        ? (k = "tool_search_tool_bm25")
                        : (k = "tool_search_tool_regex");
                    }
                    a.content.type === "tool_search_tool_search_result"
                      ? h.enqueue({
                          type: "tool-result",
                          toolCallId: a.tool_use_id,
                          toolName: _.toCustomToolName(k),
                          result: a.content.tool_references.map((d) => ({
                            type: d.type,
                            toolName: d.tool_name,
                          })),
                        })
                      : h.enqueue({
                          type: "tool-result",
                          toolCallId: a.tool_use_id,
                          toolName: _.toCustomToolName(k),
                          isError: !0,
                          result: {
                            type: "tool_search_tool_result_error",
                            errorCode: a.content.error_code,
                          },
                        });
                    return;
                  }
                  case "mcp_tool_use": {
                    ((re[a.id] = {
                      type: "tool-call",
                      toolCallId: a.id,
                      toolName: a.name,
                      input: JSON.stringify(a.input),
                      providerExecuted: !0,
                      dynamic: !0,
                      providerMetadata: {
                        anthropic: { type: "mcp-tool-use", serverName: a.server_name },
                      },
                    }),
                      h.enqueue(re[a.id]));
                    return;
                  }
                  case "mcp_tool_result": {
                    h.enqueue({
                      type: "tool-result",
                      toolCallId: a.tool_use_id,
                      toolName: re[a.tool_use_id].toolName,
                      isError: a.is_error,
                      result: a.content,
                      dynamic: !0,
                      providerMetadata: re[a.tool_use_id].providerMetadata,
                    });
                    return;
                  }
                  default: {
                    const k = w;
                    throw new Error(`Unsupported content block type: ${k}`);
                  }
                }
              }
              case "content_block_stop": {
                if (R[i.index] != null) {
                  const a = R[i.index];
                  switch (a.type) {
                    case "text": {
                      h.enqueue({ type: "text-end", id: String(i.index) });
                      break;
                    }
                    case "reasoning": {
                      h.enqueue({ type: "reasoning-end", id: String(i.index) });
                      break;
                    }
                    case "tool-call":
                      if (!(O && a.toolName === "json")) {
                        h.enqueue({ type: "tool-input-end", id: a.toolCallId });
                        let k = a.input === "" ? "{}" : a.input;
                        if (a.providerToolName === "code_execution")
                          try {
                            const d = JSON.parse(k);
                            d != null &&
                              typeof d == "object" &&
                              "code" in d &&
                              !("type" in d) &&
                              (k = JSON.stringify({ type: "programmatic-tool-call", ...d }));
                          } catch {}
                        h.enqueue({
                          type: "tool-call",
                          toolCallId: a.toolCallId,
                          toolName: a.toolName,
                          input: k,
                          providerExecuted: a.providerExecuted,
                          ...(a.caller && {
                            providerMetadata: { anthropic: { caller: a.caller } },
                          }),
                        });
                      }
                      break;
                  }
                  delete R[i.index];
                }
                z = void 0;
                return;
              }
              case "content_block_delta": {
                const a = i.delta.type;
                switch (a) {
                  case "text_delta": {
                    if (O) return;
                    h.enqueue({ type: "text-delta", id: String(i.index), delta: i.delta.text });
                    return;
                  }
                  case "thinking_delta": {
                    h.enqueue({
                      type: "reasoning-delta",
                      id: String(i.index),
                      delta: i.delta.thinking,
                    });
                    return;
                  }
                  case "signature_delta": {
                    z === "thinking" &&
                      h.enqueue({
                        type: "reasoning-delta",
                        id: String(i.index),
                        delta: "",
                        providerMetadata: { anthropic: { signature: i.delta.signature } },
                      });
                    return;
                  }
                  case "input_json_delta": {
                    const w = R[i.index];
                    let k = i.delta.partial_json;
                    if (k.length === 0) return;
                    if (I) {
                      if (w?.type !== "text") return;
                      h.enqueue({ type: "text-delta", id: String(i.index), delta: k });
                    } else {
                      if (w?.type !== "tool-call") return;
                      (w.firstDelta &&
                        (w.providerToolName === "bash_code_execution" ||
                          w.providerToolName === "text_editor_code_execution") &&
                        (k = `{"type": "${w.providerToolName}",${k.substring(1)}`),
                        h.enqueue({ type: "tool-input-delta", id: w.toolCallId, delta: k }),
                        (w.input += k),
                        (w.firstDelta = !1));
                    }
                    return;
                  }
                  case "citations_delta": {
                    const w = i.delta.citation,
                      k = qe(w, oe, g);
                    k && h.enqueue(k);
                    return;
                  }
                  default: {
                    const w = a;
                    throw new Error(`Unsupported delta type: ${w}`);
                  }
                }
              }
              case "message_start": {
                if (
                  ((L.input_tokens = i.message.usage.input_tokens),
                  (L.cache_read_input_tokens =
                    (Q = i.message.usage.cache_read_input_tokens) != null ? Q : 0),
                  (L.cache_creation_input_tokens =
                    (K = i.message.usage.cache_creation_input_tokens) != null ? K : 0),
                  (te = { ...i.message.usage }),
                  ($ = (b = i.message.usage.cache_creation_input_tokens) != null ? b : null),
                  i.message.container != null &&
                    (M = {
                      expiresAt: i.message.container.expires_at,
                      id: i.message.container.id,
                      skills: null,
                    }),
                  i.message.stop_reason != null &&
                    (X = {
                      unified: ge({
                        finishReason: i.message.stop_reason,
                        isJsonResponseFromTool: I,
                      }),
                      raw: i.message.stop_reason,
                    }),
                  h.enqueue({
                    type: "response-metadata",
                    id: (F = i.message.id) != null ? F : void 0,
                    modelId: (u = i.message.model) != null ? u : void 0,
                  }),
                  i.message.content != null)
                )
                  for (let a = 0; a < i.message.content.length; a++) {
                    const w = i.message.content[a];
                    if (w.type === "tool_use") {
                      const k = w.caller,
                        d = k
                          ? { type: k.type, toolId: "tool_id" in k ? k.tool_id : void 0 }
                          : void 0;
                      h.enqueue({ type: "tool-input-start", id: w.id, toolName: w.name });
                      const se = JSON.stringify((D = w.input) != null ? D : {});
                      (h.enqueue({ type: "tool-input-delta", id: w.id, delta: se }),
                        h.enqueue({ type: "tool-input-end", id: w.id }),
                        h.enqueue({
                          type: "tool-call",
                          toolCallId: w.id,
                          toolName: w.name,
                          input: se,
                          ...(d && { providerMetadata: { anthropic: { caller: d } } }),
                        }));
                    }
                  }
                return;
              }
              case "message_delta": {
                (i.usage.input_tokens != null &&
                  L.input_tokens !== i.usage.input_tokens &&
                  (L.input_tokens = i.usage.input_tokens),
                  (L.output_tokens = i.usage.output_tokens),
                  i.usage.cache_read_input_tokens != null &&
                    (L.cache_read_input_tokens = i.usage.cache_read_input_tokens),
                  i.usage.cache_creation_input_tokens != null &&
                    ((L.cache_creation_input_tokens = i.usage.cache_creation_input_tokens),
                    ($ = i.usage.cache_creation_input_tokens)),
                  (X = {
                    unified: ge({ finishReason: i.delta.stop_reason, isJsonResponseFromTool: I }),
                    raw: (S = i.delta.stop_reason) != null ? S : void 0,
                  }),
                  (r = (x = i.delta.stop_sequence) != null ? x : null),
                  (M =
                    i.delta.container != null
                      ? {
                          expiresAt: i.delta.container.expires_at,
                          id: i.delta.container.id,
                          skills:
                            (y =
                              (f = i.delta.container.skills) == null
                                ? void 0
                                : f.map((a) => ({
                                    type: a.type,
                                    skillId: a.skill_id,
                                    version: a.version,
                                  }))) != null
                              ? y
                              : null,
                        }
                      : null),
                  i.context_management && (ne = Ee(i.context_management)),
                  (te = { ...te, ...i.usage }));
                return;
              }
              case "message_stop": {
                const a = {
                    usage: te ?? null,
                    cacheCreationInputTokens: $,
                    stopSequence: r,
                    container: M,
                    contextManagement: ne,
                  },
                  w = { anthropic: a };
                (v && H !== "anthropic" && (w[H] = a),
                  h.enqueue({
                    type: "finish",
                    finishReason: X,
                    usage: Re(L),
                    providerMetadata: w,
                  }));
                return;
              }
              case "error": {
                h.enqueue({ type: "error", error: i.error });
                return;
              }
              default: {
                const a = i;
                throw new Error(`Unsupported chunk type: ${a}`);
              }
            }
          },
        })
      ),
      [ue, G] = ae.tee(),
      B = ue.getReader();
    try {
      await B.read();
      let P = await B.read();
      if (
        (((c = P.value) == null ? void 0 : c.type) === "raw" && (P = await B.read()),
        ((s = P.value) == null ? void 0 : s.type) === "error")
      ) {
        const h = P.value.error;
        throw new Fe({
          message: h.message,
          url: p,
          requestBodyValues: m,
          statusCode: h.type === "overloaded_error" ? 529 : 500,
          responseHeaders: U,
          responseBody: JSON.stringify(h),
          isRetryable: h.type === "overloaded_error",
        });
      }
    } finally {
      (B.cancel().catch(() => {}), B.releaseLock());
    }
    return { stream: G, request: { body: m }, response: { headers: U } };
  }
};
function Rt(n) {
  return n.includes("claude-opus-4-6")
    ? { maxOutputTokens: 128e3, supportsStructuredOutput: !0, isKnownModel: !0 }
    : n.includes("claude-sonnet-4-5") ||
        n.includes("claude-opus-4-5") ||
        n.includes("claude-haiku-4-5")
      ? { maxOutputTokens: 64e3, supportsStructuredOutput: !0, isKnownModel: !0 }
      : n.includes("claude-opus-4-1")
        ? { maxOutputTokens: 32e3, supportsStructuredOutput: !0, isKnownModel: !0 }
        : n.includes("claude-sonnet-4-") || n.includes("claude-3-7-sonnet")
          ? { maxOutputTokens: 64e3, supportsStructuredOutput: !1, isKnownModel: !0 }
          : n.includes("claude-opus-4-")
            ? { maxOutputTokens: 32e3, supportsStructuredOutput: !1, isKnownModel: !0 }
            : n.includes("claude-3-5-haiku")
              ? { maxOutputTokens: 8192, supportsStructuredOutput: !1, isKnownModel: !0 }
              : n.includes("claude-3-haiku")
                ? { maxOutputTokens: 4096, supportsStructuredOutput: !1, isKnownModel: !0 }
                : { maxOutputTokens: 4096, supportsStructuredOutput: !1, isKnownModel: !1 };
}
function Ee(n) {
  return n
    ? {
        appliedEdits: n.applied_edits
          .map((c) => {
            switch (c.type) {
              case "clear_tool_uses_20250919":
                return {
                  type: c.type,
                  clearedToolUses: c.cleared_tool_uses,
                  clearedInputTokens: c.cleared_input_tokens,
                };
              case "clear_thinking_20251015":
                return {
                  type: c.type,
                  clearedThinkingTurns: c.cleared_thinking_turns,
                  clearedInputTokens: c.cleared_input_tokens,
                };
            }
          })
          .filter((c) => c !== void 0),
      }
    : null;
}
var qt = E(() => A(t({ command: e(), restart: W().optional() }))),
  Et = ie({ id: "anthropic.bash_20241022", inputSchema: qt }),
  At = E(() => A(t({ command: e(), restart: W().optional() }))),
  jt = ie({ id: "anthropic.bash_20250124", inputSchema: At }),
  $t = E(() =>
    A(
      t({
        action: le([
          "key",
          "type",
          "mouse_move",
          "left_click",
          "left_click_drag",
          "right_click",
          "middle_click",
          "double_click",
          "screenshot",
          "cursor_position",
        ]),
        coordinate: C(l().int()).optional(),
        text: e().optional(),
      })
    )
  ),
  Ut = ie({ id: "anthropic.computer_20241022", inputSchema: $t }),
  Dt = E(() =>
    A(
      t({
        action: le([
          "key",
          "hold_key",
          "type",
          "cursor_position",
          "mouse_move",
          "left_mouse_down",
          "left_mouse_up",
          "left_click",
          "left_click_drag",
          "right_click",
          "middle_click",
          "double_click",
          "triple_click",
          "scroll",
          "wait",
          "screenshot",
        ]),
        coordinate: de([l().int(), l().int()]).optional(),
        duration: l().optional(),
        scroll_amount: l().optional(),
        scroll_direction: le(["up", "down", "left", "right"]).optional(),
        start_coordinate: de([l().int(), l().int()]).optional(),
        text: e().optional(),
      })
    )
  ),
  Bt = ie({ id: "anthropic.computer_20250124", inputSchema: Dt }),
  Jt = E(() =>
    A(
      t({
        action: le([
          "key",
          "hold_key",
          "type",
          "cursor_position",
          "mouse_move",
          "left_mouse_down",
          "left_mouse_up",
          "left_click",
          "left_click_drag",
          "right_click",
          "middle_click",
          "double_click",
          "triple_click",
          "scroll",
          "wait",
          "screenshot",
          "zoom",
        ]),
        coordinate: de([l().int(), l().int()]).optional(),
        duration: l().optional(),
        region: de([l().int(), l().int(), l().int(), l().int()]).optional(),
        scroll_amount: l().optional(),
        scroll_direction: le(["up", "down", "left", "right"]).optional(),
        start_coordinate: de([l().int(), l().int()]).optional(),
        text: e().optional(),
      })
    )
  ),
  Ht = ie({ id: "anthropic.computer_20251124", inputSchema: Jt }),
  Lt = E(() =>
    A(
      V("command", [
        t({ command: o("view"), path: e(), view_range: de([l(), l()]).optional() }),
        t({ command: o("create"), path: e(), file_text: e() }),
        t({ command: o("str_replace"), path: e(), old_str: e(), new_str: e() }),
        t({ command: o("insert"), path: e(), insert_line: l(), insert_text: e() }),
        t({ command: o("delete"), path: e() }),
        t({ command: o("rename"), old_path: e(), new_path: e() }),
      ])
    )
  ),
  Pt = ie({ id: "anthropic.memory_20250818", inputSchema: Lt }),
  Kt = E(() =>
    A(
      t({
        command: le(["view", "create", "str_replace", "insert", "undo_edit"]),
        path: e(),
        file_text: e().optional(),
        insert_line: l().int().optional(),
        new_str: e().optional(),
        insert_text: e().optional(),
        old_str: e().optional(),
        view_range: C(l().int()).optional(),
      })
    )
  ),
  Vt = ie({ id: "anthropic.text_editor_20241022", inputSchema: Kt }),
  zt = E(() =>
    A(
      t({
        command: le(["view", "create", "str_replace", "insert", "undo_edit"]),
        path: e(),
        file_text: e().optional(),
        insert_line: l().int().optional(),
        new_str: e().optional(),
        insert_text: e().optional(),
        old_str: e().optional(),
        view_range: C(l().int()).optional(),
      })
    )
  ),
  Ft = ie({ id: "anthropic.text_editor_20250124", inputSchema: zt }),
  Wt = E(() =>
    A(
      t({
        command: le(["view", "create", "str_replace", "insert"]),
        path: e(),
        file_text: e().optional(),
        insert_line: l().int().optional(),
        new_str: e().optional(),
        insert_text: e().optional(),
        old_str: e().optional(),
        view_range: C(l().int()).optional(),
      })
    )
  ),
  Gt = ie({ id: "anthropic.text_editor_20250429", inputSchema: Wt }),
  Xt = E(() => A(C(t({ type: o("tool_reference"), toolName: e() })))),
  Yt = E(() => A(t({ query: e(), limit: l().optional() }))),
  Zt = _e({
    id: "anthropic.tool_search_bm25_20251119",
    inputSchema: Yt,
    outputSchema: Xt,
    supportsDeferredResults: !0,
  }),
  Qt = (n = {}) => Zt(n),
  eo = {
    bash_20241022: Et,
    bash_20250124: jt,
    codeExecution_20250522: xt,
    codeExecution_20250825: kt,
    computer_20241022: Ut,
    computer_20250124: Bt,
    computer_20251124: Ht,
    memory_20250818: Pt,
    textEditor_20241022: Vt,
    textEditor_20250124: Ft,
    textEditor_20250429: Gt,
    textEditor_20250728: st,
    webFetch_20250910: mt,
    webSearch_20250305: pt,
    toolSearchRegex_20251119: Tt,
    toolSearchBm25_20251119: Qt,
  };
function to(n = {}) {
  var c, s;
  const m =
      (c = Je(He({ settingValue: n.baseURL, environmentVariableName: "ANTHROPIC_BASE_URL" }))) !=
      null
        ? c
        : "https://api.anthropic.com/v1",
    T = (s = n.name) != null ? s : "anthropic.messages";
  if (n.apiKey && n.authToken)
    throw new Le({
      argument: "apiKey/authToken",
      message:
        "Both apiKey and authToken were provided. Please use only one authentication method.",
    });
  const j = () => {
      const H = n.authToken
        ? { Authorization: `Bearer ${n.authToken}` }
        : {
            "x-api-key": We({
              apiKey: n.apiKey,
              environmentVariableName: "ANTHROPIC_API_KEY",
              description: "Anthropic",
            }),
          };
      return Ge(
        { "anthropic-version": "2023-06-01", ...H, ...n.headers },
        `ai-sdk/anthropic/${Ze}`
      );
    },
    O = (H) => {
      var v;
      return new Mt(H, {
        provider: T,
        baseURL: m,
        headers: j,
        fetch: n.fetch,
        generateId: (v = n.generateId) != null ? v : Ae,
        supportedUrls: () => ({
          "image/*": [/^https?:\/\/.*$/],
          "application/pdf": [/^https?:\/\/.*$/],
        }),
      });
    },
    _ = function (H) {
      if (new.target)
        throw new Error("The Anthropic model function cannot be called with the new keyword.");
      return O(H);
    };
  return (
    (_.specificationVersion = "v3"),
    (_.languageModel = O),
    (_.chat = O),
    (_.messages = O),
    (_.embeddingModel = (H) => {
      throw new we({ modelId: H, modelType: "embeddingModel" });
    }),
    (_.textEmbeddingModel = _.embeddingModel),
    (_.imageModel = (H) => {
      throw new we({ modelId: H, modelType: "imageModel" });
    }),
    (_.tools = eo),
    _
  );
}
var so = to();
function io({ steps: n }) {
  var c, s, m;
  for (let T = n.length - 1; T >= 0; T--) {
    const j =
      (m =
        (s = (c = n[T].providerMetadata) == null ? void 0 : c.anthropic) == null
          ? void 0
          : s.container) == null
        ? void 0
        : m.id;
    if (j) return { providerOptions: { anthropic: { container: { id: j } } } };
  }
}
export {
  Ze as VERSION,
  so as anthropic,
  to as createAnthropic,
  io as forwardAnthropicContainerIdFromLastStep,
};
