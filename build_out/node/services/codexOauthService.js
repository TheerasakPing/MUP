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
var __addDisposableResource = (this && this.__addDisposableResource) || function (env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
        env.stack.push({ value: value, dispose: dispose, async: async });
    }
    else if (async) {
        env.stack.push({ async: true });
    }
    return value;
};
var __disposeResources = (this && this.__disposeResources) || (function (SuppressedError) {
    return function (env) {
        function fail(e) {
            env.error = env.hasError ? new SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        var r, s = 0;
        function next() {
            while (r = env.stack.pop()) {
                try {
                    if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                    if (r.dispose) {
                        var result = r.dispose.call(r.value);
                        if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                    }
                    else s |= 1;
                }
                catch (e) {
                    fail(e);
                }
            }
            if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return next();
    };
})(typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodexOauthService = void 0;
const crypto = __importStar(require("crypto"));
const http = __importStar(require("http"));
const result_1 = require("../../common/types/result");
const codexOAuth_1 = require("../../common/constants/codexOAuth");
const log_1 = require("../../node/services/log");
const asyncMutex_1 = require("../../node/utils/concurrency/asyncMutex");
const codexOauthAuth_1 = require("../../node/utils/codexOauthAuth");
const DEFAULT_DESKTOP_TIMEOUT_MS = 5 * 60 * 1000;
const DEFAULT_DEVICE_TIMEOUT_MS = 15 * 60 * 1000;
const COMPLETED_FLOW_TTL_MS = 60 * 1000;
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
function sha256Base64Url(value) {
    return crypto.createHash("sha256").update(value).digest().toString("base64url");
}
function randomBase64Url(bytes = 32) {
    return crypto.randomBytes(bytes).toString("base64url");
}
function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function isLoopbackAddress(address) {
    if (!address)
        return false;
    // Node may normalize IPv4 loopback to an IPv6-mapped address.
    if (address === "::ffff:127.0.0.1") {
        return true;
    }
    return address === "127.0.0.1" || address === "::1";
}
function parseOptionalNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string") {
        const n = Number(value);
        return Number.isFinite(n) ? n : null;
    }
    return null;
}
function isInvalidGrantError(errorText) {
    const trimmed = errorText.trim();
    if (trimmed.length === 0) {
        return false;
    }
    try {
        const json = JSON.parse(trimmed);
        if (isPlainObject(json) && json.error === "invalid_grant") {
            return true;
        }
    }
    catch {
        // Ignore parse failures - fall back to substring checks.
    }
    const lower = trimmed.toLowerCase();
    return lower.includes("invalid_grant") || lower.includes("revoked");
}
class CodexOauthService {
    config;
    providerService;
    windowService;
    desktopFlows = new Map();
    deviceFlows = new Map();
    refreshMutex = new asyncMutex_1.AsyncMutex();
    // In-memory cache so getValidAuth() skips disk reads when tokens are valid.
    // Invalidated on every write (exchange, refresh, disconnect).
    cachedAuth = null;
    constructor(config, providerService, windowService) {
        this.config = config;
        this.providerService = providerService;
        this.windowService = windowService;
    }
    disconnect() {
        // Clear stored ChatGPT OAuth tokens so Codex-only models are hidden again.
        this.cachedAuth = null;
        return this.providerService.setConfigValue("openai", ["codexOauth"], undefined);
    }
    async startDesktopFlow() {
        const flowId = randomBase64Url();
        const codeVerifier = randomBase64Url();
        const codeChallenge = sha256Base64Url(codeVerifier);
        const { promise: resultPromise, resolve: resolveResult } = createDeferred();
        const redirectUri = codexOAuth_1.CODEX_OAUTH_BROWSER_REDIRECT_URI;
        const server = http.createServer((req, res) => {
            if (!isLoopbackAddress(req.socket.remoteAddress)) {
                res.statusCode = 403;
                res.end("Forbidden");
                return;
            }
            const reqUrl = req.url ?? "/";
            const url = new URL(reqUrl, "http://localhost");
            if (req.method !== "GET" || url.pathname !== "/auth/callback") {
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
                code,
                error,
                errorDescription,
                res,
            });
        });
        try {
            await new Promise((resolve, reject) => {
                server.once("error", reject);
                server.listen(1455, "localhost", () => resolve());
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return (0, result_1.Err)(`Failed to start OAuth callback listener: ${message}`);
        }
        const authorizeUrl = (0, codexOAuth_1.buildCodexAuthorizeUrl)({
            redirectUri,
            state: flowId,
            codeChallenge,
        });
        const timeout = setTimeout(() => {
            void this.finishDesktopFlow(flowId, (0, result_1.Err)("Timed out waiting for OAuth callback"));
        }, DEFAULT_DESKTOP_TIMEOUT_MS);
        this.desktopFlows.set(flowId, {
            flowId,
            authorizeUrl,
            redirectUri,
            codeVerifier,
            server,
            timeout,
            cleanupTimeout: null,
            resultPromise,
            resolveResult,
            settled: false,
        });
        log_1.log.debug(`[Codex OAuth] Desktop flow started (flowId=${flowId})`);
        return (0, result_1.Ok)({ flowId, authorizeUrl });
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
        log_1.log.debug(`[Codex OAuth] Desktop flow cancelled (flowId=${flowId})`);
        await this.finishDesktopFlow(flowId, (0, result_1.Err)("OAuth flow cancelled"));
    }
    async startDeviceFlow() {
        const flowId = randomBase64Url();
        const deviceAuthResult = await this.requestDeviceUserCode();
        if (!deviceAuthResult.success) {
            return (0, result_1.Err)(deviceAuthResult.error);
        }
        const { deviceAuthId, userCode, intervalSeconds, expiresAtMs } = deviceAuthResult.data;
        const verifyUrl = codexOAuth_1.CODEX_OAUTH_DEVICE_VERIFY_URL;
        const { promise: resultPromise, resolve: resolveResult } = createDeferred();
        const abortController = new AbortController();
        const timeoutMs = Math.min(DEFAULT_DEVICE_TIMEOUT_MS, Math.max(0, expiresAtMs - Date.now()));
        const timeout = setTimeout(() => {
            void this.finishDeviceFlow(flowId, (0, result_1.Err)("Device code expired"));
        }, timeoutMs);
        this.deviceFlows.set(flowId, {
            flowId,
            deviceAuthId,
            userCode,
            verifyUrl,
            intervalSeconds,
            expiresAtMs,
            abortController,
            pollingStarted: false,
            timeout,
            cleanupTimeout: null,
            resultPromise,
            resolveResult,
            settled: false,
        });
        log_1.log.debug(`[Codex OAuth] Device flow started (flowId=${flowId})`);
        return (0, result_1.Ok)({ flowId, userCode, verifyUrl, intervalSeconds });
    }
    async waitForDeviceFlow(flowId, opts) {
        const flow = this.deviceFlows.get(flowId);
        if (!flow) {
            return (0, result_1.Err)("OAuth flow not found");
        }
        if (!flow.pollingStarted) {
            flow.pollingStarted = true;
            this.pollDeviceFlow(flowId).catch((error) => {
                // The polling loop is responsible for resolving the flow; if we reach
                // here something unexpected happened.
                const message = error instanceof Error ? error.message : String(error);
                log_1.log.warn(`[Codex OAuth] Device polling crashed (flowId=${flowId}): ${message}`);
                void this.finishDeviceFlow(flowId, (0, result_1.Err)(`Device polling crashed: ${message}`));
            });
        }
        const timeoutMs = opts?.timeoutMs ?? DEFAULT_DEVICE_TIMEOUT_MS;
        let timeoutHandle = null;
        const timeoutPromise = new Promise((resolve) => {
            timeoutHandle = setTimeout(() => {
                resolve((0, result_1.Err)("Timed out waiting for device authorization"));
            }, timeoutMs);
        });
        const result = await Promise.race([flow.resultPromise, timeoutPromise]);
        if (timeoutHandle !== null) {
            clearTimeout(timeoutHandle);
        }
        if (!result.success) {
            // Ensure polling is cancelled on timeout/errors.
            void this.finishDeviceFlow(flowId, result);
        }
        return result;
    }
    async cancelDeviceFlow(flowId) {
        const flow = this.deviceFlows.get(flowId);
        if (!flow)
            return;
        log_1.log.debug(`[Codex OAuth] Device flow cancelled (flowId=${flowId})`);
        await this.finishDeviceFlow(flowId, (0, result_1.Err)("OAuth flow cancelled"));
    }
    async getValidAuth() {
        const env_1 = { stack: [], error: void 0, hasError: false };
        try {
            const stored = this.readStoredAuth();
            if (!stored) {
                return (0, result_1.Err)("Codex OAuth is not configured");
            }
            if (!(0, codexOauthAuth_1.isCodexOauthAuthExpired)(stored)) {
                return (0, result_1.Ok)(stored);
            }
            const _lock = __addDisposableResource(env_1, await this.refreshMutex.acquire(), true);
            // Re-read after acquiring lock in case another caller refreshed first.
            const latest = this.readStoredAuth();
            if (!latest) {
                return (0, result_1.Err)("Codex OAuth is not configured");
            }
            if (!(0, codexOauthAuth_1.isCodexOauthAuthExpired)(latest)) {
                return (0, result_1.Ok)(latest);
            }
            const refreshed = await this.refreshTokens(latest);
            if (!refreshed.success) {
                return (0, result_1.Err)(refreshed.error);
            }
            return (0, result_1.Ok)(refreshed.data);
        }
        catch (e_1) {
            env_1.error = e_1;
            env_1.hasError = true;
        }
        finally {
            const result_2 = __disposeResources(env_1);
            if (result_2)
                await result_2;
        }
    }
    async dispose() {
        const desktopIds = [...this.desktopFlows.keys()];
        await Promise.all(desktopIds.map((id) => this.finishDesktopFlow(id, (0, result_1.Err)("App shutting down"))));
        const deviceIds = [...this.deviceFlows.keys()];
        await Promise.all(deviceIds.map((id) => this.finishDeviceFlow(id, (0, result_1.Err)("App shutting down"))));
        for (const flow of this.desktopFlows.values()) {
            clearTimeout(flow.timeout);
            if (flow.cleanupTimeout !== null) {
                clearTimeout(flow.cleanupTimeout);
            }
        }
        for (const flow of this.deviceFlows.values()) {
            clearTimeout(flow.timeout);
            if (flow.cleanupTimeout !== null) {
                clearTimeout(flow.cleanupTimeout);
            }
        }
        this.desktopFlows.clear();
        this.deviceFlows.clear();
    }
    readStoredAuth() {
        if (this.cachedAuth) {
            return this.cachedAuth;
        }
        const providersConfig = this.config.loadProvidersConfig() ?? {};
        const openaiConfig = providersConfig.openai;
        const auth = (0, codexOauthAuth_1.parseCodexOauthAuth)(openaiConfig?.codexOauth);
        this.cachedAuth = auth;
        return auth;
    }
    persistAuth(auth) {
        const result = this.providerService.setConfigValue("openai", ["codexOauth"], auth);
        // Invalidate cache so the next readStoredAuth() picks up the persisted value from disk.
        // We clear rather than set because setConfigValue may have side-effects (e.g. file-write
        // failures) and we want the next read to be authoritative.
        this.cachedAuth = null;
        return result;
    }
    async handleDesktopCallback(input) {
        const flow = this.desktopFlows.get(input.flowId);
        if (!flow || flow.settled) {
            input.res.statusCode = 409;
            input.res.setHeader("Content-Type", "text/html");
            input.res.end("<h1>OAuth flow already completed</h1>");
            return;
        }
        log_1.log.debug(`[Codex OAuth] Desktop callback received (flowId=${input.flowId})`);
        const result = await this.handleDesktopCallbackAndExchange({
            flowId: input.flowId,
            redirectUri: flow.redirectUri,
            codeVerifier: flow.codeVerifier,
            code: input.code,
            error: input.error,
            errorDescription: input.errorDescription,
        });
        const title = result.success ? "Login complete" : "Login failed";
        const description = result.success
            ? "You can return to Mux. You may now close this tab."
            : escapeHtml(result.error);
        input.res.setHeader("Content-Type", "text/html");
        if (!result.success) {
            input.res.statusCode = 400;
        }
        input.res.end(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark light" />
    <title>${title}</title>
  </head>
  <body>
    <h1>${title}</h1>
    <p>${description}</p>
    <script>
      (() => {
        const ok = ${result.success ? "true" : "false"};
        if (!ok) return;
        try { window.close(); } catch {}
        setTimeout(() => { try { window.close(); } catch {} }, 50);
      })();
    </script>
  </body>
</html>`);
        await this.finishDesktopFlow(input.flowId, result);
    }
    async handleDesktopCallbackAndExchange(input) {
        if (input.error) {
            const message = input.errorDescription
                ? `${input.error}: ${input.errorDescription}`
                : input.error;
            return (0, result_1.Err)(`Codex OAuth error: ${message}`);
        }
        if (!input.code) {
            return (0, result_1.Err)("Missing OAuth code");
        }
        const tokenResult = await this.exchangeCodeForTokens({
            code: input.code,
            redirectUri: input.redirectUri,
            codeVerifier: input.codeVerifier,
        });
        if (!tokenResult.success) {
            return (0, result_1.Err)(tokenResult.error);
        }
        const persistResult = this.persistAuth(tokenResult.data);
        if (!persistResult.success) {
            return (0, result_1.Err)(persistResult.error);
        }
        log_1.log.debug(`[Codex OAuth] Desktop exchange completed (flowId=${input.flowId})`);
        this.windowService?.focusMainWindow();
        return (0, result_1.Ok)(undefined);
    }
    async exchangeCodeForTokens(input) {
        try {
            const response = await fetch(codexOAuth_1.CODEX_OAUTH_TOKEN_URL, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: (0, codexOAuth_1.buildCodexTokenExchangeBody)({
                    code: input.code,
                    redirectUri: input.redirectUri,
                    codeVerifier: input.codeVerifier,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text().catch(() => "");
                const prefix = `Codex OAuth exchange failed (${response.status})`;
                return (0, result_1.Err)(errorText ? `${prefix}: ${errorText}` : prefix);
            }
            const json = (await response.json());
            if (!isPlainObject(json)) {
                return (0, result_1.Err)("Codex OAuth exchange returned an invalid JSON payload");
            }
            const accessToken = typeof json.access_token === "string" ? json.access_token : null;
            const refreshToken = typeof json.refresh_token === "string" ? json.refresh_token : null;
            const expiresIn = parseOptionalNumber(json.expires_in);
            const idToken = typeof json.id_token === "string" ? json.id_token : undefined;
            if (!accessToken) {
                return (0, result_1.Err)("Codex OAuth exchange response missing access_token");
            }
            if (!refreshToken) {
                return (0, result_1.Err)("Codex OAuth exchange response missing refresh_token");
            }
            if (expiresIn === null) {
                return (0, result_1.Err)("Codex OAuth exchange response missing expires_in");
            }
            const accountId = (0, codexOauthAuth_1.extractChatGptAccountIdFromTokens)({ accessToken, idToken }) ?? undefined;
            return (0, result_1.Ok)({
                type: "oauth",
                access: accessToken,
                refresh: refreshToken,
                expires: Date.now() + Math.max(0, Math.floor(expiresIn * 1000)),
                accountId,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return (0, result_1.Err)(`Codex OAuth exchange failed: ${message}`);
        }
    }
    async refreshTokens(current) {
        try {
            const response = await fetch(codexOAuth_1.CODEX_OAUTH_TOKEN_URL, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: (0, codexOAuth_1.buildCodexRefreshBody)({ refreshToken: current.refresh }),
            });
            if (!response.ok) {
                const errorText = await response.text().catch(() => "");
                // When the refresh token is invalid/revoked, clear persisted auth so subsequent
                // requests fall back to the existing "not connected" behavior.
                if (isInvalidGrantError(errorText)) {
                    log_1.log.debug("[Codex OAuth] Refresh token rejected; clearing stored auth");
                    const disconnectResult = this.disconnect();
                    if (!disconnectResult.success) {
                        log_1.log.warn(`[Codex OAuth] Failed to clear stored auth after refresh failure: ${disconnectResult.error}`);
                    }
                }
                const prefix = `Codex OAuth refresh failed (${response.status})`;
                return (0, result_1.Err)(errorText ? `${prefix}: ${errorText}` : prefix);
            }
            const json = (await response.json());
            if (!isPlainObject(json)) {
                return (0, result_1.Err)("Codex OAuth refresh returned an invalid JSON payload");
            }
            const accessToken = typeof json.access_token === "string" ? json.access_token : null;
            const refreshToken = typeof json.refresh_token === "string" ? json.refresh_token : null;
            const expiresIn = parseOptionalNumber(json.expires_in);
            const idToken = typeof json.id_token === "string" ? json.id_token : undefined;
            if (!accessToken) {
                return (0, result_1.Err)("Codex OAuth refresh response missing access_token");
            }
            if (expiresIn === null) {
                return (0, result_1.Err)("Codex OAuth refresh response missing expires_in");
            }
            const accountId = (0, codexOauthAuth_1.extractChatGptAccountIdFromTokens)({ accessToken, idToken }) ?? current.accountId;
            const next = {
                type: "oauth",
                access: accessToken,
                refresh: refreshToken ?? current.refresh,
                expires: Date.now() + Math.max(0, Math.floor(expiresIn * 1000)),
                accountId,
            };
            const persistResult = this.persistAuth(next);
            if (!persistResult.success) {
                return (0, result_1.Err)(persistResult.error);
            }
            return (0, result_1.Ok)(next);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return (0, result_1.Err)(`Codex OAuth refresh failed: ${message}`);
        }
    }
    async requestDeviceUserCode() {
        try {
            const response = await fetch(codexOAuth_1.CODEX_OAUTH_DEVICE_USERCODE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ client_id: codexOAuth_1.CODEX_OAUTH_CLIENT_ID }),
            });
            if (!response.ok) {
                const errorText = await response.text().catch(() => "");
                const prefix = `Codex OAuth device auth request failed (${response.status})`;
                return (0, result_1.Err)(errorText ? `${prefix}: ${errorText}` : prefix);
            }
            const json = (await response.json());
            if (!isPlainObject(json)) {
                return (0, result_1.Err)("Codex OAuth device auth response returned an invalid JSON payload");
            }
            const deviceAuthId = typeof json.device_auth_id === "string" ? json.device_auth_id : null;
            const userCode = typeof json.user_code === "string" ? json.user_code : null;
            const interval = parseOptionalNumber(json.interval);
            const expiresIn = parseOptionalNumber(json.expires_in);
            if (!deviceAuthId || !userCode) {
                return (0, result_1.Err)("Codex OAuth device auth response missing required fields");
            }
            const intervalSeconds = interval !== null ? Math.max(1, Math.floor(interval)) : 5;
            const expiresAtMs = expiresIn !== null
                ? Date.now() + Math.max(0, Math.floor(expiresIn * 1000))
                : Date.now() + DEFAULT_DEVICE_TIMEOUT_MS;
            return (0, result_1.Ok)({ deviceAuthId, userCode, intervalSeconds, expiresAtMs });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return (0, result_1.Err)(`Codex OAuth device auth request failed: ${message}`);
        }
    }
    async pollDeviceFlow(flowId) {
        const flow = this.deviceFlows.get(flowId);
        if (!flow || flow.settled) {
            return;
        }
        const intervalSeconds = flow.intervalSeconds;
        while (Date.now() < flow.expiresAtMs) {
            if (flow.abortController.signal.aborted) {
                await this.finishDeviceFlow(flowId, (0, result_1.Err)("OAuth flow cancelled"));
                return;
            }
            const attempt = await this.pollDeviceTokenOnce(flow);
            if (attempt.kind === "success") {
                const persistResult = this.persistAuth(attempt.auth);
                if (!persistResult.success) {
                    await this.finishDeviceFlow(flowId, (0, result_1.Err)(persistResult.error));
                    return;
                }
                log_1.log.debug(`[Codex OAuth] Device authorization completed (flowId=${flowId})`);
                this.windowService?.focusMainWindow();
                await this.finishDeviceFlow(flowId, (0, result_1.Ok)(undefined));
                return;
            }
            if (attempt.kind === "fatal") {
                await this.finishDeviceFlow(flowId, (0, result_1.Err)(attempt.message));
                return;
            }
            try {
                // OpenCode guide: intervalSeconds * 1000 + 3000
                await sleepWithAbort(intervalSeconds * 1000 + 3000, flow.abortController.signal);
            }
            catch {
                // Abort is handled via cancelDeviceFlow()/finishDeviceFlow().
                return;
            }
        }
        await this.finishDeviceFlow(flowId, (0, result_1.Err)("Device code expired"));
    }
    async pollDeviceTokenOnce(flow) {
        try {
            const response = await fetch(codexOAuth_1.CODEX_OAUTH_DEVICE_TOKEN_POLL_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ device_auth_id: flow.deviceAuthId, user_code: flow.userCode }),
                signal: flow.abortController.signal,
            });
            if (response.status === 403 || response.status === 404) {
                return { kind: "pending" };
            }
            if (response.status !== 200) {
                const errorText = await response.text().catch(() => "");
                const prefix = `Codex OAuth device token poll failed (${response.status})`;
                return { kind: "fatal", message: errorText ? `${prefix}: ${errorText}` : prefix };
            }
            const json = (await response.json().catch(() => null));
            if (!isPlainObject(json)) {
                return { kind: "fatal", message: "Codex OAuth device token poll returned invalid JSON" };
            }
            const authorizationCode = typeof json.authorization_code === "string" ? json.authorization_code : null;
            const codeVerifier = typeof json.code_verifier === "string" ? json.code_verifier : null;
            if (!authorizationCode || !codeVerifier) {
                return {
                    kind: "fatal",
                    message: "Codex OAuth device token poll response missing required fields",
                };
            }
            const tokenResult = await this.exchangeCodeForTokens({
                code: authorizationCode,
                redirectUri: "https://auth.openai.com/deviceauth/callback",
                codeVerifier,
            });
            if (!tokenResult.success) {
                return { kind: "fatal", message: tokenResult.error };
            }
            return { kind: "success", auth: tokenResult.data };
        }
        catch (error) {
            // Abort is treated as cancellation.
            if (flow.abortController.signal.aborted) {
                return { kind: "fatal", message: "OAuth flow cancelled" };
            }
            const message = error instanceof Error ? error.message : String(error);
            return { kind: "fatal", message: `Device authorization failed: ${message}` };
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
            await closeServer(flow.server);
        }
        catch (error) {
            log_1.log.debug("[Codex OAuth] Failed to close OAuth callback listener:", error);
        }
        finally {
            if (flow.cleanupTimeout !== null) {
                clearTimeout(flow.cleanupTimeout);
            }
            flow.cleanupTimeout = setTimeout(() => {
                this.desktopFlows.delete(flowId);
            }, COMPLETED_FLOW_TTL_MS);
        }
    }
    finishDeviceFlow(flowId, result) {
        const flow = this.deviceFlows.get(flowId);
        if (!flow || flow.settled) {
            return Promise.resolve();
        }
        flow.settled = true;
        clearTimeout(flow.timeout);
        flow.abortController.abort();
        try {
            flow.resolveResult(result);
        }
        finally {
            if (flow.cleanupTimeout !== null) {
                clearTimeout(flow.cleanupTimeout);
            }
            flow.cleanupTimeout = setTimeout(() => {
                this.deviceFlows.delete(flowId);
            }, COMPLETED_FLOW_TTL_MS);
        }
        return Promise.resolve();
    }
}
exports.CodexOauthService = CodexOauthService;
async function sleepWithAbort(ms, signal) {
    if (ms <= 0) {
        return;
    }
    if (signal.aborted) {
        throw new Error("aborted");
    }
    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            cleanup();
            resolve();
        }, ms);
        const onAbort = () => {
            cleanup();
            reject(new Error("aborted"));
        };
        const cleanup = () => {
            clearTimeout(timeout);
            signal.removeEventListener("abort", onAbort);
        };
        signal.addEventListener("abort", onAbort);
    });
}
function escapeHtml(input) {
    return input
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
//# sourceMappingURL=codexOauthService.js.map