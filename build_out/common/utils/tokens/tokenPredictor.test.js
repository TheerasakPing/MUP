"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const tokenPredictor_1 = require("../../../common/utils/tokens/tokenPredictor");
(0, bun_test_1.describe)("predictTokenUsage", () => {
    (0, bun_test_1.it)("should predict token usage for simple message", () => {
        const result = (0, tokenPredictor_1.predictTokenUsage)({
            messageContent: "Hello, world!",
            attachedFiles: [],
            currentContext: 0,
            model: "claude-3.5-sonnet",
        });
        (0, bun_test_1.expect)(result.estimatedInputTokens).toBeGreaterThan(0);
        (0, bun_test_1.expect)(result.estimatedOutputTokens).toBe(500); // Default fallback
        (0, bun_test_1.expect)(result.estimatedTotalTokens).toBeGreaterThan(0);
        (0, bun_test_1.expect)(result.estimatedCostUsd).toBeGreaterThan(0);
        (0, bun_test_1.expect)(result.warningLevel).toBe("none");
        (0, bun_test_1.expect)(result.suggestions).toHaveLength(0);
    });
    (0, bun_test_1.it)("should use historical average for output tokens", () => {
        const result = (0, tokenPredictor_1.predictTokenUsage)({
            messageContent: "Test message",
            attachedFiles: [],
            currentContext: 0,
            model: "claude-3.5-sonnet",
            historicalAvgOutput: 1000,
        });
        (0, bun_test_1.expect)(result.estimatedOutputTokens).toBe(1000);
    });
    (0, bun_test_1.it)("should include attached files in token count", () => {
        const withoutFiles = (0, tokenPredictor_1.predictTokenUsage)({
            messageContent: "Test",
            attachedFiles: [],
            currentContext: 0,
            model: "claude-3.5-sonnet",
        });
        const withFiles = (0, tokenPredictor_1.predictTokenUsage)({
            messageContent: "Test",
            attachedFiles: ["file content here that is quite long"],
            currentContext: 0,
            model: "claude-3.5-sonnet",
        });
        (0, bun_test_1.expect)(withFiles.estimatedInputTokens).toBeGreaterThan(withoutFiles.estimatedInputTokens);
    });
    (0, bun_test_1.it)("should include current context in token count", () => {
        const withoutContext = (0, tokenPredictor_1.predictTokenUsage)({
            messageContent: "Test",
            attachedFiles: [],
            currentContext: 0,
            model: "claude-3.5-sonnet",
        });
        const withContext = (0, tokenPredictor_1.predictTokenUsage)({
            messageContent: "Test",
            attachedFiles: [],
            currentContext: 10000,
            model: "claude-3.5-sonnet",
        });
        (0, bun_test_1.expect)(withContext.estimatedInputTokens).toBeGreaterThan(withoutContext.estimatedInputTokens);
    });
    (0, bun_test_1.it)("should set high warning level for 50k-100k tokens", () => {
        const result = (0, tokenPredictor_1.predictTokenUsage)({
            messageContent: "x".repeat(200000), // ~50k tokens
            attachedFiles: [],
            currentContext: 0,
            model: "claude-3.5-sonnet",
        });
        (0, bun_test_1.expect)(result.warningLevel).toBe("high");
        (0, bun_test_1.expect)(result.suggestions.length).toBeGreaterThan(0);
    });
    (0, bun_test_1.it)("should set critical warning level for >100k tokens", () => {
        const result = (0, tokenPredictor_1.predictTokenUsage)({
            messageContent: "x".repeat(400000), // ~100k tokens
            attachedFiles: [],
            currentContext: 0,
            model: "claude-3.5-sonnet",
        });
        (0, bun_test_1.expect)(result.warningLevel).toBe("critical");
        (0, bun_test_1.expect)(result.suggestions).toContain("Consider splitting into multiple smaller requests");
    });
    (0, bun_test_1.it)("should estimate cost correctly", () => {
        const result = (0, tokenPredictor_1.predictTokenUsage)({
            messageContent: "Test message",
            attachedFiles: [],
            currentContext: 1000,
            model: "claude-3.5-sonnet",
            historicalAvgOutput: 500,
        });
        // Cost should be input tokens * input rate + output tokens * output rate
        (0, bun_test_1.expect)(result.estimatedCostUsd).toBeGreaterThan(0);
        (0, bun_test_1.expect)(result.estimatedCostUsd).toBeLessThan(1); // Should be very small for this test
    });
});
//# sourceMappingURL=tokenPredictor.test.js.map