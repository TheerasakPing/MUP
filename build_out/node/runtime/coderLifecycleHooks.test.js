"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const coderLifecycleHooks_1 = require("./coderLifecycleHooks");
const result_1 = require("../../common/types/result");
function createSshCoderMetadata(overrides) {
    return {
        id: "ws",
        name: "ws",
        projectName: "proj",
        projectPath: "/tmp/proj",
        runtimeConfig: {
            type: "ssh",
            host: "coder://",
            srcBaseDir: "~/mux",
            coder: {
                workspaceName: "mux-ws",
            },
        },
        ...overrides,
    };
}
(0, bun_test_1.describe)("createStopCoderOnArchiveHook", () => {
    (0, bun_test_1.it)("does nothing when stop-on-archive is disabled", async () => {
        const getWorkspaceStatus = (0, bun_test_1.mock)(() => Promise.resolve({ kind: "ok", status: "running" }));
        const stopWorkspace = (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(undefined)));
        const coderService = {
            getWorkspaceStatus,
            stopWorkspace,
        };
        const hook = (0, coderLifecycleHooks_1.createStopCoderOnArchiveHook)({
            coderService,
            shouldStopOnArchive: () => false,
        });
        const result = await hook({
            workspaceId: "ws",
            workspaceMetadata: createSshCoderMetadata(),
        });
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(getWorkspaceStatus).toHaveBeenCalledTimes(0);
        (0, bun_test_1.expect)(stopWorkspace).toHaveBeenCalledTimes(0);
    });
    (0, bun_test_1.it)("does nothing when connected to an existing Coder workspace", async () => {
        const getWorkspaceStatus = (0, bun_test_1.mock)(() => Promise.resolve({ kind: "ok", status: "running" }));
        const stopWorkspace = (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(undefined)));
        const coderService = {
            getWorkspaceStatus,
            stopWorkspace,
        };
        const hook = (0, coderLifecycleHooks_1.createStopCoderOnArchiveHook)({
            coderService,
            shouldStopOnArchive: () => true,
        });
        const result = await hook({
            workspaceId: "ws",
            workspaceMetadata: createSshCoderMetadata({
                runtimeConfig: {
                    type: "ssh",
                    host: "coder://",
                    srcBaseDir: "~/mux",
                    coder: { workspaceName: "mux-ws", existingWorkspace: true },
                },
            }),
        });
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(getWorkspaceStatus).toHaveBeenCalledTimes(0);
        (0, bun_test_1.expect)(stopWorkspace).toHaveBeenCalledTimes(0);
    });
    (0, bun_test_1.it)("stops a running dedicated Coder workspace", async () => {
        const getWorkspaceStatus = (0, bun_test_1.mock)(() => Promise.resolve({ kind: "ok", status: "running" }));
        const stopWorkspace = (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(undefined)));
        const coderService = {
            getWorkspaceStatus,
            stopWorkspace,
        };
        const hook = (0, coderLifecycleHooks_1.createStopCoderOnArchiveHook)({
            coderService,
            shouldStopOnArchive: () => true,
            timeoutMs: 1234,
        });
        const result = await hook({
            workspaceId: "ws",
            workspaceMetadata: createSshCoderMetadata({
                runtimeConfig: {
                    type: "ssh",
                    host: "coder://",
                    srcBaseDir: "~/mux",
                    coder: { workspaceName: "mux-ws" },
                },
            }),
        });
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(getWorkspaceStatus).toHaveBeenCalledTimes(1);
        (0, bun_test_1.expect)(getWorkspaceStatus).toHaveBeenCalledWith("mux-ws", bun_test_1.expect.any(Object));
        const statusOptions = getWorkspaceStatus.mock.calls[0]?.[1];
        (0, bun_test_1.expect)(typeof statusOptions.timeoutMs).toBe("number");
        (0, bun_test_1.expect)(statusOptions.timeoutMs).toBeGreaterThan(0);
        (0, bun_test_1.expect)(stopWorkspace).toHaveBeenCalledTimes(1);
        (0, bun_test_1.expect)(stopWorkspace).toHaveBeenCalledWith("mux-ws", { timeoutMs: 1234 });
    });
});
(0, bun_test_1.describe)("createStartCoderOnUnarchiveHook", () => {
    (0, bun_test_1.it)("does nothing when stop-on-archive is disabled", async () => {
        const getWorkspaceStatus = (0, bun_test_1.mock)(() => Promise.resolve({ kind: "ok", status: "stopped" }));
        const startWorkspace = (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(undefined)));
        const coderService = {
            getWorkspaceStatus,
            startWorkspace,
        };
        const hook = (0, coderLifecycleHooks_1.createStartCoderOnUnarchiveHook)({
            coderService,
            shouldStopOnArchive: () => false,
        });
        const result = await hook({
            workspaceId: "ws",
            workspaceMetadata: createSshCoderMetadata(),
        });
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(getWorkspaceStatus).toHaveBeenCalledTimes(0);
        (0, bun_test_1.expect)(startWorkspace).toHaveBeenCalledTimes(0);
    });
    (0, bun_test_1.it)("does nothing when connected to an existing Coder workspace", async () => {
        const getWorkspaceStatus = (0, bun_test_1.mock)(() => Promise.resolve({ kind: "ok", status: "stopped" }));
        const startWorkspace = (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(undefined)));
        const coderService = {
            getWorkspaceStatus,
            startWorkspace,
        };
        const hook = (0, coderLifecycleHooks_1.createStartCoderOnUnarchiveHook)({
            coderService,
            shouldStopOnArchive: () => true,
        });
        const result = await hook({
            workspaceId: "ws",
            workspaceMetadata: createSshCoderMetadata({
                runtimeConfig: {
                    type: "ssh",
                    host: "coder://",
                    srcBaseDir: "~/mux",
                    coder: { workspaceName: "mux-ws", existingWorkspace: true },
                },
            }),
        });
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(getWorkspaceStatus).toHaveBeenCalledTimes(0);
        (0, bun_test_1.expect)(startWorkspace).toHaveBeenCalledTimes(0);
    });
    (0, bun_test_1.it)("starts a stopped dedicated Coder workspace", async () => {
        const getWorkspaceStatus = (0, bun_test_1.mock)(() => Promise.resolve({ kind: "ok", status: "stopped" }));
        const startWorkspace = (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(undefined)));
        const coderService = {
            getWorkspaceStatus,
            startWorkspace,
        };
        const hook = (0, coderLifecycleHooks_1.createStartCoderOnUnarchiveHook)({
            coderService,
            shouldStopOnArchive: () => true,
            timeoutMs: 1234,
        });
        const result = await hook({
            workspaceId: "ws",
            workspaceMetadata: createSshCoderMetadata({
                runtimeConfig: {
                    type: "ssh",
                    host: "coder://",
                    srcBaseDir: "~/mux",
                    coder: { workspaceName: "mux-ws" },
                },
            }),
        });
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(getWorkspaceStatus).toHaveBeenCalledTimes(1);
        (0, bun_test_1.expect)(getWorkspaceStatus).toHaveBeenCalledWith("mux-ws", bun_test_1.expect.any(Object));
        const statusOptions = getWorkspaceStatus.mock.calls[0]?.[1];
        (0, bun_test_1.expect)(typeof statusOptions.timeoutMs).toBe("number");
        (0, bun_test_1.expect)(statusOptions.timeoutMs).toBeGreaterThan(0);
        (0, bun_test_1.expect)(startWorkspace).toHaveBeenCalledTimes(1);
        (0, bun_test_1.expect)(startWorkspace).toHaveBeenCalledWith("mux-ws", { timeoutMs: 1234 });
    });
    (0, bun_test_1.it)("waits for stopping workspace to become stopped before starting", async () => {
        let pollCount = 0;
        const getWorkspaceStatus = (0, bun_test_1.mock)(() => {
            pollCount++;
            if (pollCount === 1) {
                return Promise.resolve({ kind: "ok", status: "stopping" });
            }
            return Promise.resolve({ kind: "ok", status: "stopped" });
        });
        const startWorkspace = (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(undefined)));
        const coderService = {
            getWorkspaceStatus,
            startWorkspace,
        };
        const hook = (0, coderLifecycleHooks_1.createStartCoderOnUnarchiveHook)({
            coderService,
            shouldStopOnArchive: () => true,
            timeoutMs: 1234,
            stoppingPollIntervalMs: 0,
            stoppingWaitTimeoutMs: 1000,
        });
        const result = await hook({
            workspaceId: "ws",
            workspaceMetadata: createSshCoderMetadata(),
        });
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(getWorkspaceStatus).toHaveBeenCalledTimes(2);
        (0, bun_test_1.expect)(startWorkspace).toHaveBeenCalledTimes(1);
        (0, bun_test_1.expect)(startWorkspace).toHaveBeenCalledWith("mux-ws", { timeoutMs: 1234 });
    });
    (0, bun_test_1.it)("does nothing when workspace is already running or starting", async () => {
        const getWorkspaceStatus = (0, bun_test_1.mock)(() => Promise.resolve({ kind: "ok", status: "running" }));
        const startWorkspace = (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(undefined)));
        const coderService = {
            getWorkspaceStatus,
            startWorkspace,
        };
        const hook = (0, coderLifecycleHooks_1.createStartCoderOnUnarchiveHook)({
            coderService,
            shouldStopOnArchive: () => true,
        });
        const result = await hook({
            workspaceId: "ws",
            workspaceMetadata: createSshCoderMetadata(),
        });
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(getWorkspaceStatus).toHaveBeenCalledTimes(1);
        (0, bun_test_1.expect)(startWorkspace).toHaveBeenCalledTimes(0);
    });
    (0, bun_test_1.it)("treats not_found status as success", async () => {
        const getWorkspaceStatus = (0, bun_test_1.mock)(() => Promise.resolve({ kind: "not_found" }));
        const startWorkspace = (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(undefined)));
        const coderService = {
            getWorkspaceStatus,
            startWorkspace,
        };
        const hook = (0, coderLifecycleHooks_1.createStartCoderOnUnarchiveHook)({
            coderService,
            shouldStopOnArchive: () => true,
        });
        const result = await hook({
            workspaceId: "ws",
            workspaceMetadata: createSshCoderMetadata(),
        });
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(getWorkspaceStatus).toHaveBeenCalledTimes(1);
        (0, bun_test_1.expect)(startWorkspace).toHaveBeenCalledTimes(0);
    });
});
//# sourceMappingURL=coderLifecycleHooks.test.js.map