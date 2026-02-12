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
exports.getSubagentReportArtifactsFilePath = getSubagentReportArtifactsFilePath;
exports.getSubagentReportArtifactPath = getSubagentReportArtifactPath;
exports.readSubagentReportArtifactsFile = readSubagentReportArtifactsFile;
exports.readSubagentReportArtifactIndexEntry = readSubagentReportArtifactIndexEntry;
exports.readSubagentReportArtifact = readSubagentReportArtifact;
exports.updateSubagentReportArtifactsFile = updateSubagentReportArtifactsFile;
exports.upsertSubagentReportArtifact = upsertSubagentReportArtifact;
const fsPromises = __importStar(require("fs/promises"));
const path = __importStar(require("node:path"));
const write_file_atomic_1 = __importDefault(require("write-file-atomic"));
const thinking_1 = require("../../common/types/thinking");
const log_1 = require("../../node/services/log");
const workspaceFileLocks_1 = require("../../node/utils/concurrency/workspaceFileLocks");
const SUBAGENT_REPORT_ARTIFACTS_FILE_VERSION = 1;
const SUBAGENT_REPORT_ARTIFACTS_FILE_NAME = "subagent-reports.json";
const SUBAGENT_REPORT_DIR_NAME = "subagent-reports";
const SUBAGENT_REPORT_FILE_NAME = "report.json";
function isStringArray(value) {
    return Array.isArray(value) && value.every((v) => typeof v === "string");
}
function getSubagentReportArtifactsFilePath(workspaceSessionDir) {
    return path.join(workspaceSessionDir, SUBAGENT_REPORT_ARTIFACTS_FILE_NAME);
}
function getSubagentReportArtifactPath(workspaceSessionDir, childTaskId) {
    return path.join(workspaceSessionDir, SUBAGENT_REPORT_DIR_NAME, childTaskId, SUBAGENT_REPORT_FILE_NAME);
}
async function readSubagentReportArtifactsFile(workspaceSessionDir) {
    try {
        const filePath = getSubagentReportArtifactsFilePath(workspaceSessionDir);
        const raw = await fsPromises.readFile(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") {
            return { version: SUBAGENT_REPORT_ARTIFACTS_FILE_VERSION, artifactsByChildTaskId: {} };
        }
        const obj = parsed;
        if (obj.version !== SUBAGENT_REPORT_ARTIFACTS_FILE_VERSION) {
            // Unknown version; treat as empty.
            return { version: SUBAGENT_REPORT_ARTIFACTS_FILE_VERSION, artifactsByChildTaskId: {} };
        }
        if (!obj.artifactsByChildTaskId || typeof obj.artifactsByChildTaskId !== "object") {
            return { version: SUBAGENT_REPORT_ARTIFACTS_FILE_VERSION, artifactsByChildTaskId: {} };
        }
        return {
            version: SUBAGENT_REPORT_ARTIFACTS_FILE_VERSION,
            artifactsByChildTaskId: obj.artifactsByChildTaskId,
        };
    }
    catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
            return { version: SUBAGENT_REPORT_ARTIFACTS_FILE_VERSION, artifactsByChildTaskId: {} };
        }
        log_1.log.error("Failed to read subagent report artifacts file", { error });
        return { version: SUBAGENT_REPORT_ARTIFACTS_FILE_VERSION, artifactsByChildTaskId: {} };
    }
}
async function readSubagentReportArtifactIndexEntry(workspaceSessionDir, childTaskId) {
    const file = await readSubagentReportArtifactsFile(workspaceSessionDir);
    return file.artifactsByChildTaskId[childTaskId] ?? null;
}
async function readSubagentReportArtifact(workspaceSessionDir, childTaskId) {
    const meta = await readSubagentReportArtifactIndexEntry(workspaceSessionDir, childTaskId);
    const reportPath = getSubagentReportArtifactPath(workspaceSessionDir, childTaskId);
    try {
        const raw = await fsPromises.readFile(reportPath, "utf-8");
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") {
            return null;
        }
        const obj = parsed;
        const reportMarkdown = typeof obj.reportMarkdown === "string" ? obj.reportMarkdown : null;
        if (!reportMarkdown || reportMarkdown.length === 0) {
            return null;
        }
        const title = typeof obj.title === "string" ? obj.title : undefined;
        const model = typeof obj.model === "string" && obj.model.trim().length > 0 ? obj.model.trim() : undefined;
        const thinkingLevel = (0, thinking_1.coerceThinkingLevel)(obj.thinkingLevel);
        if (meta) {
            // Trust the index file for metadata (versioned), but allow per-task file to override title.
            return {
                ...meta,
                model: typeof meta.model === "string" && meta.model.trim().length > 0
                    ? meta.model.trim()
                    : undefined,
                thinkingLevel: (0, thinking_1.coerceThinkingLevel)(meta.thinkingLevel),
                title: title ?? meta.title,
                reportMarkdown,
            };
        }
        // Self-healing: if the index entry is missing/corrupted, fall back to the per-task artifact.
        const parentWorkspaceId = typeof obj.parentWorkspaceId === "string" ? obj.parentWorkspaceId : null;
        const createdAtMs = typeof obj.createdAtMs === "number" ? obj.createdAtMs : null;
        const updatedAtMs = typeof obj.updatedAtMs === "number" ? obj.updatedAtMs : null;
        const ancestorWorkspaceIds = isStringArray(obj.ancestorWorkspaceIds)
            ? obj.ancestorWorkspaceIds
            : null;
        if (!parentWorkspaceId || !createdAtMs || !updatedAtMs || !ancestorWorkspaceIds) {
            return null;
        }
        return {
            childTaskId,
            parentWorkspaceId,
            createdAtMs,
            updatedAtMs,
            model,
            thinkingLevel,
            title,
            ancestorWorkspaceIds,
            reportMarkdown,
        };
    }
    catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
            return null;
        }
        log_1.log.error("Failed to read subagent report artifact", { childTaskId, error });
        return null;
    }
}
async function updateSubagentReportArtifactsFile(params) {
    return workspaceFileLocks_1.workspaceFileLocks.withLock(params.workspaceId, async () => {
        const file = await readSubagentReportArtifactsFile(params.workspaceSessionDir);
        params.update(file);
        try {
            await fsPromises.mkdir(params.workspaceSessionDir, { recursive: true });
            const filePath = getSubagentReportArtifactsFilePath(params.workspaceSessionDir);
            await (0, write_file_atomic_1.default)(filePath, JSON.stringify(file, null, 2));
        }
        catch (error) {
            log_1.log.error("Failed to write subagent report artifacts file", { error });
        }
        return file;
    });
}
async function upsertSubagentReportArtifact(params) {
    let updated = null;
    await workspaceFileLocks_1.workspaceFileLocks.withLock(params.workspaceId, async () => {
        const nowMs = params.nowMs ?? Date.now();
        const model = typeof params.model === "string" && params.model.trim().length > 0
            ? params.model.trim()
            : undefined;
        const thinkingLevel = (0, thinking_1.coerceThinkingLevel)(params.thinkingLevel);
        const file = await readSubagentReportArtifactsFile(params.workspaceSessionDir);
        const existing = file.artifactsByChildTaskId[params.childTaskId] ?? null;
        const createdAtMs = existing?.createdAtMs ?? nowMs;
        // Write the report payload first so we never publish an index entry without a report body.
        const reportPath = getSubagentReportArtifactPath(params.workspaceSessionDir, params.childTaskId);
        try {
            await fsPromises.mkdir(path.dirname(reportPath), { recursive: true });
            await (0, write_file_atomic_1.default)(reportPath, JSON.stringify({
                childTaskId: params.childTaskId,
                parentWorkspaceId: params.parentWorkspaceId,
                createdAtMs,
                updatedAtMs: nowMs,
                model,
                thinkingLevel,
                title: params.title,
                ancestorWorkspaceIds: params.ancestorWorkspaceIds,
                reportMarkdown: params.reportMarkdown,
            }, null, 2));
        }
        catch (error) {
            log_1.log.error("Failed to write subagent report artifact", {
                workspaceId: params.workspaceId,
                childTaskId: params.childTaskId,
                error,
            });
            return;
        }
        updated = {
            childTaskId: params.childTaskId,
            parentWorkspaceId: params.parentWorkspaceId,
            createdAtMs,
            updatedAtMs: nowMs,
            model,
            thinkingLevel,
            title: params.title,
            ancestorWorkspaceIds: params.ancestorWorkspaceIds,
        };
        file.artifactsByChildTaskId[params.childTaskId] = updated;
        try {
            await fsPromises.mkdir(params.workspaceSessionDir, { recursive: true });
            const filePath = getSubagentReportArtifactsFilePath(params.workspaceSessionDir);
            await (0, write_file_atomic_1.default)(filePath, JSON.stringify(file, null, 2));
        }
        catch (error) {
            log_1.log.error("Failed to write subagent report artifacts file", { error });
        }
    });
    if (!updated) {
        throw new Error("upsertSubagentReportArtifact: failed to write report artifact");
    }
    return updated;
}
//# sourceMappingURL=subagentReportArtifacts.js.map