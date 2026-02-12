"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const providerRequirements_1 = require("./providerRequirements");
(0, bun_test_1.describe)("hasAnyConfiguredProvider", () => {
    (0, bun_test_1.it)("returns false for null or empty config", () => {
        (0, bun_test_1.expect)((0, providerRequirements_1.hasAnyConfiguredProvider)(null)).toBe(false);
        (0, bun_test_1.expect)((0, providerRequirements_1.hasAnyConfiguredProvider)({})).toBe(false);
    });
    (0, bun_test_1.it)("returns true when a provider has an API key", () => {
        const providers = {
            anthropic: { apiKey: "sk-ant-test" },
        };
        (0, bun_test_1.expect)((0, providerRequirements_1.hasAnyConfiguredProvider)(providers)).toBe(true);
    });
    (0, bun_test_1.it)("returns true for OpenAI Codex OAuth-only configuration", () => {
        const providers = {
            openai: {
                codexOauth: {
                    type: "oauth",
                    access: "test-access-token",
                    refresh: "test-refresh-token",
                    expires: Date.now() + 60_000,
                    accountId: "acct_123",
                },
            },
        };
        (0, bun_test_1.expect)((0, providerRequirements_1.hasAnyConfiguredProvider)(providers)).toBe(true);
    });
    (0, bun_test_1.it)("returns true for keyless providers with explicit config", () => {
        const providers = {
            ollama: {
                baseUrl: "http://localhost:11434/api",
            },
        };
        (0, bun_test_1.expect)((0, providerRequirements_1.hasAnyConfiguredProvider)(providers)).toBe(true);
    });
});
//# sourceMappingURL=providerRequirements.test.js.map