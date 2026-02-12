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
exports.getSubagentTranscriptArtifactsFilePath = getSubagentTranscriptArtifactsFilePath;
exports.getSubagentTranscriptChatPath = getSubagentTranscriptChatPath;
exports.getSubagentTranscriptPartialPath = getSubagentTranscriptPartialPath;
exports.readSubagentTranscriptArtifactsFile = readSubagentTranscriptArtifactsFile;
exports.updateSubagentTranscriptArtifactsFile = updateSubagentTranscriptArtifactsFile;
exports.upsertSubagentTranscriptArtifactIndexEntry = upsertSubagentTranscriptArtifactIndexEntry;
const fsPromises = __importStar(require("fs/promises"));
const path = __importStar(require("node:path"));
const write_file_atomic_1 = __importDefault(require("write-file-atomic"));
const log_1 = require("../../node/services/log");
const workspaceFileLocks_1 = require("../../node/utils/concurrency/workspaceFileLocks");
const SUBAGENT_TRANSCRIPT_ARTIFACTS_FILE_VERSION = 1;
const SUBAGENT_TRANSCRIPT_ARTIFACTS_FILE_NAME = "subagent-transcripts.json";
const SUBAGENT_TRANSCRIPTS_DIR_NAME = "subagent-transcripts";
const SUBAGENT_TRANSCRIPT_CHAT_FILE_NAME = "chat.jsonl";
const SUBAGENT_TRANSCRIPT_PARTIAL_FILE_NAME = "partial.json";
function getSubagentTranscriptArtifactsFilePath(workspaceSessionDir) {
    return path.join(workspaceSessionDir, SUBAGENT_TRANSCRIPT_ARTIFACTS_FILE_NAME);
}
function getSubagentTranscriptChatPath(workspaceSessionDir, childTaskId) {
    return path.join(workspaceSessionDir, SUBAGENT_TRANSCRIPTS_DIR_NAME, childTaskId, SUBAGENT_TRANSCRIPT_CHAT_FILE_NAME);
}
function getSubagentTranscriptPartialPath(workspaceSessionDir, childTaskId) {
    return path.join(workspaceSessionDir, SUBAGENT_TRANSCRIPTS_DIR_NAME, childTaskId, SUBAGENT_TRANSCRIPT_PARTIAL_FILE_NAME);
}
async function readSubagentTranscriptArtifactsFile(workspaceSessionDir) {
    try {
        const filePath = getSubagentTranscriptArtifactsFilePath(workspaceSessionDir);
        const raw = await fsPromises.readFile(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") {
            return { version: SUBAGENT_TRANSCRIPT_ARTIFACTS_FILE_VERSION, artifactsByChildTaskId: {} };
        }
        const obj = parsed;
        if (obj.version !== SUBAGENT_TRANSCRIPT_ARTIFACTS_FILE_VERSION) {
            // Unknown version; treat as empty.
            return { version: SUBAGENT_TRANSCRIPT_ARTIFACTS_FILE_VERSION, artifactsByChildTaskId: {} };
        }
        if (!obj.artifactsByChildTaskId || typeof obj.artifactsByChildTaskId !== "object") {
            return { version: SUBAGENT_TRANSCRIPT_ARTIFACTS_FILE_VERSION, artifactsByChildTaskId: {} };
        }
        return {
            version: SUBAGENT_TRANSCRIPT_ARTIFACTS_FILE_VERSION,
            artifactsByChildTaskId: obj.artifactsByChildTaskId,
        };
    }
    catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
            return { version: SUBAGENT_TRANSCRIPT_ARTIFACTS_FILE_VERSION, artifactsByChildTaskId: {} };
        }
        log_1.log.error("Failed to read subagent transcript artifacts file", { error });
        return { version: SUBAGENT_TRANSCRIPT_ARTIFACTS_FILE_VERSION, artifactsByChildTaskId: {} };
    }
}
async function updateSubagentTranscriptArtifactsFile(params) {
    return workspaceFileLocks_1.workspaceFileLocks.withLock(params.workspaceId, async () => {
        const file = await readSubagentTranscriptArtifactsFile(params.workspaceSessionDir);
        params.update(file);
        try {
            await fsPromises.mkdir(params.workspaceSessionDir, { recursive: true });
            const filePath = getSubagentTranscriptArtifactsFilePath(params.workspaceSessionDir);
            await (0, write_file_atomic_1.default)(filePath, JSON.stringify(file, null, 2));
        }
        catch (error) {
            log_1.log.error("Failed to write subagent transcript artifacts file", { error });
        }
        return file;
    });
}
async function upsertSubagentTranscriptArtifactIndexEntry(params) {
    let updated = null;
    await updateSubagentTranscriptArtifactsFile({
        workspaceId: params.workspaceId,
        workspaceSessionDir: params.workspaceSessionDir,
        update: (file) => {
            const existing = file.artifactsByChildTaskId[params.childTaskId] ?? null;
            updated = params.updater(existing);
            file.artifactsByChildTaskId[params.childTaskId] = updated;
        },
    });
    if (!updated) {
        throw new Error("upsertSubagentTranscriptArtifactIndexEntry: updater returned no entry");
    }
    return updated;
}
//# sourceMappingURL=subagentTranscriptArtifacts.js.map