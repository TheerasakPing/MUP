"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const agentEnablement_1 = require("./agentEnablement");
function cfgWithOverrides(overrides) {
    return {
        projects: new Map(),
        agentAiDefaults: overrides,
    };
}
(0, bun_test_1.describe)("agentEnablement", () => {
    (0, bun_test_1.test)("disabled field takes precedence over ui.disabled", () => {
        const frontmatter = {
            name: "Test",
            disabled: false,
            ui: { disabled: true },
        };
        (0, bun_test_1.expect)((0, agentEnablement_1.isAgentDisabledByFrontmatter)(frontmatter)).toBe(false);
    });
    (0, bun_test_1.test)("falls back to ui.disabled when disabled is unset", () => {
        const frontmatter = {
            name: "Test",
            ui: { disabled: true },
        };
        (0, bun_test_1.expect)((0, agentEnablement_1.isAgentDisabledByFrontmatter)(frontmatter)).toBe(true);
    });
    (0, bun_test_1.test)("user override enabled:true re-enables a disabled agent", () => {
        const cfg = cfgWithOverrides({ foo: { enabled: true } });
        const frontmatter = { name: "Foo", disabled: true };
        (0, bun_test_1.expect)((0, agentEnablement_1.resolveAgentEnabledOverride)(cfg, "foo")).toBe(true);
        (0, bun_test_1.expect)((0, agentEnablement_1.isAgentEffectivelyDisabled)({
            cfg,
            agentId: "foo",
            resolvedFrontmatter: frontmatter,
        })).toBe(false);
    });
    (0, bun_test_1.test)("user override enabled:false disables an enabled agent", () => {
        const cfg = cfgWithOverrides({ foo: { enabled: false } });
        const frontmatter = { name: "Foo" };
        (0, bun_test_1.expect)((0, agentEnablement_1.resolveAgentEnabledOverride)(cfg, "foo")).toBe(false);
        (0, bun_test_1.expect)((0, agentEnablement_1.isAgentEffectivelyDisabled)({
            cfg,
            agentId: "foo",
            resolvedFrontmatter: frontmatter,
        })).toBe(true);
    });
    (0, bun_test_1.test)("core agents are never effectively disabled", () => {
        const cfg = cfgWithOverrides({ exec: { enabled: false } });
        const frontmatter = { name: "Exec", disabled: true };
        (0, bun_test_1.expect)((0, agentEnablement_1.isAgentEffectivelyDisabled)({
            cfg,
            agentId: "exec",
            resolvedFrontmatter: frontmatter,
        })).toBe(false);
    });
});
//# sourceMappingURL=agentEnablement.test.js.map