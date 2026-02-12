"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const result_1 = require("../../common/types/result");
const copilotOauthService_1 = require("./copilotOauthService");
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/** Build a mock fetch Response with JSON body. */
function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}
/** Standard device code response from GitHub. */
function deviceCodeResponse(overrides) {
    return jsonResponse({
        verification_uri: "https://github.com/login/device",
        user_code: "ABCD-1234",
        device_code: "dc_test_123",
        interval: 0,
        ...overrides,
    });
}
/** Token success response. */
function tokenSuccessResponse(token = "ghp_test_token") {
    return jsonResponse({ access_token: token });
}
/** Polling "not yet" response. */
function authorizationPendingResponse() {
    return jsonResponse({ error: "authorization_pending" });
}
/** Models list response from Copilot API. */
function modelsResponse(models = ["gpt-5", "claude-sonnet-4"]) {
    return jsonResponse({ data: models.map((id) => ({ id })) });
}
// Helper to mock globalThis.fetch without needing the `preconnect` property.
function mockFetch(fn) {
    globalThis.fetch = Object.assign(fn, {
        preconnect: (_url) => {
            // no-op in tests
        },
    });
}
function createMockDeps() {
    return {
        setConfigCalls: [],
        setConfigResult: (0, result_1.Ok)(undefined),
        setModelsCalls: [],
        setModelsResult: (0, result_1.Ok)(undefined),
        focusCalls: 0,
    };
}
function createMockProviderService(deps) {
    return {
        setConfig: (provider, keyPath, value) => {
            deps.setConfigCalls.push({ provider, keyPath, value });
            return deps.setConfigResult;
        },
        setModels: (provider, models) => {
            deps.setModelsCalls.push({ provider, models });
            return deps.setModelsResult;
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
    return new copilotOauthService_1.CopilotOauthService(createMockProviderService(deps), createMockWindowService(deps));
}
// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
(0, bun_test_1.describe)("CopilotOauthService", () => {
    let deps;
    let service;
    const originalFetch = globalThis.fetch;
    (0, bun_test_1.beforeEach)(() => {
        deps = createMockDeps();
        service = createService(deps);
    });
    (0, bun_test_1.afterEach)(() => {
        globalThis.fetch = originalFetch;
        service.dispose();
    });
    // -------------------------------------------------------------------------
    // startDeviceFlow
    // -------------------------------------------------------------------------
    (0, bun_test_1.describe)("startDeviceFlow", () => {
        (0, bun_test_1.it)("returns flowId, verificationUri, and userCode on success", async () => {
            mockFetch(() => deviceCodeResponse());
            const result = await service.startDeviceFlow();
            (0, bun_test_1.expect)(result.success).toBe(true);
            if (result.success) {
                (0, bun_test_1.expect)(result.data.flowId).toBeTruthy();
                (0, bun_test_1.expect)(result.data.verificationUri).toBe("https://github.com/login/device");
                (0, bun_test_1.expect)(result.data.userCode).toBe("ABCD-1234");
            }
        });
        (0, bun_test_1.it)("sends request to github.com device code endpoint", async () => {
            let capturedUrl = "";
            mockFetch((input) => {
                capturedUrl = String(input);
                return deviceCodeResponse();
            });
            await service.startDeviceFlow();
            (0, bun_test_1.expect)(capturedUrl).toBe("https://github.com/login/device/code");
        });
        (0, bun_test_1.it)("returns Err when fetch response is not ok", async () => {
            mockFetch(() => new Response("Server Error", { status: 500 }));
            const result = await service.startDeviceFlow();
            (0, bun_test_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, bun_test_1.expect)(result.error).toContain("500");
            }
        });
        (0, bun_test_1.it)("returns Err when fetch throws a network error", async () => {
            mockFetch(() => {
                throw new Error("DNS resolution failed");
            });
            const result = await service.startDeviceFlow();
            (0, bun_test_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, bun_test_1.expect)(result.error).toContain("DNS resolution failed");
            }
        });
        (0, bun_test_1.it)("returns Err when response is missing required fields", async () => {
            mockFetch(() => jsonResponse({ verification_uri: "https://example.com" }));
            const result = await service.startDeviceFlow();
            (0, bun_test_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, bun_test_1.expect)(result.error).toContain("Invalid response");
            }
        });
        (0, bun_test_1.it)("each flow gets a unique flowId", async () => {
            mockFetch(() => deviceCodeResponse());
            const first = await service.startDeviceFlow();
            const second = await service.startDeviceFlow();
            (0, bun_test_1.expect)(first.success).toBe(true);
            (0, bun_test_1.expect)(second.success).toBe(true);
            if (first.success && second.success) {
                (0, bun_test_1.expect)(first.data.flowId).not.toBe(second.data.flowId);
            }
        });
    });
    // -------------------------------------------------------------------------
    // Happy path: poll → success
    // -------------------------------------------------------------------------
    (0, bun_test_1.describe)("happy path: poll → success", () => {
        (0, bun_test_1.it)("polls until access_token is returned, then persists it", async () => {
            // startDeviceFlow fetch
            let pollCount = 0;
            mockFetch((input) => {
                const url = String(input);
                if (url.includes("/login/device/code")) {
                    return deviceCodeResponse();
                }
                if (url.includes("/models")) {
                    return modelsResponse();
                }
                // Polling endpoint
                pollCount++;
                if (pollCount === 1) {
                    return authorizationPendingResponse();
                }
                return tokenSuccessResponse("ghp_final_token");
            });
            const startResult = await service.startDeviceFlow();
            (0, bun_test_1.expect)(startResult.success).toBe(true);
            if (!startResult.success)
                return;
            const waitResult = await service.waitForDeviceFlow(startResult.data.flowId, {
                timeoutMs: 30_000,
            });
            (0, bun_test_1.expect)(waitResult.success).toBe(true);
            // Verify token was persisted
            const apiKeyCall = deps.setConfigCalls.find((c) => c.provider === "github-copilot" && c.keyPath[0] === "apiKey");
            (0, bun_test_1.expect)(apiKeyCall).toBeDefined();
            (0, bun_test_1.expect)(apiKeyCall.value).toBe("ghp_final_token");
        });
        (0, bun_test_1.it)("calls focusMainWindow after successful auth", async () => {
            mockFetch((input) => {
                const url = String(input);
                if (url.includes("/login/device/code")) {
                    return deviceCodeResponse();
                }
                if (url.includes("/models")) {
                    return modelsResponse();
                }
                return tokenSuccessResponse();
            });
            const startResult = await service.startDeviceFlow();
            (0, bun_test_1.expect)(startResult.success).toBe(true);
            if (!startResult.success)
                return;
            await service.waitForDeviceFlow(startResult.data.flowId, { timeoutMs: 10_000 });
            (0, bun_test_1.expect)(deps.focusCalls).toBe(1);
        });
    });
    // -------------------------------------------------------------------------
    // slow_down response
    // -------------------------------------------------------------------------
    (0, bun_test_1.describe)("slow_down response", () => {
        (0, bun_test_1.it)("respects slow_down and eventually succeeds", async () => {
            let pollCount = 0;
            mockFetch((input) => {
                const url = String(input);
                if (url.includes("/login/device/code")) {
                    return deviceCodeResponse();
                }
                if (url.includes("/models")) {
                    return modelsResponse();
                }
                pollCount++;
                if (pollCount === 1) {
                    // slow_down: service should increase interval but continue
                    return jsonResponse({ error: "slow_down", interval: 0 });
                }
                return tokenSuccessResponse("ghp_slow_token");
            });
            const startResult = await service.startDeviceFlow();
            (0, bun_test_1.expect)(startResult.success).toBe(true);
            if (!startResult.success)
                return;
            const waitResult = await service.waitForDeviceFlow(startResult.data.flowId, {
                timeoutMs: 30_000,
            });
            (0, bun_test_1.expect)(waitResult.success).toBe(true);
            const apiKeyCall = deps.setConfigCalls.find((c) => c.provider === "github-copilot" && c.keyPath[0] === "apiKey");
            (0, bun_test_1.expect)(apiKeyCall).toBeDefined();
            (0, bun_test_1.expect)(apiKeyCall.value).toBe("ghp_slow_token");
        });
    });
    // -------------------------------------------------------------------------
    // Terminal error
    // -------------------------------------------------------------------------
    (0, bun_test_1.describe)("terminal error", () => {
        (0, bun_test_1.it)("resolves with Err on access_denied", async () => {
            mockFetch((input) => {
                const url = String(input);
                if (url.includes("/login/device/code")) {
                    return deviceCodeResponse();
                }
                return jsonResponse({ error: "access_denied" });
            });
            const startResult = await service.startDeviceFlow();
            (0, bun_test_1.expect)(startResult.success).toBe(true);
            if (!startResult.success)
                return;
            const waitResult = await service.waitForDeviceFlow(startResult.data.flowId, {
                timeoutMs: 10_000,
            });
            (0, bun_test_1.expect)(waitResult.success).toBe(false);
            if (!waitResult.success) {
                (0, bun_test_1.expect)(waitResult.error).toContain("access_denied");
            }
            // Token should NOT have been persisted
            const apiKeyCall = deps.setConfigCalls.find((c) => c.provider === "github-copilot" && c.keyPath[0] === "apiKey");
            (0, bun_test_1.expect)(apiKeyCall).toBeUndefined();
        });
        (0, bun_test_1.it)("resolves with Err on expired_token", async () => {
            mockFetch((input) => {
                const url = String(input);
                if (url.includes("/login/device/code")) {
                    return deviceCodeResponse();
                }
                return jsonResponse({ error: "expired_token" });
            });
            const startResult = await service.startDeviceFlow();
            (0, bun_test_1.expect)(startResult.success).toBe(true);
            if (!startResult.success)
                return;
            const waitResult = await service.waitForDeviceFlow(startResult.data.flowId, {
                timeoutMs: 10_000,
            });
            (0, bun_test_1.expect)(waitResult.success).toBe(false);
            if (!waitResult.success) {
                (0, bun_test_1.expect)(waitResult.error).toContain("expired_token");
            }
        });
    });
    // -------------------------------------------------------------------------
    // Cancellation
    // -------------------------------------------------------------------------
    (0, bun_test_1.describe)("cancellation", () => {
        (0, bun_test_1.it)("resolves waitForDeviceFlow with error when cancelled", async () => {
            // Make polling hang indefinitely with authorization_pending
            mockFetch((input) => {
                const url = String(input);
                if (url.includes("/login/device/code")) {
                    return deviceCodeResponse();
                }
                return authorizationPendingResponse();
            });
            const startResult = await service.startDeviceFlow();
            (0, bun_test_1.expect)(startResult.success).toBe(true);
            if (!startResult.success)
                return;
            const flowId = startResult.data.flowId;
            // Start waiting (don't await yet)
            const waitPromise = service.waitForDeviceFlow(flowId, { timeoutMs: 30_000 });
            // Give polling loop a tick to start
            await new Promise((resolve) => setTimeout(resolve, 10));
            // Cancel the flow
            service.cancelDeviceFlow(flowId);
            const result = await waitPromise;
            (0, bun_test_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, bun_test_1.expect)(result.error).toContain("cancelled");
            }
            // Token should NOT have been persisted
            const apiKeyCall = deps.setConfigCalls.find((c) => c.provider === "github-copilot" && c.keyPath[0] === "apiKey");
            (0, bun_test_1.expect)(apiKeyCall).toBeUndefined();
        });
        (0, bun_test_1.it)("does not persist token if cancelled mid-request", async () => {
            // Control when the polling fetch resolves
            let resolvePollFetch;
            mockFetch((input) => {
                const url = String(input);
                if (url.includes("/login/device/code")) {
                    return deviceCodeResponse();
                }
                // Hang the polling request until we resolve it manually
                return new Promise((resolve) => {
                    resolvePollFetch = resolve;
                });
            });
            const startResult = await service.startDeviceFlow();
            (0, bun_test_1.expect)(startResult.success).toBe(true);
            if (!startResult.success)
                return;
            const flowId = startResult.data.flowId;
            const waitPromise = service.waitForDeviceFlow(flowId, { timeoutMs: 30_000 });
            // Give polling loop a tick to start the fetch
            await new Promise((resolve) => setTimeout(resolve, 10));
            // Cancel while fetch is in-flight
            service.cancelDeviceFlow(flowId);
            // Now resolve the fetch with a valid token — it should be ignored
            // because flow.cancelled is checked after fetch returns
            resolvePollFetch(tokenSuccessResponse("ghp_should_not_persist"));
            const result = await waitPromise;
            (0, bun_test_1.expect)(result.success).toBe(false);
            // Token should NOT have been persisted
            const apiKeyCall = deps.setConfigCalls.find((c) => c.provider === "github-copilot" && c.keyPath[0] === "apiKey");
            (0, bun_test_1.expect)(apiKeyCall).toBeUndefined();
        });
    });
    // -------------------------------------------------------------------------
    // Transient network error recovery
    // -------------------------------------------------------------------------
    (0, bun_test_1.describe)("transient network error recovery", () => {
        (0, bun_test_1.it)("retries after a transient fetch error and eventually succeeds", async () => {
            let pollCount = 0;
            mockFetch((input) => {
                const url = String(input);
                if (url.includes("/login/device/code")) {
                    return deviceCodeResponse();
                }
                if (url.includes("/models")) {
                    return modelsResponse();
                }
                pollCount++;
                if (pollCount === 1) {
                    throw new Error("ECONNRESET");
                }
                return tokenSuccessResponse("ghp_recovered");
            });
            const startResult = await service.startDeviceFlow();
            (0, bun_test_1.expect)(startResult.success).toBe(true);
            if (!startResult.success)
                return;
            const waitResult = await service.waitForDeviceFlow(startResult.data.flowId, {
                timeoutMs: 30_000,
            });
            (0, bun_test_1.expect)(waitResult.success).toBe(true);
            const apiKeyCall = deps.setConfigCalls.find((c) => c.provider === "github-copilot" && c.keyPath[0] === "apiKey");
            (0, bun_test_1.expect)(apiKeyCall).toBeDefined();
            (0, bun_test_1.expect)(apiKeyCall.value).toBe("ghp_recovered");
        });
    });
    // -------------------------------------------------------------------------
    // Re-entrancy guard
    // -------------------------------------------------------------------------
    (0, bun_test_1.describe)("re-entrancy guard", () => {
        (0, bun_test_1.it)("only starts one polling loop even when waitForDeviceFlow is called twice", async () => {
            let pollCallCount = 0;
            mockFetch((input) => {
                const url = String(input);
                if (url.includes("/login/device/code")) {
                    return deviceCodeResponse();
                }
                if (url.includes("/models")) {
                    return modelsResponse();
                }
                pollCallCount++;
                return tokenSuccessResponse("ghp_single_poll");
            });
            const startResult = await service.startDeviceFlow();
            (0, bun_test_1.expect)(startResult.success).toBe(true);
            if (!startResult.success)
                return;
            const flowId = startResult.data.flowId;
            // Call waitForDeviceFlow twice concurrently
            const [result1, result2] = await Promise.all([
                service.waitForDeviceFlow(flowId, { timeoutMs: 10_000 }),
                service.waitForDeviceFlow(flowId, { timeoutMs: 10_000 }),
            ]);
            // Both should succeed
            (0, bun_test_1.expect)(result1.success).toBe(true);
            (0, bun_test_1.expect)(result2.success).toBe(true);
            // Only one polling request should have been made (one poll loop)
            (0, bun_test_1.expect)(pollCallCount).toBe(1);
        });
    });
    // -------------------------------------------------------------------------
    // Model fetching after successful auth
    // -------------------------------------------------------------------------
    (0, bun_test_1.describe)("model fetching after successful auth", () => {
        (0, bun_test_1.it)("fetches models from Copilot API and stores only allowed prefixes via setModels", async () => {
            let modelsUrl = "";
            let modelsAuthHeader = "";
            mockFetch((input, init) => {
                const url = String(input);
                if (url.includes("/login/device/code")) {
                    return deviceCodeResponse();
                }
                if (url.includes("/models")) {
                    modelsUrl = url;
                    modelsAuthHeader = init?.headers?.Authorization ?? "";
                    // Return a mix of matching and non-matching models
                    return modelsResponse([
                        "gpt-5",
                        "claude-sonnet-4.5",
                        "gpt-4o",
                        "o3-mini",
                        "gemini-3-pro-preview",
                        "grok-code-mini",
                    ]);
                }
                return tokenSuccessResponse("ghp_model_token");
            });
            const startResult = await service.startDeviceFlow();
            (0, bun_test_1.expect)(startResult.success).toBe(true);
            if (!startResult.success)
                return;
            const waitResult = await service.waitForDeviceFlow(startResult.data.flowId, {
                timeoutMs: 10_000,
            });
            (0, bun_test_1.expect)(waitResult.success).toBe(true);
            // Verify models endpoint was called with correct URL and auth
            (0, bun_test_1.expect)(modelsUrl).toBe("https://api.githubcopilot.com/models");
            (0, bun_test_1.expect)(modelsAuthHeader).toBe("Bearer ghp_model_token");
            // Verify only models matching allowed prefixes were stored
            (0, bun_test_1.expect)(deps.setModelsCalls).toHaveLength(1);
            const call = deps.setModelsCalls[0];
            (0, bun_test_1.expect)(call?.provider).toBe("github-copilot");
            (0, bun_test_1.expect)(call?.models).toEqual([
                "gpt-5",
                "claude-sonnet-4.5",
                "gemini-3-pro-preview",
                "grok-code-mini",
            ]);
        });
        (0, bun_test_1.it)("excludes models not matching any allowed prefix", async () => {
            mockFetch((input) => {
                const url = String(input);
                if (url.includes("/login/device/code")) {
                    return deviceCodeResponse();
                }
                if (url.includes("/models")) {
                    // All models are non-matching
                    return modelsResponse(["gpt-4o", "o3-mini", "o1-preview"]);
                }
                return tokenSuccessResponse();
            });
            const startResult = await service.startDeviceFlow();
            (0, bun_test_1.expect)(startResult.success).toBe(true);
            if (!startResult.success)
                return;
            const waitResult = await service.waitForDeviceFlow(startResult.data.flowId, {
                timeoutMs: 10_000,
            });
            (0, bun_test_1.expect)(waitResult.success).toBe(true);
            // setModels should not be called when all models are filtered out
            (0, bun_test_1.expect)(deps.setModelsCalls).toHaveLength(0);
        });
        (0, bun_test_1.it)("login succeeds even if model fetch returns non-200", async () => {
            mockFetch((input) => {
                const url = String(input);
                if (url.includes("/login/device/code")) {
                    return deviceCodeResponse();
                }
                if (url.includes("/models")) {
                    return new Response("Internal Server Error", { status: 500 });
                }
                return tokenSuccessResponse();
            });
            const startResult = await service.startDeviceFlow();
            (0, bun_test_1.expect)(startResult.success).toBe(true);
            if (!startResult.success)
                return;
            const waitResult = await service.waitForDeviceFlow(startResult.data.flowId, {
                timeoutMs: 10_000,
            });
            // Login should still succeed
            (0, bun_test_1.expect)(waitResult.success).toBe(true);
            // No models should have been stored
            (0, bun_test_1.expect)(deps.setModelsCalls).toHaveLength(0);
        });
        (0, bun_test_1.it)("login succeeds even if model fetch throws a network error", async () => {
            mockFetch((input) => {
                const url = String(input);
                if (url.includes("/login/device/code")) {
                    return deviceCodeResponse();
                }
                if (url.includes("/models")) {
                    throw new Error("ECONNREFUSED");
                }
                return tokenSuccessResponse();
            });
            const startResult = await service.startDeviceFlow();
            (0, bun_test_1.expect)(startResult.success).toBe(true);
            if (!startResult.success)
                return;
            const waitResult = await service.waitForDeviceFlow(startResult.data.flowId, {
                timeoutMs: 10_000,
            });
            // Login should still succeed despite model fetch failure
            (0, bun_test_1.expect)(waitResult.success).toBe(true);
            // Token should still have been persisted
            const apiKeyCall = deps.setConfigCalls.find((c) => c.provider === "github-copilot" && c.keyPath[0] === "apiKey");
            (0, bun_test_1.expect)(apiKeyCall).toBeDefined();
            // No models should have been stored
            (0, bun_test_1.expect)(deps.setModelsCalls).toHaveLength(0);
        });
        (0, bun_test_1.it)("does not call setModels when API returns empty model list", async () => {
            mockFetch((input) => {
                const url = String(input);
                if (url.includes("/login/device/code")) {
                    return deviceCodeResponse();
                }
                if (url.includes("/models")) {
                    return jsonResponse({ data: [] });
                }
                return tokenSuccessResponse();
            });
            const startResult = await service.startDeviceFlow();
            (0, bun_test_1.expect)(startResult.success).toBe(true);
            if (!startResult.success)
                return;
            const waitResult = await service.waitForDeviceFlow(startResult.data.flowId, {
                timeoutMs: 10_000,
            });
            (0, bun_test_1.expect)(waitResult.success).toBe(true);
            // Empty list — should not call setModels
            (0, bun_test_1.expect)(deps.setModelsCalls).toHaveLength(0);
        });
        (0, bun_test_1.it)("does not call setModels when API response has no data field", async () => {
            mockFetch((input) => {
                const url = String(input);
                if (url.includes("/login/device/code")) {
                    return deviceCodeResponse();
                }
                if (url.includes("/models")) {
                    return jsonResponse({ something_else: true });
                }
                return tokenSuccessResponse();
            });
            const startResult = await service.startDeviceFlow();
            (0, bun_test_1.expect)(startResult.success).toBe(true);
            if (!startResult.success)
                return;
            const waitResult = await service.waitForDeviceFlow(startResult.data.flowId, {
                timeoutMs: 10_000,
            });
            (0, bun_test_1.expect)(waitResult.success).toBe(true);
            (0, bun_test_1.expect)(deps.setModelsCalls).toHaveLength(0);
        });
    });
    // -------------------------------------------------------------------------
    // Dispose cleanup
    // -------------------------------------------------------------------------
    (0, bun_test_1.describe)("dispose", () => {
        (0, bun_test_1.it)("resolves pending waitForDeviceFlow with error", async () => {
            mockFetch((input) => {
                const url = String(input);
                if (url.includes("/login/device/code")) {
                    return deviceCodeResponse();
                }
                // Never return a token — keep it pending
                return authorizationPendingResponse();
            });
            const startResult = await service.startDeviceFlow();
            (0, bun_test_1.expect)(startResult.success).toBe(true);
            if (!startResult.success)
                return;
            const waitPromise = service.waitForDeviceFlow(startResult.data.flowId, {
                timeoutMs: 30_000,
            });
            // Give polling loop a tick to start
            await new Promise((resolve) => setTimeout(resolve, 10));
            // Dispose the service
            service.dispose();
            const result = await waitPromise;
            (0, bun_test_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, bun_test_1.expect)(result.error).toContain("shutting down");
            }
            // Token should NOT have been persisted
            const apiKeyCall = deps.setConfigCalls.find((c) => c.provider === "github-copilot" && c.keyPath[0] === "apiKey");
            (0, bun_test_1.expect)(apiKeyCall).toBeUndefined();
        });
        (0, bun_test_1.it)("clears all flows from the map", async () => {
            mockFetch((input) => {
                const url = String(input);
                if (url.includes("/login/device/code")) {
                    return deviceCodeResponse();
                }
                return authorizationPendingResponse();
            });
            // Start two flows
            const flow1 = await service.startDeviceFlow();
            const flow2 = await service.startDeviceFlow();
            (0, bun_test_1.expect)(flow1.success).toBe(true);
            (0, bun_test_1.expect)(flow2.success).toBe(true);
            service.dispose();
            // After dispose, waitForDeviceFlow should return "not found"
            if (flow1.success) {
                const result = await service.waitForDeviceFlow(flow1.data.flowId);
                (0, bun_test_1.expect)(result.success).toBe(false);
                if (!result.success) {
                    (0, bun_test_1.expect)(result.error).toContain("not found");
                }
            }
        });
    });
    // -------------------------------------------------------------------------
    // setConfig failure
    // -------------------------------------------------------------------------
    (0, bun_test_1.describe)("setConfig failure", () => {
        (0, bun_test_1.it)("propagates setConfig error to waitForDeviceFlow result", async () => {
            deps.setConfigResult = (0, result_1.Err)("disk full");
            mockFetch((input) => {
                const url = String(input);
                if (url.includes("/login/device/code")) {
                    return deviceCodeResponse();
                }
                return tokenSuccessResponse();
            });
            const startResult = await service.startDeviceFlow();
            (0, bun_test_1.expect)(startResult.success).toBe(true);
            if (!startResult.success)
                return;
            const waitResult = await service.waitForDeviceFlow(startResult.data.flowId, {
                timeoutMs: 10_000,
            });
            (0, bun_test_1.expect)(waitResult.success).toBe(false);
            if (!waitResult.success) {
                (0, bun_test_1.expect)(waitResult.error).toContain("disk full");
            }
        });
    });
    // -------------------------------------------------------------------------
    // waitForDeviceFlow edge cases
    // -------------------------------------------------------------------------
    (0, bun_test_1.describe)("waitForDeviceFlow edge cases", () => {
        (0, bun_test_1.it)("returns Err for unknown flowId", async () => {
            const result = await service.waitForDeviceFlow("nonexistent-flow-id");
            (0, bun_test_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, bun_test_1.expect)(result.error).toContain("not found");
            }
        });
        (0, bun_test_1.it)("cancelDeviceFlow is a no-op for unknown flowId", () => {
            // Should not throw
            service.cancelDeviceFlow("nonexistent-flow-id");
        });
    });
});
//# sourceMappingURL=copilotOauthService.test.js.map