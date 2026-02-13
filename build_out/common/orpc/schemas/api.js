"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelPresets =
  exports.ModelPresetSchema =
  exports.PresetModelEntrySchema =
  exports.debug =
  exports.voice =
  exports.menu =
  exports.general =
  exports.features =
  exports.update =
  exports.splashScreens =
  exports.uiLayouts =
  exports.config =
  exports.server =
  exports.ApiServerStatusSchema =
  exports.terminal =
  exports.window =
  exports.nameGeneration =
  exports.agentSkills =
  exports.agents =
  exports.tasks =
  exports.workspace =
  exports.CoderWorkspaceStatusSchema =
  exports.CoderWorkspaceSchema =
  exports.CoderWorkspaceConfigSchema =
  exports.CoderTemplateSchema =
  exports.CoderPresetSchema =
  exports.CoderInfoSchema =
  exports.coder =
  exports.secrets =
  exports.mcp =
  exports.projects =
  exports.mcpOauth =
  exports.muxGateway =
  exports.codexOauth =
  exports.muxGovernorOauth =
  exports.copilotOauth =
  exports.muxGatewayOauth =
  exports.policy =
  exports.providers =
  exports.ProvidersConfigMapSchema =
  exports.ProviderConfigInfoSchema =
  exports.CustomModelMetadataSchema =
  exports.AWSCredentialStatusSchema =
  exports.tokenizer =
  exports.BackgroundProcessInfoSchema =
  exports.signing =
  exports.TelemetryEventSchema =
  exports.telemetry =
  exports.experiments =
  exports.ExperimentValueSchema =
    void 0;
exports.costTracking =
  exports.ModelCostBreakdownSchema =
  exports.CostSummaryTotalsSchema =
  exports.CostHistoryRangeSchema =
  exports.DailySummarySchema =
  exports.CostEntrySchema =
  exports.modelHealth =
  exports.HealthCheckResultSchema =
  exports.CheckResultSchema =
  exports.OverallStatusSchema =
  exports.CheckStatusSchema =
    void 0;
