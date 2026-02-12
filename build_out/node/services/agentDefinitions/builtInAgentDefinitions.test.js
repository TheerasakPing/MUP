"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const builtInAgentDefinitions_1 = require("./builtInAgentDefinitions");
(0, bun_test_1.describe)("built-in agent definitions", () => {
    (0, bun_test_1.beforeEach)(() => {
        (0, builtInAgentDefinitions_1.clearBuiltInAgentCache)();
    });
    (0, bun_test_1.test)("exec and orchestrator trust Explore sub-agent reports", () => {
        const pkgs = (0, builtInAgentDefinitions_1.getBuiltInAgentDefinitions)();
        const byId = new Map(pkgs.map((pkg) => [pkg.id, pkg]));
        const exec = byId.get("exec");
        (0, bun_test_1.expect)(exec).toBeTruthy();
        (0, bun_test_1.expect)(exec?.body).toContain("sub-agent reports as authoritative for repo facts");
        (0, bun_test_1.expect)(exec?.body).toContain("counts as having read the referenced files");
        const orchestrator = byId.get("orchestrator");
        (0, bun_test_1.expect)(orchestrator).toBeTruthy();
        (0, bun_test_1.expect)(orchestrator?.body).toContain("sub-agent reports as authoritative for repo facts");
        (0, bun_test_1.expect)(orchestrator?.body).toContain("counts as having read the referenced files");
    });
    (0, bun_test_1.test)("orchestrator includes an exec task brief template", () => {
        const pkgs = (0, builtInAgentDefinitions_1.getBuiltInAgentDefinitions)();
        const byId = new Map(pkgs.map((pkg) => [pkg.id, pkg]));
        const orchestrator = byId.get("orchestrator");
        (0, bun_test_1.expect)(orchestrator).toBeTruthy();
        (0, bun_test_1.expect)(orchestrator?.body).toContain("Exec task brief template");
        (0, bun_test_1.expect)(orchestrator?.body).toContain("Background (why this matters)");
        (0, bun_test_1.expect)(orchestrator?.body).toContain("Starting points");
    });
    (0, bun_test_1.test)("exec subagent append_prompt warns about missing task brief context", () => {
        const pkgs = (0, builtInAgentDefinitions_1.getBuiltInAgentDefinitions)();
        const byId = new Map(pkgs.map((pkg) => [pkg.id, pkg]));
        const exec = byId.get("exec");
        (0, bun_test_1.expect)(exec).toBeTruthy();
        const appendPrompt = exec?.frontmatter.subagent?.append_prompt;
        (0, bun_test_1.expect)(appendPrompt).toBeTruthy();
        (0, bun_test_1.expect)(appendPrompt).toContain("task brief is missing critical information");
    });
    (0, bun_test_1.test)("includes orchestrator with expected flags", () => {
        const pkgs = (0, builtInAgentDefinitions_1.getBuiltInAgentDefinitions)();
        const byId = new Map(pkgs.map((pkg) => [pkg.id, pkg]));
        const orchestrator = byId.get("orchestrator");
        (0, bun_test_1.expect)(orchestrator).toBeTruthy();
        (0, bun_test_1.expect)(orchestrator?.frontmatter.ui?.requires).toEqual(["plan"]);
        (0, bun_test_1.expect)(orchestrator?.frontmatter.ui?.hidden).toBeUndefined();
        (0, bun_test_1.expect)(orchestrator?.frontmatter.subagent?.runnable).toBe(false);
    });
    (0, bun_test_1.test)("task_apply_git_patch is restricted to exec/orchestrator", () => {
        const pkgs = (0, builtInAgentDefinitions_1.getBuiltInAgentDefinitions)();
        const byId = new Map(pkgs.map((pkg) => [pkg.id, pkg]));
        const exec = byId.get("exec");
        (0, bun_test_1.expect)(exec).toBeTruthy();
        (0, bun_test_1.expect)(exec?.frontmatter.tools?.remove ?? []).not.toContain("task_apply_git_patch");
        const orchestrator = byId.get("orchestrator");
        (0, bun_test_1.expect)(orchestrator).toBeTruthy();
        (0, bun_test_1.expect)(orchestrator?.frontmatter.tools?.remove ?? []).not.toContain("task_apply_git_patch");
        const plan = byId.get("plan");
        (0, bun_test_1.expect)(plan).toBeTruthy();
        (0, bun_test_1.expect)(plan?.frontmatter.tools?.remove ?? []).toContain("task_apply_git_patch");
        const explore = byId.get("explore");
        (0, bun_test_1.expect)(explore).toBeTruthy();
        (0, bun_test_1.expect)(explore?.frontmatter.tools?.remove ?? []).toContain("task_apply_git_patch");
    });
});
//# sourceMappingURL=builtInAgentDefinitions.test.js.map