"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const policy_1 = require("./policy");
(0, bun_test_1.describe)("getThinkingPolicyForModel", () => {
    (0, bun_test_1.test)("returns 5 levels including xhigh for gpt-5.1-codex-max", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("openai:gpt-5.1-codex-max")).toEqual([
            "off",
            "low",
            "medium",
            "high",
            "xhigh",
        ]);
    });
    (0, bun_test_1.test)("returns 5 levels for gpt-5.1-codex-max with version suffix", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("openai:gpt-5.1-codex-max-2025-12-01")).toEqual([
            "off",
            "low",
            "medium",
            "high",
            "xhigh",
        ]);
    });
    (0, bun_test_1.test)("returns 5 levels for bare gpt-5.1-codex-max without prefix", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("gpt-5.1-codex-max")).toEqual([
            "off",
            "low",
            "medium",
            "high",
            "xhigh",
        ]);
    });
    (0, bun_test_1.test)("returns 5 levels for codex-max alias", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("codex-max")).toEqual([
            "off",
            "low",
            "medium",
            "high",
            "xhigh",
        ]);
    });
    (0, bun_test_1.test)("returns 5 levels for gpt-5.1-codex-max with whitespace after colon", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("openai: gpt-5.1-codex-max")).toEqual([
            "off",
            "low",
            "medium",
            "high",
            "xhigh",
        ]);
    });
    (0, bun_test_1.test)("returns medium/high/xhigh for gpt-5.2-pro", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("openai:gpt-5.2-pro")).toEqual(["medium", "high", "xhigh"]);
    });
    (0, bun_test_1.test)("returns medium/high/xhigh for gpt-5.2-pro behind mux-gateway", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("mux-gateway:openai/gpt-5.2-pro")).toEqual([
            "medium",
            "high",
            "xhigh",
        ]);
    });
    (0, bun_test_1.test)("returns 5 levels including xhigh for gpt-5.2-codex", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("openai:gpt-5.2-codex")).toEqual([
            "off",
            "low",
            "medium",
            "high",
            "xhigh",
        ]);
    });
    (0, bun_test_1.test)("returns 5 levels including xhigh for gpt-5.2", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("openai:gpt-5.2")).toEqual([
            "off",
            "low",
            "medium",
            "high",
            "xhigh",
        ]);
    });
    (0, bun_test_1.test)("returns 5 levels including xhigh for gpt-5.2 behind mux-gateway", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("mux-gateway:openai/gpt-5.2")).toEqual([
            "off",
            "low",
            "medium",
            "high",
            "xhigh",
        ]);
    });
    (0, bun_test_1.test)("returns 5 levels including xhigh for gpt-5.2 with version suffix", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("openai:gpt-5.2-2025-12-11")).toEqual([
            "off",
            "low",
            "medium",
            "high",
            "xhigh",
        ]);
    });
    (0, bun_test_1.test)("returns 5 levels including xhigh for gpt-5.1-codex-max behind mux-gateway", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("mux-gateway:openai/gpt-5.1-codex-max")).toEqual([
            "off",
            "low",
            "medium",
            "high",
            "xhigh",
        ]);
    });
    (0, bun_test_1.test)("returns medium/high/xhigh for gpt-5.2-pro with version suffix", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("openai:gpt-5.2-pro-2025-12-11")).toEqual([
            "medium",
            "high",
            "xhigh",
        ]);
    });
    (0, bun_test_1.test)("returns single HIGH for gpt-5-pro base model (legacy)", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("openai:gpt-5-pro")).toEqual(["high"]);
    });
    (0, bun_test_1.test)("returns single HIGH for gpt-5-pro with version suffix (legacy)", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("openai:gpt-5-pro-2025-10-06")).toEqual(["high"]);
    });
    (0, bun_test_1.test)("returns single HIGH for gpt-5-pro with whitespace after colon (legacy)", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("openai: gpt-5-pro")).toEqual(["high"]);
    });
    (0, bun_test_1.test)("returns all levels for gpt-5-pro-mini (not a fixed policy)", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("openai:gpt-5-pro-mini")).toEqual([
            "off",
            "low",
            "medium",
            "high",
        ]);
    });
    (0, bun_test_1.test)("returns all levels for other OpenAI models", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("openai:gpt-4o")).toEqual(["off", "low", "medium", "high"]);
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("openai:gpt-4o-mini")).toEqual([
            "off",
            "low",
            "medium",
            "high",
        ]);
    });
    (0, bun_test_1.test)("returns all levels for Opus 4.5 (uses default policy)", () => {
        // Opus 4.5 uses the default policy - no special case needed
        // The effort parameter handles the "off" case by setting effort="low"
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("anthropic:claude-opus-4-5")).toEqual([
            "off",
            "low",
            "medium",
            "high",
        ]);
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("anthropic:claude-opus-4-5-20251101")).toEqual([
            "off",
            "low",
            "medium",
            "high",
        ]);
    });
    (0, bun_test_1.test)("returns 5 levels including xhigh for Opus 4.6", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("anthropic:claude-opus-4-6")).toEqual([
            "off",
            "low",
            "medium",
            "high",
            "xhigh",
        ]);
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("anthropic:claude-opus-4-6-20260201")).toEqual([
            "off",
            "low",
            "medium",
            "high",
            "xhigh",
        ]);
        // Behind gateway
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("mux-gateway:anthropic/claude-opus-4-6")).toEqual([
            "off",
            "low",
            "medium",
            "high",
            "xhigh",
        ]);
    });
    (0, bun_test_1.test)("returns low/high for Gemini 3 Pro", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("google:gemini-3-pro-preview")).toEqual(["low", "high"]);
    });
    (0, bun_test_1.test)("returns off/low/medium/high for Gemini 3 Flash", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("google:gemini-3-flash-preview")).toEqual([
            "off",
            "low",
            "medium",
            "high",
        ]);
    });
    (0, bun_test_1.test)("returns all levels for other providers", () => {
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("anthropic:claude-opus-4")).toEqual([
            "off",
            "low",
            "medium",
            "high",
        ]);
        (0, bun_test_1.expect)((0, policy_1.getThinkingPolicyForModel)("google:gemini-2.0-flash-thinking")).toEqual([
            "off",
            "low",
            "medium",
            "high",
        ]);
    });
});
(0, bun_test_1.describe)("enforceThinkingPolicy", () => {
    (0, bun_test_1.describe)("single-option policy models (gpt-5-pro)", () => {
        (0, bun_test_1.test)("enforces high for any requested level", () => {
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("openai:gpt-5-pro", "off")).toBe("high");
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("openai:gpt-5-pro", "low")).toBe("high");
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("openai:gpt-5-pro", "medium")).toBe("high");
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("openai:gpt-5-pro", "high")).toBe("high");
        });
        (0, bun_test_1.test)("enforces high for versioned gpt-5-pro", () => {
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("openai:gpt-5-pro-2025-10-06", "low")).toBe("high");
        });
    });
    (0, bun_test_1.describe)("multi-option policy models", () => {
        (0, bun_test_1.test)("allows requested level if in allowed set", () => {
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("anthropic:claude-opus-4", "off")).toBe("off");
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("anthropic:claude-opus-4", "low")).toBe("low");
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("anthropic:claude-opus-4", "medium")).toBe("medium");
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("anthropic:claude-opus-4", "high")).toBe("high");
        });
        (0, bun_test_1.test)("falls back to medium when requested level not allowed", () => {
            // Simulating behavior with gpt-5-pro (only allows "high")
            // When requesting "low", falls back to first allowed level which is "high"
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("openai:gpt-5-pro", "low")).toBe("high");
        });
    });
    (0, bun_test_1.describe)("Opus 4.5 (all levels supported)", () => {
        (0, bun_test_1.test)("allows all levels including off", () => {
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("anthropic:claude-opus-4-5", "off")).toBe("off");
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("anthropic:claude-opus-4-5", "low")).toBe("low");
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("anthropic:claude-opus-4-5", "medium")).toBe("medium");
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("anthropic:claude-opus-4-5", "high")).toBe("high");
        });
        (0, bun_test_1.test)("allows off for versioned model", () => {
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("anthropic:claude-opus-4-5-20251101", "off")).toBe("off");
        });
    });
    (0, bun_test_1.describe)("GPT-5.1-Codex-Max (5 levels including xhigh)", () => {
        (0, bun_test_1.test)("allows all 5 levels including xhigh", () => {
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("openai:gpt-5.1-codex-max", "off")).toBe("off");
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("openai:gpt-5.1-codex-max", "low")).toBe("low");
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("openai:gpt-5.1-codex-max", "medium")).toBe("medium");
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("openai:gpt-5.1-codex-max", "high")).toBe("high");
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("openai:gpt-5.1-codex-max", "xhigh")).toBe("xhigh");
        });
        (0, bun_test_1.test)("allows xhigh for versioned model", () => {
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("openai:gpt-5.1-codex-max-2025-12-01", "xhigh")).toBe("xhigh");
        });
    });
    (0, bun_test_1.describe)("GPT-5.2 (5 levels including xhigh)", () => {
        (0, bun_test_1.test)("allows xhigh for base model", () => {
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("openai:gpt-5.2", "xhigh")).toBe("xhigh");
        });
        (0, bun_test_1.test)("allows xhigh behind mux-gateway", () => {
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("mux-gateway:openai/gpt-5.2", "xhigh")).toBe("xhigh");
        });
        (0, bun_test_1.test)("allows xhigh for versioned model", () => {
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("openai:gpt-5.2-2025-12-11", "xhigh")).toBe("xhigh");
        });
    });
    (0, bun_test_1.describe)("Opus 4.6 (5 levels including xhigh)", () => {
        (0, bun_test_1.test)("allows all 5 levels including xhigh", () => {
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("anthropic:claude-opus-4-6", "off")).toBe("off");
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("anthropic:claude-opus-4-6", "low")).toBe("low");
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("anthropic:claude-opus-4-6", "medium")).toBe("medium");
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("anthropic:claude-opus-4-6", "high")).toBe("high");
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("anthropic:claude-opus-4-6", "xhigh")).toBe("xhigh");
        });
    });
    (0, bun_test_1.describe)("xhigh fallback for models without xhigh support", () => {
        (0, bun_test_1.test)("clamps to highest allowed when xhigh requested on standard model", () => {
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("anthropic:claude-opus-4-5", "xhigh")).toBe("high");
        });
        (0, bun_test_1.test)("falls back to high when xhigh requested on gpt-5-pro", () => {
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("openai:gpt-5-pro", "xhigh")).toBe("high");
        });
        (0, bun_test_1.test)("clamps xhigh to high for standard Anthropic models", () => {
            (0, bun_test_1.expect)((0, policy_1.enforceThinkingPolicy)("anthropic:claude-sonnet-4-5", "xhigh")).toBe("high");
        });
    });
});
// Note: Tests for invalid levels removed - TypeScript type system prevents invalid
// ThinkingLevel values at compile time, making runtime invalid-level tests unnecessary.
(0, bun_test_1.describe)("resolveThinkingInput", () => {
    (0, bun_test_1.test)("passes through named levels directly", () => {
        (0, bun_test_1.expect)((0, policy_1.resolveThinkingInput)("off", "anthropic:claude-opus-4-1")).toBe("off");
        (0, bun_test_1.expect)((0, policy_1.resolveThinkingInput)("high", "anthropic:claude-opus-4-1")).toBe("high");
        (0, bun_test_1.expect)((0, policy_1.resolveThinkingInput)("medium", "openai:gpt-5.2-pro")).toBe("medium");
    });
    (0, bun_test_1.test)("numeric 0 maps to model's lowest allowed level", () => {
        // Default models: lowest = "off"
        (0, bun_test_1.expect)((0, policy_1.resolveThinkingInput)(0, "anthropic:claude-opus-4-1")).toBe("off");
        // gpt-5.2-pro: lowest = "medium"
        (0, bun_test_1.expect)((0, policy_1.resolveThinkingInput)(0, "openai:gpt-5.2-pro")).toBe("medium");
        // gpt-5-pro: only "high"
        (0, bun_test_1.expect)((0, policy_1.resolveThinkingInput)(0, "openai:gpt-5-pro")).toBe("high");
        // gemini-3: lowest = "low"
        (0, bun_test_1.expect)((0, policy_1.resolveThinkingInput)(0, "google:gemini-3")).toBe("low");
    });
    (0, bun_test_1.test)("numeric indices map through model's sorted allowed levels", () => {
        // Default: [off, low, medium, high] → 0=off, 1=low, 2=medium, 3=high
        (0, bun_test_1.expect)((0, policy_1.resolveThinkingInput)(0, "anthropic:claude-sonnet-4-5")).toBe("off");
        (0, bun_test_1.expect)((0, policy_1.resolveThinkingInput)(1, "anthropic:claude-sonnet-4-5")).toBe("low");
        (0, bun_test_1.expect)((0, policy_1.resolveThinkingInput)(2, "anthropic:claude-sonnet-4-5")).toBe("medium");
        (0, bun_test_1.expect)((0, policy_1.resolveThinkingInput)(3, "anthropic:claude-sonnet-4-5")).toBe("high");
        // gpt-5.2-pro: [medium, high, xhigh] → 0=medium, 1=high, 2=xhigh
        (0, bun_test_1.expect)((0, policy_1.resolveThinkingInput)(0, "openai:gpt-5.2-pro")).toBe("medium");
        (0, bun_test_1.expect)((0, policy_1.resolveThinkingInput)(1, "openai:gpt-5.2-pro")).toBe("high");
        (0, bun_test_1.expect)((0, policy_1.resolveThinkingInput)(2, "openai:gpt-5.2-pro")).toBe("xhigh");
    });
    (0, bun_test_1.test)("out-of-range numeric index clamps to model's highest level", () => {
        // Default has 4 levels, index 9 clamps to "high"
        (0, bun_test_1.expect)((0, policy_1.resolveThinkingInput)(9, "anthropic:claude-sonnet-4-5")).toBe("high");
        // gpt-5-pro only has "high", any index clamps to "high"
        (0, bun_test_1.expect)((0, policy_1.resolveThinkingInput)(5, "openai:gpt-5-pro")).toBe("high");
        // gpt-5.2-pro has 3 levels, index 4 clamps to "xhigh"
        (0, bun_test_1.expect)((0, policy_1.resolveThinkingInput)(4, "openai:gpt-5.2-pro")).toBe("xhigh");
    });
});
//# sourceMappingURL=policy.test.js.map