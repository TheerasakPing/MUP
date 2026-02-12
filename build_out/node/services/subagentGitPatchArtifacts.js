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
exports.getSubagentGitPatchArtifactsFilePath = getSubagentGitPatchArtifactsFilePath;
exports.getSubagentGitPatchMboxPath = getSubagentGitPatchMboxPath;
exports.readSubagentGitPatchArtifactsFile = readSubagentGitPatchArtifactsFile;
exports.readSubagentGitPatchArtifact = readSubagentGitPatchArtifact;
exports.updateSubagentGitPatchArtifactsFile = updateSubagentGitPatchArtifactsFile;
exports.upsertSubagentGitPatchArtifact = upsertSubagentGitPatchArtifact;
exports.markSubagentGitPatchArtifactApplied = markSubagentGitPatchArtifactApplied;
const fsPromises = __importStar(require("fs/promises"));
const path = __importStar(require("node:path"));
const write_file_atomic_1 = __importDefault(require("write-file-atomic"));
const log_1 = require("../../node/services/log");
const workspaceFileLocks_1 = require("../../node/utils/concurrency/workspaceFileLocks");
const SUBAGENT_GIT_PATCH_ARTIFACTS_FILE_VERSION = 1;
const SUBAGENT_GIT_PATCH_ARTIFACTS_FILE_NAME = "subagent-patches.json";
const SUBAGENT_GIT_PATCH_DIR_NAME = "subagent-patches";
const SUBAGENT_GIT_PATCH_MBOX_FILE_NAME = "series.mbox";
function getSubagentGitPatchArtifactsFilePath(workspaceSessionDir) {
    return path.join(workspaceSessionDir, SUBAGENT_GIT_PATCH_ARTIFACTS_FILE_NAME);
}
function getSubagentGitPatchMboxPath(workspaceSessionDir, childTaskId) {
    return path.join(workspaceSessionDir, SUBAGENT_GIT_PATCH_DIR_NAME, childTaskId, SUBAGENT_GIT_PATCH_MBOX_FILE_NAME);
}
async function readSubagentGitPatchArtifactsFile(workspaceSessionDir) {
    try {
        const filePath = getSubagentGitPatchArtifactsFilePath(workspaceSessionDir);
        const raw = await fsPromises.readFile(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") {
            return { version: SUBAGENT_GIT_PATCH_ARTIFACTS_FILE_VERSION, artifactsByChildTaskId: {} };
        }
        const obj = parsed;
        const version = obj.version;
        const artifactsByChildTaskId = obj.artifactsByChildTaskId;
        if (version !== SUBAGENT_GIT_PATCH_ARTIFACTS_FILE_VERSION) {
            // Unknown version; treat as empty.
            return { version: SUBAGENT_GIT_PATCH_ARTIFACTS_FILE_VERSION, artifactsByChildTaskId: {} };
        }
        if (!artifactsByChildTaskId || typeof artifactsByChildTaskId !== "object") {
            return { version: SUBAGENT_GIT_PATCH_ARTIFACTS_FILE_VERSION, artifactsByChildTaskId: {} };
        }
        return {
            version: SUBAGENT_GIT_PATCH_ARTIFACTS_FILE_VERSION,
            artifactsByChildTaskId: artifactsByChildTaskId,
        };
    }
    catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
            return { version: SUBAGENT_GIT_PATCH_ARTIFACTS_FILE_VERSION, artifactsByChildTaskId: {} };
        }
        log_1.log.error("Failed to read subagent git patch artifacts file", { error });
        return { version: SUBAGENT_GIT_PATCH_ARTIFACTS_FILE_VERSION, artifactsByChildTaskId: {} };
    }
}
async function readSubagentGitPatchArtifact(workspaceSessionDir, childTaskId) {
    const file = await readSubagentGitPatchArtifactsFile(workspaceSessionDir);
    return file.artifactsByChildTaskId[childTaskId] ?? null;
}
async function updateSubagentGitPatchArtifactsFile(params) {
    return workspaceFileLocks_1.workspaceFileLocks.withLock(params.workspaceId, async () => {
        const file = await readSubagentGitPatchArtifactsFile(params.workspaceSessionDir);
        params.update(file);
        try {
            await fsPromises.mkdir(params.workspaceSessionDir, { recursive: true });
            const filePath = getSubagentGitPatchArtifactsFilePath(params.workspaceSessionDir);
            await (0, write_file_atomic_1.default)(filePath, JSON.stringify(file, null, 2));
        }
        catch (error) {
            log_1.log.error("Failed to write subagent git patch artifacts file", { error });
        }
        return file;
    });
}
async function upsertSubagentGitPatchArtifact(params) {
    let updated = null;
    await updateSubagentGitPatchArtifactsFile({
        workspaceId: params.workspaceId,
        workspaceSessionDir: params.workspaceSessionDir,
        update: (file) => {
            const existing = file.artifactsByChildTaskId[params.childTaskId] ?? null;
            updated = params.updater(existing);
            file.artifactsByChildTaskId[params.childTaskId] = updated;
        },
    });
    if (!updated) {
        throw new Error("upsertSubagentGitPatchArtifact: updater returned no artifact");
    }
    return updated;
}
async function markSubagentGitPatchArtifactApplied(params) {
    let updated = null;
    await updateSubagentGitPatchArtifactsFile({
        workspaceId: params.workspaceId,
        workspaceSessionDir: params.workspaceSessionDir,
        update: (file) => {
            const existing = file.artifactsByChildTaskId[params.childTaskId] ?? null;
            if (!existing) {
                updated = null;
                return;
            }
            updated = {
                ...existing,
                appliedAtMs: params.appliedAtMs,
                updatedAtMs: params.appliedAtMs,
            };
            file.artifactsByChildTaskId[params.childTaskId] = updated;
        },
    });
    return updated;
}
//# sourceMappingURL=subagentGitPatchArtifacts.js.map