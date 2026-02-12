"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const workspaceLifecycleHooks_1 = require("./workspaceLifecycleHooks");
const result_1 = require("../../common/types/result");
const TEST_METADATA = {
    id: "ws",
    name: "ws",
    projectName: "proj",
    projectPath: "/tmp/proj",
    runtimeConfig: { type: "local", srcBaseDir: "/tmp" },
};
(0, bun_test_1.describe)("WorkspaceLifecycleHooks", () => {
    (0, bun_test_1.it)("runs beforeArchive hooks sequentially in registration order", async () => {
        const hooks = new workspaceLifecycleHooks_1.WorkspaceLifecycleHooks();
        const calls = [];
        hooks.registerBeforeArchive(() => {
            calls.push("first");
            return Promise.resolve((0, result_1.Ok)(undefined));
        });
        hooks.registerBeforeArchive(() => {
            calls.push("second");
            return Promise.resolve((0, result_1.Ok)(undefined));
        });
        const result = await hooks.runBeforeArchive({
            workspaceId: "ws",
            workspaceMetadata: TEST_METADATA,
        });
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(calls).toEqual(["first", "second"]);
    });
    (0, bun_test_1.it)("stops running hooks after the first Err result", async () => {
        const hooks = new workspaceLifecycleHooks_1.WorkspaceLifecycleHooks();
        const calls = [];
        hooks.registerBeforeArchive(() => {
            calls.push("first");
            return Promise.resolve((0, result_1.Ok)(undefined));
        });
        hooks.registerBeforeArchive(() => {
            calls.push("second");
            return Promise.resolve((0, result_1.Err)("nope\nextra"));
        });
        hooks.registerBeforeArchive(() => {
            calls.push("third");
            return Promise.resolve((0, result_1.Ok)(undefined));
        });
        const result = await hooks.runBeforeArchive({
            workspaceId: "ws",
            workspaceMetadata: TEST_METADATA,
        });
        (0, bun_test_1.expect)(calls).toEqual(["first", "second"]);
        (0, bun_test_1.expect)(result.success).toBe(false);
        if (!result.success) {
            // Hook errors are sanitized to a single line.
            (0, bun_test_1.expect)(result.error).toBe("nope");
        }
    });
    (0, bun_test_1.it)("returns Err when a hook throws (and sanitizes the thrown message)", async () => {
        const hooks = new workspaceLifecycleHooks_1.WorkspaceLifecycleHooks();
        hooks.registerBeforeArchive(() => Promise.reject(new Error("boom\nstack")));
        const result = await hooks.runBeforeArchive({
            workspaceId: "ws",
            workspaceMetadata: TEST_METADATA,
        });
        (0, bun_test_1.expect)(result.success).toBe(false);
        if (!result.success) {
            (0, bun_test_1.expect)(result.error).toBe("beforeArchive hook threw: boom");
        }
    });
    (0, bun_test_1.it)("runs afterUnarchive hooks sequentially (best-effort) even when one returns Err", async () => {
        const hooks = new workspaceLifecycleHooks_1.WorkspaceLifecycleHooks();
        const calls = [];
        hooks.registerAfterUnarchive(() => {
            calls.push("first");
            return Promise.resolve((0, result_1.Err)("nope\nextra"));
        });
        hooks.registerAfterUnarchive(() => {
            calls.push("second");
            return Promise.resolve((0, result_1.Ok)(undefined));
        });
        await hooks.runAfterUnarchive({
            workspaceId: "ws",
            workspaceMetadata: TEST_METADATA,
        });
        (0, bun_test_1.expect)(calls).toEqual(["first", "second"]);
    });
    (0, bun_test_1.it)("swallows thrown errors from afterUnarchive hooks and continues", async () => {
        const hooks = new workspaceLifecycleHooks_1.WorkspaceLifecycleHooks();
        const calls = [];
        hooks.registerAfterUnarchive(() => {
            calls.push("first");
            return Promise.reject(new Error("boom\nstack"));
        });
        hooks.registerAfterUnarchive(() => {
            calls.push("second");
            return Promise.resolve((0, result_1.Ok)(undefined));
        });
        await hooks.runAfterUnarchive({
            workspaceId: "ws",
            workspaceMetadata: TEST_METADATA,
        });
        (0, bun_test_1.expect)(calls).toEqual(["first", "second"]);
    });
});
//# sourceMappingURL=workspaceLifecycleHooks.test.js.map