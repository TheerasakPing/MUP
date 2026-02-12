"use strict";
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
exports.AIService = void 0;
const fs = __importStar(require("fs/promises"));
const events_1 = require("events");
const abort_1 = require("../../node/utils/abort");
const result_1 = require("../../common/types/result");
const message_1 = require("../../common/types/message");
const streamManager_1 = require("./streamManager");
const tools_1 = require("../../common/utils/tools/tools");
const runtimeFactory_1 = require("../../node/runtime/runtimeFactory");
const initHook_1 = require("../../node/runtime/initHook");
const muxChat_1 = require("../../common/constants/muxChat");
const secrets_1 = require("../../common/types/secrets");
const log_1 = require("./log");
const modelMessageTransform_1 = require("../../browser/utils/messages/modelMessageTransform");
const sendMessageError_1 = require("./utils/sendMessageError");
const messageIds_1 = require("./utils/messageIds");
const usageAggregator_1 = require("../../common/utils/tokens/usageAggregator");
const systemMessage_1 = require("./systemMessage");
const workspaceMcpOverridesService_1 = require("./workspaceMcpOverridesService");
const providerOptions_1 = require("../../common/utils/ai/providerOptions");
const compactionBoundary_1 = require("../../common/utils/messages/compactionBoundary");
const thinking_1 = require("../../common/types/thinking");
const mockAiStreamPlayer_1 = require("./mock/mockAiStreamPlayer");
const providerModelFactory_1 = require("./providerModelFactory");
const system1ToolWrapper_1 = require("./system1ToolWrapper");
const messagePipeline_1 = require("./messagePipeline");
const agentResolution_1 = require("./agentResolution");
const streamContextBuilder_1 = require("./streamContextBuilder");
const streamSimulation_1 = require("./streamSimulation");
const toolAssembly_1 = require("./toolAssembly");
// ---------------------------------------------------------------------------
// Utility: deep-clone with structuredClone fallback
// ---------------------------------------------------------------------------
/** Deep-clone a value using structuredClone (with JSON fallback). */
function safeClone(value) {
    return typeof structuredClone === "function"
        ? structuredClone(value)
        : JSON.parse(JSON.stringify(value));
}
class AIService extends events_1.EventEmitter {
    streamManager;
    historyService;
    partialService;
    config;
    workspaceMcpOverridesService;
    mcpServerManager;
    policyService;
    telemetryService;
    initStateManager;
    mockModeEnabled;
    mockAiStreamPlayer;
    backgroundProcessManager;
    sessionUsageService;
    providerModelFactory;
    // Tracks in-flight stream startup (before StreamManager emits stream-start).
    // This enables user interrupts (Esc/Ctrl+C) during the UI "starting..." phase.
    pendingStreamStarts = new Map();
    // Debug: captured LLM request payloads for last send per workspace
    lastLlmRequestByWorkspace = new Map();
    taskService;
    extraTools;
    constructor(config, historyService, partialService, initStateManager, providerService, backgroundProcessManager, sessionUsageService, workspaceMcpOverridesService, policyService, telemetryService) {
        super();
        // Increase max listeners to accommodate multiple concurrent workspace listeners
        // Each workspace subscribes to stream events, and we expect >10 concurrent workspaces
        this.setMaxListeners(50);
        this.workspaceMcpOverridesService =
            workspaceMcpOverridesService ?? new workspaceMcpOverridesService_1.WorkspaceMcpOverridesService(config);
        this.config = config;
        this.historyService = historyService;
        this.partialService = partialService;
        this.initStateManager = initStateManager;
        this.backgroundProcessManager = backgroundProcessManager;
        this.sessionUsageService = sessionUsageService;
        this.policyService = policyService;
        this.telemetryService = telemetryService;
        this.streamManager = new streamManager_1.StreamManager(historyService, partialService, sessionUsageService);
        this.providerModelFactory = new providerModelFactory_1.ProviderModelFactory(config, providerService, policyService);
        void this.ensureSessionsDir();
        this.setupStreamEventForwarding();
        this.mockModeEnabled = false;
        if (process.env.MUX_MOCK_AI === "1") {
            log_1.log.info("AIService running in MUX_MOCK_AI mode");
            this.enableMockMode();
        }
    }
    setCodexOauthService(service) {
        this.providerModelFactory.codexOauthService = service;
    }
    setMCPServerManager(manager) {
        this.mcpServerManager = manager;
        this.streamManager.setMCPServerManager(manager);
    }
    setTaskService(taskService) {
        this.taskService = taskService;
    }
    /**
     * Set extra tools to include in every tool call.
     * Used by CLI to inject tools like set_exit_code without modifying core tool definitions.
     */
    setExtraTools(tools) {
        this.extraTools = tools;
    }
    /**
     * Forward all stream events from StreamManager to AIService consumers
     */
    setupStreamEventForwarding() {
        // Simple one-to-one event forwarding from StreamManager → AIService consumers
        for (const event of [
            "stream-start",
            "stream-delta",
            "error",
            "tool-call-start",
            "tool-call-delta",
            "tool-call-end",
            "reasoning-delta",
            "reasoning-end",
            "usage-delta",
        ]) {
            this.streamManager.on(event, (data) => this.emit(event, data));
        }
        // stream-end needs extra logic: capture provider response for debug modal
        this.streamManager.on("stream-end", (data) => {
            // Best-effort capture of the provider response for the "Last LLM request" debug modal.
            // Must never break live streaming.
            try {
                const snapshot = this.lastLlmRequestByWorkspace.get(data.workspaceId);
                if (snapshot) {
                    // If messageId is missing (legacy fixtures), attach anyway.
                    const shouldAttach = snapshot.messageId === data.messageId || snapshot.messageId == null;
                    if (shouldAttach) {
                        const updated = {
                            ...snapshot,
                            response: {
                                capturedAt: Date.now(),
                                metadata: data.metadata,
                                parts: data.parts,
                            },
                        };
                        this.lastLlmRequestByWorkspace.set(data.workspaceId, safeClone(updated));
                    }
                }
            }
            catch (error) {
                const errMsg = error instanceof Error ? error.message : String(error);
                log_1.log.warn("Failed to capture debug LLM response snapshot", { error: errMsg });
            }
            this.emit("stream-end", data);
        });
        // Handle stream-abort: dispose of partial based on abandonPartial flag
        this.streamManager.on("stream-abort", (data) => {
            void (async () => {
                if (data.abandonPartial) {
                    // Caller requested discarding partial - delete without committing
                    await this.partialService.deletePartial(data.workspaceId);
                }
                else {
                    // Commit interrupted message to history with partial:true metadata
                    // This ensures /clear and /truncate can clean up interrupted messages
                    const partial = await this.partialService.readPartial(data.workspaceId);
                    if (partial) {
                        await this.partialService.commitToHistory(data.workspaceId);
                        await this.partialService.deletePartial(data.workspaceId);
                    }
                }
                // Forward abort event to consumers
                this.emit("stream-abort", data);
            })();
        });
    }
    async ensureSessionsDir() {
        try {
            await fs.mkdir(this.config.sessionsDir, { recursive: true });
        }
        catch (error) {
            log_1.log.error("Failed to create sessions directory:", error);
        }
    }
    isMockModeEnabled() {
        return this.mockModeEnabled;
    }
    releaseMockStreamStartGate(workspaceId) {
        this.mockAiStreamPlayer?.releaseStreamStartGate(workspaceId);
    }
    enableMockMode() {
        this.mockModeEnabled = true;
        this.mockAiStreamPlayer ?? (this.mockAiStreamPlayer = new mockAiStreamPlayer_1.MockAiStreamPlayer({
            aiService: this,
            historyService: this.historyService,
        }));
    }
    async getWorkspaceMetadata(workspaceId) {
        try {
            // Read from config.json (single source of truth)
            // getAllWorkspaceMetadata() handles migration from legacy metadata.json files
            const allMetadata = await this.config.getAllWorkspaceMetadata();
            const metadata = allMetadata.find((m) => m.id === workspaceId);
            if (!metadata) {
                return (0, result_1.Err)(`Workspace metadata not found for ${workspaceId}. Workspace may not be properly initialized.`);
            }
            return (0, result_1.Ok)(metadata);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return (0, result_1.Err)(`Failed to read workspace metadata: ${message}`);
        }
    }
    /**
     * Create an AI SDK model from a model string (e.g., "anthropic:claude-opus-4-1").
     * Delegates to ProviderModelFactory.
     */
    async createModel(modelString, muxProviderOptions) {
        return this.providerModelFactory.createModel(modelString, muxProviderOptions);
    }
    /** Stream a message conversation to the AI model. */
    async streamMessage(opts) {
        const { messages, workspaceId, modelString, thinkingLevel, toolPolicy, abortSignal, additionalSystemInstructions, maxOutputTokens, muxProviderOptions, agentId, recordFileState, changedFileAttachments, postCompactionAttachments, experiments, system1Model, system1ThinkingLevel, disableWorkspaceAgents, hasQueuedMessage, openaiTruncationModeOverride, } = opts;
        // Support interrupts during startup (before StreamManager emits stream-start).
        // We register an AbortController up-front and let stopStream() abort it.
        const pendingAbortController = new AbortController();
        const startTime = Date.now();
        const syntheticMessageId = `starting-${startTime}-${Math.random().toString(36).substring(2, 11)}`;
        // Link external abort signal (if provided).
        const unlinkAbortSignal = (0, abort_1.linkAbortSignal)(abortSignal, pendingAbortController);
        this.pendingStreamStarts.set(workspaceId, {
            abortController: pendingAbortController,
            startTime,
            syntheticMessageId,
        });
        const combinedAbortSignal = pendingAbortController.signal;
        try {
            if (this.mockModeEnabled && this.mockAiStreamPlayer) {
                await this.initStateManager.waitForInit(workspaceId, combinedAbortSignal);
                if (combinedAbortSignal.aborted) {
                    return (0, result_1.Ok)(undefined);
                }
                return await this.mockAiStreamPlayer.play(messages, workspaceId, {
                    model: modelString,
                    abortSignal: combinedAbortSignal,
                });
            }
            // DEBUG: Log streamMessage call
            const lastMessage = messages[messages.length - 1];
            log_1.log.debug(`[STREAM MESSAGE] workspaceId=${workspaceId} messageCount=${messages.length} lastRole=${lastMessage?.role}`);
            // Before starting a new stream, commit any existing partial to history
            // This is idempotent - won't double-commit if already in chat.jsonl
            await this.partialService.commitToHistory(workspaceId);
            // Helper: clean up an assistant placeholder that was appended to history but never
            // streamed (due to abort during setup). Used in two abort-check sites below.
            const deleteAbortedPlaceholder = async (messageId) => {
                const deleteResult = await this.historyService.deleteMessage(workspaceId, messageId);
                if (!deleteResult.success) {
                    log_1.log.error(`Failed to delete aborted assistant placeholder (${messageId}): ${deleteResult.error}`);
                }
            };
            // Mode (plan|exec|compact) is derived from the selected agent definition.
            const effectiveMuxProviderOptions = muxProviderOptions ?? {};
            const effectiveThinkingLevel = thinkingLevel ?? thinking_1.THINKING_LEVEL_OFF;
            // Resolve model string (xAI variant mapping + gateway routing) and create the model.
            const modelResult = await this.providerModelFactory.resolveAndCreateModel(modelString, effectiveThinkingLevel, effectiveMuxProviderOptions);
            if (!modelResult.success) {
                return (0, result_1.Err)(modelResult.error);
            }
            const { effectiveModelString, canonicalModelString, canonicalProviderName, routedThroughGateway, } = modelResult.data;
            // Dump original messages for debugging
            log_1.log.debug_obj(`${workspaceId}/1_original_messages.json`, messages);
            // toolNamesForSentinel is set after agent resolution below, used in message pipeline.
            let toolNamesForSentinel = [];
            // Filter out assistant messages with only reasoning (no text/tools)
            // EXCEPTION: When extended thinking is enabled, preserve reasoning-only messages
            // to comply with Extended Thinking API requirements
            const preserveReasoningOnly = canonicalProviderName === "anthropic" && effectiveThinkingLevel !== "off";
            const filteredMessages = (0, modelMessageTransform_1.filterEmptyAssistantMessages)(messages, preserveReasoningOnly);
            log_1.log.debug(`Filtered ${messages.length - filteredMessages.length} empty assistant messages`);
            log_1.log.debug_obj(`${workspaceId}/1a_filtered_messages.json`, filteredMessages);
            // WS2 request slicing: only send the latest compaction epoch to providers.
            // This is request-only; persisted history remains append-only for replay/debugging.
            const providerRequestMessages = (0, compactionBoundary_1.sliceMessagesFromLatestCompactionBoundary)(filteredMessages);
            if (providerRequestMessages !== filteredMessages) {
                log_1.log.debug("Sliced provider history from latest compaction boundary", {
                    workspaceId,
                    originalCount: filteredMessages.length,
                    slicedCount: providerRequestMessages.length,
                });
            }
            log_1.log.debug_obj(`${workspaceId}/1b_provider_request_messages.json`, providerRequestMessages);
            // OpenAI-specific: Keep reasoning parts in history
            // OpenAI manages conversation state via previousResponseId
            if (canonicalProviderName === "openai") {
                log_1.log.debug("Keeping reasoning parts for OpenAI (managed via previousResponseId)");
            }
            // Add [CONTINUE] sentinel to partial messages (for model context)
            const messagesWithSentinel = (0, modelMessageTransform_1.addInterruptedSentinel)(providerRequestMessages);
            // Get workspace metadata to retrieve workspace path
            const metadataResult = await this.getWorkspaceMetadata(workspaceId);
            if (!metadataResult.success) {
                return (0, result_1.Err)({ type: "unknown", raw: metadataResult.error });
            }
            const metadata = metadataResult.data;
            if (this.policyService?.isEnforced()) {
                if (!this.policyService.isRuntimeAllowed(metadata.runtimeConfig)) {
                    return (0, result_1.Err)({
                        type: "policy_denied",
                        message: "Workspace runtime is not allowed by policy",
                    });
                }
            }
            const workspaceLog = log_1.log.withFields({ workspaceId, workspaceName: metadata.name });
            if (!this.config.findWorkspace(workspaceId)) {
                return (0, result_1.Err)({ type: "unknown", raw: `Workspace ${workspaceId} not found in config` });
            }
            const runtime = (0, runtimeFactory_1.createRuntime)(metadata.runtimeConfig, {
                projectPath: metadata.projectPath,
                workspaceName: metadata.name,
            });
            // In-place workspaces (CLI/benchmarks) have projectPath === name
            // Use path directly instead of reconstructing via getWorkspacePath
            const isInPlace = metadata.projectPath === metadata.name;
            const workspacePath = isInPlace
                ? metadata.projectPath
                : runtime.getWorkspacePath(metadata.projectPath, metadata.name);
            // Wait for init to complete before any runtime I/O operations
            // (SSH/devcontainer may not be ready until init finishes pulling the container)
            await this.initStateManager.waitForInit(workspaceId, combinedAbortSignal);
            if (combinedAbortSignal.aborted) {
                return (0, result_1.Ok)(undefined);
            }
            // Verify runtime is actually reachable after init completes.
            // For Docker workspaces, this checks the container exists and starts it if stopped.
            // For Coder workspaces, this may start a stopped workspace and wait for it.
            // If init failed during container creation, ensureReady() will return an error.
            const readyResult = await runtime.ensureReady({
                signal: combinedAbortSignal,
                statusSink: (status) => {
                    // Emit runtime-status events for frontend UX (StreamingBarrier)
                    this.emit("runtime-status", {
                        type: "runtime-status",
                        workspaceId,
                        phase: status.phase,
                        runtimeType: status.runtimeType,
                        detail: status.detail,
                    });
                },
            });
            if (!readyResult.ready) {
                // Generate message ID for the error event (frontend needs this for synthetic message)
                const errorMessageId = (0, messageIds_1.createAssistantMessageId)();
                const runtimeType = metadata.runtimeConfig?.type ?? "local";
                const runtimeLabel = runtimeType === "docker" ? "Container" : "Runtime";
                const errorMessage = readyResult.error || `${runtimeLabel} unavailable.`;
                // Use the errorType from ensureReady result (runtime_not_ready vs runtime_start_failed)
                const errorType = readyResult.errorType;
                // Emit error event so frontend receives it via stream subscription.
                // This mirrors the context_exceeded pattern - the fire-and-forget sendMessage
                // call in useCreationWorkspace.ts won't see the returned Err, but will receive
                // this event through the workspace chat subscription.
                this.emit("error", (0, sendMessageError_1.createErrorEvent)(workspaceId, {
                    messageId: errorMessageId,
                    error: errorMessage,
                    errorType,
                }));
                return (0, result_1.Err)({
                    type: errorType,
                    message: errorMessage,
                });
            }
            // Resolve agent definition, compute effective mode & tool policy.
            const cfg = this.config.loadConfigOrDefault();
            const agentResult = await (0, agentResolution_1.resolveAgentForStream)({
                workspaceId,
                metadata,
                runtime,
                workspacePath,
                requestedAgentId: agentId,
                disableWorkspaceAgents: disableWorkspaceAgents ?? false,
                modelString,
                callerToolPolicy: toolPolicy,
                cfg,
                emitError: (event) => this.emit("error", event),
                initStateManager: this.initStateManager,
            });
            if (!agentResult.success) {
                return agentResult;
            }
            const { effectiveAgentId, agentDefinition, agentDiscoveryPath, isSubagentWorkspace, agentIsPlanLike, effectiveMode, taskSettings, taskDepth, shouldDisableTaskToolsForDepth, effectiveToolPolicy, } = agentResult.data;
            toolNamesForSentinel = agentResult.data.toolNamesForSentinel;
            // Fetch workspace MCP overrides (for filtering servers and tools)
            // NOTE: Stored in <workspace>/.mux/mcp.local.jsonc (not ~/.mux/config.json).
            let mcpOverrides;
            try {
                mcpOverrides =
                    await this.workspaceMcpOverridesService.getOverridesForWorkspace(workspaceId);
            }
            catch (error) {
                log_1.log.warn("[MCP] Failed to load workspace MCP overrides; continuing without overrides", {
                    workspaceId,
                    error,
                });
                mcpOverrides = undefined;
            }
            // Fetch MCP server config for system prompt (before building message)
            // Pass overrides to filter out disabled servers
            const mcpServers = this.mcpServerManager && workspaceId !== muxChat_1.MUX_HELP_CHAT_WORKSPACE_ID
                ? await this.mcpServerManager.listServers(metadata.projectPath, mcpOverrides)
                : undefined;
            // Build plan-aware instructions and determine plan→exec transition content.
            // IMPORTANT: Derive this from the same boundary-sliced message payload that is sent to
            // the model so plan hints/handoffs cannot be suppressed by pre-boundary history.
            const { effectiveAdditionalInstructions, planFilePath, planContentForTransition } = await (0, streamContextBuilder_1.buildPlanInstructions)({
                runtime,
                metadata,
                workspaceId,
                workspacePath,
                effectiveMode,
                effectiveAgentId,
                agentIsPlanLike,
                agentDiscoveryPath,
                additionalSystemInstructions,
                shouldDisableTaskToolsForDepth,
                taskDepth,
                taskSettings,
                requestPayloadMessages: providerRequestMessages,
            });
            // Run the full message preparation pipeline (inject context, transform, validate).
            // This is a purely functional pipeline with no service dependencies.
            const finalMessages = await (0, messagePipeline_1.prepareMessagesForProvider)({
                messagesWithSentinel,
                effectiveAgentId,
                toolNamesForSentinel,
                planContentForTransition,
                planFilePath,
                changedFileAttachments,
                postCompactionAttachments,
                runtime,
                workspacePath,
                abortSignal: combinedAbortSignal,
                providerForMessages: canonicalProviderName,
                effectiveThinkingLevel,
                modelString,
                workspaceId,
            });
            // Build agent system prompt, system message, and discover agents/skills.
            const { agentSystemPrompt, systemMessage, systemMessageTokens, agentDefinitions, availableSkills, } = await (0, streamContextBuilder_1.buildStreamSystemContext)({
                runtime,
                metadata,
                workspacePath,
                workspaceId,
                agentDefinition,
                agentDiscoveryPath,
                isSubagentWorkspace,
                effectiveAdditionalInstructions,
                modelString,
                cfg,
                mcpServers,
            });
            // Load project secrets (system workspace never gets secrets injected)
            const projectSecrets = workspaceId === muxChat_1.MUX_HELP_CHAT_WORKSPACE_ID
                ? []
                : this.config.getEffectiveSecrets(metadata.projectPath);
            // Generate stream token and create temp directory for tools
            const streamToken = this.streamManager.generateStreamToken();
            let mcpTools;
            let mcpStats;
            let mcpSetupDurationMs = 0;
            if (this.mcpServerManager && workspaceId !== muxChat_1.MUX_HELP_CHAT_WORKSPACE_ID) {
                const start = Date.now();
                try {
                    const result = await this.mcpServerManager.getToolsForWorkspace({
                        workspaceId,
                        projectPath: metadata.projectPath,
                        runtime,
                        workspacePath,
                        overrides: mcpOverrides,
                        projectSecrets: (0, secrets_1.secretsToRecord)(projectSecrets),
                    });
                    mcpTools = result.tools;
                    mcpStats = result.stats;
                }
                catch (error) {
                    workspaceLog.error("Failed to start MCP servers", { error });
                }
                finally {
                    mcpSetupDurationMs = Date.now() - start;
                }
            }
            const runtimeTempDir = await this.streamManager.createTempDirForStream(streamToken, runtime);
            // Extract tool-specific instructions from AGENTS.md files and agent definition
            const toolInstructions = await (0, systemMessage_1.readToolInstructions)(metadata, runtime, workspacePath, modelString, agentSystemPrompt);
            // Calculate cumulative session costs for MUX_COSTS_USD env var
            let sessionCostsUsd;
            if (this.sessionUsageService) {
                const sessionUsage = await this.sessionUsageService.getSessionUsage(workspaceId);
                if (sessionUsage) {
                    const allUsage = (0, usageAggregator_1.sumUsageHistory)(Object.values(sessionUsage.byModel));
                    sessionCostsUsd = (0, usageAggregator_1.getTotalCost)(allUsage);
                }
            }
            // Get model-specific tools with workspace path (correct for local or remote)
            const allTools = await (0, tools_1.getToolsForModel)(modelString, {
                cwd: workspacePath,
                runtime,
                secrets: (0, secrets_1.secretsToRecord)(projectSecrets),
                muxEnv: (0, initHook_1.getMuxEnv)(metadata.projectPath, (0, initHook_1.getRuntimeType)(metadata.runtimeConfig), metadata.name, {
                    modelString,
                    thinkingLevel: thinkingLevel ?? "off",
                    costsUsd: sessionCostsUsd,
                }),
                runtimeTempDir,
                backgroundProcessManager: this.backgroundProcessManager,
                // Plan agent configuration for plan file access.
                // - read: plan file is readable in all agents (useful context)
                // - write: enforced by file_edit_* tools (plan file is read-only outside plan agent)
                planFileOnly: agentIsPlanLike,
                emitChatEvent: (event) => {
                    // Defensive: tools should only emit events for the workspace they belong to.
                    if ("workspaceId" in event && event.workspaceId !== workspaceId) {
                        return;
                    }
                    this.emit(event.type, event);
                },
                workspaceSessionDir: this.config.getSessionDir(workspaceId),
                planFilePath,
                workspaceId,
                // Only child workspaces (tasks) can report to a parent.
                enableAgentReport: Boolean(metadata.parentWorkspaceId),
                // External edit detection callback
                recordFileState,
                taskService: this.taskService,
                // PTC experiments for inheritance to subagents
                experiments,
                // Dynamic context for tool descriptions (moved from system prompt for better model attention)
                availableSubagents: agentDefinitions,
                availableSkills,
            }, workspaceId, this.initStateManager, toolInstructions, mcpTools);
            // Create assistant message ID early so the PTC callback closure captures it.
            // The placeholder is appended to history below (after abort check).
            const assistantMessageId = (0, messageIds_1.createAssistantMessageId)();
            // Apply tool policy and PTC experiments (lazy-loads PTC dependencies only when needed).
            const tools = await (0, toolAssembly_1.applyToolPolicyAndExperiments)({
                allTools,
                extraTools: this.extraTools,
                effectiveToolPolicy,
                experiments,
                // Forward nested PTC tool events to the stream (tool-call-start/end only,
                // not console events which appear in final result only).
                emitNestedToolEvent: (event) => {
                    if (event.type === "tool-call-start" || event.type === "tool-call-end") {
                        this.streamManager.emitNestedToolEvent(workspaceId, assistantMessageId, event);
                    }
                },
            });
            (0, toolAssembly_1.captureMcpToolTelemetry)({
                telemetryService: this.telemetryService,
                mcpStats,
                mcpTools,
                tools,
                mcpSetupDurationMs,
                workspaceId,
                modelString,
                effectiveAgentId,
                metadata,
                effectiveToolPolicy,
            });
            if (combinedAbortSignal.aborted) {
                return (0, result_1.Ok)(undefined);
            }
            const assistantMessage = (0, message_1.createMuxMessage)(assistantMessageId, "assistant", "", {
                timestamp: Date.now(),
                model: canonicalModelString,
                routedThroughGateway,
                systemMessageTokens,
                agentId: effectiveAgentId,
            });
            // Append to history to get historySequence assigned
            const appendResult = await this.historyService.appendToHistory(workspaceId, assistantMessage);
            if (!appendResult.success) {
                return (0, result_1.Err)({ type: "unknown", raw: appendResult.error });
            }
            // Get the assigned historySequence
            const historySequence = assistantMessage.metadata?.historySequence ?? 0;
            // Handle simulated stream scenarios (OpenAI SDK testing features).
            // These emit synthetic stream events without calling an AI provider.
            const forceContextLimitError = modelString.startsWith("openai:") &&
                effectiveMuxProviderOptions.openai?.forceContextLimitError === true;
            const simulateToolPolicyNoopFlag = modelString.startsWith("openai:") &&
                effectiveMuxProviderOptions.openai?.simulateToolPolicyNoop === true;
            if (forceContextLimitError || simulateToolPolicyNoopFlag) {
                const simulationCtx = {
                    workspaceId,
                    assistantMessageId,
                    canonicalModelString,
                    routedThroughGateway,
                    historySequence,
                    systemMessageTokens,
                    effectiveAgentId,
                    effectiveMode,
                    effectiveThinkingLevel,
                    emit: (event, data) => this.emit(event, data),
                };
                if (forceContextLimitError) {
                    await (0, streamSimulation_1.simulateContextLimitError)(simulationCtx, this.partialService);
                }
                else {
                    await (0, streamSimulation_1.simulateToolPolicyNoop)(simulationCtx, effectiveToolPolicy, this.historyService, this.partialService);
                }
                return (0, result_1.Ok)(undefined);
            }
            // Build provider options based on thinking level and request-sliced message history.
            const truncationMode = openaiTruncationModeOverride;
            // Use the same boundary-sliced payload history that we send to the provider.
            // This prevents previousResponseId lookup from reaching pre-compaction epochs.
            // Also pass callback to filter out lost responseIds (OpenAI invalidated them).
            // Pass workspaceId to derive stable promptCacheKey for OpenAI caching.
            const providerOptions = (0, providerOptions_1.buildProviderOptions)(modelString, effectiveThinkingLevel, providerRequestMessages, (id) => this.streamManager.isResponseIdLost(id), effectiveMuxProviderOptions, workspaceId, truncationMode);
            // Debug dump: Log the complete LLM request when MUX_DEBUG_LLM_REQUEST is set
            if (process.env.MUX_DEBUG_LLM_REQUEST === "1") {
                log_1.log.info(`[MUX_DEBUG_LLM_REQUEST] Full LLM request:\n${JSON.stringify({
                    workspaceId,
                    model: modelString,
                    systemMessage,
                    messages: finalMessages,
                    tools: Object.fromEntries(Object.entries(tools).map(([n, t]) => [
                        n,
                        { description: t.description, inputSchema: t.inputSchema },
                    ])),
                    providerOptions,
                    thinkingLevel: effectiveThinkingLevel,
                    maxOutputTokens,
                    mode: effectiveMode,
                    agentId: effectiveAgentId,
                    toolPolicy: effectiveToolPolicy,
                }, null, 2)}`);
            }
            if (combinedAbortSignal.aborted) {
                await deleteAbortedPlaceholder(assistantMessageId);
                return (0, result_1.Ok)(undefined);
            }
            // Capture request payload for the debug modal, then delegate to StreamManager.
            const snapshot = {
                capturedAt: Date.now(),
                workspaceId,
                messageId: assistantMessageId,
                model: modelString,
                providerName: canonicalProviderName,
                thinkingLevel: effectiveThinkingLevel,
                mode: effectiveMode,
                agentId: effectiveAgentId,
                maxOutputTokens,
                systemMessage,
                messages: finalMessages,
            };
            try {
                this.lastLlmRequestByWorkspace.set(workspaceId, safeClone(snapshot));
            }
            catch (error) {
                const errMsg = error instanceof Error ? error.message : String(error);
                workspaceLog.warn("Failed to capture debug LLM request snapshot", { error: errMsg });
            }
            const toolsForStream = experiments?.system1 === true
                ? (0, system1ToolWrapper_1.wrapToolsWithSystem1)({
                    tools,
                    system1Model,
                    system1ThinkingLevel,
                    modelString,
                    effectiveModelString,
                    primaryModel: modelResult.data.model,
                    muxProviderOptions: effectiveMuxProviderOptions,
                    workspaceId,
                    effectiveMode,
                    planFilePath,
                    taskSettings,
                    runtimeTempDir,
                    runtime,
                    agentDiscoveryPath,
                    resolveGatewayModelString: (ms, dm, eg) => this.providerModelFactory.resolveGatewayModelString(ms, dm, eg),
                    createModel: (ms, o) => this.createModel(ms, o),
                    emitBashOutput: (ev) => this.emit("bash-output", ev),
                })
                : tools;
            const streamResult = await this.streamManager.startStream(workspaceId, finalMessages, modelResult.data.model, modelString, historySequence, systemMessage, runtime, assistantMessageId, // Shared messageId ensures nested tool events match stream events
            combinedAbortSignal, toolsForStream, {
                systemMessageTokens,
                timestamp: Date.now(),
                agentId: effectiveAgentId,
                mode: effectiveMode,
                routedThroughGateway,
                ...((0, providerModelFactory_1.modelCostsIncluded)(modelResult.data.model) ? { costsIncluded: true } : {}),
            }, providerOptions, maxOutputTokens, effectiveToolPolicy, streamToken, // Pass the pre-generated stream token
            hasQueuedMessage, metadata.name, effectiveThinkingLevel);
            if (!streamResult.success) {
                // StreamManager already returns SendMessageError
                return (0, result_1.Err)(streamResult.error);
            }
            // If we were interrupted during StreamManager startup before the stream was registered,
            // make sure we don't leave an empty assistant placeholder behind.
            if (combinedAbortSignal.aborted && !this.streamManager.isStreaming(workspaceId)) {
                await deleteAbortedPlaceholder(assistantMessageId);
            }
            // StreamManager now handles history updates directly on stream-end
            // No need for event listener here
            return (0, result_1.Ok)(undefined);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            log_1.log.error("Stream message error:", error);
            // Return as unknown error type
            return (0, result_1.Err)({ type: "unknown", raw: `Failed to stream message: ${errorMessage}` });
        }
        finally {
            unlinkAbortSignal();
            const pending = this.pendingStreamStarts.get(workspaceId);
            if (pending?.abortController === pendingAbortController) {
                this.pendingStreamStarts.delete(workspaceId);
            }
        }
    }
    async stopStream(workspaceId, options) {
        const pending = this.pendingStreamStarts.get(workspaceId);
        const isActuallyStreaming = this.mockModeEnabled && this.mockAiStreamPlayer
            ? this.mockAiStreamPlayer.isStreaming(workspaceId)
            : this.streamManager.isStreaming(workspaceId);
        if (pending) {
            pending.abortController.abort();
            // If we're still in pre-stream startup (no StreamManager stream yet), emit a synthetic
            // stream-abort so the renderer can exit the "starting..." UI immediately.
            const abortReason = options?.abortReason ?? "startup";
            if (!isActuallyStreaming) {
                this.emit("stream-abort", {
                    type: "stream-abort",
                    workspaceId,
                    abortReason,
                    messageId: pending.syntheticMessageId,
                    metadata: { duration: Date.now() - pending.startTime },
                    abandonPartial: options?.abandonPartial,
                });
            }
        }
        if (this.mockModeEnabled && this.mockAiStreamPlayer) {
            this.mockAiStreamPlayer.stop(workspaceId);
            return (0, result_1.Ok)(undefined);
        }
        return this.streamManager.stopStream(workspaceId, options);
    }
    /**
     * Check if a workspace is currently streaming
     */
    isStreaming(workspaceId) {
        if (this.mockModeEnabled && this.mockAiStreamPlayer) {
            return this.mockAiStreamPlayer.isStreaming(workspaceId);
        }
        return this.streamManager.isStreaming(workspaceId);
    }
    /**
     * Get the current stream state for a workspace
     */
    getStreamState(workspaceId) {
        if (this.mockModeEnabled && this.mockAiStreamPlayer) {
            return this.mockAiStreamPlayer.isStreaming(workspaceId) ? "streaming" : "idle";
        }
        return this.streamManager.getStreamState(workspaceId);
    }
    /**
     * Get the current stream info for a workspace if actively streaming
     * Used to re-establish streaming context on frontend reconnection
     */
    getStreamInfo(workspaceId) {
        if (this.mockModeEnabled && this.mockAiStreamPlayer) {
            return undefined;
        }
        return this.streamManager.getStreamInfo(workspaceId);
    }
    /**
     * Replay stream events
     * Emits the same events that would be emitted during live streaming
     */
    async replayStream(workspaceId) {
        if (this.mockModeEnabled && this.mockAiStreamPlayer) {
            await this.mockAiStreamPlayer.replayStream(workspaceId);
            return;
        }
        await this.streamManager.replayStream(workspaceId);
    }
    debugGetLastMockPrompt(workspaceId) {
        if (typeof workspaceId !== "string" || workspaceId.trim().length === 0) {
            return (0, result_1.Err)("debugGetLastMockPrompt: workspaceId is required");
        }
        if (!this.mockModeEnabled || !this.mockAiStreamPlayer) {
            return (0, result_1.Ok)(null);
        }
        return (0, result_1.Ok)(this.mockAiStreamPlayer.debugGetLastPrompt(workspaceId));
    }
    debugGetLastMockModel(workspaceId) {
        if (typeof workspaceId !== "string" || workspaceId.trim().length === 0) {
            return (0, result_1.Err)("debugGetLastMockModel: workspaceId is required");
        }
        if (!this.mockModeEnabled || !this.mockAiStreamPlayer) {
            return (0, result_1.Ok)(null);
        }
        return (0, result_1.Ok)(this.mockAiStreamPlayer.debugGetLastModel(workspaceId));
    }
    debugGetLastLlmRequest(workspaceId) {
        if (typeof workspaceId !== "string" || workspaceId.trim().length === 0) {
            return (0, result_1.Err)("debugGetLastLlmRequest: workspaceId is required");
        }
        return (0, result_1.Ok)(this.lastLlmRequestByWorkspace.get(workspaceId) ?? null);
    }
    /**
     * DEBUG ONLY: Trigger an artificial stream error for testing.
     * This is used by integration tests to simulate network errors mid-stream.
     * @returns true if an active stream was found and error was triggered
     */
    debugTriggerStreamError(workspaceId, errorMessage = "Test-triggered stream error") {
        return this.streamManager.debugTriggerStreamError(workspaceId, errorMessage);
    }
    /**
     * Wait for workspace initialization to complete (if running).
     * Public wrapper for agent discovery and other callers.
     */
    async waitForInit(workspaceId, abortSignal) {
        return this.initStateManager.waitForInit(workspaceId, abortSignal);
    }
    async deleteWorkspace(workspaceId) {
        try {
            const workspaceDir = this.config.getSessionDir(workspaceId);
            await fs.rm(workspaceDir, { recursive: true, force: true });
            return (0, result_1.Ok)(undefined);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return (0, result_1.Err)(`Failed to delete workspace: ${message}`);
        }
    }
}
exports.AIService = AIService;
//# sourceMappingURL=aiService.js.map