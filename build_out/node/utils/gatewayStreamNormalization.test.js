"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const gatewayStreamNormalization_1 = require("./gatewayStreamNormalization");
(0, bun_test_1.describe)("isV3Usage", () => {
    (0, bun_test_1.it)("returns true for v3 nested usage", () => {
        (0, bun_test_1.expect)((0, gatewayStreamNormalization_1.isV3Usage)({
            inputTokens: { total: 100 },
            outputTokens: { total: 50 },
        })).toBe(true);
    });
    (0, bun_test_1.it)("returns false for flat v2 usage", () => {
        (0, bun_test_1.expect)((0, gatewayStreamNormalization_1.isV3Usage)({ inputTokens: 100, outputTokens: 50 })).toBe(false);
    });
    (0, bun_test_1.it)("returns false for null", () => {
        (0, bun_test_1.expect)((0, gatewayStreamNormalization_1.isV3Usage)(null)).toBe(false);
    });
    (0, bun_test_1.it)("returns false for undefined", () => {
        (0, bun_test_1.expect)((0, gatewayStreamNormalization_1.isV3Usage)(undefined)).toBe(false);
    });
    (0, bun_test_1.it)("returns false for non-object", () => {
        (0, bun_test_1.expect)((0, gatewayStreamNormalization_1.isV3Usage)("string")).toBe(false);
        (0, bun_test_1.expect)((0, gatewayStreamNormalization_1.isV3Usage)(42)).toBe(false);
    });
});
(0, bun_test_1.describe)("flatUsageToV3", () => {
    (0, bun_test_1.it)("converts basic flat usage to v3 nested format", () => {
        const result = (0, gatewayStreamNormalization_1.flatUsageToV3)({
            inputTokens: 1000,
            outputTokens: 500,
        });
        (0, bun_test_1.expect)(result.inputTokens.total).toBe(1000);
        (0, bun_test_1.expect)(result.outputTokens.total).toBe(500);
        (0, bun_test_1.expect)(result.raw).toEqual({ inputTokens: 1000, outputTokens: 500 });
    });
    (0, bun_test_1.it)("handles cached input tokens", () => {
        const result = (0, gatewayStreamNormalization_1.flatUsageToV3)({
            inputTokens: 1000,
            outputTokens: 500,
            cachedInputTokens: 300,
        });
        (0, bun_test_1.expect)(result.inputTokens.total).toBe(1000);
        (0, bun_test_1.expect)(result.inputTokens.cacheRead).toBe(300);
        (0, bun_test_1.expect)(result.inputTokens.noCache).toBe(700); // 1000 - 300
    });
    (0, bun_test_1.it)("handles reasoning tokens", () => {
        const result = (0, gatewayStreamNormalization_1.flatUsageToV3)({
            inputTokens: 1000,
            outputTokens: 500,
            reasoningTokens: 200,
        });
        (0, bun_test_1.expect)(result.outputTokens.total).toBe(500);
        (0, bun_test_1.expect)(result.outputTokens.reasoning).toBe(200);
        (0, bun_test_1.expect)(result.outputTokens.text).toBe(300); // 500 - 200
    });
    (0, bun_test_1.it)("handles all token types together", () => {
        const result = (0, gatewayStreamNormalization_1.flatUsageToV3)({
            inputTokens: 2000,
            outputTokens: 800,
            cachedInputTokens: 500,
            reasoningTokens: 100,
        });
        (0, bun_test_1.expect)(result.inputTokens.total).toBe(2000);
        (0, bun_test_1.expect)(result.inputTokens.noCache).toBe(1500);
        (0, bun_test_1.expect)(result.inputTokens.cacheRead).toBe(500);
        (0, bun_test_1.expect)(result.outputTokens.total).toBe(800);
        (0, bun_test_1.expect)(result.outputTokens.text).toBe(700);
        (0, bun_test_1.expect)(result.outputTokens.reasoning).toBe(100);
    });
    (0, bun_test_1.it)("handles missing fields gracefully", () => {
        const result = (0, gatewayStreamNormalization_1.flatUsageToV3)({});
        (0, bun_test_1.expect)(result.inputTokens.total).toBeUndefined();
        (0, bun_test_1.expect)(result.inputTokens.noCache).toBeUndefined();
        (0, bun_test_1.expect)(result.outputTokens.total).toBeUndefined();
        (0, bun_test_1.expect)(result.outputTokens.text).toBeUndefined();
    });
    (0, bun_test_1.it)("preserves raw original usage", () => {
        const original = { inputTokens: 42, outputTokens: 17, totalTokens: 59 };
        const result = (0, gatewayStreamNormalization_1.flatUsageToV3)(original);
        (0, bun_test_1.expect)(result.raw).toEqual(original);
    });
});
(0, bun_test_1.describe)("normalizeFinishReason", () => {
    (0, bun_test_1.it)("returns undefined for null/undefined", () => {
        (0, bun_test_1.expect)((0, gatewayStreamNormalization_1.normalizeFinishReason)(null)).toBeUndefined();
        (0, bun_test_1.expect)((0, gatewayStreamNormalization_1.normalizeFinishReason)(undefined)).toBeUndefined();
    });
    (0, bun_test_1.it)("passes through v3 format unchanged", () => {
        const v3 = { unified: "stop", raw: "stop" };
        (0, bun_test_1.expect)((0, gatewayStreamNormalization_1.normalizeFinishReason)(v3)).toBe(v3);
    });
    (0, bun_test_1.it)("converts plain string to v3 format", () => {
        (0, bun_test_1.expect)((0, gatewayStreamNormalization_1.normalizeFinishReason)("stop")).toEqual({ unified: "stop", raw: "stop" });
        (0, bun_test_1.expect)((0, gatewayStreamNormalization_1.normalizeFinishReason)("length")).toEqual({ unified: "length", raw: "length" });
        (0, bun_test_1.expect)((0, gatewayStreamNormalization_1.normalizeFinishReason)("tool-calls")).toEqual({
            unified: "tool-calls",
            raw: "tool-calls",
        });
    });
    (0, bun_test_1.it)('converts "unknown" to "other"', () => {
        (0, bun_test_1.expect)((0, gatewayStreamNormalization_1.normalizeFinishReason)("unknown")).toEqual({ unified: "other", raw: "unknown" });
    });
    (0, bun_test_1.it)("handles non-string non-object as 'other'", () => {
        (0, bun_test_1.expect)((0, gatewayStreamNormalization_1.normalizeFinishReason)(42)).toEqual({ unified: "other", raw: "other" });
    });
});
(0, bun_test_1.describe)("normalizeGatewayGenerateResult", () => {
    (0, bun_test_1.it)("converts flat usage in generate result", () => {
        const result = (0, gatewayStreamNormalization_1.normalizeGatewayGenerateResult)({
            content: [{ type: "text", text: "hello" }],
            usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
            finishReason: "stop",
        });
        // Usage should be v3 nested
        const usage = result.usage;
        (0, bun_test_1.expect)(usage.inputTokens.total).toBe(100);
        (0, bun_test_1.expect)(usage.outputTokens.total).toBe(50);
        // finishReason should be v3 object (cast because generic return type
        // preserves the input shape, but the value is actually transformed)
        (0, bun_test_1.expect)(result.finishReason).toEqual({ unified: "stop", raw: "stop" });
    });
    (0, bun_test_1.it)("preserves already-v3 usage", () => {
        const v3Usage = {
            inputTokens: { total: 100, noCache: 80, cacheRead: 20, cacheWrite: undefined },
            outputTokens: { total: 50, text: 40, reasoning: 10 },
        };
        const result = (0, gatewayStreamNormalization_1.normalizeGatewayGenerateResult)({
            usage: v3Usage,
            finishReason: { unified: "stop", raw: "stop" },
        });
        // Should not be modified
        (0, bun_test_1.expect)(result.usage).toBe(v3Usage);
    });
    (0, bun_test_1.it)("preserves other result fields", () => {
        const result = (0, gatewayStreamNormalization_1.normalizeGatewayGenerateResult)({
            content: [{ type: "text", text: "hello" }],
            usage: { inputTokens: 10, outputTokens: 5 },
            providerMetadata: { openai: { foo: "bar" } },
        });
        (0, bun_test_1.expect)(result.content).toEqual([{ type: "text", text: "hello" }]);
        (0, bun_test_1.expect)(result.providerMetadata).toEqual({ openai: { foo: "bar" } });
    });
});
(0, bun_test_1.describe)("normalizeGatewayStreamUsage", () => {
    async function collectStream(chunks) {
        const stream = new ReadableStream({
            start(controller) {
                for (const chunk of chunks) {
                    controller.enqueue(chunk);
                }
                controller.close();
            },
        });
        const result = [];
        const transformed = stream.pipeThrough((0, gatewayStreamNormalization_1.normalizeGatewayStreamUsage)());
        const reader = transformed.getReader();
        for (;;) {
            const chunk = await reader.read();
            if (chunk.done)
                break;
            result.push(chunk.value);
        }
        return result;
    }
    (0, bun_test_1.it)("passes non-finish events through unchanged", async () => {
        const chunks = [
            { type: "text-delta", text: "hello" },
            { type: "reasoning-delta", text: "thinking" },
            { type: "tool-input-start", toolName: "bash" },
        ];
        const result = await collectStream(chunks);
        (0, bun_test_1.expect)(result).toEqual(chunks);
    });
    (0, bun_test_1.it)("converts flat usage in finish events to v3 format", async () => {
        const chunks = [
            { type: "text-delta", text: "hello" },
            {
                type: "finish",
                finishReason: "stop",
                usage: { inputTokens: 1000, outputTokens: 500, totalTokens: 1500 },
            },
        ];
        const result = await collectStream(chunks);
        // First chunk unchanged
        (0, bun_test_1.expect)(result[0]).toEqual({ type: "text-delta", text: "hello" });
        // Finish chunk should have v3 usage
        const finish = result[1];
        (0, bun_test_1.expect)(finish.type).toBe("finish");
        const usage = finish.usage;
        (0, bun_test_1.expect)(usage.inputTokens.total).toBe(1000);
        (0, bun_test_1.expect)(usage.outputTokens.total).toBe(500);
        // finishReason should be v3 object
        (0, bun_test_1.expect)(finish.finishReason).toEqual({ unified: "stop", raw: "stop" });
    });
    (0, bun_test_1.it)("preserves already-v3 finish events", async () => {
        const v3Finish = {
            type: "finish",
            finishReason: { unified: "stop", raw: "stop" },
            usage: {
                inputTokens: { total: 100, noCache: 80, cacheRead: 20, cacheWrite: undefined },
                outputTokens: { total: 50, text: 40, reasoning: 10 },
            },
        };
        const result = await collectStream([v3Finish]);
        const finish = result[0];
        // Usage should be the same v3 object (not re-wrapped)
        (0, bun_test_1.expect)(finish.usage).toBe(v3Finish.usage);
    });
    (0, bun_test_1.it)("handles null/undefined values gracefully", async () => {
        const result = await collectStream([null, undefined, "string", 42]);
        // Non-objects pass through
        (0, bun_test_1.expect)(result).toEqual([null, undefined, "string", 42]);
    });
    (0, bun_test_1.it)("handles finish events with no usage", async () => {
        const chunks = [{ type: "finish", finishReason: "stop" }];
        const result = await collectStream(chunks);
        const finish = result[0];
        (0, bun_test_1.expect)(finish.type).toBe("finish");
        // No usage field, just finishReason normalized
        (0, bun_test_1.expect)(finish.finishReason).toEqual({ unified: "stop", raw: "stop" });
    });
    (0, bun_test_1.it)("handles finish with cached and reasoning tokens", async () => {
        const chunks = [
            {
                type: "finish",
                finishReason: "stop",
                usage: {
                    inputTokens: 2000,
                    outputTokens: 800,
                    cachedInputTokens: 500,
                    reasoningTokens: 200,
                    totalTokens: 2800,
                },
            },
        ];
        const result = await collectStream(chunks);
        const finish = result[0];
        const usage = finish.usage;
        (0, bun_test_1.expect)(usage.inputTokens.total).toBe(2000);
        (0, bun_test_1.expect)(usage.inputTokens.cacheRead).toBe(500);
        (0, bun_test_1.expect)(usage.inputTokens.noCache).toBe(1500);
        (0, bun_test_1.expect)(usage.outputTokens.total).toBe(800);
        (0, bun_test_1.expect)(usage.outputTokens.reasoning).toBe(200);
        (0, bun_test_1.expect)(usage.outputTokens.text).toBe(600);
    });
});
//# sourceMappingURL=gatewayStreamNormalization.test.js.map