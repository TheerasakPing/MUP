"use strict";
/**
 * OAuth service for Mux Governor enrollment.
 *
 * Similar pattern to MuxGatewayOauthService but:
 * - Takes a user-provided governor origin (not hardcoded)
 * - Persists credentials to config.json (muxGovernorUrl + muxGovernorToken)
 */
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
exports.MuxGovernorOauthService = void 0;
const crypto = __importStar(require("crypto"));
const http = __importStar(require("http"));
const result_1 = require("../../common/types/result");
const muxGovernorOAuth_1 = require("../../common/constants/muxGovernorOAuth");
const log_1 = require("../../node/services/log");
const DEFAULT_DESKTOP_TIMEOUT_MS = 5 * 60 * 1000;
const DEFAULT_SERVER_TIMEOUT_MS = 10 * 60 * 1000;
const COMPLETED_DESKTOP_FLOW_TTL_MS = 60 * 1000;
function closeServer(server) {
    return new Promise((resolve) => {
        server.close(() => resolve());
    });
}
function createDeferred() {
    let resolve;
    const promise = new Promise((res) => {
        resolve = res;
    });
    return { promise, resolve };
}
class MuxGovernorOauthService {
    config;
    windowService;
    policyService;
    desktopFlows = new Map();
    serverFlows = new Map();
    constructor(config, windowService, policyService) {
        this.config = config;
        this.windowService = windowService;
        this.policyService = policyService;
    }
    async startDesktopFlow(input) {
        // Normalize and validate the governor origin
        let governorOrigin;
        try {
            governorOrigin = (0, muxGovernorOAuth_1.normalizeGovernorUrl)(input.governorOrigin);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return (0, result_1.Err)(`Invalid Governor URL: ${message}`);
        }
        const flowId = crypto.randomUUID();
        const { promise: resultPromise, resolve: resolveResult } = createDeferred();
        const server = http.createServer((req, res) => {
            const reqUrl = req.url ?? "/";
            const url = new URL(reqUrl, "http://localhost");
            if (req.method !== "GET" || url.pathname !== "/callback") {
                res.statusCode = 404;
                res.end("Not found");
                return;
            }
            const state = url.searchParams.get("state");
            if (!state || state !== flowId) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "text/html");
                res.end("<h1>Invalid OAuth state</h1>");
                return;
            }
            const code = url.searchParams.get("code");
            const error = url.searchParams.get("error");
            const errorDescription = url.searchParams.get("error_description") ?? undefined;
            void this.handleDesktopCallback({
                flowId,
                governorOrigin,
                code,
                error,
                errorDescription,
                res,
            });
        });
        try {
            await new Promise((resolve, reject) => {
                server.once("error", reject);
                server.listen(0, "127.0.0.1", () => resolve());
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return (0, result_1.Err)(`Failed to start OAuth callback listener: ${message}`);
        }
        const address = server.address();
        if (!address || typeof address === "string") {
            return (0, result_1.Err)("Failed to determine OAuth callback listener port");
        }
        const redirectUri = `http://127.0.0.1:${address.port}/callback`;
        const authorizeUrl = (0, muxGovernorOAuth_1.buildGovernorAuthorizeUrl)({
            governorOrigin,
            redirectUri,
            state: flowId,
        });
        const timeout = setTimeout(() => {
            void this.finishDesktopFlow(flowId, (0, result_1.Err)("Timed out waiting for OAuth callback"));
        }, DEFAULT_DESKTOP_TIMEOUT_MS);
        this.desktopFlows.set(flowId, {
            flowId,
            governorOrigin,
            authorizeUrl,
            redirectUri,
            server,
            timeout,
            cleanupTimeout: null,
            resultPromise,
            resolveResult,
            settled: false,
        });
        log_1.log.debug(`Mux Governor OAuth desktop flow started (flowId=${flowId}, origin=${governorOrigin})`);
        return (0, result_1.Ok)({ flowId, authorizeUrl, redirectUri });
    }
    async waitForDesktopFlow(flowId, opts) {
        const flow = this.desktopFlows.get(flowId);
        if (!flow) {
            return (0, result_1.Err)("OAuth flow not found");
        }
        const timeoutMs = opts?.timeoutMs ?? DEFAULT_DESKTOP_TIMEOUT_MS;
        let timeoutHandle = null;
        const timeoutPromise = new Promise((resolve) => {
            timeoutHandle = setTimeout(() => {
                resolve((0, result_1.Err)("Timed out waiting for OAuth callback"));
            }, timeoutMs);
        });
        const result = await Promise.race([flow.resultPromise, timeoutPromise]);
        if (timeoutHandle !== null) {
            clearTimeout(timeoutHandle);
        }
        if (!result.success) {
            // Ensure listener is closed on timeout/errors.
            void this.finishDesktopFlow(flowId, result);
        }
        return result;
    }
    async cancelDesktopFlow(flowId) {
        const flow = this.desktopFlows.get(flowId);
        if (!flow)
            return;
        log_1.log.debug(`Mux Governor OAuth desktop flow cancelled (flowId=${flowId})`);
        await this.finishDesktopFlow(flowId, (0, result_1.Err)("OAuth flow cancelled"));
    }
    startServerFlow(input) {
        // Normalize and validate the governor origin
        let governorOrigin;
        try {
            governorOrigin = (0, muxGovernorOAuth_1.normalizeGovernorUrl)(input.governorOrigin);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return (0, result_1.Err)(`Invalid Governor URL: ${message}`);
        }
        const state = crypto.randomUUID();
        // Prune expired flows (best-effort; avoids unbounded growth if callbacks never arrive).
        const now = Date.now();
        for (const [key, flow] of this.serverFlows) {
            if (flow.expiresAtMs <= now) {
                this.serverFlows.delete(key);
            }
        }
        const authorizeUrl = (0, muxGovernorOAuth_1.buildGovernorAuthorizeUrl)({
            governorOrigin,
            redirectUri: input.redirectUri,
            state,
        });
        this.serverFlows.set(state, {
            state,
            governorOrigin,
            expiresAtMs: Date.now() + DEFAULT_SERVER_TIMEOUT_MS,
        });
        log_1.log.debug(`Mux Governor OAuth server flow started (state=${state}, origin=${governorOrigin})`);
        return (0, result_1.Ok)({ authorizeUrl, state });
    }
    async handleServerCallbackAndExchange(input) {
        const state = input.state;
        if (!state) {
            return (0, result_1.Err)("Missing OAuth state");
        }
        const flow = this.serverFlows.get(state);
        if (!flow) {
            return (0, result_1.Err)("Unknown OAuth state");
        }
        if (Date.now() > flow.expiresAtMs) {
            this.serverFlows.delete(state);
            return (0, result_1.Err)("OAuth flow expired");
        }
        // Regardless of outcome, this flow should not be reused.
        const governorOrigin = flow.governorOrigin;
        this.serverFlows.delete(state);
        return this.handleCallbackAndExchange({
            state,
            governorOrigin,
            code: input.code,
            error: input.error,
            errorDescription: input.errorDescription,
        });
    }
    async dispose() {
        // Best-effort: cancel all in-flight flows.
        const flowIds = [...this.desktopFlows.keys()];
        await Promise.all(flowIds.map((id) => this.finishDesktopFlow(id, (0, result_1.Err)("App shutting down"))));
        for (const flow of this.desktopFlows.values()) {
            clearTimeout(flow.timeout);
            if (flow.cleanupTimeout !== null) {
                clearTimeout(flow.cleanupTimeout);
            }
        }
        this.desktopFlows.clear();
        this.serverFlows.clear();
    }
    async handleDesktopCallback(input) {
        const flow = this.desktopFlows.get(input.flowId);
        if (!flow || flow.settled) {
            input.res.statusCode = 409;
            input.res.setHeader("Content-Type", "text/html");
            input.res.end("<h1>OAuth flow already completed</h1>");
            return;
        }
        log_1.log.debug(`Mux Governor OAuth callback received (flowId=${input.flowId})`);
        const result = await this.handleCallbackAndExchange({
            state: input.flowId,
            governorOrigin: input.governorOrigin,
            code: input.code,
            error: input.error,
            errorDescription: input.errorDescription,
        });
        const title = result.success ? "Enrollment complete" : "Enrollment failed";
        const description = result.success
            ? "You can return to Mux. You may now close this tab."
            : escapeHtml(result.error);
        const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark light" />
    <title>${title}</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 600px; margin: 4rem auto; padding: 1rem; }
      h1 { margin-bottom: 1rem; }
      .muted { color: #666; }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <p>${description}</p>
    ${result.success
            ? '<p class="muted">Mux should now be in the foreground. You can close this tab.</p>'
            : '<p class="muted">You can close this tab.</p>'}
    <script>
      (() => {
        const ok = ${result.success ? "true" : "false"};
        if (!ok) return;
        try { window.close(); } catch {}
        setTimeout(() => { try { window.close(); } catch {} }, 50);
      })();
    </script>
  </body>
</html>`;
        input.res.setHeader("Content-Type", "text/html");
        if (!result.success) {
            input.res.statusCode = 400;
        }
        input.res.end(html);
        await this.finishDesktopFlow(input.flowId, result);
    }
    async handleCallbackAndExchange(input) {
        if (input.error) {
            const message = input.errorDescription
                ? `${input.error}: ${input.errorDescription}`
                : input.error;
            return (0, result_1.Err)(`Mux Governor OAuth error: ${message}`);
        }
        if (!input.code) {
            return (0, result_1.Err)("Missing OAuth code");
        }
        const tokenResult = await this.exchangeCodeForToken(input.code, input.governorOrigin);
        if (!tokenResult.success) {
            return (0, result_1.Err)(tokenResult.error);
        }
        // Persist to config.json
        try {
            await this.config.editConfig((config) => ({
                ...config,
                muxGovernorUrl: input.governorOrigin,
                muxGovernorToken: tokenResult.data,
            }));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return (0, result_1.Err)(`Failed to save Governor credentials: ${message}`);
        }
        log_1.log.debug(`Mux Governor OAuth exchange completed (state=${input.state})`);
        this.windowService?.focusMainWindow();
        const refreshResult = await this.policyService?.refreshNow();
        if (refreshResult && !refreshResult.success) {
            log_1.log.warn("Policy refresh after Governor enrollment failed", {
                error: refreshResult.error,
            });
        }
        return (0, result_1.Ok)(undefined);
    }
    async exchangeCodeForToken(code, governorOrigin) {
        const exchangeUrl = (0, muxGovernorOAuth_1.buildGovernorExchangeUrl)(governorOrigin);
        try {
            const response = await fetch(exchangeUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: (0, muxGovernorOAuth_1.buildGovernorExchangeBody)({ code }),
            });
            if (!response.ok) {
                const errorText = await response.text().catch(() => "");
                const prefix = `Mux Governor exchange failed (${response.status})`;
                return (0, result_1.Err)(errorText ? `${prefix}: ${errorText}` : prefix);
            }
            const json = (await response.json());
            const token = typeof json.access_token === "string" ? json.access_token : null;
            if (!token) {
                return (0, result_1.Err)("Mux Governor exchange response missing access_token");
            }
            return (0, result_1.Ok)(token);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return (0, result_1.Err)(`Mux Governor exchange failed: ${message}`);
        }
    }
    async finishDesktopFlow(flowId, result) {
        const flow = this.desktopFlows.get(flowId);
        if (!flow || flow.settled)
            return;
        flow.settled = true;
        clearTimeout(flow.timeout);
        try {
            flow.resolveResult(result);
            // Stop accepting new connections.
            await closeServer(flow.server);
        }
        catch (error) {
            log_1.log.debug("Failed to close OAuth callback listener:", error);
        }
        finally {
            // Keep the completed flow around briefly so callers can still await the result.
            if (flow.cleanupTimeout !== null) {
                clearTimeout(flow.cleanupTimeout);
            }
            flow.cleanupTimeout = setTimeout(() => {
                this.desktopFlows.delete(flowId);
            }, COMPLETED_DESKTOP_FLOW_TTL_MS);
        }
    }
}
exports.MuxGovernorOauthService = MuxGovernorOauthService;
function escapeHtml(input) {
    return input
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
//# sourceMappingURL=muxGovernorOauthService.js.map