"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyGetResponseSchema =
  exports.EffectivePolicySchema =
  exports.EffectivePolicyProviderAccessSchema =
  exports.PolicySourceSchema =
  exports.PolicyStatusSchema =
  exports.PolicyFileSchema =
  exports.PolicyRuntimeAccessSchema =
  exports.PolicyRuntimeIdSchema =
  exports.PolicyToolsSchema =
  exports.PolicyAllowUserDefinedMCPSchema =
  exports.PolicyProviderAccessSchema =
  exports.PolicyProviderNameSchema =
  exports.PolicyFormatVersionSchema =
    void 0;
const zod_1 = require("zod");
const providers_1 = require("../../../common/constants/providers");
exports.PolicyFormatVersionSchema = zod_1.z.literal("0.1");
exports.PolicyProviderNameSchema = zod_1.z.enum(providers_1.SUPPORTED_PROVIDERS);
exports.PolicyProviderAccessSchema = zod_1.z
  .object({
    id: exports.PolicyProviderNameSchema,
    // Empty/undefined means "do not force".
    base_url: zod_1.z.string().optional(),
    // Empty/undefined means "allow all".
    model_access: zod_1.z.array(zod_1.z.string()).optional(),
  })
  .strict();
exports.PolicyAllowUserDefinedMCPSchema = zod_1.z
  .object({
    stdio: zod_1.z.boolean(),
    remote: zod_1.z.boolean(),
  })
  .strict();
exports.PolicyToolsSchema = zod_1.z
  .object({
    allow_user_defined_mcp: exports.PolicyAllowUserDefinedMCPSchema.optional(),
  })
  .strict();
exports.PolicyRuntimeIdSchema = zod_1.z.enum([
  "local",
  "worktree",
  "ssh",
  "ssh+coder",
  "docker",
  "devcontainer",
]);
exports.PolicyRuntimeAccessSchema = zod_1.z
  .object({
    id: exports.PolicyRuntimeIdSchema,
  })
  .strict();
exports.PolicyFileSchema = zod_1.z
  .object({
    policy_format_version: exports.PolicyFormatVersionSchema,
    server_version: zod_1.z.string().optional(),
    minimum_client_version: zod_1.z.string().optional(),
    // Empty/undefined means "allow all".
    provider_access: zod_1.z.array(exports.PolicyProviderAccessSchema).optional(),
    tools: exports.PolicyToolsSchema.optional(),
    // Empty/undefined means "allow all".
    runtimes: zod_1.z.array(exports.PolicyRuntimeAccessSchema).optional(),
  })
  .strict();
exports.PolicyStatusSchema = zod_1.z
  .object({
    state: zod_1.z.enum(["disabled", "enforced", "blocked"]),
    reason: zod_1.z.string().optional(),
  })
  .strict();
exports.PolicySourceSchema = zod_1.z.enum(["none", "env", "governor"]);
exports.EffectivePolicyProviderAccessSchema = zod_1.z
  .object({
    id: exports.PolicyProviderNameSchema,
    forcedBaseUrl: zod_1.z.string().optional(),
    // null means "allow all" for that provider.
    allowedModels: zod_1.z.array(zod_1.z.string()).nullable().optional(),
  })
  .strict();
exports.EffectivePolicySchema = zod_1.z
  .object({
    policyFormatVersion: exports.PolicyFormatVersionSchema,
    serverVersion: zod_1.z.string().optional(),
    minimumClientVersion: zod_1.z.string().optional(),
    // null means "allow all providers".
    providerAccess: zod_1.z.array(exports.EffectivePolicyProviderAccessSchema).nullable(),
    mcp: zod_1.z
      .object({
        allowUserDefined: zod_1.z
          .object({ stdio: zod_1.z.boolean(), remote: zod_1.z.boolean() })
          .strict(),
      })
      .strict(),
    // null means "allow all runtimes".
    runtimes: zod_1.z.array(exports.PolicyRuntimeIdSchema).nullable(),
  })
  .strict();
exports.PolicyGetResponseSchema = zod_1.z
  .object({
    source: exports.PolicySourceSchema,
    status: exports.PolicyStatusSchema,
    policy: exports.EffectivePolicySchema.nullable(),
  })
  .strict();
//# sourceMappingURL=policy.js.map
