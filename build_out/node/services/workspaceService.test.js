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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const workspaceService_1 = require("./workspaceService");
const workspaceLifecycleHooks_1 = require("./workspaceLifecycleHooks");
const events_1 = require("events");
const fsPromises = __importStar(require("fs/promises"));
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
const result_1 = require("../../common/types/result");
const testHistoryService_1 = require("./testHistoryService");
const muxChat_1 = require("../../common/constants/muxChat");
const runtimeFactory = __importStar(require("../../node/runtime/runtimeFactory"));
// Helper to access private renamingWorkspaces set
function addToRenamingWorkspaces(service, workspaceId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    service.renamingWorkspaces.add(workspaceId);
}
// Helper to access private archivingWorkspaces set
function addToArchivingWorkspaces(service, workspaceId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    service.archivingWorkspaces.add(workspaceId);
}
async function withTempMuxRoot(fn) {
    const originalMuxRoot = process.env.MUX_ROOT;
    const tempRoot = await fsPromises.mkdtemp(path_1.default.join((0, os_1.tmpdir)(), "mux-plan-"));
    process.env.MUX_ROOT = tempRoot;
    try {
        return await fn(tempRoot);
    }
    finally {
        if (originalMuxRoot === undefined) {
            delete process.env.MUX_ROOT;
        }
        else {
            process.env.MUX_ROOT = originalMuxRoot;
        }
        await fsPromises.rm(tempRoot, { recursive: true, force: true });
    }
}
async function writePlanFile(root, projectName, workspaceName) {
    const planDir = path_1.default.join(root, "plans", projectName);
    await fsPromises.mkdir(planDir, { recursive: true });
    const planFile = path_1.default.join(planDir, `${workspaceName}.md`);
    await fsPromises.writeFile(planFile, "# Plan\n");
    return planFile;
}
// NOTE: This test file uses bun:test mocks (not Jest).
(0, bun_test_1.describe)("WorkspaceService rename lock", () => {
    let workspaceService;
    let mockAIService;
    let historyService;
    let cleanupHistory;
    (0, bun_test_1.beforeEach)(async () => {
        // Create minimal mocks for the services
        mockAIService = {
            isStreaming: (0, bun_test_1.mock)(() => false),
            getWorkspaceMetadata: (0, bun_test_1.mock)(() => Promise.resolve({ success: false, error: "not found" })),
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            on: (0, bun_test_1.mock)(() => { }),
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            off: (0, bun_test_1.mock)(() => { }),
        };
        ({ historyService, cleanup: cleanupHistory } = await (0, testHistoryService_1.createTestHistoryService)());
        const mockConfig = {
            srcDir: "/tmp/test",
            getSessionDir: (0, bun_test_1.mock)(() => "/tmp/test/sessions"),
            generateStableId: (0, bun_test_1.mock)(() => "test-id"),
            findWorkspace: (0, bun_test_1.mock)(() => null),
        };
        const mockPartialService = {
            commitToHistory: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined })),
        };
        const mockInitStateManager = {
            on: (0, bun_test_1.mock)(() => undefined),
            getInitState: (0, bun_test_1.mock)(() => undefined),
        };
        const mockExtensionMetadataService = {};
        const mockBackgroundProcessManager = {
            cleanup: (0, bun_test_1.mock)(() => Promise.resolve()),
        };
        workspaceService = new workspaceService_1.WorkspaceService(mockConfig, historyService, mockPartialService, mockAIService, mockInitStateManager, mockExtensionMetadataService, mockBackgroundProcessManager, {}, {});
    });
    (0, bun_test_1.afterEach)(async () => {
        await cleanupHistory();
    });
    (0, bun_test_1.test)("sendMessage returns error when workspace is being renamed", async () => {
        const workspaceId = "test-workspace";
        addToRenamingWorkspaces(workspaceService, workspaceId);
        const result = await workspaceService.sendMessage(workspaceId, "test message", {
            model: "test-model",
            agentId: "exec",
        });
        (0, bun_test_1.expect)(result.success).toBe(false);
        if (!result.success) {
            const error = result.error;
            // Error is SendMessageError which has a discriminated union
            (0, bun_test_1.expect)(typeof error === "object" && error.type === "unknown").toBe(true);
            if (typeof error === "object" && error.type === "unknown") {
                (0, bun_test_1.expect)(error.raw).toContain("being renamed");
            }
        }
    });
    (0, bun_test_1.test)("resumeStream returns error when workspace is being renamed", async () => {
        const workspaceId = "test-workspace";
        addToRenamingWorkspaces(workspaceService, workspaceId);
        const result = await workspaceService.resumeStream(workspaceId, {
            model: "test-model",
            agentId: "exec",
        });
        (0, bun_test_1.expect)(result.success).toBe(false);
        if (!result.success) {
            const error = result.error;
            // Error is SendMessageError which has a discriminated union
            (0, bun_test_1.expect)(typeof error === "object" && error.type === "unknown").toBe(true);
            if (typeof error === "object" && error.type === "unknown") {
                (0, bun_test_1.expect)(error.raw).toContain("being renamed");
            }
        }
    });
    (0, bun_test_1.test)("rename returns error when workspace is streaming", async () => {
        const workspaceId = "test-workspace";
        // Mock isStreaming to return true
        mockAIService.isStreaming.mockReturnValue(true);
        const result = await workspaceService.rename(workspaceId, "new-name");
        (0, bun_test_1.expect)(result.success).toBe(false);
        if (!result.success) {
            (0, bun_test_1.expect)(result.error).toContain("stream is active");
        }
    });
});
(0, bun_test_1.describe)("WorkspaceService executeBash archive guards", () => {
    let workspaceService;
    let waitForInitMock;
    let getWorkspaceMetadataMock;
    let historyService;
    let cleanupHistory;
    (0, bun_test_1.beforeEach)(async () => {
        waitForInitMock = (0, bun_test_1.mock)(() => Promise.resolve());
        getWorkspaceMetadataMock = (0, bun_test_1.mock)(() => Promise.resolve({ success: false, error: "not found" }));
        const aiService = {
            isStreaming: (0, bun_test_1.mock)(() => false),
            getWorkspaceMetadata: getWorkspaceMetadataMock,
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            on: (0, bun_test_1.mock)(() => { }),
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            off: (0, bun_test_1.mock)(() => { }),
        };
        ({ historyService, cleanup: cleanupHistory } = await (0, testHistoryService_1.createTestHistoryService)());
        const mockConfig = {
            srcDir: "/tmp/test",
            getSessionDir: (0, bun_test_1.mock)(() => "/tmp/test/sessions"),
            generateStableId: (0, bun_test_1.mock)(() => "test-id"),
            findWorkspace: (0, bun_test_1.mock)(() => null),
            getProjectSecrets: (0, bun_test_1.mock)(() => []),
        };
        const mockPartialService = {
            commitToHistory: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined })),
        };
        const mockInitStateManager = {
            on: (0, bun_test_1.mock)(() => undefined),
            getInitState: (0, bun_test_1.mock)(() => undefined),
            waitForInit: waitForInitMock,
        };
        const mockExtensionMetadataService = {};
        const mockBackgroundProcessManager = {
            cleanup: (0, bun_test_1.mock)(() => Promise.resolve()),
        };
        workspaceService = new workspaceService_1.WorkspaceService(mockConfig, historyService, mockPartialService, aiService, mockInitStateManager, mockExtensionMetadataService, mockBackgroundProcessManager, {}, {});
    });
    (0, bun_test_1.afterEach)(async () => {
        await cleanupHistory();
    });
    (0, bun_test_1.test)("archived workspace => executeBash returns error mentioning archived", async () => {
        const workspaceId = "ws-archived";
        const archivedMetadata = {
            id: workspaceId,
            name: "ws",
            projectName: "proj",
            projectPath: "/tmp/proj",
            runtimeConfig: { type: "local", srcBaseDir: "/tmp" },
            archivedAt: "2026-01-01T00:00:00.000Z",
        };
        getWorkspaceMetadataMock.mockReturnValue(Promise.resolve((0, result_1.Ok)(archivedMetadata)));
        const result = await workspaceService.executeBash(workspaceId, "echo hello");
        (0, bun_test_1.expect)(result.success).toBe(false);
        if (!result.success) {
            (0, bun_test_1.expect)(result.error).toContain("archived");
        }
        // This must happen before init/runtime operations.
        (0, bun_test_1.expect)(waitForInitMock).toHaveBeenCalledTimes(0);
    });
    (0, bun_test_1.test)("archiving workspace => executeBash returns error mentioning being archived", async () => {
        const workspaceId = "ws-archiving";
        addToArchivingWorkspaces(workspaceService, workspaceId);
        const result = await workspaceService.executeBash(workspaceId, "echo hello");
        (0, bun_test_1.expect)(result.success).toBe(false);
        if (!result.success) {
            (0, bun_test_1.expect)(result.error).toContain("being archived");
        }
        (0, bun_test_1.expect)(waitForInitMock).toHaveBeenCalledTimes(0);
        (0, bun_test_1.expect)(getWorkspaceMetadataMock).toHaveBeenCalledTimes(0);
    });
});
(0, bun_test_1.describe)("WorkspaceService post-compaction metadata refresh", () => {
    let workspaceService;
    let historyService;
    let cleanupHistory;
    (0, bun_test_1.beforeEach)(async () => {
        const aiService = {
            isStreaming: (0, bun_test_1.mock)(() => false),
            getWorkspaceMetadata: (0, bun_test_1.mock)(() => Promise.resolve({ success: false, error: "not found" })),
            on(_eventName, _listener) {
                return this;
            },
            off(_eventName, _listener) {
                return this;
            },
        };
        ({ historyService, cleanup: cleanupHistory } = await (0, testHistoryService_1.createTestHistoryService)());
        const mockConfig = {
            srcDir: "/tmp/test",
            getSessionDir: (0, bun_test_1.mock)(() => "/tmp/test/sessions"),
            generateStableId: (0, bun_test_1.mock)(() => "test-id"),
            findWorkspace: (0, bun_test_1.mock)(() => null),
        };
        const mockPartialService = {
            commitToHistory: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined })),
        };
        const mockInitStateManager = {
            on: (0, bun_test_1.mock)(() => undefined),
            getInitState: (0, bun_test_1.mock)(() => undefined),
        };
        const mockExtensionMetadataService = {};
        const mockBackgroundProcessManager = {
            cleanup: (0, bun_test_1.mock)(() => Promise.resolve()),
        };
        workspaceService = new workspaceService_1.WorkspaceService(mockConfig, historyService, mockPartialService, aiService, mockInitStateManager, mockExtensionMetadataService, mockBackgroundProcessManager, {}, {});
    });
    (0, bun_test_1.afterEach)(async () => {
        await cleanupHistory();
    });
    (0, bun_test_1.test)("returns expanded plan path for local runtimes", async () => {
        await withTempMuxRoot(async (muxRoot) => {
            const workspaceId = "ws-plan-path";
            const workspaceName = "plan-workspace";
            const projectName = "cmux";
            const planFile = await writePlanFile(muxRoot, projectName, workspaceName);
            const fakeMetadata = {
                id: workspaceId,
                name: workspaceName,
                projectName,
                projectPath: "/tmp/proj",
                namedWorkspacePath: "/tmp/proj/plan-workspace",
                runtimeConfig: { type: "local", srcBaseDir: "/tmp" },
            };
            const svc = workspaceService;
            svc.getInfo = (0, bun_test_1.mock)(() => Promise.resolve(fakeMetadata));
            const result = await workspaceService.getPostCompactionState(workspaceId);
            (0, bun_test_1.expect)(result.planPath).toBe(planFile);
            (0, bun_test_1.expect)(result.planPath?.startsWith("~")).toBe(false);
        });
    });
    (0, bun_test_1.test)("debounces multiple refresh requests into a single metadata emit", async () => {
        const workspaceId = "ws-post-compaction";
        const emitMetadata = (0, bun_test_1.mock)(() => undefined);
        const svc = workspaceService;
        svc.sessions.set(workspaceId, { emitMetadata });
        const fakeMetadata = {
            id: workspaceId,
            name: "ws",
            projectName: "proj",
            projectPath: "/tmp/proj",
            namedWorkspacePath: "/tmp/proj/ws",
            runtimeConfig: { type: "local", srcBaseDir: "/tmp" },
        };
        const getInfoMock = (0, bun_test_1.mock)(() => Promise.resolve(fakeMetadata));
        const postCompactionState = {
            planPath: "~/.mux/plans/cmux/plan.md",
            trackedFilePaths: ["/tmp/proj/file.ts"],
            excludedItems: [],
        };
        const getPostCompactionStateMock = (0, bun_test_1.mock)(() => Promise.resolve(postCompactionState));
        svc.getInfo = getInfoMock;
        svc.getPostCompactionState = getPostCompactionStateMock;
        svc.schedulePostCompactionMetadataRefresh(workspaceId);
        svc.schedulePostCompactionMetadataRefresh(workspaceId);
        svc.schedulePostCompactionMetadataRefresh(workspaceId);
        // Debounce is short, but use a safe buffer.
        await new Promise((resolve) => setTimeout(resolve, 150));
        (0, bun_test_1.expect)(getInfoMock).toHaveBeenCalledTimes(1);
        (0, bun_test_1.expect)(getPostCompactionStateMock).toHaveBeenCalledTimes(1);
        (0, bun_test_1.expect)(emitMetadata).toHaveBeenCalledTimes(1);
        const enriched = emitMetadata.mock.calls[0][0];
        (0, bun_test_1.expect)(enriched.postCompaction?.planPath).toBe(postCompactionState.planPath);
    });
});
(0, bun_test_1.describe)("WorkspaceService maybePersistAISettingsFromOptions", () => {
    let workspaceService;
    let historyService;
    let cleanupHistory;
    (0, bun_test_1.beforeEach)(async () => {
        const aiService = {
            isStreaming: (0, bun_test_1.mock)(() => false),
            getWorkspaceMetadata: (0, bun_test_1.mock)(() => Promise.resolve({ success: false, error: "nope" })),
            on(_eventName, _listener) {
                return this;
            },
            off(_eventName, _listener) {
                return this;
            },
        };
        ({ historyService, cleanup: cleanupHistory } = await (0, testHistoryService_1.createTestHistoryService)());
        const mockConfig = {
            srcDir: "/tmp/test",
            getSessionDir: (0, bun_test_1.mock)(() => "/tmp/test/sessions"),
            generateStableId: (0, bun_test_1.mock)(() => "test-id"),
            findWorkspace: (0, bun_test_1.mock)(() => null),
        };
        const mockPartialService = {
            commitToHistory: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined })),
        };
        const mockInitStateManager = {
            on: (0, bun_test_1.mock)(() => undefined),
            getInitState: (0, bun_test_1.mock)(() => undefined),
        };
        const mockExtensionMetadataService = {};
        const mockBackgroundProcessManager = {
            cleanup: (0, bun_test_1.mock)(() => Promise.resolve()),
        };
        workspaceService = new workspaceService_1.WorkspaceService(mockConfig, historyService, mockPartialService, aiService, mockInitStateManager, mockExtensionMetadataService, mockBackgroundProcessManager, {}, {});
    });
    (0, bun_test_1.afterEach)(async () => {
        await cleanupHistory();
    });
    (0, bun_test_1.test)("persists agent AI settings for custom agent", async () => {
        const persistSpy = (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: true }));
        const svc = workspaceService;
        svc.persistWorkspaceAISettingsForAgent = persistSpy;
        await svc.maybePersistAISettingsFromOptions("ws", {
            agentId: "reviewer",
            model: "openai:gpt-4o-mini",
            thinkingLevel: "off",
        }, "send");
        (0, bun_test_1.expect)(persistSpy).toHaveBeenCalledTimes(1);
    });
    (0, bun_test_1.test)("persists agent AI settings when agentId matches", async () => {
        const persistSpy = (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: true }));
        const svc = workspaceService;
        svc.persistWorkspaceAISettingsForAgent = persistSpy;
        await svc.maybePersistAISettingsFromOptions("ws", {
            agentId: "exec",
            model: "openai:gpt-4o-mini",
            thinkingLevel: "off",
        }, "send");
        (0, bun_test_1.expect)(persistSpy).toHaveBeenCalledTimes(1);
    });
});
(0, bun_test_1.describe)("WorkspaceService remove timing rollup", () => {
    let historyService;
    let cleanupHistory;
    (0, bun_test_1.beforeEach)(async () => {
        ({ historyService, cleanup: cleanupHistory } = await (0, testHistoryService_1.createTestHistoryService)());
    });
    (0, bun_test_1.afterEach)(async () => {
        await cleanupHistory();
    });
    (0, bun_test_1.test)("waits for stream-abort before rolling up session timing", async () => {
        const workspaceId = "child-ws";
        const parentWorkspaceId = "parent-ws";
        const tempRoot = await fsPromises.mkdtemp(path_1.default.join((0, os_1.tmpdir)(), "mux-remove-"));
        try {
            const sessionRoot = path_1.default.join(tempRoot, "sessions");
            await fsPromises.mkdir(path_1.default.join(sessionRoot, workspaceId), { recursive: true });
            let abortEmitted = false;
            let rollUpSawAbort = false;
            class FakeAIService extends events_1.EventEmitter {
                isStreaming = (0, bun_test_1.mock)(() => true);
                stopStream = (0, bun_test_1.mock)(() => {
                    setTimeout(() => {
                        abortEmitted = true;
                        this.emit("stream-abort", {
                            type: "stream-abort",
                            workspaceId,
                            messageId: "msg",
                            abortReason: "system",
                            metadata: { duration: 123 },
                            abandonPartial: true,
                        });
                    }, 0);
                    return Promise.resolve({ success: true, data: undefined });
                });
                getWorkspaceMetadata = (0, bun_test_1.mock)(() => Promise.resolve({
                    success: true,
                    data: {
                        id: workspaceId,
                        name: "child",
                        projectPath: "/tmp/proj",
                        runtimeConfig: { type: "local" },
                        parentWorkspaceId,
                    },
                }));
            }
            const aiService = new FakeAIService();
            const mockPartialService = {};
            const mockInitStateManager = {
                on: (0, bun_test_1.mock)(() => undefined),
                getInitState: (0, bun_test_1.mock)(() => undefined),
                clearInMemoryState: (0, bun_test_1.mock)(() => undefined),
            };
            const mockExtensionMetadataService = {
                setStreaming: (0, bun_test_1.mock)((_workspaceId, streaming) => Promise.resolve({
                    recency: Date.now(),
                    streaming,
                    lastModel: null,
                    lastThinkingLevel: null,
                })),
                updateRecency: (0, bun_test_1.mock)((_workspaceId, timestamp) => Promise.resolve({
                    recency: timestamp ?? Date.now(),
                    streaming: false,
                    lastModel: null,
                    lastThinkingLevel: null,
                })),
            };
            const mockBackgroundProcessManager = {
                cleanup: (0, bun_test_1.mock)(() => Promise.resolve()),
            };
            const mockConfig = {
                srcDir: "/tmp/src",
                getSessionDir: (0, bun_test_1.mock)((id) => path_1.default.join(sessionRoot, id)),
                removeWorkspace: (0, bun_test_1.mock)(() => Promise.resolve()),
                findWorkspace: (0, bun_test_1.mock)(() => null),
            };
            const timingService = {
                waitForIdle: (0, bun_test_1.mock)(() => Promise.resolve()),
                rollUpTimingIntoParent: (0, bun_test_1.mock)(() => {
                    rollUpSawAbort = abortEmitted;
                    return Promise.resolve({ didRollUp: true });
                }),
            };
            const workspaceService = new workspaceService_1.WorkspaceService(mockConfig, historyService, mockPartialService, aiService, mockInitStateManager, mockExtensionMetadataService, mockBackgroundProcessManager, {}, {}, undefined, // policyService
            undefined, // telemetryService
            undefined, // experimentsService
            timingService);
            const removeResult = await workspaceService.remove(workspaceId, true);
            (0, bun_test_1.expect)(removeResult.success).toBe(true);
            (0, bun_test_1.expect)(mockInitStateManager.clearInMemoryState).toHaveBeenCalledWith(workspaceId);
            (0, bun_test_1.expect)(rollUpSawAbort).toBe(true);
        }
        finally {
            await fsPromises.rm(tempRoot, { recursive: true, force: true });
        }
    });
});
(0, bun_test_1.describe)("WorkspaceService archive lifecycle hooks", () => {
    const workspaceId = "ws-archive";
    const projectPath = "/tmp/project";
    const workspacePath = "/tmp/project/ws-archive";
    let workspaceService;
    let mockAIService;
    let configState;
    let editConfigSpy;
    let historyService;
    let cleanupHistory;
    const workspaceMetadata = {
        id: workspaceId,
        name: "ws-archive",
        projectName: "proj",
        projectPath,
        runtimeConfig: { type: "local", srcBaseDir: "/tmp" },
    };
    (0, bun_test_1.beforeEach)(async () => {
        configState = {
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            {
                                path: workspacePath,
                                id: workspaceId,
                            },
                        ],
                    },
                ],
            ]),
        };
        editConfigSpy = (0, bun_test_1.mock)((fn) => {
            configState = fn(configState);
            return Promise.resolve();
        });
        ({ historyService, cleanup: cleanupHistory } = await (0, testHistoryService_1.createTestHistoryService)());
        const mockConfig = {
            srcDir: "/tmp/src",
            getSessionDir: (0, bun_test_1.mock)(() => "/tmp/test/sessions"),
            generateStableId: (0, bun_test_1.mock)(() => "test-id"),
            findWorkspace: (0, bun_test_1.mock)((id) => {
                if (id !== workspaceId) {
                    return null;
                }
                return { projectPath, workspacePath };
            }),
            editConfig: editConfigSpy,
            getAllWorkspaceMetadata: (0, bun_test_1.mock)(() => Promise.resolve([])),
        };
        const mockPartialService = {};
        const mockInitStateManager = {
            on: (0, bun_test_1.mock)(() => undefined),
            getInitState: (0, bun_test_1.mock)(() => undefined),
        };
        const mockExtensionMetadataService = {};
        const mockBackgroundProcessManager = {
            cleanup: (0, bun_test_1.mock)(() => Promise.resolve()),
        };
        mockAIService = {
            isStreaming: (0, bun_test_1.mock)(() => false),
            getWorkspaceMetadata: (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(workspaceMetadata))),
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            on: (0, bun_test_1.mock)(() => { }),
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            off: (0, bun_test_1.mock)(() => { }),
        };
        workspaceService = new workspaceService_1.WorkspaceService(mockConfig, historyService, mockPartialService, mockAIService, mockInitStateManager, mockExtensionMetadataService, mockBackgroundProcessManager, {}, {});
    });
    (0, bun_test_1.afterEach)(async () => {
        await cleanupHistory();
    });
    (0, bun_test_1.test)("returns Err and does not persist archivedAt when beforeArchive hook fails", async () => {
        const hooks = new workspaceLifecycleHooks_1.WorkspaceLifecycleHooks();
        hooks.registerBeforeArchive(() => Promise.resolve((0, result_1.Err)("hook failed")));
        workspaceService.setWorkspaceLifecycleHooks(hooks);
        const result = await workspaceService.archive(workspaceId);
        (0, bun_test_1.expect)(result.success).toBe(false);
        if (!result.success) {
            (0, bun_test_1.expect)(result.error).toBe("hook failed");
        }
        (0, bun_test_1.expect)(editConfigSpy).toHaveBeenCalledTimes(0);
        const entry = configState.projects.get(projectPath)?.workspaces[0];
        (0, bun_test_1.expect)(entry?.archivedAt).toBeUndefined();
    });
    (0, bun_test_1.test)("does not interrupt an active stream when beforeArchive hook fails", async () => {
        const hooks = new workspaceLifecycleHooks_1.WorkspaceLifecycleHooks();
        hooks.registerBeforeArchive(() => Promise.resolve((0, result_1.Err)("hook failed")));
        workspaceService.setWorkspaceLifecycleHooks(hooks);
        mockAIService.isStreaming.mockReturnValue(true);
        const interruptStreamSpy = (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(undefined)));
        workspaceService.interruptStream =
            interruptStreamSpy;
        const result = await workspaceService.archive(workspaceId);
        (0, bun_test_1.expect)(result.success).toBe(false);
        (0, bun_test_1.expect)(interruptStreamSpy).toHaveBeenCalledTimes(0);
    });
    (0, bun_test_1.test)("persists archivedAt when beforeArchive hooks succeed", async () => {
        const hooks = new workspaceLifecycleHooks_1.WorkspaceLifecycleHooks();
        hooks.registerBeforeArchive(() => Promise.resolve((0, result_1.Ok)(undefined)));
        workspaceService.setWorkspaceLifecycleHooks(hooks);
        const result = await workspaceService.archive(workspaceId);
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(editConfigSpy).toHaveBeenCalledTimes(1);
        const entry = configState.projects.get(projectPath)?.workspaces[0];
        (0, bun_test_1.expect)(entry?.archivedAt).toBeTruthy();
        (0, bun_test_1.expect)(entry?.archivedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
});
(0, bun_test_1.describe)("WorkspaceService archive init cancellation", () => {
    let historyService;
    let cleanupHistory;
    (0, bun_test_1.beforeEach)(async () => {
        ({ historyService, cleanup: cleanupHistory } = await (0, testHistoryService_1.createTestHistoryService)());
    });
    (0, bun_test_1.afterEach)(async () => {
        await cleanupHistory();
    });
    (0, bun_test_1.test)("emits metadata when it cancels init but beforeArchive hook fails", async () => {
        const workspaceId = "ws-archive-init-cancel";
        const projectPath = "/tmp/project";
        const workspacePath = "/tmp/project/ws-archive-init-cancel";
        const initStates = new Map([
            [
                workspaceId,
                {
                    status: "running",
                    hookPath: projectPath,
                    startTime: 0,
                    lines: [],
                    exitCode: null,
                    endTime: null,
                },
            ],
        ]);
        const clearInMemoryStateMock = (0, bun_test_1.mock)((id) => {
            initStates.delete(id);
        });
        const mockInitStateManager = {
            on: (0, bun_test_1.mock)(() => undefined),
            getInitState: (0, bun_test_1.mock)((id) => initStates.get(id)),
            clearInMemoryState: clearInMemoryStateMock,
        };
        let configState = {
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            {
                                path: workspacePath,
                                id: workspaceId,
                            },
                        ],
                    },
                ],
            ]),
        };
        const editConfigSpy = (0, bun_test_1.mock)((fn) => {
            configState = fn(configState);
            return Promise.resolve();
        });
        const frontendMetadata = {
            id: workspaceId,
            name: "ws-archive-init-cancel",
            projectName: "proj",
            projectPath,
            runtimeConfig: { type: "local", srcBaseDir: "/tmp" },
            namedWorkspacePath: workspacePath,
        };
        const workspaceMetadata = {
            id: workspaceId,
            name: "ws-archive-init-cancel",
            projectName: "proj",
            projectPath,
            runtimeConfig: { type: "local", srcBaseDir: "/tmp" },
        };
        const mockConfig = {
            srcDir: "/tmp/src",
            getSessionDir: (0, bun_test_1.mock)(() => "/tmp/test/sessions"),
            generateStableId: (0, bun_test_1.mock)(() => "test-id"),
            findWorkspace: (0, bun_test_1.mock)((id) => {
                if (id !== workspaceId) {
                    return null;
                }
                return { projectPath, workspacePath };
            }),
            editConfig: editConfigSpy,
            getAllWorkspaceMetadata: (0, bun_test_1.mock)(() => Promise.resolve([frontendMetadata])),
        };
        const mockAIService = {
            isStreaming: (0, bun_test_1.mock)(() => false),
            getWorkspaceMetadata: (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(workspaceMetadata))),
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            on: (0, bun_test_1.mock)(() => { }),
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            off: (0, bun_test_1.mock)(() => { }),
        };
        const workspaceService = new workspaceService_1.WorkspaceService(mockConfig, historyService, {}, mockAIService, mockInitStateManager, {}, { cleanup: (0, bun_test_1.mock)(() => Promise.resolve()) }, {}, {});
        // Seed abort controller so archive() can cancel init.
        const abortController = new AbortController();
        const initAbortControllers = workspaceService.initAbortControllers;
        initAbortControllers.set(workspaceId, abortController);
        const metadataEvents = [];
        workspaceService.on("metadata", (event) => {
            if (!event || typeof event !== "object") {
                return;
            }
            const parsed = event;
            if (parsed.workspaceId === workspaceId) {
                metadataEvents.push(parsed.metadata);
            }
        });
        const hooks = new workspaceLifecycleHooks_1.WorkspaceLifecycleHooks();
        hooks.registerBeforeArchive(() => Promise.resolve((0, result_1.Err)("hook failed")));
        workspaceService.setWorkspaceLifecycleHooks(hooks);
        const result = await workspaceService.archive(workspaceId);
        (0, bun_test_1.expect)(result.success).toBe(false);
        if (!result.success) {
            (0, bun_test_1.expect)(result.error).toBe("hook failed");
        }
        // Ensure we didn't persist archivedAt on hook failure.
        (0, bun_test_1.expect)(editConfigSpy).toHaveBeenCalledTimes(0);
        const entry = configState.projects.get(projectPath)?.workspaces[0];
        (0, bun_test_1.expect)(entry?.archivedAt).toBeUndefined();
        (0, bun_test_1.expect)(abortController.signal.aborted).toBe(true);
        (0, bun_test_1.expect)(clearInMemoryStateMock).toHaveBeenCalledWith(workspaceId);
        (0, bun_test_1.expect)(metadataEvents.length).toBeGreaterThanOrEqual(1);
        (0, bun_test_1.expect)(metadataEvents.at(-1)?.isInitializing).toBe(undefined);
    });
});
(0, bun_test_1.describe)("WorkspaceService unarchive lifecycle hooks", () => {
    const workspaceId = "ws-unarchive";
    const projectPath = "/tmp/project";
    const workspacePath = "/tmp/project/ws-unarchive";
    let workspaceService;
    let configState;
    let editConfigSpy;
    let historyService;
    let cleanupHistory;
    const workspaceMetadata = {
        id: workspaceId,
        name: "ws-unarchive",
        projectName: "proj",
        projectPath,
        runtimeConfig: { type: "local", srcBaseDir: "/tmp" },
        archivedAt: "2020-01-01T00:00:00.000Z",
        namedWorkspacePath: workspacePath,
    };
    (0, bun_test_1.beforeEach)(async () => {
        ({ historyService, cleanup: cleanupHistory } = await (0, testHistoryService_1.createTestHistoryService)());
        configState = {
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            {
                                path: workspacePath,
                                id: workspaceId,
                                archivedAt: "2020-01-01T00:00:00.000Z",
                            },
                        ],
                    },
                ],
            ]),
        };
        editConfigSpy = (0, bun_test_1.mock)((fn) => {
            configState = fn(configState);
            return Promise.resolve();
        });
        const mockConfig = {
            srcDir: "/tmp/src",
            getSessionDir: (0, bun_test_1.mock)(() => "/tmp/test/sessions"),
            generateStableId: (0, bun_test_1.mock)(() => "test-id"),
            findWorkspace: (0, bun_test_1.mock)((id) => {
                if (id !== workspaceId) {
                    return null;
                }
                return { projectPath, workspacePath };
            }),
            editConfig: editConfigSpy,
            getAllWorkspaceMetadata: (0, bun_test_1.mock)(() => Promise.resolve([workspaceMetadata])),
        };
        const mockPartialService = {};
        const mockInitStateManager = {
            on: (0, bun_test_1.mock)(() => undefined),
            getInitState: (0, bun_test_1.mock)(() => undefined),
        };
        const mockExtensionMetadataService = {};
        const mockBackgroundProcessManager = {
            cleanup: (0, bun_test_1.mock)(() => Promise.resolve()),
        };
        const aiService = {
            isStreaming: (0, bun_test_1.mock)(() => false),
            getWorkspaceMetadata: (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(workspaceMetadata))),
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            on: (0, bun_test_1.mock)(() => { }),
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            off: (0, bun_test_1.mock)(() => { }),
        };
        workspaceService = new workspaceService_1.WorkspaceService(mockConfig, historyService, mockPartialService, aiService, mockInitStateManager, mockExtensionMetadataService, mockBackgroundProcessManager, {}, {});
    });
    (0, bun_test_1.afterEach)(async () => {
        await cleanupHistory();
    });
    (0, bun_test_1.test)("persists unarchivedAt and runs afterUnarchive hooks (best-effort)", async () => {
        const hooks = new workspaceLifecycleHooks_1.WorkspaceLifecycleHooks();
        const afterHook = (0, bun_test_1.mock)(() => {
            const entry = configState.projects.get(projectPath)?.workspaces[0];
            (0, bun_test_1.expect)(entry?.unarchivedAt).toBeTruthy();
            return Promise.resolve((0, result_1.Err)("hook failed"));
        });
        hooks.registerAfterUnarchive(afterHook);
        workspaceService.setWorkspaceLifecycleHooks(hooks);
        const result = await workspaceService.unarchive(workspaceId);
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(afterHook).toHaveBeenCalledTimes(1);
        const entry = configState.projects.get(projectPath)?.workspaces[0];
        (0, bun_test_1.expect)(entry?.unarchivedAt).toBeTruthy();
        (0, bun_test_1.expect)(entry?.unarchivedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
    (0, bun_test_1.test)("does not run afterUnarchive hooks when workspace is not archived", async () => {
        const entry = configState.projects.get(projectPath)?.workspaces[0];
        if (!entry) {
            throw new Error("Missing workspace entry");
        }
        entry.archivedAt = undefined;
        const hooks = new workspaceLifecycleHooks_1.WorkspaceLifecycleHooks();
        const afterHook = (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(undefined)));
        hooks.registerAfterUnarchive(afterHook);
        workspaceService.setWorkspaceLifecycleHooks(hooks);
        const result = await workspaceService.unarchive(workspaceId);
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(afterHook).toHaveBeenCalledTimes(0);
    });
});
(0, bun_test_1.describe)("WorkspaceService archiveMergedInProject", () => {
    const TARGET_PROJECT_PATH = "/tmp/project";
    let historyService;
    let cleanupHistory;
    (0, bun_test_1.beforeEach)(async () => {
        ({ historyService, cleanup: cleanupHistory } = await (0, testHistoryService_1.createTestHistoryService)());
    });
    (0, bun_test_1.afterEach)(async () => {
        await cleanupHistory();
    });
    function createMetadata(id, options) {
        const projectPath = options?.projectPath ?? TARGET_PROJECT_PATH;
        return {
            id,
            name: id,
            projectName: "test-project",
            projectPath,
            runtimeConfig: { type: "local" },
            namedWorkspacePath: path_1.default.join(projectPath, id),
            archivedAt: options?.archivedAt,
            unarchivedAt: options?.unarchivedAt,
        };
    }
    function bashOk(output) {
        return {
            success: true,
            data: {
                success: true,
                output,
                exitCode: 0,
                wall_duration_ms: 0,
            },
        };
    }
    function bashToolFailure(error) {
        return {
            success: true,
            data: {
                success: false,
                error,
                exitCode: 1,
                wall_duration_ms: 0,
            },
        };
    }
    function executeBashFailure(error) {
        return { success: false, error };
    }
    function createServiceHarness(allMetadata, executeBashImpl, archiveImpl) {
        const mockConfig = {
            srcDir: "/tmp/test",
            getSessionDir: (0, bun_test_1.mock)(() => "/tmp/test/sessions"),
            generateStableId: (0, bun_test_1.mock)(() => "test-id"),
            findWorkspace: (0, bun_test_1.mock)(() => null),
            getAllWorkspaceMetadata: (0, bun_test_1.mock)(() => Promise.resolve(allMetadata)),
        };
        const aiService = {
            on(_eventName, _listener) {
                return this;
            },
            off(_eventName, _listener) {
                return this;
            },
        };
        const mockPartialService = {};
        const mockInitStateManager = {
            on: (0, bun_test_1.mock)(() => undefined),
            getInitState: (0, bun_test_1.mock)(() => undefined),
        };
        const mockExtensionMetadataService = {};
        const mockBackgroundProcessManager = {
            cleanup: (0, bun_test_1.mock)(() => Promise.resolve()),
        };
        const workspaceService = new workspaceService_1.WorkspaceService(mockConfig, historyService, mockPartialService, aiService, mockInitStateManager, mockExtensionMetadataService, mockBackgroundProcessManager, {}, {});
        const executeBashMock = (0, bun_test_1.mock)(executeBashImpl);
        const archiveMock = (0, bun_test_1.mock)(archiveImpl);
        const svc = workspaceService;
        svc.executeBash = executeBashMock;
        svc.archive = archiveMock;
        return { workspaceService, executeBashMock, archiveMock };
    }
    (0, bun_test_1.test)("excludes MUX_HELP_CHAT_WORKSPACE_ID workspaces", async () => {
        const allMetadata = [
            createMetadata(muxChat_1.MUX_HELP_CHAT_WORKSPACE_ID),
            createMetadata("ws-merged"),
        ];
        const ghResultsByWorkspaceId = {
            "ws-merged": bashOk('{"state":"MERGED"}'),
        };
        const { workspaceService, executeBashMock, archiveMock } = createServiceHarness(allMetadata, (workspaceId) => {
            const result = ghResultsByWorkspaceId[workspaceId];
            if (!result) {
                throw new Error(`Unexpected executeBash call for workspaceId: ${workspaceId}`);
            }
            return Promise.resolve(result);
        }, () => Promise.resolve({ success: true, data: undefined }));
        const result = await workspaceService.archiveMergedInProject(TARGET_PROJECT_PATH);
        (0, bun_test_1.expect)(result.success).toBe(true);
        if (!result.success) {
            return;
        }
        (0, bun_test_1.expect)(result.data.archivedWorkspaceIds).toEqual(["ws-merged"]);
        (0, bun_test_1.expect)(result.data.skippedWorkspaceIds).toEqual([]);
        (0, bun_test_1.expect)(result.data.errors).toEqual([]);
        (0, bun_test_1.expect)(archiveMock).toHaveBeenCalledTimes(1);
        (0, bun_test_1.expect)(archiveMock).toHaveBeenCalledWith("ws-merged");
        // Should only query GitHub for the eligible non-mux-chat workspace.
        (0, bun_test_1.expect)(executeBashMock).toHaveBeenCalledTimes(1);
    });
    (0, bun_test_1.test)("treats workspaces with later unarchivedAt as eligible", async () => {
        const allMetadata = [
            createMetadata("ws-merged-unarchived", {
                archivedAt: "2025-01-01T00:00:00.000Z",
                unarchivedAt: "2025-02-01T00:00:00.000Z",
            }),
            createMetadata("ws-still-archived", {
                archivedAt: "2025-03-01T00:00:00.000Z",
                unarchivedAt: "2025-02-01T00:00:00.000Z",
            }),
        ];
        const ghResultsByWorkspaceId = {
            "ws-merged-unarchived": bashOk('{"state":"MERGED"}'),
        };
        const { workspaceService, executeBashMock, archiveMock } = createServiceHarness(allMetadata, (workspaceId) => {
            const result = ghResultsByWorkspaceId[workspaceId];
            if (!result) {
                throw new Error(`Unexpected executeBash call for workspaceId: ${workspaceId}`);
            }
            return Promise.resolve(result);
        }, () => Promise.resolve({ success: true, data: undefined }));
        const result = await workspaceService.archiveMergedInProject(TARGET_PROJECT_PATH);
        (0, bun_test_1.expect)(result.success).toBe(true);
        if (!result.success) {
            return;
        }
        (0, bun_test_1.expect)(result.data.archivedWorkspaceIds).toEqual(["ws-merged-unarchived"]);
        (0, bun_test_1.expect)(result.data.skippedWorkspaceIds).toEqual([]);
        (0, bun_test_1.expect)(result.data.errors).toEqual([]);
        (0, bun_test_1.expect)(archiveMock).toHaveBeenCalledTimes(1);
        (0, bun_test_1.expect)(archiveMock).toHaveBeenCalledWith("ws-merged-unarchived");
        // Should only query GitHub for the workspace that is considered unarchived.
        (0, bun_test_1.expect)(executeBashMock).toHaveBeenCalledTimes(1);
    });
    (0, bun_test_1.test)("archives only MERGED workspaces", async () => {
        const allMetadata = [
            createMetadata("ws-open"),
            createMetadata("ws-merged"),
            createMetadata("ws-no-pr"),
            createMetadata("ws-other-project", { projectPath: "/tmp/other" }),
            createMetadata("ws-already-archived", { archivedAt: "2025-01-01T00:00:00.000Z" }),
        ];
        const ghResultsByWorkspaceId = {
            "ws-open": bashOk('{"state":"OPEN"}'),
            "ws-merged": bashOk('{"state":"MERGED"}'),
            "ws-no-pr": bashOk('{"no_pr":true}'),
        };
        const { workspaceService, executeBashMock, archiveMock } = createServiceHarness(allMetadata, (workspaceId, script, options) => {
            (0, bun_test_1.expect)(script).toContain("gh pr view --json state");
            (0, bun_test_1.expect)(options?.timeout_secs).toBe(15);
            const result = ghResultsByWorkspaceId[workspaceId];
            if (!result) {
                throw new Error(`Unexpected executeBash call for workspaceId: ${workspaceId}`);
            }
            return Promise.resolve(result);
        }, () => Promise.resolve({ success: true, data: undefined }));
        const result = await workspaceService.archiveMergedInProject(TARGET_PROJECT_PATH);
        (0, bun_test_1.expect)(result.success).toBe(true);
        if (!result.success) {
            return;
        }
        (0, bun_test_1.expect)(result.data.archivedWorkspaceIds).toEqual(["ws-merged"]);
        (0, bun_test_1.expect)(result.data.skippedWorkspaceIds).toEqual(["ws-no-pr", "ws-open"]);
        (0, bun_test_1.expect)(result.data.errors).toEqual([]);
        (0, bun_test_1.expect)(archiveMock).toHaveBeenCalledTimes(1);
        (0, bun_test_1.expect)(archiveMock).toHaveBeenCalledWith("ws-merged");
        (0, bun_test_1.expect)(executeBashMock).toHaveBeenCalledTimes(3);
    });
    (0, bun_test_1.test)("skips no_pr and non-merged states", async () => {
        const allMetadata = [
            createMetadata("ws-open"),
            createMetadata("ws-closed"),
            createMetadata("ws-no-pr"),
        ];
        const ghResultsByWorkspaceId = {
            "ws-open": bashOk('{"state":"OPEN"}'),
            "ws-closed": bashOk('{"state":"CLOSED"}'),
            "ws-no-pr": bashOk('{"no_pr":true}'),
        };
        const { workspaceService, archiveMock } = createServiceHarness(allMetadata, (workspaceId) => {
            const result = ghResultsByWorkspaceId[workspaceId];
            if (!result) {
                throw new Error(`Unexpected executeBash call for workspaceId: ${workspaceId}`);
            }
            return Promise.resolve(result);
        }, () => Promise.resolve({ success: true, data: undefined }));
        const result = await workspaceService.archiveMergedInProject(TARGET_PROJECT_PATH);
        (0, bun_test_1.expect)(result.success).toBe(true);
        if (!result.success) {
            return;
        }
        (0, bun_test_1.expect)(result.data.archivedWorkspaceIds).toEqual([]);
        (0, bun_test_1.expect)(result.data.skippedWorkspaceIds).toEqual(["ws-closed", "ws-no-pr", "ws-open"]);
        (0, bun_test_1.expect)(result.data.errors).toEqual([]);
        (0, bun_test_1.expect)(archiveMock).toHaveBeenCalledTimes(0);
    });
    (0, bun_test_1.test)("records errors for malformed JSON and executeBash failures", async () => {
        const allMetadata = [
            createMetadata("ws-bad-json"),
            createMetadata("ws-exec-failed"),
            createMetadata("ws-bash-failed"),
        ];
        const ghResultsByWorkspaceId = {
            "ws-bad-json": bashOk("not-json"),
            "ws-exec-failed": executeBashFailure("executeBash failed"),
            "ws-bash-failed": bashToolFailure("gh failed"),
        };
        const { workspaceService, archiveMock } = createServiceHarness(allMetadata, (workspaceId) => {
            const result = ghResultsByWorkspaceId[workspaceId];
            if (!result) {
                throw new Error(`Unexpected executeBash call for workspaceId: ${workspaceId}`);
            }
            return Promise.resolve(result);
        }, () => Promise.resolve({ success: true, data: undefined }));
        const result = await workspaceService.archiveMergedInProject(TARGET_PROJECT_PATH);
        (0, bun_test_1.expect)(result.success).toBe(true);
        if (!result.success) {
            return;
        }
        (0, bun_test_1.expect)(result.data.archivedWorkspaceIds).toEqual([]);
        (0, bun_test_1.expect)(result.data.skippedWorkspaceIds).toEqual([]);
        (0, bun_test_1.expect)(result.data.errors).toHaveLength(3);
        const badJsonError = result.data.errors.find((e) => e.workspaceId === "ws-bad-json");
        (0, bun_test_1.expect)(badJsonError).toBeDefined();
        (0, bun_test_1.expect)(badJsonError?.error).toContain("Failed to parse gh output");
        const execFailedError = result.data.errors.find((e) => e.workspaceId === "ws-exec-failed");
        (0, bun_test_1.expect)(execFailedError).toBeDefined();
        (0, bun_test_1.expect)(execFailedError?.error).toBe("executeBash failed");
        const bashFailedError = result.data.errors.find((e) => e.workspaceId === "ws-bash-failed");
        (0, bun_test_1.expect)(bashFailedError).toBeDefined();
        (0, bun_test_1.expect)(bashFailedError?.error).toBe("gh failed");
        (0, bun_test_1.expect)(archiveMock).toHaveBeenCalledTimes(0);
    });
});
(0, bun_test_1.describe)("WorkspaceService init cancellation", () => {
    let historyService;
    let cleanupHistory;
    (0, bun_test_1.beforeEach)(async () => {
        ({ historyService, cleanup: cleanupHistory } = await (0, testHistoryService_1.createTestHistoryService)());
    });
    (0, bun_test_1.afterEach)(async () => {
        await cleanupHistory();
    });
    (0, bun_test_1.test)("archive() aborts init and still archives when init is running", async () => {
        const workspaceId = "ws-init-running";
        const removeMock = (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined }));
        const editConfigMock = (0, bun_test_1.mock)(() => Promise.resolve());
        const clearInMemoryStateMock = (0, bun_test_1.mock)((_workspaceId) => undefined);
        const mockAIService = {
            isStreaming: (0, bun_test_1.mock)(() => false),
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            on: (0, bun_test_1.mock)(() => { }),
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            off: (0, bun_test_1.mock)(() => { }),
        };
        const mockConfig = {
            srcDir: "/tmp/test",
            findWorkspace: (0, bun_test_1.mock)(() => ({ projectPath: "/tmp/proj", workspacePath: "/tmp/proj/ws" })),
            editConfig: editConfigMock,
            getAllWorkspaceMetadata: (0, bun_test_1.mock)(() => Promise.resolve([])),
            getSessionDir: (0, bun_test_1.mock)(() => "/tmp/test/sessions"),
            generateStableId: (0, bun_test_1.mock)(() => "test-id"),
        };
        const mockInitStateManager = {
            // WorkspaceService subscribes to init-end events on construction.
            on: (0, bun_test_1.mock)(() => undefined),
            getInitState: (0, bun_test_1.mock)(() => ({
                status: "running",
                hookPath: "/tmp/proj",
                startTime: 0,
                lines: [],
                exitCode: null,
                endTime: null,
            })),
            clearInMemoryState: clearInMemoryStateMock,
        };
        const mockPartialService = {};
        const mockExtensionMetadataService = {};
        const mockBackgroundProcessManager = {
            cleanup: (0, bun_test_1.mock)(() => Promise.resolve()),
        };
        const workspaceService = new workspaceService_1.WorkspaceService(mockConfig, historyService, mockPartialService, mockAIService, mockInitStateManager, mockExtensionMetadataService, mockBackgroundProcessManager, {}, {});
        // Make it obvious if archive() incorrectly chooses deletion.
        workspaceService.remove = removeMock;
        const result = await workspaceService.archive(workspaceId);
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(editConfigMock).toHaveBeenCalled();
        (0, bun_test_1.expect)(removeMock).not.toHaveBeenCalled();
        (0, bun_test_1.expect)(clearInMemoryStateMock).toHaveBeenCalledWith(workspaceId);
    });
    (0, bun_test_1.test)("archive() uses normal archive flow when init is complete", async () => {
        const workspaceId = "ws-init-complete";
        const removeMock = (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined }));
        const editConfigMock = (0, bun_test_1.mock)(() => Promise.resolve());
        const mockAIService = {
            isStreaming: (0, bun_test_1.mock)(() => false),
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            on: (0, bun_test_1.mock)(() => { }),
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            off: (0, bun_test_1.mock)(() => { }),
        };
        const mockConfig = {
            srcDir: "/tmp/test",
            findWorkspace: (0, bun_test_1.mock)(() => ({ projectPath: "/tmp/proj", workspacePath: "/tmp/proj/ws" })),
            editConfig: editConfigMock,
            getAllWorkspaceMetadata: (0, bun_test_1.mock)(() => Promise.resolve([])),
            getSessionDir: (0, bun_test_1.mock)(() => "/tmp/test/sessions"),
            generateStableId: (0, bun_test_1.mock)(() => "test-id"),
        };
        const mockInitStateManager = {
            // WorkspaceService subscribes to init-end events on construction.
            on: (0, bun_test_1.mock)(() => undefined),
            getInitState: (0, bun_test_1.mock)(() => ({
                status: "success",
                hookPath: "/tmp/proj",
                startTime: 0,
                lines: [],
                exitCode: 0,
                endTime: 1,
            })),
            clearInMemoryState: (0, bun_test_1.mock)((_workspaceId) => undefined),
        };
        const mockPartialService = {};
        const mockExtensionMetadataService = {};
        const mockBackgroundProcessManager = {
            cleanup: (0, bun_test_1.mock)(() => Promise.resolve()),
        };
        const workspaceService = new workspaceService_1.WorkspaceService(mockConfig, historyService, mockPartialService, mockAIService, mockInitStateManager, mockExtensionMetadataService, mockBackgroundProcessManager, {}, {});
        // Make it obvious if archive() incorrectly chooses deletion.
        workspaceService.remove = removeMock;
        const result = await workspaceService.archive(workspaceId);
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(editConfigMock).toHaveBeenCalled();
        (0, bun_test_1.expect)(removeMock).not.toHaveBeenCalled();
    });
    (0, bun_test_1.test)("list() includes isInitializing when init state is running", async () => {
        const workspaceId = "ws-list-initializing";
        const mockAIService = {
            isStreaming: (0, bun_test_1.mock)(() => false),
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            on: (0, bun_test_1.mock)(() => { }),
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            off: (0, bun_test_1.mock)(() => { }),
        };
        const mockMetadata = {
            id: workspaceId,
            name: "ws",
            projectName: "proj",
            projectPath: "/tmp/proj",
            createdAt: "2026-01-01T00:00:00.000Z",
            namedWorkspacePath: "/tmp/proj/ws",
            runtimeConfig: { type: "local" },
        };
        const mockConfig = {
            srcDir: "/tmp/test",
            getAllWorkspaceMetadata: (0, bun_test_1.mock)(() => Promise.resolve([mockMetadata])),
            getSessionDir: (0, bun_test_1.mock)(() => "/tmp/test/sessions"),
            generateStableId: (0, bun_test_1.mock)(() => "test-id"),
            findWorkspace: (0, bun_test_1.mock)(() => null),
        };
        const mockInitStateManager = {
            // WorkspaceService subscribes to init-end events on construction.
            on: (0, bun_test_1.mock)(() => undefined),
            getInitState: (0, bun_test_1.mock)((id) => id === workspaceId
                ? {
                    status: "running",
                    hookPath: "/tmp/proj",
                    startTime: 0,
                    lines: [],
                    exitCode: null,
                    endTime: null,
                }
                : undefined),
        };
        const mockPartialService = {};
        const mockExtensionMetadataService = {};
        const mockBackgroundProcessManager = {
            cleanup: (0, bun_test_1.mock)(() => Promise.resolve()),
        };
        const workspaceService = new workspaceService_1.WorkspaceService(mockConfig, historyService, mockPartialService, mockAIService, mockInitStateManager, mockExtensionMetadataService, mockBackgroundProcessManager, {}, {});
        const list = await workspaceService.list();
        (0, bun_test_1.expect)(list).toHaveLength(1);
        (0, bun_test_1.expect)(list[0]?.isInitializing).toBe(true);
    });
    (0, bun_test_1.test)("create() clears init state + emits updated metadata when skipping background init", async () => {
        const workspaceId = "ws-skip-init";
        const projectPath = "/tmp/proj";
        const branchName = "ws_branch";
        const workspacePath = "/tmp/proj/ws_branch";
        const initStates = new Map();
        const clearInMemoryStateMock = (0, bun_test_1.mock)((id) => {
            initStates.delete(id);
        });
        const mockInitStateManager = {
            on: (0, bun_test_1.mock)(() => undefined),
            startInit: (0, bun_test_1.mock)((id) => {
                initStates.set(id, {
                    status: "running",
                    hookPath: projectPath,
                    startTime: 0,
                    lines: [],
                    exitCode: null,
                    endTime: null,
                });
            }),
            getInitState: (0, bun_test_1.mock)((id) => initStates.get(id)),
            clearInMemoryState: clearInMemoryStateMock,
        };
        const configState = { projects: new Map() };
        const mockMetadata = {
            id: workspaceId,
            name: branchName,
            title: "title",
            projectName: "proj",
            projectPath,
            createdAt: "2026-01-01T00:00:00.000Z",
            namedWorkspacePath: workspacePath,
            runtimeConfig: { type: "local" },
        };
        const mockConfig = {
            rootDir: "/tmp/mux-root",
            srcDir: "/tmp/src",
            generateStableId: (0, bun_test_1.mock)(() => workspaceId),
            editConfig: (0, bun_test_1.mock)((editFn) => {
                editFn(configState);
                return Promise.resolve();
            }),
            getAllWorkspaceMetadata: (0, bun_test_1.mock)(() => Promise.resolve([mockMetadata])),
            getEffectiveSecrets: (0, bun_test_1.mock)(() => []),
            getSessionDir: (0, bun_test_1.mock)(() => "/tmp/test/sessions"),
            findWorkspace: (0, bun_test_1.mock)(() => null),
        };
        const mockAIService = {
            isStreaming: (0, bun_test_1.mock)(() => false),
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            on: (0, bun_test_1.mock)(() => { }),
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            off: (0, bun_test_1.mock)(() => { }),
        };
        const mockPartialService = {};
        const mockExtensionMetadataService = {};
        const mockBackgroundProcessManager = {
            cleanup: (0, bun_test_1.mock)(() => Promise.resolve()),
        };
        const createWorkspaceMock = (0, bun_test_1.mock)(() => Promise.resolve({ success: true, workspacePath }));
        const createRuntimeSpy = (0, bun_test_1.spyOn)(runtimeFactory, "createRuntime").mockReturnValue({
            createWorkspace: createWorkspaceMock,
        });
        const sessionEmitter = new events_1.EventEmitter();
        const fakeSession = {
            onChatEvent: (listener) => {
                sessionEmitter.on("chat-event", listener);
                return () => sessionEmitter.off("chat-event", listener);
            },
            onMetadataEvent: (listener) => {
                sessionEmitter.on("metadata-event", listener);
                return () => sessionEmitter.off("metadata-event", listener);
            },
            emitMetadata: (metadata) => {
                sessionEmitter.emit("metadata-event", { workspaceId, metadata });
            },
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            dispose: () => { },
        };
        try {
            const workspaceService = new workspaceService_1.WorkspaceService(mockConfig, historyService, mockPartialService, mockAIService, mockInitStateManager, mockExtensionMetadataService, mockBackgroundProcessManager, {}, {});
            const metadataEvents = [];
            workspaceService.on("metadata", (event) => {
                if (!event || typeof event !== "object") {
                    return;
                }
                const parsed = event;
                if (parsed.workspaceId === workspaceId) {
                    metadataEvents.push(parsed.metadata);
                }
            });
            workspaceService.registerSession(workspaceId, fakeSession);
            const removingWorkspaces = workspaceService.removingWorkspaces;
            removingWorkspaces.add(workspaceId);
            const result = await workspaceService.create(projectPath, branchName, undefined, "title", {
                type: "local",
            });
            (0, bun_test_1.expect)(result.success).toBe(true);
            if (!result.success) {
                return;
            }
            (0, bun_test_1.expect)(result.data.metadata.isInitializing).toBe(undefined);
            (0, bun_test_1.expect)(clearInMemoryStateMock).toHaveBeenCalledWith(workspaceId);
            (0, bun_test_1.expect)(metadataEvents).toHaveLength(2);
            (0, bun_test_1.expect)(metadataEvents[0]?.isInitializing).toBe(true);
            (0, bun_test_1.expect)(metadataEvents[1]?.isInitializing).toBe(undefined);
        }
        finally {
            createRuntimeSpy.mockRestore();
        }
    });
    (0, bun_test_1.test)("remove() aborts init and clears state before teardown", async () => {
        const workspaceId = "ws-remove-aborts";
        const tempRoot = await fsPromises.mkdtemp(path_1.default.join((0, os_1.tmpdir)(), "mux-ws-remove-"));
        try {
            const abortController = new AbortController();
            const clearInMemoryStateMock = (0, bun_test_1.mock)((_workspaceId) => undefined);
            const mockAIService = {
                isStreaming: (0, bun_test_1.mock)(() => false),
                stopStream: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined })),
                getWorkspaceMetadata: (0, bun_test_1.mock)(() => Promise.resolve({ success: false, error: "na" })),
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                on: (0, bun_test_1.mock)(() => { }),
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                off: (0, bun_test_1.mock)(() => { }),
            };
            const mockConfig = {
                srcDir: "/tmp/src",
                getSessionDir: (0, bun_test_1.mock)((id) => path_1.default.join(tempRoot, id)),
                removeWorkspace: (0, bun_test_1.mock)(() => Promise.resolve()),
                findWorkspace: (0, bun_test_1.mock)(() => null),
            };
            const mockPartialService = {};
            const mockInitStateManager = {
                on: (0, bun_test_1.mock)(() => undefined),
                getInitState: (0, bun_test_1.mock)(() => undefined),
                clearInMemoryState: clearInMemoryStateMock,
            };
            const mockExtensionMetadataService = {};
            const mockBackgroundProcessManager = {
                cleanup: (0, bun_test_1.mock)(() => Promise.resolve()),
            };
            const workspaceService = new workspaceService_1.WorkspaceService(mockConfig, historyService, mockPartialService, mockAIService, mockInitStateManager, mockExtensionMetadataService, mockBackgroundProcessManager, {}, {});
            // Inject an in-progress init AbortController.
            const initAbortControllers = workspaceService.initAbortControllers;
            initAbortControllers.set(workspaceId, abortController);
            const result = await workspaceService.remove(workspaceId, true);
            (0, bun_test_1.expect)(result.success).toBe(true);
            (0, bun_test_1.expect)(abortController.signal.aborted).toBe(true);
            (0, bun_test_1.expect)(clearInMemoryStateMock).toHaveBeenCalledWith(workspaceId);
            (0, bun_test_1.expect)(initAbortControllers.has(workspaceId)).toBe(false);
        }
        finally {
            await fsPromises.rm(tempRoot, { recursive: true, force: true });
        }
    });
    (0, bun_test_1.test)("remove() does not clear init state when runtime deletion fails with force=false", async () => {
        const workspaceId = "ws-remove-runtime-delete-fails";
        const projectPath = "/tmp/proj";
        const abortController = new AbortController();
        const clearInMemoryStateMock = (0, bun_test_1.mock)((_workspaceId) => undefined);
        const removeWorkspaceMock = (0, bun_test_1.mock)(() => Promise.resolve());
        const deleteWorkspaceMock = (0, bun_test_1.mock)(() => Promise.resolve({ success: false, error: "dirty" }));
        const createRuntimeSpy = (0, bun_test_1.spyOn)(runtimeFactory, "createRuntime").mockReturnValue({
            deleteWorkspace: deleteWorkspaceMock,
        });
        const tempRoot = await fsPromises.mkdtemp(path_1.default.join((0, os_1.tmpdir)(), "mux-ws-remove-fail-"));
        try {
            const mockAIService = {
                isStreaming: (0, bun_test_1.mock)(() => false),
                stopStream: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined })),
                getWorkspaceMetadata: (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)({
                    id: workspaceId,
                    name: "ws",
                    projectPath,
                    projectName: "proj",
                    runtimeConfig: { type: "local" },
                }))),
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                on: (0, bun_test_1.mock)(() => { }),
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                off: (0, bun_test_1.mock)(() => { }),
            };
            const mockConfig = {
                srcDir: "/tmp/src",
                getSessionDir: (0, bun_test_1.mock)((id) => path_1.default.join(tempRoot, id)),
                removeWorkspace: removeWorkspaceMock,
                findWorkspace: (0, bun_test_1.mock)(() => null),
            };
            const mockPartialService = {};
            const mockInitStateManager = {
                on: (0, bun_test_1.mock)(() => undefined),
                getInitState: (0, bun_test_1.mock)(() => undefined),
                clearInMemoryState: clearInMemoryStateMock,
            };
            const mockExtensionMetadataService = {};
            const mockBackgroundProcessManager = {
                cleanup: (0, bun_test_1.mock)(() => Promise.resolve()),
            };
            const workspaceService = new workspaceService_1.WorkspaceService(mockConfig, historyService, mockPartialService, mockAIService, mockInitStateManager, mockExtensionMetadataService, mockBackgroundProcessManager, {}, {});
            // Inject an in-progress init AbortController.
            const initAbortControllers = workspaceService.initAbortControllers;
            initAbortControllers.set(workspaceId, abortController);
            const result = await workspaceService.remove(workspaceId, false);
            (0, bun_test_1.expect)(result.success).toBe(false);
            (0, bun_test_1.expect)(abortController.signal.aborted).toBe(true);
            // If runtime deletion fails with force=false, removal returns early and the workspace remains.
            // Keep init state intact so init-end can refresh metadata and clear isInitializing.
            (0, bun_test_1.expect)(clearInMemoryStateMock).not.toHaveBeenCalled();
            (0, bun_test_1.expect)(removeWorkspaceMock).not.toHaveBeenCalled();
        }
        finally {
            createRuntimeSpy.mockRestore();
            await fsPromises.rm(tempRoot, { recursive: true, force: true });
        }
    });
    (0, bun_test_1.test)("remove() calls runtime.deleteWorkspace when force=true", async () => {
        const workspaceId = "ws-remove-runtime-delete";
        const projectPath = "/tmp/proj";
        const deleteWorkspaceMock = (0, bun_test_1.mock)(() => Promise.resolve({ success: true, deletedPath: "/tmp/deleted" }));
        const createRuntimeSpy = (0, bun_test_1.spyOn)(runtimeFactory, "createRuntime").mockReturnValue({
            deleteWorkspace: deleteWorkspaceMock,
        });
        const tempRoot = await fsPromises.mkdtemp(path_1.default.join((0, os_1.tmpdir)(), "mux-ws-remove-runtime-"));
        try {
            const mockAIService = {
                isStreaming: (0, bun_test_1.mock)(() => false),
                stopStream: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined })),
                getWorkspaceMetadata: (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)({
                    id: workspaceId,
                    name: "ws",
                    projectPath,
                    projectName: "proj",
                    runtimeConfig: { type: "local" },
                }))),
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                on: (0, bun_test_1.mock)(() => { }),
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                off: (0, bun_test_1.mock)(() => { }),
            };
            const mockConfig = {
                srcDir: "/tmp/src",
                getSessionDir: (0, bun_test_1.mock)((id) => path_1.default.join(tempRoot, id)),
                removeWorkspace: (0, bun_test_1.mock)(() => Promise.resolve()),
                findWorkspace: (0, bun_test_1.mock)(() => ({ projectPath, workspacePath: "/tmp/proj/ws" })),
            };
            const mockPartialService = {};
            const mockInitStateManager = {
                on: (0, bun_test_1.mock)(() => undefined),
                getInitState: (0, bun_test_1.mock)(() => undefined),
                clearInMemoryState: (0, bun_test_1.mock)((_workspaceId) => undefined),
            };
            const mockExtensionMetadataService = {};
            const mockBackgroundProcessManager = {
                cleanup: (0, bun_test_1.mock)(() => Promise.resolve()),
            };
            const workspaceService = new workspaceService_1.WorkspaceService(mockConfig, historyService, mockPartialService, mockAIService, mockInitStateManager, mockExtensionMetadataService, mockBackgroundProcessManager, {}, {});
            const result = await workspaceService.remove(workspaceId, true);
            (0, bun_test_1.expect)(result.success).toBe(true);
            (0, bun_test_1.expect)(deleteWorkspaceMock).toHaveBeenCalledWith(projectPath, "ws", true);
        }
        finally {
            createRuntimeSpy.mockRestore();
            await fsPromises.rm(tempRoot, { recursive: true, force: true });
        }
    });
});
//# sourceMappingURL=workspaceService.test.js.map