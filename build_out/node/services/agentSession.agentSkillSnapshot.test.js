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
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const events_1 = require("events");
const fs = __importStar(require("node:fs/promises"));
const os = __importStar(require("node:os"));
const path = __importStar(require("node:path"));
const message_1 = require("../../common/types/message");
const result_1 = require("../../common/types/result");
const agentSession_1 = require("./agentSession");
const testHistoryService_1 = require("./testHistoryService");
(0, bun_test_1.describe)("AgentSession.sendMessage (agent skill snapshots)", () => {
    async function createTestWorkspaceWithSkill(args) {
        const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "mux-agent-skill-"));
        const skillDir = path.join(tmp, ".mux", "skills", args.skillName);
        await fs.mkdir(skillDir, { recursive: true });
        const skillMarkdown = `---\nname: ${args.skillName}\ndescription: Test skill\n---\n\n${args.skillBody}\n`;
        await fs.writeFile(path.join(skillDir, "SKILL.md"), skillMarkdown, "utf-8");
        return { workspacePath: tmp };
    }
    let historyCleanup;
    (0, bun_test_1.afterEach)(async () => {
        await historyCleanup?.();
    });
    (0, bun_test_1.it)("persists a synthetic agent skill snapshot before the user message", async () => {
        const workspaceId = "ws-test";
        const { workspacePath } = await createTestWorkspaceWithSkill({
            skillName: "test-skill",
            skillBody: "Follow this skill.",
        });
        const config = {
            srcDir: "/tmp",
            getSessionDir: (_workspaceId) => "/tmp",
        };
        const { historyService, cleanup } = await (0, testHistoryService_1.createTestHistoryService)();
        historyCleanup = cleanup;
        const messages = [];
        const realAppend = historyService.appendToHistory.bind(historyService);
        const appendToHistory = (0, bun_test_1.spyOn)(historyService, "appendToHistory").mockImplementation(async (wId, message) => {
            messages.push(message);
            return realAppend(wId, message);
        });
        const partialService = {
            commitToHistory: (0, bun_test_1.mock)((_workspaceId) => Promise.resolve((0, result_1.Ok)(undefined))),
        };
        const aiEmitter = new events_1.EventEmitter();
        const workspaceMeta = {
            id: workspaceId,
            name: "ws",
            projectName: "proj",
            projectPath: workspacePath,
            namedWorkspacePath: workspacePath,
            runtimeConfig: { type: "local" },
        };
        const streamMessage = (0, bun_test_1.mock)((_messages) => {
            return Promise.resolve((0, result_1.Ok)(undefined));
        });
        const aiService = Object.assign(aiEmitter, {
            isStreaming: (0, bun_test_1.mock)((_workspaceId) => false),
            stopStream: (0, bun_test_1.mock)((_workspaceId) => Promise.resolve((0, result_1.Ok)(undefined))),
            getWorkspaceMetadata: (0, bun_test_1.mock)((_workspaceId) => Promise.resolve((0, result_1.Ok)(workspaceMeta))),
            streamMessage: streamMessage,
        });
        const initStateManager = new events_1.EventEmitter();
        const backgroundProcessManager = {
            cleanup: (0, bun_test_1.mock)((_workspaceId) => Promise.resolve()),
            setMessageQueued: (0, bun_test_1.mock)((_workspaceId, _queued) => {
                void _queued;
            }),
        };
        const session = new agentSession_1.AgentSession({
            workspaceId,
            config,
            historyService,
            partialService,
            aiService,
            initStateManager,
            costTrackingService: {},
            backgroundProcessManager,
        });
        const result = await session.sendMessage("do X", {
            model: "anthropic:claude-3-5-sonnet-latest",
            agentId: "exec",
            muxMetadata: {
                type: "agent-skill",
                rawCommand: "/test-skill do X",
                skillName: "test-skill",
                scope: "project",
            },
        });
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(appendToHistory.mock.calls).toHaveLength(2);
        const [snapshotMessage, userMessage] = messages;
        (0, bun_test_1.expect)(snapshotMessage.role).toBe("user");
        (0, bun_test_1.expect)(snapshotMessage.metadata?.synthetic).toBe(true);
        (0, bun_test_1.expect)(snapshotMessage.metadata?.agentSkillSnapshot?.skillName).toBe("test-skill");
        (0, bun_test_1.expect)(snapshotMessage.metadata?.agentSkillSnapshot?.sha256).toBeTruthy();
        const frontmatterYaml = snapshotMessage.metadata?.agentSkillSnapshot?.frontmatterYaml;
        (0, bun_test_1.expect)(frontmatterYaml).toBeTruthy();
        (0, bun_test_1.expect)(frontmatterYaml ?? "").toContain("name:");
        (0, bun_test_1.expect)(frontmatterYaml ?? "").toContain("description:");
        const snapshotText = snapshotMessage.parts.find((p) => p.type === "text")?.text;
        (0, bun_test_1.expect)(snapshotText).toContain("<agent-skill");
        (0, bun_test_1.expect)(snapshotText).toContain("Follow this skill.");
        (0, bun_test_1.expect)(userMessage.role).toBe("user");
        const userText = userMessage.parts.find((p) => p.type === "text")?.text;
        (0, bun_test_1.expect)(userText).toBe("do X");
    });
    (0, bun_test_1.it)("honors disableWorkspaceAgents when resolving skill snapshots", async () => {
        const workspaceId = "ws-test";
        const { workspacePath: projectPath } = await createTestWorkspaceWithSkill({
            // Built-in: use a project-local override to ensure we don't accidentally fall back.
            skillName: "init",
            skillBody: "Project override for init skill.",
        });
        const srcBaseDir = await fs.mkdtemp(path.join(os.tmpdir(), "mux-agent-skill-src-"));
        const config = {
            srcDir: "/tmp",
            getSessionDir: (_workspaceId) => "/tmp",
        };
        const { historyService, cleanup } = await (0, testHistoryService_1.createTestHistoryService)();
        historyCleanup = cleanup;
        const messages = [];
        const realAppend = historyService.appendToHistory.bind(historyService);
        const appendToHistory = (0, bun_test_1.spyOn)(historyService, "appendToHistory").mockImplementation(async (wId, message) => {
            messages.push(message);
            return realAppend(wId, message);
        });
        const partialService = {
            commitToHistory: (0, bun_test_1.mock)((_workspaceId) => Promise.resolve((0, result_1.Ok)(undefined))),
        };
        const aiEmitter = new events_1.EventEmitter();
        const workspaceMeta = {
            id: workspaceId,
            name: "ws",
            projectName: "proj",
            projectPath,
            namedWorkspacePath: projectPath,
            runtimeConfig: { type: "worktree", srcBaseDir },
        };
        const streamMessage = (0, bun_test_1.mock)((_messages) => {
            return Promise.resolve((0, result_1.Ok)(undefined));
        });
        const aiService = Object.assign(aiEmitter, {
            isStreaming: (0, bun_test_1.mock)((_workspaceId) => false),
            stopStream: (0, bun_test_1.mock)((_workspaceId) => Promise.resolve((0, result_1.Ok)(undefined))),
            getWorkspaceMetadata: (0, bun_test_1.mock)((_workspaceId) => Promise.resolve((0, result_1.Ok)(workspaceMeta))),
            streamMessage: streamMessage,
        });
        const initStateManager = new events_1.EventEmitter();
        const backgroundProcessManager = {
            cleanup: (0, bun_test_1.mock)((_workspaceId) => Promise.resolve()),
            setMessageQueued: (0, bun_test_1.mock)((_workspaceId, _queued) => {
                void _queued;
            }),
        };
        const session = new agentSession_1.AgentSession({
            workspaceId,
            config,
            historyService,
            partialService,
            aiService,
            initStateManager,
            costTrackingService: {},
            backgroundProcessManager,
        });
        const result = await session.sendMessage("do X", {
            model: "anthropic:claude-3-5-sonnet-latest",
            agentId: "exec",
            disableWorkspaceAgents: true,
            muxMetadata: {
                type: "agent-skill",
                rawCommand: "/init",
                skillName: "init",
                scope: "project",
            },
        });
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(appendToHistory.mock.calls).toHaveLength(2);
        const [snapshotMessage] = messages;
        const snapshotText = snapshotMessage.parts.find((p) => p.type === "text")?.text;
        (0, bun_test_1.expect)(snapshotText).toContain("Project override for init skill.");
    });
    (0, bun_test_1.it)("dedupes identical skill snapshots when recently inserted", async () => {
        const workspaceId = "ws-test";
        const { workspacePath } = await createTestWorkspaceWithSkill({
            skillName: "test-skill",
            skillBody: "Follow this skill.",
        });
        const config = {
            srcDir: "/tmp",
            getSessionDir: (_workspaceId) => "/tmp",
        };
        const { historyService, cleanup } = await (0, testHistoryService_1.createTestHistoryService)();
        historyCleanup = cleanup;
        const messages = [];
        const realAppend = historyService.appendToHistory.bind(historyService);
        const appendToHistory = (0, bun_test_1.spyOn)(historyService, "appendToHistory").mockImplementation(async (wId, message) => {
            messages.push(message);
            return realAppend(wId, message);
        });
        const partialService = {
            commitToHistory: (0, bun_test_1.mock)((_workspaceId) => Promise.resolve((0, result_1.Ok)(undefined))),
        };
        const aiEmitter = new events_1.EventEmitter();
        const workspaceMeta = {
            id: workspaceId,
            name: "ws",
            projectName: "proj",
            projectPath: workspacePath,
            namedWorkspacePath: workspacePath,
            runtimeConfig: { type: "local" },
        };
        const streamMessage = (0, bun_test_1.mock)((_messages) => {
            return Promise.resolve((0, result_1.Ok)(undefined));
        });
        const aiService = Object.assign(aiEmitter, {
            isStreaming: (0, bun_test_1.mock)((_workspaceId) => false),
            stopStream: (0, bun_test_1.mock)((_workspaceId) => Promise.resolve((0, result_1.Ok)(undefined))),
            getWorkspaceMetadata: (0, bun_test_1.mock)((_workspaceId) => Promise.resolve((0, result_1.Ok)(workspaceMeta))),
            streamMessage: streamMessage,
        });
        const initStateManager = new events_1.EventEmitter();
        const backgroundProcessManager = {
            cleanup: (0, bun_test_1.mock)((_workspaceId) => Promise.resolve()),
            setMessageQueued: (0, bun_test_1.mock)((_workspaceId, _queued) => {
                void _queued;
            }),
        };
        const session = new agentSession_1.AgentSession({
            workspaceId,
            config,
            historyService,
            partialService,
            aiService,
            initStateManager,
            costTrackingService: {},
            backgroundProcessManager,
        });
        const baseOptions = {
            model: "anthropic:claude-3-5-sonnet-latest",
            agentId: "exec",
            muxMetadata: {
                type: "agent-skill",
                rawCommand: "/test-skill do X",
                skillName: "test-skill",
                scope: "project",
            },
        };
        const first = await session.sendMessage("do X", baseOptions);
        (0, bun_test_1.expect)(first.success).toBe(true);
        (0, bun_test_1.expect)(appendToHistory.mock.calls).toHaveLength(2);
        const second = await session.sendMessage("do Y", {
            ...baseOptions,
            muxMetadata: {
                ...baseOptions.muxMetadata,
                rawCommand: "/test-skill do Y",
            },
        });
        (0, bun_test_1.expect)(second.success).toBe(true);
        // First send: snapshot + user. Second send: user only.
        (0, bun_test_1.expect)(appendToHistory.mock.calls).toHaveLength(3);
        const appendedIds = appendToHistory.mock.calls.map((call) => call[1].id);
        const secondSendAppendedIds = appendedIds.slice(2);
        (0, bun_test_1.expect)(secondSendAppendedIds).toHaveLength(1);
        (0, bun_test_1.expect)(secondSendAppendedIds[0]).toStartWith("user-");
    });
    (0, bun_test_1.it)("persists a new skill snapshot when frontmatter changes (body unchanged)", async () => {
        const workspaceId = "ws-test";
        const skillName = "test-skill";
        const skillBody = "Follow this skill.";
        const { workspacePath } = await createTestWorkspaceWithSkill({
            skillName,
            skillBody,
        });
        const config = {
            srcDir: "/tmp",
            getSessionDir: (_workspaceId) => "/tmp",
        };
        const { historyService, cleanup } = await (0, testHistoryService_1.createTestHistoryService)();
        historyCleanup = cleanup;
        const messages = [];
        const realAppend = historyService.appendToHistory.bind(historyService);
        const appendToHistory = (0, bun_test_1.spyOn)(historyService, "appendToHistory").mockImplementation(async (wId, message) => {
            messages.push(message);
            return realAppend(wId, message);
        });
        const partialService = {
            commitToHistory: (0, bun_test_1.mock)((_workspaceId) => Promise.resolve((0, result_1.Ok)(undefined))),
        };
        const aiEmitter = new events_1.EventEmitter();
        const workspaceMeta = {
            id: workspaceId,
            name: "ws",
            projectName: "proj",
            projectPath: workspacePath,
            namedWorkspacePath: workspacePath,
            runtimeConfig: { type: "local" },
        };
        const aiService = Object.assign(aiEmitter, {
            isStreaming: (0, bun_test_1.mock)((_workspaceId) => false),
            stopStream: (0, bun_test_1.mock)((_workspaceId) => Promise.resolve((0, result_1.Ok)(undefined))),
            getWorkspaceMetadata: (0, bun_test_1.mock)((_workspaceId) => Promise.resolve((0, result_1.Ok)(workspaceMeta))),
            streamMessage: (0, bun_test_1.mock)((_messages) => {
                return Promise.resolve((0, result_1.Ok)(undefined));
            }),
        });
        const initStateManager = new events_1.EventEmitter();
        const backgroundProcessManager = {
            cleanup: (0, bun_test_1.mock)((_workspaceId) => Promise.resolve()),
            setMessageQueued: (0, bun_test_1.mock)((_workspaceId, _queued) => {
                void _queued;
            }),
        };
        const session = new agentSession_1.AgentSession({
            workspaceId,
            config,
            historyService,
            partialService,
            aiService,
            initStateManager,
            costTrackingService: {},
            backgroundProcessManager,
        });
        const baseOptions = {
            model: "anthropic:claude-3-5-sonnet-latest",
            agentId: "exec",
            muxMetadata: {
                type: "agent-skill",
                rawCommand: "/test-skill do X",
                skillName,
                scope: "project",
            },
        };
        const first = await session.sendMessage("do X", baseOptions);
        (0, bun_test_1.expect)(first.success).toBe(true);
        (0, bun_test_1.expect)(appendToHistory.mock.calls).toHaveLength(2);
        const firstSnapshot = messages[0];
        (0, bun_test_1.expect)(firstSnapshot.id).toStartWith("agent-skill-snapshot-");
        const firstSnapshotText = firstSnapshot.parts.find((p) => p.type === "text")?.text;
        (0, bun_test_1.expect)(firstSnapshotText).toBeTruthy();
        const firstSha = firstSnapshot.metadata?.agentSkillSnapshot?.sha256;
        (0, bun_test_1.expect)(firstSha).toBeTruthy();
        // Update frontmatter only.
        const skillFilePath = path.join(workspacePath, ".mux", "skills", skillName, "SKILL.md");
        const updatedSkillMarkdown = `---\nname: ${skillName}\ndescription: Updated description\n---\n\n${skillBody}\n`;
        await fs.writeFile(skillFilePath, updatedSkillMarkdown, "utf-8");
        const second = await session.sendMessage("do Y", {
            ...baseOptions,
            muxMetadata: {
                ...baseOptions.muxMetadata,
                rawCommand: "/test-skill do Y",
            },
        });
        (0, bun_test_1.expect)(second.success).toBe(true);
        // Second send should persist a new snapshot (frontmatter differs) + user message.
        (0, bun_test_1.expect)(appendToHistory.mock.calls).toHaveLength(4);
        const secondSnapshot = messages[2];
        (0, bun_test_1.expect)(secondSnapshot.id).toStartWith("agent-skill-snapshot-");
        const secondSnapshotText = secondSnapshot.parts.find((p) => p.type === "text")?.text;
        (0, bun_test_1.expect)(secondSnapshotText).toBe(firstSnapshotText);
        const secondSha = secondSnapshot.metadata?.agentSkillSnapshot?.sha256;
        (0, bun_test_1.expect)(secondSha).toBeTruthy();
        (0, bun_test_1.expect)(secondSha).not.toBe(firstSha);
        const secondFrontmatter = secondSnapshot.metadata?.agentSkillSnapshot?.frontmatterYaml;
        (0, bun_test_1.expect)(secondFrontmatter ?? "").toContain("Updated description");
    });
    (0, bun_test_1.it)("truncates edits starting from preceding skill/file snapshots", async () => {
        const workspaceId = "ws-test";
        const config = {
            srcDir: "/tmp",
            getSessionDir: (_workspaceId) => "/tmp",
        };
        const fileSnapshotId = "file-snapshot-0";
        const skillSnapshotId = "agent-skill-snapshot-0";
        const userMessageId = "user-0";
        const historyMessages = [
            (0, message_1.createMuxMessage)(fileSnapshotId, "user", "<file>...</file>", {
                historySequence: 0,
                synthetic: true,
                fileAtMentionSnapshot: ["@file:foo.txt"],
            }),
            (0, message_1.createMuxMessage)(skillSnapshotId, "user", "<agent-skill>...</agent-skill>", {
                historySequence: 1,
                synthetic: true,
                agentSkillSnapshot: {
                    skillName: "test-skill",
                    scope: "project",
                    sha256: "abc",
                },
            }),
            (0, message_1.createMuxMessage)(userMessageId, "user", "do X", {
                historySequence: 2,
                muxMetadata: {
                    type: "agent-skill",
                    rawCommand: "/test-skill do X",
                    skillName: "test-skill",
                    scope: "project",
                },
            }),
        ];
        const { historyService, cleanup } = await (0, testHistoryService_1.createTestHistoryService)();
        historyCleanup = cleanup;
        // Seed history messages before setting up spies
        for (const msg of historyMessages) {
            await historyService.appendToHistory(workspaceId, msg);
        }
        const truncateAfterMessage = (0, bun_test_1.spyOn)(historyService, "truncateAfterMessage");
        (0, bun_test_1.spyOn)(historyService, "appendToHistory");
        const partialService = {
            commitToHistory: (0, bun_test_1.mock)((_workspaceId) => Promise.resolve((0, result_1.Ok)(undefined))),
        };
        const aiEmitter = new events_1.EventEmitter();
        const aiService = Object.assign(aiEmitter, {
            isStreaming: (0, bun_test_1.mock)((_workspaceId) => false),
            stopStream: (0, bun_test_1.mock)((_workspaceId) => Promise.resolve((0, result_1.Ok)(undefined))),
            streamMessage: (0, bun_test_1.mock)((_messages) => Promise.resolve((0, result_1.Ok)(undefined))),
        });
        const initStateManager = new events_1.EventEmitter();
        const backgroundProcessManager = {
            cleanup: (0, bun_test_1.mock)((_workspaceId) => Promise.resolve()),
            setMessageQueued: (0, bun_test_1.mock)((_workspaceId, _queued) => {
                void _queued;
            }),
        };
        const session = new agentSession_1.AgentSession({
            workspaceId,
            config,
            historyService,
            partialService,
            aiService,
            initStateManager,
            costTrackingService: {},
            backgroundProcessManager,
        });
        const result = await session.sendMessage("edited", {
            model: "anthropic:claude-3-5-sonnet-latest",
            agentId: "exec",
            editMessageId: userMessageId,
        });
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(truncateAfterMessage.mock.calls).toHaveLength(1);
        // Should truncate from the earliest contiguous snapshot (file snapshot).
        (0, bun_test_1.expect)(truncateAfterMessage.mock.calls[0][1]).toBe(fileSnapshotId);
    });
});
//# sourceMappingURL=agentSession.agentSkillSnapshot.test.js.map