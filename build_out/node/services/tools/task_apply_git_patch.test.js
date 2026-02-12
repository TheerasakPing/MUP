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
const node_child_process_1 = require("node:child_process");
const task_apply_git_patch_1 = require("../../../node/services/tools/task_apply_git_patch");
const subagentGitPatchArtifacts_1 = require("../../../node/services/subagentGitPatchArtifacts");
const runtimeFactory_1 = require("../../../node/runtime/runtimeFactory");
const testHelpers_1 = require("../../../node/services/tools/testHelpers");
const mockToolCallOptions = {
    toolCallId: "test-call-id",
    messages: [],
};
function initGitRepo(repoPath) {
    (0, node_child_process_1.execSync)("git init -b main", { cwd: repoPath, stdio: "ignore" });
    (0, node_child_process_1.execSync)('git config user.email "test@example.com"', { cwd: repoPath, stdio: "ignore" });
    (0, node_child_process_1.execSync)('git config user.name "test"', { cwd: repoPath, stdio: "ignore" });
    (0, node_child_process_1.execSync)("git config commit.gpgsign false", { cwd: repoPath, stdio: "ignore" });
}
async function commitFile(repoPath, fileName, content, message) {
    await fsPromises.writeFile(path.join(repoPath, fileName), content, "utf-8");
    (0, node_child_process_1.execSync)(`git add -- ${fileName}`, { cwd: repoPath, stdio: "ignore" });
    (0, node_child_process_1.execSync)(`git commit -m ${JSON.stringify(message)}`, { cwd: repoPath, stdio: "ignore" });
}
(0, bun_test_1.describe)("task_apply_git_patch tool", () => {
    let rootDir;
    let childRepo;
    let targetRepo;
    let sessionDir;
    (0, bun_test_1.beforeEach)(async () => {
        rootDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "mux-task-apply-git-patch-"));
        childRepo = path.join(rootDir, "child");
        targetRepo = path.join(rootDir, "target");
        sessionDir = path.join(rootDir, "session");
        await fsPromises.mkdir(childRepo, { recursive: true });
        await fsPromises.mkdir(targetRepo, { recursive: true });
        await fsPromises.mkdir(sessionDir, { recursive: true });
    });
    (0, bun_test_1.afterEach)(async () => {
        await fsPromises.rm(rootDir, { recursive: true, force: true });
    });
    (0, bun_test_1.it)("applies a ready patch artifact via git am and marks it applied", async () => {
        initGitRepo(childRepo);
        initGitRepo(targetRepo);
        // Both repos start from the same base content so the patch applies cleanly.
        await commitFile(childRepo, "README.md", "hello", "base");
        await commitFile(targetRepo, "README.md", "hello", "base");
        const baseSha = (0, node_child_process_1.execSync)("git rev-parse HEAD", { cwd: childRepo, encoding: "utf-8" }).trim();
        await commitFile(childRepo, "README.md", "hello\nworld", "child change");
        const headSha = (0, node_child_process_1.execSync)("git rev-parse HEAD", { cwd: childRepo, encoding: "utf-8" }).trim();
        const childTaskId = "child-task-1";
        const workspaceId = (0, testHelpers_1.getTestDeps)().workspaceId;
        const patchPath = (0, subagentGitPatchArtifacts_1.getSubagentGitPatchMboxPath)(sessionDir, childTaskId);
        const patch = (0, node_child_process_1.execSync)(`git format-patch --stdout --binary ${baseSha}..${headSha}`, {
            cwd: childRepo,
            encoding: "buffer",
        });
        await fsPromises.mkdir(path.dirname(patchPath), { recursive: true });
        await fsPromises.writeFile(patchPath, patch);
        await (0, subagentGitPatchArtifacts_1.upsertSubagentGitPatchArtifact)({
            workspaceId,
            workspaceSessionDir: sessionDir,
            childTaskId,
            updater: () => ({
                childTaskId,
                parentWorkspaceId: workspaceId,
                createdAtMs: Date.now(),
                status: "ready",
                baseCommitSha: baseSha,
                headCommitSha: headSha,
                commitCount: 1,
                mboxPath: patchPath,
            }),
        });
        const tool = (0, task_apply_git_patch_1.createTaskApplyGitPatchTool)({
            ...(0, testHelpers_1.getTestDeps)(),
            cwd: targetRepo,
            runtime: (0, runtimeFactory_1.createRuntime)({ type: "local", srcBaseDir: "/tmp" }),
            runtimeTempDir: "/tmp",
            workspaceSessionDir: sessionDir,
        });
        const result = (await tool.execute({ task_id: childTaskId }, mockToolCallOptions));
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)((0, node_child_process_1.execSync)("git log -1 --pretty=%s", { cwd: targetRepo, encoding: "utf-8" }).trim()).toBe("child change");
        const artifact = await (0, subagentGitPatchArtifacts_1.readSubagentGitPatchArtifact)(sessionDir, childTaskId);
        (0, bun_test_1.expect)(artifact?.appliedAtMs ?? 0).toBeGreaterThan(0);
    }, 20_000);
    (0, bun_test_1.it)("replays patch artifacts from an ancestor session dir without mutating metadata", async () => {
        initGitRepo(childRepo);
        initGitRepo(targetRepo);
        // Both repos start from the same base content so the patch applies cleanly.
        await commitFile(childRepo, "README.md", "hello", "base");
        await commitFile(targetRepo, "README.md", "hello", "base");
        const baseSha = (0, node_child_process_1.execSync)("git rev-parse HEAD", { cwd: childRepo, encoding: "utf-8" }).trim();
        await commitFile(childRepo, "README.md", "hello\nworld", "child change");
        const headSha = (0, node_child_process_1.execSync)("git rev-parse HEAD", { cwd: childRepo, encoding: "utf-8" }).trim();
        const childTaskId = "child-task-1";
        const ancestorWorkspaceId = "ancestor-workspace";
        const currentWorkspaceId = "current-workspace";
        const muxSessionsDir = path.join(rootDir, "sessions");
        const ancestorSessionDir = path.join(muxSessionsDir, ancestorWorkspaceId);
        const currentSessionDir = path.join(muxSessionsDir, currentWorkspaceId);
        await fsPromises.mkdir(ancestorSessionDir, { recursive: true });
        await fsPromises.mkdir(currentSessionDir, { recursive: true });
        const patchPath = (0, subagentGitPatchArtifacts_1.getSubagentGitPatchMboxPath)(ancestorSessionDir, childTaskId);
        const patch = (0, node_child_process_1.execSync)(`git format-patch --stdout --binary ${baseSha}..${headSha}`, {
            cwd: childRepo,
            encoding: "buffer",
        });
        await fsPromises.mkdir(path.dirname(patchPath), { recursive: true });
        await fsPromises.writeFile(patchPath, patch);
        const appliedAtMs = Date.now();
        await (0, subagentGitPatchArtifacts_1.upsertSubagentGitPatchArtifact)({
            workspaceId: ancestorWorkspaceId,
            workspaceSessionDir: ancestorSessionDir,
            childTaskId,
            updater: () => ({
                childTaskId,
                parentWorkspaceId: ancestorWorkspaceId,
                createdAtMs: Date.now(),
                status: "ready",
                baseCommitSha: baseSha,
                headCommitSha: headSha,
                commitCount: 1,
                mboxPath: patchPath,
                appliedAtMs,
            }),
        });
        // Minimal config.json to allow parentWorkspaceId traversal for ancestor lookup.
        await fsPromises.writeFile(path.join(rootDir, "config.json"), JSON.stringify({
            projects: [
                [
                    "/tmp/test-project",
                    {
                        workspaces: [
                            { path: "/tmp/ancestor", id: ancestorWorkspaceId, name: "ancestor" },
                            {
                                path: "/tmp/current",
                                id: currentWorkspaceId,
                                name: "current",
                                parentWorkspaceId: ancestorWorkspaceId,
                            },
                        ],
                    },
                ],
            ],
        }, null, 2), "utf-8");
        const tool = (0, task_apply_git_patch_1.createTaskApplyGitPatchTool)({
            ...(0, testHelpers_1.getTestDeps)(),
            workspaceId: currentWorkspaceId,
            cwd: targetRepo,
            runtime: (0, runtimeFactory_1.createRuntime)({ type: "local", srcBaseDir: "/tmp" }),
            runtimeTempDir: "/tmp",
            workspaceSessionDir: currentSessionDir,
        });
        const result = (await tool.execute({ task_id: childTaskId }, mockToolCallOptions));
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)((0, node_child_process_1.execSync)("git log -1 --pretty=%s", { cwd: targetRepo, encoding: "utf-8" }).trim()).toBe("child change");
        // The replay path must never mutate the ancestor patch metadata.
        const artifact = await (0, subagentGitPatchArtifacts_1.readSubagentGitPatchArtifact)(ancestorSessionDir, childTaskId);
        (0, bun_test_1.expect)(artifact?.appliedAtMs).toBe(appliedAtMs);
        const replayArtifact = await (0, subagentGitPatchArtifacts_1.readSubagentGitPatchArtifact)(currentSessionDir, childTaskId);
        (0, bun_test_1.expect)(replayArtifact).toBeNull();
    }, 20_000);
    (0, bun_test_1.it)("supports dry_run without changing the repo or marking applied", async () => {
        initGitRepo(childRepo);
        initGitRepo(targetRepo);
        await commitFile(childRepo, "README.md", "hello", "base");
        await commitFile(targetRepo, "README.md", "hello", "base");
        const baseSha = (0, node_child_process_1.execSync)("git rev-parse HEAD", { cwd: childRepo, encoding: "utf-8" }).trim();
        await commitFile(childRepo, "README.md", "hello\nworld", "child change");
        const headSha = (0, node_child_process_1.execSync)("git rev-parse HEAD", { cwd: childRepo, encoding: "utf-8" }).trim();
        const childTaskId = "child-task-1";
        const workspaceId = (0, testHelpers_1.getTestDeps)().workspaceId;
        const patchPath = (0, subagentGitPatchArtifacts_1.getSubagentGitPatchMboxPath)(sessionDir, childTaskId);
        const patch = (0, node_child_process_1.execSync)(`git format-patch --stdout --binary ${baseSha}..${headSha}`, {
            cwd: childRepo,
            encoding: "buffer",
        });
        await fsPromises.mkdir(path.dirname(patchPath), { recursive: true });
        await fsPromises.writeFile(patchPath, patch);
        await (0, subagentGitPatchArtifacts_1.upsertSubagentGitPatchArtifact)({
            workspaceId,
            workspaceSessionDir: sessionDir,
            childTaskId,
            updater: () => ({
                childTaskId,
                parentWorkspaceId: workspaceId,
                createdAtMs: Date.now(),
                status: "ready",
                baseCommitSha: baseSha,
                headCommitSha: headSha,
                commitCount: 1,
                mboxPath: patchPath,
            }),
        });
        const tool = (0, task_apply_git_patch_1.createTaskApplyGitPatchTool)({
            ...(0, testHelpers_1.getTestDeps)(),
            cwd: targetRepo,
            runtime: (0, runtimeFactory_1.createRuntime)({ type: "local", srcBaseDir: "/tmp" }),
            runtimeTempDir: "/tmp",
            workspaceSessionDir: sessionDir,
        });
        const result = (await tool.execute({ task_id: childTaskId, dry_run: true }, mockToolCallOptions));
        (0, bun_test_1.expect)(result.success).toBe(true);
        // HEAD should remain on the base commit.
        (0, bun_test_1.expect)((0, node_child_process_1.execSync)("git log -1 --pretty=%s", { cwd: targetRepo, encoding: "utf-8" }).trim()).toBe("base");
        const artifact = await (0, subagentGitPatchArtifacts_1.readSubagentGitPatchArtifact)(sessionDir, childTaskId);
        (0, bun_test_1.expect)(artifact?.appliedAtMs).toBeUndefined();
    }, 20_000);
    (0, bun_test_1.it)("returns a clear error when the patch does not apply cleanly", async () => {
        initGitRepo(childRepo);
        initGitRepo(targetRepo);
        await commitFile(childRepo, "README.md", "hello", "base");
        await commitFile(targetRepo, "README.md", "hello", "base");
        const baseSha = (0, node_child_process_1.execSync)("git rev-parse HEAD", { cwd: childRepo, encoding: "utf-8" }).trim();
        await commitFile(childRepo, "README.md", "hello world", "child change");
        const headSha = (0, node_child_process_1.execSync)("git rev-parse HEAD", { cwd: childRepo, encoding: "utf-8" }).trim();
        // Create a conflicting change in the target repo.
        await commitFile(targetRepo, "README.md", "hello there", "target change");
        const childTaskId = "child-task-1";
        const workspaceId = (0, testHelpers_1.getTestDeps)().workspaceId;
        const patchPath = (0, subagentGitPatchArtifacts_1.getSubagentGitPatchMboxPath)(sessionDir, childTaskId);
        const patch = (0, node_child_process_1.execSync)(`git format-patch --stdout --binary ${baseSha}..${headSha}`, {
            cwd: childRepo,
            encoding: "buffer",
        });
        await fsPromises.mkdir(path.dirname(patchPath), { recursive: true });
        await fsPromises.writeFile(patchPath, patch);
        await (0, subagentGitPatchArtifacts_1.upsertSubagentGitPatchArtifact)({
            workspaceId,
            workspaceSessionDir: sessionDir,
            childTaskId,
            updater: () => ({
                childTaskId,
                parentWorkspaceId: workspaceId,
                createdAtMs: Date.now(),
                status: "ready",
                baseCommitSha: baseSha,
                headCommitSha: headSha,
                commitCount: 1,
                mboxPath: patchPath,
            }),
        });
        const tool = (0, task_apply_git_patch_1.createTaskApplyGitPatchTool)({
            ...(0, testHelpers_1.getTestDeps)(),
            cwd: targetRepo,
            runtime: (0, runtimeFactory_1.createRuntime)({ type: "local", srcBaseDir: "/tmp" }),
            runtimeTempDir: "/tmp",
            workspaceSessionDir: sessionDir,
        });
        const result = (await tool.execute({ task_id: childTaskId }, mockToolCallOptions));
        (0, bun_test_1.expect)(result.success).toBe(false);
        (0, bun_test_1.expect)(result.dryRun).toBe(false);
        (0, bun_test_1.expect)(result.failedPatchSubject).toBe("child change");
        (0, bun_test_1.expect)(result.conflictPaths ?? []).toContain("README.md");
        (0, bun_test_1.expect)(result.error).toBeTruthy();
        (0, bun_test_1.expect)(result.note).toContain("git am --continue");
        const artifact = await (0, subagentGitPatchArtifacts_1.readSubagentGitPatchArtifact)(sessionDir, childTaskId);
        (0, bun_test_1.expect)(artifact?.appliedAtMs).toBeUndefined();
    }, 20_000);
    (0, bun_test_1.it)("returns structured conflict diagnostics on dry_run failure", async () => {
        initGitRepo(childRepo);
        initGitRepo(targetRepo);
        await commitFile(childRepo, "README.md", "hello", "base");
        await commitFile(targetRepo, "README.md", "hello", "base");
        const baseSha = (0, node_child_process_1.execSync)("git rev-parse HEAD", { cwd: childRepo, encoding: "utf-8" }).trim();
        await commitFile(childRepo, "README.md", "hello world", "child change");
        const headSha = (0, node_child_process_1.execSync)("git rev-parse HEAD", { cwd: childRepo, encoding: "utf-8" }).trim();
        // Create a conflicting change in the target repo.
        await commitFile(targetRepo, "README.md", "hello there", "target change");
        const childTaskId = "child-task-1";
        const workspaceId = (0, testHelpers_1.getTestDeps)().workspaceId;
        const patchPath = (0, subagentGitPatchArtifacts_1.getSubagentGitPatchMboxPath)(sessionDir, childTaskId);
        const patch = (0, node_child_process_1.execSync)(`git format-patch --stdout --binary ${baseSha}..${headSha}`, {
            cwd: childRepo,
            encoding: "buffer",
        });
        await fsPromises.mkdir(path.dirname(patchPath), { recursive: true });
        await fsPromises.writeFile(patchPath, patch);
        await (0, subagentGitPatchArtifacts_1.upsertSubagentGitPatchArtifact)({
            workspaceId,
            workspaceSessionDir: sessionDir,
            childTaskId,
            updater: () => ({
                childTaskId,
                parentWorkspaceId: workspaceId,
                createdAtMs: Date.now(),
                status: "ready",
                baseCommitSha: baseSha,
                headCommitSha: headSha,
                commitCount: 1,
                mboxPath: patchPath,
            }),
        });
        const tool = (0, task_apply_git_patch_1.createTaskApplyGitPatchTool)({
            ...(0, testHelpers_1.getTestDeps)(),
            cwd: targetRepo,
            runtime: (0, runtimeFactory_1.createRuntime)({ type: "local", srcBaseDir: "/tmp" }),
            runtimeTempDir: "/tmp",
            workspaceSessionDir: sessionDir,
        });
        const result = (await tool.execute({ task_id: childTaskId, dry_run: true }, mockToolCallOptions));
        (0, bun_test_1.expect)(result.success).toBe(false);
        (0, bun_test_1.expect)(result.dryRun).toBe(true);
        (0, bun_test_1.expect)(result.failedPatchSubject).toBe("child change");
        (0, bun_test_1.expect)(result.conflictPaths ?? []).toContain("README.md");
        (0, bun_test_1.expect)(result.error).toBeTruthy();
        (0, bun_test_1.expect)(result.note).toContain("Dry run failed");
        // Dry run should not affect the original worktree.
        (0, bun_test_1.expect)((0, node_child_process_1.execSync)("git log -1 --pretty=%s", { cwd: targetRepo, encoding: "utf-8" }).trim()).toBe("target change");
        const artifact = await (0, subagentGitPatchArtifacts_1.readSubagentGitPatchArtifact)(sessionDir, childTaskId);
        (0, bun_test_1.expect)(artifact?.appliedAtMs).toBeUndefined();
    }, 20_000);
    (0, bun_test_1.it)("allows applying with force=true even when the working tree isn't clean", async () => {
        initGitRepo(childRepo);
        initGitRepo(targetRepo);
        await commitFile(childRepo, "README.md", "hello", "base");
        await commitFile(targetRepo, "README.md", "hello", "base");
        const baseSha = (0, node_child_process_1.execSync)("git rev-parse HEAD", { cwd: childRepo, encoding: "utf-8" }).trim();
        await commitFile(childRepo, "README.md", "hello\nworld", "child change");
        const headSha = (0, node_child_process_1.execSync)("git rev-parse HEAD", { cwd: childRepo, encoding: "utf-8" }).trim();
        const childTaskId = "child-task-1";
        const workspaceId = (0, testHelpers_1.getTestDeps)().workspaceId;
        const patchPath = (0, subagentGitPatchArtifacts_1.getSubagentGitPatchMboxPath)(sessionDir, childTaskId);
        const patch = (0, node_child_process_1.execSync)(`git format-patch --stdout --binary ${baseSha}..${headSha}`, {
            cwd: childRepo,
            encoding: "buffer",
        });
        await fsPromises.mkdir(path.dirname(patchPath), { recursive: true });
        await fsPromises.writeFile(patchPath, patch);
        await (0, subagentGitPatchArtifacts_1.upsertSubagentGitPatchArtifact)({
            workspaceId,
            workspaceSessionDir: sessionDir,
            childTaskId,
            updater: () => ({
                childTaskId,
                parentWorkspaceId: workspaceId,
                createdAtMs: Date.now(),
                status: "ready",
                baseCommitSha: baseSha,
                headCommitSha: headSha,
                commitCount: 1,
                mboxPath: patchPath,
            }),
        });
        // Make the target repo "dirty" (untracked file). This should block without force=true.
        await fsPromises.writeFile(path.join(targetRepo, "UNTRACKED.md"), "untracked", "utf-8");
        const tool = (0, task_apply_git_patch_1.createTaskApplyGitPatchTool)({
            ...(0, testHelpers_1.getTestDeps)(),
            cwd: targetRepo,
            runtime: (0, runtimeFactory_1.createRuntime)({ type: "local", srcBaseDir: "/tmp" }),
            runtimeTempDir: "/tmp",
            workspaceSessionDir: sessionDir,
        });
        const dirtyResult = (await tool.execute({ task_id: childTaskId }, mockToolCallOptions));
        (0, bun_test_1.expect)(dirtyResult.success).toBe(false);
        (0, bun_test_1.expect)(dirtyResult.error).toBe("Working tree is not clean.");
        (0, bun_test_1.expect)(dirtyResult.note).toContain("force=true");
        const forceResult = (await tool.execute({ task_id: childTaskId, force: true }, mockToolCallOptions));
        (0, bun_test_1.expect)(forceResult.success).toBe(true);
        (0, bun_test_1.expect)((0, node_child_process_1.execSync)("git log -1 --pretty=%s", { cwd: targetRepo, encoding: "utf-8" }).trim()).toBe("child change");
        const artifact = await (0, subagentGitPatchArtifacts_1.readSubagentGitPatchArtifact)(sessionDir, childTaskId);
        (0, bun_test_1.expect)(artifact?.appliedAtMs ?? 0).toBeGreaterThan(0);
    }, 20_000);
    (0, bun_test_1.it)("blocks applying when there are staged changes unless force=true", async () => {
        initGitRepo(childRepo);
        initGitRepo(targetRepo);
        // Both repos start from the same base content so the patch applies cleanly.
        await commitFile(childRepo, "README.md", "hello", "base");
        await commitFile(targetRepo, "README.md", "hello", "base");
        const baseSha = (0, node_child_process_1.execSync)("git rev-parse HEAD", { cwd: childRepo, encoding: "utf-8" }).trim();
        await commitFile(childRepo, "README.md", "hello\nworld", "child change");
        const headSha = (0, node_child_process_1.execSync)("git rev-parse HEAD", { cwd: childRepo, encoding: "utf-8" }).trim();
        const childTaskId = "child-task-1";
        const workspaceId = (0, testHelpers_1.getTestDeps)().workspaceId;
        const patchPath = (0, subagentGitPatchArtifacts_1.getSubagentGitPatchMboxPath)(sessionDir, childTaskId);
        const patch = (0, node_child_process_1.execSync)(`git format-patch --stdout --binary ${baseSha}..${headSha}`, {
            cwd: childRepo,
            encoding: "buffer",
        });
        await fsPromises.mkdir(path.dirname(patchPath), { recursive: true });
        await fsPromises.writeFile(patchPath, patch);
        await (0, subagentGitPatchArtifacts_1.upsertSubagentGitPatchArtifact)({
            workspaceId,
            workspaceSessionDir: sessionDir,
            childTaskId,
            updater: () => ({
                childTaskId,
                parentWorkspaceId: workspaceId,
                createdAtMs: Date.now(),
                status: "ready",
                baseCommitSha: baseSha,
                headCommitSha: headSha,
                commitCount: 1,
                mboxPath: patchPath,
            }),
        });
        // Stage a change in the target repo. This should block without force=true.
        await fsPromises.writeFile(path.join(targetRepo, "STAGED.md"), "staged", "utf-8");
        (0, node_child_process_1.execSync)("git add -- STAGED.md", { cwd: targetRepo, stdio: "ignore" });
        const tool = (0, task_apply_git_patch_1.createTaskApplyGitPatchTool)({
            ...(0, testHelpers_1.getTestDeps)(),
            cwd: targetRepo,
            runtime: (0, runtimeFactory_1.createRuntime)({ type: "local", srcBaseDir: "/tmp" }),
            runtimeTempDir: "/tmp",
            workspaceSessionDir: sessionDir,
        });
        const result = (await tool.execute({ task_id: childTaskId }, mockToolCallOptions));
        (0, bun_test_1.expect)(result.success).toBe(false);
        (0, bun_test_1.expect)(result.error).toBe("Working tree is not clean.");
        (0, bun_test_1.expect)(result.note).toContain("force=true");
        // The patch should not have been applied or marked applied.
        (0, bun_test_1.expect)((0, node_child_process_1.execSync)("git log -1 --pretty=%s", { cwd: targetRepo, encoding: "utf-8" }).trim()).toBe("base");
        const artifact = await (0, subagentGitPatchArtifacts_1.readSubagentGitPatchArtifact)(sessionDir, childTaskId);
        (0, bun_test_1.expect)(artifact?.appliedAtMs).toBeUndefined();
    }, 20_000);
    (0, bun_test_1.it)("ignores an unsafe mboxPath in artifact metadata", async () => {
        initGitRepo(childRepo);
        initGitRepo(targetRepo);
        // Both repos start from the same base content so the patch applies cleanly.
        await commitFile(childRepo, "README.md", "hello", "base");
        await commitFile(targetRepo, "README.md", "hello", "base");
        const baseSha = (0, node_child_process_1.execSync)("git rev-parse HEAD", { cwd: childRepo, encoding: "utf-8" }).trim();
        await commitFile(childRepo, "README.md", "hello\nworld", "child change");
        const headSha = (0, node_child_process_1.execSync)("git rev-parse HEAD", { cwd: childRepo, encoding: "utf-8" }).trim();
        const childTaskId = "child-task-1";
        const workspaceId = (0, testHelpers_1.getTestDeps)().workspaceId;
        const patchPath = (0, subagentGitPatchArtifacts_1.getSubagentGitPatchMboxPath)(sessionDir, childTaskId);
        const patch = (0, node_child_process_1.execSync)(`git format-patch --stdout --binary ${baseSha}..${headSha}`, {
            cwd: childRepo,
            encoding: "buffer",
        });
        await fsPromises.mkdir(path.dirname(patchPath), { recursive: true });
        await fsPromises.writeFile(patchPath, patch);
        // Simulate corrupted metadata pointing outside the session dir.
        const unsafePath = path.join(rootDir, "outside-session.mbox");
        await (0, subagentGitPatchArtifacts_1.upsertSubagentGitPatchArtifact)({
            workspaceId,
            workspaceSessionDir: sessionDir,
            childTaskId,
            updater: () => ({
                childTaskId,
                parentWorkspaceId: workspaceId,
                createdAtMs: Date.now(),
                status: "ready",
                baseCommitSha: baseSha,
                headCommitSha: headSha,
                commitCount: 1,
                mboxPath: unsafePath,
            }),
        });
        const tool = (0, task_apply_git_patch_1.createTaskApplyGitPatchTool)({
            ...(0, testHelpers_1.getTestDeps)(),
            cwd: targetRepo,
            runtime: (0, runtimeFactory_1.createRuntime)({ type: "local", srcBaseDir: "/tmp" }),
            runtimeTempDir: "/tmp",
            workspaceSessionDir: sessionDir,
        });
        const result = (await tool.execute({ task_id: childTaskId }, mockToolCallOptions));
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(result.note).toContain("Ignoring unsafe mboxPath");
    }, 20_000);
    (0, bun_test_1.it)("returns clear errors for non-ready patch artifact statuses", async () => {
        const childTaskId = "child-task-1";
        const workspaceId = (0, testHelpers_1.getTestDeps)().workspaceId;
        const tool = (0, task_apply_git_patch_1.createTaskApplyGitPatchTool)({
            ...(0, testHelpers_1.getTestDeps)(),
            cwd: rootDir,
            runtime: (0, runtimeFactory_1.createRuntime)({ type: "local", srcBaseDir: "/tmp" }),
            runtimeTempDir: "/tmp",
            workspaceSessionDir: sessionDir,
        });
        await (0, subagentGitPatchArtifacts_1.upsertSubagentGitPatchArtifact)({
            workspaceId,
            workspaceSessionDir: sessionDir,
            childTaskId,
            updater: () => ({
                childTaskId,
                parentWorkspaceId: workspaceId,
                createdAtMs: Date.now(),
                status: "pending",
            }),
        });
        const pendingResult = (await tool.execute({ task_id: childTaskId }, mockToolCallOptions));
        (0, bun_test_1.expect)(pendingResult.success).toBe(false);
        (0, bun_test_1.expect)(pendingResult.error).toContain("pending");
        await (0, subagentGitPatchArtifacts_1.upsertSubagentGitPatchArtifact)({
            workspaceId,
            workspaceSessionDir: sessionDir,
            childTaskId,
            updater: () => ({
                childTaskId,
                parentWorkspaceId: workspaceId,
                createdAtMs: Date.now(),
                status: "failed",
                error: "boom",
            }),
        });
        const failedResult = (await tool.execute({ task_id: childTaskId }, mockToolCallOptions));
        (0, bun_test_1.expect)(failedResult.success).toBe(false);
        (0, bun_test_1.expect)(failedResult.error).toContain("boom");
        await (0, subagentGitPatchArtifacts_1.upsertSubagentGitPatchArtifact)({
            workspaceId,
            workspaceSessionDir: sessionDir,
            childTaskId,
            updater: () => ({
                childTaskId,
                parentWorkspaceId: workspaceId,
                createdAtMs: Date.now(),
                status: "skipped",
            }),
        });
        const skippedResult = (await tool.execute({ task_id: childTaskId }, mockToolCallOptions));
        (0, bun_test_1.expect)(skippedResult.success).toBe(false);
        (0, bun_test_1.expect)(skippedResult.error).toContain("skipped");
    });
    (0, bun_test_1.it)("refuses to apply an already-applied patch unless force=true", async () => {
        const childTaskId = "child-task-1";
        const workspaceId = (0, testHelpers_1.getTestDeps)().workspaceId;
        await (0, subagentGitPatchArtifacts_1.upsertSubagentGitPatchArtifact)({
            workspaceId,
            workspaceSessionDir: sessionDir,
            childTaskId,
            updater: () => ({
                childTaskId,
                parentWorkspaceId: workspaceId,
                createdAtMs: Date.now(),
                status: "ready",
                appliedAtMs: Date.now(),
            }),
        });
        const tool = (0, task_apply_git_patch_1.createTaskApplyGitPatchTool)({
            ...(0, testHelpers_1.getTestDeps)(),
            cwd: rootDir,
            runtime: (0, runtimeFactory_1.createRuntime)({ type: "local", srcBaseDir: "/tmp" }),
            runtimeTempDir: "/tmp",
            workspaceSessionDir: sessionDir,
        });
        const result = (await tool.execute({ task_id: childTaskId }, mockToolCallOptions));
        (0, bun_test_1.expect)(result.success).toBe(false);
        (0, bun_test_1.expect)(result.error).toContain("Patch already applied");
        (0, bun_test_1.expect)(result.note).toContain("force=true");
    });
});
//# sourceMappingURL=task_apply_git_patch.test.js.map