const server_1 = require("@orpc/server");
const mode_1 = require("../../types/mode");
const zod_1 = require("zod");
const chatStats_1 = require("./chatStats");
const errors_1 = require("./errors");
const message_1 = require("./message");
const project_1 = require("./project");
const result_1 = require("./result");
const runtime_1 = require("./runtime");
const secrets_1 = require("./secrets");
const stream_1 = require("./stream");
const uiLayouts_1 = require("./uiLayouts");
const terminal_1 = require("./terminal");
const tools_1 = require("./tools");
const workspaceStats_1 = require("./workspaceStats");
const workspace_1 = require("./workspace");
const workspaceAiSettings_1 = require("./workspaceAiSettings");
const agentSkill_1 = require("./agentSkill");
const agentDefinition_1 = require("./agentDefinition");
const mcp_1 = require("./mcp");
const policy_1 = require("./policy");
// Experiments
exports.ExperimentValueSchema = zod_1.z.object({
  value: zod_1.z.union([zod_1.z.string(), zod_1.z.boolean(), zod_1.z.null()]),
  source: zod_1.z.enum(["posthog", "cache", "disabled"]),
});
exports.experiments = {
  getAll: {
    input: zod_1.z.void(),
    output: zod_1.z.record(zod_1.z.string(), exports.ExperimentValueSchema),
  },
  reload: {
    input: zod_1.z.void(),
    output: zod_1.z.void(),
  },
};
// Re-export telemetry schemas
const telemetry_1 = require("./telemetry");
Object.defineProperty(exports, "telemetry", {
  enumerable: true,
  get: function () {
    return telemetry_1.telemetry;
  },
});
Object.defineProperty(exports, "TelemetryEventSchema", {
  enumerable: true,
  get: function () {
    return telemetry_1.TelemetryEventSchema;
  },
});
// Re-export signing schemas
const signing_1 = require("./signing");
Object.defineProperty(exports, "signing", {
  enumerable: true,
  get: function () {
    return signing_1.signing;
  },
});
// --- API Router Schemas ---
// Background process info (for UI display)
exports.BackgroundProcessInfoSchema = zod_1.z.object({
  id: zod_1.z.string(),
  pid: zod_1.z.number(),
  script: zod_1.z.string(),
  displayName: zod_1.z.string().optional(),
  startTime: zod_1.z.number(),
  status: zod_1.z.enum(["running", "exited", "killed", "failed"]),
  exitCode: zod_1.z.number().optional(),
});
// Tokenizer
exports.tokenizer = {
  countTokens: {
    input: zod_1.z.object({ model: zod_1.z.string(), text: zod_1.z.string() }),
    output: zod_1.z.number(),
  },
  countTokensBatch: {
    input: zod_1.z.object({ model: zod_1.z.string(), texts: zod_1.z.array(zod_1.z.string()) }),
    output: zod_1.z.array(zod_1.z.number()),
  },
  calculateStats: {
    input: zod_1.z.object({
      workspaceId: zod_1.z.string(),
      messages: zod_1.z.array(message_1.MuxMessageSchema),
      model: zod_1.z.string(),
    }),
    output: chatStats_1.ChatStatsSchema,
  },
};
// Providers
exports.AWSCredentialStatusSchema = zod_1.z.object({
  region: zod_1.z.string().optional(),
  /** Optional AWS shared config profile name (equivalent to AWS_PROFILE). */
  profile: zod_1.z.string().optional(),
  bearerTokenSet: zod_1.z.boolean(),
  accessKeyIdSet: zod_1.z.boolean(),
  secretAccessKeySet: zod_1.z.boolean(),
});
exports.CustomModelMetadataSchema = zod_1.z.object({
  maxInputTokens: zod_1.z.number().int().positive().optional(),
  maxOutputTokens: zod_1.z.number().int().positive().optional(),
  inputCostPerToken: zod_1.z.number().nonnegative().optional(),
  outputCostPerToken: zod_1.z.number().nonnegative().optional(),
  cacheCreationInputTokenCost: zod_1.z.number().nonnegative().optional(),
  cacheReadInputTokenCost: zod_1.z.number().nonnegative().optional(),
});
exports.ProviderConfigInfoSchema = zod_1.z.object({
  apiKeySet: zod_1.z.boolean(),
  /** Whether this provider is configured and ready to use */
  isConfigured: zod_1.z.boolean(),
  baseUrl: zod_1.z.string().optional(),
  models: zod_1.z.array(zod_1.z.string()).optional(),
  /** OpenAI-specific fields */
  serviceTier: zod_1.z.enum(["auto", "default", "flex", "priority"]).optional(),
  /** OpenAI-only: whether Codex OAuth tokens are present in providers.jsonc */
  codexOauthSet: zod_1.z.boolean().optional(),
  /**
   * OpenAI-only: default auth precedence to use for Codex-OAuth-allowed models when BOTH
   * ChatGPT OAuth and an OpenAI API key are configured.
   */
  codexOauthDefaultAuth: zod_1.z.enum(["oauth", "apiKey"]).optional(),
  /** AWS-specific fields (only present for bedrock provider) */
  aws: exports.AWSCredentialStatusSchema.optional(),
  /** Mux Gateway-specific fields */
  couponCodeSet: zod_1.z.boolean().optional(),
  /** Custom model metadata (overrides defaults layer) */
  modelMetadata: zod_1.z.record(zod_1.z.string(), exports.CustomModelMetadataSchema).optional(),
});
exports.ProvidersConfigMapSchema = zod_1.z.record(
  zod_1.z.string(),
  exports.ProviderConfigInfoSchema
);
exports.providers = {
  setProviderConfig: {
    input: zod_1.z.object({
      provider: zod_1.z.string(),
      keyPath: zod_1.z.array(zod_1.z.string()),
      value: zod_1.z.string(),
    }),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  getConfig: {
    input: zod_1.z.void(),
    output: exports.ProvidersConfigMapSchema,
  },
  setModelMetadata: {
    input: zod_1.z.object({
      provider: zod_1.z.string(),
      modelId: zod_1.z.string(),
      metadata: exports.CustomModelMetadataSchema,
    }),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  setModels: {
    input: zod_1.z.object({
      provider: zod_1.z.string(),
      models: zod_1.z.array(zod_1.z.string()),
    }),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  list: {
    input: zod_1.z.void(),
    output: zod_1.z.array(zod_1.z.string()),
  },
  // Subscription: emits when provider config changes (API keys, models, etc.)
  onConfigChanged: {
    input: zod_1.z.void(),
    output: (0, server_1.eventIterator)(zod_1.z.void()),
  },
};
// Policy (admin-enforced config)
exports.policy = {
  get: {
    input: zod_1.z.void(),
    output: policy_1.PolicyGetResponseSchema,
  },
  // Subscription: emits when the effective policy changes (file refresh)
  onChanged: {
    input: zod_1.z.void(),
    output: (0, server_1.eventIterator)(zod_1.z.void()),
  },
  // Force a refresh of the effective policy (re-reads MUX_POLICY_FILE or Governor policy)
  refreshNow: {
    input: zod_1.z.void(),
    output: (0, result_1.ResultSchema)(policy_1.PolicyGetResponseSchema, zod_1.z.string()),
  },
};
// Mux Gateway OAuth (desktop login flow)
exports.muxGatewayOauth = {
  startDesktopFlow: {
    input: zod_1.z.void(),
    output: (0, result_1.ResultSchema)(
      zod_1.z.object({
        flowId: zod_1.z.string(),
        authorizeUrl: zod_1.z.string(),
        redirectUri: zod_1.z.string(),
      }),
      zod_1.z.string()
    ),
  },
  waitForDesktopFlow: {
    input: zod_1.z
      .object({
        flowId: zod_1.z.string(),
        timeoutMs: zod_1.z.number().int().positive().optional(),
      })
      .strict(),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  cancelDesktopFlow: {
    input: zod_1.z.object({ flowId: zod_1.z.string() }).strict(),
    output: zod_1.z.void(),
  },
};
// GitHub Copilot OAuth (Device Code Flow)
exports.copilotOauth = {
  startDeviceFlow: {
    input: zod_1.z.void(),
    output: (0, result_1.ResultSchema)(
      zod_1.z.object({
        flowId: zod_1.z.string(),
        verificationUri: zod_1.z.string(),
        userCode: zod_1.z.string(),
      }),
      zod_1.z.string()
    ),
  },
  waitForDeviceFlow: {
    input: zod_1.z
      .object({
        flowId: zod_1.z.string(),
        timeoutMs: zod_1.z.number().int().positive().optional(),
      })
      .strict(),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  cancelDeviceFlow: {
    input: zod_1.z.object({ flowId: zod_1.z.string() }).strict(),
    output: zod_1.z.void(),
  },
};
// Mux Governor OAuth (enrollment for enterprise policy service)
exports.muxGovernorOauth = {
  startDesktopFlow: {
    input: zod_1.z.object({ governorOrigin: zod_1.z.string() }).strict(),
    output: (0, result_1.ResultSchema)(
      zod_1.z.object({
        flowId: zod_1.z.string(),
        authorizeUrl: zod_1.z.string(),
        redirectUri: zod_1.z.string(),
      }),
      zod_1.z.string()
    ),
  },
  waitForDesktopFlow: {
    input: zod_1.z
      .object({
        flowId: zod_1.z.string(),
        timeoutMs: zod_1.z.number().int().positive().optional(),
      })
      .strict(),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  cancelDesktopFlow: {
    input: zod_1.z.object({ flowId: zod_1.z.string() }).strict(),
    output: zod_1.z.void(),
  },
};
// Codex OAuth (ChatGPT subscription auth)
exports.codexOauth = {
  startDesktopFlow: {
    input: zod_1.z.void(),
    output: (0, result_1.ResultSchema)(
      zod_1.z.object({ flowId: zod_1.z.string(), authorizeUrl: zod_1.z.string() }),
      zod_1.z.string()
    ),
  },
  waitForDesktopFlow: {
    input: zod_1.z
      .object({
        flowId: zod_1.z.string(),
        timeoutMs: zod_1.z.number().int().positive().optional(),
      })
      .strict(),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  cancelDesktopFlow: {
    input: zod_1.z.object({ flowId: zod_1.z.string() }).strict(),
    output: zod_1.z.void(),
  },
  startDeviceFlow: {
    input: zod_1.z.void(),
    output: (0, result_1.ResultSchema)(
      zod_1.z.object({
        flowId: zod_1.z.string(),
        userCode: zod_1.z.string(),
        verifyUrl: zod_1.z.string(),
        intervalSeconds: zod_1.z.number().int().positive(),
      }),
      zod_1.z.string()
    ),
  },
  waitForDeviceFlow: {
    input: zod_1.z
      .object({
        flowId: zod_1.z.string(),
        timeoutMs: zod_1.z.number().int().positive().optional(),
      })
      .strict(),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  cancelDeviceFlow: {
    input: zod_1.z.object({ flowId: zod_1.z.string() }).strict(),
    output: zod_1.z.void(),
  },
  disconnect: {
    input: zod_1.z.void(),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
};
// Mux Gateway
exports.muxGateway = {
  getAccountStatus: {
    input: zod_1.z.void(),
    output: (0, result_1.ResultSchema)(
      zod_1.z.object({
        remaining_microdollars: zod_1.z.number().int().nonnegative(),
        ai_gateway_concurrent_requests_per_user: zod_1.z.number().int().nonnegative(),
      }),
      zod_1.z.string()
    ),
  },
};
const MCPOAuthPendingServerSchema = zod_1.z
  .object({
    // OAuth is only supported for remote transports.
    transport: zod_1.z.union([
      zod_1.z.literal("http"),
      zod_1.z.literal("sse"),
      zod_1.z.literal("auto"),
    ]),
    url: zod_1.z.string(),
  })
  .strict();
// MCP OAuth
exports.mcpOauth = {
  startDesktopFlow: {
    input: zod_1.z
      .object({
        projectPath: zod_1.z.string().optional(),
        serverName: zod_1.z.string(),
        pendingServer: MCPOAuthPendingServerSchema.optional(),
      })
      .strict(),
    output: (0, result_1.ResultSchema)(
      zod_1.z.object({
        flowId: zod_1.z.string(),
        authorizeUrl: zod_1.z.string(),
        redirectUri: zod_1.z.string(),
      }),
      zod_1.z.string()
    ),
  },
  waitForDesktopFlow: {
    input: zod_1.z
      .object({
        flowId: zod_1.z.string(),
        timeoutMs: zod_1.z.number().int().positive().optional(),
      })
      .strict(),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  cancelDesktopFlow: {
    input: zod_1.z.object({ flowId: zod_1.z.string() }).strict(),
    output: zod_1.z.void(),
  },
  startServerFlow: {
    input: zod_1.z
      .object({
        projectPath: zod_1.z.string().optional(),
        serverName: zod_1.z.string(),
        pendingServer: MCPOAuthPendingServerSchema.optional(),
      })
      .strict(),
    output: (0, result_1.ResultSchema)(
      zod_1.z.object({
        flowId: zod_1.z.string(),
        authorizeUrl: zod_1.z.string(),
        redirectUri: zod_1.z.string(),
      }),
      zod_1.z.string()
    ),
  },
  waitForServerFlow: {
    input: zod_1.z
      .object({
        flowId: zod_1.z.string(),
        timeoutMs: zod_1.z.number().int().positive().optional(),
      })
      .strict(),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  cancelServerFlow: {
    input: zod_1.z.object({ flowId: zod_1.z.string() }).strict(),
    output: zod_1.z.void(),
  },
  getAuthStatus: {
    input: zod_1.z.object({ serverUrl: zod_1.z.string() }).strict(),
    output: zod_1.z.object({
      serverUrl: zod_1.z.string().optional(),
      isLoggedIn: zod_1.z.boolean(),
      hasRefreshToken: zod_1.z.boolean(),
      scope: zod_1.z.string().optional(),
      updatedAtMs: zod_1.z.number().optional(),
    }),
  },
  logout: {
    input: zod_1.z.object({ serverUrl: zod_1.z.string() }).strict(),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
};
// Projects
exports.projects = {
  create: {
    input: zod_1.z.object({ projectPath: zod_1.z.string() }),
    output: (0, result_1.ResultSchema)(
      zod_1.z.object({
        projectConfig: project_1.ProjectConfigSchema,
        normalizedPath: zod_1.z.string(),
      }),
      zod_1.z.string()
    ),
  },
  pickDirectory: {
    input: zod_1.z.void(),
    output: zod_1.z.string().nullable(),
  },
  remove: {
    input: zod_1.z.object({ projectPath: zod_1.z.string() }),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  list: {
    input: zod_1.z.void(),
    output: zod_1.z.array(zod_1.z.tuple([zod_1.z.string(), project_1.ProjectConfigSchema])),
  },
  getFileCompletions: {
    input: zod_1.z
      .object({
        projectPath: zod_1.z.string(),
        query: zod_1.z.string(),
        limit: zod_1.z.number().int().positive().max(50).optional(),
      })
      .strict(),
    output: zod_1.z.object({ paths: zod_1.z.array(zod_1.z.string()) }),
  },
  runtimeAvailability: {
    input: zod_1.z.object({ projectPath: zod_1.z.string() }),
    output: runtime_1.RuntimeAvailabilitySchema,
  },
  listBranches: {
    input: zod_1.z.object({ projectPath: zod_1.z.string() }),
    output: message_1.BranchListResultSchema,
  },
  gitInit: {
    input: zod_1.z.object({ projectPath: zod_1.z.string() }),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  mcp: {
    list: {
      input: zod_1.z.object({ projectPath: zod_1.z.string() }),
      output: mcp_1.MCPServerMapSchema,
    },
    add: {
      input: mcp_1.MCPAddParamsSchema,
      output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
    },
    remove: {
      input: mcp_1.MCPRemoveParamsSchema,
      output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
    },
    test: {
      input: mcp_1.MCPTestParamsSchema,
      output: mcp_1.MCPTestResultSchema,
    },
    setEnabled: {
      input: mcp_1.MCPSetEnabledParamsSchema,
      output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
    },
    setToolAllowlist: {
      input: mcp_1.MCPSetToolAllowlistParamsSchema,
      output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
    },
  },
  mcpOauth: {
    startDesktopFlow: {
      input: zod_1.z
        .object({
          projectPath: zod_1.z.string(),
          serverName: zod_1.z.string(),
          pendingServer: MCPOAuthPendingServerSchema.optional(),
        })
        .strict(),
      output: (0, result_1.ResultSchema)(
        zod_1.z.object({
          flowId: zod_1.z.string(),
          authorizeUrl: zod_1.z.string(),
          redirectUri: zod_1.z.string(),
        }),
        zod_1.z.string()
      ),
    },
    waitForDesktopFlow: {
      input: zod_1.z
        .object({
          flowId: zod_1.z.string(),
          timeoutMs: zod_1.z.number().int().positive().optional(),
        })
        .strict(),
      output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
    },
    cancelDesktopFlow: {
      input: zod_1.z.object({ flowId: zod_1.z.string() }).strict(),
      output: zod_1.z.void(),
    },
    startServerFlow: {
      input: zod_1.z
        .object({
          projectPath: zod_1.z.string(),
          serverName: zod_1.z.string(),
          pendingServer: MCPOAuthPendingServerSchema.optional(),
        })
        .strict(),
      output: (0, result_1.ResultSchema)(
        zod_1.z.object({
          flowId: zod_1.z.string(),
          authorizeUrl: zod_1.z.string(),
          redirectUri: zod_1.z.string(),
        }),
        zod_1.z.string()
      ),
    },
    waitForServerFlow: {
      input: zod_1.z
        .object({
          flowId: zod_1.z.string(),
          timeoutMs: zod_1.z.number().int().positive().optional(),
        })
        .strict(),
      output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
    },
    cancelServerFlow: {
      input: zod_1.z.object({ flowId: zod_1.z.string() }).strict(),
      output: zod_1.z.void(),
    },
    getAuthStatus: {
      input: zod_1.z
        .object({
          projectPath: zod_1.z.string(),
          serverName: zod_1.z.string(),
        })
        .strict(),
      output: zod_1.z.object({
        serverUrl: zod_1.z.string().optional(),
        isLoggedIn: zod_1.z.boolean(),
        hasRefreshToken: zod_1.z.boolean(),
        scope: zod_1.z.string().optional(),
        updatedAtMs: zod_1.z.number().optional(),
      }),
    },
    logout: {
      input: zod_1.z
        .object({
          projectPath: zod_1.z.string(),
          serverName: zod_1.z.string(),
        })
        .strict(),
      output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
    },
  },
  secrets: {
    get: {
      input: zod_1.z.object({ projectPath: zod_1.z.string() }),
      output: zod_1.z.array(secrets_1.SecretSchema),
    },
    update: {
      input: zod_1.z.object({
        projectPath: zod_1.z.string(),
        secrets: zod_1.z.array(secrets_1.SecretSchema),
      }),
      output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
    },
  },
  idleCompaction: {
    get: {
      input: zod_1.z.object({ projectPath: zod_1.z.string() }),
      output: zod_1.z.object({ hours: zod_1.z.number().nullable() }),
    },
    set: {
      input: zod_1.z.object({
        projectPath: zod_1.z.string(),
        hours: zod_1.z.number().min(1).nullable(),
      }),
      output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
    },
  },
  sections: {
    list: {
      input: zod_1.z.object({ projectPath: zod_1.z.string() }),
      output: zod_1.z.array(project_1.SectionConfigSchema),
    },
    create: {
      input: zod_1.z.object({
        projectPath: zod_1.z.string(),
        name: zod_1.z.string().min(1),
        color: zod_1.z.string().optional(),
      }),
      output: (0, result_1.ResultSchema)(project_1.SectionConfigSchema, zod_1.z.string()),
    },
    update: {
      input: zod_1.z.object({
        projectPath: zod_1.z.string(),
        sectionId: zod_1.z.string(),
        name: zod_1.z.string().min(1).optional(),
        color: zod_1.z.string().optional(),
      }),
      output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
    },
    remove: {
      input: zod_1.z.object({
        projectPath: zod_1.z.string(),
        sectionId: zod_1.z.string(),
      }),
      output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
    },
    reorder: {
      input: zod_1.z.object({
        projectPath: zod_1.z.string(),
        sectionIds: zod_1.z.array(zod_1.z.string()),
      }),
      output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
    },
    assignWorkspace: {
      input: zod_1.z.object({
        projectPath: zod_1.z.string(),
        workspaceId: zod_1.z.string(),
        sectionId: zod_1.z.string().nullable(),
      }),
      output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
    },
  },
};
/**
 * MCP server configuration.
 *
 * Global config lives in <muxHome>/mcp.jsonc, with optional repo overrides in <projectPath>/.mux/mcp.jsonc.
 */
exports.mcp = {
  list: {
    input: mcp_1.MCPListParamsSchema,
    output: mcp_1.MCPServerMapSchema,
  },
  add: {
    input: mcp_1.MCPAddGlobalParamsSchema,
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  remove: {
    input: mcp_1.MCPRemoveGlobalParamsSchema,
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  test: {
    input: mcp_1.MCPTestGlobalParamsSchema,
    output: mcp_1.MCPTestResultSchema,
  },
  setEnabled: {
    input: mcp_1.MCPSetEnabledGlobalParamsSchema,
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  setToolAllowlist: {
    input: mcp_1.MCPSetToolAllowlistGlobalParamsSchema,
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
};
/**
 * Secrets store.
 *
 * - When no projectPath is provided: global secrets
 * - When projectPath is provided: project-only secrets
 */
exports.secrets = {
  get: {
    input: zod_1.z.object({ projectPath: zod_1.z.string().optional() }),
    output: zod_1.z.array(secrets_1.SecretSchema),
  },
  update: {
    input: zod_1.z.object({
      projectPath: zod_1.z.string().optional(),
      secrets: zod_1.z.array(secrets_1.SecretSchema),
    }),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
};
// Re-export Coder schemas from dedicated file
const coder_1 = require("./coder");
Object.defineProperty(exports, "coder", {
  enumerable: true,
  get: function () {
    return coder_1.coder;
  },
});
Object.defineProperty(exports, "CoderInfoSchema", {
  enumerable: true,
  get: function () {
    return coder_1.CoderInfoSchema;
  },
});
Object.defineProperty(exports, "CoderPresetSchema", {
  enumerable: true,
  get: function () {
    return coder_1.CoderPresetSchema;
  },
});
Object.defineProperty(exports, "CoderTemplateSchema", {
  enumerable: true,
  get: function () {
    return coder_1.CoderTemplateSchema;
  },
});
Object.defineProperty(exports, "CoderWorkspaceConfigSchema", {
  enumerable: true,
  get: function () {
    return coder_1.CoderWorkspaceConfigSchema;
  },
});
Object.defineProperty(exports, "CoderWorkspaceSchema", {
  enumerable: true,
  get: function () {
    return coder_1.CoderWorkspaceSchema;
  },
});
Object.defineProperty(exports, "CoderWorkspaceStatusSchema", {
  enumerable: true,
  get: function () {
    return coder_1.CoderWorkspaceStatusSchema;
  },
});
// Workspace
const DebugLlmRequestSnapshotSchema = zod_1.z
  .object({
    capturedAt: zod_1.z.number(),
    workspaceId: zod_1.z.string(),
    messageId: zod_1.z.string().optional(),
    model: zod_1.z.string(),
    providerName: zod_1.z.string(),
    thinkingLevel: zod_1.z.string(),
    mode: zod_1.z.string().optional(),
    agentId: zod_1.z.string().optional(),
    maxOutputTokens: zod_1.z.number().optional(),
    systemMessage: zod_1.z.string(),
    messages: zod_1.z.array(zod_1.z.unknown()),
    response: zod_1.z
      .object({
        capturedAt: zod_1.z.number(),
        metadata: stream_1.StreamEndEventSchema.shape.metadata,
        parts: zod_1.z.array(stream_1.CompletedMessagePartSchema),
      })
      .strict()
      .optional(),
  })
  .strict();
exports.workspace = {
  list: {
    input: zod_1.z
      .object({
        /** When true, only return archived workspaces. Default returns only non-archived. */
        archived: zod_1.z.boolean().optional(),
      })
      .optional(),
    output: zod_1.z.array(workspace_1.FrontendWorkspaceMetadataSchema),
  },
  create: {
    input: zod_1.z.object({
      projectPath: zod_1.z.string(),
      branchName: zod_1.z.string(),
      /** Trunk branch to fork from - only required for worktree/SSH runtimes, ignored for local */
      trunkBranch: zod_1.z.string().optional(),
      /** Human-readable title (e.g., "Fix plan mode over SSH") - optional for backwards compat */
      title: zod_1.z.string().optional(),
      runtimeConfig: runtime_1.RuntimeConfigSchema.optional(),
      /** Section ID to assign the new workspace to (optional) */
      sectionId: zod_1.z.string().optional(),
    }),
    output: zod_1.z.discriminatedUnion("success", [
      zod_1.z.object({
        success: zod_1.z.literal(true),
        metadata: workspace_1.FrontendWorkspaceMetadataSchema,
      }),
      zod_1.z.object({ success: zod_1.z.literal(false), error: zod_1.z.string() }),
    ]),
  },
  remove: {
    input: zod_1.z.object({
      workspaceId: zod_1.z.string(),
      options: zod_1.z.object({ force: zod_1.z.boolean().optional() }).optional(),
    }),
    output: zod_1.z.object({ success: zod_1.z.boolean(), error: zod_1.z.string().optional() }),
  },
  rename: {
    input: zod_1.z.object({ workspaceId: zod_1.z.string(), newName: zod_1.z.string() }),
    output: (0, result_1.ResultSchema)(
      zod_1.z.object({ newWorkspaceId: zod_1.z.string() }),
      zod_1.z.string()
    ),
  },
  updateTitle: {
    input: zod_1.z.object({ workspaceId: zod_1.z.string(), title: zod_1.z.string() }),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  updateAgentAISettings: {
    input: zod_1.z.object({
      workspaceId: zod_1.z.string(),
      agentId: agentDefinition_1.AgentIdSchema,
      aiSettings: workspaceAiSettings_1.WorkspaceAISettingsSchema,
    }),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  updateModeAISettings: {
    input: zod_1.z.object({
      workspaceId: zod_1.z.string(),
      mode: mode_1.UIModeSchema,
      aiSettings: workspaceAiSettings_1.WorkspaceAISettingsSchema,
    }),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  archive: {
    input: zod_1.z.object({ workspaceId: zod_1.z.string() }),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  unarchive: {
    input: zod_1.z.object({ workspaceId: zod_1.z.string() }),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  archiveMergedInProject: {
    input: zod_1.z.object({ projectPath: zod_1.z.string() }),
    output: (0, result_1.ResultSchema)(
      zod_1.z.object({
        archivedWorkspaceIds: zod_1.z.array(zod_1.z.string()),
        skippedWorkspaceIds: zod_1.z.array(zod_1.z.string()),
        errors: zod_1.z.array(
          zod_1.z.object({
            workspaceId: zod_1.z.string(),
            error: zod_1.z.string(),
          })
        ),
      }),
      zod_1.z.string()
    ),
  },
  fork: {
    input: zod_1.z.object({ sourceWorkspaceId: zod_1.z.string(), newName: zod_1.z.string() }),
    output: zod_1.z.discriminatedUnion("success", [
      zod_1.z.object({
        success: zod_1.z.literal(true),
        metadata: workspace_1.FrontendWorkspaceMetadataSchema,
        projectPath: zod_1.z.string(),
      }),
      zod_1.z.object({ success: zod_1.z.literal(false), error: zod_1.z.string() }),
    ]),
  },
  sendMessage: {
    input: zod_1.z.object({
      workspaceId: zod_1.z.string(),
      message: zod_1.z.string(),
      options: stream_1.SendMessageOptionsSchema.extend({
        fileParts: zod_1.z.array(message_1.FilePartSchema).optional(),
      }),
    }),
    output: (0, result_1.ResultSchema)(zod_1.z.object({}), errors_1.SendMessageErrorSchema),
  },
  answerAskUserQuestion: {
    input: zod_1.z
      .object({
        workspaceId: zod_1.z.string(),
        toolCallId: zod_1.z.string(),
        answers: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
      })
      .strict(),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  resumeStream: {
    input: zod_1.z.object({
      workspaceId: zod_1.z.string(),
      options: stream_1.SendMessageOptionsSchema,
    }),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), errors_1.SendMessageErrorSchema),
  },
  interruptStream: {
    input: zod_1.z.object({
      workspaceId: zod_1.z.string(),
      options: zod_1.z
        .object({
          soft: zod_1.z.boolean().optional(),
          abandonPartial: zod_1.z.boolean().optional(),
          sendQueuedImmediately: zod_1.z.boolean().optional(),
        })
        .optional(),
    }),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  clearQueue: {
    input: zod_1.z.object({ workspaceId: zod_1.z.string() }),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  truncateHistory: {
    input: zod_1.z.object({
      workspaceId: zod_1.z.string(),
      percentage: zod_1.z.number().optional(),
    }),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  replaceChatHistory: {
    input: zod_1.z.object({
      workspaceId: zod_1.z.string(),
      summaryMessage: message_1.MuxMessageSchema,
      /**
       * Replace strategy.
       * - destructive (default): clear history, then append summary
       * - append-compaction-boundary: keep history and append summary as durable boundary
       */
      mode: zod_1.z.enum(["destructive", "append-compaction-boundary"]).nullish(),
      /** When true, delete the plan file (new + legacy paths) and clear plan tracking state. */
      deletePlanFile: zod_1.z.boolean().optional(),
    }),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  getDevcontainerInfo: {
    input: zod_1.z.object({ workspaceId: zod_1.z.string() }),
    output: zod_1.z
      .object({
        containerName: zod_1.z.string(),
        containerWorkspacePath: zod_1.z.string(),
        hostWorkspacePath: zod_1.z.string(),
      })
      .nullable(),
  },
  getInfo: {
    input: zod_1.z.object({ workspaceId: zod_1.z.string() }),
    output: workspace_1.FrontendWorkspaceMetadataSchema.nullable(),
  },
  getLastLlmRequest: {
    input: zod_1.z.object({ workspaceId: zod_1.z.string() }),
    output: (0, result_1.ResultSchema)(DebugLlmRequestSnapshotSchema.nullable(), zod_1.z.string()),
  },
  getFullReplay: {
    input: zod_1.z.object({ workspaceId: zod_1.z.string() }),
    output: zod_1.z.array(stream_1.WorkspaceChatMessageSchema),
  },
  /**
   * Load an archived subagent transcript (chat.jsonl + optional partial.json) from this workspace's
   * session dir.
   */
  getSubagentTranscript: {
    input: zod_1.z.object({
      /** Workspace that owns the transcript artifact index (usually the current workspace). */
      workspaceId: zod_1.z.string().optional(),
      /** Child task/workspace id whose transcript should be loaded. */
      taskId: zod_1.z.string(),
    }),
    output: zod_1.z.object({
      messages: zod_1.z.array(message_1.MuxMessageSchema),
      /** Task-level model string used when running the sub-agent (optional for legacy entries). */
      model: zod_1.z.string().optional(),
      /** Task-level thinking/reasoning level used when running the sub-agent (optional for legacy entries). */
      thinkingLevel: zod_1.z.enum(["off", "low", "medium", "high", "xhigh", "max"]).optional(),
    }),
  },
  executeBash: {
    input: zod_1.z.object({
      workspaceId: zod_1.z.string(),
      script: zod_1.z.string(),
      options: zod_1.z
        .object({
          timeout_secs: zod_1.z.number().optional(),
        })
        .optional(),
    }),
    output: (0, result_1.ResultSchema)(tools_1.BashToolResultSchema, zod_1.z.string()),
  },
  getFileCompletions: {
    input: zod_1.z
      .object({
        workspaceId: zod_1.z.string(),
        query: zod_1.z.string(),
        limit: zod_1.z.number().int().positive().max(50).optional(),
      })
      .strict(),
    output: zod_1.z.object({ paths: zod_1.z.array(zod_1.z.string()) }),
  },
  // Subscriptions
  onChat: {
    input: zod_1.z.object({ workspaceId: zod_1.z.string() }),
    output: (0, server_1.eventIterator)(stream_1.WorkspaceChatMessageSchema), // Stream event
  },
  onMetadata: {
    input: zod_1.z.void(),
    output: (0, server_1.eventIterator)(
      zod_1.z.object({
        workspaceId: zod_1.z.string(),
        metadata: workspace_1.FrontendWorkspaceMetadataSchema.nullable(),
      })
    ),
  },
  activity: {
    list: {
      input: zod_1.z.void(),
      output: zod_1.z.record(zod_1.z.string(), workspace_1.WorkspaceActivitySnapshotSchema),
    },
    subscribe: {
      input: zod_1.z.void(),
      output: (0, server_1.eventIterator)(
        zod_1.z.object({
          workspaceId: zod_1.z.string(),
          activity: workspace_1.WorkspaceActivitySnapshotSchema.nullable(),
        })
      ),
    },
  },
  /**
   * Get the current plan file content for a workspace.
   * Used by UI to refresh plan display when file is edited externally.
   */
  getPlanContent: {
    input: zod_1.z.object({ workspaceId: zod_1.z.string() }),
    output: (0, result_1.ResultSchema)(
      zod_1.z.object({
        content: zod_1.z.string(),
        path: zod_1.z.string(),
      }),
      zod_1.z.string()
    ),
  },
  backgroundBashes: {
    /**
     * Subscribe to background bash state changes for a workspace.
     * Emits full state on connect, then incremental updates.
     */
    subscribe: {
      input: zod_1.z.object({ workspaceId: zod_1.z.string() }),
      output: (0, server_1.eventIterator)(
        zod_1.z.object({
          /** Background processes (not including foreground ones being waited on) */
          processes: zod_1.z.array(exports.BackgroundProcessInfoSchema),
          /** Tool call IDs of foreground bashes that can be sent to background */
          foregroundToolCallIds: zod_1.z.array(zod_1.z.string()),
        })
      ),
    },
    terminate: {
      input: zod_1.z.object({ workspaceId: zod_1.z.string(), processId: zod_1.z.string() }),
      output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
    },
    /**
     * Send a foreground bash process to background.
     * The process continues running but the agent stops waiting for it.
     */
    sendToBackground: {
      input: zod_1.z.object({ workspaceId: zod_1.z.string(), toolCallId: zod_1.z.string() }),
      output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
    },
    /**
     * Peek output for a background bash process without consuming the bash_output cursor.
     */
    getOutput: {
      input: zod_1.z.object({
        workspaceId: zod_1.z.string(),
        processId: zod_1.z.string(),
        fromOffset: zod_1.z.number().int().nonnegative().optional(),
        tailBytes: zod_1.z.number().int().positive().max(1_000_000).optional(),
      }),
      output: (0, result_1.ResultSchema)(
        zod_1.z.object({
          status: zod_1.z.enum(["running", "exited", "killed", "failed"]),
          output: zod_1.z.string(),
          nextOffset: zod_1.z.number().int().nonnegative(),
          truncatedStart: zod_1.z.boolean(),
        }),
        zod_1.z.string()
      ),
    },
  },
  /**
   * Get post-compaction context state for a workspace.
   * Returns plan path (if exists) and tracked file paths that will be injected.
   */
  getPostCompactionState: {
    input: zod_1.z.object({ workspaceId: zod_1.z.string() }),
    output: zod_1.z.object({
      planPath: zod_1.z.string().nullable(),
      trackedFilePaths: zod_1.z.array(zod_1.z.string()),
      excludedItems: zod_1.z.array(zod_1.z.string()),
    }),
  },
  /**
   * Toggle whether a post-compaction item is excluded from injection.
   * Item IDs: "plan" for plan file, "file:<path>" for tracked files.
   */
  setPostCompactionExclusion: {
    input: zod_1.z.object({
      workspaceId: zod_1.z.string(),
      itemId: zod_1.z.string(),
      excluded: zod_1.z.boolean(),
    }),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  stats: {
    subscribe: {
      input: zod_1.z.object({ workspaceId: zod_1.z.string() }),
      output: (0, server_1.eventIterator)(workspaceStats_1.WorkspaceStatsSnapshotSchema),
    },
    clear: {
      input: zod_1.z.object({ workspaceId: zod_1.z.string() }),
      output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
    },
  },
  getSessionUsage: {
    input: zod_1.z.object({ workspaceId: zod_1.z.string() }),
    output: chatStats_1.SessionUsageFileSchema.optional(),
  },
  /** Batch fetch session usage for multiple workspaces (for archived workspaces cost display) */
  getSessionUsageBatch: {
    input: zod_1.z.object({ workspaceIds: zod_1.z.array(zod_1.z.string()) }),
    output: zod_1.z.record(zod_1.z.string(), chatStats_1.SessionUsageFileSchema.optional()),
  },
  /** Per-workspace MCP configuration (overrides project-level mcp.jsonc) */
  mcp: {
    get: {
      input: zod_1.z.object({ workspaceId: zod_1.z.string() }),
      output: mcp_1.WorkspaceMCPOverridesSchema,
    },
    set: {
      input: zod_1.z.object({
        workspaceId: zod_1.z.string(),
        overrides: mcp_1.WorkspaceMCPOverridesSchema,
      }),
      output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
    },
  },
};
// Tasks (agent sub-workspaces)
exports.tasks = {
  create: {
    input: zod_1.z
      .object({
        parentWorkspaceId: zod_1.z.string(),
        kind: zod_1.z.literal("agent"),
        agentId: agentDefinition_1.AgentIdSchema.optional(),
        /** @deprecated Legacy alias for agentId (kept for downgrade compatibility). */
        agentType: zod_1.z.string().min(1).optional(),
        prompt: zod_1.z.string(),
        title: zod_1.z.string().min(1),
        modelString: zod_1.z.string().optional(),
        thinkingLevel: zod_1.z.string().optional(),
      })
      .superRefine((value, ctx) => {
        const hasAgentId = typeof value.agentId === "string" && value.agentId.trim().length > 0;
        const hasAgentType =
          typeof value.agentType === "string" && value.agentType.trim().length > 0;
        if (hasAgentId === hasAgentType) {
          ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "tasks.create: exactly one of agentId or agentType is required",
            path: ["agentId"],
          });
        }
      }),
    output: (0, result_1.ResultSchema)(
      zod_1.z.object({
        taskId: zod_1.z.string(),
        kind: zod_1.z.literal("agent"),
        status: zod_1.z.enum(["queued", "running"]),
      }),
      zod_1.z.string()
    ),
  },
};
// Agent definitions (unifies UI modes + subagents)
// Agents can be discovered from either the PROJECT path or the WORKSPACE path.
// - Project path: <projectPath>/.mux/agents - shared across all workspaces
// - Workspace path: <worktree>/.mux/agents - workspace-specific (useful for iterating)
// Default is workspace path when workspaceId is provided.
// Use disableWorkspaceAgents in SendMessageOptions to skip workspace agents during message sending.
// At least one of projectPath or workspaceId must be provided for agent discovery.
// Agent discovery input supports:
// - workspaceId only: resolve projectPath from workspace metadata, discover from worktree
// - projectPath only: discover from project path (project page, no workspace yet)
// - both: discover from worktree using workspaceId
// - disableWorkspaceAgents: when true with workspaceId, use workspace's runtime but discover
//   from projectPath instead of worktree (useful for SSH workspaces when iterating on agents)
const AgentDiscoveryInputSchema = zod_1.z
  .object({
    projectPath: zod_1.z.string().optional(),
    workspaceId: zod_1.z.string().optional(),
    /** When true, skip workspace worktree and discover from projectPath (but still use workspace runtime) */
    disableWorkspaceAgents: zod_1.z.boolean().optional(),
    /** When true, include agents disabled by front-matter (for Settings UI). */
    includeDisabled: zod_1.z.boolean().optional(),
  })
  .refine((data) => Boolean(data.projectPath ?? data.workspaceId), {
    message: "Either projectPath or workspaceId must be provided",
  });
exports.agents = {
  list: {
    input: AgentDiscoveryInputSchema,
    output: zod_1.z.array(agentDefinition_1.AgentDefinitionDescriptorSchema),
  },
  get: {
    input: AgentDiscoveryInputSchema.and(
      zod_1.z.object({ agentId: agentDefinition_1.AgentIdSchema })
    ),
    output: agentDefinition_1.AgentDefinitionPackageSchema,
  },
};
// Agent skills
exports.agentSkills = {
  list: {
    input: AgentDiscoveryInputSchema,
    output: zod_1.z.array(agentSkill_1.AgentSkillDescriptorSchema),
  },
  listDiagnostics: {
    input: AgentDiscoveryInputSchema,
    output: zod_1.z.object({
      skills: zod_1.z.array(agentSkill_1.AgentSkillDescriptorSchema),
      invalidSkills: zod_1.z.array(agentSkill_1.AgentSkillIssueSchema),
    }),
  },
  get: {
    input: AgentDiscoveryInputSchema.and(
      zod_1.z.object({ skillName: agentSkill_1.SkillNameSchema })
    ),
    output: agentSkill_1.AgentSkillPackageSchema,
  },
};
// Name generation for new workspaces (decoupled from workspace creation)
exports.nameGeneration = {
  generate: {
    input: zod_1.z.object({
      message: zod_1.z.string(),
      /** Ordered list of model candidates to try (frontend applies gateway prefs) */
      candidates: zod_1.z.array(zod_1.z.string()),
    }),
    output: (0, result_1.ResultSchema)(
      zod_1.z.object({
        /** Short git-safe name with suffix (e.g., "plan-a1b2") */
        name: zod_1.z.string(),
        /** Human-readable title (e.g., "Fix plan mode over SSH") */
        title: zod_1.z.string(),
        modelUsed: zod_1.z.string(),
      }),
      errors_1.SendMessageErrorSchema
    ),
  },
};
// Window
exports.window = {
  setTitle: {
    input: zod_1.z.object({ title: zod_1.z.string() }),
    output: zod_1.z.void(),
  },
};
// Terminal
exports.terminal = {
  create: {
    input: terminal_1.TerminalCreateParamsSchema,
    output: terminal_1.TerminalSessionSchema,
  },
  close: {
    input: zod_1.z.object({ sessionId: zod_1.z.string() }),
    output: zod_1.z.void(),
  },
  resize: {
    input: terminal_1.TerminalResizeParamsSchema,
    output: zod_1.z.void(),
  },
  sendInput: {
    input: zod_1.z.object({ sessionId: zod_1.z.string(), data: zod_1.z.string() }),
    output: zod_1.z.void(),
  },
  onOutput: {
    input: zod_1.z.object({ sessionId: zod_1.z.string() }),
    output: (0, server_1.eventIterator)(zod_1.z.string()),
  },
  /**
   * Attach to a terminal session with race-free state restore.
   * First yields { type: "screenState", data: string } with serialized screen (~4KB),
   * then yields { type: "output", data: string } for each live output chunk.
   * Guarantees no missed output between state snapshot and live stream.
   */
  attach: {
    input: zod_1.z.object({ sessionId: zod_1.z.string() }),
    output: (0, server_1.eventIterator)(
      zod_1.z.discriminatedUnion("type", [
        zod_1.z.object({ type: zod_1.z.literal("screenState"), data: zod_1.z.string() }),
        zod_1.z.object({ type: zod_1.z.literal("output"), data: zod_1.z.string() }),
      ])
    ),
  },
  onExit: {
    input: zod_1.z.object({ sessionId: zod_1.z.string() }),
    output: (0, server_1.eventIterator)(zod_1.z.number()),
  },
  openWindow: {
    input: zod_1.z.object({
      workspaceId: zod_1.z.string(),
      /** Optional session ID to reattach to an existing terminal session (for pop-out handoff) */
      sessionId: zod_1.z.string().optional(),
    }),
    output: zod_1.z.void(),
  },
  closeWindow: {
    input: zod_1.z.object({ workspaceId: zod_1.z.string() }),
    output: zod_1.z.void(),
  },
  /**
   * List active terminal sessions for a workspace.
   * Used by frontend to discover existing sessions to reattach to after reload.
   */
  listSessions: {
    input: zod_1.z.object({ workspaceId: zod_1.z.string() }),
    output: zod_1.z.array(zod_1.z.string()),
  },
  /**
   * Open the native system terminal for a workspace.
   * Opens the user's preferred terminal emulator (Ghostty, Terminal.app, etc.)
   * with the working directory set to the workspace path.
   */
  openNative: {
    input: zod_1.z.object({ workspaceId: zod_1.z.string() }),
    output: zod_1.z.void(),
  },
};
// Server
exports.ApiServerStatusSchema = zod_1.z.object({
  running: zod_1.z.boolean(),
  /** Base URL that is always connectable from the local machine (loopback for wildcard binds). */
  baseUrl: zod_1.z.string().nullable(),
  /** The host/interface the server is actually bound to. */
  bindHost: zod_1.z.string().nullable(),
  /** The port the server is listening on. */
  port: zod_1.z.number().int().min(0).max(65535).nullable(),
  /** Additional base URLs that may be reachable from other devices (LAN/VPN). */
  networkBaseUrls: zod_1.z.array(zod_1.z.url()),
  /** Auth token required for HTTP/WS API access. */
  token: zod_1.z.string().nullable(),
  /** Configured bind host from ~/.mux/config.json (if set). */
  configuredBindHost: zod_1.z.string().nullable(),
  /** Configured port from ~/.mux/config.json (if set). */
  configuredPort: zod_1.z.number().int().min(0).max(65535).nullable(),
  /** Whether the API server should serve the mux web UI at /. */
  configuredServeWebUi: zod_1.z.boolean(),
});
exports.server = {
  getLaunchProject: {
    input: zod_1.z.void(),
    output: zod_1.z.string().nullable(),
  },
  getSshHost: {
    input: zod_1.z.void(),
    output: zod_1.z.string().nullable(),
  },
  setSshHost: {
    input: zod_1.z.object({ sshHost: zod_1.z.string().nullable() }),
    output: zod_1.z.void(),
  },
  getApiServerStatus: {
    input: zod_1.z.void(),
    output: exports.ApiServerStatusSchema,
  },
  setApiServerSettings: {
    input: zod_1.z.object({
      bindHost: zod_1.z.string().nullable(),
      port: zod_1.z.number().int().min(0).max(65535).nullable(),
      serveWebUi: zod_1.z.boolean().nullable().optional(),
    }),
    output: exports.ApiServerStatusSchema,
  },
};
// Config (global settings)
const SubagentAiDefaultsEntrySchema = zod_1.z
  .object({
    modelString: zod_1.z.string().min(1).optional(),
    thinkingLevel: zod_1.z.enum(["off", "low", "medium", "high", "xhigh", "max"]).optional(),
    enabled: zod_1.z.boolean().optional(),
  })
  .strict();
const AgentAiDefaultsSchema = zod_1.z.record(
  zod_1.z.string().min(1),
  SubagentAiDefaultsEntrySchema
);
const SubagentAiDefaultsSchema = zod_1.z.record(
  zod_1.z.string().min(1),
  SubagentAiDefaultsEntrySchema
);
exports.config = {
  getConfig: {
    input: zod_1.z.void(),
    output: zod_1.z.object({
      taskSettings: zod_1.z.object({
        maxParallelAgentTasks: zod_1.z.number().int(),
        maxTaskNestingDepth: zod_1.z.number().int(),
        proposePlanImplementReplacesChatHistory: zod_1.z.boolean().optional(),
        bashOutputCompactionMinLines: zod_1.z.number().int().optional(),
        bashOutputCompactionMinTotalBytes: zod_1.z.number().int().optional(),
        bashOutputCompactionMaxKeptLines: zod_1.z.number().int().optional(),
        bashOutputCompactionTimeoutMs: zod_1.z.number().int().optional(),
        bashOutputCompactionHeuristicFallback: zod_1.z.boolean().optional(),
      }),
      muxGatewayEnabled: zod_1.z.boolean().optional(),
      muxGatewayModels: zod_1.z.array(zod_1.z.string()).optional(),
      defaultModel: zod_1.z.string().optional(),
      hiddenModels: zod_1.z.array(zod_1.z.string()).optional(),
      preferredCompactionModel: zod_1.z.string().optional(),
      stopCoderWorkspaceOnArchive: zod_1.z.boolean(),
      agentAiDefaults: AgentAiDefaultsSchema,
      // Legacy fields (downgrade compatibility)
      subagentAiDefaults: SubagentAiDefaultsSchema,
      // Mux Governor enrollment status (safe fields only - token never exposed)
      muxGovernorUrl: zod_1.z.string().nullable(),
      muxGovernorEnrolled: zod_1.z.boolean(),
    }),
  },
  saveConfig: {
    input: zod_1.z.object({
      taskSettings: zod_1.z.object({
        maxParallelAgentTasks: zod_1.z.number().int(),
        maxTaskNestingDepth: zod_1.z.number().int(),
        proposePlanImplementReplacesChatHistory: zod_1.z.boolean().optional(),
        bashOutputCompactionMinLines: zod_1.z.number().int().optional(),
        bashOutputCompactionMinTotalBytes: zod_1.z.number().int().optional(),
        bashOutputCompactionMaxKeptLines: zod_1.z.number().int().optional(),
        bashOutputCompactionTimeoutMs: zod_1.z.number().int().optional(),
        bashOutputCompactionHeuristicFallback: zod_1.z.boolean().optional(),
      }),
      agentAiDefaults: AgentAiDefaultsSchema.optional(),
      // Legacy field (downgrade compatibility)
      subagentAiDefaults: SubagentAiDefaultsSchema.optional(),
    }),
    output: zod_1.z.void(),
  },
  updateAgentAiDefaults: {
    input: zod_1.z.object({
      agentAiDefaults: AgentAiDefaultsSchema,
    }),
    output: zod_1.z.void(),
  },
  updateMuxGatewayPrefs: {
    input: zod_1.z.object({
      muxGatewayEnabled: zod_1.z.boolean(),
      muxGatewayModels: zod_1.z.array(zod_1.z.string()),
    }),
    output: zod_1.z.void(),
  },
  updateModelPreferences: {
    input: zod_1.z.object({
      defaultModel: zod_1.z.string().optional(),
      hiddenModels: zod_1.z.array(zod_1.z.string()).optional(),
      preferredCompactionModel: zod_1.z.string().optional(),
    }),
    output: zod_1.z.void(),
  },
  updateCoderPrefs: {
    input: zod_1.z
      .object({
        stopCoderWorkspaceOnArchive: zod_1.z.boolean(),
      })
      .strict(),
    output: zod_1.z.void(),
  },
  unenrollMuxGovernor: {
    input: zod_1.z.void(),
    output: zod_1.z.void(),
  },
};
// UI Layouts (global settings)
exports.uiLayouts = {
  getAll: {
    input: zod_1.z.void(),
    output: uiLayouts_1.LayoutPresetsConfigSchema,
  },
  saveAll: {
    input: zod_1.z
      .object({
        layoutPresets: uiLayouts_1.LayoutPresetsConfigSchema,
      })
      .strict(),
    output: zod_1.z.void(),
  },
};
// Splash screens
exports.splashScreens = {
  getViewedSplashScreens: {
    input: zod_1.z.void(),
    output: zod_1.z.array(zod_1.z.string()),
  },
  markSplashScreenViewed: {
    input: zod_1.z.object({
      splashId: zod_1.z.string(),
    }),
    output: zod_1.z.void(),
  },
};
// Update
exports.update = {
  check: {
    input: zod_1.z.void(),
    output: zod_1.z.void(),
  },
  download: {
    input: zod_1.z.void(),
    output: zod_1.z.void(),
  },
  install: {
    input: zod_1.z.void(),
    output: zod_1.z.void(),
  },
  onStatus: {
    input: zod_1.z.void(),
    output: (0, server_1.eventIterator)(stream_1.UpdateStatusSchema),
  },
};
// Editor config schema for openWorkspaceInEditor
const EditorTypeSchema = zod_1.z.enum(["vscode", "cursor", "zed", "custom"]);
const EditorConfigSchema = zod_1.z.object({
  editor: EditorTypeSchema,
  customCommand: zod_1.z.string().optional(),
});
const StatsTabVariantSchema = zod_1.z.enum(["control", "stats"]);
const StatsTabOverrideSchema = zod_1.z.enum(["default", "on", "off"]);
const StatsTabStateSchema = zod_1.z.object({
  enabled: zod_1.z.boolean(),
  variant: StatsTabVariantSchema,
  override: StatsTabOverrideSchema,
});
// Feature gates (PostHog-backed)
exports.features = {
  getStatsTabState: {
    input: zod_1.z.void(),
    output: StatsTabStateSchema,
  },
  setStatsTabOverride: {
    input: zod_1.z.object({ override: StatsTabOverrideSchema }),
    output: StatsTabStateSchema,
  },
};
// General
exports.general = {
  listDirectory: {
    input: zod_1.z.object({ path: zod_1.z.string() }),
    output: (0, result_1.ResultSchema)(tools_1.FileTreeNodeSchema),
  },
  /**
   * Create a directory at the specified path.
   * Creates parent directories recursively if they don't exist (like mkdir -p).
   */
  createDirectory: {
    input: zod_1.z.object({ path: zod_1.z.string() }),
    output: (0, result_1.ResultSchema)(
      zod_1.z.object({ normalizedPath: zod_1.z.string() }),
      zod_1.z.string()
    ),
  },
  ping: {
    input: zod_1.z.string(),
    output: zod_1.z.string(),
  },
  /**
   * Test endpoint: emits numbered ticks at an interval.
   * Useful for verifying streaming works over HTTP and WebSocket.
   */
  tick: {
    input: zod_1.z.object({
      count: zod_1.z.number().int().min(1).max(100),
      intervalMs: zod_1.z.number().int().min(10).max(5000),
    }),
    output: (0, server_1.eventIterator)(
      zod_1.z.object({ tick: zod_1.z.number(), timestamp: zod_1.z.number() })
    ),
  },
  /**
   * Open a path in the user's configured code editor.
   * For SSH workspaces with useRemoteExtension enabled, uses Remote-SSH extension.
   *
   * @param workspaceId - The workspace (used to determine if SSH and get remote host)
   * @param targetPath - The path to open (workspace directory or specific file)
   * @param editorConfig - Editor configuration from user settings
   */
  openInEditor: {
    input: zod_1.z.object({
      workspaceId: zod_1.z.string(),
      targetPath: zod_1.z.string(),
      editorConfig: EditorConfigSchema,
    }),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
};
// Menu events (main→renderer notifications)
exports.menu = {
  onOpenSettings: {
    input: zod_1.z.void(),
    output: (0, server_1.eventIterator)(zod_1.z.void()),
  },
};
// Voice input (transcription via OpenAI Whisper)
exports.voice = {
  transcribe: {
    input: zod_1.z.object({ audioBase64: zod_1.z.string() }),
    output: (0, result_1.ResultSchema)(zod_1.z.string(), zod_1.z.string()),
  },
};
// Debug endpoints (test-only, not for production use)
exports.debug = {
  /**
   * Trigger an artificial stream error for testing recovery.
   * Used by integration tests to simulate network errors mid-stream.
   */
  triggerStreamError: {
    input: zod_1.z.object({
      workspaceId: zod_1.z.string(),
      errorMessage: zod_1.z.string().optional(),
    }),
    output: zod_1.z.boolean(), // true if error was triggered on an active stream
  },
};
// --- Model Presets ---
exports.PresetModelEntrySchema = zod_1.z.object({
  provider: zod_1.z.string(),
  modelId: zod_1.z.string(),
  metadata: exports.CustomModelMetadataSchema.optional(),
});
exports.ModelPresetSchema = zod_1.z.object({
  id: zod_1.z.string(),
  name: zod_1.z.string(),
  description: zod_1.z.string().optional(),
  createdAt: zod_1.z.number(),
  updatedAt: zod_1.z.number(),
  models: zod_1.z.array(exports.PresetModelEntrySchema),
});
exports.modelPresets = {
  list: {
    input: zod_1.z.void(),
    output: zod_1.z.array(exports.ModelPresetSchema),
  },
  save: {
    input: zod_1.z.object({
      name: zod_1.z.string().min(1),
      models: zod_1.z.array(exports.PresetModelEntrySchema),
      description: zod_1.z.string().optional(),
    }),
    output: exports.ModelPresetSchema,
  },
  get: {
    input: zod_1.z.object({ id: zod_1.z.string() }),
    output: exports.ModelPresetSchema.nullable(),
  },
  delete: {
    input: zod_1.z.object({ id: zod_1.z.string() }),
    output: (0, result_1.ResultSchema)(zod_1.z.void(), zod_1.z.string()),
  },
  update: {
    input: zod_1.z.object({
      id: zod_1.z.string(),
      name: zod_1.z.string().optional(),
      description: zod_1.z.string().optional(),
      models: zod_1.z.array(exports.PresetModelEntrySchema).optional(),
    }),
    output: (0, result_1.ResultSchema)(exports.ModelPresetSchema, zod_1.z.string()),
  },
  export: {
    input: zod_1.z.object({ ids: zod_1.z.array(zod_1.z.string()).optional() }),
    output: zod_1.z.string(),
  },
  import: {
    input: zod_1.z.object({ json: zod_1.z.string() }),
    output: (0, result_1.ResultSchema)(zod_1.z.array(exports.ModelPresetSchema), zod_1.z.string()),
  },
};
// --- Model Health Check ---
exports.CheckStatusSchema = zod_1.z.enum(["pass", "warn", "fail", "skip"]);
exports.OverallStatusSchema = zod_1.z.enum(["healthy", "warning", "error"]);
exports.CheckResultSchema = zod_1.z.object({
  status: exports.CheckStatusSchema,
  message: zod_1.z.string(),
  details: zod_1.z.string().optional(),
});
exports.HealthCheckResultSchema = zod_1.z.object({
  modelId: zod_1.z.string(),
  provider: zod_1.z.string(),
  timestamp: zod_1.z.number(),
  status: exports.OverallStatusSchema,
  checks: zod_1.z.object({
    authentication: exports.CheckResultSchema,
    modelExists: exports.CheckResultSchema,
    tokenLimits: exports.CheckResultSchema,
    pricing: exports.CheckResultSchema,
    connectivity: exports.CheckResultSchema,
  }),
});
exports.modelHealth = {
  checkModel: {
    input: zod_1.z.object({
      provider: zod_1.z.string(),
      modelId: zod_1.z.string(),
      metadata: exports.CustomModelMetadataSchema.optional(),
    }),
    output: exports.HealthCheckResultSchema,
  },
  checkAll: {
    input: zod_1.z.object({
      models: zod_1.z.array(
        zod_1.z.object({
          provider: zod_1.z.string(),
          modelId: zod_1.z.string(),
          metadata: exports.CustomModelMetadataSchema.optional(),
        })
      ),
    }),
    output: zod_1.z.array(exports.HealthCheckResultSchema),
  },
  getLastResults: {
    input: zod_1.z.void(),
    output: zod_1.z.array(exports.HealthCheckResultSchema),
  },
};
// ---------------------------------------------------------------------------
// Cost Tracking
// ---------------------------------------------------------------------------
exports.CostEntrySchema = zod_1.z.object({
  timestamp: zod_1.z.number(),
  workspaceId: zod_1.z.string(),
  model: zod_1.z.string(),
  inputTokens: zod_1.z.number(),
  outputTokens: zod_1.z.number(),
  cachedTokens: zod_1.z.number(),
  cacheCreateTokens: zod_1.z.number(),
  reasoningTokens: zod_1.z.number(),
  cost: zod_1.z.number(),
});
exports.DailySummarySchema = zod_1.z.object({
  date: zod_1.z.string(),
  totalCost: zod_1.z.number(),
  requestCount: zod_1.z.number(),
  byModel: zod_1.z.record(
    zod_1.z.string(),
    zod_1.z.object({ cost: zod_1.z.number(), requests: zod_1.z.number(), tokens: zod_1.z.number() })
  ),
});
exports.CostHistoryRangeSchema = zod_1.z
  .object({ start: zod_1.z.number().optional(), end: zod_1.z.number().optional() })
  .optional();
exports.CostSummaryTotalsSchema = zod_1.z.object({
  today: zod_1.z.number(),
  thisWeek: zod_1.z.number(),
  thisMonth: zod_1.z.number(),
  previousDay: zod_1.z.number(),
  previousWeek: zod_1.z.number(),
  previousMonth: zod_1.z.number(),
});
exports.ModelCostBreakdownSchema = zod_1.z.record(
  zod_1.z.string(),
  zod_1.z.object({ cost: zod_1.z.number(), requests: zod_1.z.number(), tokens: zod_1.z.number() })
);
exports.costTracking = {
  getSummary: {
    input: zod_1.z.void(),
    output: exports.CostSummaryTotalsSchema,
  },
  getDailySummaries: {
    input: zod_1.z.object({
      startDate: zod_1.z.string().optional(),
      endDate: zod_1.z.string().optional(),
    }),
    output: zod_1.z.array(exports.DailySummarySchema),
  },
  getModelBreakdown: {
    input: exports.CostHistoryRangeSchema,
    output: exports.ModelCostBreakdownSchema,
  },
  prune: {
    input: zod_1.z.object({ retentionDays: zod_1.z.number().optional() }),
    output: zod_1.z.object({ pruned: zod_1.z.number() }),
  },
};
//# sourceMappingURL=api.js.map
