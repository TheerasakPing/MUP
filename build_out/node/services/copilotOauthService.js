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
exports.CopilotOauthService = exports.COPILOT_MODEL_PREFIXES = void 0;
const crypto = __importStar(require("crypto"));
const result_1 = require("../../common/types/result");
const log_1 = require("../../node/services/log");
const GITHUB_COPILOT_CLIENT_ID = "Ov23liCVKFN3jOo9R7HS";
const SCOPE = "read:user";
const POLLING_SAFETY_MARGIN_MS = 3000;
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;
const COMPLETED_FLOW_TTL_MS = 60 * 1000;
// Only surface top-tier model families from the Copilot API
exports.COPILOT_MODEL_PREFIXES = ["gpt-5", "claude-", "gemini-3", "grok-code"];
const GITHUB_DEVICE_CODE_URL = "https://github.com/login/device/code";
const GITHUB_ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
const COPILOT_API_BASE_URL = "https://api.githubcopilot.com";
class CopilotOauthService {
    providerService;
    windowService;
    flows = new Map();
    constructor(providerService, windowService) {
        this.providerService = providerService;
        this.windowService = windowService;
    }
    async startDeviceFlow() {
        const flowId = crypto.randomUUID();
        try {
            const res = await fetch(GITHUB_DEVICE_CODE_URL, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    client_id: GITHUB_COPILOT_CLIENT_ID,
                    scope: SCOPE,
                }),
            });
            if (!res.ok) {
                const text = await res.text().catch(() => "");
                return (0, result_1.Err)(`GitHub device code request failed (${res.status}): ${text}`);
            }
            const data = (await res.json());
            if (!data.verification_uri || !data.user_code || !data.device_code) {
                return (0, result_1.Err)("Invalid response from GitHub device code endpoint");
            }
            // Create deferred promise
            let resolveResult;
            const resultPromise = new Promise((resolve) => {
                resolveResult = resolve;
            });
            const timeout = setTimeout(() => {
                void this.finishFlow(flowId, (0, result_1.Err)("Timed out waiting for GitHub authorization"));
            }, DEFAULT_TIMEOUT_MS);
            this.flows.set(flowId, {
                flowId,
                deviceCode: data.device_code,
                interval: data.interval ?? 5,
                cancelled: false,
                pollingStarted: false,
                timeout,
                cleanupTimeout: null,
                resultPromise,
                resolveResult,
            });
            log_1.log.debug(`Copilot OAuth device flow started (flowId=${flowId})`);
            return (0, result_1.Ok)({
                flowId,
                verificationUri: data.verification_uri,
                userCode: data.user_code,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return (0, result_1.Err)(`Failed to start device flow: ${message}`);
        }
    }
    async waitForDeviceFlow(flowId, opts) {
        const flow = this.flows.get(flowId);
        if (!flow) {
            return (0, result_1.Err)("Device flow not found");
        }
        // Start polling in background (guard against re-entrant calls, e.g. React StrictMode re-mount)
        if (!flow.pollingStarted) {
            flow.pollingStarted = true;
            void this.pollForToken(flow);
        }
        const timeoutMs = opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        let timeoutHandle = null;
        const timeoutPromise = new Promise((resolve) => {
            timeoutHandle = setTimeout(() => {
                resolve((0, result_1.Err)("Timed out waiting for GitHub authorization"));
            }, timeoutMs);
        });
        const result = await Promise.race([flow.resultPromise, timeoutPromise]);
        if (timeoutHandle !== null) {
            clearTimeout(timeoutHandle);
        }
        if (!result.success) {
            void this.finishFlow(flowId, result);
        }
        return result;
    }
    cancelDeviceFlow(flowId) {
        const flow = this.flows.get(flowId);
        if (!flow)
            return;
        log_1.log.debug(`Copilot OAuth device flow cancelled (flowId=${flowId})`);
        this.finishFlow(flowId, (0, result_1.Err)("Device flow cancelled"));
    }
    dispose() {
        for (const flow of this.flows.values()) {
            clearTimeout(flow.timeout);
            if (flow.cleanupTimeout !== null)
                clearTimeout(flow.cleanupTimeout);
            flow.cancelled = true;
            try {
                flow.resolveResult((0, result_1.Err)("App shutting down"));
            }
            catch {
                /* already resolved */
            }
        }
        this.flows.clear();
    }
    async pollForToken(flow) {
        while (!flow.cancelled) {
            try {
                const res = await fetch(GITHUB_ACCESS_TOKEN_URL, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        client_id: GITHUB_COPILOT_CLIENT_ID,
                        device_code: flow.deviceCode,
                        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
                    }),
                });
                const data = (await res.json());
                // Re-check cancellation after the fetch round-trip to avoid
                // persisting credentials for a flow that was cancelled mid-request.
                if (flow.cancelled)
                    return;
                if (data.access_token) {
                    // Store token as apiKey for the github-copilot provider
                    const persistResult = this.providerService.setConfig("github-copilot", ["apiKey"], data.access_token);
                    if (!persistResult.success) {
                        void this.finishFlow(flow.flowId, (0, result_1.Err)(persistResult.error));
                        return;
                    }
                    // Fetch available models from Copilot API (best-effort, non-blocking on failure)
                    try {
                        const modelsRes = await fetch(`${COPILOT_API_BASE_URL}/models`, {
                            headers: {
                                Authorization: `Bearer ${data.access_token}`,
                                "Openai-Intent": "conversation-edits",
                                Accept: "application/json",
                            },
                        });
                        if (modelsRes.ok) {
                            const modelsData = (await modelsRes.json());
                            if (modelsData.data && modelsData.data.length > 0) {
                                const modelIds = modelsData.data
                                    .map((m) => m.id)
                                    .filter((id) => exports.COPILOT_MODEL_PREFIXES.some((prefix) => id.startsWith(prefix)));
                                if (modelIds.length > 0) {
                                    this.providerService.setModels("github-copilot", modelIds);
                                }
                            }
                        }
                    }
                    catch (e) {
                        log_1.log.debug("Failed to fetch Copilot models after login", e);
                    }
                    log_1.log.debug(`Copilot OAuth completed successfully (flowId=${flow.flowId})`);
                    this.windowService?.focusMainWindow();
                    void this.finishFlow(flow.flowId, (0, result_1.Ok)(undefined));
                    return;
                }
                if (data.error === "authorization_pending") {
                    // Expected during normal flow — will retry after sleep below
                }
                else if (data.error === "slow_down") {
                    flow.interval = data.interval ?? flow.interval + 5;
                }
                else if (data.error) {
                    // Any other error
                    void this.finishFlow(flow.flowId, (0, result_1.Err)(`GitHub OAuth error: ${data.error}`));
                    return;
                }
            }
            catch (error) {
                if (flow.cancelled)
                    return;
                const message = error instanceof Error ? error.message : String(error);
                log_1.log.warn(`Copilot OAuth polling error (will retry): ${message}`);
                // Transient errors — fall through to sleep, then retry
            }
            // Sleep before next iteration (placed at end so the first poll happens immediately)
            await new Promise((resolve) => setTimeout(resolve, flow.interval * 1000 + POLLING_SAFETY_MARGIN_MS));
        }
    }
    finishFlow(flowId, result) {
        const flow = this.flows.get(flowId);
        if (!flow || flow.cancelled)
            return;
        flow.cancelled = true;
        clearTimeout(flow.timeout);
        try {
            flow.resolveResult(result);
        }
        catch {
            // Already resolved
        }
        // Keep completed flow briefly so callers can still await
        if (flow.cleanupTimeout !== null) {
            clearTimeout(flow.cleanupTimeout);
        }
        flow.cleanupTimeout = setTimeout(() => {
            this.flows.delete(flowId);
        }, COMPLETED_FLOW_TTL_MS);
    }
}
exports.CopilotOauthService = CopilotOauthService;
//# sourceMappingURL=copilotOauthService.js.map