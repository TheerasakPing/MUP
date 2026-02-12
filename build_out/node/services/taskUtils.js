"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.coerceNonEmptyString = coerceNonEmptyString;
exports.tryReadGitHeadCommitSha = tryReadGitHeadCommitSha;
exports.findWorkspaceEntry = findWorkspaceEntry;
exports.getTaskDepthFromConfig = getTaskDepthFromConfig;
/**
 * Small pure helpers shared by TaskService and GitPatchArtifactService.
 * Extracted to a standalone module to avoid circular imports.
 */
const strict_1 = __importDefault(require("node:assert/strict"));
const helpers_1 = require("../../node/utils/runtime/helpers");
function coerceNonEmptyString(value) {
    if (typeof value !== "string")
        return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
async function tryReadGitHeadCommitSha(runtime, workspacePath) {
    (0, strict_1.default)(workspacePath.length > 0, "tryReadGitHeadCommitSha: workspacePath must be non-empty");
    try {
        const result = await (0, helpers_1.execBuffered)(runtime, "git rev-parse HEAD", {
            cwd: workspacePath,
            timeout: 10,
        });
        if (result.exitCode !== 0) {
            return undefined;
        }
        const sha = result.stdout.trim();
        return sha.length > 0 ? sha : undefined;
    }
    catch {
        return undefined;
    }
}
function findWorkspaceEntry(config, workspaceId) {
    for (const [projectPath, project] of config.projects) {
        for (const workspace of project.workspaces) {
            if (workspace.id === workspaceId) {
                return { projectPath, workspace };
            }
        }
    }
    return null;
}
/**
 * Walk the parentWorkspaceId chain to compute task nesting depth.
 * Detects cycles (max 32 hops).
 */
function getTaskDepthFromConfig(config, workspaceId) {
    const parentById = new Map();
    for (const project of config.projects.values()) {
        for (const workspace of project.workspaces) {
            if (!workspace.id)
                continue;
            parentById.set(workspace.id, workspace.parentWorkspaceId);
        }
    }
    let depth = 0;
    let current = workspaceId;
    for (let i = 0; i < 32; i++) {
        const parent = parentById.get(current);
        if (!parent)
            break;
        depth += 1;
        current = parent;
    }
    if (depth >= 32) {
        throw new Error(`getTaskDepthFromConfig: possible parentWorkspaceId cycle starting at ${workspaceId}`);
    }
    return depth;
}
//# sourceMappingURL=taskUtils.js.map