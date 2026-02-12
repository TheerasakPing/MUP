"use strict";
/**
 * Agent resolution: resolves the active agent and computes tool policy for a stream.
 *
 * Extracted from `streamMessage()` to make the agent resolution logic
 * explicit and testable. Contains:
 * - Agent ID normalization & fallback to exec
 * - Agent definition loading with error recovery
 * - Disabled-agent enforcement (subagent workspaces error, top-level falls back)
 * - Inheritance chain resolution + plan-like detection
 * - Task nesting depth enforcement
 * - Tool policy composition (agent → caller → system workspace)
 * - Sentinel tool name computation for agent transition detection
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAgentForStream = resolveAgentForStream;
const os = __importStar(require("os"));
const schemas_1 = require("../../common/orpc/schemas");
const muxChat_1 = require("../../common/constants/muxChat");
const tasks_1 = require("../../common/types/tasks");
const result_1 = require("../../common/types/result");
const toolPolicy_1 = require("../../common/utils/tools/toolPolicy");
const tools_1 = require("../../common/utils/tools/tools");
const agentTools_1 = require("../../common/utils/agentTools");
const runtimeFactory_1 = require("../../node/runtime/runtimeFactory");
const agentDefinitionsService_1 = require("../../node/services/agentDefinitions/agentDefinitionsService");
const agentEnablement_1 = require("../../node/services/agentDefinitions/agentEnablement");
const resolveToolPolicy_1 = require("../../node/services/agentDefinitions/resolveToolPolicy");
const resolveAgentInheritanceChain_1 = require("../../node/services/agentDefinitions/resolveAgentInheritanceChain");
const messageIds_1 = require("./utils/messageIds");
const sendMessageError_1 = require("./utils/sendMessageError");
const taskUtils_1 = require("./taskUtils");
const log_1 = require("./log");
/**
 * Resolve the active agent and compute tool policy for a stream request.
 *
 * This is the first major phase of `streamMessage()` after workspace/runtime setup.
 * It determines which agent definition to use, whether plan mode is active, and what
 * tools are available (via policy). The result feeds into message preparation,
 * system prompt construction, and tool assembly.
 *
 * Returns `Err` only when a disabled agent is requested in a subagent workspace
 * (top-level workspaces silently fall back to exec).
 */
