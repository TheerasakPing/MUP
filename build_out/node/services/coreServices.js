"use strict";
/**
 * Core service graph shared by `mux run` (CLI) and `ServiceContainer` (desktop).
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
exports.createCoreServices = createCoreServices;
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const historyService_1 = require("../../node/services/historyService");
const partialService_1 = require("../../node/services/partialService");
const initStateManager_1 = require("../../node/services/initStateManager");
const providerService_1 = require("../../node/services/providerService");
const aiService_1 = require("../../node/services/aiService");
const backgroundProcessManager_1 = require("../../node/services/backgroundProcessManager");
const sessionUsageService_1 = require("../../node/services/sessionUsageService");
const costTrackingService_1 = require("../../node/services/costTrackingService");
const mcpConfigService_1 = require("../../node/services/mcpConfigService");
const mcpServerManager_1 = require("../../node/services/mcpServerManager");
const ExtensionMetadataService_1 = require("../../node/services/ExtensionMetadataService");
const workspaceService_1 = require("../../node/services/workspaceService");
const taskService_1 = require("../../node/services/taskService");
function createCoreServices(opts) {
    const { config, extensionMetadataPath } = opts;
    const historyService = new historyService_1.HistoryService(config);
    const partialService = new partialService_1.PartialService(config, historyService);
    const initStateManager = new initStateManager_1.InitStateManager(config);
    const providerService = new providerService_1.ProviderService(config, opts.policyService);
    const backgroundProcessManager = new backgroundProcessManager_1.BackgroundProcessManager(path.join(os.tmpdir(), "mux-bashes"));
    const sessionUsageService = new sessionUsageService_1.SessionUsageService(config, historyService);
    const costTrackingService = new costTrackingService_1.CostTrackingService(config);
    const aiService = new aiService_1.AIService(config, historyService, partialService, initStateManager, providerService, backgroundProcessManager, sessionUsageService, opts.workspaceMcpOverridesService, opts.policyService, opts.telemetryService);
    // MCP: allow callers to override which Config provides server definitions
    const mcpConfigService = new mcpConfigService_1.MCPConfigService(opts.mcpConfig ?? config);
    const mcpServerManager = new mcpServerManager_1.MCPServerManager(mcpConfigService, opts.mcpServerManagerOptions, opts.policyService);
    aiService.setMCPServerManager(mcpServerManager);
    const extensionMetadata = new ExtensionMetadataService_1.ExtensionMetadataService(extensionMetadataPath);
    const workspaceService = new workspaceService_1.WorkspaceService(config, historyService, partialService, aiService, initStateManager, extensionMetadata, backgroundProcessManager, sessionUsageService, costTrackingService, opts.policyService, opts.telemetryService, opts.experimentsService, opts.sessionTimingService);
    workspaceService.setMCPServerManager(mcpServerManager);
    const taskService = new taskService_1.TaskService(config, historyService, partialService, aiService, workspaceService, initStateManager);
    aiService.setTaskService(taskService);
    workspaceService.setTaskService(taskService);
    return {
        historyService,
        partialService,
        initStateManager,
        providerService,
        backgroundProcessManager,
        sessionUsageService,
        aiService,
        mcpConfigService,
        mcpServerManager,
        extensionMetadata,
        workspaceService,
        taskService,
        costTrackingService,
    };
}
//# sourceMappingURL=coreServices.js.map