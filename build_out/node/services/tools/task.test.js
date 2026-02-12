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
const task_1 = require("./task");
const testHelpers_1 = require("./testHelpers");
const result_1 = require("../../../common/types/result");
// Mock ToolCallOptions for testing
const mockToolCallOptions = {
    toolCallId: "test-call-id",
    messages: [],
};
function expectQueuedOrRunningTaskToolResult(result, expected) {
    (0, bun_test_1.expect)(result).toBeTruthy();
    (0, bun_test_1.expect)(typeof result).toBe("object");
    (0, bun_test_1.expect)(result).not.toBeNull();
    const obj = result;
    (0, bun_test_1.expect)(obj.status).toBe(expected.status);
    (0, bun_test_1.expect)(obj.taskId).toBe(expected.taskId);
    const note = obj.note;
    (0, bun_test_1.expect)(typeof note).toBe("string");
    if (typeof note === "string") {
        (0, bun_test_1.expect)(note).toContain("task_await");
    }
}
(0, bun_test_1.describe)("task tool", () => {
    (0, bun_test_1.it)("should return immediately when run_in_background is true", async () => {
        const env_1 = { stack: [], error: void 0, hasError: false };
        try {
            const tempDir = __addDisposableResource(env_1, new testHelpers_1.TestTempDir("test-task-tool"), false);
            const baseConfig = (0, testHelpers_1.createTestToolConfig)(tempDir.path, { workspaceId: "parent-workspace" });
            const create = (0, bun_test_1.mock)(() => (0, result_1.Ok)({ taskId: "child-task", kind: "agent", status: "queued" }));
            const waitForAgentReport = (0, bun_test_1.mock)(() => Promise.resolve({ reportMarkdown: "ignored" }));
            const taskService = { create, waitForAgentReport };
            const tool = (0, task_1.createTaskTool)({
                ...baseConfig,
                muxEnv: { MUX_MODEL_STRING: "openai:gpt-4o-mini", MUX_THINKING_LEVEL: "high" },
                taskService,
            });
            const result = await Promise.resolve(tool.execute({ subagent_type: "explore", prompt: "do it", title: "Child task", run_in_background: true }, mockToolCallOptions));
            (0, bun_test_1.expect)(create).toHaveBeenCalled();
            (0, bun_test_1.expect)(waitForAgentReport).not.toHaveBeenCalled();
            expectQueuedOrRunningTaskToolResult(result, { status: "queued", taskId: "child-task" });
        }
        catch (e_1) {
            env_1.error = e_1;
            env_1.hasError = true;
        }
        finally {
            __disposeResources(env_1);
        }
    });
    (0, bun_test_1.it)("should allow sub-agent workspaces to spawn nested tasks", async () => {
        const env_2 = { stack: [], error: void 0, hasError: false };
        try {
            const tempDir = __addDisposableResource(env_2, new testHelpers_1.TestTempDir("test-task-tool"), false);
            const baseConfig = (0, testHelpers_1.createTestToolConfig)(tempDir.path, { workspaceId: "child-workspace" });
            const create = (0, bun_test_1.mock)(() => (0, result_1.Ok)({ taskId: "grandchild-task", kind: "agent", status: "queued" }));
            const waitForAgentReport = (0, bun_test_1.mock)(() => Promise.resolve({ reportMarkdown: "ignored" }));
            const taskService = { create, waitForAgentReport };
            const tool = (0, task_1.createTaskTool)({
                ...baseConfig,
                enableAgentReport: true,
                taskService,
            });
            const result = await Promise.resolve(tool.execute({
                subagent_type: "explore",
                prompt: "do it",
                title: "Grandchild task",
                run_in_background: true,
            }, mockToolCallOptions));
            (0, bun_test_1.expect)(create).toHaveBeenCalledWith(bun_test_1.expect.objectContaining({
                parentWorkspaceId: "child-workspace",
                kind: "agent",
                agentId: "explore",
                agentType: "explore",
            }));
            expectQueuedOrRunningTaskToolResult(result, { status: "queued", taskId: "grandchild-task" });
        }
        catch (e_2) {
            env_2.error = e_2;
            env_2.hasError = true;
        }
        finally {
            __disposeResources(env_2);
        }
    });
    (0, bun_test_1.it)("should block and return report when run_in_background is false", async () => {
        const env_3 = { stack: [], error: void 0, hasError: false };
        try {
            const tempDir = __addDisposableResource(env_3, new testHelpers_1.TestTempDir("test-task-tool"), false);
            const baseConfig = (0, testHelpers_1.createTestToolConfig)(tempDir.path, { workspaceId: "parent-workspace" });
            const events = [];
            let didEmitTaskCreated = false;
            const create = (0, bun_test_1.mock)(() => (0, result_1.Ok)({ taskId: "child-task", kind: "agent", status: "running" }));
            const waitForAgentReport = (0, bun_test_1.mock)(() => {
                // The main thing we care about: emit the UI-only taskId before we block waiting for the report.
                (0, bun_test_1.expect)(didEmitTaskCreated).toBe(true);
                return Promise.resolve({
                    reportMarkdown: "Hello from child",
                    title: "Result",
                });
            });
            const taskService = { create, waitForAgentReport };
            const tool = (0, task_1.createTaskTool)({
                ...baseConfig,
                emitChatEvent: (event) => {
                    if (event.type === "task-created") {
                        didEmitTaskCreated = true;
                        events.push(event);
                    }
                },
                taskService,
            });
            const result = await Promise.resolve(tool.execute({
                subagent_type: "explore",
                prompt: "do it",
                title: "Child task",
                run_in_background: false,
            }, mockToolCallOptions));
            (0, bun_test_1.expect)(create).toHaveBeenCalled();
            (0, bun_test_1.expect)(waitForAgentReport).toHaveBeenCalledWith("child-task", bun_test_1.expect.any(Object));
            (0, bun_test_1.expect)(events).toHaveLength(1);
            const taskCreated = events[0];
            if (!taskCreated) {
                throw new Error("Expected a task-created event");
            }
            (0, bun_test_1.expect)(taskCreated.type).toBe("task-created");
            const parentWorkspaceId = baseConfig.workspaceId;
            if (!parentWorkspaceId) {
                throw new Error("Expected baseConfig.workspaceId to be set");
            }
            (0, bun_test_1.expect)(taskCreated.workspaceId).toBe(parentWorkspaceId);
            (0, bun_test_1.expect)(taskCreated.toolCallId).toBe(mockToolCallOptions.toolCallId);
            (0, bun_test_1.expect)(taskCreated.taskId).toBe("child-task");
            (0, bun_test_1.expect)(typeof taskCreated.timestamp).toBe("number");
            (0, bun_test_1.expect)(result).toEqual({
                status: "completed",
                taskId: "child-task",
                reportMarkdown: "Hello from child",
                title: "Result",
                agentId: "explore",
                agentType: "explore",
            });
        }
        catch (e_3) {
            env_3.error = e_3;
            env_3.hasError = true;
        }
        finally {
            __disposeResources(env_3);
        }
    });
    (0, bun_test_1.it)("should return taskId (with note) if foreground wait times out", async () => {
        const env_4 = { stack: [], error: void 0, hasError: false };
        try {
            const tempDir = __addDisposableResource(env_4, new testHelpers_1.TestTempDir("test-task-tool"), false);
            const baseConfig = (0, testHelpers_1.createTestToolConfig)(tempDir.path, { workspaceId: "parent-workspace" });
            const create = (0, bun_test_1.mock)(() => (0, result_1.Ok)({ taskId: "child-task", kind: "agent", status: "queued" }));
            const waitForAgentReport = (0, bun_test_1.mock)(() => Promise.reject(new Error("Timed out waiting for agent_report")));
            const getAgentTaskStatus = (0, bun_test_1.mock)(() => "running");
            const taskService = {
                create,
                waitForAgentReport,
                getAgentTaskStatus,
            };
            const tool = (0, task_1.createTaskTool)({
                ...baseConfig,
                taskService,
            });
            const result = await Promise.resolve(tool.execute({
                subagent_type: "explore",
                prompt: "do it",
                title: "Child task",
                run_in_background: false,
            }, mockToolCallOptions));
            (0, bun_test_1.expect)(create).toHaveBeenCalled();
            (0, bun_test_1.expect)(waitForAgentReport).toHaveBeenCalledWith("child-task", bun_test_1.expect.any(Object));
            (0, bun_test_1.expect)(getAgentTaskStatus).toHaveBeenCalledWith("child-task");
            expectQueuedOrRunningTaskToolResult(result, { status: "running", taskId: "child-task" });
        }
        catch (e_4) {
            env_4.error = e_4;
            env_4.hasError = true;
        }
        finally {
            __disposeResources(env_4);
        }
    });
    (0, bun_test_1.it)("should throw when TaskService.create fails (e.g., depth limit)", async () => {
        const env_5 = { stack: [], error: void 0, hasError: false };
        try {
            const tempDir = __addDisposableResource(env_5, new testHelpers_1.TestTempDir("test-task-tool"), false);
            const baseConfig = (0, testHelpers_1.createTestToolConfig)(tempDir.path, { workspaceId: "parent-workspace" });
            const create = (0, bun_test_1.mock)(() => (0, result_1.Err)("maxTaskNestingDepth exceeded"));
            const waitForAgentReport = (0, bun_test_1.mock)(() => Promise.resolve({ reportMarkdown: "ignored" }));
            const taskService = { create, waitForAgentReport };
            const tool = (0, task_1.createTaskTool)({
                ...baseConfig,
                taskService,
            });
            let caught = null;
            try {
                await Promise.resolve(tool.execute({ subagent_type: "explore", prompt: "do it", title: "Child task" }, mockToolCallOptions));
            }
            catch (error) {
                caught = error;
            }
            (0, bun_test_1.expect)(caught).toBeInstanceOf(Error);
            if (caught instanceof Error) {
                (0, bun_test_1.expect)(caught.message).toMatch(/maxTaskNestingDepth/i);
            }
        }
        catch (e_5) {
            env_5.error = e_5;
            env_5.hasError = true;
        }
        finally {
            __disposeResources(env_5);
        }
    });
    (0, bun_test_1.it)('should reject spawning "exec" tasks while in plan agent', async () => {
        const env_6 = { stack: [], error: void 0, hasError: false };
        try {
            const tempDir = __addDisposableResource(env_6, new testHelpers_1.TestTempDir("test-task-tool"), false);
            const baseConfig = (0, testHelpers_1.createTestToolConfig)(tempDir.path, { workspaceId: "parent-workspace" });
            const create = (0, bun_test_1.mock)(() => (0, result_1.Ok)({ taskId: "child-task", kind: "agent", status: "running" }));
            const waitForAgentReport = (0, bun_test_1.mock)(() => Promise.resolve({
                reportMarkdown: "Hello from child",
                title: "Result",
            }));
            const taskService = { create, waitForAgentReport };
            const tool = (0, task_1.createTaskTool)({
                ...baseConfig,
                planFileOnly: true,
                taskService,
            });
            let caught = null;
            try {
                await Promise.resolve(tool.execute({ subagent_type: "exec", prompt: "do it", title: "Child task" }, mockToolCallOptions));
            }
            catch (error) {
                caught = error;
            }
            (0, bun_test_1.expect)(caught).toBeInstanceOf(Error);
            if (caught instanceof Error) {
                (0, bun_test_1.expect)(caught.message).toMatch(/plan agent/i);
            }
            (0, bun_test_1.expect)(create).not.toHaveBeenCalled();
            (0, bun_test_1.expect)(waitForAgentReport).not.toHaveBeenCalled();
        }
        catch (e_6) {
            env_6.error = e_6;
            env_6.hasError = true;
        }
        finally {
            __disposeResources(env_6);
        }
    });
});
//# sourceMappingURL=task.test.js.map