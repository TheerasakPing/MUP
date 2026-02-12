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
exports.createOrpcServer = createOrpcServer;
/**
 * oRPC Server factory for mux.
 * Serves oRPC router over HTTP and WebSocket.
 *
 * This module exports the server creation logic so it can be tested.
 * The CLI entry point (server.ts) uses this to start the server.
 */
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs/promises"));
const http = __importStar(require("http"));
const path = __importStar(require("path"));
const ws_1 = require("ws");
const node_1 = require("@orpc/server/node");
const ws_2 = require("@orpc/server/ws");
const server_1 = require("@orpc/server");
const openapi_1 = require("@orpc/openapi");
const node_2 = require("@orpc/openapi/node");
const zod4_1 = require("@orpc/zod/zod4");
const router_1 = require("../../node/orpc/router");
const authMiddleware_1 = require("../../node/orpc/authMiddleware");
const version_1 = require("../../version");
const formatOrpcError_1 = require("../../node/orpc/formatOrpcError");
const log_1 = require("../../node/services/log");
const streamErrors_1 = require("../../node/utils/streamErrors");
const WS_HEARTBEAT_INTERVAL_MS = 30_000;
// --- Server Factory ---
function formatHostForUrl(host) {
    const trimmed = host.trim();
    // IPv6 URLs must be bracketed: http://[::1]:1234
    if (trimmed.includes(":")) {
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            return trimmed;
        }
        // If the host contains a zone index (e.g. fe80::1%en0), percent must be encoded.
        const escaped = trimmed.replaceAll("%", "%25");
        return `[${escaped}]`;
    }
    return trimmed;
}
function extractBearerToken(header) {
    if (!header?.toLowerCase().startsWith("bearer "))
        return null;
    const token = header.slice(7).trim();
    return token.length ? token : null;
}
function injectBaseHref(indexHtml, baseHref) {
    // Avoid double-injecting if the HTML already has a base tag.
    if (/<base\b/i.test(indexHtml)) {
        return indexHtml;
    }
    // Insert immediately after the opening <head> tag (supports <head> and <head ...attrs>).
    return indexHtml.replace(/<head[^>]*>/i, (match) => `${match}\n    <base href="${baseHref}" />`);
}
function escapeJsonForHtmlScript(value) {
    // Prevent `</script>` injection when embedding untrusted strings in an inline <script>.
    return JSON.stringify(value).replaceAll("<", "\\u003c");
}
function escapeHtml(input) {
    return input
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
/**
 * Create an oRPC server with HTTP and WebSocket endpoints.
 *
 * HTTP endpoint: /orpc
 * WebSocket endpoint: /orpc/ws
 * Health check: /health
 * Version: /version
 */
async function createOrpcServer({ host = "127.0.0.1", port = 0, authToken, context, serveStatic = false, 
// From dist/node/orpc/, go up 2 levels to reach dist/ where index.html lives
staticDir = path.join(__dirname, "../.."), onOrpcError = (error, options) => {
    // Auth failures are expected in browser mode while the user enters the token.
    // Avoid spamming error logs with stack traces on every unauthenticated request.
    if (error instanceof server_1.ORPCError && error.code === "UNAUTHORIZED") {
        log_1.log.debug("ORPC unauthorized request");
        return;
    }
    const formatted = (0, formatOrpcError_1.formatOrpcError)(error, options);
    log_1.log.error(formatted.message);
    if (log_1.log.isDebugMode()) {
        const suffix = Math.random().toString(16).slice(2);
        log_1.log.debug_obj(`orpc/${Date.now()}_${suffix}.json`, formatted.debugDump);
    }
}, router: existingRouter, }) {
    // Express app setup
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    // OAuth providers may use POST redirects (307/308) or response_mode=form_post.
    // Support both JSON API requests and form-encoded callback payloads.
    app.use(express_1.default.json({ limit: "50mb" }));
    app.use(express_1.default.urlencoded({ extended: false }));
    let spaIndexHtml = null;
    // Static file serving (optional)
    if (serveStatic) {
        try {
            const indexHtmlPath = path.join(staticDir, "index.html");
            const indexHtml = await fs.readFile(indexHtmlPath, "utf8");
            spaIndexHtml = injectBaseHref(indexHtml, "/");
        }
        catch (error) {
            log_1.log.error("Failed to read index.html for SPA fallback:", error);
        }
        app.use(express_1.default.static(staticDir));
    }
    // Serve icon theme files (SVG, PNG, etc.) from ~/.mux/icon-themes/
    {
        const iconThemesDir = context.iconThemeService.getIconThemesDir();
        app.use("/icon-themes", express_1.default.static(iconThemesDir, {
            maxAge: "1d",
            immutable: true,
            setHeaders: (res, filePath) => {
                // Set correct Content-Type for SVGs
                if (filePath.endsWith(".svg")) {
                    res.setHeader("Content-Type", "image/svg+xml");
                }
            },
        }));
    }
    // Health check endpoint
    app.get("/health", (_req, res) => {
        res.json({ status: "ok" });
    });
    // Version endpoint
    app.get("/version", (_req, res) => {
        res.json({ ...version_1.VERSION, mode: "server" });
    });
    function getStringParamFromQueryOrBody(req, key) {
        const queryValue = req.query[key];
        if (typeof queryValue === "string")
            return queryValue;
        const bodyRecord = req.body;
        const bodyValue = bodyRecord?.[key];
        return typeof bodyValue === "string" ? bodyValue : null;
    }
    // --- Mux Gateway OAuth (unauthenticated bootstrap routes) ---
    // These are raw Express routes (not oRPC) because the OAuth provider cannot
    // send a mux Bearer token during the redirect callback.
    app.get("/auth/mux-gateway/start", (req, res) => {
        if (authToken?.trim()) {
            const expectedToken = authToken.trim();
            const presentedToken = extractBearerToken(req.header("authorization"));
            if (!presentedToken || !(0, authMiddleware_1.safeEq)(presentedToken, expectedToken)) {
                res.status(401).json({ error: "Invalid or missing auth token" });
                return;
            }
        }
        const hostHeader = req.get("x-forwarded-host") ?? req.get("host");
        const host = hostHeader?.split(",")[0]?.trim();
        if (!host) {
            res.status(400).json({ error: "Missing Host header" });
            return;
        }
        // When mux is running behind a reverse proxy, the terminating proxy may set
        // X-Forwarded-Proto / X-Forwarded-Host, while the direct connection to mux
        // is plain HTTP.
        const protoHeader = req.get("x-forwarded-proto");
        const forwardedProto = protoHeader?.split(",")[0]?.trim();
        const proto = forwardedProto?.length ? forwardedProto : req.protocol;
        const redirectUri = `${proto}://${host}/auth/mux-gateway/callback`;
        const { authorizeUrl, state } = context.muxGatewayOauthService.startServerFlow({ redirectUri });
        res.json({ authorizeUrl, state });
    });
    app.all("/auth/mux-gateway/callback", async (req, res) => {
        // Some providers use 307/308 redirects that preserve POST, or response_mode=form_post.
        if (req.method !== "GET" && req.method !== "POST") {
            res.sendStatus(405);
            return;
        }
        const state = getStringParamFromQueryOrBody(req, "state");
        const code = getStringParamFromQueryOrBody(req, "code");
        const error = getStringParamFromQueryOrBody(req, "error");
        const errorDescription = getStringParamFromQueryOrBody(req, "error_description") ?? undefined;
        const result = await context.muxGatewayOauthService.handleServerCallbackAndExchange({
            state,
            code,
            error,
            errorDescription,
        });
        const payload = {
            type: "mux-gateway-oauth",
            state,
            ok: result.success,
            error: result.success ? null : result.error,
        };
        const payloadJson = escapeJsonForHtmlScript(payload);
        const title = result.success ? "Login complete" : "Login failed";
        const description = result.success
            ? "You can return to Mux. You may now close this tab."
            : payload.error
                ? escapeHtml(payload.error)
                : "An unknown error occurred.";
        const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark light" />
    <meta name="theme-color" content="#0e0e0e" />
    <title>${title}</title>
    <link rel="stylesheet" href="https://gateway.mux.coder.com/static/css/site.css" />
  </head>
  <body>
    <div class="page">
      <header class="site-header">
        <div class="container">
          <div class="header-title">mux</div>
        </div>
      </header>

      <main class="site-main">
        <div class="container">
          <div class="content-surface">
            <h1>${title}</h1>
            <p>${description}</p>
            ${result.success ? '<p class="muted">This tab should close automatically.</p>' : ""}
            <p><a class="btn primary" href="/">Return to Mux</a></p>
          </div>
        </div>
      </main>
    </div>

    <script>
      (() => {
        const payload = ${payloadJson};
        const ok = payload.ok === true;

        try {
          if (window.opener && typeof window.opener.postMessage === "function") {
            window.opener.postMessage(payload, "*");
          }
        } catch {
          // Ignore postMessage failures.
        }

        if (!ok) {
          return;
        }

        try {
          if (window.opener && typeof window.opener.focus === "function") {
            window.opener.focus();
          }
        } catch {
          // Ignore focus failures.
        }

        try {
          window.close();
        } catch {
          // Ignore close failures.
        }

        setTimeout(() => {
          try {
            window.close();
          } catch {
            // Ignore close failures.
          }
        }, 50);

        setTimeout(() => {
          try {
            window.location.replace("/");
          } catch {
            // Ignore navigation failures.
          }
        }, 150);
      })();
    </script>
  </body>
</html>`;
        res.status(result.success ? 200 : 400);
        res.setHeader("Content-Type", "text/html");
        res.send(html);
    });
    // --- Mux Governor OAuth (unauthenticated bootstrap routes) ---
    // Similar to Mux Gateway OAuth but accepts user-provided governorUrl.
    app.get("/auth/mux-governor/start", (req, res) => {
        if (authToken?.trim()) {
            const expectedToken = authToken.trim();
            const presentedToken = extractBearerToken(req.header("authorization"));
            if (!presentedToken || !(0, authMiddleware_1.safeEq)(presentedToken, expectedToken)) {
                res.status(401).json({ error: "Invalid or missing auth token" });
                return;
            }
        }
        const governorUrl = typeof req.query.governorUrl === "string" ? req.query.governorUrl : null;
        if (!governorUrl) {
            res.status(400).json({ error: "Missing governorUrl query parameter" });
            return;
        }
        const hostHeader = req.get("x-forwarded-host") ?? req.get("host");
        const host = hostHeader?.split(",")[0]?.trim();
        if (!host) {
            res.status(400).json({ error: "Missing Host header" });
            return;
        }
        const protoHeader = req.get("x-forwarded-proto");
        const forwardedProto = protoHeader?.split(",")[0]?.trim();
        const proto = forwardedProto?.length ? forwardedProto : req.protocol;
        const redirectUri = `${proto}://${host}/auth/mux-governor/callback`;
        const result = context.muxGovernorOauthService.startServerFlow({
            governorOrigin: governorUrl,
            redirectUri,
        });
        if (!result.success) {
            res.status(400).json({ error: result.error });
            return;
        }
        res.json({ authorizeUrl: result.data.authorizeUrl, state: result.data.state });
    });
    app.all("/auth/mux-governor/callback", async (req, res) => {
        // Some providers use 307/308 redirects that preserve POST, or response_mode=form_post.
        if (req.method !== "GET" && req.method !== "POST") {
            res.sendStatus(405);
            return;
        }
        const state = getStringParamFromQueryOrBody(req, "state");
        const code = getStringParamFromQueryOrBody(req, "code");
        const error = getStringParamFromQueryOrBody(req, "error");
        const errorDescription = getStringParamFromQueryOrBody(req, "error_description") ?? undefined;
        log_1.log.debug("Governor OAuth callback received", {
            method: req.method,
            state,
            hasCode: typeof code === "string" && code.length > 0,
            hasError: typeof error === "string" && error.length > 0,
        });
        const result = await context.muxGovernorOauthService.handleServerCallbackAndExchange({
            state,
            code,
            error,
            errorDescription,
        });
        const payload = {
            type: "mux-governor-oauth",
            state,
            ok: result.success,
            error: result.success ? null : result.error,
        };
        const payloadJson = escapeJsonForHtmlScript(payload);
        const title = result.success ? "Enrollment complete" : "Enrollment failed";
        const description = result.success
            ? "You can return to Mux. You may now close this tab."
            : payload.error
                ? escapeHtml(payload.error)
                : "An unknown error occurred.";
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
      .btn { display: inline-block; padding: 0.5rem 1rem; background: #333; color: #fff; text-decoration: none; border-radius: 4px; }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <p>${description}</p>
    ${result.success ? '<p class="muted">This tab should close automatically.</p>' : ""}
    <p><a class="btn" href="/">Return to Mux</a></p>

    <script>
      (() => {
        const payload = ${payloadJson};
        const ok = payload.ok === true;

        try {
          if (window.opener && typeof window.opener.postMessage === "function") {
            window.opener.postMessage(payload, "*");
          }
        } catch {
          // Ignore postMessage failures.
        }

        if (!ok) {
          return;
        }

        try {
          if (window.opener && typeof window.opener.focus === "function") {
            window.opener.focus();
          }
        } catch {
          // Ignore focus failures.
        }

        try {
          window.close();
        } catch {
          // Ignore close failures.
        }

        setTimeout(() => {
          try {
            window.close();
          } catch {
            // Ignore close failures.
          }
        }, 50);

        setTimeout(() => {
          try {
            window.location.replace("/");
          } catch {
            // Ignore navigation failures.
          }
        }, 150);
      })();
    </script>
  </body>
</html>`;
        res.status(result.success ? 200 : 400);
        res.setHeader("Content-Type", "text/html");
        res.send(html);
    });
    // --- MCP OAuth (unauthenticated redirect callback) ---
    // The OAuth provider cannot attach a mux Bearer token during redirects.
    app.all("/auth/mcp-oauth/callback", async (req, res) => {
        // Some providers use 307/308 redirects that preserve POST, or response_mode=form_post.
        if (req.method !== "GET" && req.method !== "POST") {
            res.sendStatus(405);
            return;
        }
        const state = getStringParamFromQueryOrBody(req, "state");
        const code = getStringParamFromQueryOrBody(req, "code");
        const error = getStringParamFromQueryOrBody(req, "error");
        const errorDescription = getStringParamFromQueryOrBody(req, "error_description") ?? undefined;
        const result = await context.mcpOauthService.handleServerCallbackAndExchange({
            state,
            code,
            error,
            errorDescription,
        });
        const payload = {
            type: "mcp-oauth",
            state,
            ok: result.success,
            error: result.success ? null : result.error,
        };
        const payloadJson = escapeJsonForHtmlScript(payload);
        const title = result.success ? "Login complete" : "Login failed";
        const description = result.success
            ? "You can return to Mux. You may now close this tab."
            : payload.error
                ? escapeHtml(payload.error)
                : "An unknown error occurred.";
        const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark light" />
    <meta name="theme-color" content="#0e0e0e" />
    <title>${title}</title>
    <link rel="stylesheet" href="https://gateway.mux.coder.com/static/css/site.css" />
  </head>
  <body>
    <div class="page">
      <header class="site-header">
        <div class="container">
          <div class="header-title">mux</div>
        </div>
      </header>

      <main class="site-main">
        <div class="container">
          <div class="content-surface">
            <h1>${title}</h1>
            <p>${description}</p>
            ${result.success ? '<p class="muted">This tab should close automatically.</p>' : ""}
            <p><a class="btn primary" href="/">Return to Mux</a></p>
          </div>
        </div>
      </main>
    </div>

    <script>
      (() => {
        const payload = ${payloadJson};
        const ok = payload.ok === true;

        try {
          if (window.opener && typeof window.opener.postMessage === "function") {
            window.opener.postMessage(payload, "*");
          }
        } catch {
          // Ignore postMessage failures.
        }

        if (!ok) {
          return;
        }

        try {
          if (window.opener && typeof window.opener.focus === "function") {
            window.opener.focus();
          }
        } catch {
          // Ignore focus failures.
        }

        try {
          window.close();
        } catch {
          // Ignore close failures.
        }

        setTimeout(() => {
          try {
            window.close();
          } catch {
            // Ignore close failures.
          }
        }, 50);

        setTimeout(() => {
          try {
            window.location.replace("/");
          } catch {
            // Ignore navigation failures.
          }
        }, 150);
      })();
    </script>
  </body>
</html>`;
        res.status(result.success ? 200 : 400);
        res.setHeader("Content-Type", "text/html");
        res.send(html);
    });
    const orpcRouter = existingRouter ?? (0, router_1.router)(authToken);
    // OpenAPI generator for spec endpoint
    const openAPIGenerator = new openapi_1.OpenAPIGenerator({
        schemaConverters: [new zod4_1.ZodToJsonSchemaConverter()],
    });
    // OpenAPI spec endpoint
    app.get("/api/spec.json", async (_req, res) => {
        const versionRecord = version_1.VERSION;
        const gitDescribe = typeof versionRecord.git_describe === "string" ? versionRecord.git_describe : "unknown";
        const spec = await openAPIGenerator.generate(orpcRouter, {
            info: {
                title: "Mux API",
                version: gitDescribe,
                description: "API for Mux",
            },
            servers: [{ url: "/api" }],
            security: authToken ? [{ bearerAuth: [] }] : undefined,
            components: authToken
                ? {
                    securitySchemes: {
                        bearerAuth: {
                            type: "http",
                            scheme: "bearer",
                        },
                    },
                }
                : undefined,
        });
        res.json(spec);
    });
    // Scalar API reference UI
    app.get("/api/docs", (_req, res) => {
        const html = `<!doctype html>
<html>
  <head>
    <title>mux API Reference</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <script>
      Scalar.createApiReference('#app', {
        url: '/api/spec.json',
        ${authToken ? "authentication: { securitySchemes: { bearerAuth: { token: '' } } }," : ""}
      })
    </script>
  </body>
</html>`;
        res.setHeader("Content-Type", "text/html");
        res.send(html);
    });
    // OpenAPI REST handler (for Scalar/OpenAPI clients)
    const openAPIHandler = new node_2.OpenAPIHandler(orpcRouter, {
        interceptors: [(0, server_1.onError)(onOrpcError)],
    });
    app.use("/api", async (req, res, next) => {
        // Skip spec.json and docs routes - they're handled above
        if (req.path === "/spec.json" || req.path === "/docs") {
            return next();
        }
        const { matched } = await openAPIHandler.handle(req, res, {
            prefix: "/api",
            context: { ...context, headers: req.headers },
        });
        if (matched)
            return;
        next();
    });
    // oRPC HTTP handler
    const orpcHandler = new node_1.RPCHandler(orpcRouter, {
        interceptors: [(0, server_1.onError)(onOrpcError)],
    });
    // Mount ORPC handler on /orpc and all subpaths
    app.use("/orpc", async (req, res, next) => {
        const { matched } = await orpcHandler.handle(req, res, {
            prefix: "/orpc",
            context: { ...context, headers: req.headers },
        });
        if (matched)
            return;
        next();
    });
    // SPA fallback (optional, only for non-API routes)
    if (serveStatic) {
        app.use((req, res, next) => {
            // Don't swallow API/ORPC routes with index.html.
            if (req.path.startsWith("/orpc") || req.path.startsWith("/api")) {
                return next();
            }
            if (spaIndexHtml !== null) {
                res.setHeader("Content-Type", "text/html");
                res.send(spaIndexHtml);
                return;
            }
            // If the server was started with serveStatic enabled but the frontend build
            // hasn't been generated (common in `make dev-server`), avoid throwing noisy
            // NotFoundError stack traces. Let the request fall through to a normal 404.
            next();
        });
    }
    // Create HTTP server
    const httpServer = http.createServer(app);
    // Avoid process crashes from unhandled socket/server errors.
    (0, streamErrors_1.attachStreamErrorHandler)(httpServer, "orpc-http-server", { logger: log_1.log });
    httpServer.on("clientError", (error, socket) => {
        if ((0, streamErrors_1.isIgnorableStreamError)(error)) {
            socket.destroy();
            return;
        }
        const message = error instanceof Error ? error.message : String(error);
        const code = error && typeof error === "object" && "code" in error && typeof error.code === "string"
            ? error.code
            : undefined;
        log_1.log.warn("ORPC HTTP client error", { code, message });
        try {
            socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
        }
        catch {
            socket.destroy();
        }
    });
    // oRPC WebSocket handler
    const wsServer = new ws_1.WebSocketServer({ server: httpServer, path: "/orpc/ws" });
    (0, streamErrors_1.attachStreamErrorHandler)(wsServer, "orpc-ws-server", { logger: log_1.log });
    // WebSocket heartbeat: proactively terminate half-open connections (common with NAT/proxy setups).
    // When a client is unresponsive, closing the socket forces the browser to reconnect.
    const heartbeatInterval = setInterval(() => {
        for (const ws of wsServer.clients) {
            const socket = ws;
            if (socket.isAlive === false) {
                ws.terminate();
                continue;
            }
            socket.isAlive = false;
            try {
                ws.ping();
            }
            catch {
                // Best-effort - ws may already be closing.
            }
        }
    }, WS_HEARTBEAT_INTERVAL_MS);
    const orpcWsHandler = new ws_2.RPCHandler(orpcRouter, {
        interceptors: [(0, server_1.onError)(onOrpcError)],
    });
    wsServer.on("connection", (ws, req) => {
        const terminate = () => {
            try {
                ws.terminate();
            }
            catch {
                // Best-effort.
            }
        };
        (0, streamErrors_1.attachStreamErrorHandler)(ws, "orpc-ws-connection", {
            logger: log_1.log,
            onIgnorable: terminate,
            onUnexpected: terminate,
        });
        const socket = ws;
        socket.isAlive = true;
        ws.on("pong", () => {
            socket.isAlive = true;
        });
        const headers = (0, authMiddleware_1.extractWsHeaders)(req);
        void orpcWsHandler.upgrade(ws, { context: { ...context, headers } });
    });
    // Start listening
    await new Promise((resolve, reject) => {
        const onListenError = (error) => {
            httpServer.removeListener("error", onListenError);
            reject(error);
        };
        httpServer.once("error", onListenError);
        httpServer.listen(port, host, () => {
            httpServer.removeListener("error", onListenError);
            resolve();
        });
    });
    // Get actual port (useful when port=0)
    const address = httpServer.address();
    if (!address || typeof address === "string") {
        throw new Error("Failed to get server address");
    }
    const actualPort = address.port;
    // Wildcard addresses (0.0.0.0, ::) are not routable - convert to loopback for lockfile
    const connectableHost = host === "0.0.0.0" || host === "::" ? "127.0.0.1" : host;
    const connectableHostForUrl = formatHostForUrl(connectableHost);
    return {
        httpServer,
        wsServer,
        app,
        port: actualPort,
        baseUrl: `http://${connectableHostForUrl}:${actualPort}`,
        wsUrl: `ws://${connectableHostForUrl}:${actualPort}/orpc/ws`,
        specUrl: `http://${connectableHostForUrl}:${actualPort}/api/spec.json`,
        docsUrl: `http://${connectableHostForUrl}:${actualPort}/api/docs`,
        close: async () => {
            clearInterval(heartbeatInterval);
            for (const ws of wsServer.clients) {
                ws.terminate();
            }
            // Close WebSocket server first
            await new Promise((resolve) => {
                wsServer.close(() => resolve());
            });
            // Then close HTTP server
            httpServer.closeIdleConnections?.();
            httpServer.closeAllConnections?.();
            if (httpServer.listening) {
                await new Promise((resolve, reject) => {
                    httpServer.close((err) => (err ? reject(err) : resolve()));
                });
            }
        },
    };
}
//# sourceMappingURL=server.js.map