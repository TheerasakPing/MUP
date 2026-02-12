"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStopCoderOnArchiveHook = createStopCoderOnArchiveHook;
exports.createStartCoderOnUnarchiveHook = createStartCoderOnUnarchiveHook;
const runtime_1 = require("../../common/types/runtime");
const result_1 = require("../../common/types/result");
const log_1 = require("../../node/services/log");
const DEFAULT_STOP_TIMEOUT_MS = 60_000;
const DEFAULT_START_TIMEOUT_MS = 60_000;
const DEFAULT_STATUS_TIMEOUT_MS = 10_000;
const DEFAULT_STOPPING_WAIT_TIMEOUT_MS = 15_000;
const DEFAULT_STOPPING_POLL_INTERVAL_MS = 1_000;
function sleep(ms) {
    if (ms <= 0) {
        return Promise.resolve();
    }
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function isAlreadyStoppedOrGone(status) {
    if (status.kind === "not_found") {
        return true;
    }
    if (status.kind !== "ok") {
        return false;
    }
    // "stopping" is treated as "good enough" for archive — we don't want to block the user on a
    // long tail stop operation when the workspace is already on its way down.
    return (status.status === "stopped" ||
        status.status === "stopping" ||
        status.status === "deleted" ||
        status.status === "deleting");
}
function isAlreadyRunningOrStarting(status) {
    if (status.kind !== "ok") {
        return false;
    }
    return status.status === "running" || status.status === "starting";
}
function createStopCoderOnArchiveHook(options) {
    const timeoutMs = options.timeoutMs ?? DEFAULT_STOP_TIMEOUT_MS;
    return async ({ workspaceId, workspaceMetadata }) => {
        // Config default is ON (undefined behaves true).
        if (!options.shouldStopOnArchive()) {
            return (0, result_1.Ok)(undefined);
        }
        const runtimeConfig = workspaceMetadata.runtimeConfig;
        if (!(0, runtime_1.isSSHRuntime)(runtimeConfig) || !runtimeConfig.coder) {
            return (0, result_1.Ok)(undefined);
        }
        const coder = runtimeConfig.coder;
        // Important safety invariant:
        // Only stop Coder workspaces that mux created (dedicated workspaces). If the user connected
        // mux to an existing Coder workspace, archiving in mux should *not* stop their environment.
        if (coder.existingWorkspace === true) {
            return (0, result_1.Ok)(undefined);
        }
        const workspaceName = coder.workspaceName?.trim();
        if (!workspaceName) {
            return (0, result_1.Ok)(undefined);
        }
        // Best-effort: skip the stop call if the control-plane already thinks the workspace is down.
        const status = await options.coderService.getWorkspaceStatus(workspaceName, {
            timeoutMs: DEFAULT_STATUS_TIMEOUT_MS,
        });
        if (isAlreadyStoppedOrGone(status)) {
            return (0, result_1.Ok)(undefined);
        }
        log_1.log.debug("Stopping Coder workspace before mux archive", {
            workspaceId,
            coderWorkspaceName: workspaceName,
            statusKind: status.kind,
            status: status.kind === "ok" ? status.status : undefined,
        });
        const stopResult = await options.coderService.stopWorkspace(workspaceName, { timeoutMs });
        if (!stopResult.success) {
            return (0, result_1.Err)(`Failed to stop Coder workspace "${workspaceName}": ${stopResult.error}`);
        }
        return (0, result_1.Ok)(undefined);
    };
}
function createStartCoderOnUnarchiveHook(options) {
    const timeoutMs = options.timeoutMs ?? DEFAULT_START_TIMEOUT_MS;
    return async ({ workspaceId, workspaceMetadata }) => {
        // Config default is ON (undefined behaves true).
        if (!options.shouldStopOnArchive()) {
            return (0, result_1.Ok)(undefined);
        }
        const runtimeConfig = workspaceMetadata.runtimeConfig;
        if (!(0, runtime_1.isSSHRuntime)(runtimeConfig) || !runtimeConfig.coder) {
            return (0, result_1.Ok)(undefined);
        }
        const coder = runtimeConfig.coder;
        // Important safety invariant:
        // Only start Coder workspaces that mux created (dedicated workspaces). If the user connected
        // mux to an existing Coder workspace, unarchiving in mux should *not* start their environment.
        if (coder.existingWorkspace === true) {
            return (0, result_1.Ok)(undefined);
        }
        const workspaceName = coder.workspaceName?.trim();
        if (!workspaceName) {
            return (0, result_1.Ok)(undefined);
        }
        let status = await options.coderService.getWorkspaceStatus(workspaceName, {
            timeoutMs: DEFAULT_STATUS_TIMEOUT_MS,
        });
        // Unarchive can happen immediately after archive, while the Coder workspace is still
        // transitioning through "stopping". Starting during that transition can fail, so we
        // best-effort poll briefly until it reaches a terminal state.
        if (status.kind === "ok" && status.status === "stopping") {
            const waitTimeoutMs = options.stoppingWaitTimeoutMs ?? DEFAULT_STOPPING_WAIT_TIMEOUT_MS;
            const pollIntervalMs = options.stoppingPollIntervalMs ?? DEFAULT_STOPPING_POLL_INTERVAL_MS;
            const deadlineMs = Date.now() + waitTimeoutMs;
            log_1.log.debug("Coder workspace is still stopping after mux unarchive; waiting briefly before starting", {
                workspaceId,
                coderWorkspaceName: workspaceName,
                waitTimeoutMs,
                pollIntervalMs,
            });
            while (status.kind === "ok" && status.status === "stopping") {
                const remainingMs = deadlineMs - Date.now();
                if (remainingMs <= 0) {
                    break;
                }
                await sleep(Math.min(pollIntervalMs, remainingMs));
                const statusRemainingMs = deadlineMs - Date.now();
                if (statusRemainingMs <= 0) {
                    break;
                }
                status = await options.coderService.getWorkspaceStatus(workspaceName, {
                    timeoutMs: Math.min(DEFAULT_STATUS_TIMEOUT_MS, statusRemainingMs),
                });
            }
            if (status.kind === "ok" && status.status === "stopping") {
                log_1.log.debug("Timed out waiting for Coder workspace to stop after mux unarchive", {
                    workspaceId,
                    coderWorkspaceName: workspaceName,
                    waitTimeoutMs,
                });
                return (0, result_1.Ok)(undefined);
            }
        }
        // If the workspace is gone, that's "good enough" — there's nothing to start.
        if (status.kind === "not_found") {
            return (0, result_1.Ok)(undefined);
        }
        if (status.kind === "error") {
            log_1.log.debug("Skipping Coder workspace start after mux unarchive due to status check error", {
                workspaceId,
                coderWorkspaceName: workspaceName,
                error: status.error,
            });
            return (0, result_1.Ok)(undefined);
        }
        // Best-effort: don't start if the control-plane already thinks the workspace is coming up.
        if (isAlreadyRunningOrStarting(status)) {
            return (0, result_1.Ok)(undefined);
        }
        // Only start when the workspace is definitively stopped.
        if (status.status !== "stopped") {
            return (0, result_1.Ok)(undefined);
        }
        log_1.log.debug("Starting Coder workspace after mux unarchive", {
            workspaceId,
            coderWorkspaceName: workspaceName,
            status: status.status,
        });
        const startResult = await options.coderService.startWorkspace(workspaceName, { timeoutMs });
        if (!startResult.success) {
            return (0, result_1.Err)(`Failed to start Coder workspace "${workspaceName}": ${startResult.error}`);
        }
        return (0, result_1.Ok)(undefined);
    };
}
//# sourceMappingURL=coderLifecycleHooks.js.map