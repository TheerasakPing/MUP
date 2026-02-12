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
const bun_test_1 = require("bun:test");
const events_1 = require("events");
const fsPromises = __importStar(require("fs/promises"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const agentSession_1 = require("./agentSession");
const testHistoryService_1 = require("./testHistoryService");
function createPersistedPostCompactionState(options) {
    const payload = {
        version: 1,
        createdAt: Date.now(),
        diffs: options.diffs,
    };
    return fsPromises.writeFile(options.filePath, JSON.stringify(payload));
}
(0, bun_test_1.describe)("AgentSession post-compaction context retry", () => {
    let historyCleanup;
    (0, bun_test_1.afterEach)(async () => {
        await historyCleanup?.();
    });
    (0, bun_test_1.test)("retries once without post-compaction injection on context_exceeded", async () => {
        const workspaceId = "ws";
        const sessionDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "mux-agentSession-"));
        const postCompactionPath = path.join(sessionDir, "post-compaction.json");
        await createPersistedPostCompactionState({
            filePath: postCompactionPath,
            diffs: [
                {
                    path: "/tmp/foo.ts",
                    diff: "@@ -1 +1 @@\n-foo\n+bar\n",
                    truncated: false,
                },
            ],
        });
        const history = [
            {
                id: "compaction-summary",
                role: "assistant",
                parts: [{ type: "text", text: "Summary" }],
                metadata: { timestamp: 1000, compacted: "user" },
            },
            {
                id: "user-1",
                role: "user",
                parts: [{ type: "text", text: "Continue" }],
                metadata: { timestamp: 1100 },
            },
        ];
        const { historyService, cleanup } = await (0, testHistoryService_1.createTestHistoryService)();
        historyCleanup = cleanup;
        for (const msg of history) {
            await historyService.appendToHistory(workspaceId, msg);
        }
        (0, bun_test_1.spyOn)(historyService, "deleteMessage");
        const partialService = {
            commitToHistory: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined })),
            deletePartial: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined })),
        };
        const aiEmitter = new events_1.EventEmitter();
        let resolveSecondCall;
        const secondCall = new Promise((resolve) => {
            resolveSecondCall = resolve;
        });
        let callCount = 0;
        const streamMessage = (0, bun_test_1.mock)((..._args) => {
            callCount += 1;
            if (callCount === 1) {
                // Simulate a provider context limit error before any deltas.
                aiEmitter.emit("error", {
                    workspaceId,
                    messageId: "assistant-ctx-exceeded",
                    error: "Context length exceeded",
                    errorType: "context_exceeded",
                });
                return Promise.resolve({ success: true, data: undefined });
            }
            resolveSecondCall?.();
            return Promise.resolve({ success: true, data: undefined });
        });
        const aiService = {
            on(eventName, listener) {
                aiEmitter.on(String(eventName), listener);
                return this;
            },
            off(eventName, listener) {
                aiEmitter.off(String(eventName), listener);
                return this;
            },
            streamMessage,
            getWorkspaceMetadata: (0, bun_test_1.mock)(() => Promise.resolve({ success: false, error: "nope" })),
            stopStream: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined })),
        };
        const initStateManager = {
            on() {
                return this;
            },
            off() {
                return this;
            },
        };
        const backgroundProcessManager = {
            setMessageQueued: (0, bun_test_1.mock)(() => undefined),
            cleanup: (0, bun_test_1.mock)(() => Promise.resolve()),
        };
        const config = {
            srcDir: "/tmp",
            getSessionDir: (0, bun_test_1.mock)(() => sessionDir),
        };
        const session = new agentSession_1.AgentSession({
            workspaceId,
            config,
            historyService,
            partialService,
            aiService,
            initStateManager,
            costTrackingService: {},
            backgroundProcessManager,
        });
        const options = {
            model: "openai:gpt-4o",
            agentId: "exec",
        };
        // Call streamWithHistory directly (private) to avoid needing a full user send pipeline.
        await session.streamWithHistory(options.model, options);
        // Wait for the retry call to happen.
        await Promise.race([
            secondCall,
            new Promise((_, reject) => setTimeout(() => reject(new Error("retry timeout")), 1000)),
        ]);
        (0, bun_test_1.expect)(streamMessage).toHaveBeenCalledTimes(2);
        // With the options bag, arg[0] is the StreamMessageOptions object.
        const firstOpts = streamMessage.mock.calls[0][0];
        (0, bun_test_1.expect)(Array.isArray(firstOpts.postCompactionAttachments)).toBe(true);
        const secondOpts = streamMessage.mock.calls[1][0];
        (0, bun_test_1.expect)(secondOpts.postCompactionAttachments).toBeNull();
        (0, bun_test_1.expect)(historyService.deleteMessage.mock.calls[0][1]).toBe("assistant-ctx-exceeded");
        // Pending post-compaction state should be discarded.
        let exists = true;
        try {
            await fsPromises.stat(postCompactionPath);
        }
        catch {
            exists = false;
        }
        (0, bun_test_1.expect)(exists).toBe(false);
        session.dispose();
    });
});
(0, bun_test_1.describe)("AgentSession execSubagentHardRestart", () => {
    let historyCleanup;
    (0, bun_test_1.afterEach)(async () => {
        await historyCleanup?.();
    });
    (0, bun_test_1.test)("hard-restarts exec-like subagent history on context_exceeded and retries once", async () => {
        const workspaceId = "ws-hard";
        const sessionDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "mux-agentSession-"));
        const history = [
            {
                id: "snapshot-1",
                role: "user",
                parts: [{ type: "text", text: "<snapshot>" }],
                metadata: {
                    timestamp: 1000,
                    synthetic: true,
                    fileAtMentionSnapshot: ["@foo"],
                },
            },
            {
                id: "user-1",
                role: "user",
                parts: [{ type: "text", text: "Do the thing" }],
                metadata: {
                    timestamp: 1100,
                },
            },
        ];
        const { historyService, cleanup } = await (0, testHistoryService_1.createTestHistoryService)();
        historyCleanup = cleanup;
        for (const msg of history) {
            await historyService.appendToHistory(workspaceId, msg);
        }
        (0, bun_test_1.spyOn)(historyService, "clearHistory");
        (0, bun_test_1.spyOn)(historyService, "appendToHistory");
        const partialService = {
            commitToHistory: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined })),
            deletePartial: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined })),
        };
        const aiEmitter = new events_1.EventEmitter();
        let resolveSecondCall;
        const secondCall = new Promise((resolve) => {
            resolveSecondCall = resolve;
        });
        let callCount = 0;
        const streamMessage = (0, bun_test_1.mock)((..._args) => {
            callCount += 1;
            if (callCount === 1) {
                aiEmitter.emit("error", {
                    workspaceId,
                    messageId: "assistant-ctx-exceeded-1",
                    error: "Context length exceeded",
                    errorType: "context_exceeded",
                });
                return Promise.resolve({ success: true, data: undefined });
            }
            if (callCount === 2) {
                // Second context_exceeded should NOT trigger an additional hard restart.
                aiEmitter.emit("error", {
                    workspaceId,
                    messageId: "assistant-ctx-exceeded-2",
                    error: "Context length exceeded",
                    errorType: "context_exceeded",
                });
                resolveSecondCall?.();
                return Promise.resolve({ success: true, data: undefined });
            }
            throw new Error("unexpected third streamMessage call");
        });
        const parentWorkspaceId = "parent";
        const childWorkspaceMetadata = {
            id: workspaceId,
            name: "child",
            projectName: "proj",
            projectPath: "/tmp/proj",
            namedWorkspacePath: "/tmp/proj/child",
            runtimeConfig: { type: "local" },
            parentWorkspaceId,
            agentId: "exec",
        };
        const parentWorkspaceMetadata = {
            ...childWorkspaceMetadata,
            id: parentWorkspaceId,
            name: "parent",
            parentWorkspaceId: undefined,
        };
        const getWorkspaceMetadata = (0, bun_test_1.mock)((id) => {
            if (id === workspaceId) {
                return Promise.resolve({
                    success: true,
                    data: childWorkspaceMetadata,
                });
            }
            if (id === parentWorkspaceId) {
                return Promise.resolve({
                    success: true,
                    data: parentWorkspaceMetadata,
                });
            }
            return Promise.resolve({ success: false, error: "unknown" });
        });
        const aiService = {
            on(eventName, listener) {
                aiEmitter.on(String(eventName), listener);
                return this;
            },
            off(eventName, listener) {
                aiEmitter.off(String(eventName), listener);
                return this;
            },
            streamMessage,
            getWorkspaceMetadata,
            stopStream: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined })),
        };
        const initStateManager = {
            on() {
                return this;
            },
            off() {
                return this;
            },
        };
        const backgroundProcessManager = {
            setMessageQueued: (0, bun_test_1.mock)(() => undefined),
            cleanup: (0, bun_test_1.mock)(() => Promise.resolve()),
        };
        const config = {
            srcDir: "/tmp",
            getSessionDir: (0, bun_test_1.mock)(() => sessionDir),
        };
        const session = new agentSession_1.AgentSession({
            workspaceId,
            config,
            historyService,
            partialService,
            aiService,
            initStateManager,
            costTrackingService: {},
            backgroundProcessManager,
        });
        const options = {
            model: "openai:gpt-4o",
            agentId: "exec",
            experiments: {
                execSubagentHardRestart: true,
            },
        };
        await session.streamWithHistory(options.model, options);
        await Promise.race([
            secondCall,
            new Promise((_, reject) => setTimeout(() => reject(new Error("retry timeout")), 1000)),
        ]);
        (0, bun_test_1.expect)(streamMessage).toHaveBeenCalledTimes(2);
        (0, bun_test_1.expect)(historyService.clearHistory.mock.calls).toHaveLength(1);
        // Continuation notice + seed prompt (and snapshots) should be appended after clear.
        (0, bun_test_1.expect)(historyService.appendToHistory.mock.calls).toHaveLength(3);
        const appendedNotice = historyService.appendToHistory.mock
            .calls[0][1];
        (0, bun_test_1.expect)(appendedNotice?.metadata?.synthetic).toBe(true);
        (0, bun_test_1.expect)(appendedNotice?.metadata?.uiVisible).toBe(true);
        const noticeText = appendedNotice?.parts.find((p) => p.type === "text");
        (0, bun_test_1.expect)(noticeText?.text).toContain("restarted");
        (0, bun_test_1.expect)(historyService.appendToHistory.mock.calls[1][1]
            .id).toBe("snapshot-1");
        (0, bun_test_1.expect)(historyService.appendToHistory.mock.calls[2][1]
            .id).toBe("user-1");
        // Retry should include the continuation notice in additionalSystemInstructions.
        const retryOpts = streamMessage.mock.calls[1][0];
        (0, bun_test_1.expect)(String(retryOpts.additionalSystemInstructions)).toContain("restarted");
        session.dispose();
    });
    (0, bun_test_1.test)("resolves exec-like predicate from parent workspace when child agents are missing", async () => {
        const workspaceId = "ws-hard-custom-agent";
        const sessionDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "mux-agentSession-"));
        const history = [
            {
                id: "user-1",
                role: "user",
                parts: [{ type: "text", text: "Do the thing" }],
                metadata: {
                    timestamp: 1100,
                },
            },
        ];
        const { historyService, cleanup } = await (0, testHistoryService_1.createTestHistoryService)();
        historyCleanup = cleanup;
        for (const msg of history) {
            await historyService.appendToHistory(workspaceId, msg);
        }
        (0, bun_test_1.spyOn)(historyService, "clearHistory");
        (0, bun_test_1.spyOn)(historyService, "appendToHistory");
        const partialService = {
            commitToHistory: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined })),
            deletePartial: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined })),
        };
        const aiEmitter = new events_1.EventEmitter();
        let resolveSecondCall;
        const secondCall = new Promise((resolve) => {
            resolveSecondCall = resolve;
        });
        let callCount = 0;
        const streamMessage = (0, bun_test_1.mock)((..._args) => {
            callCount += 1;
            if (callCount === 1) {
                // Simulate a provider context limit error before any deltas.
                aiEmitter.emit("error", {
                    workspaceId,
                    messageId: "assistant-ctx-exceeded-1",
                    error: "Context length exceeded",
                    errorType: "context_exceeded",
                });
                return Promise.resolve({ success: true, data: undefined });
            }
            resolveSecondCall?.();
            return Promise.resolve({ success: true, data: undefined });
        });
        const customAgentId = "custom_hard_restart_agent";
        const srcBaseDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "mux-agentSession-worktrees-"));
        const projectPath = await fsPromises.mkdtemp(path.join(os.tmpdir(), "mux-agentSession-proj-"));
        // Create a custom agent definition ONLY in the parent workspace path.
        // This simulates untracked .mux/agents that are present in the parent worktree but absent
        // from the child task worktree.
        const parentWorkspaceName = "parent";
        const parentAgentsDir = path.join(srcBaseDir, path.basename(projectPath), parentWorkspaceName, ".mux", "agents");
        await fsPromises.mkdir(parentAgentsDir, { recursive: true });
        await fsPromises.writeFile(path.join(parentAgentsDir, `${customAgentId}.md`), [
            "---",
            "name: Custom Hard Restart Agent",
            "description: Test agent inheriting exec",
            "base: exec",
            "---",
            "",
            "Body",
            "",
        ].join("\n"));
        const parentWorkspaceId = "parent-custom";
        const childWorkspaceMetadata = {
            id: workspaceId,
            name: "child",
            projectName: "proj",
            projectPath,
            runtimeConfig: { type: "worktree", srcBaseDir },
            parentWorkspaceId,
            agentId: customAgentId,
        };
        const parentWorkspaceMetadata = {
            ...childWorkspaceMetadata,
            id: parentWorkspaceId,
            name: parentWorkspaceName,
            parentWorkspaceId: undefined,
            agentId: "exec",
        };
        const getWorkspaceMetadata = (0, bun_test_1.mock)((id) => {
            if (id === workspaceId) {
                return Promise.resolve({
                    success: true,
                    data: childWorkspaceMetadata,
                });
            }
            if (id === parentWorkspaceId) {
                return Promise.resolve({
                    success: true,
                    data: parentWorkspaceMetadata,
                });
            }
            return Promise.resolve({ success: false, error: "unknown" });
        });
        const aiService = {
            on(eventName, listener) {
                aiEmitter.on(String(eventName), listener);
                return this;
            },
            off(eventName, listener) {
                aiEmitter.off(String(eventName), listener);
                return this;
            },
            streamMessage,
            getWorkspaceMetadata,
            stopStream: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined })),
        };
        const initStateManager = {
            on() {
                return this;
            },
            off() {
                return this;
            },
        };
        const backgroundProcessManager = {
            setMessageQueued: (0, bun_test_1.mock)(() => undefined),
            cleanup: (0, bun_test_1.mock)(() => Promise.resolve()),
        };
        const config = {
            srcDir: "/tmp",
            getSessionDir: (0, bun_test_1.mock)(() => sessionDir),
        };
        const session = new agentSession_1.AgentSession({
            workspaceId,
            config,
            historyService,
            partialService,
            aiService,
            initStateManager,
            costTrackingService: {},
            backgroundProcessManager,
        });
        const options = {
            model: "openai:gpt-4o",
            agentId: customAgentId,
            experiments: {
                execSubagentHardRestart: true,
            },
        };
        await session.streamWithHistory(options.model, options);
        await Promise.race([
            secondCall,
            new Promise((_, reject) => setTimeout(() => reject(new Error("retry timeout")), 1000)),
        ]);
        (0, bun_test_1.expect)(streamMessage).toHaveBeenCalledTimes(2);
        (0, bun_test_1.expect)(historyService.clearHistory.mock.calls).toHaveLength(1);
        session.dispose();
    });
    (0, bun_test_1.test)("does not hard-restart when workspace is not a subagent", async () => {
        const workspaceId = "ws-hard-no-parent";
        const sessionDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "mux-agentSession-"));
        const history = [
            {
                id: "user-1",
                role: "user",
                parts: [{ type: "text", text: "Do the thing" }],
                metadata: { timestamp: 1100 },
            },
        ];
        const { historyService, cleanup } = await (0, testHistoryService_1.createTestHistoryService)();
        historyCleanup = cleanup;
        for (const msg of history) {
            await historyService.appendToHistory(workspaceId, msg);
        }
        (0, bun_test_1.spyOn)(historyService, "clearHistory");
        const partialService = {
            commitToHistory: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined })),
            deletePartial: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined })),
        };
        const aiEmitter = new events_1.EventEmitter();
        const streamMessage = (0, bun_test_1.mock)((..._args) => {
            aiEmitter.emit("error", {
                workspaceId,
                messageId: "assistant-ctx-exceeded",
                error: "Context length exceeded",
                errorType: "context_exceeded",
            });
            return Promise.resolve({ success: true, data: undefined });
        });
        const workspaceMetadata = {
            id: workspaceId,
            name: "child",
            projectName: "proj",
            projectPath: "/tmp/proj",
            namedWorkspacePath: "/tmp/proj/child",
            runtimeConfig: { type: "local" },
            agentId: "exec",
        };
        const aiService = {
            on(eventName, listener) {
                aiEmitter.on(String(eventName), listener);
                return this;
            },
            off(eventName, listener) {
                aiEmitter.off(String(eventName), listener);
                return this;
            },
            streamMessage,
            getWorkspaceMetadata: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: workspaceMetadata })),
            stopStream: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined })),
        };
        const initStateManager = {
            on() {
                return this;
            },
            off() {
                return this;
            },
        };
        const backgroundProcessManager = {
            setMessageQueued: (0, bun_test_1.mock)(() => undefined),
            cleanup: (0, bun_test_1.mock)(() => Promise.resolve()),
        };
        const config = {
            srcDir: "/tmp",
            getSessionDir: (0, bun_test_1.mock)(() => sessionDir),
        };
        const session = new agentSession_1.AgentSession({
            workspaceId,
            config,
            historyService,
            partialService,
            aiService,
            initStateManager,
            costTrackingService: {},
            backgroundProcessManager,
        });
        const options = {
            model: "openai:gpt-4o",
            agentId: "exec",
            experiments: {
                execSubagentHardRestart: true,
            },
        };
        await session.streamWithHistory(options.model, options);
        await new Promise((resolve) => setTimeout(resolve, 25));
        (0, bun_test_1.expect)(streamMessage).toHaveBeenCalledTimes(1);
        (0, bun_test_1.expect)(historyService.clearHistory.mock.calls).toHaveLength(0);
        session.dispose();
    });
});
//# sourceMappingURL=agentSession.postCompactionRetry.test.js.map