async function resolveAgentForStream(opts) {
    const { workspaceId, metadata, runtime, workspacePath, requestedAgentId: rawAgentId, disableWorkspaceAgents, modelString, callerToolPolicy, cfg, emitError, initStateManager, } = opts;
    const workspaceLog = log_1.log.withFields({ workspaceId, workspaceName: metadata.name });
    // --- Agent ID resolution ---
    // Precedence:
    // - Child workspaces (tasks) use their persisted agentId/agentType.
    // - Main workspaces use the requested agentId (frontend), falling back to exec.
    const requestedAgentIdRaw = workspaceId === muxChat_1.MUX_HELP_CHAT_WORKSPACE_ID
        ? muxChat_1.MUX_HELP_CHAT_AGENT_ID
        : ((metadata.parentWorkspaceId ? (metadata.agentId ?? metadata.agentType) : undefined) ??
            (typeof rawAgentId === "string" ? rawAgentId : undefined) ??
            "exec");
    const requestedAgentIdNormalized = requestedAgentIdRaw.trim().toLowerCase();
    const parsedAgentId = schemas_1.AgentIdSchema.safeParse(requestedAgentIdNormalized);
    const requestedAgentId = parsedAgentId.success ? parsedAgentId.data : "exec";
    let effectiveAgentId = requestedAgentId;
    // When disableWorkspaceAgents is true, skip workspace-specific agents entirely.
    // Use project path so only built-in/global agents are available. This allows "unbricking"
    // when iterating on agent files — a broken agent in the worktree won't affect message sending.
    const agentDiscoveryPath = disableWorkspaceAgents ? metadata.projectPath : workspacePath;
    const isSubagentWorkspace = Boolean(metadata.parentWorkspaceId);
    // --- Load agent definition (with fallback to exec) ---
    let agentDefinition;
    try {
        agentDefinition = await (0, agentDefinitionsService_1.readAgentDefinition)(runtime, agentDiscoveryPath, effectiveAgentId);
    }
    catch (error) {
        workspaceLog.warn("Failed to load agent definition; falling back to exec", {
            effectiveAgentId,
            agentDiscoveryPath,
            disableWorkspaceAgents,
            error: error instanceof Error ? error.message : String(error),
        });
        agentDefinition = await (0, agentDefinitionsService_1.readAgentDefinition)(runtime, agentDiscoveryPath, "exec");
    }
    // Keep agent ID aligned with the actual definition used (may fall back to exec).
    effectiveAgentId = agentDefinition.id;
    // --- Disabled-agent enforcement ---
    // Disabled agents should never run as sub-agents, even if a task workspace already exists
    // on disk (e.g., config changed since creation).
    // For top-level workspaces, fall back to exec to keep the workspace usable.
    if (agentDefinition.id !== "exec") {
        try {
            const resolvedFrontmatter = await (0, agentDefinitionsService_1.resolveAgentFrontmatter)(runtime, agentDiscoveryPath, agentDefinition.id);
            const effectivelyDisabled = (0, agentEnablement_1.isAgentEffectivelyDisabled)({
                cfg,
                agentId: agentDefinition.id,
                resolvedFrontmatter,
            });
            if (effectivelyDisabled) {
                const errorMessage = `Agent '${agentDefinition.id}' is disabled.`;
                if (isSubagentWorkspace) {
                    const errorMessageId = (0, messageIds_1.createAssistantMessageId)();
                    emitError((0, sendMessageError_1.createErrorEvent)(workspaceId, {
                        messageId: errorMessageId,
                        error: errorMessage,
                        errorType: "unknown",
                    }));
                    return (0, result_1.Err)({ type: "unknown", raw: errorMessage });
                }
                workspaceLog.warn("Selected agent is disabled; falling back to exec", {
                    agentId: agentDefinition.id,
                    requestedAgentId,
                });
                agentDefinition = await (0, agentDefinitionsService_1.readAgentDefinition)(runtime, agentDiscoveryPath, "exec");
                effectiveAgentId = agentDefinition.id;
            }
        }
        catch (error) {
            // Best-effort only — do not fail a stream due to disablement resolution.
            workspaceLog.debug("Failed to resolve agent enablement; continuing", {
                agentId: agentDefinition.id,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    // --- Inheritance chain & plan-like detection ---
    const agentsForInheritance = await (0, resolveAgentInheritanceChain_1.resolveAgentInheritanceChain)({
        runtime,
        workspacePath: agentDiscoveryPath,
        agentId: agentDefinition.id,
        agentDefinition,
        workspaceId,
    });
    const agentIsPlanLike = (0, agentTools_1.isPlanLikeInResolvedChain)(agentsForInheritance);
    const effectiveMode = agentDefinition.id === "compact" ? "compact" : agentIsPlanLike ? "plan" : "exec";
    // --- Task nesting depth enforcement ---
    const taskSettings = cfg.taskSettings ?? tasks_1.DEFAULT_TASK_SETTINGS;
    const taskDepth = (0, taskUtils_1.getTaskDepthFromConfig)(cfg, workspaceId);
    const shouldDisableTaskToolsForDepth = taskDepth >= taskSettings.maxTaskNestingDepth;
    // --- Tool policy composition ---
    // Agent policy establishes baseline (deny-all + enable whitelist + runtime restrictions).
    // Caller policy then narrows further if needed.
    const agentToolPolicy = (0, resolveToolPolicy_1.resolveToolPolicyForAgent)({
        agents: agentsForInheritance,
        isSubagent: isSubagentWorkspace,
        disableTaskToolsForDepth: shouldDisableTaskToolsForDepth,
    });
    // The Chat with Mux system workspace must remain sandboxed regardless of caller-supplied
    // toolPolicy (defense-in-depth).
    const systemWorkspaceToolPolicy = workspaceId === muxChat_1.MUX_HELP_CHAT_WORKSPACE_ID
        ? [
            { regex_match: ".*", action: "disable" },
            // Allow docs lookup via built-in skills (e.g. mux-docs), while keeping
            // filesystem/binary execution locked down.
            { regex_match: "agent_skill_read", action: "enable" },
            { regex_match: "agent_skill_read_file", action: "enable" },
            { regex_match: "mux_global_agents_read", action: "enable" },
            { regex_match: "mux_global_agents_write", action: "enable" },
            { regex_match: "ask_user_question", action: "enable" },
            { regex_match: "todo_read", action: "enable" },
            { regex_match: "todo_write", action: "enable" },
            { regex_match: "status_set", action: "enable" },
            { regex_match: "notify", action: "enable" },
        ]
        : undefined;
    const effectiveToolPolicy = callerToolPolicy || agentToolPolicy.length > 0 || systemWorkspaceToolPolicy
        ? [...agentToolPolicy, ...(callerToolPolicy ?? []), ...(systemWorkspaceToolPolicy ?? [])]
        : undefined;
    // --- Sentinel tool names for agent transition detection ---
    // Creates a throwaway runtime to compute the tool name list that the message pipeline
    // uses for mode-transition sentinel injection. This avoids depending on the real
    // tool assembly (which happens later) while still respecting tool policy.
    const earlyRuntime = (0, runtimeFactory_1.createRuntime)({ type: "local", srcBaseDir: process.cwd() });
    const earlyAllTools = await (0, tools_1.getToolsForModel)(modelString, {
        cwd: process.cwd(),
        runtime: earlyRuntime,
        runtimeTempDir: os.tmpdir(),
        secrets: {},
        planFileOnly: agentIsPlanLike,
    }, "", // Empty workspace ID for early stub config
    initStateManager, undefined, undefined);
    const earlyTools = (0, toolPolicy_1.applyToolPolicy)(earlyAllTools, effectiveToolPolicy);
    const toolNamesForSentinel = Object.keys(earlyTools);
    return (0, result_1.Ok)({
        effectiveAgentId,
        agentDefinition,
        agentDiscoveryPath,
        isSubagentWorkspace,
        agentIsPlanLike,
        effectiveMode,
        taskSettings,
        taskDepth,
        shouldDisableTaskToolsForDepth,
        effectiveToolPolicy,
        toolNamesForSentinel,
    });
}
//# sourceMappingURL=agentResolution.js.map