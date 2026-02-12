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
const bun_test_1 = require("bun:test");
const http_1 = require("http");
const fs = __importStar(require("fs/promises"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const config_1 = require("../../node/config");
const mcpConfigService_1 = require("./mcpConfigService");
const mcpOauthService_1 = require("./mcpOauthService");
function getStoreFilePath(muxHome) {
    return path.join(muxHome, "mcp-oauth.json");
}
(0, bun_test_1.describe)("McpOauthService store", () => {
    let muxHome;
    let projectPath;
    let config;
    let mcpConfigService;
    let service;
    const serverName = "test-server";
    const serverUrl = "https://example.com";
    (0, bun_test_1.beforeEach)(async () => {
        muxHome = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-oauth-home-"));
        projectPath = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-oauth-project-"));
        config = new config_1.Config(muxHome);
        mcpConfigService = new mcpConfigService_1.MCPConfigService(config);
        service = new mcpOauthService_1.McpOauthService(config, mcpConfigService);
        const addResult = await mcpConfigService.addServer(serverName, {
            transport: "http",
            url: serverUrl,
        });
        (0, bun_test_1.expect)(addResult).toEqual({ success: true, data: undefined });
    });
    (0, bun_test_1.afterEach)(async () => {
        await service.dispose();
        await fs.rm(muxHome, { recursive: true, force: true });
        await fs.rm(projectPath, { recursive: true, force: true });
    });
    async function readStoreFile() {
        const raw = await fs.readFile(getStoreFilePath(muxHome), "utf-8");
        return JSON.parse(raw);
    }
    (0, bun_test_1.test)("reading corrupt JSON store self-heals to empty", async () => {
        await fs.writeFile(getStoreFilePath(muxHome), "{ definitely not valid json", "utf-8");
        const status = await service.getAuthStatus({ serverUrl });
        (0, bun_test_1.expect)(status).toEqual({
            serverUrl: "https://example.com/",
            isLoggedIn: false,
            hasRefreshToken: false,
            scope: undefined,
            updatedAtMs: undefined,
        });
        // The invalid store file should be overwritten with a minimal empty store.
        (0, bun_test_1.expect)(await readStoreFile()).toEqual({ version: 2, entries: {} });
    });
    (0, bun_test_1.test)("migrates v1 store to v2 (dedupes by updatedAtMs)", async () => {
        const otherProjectPath = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-oauth-project2-"));
        try {
            const v1Store = {
                version: 1,
                entries: {
                    [projectPath]: {
                        // Older duplicate for the same server URL.
                        [serverName]: {
                            serverUrl,
                            updatedAtMs: 1_000,
                            clientInformation: {
                                client_id: "client-id-old",
                            },
                            tokens: {
                                access_token: "access-token-old",
                                token_type: "Bearer",
                                refresh_token: "refresh-token-old",
                            },
                        },
                        // Newer duplicate for the same server URL.
                        duplicate: {
                            serverUrl,
                            updatedAtMs: 2_000,
                            clientInformation: {
                                client_id: "client-id-new",
                            },
                            tokens: {
                                access_token: "access-token-new",
                                token_type: "Bearer",
                                refresh_token: "refresh-token-new",
                            },
                        },
                    },
                    [otherProjectPath]: {
                        other: {
                            serverUrl: "https://other.example.com/mcp/",
                            updatedAtMs: 1_500,
                            clientInformation: {
                                client_id: "client-id-other",
                            },
                            tokens: {
                                access_token: "access-token-other",
                                token_type: "Bearer",
                            },
                        },
                    },
                },
            };
            await fs.writeFile(getStoreFilePath(muxHome), JSON.stringify(v1Store), "utf-8");
            // Trigger store load + migration.
            await service.getAuthStatus({ serverUrl });
            (0, bun_test_1.expect)(await readStoreFile()).toEqual({
                version: 2,
                entries: {
                    "https://example.com/": {
                        serverUrl: "https://example.com/",
                        updatedAtMs: 2_000,
                        clientInformation: {
                            client_id: "client-id-new",
                        },
                        tokens: {
                            access_token: "access-token-new",
                            token_type: "Bearer",
                            refresh_token: "refresh-token-new",
                        },
                    },
                    "https://other.example.com/mcp": {
                        serverUrl: "https://other.example.com/mcp",
                        updatedAtMs: 1_500,
                        clientInformation: {
                            client_id: "client-id-other",
                        },
                        tokens: {
                            access_token: "access-token-other",
                            token_type: "Bearer",
                        },
                    },
                },
            });
        }
        finally {
            await fs.rm(otherProjectPath, { recursive: true, force: true });
        }
    });
    (0, bun_test_1.test)("set/get/clear works via hasAuthTokens + logout", async () => {
        const populatedStore = {
            version: 2,
            entries: {
                "https://example.com/": {
                    serverUrl,
                    updatedAtMs: Date.now(),
                    clientInformation: {
                        client_id: "client-id",
                    },
                    tokens: {
                        access_token: "access-token",
                        token_type: "Bearer",
                        refresh_token: "refresh-token",
                        scope: "mcp.read",
                    },
                },
            },
        };
        await fs.writeFile(getStoreFilePath(muxHome), JSON.stringify(populatedStore), "utf-8");
        (0, bun_test_1.expect)(await service.hasAuthTokens({
            serverUrl,
        })).toBe(true);
        const status = await service.getAuthStatus({ serverUrl });
        (0, bun_test_1.expect)(typeof status.updatedAtMs).toBe("number");
        (0, bun_test_1.expect)(status).toEqual({
            serverUrl: "https://example.com/",
            isLoggedIn: true,
            hasRefreshToken: true,
            scope: "mcp.read",
            updatedAtMs: status.updatedAtMs,
        });
        const logoutResult = await service.logout({ serverUrl });
        (0, bun_test_1.expect)(logoutResult).toEqual({ success: true, data: undefined });
        (0, bun_test_1.expect)(await service.hasAuthTokens({
            serverUrl,
        })).toBe(false);
        (0, bun_test_1.expect)(await readStoreFile()).toEqual({ version: 2, entries: {} });
    });
});
(0, bun_test_1.describe)("parseBearerWwwAuthenticate", () => {
    (0, bun_test_1.test)("extracts scope and resource_metadata", () => {
        const header = 'Bearer realm="example", scope="mcp.read mcp.write", resource_metadata="https://example.com/.well-known/oauth-protected-resource"';
        const challenge = (0, mcpOauthService_1.parseBearerWwwAuthenticate)(header);
        (0, bun_test_1.expect)(challenge).not.toBeNull();
        (0, bun_test_1.expect)(challenge?.scope).toBe("mcp.read mcp.write");
        (0, bun_test_1.expect)(challenge?.resourceMetadataUrl?.toString()).toBe("https://example.com/.well-known/oauth-protected-resource");
    });
    (0, bun_test_1.test)("extracts unquoted scope and resource_metadata", () => {
        const header = "Bearer scope=mcp.read resource_metadata=http://example.com/.well-known/oauth-protected-resource";
        const challenge = (0, mcpOauthService_1.parseBearerWwwAuthenticate)(header);
        (0, bun_test_1.expect)(challenge).not.toBeNull();
        (0, bun_test_1.expect)(challenge?.scope).toBe("mcp.read");
        (0, bun_test_1.expect)(challenge?.resourceMetadataUrl?.toString()).toBe("http://example.com/.well-known/oauth-protected-resource");
    });
    (0, bun_test_1.test)("returns null for non-bearer challenges", () => {
        (0, bun_test_1.expect)((0, mcpOauthService_1.parseBearerWwwAuthenticate)('Basic realm="example"')).toBeNull();
    });
    (0, bun_test_1.test)("ignores invalid resource_metadata URLs", () => {
        const header = 'Bearer scope="mcp.read" resource_metadata="not a url"';
        const challenge = (0, mcpOauthService_1.parseBearerWwwAuthenticate)(header);
        (0, bun_test_1.expect)(challenge).not.toBeNull();
        (0, bun_test_1.expect)(challenge?.scope).toBe("mcp.read");
        (0, bun_test_1.expect)(challenge?.resourceMetadataUrl).toBeUndefined();
    });
});
(0, bun_test_1.describe)("McpOauthService.startDesktopFlow", () => {
    let muxHome;
    let projectPath;
    let config;
    let mcpConfigService;
    let service;
    (0, bun_test_1.beforeEach)(async () => {
        muxHome = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-oauth-flow-home-"));
        projectPath = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-oauth-flow-project-"));
        config = new config_1.Config(muxHome);
        mcpConfigService = new mcpConfigService_1.MCPConfigService(config);
        service = new mcpOauthService_1.McpOauthService(config, mcpConfigService);
    });
    (0, bun_test_1.afterEach)(async () => {
        await service.dispose();
        await fs.rm(muxHome, { recursive: true, force: true });
        await fs.rm(projectPath, { recursive: true, force: true });
    });
    (0, bun_test_1.test)("generates an authorizeUrl with PKCE S256 + RFC 8707 resource", async () => {
        let baseUrl = "";
        let resourceMetadataUrl = "";
        const server = (0, http_1.createServer)((req, res) => {
            void (async () => {
                const pathname = (req.url ?? "/").split("?")[0];
                if (pathname === "/.well-known/oauth-protected-resource") {
                    res.writeHead(200, { "content-type": "application/json" });
                    res.end(JSON.stringify({
                        resource: baseUrl,
                        authorization_servers: [baseUrl],
                    }));
                    return;
                }
                if (pathname === "/.well-known/oauth-authorization-server") {
                    res.writeHead(200, { "content-type": "application/json" });
                    res.end(JSON.stringify({
                        issuer: baseUrl,
                        authorization_endpoint: `${baseUrl}authorize`,
                        token_endpoint: `${baseUrl}token`,
                        registration_endpoint: `${baseUrl}register`,
                        response_types_supported: ["code"],
                        code_challenge_methods_supported: ["S256"],
                    }));
                    return;
                }
                if (pathname === "/register") {
                    let raw = "";
                    for await (const chunk of req) {
                        raw += Buffer.from(chunk).toString("utf-8");
                    }
                    const clientMetadata = JSON.parse(raw);
                    res.writeHead(200, { "content-type": "application/json" });
                    res.end(JSON.stringify({
                        ...clientMetadata,
                        client_id: "test-client-id",
                    }));
                    return;
                }
                // Default: act like an MCP server requiring OAuth.
                res.statusCode = 401;
                res.setHeader("WWW-Authenticate", `Bearer scope="mcp.read" resource_metadata="${resourceMetadataUrl}"`);
                res.end("Unauthorized");
            })();
        });
        await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
        try {
            const address = server.address();
            if (!address || typeof address === "string") {
                throw new Error("Failed to bind OAuth test server");
            }
            baseUrl = `http://127.0.0.1:${address.port}/`;
            resourceMetadataUrl = `${baseUrl}.well-known/oauth-protected-resource`;
            const serverName = "oauth-server";
            const addResult = await mcpConfigService.addServer(serverName, {
                transport: "http",
                url: baseUrl,
            });
            (0, bun_test_1.expect)(addResult).toEqual({ success: true, data: undefined });
            const startResult = await service.startDesktopFlow({ projectPath, serverName });
            (0, bun_test_1.expect)(startResult.success).toBe(true);
            if (!startResult.success) {
                throw new Error(startResult.error);
            }
            const authorizeUrl = new URL(startResult.data.authorizeUrl);
            (0, bun_test_1.expect)(authorizeUrl.searchParams.get("code_challenge_method")).toBe("S256");
            (0, bun_test_1.expect)(authorizeUrl.searchParams.get("resource")).toBe(baseUrl);
            // Clean up the loopback listener (no callback will occur during this test).
            await service.cancelDesktopFlow(startResult.data.flowId);
        }
        finally {
            await new Promise((resolve) => server.close(() => resolve()));
        }
    });
    (0, bun_test_1.test)("preserves trailing slashes for OAuth discovery under a base path", async () => {
        let baseUrl = "";
        let resourceMetadataUrl = "";
        let authorizationServerBaseUrl = "";
        const seenPaths = [];
        const server = (0, http_1.createServer)((req, res) => {
            void (async () => {
                const pathname = (req.url ?? "/").split("?")[0];
                seenPaths.push(pathname);
                if (pathname === "/.well-known/oauth-authorization-server") {
                    res.writeHead(200, { "content-type": "application/json" });
                    res.end(JSON.stringify({
                        issuer: authorizationServerBaseUrl,
                        authorization_endpoint: `${authorizationServerBaseUrl}authorize`,
                        token_endpoint: `${authorizationServerBaseUrl}token`,
                        registration_endpoint: `${authorizationServerBaseUrl}register`,
                        response_types_supported: ["code"],
                        code_challenge_methods_supported: ["S256"],
                    }));
                    return;
                }
                if (pathname === "/register") {
                    let raw = "";
                    for await (const chunk of req) {
                        raw += Buffer.from(chunk).toString("utf-8");
                    }
                    const clientMetadata = JSON.parse(raw);
                    res.writeHead(200, { "content-type": "application/json" });
                    res.end(JSON.stringify({
                        ...clientMetadata,
                        client_id: "test-client-id",
                    }));
                    return;
                }
                if (pathname === "/mcp/.well-known/oauth-protected-resource") {
                    res.writeHead(200, { "content-type": "application/json" });
                    res.end(JSON.stringify({
                        resource: baseUrl,
                        authorization_servers: [authorizationServerBaseUrl],
                    }));
                    return;
                }
                if (pathname === "/mcp/") {
                    // Default: act like an MCP server requiring OAuth.
                    res.statusCode = 401;
                    res.setHeader("WWW-Authenticate", `Bearer scope="mcp.read" resource_metadata="${resourceMetadataUrl}"`);
                    res.end("Unauthorized");
                    return;
                }
                // Anything outside of the configured /mcp/ base path should not be used.
                res.statusCode = 404;
                res.end("Not found");
            })();
        });
        await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
        try {
            const address = server.address();
            if (!address || typeof address === "string") {
                throw new Error("Failed to bind OAuth test server");
            }
            authorizationServerBaseUrl = `http://127.0.0.1:${address.port}/`;
            baseUrl = `${authorizationServerBaseUrl}mcp/`;
            resourceMetadataUrl = `${baseUrl}.well-known/oauth-protected-resource`;
            const serverName = "oauth-server-trailing-slash";
            const addResult = await mcpConfigService.addServer(serverName, {
                transport: "http",
                url: baseUrl,
            });
            (0, bun_test_1.expect)(addResult).toEqual({ success: true, data: undefined });
            const startResult = await service.startDesktopFlow({ projectPath, serverName });
            (0, bun_test_1.expect)(startResult.success).toBe(true);
            if (!startResult.success) {
                throw new Error(startResult.error);
            }
            const authorizeUrl = new URL(startResult.data.authorizeUrl);
            (0, bun_test_1.expect)(authorizeUrl.searchParams.get("resource")).toBe(baseUrl);
            // Ensure we hit the configured /mcp/ path (trailing slash required) and its resource_metadata.
            (0, bun_test_1.expect)(seenPaths).toContain("/mcp/");
            (0, bun_test_1.expect)(seenPaths).toContain("/mcp/.well-known/oauth-protected-resource");
            // Stored credentials should continue to use a normalized URL for keying.
            const storeRaw = await fs.readFile(getStoreFilePath(muxHome), "utf-8");
            const serverUrlKey = baseUrl.slice(0, -1);
            (0, bun_test_1.expect)(JSON.parse(storeRaw)).toMatchObject({
                version: 2,
                entries: {
                    [serverUrlKey]: {
                        serverUrl: serverUrlKey,
                    },
                },
            });
            // Clean up the loopback listener (no callback will occur during this test).
            await service.cancelDesktopFlow(startResult.data.flowId);
        }
        finally {
            await new Promise((resolve) => server.close(() => resolve()));
        }
    });
});
//# sourceMappingURL=mcpOauthService.test.js.map