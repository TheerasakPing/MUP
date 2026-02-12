"use strict";
var __addDisposableResource = (this && this.__addDisposableResource) || function (env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
        env.stack.push({ value: value, dispose: dispose, async: async });
    }
    else if (async) {
        env.stack.push({ async: true });
    }
    return value;
};
var __disposeResources = (this && this.__disposeResources) || (function (SuppressedError) {
    return function (env) {
        function fail(e) {
            env.error = env.hasError ? new SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        var r, s = 0;
        function next() {
            while (r = env.stack.pop()) {
                try {
                    if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                    if (r.dispose) {
                        var result = r.dispose.call(r.value);
                        if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                    }
                    else s |= 1;
                }
                catch (e) {
                    fail(e);
                }
            }
            if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return next();
    };
})(typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const events_1 = require("events");
const attachments_1 = require("../../common/constants/attachments");
const message_1 = require("../../common/types/message");
const agentSession_1 = require("./agentSession");
const tempDir_1 = require("./tempDir");
const testHistoryService_1 = require("./testHistoryService");
function createSuccessfulFileEditMessage(id, filePath, diff) {
    return {
        id,
        role: "assistant",
        parts: [
            {
                type: "dynamic-tool",
                toolCallId: `tool-${id}`,
                toolName: "file_edit_replace_string",
                state: "output-available",
                input: { file_path: filePath },
                output: { success: true, diff },
            },
        ],
        metadata: {
            timestamp: Date.now(),
        },
    };
}
function getEditedFilePaths(attachments) {
    const editedFilesAttachment = attachments.find((attachment) => attachment.type === "edited_files_reference");
    return editedFilesAttachment?.files.map((file) => file.path) ?? [];
}
function createSessionForHistory(historyService, sessionDir) {
    const partialService = {};
    const aiEmitter = new events_1.EventEmitter();
    const aiService = {
        on(eventName, listener) {
            aiEmitter.on(String(eventName), listener);
            return this;
        },
        off(eventName, listener) {
            aiEmitter.off(String(eventName), listener);
            return this;
        },
        getWorkspaceMetadata: (0, bun_test_1.mock)(() => Promise.resolve({ success: false, error: "metadata unavailable" })),
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
    return new agentSession_1.AgentSession({
        workspaceId: "workspace-post-compaction-test",
        config,
        historyService,
        partialService,
        aiService,
        initStateManager,
        costTrackingService: {},
        backgroundProcessManager,
    });
}
async function generatePeriodicPostCompactionAttachments(session) {
    const privateSession = session;
    privateSession.compactionOccurred = true;
    privateSession.turnsSinceLastAttachment = attachments_1.TURNS_BETWEEN_ATTACHMENTS - 1;
    const attachments = await privateSession.getPostCompactionAttachmentsIfNeeded();
    (0, bun_test_1.expect)(attachments).not.toBeNull();
    return attachments ?? [];
}
(0, bun_test_1.describe)("AgentSession periodic post-compaction attachments", () => {
    let historyCleanup;
    (0, bun_test_1.afterEach)(async () => {
        await historyCleanup?.();
    });
    (0, bun_test_1.test)("extracts edited file diffs from the latest durable compaction boundary slice", async () => {
        const env_1 = { stack: [], error: void 0, hasError: false };
        try {
            const sessionDir = __addDisposableResource(env_1, new tempDir_1.DisposableTempDir("agent-session-latest-boundary"), false);
            const history = [
                createSuccessfulFileEditMessage("stale-before-boundary", "/tmp/stale-before-boundary.ts", "@@ -1 +1 @@\n-old\n+older\n"),
                (0, message_1.createMuxMessage)("boundary-1", "assistant", "epoch 1 summary", {
                    compacted: "user",
                    compactionBoundary: true,
                    compactionEpoch: 1,
                }),
                createSuccessfulFileEditMessage("stale-epoch-1", "/tmp/stale-epoch-1.ts", "@@ -1 +1 @@\n-old\n+stale\n"),
                (0, message_1.createMuxMessage)("boundary-2", "assistant", "epoch 2 summary", {
                    compacted: "user",
                    compactionBoundary: true,
                    compactionEpoch: 2,
                }),
                createSuccessfulFileEditMessage("recent-epoch-2", "/tmp/recent-epoch-2.ts", "@@ -1 +1 @@\n-before\n+after\n"),
            ];
            const workspaceId = "workspace-post-compaction-test";
            const { historyService, cleanup } = await (0, testHistoryService_1.createTestHistoryService)();
            historyCleanup = cleanup;
            for (const msg of history) {
                await historyService.appendToHistory(workspaceId, msg);
            }
            const session = createSessionForHistory(historyService, sessionDir.path);
            try {
                const attachments = await generatePeriodicPostCompactionAttachments(session);
                (0, bun_test_1.expect)(getEditedFilePaths(attachments)).toEqual(["/tmp/recent-epoch-2.ts"]);
            }
            finally {
                session.dispose();
            }
        }
        catch (e_1) {
            env_1.error = e_1;
            env_1.hasError = true;
        }
        finally {
            __disposeResources(env_1);
        }
    });
    (0, bun_test_1.test)("falls back safely when boundary markers are malformed", async () => {
        const env_2 = { stack: [], error: void 0, hasError: false };
        try {
            const sessionDir = __addDisposableResource(env_2, new tempDir_1.DisposableTempDir("agent-session-malformed-boundary"), false);
            const history = [
                createSuccessfulFileEditMessage("stale-edit", "/tmp/stale.ts", "@@ -1 +1 @@\n-old\n+stale\n"),
                (0, message_1.createMuxMessage)("malformed-boundary", "assistant", "malformed summary", {
                    compacted: "user",
                    compactionBoundary: true,
                    // Missing compactionEpoch: marker should be ignored without crashing.
                }),
                createSuccessfulFileEditMessage("recent-edit", "/tmp/recent.ts", "@@ -1 +1 @@\n-before\n+after\n"),
            ];
            const workspaceId = "workspace-post-compaction-test";
            const { historyService, cleanup } = await (0, testHistoryService_1.createTestHistoryService)();
            historyCleanup = cleanup;
            for (const msg of history) {
                await historyService.appendToHistory(workspaceId, msg);
            }
            const session = createSessionForHistory(historyService, sessionDir.path);
            try {
                const attachments = await generatePeriodicPostCompactionAttachments(session);
                (0, bun_test_1.expect)(getEditedFilePaths(attachments)).toEqual(["/tmp/recent.ts", "/tmp/stale.ts"]);
            }
            finally {
                session.dispose();
            }
        }
        catch (e_2) {
            env_2.error = e_2;
            env_2.hasError = true;
        }
        finally {
            __disposeResources(env_2);
        }
    });
});
//# sourceMappingURL=agentSession.postCompactionAttachments.test.js.map