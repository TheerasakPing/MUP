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
const fsPromises = __importStar(require("fs/promises"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const subagentGitPatchArtifacts_1 = require("../../node/services/subagentGitPatchArtifacts");
(0, bun_test_1.describe)("subagentGitPatchArtifacts", () => {
    let testDir;
    (0, bun_test_1.beforeEach)(async () => {
        testDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "mux-subagent-git-patch-"));
    });
    (0, bun_test_1.afterEach)(async () => {
        await fsPromises.rm(testDir, { recursive: true, force: true });
    });
    (0, bun_test_1.test)("readSubagentGitPatchArtifactsFile returns empty file when missing", async () => {
        const file = await (0, subagentGitPatchArtifacts_1.readSubagentGitPatchArtifactsFile)(testDir);
        (0, bun_test_1.expect)(file.version).toBe(1);
        (0, bun_test_1.expect)(file.artifactsByChildTaskId).toEqual({});
    });
    (0, bun_test_1.test)("upsertSubagentGitPatchArtifact writes and updates artifacts", async () => {
        const workspaceId = "parent-1";
        const childTaskId = "child-1";
        const createdAtMs = Date.now();
        await (0, subagentGitPatchArtifacts_1.upsertSubagentGitPatchArtifact)({
            workspaceId,
            workspaceSessionDir: testDir,
            childTaskId,
            updater: () => ({
                childTaskId,
                parentWorkspaceId: workspaceId,
                createdAtMs,
                updatedAtMs: createdAtMs,
                status: "ready",
                commitCount: 2,
                mboxPath: "/tmp/series.mbox",
            }),
        });
        const pathOnDisk = (0, subagentGitPatchArtifacts_1.getSubagentGitPatchArtifactsFilePath)(testDir);
        await fsPromises.stat(pathOnDisk);
        const file = await (0, subagentGitPatchArtifacts_1.readSubagentGitPatchArtifactsFile)(testDir);
        const artifact = file.artifactsByChildTaskId[childTaskId];
        (0, bun_test_1.expect)(artifact).toBeTruthy();
        (0, bun_test_1.expect)(artifact?.childTaskId).toBe(childTaskId);
        (0, bun_test_1.expect)(artifact?.parentWorkspaceId).toBe(workspaceId);
        (0, bun_test_1.expect)(artifact?.createdAtMs).toBe(createdAtMs);
        (0, bun_test_1.expect)(artifact?.status).toBe("ready");
        (0, bun_test_1.expect)(artifact?.commitCount).toBe(2);
    });
    (0, bun_test_1.test)("markSubagentGitPatchArtifactApplied sets appliedAtMs", async () => {
        const workspaceId = "parent-1";
        const childTaskId = "child-1";
        const createdAtMs = Date.now();
        await (0, subagentGitPatchArtifacts_1.upsertSubagentGitPatchArtifact)({
            workspaceId,
            workspaceSessionDir: testDir,
            childTaskId,
            updater: () => ({
                childTaskId,
                parentWorkspaceId: workspaceId,
                createdAtMs,
                updatedAtMs: createdAtMs,
                status: "ready",
                commitCount: 1,
                mboxPath: "/tmp/series.mbox",
            }),
        });
        const appliedAtMs = createdAtMs + 1234;
        const updated = await (0, subagentGitPatchArtifacts_1.markSubagentGitPatchArtifactApplied)({
            workspaceId,
            workspaceSessionDir: testDir,
            childTaskId,
            appliedAtMs,
        });
        (0, bun_test_1.expect)(updated?.appliedAtMs).toBe(appliedAtMs);
        (0, bun_test_1.expect)(updated?.updatedAtMs).toBe(appliedAtMs);
        const file = await (0, subagentGitPatchArtifacts_1.readSubagentGitPatchArtifactsFile)(testDir);
        (0, bun_test_1.expect)(file.artifactsByChildTaskId[childTaskId]?.appliedAtMs).toBe(appliedAtMs);
    });
});
//# sourceMappingURL=subagentGitPatchArtifacts.test.js.map