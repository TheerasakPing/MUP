"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeError = exports.WORKSPACE_REPO_MISSING_ERROR = void 0;
/**
 * Shared error message for missing repositories during runtime readiness checks.
 */
exports.WORKSPACE_REPO_MISSING_ERROR = "Workspace setup incomplete: repository not found.";
/**
 * Error thrown by runtime implementations
 */
class RuntimeError extends Error {
    type;
    cause;
    constructor(message, type, cause) {
        super(message);
        this.type = type;
        this.cause = cause;
        this.name = "RuntimeError";
    }
}
exports.RuntimeError = RuntimeError;
//# sourceMappingURL=Runtime.js.map