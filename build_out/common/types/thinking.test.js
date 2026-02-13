"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const thinking_1 = require("./thinking");
(0, bun_test_1.describe)("getThinkingDisplayLabel", () => {
  (0, bun_test_1.test)("returns MAX for xhigh/max on Anthropic models", () => {
    (0, bun_test_1.expect)(
      (0, thinking_1.getThinkingDisplayLabel)("xhigh", "anthropic:claude-opus-4-6")
    ).toBe("MAX");
    (0, bun_test_1.expect)(
      (0, thinking_1.getThinkingDisplayLabel)("max", "anthropic:claude-opus-4-6")
    ).toBe("MAX");
    (0, bun_test_1.expect)(
      (0, thinking_1.getThinkingDisplayLabel)("xhigh", "mux-gateway:anthropic/claude-opus-4-6")
    ).toBe("MAX");
    (0, bun_test_1.expect)(
      (0, thinking_1.getThinkingDisplayLabel)("xhigh", "anthropic:claude-opus-4-5")
    ).toBe("MAX");
  });
  (0, bun_test_1.test)("returns XHIGH for xhigh/max on OpenAI models", () => {
    (0, bun_test_1.expect)((0, thinking_1.getThinkingDisplayLabel)("xhigh", "openai:gpt-5.2")).toBe(
      "XHIGH"
    );
    (0, bun_test_1.expect)((0, thinking_1.getThinkingDisplayLabel)("max", "openai:gpt-5.2")).toBe(
      "XHIGH"
    );
    (0, bun_test_1.expect)(
      (0, thinking_1.getThinkingDisplayLabel)("xhigh", "mux-gateway:openai/gpt-5.2")
    ).toBe("XHIGH");
    (0, bun_test_1.expect)(
      (0, thinking_1.getThinkingDisplayLabel)("max", "mux-gateway:openai/gpt-5.2")
    ).toBe("XHIGH");
  });
  (0, bun_test_1.test)("returns MAX for xhigh/max when no model specified (default)", () => {
    (0, bun_test_1.expect)((0, thinking_1.getThinkingDisplayLabel)("xhigh")).toBe("MAX");
    (0, bun_test_1.expect)((0, thinking_1.getThinkingDisplayLabel)("max")).toBe("MAX");
  });
  (0, bun_test_1.test)("returns standard labels for non-xhigh levels regardless of model", () => {
    (0, bun_test_1.expect)(
      (0, thinking_1.getThinkingDisplayLabel)("off", "anthropic:claude-opus-4-6")
    ).toBe("OFF");
    (0, bun_test_1.expect)(
      (0, thinking_1.getThinkingDisplayLabel)("low", "anthropic:claude-opus-4-6")
    ).toBe("LOW");
    (0, bun_test_1.expect)(
      (0, thinking_1.getThinkingDisplayLabel)("medium", "anthropic:claude-opus-4-6")
    ).toBe("MED");
    (0, bun_test_1.expect)(
      (0, thinking_1.getThinkingDisplayLabel)("high", "anthropic:claude-opus-4-6")
    ).toBe("HIGH");
  });
});
(0, bun_test_1.describe)("getThinkingOptionLabel", () => {
  (0, bun_test_1.test)("renders max for xhigh on Anthropic models", () => {
    (0, bun_test_1.expect)(
      (0, thinking_1.getThinkingOptionLabel)("xhigh", "anthropic:claude-opus-4-6")
    ).toBe("max");
  });
  (0, bun_test_1.test)("renders xhigh for xhigh/max on OpenAI models", () => {
    (0, bun_test_1.expect)((0, thinking_1.getThinkingOptionLabel)("xhigh", "openai:gpt-5.2")).toBe(
      "xhigh"
    );
    (0, bun_test_1.expect)((0, thinking_1.getThinkingOptionLabel)("max", "openai:gpt-5.2")).toBe(
      "xhigh"
    );
  });
  (0, bun_test_1.test)("preserves non-xhigh labels", () => {
    (0, bun_test_1.expect)(
      (0, thinking_1.getThinkingOptionLabel)("medium", "anthropic:claude-opus-4-6")
    ).toBe("medium");
  });
});
(0, bun_test_1.describe)("coerceThinkingLevel", () => {
  (0, bun_test_1.test)("normalizes shorthand aliases", () => {
    (0, bun_test_1.expect)((0, thinking_1.coerceThinkingLevel)("med")).toBe("medium");
  });
  (0, bun_test_1.test)("passes through all canonical levels including max", () => {
    (0, bun_test_1.expect)((0, thinking_1.coerceThinkingLevel)("off")).toBe("off");
    (0, bun_test_1.expect)((0, thinking_1.coerceThinkingLevel)("low")).toBe("low");
    (0, bun_test_1.expect)((0, thinking_1.coerceThinkingLevel)("medium")).toBe("medium");
    (0, bun_test_1.expect)((0, thinking_1.coerceThinkingLevel)("high")).toBe("high");
    (0, bun_test_1.expect)((0, thinking_1.coerceThinkingLevel)("xhigh")).toBe("xhigh");
    (0, bun_test_1.expect)((0, thinking_1.coerceThinkingLevel)("max")).toBe("max");
  });
  (0, bun_test_1.test)("returns undefined for invalid values", () => {
    (0, bun_test_1.expect)((0, thinking_1.coerceThinkingLevel)("invalid")).toBeUndefined();
    (0, bun_test_1.expect)((0, thinking_1.coerceThinkingLevel)(42)).toBeUndefined();
    (0, bun_test_1.expect)((0, thinking_1.coerceThinkingLevel)(null)).toBeUndefined();
  });
});
(0, bun_test_1.describe)("parseThinkingInput", () => {
  bun_test_1.test.each([
    ["off", "off"],
    ["low", "low"],
    ["med", "medium"],
    ["medium", "medium"],
    ["high", "high"],
    ["max", "max"],
    ["xhigh", "xhigh"],
    ["OFF", "off"],
    ["MED", "medium"],
    ["High", "high"],
  ])("parses named level %s → %s", (input, expected) => {
    (0, bun_test_1.expect)((0, thinking_1.parseThinkingInput)(input)).toBe(expected);
  });
  // Numeric indices are returned as raw numbers (resolved against model policy at send time)
  bun_test_1.test.each([
    ["0", 0],
    ["1", 1],
    ["2", 2],
    ["3", 3],
    ["4", 4],
    ["9", 9],
  ])("parses numeric level %s → %s", (input, expected) => {
    (0, bun_test_1.expect)((0, thinking_1.parseThinkingInput)(input)).toBe(expected);
  });
  bun_test_1.test.each(["-1", "10", "99", "foo", "mediun", "1.5", "", "  "])(
    "returns undefined for invalid input %j",
    (input) => {
      (0, bun_test_1.expect)((0, thinking_1.parseThinkingInput)(input)).toBeUndefined();
    }
  );
  (0, bun_test_1.test)("trims whitespace", () => {
    (0, bun_test_1.expect)((0, thinking_1.parseThinkingInput)("  high  ")).toBe("high");
    // Numeric with whitespace returns a number
    (0, bun_test_1.expect)((0, thinking_1.parseThinkingInput)(" 2 ")).toBe(2);
  });
});
(0, bun_test_1.describe)("MAX_THINKING_INDEX", () => {
  (0, bun_test_1.test)("is 9 (generous upper bound for numeric indices)", () => {
    (0, bun_test_1.expect)(thinking_1.MAX_THINKING_INDEX).toBe(9);
  });
});
//# sourceMappingURL=thinking.test.js.map
