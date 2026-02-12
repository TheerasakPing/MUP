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
const fs = __importStar(require("node:fs/promises"));
const path = __importStar(require("node:path"));
const bun_test_1 = require("bun:test");
const workspace_1 = require("../../common/constants/workspace");
const compactionBoundary_1 = require("../../common/utils/messages/compactionBoundary");
const message_1 = require("../../common/types/message");
const tasks_1 = require("../../common/types/tasks");
const planStorage_1 = require("../../common/utils/planStorage");
const LocalRuntime_1 = require("../../node/runtime/LocalRuntime");
const tempDir_1 = require("../../node/services/tempDir");
const streamContextBuilder_1 = require("./streamContextBuilder");
class TestRuntime extends LocalRuntime_1.LocalRuntime {
    muxHomePath;
    constructor(projectPath, muxHomePath) {
        super(projectPath);
        this.muxHomePath = muxHomePath;
    }
    getMuxHome() {
        return this.muxHomePath;
    }
}
(0, bun_test_1.describe)("buildPlanInstructions", () => {
    (0, bun_test_1.test)("uses request payload history for Start Here detection", async () => {
        const env_1 = { stack: [], error: void 0, hasError: false };
        try {
            const tempRoot = __addDisposableResource(env_1, new tempDir_1.DisposableTempDir("stream-context-builder"), false);
            const projectPath = path.join(tempRoot.path, "project");
            const muxHome = path.join(tempRoot.path, "mux-home");
            await fs.mkdir(projectPath, { recursive: true });
            await fs.mkdir(muxHome, { recursive: true });
            const metadata = {
                id: "ws-1",
                name: "workspace-1",
                projectName: "project-1",
                projectPath,
                runtimeConfig: workspace_1.DEFAULT_RUNTIME_CONFIG,
            };
            const runtime = new TestRuntime(projectPath, muxHome);
            const planFilePath = (0, planStorage_1.getPlanFilePath)(metadata.name, metadata.projectName, muxHome);
            await fs.mkdir(path.dirname(planFilePath), { recursive: true });
            await fs.writeFile(planFilePath, "# Plan\n\n- Keep implementing", "utf-8");
            const startHereSummary = (0, message_1.createMuxMessage)("start-here", "assistant", "# Start Here\n\n- Existing plan context\n\n*Plan file preserved at:* /tmp/plan.md", {
                compacted: "user",
                agentId: "plan",
            });
            const compactionBoundary = (0, message_1.createMuxMessage)("boundary", "assistant", "Compacted summary", {
                compacted: "user",
                compactionBoundary: true,
                compactionEpoch: 1,
            });
            const latestUserMessage = (0, message_1.createMuxMessage)("u1", "user", "continue implementation");
            const fullHistory = [startHereSummary, compactionBoundary, latestUserMessage];
            const requestPayloadMessages = (0, compactionBoundary_1.sliceMessagesFromLatestCompactionBoundary)(fullHistory);
            (0, bun_test_1.expect)(requestPayloadMessages.map((message) => message.id)).toEqual(["boundary", "u1"]);
            const fromSlicedPayload = await (0, streamContextBuilder_1.buildPlanInstructions)({
                runtime,
                metadata,
                workspaceId: metadata.id,
                workspacePath: projectPath,
                effectiveMode: "exec",
                effectiveAgentId: "exec",
                agentIsPlanLike: false,
                agentDiscoveryPath: projectPath,
                additionalSystemInstructions: undefined,
                shouldDisableTaskToolsForDepth: false,
                taskDepth: 0,
                taskSettings: tasks_1.DEFAULT_TASK_SETTINGS,
                requestPayloadMessages,
            });
            const fromFullHistory = await (0, streamContextBuilder_1.buildPlanInstructions)({
                runtime,
                metadata,
                workspaceId: metadata.id,
                workspacePath: projectPath,
                effectiveMode: "exec",
                effectiveAgentId: "exec",
                agentIsPlanLike: false,
                agentDiscoveryPath: projectPath,
                additionalSystemInstructions: undefined,
                shouldDisableTaskToolsForDepth: false,
                taskDepth: 0,
                taskSettings: tasks_1.DEFAULT_TASK_SETTINGS,
                requestPayloadMessages: fullHistory,
            });
            (0, bun_test_1.expect)(fromSlicedPayload.effectiveAdditionalInstructions).toContain(`A plan file exists at: ${fromSlicedPayload.planFilePath}`);
            (0, bun_test_1.expect)(fromFullHistory.effectiveAdditionalInstructions).toBeUndefined();
        }
        catch (e_1) {
            env_1.error = e_1;
            env_1.hasError = true;
        }
        finally {
            __disposeResources(env_1);
        }
    });
});
//# sourceMappingURL=streamContextBuilder.test.js.map