"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceLifecycleHooks = void 0;
const result_1 = require("../../common/types/result");
const log_1 = require("../../node/services/log");
function sanitizeErrorMessage(error) {
    const raw = error instanceof Error ? error.message : String(error);
    // Keep single-line, capped error messages to avoid leaking stack traces or long CLI output.
    const singleLine = raw.split("\n")[0]?.trim() ?? "";
    return singleLine.slice(0, 200) || "Unknown error";
}
/**
 * Backend registry for workspace lifecycle hooks.
 *
 * Hooks run in-process (sequentially).
 * - beforeArchive hooks may block the operation if they return Err.
 * - afterUnarchive hooks are best-effort and never block unarchive.
 */
class WorkspaceLifecycleHooks {
    beforeArchiveHooks = [];
    afterUnarchiveHooks = [];
    registerBeforeArchive(hook) {
        this.beforeArchiveHooks.push(hook);
    }
    registerAfterUnarchive(hook) {
        this.afterUnarchiveHooks.push(hook);
    }
    async runBeforeArchive(args) {
        for (const hook of this.beforeArchiveHooks) {
            try {
                const result = await hook(args);
                if (!result.success) {
                    return (0, result_1.Err)(sanitizeErrorMessage(result.error));
                }
            }
            catch (error) {
                return (0, result_1.Err)(`beforeArchive hook threw: ${sanitizeErrorMessage(error)}`);
            }
        }
        return (0, result_1.Ok)(undefined);
    }
    async runAfterUnarchive(args) {
        for (const hook of this.afterUnarchiveHooks) {
            try {
                const result = await hook(args);
                if (!result.success) {
                    log_1.log.debug("afterUnarchive hook failed", {
                        workspaceId: args.workspaceId,
                        error: sanitizeErrorMessage(result.error),
                    });
                }
            }
            catch (error) {
                log_1.log.debug("afterUnarchive hook threw", {
                    workspaceId: args.workspaceId,
                    error: sanitizeErrorMessage(error),
                });
            }
        }
    }
}
exports.WorkspaceLifecycleHooks = WorkspaceLifecycleHooks;
//# sourceMappingURL=workspaceLifecycleHooks.js.map