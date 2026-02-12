"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAgentDisabledByFrontmatter = isAgentDisabledByFrontmatter;
exports.resolveAgentEnabledOverride = resolveAgentEnabledOverride;
exports.isAgentEffectivelyDisabled = isAgentEffectivelyDisabled;
const assert_1 = __importDefault(require("../../../common/utils/assert"));
const ALWAYS_ENABLED_AGENT_IDS = new Set(["exec", "plan", "compact", "mux"]);
function isAgentDisabledByFrontmatter(frontmatter) {
    (0, assert_1.default)(frontmatter, "isAgentDisabledByFrontmatter: frontmatter is required");
    // `disabled` is the new top-level field.
    // When both are set, disabled takes precedence over ui.disabled.
    if (typeof frontmatter.disabled === "boolean") {
        return frontmatter.disabled;
    }
    if (typeof frontmatter.ui?.disabled === "boolean") {
        return frontmatter.ui.disabled;
    }
    return false;
}
function resolveAgentEnabledOverride(cfg, agentId) {
    (0, assert_1.default)(cfg, "resolveAgentEnabledOverride: cfg is required");
    (0, assert_1.default)(agentId.length > 0, "resolveAgentEnabledOverride: agentId must be non-empty");
    const entry = cfg.agentAiDefaults?.[agentId];
    return typeof entry?.enabled === "boolean" ? entry.enabled : undefined;
}
function isAgentEffectivelyDisabled(args) {
    (0, assert_1.default)(args, "isAgentEffectivelyDisabled: args is required");
    (0, assert_1.default)(args.cfg, "isAgentEffectivelyDisabled: cfg is required");
    (0, assert_1.default)(args.agentId.length > 0, "isAgentEffectivelyDisabled: agentId must be non-empty");
    (0, assert_1.default)(args.resolvedFrontmatter, "isAgentEffectivelyDisabled: resolvedFrontmatter is required");
    // Core agents must always remain available so mux can safely fall back.
    if (ALWAYS_ENABLED_AGENT_IDS.has(args.agentId)) {
        return false;
    }
    const override = resolveAgentEnabledOverride(args.cfg, args.agentId);
    if (override === true) {
        return false;
    }
    if (override === false) {
        return true;
    }
    return isAgentDisabledByFrontmatter(args.resolvedFrontmatter);
}
//# sourceMappingURL=agentEnablement.js.map