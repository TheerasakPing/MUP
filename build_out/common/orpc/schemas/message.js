"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchListResultSchema =
  exports.MuxMessageSchema =
  exports.MuxFilePartSchema =
  exports.MuxToolPartSchema =
  exports.DynamicToolPartSchema =
  exports.DynamicToolPartRedactedSchema =
  exports.DynamicToolPartAvailableSchema =
  exports.DynamicToolPartPendingSchema =
  exports.NestedToolCallSchema =
  exports.MuxReasoningPartSchema =
  exports.MuxTextPartSchema =
  exports.FilePartSchema =
    void 0;
const zod_1 = require("zod");
const agentDefinition_1 = require("./agentDefinition");
const errors_1 = require("./errors");
const agentSkill_1 = require("./agentSkill");
exports.FilePartSchema = zod_1.z.object({
  url: zod_1.z.string(),
  mediaType: zod_1.z.string(),
  filename: zod_1.z.string().optional(),
});
exports.MuxTextPartSchema = zod_1.z.object({
  type: zod_1.z.literal("text"),
  text: zod_1.z.string(),
  timestamp: zod_1.z.number().optional(),
});
exports.MuxReasoningPartSchema = zod_1.z.object({
  type: zod_1.z.literal("reasoning"),
  text: zod_1.z.string(),
  timestamp: zod_1.z.number().optional(),
});
// Base schema for tool parts - shared fields
const MuxToolPartBase = zod_1.z.object({
  type: zod_1.z.literal("dynamic-tool"),
  toolCallId: zod_1.z.string(),
  toolName: zod_1.z.string(),
  input: zod_1.z.unknown(),
  timestamp: zod_1.z.number().optional(),
});
/**
 * Schema for nested tool calls within code_execution.
 *
 * PERSISTENCE:
 * - During live streaming: parentToolCallId on events → streamManager persists to part.nestedCalls
 * - In chat.jsonl: nestedCalls is persisted alongside result.toolCalls (for interrupted streams)
 * - On history replay: Aggregator uses persisted nestedCalls, or reconstructs from result.toolCalls
 *
 * The reconstruction from result.toolCalls provides backward compatibility for older history.
 */
exports.NestedToolCallSchema = zod_1.z.object({
  toolCallId: zod_1.z.string(),
  toolName: zod_1.z.string(),
  input: zod_1.z.unknown(),
  output: zod_1.z.unknown().optional(),
  state: zod_1.z.enum(["input-available", "output-available", "output-redacted"]),
  timestamp: zod_1.z.number().optional(),
});
// Discriminated tool part schemas - output required only when state is "output-available"
exports.DynamicToolPartPendingSchema = MuxToolPartBase.extend({
  state: zod_1.z.literal("input-available"),
  nestedCalls: zod_1.z.array(exports.NestedToolCallSchema).optional(),
});
exports.DynamicToolPartAvailableSchema = MuxToolPartBase.extend({
  state: zod_1.z.literal("output-available"),
  output: zod_1.z.unknown(),
  nestedCalls: zod_1.z.array(exports.NestedToolCallSchema).optional(),
});
exports.DynamicToolPartRedactedSchema = MuxToolPartBase.extend({
  state: zod_1.z.literal("output-redacted"),
  nestedCalls: zod_1.z.array(exports.NestedToolCallSchema).optional(),
});
exports.DynamicToolPartSchema = zod_1.z.discriminatedUnion("state", [
  exports.DynamicToolPartAvailableSchema,
  exports.DynamicToolPartPendingSchema,
  exports.DynamicToolPartRedactedSchema,
]);
// Alias for message schemas
exports.MuxToolPartSchema = exports.DynamicToolPartSchema;
exports.MuxFilePartSchema = exports.FilePartSchema.extend({
  type: zod_1.z.literal("file"),
});
const CompactionEpochSchema = zod_1.z.optional(
  zod_1.z.preprocess(
    (value) =>
      typeof value === "number" && Number.isInteger(value) && value > 0 ? value : undefined,
    zod_1.z.number().int().positive().or(zod_1.z.undefined())
  )
);
// MuxMessage (simplified)
exports.MuxMessageSchema = zod_1.z.object({
  id: zod_1.z.string(),
  role: zod_1.z.enum(["system", "user", "assistant"]),
  parts: zod_1.z.array(
    zod_1.z.discriminatedUnion("type", [
      exports.MuxTextPartSchema,
      exports.MuxReasoningPartSchema,
      exports.MuxToolPartSchema,
      exports.MuxFilePartSchema,
    ])
  ),
  createdAt: zod_1.z.date().optional(),
  metadata: zod_1.z
    .object({
      historySequence: zod_1.z.number().optional(),
      timestamp: zod_1.z.number().optional(),
      model: zod_1.z.string().optional(),
      thinkingLevel: zod_1.z.enum(["off", "low", "medium", "high", "xhigh", "max"]).optional(),
      routedThroughGateway: zod_1.z.boolean().optional(),
      usage: zod_1.z.any().optional(),
      contextUsage: zod_1.z.any().optional(),
      providerMetadata: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
      contextProviderMetadata: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
      duration: zod_1.z.number().optional(),
      systemMessageTokens: zod_1.z.number().optional(),
      muxMetadata: zod_1.z.any().optional(),
      cmuxMetadata: zod_1.z.any().optional(), // Legacy field for backward compatibility
      // Compaction source: "user" (manual), "idle" (auto), or legacy boolean (true)
      compacted: zod_1.z
        .union([zod_1.z.literal("user"), zod_1.z.literal("idle"), zod_1.z.boolean()])
        .optional(),
      // Monotonic compaction epoch id. Incremented whenever compaction succeeds.
      // Self-healing read path: malformed persisted compactionEpoch is ignored.
      compactionEpoch: CompactionEpochSchema,
      // Durable boundary marker for compaction summaries.
      compactionBoundary: zod_1.z.boolean().optional(),
      toolPolicy: zod_1.z.any().optional(),
      agentId: agentDefinition_1.AgentIdSchema.optional().catch(undefined),
      partial: zod_1.z.boolean().optional(),
      synthetic: zod_1.z.boolean().optional(),
      uiVisible: zod_1.z.boolean().optional(),
      agentSkillSnapshot: zod_1.z
        .object({
          skillName: agentSkill_1.SkillNameSchema,
          scope: agentSkill_1.AgentSkillScopeSchema,
          sha256: zod_1.z.string(),
          frontmatterYaml: zod_1.z.string().optional(),
        })
        .optional(),
      error: zod_1.z.string().optional(),
      errorType: errors_1.StreamErrorTypeSchema.optional(),
    })
    .optional(),
});
exports.BranchListResultSchema = zod_1.z.object({
  branches: zod_1.z.array(zod_1.z.string()),
  /** Recommended trunk branch, or null for non-git directories */
  recommendedTrunk: zod_1.z.string().nullable(),
});
//# sourceMappingURL=message.js.map
