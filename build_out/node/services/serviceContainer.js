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
exports.ServiceContainer = void 0;
const path = __importStar(require("path"));
const fsPromises = __importStar(require("fs/promises"));
const muxChat_1 = require("../../common/constants/muxChat");
const muxChat_2 = require("../../node/constants/muxChat");
const message_1 = require("../../common/types/message");
const log_1 = require("../../node/services/log");
const coreServices_1 = require("../../node/services/coreServices");
const ptyService_1 = require("../../node/services/ptyService");
const projectService_1 = require("../../node/services/projectService");
const muxGatewayOauthService_1 = require("../../node/services/muxGatewayOauthService");
const muxGovernorOauthService_1 = require("../../node/services/muxGovernorOauthService");
const codexOauthService_1 = require("../../node/services/codexOauthService");
const copilotOauthService_1 = require("../../node/services/copilotOauthService");
const terminalService_1 = require("../../node/services/terminalService");
const editorService_1 = require("../../node/services/editorService");
const windowService_1 = require("../../node/services/windowService");
const updateService_1 = require("../../node/services/updateService");
const tokenizerService_1 = require("../../node/services/tokenizerService");
const serverService_1 = require("../../node/services/serverService");
const menuEventService_1 = require("../../node/services/menuEventService");
const voiceService_1 = require("../../node/services/voiceService");
const telemetryService_1 = require("../../node/services/telemetryService");
const featureFlagService_1 = require("../../node/services/featureFlagService");
const sessionTimingService_1 = require("../../node/services/sessionTimingService");
const experimentsService_1 = require("../../node/services/experimentsService");
const workspaceMcpOverridesService_1 = require("../../node/services/workspaceMcpOverridesService");
const mcpOauthService_1 = require("../../node/services/mcpOauthService");
const idleCompactionService_1 = require("../../node/services/idleCompactionService");
const signingService_1 = require("../../node/services/signingService");
const coderService_1 = require("../../node/services/coderService");
const workspaceLifecycleHooks_1 = require("../../node/services/workspaceLifecycleHooks");
const coderLifecycleHooks_1 = require("../../node/runtime/coderLifecycleHooks");
const runtimeFactory_1 = require("../../node/runtime/runtimeFactory");
const policyService_1 = require("../../node/services/policyService");
const modelPresetsService_1 = require("../../node/services/modelPresetsService");
const modelHealthService_1 = require("../../node/services/modelHealthService");
const iconThemeService_1 = require("../../node/services/iconThemeService");
const MUX_HELP_CHAT_WELCOME_MESSAGE_ID = "mux-chat-welcome";
const MUX_HELP_CHAT_WELCOME_MESSAGE = `Hi, I'm Mux.

This is your built-in **Chat with Mux** workspace — a safe place to ask questions about Mux itself.

I can help you:
- Configure global agent behavior by editing **~/.mux/AGENTS.md** (I'll show a diff and ask before writing).
- Pick models/providers and explain Mux modes + tool policies.
- Troubleshoot common setup issues (keys, runtimes, workspaces, etc.).

Try asking:
- "What does AGENTS.md do?"
- "Help me write global instructions for code reviews"
- "How do I set up an OpenAI / Anthropic key in Mux?"
`;
/**
 * ServiceContainer - Central dependency container for all backend services.
 *
 * This class instantiates and wires together all services needed by the ORPC router.
 * Services are accessed via the ORPC context object.
 */
