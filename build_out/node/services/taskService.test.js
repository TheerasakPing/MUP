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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const fsPromises = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const node_child_process_1 = require("node:child_process");
const config_1 = require("../../node/config");
const historyService_1 = require("../../node/services/historyService");
const partialService_1 = require("../../node/services/partialService");
const subagentGitPatchArtifacts_1 = require("../../node/services/subagentGitPatchArtifacts");
const subagentReportArtifacts_1 = require("../../node/services/subagentReportArtifacts");
const taskService_1 = require("../../node/services/taskService");
const WorktreeRuntime_1 = require("../../node/runtime/WorktreeRuntime");
const runtimeFactory_1 = require("../../node/runtime/runtimeFactory");
const result_1 = require("../../common/types/result");
const message_1 = require("../../common/types/message");
const initStateManager_1 = require("../../node/services/initStateManager");
const node_assert_1 = __importDefault(require("node:assert"));
function initGitRepo(projectPath) {
    (0, node_child_process_1.execSync)("git init -b main", { cwd: projectPath, stdio: "ignore" });
    (0, node_child_process_1.execSync)('git config user.email "test@example.com"', { cwd: projectPath, stdio: "ignore" });
    (0, node_child_process_1.execSync)('git config user.name "test"', { cwd: projectPath, stdio: "ignore" });
    // Ensure tests don't hang when developers have global commit signing enabled.
    (0, node_child_process_1.execSync)("git config commit.gpgsign false", { cwd: projectPath, stdio: "ignore" });
    (0, node_child_process_1.execSync)("bash -lc 'echo \"hello\" > README.md'", { cwd: projectPath, stdio: "ignore" });
    (0, node_child_process_1.execSync)("git add README.md", { cwd: projectPath, stdio: "ignore" });
    (0, node_child_process_1.execSync)('git commit -m "init"', { cwd: projectPath, stdio: "ignore" });
}
async function collectFullHistory(service, workspaceId) {
    const messages = [];
    const result = await service.iterateFullHistory(workspaceId, "forward", (chunk) => {
        messages.push(...chunk);
    });
    (0, node_assert_1.default)(result.success, `collectFullHistory failed: ${result.success ? "" : result.error}`);
    return messages;
}
function createNullInitLogger() {
    return {
        logStep: (_message) => undefined,
        logStdout: (_line) => undefined,
        logStderr: (_line) => undefined,
        logComplete: (_exitCode) => undefined,
        enterHookPhase: () => undefined,
    };
}
function createMockInitStateManager() {
    return {
        startInit: (0, bun_test_1.mock)(() => undefined),
        enterHookPhase: (0, bun_test_1.mock)(() => undefined),
        appendOutput: (0, bun_test_1.mock)(() => undefined),
        endInit: (0, bun_test_1.mock)(() => Promise.resolve()),
        getInitState: (0, bun_test_1.mock)(() => undefined),
        readInitStatus: (0, bun_test_1.mock)(() => Promise.resolve(null)),
    };
}
async function createTestConfig(rootDir) {
    const config = new config_1.Config(rootDir);
    await fsPromises.mkdir(config.srcDir, { recursive: true });
    return config;
}
async function createTestProject(rootDir, name = "repo", options) {
    const projectPath = path.join(rootDir, name);
    await fsPromises.mkdir(projectPath, { recursive: true });
    if (options?.initGit ?? true) {
        initGitRepo(projectPath);
    }
    return projectPath;
}
function stubStableIds(config, ids, fallbackId = "fffffffff0") {
    let nextIdIndex = 0;
    const configWithStableId = config;
    configWithStableId.generateStableId = () => ids[nextIdIndex++] ?? fallbackId;
}
function createAIServiceMocks(config, overrides) {
    const isStreaming = overrides?.isStreaming ?? (0, bun_test_1.mock)(() => false);
    const getWorkspaceMetadata = overrides?.getWorkspaceMetadata ??
        (0, bun_test_1.mock)(async (workspaceId) => {
            const all = await config.getAllWorkspaceMetadata();
            const found = all.find((m) => m.id === workspaceId);
            return found ? (0, result_1.Ok)(found) : (0, result_1.Err)("not found");
        });
    const stopStream = overrides?.stopStream ?? (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(undefined)));
    const on = overrides?.on ?? (0, bun_test_1.mock)(() => undefined);
    const off = overrides?.off ?? (0, bun_test_1.mock)(() => undefined);
    return {
        aiService: { isStreaming, getWorkspaceMetadata, stopStream, on, off },
        isStreaming,
        getWorkspaceMetadata,
        stopStream,
        on,
        off,
    };
}
function createWorkspaceServiceMocks(overrides) {
    const sendMessage = overrides?.sendMessage ?? (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(undefined)));
    const resumeStream = overrides?.resumeStream ?? (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(undefined)));
    const remove = overrides?.remove ?? (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(undefined)));
    const emit = overrides?.emit ?? (0, bun_test_1.mock)(() => true);
    return {
        workspaceService: {
            sendMessage,
            resumeStream,
            remove,
            emit,
        },
        sendMessage,
        resumeStream,
        remove,
        emit,
    };
}
function createTaskServiceHarness(config, overrides) {
    const historyService = new historyService_1.HistoryService(config);
    const partialService = new partialService_1.PartialService(config, historyService);
    const aiService = overrides?.aiService ?? createAIServiceMocks(config).aiService;
    const workspaceService = overrides?.workspaceService ?? createWorkspaceServiceMocks().workspaceService;
    const initStateManager = overrides?.initStateManager ?? createMockInitStateManager();
    const taskService = new taskService_1.TaskService(config, historyService, partialService, aiService, workspaceService, initStateManager);
    return {
        historyService,
        partialService,
        taskService,
        aiService,
        workspaceService,
        initStateManager,
    };
}
(0, bun_test_1.describe)("TaskService", () => {
    let rootDir;
    (0, bun_test_1.beforeEach)(async () => {
        rootDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "mux-taskService-"));
    });
    (0, bun_test_1.afterEach)(async () => {
        await fsPromises.rm(rootDir, { recursive: true, force: true });
    });
    (0, bun_test_1.test)("enforces maxTaskNestingDepth", async () => {
        const config = await createTestConfig(rootDir);
        stubStableIds(config, ["aaaaaaaaaa", "bbbbbbbbbb", "cccccccccc"], "dddddddddd");
        const projectPath = await createTestProject(rootDir);
        const runtimeConfig = { type: "worktree", srcBaseDir: config.srcDir };
        const runtime = (0, runtimeFactory_1.createRuntime)(runtimeConfig, { projectPath });
        const initLogger = createNullInitLogger();
        const parentName = "parent";
        const parentCreate = await runtime.createWorkspace({
            projectPath,
            branchName: parentName,
            trunkBranch: "main",
            directoryName: parentName,
            initLogger,
        });
        (0, bun_test_1.expect)(parentCreate.success).toBe(true);
        const parentId = "1111111111";
        const parentPath = runtime.getWorkspacePath(projectPath, parentName);
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            {
                                path: parentPath,
                                id: parentId,
                                name: parentName,
                                createdAt: new Date().toISOString(),
                                runtimeConfig,
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 3, maxTaskNestingDepth: 2 },
        });
        const { taskService } = createTaskServiceHarness(config);
        const first = await taskService.create({
            parentWorkspaceId: parentId,
            kind: "agent",
            agentType: "explore",
            prompt: "explore this repo",
            title: "Test task",
        });
        (0, bun_test_1.expect)(first.success).toBe(true);
        if (!first.success)
            return;
        const second = await taskService.create({
            parentWorkspaceId: first.data.taskId,
            kind: "agent",
            agentType: "explore",
            prompt: "nested explore",
            title: "Test task",
        });
        (0, bun_test_1.expect)(second.success).toBe(true);
        if (!second.success)
            return;
        const third = await taskService.create({
            parentWorkspaceId: second.data.taskId,
            kind: "agent",
            agentType: "explore",
            prompt: "nested explore again",
            title: "Test task",
        });
        (0, bun_test_1.expect)(third.success).toBe(false);
        if (!third.success) {
            (0, bun_test_1.expect)(third.error).toContain("maxTaskNestingDepth");
        }
    }, 20_000);
    (0, bun_test_1.test)("queues tasks when maxParallelAgentTasks is reached and starts them when a slot frees", async () => {
        const config = await createTestConfig(rootDir);
        stubStableIds(config, ["aaaaaaaaaa", "bbbbbbbbbb", "cccccccccc", "dddddddddd"], "eeeeeeeeee");
        const projectPath = await createTestProject(rootDir);
        const runtimeConfig = { type: "worktree", srcBaseDir: config.srcDir };
        const runtime = (0, runtimeFactory_1.createRuntime)(runtimeConfig, { projectPath });
        const initLogger = createNullInitLogger();
        const parent1Name = "parent1";
        const parent2Name = "parent2";
        await runtime.createWorkspace({
            projectPath,
            branchName: parent1Name,
            trunkBranch: "main",
            directoryName: parent1Name,
            initLogger,
        });
        await runtime.createWorkspace({
            projectPath,
            branchName: parent2Name,
            trunkBranch: "main",
            directoryName: parent2Name,
            initLogger,
        });
        const parent1Id = "1111111111";
        const parent2Id = "2222222222";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            {
                                path: runtime.getWorkspacePath(projectPath, parent1Name),
                                id: parent1Id,
                                name: parent1Name,
                                createdAt: new Date().toISOString(),
                                runtimeConfig,
                            },
                            {
                                path: runtime.getWorkspacePath(projectPath, parent2Name),
                                id: parent2Id,
                                name: parent2Name,
                                createdAt: new Date().toISOString(),
                                runtimeConfig,
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 1, maxTaskNestingDepth: 3 },
        });
        const { workspaceService, sendMessage } = createWorkspaceServiceMocks();
        const { taskService } = createTaskServiceHarness(config, { workspaceService });
        const running = await taskService.create({
            parentWorkspaceId: parent1Id,
            kind: "agent",
            agentType: "explore",
            prompt: "task 1",
            title: "Test task",
        });
        (0, bun_test_1.expect)(running.success).toBe(true);
        if (!running.success)
            return;
        const queued = await taskService.create({
            parentWorkspaceId: parent2Id,
            kind: "agent",
            agentType: "explore",
            prompt: "task 2",
            title: "Test task",
        });
        (0, bun_test_1.expect)(queued.success).toBe(true);
        if (!queued.success)
            return;
        (0, bun_test_1.expect)(queued.data.status).toBe("queued");
        // Free the slot by marking the first task as reported.
        await config.editConfig((cfg) => {
            for (const [_project, project] of cfg.projects) {
                const ws = project.workspaces.find((w) => w.id === running.data.taskId);
                if (ws) {
                    ws.taskStatus = "reported";
                }
            }
            return cfg;
        });
        await taskService.initialize();
        (0, bun_test_1.expect)(sendMessage).toHaveBeenCalledWith(queued.data.taskId, "task 2", bun_test_1.expect.anything(), bun_test_1.expect.objectContaining({ allowQueuedAgentTask: true }));
        const cfg = config.loadConfigOrDefault();
        const started = Array.from(cfg.projects.values())
            .flatMap((p) => p.workspaces)
            .find((w) => w.id === queued.data.taskId);
        (0, bun_test_1.expect)(started?.taskStatus).toBe("running");
    }, 20_000);
    (0, bun_test_1.test)("does not count foreground-awaiting tasks towards maxParallelAgentTasks", async () => {
        const config = await createTestConfig(rootDir);
        stubStableIds(config, ["aaaaaaaaaa", "bbbbbbbbbb", "cccccccccc"], "dddddddddd");
        const projectPath = await createTestProject(rootDir);
        let streamingWorkspaceId = null;
        const { aiService } = createAIServiceMocks(config, {
            isStreaming: (0, bun_test_1.mock)((workspaceId) => workspaceId === streamingWorkspaceId),
        });
        const runtimeConfig = { type: "worktree", srcBaseDir: config.srcDir };
        const runtime = (0, runtimeFactory_1.createRuntime)(runtimeConfig, { projectPath });
        const initLogger = createNullInitLogger();
        const rootName = "root";
        await runtime.createWorkspace({
            projectPath,
            branchName: rootName,
            trunkBranch: "main",
            directoryName: rootName,
            initLogger,
        });
        const rootWorkspaceId = "root-111";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            {
                                path: runtime.getWorkspacePath(projectPath, rootName),
                                id: rootWorkspaceId,
                                name: rootName,
                                createdAt: new Date().toISOString(),
                                runtimeConfig,
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 1, maxTaskNestingDepth: 3 },
        });
        const { workspaceService, sendMessage } = createWorkspaceServiceMocks();
        const { taskService } = createTaskServiceHarness(config, { aiService, workspaceService });
        const parentTask = await taskService.create({
            parentWorkspaceId: rootWorkspaceId,
            kind: "agent",
            agentType: "explore",
            prompt: "parent task",
            title: "Test task",
        });
        (0, bun_test_1.expect)(parentTask.success).toBe(true);
        if (!parentTask.success)
            return;
        streamingWorkspaceId = parentTask.data.taskId;
        // With maxParallelAgentTasks=1, nested tasks will be created as queued.
        const childTask = await taskService.create({
            parentWorkspaceId: parentTask.data.taskId,
            kind: "agent",
            agentType: "explore",
            prompt: "child task",
            title: "Test task",
        });
        (0, bun_test_1.expect)(childTask.success).toBe(true);
        if (!childTask.success)
            return;
        (0, bun_test_1.expect)(childTask.data.status).toBe("queued");
        // Simulate a foreground await from the parent task workspace. This should allow the queued child
        // to start despite maxParallelAgentTasks=1, avoiding a scheduler deadlock.
        const waiter = taskService.waitForAgentReport(childTask.data.taskId, {
            timeoutMs: 10_000,
            requestingWorkspaceId: parentTask.data.taskId,
        });
        const internal = taskService;
        await internal.maybeStartQueuedTasks();
        (0, bun_test_1.expect)(sendMessage).toHaveBeenCalledWith(childTask.data.taskId, "child task", bun_test_1.expect.anything(), bun_test_1.expect.objectContaining({ allowQueuedAgentTask: true }));
        const cfgAfterStart = config.loadConfigOrDefault();
        const startedEntry = Array.from(cfgAfterStart.projects.values())
            .flatMap((p) => p.workspaces)
            .find((w) => w.id === childTask.data.taskId);
        (0, bun_test_1.expect)(startedEntry?.taskStatus).toBe("running");
        internal.resolveWaiters(childTask.data.taskId, { reportMarkdown: "ok" });
        const report = await waiter;
        (0, bun_test_1.expect)(report.reportMarkdown).toBe("ok");
    }, 20_000);
    (0, bun_test_1.test)("persists forked runtime config updates when dequeuing tasks", async () => {
        const config = await createTestConfig(rootDir);
        stubStableIds(config, ["aaaaaaaaaa", "bbbbbbbbbb"], "cccccccccc");
        const projectPath = await createTestProject(rootDir);
        const runtimeConfig = { type: "worktree", srcBaseDir: config.srcDir };
        const runtime = (0, runtimeFactory_1.createRuntime)(runtimeConfig, { projectPath });
        const initLogger = createNullInitLogger();
        const parentName = "parent";
        await runtime.createWorkspace({
            projectPath,
            branchName: parentName,
            trunkBranch: "main",
            directoryName: parentName,
            initLogger,
        });
        const parentId = "1111111111";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            {
                                path: runtime.getWorkspacePath(projectPath, parentName),
                                id: parentId,
                                name: parentName,
                                createdAt: new Date().toISOString(),
                                runtimeConfig,
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 1, maxTaskNestingDepth: 3 },
        });
        const forkedSrcBaseDir = path.join(config.srcDir, "forked-runtime");
        const sourceSrcBaseDir = path.join(config.srcDir, "source-runtime");
        // eslint-disable-next-line @typescript-eslint/unbound-method -- intentionally capturing prototype method for spy
        const originalFork = WorktreeRuntime_1.WorktreeRuntime.prototype.forkWorkspace;
        let forkCallCount = 0;
        const forkSpy = (0, bun_test_1.spyOn)(WorktreeRuntime_1.WorktreeRuntime.prototype, "forkWorkspace").mockImplementation(async function (params) {
            const result = await originalFork.call(this, params);
            if (!result.success)
                return result;
            forkCallCount += 1;
            if (forkCallCount === 2) {
                return {
                    ...result,
                    forkedRuntimeConfig: { ...runtimeConfig, srcBaseDir: forkedSrcBaseDir },
                    sourceRuntimeConfig: { ...runtimeConfig, srcBaseDir: sourceSrcBaseDir },
                };
            }
            return result;
        });
        try {
            const { taskService } = createTaskServiceHarness(config);
            const running = await taskService.create({
                parentWorkspaceId: parentId,
                kind: "agent",
                agentType: "explore",
                prompt: "task 1",
                title: "Test task",
            });
            (0, bun_test_1.expect)(running.success).toBe(true);
            if (!running.success)
                return;
            const queued = await taskService.create({
                parentWorkspaceId: parentId,
                kind: "agent",
                agentType: "explore",
                prompt: "task 2",
                title: "Test task",
            });
            (0, bun_test_1.expect)(queued.success).toBe(true);
            if (!queued.success)
                return;
            (0, bun_test_1.expect)(queued.data.status).toBe("queued");
            await config.editConfig((cfg) => {
                for (const [_project, project] of cfg.projects) {
                    const ws = project.workspaces.find((w) => w.id === running.data.taskId);
                    if (ws) {
                        ws.taskStatus = "reported";
                    }
                }
                return cfg;
            });
            await taskService.initialize();
            const postCfg = config.loadConfigOrDefault();
            const workspaces = Array.from(postCfg.projects.values()).flatMap((p) => p.workspaces);
            const parentEntry = workspaces.find((w) => w.id === parentId);
            const childEntry = workspaces.find((w) => w.id === queued.data.taskId);
            (0, bun_test_1.expect)(parentEntry?.runtimeConfig).toMatchObject({
                type: "worktree",
                srcBaseDir: sourceSrcBaseDir,
            });
            (0, bun_test_1.expect)(childEntry?.runtimeConfig).toMatchObject({
                type: "worktree",
                srcBaseDir: forkedSrcBaseDir,
            });
        }
        finally {
            forkSpy.mockRestore();
        }
    }, 20_000);
    (0, bun_test_1.test)("does not run init hooks for queued tasks until they start", async () => {
        const config = await createTestConfig(rootDir);
        stubStableIds(config, ["aaaaaaaaaa", "bbbbbbbbbb", "cccccccccc"], "dddddddddd");
        const projectPath = await createTestProject(rootDir);
        const runtimeConfig = { type: "worktree", srcBaseDir: config.srcDir };
        const runtime = (0, runtimeFactory_1.createRuntime)(runtimeConfig, { projectPath });
        const initLogger = createNullInitLogger();
        const parentName = "parent";
        await runtime.createWorkspace({
            projectPath,
            branchName: parentName,
            trunkBranch: "main",
            directoryName: parentName,
            initLogger,
        });
        const parentId = "1111111111";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            {
                                path: runtime.getWorkspacePath(projectPath, parentName),
                                id: parentId,
                                name: parentName,
                                createdAt: new Date().toISOString(),
                                runtimeConfig,
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 1, maxTaskNestingDepth: 3 },
        });
        const initStateManager = new initStateManager_1.InitStateManager(config);
        const { workspaceService, sendMessage } = createWorkspaceServiceMocks();
        const { taskService } = createTaskServiceHarness(config, {
            workspaceService,
            initStateManager: initStateManager,
        });
        const running = await taskService.create({
            parentWorkspaceId: parentId,
            kind: "agent",
            agentType: "explore",
            prompt: "task 1",
            title: "Test task",
        });
        (0, bun_test_1.expect)(running.success).toBe(true);
        if (!running.success)
            return;
        // Wait for running task init (fire-and-forget) so the init-status file exists.
        await initStateManager.waitForInit(running.data.taskId);
        const queued = await taskService.create({
            parentWorkspaceId: parentId,
            kind: "agent",
            agentType: "explore",
            prompt: "task 2",
            title: "Test task",
        });
        (0, bun_test_1.expect)(queued.success).toBe(true);
        if (!queued.success)
            return;
        (0, bun_test_1.expect)(queued.data.status).toBe("queued");
        // Queued tasks should not create a worktree directory until they're dequeued.
        const cfgBeforeStart = config.loadConfigOrDefault();
        const queuedEntryBeforeStart = Array.from(cfgBeforeStart.projects.values())
            .flatMap((p) => p.workspaces)
            .find((w) => w.id === queued.data.taskId);
        (0, bun_test_1.expect)(queuedEntryBeforeStart).toBeTruthy();
        await fsPromises.stat(queuedEntryBeforeStart.path).then(() => {
            throw new Error("Expected queued task workspace path to not exist before start");
        }, () => undefined);
        const queuedInitStatusPath = path.join(config.getSessionDir(queued.data.taskId), "init-status.json");
        await fsPromises.stat(queuedInitStatusPath).then(() => {
            throw new Error("Expected queued task init-status to not exist before start");
        }, () => undefined);
        // Free slot and start queued tasks.
        await config.editConfig((cfg) => {
            for (const [_project, project] of cfg.projects) {
                const ws = project.workspaces.find((w) => w.id === running.data.taskId);
                if (ws) {
                    ws.taskStatus = "reported";
                }
            }
            return cfg;
        });
        await taskService.initialize();
        (0, bun_test_1.expect)(sendMessage).toHaveBeenCalledWith(queued.data.taskId, "task 2", bun_test_1.expect.anything(), bun_test_1.expect.objectContaining({ allowQueuedAgentTask: true }));
        // Init should start only once the task is dequeued.
        await initStateManager.waitForInit(queued.data.taskId);
        (0, bun_test_1.expect)(await fsPromises.stat(queuedInitStatusPath)).toBeTruthy();
        const cfgAfterStart = config.loadConfigOrDefault();
        const queuedEntryAfterStart = Array.from(cfgAfterStart.projects.values())
            .flatMap((p) => p.workspaces)
            .find((w) => w.id === queued.data.taskId);
        (0, bun_test_1.expect)(queuedEntryAfterStart).toBeTruthy();
        (0, bun_test_1.expect)(await fsPromises.stat(queuedEntryAfterStart.path)).toBeTruthy();
    }, 20_000);
    (0, bun_test_1.test)("does not start queued tasks while a reported task is still streaming", async () => {
        const config = await createTestConfig(rootDir);
        const projectPath = path.join(rootDir, "repo");
        const rootWorkspaceId = "root-111";
        const reportedTaskId = "task-reported";
        const queuedTaskId = "task-queued";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            { path: path.join(projectPath, "root"), id: rootWorkspaceId, name: "root" },
                            {
                                path: path.join(projectPath, "reported"),
                                id: reportedTaskId,
                                name: "agent_explore_reported",
                                parentWorkspaceId: rootWorkspaceId,
                                agentType: "explore",
                                taskStatus: "reported",
                            },
                            {
                                path: path.join(projectPath, "queued"),
                                id: queuedTaskId,
                                name: "agent_explore_queued",
                                parentWorkspaceId: rootWorkspaceId,
                                agentType: "explore",
                                taskStatus: "queued",
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 1, maxTaskNestingDepth: 3 },
        });
        const { aiService } = createAIServiceMocks(config, {
            isStreaming: (0, bun_test_1.mock)((workspaceId) => workspaceId === reportedTaskId),
        });
        const { workspaceService, sendMessage } = createWorkspaceServiceMocks();
        const { taskService } = createTaskServiceHarness(config, { aiService, workspaceService });
        await taskService.initialize();
        (0, bun_test_1.expect)(sendMessage).not.toHaveBeenCalled();
        const cfg = config.loadConfigOrDefault();
        const queued = Array.from(cfg.projects.values())
            .flatMap((p) => p.workspaces)
            .find((w) => w.id === queuedTaskId);
        (0, bun_test_1.expect)(queued?.taskStatus).toBe("queued");
    });
    (0, bun_test_1.test)("allows multiple agent tasks under the same parent up to maxParallelAgentTasks", async () => {
        const config = await createTestConfig(rootDir);
        stubStableIds(config, ["aaaaaaaaaa", "bbbbbbbbbb", "cccccccccc"], "dddddddddd");
        const projectPath = await createTestProject(rootDir);
        const runtimeConfig = { type: "worktree", srcBaseDir: config.srcDir };
        const runtime = (0, runtimeFactory_1.createRuntime)(runtimeConfig, { projectPath });
        const initLogger = createNullInitLogger();
        const parentName = "parent";
        const parentCreate = await runtime.createWorkspace({
            projectPath,
            branchName: parentName,
            trunkBranch: "main",
            directoryName: parentName,
            initLogger,
        });
        (0, bun_test_1.expect)(parentCreate.success).toBe(true);
        const parentId = "1111111111";
        const parentPath = runtime.getWorkspacePath(projectPath, parentName);
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            {
                                path: parentPath,
                                id: parentId,
                                name: parentName,
                                createdAt: new Date().toISOString(),
                                runtimeConfig,
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 2, maxTaskNestingDepth: 3 },
        });
        const { taskService } = createTaskServiceHarness(config);
        const first = await taskService.create({
            parentWorkspaceId: parentId,
            kind: "agent",
            agentType: "explore",
            prompt: "task 1",
            title: "Test task",
        });
        (0, bun_test_1.expect)(first.success).toBe(true);
        if (!first.success)
            return;
        (0, bun_test_1.expect)(first.data.status).toBe("running");
        const second = await taskService.create({
            parentWorkspaceId: parentId,
            kind: "agent",
            agentType: "explore",
            prompt: "task 2",
            title: "Test task",
        });
        (0, bun_test_1.expect)(second.success).toBe(true);
        if (!second.success)
            return;
        (0, bun_test_1.expect)(second.data.status).toBe("running");
        const third = await taskService.create({
            parentWorkspaceId: parentId,
            kind: "agent",
            agentType: "explore",
            prompt: "task 3",
            title: "Test task",
        });
        (0, bun_test_1.expect)(third.success).toBe(true);
        if (!third.success)
            return;
        (0, bun_test_1.expect)(third.data.status).toBe("queued");
    }, 20_000);
    (0, bun_test_1.test)("supports creating agent tasks from local (project-dir) workspaces without requiring git", async () => {
        const config = await createTestConfig(rootDir);
        stubStableIds(config, ["aaaaaaaaaa"], "bbbbbbbbbb");
        const projectPath = await createTestProject(rootDir, "repo", { initGit: false });
        const parentId = "1111111111";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            {
                                path: projectPath,
                                id: parentId,
                                name: "parent",
                                createdAt: new Date().toISOString(),
                                runtimeConfig: { type: "local" },
                                aiSettings: { model: "openai:gpt-5.2", thinkingLevel: "medium" },
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 3, maxTaskNestingDepth: 3 },
        });
        const { taskService } = createTaskServiceHarness(config);
        const created = await taskService.create({
            parentWorkspaceId: parentId,
            kind: "agent",
            agentType: "explore",
            prompt: "run task from local workspace",
            title: "Test task",
        });
        (0, bun_test_1.expect)(created.success).toBe(true);
        if (!created.success)
            return;
        const postCfg = config.loadConfigOrDefault();
        const childEntry = Array.from(postCfg.projects.values())
            .flatMap((p) => p.workspaces)
            .find((w) => w.id === created.data.taskId);
        (0, bun_test_1.expect)(childEntry).toBeTruthy();
        (0, bun_test_1.expect)(childEntry?.path).toBe(projectPath);
        (0, bun_test_1.expect)(childEntry?.runtimeConfig?.type).toBe("local");
        (0, bun_test_1.expect)(childEntry?.aiSettings).toEqual({ model: "openai:gpt-5.2", thinkingLevel: "medium" });
        (0, bun_test_1.expect)(childEntry?.taskModelString).toBe("openai:gpt-5.2");
        (0, bun_test_1.expect)(childEntry?.taskThinkingLevel).toBe("medium");
    }, 20_000);
    (0, bun_test_1.test)("applies subagentAiDefaults model + thinking overrides on task create", async () => {
        const config = await createTestConfig(rootDir);
        stubStableIds(config, ["aaaaaaaaaa"], "bbbbbbbbbb");
        const projectPath = await createTestProject(rootDir, "repo", { initGit: false });
        const parentId = "1111111111";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            {
                                path: projectPath,
                                id: parentId,
                                name: "parent",
                                createdAt: new Date().toISOString(),
                                runtimeConfig: { type: "local" },
                                aiSettings: { model: "openai:gpt-5.2", thinkingLevel: "high" },
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 3, maxTaskNestingDepth: 3 },
            subagentAiDefaults: {
                explore: { modelString: "anthropic:claude-haiku-4-5", thinkingLevel: "off" },
            },
        });
        const { workspaceService, sendMessage } = createWorkspaceServiceMocks();
        const { taskService } = createTaskServiceHarness(config, { workspaceService });
        const created = await taskService.create({
            parentWorkspaceId: parentId,
            kind: "agent",
            agentType: "explore",
            prompt: "run task with overrides",
            title: "Test task",
        });
        (0, bun_test_1.expect)(created.success).toBe(true);
        if (!created.success)
            return;
        (0, bun_test_1.expect)(sendMessage).toHaveBeenCalledWith(created.data.taskId, "run task with overrides", {
            model: "anthropic:claude-haiku-4-5",
            agentId: "explore",
            thinkingLevel: "off",
            experiments: undefined,
        });
        const postCfg = config.loadConfigOrDefault();
        const childEntry = Array.from(postCfg.projects.values())
            .flatMap((p) => p.workspaces)
            .find((w) => w.id === created.data.taskId);
        (0, bun_test_1.expect)(childEntry).toBeTruthy();
        (0, bun_test_1.expect)(childEntry?.aiSettings).toEqual({
            model: "anthropic:claude-haiku-4-5",
            thinkingLevel: "off",
        });
        (0, bun_test_1.expect)(childEntry?.taskModelString).toBe("anthropic:claude-haiku-4-5");
        (0, bun_test_1.expect)(childEntry?.taskThinkingLevel).toBe("off");
    }, 20_000);
    (0, bun_test_1.test)("agentAiDefaults outrank workspace aiSettingsByAgent for same agent", async () => {
        const config = await createTestConfig(rootDir);
        stubStableIds(config, ["aaaaaaaaaa"], "bbbbbbbbbb");
        const projectPath = await createTestProject(rootDir, "repo", { initGit: false });
        const parentId = "1111111111";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            {
                                path: projectPath,
                                id: parentId,
                                name: "parent",
                                createdAt: new Date().toISOString(),
                                runtimeConfig: { type: "local" },
                                aiSettings: { model: "openai:gpt-5.2", thinkingLevel: "high" },
                                aiSettingsByAgent: {
                                    explore: { model: "openai:gpt-5.2-pro", thinkingLevel: "medium" },
                                },
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 3, maxTaskNestingDepth: 3 },
            agentAiDefaults: {
                explore: { modelString: "anthropic:claude-haiku-4-5", thinkingLevel: "off" },
            },
        });
        const { workspaceService, sendMessage } = createWorkspaceServiceMocks();
        const { taskService } = createTaskServiceHarness(config, { workspaceService });
        const created = await taskService.create({
            parentWorkspaceId: parentId,
            kind: "agent",
            agentType: "explore",
            prompt: "run task with same-agent conflicts",
            title: "Test task",
        });
        (0, bun_test_1.expect)(created.success).toBe(true);
        if (!created.success)
            return;
        (0, bun_test_1.expect)(sendMessage).toHaveBeenCalledWith(created.data.taskId, "run task with same-agent conflicts", {
            model: "anthropic:claude-haiku-4-5",
            agentId: "explore",
            thinkingLevel: "off",
            experiments: undefined,
        });
        const postCfg = config.loadConfigOrDefault();
        const childEntry = Array.from(postCfg.projects.values())
            .flatMap((p) => p.workspaces)
            .find((w) => w.id === created.data.taskId);
        (0, bun_test_1.expect)(childEntry).toBeTruthy();
        (0, bun_test_1.expect)(childEntry?.aiSettings).toEqual({
            model: "anthropic:claude-haiku-4-5",
            thinkingLevel: "off",
        });
        (0, bun_test_1.expect)(childEntry?.taskModelString).toBe("anthropic:claude-haiku-4-5");
        (0, bun_test_1.expect)(childEntry?.taskThinkingLevel).toBe("off");
    }, 20_000);
    (0, bun_test_1.test)("inherits agentAiDefaults from base chain on task create", async () => {
        const config = await createTestConfig(rootDir);
        stubStableIds(config, ["aaaaaaaaaa"], "bbbbbbbbbb");
        const projectPath = await createTestProject(rootDir, "repo", { initGit: false });
        // Custom agent definition stored in the project workspace (.mux/agents).
        const agentsDir = path.join(projectPath, ".mux", "agents");
        await fsPromises.mkdir(agentsDir, { recursive: true });
        await fsPromises.writeFile(path.join(agentsDir, "custom.md"), `---\nname: Custom\ndescription: Exec-derived custom agent for tests\nbase: exec\nsubagent:\n  runnable: true\n---\n\nTest agent body.\n`, "utf-8");
        const parentId = "1111111111";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            {
                                path: projectPath,
                                id: parentId,
                                name: "parent",
                                createdAt: new Date().toISOString(),
                                runtimeConfig: { type: "local" },
                                aiSettings: { model: "openai:gpt-5.2", thinkingLevel: "high" },
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 3, maxTaskNestingDepth: 3 },
            agentAiDefaults: {
                exec: { modelString: "anthropic:claude-haiku-4-5", thinkingLevel: "off" },
            },
        });
        const { workspaceService, sendMessage } = createWorkspaceServiceMocks();
        const { taskService } = createTaskServiceHarness(config, { workspaceService });
        const created = await taskService.create({
            parentWorkspaceId: parentId,
            kind: "agent",
            agentType: "custom",
            prompt: "run task with custom agent",
            title: "Test task",
        });
        (0, bun_test_1.expect)(created.success).toBe(true);
        if (!created.success)
            return;
        (0, bun_test_1.expect)(sendMessage).toHaveBeenCalledWith(created.data.taskId, "run task with custom agent", {
            model: "anthropic:claude-haiku-4-5",
            agentId: "custom",
            thinkingLevel: "off",
            experiments: undefined,
        });
        const postCfg = config.loadConfigOrDefault();
        const childEntry = Array.from(postCfg.projects.values())
            .flatMap((p) => p.workspaces)
            .find((w) => w.id === created.data.taskId);
        (0, bun_test_1.expect)(childEntry).toBeTruthy();
        (0, bun_test_1.expect)(childEntry?.aiSettings).toEqual({
            model: "anthropic:claude-haiku-4-5",
            thinkingLevel: "off",
        });
        (0, bun_test_1.expect)(childEntry?.taskModelString).toBe("anthropic:claude-haiku-4-5");
        (0, bun_test_1.expect)(childEntry?.taskThinkingLevel).toBe("off");
    }, 20_000);
    (0, bun_test_1.test)("does not apply agentAiDefaults base fallback when workspace overrides exist", async () => {
        const config = await createTestConfig(rootDir);
        stubStableIds(config, ["aaaaaaaaaa"], "bbbbbbbbbb");
        const projectPath = await createTestProject(rootDir, "repo", { initGit: false });
        // Custom agent definition stored in the project workspace (.mux/agents).
        const agentsDir = path.join(projectPath, ".mux", "agents");
        await fsPromises.mkdir(agentsDir, { recursive: true });
        await fsPromises.writeFile(path.join(agentsDir, "custom.md"), `---\nname: Custom\ndescription: Exec-derived custom agent for tests\nbase: exec\nsubagent:\n  runnable: true\n---\n\nTest agent body.\n`, "utf-8");
        const parentId = "1111111111";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            {
                                path: projectPath,
                                id: parentId,
                                name: "parent",
                                createdAt: new Date().toISOString(),
                                runtimeConfig: { type: "local" },
                                aiSettings: { model: "openai:gpt-5.2", thinkingLevel: "high" },
                                aiSettingsByAgent: {
                                    custom: { model: "openai:gpt-5.2-pro", thinkingLevel: "medium" },
                                },
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 3, maxTaskNestingDepth: 3 },
            agentAiDefaults: {
                exec: { modelString: "anthropic:claude-haiku-4-5", thinkingLevel: "off" },
            },
        });
        const { workspaceService, sendMessage } = createWorkspaceServiceMocks();
        const { taskService } = createTaskServiceHarness(config, { workspaceService });
        const created = await taskService.create({
            parentWorkspaceId: parentId,
            kind: "agent",
            agentType: "custom",
            prompt: "run task with custom agent",
            title: "Test task",
        });
        (0, bun_test_1.expect)(created.success).toBe(true);
        if (!created.success)
            return;
        (0, bun_test_1.expect)(sendMessage).toHaveBeenCalledWith(created.data.taskId, "run task with custom agent", {
            model: "openai:gpt-5.2-pro",
            agentId: "custom",
            thinkingLevel: "medium",
            experiments: undefined,
        });
    }, 20_000);
    (0, bun_test_1.test)("auto-resumes a parent workspace until background tasks finish", async () => {
        const config = await createTestConfig(rootDir);
        const projectPath = path.join(rootDir, "repo");
        const rootWorkspaceId = "root-111";
        const childTaskId = "task-222";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            {
                                path: path.join(projectPath, "root"),
                                id: rootWorkspaceId,
                                name: "root",
                                aiSettings: { model: "openai:gpt-5.2", thinkingLevel: "medium" },
                            },
                            {
                                path: path.join(projectPath, "child-task"),
                                id: childTaskId,
                                name: "agent_explore_child",
                                parentWorkspaceId: rootWorkspaceId,
                                agentType: "explore",
                                taskStatus: "running",
                                taskModelString: "openai:gpt-5.2",
                                taskThinkingLevel: "medium",
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 3, maxTaskNestingDepth: 3 },
        });
        const { aiService } = createAIServiceMocks(config);
        const { workspaceService, sendMessage } = createWorkspaceServiceMocks();
        const { taskService } = createTaskServiceHarness(config, { aiService, workspaceService });
        const internal = taskService;
        await internal.handleStreamEnd({
            type: "stream-end",
            workspaceId: rootWorkspaceId,
            messageId: "assistant-root",
            metadata: { model: "openai:gpt-5.2" },
            parts: [],
        });
        (0, bun_test_1.expect)(sendMessage).toHaveBeenCalledTimes(1);
        (0, bun_test_1.expect)(sendMessage).toHaveBeenCalledWith(rootWorkspaceId, bun_test_1.expect.stringContaining(childTaskId), bun_test_1.expect.objectContaining({
            model: "openai:gpt-5.2",
            thinkingLevel: "medium",
        }), 
        // Auto-resume skips counter reset
        bun_test_1.expect.objectContaining({ skipAutoResumeReset: true, synthetic: true }));
    });
    (0, bun_test_1.test)("terminateDescendantAgentTask stops stream, removes workspace, and rejects waiters", async () => {
        const config = await createTestConfig(rootDir);
        const projectPath = path.join(rootDir, "repo");
        const rootWorkspaceId = "root-111";
        const taskId = "task-222";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            { path: path.join(projectPath, "root"), id: rootWorkspaceId, name: "root" },
                            {
                                path: path.join(projectPath, "task"),
                                id: taskId,
                                name: "agent_exec_task",
                                parentWorkspaceId: rootWorkspaceId,
                                agentType: "exec",
                                taskStatus: "running",
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 3, maxTaskNestingDepth: 3 },
        });
        const { aiService, stopStream } = createAIServiceMocks(config);
        const { workspaceService, remove } = createWorkspaceServiceMocks();
        const { taskService } = createTaskServiceHarness(config, { aiService, workspaceService });
        const waiter = taskService.waitForAgentReport(taskId, { timeoutMs: 10_000 });
        const terminateResult = await taskService.terminateDescendantAgentTask(rootWorkspaceId, taskId);
        (0, bun_test_1.expect)(terminateResult.success).toBe(true);
        let caught = null;
        try {
            await waiter;
        }
        catch (error) {
            caught = error;
        }
        (0, bun_test_1.expect)(caught).toBeInstanceOf(Error);
        if (caught instanceof Error) {
            (0, bun_test_1.expect)(caught.message).toMatch(/terminated/i);
        }
        (0, bun_test_1.expect)(stopStream).toHaveBeenCalledWith(taskId, bun_test_1.expect.objectContaining({ abandonPartial: true }));
        (0, bun_test_1.expect)(remove).toHaveBeenCalledWith(taskId, true);
    });
    (0, bun_test_1.test)("terminateDescendantAgentTask terminates descendant tasks leaf-first", async () => {
        const config = await createTestConfig(rootDir);
        const projectPath = path.join(rootDir, "repo");
        const rootWorkspaceId = "root-111";
        const parentTaskId = "task-parent";
        const childTaskId = "task-child";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            { path: path.join(projectPath, "root"), id: rootWorkspaceId, name: "root" },
                            {
                                path: path.join(projectPath, "parent-task"),
                                id: parentTaskId,
                                name: "agent_exec_parent",
                                parentWorkspaceId: rootWorkspaceId,
                                agentType: "exec",
                                taskStatus: "running",
                            },
                            {
                                path: path.join(projectPath, "child-task"),
                                id: childTaskId,
                                name: "agent_explore_child",
                                parentWorkspaceId: parentTaskId,
                                agentType: "explore",
                                taskStatus: "running",
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 3, maxTaskNestingDepth: 3 },
        });
        const { aiService } = createAIServiceMocks(config);
        const { workspaceService, remove } = createWorkspaceServiceMocks();
        const { taskService } = createTaskServiceHarness(config, { aiService, workspaceService });
        const terminateResult = await taskService.terminateDescendantAgentTask(rootWorkspaceId, parentTaskId);
        (0, bun_test_1.expect)(terminateResult.success).toBe(true);
        if (!terminateResult.success)
            return;
        (0, bun_test_1.expect)(terminateResult.data.terminatedTaskIds).toEqual([childTaskId, parentTaskId]);
        (0, bun_test_1.expect)(remove).toHaveBeenNthCalledWith(1, childTaskId, true);
        (0, bun_test_1.expect)(remove).toHaveBeenNthCalledWith(2, parentTaskId, true);
    });
    (0, bun_test_1.test)("initialize resumes awaiting_report tasks after restart", async () => {
        const config = await createTestConfig(rootDir);
        const projectPath = path.join(rootDir, "repo");
        const parentId = "parent-111";
        const childId = "child-222";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            { path: path.join(projectPath, "parent"), id: parentId, name: "parent" },
                            {
                                path: path.join(projectPath, "child"),
                                id: childId,
                                name: "agent_explore_child",
                                parentWorkspaceId: parentId,
                                agentType: "explore",
                                taskStatus: "awaiting_report",
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 1, maxTaskNestingDepth: 3 },
        });
        const { aiService } = createAIServiceMocks(config);
        const { workspaceService, sendMessage } = createWorkspaceServiceMocks();
        const { taskService } = createTaskServiceHarness(config, { aiService, workspaceService });
        await taskService.initialize();
        (0, bun_test_1.expect)(sendMessage).toHaveBeenCalledWith(childId, bun_test_1.expect.stringContaining("awaiting its final agent_report"), bun_test_1.expect.objectContaining({
            toolPolicy: [{ regex_match: "^agent_report$", action: "require" }],
        }), bun_test_1.expect.objectContaining({ synthetic: true }));
    });
    (0, bun_test_1.test)("waitForAgentReport does not time out while task is queued", async () => {
        const config = await createTestConfig(rootDir);
        const projectPath = path.join(rootDir, "repo");
        const parentId = "parent-111";
        const childId = "child-222";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            { path: path.join(projectPath, "parent"), id: parentId, name: "parent" },
                            {
                                path: path.join(projectPath, "child"),
                                id: childId,
                                name: "agent_explore_child",
                                parentWorkspaceId: parentId,
                                agentType: "explore",
                                taskStatus: "queued",
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 1, maxTaskNestingDepth: 3 },
        });
        const { taskService } = createTaskServiceHarness(config);
        // Timeout is short so the test would fail if the timer started while queued.
        const reportPromise = taskService.waitForAgentReport(childId, { timeoutMs: 50 });
        // Wait longer than timeout while task is still queued.
        await new Promise((r) => setTimeout(r, 100));
        const internal = taskService;
        await internal.setTaskStatus(childId, "running");
        internal.resolveWaiters(childId, { reportMarkdown: "ok" });
        const report = await reportPromise;
        (0, bun_test_1.expect)(report.reportMarkdown).toBe("ok");
    });
    (0, bun_test_1.test)("waitForAgentReport returns persisted report after workspace is removed", async () => {
        const config = await createTestConfig(rootDir);
        const projectPath = path.join(rootDir, "repo");
        const parentId = "parent-111";
        const childId = "child-222";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            { path: path.join(projectPath, "parent"), id: parentId, name: "parent" },
                            {
                                path: path.join(projectPath, "child"),
                                id: childId,
                                name: "agent_explore_child",
                                parentWorkspaceId: parentId,
                                agentType: "explore",
                                taskStatus: "running",
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 1, maxTaskNestingDepth: 3 },
        });
        const { taskService } = createTaskServiceHarness(config);
        await (0, subagentReportArtifacts_1.upsertSubagentReportArtifact)({
            workspaceId: parentId,
            workspaceSessionDir: config.getSessionDir(parentId),
            childTaskId: childId,
            parentWorkspaceId: parentId,
            ancestorWorkspaceIds: [parentId],
            reportMarkdown: "ok",
            title: "t",
            nowMs: Date.now(),
        });
        await config.removeWorkspace(childId);
        const report = await taskService.waitForAgentReport(childId, {
            timeoutMs: 10,
            requestingWorkspaceId: parentId,
        });
        (0, bun_test_1.expect)(report.reportMarkdown).toBe("ok");
        (0, bun_test_1.expect)(report.title).toBe("t");
    });
    (0, bun_test_1.test)("isDescendantAgentTask consults persisted ancestry after workspace is removed", async () => {
        const config = await createTestConfig(rootDir);
        const projectPath = path.join(rootDir, "repo");
        const parentId = "parent-111";
        const childId = "child-222";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            { path: path.join(projectPath, "parent"), id: parentId, name: "parent" },
                            {
                                path: path.join(projectPath, "child"),
                                id: childId,
                                name: "agent_explore_child",
                                parentWorkspaceId: parentId,
                                agentType: "explore",
                                taskStatus: "running",
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 1, maxTaskNestingDepth: 3 },
        });
        const { taskService } = createTaskServiceHarness(config);
        await (0, subagentReportArtifacts_1.upsertSubagentReportArtifact)({
            workspaceId: parentId,
            workspaceSessionDir: config.getSessionDir(parentId),
            childTaskId: childId,
            parentWorkspaceId: parentId,
            ancestorWorkspaceIds: [parentId],
            reportMarkdown: "ok",
            title: "t",
            nowMs: Date.now(),
        });
        await config.removeWorkspace(childId);
        (0, bun_test_1.expect)(await taskService.isDescendantAgentTask(parentId, childId)).toBe(true);
        (0, bun_test_1.expect)(await taskService.isDescendantAgentTask("other-parent", childId)).toBe(false);
    });
    (0, bun_test_1.test)("filterDescendantAgentTaskIds consults persisted ancestry after cleanup", async () => {
        const config = await createTestConfig(rootDir);
        const projectPath = path.join(rootDir, "repo");
        const parentId = "parent-111";
        const childId = "child-222";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            { path: path.join(projectPath, "parent"), id: parentId, name: "parent" },
                            {
                                path: path.join(projectPath, "child"),
                                id: childId,
                                name: "agent_explore_child",
                                parentWorkspaceId: parentId,
                                agentType: "explore",
                                taskStatus: "running",
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 1, maxTaskNestingDepth: 3 },
        });
        const { taskService } = createTaskServiceHarness(config);
        await (0, subagentReportArtifacts_1.upsertSubagentReportArtifact)({
            workspaceId: parentId,
            workspaceSessionDir: config.getSessionDir(parentId),
            childTaskId: childId,
            parentWorkspaceId: parentId,
            ancestorWorkspaceIds: [parentId],
            reportMarkdown: "ok",
            title: "t",
            nowMs: Date.now(),
        });
        await config.removeWorkspace(childId);
        (0, bun_test_1.expect)(await taskService.filterDescendantAgentTaskIds(parentId, [childId])).toEqual([childId]);
        (0, bun_test_1.expect)(await taskService.filterDescendantAgentTaskIds("other-parent", [childId])).toEqual([]);
    });
    (0, bun_test_1.test)("waitForAgentReport falls back to persisted report after cache is cleared", async () => {
        const config = await createTestConfig(rootDir);
        const projectPath = path.join(rootDir, "repo");
        const parentId = "parent-111";
        const childId = "child-222";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            { path: path.join(projectPath, "parent"), id: parentId, name: "parent" },
                            {
                                path: path.join(projectPath, "child"),
                                id: childId,
                                name: "agent_explore_child",
                                parentWorkspaceId: parentId,
                                agentType: "explore",
                                taskStatus: "running",
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 1, maxTaskNestingDepth: 3 },
        });
        const { taskService } = createTaskServiceHarness(config);
        await (0, subagentReportArtifacts_1.upsertSubagentReportArtifact)({
            workspaceId: parentId,
            workspaceSessionDir: config.getSessionDir(parentId),
            childTaskId: childId,
            parentWorkspaceId: parentId,
            ancestorWorkspaceIds: [parentId],
            reportMarkdown: "ok",
            title: "t",
            nowMs: Date.now(),
        });
        await config.removeWorkspace(childId);
        // Simulate process restart / eviction.
        taskService.completedReportsByTaskId.clear();
        const report = await taskService.waitForAgentReport(childId, {
            timeoutMs: 10,
            requestingWorkspaceId: parentId,
        });
        (0, bun_test_1.expect)(report.reportMarkdown).toBe("ok");
        (0, bun_test_1.expect)(report.title).toBe("t");
    });
    (0, bun_test_1.test)("does not request agent_report on stream end while task has active descendants", async () => {
        const config = await createTestConfig(rootDir);
        const projectPath = path.join(rootDir, "repo");
        const rootWorkspaceId = "root-111";
        const parentTaskId = "task-222";
        const descendantTaskId = "task-333";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            { path: path.join(projectPath, "root"), id: rootWorkspaceId, name: "root" },
                            {
                                path: path.join(projectPath, "parent-task"),
                                id: parentTaskId,
                                name: "agent_exec_parent",
                                parentWorkspaceId: rootWorkspaceId,
                                agentType: "exec",
                                taskStatus: "running",
                            },
                            {
                                path: path.join(projectPath, "child-task"),
                                id: descendantTaskId,
                                name: "agent_explore_child",
                                parentWorkspaceId: parentTaskId,
                                agentType: "explore",
                                taskStatus: "running",
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 3, maxTaskNestingDepth: 3 },
        });
        const { workspaceService, sendMessage } = createWorkspaceServiceMocks();
        const { taskService } = createTaskServiceHarness(config, { workspaceService });
        const internal = taskService;
        await internal.handleStreamEnd({
            type: "stream-end",
            workspaceId: parentTaskId,
            messageId: "assistant-parent-task",
            metadata: { model: "openai:gpt-4o-mini" },
            parts: [],
        });
        (0, bun_test_1.expect)(sendMessage).not.toHaveBeenCalled();
        const postCfg = config.loadConfigOrDefault();
        const ws = Array.from(postCfg.projects.values())
            .flatMap((p) => p.workspaces)
            .find((w) => w.id === parentTaskId);
        (0, bun_test_1.expect)(ws?.taskStatus).toBe("running");
    });
    (0, bun_test_1.test)("reverts awaiting_report to running on stream end while task has active descendants", async () => {
        const config = await createTestConfig(rootDir);
        const projectPath = path.join(rootDir, "repo");
        const rootWorkspaceId = "root-111";
        const parentTaskId = "task-222";
        const descendantTaskId = "task-333";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            { path: path.join(projectPath, "root"), id: rootWorkspaceId, name: "root" },
                            {
                                path: path.join(projectPath, "parent-task"),
                                id: parentTaskId,
                                name: "agent_exec_parent",
                                parentWorkspaceId: rootWorkspaceId,
                                agentType: "exec",
                                taskStatus: "awaiting_report",
                            },
                            {
                                path: path.join(projectPath, "child-task"),
                                id: descendantTaskId,
                                name: "agent_explore_child",
                                parentWorkspaceId: parentTaskId,
                                agentType: "explore",
                                taskStatus: "running",
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 3, maxTaskNestingDepth: 3 },
        });
        const { workspaceService, sendMessage } = createWorkspaceServiceMocks();
        const { taskService } = createTaskServiceHarness(config, { workspaceService });
        const internal = taskService;
        await internal.handleStreamEnd({
            type: "stream-end",
            workspaceId: parentTaskId,
            messageId: "assistant-parent-task",
            metadata: { model: "openai:gpt-4o-mini" },
            parts: [],
        });
        (0, bun_test_1.expect)(sendMessage).not.toHaveBeenCalled();
        const postCfg = config.loadConfigOrDefault();
        const ws = Array.from(postCfg.projects.values())
            .flatMap((p) => p.workspaces)
            .find((w) => w.id === parentTaskId);
        (0, bun_test_1.expect)(ws?.taskStatus).toBe("running");
    });
    (0, bun_test_1.test)("rolls back created workspace when initial sendMessage fails", async () => {
        const config = await createTestConfig(rootDir);
        stubStableIds(config, ["aaaaaaaaaa"], "aaaaaaaaaa");
        const projectPath = await createTestProject(rootDir);
        const runtimeConfig = { type: "worktree", srcBaseDir: config.srcDir };
        const runtime = (0, runtimeFactory_1.createRuntime)(runtimeConfig, { projectPath });
        const initLogger = createNullInitLogger();
        const parentName = "parent";
        const parentCreate = await runtime.createWorkspace({
            projectPath,
            branchName: parentName,
            trunkBranch: "main",
            directoryName: parentName,
            initLogger,
        });
        (0, bun_test_1.expect)(parentCreate.success).toBe(true);
        const parentId = "1111111111";
        const parentPath = runtime.getWorkspacePath(projectPath, parentName);
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            {
                                path: parentPath,
                                id: parentId,
                                name: parentName,
                                createdAt: new Date().toISOString(),
                                runtimeConfig,
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 3, maxTaskNestingDepth: 3 },
        });
        const { aiService } = createAIServiceMocks(config);
        const failingSendMessage = (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Err)("send failed")));
        const { workspaceService } = createWorkspaceServiceMocks({ sendMessage: failingSendMessage });
        const { taskService } = createTaskServiceHarness(config, { aiService, workspaceService });
        const created = await taskService.create({
            parentWorkspaceId: parentId,
            kind: "agent",
            agentType: "explore",
            prompt: "do the thing",
            title: "Test task",
        });
        (0, bun_test_1.expect)(created.success).toBe(false);
        const postCfg = config.loadConfigOrDefault();
        const stillExists = Array.from(postCfg.projects.values())
            .flatMap((p) => p.workspaces)
            .some((w) => w.id === "aaaaaaaaaa");
        (0, bun_test_1.expect)(stillExists).toBe(false);
        const workspaceName = "agent_explore_aaaaaaaaaa";
        const workspacePath = runtime.getWorkspacePath(projectPath, workspaceName);
        let workspacePathExists = true;
        try {
            await fsPromises.access(workspacePath);
        }
        catch {
            workspacePathExists = false;
        }
        (0, bun_test_1.expect)(workspacePathExists).toBe(false);
    }, 20_000);
    (0, bun_test_1.test)("agent_report posts report to parent, finalizes pending task tool output, and triggers cleanup", async () => {
        const config = await createTestConfig(rootDir);
        const projectPath = path.join(rootDir, "repo");
        const parentId = "parent-111";
        const childId = "child-222";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            { path: path.join(projectPath, "parent"), id: parentId, name: "parent" },
                            {
                                path: path.join(projectPath, "child"),
                                id: childId,
                                name: "agent_explore_child",
                                parentWorkspaceId: parentId,
                                agentType: "explore",
                                taskStatus: "running",
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 3, maxTaskNestingDepth: 3 },
        });
        const { aiService, stopStream } = createAIServiceMocks(config);
        const { workspaceService, sendMessage, remove, emit } = createWorkspaceServiceMocks();
        const { historyService, partialService, taskService } = createTaskServiceHarness(config, {
            aiService,
            workspaceService,
        });
        const parentPartial = (0, message_1.createMuxMessage)("assistant-parent-partial", "assistant", "Waiting on subagent…", { timestamp: Date.now() }, [
            {
                type: "dynamic-tool",
                toolCallId: "task-call-1",
                toolName: "task",
                input: { subagent_type: "explore", prompt: "do the thing", title: "Test task" },
                state: "input-available",
            },
        ]);
        const writeParentPartial = await partialService.writePartial(parentId, parentPartial);
        (0, bun_test_1.expect)(writeParentPartial.success).toBe(true);
        // Seed child history with the initial prompt + assistant placeholder so committing the final
        // partial updates the existing assistant message (matching real streaming behavior).
        const childPrompt = (0, message_1.createMuxMessage)("user-child-prompt", "user", "do the thing", {
            timestamp: Date.now(),
        });
        const appendChildPrompt = await historyService.appendToHistory(childId, childPrompt);
        (0, bun_test_1.expect)(appendChildPrompt.success).toBe(true);
        const childAssistantPlaceholder = (0, message_1.createMuxMessage)("assistant-child-partial", "assistant", "", {
            timestamp: Date.now(),
        });
        const appendChildPlaceholder = await historyService.appendToHistory(childId, childAssistantPlaceholder);
        (0, bun_test_1.expect)(appendChildPlaceholder.success).toBe(true);
        const childHistorySequence = childAssistantPlaceholder.metadata?.historySequence;
        if (typeof childHistorySequence !== "number") {
            throw new Error("Expected child historySequence to be a number");
        }
        const childPartial = (0, message_1.createMuxMessage)("assistant-child-partial", "assistant", "", { timestamp: Date.now(), historySequence: childHistorySequence }, [
            {
                type: "dynamic-tool",
                toolCallId: "agent-report-call-1",
                toolName: "agent_report",
                input: { reportMarkdown: "Hello from child", title: "Result" },
                state: "output-available",
                output: { success: true },
            },
        ]);
        const writeChildPartial = await partialService.writePartial(childId, childPartial);
        (0, bun_test_1.expect)(writeChildPartial.success).toBe(true);
        const internal = taskService;
        await internal.handleAgentReport({
            type: "tool-call-end",
            workspaceId: childId,
            messageId: "assistant-child-partial",
            toolCallId: "agent-report-call-1",
            toolName: "agent_report",
            result: { success: true },
            timestamp: Date.now(),
        });
        (0, bun_test_1.expect)(stopStream).toHaveBeenCalledWith(childId, bun_test_1.expect.objectContaining({ abandonPartial: false }));
        const childMessages = await collectFullHistory(historyService, childId);
        // Ensure the in-flight assistant message (tool calls + agent_report) was committed to history
        // before workspace cleanup archives the transcript.
        (0, bun_test_1.expect)(childMessages.length).toBeGreaterThan(1);
        const assistantMsg = childMessages.find((m) => m.id === "assistant-child-partial") ?? null;
        (0, bun_test_1.expect)(assistantMsg).not.toBeNull();
        if (assistantMsg) {
            const toolPart = assistantMsg.parts.find((p) => p &&
                typeof p === "object" &&
                "type" in p &&
                p.type === "dynamic-tool" &&
                "toolName" in p &&
                p.toolName === "agent_report");
            (0, bun_test_1.expect)(toolPart?.toolName).toBe("agent_report");
            (0, bun_test_1.expect)(toolPart?.state).toBe("output-available");
            (0, bun_test_1.expect)(JSON.stringify(toolPart?.input)).toContain("Hello from child");
        }
        const updatedChildPartial = await partialService.readPartial(childId);
        (0, bun_test_1.expect)(updatedChildPartial).toBeNull();
        await collectFullHistory(historyService, parentId);
        const updatedParentPartial = await partialService.readPartial(parentId);
        (0, bun_test_1.expect)(updatedParentPartial).not.toBeNull();
        if (updatedParentPartial) {
            const toolPart = updatedParentPartial.parts.find((p) => p &&
                typeof p === "object" &&
                "type" in p &&
                p.type === "dynamic-tool");
            (0, bun_test_1.expect)(toolPart?.toolName).toBe("task");
            (0, bun_test_1.expect)(toolPart?.state).toBe("output-available");
            (0, bun_test_1.expect)(toolPart?.output && typeof toolPart.output === "object").toBe(true);
            (0, bun_test_1.expect)(JSON.stringify(toolPart?.output)).toContain("Hello from child");
        }
        const postCfg = config.loadConfigOrDefault();
        const ws = Array.from(postCfg.projects.values())
            .flatMap((p) => p.workspaces)
            .find((w) => w.id === childId);
        (0, bun_test_1.expect)(ws?.taskStatus).toBe("reported");
        (0, bun_test_1.expect)(ws?.reportedAt).toBeTruthy();
        (0, bun_test_1.expect)(emit).toHaveBeenCalledWith("metadata", bun_test_1.expect.objectContaining({ workspaceId: childId }));
        (0, bun_test_1.expect)(remove).toHaveBeenCalled();
        (0, bun_test_1.expect)(sendMessage).toHaveBeenCalledWith(parentId, bun_test_1.expect.stringContaining("sub-agent task(s) have completed"), bun_test_1.expect.any(Object), bun_test_1.expect.objectContaining({ skipAutoResumeReset: true, synthetic: true }));
        (0, bun_test_1.expect)(emit).toHaveBeenCalled();
    });
    (0, bun_test_1.test)("agent_report generates git format-patch artifact for exec tasks and defers cleanup", async () => {
        const config = await createTestConfig(rootDir);
        const projectPath = path.join(rootDir, "repo");
        const parentId = "parent-111";
        const childId = "child-222";
        const parentPath = path.join(projectPath, "parent");
        const childPath = path.join(projectPath, "child");
        await fsPromises.mkdir(parentPath, { recursive: true });
        await fsPromises.mkdir(childPath, { recursive: true });
        initGitRepo(childPath);
        const baseCommitSha = (0, node_child_process_1.execSync)("git rev-parse HEAD", {
            cwd: childPath,
            encoding: "utf-8",
        }).trim();
        (0, node_child_process_1.execSync)("bash -lc 'echo \"world\" >> README.md'", { cwd: childPath, stdio: "ignore" });
        (0, node_child_process_1.execSync)("git add README.md", { cwd: childPath, stdio: "ignore" });
        (0, node_child_process_1.execSync)('git commit -m "child change"', { cwd: childPath, stdio: "ignore" });
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            {
                                path: parentPath,
                                id: parentId,
                                name: "parent",
                                runtimeConfig: { type: "local" },
                            },
                            {
                                path: childPath,
                                id: childId,
                                name: "agent_exec_child",
                                parentWorkspaceId: parentId,
                                agentType: "exec",
                                agentId: "exec",
                                taskStatus: "running",
                                runtimeConfig: { type: "local" },
                                taskBaseCommitSha: baseCommitSha,
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 3, maxTaskNestingDepth: 3 },
        });
        const { aiService } = createAIServiceMocks(config);
        const { workspaceService, remove } = createWorkspaceServiceMocks();
        const { partialService, taskService } = createTaskServiceHarness(config, {
            aiService,
            workspaceService,
        });
        const parentPartial = (0, message_1.createMuxMessage)("assistant-parent-partial", "assistant", "Waiting on subagent…", { timestamp: Date.now() }, [
            {
                type: "dynamic-tool",
                toolCallId: "task-call-1",
                toolName: "task",
                input: { subagent_type: "exec", prompt: "do the thing", title: "Test task" },
                state: "input-available",
            },
        ]);
        const writeParentPartial = await partialService.writePartial(parentId, parentPartial);
        (0, bun_test_1.expect)(writeParentPartial.success).toBe(true);
        const childPartial = (0, message_1.createMuxMessage)("assistant-child-partial", "assistant", "", { timestamp: Date.now(), historySequence: 0 }, [
            {
                type: "dynamic-tool",
                toolCallId: "agent-report-call-1",
                toolName: "agent_report",
                input: { reportMarkdown: "Hello from child", title: "Result" },
                state: "output-available",
                output: { success: true },
            },
        ]);
        const writeChildPartial = await partialService.writePartial(childId, childPartial);
        (0, bun_test_1.expect)(writeChildPartial.success).toBe(true);
        const internal = taskService;
        const parentSessionDir = config.getSessionDir(parentId);
        const patchPath = (0, subagentGitPatchArtifacts_1.getSubagentGitPatchMboxPath)(parentSessionDir, childId);
        const waiter = taskService.waitForAgentReport(childId, {
            timeoutMs: 10_000,
            requestingWorkspaceId: parentId,
        });
        const handleReportPromise = internal.handleAgentReport({
            type: "tool-call-end",
            workspaceId: childId,
            messageId: "assistant-child-partial",
            toolCallId: "agent-report-call-1",
            toolName: "agent_report",
            result: { success: true },
            timestamp: Date.now(),
        });
        const report = await waiter;
        (0, bun_test_1.expect)(report).toEqual({ reportMarkdown: "Hello from child", title: "Result" });
        const artifactAfterWait = await (0, subagentGitPatchArtifacts_1.readSubagentGitPatchArtifact)(parentSessionDir, childId);
        (0, bun_test_1.expect)(artifactAfterWait).not.toBeNull();
        (0, bun_test_1.expect)(["pending", "ready"]).toContain(artifactAfterWait.status);
        await handleReportPromise;
        // Cleanup should be deferred until git-format-patch generation completes.
        (0, bun_test_1.expect)(remove).not.toHaveBeenCalled();
        const start = Date.now();
        let lastArtifact = null;
        while (true) {
            const artifact = await (0, subagentGitPatchArtifacts_1.readSubagentGitPatchArtifact)(parentSessionDir, childId);
            lastArtifact = artifact;
            if (artifact?.status === "ready") {
                try {
                    await fsPromises.stat(patchPath);
                    if (remove.mock.calls.length > 0) {
                        break;
                    }
                }
                catch {
                    // Keep polling until the patch file exists.
                }
            }
            else if (artifact?.status === "failed" || artifact?.status === "skipped") {
                throw new Error(`Patch artifact generation failed with status=${artifact.status}: ${artifact.error ?? "unknown error"}`);
            }
            if (Date.now() - start > 10_000) {
                throw new Error(`Timed out waiting for patch artifact generation (removeCalled=${remove.mock.calls.length > 0}, lastArtifact=${JSON.stringify(lastArtifact)})`);
            }
            await new Promise((r) => setTimeout(r, 50));
        }
        const artifact = await (0, subagentGitPatchArtifacts_1.readSubagentGitPatchArtifact)(parentSessionDir, childId);
        (0, bun_test_1.expect)(artifact?.status).toBe("ready");
        await fsPromises.stat(patchPath);
        (0, bun_test_1.expect)(remove).toHaveBeenCalled();
    }, 20_000);
    (0, bun_test_1.test)("agent_report generates git format-patch artifact for exec-derived custom tasks", async () => {
        const config = await createTestConfig(rootDir);
        const projectPath = path.join(rootDir, "repo");
        const parentId = "parent-111";
        const childId = "child-222";
        const parentPath = path.join(projectPath, "parent");
        const childPath = path.join(projectPath, "child");
        await fsPromises.mkdir(parentPath, { recursive: true });
        await fsPromises.mkdir(childPath, { recursive: true });
        // Custom agent definition stored in the parent workspace (.mux/agents).
        const agentsDir = path.join(parentPath, ".mux", "agents");
        await fsPromises.mkdir(agentsDir, { recursive: true });
        await fsPromises.writeFile(path.join(agentsDir, "test-file.md"), `---\nname: Test File\ndescription: Exec-derived custom agent for tests\nbase: exec\nsubagent:\n  runnable: true\n---\n\nTest agent body.\n`, "utf-8");
        initGitRepo(childPath);
        const baseCommitSha = (0, node_child_process_1.execSync)("git rev-parse HEAD", {
            cwd: childPath,
            encoding: "utf-8",
        }).trim();
        (0, node_child_process_1.execSync)("bash -lc 'echo \\\"world\\\" >> README.md'", { cwd: childPath, stdio: "ignore" });
        (0, node_child_process_1.execSync)("git add README.md", { cwd: childPath, stdio: "ignore" });
        (0, node_child_process_1.execSync)('git commit -m "child change"', { cwd: childPath, stdio: "ignore" });
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            {
                                path: parentPath,
                                id: parentId,
                                name: "parent",
                                runtimeConfig: { type: "local" },
                            },
                            {
                                path: childPath,
                                id: childId,
                                name: "agent_test_file_child",
                                parentWorkspaceId: parentId,
                                agentType: "test-file",
                                agentId: "test-file",
                                taskStatus: "running",
                                runtimeConfig: { type: "local" },
                                taskBaseCommitSha: baseCommitSha,
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 3, maxTaskNestingDepth: 3 },
        });
        const { aiService } = createAIServiceMocks(config);
        const { workspaceService, remove } = createWorkspaceServiceMocks();
        const { partialService, taskService } = createTaskServiceHarness(config, {
            aiService,
            workspaceService,
        });
        const parentPartial = (0, message_1.createMuxMessage)("assistant-parent-partial", "assistant", "Waiting on subagent…", { timestamp: Date.now() }, [
            {
                type: "dynamic-tool",
                toolCallId: "task-call-1",
                toolName: "task",
                input: { subagent_type: "test-file", prompt: "do the thing", title: "Test task" },
                state: "input-available",
            },
        ]);
        const writeParentPartial = await partialService.writePartial(parentId, parentPartial);
        (0, bun_test_1.expect)(writeParentPartial.success).toBe(true);
        const childPartial = (0, message_1.createMuxMessage)("assistant-child-partial", "assistant", "", { timestamp: Date.now(), historySequence: 0 }, [
            {
                type: "dynamic-tool",
                toolCallId: "agent-report-call-1",
                toolName: "agent_report",
                input: { reportMarkdown: "Hello from child", title: "Result" },
                state: "output-available",
                output: { success: true },
            },
        ]);
        const writeChildPartial = await partialService.writePartial(childId, childPartial);
        (0, bun_test_1.expect)(writeChildPartial.success).toBe(true);
        const internal = taskService;
        const parentSessionDir = config.getSessionDir(parentId);
        const patchPath = (0, subagentGitPatchArtifacts_1.getSubagentGitPatchMboxPath)(parentSessionDir, childId);
        const waiter = taskService.waitForAgentReport(childId, {
            timeoutMs: 10_000,
            requestingWorkspaceId: parentId,
        });
        const handleReportPromise = internal.handleAgentReport({
            type: "tool-call-end",
            workspaceId: childId,
            messageId: "assistant-child-partial",
            toolCallId: "agent-report-call-1",
            toolName: "agent_report",
            result: { success: true },
            timestamp: Date.now(),
        });
        const report = await waiter;
        (0, bun_test_1.expect)(report).toEqual({ reportMarkdown: "Hello from child", title: "Result" });
        const artifactAfterWait = await (0, subagentGitPatchArtifacts_1.readSubagentGitPatchArtifact)(parentSessionDir, childId);
        (0, bun_test_1.expect)(artifactAfterWait).not.toBeNull();
        (0, bun_test_1.expect)(["pending", "ready"]).toContain(artifactAfterWait.status);
        await handleReportPromise;
        // Cleanup should be deferred until git-format-patch generation completes.
        (0, bun_test_1.expect)(remove).not.toHaveBeenCalled();
        const start = Date.now();
        let lastArtifact = null;
        while (true) {
            const artifact = await (0, subagentGitPatchArtifacts_1.readSubagentGitPatchArtifact)(parentSessionDir, childId);
            lastArtifact = artifact;
            if (artifact?.status === "ready") {
                try {
                    await fsPromises.stat(patchPath);
                    if (remove.mock.calls.length > 0) {
                        break;
                    }
                }
                catch {
                    // Keep polling until the patch file exists.
                }
            }
            else if (artifact?.status === "failed" || artifact?.status === "skipped") {
                throw new Error(`Patch artifact generation failed with status=${artifact.status}: ${artifact.error ?? "unknown error"}`);
            }
            if (Date.now() - start > 10_000) {
                throw new Error(`Timed out waiting for patch artifact generation (removeCalled=${remove.mock.calls.length > 0}, lastArtifact=${JSON.stringify(lastArtifact)})`);
            }
            await new Promise((r) => setTimeout(r, 50));
        }
        const artifact = await (0, subagentGitPatchArtifacts_1.readSubagentGitPatchArtifact)(parentSessionDir, childId);
        (0, bun_test_1.expect)(artifact?.status).toBe("ready");
        await fsPromises.stat(patchPath);
        (0, bun_test_1.expect)(remove).toHaveBeenCalled();
    }, 20_000);
    (0, bun_test_1.test)("agent_report updates queued/running task tool output in parent history", async () => {
        const config = await createTestConfig(rootDir);
        const projectPath = path.join(rootDir, "repo");
        const parentId = "parent-111";
        const childId = "child-222";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            { path: path.join(projectPath, "parent"), id: parentId, name: "parent" },
                            {
                                path: path.join(projectPath, "child"),
                                id: childId,
                                name: "agent_explore_child",
                                parentWorkspaceId: parentId,
                                agentType: "explore",
                                taskStatus: "running",
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 3, maxTaskNestingDepth: 3 },
        });
        const { aiService } = createAIServiceMocks(config);
        const { workspaceService, sendMessage: sendMessageMock, remove, } = createWorkspaceServiceMocks();
        const { historyService, partialService, taskService } = createTaskServiceHarness(config, {
            aiService,
            workspaceService,
        });
        const parentHistoryMessage = (0, message_1.createMuxMessage)("assistant-parent-history", "assistant", "Spawned subagent…", { timestamp: Date.now() }, [
            {
                type: "dynamic-tool",
                toolCallId: "task-call-1",
                toolName: "task",
                input: { subagent_type: "explore", prompt: "do the thing", run_in_background: true },
                state: "output-available",
                output: { status: "running", taskId: childId },
            },
        ]);
        const appendParentHistory = await historyService.appendToHistory(parentId, parentHistoryMessage);
        (0, bun_test_1.expect)(appendParentHistory.success).toBe(true);
        const childPartial = (0, message_1.createMuxMessage)("assistant-child-partial", "assistant", "", { timestamp: Date.now(), historySequence: 0 }, [
            {
                type: "dynamic-tool",
                toolCallId: "agent-report-call-1",
                toolName: "agent_report",
                input: { reportMarkdown: "Hello from child", title: "Result" },
                state: "output-available",
                output: { success: true },
            },
        ]);
        const writeChildPartial = await partialService.writePartial(childId, childPartial);
        (0, bun_test_1.expect)(writeChildPartial.success).toBe(true);
        const internal = taskService;
        await internal.handleAgentReport({
            type: "tool-call-end",
            workspaceId: childId,
            messageId: "assistant-child-partial",
            toolCallId: "agent-report-call-1",
            toolName: "agent_report",
            result: { success: true },
            timestamp: Date.now(),
        });
        const parentMessages = await collectFullHistory(historyService, parentId);
        // Original task tool call remains immutable ("running"), and a synthetic report message is appended.
        (0, bun_test_1.expect)(parentMessages.length).toBeGreaterThanOrEqual(2);
        const taskCallMessage = parentMessages.find((m) => m.id === "assistant-parent-history") ?? null;
        (0, bun_test_1.expect)(taskCallMessage).not.toBeNull();
        if (taskCallMessage) {
            const toolPart = taskCallMessage.parts.find((p) => p &&
                typeof p === "object" &&
                "type" in p &&
                p.type === "dynamic-tool");
            (0, bun_test_1.expect)(JSON.stringify(toolPart?.output)).toContain('"status":"running"');
            (0, bun_test_1.expect)(JSON.stringify(toolPart?.output)).toContain(childId);
        }
        const syntheticReport = parentMessages.find((m) => m.metadata?.synthetic) ?? null;
        (0, bun_test_1.expect)(syntheticReport).not.toBeNull();
        if (syntheticReport) {
            (0, bun_test_1.expect)(syntheticReport.role).toBe("user");
            const text = syntheticReport.parts
                .filter((p) => p.type === "text")
                .map((p) => p.text)
                .join("");
            (0, bun_test_1.expect)(text).toContain("Hello from child");
            (0, bun_test_1.expect)(text).toContain(childId);
        }
        (0, bun_test_1.expect)(remove).toHaveBeenCalled();
        (0, bun_test_1.expect)(sendMessageMock).toHaveBeenCalledWith(parentId, bun_test_1.expect.stringContaining("sub-agent task(s) have completed"), bun_test_1.expect.any(Object), bun_test_1.expect.objectContaining({ skipAutoResumeReset: true, synthetic: true }));
    });
    (0, bun_test_1.test)("uses agent_report from stream-end parts instead of fallback", async () => {
        const config = await createTestConfig(rootDir);
        const projectPath = path.join(rootDir, "repo");
        const parentId = "parent-111";
        const childId = "child-222";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            { path: path.join(projectPath, "parent"), id: parentId, name: "parent" },
                            {
                                path: path.join(projectPath, "child"),
                                id: childId,
                                name: "agent_explore_child",
                                parentWorkspaceId: parentId,
                                agentType: "explore",
                                taskStatus: "awaiting_report",
                                taskModelString: "openai:gpt-4o-mini",
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 3, maxTaskNestingDepth: 3 },
        });
        const { aiService } = createAIServiceMocks(config);
        const { workspaceService, sendMessage, remove } = createWorkspaceServiceMocks();
        const { partialService, taskService } = createTaskServiceHarness(config, {
            aiService,
            workspaceService,
        });
        // Simulate the "second attempt" state (the task was already reminded).
        taskService.remindedAwaitingReport.add(childId);
        const parentPartial = (0, message_1.createMuxMessage)("assistant-parent-partial", "assistant", "Waiting on subagent…", { timestamp: Date.now() }, [
            {
                type: "dynamic-tool",
                toolCallId: "task-call-1",
                toolName: "task",
                input: { subagent_type: "explore", prompt: "do the thing", title: "Test task" },
                state: "input-available",
            },
        ]);
        const writeParentPartial = await partialService.writePartial(parentId, parentPartial);
        (0, bun_test_1.expect)(writeParentPartial.success).toBe(true);
        const internal = taskService;
        await internal.handleStreamEnd({
            type: "stream-end",
            workspaceId: childId,
            messageId: "assistant-child-output",
            metadata: { model: "openai:gpt-4o-mini" },
            parts: [
                {
                    type: "dynamic-tool",
                    toolCallId: "agent-report-call-1",
                    toolName: "agent_report",
                    input: { reportMarkdown: "Hello from child", title: "Result" },
                    state: "output-available",
                    output: { success: true },
                },
            ],
        });
        // No "agent_report reminder" sendMessage should fire (the report was in stream-end parts).
        // The only sendMessage call should be the parent auto-resume after the child reports.
        const sendCalls = sendMessage.mock.calls;
        for (const call of sendCalls) {
            const msg = call[1];
            (0, bun_test_1.expect)(msg).not.toContain("agent_report");
        }
        const updatedParentPartial = await partialService.readPartial(parentId);
        (0, bun_test_1.expect)(updatedParentPartial).not.toBeNull();
        if (updatedParentPartial) {
            const toolPart = updatedParentPartial.parts.find((p) => p &&
                typeof p === "object" &&
                "type" in p &&
                p.type === "dynamic-tool");
            (0, bun_test_1.expect)(toolPart?.toolName).toBe("task");
            (0, bun_test_1.expect)(toolPart?.state).toBe("output-available");
            const outputJson = JSON.stringify(toolPart?.output);
            (0, bun_test_1.expect)(outputJson).toContain("Hello from child");
            (0, bun_test_1.expect)(outputJson).toContain("Result");
            (0, bun_test_1.expect)(outputJson).not.toContain("fallback");
        }
        const postCfg = config.loadConfigOrDefault();
        const ws = Array.from(postCfg.projects.values())
            .flatMap((p) => p.workspaces)
            .find((w) => w.id === childId);
        (0, bun_test_1.expect)(ws?.taskStatus).toBe("reported");
        (0, bun_test_1.expect)(remove).toHaveBeenCalled();
        // sendMessage is called once for the "ended without agent_report" reminder
        // and NOT for resumeStream (since "second attempt" was already simulated).
        // The parent auto-resume sendMessage also fires since no active descendants remain.
        (0, bun_test_1.expect)(sendMessage).toHaveBeenCalled();
    });
    (0, bun_test_1.test)("missing agent_report triggers one reminder, then posts fallback output and cleans up", async () => {
        const config = await createTestConfig(rootDir);
        const projectPath = path.join(rootDir, "repo");
        const parentId = "parent-111";
        const childId = "child-222";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            { path: path.join(projectPath, "parent"), id: parentId, name: "parent" },
                            {
                                path: path.join(projectPath, "child"),
                                id: childId,
                                name: "agent_explore_child",
                                parentWorkspaceId: parentId,
                                agentType: "explore",
                                taskStatus: "running",
                                taskModelString: "openai:gpt-4o-mini",
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 3, maxTaskNestingDepth: 3 },
        });
        const { aiService } = createAIServiceMocks(config);
        const { workspaceService, sendMessage, remove, emit } = createWorkspaceServiceMocks();
        const { historyService, partialService, taskService } = createTaskServiceHarness(config, {
            aiService,
            workspaceService,
        });
        const parentPartial = (0, message_1.createMuxMessage)("assistant-parent-partial", "assistant", "Waiting on subagent…", { timestamp: Date.now() }, [
            {
                type: "dynamic-tool",
                toolCallId: "task-call-1",
                toolName: "task",
                input: { subagent_type: "explore", prompt: "do the thing", title: "Test task" },
                state: "input-available",
            },
        ]);
        const writeParentPartial = await partialService.writePartial(parentId, parentPartial);
        (0, bun_test_1.expect)(writeParentPartial.success).toBe(true);
        const assistantOutput = (0, message_1.createMuxMessage)("assistant-child-output", "assistant", "Final output without agent_report", { timestamp: Date.now() });
        const appendChildHistory = await historyService.appendToHistory(childId, assistantOutput);
        (0, bun_test_1.expect)(appendChildHistory.success).toBe(true);
        const internal = taskService;
        await internal.handleStreamEnd({
            type: "stream-end",
            workspaceId: childId,
            messageId: "assistant-child-output",
            metadata: { model: "openai:gpt-4o-mini" },
            parts: [],
        });
        (0, bun_test_1.expect)(sendMessage).toHaveBeenCalled();
        const midCfg = config.loadConfigOrDefault();
        const midWs = Array.from(midCfg.projects.values())
            .flatMap((p) => p.workspaces)
            .find((w) => w.id === childId);
        (0, bun_test_1.expect)(midWs?.taskStatus).toBe("awaiting_report");
        await internal.handleStreamEnd({
            type: "stream-end",
            workspaceId: childId,
            messageId: "assistant-child-output",
            metadata: { model: "openai:gpt-4o-mini" },
            parts: [],
        });
        const emitCalls = emit.mock.calls;
        const metadataEmitsForChild = emitCalls.filter((call) => {
            const [eventName, payload] = call;
            if (eventName !== "metadata")
                return false;
            if (!payload || typeof payload !== "object")
                return false;
            const maybePayload = payload;
            return maybePayload.workspaceId === childId;
        });
        (0, bun_test_1.expect)(metadataEmitsForChild).toHaveLength(2);
        await collectFullHistory(historyService, parentId);
        const updatedParentPartial = await partialService.readPartial(parentId);
        (0, bun_test_1.expect)(updatedParentPartial).not.toBeNull();
        if (updatedParentPartial) {
            const toolPart = updatedParentPartial.parts.find((p) => p &&
                typeof p === "object" &&
                "type" in p &&
                p.type === "dynamic-tool");
            (0, bun_test_1.expect)(toolPart?.toolName).toBe("task");
            (0, bun_test_1.expect)(toolPart?.state).toBe("output-available");
            (0, bun_test_1.expect)(JSON.stringify(toolPart?.output)).toContain("Final output without agent_report");
            (0, bun_test_1.expect)(JSON.stringify(toolPart?.output)).toContain("fallback");
        }
        const postCfg = config.loadConfigOrDefault();
        const ws = Array.from(postCfg.projects.values())
            .flatMap((p) => p.workspaces)
            .find((w) => w.id === childId);
        (0, bun_test_1.expect)(ws?.taskStatus).toBe("reported");
        (0, bun_test_1.expect)(remove).toHaveBeenCalled();
        // Parent auto-resume now uses sendMessage instead of resumeStream
        (0, bun_test_1.expect)(sendMessage).toHaveBeenCalledWith(parentId, bun_test_1.expect.stringContaining("sub-agent task(s) have completed"), bun_test_1.expect.any(Object), bun_test_1.expect.objectContaining({ skipAutoResumeReset: true, synthetic: true }));
    });
    (0, bun_test_1.test)("falls back to default trunk when parent branch does not exist locally", async () => {
        const config = await createTestConfig(rootDir);
        stubStableIds(config, ["aaaaaaaaaa"], "bbbbbbbbbb");
        const projectPath = await createTestProject(rootDir);
        const runtimeConfig = { type: "worktree", srcBaseDir: config.srcDir };
        const runtime = (0, runtimeFactory_1.createRuntime)(runtimeConfig, { projectPath });
        const initLogger = createNullInitLogger();
        // Create a worktree for the parent on main
        const parentName = "parent";
        const parentCreate = await runtime.createWorkspace({
            projectPath,
            branchName: parentName,
            trunkBranch: "main",
            directoryName: parentName,
            initLogger,
        });
        (0, bun_test_1.expect)(parentCreate.success).toBe(true);
        const parentId = "1111111111";
        const parentPath = runtime.getWorkspacePath(projectPath, parentName);
        // Register parent with a name that does NOT exist as a local branch.
        // This simulates the case where parent workspace name (e.g., from SSH)
        // doesn't correspond to a local branch in the project repository.
        const nonExistentBranchName = "non-existent-branch-xyz";
        await config.saveConfig({
            projects: new Map([
                [
                    projectPath,
                    {
                        workspaces: [
                            {
                                path: parentPath,
                                id: parentId,
                                name: nonExistentBranchName, // This branch doesn't exist locally
                                createdAt: new Date().toISOString(),
                                runtimeConfig,
                            },
                        ],
                    },
                ],
            ]),
            taskSettings: { maxParallelAgentTasks: 3, maxTaskNestingDepth: 3 },
        });
        const { taskService } = createTaskServiceHarness(config);
        // Creating a task should succeed by falling back to "main" as trunkBranch
        // instead of failing with "fatal: 'non-existent-branch-xyz' is not a commit"
        const created = await taskService.create({
            parentWorkspaceId: parentId,
            kind: "agent",
            agentType: "explore",
            prompt: "explore this repo",
            title: "Test task",
        });
        (0, bun_test_1.expect)(created.success).toBe(true);
        if (!created.success)
            return;
        // Verify the child workspace was created
        const postCfg = config.loadConfigOrDefault();
        const childEntry = Array.from(postCfg.projects.values())
            .flatMap((p) => p.workspaces)
            .find((w) => w.id === created.data.taskId);
        (0, bun_test_1.expect)(childEntry).toBeTruthy();
        (0, bun_test_1.expect)(childEntry?.runtimeConfig?.type).toBe("worktree");
    }, 20_000);
    (0, bun_test_1.describe)("parent auto-resume flood protection", () => {
        async function setupParentWithActiveChild(rootDirPath) {
            const config = await createTestConfig(rootDirPath);
            const projectPath = path.join(rootDirPath, "repo");
            await fsPromises.mkdir(projectPath, { recursive: true });
            const rootWorkspaceId = "root-resume-111";
            const childTaskId = "child-resume-222";
            await config.saveConfig({
                projects: new Map([
                    [
                        projectPath,
                        {
                            workspaces: [
                                {
                                    path: path.join(projectPath, "root"),
                                    id: rootWorkspaceId,
                                    name: "root",
                                    aiSettings: { model: "openai:gpt-5.2", thinkingLevel: "medium" },
                                },
                                {
                                    path: path.join(projectPath, "child-task"),
                                    id: childTaskId,
                                    name: "child-task",
                                    parentWorkspaceId: rootWorkspaceId,
                                    agentType: "explore",
                                    taskStatus: "running",
                                    taskModelString: "openai:gpt-5.2",
                                },
                            ],
                        },
                    ],
                ]),
                taskSettings: { maxParallelAgentTasks: 3, maxTaskNestingDepth: 3 },
            });
            const { aiService } = createAIServiceMocks(config);
            const { workspaceService, sendMessage } = createWorkspaceServiceMocks();
            const { taskService } = createTaskServiceHarness(config, {
                aiService,
                workspaceService,
            });
            const internal = taskService;
            const makeStreamEndEvent = () => ({
                type: "stream-end",
                workspaceId: rootWorkspaceId,
                messageId: `assistant-${Date.now()}`,
                metadata: { model: "openai:gpt-5.2" },
                parts: [],
            });
            return {
                config,
                taskService,
                internal,
                sendMessage,
                rootWorkspaceId,
                childTaskId,
                projectPath,
                makeStreamEndEvent,
            };
        }
        (0, bun_test_1.test)("stops auto-resuming after MAX_CONSECUTIVE_PARENT_AUTO_RESUMES (3)", async () => {
            const { internal, sendMessage, makeStreamEndEvent } = await setupParentWithActiveChild(rootDir);
            // First 3 calls should trigger sendMessage (limit is 3)
            for (let i = 0; i < 3; i++) {
                await internal.handleStreamEnd(makeStreamEndEvent());
            }
            (0, bun_test_1.expect)(sendMessage).toHaveBeenCalledTimes(3);
            // 4th call should NOT trigger sendMessage (limit exceeded)
            await internal.handleStreamEnd(makeStreamEndEvent());
            (0, bun_test_1.expect)(sendMessage).toHaveBeenCalledTimes(3); // still 3
        });
        (0, bun_test_1.test)("resetAutoResumeCount allows more resumes after limit", async () => {
            const { internal, sendMessage, taskService, rootWorkspaceId, makeStreamEndEvent } = await setupParentWithActiveChild(rootDir);
            // Exhaust the auto-resume limit
            for (let i = 0; i < 3; i++) {
                await internal.handleStreamEnd(makeStreamEndEvent());
            }
            (0, bun_test_1.expect)(sendMessage).toHaveBeenCalledTimes(3);
            // Blocked (limit reached)
            await internal.handleStreamEnd(makeStreamEndEvent());
            (0, bun_test_1.expect)(sendMessage).toHaveBeenCalledTimes(3);
            // User sends a message → resets the counter
            taskService.resetAutoResumeCount(rootWorkspaceId);
            // Now auto-resume should work again
            await internal.handleStreamEnd(makeStreamEndEvent());
            (0, bun_test_1.expect)(sendMessage).toHaveBeenCalledTimes(4);
        });
        (0, bun_test_1.test)("counter is per-workspace (different workspaces are independent)", async () => {
            const config = await createTestConfig(rootDir);
            const projectPath = path.join(rootDir, "repo");
            await fsPromises.mkdir(projectPath, { recursive: true });
            const rootA = "root-A";
            const rootB = "root-B";
            const childA = "child-A";
            const childB = "child-B";
            await config.saveConfig({
                projects: new Map([
                    [
                        projectPath,
                        {
                            workspaces: [
                                {
                                    path: path.join(projectPath, "root-a"),
                                    id: rootA,
                                    name: "root-a",
                                    aiSettings: { model: "openai:gpt-5.2", thinkingLevel: "medium" },
                                },
                                {
                                    path: path.join(projectPath, "child-a"),
                                    id: childA,
                                    name: "child-a",
                                    parentWorkspaceId: rootA,
                                    taskStatus: "running",
                                    taskModelString: "openai:gpt-5.2",
                                },
                                {
                                    path: path.join(projectPath, "root-b"),
                                    id: rootB,
                                    name: "root-b",
                                    aiSettings: { model: "openai:gpt-5.2", thinkingLevel: "medium" },
                                },
                                {
                                    path: path.join(projectPath, "child-b"),
                                    id: childB,
                                    name: "child-b",
                                    parentWorkspaceId: rootB,
                                    taskStatus: "running",
                                    taskModelString: "openai:gpt-5.2",
                                },
                            ],
                        },
                    ],
                ]),
                taskSettings: { maxParallelAgentTasks: 5, maxTaskNestingDepth: 3 },
            });
            const { aiService } = createAIServiceMocks(config);
            const { workspaceService, sendMessage } = createWorkspaceServiceMocks();
            const { taskService } = createTaskServiceHarness(config, {
                aiService,
                workspaceService,
            });
            const internal = taskService;
            // Exhaust limit on workspace A
            for (let i = 0; i < 3; i++) {
                await internal.handleStreamEnd({
                    type: "stream-end",
                    workspaceId: rootA,
                    messageId: `a-${i}`,
                    metadata: { model: "openai:gpt-5.2" },
                    parts: [],
                });
            }
            (0, bun_test_1.expect)(sendMessage).toHaveBeenCalledTimes(3);
            // Workspace A is now blocked
            await internal.handleStreamEnd({
                type: "stream-end",
                workspaceId: rootA,
                messageId: "a-blocked",
                metadata: { model: "openai:gpt-5.2" },
                parts: [],
            });
            (0, bun_test_1.expect)(sendMessage).toHaveBeenCalledTimes(3); // still 3
            // Workspace B should still work (independent counter)
            await internal.handleStreamEnd({
                type: "stream-end",
                workspaceId: rootB,
                messageId: "b-0",
                metadata: { model: "openai:gpt-5.2" },
                parts: [],
            });
            (0, bun_test_1.expect)(sendMessage).toHaveBeenCalledTimes(4); // B worked
        });
    });
});
//# sourceMappingURL=taskService.test.js.map