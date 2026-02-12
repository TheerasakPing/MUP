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
const runtimeHelpers = __importStar(require("../../node/utils/runtime/helpers"));
const SSHRuntime_1 = require("./SSHRuntime");
const transports_1 = require("./transports");
/**
 * SSHRuntime unit tests (run with bun test)
 *
 * Integration tests for workspace operations (renameWorkspace, deleteWorkspace, forkWorkspace,
 * worktree-based operations) require Docker and are in tests/runtime/runtime.test.ts.
 * Run with: TEST_INTEGRATION=1 bun x jest tests/runtime/runtime.test.ts
 */
(0, bun_test_1.describe)("SSHRuntime constructor", () => {
    (0, bun_test_1.it)("should accept tilde in srcBaseDir", () => {
        // Tildes are now allowed - they will be resolved via resolvePath()
        (0, bun_test_1.expect)(() => {
            const config = { host: "example.com", srcBaseDir: "~/mux" };
            new SSHRuntime_1.SSHRuntime(config, (0, transports_1.createSSHTransport)(config, false));
        }).not.toThrow();
    });
    (0, bun_test_1.it)("should accept bare tilde in srcBaseDir", () => {
        // Tildes are now allowed - they will be resolved via resolvePath()
        (0, bun_test_1.expect)(() => {
            const config = { host: "example.com", srcBaseDir: "~" };
            new SSHRuntime_1.SSHRuntime(config, (0, transports_1.createSSHTransport)(config, false));
        }).not.toThrow();
    });
    (0, bun_test_1.it)("should accept absolute paths in srcBaseDir", () => {
        (0, bun_test_1.expect)(() => {
            const config = { host: "example.com", srcBaseDir: "/home/user/mux" };
            new SSHRuntime_1.SSHRuntime(config, (0, transports_1.createSSHTransport)(config, false));
        }).not.toThrow();
    });
});
(0, bun_test_1.describe)("SSHRuntime.ensureReady repository checks", () => {
    let execBufferedSpy = null;
    let runtime;
    (0, bun_test_1.beforeEach)(() => {
        const config = { host: "example.com", srcBaseDir: "/home/user/src" };
        runtime = new SSHRuntime_1.SSHRuntime(config, (0, transports_1.createSSHTransport)(config, false), {
            projectPath: "/project",
            workspaceName: "ws",
        });
    });
    (0, bun_test_1.afterEach)(() => {
        execBufferedSpy?.mockRestore();
        execBufferedSpy = null;
    });
    (0, bun_test_1.it)("accepts worktrees where .git is a file", async () => {
        execBufferedSpy = (0, bun_test_1.spyOn)(runtimeHelpers, "execBuffered")
            .mockResolvedValueOnce({ stdout: "", stderr: "", exitCode: 0, duration: 0 })
            .mockResolvedValueOnce({ stdout: ".git", stderr: "", exitCode: 0, duration: 0 });
        const result = await runtime.ensureReady();
        (0, bun_test_1.expect)(execBufferedSpy).toHaveBeenCalledTimes(2);
        const firstCommand = execBufferedSpy?.mock.calls[0]?.[1];
        (0, bun_test_1.expect)(firstCommand).toContain("test -d");
        (0, bun_test_1.expect)(firstCommand).toContain("test -f");
        (0, bun_test_1.expect)(result).toEqual({ ready: true });
    });
    (0, bun_test_1.it)("returns runtime_not_ready when the repo is missing", async () => {
        execBufferedSpy = (0, bun_test_1.spyOn)(runtimeHelpers, "execBuffered").mockResolvedValue({
            stdout: "",
            stderr: "",
            exitCode: 1,
            duration: 0,
        });
        const result = await runtime.ensureReady();
        (0, bun_test_1.expect)(result.ready).toBe(false);
        if (!result.ready) {
            (0, bun_test_1.expect)(result.errorType).toBe("runtime_not_ready");
        }
    });
    (0, bun_test_1.it)("returns runtime_start_failed when git is unavailable", async () => {
        execBufferedSpy = (0, bun_test_1.spyOn)(runtimeHelpers, "execBuffered")
            .mockResolvedValueOnce({ stdout: "", stderr: "", exitCode: 0, duration: 0 })
            .mockResolvedValueOnce({
            stdout: "",
            stderr: "command not found",
            exitCode: 127,
            duration: 0,
        });
        const result = await runtime.ensureReady();
        (0, bun_test_1.expect)(result.ready).toBe(false);
        if (!result.ready) {
            (0, bun_test_1.expect)(result.errorType).toBe("runtime_start_failed");
        }
    });
});
(0, bun_test_1.describe)("computeBaseRepoPath", () => {
    (0, bun_test_1.it)("computes the correct bare repo path", () => {
        // computeBaseRepoPath uses getProjectName (basename) to compute:
        // <srcBaseDir>/<projectName>/.mux-base.git
        const result = (0, SSHRuntime_1.computeBaseRepoPath)("~/mux", "/Users/me/code/my-project");
        (0, bun_test_1.expect)(result).toBe("~/mux/my-project/.mux-base.git");
    });
    (0, bun_test_1.it)("handles absolute srcBaseDir", () => {
        const result = (0, SSHRuntime_1.computeBaseRepoPath)("/home/user/src", "/code/repo");
        (0, bun_test_1.expect)(result).toBe("/home/user/src/repo/.mux-base.git");
    });
});
//# sourceMappingURL=SSHRuntime.test.js.map