class ServiceContainer {
    config;
    // Core services — instantiated by createCoreServices (shared with `mux run` CLI)
    historyService;
    aiService;
    workspaceService;
    taskService;
    providerService;
    mcpConfigService;
    mcpServerManager;
    sessionUsageService;
    costTrackingService;
    extensionMetadata;
    backgroundProcessManager;
    // Desktop-only services
    projectService;
    muxGatewayOauthService;
    muxGovernorOauthService;
    codexOauthService;
    copilotOauthService;
    terminalService;
    editorService;
    windowService;
    updateService;
    tokenizerService;
    serverService;
    menuEventService;
    voiceService;
    mcpOauthService;
    workspaceMcpOverridesService;
    telemetryService;
    featureFlagService;
    sessionTimingService;
    experimentsService;
    signingService;
    policyService;
    coderService;
    ptyService;
    idleCompactionService;
    modelPresetsService;
    modelHealthService;
    iconThemeService;
    constructor(config) {
        this.config = config;
        // Cross-cutting services: created first so they can be passed to core
        // services via constructor params (no setter injection needed).
        this.policyService = new policyService_1.PolicyService(config);
        this.telemetryService = new telemetryService_1.TelemetryService(config.rootDir);
        this.experimentsService = new experimentsService_1.ExperimentsService({
            telemetryService: this.telemetryService,
            muxHome: config.rootDir,
        });
        this.sessionTimingService = new sessionTimingService_1.SessionTimingService(config, this.telemetryService);
        // Desktop passes WorkspaceMcpOverridesService explicitly so AIService uses
        // the persistent config rather than creating a default with an ephemeral one.
        this.workspaceMcpOverridesService = new workspaceMcpOverridesService_1.WorkspaceMcpOverridesService(config);
        const core = (0, coreServices_1.createCoreServices)({
            config,
            extensionMetadataPath: path.join(config.rootDir, "extensionMetadata.json"),
            workspaceMcpOverridesService: this.workspaceMcpOverridesService,
            policyService: this.policyService,
            telemetryService: this.telemetryService,
            experimentsService: this.experimentsService,
            sessionTimingService: this.sessionTimingService,
        });
        // Spread core services into class fields
        this.historyService = core.historyService;
        this.aiService = core.aiService;
        this.workspaceService = core.workspaceService;
        this.taskService = core.taskService;
        this.providerService = core.providerService;
        this.mcpConfigService = core.mcpConfigService;
        this.mcpServerManager = core.mcpServerManager;
        this.sessionUsageService = core.sessionUsageService;
        this.costTrackingService = core.costTrackingService;
        this.extensionMetadata = core.extensionMetadata;
        this.backgroundProcessManager = core.backgroundProcessManager;
        this.projectService = new projectService_1.ProjectService(config);
        this.modelPresetsService = new modelPresetsService_1.ModelPresetsService(config);
        this.modelHealthService = new modelHealthService_1.ModelHealthService(config);
        this.iconThemeService = new iconThemeService_1.IconThemeService(config);
        // Idle compaction service - auto-compacts workspaces after configured idle period
        this.idleCompactionService = new idleCompactionService_1.IdleCompactionService(config, this.historyService, this.extensionMetadata, (workspaceId) => this.workspaceService.emitIdleCompactionNeeded(workspaceId));
        this.windowService = new windowService_1.WindowService();
        this.mcpOauthService = new mcpOauthService_1.McpOauthService(config, this.mcpConfigService, this.windowService, this.telemetryService);
        this.mcpServerManager.setMcpOauthService(this.mcpOauthService);
        this.muxGatewayOauthService = new muxGatewayOauthService_1.MuxGatewayOauthService(this.providerService, this.windowService);
        this.muxGovernorOauthService = new muxGovernorOauthService_1.MuxGovernorOauthService(config, this.windowService, this.policyService);
        this.codexOauthService = new codexOauthService_1.CodexOauthService(config, this.providerService, this.windowService);
        this.aiService.setCodexOauthService(this.codexOauthService);
        this.copilotOauthService = new copilotOauthService_1.CopilotOauthService(this.providerService, this.windowService);
        // Terminal services - PTYService is cross-platform
        this.ptyService = new ptyService_1.PTYService();
        this.terminalService = new terminalService_1.TerminalService(config, this.ptyService);
        // Wire terminal service to workspace service for cleanup on removal
        this.workspaceService.setTerminalService(this.terminalService);
        // Editor service for opening workspaces in code editors
        this.editorService = new editorService_1.EditorService(config);
        this.updateService = new updateService_1.UpdateService();
        this.tokenizerService = new tokenizerService_1.TokenizerService(this.sessionUsageService);
        this.serverService = new serverService_1.ServerService();
        this.menuEventService = new menuEventService_1.MenuEventService();
        this.voiceService = new voiceService_1.VoiceService(config);
        this.featureFlagService = new featureFlagService_1.FeatureFlagService(config, this.telemetryService);
        this.signingService = (0, signingService_1.getSigningService)();
        this.coderService = coderService_1.coderService;
        const workspaceLifecycleHooks = new workspaceLifecycleHooks_1.WorkspaceLifecycleHooks();
        workspaceLifecycleHooks.registerBeforeArchive((0, coderLifecycleHooks_1.createStopCoderOnArchiveHook)({
            coderService: this.coderService,
            shouldStopOnArchive: () => this.config.loadConfigOrDefault().stopCoderWorkspaceOnArchive !== false,
        }));
        workspaceLifecycleHooks.registerAfterUnarchive((0, coderLifecycleHooks_1.createStartCoderOnUnarchiveHook)({
            coderService: this.coderService,
            shouldStopOnArchive: () => this.config.loadConfigOrDefault().stopCoderWorkspaceOnArchive !== false,
        }));
        this.workspaceService.setWorkspaceLifecycleHooks(workspaceLifecycleHooks);
        // Register globally so all createRuntime calls can create CoderSSHRuntime
        (0, runtimeFactory_1.setGlobalCoderService)(this.coderService);
        // Backend timing stats (behind feature flag).
        this.aiService.on("stream-start", (data) => this.sessionTimingService.handleStreamStart(data));
        this.aiService.on("stream-delta", (data) => this.sessionTimingService.handleStreamDelta(data));
        this.aiService.on("reasoning-delta", (data) => this.sessionTimingService.handleReasoningDelta(data));
        this.aiService.on("tool-call-start", (data) => this.sessionTimingService.handleToolCallStart(data));
        this.aiService.on("tool-call-delta", (data) => this.sessionTimingService.handleToolCallDelta(data));
        this.aiService.on("tool-call-end", (data) => this.sessionTimingService.handleToolCallEnd(data));
        this.aiService.on("stream-end", (data) => this.sessionTimingService.handleStreamEnd(data));
        this.aiService.on("stream-abort", (data) => this.sessionTimingService.handleStreamAbort(data));
    }
    async initialize() {
        await this.extensionMetadata.initialize();
        // Initialize telemetry service
        await this.telemetryService.initialize();
        // Initialize policy service (startup gating)
        await this.policyService.initialize();
        // Initialize feature flag state (don't block startup on network).
        this.featureFlagService
            .getStatsTabState()
            .then((state) => this.sessionTimingService.setStatsTabState(state))
            .catch(() => {
            // Ignore feature flag failures.
        });
        await this.experimentsService.initialize();
        await this.taskService.initialize();
        // Start idle compaction checker
        this.idleCompactionService.start();
        // Refresh Coder SSH config in background (handles binary path changes on restart)
        // Skip getCoderInfo() to avoid caching "unavailable" if coder isn't installed yet
        void this.coderService.ensureSSHConfig().catch(() => {
            // Ignore errors - coder may not be installed
        });
        // Ensure the built-in Chat with Mux system workspace exists.
        // Defensive: startup-time initialization must never crash the app.
        try {
            await this.ensureMuxChatWorkspace();
        }
        catch (error) {
            log_1.log.warn("[ServiceContainer] Failed to ensure Chat with Mux workspace", { error });
        }
    }
    async ensureMuxChatWorkspace() {
        const projectPath = (0, muxChat_2.getMuxHelpChatProjectPath)(this.config.rootDir);
        // Ensure the directory exists (LocalRuntime uses project dir directly).
        await fsPromises.mkdir(projectPath, { recursive: true });
        await this.config.editConfig((config) => {
            let projectConfig = config.projects.get(projectPath);
            if (!projectConfig) {
                projectConfig = { workspaces: [] };
                config.projects.set(projectPath, projectConfig);
            }
            const existing = projectConfig.workspaces.find((w) => w.id === muxChat_1.MUX_HELP_CHAT_WORKSPACE_ID);
            if (!existing) {
                projectConfig.workspaces.push({
                    path: projectPath,
                    id: muxChat_1.MUX_HELP_CHAT_WORKSPACE_ID,
                    name: muxChat_1.MUX_HELP_CHAT_WORKSPACE_NAME,
                    title: muxChat_1.MUX_HELP_CHAT_WORKSPACE_TITLE,
                    agentId: muxChat_1.MUX_HELP_CHAT_AGENT_ID,
                    createdAt: new Date().toISOString(),
                    runtimeConfig: { type: "local" },
                });
                return config;
            }
            // Self-heal: enforce invariants for the system workspace.
            existing.path = projectPath;
            existing.name = muxChat_1.MUX_HELP_CHAT_WORKSPACE_NAME;
            existing.title = muxChat_1.MUX_HELP_CHAT_WORKSPACE_TITLE;
            existing.agentId = muxChat_1.MUX_HELP_CHAT_AGENT_ID;
            existing.createdAt ?? (existing.createdAt = new Date().toISOString());
            existing.runtimeConfig = { type: "local" };
            existing.archivedAt = undefined;
            return config;
        });
        await this.ensureMuxChatWelcomeMessage();
    }
    async ensureMuxChatWelcomeMessage() {
        // Only need to check if any history exists — avoid parsing the entire file
        if (await this.historyService.hasHistory(muxChat_1.MUX_HELP_CHAT_WORKSPACE_ID)) {
            return;
        }
        const message = (0, message_1.createMuxMessage)(MUX_HELP_CHAT_WELCOME_MESSAGE_ID, "assistant", MUX_HELP_CHAT_WELCOME_MESSAGE, 
        // Note: This message should be visible in the UI, so it must NOT be marked synthetic.
        { timestamp: Date.now() });
        const appendResult = await this.historyService.appendToHistory(muxChat_1.MUX_HELP_CHAT_WORKSPACE_ID, message);
        if (!appendResult.success) {
            log_1.log.warn("[ServiceContainer] Failed to seed mux-chat welcome message", {
                error: appendResult.error,
            });
        }
    }
    /**
     * Build the ORPCContext from this container's services.
     * Centralizes the ServiceContainer → ORPCContext mapping so callers
     * (desktop/main.ts, cli/server.ts) don't duplicate a 30-field spread.
     */
    toORPCContext() {
        return {
            config: this.config,
            aiService: this.aiService,
            projectService: this.projectService,
            workspaceService: this.workspaceService,
            taskService: this.taskService,
            providerService: this.providerService,
            muxGatewayOauthService: this.muxGatewayOauthService,
            muxGovernorOauthService: this.muxGovernorOauthService,
            codexOauthService: this.codexOauthService,
            copilotOauthService: this.copilotOauthService,
            terminalService: this.terminalService,
            editorService: this.editorService,
            windowService: this.windowService,
            updateService: this.updateService,
            tokenizerService: this.tokenizerService,
            serverService: this.serverService,
            menuEventService: this.menuEventService,
            voiceService: this.voiceService,
            mcpConfigService: this.mcpConfigService,
            mcpOauthService: this.mcpOauthService,
            workspaceMcpOverridesService: this.workspaceMcpOverridesService,
            mcpServerManager: this.mcpServerManager,
            featureFlagService: this.featureFlagService,
            sessionTimingService: this.sessionTimingService,
            telemetryService: this.telemetryService,
            experimentsService: this.experimentsService,
            sessionUsageService: this.sessionUsageService,
            policyService: this.policyService,
            signingService: this.signingService,
            coderService: this.coderService,
            modelPresetsService: this.modelPresetsService,
            modelHealthService: this.modelHealthService,
            iconThemeService: this.iconThemeService,
        };
    }
    /**
     * Shutdown services that need cleanup
     */
    async shutdown() {
        this.idleCompactionService.stop();
        await this.telemetryService.shutdown();
    }
    setProjectDirectoryPicker(picker) {
        this.projectService.setDirectoryPicker(picker);
    }
    setTerminalWindowManager(manager) {
        this.terminalService.setTerminalWindowManager(manager);
    }
    /**
     * Dispose all services. Called on app quit to clean up resources.
     * Terminates all background processes to prevent orphans.
     */
    async dispose() {
        this.policyService.dispose();
        this.mcpServerManager.dispose();
        await this.mcpOauthService.dispose();
        await this.muxGatewayOauthService.dispose();
        await this.muxGovernorOauthService.dispose();
        await this.codexOauthService.dispose();
        this.copilotOauthService.dispose();
        await this.backgroundProcessManager.terminateAll();
    }
}
exports.ServiceContainer = ServiceContainer;
//# sourceMappingURL=serviceContainer.js.map