"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFileEditInsertTool = void 0;
const ai_1 = require("ai");
const tools_1 = require("../../../common/types/tools");
const toolDefinitions_1 = require("../../../common/utils/tools/toolDefinitions");
const fileCommon_1 = require("./fileCommon");
const file_edit_operation_1 = require("./file_edit_operation");
const eol_1 = require("./eol");
const fileExists_1 = require("../../../node/utils/runtime/fileExists");
const helpers_1 = require("../../../node/utils/runtime/helpers");
const Runtime_1 = require("../../../node/runtime/Runtime");
const READ_AND_RETRY_NOTE = `${tools_1.EDIT_FAILED_NOTE_PREFIX} ${tools_1.NOTE_READ_FILE_RETRY}`;
function guardFailure(error) {
    return {
        success: false,
        error,
        note: READ_AND_RETRY_NOTE,
    };
}
const createFileEditInsertTool = (config) => {
    return (0, ai_1.tool)({
        description: toolDefinitions_1.TOOL_DEFINITIONS.file_edit_insert.description,
        inputSchema: toolDefinitions_1.TOOL_DEFINITIONS.file_edit_insert.schema,
        execute: async ({ file_path, content, insert_before, insert_after }, { abortSignal }) => {
            try {
                const { correctedPath, warning: pathWarning } = (0, fileCommon_1.validateAndCorrectPath)(file_path, config.cwd, config.runtime);
                file_path = correctedPath;
                const resolvedPath = config.runtime.normalizePath(file_path, config.cwd);
                // Validate plan mode access restrictions
                const planModeError = await (0, fileCommon_1.validatePlanModeAccess)(file_path, config);
                if (planModeError) {
                    return planModeError;
                }
                const exists = await (0, fileExists_1.fileExists)(config.runtime, resolvedPath, abortSignal);
                if (!exists) {
                    try {
                        await (0, helpers_1.writeFileString)(config.runtime, resolvedPath, content, abortSignal);
                    }
                    catch (err) {
                        if (err instanceof Runtime_1.RuntimeError) {
                            return {
                                success: false,
                                error: err.message,
                            };
                        }
                        throw err;
                    }
                    // Record file state for post-compaction attachment tracking
                    if (config.recordFileState) {
                        try {
                            const newStat = await config.runtime.stat(resolvedPath, abortSignal);
                            config.recordFileState(resolvedPath, {
                                content,
                                timestamp: newStat.modifiedTime.getTime(),
                            });
                        }
                        catch {
                            // File stat failed, skip recording
                        }
                    }
                    const diff = (0, fileCommon_1.generateDiff)(resolvedPath, "", content);
                    return {
                        success: true,
                        diff: tools_1.FILE_EDIT_DIFF_OMITTED_MESSAGE,
                        ui_only: {
                            file_edit: {
                                diff,
                            },
                        },
                        ...(pathWarning && { warning: pathWarning }),
                    };
                }
                return (0, file_edit_operation_1.executeFileEditOperation)({
                    config,
                    filePath: file_path,
                    abortSignal,
                    operation: (originalContent) => insertContent(originalContent, content, {
                        insert_before,
                        insert_after,
                    }),
                });
            }
            catch (error) {
                if (error && typeof error === "object" && "code" in error && error.code === "EACCES") {
                    return {
                        success: false,
                        error: `Permission denied: ${file_path}`,
                    };
                }
                const message = error instanceof Error ? error.message : String(error);
                return {
                    success: false,
                    error: `Failed to insert content: ${message}`,
                };
            }
        },
    });
};
exports.createFileEditInsertTool = createFileEditInsertTool;
function insertContent(originalContent, contentToInsert, options) {
    const { insert_before, insert_after } = options;
    if (insert_before != null && insert_after != null) {
        return guardFailure("Provide only one of insert_before or insert_after (not both).");
    }
    if (insert_before == null && insert_after == null) {
        return guardFailure("Provide either insert_before or insert_after guard when editing existing files.");
    }
    const fileEol = (0, eol_1.detectFileEol)(originalContent);
    const normalizedContentToInsert = (0, eol_1.convertNewlines)(contentToInsert, fileEol);
    return insertWithGuards(originalContent, normalizedContentToInsert, {
        insert_before,
        insert_after,
    });
}
function insertWithGuards(originalContent, contentToInsert, anchors) {
    const anchorResult = resolveGuardAnchor(originalContent, anchors);
    if (!anchorResult.success) {
        return anchorResult;
    }
    const newContent = originalContent.slice(0, anchorResult.index) +
        contentToInsert +
        originalContent.slice(anchorResult.index);
    return {
        success: true,
        newContent,
        metadata: {},
    };
}
function findUniqueSubstringIndex(haystack, needle, label) {
    const firstIndex = haystack.indexOf(needle);
    if (firstIndex === -1) {
        return guardFailure(`Guard mismatch: unable to find ${label} substring in the current file.`);
    }
    const secondIndex = haystack.indexOf(needle, firstIndex + needle.length);
    if (secondIndex !== -1) {
        return guardFailure(`Guard mismatch: ${label} substring matched multiple times. Include more surrounding context (e.g., full signature, adjacent lines) to make it unique.`);
    }
    return { success: true, index: firstIndex };
}
function resolveGuardAnchor(originalContent, { insert_before, insert_after }) {
    const fileEol = (0, eol_1.detectFileEol)(originalContent);
    // insert_after: content goes after this anchor, so insertion point is at end of anchor
    if (insert_after != null) {
        const exactResult = findUniqueSubstringIndex(originalContent, insert_after, "insert_after");
        if (exactResult.success) {
            return { success: true, index: exactResult.index + insert_after.length };
        }
        const normalized = (0, eol_1.convertNewlines)(insert_after, fileEol);
        if (normalized !== insert_after) {
            const normalizedResult = findUniqueSubstringIndex(originalContent, normalized, "insert_after");
            if (!normalizedResult.success) {
                return normalizedResult;
            }
            return {
                success: true,
                index: normalizedResult.index + normalized.length,
            };
        }
        return exactResult;
    }
    // insert_before: content goes before this anchor, so insertion point is at start of anchor
    if (insert_before != null) {
        const exactResult = findUniqueSubstringIndex(originalContent, insert_before, "insert_before");
        if (exactResult.success) {
            return { success: true, index: exactResult.index };
        }
        const normalized = (0, eol_1.convertNewlines)(insert_before, fileEol);
        if (normalized !== insert_before) {
            const normalizedResult = findUniqueSubstringIndex(originalContent, normalized, "insert_before");
            if (!normalizedResult.success) {
                return normalizedResult;
            }
            return { success: true, index: normalizedResult.index };
        }
        return exactResult;
    }
    return guardFailure("Unable to determine insertion point from guards.");
}
//# sourceMappingURL=file_edit_insert.js.map