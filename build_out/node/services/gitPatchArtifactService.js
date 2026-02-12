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
exports.GitPatchArtifactService = void 0;
const path = __importStar(require("node:path"));
const strict_1 = __importDefault(require("node:assert/strict"));
const fsPromises = __importStar(require("fs/promises"));
const taskUtils_1 = require("../../node/services/taskUtils");
const log_1 = require("../../node/services/log");
const agentDefinitionsService_1 = require("../../node/services/agentDefinitions/agentDefinitionsService");
const resolveAgentInheritanceChain_1 = require("../../node/services/agentDefinitions/resolveAgentInheritanceChain");
const agentTools_1 = require("../../common/utils/agentTools");
const runtimeHelpers_1 = require("../../node/runtime/runtimeHelpers");
const helpers_1 = require("../../node/utils/runtime/helpers");
const schemas_1 = require("../../common/orpc/schemas");
const subagentGitPatchArtifacts_1 = require("../../node/services/subagentGitPatchArtifacts");
const shell_1 = require("../../common/utils/shell");
const streamUtils_1 = require("../../node/runtime/streamUtils");
async function writeReadableStreamToLocalFile(stream, filePath) {
    (0, strict_1.default)(filePath.length > 0, "writeReadableStreamToLocalFile: filePath must be non-empty");
    await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
    const fileHandle = await fsPromises.open(filePath, "w");
    try {
        const reader = stream.getReader();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                if (value) {
                    await fileHandle.write(value);
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
    finally {
        await fileHandle.close();
    }
}
// ---------------------------------------------------------------------------
// GitPatchArtifactService
// ---------------------------------------------------------------------------
/**
 * Handles git-format-patch artifact generation for subagent tasks.
 *
 * Extracted from TaskService to keep patch-specific logic self-contained.
 */
class GitPatchArtifactService {
    config;
    pendingJobsByTaskId = new Map();
    constructor(config) {
        this.config = config;
    }
    /**
     * If the child workspace is an exec-like agent, write a pending patch artifact
     * marker and kick off background `git format-patch` generation.
     *
     * @param onComplete - called after generation finishes (success *or* failure),
     *   typically used to trigger reported-leaf-task cleanup.
     */
    async maybeStartGeneration(parentWorkspaceId, childWorkspaceId, onComplete) {
        (0, strict_1.default)(parentWorkspaceId.length > 0, "maybeStartGeneration: parentWorkspaceId must be non-empty");
        (0, strict_1.default)(childWorkspaceId.length > 0, "maybeStartGeneration: childWorkspaceId must be non-empty");
        const parentSessionDir = this.config.getSessionDir(parentWorkspaceId);
        // Write a pending marker before we attempt cleanup, so the reported task workspace isn't deleted
        // while we're still reading commits from it.
        const nowMs = Date.now();
        const cfg = this.config.loadConfigOrDefault();
        const childEntry = (0, taskUtils_1.findWorkspaceEntry)(cfg, childWorkspaceId);
        // Only exec-like subagents are expected to make commits that should be handed back to the parent.
        // NOTE: Custom agents can inherit from exec (base: exec). Those should also generate patches,
        // but read-only subagents (e.g. explore) should not.
        const childAgentIdRaw = (0, taskUtils_1.coerceNonEmptyString)(childEntry?.workspace.agentId ?? childEntry?.workspace.agentType);
        const childAgentId = childAgentIdRaw?.toLowerCase();
        if (!childAgentId) {
            return;
        }
        let shouldGeneratePatch = childAgentId === "exec";
        if (!shouldGeneratePatch) {
            const parsedChildAgentId = schemas_1.AgentIdSchema.safeParse(childAgentId);
            if (parsedChildAgentId.success) {
                const agentId = parsedChildAgentId.data;
                // Prefer resolving agent inheritance from the parent workspace: project agents may be untracked
                // (and therefore absent from child worktrees), but they are always present in the parent that
                // spawned the task.
                const agentDiscoveryEntry = (0, taskUtils_1.findWorkspaceEntry)(cfg, parentWorkspaceId) ?? childEntry;
                const agentDiscoveryWs = agentDiscoveryEntry?.workspace;
                const agentWorkspacePath = (0, taskUtils_1.coerceNonEmptyString)(agentDiscoveryWs?.path);
                const runtimeConfig = agentDiscoveryWs?.runtimeConfig;
                if (agentDiscoveryEntry && agentWorkspacePath && runtimeConfig) {
                    const fallbackName = agentWorkspacePath.split("/").pop() ?? agentWorkspacePath.split("\\").pop() ?? "";
                    const workspaceName = (0, taskUtils_1.coerceNonEmptyString)(agentDiscoveryWs?.name) ?? (0, taskUtils_1.coerceNonEmptyString)(fallbackName);
                    if (workspaceName) {
                        const runtime = (0, runtimeHelpers_1.createRuntimeForWorkspace)({
                            runtimeConfig,
                            projectPath: agentDiscoveryEntry.projectPath,
                            name: workspaceName,
                        });
                        try {
                            const agentDefinition = await (0, agentDefinitionsService_1.readAgentDefinition)(runtime, agentWorkspacePath, agentId);
                            const chain = await (0, resolveAgentInheritanceChain_1.resolveAgentInheritanceChain)({
                                runtime,
                                workspacePath: agentWorkspacePath,
                                agentId,
                                agentDefinition,
                                workspaceId: childWorkspaceId,
                            });
                            shouldGeneratePatch = (0, agentTools_1.isExecLikeEditingCapableInResolvedChain)(chain);
                        }
                        catch {
                            // ignore - treat as non-exec-like
                        }
                    }
                }
            }
        }
        if (!shouldGeneratePatch) {
            return;
        }
        const baseCommitSha = (0, taskUtils_1.coerceNonEmptyString)(childEntry?.workspace.taskBaseCommitSha) ?? undefined;
        const artifact = await (0, subagentGitPatchArtifacts_1.upsertSubagentGitPatchArtifact)({
            workspaceId: parentWorkspaceId,
            workspaceSessionDir: parentSessionDir,
            childTaskId: childWorkspaceId,
            updater: (existing) => {
                if (existing && existing.status !== "pending") {
                    return existing;
                }
                return {
                    ...(existing ?? {}),
                    childTaskId: childWorkspaceId,
                    parentWorkspaceId,
                    createdAtMs: existing?.createdAtMs ?? nowMs,
                    updatedAtMs: nowMs,
                    status: "pending",
                    baseCommitSha: baseCommitSha ?? existing?.baseCommitSha,
                };
            },
        });
        if (artifact.status !== "pending") {
            return;
        }
        if (this.pendingJobsByTaskId.has(childWorkspaceId)) {
            return;
        }
        let job;
        try {
            job = this.generate(parentWorkspaceId, childWorkspaceId, onComplete)
                .catch(async (error) => {
                log_1.log.error("Subagent git patch generation failed", {
                    parentWorkspaceId,
                    childWorkspaceId,
                    error,
                });
                // Best-effort: if generation failed before it could update the artifact status,
                // mark it failed so the parent isn't blocked forever by a pending marker.
                try {
                    await (0, subagentGitPatchArtifacts_1.upsertSubagentGitPatchArtifact)({
                        workspaceId: parentWorkspaceId,
                        workspaceSessionDir: parentSessionDir,
                        childTaskId: childWorkspaceId,
                        updater: (existing) => {
                            if (existing && existing.status !== "pending") {
                                return existing;
                            }
                            const failedAtMs = Date.now();
                            return {
                                ...(existing ?? {}),
                                childTaskId: childWorkspaceId,
                                parentWorkspaceId,
                                createdAtMs: existing?.createdAtMs ?? failedAtMs,
                                updatedAtMs: failedAtMs,
                                status: "failed",
                                error: error instanceof Error ? error.message : String(error),
                            };
                        },
                    });
                }
                catch (updateError) {
                    log_1.log.error("Failed to mark subagent git patch artifact as failed", {
                        parentWorkspaceId,
                        childWorkspaceId,
                        error: updateError,
                    });
                }
            })
                .finally(() => {
                this.pendingJobsByTaskId.delete(childWorkspaceId);
            });
        }
        catch (error) {
            // If scheduling fails synchronously, don't leave the artifact stuck in `pending`.
            await (0, subagentGitPatchArtifacts_1.upsertSubagentGitPatchArtifact)({
                workspaceId: parentWorkspaceId,
                workspaceSessionDir: parentSessionDir,
                childTaskId: childWorkspaceId,
                updater: (existing) => {
                    if (existing && existing.status !== "pending") {
                        return existing;
                    }
                    const failedAtMs = Date.now();
                    return {
                        ...(existing ?? {}),
                        childTaskId: childWorkspaceId,
                        parentWorkspaceId,
                        createdAtMs: existing?.createdAtMs ?? failedAtMs,
                        updatedAtMs: failedAtMs,
                        status: "failed",
                        error: error instanceof Error ? error.message : String(error),
                    };
                },
            });
            return;
        }
        this.pendingJobsByTaskId.set(childWorkspaceId, job);
    }
    async generate(parentWorkspaceId, childWorkspaceId, onComplete) {
        (0, strict_1.default)(parentWorkspaceId.length > 0, "generate: parentWorkspaceId must be non-empty");
        (0, strict_1.default)(childWorkspaceId.length > 0, "generate: childWorkspaceId must be non-empty");
        const parentSessionDir = this.config.getSessionDir(parentWorkspaceId);
        const updateArtifact = async (updater) => {
            await (0, subagentGitPatchArtifacts_1.upsertSubagentGitPatchArtifact)({
                workspaceId: parentWorkspaceId,
                workspaceSessionDir: parentSessionDir,
                childTaskId: childWorkspaceId,
                updater,
            });
        };
        const nowMs = Date.now();
        try {
            const cfg = this.config.loadConfigOrDefault();
            const entry = (0, taskUtils_1.findWorkspaceEntry)(cfg, childWorkspaceId);
            if (!entry) {
                await updateArtifact((existing) => ({
                    ...(existing ?? {}),
                    childTaskId: childWorkspaceId,
                    parentWorkspaceId,
                    createdAtMs: existing?.createdAtMs ?? nowMs,
                    updatedAtMs: nowMs,
                    status: "failed",
                    error: "Task workspace not found in config.",
                }));
                return;
            }
            const ws = entry.workspace;
            const workspacePath = (0, taskUtils_1.coerceNonEmptyString)(ws.path);
            if (!workspacePath) {
                await updateArtifact((existing) => ({
                    ...(existing ?? {}),
                    childTaskId: childWorkspaceId,
                    parentWorkspaceId,
                    createdAtMs: existing?.createdAtMs ?? nowMs,
                    updatedAtMs: nowMs,
                    status: "failed",
                    error: "Task workspace path missing.",
                }));
                return;
            }
            if (!ws.runtimeConfig) {
                await updateArtifact((existing) => ({
                    ...(existing ?? {}),
                    childTaskId: childWorkspaceId,
                    parentWorkspaceId,
                    createdAtMs: existing?.createdAtMs ?? nowMs,
                    updatedAtMs: nowMs,
                    status: "failed",
                    error: "Task runtimeConfig missing.",
                }));
                return;
            }
            const fallbackName = workspacePath.split("/").pop() ?? workspacePath.split("\\").pop() ?? "";
            const workspaceName = (0, taskUtils_1.coerceNonEmptyString)(ws.name) ?? (0, taskUtils_1.coerceNonEmptyString)(fallbackName);
            if (!workspaceName) {
                await updateArtifact((existing) => ({
                    ...(existing ?? {}),
                    childTaskId: childWorkspaceId,
                    parentWorkspaceId,
                    createdAtMs: existing?.createdAtMs ?? nowMs,
                    updatedAtMs: nowMs,
                    status: "failed",
                    error: "Task workspace name missing.",
                }));
                return;
            }
            const runtime = (0, runtimeHelpers_1.createRuntimeForWorkspace)({
                runtimeConfig: ws.runtimeConfig,
                projectPath: entry.projectPath,
                name: workspaceName,
            });
            let baseCommitSha = (0, taskUtils_1.coerceNonEmptyString)(ws.taskBaseCommitSha);
            if (!baseCommitSha) {
                const trunkBranch = (0, taskUtils_1.coerceNonEmptyString)(ws.taskTrunkBranch) ??
                    (0, taskUtils_1.coerceNonEmptyString)((0, taskUtils_1.findWorkspaceEntry)(cfg, parentWorkspaceId)?.workspace.name);
                if (!trunkBranch) {
                    await updateArtifact((existing) => ({
                        ...(existing ?? {}),
                        childTaskId: childWorkspaceId,
                        parentWorkspaceId,
                        createdAtMs: existing?.createdAtMs ?? nowMs,
                        updatedAtMs: nowMs,
                        status: "failed",
                        error: "taskBaseCommitSha missing and could not determine trunk branch for merge-base fallback.",
                    }));
                    return;
                }
                const mergeBaseResult = await (0, helpers_1.execBuffered)(runtime, `git merge-base ${(0, shell_1.shellQuote)(trunkBranch)} HEAD`, { cwd: workspacePath, timeout: 30 });
                if (mergeBaseResult.exitCode !== 0) {
                    await updateArtifact((existing) => ({
                        ...(existing ?? {}),
                        childTaskId: childWorkspaceId,
                        parentWorkspaceId,
                        createdAtMs: existing?.createdAtMs ?? nowMs,
                        updatedAtMs: nowMs,
                        status: "failed",
                        error: `git merge-base failed: ${mergeBaseResult.stderr.trim() || "unknown error"}`,
                    }));
                    return;
                }
                baseCommitSha = mergeBaseResult.stdout.trim();
            }
            const headCommitSha = await (0, taskUtils_1.tryReadGitHeadCommitSha)(runtime, workspacePath);
            if (!headCommitSha) {
                await updateArtifact((existing) => ({
                    ...(existing ?? {}),
                    childTaskId: childWorkspaceId,
                    parentWorkspaceId,
                    createdAtMs: existing?.createdAtMs ?? nowMs,
                    updatedAtMs: nowMs,
                    status: "failed",
                    error: "git rev-parse HEAD failed.",
                }));
                return;
            }
            const countResult = await (0, helpers_1.execBuffered)(runtime, `git rev-list --count ${baseCommitSha}..${headCommitSha}`, { cwd: workspacePath, timeout: 30 });
            if (countResult.exitCode !== 0) {
                await updateArtifact((existing) => ({
                    ...(existing ?? {}),
                    childTaskId: childWorkspaceId,
                    parentWorkspaceId,
                    createdAtMs: existing?.createdAtMs ?? nowMs,
                    updatedAtMs: nowMs,
                    status: "failed",
                    baseCommitSha,
                    headCommitSha,
                    error: `git rev-list failed: ${countResult.stderr.trim() || "unknown error"}`,
                }));
                return;
            }
            const commitCount = Number.parseInt(countResult.stdout.trim(), 10);
            if (!Number.isFinite(commitCount) || commitCount < 0) {
                await updateArtifact((existing) => ({
                    ...(existing ?? {}),
                    childTaskId: childWorkspaceId,
                    parentWorkspaceId,
                    createdAtMs: existing?.createdAtMs ?? nowMs,
                    updatedAtMs: nowMs,
                    status: "failed",
                    baseCommitSha,
                    headCommitSha,
                    error: `Invalid commit count: ${countResult.stdout.trim()}`,
                }));
                return;
            }
            if (commitCount === 0) {
                await updateArtifact((existing) => ({
                    ...(existing ?? {}),
                    childTaskId: childWorkspaceId,
                    parentWorkspaceId,
                    createdAtMs: existing?.createdAtMs ?? nowMs,
                    updatedAtMs: nowMs,
                    status: "skipped",
                    baseCommitSha,
                    headCommitSha,
                    commitCount,
                    error: undefined,
                }));
                return;
            }
            const patchPath = (0, subagentGitPatchArtifacts_1.getSubagentGitPatchMboxPath)(parentSessionDir, childWorkspaceId);
            const formatPatchStream = await runtime.exec(`git format-patch --stdout --binary ${baseCommitSha}..${headCommitSha}`, { cwd: workspacePath, timeout: 120 });
            await formatPatchStream.stdin.close();
            const stderrPromise = (0, streamUtils_1.streamToString)(formatPatchStream.stderr);
            const writePromise = writeReadableStreamToLocalFile(formatPatchStream.stdout, patchPath);
            const [exitCode, stderr] = await Promise.all([
                formatPatchStream.exitCode,
                stderrPromise,
                writePromise,
            ]);
            if (exitCode !== 0) {
                // Leave no half-written patches around.
                await fsPromises.rm(patchPath, { force: true });
                await updateArtifact((existing) => ({
                    ...(existing ?? {}),
                    childTaskId: childWorkspaceId,
                    parentWorkspaceId,
                    createdAtMs: existing?.createdAtMs ?? nowMs,
                    updatedAtMs: Date.now(),
                    status: "failed",
                    baseCommitSha,
                    headCommitSha,
                    commitCount,
                    error: `git format-patch failed (exitCode=${exitCode}): ${stderr.trim() || "unknown error"}`,
                }));
                return;
            }
            await updateArtifact((existing) => ({
                ...(existing ?? {}),
                childTaskId: childWorkspaceId,
                parentWorkspaceId,
                createdAtMs: existing?.createdAtMs ?? nowMs,
                updatedAtMs: Date.now(),
                status: "ready",
                baseCommitSha,
                headCommitSha,
                commitCount,
                mboxPath: patchPath,
                error: undefined,
            }));
        }
        catch (error) {
            await updateArtifact((existing) => ({
                ...(existing ?? {}),
                childTaskId: childWorkspaceId,
                parentWorkspaceId,
                createdAtMs: existing?.createdAtMs ?? nowMs,
                updatedAtMs: Date.now(),
                status: "failed",
                error: error instanceof Error ? error.message : String(error),
            }));
        }
        finally {
            // Unblock auto-cleanup once the patch generation attempt has finished.
            await onComplete(childWorkspaceId);
        }
    }
}
exports.GitPatchArtifactService = GitPatchArtifactService;
//# sourceMappingURL=gitPatchArtifactService.js.map