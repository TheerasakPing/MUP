"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const result_1 = require("../../common/types/result");
const codexOauthService_1 = require("./codexOauthService");
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/** Encode a claims object into a fake JWT (header.payload.signature). */
function fakeJwt(claims) {
    const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
    return `${header}.${payload}.fakesig`;
}
/** Build a valid CodexOauthAuth that expires far in the future. */
function validAuth(overrides) {
    return {
        type: "oauth",
        access: fakeJwt({ sub: "user" }),
        refresh: "rt_test",
        expires: Date.now() + 3_600_000, // 1h from now
        ...overrides,
    };
}
/** Build a CodexOauthAuth that is already expired. */
function expiredAuth(overrides) {
    return validAuth({ expires: Date.now() - 60_000, ...overrides });
}
/** Build a mock fetch Response for token refresh. */
function mockRefreshResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}
function createMockDeps() {
    return {
        providersConfig: {},
        setConfigValueCalls: [],
        focusCalls: 0,
    };
}
function createMockConfig(deps) {
    return {
        loadProvidersConfig: () => deps.providersConfig,
    };
}
function createMockProviderService(deps) {
    return {
        setConfigValue: (provider, keyPath, value) => {
            var _a;
            deps.setConfigValueCalls.push({ provider, keyPath, value });
            // Also update the in-memory config so readStoredAuth() sees the write
            if (provider === "openai" && keyPath[0] === "codexOauth") {
                if (value === undefined) {
                    const openai = deps.providersConfig.openai;
                    if (openai) {
                        delete openai.codexOauth;
                    }
                }
                else {
                    (_a = deps.providersConfig).openai ?? (_a.openai = {});
                    deps.providersConfig.openai.codexOauth = value;
                }
            }
            return (0, result_1.Ok)(undefined);
        },
    };
}
function createMockWindowService(deps) {
    return {
        focusMainWindow: () => {
            deps.focusCalls++;
        },
    };
}
function createService(deps) {
    return new codexOauthService_1.CodexOauthService(createMockConfig(deps), createMockProviderService(deps), createMockWindowService(deps));
}
// Helper to mock globalThis.fetch without needing the `preconnect` property.
function mockFetch(fn) {
    globalThis.fetch = Object.assign(fn, {
        preconnect: (_url) => {
            // no-op in tests
        },
    });
}
// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
(0, bun_test_1.describe)("CodexOauthService", () => {
    let deps;
    let service;
    const originalFetch = globalThis.fetch;
    (0, bun_test_1.beforeEach)(() => {
        deps = createMockDeps();
        service = createService(deps);
    });
    (0, bun_test_1.afterEach)(async () => {
        globalThis.fetch = originalFetch;
        await service.dispose();
    });
    // -------------------------------------------------------------------------
    // getValidAuth - basic
    // -------------------------------------------------------------------------
    (0, bun_test_1.describe)("getValidAuth", () => {
        (0, bun_test_1.it)("returns error when no auth is stored", async () => {
            const result = await service.getValidAuth();
            (0, bun_test_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, bun_test_1.expect)(result.error).toContain("not configured");
            }
        });
        (0, bun_test_1.it)("returns stored auth when token is not expired", async () => {
            const auth = validAuth();
            deps.providersConfig = { openai: { codexOauth: auth } };
            const result = await service.getValidAuth();
            (0, bun_test_1.expect)(result.success).toBe(true);
            if (result.success) {
                (0, bun_test_1.expect)(result.data.access).toBe(auth.access);
            }
        });
    });
    // -------------------------------------------------------------------------
    // Token refresh coalescing (AsyncMutex)
    // -------------------------------------------------------------------------
    (0, bun_test_1.describe)("token refresh coalescing", () => {
        (0, bun_test_1.it)("only triggers one refresh for concurrent getValidAuth calls with expired tokens", async () => {
            const expired = expiredAuth();
            deps.providersConfig = { openai: { codexOauth: expired } };
            let fetchCallCount = 0;
            const newAccessToken = fakeJwt({ sub: "refreshed" });
            mockFetch(async () => {
                fetchCallCount++;
                // Simulate a small delay so both callers are waiting
                await new Promise((resolve) => setTimeout(resolve, 10));
                return mockRefreshResponse({
                    access_token: newAccessToken,
                    refresh_token: "rt_new",
                    expires_in: 3600,
                });
            });
            // Fire 3 concurrent calls
            const results = await Promise.all([
                service.getValidAuth(),
                service.getValidAuth(),
                service.getValidAuth(),
            ]);
            // Only ONE fetch should have happened thanks to AsyncMutex
            (0, bun_test_1.expect)(fetchCallCount).toBe(1);
            // All three results should be successful with the refreshed token
            for (const result of results) {
                (0, bun_test_1.expect)(result.success).toBe(true);
                if (result.success) {
                    (0, bun_test_1.expect)(result.data.access).toBe(newAccessToken);
                }
            }
        });
        (0, bun_test_1.it)("after refresh, all callers get the updated token", async () => {
            const expired = expiredAuth();
            deps.providersConfig = { openai: { codexOauth: expired } };
            const newAccessToken = fakeJwt({ sub: "refreshed_user" });
            mockFetch(() => Promise.resolve(mockRefreshResponse({
                access_token: newAccessToken,
                refresh_token: "rt_updated",
                expires_in: 7200,
            })));
            const result = await service.getValidAuth();
            (0, bun_test_1.expect)(result.success).toBe(true);
            if (result.success) {
                (0, bun_test_1.expect)(result.data.access).toBe(newAccessToken);
                (0, bun_test_1.expect)(result.data.refresh).toBe("rt_updated");
            }
            // Verify the auth was persisted
            const persistCall = deps.setConfigValueCalls.find((c) => c.provider === "openai" && c.keyPath[0] === "codexOauth" && c.value !== undefined);
            (0, bun_test_1.expect)(persistCall).toBeDefined();
        });
    });
    // -------------------------------------------------------------------------
    // Invalid grant cleanup
    // -------------------------------------------------------------------------
    (0, bun_test_1.describe)("invalid grant cleanup", () => {
        (0, bun_test_1.it)("calls disconnect + clears stored auth on invalid_grant response", async () => {
            const expired = expiredAuth();
            deps.providersConfig = { openai: { codexOauth: expired } };
            mockFetch(() => Promise.resolve(new Response(JSON.stringify({ error: "invalid_grant" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            })));
            const result = await service.getValidAuth();
            (0, bun_test_1.expect)(result.success).toBe(false);
            // Should have called setConfigValue to clear auth (disconnect)
            const clearCall = deps.setConfigValueCalls.find((c) => c.provider === "openai" && c.keyPath[0] === "codexOauth" && c.value === undefined);
            (0, bun_test_1.expect)(clearCall).toBeDefined();
        });
        (0, bun_test_1.it)("clears auth when error text contains 'revoked'", async () => {
            const expired = expiredAuth();
            deps.providersConfig = { openai: { codexOauth: expired } };
            mockFetch(() => Promise.resolve(new Response("Token has been revoked", {
                status: 401,
            })));
            const result = await service.getValidAuth();
            (0, bun_test_1.expect)(result.success).toBe(false);
            const clearCall = deps.setConfigValueCalls.find((c) => c.provider === "openai" && c.keyPath[0] === "codexOauth" && c.value === undefined);
            (0, bun_test_1.expect)(clearCall).toBeDefined();
        });
        (0, bun_test_1.it)("subsequent getValidAuth returns error after invalid_grant cleanup", async () => {
            const expired = expiredAuth();
            deps.providersConfig = { openai: { codexOauth: expired } };
            mockFetch(() => Promise.resolve(new Response(JSON.stringify({ error: "invalid_grant" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            })));
            // First call triggers disconnect
            await service.getValidAuth();
            // Second call should see no stored auth
            const result = await service.getValidAuth();
            (0, bun_test_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, bun_test_1.expect)(result.error).toContain("not configured");
            }
        });
    });
    // -------------------------------------------------------------------------
    // disconnect
    // -------------------------------------------------------------------------
    (0, bun_test_1.describe)("disconnect", () => {
        (0, bun_test_1.it)("clears stored codexOauth via providerService.setConfigValue", () => {
            const result = service.disconnect();
            (0, bun_test_1.expect)(result.success).toBe(true);
            (0, bun_test_1.expect)(deps.setConfigValueCalls).toHaveLength(1);
            (0, bun_test_1.expect)(deps.setConfigValueCalls[0]).toEqual({
                provider: "openai",
                keyPath: ["codexOauth"],
                value: undefined,
            });
        });
    });
    // -------------------------------------------------------------------------
    // Desktop flow basics
    // -------------------------------------------------------------------------
    (0, bun_test_1.describe)("startDesktopFlow", () => {
        (0, bun_test_1.it)("starts HTTP server and returns flowId + authorizeUrl", async () => {
            const result = await service.startDesktopFlow();
            (0, bun_test_1.expect)(result.success).toBe(true);
            if (result.success) {
                (0, bun_test_1.expect)(result.data.flowId).toBeTruthy();
                (0, bun_test_1.expect)(result.data.authorizeUrl).toContain("https://auth.openai.com/oauth/authorize");
                (0, bun_test_1.expect)(result.data.authorizeUrl).toContain("state=");
                (0, bun_test_1.expect)(result.data.authorizeUrl).toContain("code_challenge=");
                (0, bun_test_1.expect)(result.data.authorizeUrl).toContain("code_challenge_method=S256");
            }
        });
        (0, bun_test_1.it)("authorize URL contains correct parameters", async () => {
            const result = await service.startDesktopFlow();
            (0, bun_test_1.expect)(result.success).toBe(true);
            if (result.success) {
                const url = new URL(result.data.authorizeUrl);
                (0, bun_test_1.expect)(url.searchParams.get("response_type")).toBe("code");
                (0, bun_test_1.expect)(url.searchParams.get("redirect_uri")).toBe("http://localhost:1455/auth/callback");
                (0, bun_test_1.expect)(url.searchParams.get("state")).toBe(result.data.flowId);
                (0, bun_test_1.expect)(url.searchParams.get("originator")).toBe("mux");
            }
        });
        (0, bun_test_1.it)("each flow gets a unique flowId", async () => {
            const first = await service.startDesktopFlow();
            (0, bun_test_1.expect)(first.success).toBe(true);
            // Clean up the first server so the second can use port 1455
            if (first.success) {
                await service.cancelDesktopFlow(first.data.flowId);
            }
            const second = await service.startDesktopFlow();
            (0, bun_test_1.expect)(second.success).toBe(true);
            if (first.success && second.success) {
                (0, bun_test_1.expect)(first.data.flowId).not.toBe(second.data.flowId);
            }
        });
    });
    (0, bun_test_1.describe)("cancelDesktopFlow", () => {
        (0, bun_test_1.it)("resolves waitForDesktopFlow with cancellation error", async () => {
            const startResult = await service.startDesktopFlow();
            (0, bun_test_1.expect)(startResult.success).toBe(true);
            if (!startResult.success)
                return;
            const flowId = startResult.data.flowId;
            // Start waiting (don't await yet)
            const waitPromise = service.waitForDesktopFlow(flowId, { timeoutMs: 5000 });
            // Cancel the flow
            await service.cancelDesktopFlow(flowId);
            const result = await waitPromise;
            (0, bun_test_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, bun_test_1.expect)(result.error).toContain("cancelled");
            }
        });
    });
    // -------------------------------------------------------------------------
    // Token refresh preserves accountId
    // -------------------------------------------------------------------------
    (0, bun_test_1.describe)("refresh preserves accountId", () => {
        (0, bun_test_1.it)("keeps previous accountId when refreshed token has no account info", async () => {
            const expired = expiredAuth({ accountId: "acct_original" });
            deps.providersConfig = { openai: { codexOauth: expired } };
            // Refreshed token has no account id in JWT claims
            const newAccessToken = fakeJwt({ sub: "user" });
            mockFetch(() => Promise.resolve(mockRefreshResponse({
                access_token: newAccessToken,
                refresh_token: "rt_new",
                expires_in: 3600,
            })));
            const result = await service.getValidAuth();
            (0, bun_test_1.expect)(result.success).toBe(true);
            if (result.success) {
                (0, bun_test_1.expect)(result.data.accountId).toBe("acct_original");
            }
        });
    });
    // -------------------------------------------------------------------------
    // Refresh keeps old refresh token when server doesn't rotate it
    // -------------------------------------------------------------------------
    (0, bun_test_1.describe)("refresh token rotation", () => {
        (0, bun_test_1.it)("keeps old refresh token when server does not return a new one", async () => {
            const expired = expiredAuth({ refresh: "rt_keep_me" });
            deps.providersConfig = { openai: { codexOauth: expired } };
            mockFetch(() => Promise.resolve(mockRefreshResponse({
                access_token: fakeJwt({ sub: "user" }),
                expires_in: 3600,
                // No refresh_token in response
            })));
            const result = await service.getValidAuth();
            (0, bun_test_1.expect)(result.success).toBe(true);
            if (result.success) {
                (0, bun_test_1.expect)(result.data.refresh).toBe("rt_keep_me");
            }
        });
    });
});
//# sourceMappingURL=codexOauthService.test.js.map