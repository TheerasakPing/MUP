"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __addDisposableResource = (this && this.__addDisposableResource) || function (env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
        env.stack.push({ value: value, dispose: dispose, async: async });
    }
    else if (async) {
        env.stack.push({ async: true });
    }
    return value;
};
var __disposeResources = (this && this.__disposeResources) || (function (SuppressedError) {
    return function (env) {
        function fail(e) {
            env.error = env.hasError ? new SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        var r, s = 0;
        function next() {
            while (r = env.stack.pop()) {
                try {
                    if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                    if (r.dispose) {
                        var result = r.dispose.call(r.value);
                        if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                    }
                    else s |= 1;
                }
                catch (e) {
                    fail(e);
                }
            }
            if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return next();
    };
})(typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("node:fs/promises"));
const path = __importStar(require("node:path"));
const bun_test_1 = require("bun:test");
const schemas_1 = require("../../../common/orpc/schemas");
const LocalRuntime_1 = require("../../../node/runtime/LocalRuntime");
const tempDir_1 = require("../../../node/services/tempDir");
const agentSkillsService_1 = require("./agentSkillsService");
async function writeSkill(root, name, description) {
    const skillDir = path.join(root, name);
    await fs.mkdir(skillDir, { recursive: true });
    const content = `---
name: ${name}
description: ${description}
---
Body
`;
    await fs.writeFile(path.join(skillDir, "SKILL.md"), content, "utf-8");
}
(0, bun_test_1.describe)("agentSkillsService", () => {
    (0, bun_test_1.test)("project skills override global skills", async () => {
        const env_1 = { stack: [], error: void 0, hasError: false };
        try {
            const project = __addDisposableResource(env_1, new tempDir_1.DisposableTempDir("agent-skills-project"), false);
            const global = __addDisposableResource(env_1, new tempDir_1.DisposableTempDir("agent-skills-global"), false);
            const projectSkillsRoot = path.join(project.path, ".mux", "skills");
            const globalSkillsRoot = global.path;
            await writeSkill(globalSkillsRoot, "foo", "from global");
            await writeSkill(projectSkillsRoot, "foo", "from project");
            await writeSkill(globalSkillsRoot, "bar", "global only");
            const roots = { projectRoot: projectSkillsRoot, globalRoot: globalSkillsRoot };
            const runtime = new LocalRuntime_1.LocalRuntime(project.path);
            const skills = await (0, agentSkillsService_1.discoverAgentSkills)(runtime, project.path, { roots });
            // Should include project/global skills plus built-in skills
            // Note: deep-review skill is a project skill in the Mux repo, not a built-in
            (0, bun_test_1.expect)(skills.map((s) => s.name)).toEqual(["bar", "foo", "init", "mux-docs"]);
            const foo = skills.find((s) => s.name === "foo");
            (0, bun_test_1.expect)(foo).toBeDefined();
            (0, bun_test_1.expect)(foo.scope).toBe("project");
            (0, bun_test_1.expect)(foo.description).toBe("from project");
            const bar = skills.find((s) => s.name === "bar");
            (0, bun_test_1.expect)(bar).toBeDefined();
            (0, bun_test_1.expect)(bar.scope).toBe("global");
        }
        catch (e_1) {
            env_1.error = e_1;
            env_1.hasError = true;
        }
        finally {
            __disposeResources(env_1);
        }
    });
    (0, bun_test_1.test)("readAgentSkill resolves project before global", async () => {
        const env_2 = { stack: [], error: void 0, hasError: false };
        try {
            const project = __addDisposableResource(env_2, new tempDir_1.DisposableTempDir("agent-skills-project"), false);
            const global = __addDisposableResource(env_2, new tempDir_1.DisposableTempDir("agent-skills-global"), false);
            const projectSkillsRoot = path.join(project.path, ".mux", "skills");
            const globalSkillsRoot = global.path;
            await writeSkill(globalSkillsRoot, "foo", "from global");
            await writeSkill(projectSkillsRoot, "foo", "from project");
            const roots = { projectRoot: projectSkillsRoot, globalRoot: globalSkillsRoot };
            const runtime = new LocalRuntime_1.LocalRuntime(project.path);
            const name = schemas_1.SkillNameSchema.parse("foo");
            const resolved = await (0, agentSkillsService_1.readAgentSkill)(runtime, project.path, name, { roots });
            (0, bun_test_1.expect)(resolved.package.scope).toBe("project");
            (0, bun_test_1.expect)(resolved.package.frontmatter.description).toBe("from project");
        }
        catch (e_2) {
            env_2.error = e_2;
            env_2.hasError = true;
        }
        finally {
            __disposeResources(env_2);
        }
    });
    (0, bun_test_1.test)("readAgentSkill can read built-in skills", async () => {
        const env_3 = { stack: [], error: void 0, hasError: false };
        try {
            const project = __addDisposableResource(env_3, new tempDir_1.DisposableTempDir("agent-skills-project"), false);
            const global = __addDisposableResource(env_3, new tempDir_1.DisposableTempDir("agent-skills-global"), false);
            const projectSkillsRoot = path.join(project.path, ".mux", "skills");
            const globalSkillsRoot = global.path;
            const roots = { projectRoot: projectSkillsRoot, globalRoot: globalSkillsRoot };
            const runtime = new LocalRuntime_1.LocalRuntime(project.path);
            const name = schemas_1.SkillNameSchema.parse("mux-docs");
            const resolved = await (0, agentSkillsService_1.readAgentSkill)(runtime, project.path, name, { roots });
            (0, bun_test_1.expect)(resolved.package.scope).toBe("built-in");
            (0, bun_test_1.expect)(resolved.package.frontmatter.name).toBe("mux-docs");
            (0, bun_test_1.expect)(resolved.skillDir).toBe("<built-in:mux-docs>");
        }
        catch (e_3) {
            env_3.error = e_3;
            env_3.hasError = true;
        }
        finally {
            __disposeResources(env_3);
        }
    });
    (0, bun_test_1.test)("project/global skills override built-in skills", async () => {
        const env_4 = { stack: [], error: void 0, hasError: false };
        try {
            const project = __addDisposableResource(env_4, new tempDir_1.DisposableTempDir("agent-skills-project"), false);
            const global = __addDisposableResource(env_4, new tempDir_1.DisposableTempDir("agent-skills-global"), false);
            const projectSkillsRoot = path.join(project.path, ".mux", "skills");
            const globalSkillsRoot = global.path;
            // Override the built-in mux-docs skill with a project-local version
            await writeSkill(projectSkillsRoot, "mux-docs", "custom docs from project");
            const roots = { projectRoot: projectSkillsRoot, globalRoot: globalSkillsRoot };
            const runtime = new LocalRuntime_1.LocalRuntime(project.path);
            const skills = await (0, agentSkillsService_1.discoverAgentSkills)(runtime, project.path, { roots });
            const muxDocs = skills.find((s) => s.name === "mux-docs");
            (0, bun_test_1.expect)(muxDocs).toBeDefined();
            (0, bun_test_1.expect)(muxDocs.scope).toBe("project");
            (0, bun_test_1.expect)(muxDocs.description).toBe("custom docs from project");
            // readAgentSkill should also return the project version
            const name = schemas_1.SkillNameSchema.parse("mux-docs");
            const resolved = await (0, agentSkillsService_1.readAgentSkill)(runtime, project.path, name, { roots });
            (0, bun_test_1.expect)(resolved.package.scope).toBe("project");
        }
        catch (e_4) {
            env_4.error = e_4;
            env_4.hasError = true;
        }
        finally {
            __disposeResources(env_4);
        }
    });
    (0, bun_test_1.test)("discoverAgentSkillsDiagnostics surfaces invalid skills", async () => {
        const env_5 = { stack: [], error: void 0, hasError: false };
        try {
            const project = __addDisposableResource(env_5, new tempDir_1.DisposableTempDir("agent-skills-project"), false);
            const global = __addDisposableResource(env_5, new tempDir_1.DisposableTempDir("agent-skills-global"), false);
            const projectSkillsRoot = path.join(project.path, ".mux", "skills");
            const globalSkillsRoot = global.path;
            await writeSkill(projectSkillsRoot, "foo", "valid");
            // Invalid directory name (fails SkillNameSchema parsing)
            const invalidDirName = "Bad_Skill";
            const invalidDir = path.join(projectSkillsRoot, invalidDirName);
            await fs.mkdir(invalidDir, { recursive: true });
            // Valid directory name but missing SKILL.md
            await fs.mkdir(path.join(projectSkillsRoot, "missing-skill"), { recursive: true });
            // Invalid SKILL.md frontmatter (missing required description)
            const badFrontmatterDir = path.join(projectSkillsRoot, "bad-frontmatter");
            await fs.mkdir(badFrontmatterDir, { recursive: true });
            await fs.writeFile(path.join(badFrontmatterDir, "SKILL.md"), `---\nname: bad-frontmatter\n---\nBody\n`, "utf-8");
            // Mismatched frontmatter.name vs directory name
            const mismatchDir = path.join(projectSkillsRoot, "name-mismatch");
            await fs.mkdir(mismatchDir, { recursive: true });
            await fs.writeFile(path.join(mismatchDir, "SKILL.md"), `---\nname: other-name\ndescription: mismatch\n---\nBody\n`, "utf-8");
            const roots = { projectRoot: projectSkillsRoot, globalRoot: globalSkillsRoot };
            const runtime = new LocalRuntime_1.LocalRuntime(project.path);
            const diagnostics = await (0, agentSkillsService_1.discoverAgentSkillsDiagnostics)(runtime, project.path, { roots });
            (0, bun_test_1.expect)(diagnostics.skills.map((s) => s.name)).toEqual(["foo", "init", "mux-docs"]);
            const invalidNames = diagnostics.invalidSkills.map((issue) => issue.directoryName).sort();
            (0, bun_test_1.expect)(invalidNames).toEqual([invalidDirName, "bad-frontmatter", "missing-skill", "name-mismatch"].sort());
            for (const issue of diagnostics.invalidSkills) {
                (0, bun_test_1.expect)(issue.scope).toBe("project");
                (0, bun_test_1.expect)(issue.displayPath).toContain(issue.directoryName);
                (0, bun_test_1.expect)(issue.message.length).toBeGreaterThan(0);
                (0, bun_test_1.expect)(issue.hint?.length).toBeGreaterThan(0);
            }
            (0, bun_test_1.expect)(diagnostics.invalidSkills.find((i) => i.directoryName === invalidDirName)?.message).toContain("Invalid skill directory name");
            (0, bun_test_1.expect)(diagnostics.invalidSkills.find((i) => i.directoryName === "missing-skill")?.message).toContain("SKILL.md is missing");
            (0, bun_test_1.expect)(diagnostics.invalidSkills.find((i) => i.directoryName === "bad-frontmatter")?.message).toContain("Invalid SKILL.md frontmatter");
            (0, bun_test_1.expect)(diagnostics.invalidSkills.find((i) => i.directoryName === "name-mismatch")?.message).toContain("must match directory name");
        }
        catch (e_5) {
            env_5.error = e_5;
            env_5.hasError = true;
        }
        finally {
            __disposeResources(env_5);
        }
    });
    (0, bun_test_1.test)("discovers symlinked skill directories", async () => {
        const env_6 = { stack: [], error: void 0, hasError: false };
        try {
            const project = __addDisposableResource(env_6, new tempDir_1.DisposableTempDir("agent-skills-symlink"), false);
            const skillSource = __addDisposableResource(env_6, new tempDir_1.DisposableTempDir("agent-skills-source"), false);
            const projectSkillsRoot = path.join(project.path, ".mux", "skills");
            await fs.mkdir(projectSkillsRoot, { recursive: true });
            // Create a real skill in a separate location
            await writeSkill(skillSource.path, "my-skill", "A symlinked skill");
            // Symlink the skill directory into the project skills root
            await fs.symlink(path.join(skillSource.path, "my-skill"), path.join(projectSkillsRoot, "my-skill"));
            const roots = { projectRoot: projectSkillsRoot, globalRoot: "/nonexistent" };
            const runtime = new LocalRuntime_1.LocalRuntime(project.path);
            const skills = await (0, agentSkillsService_1.discoverAgentSkills)(runtime, project.path, { roots });
            const found = skills.find((s) => s.name === "my-skill");
            (0, bun_test_1.expect)(found).toBeDefined();
            (0, bun_test_1.expect)(found.description).toBe("A symlinked skill");
            (0, bun_test_1.expect)(found.scope).toBe("project");
        }
        catch (e_6) {
            env_6.error = e_6;
            env_6.hasError = true;
        }
        finally {
            __disposeResources(env_6);
        }
    });
    (0, bun_test_1.test)("readAgentSkill reads from symlinked skill directory", async () => {
        const env_7 = { stack: [], error: void 0, hasError: false };
        try {
            const project = __addDisposableResource(env_7, new tempDir_1.DisposableTempDir("agent-skills-symlink-read"), false);
            const skillSource = __addDisposableResource(env_7, new tempDir_1.DisposableTempDir("agent-skills-source-read"), false);
            const projectSkillsRoot = path.join(project.path, ".mux", "skills");
            await fs.mkdir(projectSkillsRoot, { recursive: true });
            await writeSkill(skillSource.path, "linked-skill", "Symlinked for reading");
            await fs.symlink(path.join(skillSource.path, "linked-skill"), path.join(projectSkillsRoot, "linked-skill"));
            const roots = { projectRoot: projectSkillsRoot, globalRoot: "/nonexistent" };
            const runtime = new LocalRuntime_1.LocalRuntime(project.path);
            const parsed = schemas_1.SkillNameSchema.safeParse("linked-skill");
            (0, bun_test_1.expect)(parsed.success).toBe(true);
            if (!parsed.success)
                throw new Error("bad name");
            const result = await (0, agentSkillsService_1.readAgentSkill)(runtime, project.path, parsed.data, { roots });
            (0, bun_test_1.expect)(result.package.frontmatter.name).toBe("linked-skill");
            (0, bun_test_1.expect)(result.package.frontmatter.description).toBe("Symlinked for reading");
            (0, bun_test_1.expect)(result.package.scope).toBe("project");
        }
        catch (e_7) {
            env_7.error = e_7;
            env_7.hasError = true;
        }
        finally {
            __disposeResources(env_7);
        }
    });
    (0, bun_test_1.test)("discovers skill directory via relative symlink", async () => {
        const env_8 = { stack: [], error: void 0, hasError: false };
        try {
            // Mirrors a real-world layout:
            //   <project>/.agents/skills/kalshi-docs/SKILL.md   (real skill)
            //   <project>/.mux/skills/kalshi-docs -> ../../.agents/skills/kalshi-docs  (relative symlink)
            const project = __addDisposableResource(env_8, new tempDir_1.DisposableTempDir("agent-skills-relative-symlink"), false);
            const projectRoot = project.path;
            const externalSkillsDir = path.join(projectRoot, ".agents", "skills");
            const muxSkillsRoot = path.join(projectRoot, ".mux", "skills");
            await fs.mkdir(externalSkillsDir, { recursive: true });
            await fs.mkdir(muxSkillsRoot, { recursive: true });
            // Write the real skill outside .mux/skills/
            await writeSkill(externalSkillsDir, "kalshi-docs", "Kalshi API documentation");
            // Create a relative symlink (../../.agents/skills/kalshi-docs)
            await fs.symlink(path.join("..", "..", ".agents", "skills", "kalshi-docs"), path.join(muxSkillsRoot, "kalshi-docs"));
            const roots = { projectRoot: muxSkillsRoot, globalRoot: "/nonexistent" };
            const runtime = new LocalRuntime_1.LocalRuntime(projectRoot);
            // Discovery should find the symlinked skill
            const skills = await (0, agentSkillsService_1.discoverAgentSkills)(runtime, projectRoot, { roots });
            const found = skills.find((s) => s.name === "kalshi-docs");
            (0, bun_test_1.expect)(found).toBeDefined();
            (0, bun_test_1.expect)(found.description).toBe("Kalshi API documentation");
            (0, bun_test_1.expect)(found.scope).toBe("project");
            // readAgentSkill should also resolve through the relative symlink
            const parsed = schemas_1.SkillNameSchema.safeParse("kalshi-docs");
            (0, bun_test_1.expect)(parsed.success).toBe(true);
            if (!parsed.success)
                throw new Error("bad name");
            const result = await (0, agentSkillsService_1.readAgentSkill)(runtime, projectRoot, parsed.data, { roots });
            (0, bun_test_1.expect)(result.package.frontmatter.name).toBe("kalshi-docs");
            (0, bun_test_1.expect)(result.package.frontmatter.description).toBe("Kalshi API documentation");
        }
        catch (e_8) {
            env_8.error = e_8;
            env_8.hasError = true;
        }
        finally {
            __disposeResources(env_8);
        }
    });
    (0, bun_test_1.test)("discovers symlinked SKILL.md inside a real directory", async () => {
        const env_9 = { stack: [], error: void 0, hasError: false };
        try {
            const project = __addDisposableResource(env_9, new tempDir_1.DisposableTempDir("agent-skills-symlink-file"), false);
            const skillSource = __addDisposableResource(env_9, new tempDir_1.DisposableTempDir("agent-skills-source-file"), false);
            const projectSkillsRoot = path.join(project.path, ".mux", "skills");
            const skillDir = path.join(projectSkillsRoot, "file-linked");
            await fs.mkdir(skillDir, { recursive: true });
            // Write SKILL.md to the source location and symlink just the file
            const sourceSkillMd = path.join(skillSource.path, "SKILL.md");
            await fs.writeFile(sourceSkillMd, `---\nname: file-linked\ndescription: Symlinked SKILL.md\n---\nBody\n`, "utf-8");
            await fs.symlink(sourceSkillMd, path.join(skillDir, "SKILL.md"));
            const roots = { projectRoot: projectSkillsRoot, globalRoot: "/nonexistent" };
            const runtime = new LocalRuntime_1.LocalRuntime(project.path);
            const skills = await (0, agentSkillsService_1.discoverAgentSkills)(runtime, project.path, { roots });
            const found = skills.find((s) => s.name === "file-linked");
            (0, bun_test_1.expect)(found).toBeDefined();
            (0, bun_test_1.expect)(found.description).toBe("Symlinked SKILL.md");
        }
        catch (e_9) {
            env_9.error = e_9;
            env_9.hasError = true;
        }
        finally {
            __disposeResources(env_9);
        }
    });
});
//# sourceMappingURL=agentSkillsService.test.js.map