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
const events_1 = require("events");
const stream_1 = require("stream");
const bun_test_1 = require("bun:test");
const coderService_1 = require("./coderService");
const childProcess = __importStar(require("child_process"));
const disposableExec = __importStar(require("../../node/utils/disposableExec"));
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => { };
/**
 * Mock execAsync for non-streaming tests.
 * Uses spyOn instead of vi.mock to avoid polluting other test files.
 */
let execAsyncSpy = null;
// Minimal mock that satisfies the interface used by CoderService
// Uses cast via `unknown` because we only implement the subset actually used by tests
function createMockExecResult(result) {
    const mock = {
        result,
        get promise() {
            return result;
        },
        child: {}, // not used by CoderService
        [Symbol.dispose]: noop,
    };
    return mock;
}
function mockExecOk(stdout, stderr = "") {
    execAsyncSpy?.mockReturnValue(createMockExecResult(Promise.resolve({ stdout, stderr })));
}
function mockExecError(error) {
    execAsyncSpy?.mockReturnValue(createMockExecResult(Promise.reject(error)));
}
function mockVersionAndWhoami(options) {
    execAsyncSpy?.mockImplementationOnce(() => createMockExecResult(Promise.resolve({ stdout: "/usr/local/bin/coder\n", stderr: "" })));
    execAsyncSpy?.mockImplementationOnce(() => createMockExecResult(Promise.resolve({ stdout: JSON.stringify({ version: options.version }), stderr: "" })));
    const whoamiPayload = {
        url: "https://coder.example.com",
        ...(options.username ? { username: options.username } : {}),
    };
    execAsyncSpy?.mockImplementationOnce(() => createMockExecResult(Promise.resolve({ stdout: JSON.stringify([whoamiPayload]), stderr: "" })));
}
/**
 * Mock spawn for streaming createWorkspace() tests.
 * Uses spyOn instead of vi.mock to avoid polluting other test files.
 */
let spawnSpy = null;
function mockCoderCommandResult(options) {
    const stdout = stream_1.Readable.from(options.stdout ? [Buffer.from(options.stdout)] : []);
    const stderr = stream_1.Readable.from(options.stderr ? [Buffer.from(options.stderr)] : []);
    const events = new events_1.EventEmitter();
    spawnSpy?.mockReturnValue({
        stdout,
        stderr,
        exitCode: null,
        signalCode: null,
        kill: bun_test_1.vi.fn(),
        on: events.on.bind(events),
        removeListener: events.removeListener.bind(events),
    });
    // Emit close after handlers are attached.
    setTimeout(() => events.emit("close", options.exitCode), 0);
}
(0, bun_test_1.describe)("CoderService", () => {
    let service;
    (0, bun_test_1.beforeEach)(() => {
        service = new coderService_1.CoderService();
        bun_test_1.vi.clearAllMocks();
        // Set up spies for mocking - uses spyOn instead of vi.mock to avoid polluting other test files
        execAsyncSpy = (0, bun_test_1.spyOn)(disposableExec, "execAsync");
        spawnSpy = (0, bun_test_1.spyOn)(childProcess, "spawn");
    });
    (0, bun_test_1.afterEach)(() => {
        service.clearCache();
        execAsyncSpy?.mockRestore();
        execAsyncSpy = null;
        spawnSpy?.mockRestore();
        spawnSpy = null;
    });
    (0, bun_test_1.describe)("getCoderInfo", () => {
        (0, bun_test_1.it)("returns available state with valid version", async () => {
            mockVersionAndWhoami({ version: "2.28.2", username: "coder-user" });
            const info = await service.getCoderInfo();
            (0, bun_test_1.expect)(info).toEqual({
                state: "available",
                version: "2.28.2",
                username: "coder-user",
                url: "https://coder.example.com",
            });
        });
        (0, bun_test_1.it)("returns available state for exact minimum version", async () => {
            mockVersionAndWhoami({ version: "2.25.0", username: "coder-user" });
            const info = await service.getCoderInfo();
            (0, bun_test_1.expect)(info).toEqual({
                state: "available",
                version: "2.25.0",
                username: "coder-user",
                url: "https://coder.example.com",
            });
        });
        (0, bun_test_1.it)("returns outdated state for version below minimum", async () => {
            execAsyncSpy?.mockImplementationOnce(() => createMockExecResult(Promise.resolve({ stdout: "/usr/local/bin/coder\n", stderr: "" })));
            execAsyncSpy?.mockImplementationOnce(() => createMockExecResult(Promise.resolve({ stdout: JSON.stringify({ version: "2.24.9" }), stderr: "" })));
            const info = await service.getCoderInfo();
            (0, bun_test_1.expect)(info).toEqual({
                state: "outdated",
                version: "2.24.9",
                minVersion: "2.25.0",
                binaryPath: "/usr/local/bin/coder",
            });
        });
        (0, bun_test_1.it)("returns outdated state without binaryPath when lookup fails", async () => {
            execAsyncSpy?.mockImplementationOnce(() => createMockExecResult(Promise.reject(new Error("lookup failed"))));
            execAsyncSpy?.mockImplementationOnce(() => createMockExecResult(Promise.resolve({ stdout: JSON.stringify({ version: "2.24.9" }), stderr: "" })));
            const info = await service.getCoderInfo();
            (0, bun_test_1.expect)(info).toEqual({ state: "outdated", version: "2.24.9", minVersion: "2.25.0" });
        });
        (0, bun_test_1.it)("handles version with dev suffix", async () => {
            mockVersionAndWhoami({
                version: "2.28.2-devel+903c045b9",
                username: "coder-user",
            });
            const info = await service.getCoderInfo();
            (0, bun_test_1.expect)(info).toEqual({
                state: "available",
                version: "2.28.2-devel+903c045b9",
                username: "coder-user",
                url: "https://coder.example.com",
            });
        });
        (0, bun_test_1.it)("returns unavailable state with not-logged-in reason when whoami fails", async () => {
            execAsyncSpy?.mockImplementationOnce(() => createMockExecResult(Promise.resolve({ stdout: "/usr/local/bin/coder\n", stderr: "" })));
            execAsyncSpy?.mockImplementationOnce(() => createMockExecResult(Promise.resolve({ stdout: JSON.stringify({ version: "2.28.2" }), stderr: "" })));
            execAsyncSpy?.mockImplementationOnce(() => createMockExecResult(Promise.reject(new Error(`Encountered an error running "coder whoami", see "coder whoami --help" for more information\nerror: You are not logged in. Try logging in using 'coder login <url>'.`))));
            const info = await service.getCoderInfo();
            (0, bun_test_1.expect)(info).toMatchObject({
                state: "unavailable",
                reason: { kind: "not-logged-in" },
            });
            if (info.state !== "unavailable" ||
                typeof info.reason === "string" ||
                info.reason.kind !== "not-logged-in") {
                throw new Error(`Expected not-logged-in unavailable state, got: ${JSON.stringify(info)}`);
            }
            (0, bun_test_1.expect)(info.reason.message).toContain("/usr/local/bin/coder");
            (0, bun_test_1.expect)(info.reason.message.toLowerCase()).toContain("not logged in");
        });
        (0, bun_test_1.it)("re-checks whoami after transient failure (does not cache error state)", async () => {
            // First call: whoami transient error
            execAsyncSpy?.mockImplementationOnce(() => createMockExecResult(Promise.resolve({ stdout: "/usr/local/bin/coder\n", stderr: "" })));
            execAsyncSpy?.mockImplementationOnce(() => createMockExecResult(Promise.resolve({ stdout: JSON.stringify({ version: "2.28.2" }), stderr: "" })));
            execAsyncSpy?.mockImplementationOnce(() => createMockExecResult(Promise.reject(new Error("error: Connection refused"))));
            // Second call: should try again (previous error must not be cached)
            execAsyncSpy?.mockImplementationOnce(() => createMockExecResult(Promise.resolve({ stdout: "/usr/local/bin/coder\n", stderr: "" })));
            execAsyncSpy?.mockImplementationOnce(() => createMockExecResult(Promise.resolve({ stdout: JSON.stringify({ version: "2.28.2" }), stderr: "" })));
            execAsyncSpy?.mockImplementationOnce(() => createMockExecResult(Promise.reject(new Error("error: Connection refused"))));
            const first = await service.getCoderInfo();
            (0, bun_test_1.expect)(first).toMatchObject({ state: "unavailable", reason: { kind: "error" } });
            if (first.state !== "unavailable" ||
                typeof first.reason === "string" ||
                first.reason.kind !== "error") {
                throw new Error(`Expected unavailable error state, got: ${JSON.stringify(first)}`);
            }
            (0, bun_test_1.expect)(first.reason.message.toLowerCase()).toContain("connection refused");
            const second = await service.getCoderInfo();
            (0, bun_test_1.expect)(second).toMatchObject({ state: "unavailable", reason: { kind: "error" } });
            const cmds = execAsyncSpy?.mock.calls.map(([cmd]) => cmd) ?? [];
            (0, bun_test_1.expect)(cmds.filter((c) => c === "coder whoami --output=json")).toHaveLength(2);
        });
        (0, bun_test_1.it)("re-checks login status after not-logged-in and caches once logged in", async () => {
            // First call: not logged in
            execAsyncSpy?.mockImplementationOnce(() => createMockExecResult(Promise.resolve({ stdout: "/usr/local/bin/coder\n", stderr: "" })));
            execAsyncSpy?.mockImplementationOnce(() => createMockExecResult(Promise.resolve({ stdout: JSON.stringify({ version: "2.28.2" }), stderr: "" })));
            execAsyncSpy?.mockImplementationOnce(() => createMockExecResult(Promise.reject(new Error(`Encountered an error running "coder whoami", see "coder whoami --help" for more information\nerror: You are not logged in. Try logging in using 'coder login <url>'.`))));
            // Second call: now logged in
            mockVersionAndWhoami({ version: "2.28.2", username: "coder-user" });
            const first = await service.getCoderInfo();
            (0, bun_test_1.expect)(first).toMatchObject({
                state: "unavailable",
                reason: { kind: "not-logged-in" },
            });
            if (first.state !== "unavailable" ||
                typeof first.reason === "string" ||
                first.reason.kind !== "not-logged-in") {
                throw new Error(`Expected not-logged-in unavailable state, got: ${JSON.stringify(first)}`);
            }
            (0, bun_test_1.expect)(first.reason.message).toContain("/usr/local/bin/coder");
            (0, bun_test_1.expect)(first.reason.message.toLowerCase()).toContain("not logged in");
            const second = await service.getCoderInfo();
            (0, bun_test_1.expect)(second).toEqual({
                state: "available",
                version: "2.28.2",
                username: "coder-user",
                url: "https://coder.example.com",
            });
            const callsAfterSecond = execAsyncSpy?.mock.calls.length ?? 0;
            // Third call should come from cache (no extra execAsync calls)
            await service.getCoderInfo();
            (0, bun_test_1.expect)(execAsyncSpy?.mock.calls.length ?? 0).toBe(callsAfterSecond);
            const cmds = execAsyncSpy?.mock.calls.map(([cmd]) => cmd) ?? [];
            (0, bun_test_1.expect)(cmds.filter((c) => c === "coder whoami --output=json")).toHaveLength(2);
        });
        (0, bun_test_1.it)("returns unavailable state with reason missing when CLI not installed", async () => {
            mockExecError(new Error("command not found: coder"));
            const info = await service.getCoderInfo();
            (0, bun_test_1.expect)(info).toEqual({ state: "unavailable", reason: "missing" });
        });
        (0, bun_test_1.it)("returns unavailable state with error reason for other errors", async () => {
            mockExecError(new Error("Connection refused"));
            const info = await service.getCoderInfo();
            (0, bun_test_1.expect)(info).toEqual({
                state: "unavailable",
                reason: { kind: "error", message: "Connection refused" },
            });
        });
        (0, bun_test_1.it)("returns unavailable state with error when version is missing from output", async () => {
            mockExecOk(JSON.stringify({}));
            const info = await service.getCoderInfo();
            (0, bun_test_1.expect)(info).toEqual({
                state: "unavailable",
                reason: { kind: "error", message: "Version output missing from CLI" },
            });
        });
        (0, bun_test_1.it)("caches the result", async () => {
            mockVersionAndWhoami({ version: "2.28.2", username: "coder-user" });
            await service.getCoderInfo();
            await service.getCoderInfo();
            (0, bun_test_1.expect)(execAsyncSpy).toHaveBeenCalledTimes(3);
        });
    });
    (0, bun_test_1.describe)("listTemplates", () => {
        (0, bun_test_1.it)("returns templates with display names", async () => {
            execAsyncSpy?.mockReturnValue(createMockExecResult(Promise.resolve({
                stdout: JSON.stringify([
                    {
                        Template: {
                            name: "template-1",
                            display_name: "Template One",
                            organization_name: "org1",
                        },
                    },
                    { Template: { name: "template-2", display_name: "Template Two" } },
                ]),
                stderr: "",
            })));
            const templates = await service.listTemplates();
            (0, bun_test_1.expect)(templates).toEqual({
                ok: true,
                templates: [
                    { name: "template-1", displayName: "Template One", organizationName: "org1" },
                    { name: "template-2", displayName: "Template Two", organizationName: "default" },
                ],
            });
        });
        (0, bun_test_1.it)("uses name as displayName when display_name not present", async () => {
            execAsyncSpy?.mockReturnValue(createMockExecResult(Promise.resolve({
                stdout: JSON.stringify([{ Template: { name: "my-template" } }]),
                stderr: "",
            })));
            const templates = await service.listTemplates();
            (0, bun_test_1.expect)(templates).toEqual({
                ok: true,
                templates: [
                    { name: "my-template", displayName: "my-template", organizationName: "default" },
                ],
            });
        });
        (0, bun_test_1.it)("returns error result on error", async () => {
            mockExecError(new Error("not logged in"));
            const templates = await service.listTemplates();
            (0, bun_test_1.expect)(templates).toEqual({ ok: false, error: "not logged in" });
        });
        (0, bun_test_1.it)("returns empty array for empty output", async () => {
            mockExecOk("");
            const templates = await service.listTemplates();
            (0, bun_test_1.expect)(templates).toEqual({ ok: true, templates: [] });
        });
    });
    (0, bun_test_1.describe)("listPresets", () => {
        (0, bun_test_1.it)("returns presets for a template", async () => {
            mockExecOk(JSON.stringify([
                {
                    TemplatePreset: {
                        ID: "preset-1",
                        Name: "Small",
                        Description: "Small instance",
                        Default: true,
                    },
                },
                {
                    TemplatePreset: {
                        ID: "preset-2",
                        Name: "Large",
                        Description: "Large instance",
                    },
                },
            ]));
            const presets = await service.listPresets("my-template");
            (0, bun_test_1.expect)(presets).toEqual({
                ok: true,
                presets: [
                    { id: "preset-1", name: "Small", description: "Small instance", isDefault: true },
                    { id: "preset-2", name: "Large", description: "Large instance", isDefault: false },
                ],
            });
        });
        (0, bun_test_1.it)("returns empty array when template has no presets", async () => {
            mockExecOk("");
            const presets = await service.listPresets("no-presets-template");
            (0, bun_test_1.expect)(presets).toEqual({ ok: true, presets: [] });
        });
        (0, bun_test_1.it)("returns empty array when CLI prints info message instead of JSON", async () => {
            mockExecOk('No presets found for template "my-template" and template-version "v1".\n');
            const presets = await service.listPresets("my-template");
            (0, bun_test_1.expect)(presets).toEqual({ ok: true, presets: [] });
        });
        (0, bun_test_1.it)("returns error result on error", async () => {
            mockExecError(new Error("template not found"));
            const presets = await service.listPresets("nonexistent");
            (0, bun_test_1.expect)(presets).toEqual({ ok: false, error: "template not found" });
        });
    });
    (0, bun_test_1.describe)("listWorkspaces", () => {
        (0, bun_test_1.it)("returns all workspaces regardless of status", async () => {
            mockExecOk(JSON.stringify([
                {
                    name: "ws-1",
                    template_name: "t1",
                    template_display_name: "t1",
                    latest_build: { status: "running" },
                },
                {
                    name: "ws-2",
                    template_name: "t2",
                    template_display_name: "t2",
                    latest_build: { status: "stopped" },
                },
                {
                    name: "ws-3",
                    template_name: "t3",
                    template_display_name: "t3",
                    latest_build: { status: "starting" },
                },
            ]));
            const workspaces = await service.listWorkspaces();
            (0, bun_test_1.expect)(workspaces).toEqual({
                ok: true,
                workspaces: [
                    { name: "ws-1", templateName: "t1", templateDisplayName: "t1", status: "running" },
                    { name: "ws-2", templateName: "t2", templateDisplayName: "t2", status: "stopped" },
                    { name: "ws-3", templateName: "t3", templateDisplayName: "t3", status: "starting" },
                ],
            });
        });
        (0, bun_test_1.it)("returns error result on failure", async () => {
            mockExecError(new Error(`Encountered an error running "coder list", see "coder list --help" for more information\nerror: You are not logged in. Try logging in using '/usr/local/bin/coder login <url>'.`));
            const workspaces = await service.listWorkspaces();
            (0, bun_test_1.expect)(workspaces).toEqual({
                ok: false,
                error: "You are not logged in. Try logging in using '/usr/local/bin/coder login <url>'.",
            });
        });
    });
    (0, bun_test_1.describe)("workspaceExists", () => {
        (0, bun_test_1.it)("returns true when exact match is found in search results", async () => {
            mockExecOk(JSON.stringify([{ name: "ws-1" }, { name: "ws-10" }]));
            const exists = await service.workspaceExists("ws-1");
            (0, bun_test_1.expect)(exists).toBe(true);
        });
        (0, bun_test_1.it)("returns false when only prefix matches", async () => {
            mockExecOk(JSON.stringify([{ name: "ws-10" }]));
            const exists = await service.workspaceExists("ws-1");
            (0, bun_test_1.expect)(exists).toBe(false);
        });
        (0, bun_test_1.it)("returns false on CLI error", async () => {
            mockExecError(new Error("not logged in"));
            const exists = await service.workspaceExists("ws-1");
            (0, bun_test_1.expect)(exists).toBe(false);
        });
    });
    (0, bun_test_1.describe)("getWorkspaceStatus", () => {
        (0, bun_test_1.it)("returns status for exact match (search is prefix-based)", async () => {
            mockCoderCommandResult({
                exitCode: 0,
                stdout: JSON.stringify([
                    { name: "ws-1", latest_build: { status: "running" } },
                    { name: "ws-10", latest_build: { status: "stopped" } },
                ]),
            });
            const result = await service.getWorkspaceStatus("ws-1");
            (0, bun_test_1.expect)(result.kind).toBe("ok");
            if (result.kind === "ok") {
                (0, bun_test_1.expect)(result.status).toBe("running");
            }
        });
        (0, bun_test_1.it)("returns not_found when only prefix matches", async () => {
            mockCoderCommandResult({
                exitCode: 0,
                stdout: JSON.stringify([{ name: "ws-10", latest_build: { status: "running" } }]),
            });
            const result = await service.getWorkspaceStatus("ws-1");
            (0, bun_test_1.expect)(result.kind).toBe("not_found");
        });
        (0, bun_test_1.it)("returns error for unknown workspace status", async () => {
            mockCoderCommandResult({
                exitCode: 0,
                stdout: JSON.stringify([{ name: "ws-1", latest_build: { status: "weird" } }]),
            });
            const result = await service.getWorkspaceStatus("ws-1");
            (0, bun_test_1.expect)(result.kind).toBe("error");
            if (result.kind === "error") {
                (0, bun_test_1.expect)(result.error).toContain("Unknown status");
            }
        });
    });
    (0, bun_test_1.describe)("waitForStartupScripts", () => {
        (0, bun_test_1.it)("streams stdout/stderr lines while waiting", async () => {
            const stdout = stream_1.Readable.from([Buffer.from("Waiting for agent...\nAgent ready\n")]);
            const stderr = stream_1.Readable.from([]);
            const events = new events_1.EventEmitter();
            spawnSpy.mockReturnValue({
                stdout,
                stderr,
                kill: bun_test_1.vi.fn(),
                on: events.on.bind(events),
            });
            setTimeout(() => events.emit("close", 0), 0);
            const lines = [];
            for await (const line of service.waitForStartupScripts("my-ws")) {
                lines.push(line);
            }
            (0, bun_test_1.expect)(lines).toContain("$ coder ssh my-ws --wait=yes -- true");
            (0, bun_test_1.expect)(lines).toContain("Waiting for agent...");
            (0, bun_test_1.expect)(lines).toContain("Agent ready");
            (0, bun_test_1.expect)(spawnSpy).toHaveBeenCalledWith("coder", ["ssh", "my-ws", "--wait=yes", "--", "true"], {
                stdio: ["ignore", "pipe", "pipe"],
            });
        });
        (0, bun_test_1.it)("throws when exit code is non-zero", async () => {
            const stdout = stream_1.Readable.from([]);
            const stderr = stream_1.Readable.from([Buffer.from("Connection refused\n")]);
            const events = new events_1.EventEmitter();
            spawnSpy.mockReturnValue({
                stdout,
                stderr,
                kill: bun_test_1.vi.fn(),
                on: events.on.bind(events),
            });
            setTimeout(() => events.emit("close", 1), 0);
            const lines = [];
            const run = async () => {
                for await (const line of service.waitForStartupScripts("my-ws")) {
                    lines.push(line);
                }
            };
            let thrown;
            try {
                await run();
            }
            catch (error) {
                thrown = error;
            }
            (0, bun_test_1.expect)(thrown).toBeTruthy();
            (0, bun_test_1.expect)(thrown instanceof Error ? thrown.message : String(thrown)).toBe("coder ssh --wait failed (exit 1): Connection refused");
        });
    });
    (0, bun_test_1.describe)("fetchDeploymentSshConfig", () => {
        let originalFetch;
        (0, bun_test_1.beforeEach)(() => {
            originalFetch = global.fetch;
        });
        (0, bun_test_1.afterEach)(() => {
            global.fetch = originalFetch;
        });
        function mockWhoami() {
            execAsyncSpy?.mockImplementation((cmd) => {
                if (cmd === "coder whoami --output=json") {
                    return createMockExecResult(Promise.resolve({
                        stdout: JSON.stringify([
                            { url: "https://coder.example.com", username: "coder-user" },
                        ]),
                        stderr: "",
                    }));
                }
                return createMockExecResult(Promise.reject(new Error(`Unexpected command: ${cmd}`)));
            });
        }
        (0, bun_test_1.it)("uses provided session and normalizes leading dot", async () => {
            mockWhoami();
            const fetchSpy = bun_test_1.vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ hostname_suffix: ".corp" }),
            });
            global.fetch = fetchSpy;
            const session = {
                token: "session-token",
                dispose: bun_test_1.vi.fn().mockResolvedValue(undefined),
            };
            const result = await service.fetchDeploymentSshConfig(session);
            (0, bun_test_1.expect)(result).toEqual({ hostnameSuffix: "corp" });
            const calledUrl = fetchSpy.mock.calls[0]?.[0];
            const options = fetchSpy.mock.calls[0]?.[1];
            (0, bun_test_1.expect)(calledUrl?.toString()).toBe("https://coder.example.com/api/v2/deployment/ssh");
            (0, bun_test_1.expect)(options).toEqual({
                headers: { "Coder-Session-Token": "session-token" },
            });
            (0, bun_test_1.expect)(execAsyncSpy).toHaveBeenCalledTimes(1);
        });
        (0, bun_test_1.it)("reuses cached whoami after getCoderInfo", async () => {
            mockVersionAndWhoami({ version: "2.28.2", username: "coder-user" });
            execAsyncSpy?.mockImplementation((cmd) => createMockExecResult(Promise.reject(new Error(`Unexpected command: ${cmd}`))));
            const fetchSpy = bun_test_1.vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ hostname_suffix: ".corp" }),
            });
            global.fetch = fetchSpy;
            await service.getCoderInfo();
            const session = {
                token: "session-token",
                dispose: bun_test_1.vi.fn().mockResolvedValue(undefined),
            };
            await service.fetchDeploymentSshConfig(session);
            (0, bun_test_1.expect)(execAsyncSpy).toHaveBeenCalledTimes(3);
            const whoamiCalls = execAsyncSpy?.mock.calls.filter(([cmd]) => cmd === "coder whoami --output=json") ?? [];
            (0, bun_test_1.expect)(whoamiCalls).toHaveLength(1);
        });
        (0, bun_test_1.it)("defaults to coder when hostname suffix missing", async () => {
            mockWhoami();
            const fetchSpy = bun_test_1.vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({}),
            });
            global.fetch = fetchSpy;
            const session = {
                token: "session-token",
                dispose: bun_test_1.vi.fn().mockResolvedValue(undefined),
            };
            const result = await service.fetchDeploymentSshConfig(session);
            (0, bun_test_1.expect)(result).toEqual({ hostnameSuffix: "coder" });
        });
    });
    (0, bun_test_1.describe)("provisioning sessions", () => {
        function mockTokenCommands() {
            execAsyncSpy?.mockImplementation((cmd) => {
                if (cmd.startsWith("coder tokens create --lifetime 5m --name")) {
                    return createMockExecResult(Promise.resolve({ stdout: "token-123", stderr: "" }));
                }
                if (cmd.startsWith("coder tokens delete")) {
                    return createMockExecResult(Promise.resolve({ stdout: "", stderr: "" }));
                }
                return createMockExecResult(Promise.reject(new Error(`Unexpected command: ${cmd}`)));
            });
        }
        (0, bun_test_1.it)("reuses provisioning sessions for the same workspace", async () => {
            mockTokenCommands();
            const session1 = await service.ensureProvisioningSession("ws");
            const session2 = await service.ensureProvisioningSession("ws");
            (0, bun_test_1.expect)(session1).toBe(session2);
            (0, bun_test_1.expect)(session1.token).toBe("token-123");
            await service.disposeProvisioningSession("ws");
            (0, bun_test_1.expect)(execAsyncSpy).toHaveBeenCalledTimes(2);
        });
        (0, bun_test_1.it)("takeProvisioningSession returns and clears the session", async () => {
            mockTokenCommands();
            const session = await service.ensureProvisioningSession("ws");
            const taken = service.takeProvisioningSession("ws");
            (0, bun_test_1.expect)(taken).toBe(session);
            (0, bun_test_1.expect)(service.takeProvisioningSession("ws")).toBeUndefined();
            await taken?.dispose();
            (0, bun_test_1.expect)(execAsyncSpy).toHaveBeenCalledTimes(2);
        });
    });
    (0, bun_test_1.describe)("createWorkspace", () => {
        // Capture original fetch once per describe block to avoid nested mock issues
        let originalFetch;
        (0, bun_test_1.beforeEach)(() => {
            originalFetch = global.fetch;
        });
        (0, bun_test_1.afterEach)(() => {
            global.fetch = originalFetch;
        });
        // Helper to mock the pre-fetch calls that happen before spawn
        function mockPrefetchCalls(options) {
            // Mock getDeploymentUrl (coder whoami)
            // Mock getActiveTemplateVersionId (coder templates list)
            // Mock getPresetParamNames (coder templates presets list)
            // Mock getTemplateRichParameters (coder tokens create + fetch)
            execAsyncSpy?.mockImplementation((cmd) => {
                if (cmd === "coder whoami --output=json") {
                    return createMockExecResult(Promise.resolve({
                        stdout: JSON.stringify([
                            { url: "https://coder.example.com", username: "coder-user" },
                        ]),
                        stderr: "",
                    }));
                }
                if (cmd === "coder templates list --output=json") {
                    return createMockExecResult(Promise.resolve({
                        stdout: JSON.stringify([
                            { Template: { name: "my-template", active_version_id: "version-123" } },
                            { Template: { name: "tmpl", active_version_id: "version-456" } },
                        ]),
                        stderr: "",
                    }));
                }
                if (cmd.startsWith("coder templates presets list")) {
                    const paramNames = options?.presetParamNames ?? [];
                    return createMockExecResult(Promise.resolve({
                        stdout: JSON.stringify([
                            {
                                TemplatePreset: {
                                    Name: "preset",
                                    Parameters: paramNames.map((name) => ({ Name: name })),
                                },
                            },
                        ]),
                        stderr: "",
                    }));
                }
                if (cmd.startsWith("coder tokens create --lifetime 5m --name")) {
                    return createMockExecResult(Promise.resolve({ stdout: "fake-token-123", stderr: "" }));
                }
                if (cmd.startsWith("coder tokens delete")) {
                    return createMockExecResult(Promise.resolve({ stdout: "", stderr: "" }));
                }
                // Fallback for any other command
                return createMockExecResult(Promise.reject(new Error(`Unexpected command: ${cmd}`)));
            });
        }
        // Helper to mock fetch for rich parameters API
        function mockFetchRichParams(params) {
            global.fetch = bun_test_1.vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(params),
            });
        }
        (0, bun_test_1.it)("streams stdout/stderr lines and passes expected args", async () => {
            mockPrefetchCalls();
            mockFetchRichParams([]);
            const stdout = stream_1.Readable.from([Buffer.from("out-1\nout-2\n")]);
            const stderr = stream_1.Readable.from([Buffer.from("err-1\n")]);
            const events = new events_1.EventEmitter();
            spawnSpy.mockReturnValue({
                stdout,
                stderr,
                kill: bun_test_1.vi.fn(),
                on: events.on.bind(events),
            });
            // Emit close after handlers are attached.
            setTimeout(() => events.emit("close", 0), 0);
            const lines = [];
            for await (const line of service.createWorkspace("my-workspace", "my-template")) {
                lines.push(line);
            }
            (0, bun_test_1.expect)(spawnSpy).toHaveBeenCalledWith("coder", ["create", "my-workspace", "-t", "my-template", "--yes"], { stdio: ["ignore", "pipe", "pipe"] });
            // First line is the command, rest are stdout/stderr
            (0, bun_test_1.expect)(lines[0]).toBe("$ coder create my-workspace -t my-template --yes");
            (0, bun_test_1.expect)(lines.slice(1).sort()).toEqual(["err-1", "out-1", "out-2"]);
        });
        (0, bun_test_1.it)("includes --preset when provided", async () => {
            mockPrefetchCalls({ presetParamNames: ["covered-param"] });
            mockFetchRichParams([{ name: "covered-param", default_value: "val" }]);
            const stdout = stream_1.Readable.from([]);
            const stderr = stream_1.Readable.from([]);
            const events = new events_1.EventEmitter();
            spawnSpy.mockReturnValue({
                stdout,
                stderr,
                kill: bun_test_1.vi.fn(),
                on: events.on.bind(events),
            });
            setTimeout(() => events.emit("close", 0), 0);
            for await (const _line of service.createWorkspace("ws", "tmpl", "preset")) {
                // drain
            }
            (0, bun_test_1.expect)(spawnSpy).toHaveBeenCalledWith("coder", ["create", "ws", "-t", "tmpl", "--yes", "--preset", "preset"], { stdio: ["ignore", "pipe", "pipe"] });
        });
        (0, bun_test_1.it)("includes --parameter flags for uncovered non-ephemeral params", async () => {
            mockPrefetchCalls({ presetParamNames: ["covered-param"] });
            mockFetchRichParams([
                { name: "covered-param", default_value: "val1" },
                { name: "uncovered-param", default_value: "val2" },
                { name: "ephemeral-param", default_value: "val3", ephemeral: true },
            ]);
            const stdout = stream_1.Readable.from([]);
            const stderr = stream_1.Readable.from([]);
            const events = new events_1.EventEmitter();
            spawnSpy.mockReturnValue({
                stdout,
                stderr,
                kill: bun_test_1.vi.fn(),
                on: events.on.bind(events),
            });
            setTimeout(() => events.emit("close", 0), 0);
            for await (const _line of service.createWorkspace("ws", "tmpl", "preset")) {
                // drain
            }
            (0, bun_test_1.expect)(spawnSpy).toHaveBeenCalledWith("coder", [
                "create",
                "ws",
                "-t",
                "tmpl",
                "--yes",
                "--preset",
                "preset",
                "--parameter",
                "uncovered-param=val2",
            ], { stdio: ["ignore", "pipe", "pipe"] });
        });
        (0, bun_test_1.it)("throws when exit code is non-zero", async () => {
            mockPrefetchCalls();
            mockFetchRichParams([]);
            const stdout = stream_1.Readable.from([]);
            const stderr = stream_1.Readable.from([]);
            const events = new events_1.EventEmitter();
            spawnSpy.mockReturnValue({
                stdout,
                stderr,
                kill: bun_test_1.vi.fn(),
                on: events.on.bind(events),
            });
            setTimeout(() => events.emit("close", 42), 0);
            let thrown;
            try {
                for await (const _line of service.createWorkspace("ws", "tmpl")) {
                    // drain
                }
            }
            catch (error) {
                thrown = error;
            }
            (0, bun_test_1.expect)(thrown).toBeTruthy();
            (0, bun_test_1.expect)(thrown instanceof Error ? thrown.message : String(thrown)).toContain("coder create failed (exit 42)");
        });
        (0, bun_test_1.it)("aborts before spawn when already aborted", async () => {
            const abortController = new AbortController();
            abortController.abort();
            let thrown;
            try {
                for await (const _line of service.createWorkspace("ws", "tmpl", undefined, abortController.signal)) {
                    // drain
                }
            }
            catch (error) {
                thrown = error;
            }
            (0, bun_test_1.expect)(thrown).toBeTruthy();
            (0, bun_test_1.expect)(thrown instanceof Error ? thrown.message : String(thrown)).toContain("aborted");
        });
        (0, bun_test_1.it)("throws when required param has no default and is not covered by preset", async () => {
            mockPrefetchCalls({ presetParamNames: [] });
            mockFetchRichParams([{ name: "required-param", default_value: "", required: true }]);
            let thrown;
            try {
                for await (const _line of service.createWorkspace("ws", "tmpl")) {
                    // drain
                }
            }
            catch (error) {
                thrown = error;
            }
            (0, bun_test_1.expect)(thrown).toBeTruthy();
            (0, bun_test_1.expect)(thrown instanceof Error ? thrown.message : String(thrown)).toContain("required-param");
        });
    });
});
(0, bun_test_1.describe)("computeExtraParams", () => {
    let service;
    (0, bun_test_1.beforeEach)(() => {
        service = new coderService_1.CoderService();
    });
    (0, bun_test_1.it)("returns empty array when all params are covered by preset", () => {
        const params = [
            { name: "param1", defaultValue: "val1", type: "string", ephemeral: false, required: false },
            { name: "param2", defaultValue: "val2", type: "string", ephemeral: false, required: false },
        ];
        const covered = new Set(["param1", "param2"]);
        (0, bun_test_1.expect)(service.computeExtraParams(params, covered)).toEqual([]);
    });
    (0, bun_test_1.it)("returns uncovered non-ephemeral params with defaults", () => {
        const params = [
            { name: "covered", defaultValue: "val1", type: "string", ephemeral: false, required: false },
            {
                name: "uncovered",
                defaultValue: "val2",
                type: "string",
                ephemeral: false,
                required: false,
            },
        ];
        const covered = new Set(["covered"]);
        (0, bun_test_1.expect)(service.computeExtraParams(params, covered)).toEqual([
            { name: "uncovered", encoded: "uncovered=val2" },
        ]);
    });
    (0, bun_test_1.it)("excludes ephemeral params", () => {
        const params = [
            { name: "normal", defaultValue: "val1", type: "string", ephemeral: false, required: false },
            { name: "ephemeral", defaultValue: "val2", type: "string", ephemeral: true, required: false },
        ];
        const covered = new Set();
        (0, bun_test_1.expect)(service.computeExtraParams(params, covered)).toEqual([
            { name: "normal", encoded: "normal=val1" },
        ]);
    });
    (0, bun_test_1.it)("includes params with empty default values", () => {
        const params = [
            {
                name: "empty-default",
                defaultValue: "",
                type: "string",
                ephemeral: false,
                required: false,
            },
        ];
        const covered = new Set();
        (0, bun_test_1.expect)(service.computeExtraParams(params, covered)).toEqual([
            { name: "empty-default", encoded: "empty-default=" },
        ]);
    });
    (0, bun_test_1.it)("CSV-encodes list(string) values containing quotes", () => {
        const params = [
            {
                name: "Select IDEs",
                defaultValue: '["vscode","code-server","cursor"]',
                type: "list(string)",
                ephemeral: false,
                required: false,
            },
        ];
        const covered = new Set();
        // CLI uses CSV parsing, so quotes need escaping: " -> ""
        (0, bun_test_1.expect)(service.computeExtraParams(params, covered)).toEqual([
            { name: "Select IDEs", encoded: '"Select IDEs=[""vscode"",""code-server"",""cursor""]"' },
        ]);
    });
    (0, bun_test_1.it)("passes empty list(string) array without CSV encoding", () => {
        const params = [
            {
                name: "empty-list",
                defaultValue: "[]",
                type: "list(string)",
                ephemeral: false,
                required: false,
            },
        ];
        const covered = new Set();
        // No quotes or commas, so no encoding needed
        (0, bun_test_1.expect)(service.computeExtraParams(params, covered)).toEqual([
            { name: "empty-list", encoded: "empty-list=[]" },
        ]);
    });
});
(0, bun_test_1.describe)("validateRequiredParams", () => {
    let service;
    (0, bun_test_1.beforeEach)(() => {
        service = new coderService_1.CoderService();
    });
    (0, bun_test_1.it)("does not throw when all required params have defaults", () => {
        const params = [
            {
                name: "required-with-default",
                defaultValue: "val",
                type: "string",
                ephemeral: false,
                required: true,
            },
        ];
        const covered = new Set();
        (0, bun_test_1.expect)(() => service.validateRequiredParams(params, covered)).not.toThrow();
    });
    (0, bun_test_1.it)("does not throw when required params are covered by preset", () => {
        const params = [
            {
                name: "required-no-default",
                defaultValue: "",
                type: "string",
                ephemeral: false,
                required: true,
            },
        ];
        const covered = new Set(["required-no-default"]);
        (0, bun_test_1.expect)(() => service.validateRequiredParams(params, covered)).not.toThrow();
    });
    (0, bun_test_1.it)("throws when required param has no default and is not covered", () => {
        const params = [
            { name: "missing-param", defaultValue: "", type: "string", ephemeral: false, required: true },
        ];
        const covered = new Set();
        (0, bun_test_1.expect)(() => service.validateRequiredParams(params, covered)).toThrow("missing-param");
    });
    (0, bun_test_1.it)("ignores ephemeral required params", () => {
        const params = [
            {
                name: "ephemeral-required",
                defaultValue: "",
                type: "string",
                ephemeral: true,
                required: true,
            },
        ];
        const covered = new Set();
        (0, bun_test_1.expect)(() => service.validateRequiredParams(params, covered)).not.toThrow();
    });
    (0, bun_test_1.it)("lists all missing required params in error", () => {
        const params = [
            { name: "missing1", defaultValue: "", type: "string", ephemeral: false, required: true },
            { name: "missing2", defaultValue: "", type: "string", ephemeral: false, required: true },
        ];
        const covered = new Set();
        (0, bun_test_1.expect)(() => service.validateRequiredParams(params, covered)).toThrow(/missing1.*missing2|missing2.*missing1/);
    });
});
(0, bun_test_1.describe)("non-string parameter defaults", () => {
    let service;
    (0, bun_test_1.beforeEach)(() => {
        service = new coderService_1.CoderService();
    });
    (0, bun_test_1.it)("validateRequiredParams passes when required param has numeric default 0", () => {
        // After parseRichParameters, numeric 0 becomes "0" (not "")
        const params = [
            { name: "count", defaultValue: "0", type: "number", ephemeral: false, required: true },
        ];
        const covered = new Set();
        (0, bun_test_1.expect)(() => service.validateRequiredParams(params, covered)).not.toThrow();
    });
    (0, bun_test_1.it)("validateRequiredParams passes when required param has boolean default false", () => {
        // After parseRichParameters, boolean false becomes "false" (not "")
        const params = [
            { name: "enabled", defaultValue: "false", type: "bool", ephemeral: false, required: true },
        ];
        const covered = new Set();
        (0, bun_test_1.expect)(() => service.validateRequiredParams(params, covered)).not.toThrow();
    });
    (0, bun_test_1.it)("computeExtraParams emits numeric default correctly", () => {
        const params = [
            { name: "count", defaultValue: "42", type: "number", ephemeral: false, required: false },
        ];
        const covered = new Set();
        (0, bun_test_1.expect)(service.computeExtraParams(params, covered)).toEqual([
            { name: "count", encoded: "count=42" },
        ]);
    });
    (0, bun_test_1.it)("computeExtraParams emits boolean default correctly", () => {
        const params = [
            { name: "enabled", defaultValue: "true", type: "bool", ephemeral: false, required: false },
        ];
        const covered = new Set();
        (0, bun_test_1.expect)(service.computeExtraParams(params, covered)).toEqual([
            { name: "enabled", encoded: "enabled=true" },
        ]);
    });
    (0, bun_test_1.it)("computeExtraParams emits array default as JSON with CSV encoding", () => {
        // After parseRichParameters, array becomes JSON string
        const params = [
            {
                name: "tags",
                defaultValue: '["a","b"]',
                type: "list(string)",
                ephemeral: false,
                required: false,
            },
        ];
        const covered = new Set();
        // JSON array with quotes gets CSV-encoded (quotes escaped as "")
        (0, bun_test_1.expect)(service.computeExtraParams(params, covered)).toEqual([
            { name: "tags", encoded: '"tags=[""a"",""b""]"' },
        ]);
    });
});
(0, bun_test_1.describe)("deleteWorkspace", () => {
    let service;
    (0, bun_test_1.beforeEach)(() => {
        service = new coderService_1.CoderService();
        bun_test_1.vi.clearAllMocks();
    });
    (0, bun_test_1.afterEach)(() => {
        service.clearCache();
    });
    // deleteWorkspace is a thin wrapper around deleteWorkspaceEventually.
    // Detailed polling/retry behavior is tested in the deleteWorkspaceEventually suite.
    (0, bun_test_1.it)("delegates to deleteWorkspaceEventually with correct options", async () => {
        const spy = (0, bun_test_1.spyOn)(service, "deleteWorkspaceEventually").mockResolvedValue({
            success: true,
            data: undefined,
        });
        await service.deleteWorkspace("mux-my-workspace");
        (0, bun_test_1.expect)(spy).toHaveBeenCalledWith("mux-my-workspace", {
            timeoutMs: 30_000,
            waitForExistence: false,
        });
    });
    (0, bun_test_1.it)("throws when deleteWorkspaceEventually returns an error", async () => {
        (0, bun_test_1.spyOn)(service, "deleteWorkspaceEventually").mockResolvedValue({
            success: false,
            error: "workspace stuck",
        });
        let error;
        try {
            await service.deleteWorkspace("mux-my-workspace");
        }
        catch (err) {
            error = err;
        }
        (0, bun_test_1.expect)(error).toBeInstanceOf(Error);
        (0, bun_test_1.expect)(error.message).toContain("workspace stuck");
    });
});
(0, bun_test_1.describe)("deleteWorkspaceEventually", () => {
    (0, bun_test_1.it)("polls past initial not_found when waitForExistence=true", async () => {
        const service = new coderService_1.CoderService();
        const getWorkspaceStatusSpy = (0, bun_test_1.spyOn)(service, "getWorkspaceStatus");
        const statuses = [
            { kind: "not_found" },
            { kind: "ok", status: "pending" },
            { kind: "ok", status: "deleting" },
        ];
        getWorkspaceStatusSpy.mockImplementation(() => Promise.resolve(statuses.shift() ?? { kind: "ok", status: "deleting" }));
        const serviceHack = service;
        serviceHack.runCoderCommand = bun_test_1.vi.fn(() => Promise.resolve({ exitCode: 0, stdout: "", stderr: "" }));
        serviceHack.sleep = bun_test_1.vi.fn(() => Promise.resolve());
        const result = await service.deleteWorkspaceEventually("mux-my-workspace", {
            timeoutMs: 1_000,
            waitForExistence: true,
        });
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(getWorkspaceStatusSpy.mock.calls.length).toBeGreaterThan(1);
        (0, bun_test_1.expect)(serviceHack.runCoderCommand).toHaveBeenCalled();
    });
    (0, bun_test_1.it)("treats sustained not_found as success after timeout when waitForExistence=true", async () => {
        const service = new coderService_1.CoderService();
        let now = 0;
        const nowSpy = (0, bun_test_1.spyOn)(Date, "now").mockImplementation(() => now);
        const getWorkspaceStatusSpy = (0, bun_test_1.spyOn)(service, "getWorkspaceStatus").mockResolvedValue({
            kind: "not_found",
        });
        const serviceHack = service;
        serviceHack.runCoderCommand = bun_test_1.vi.fn(() => Promise.resolve({ exitCode: 0, stdout: "", stderr: "" }));
        serviceHack.sleep = bun_test_1.vi.fn((ms) => {
            now += ms;
            return Promise.resolve();
        });
        try {
            const result = await service.deleteWorkspaceEventually("mux-my-workspace", {
                timeoutMs: 1_000,
                waitForExistence: true,
            });
            (0, bun_test_1.expect)(result.success).toBe(true);
            (0, bun_test_1.expect)(getWorkspaceStatusSpy).toHaveBeenCalled();
            (0, bun_test_1.expect)(serviceHack.runCoderCommand).not.toHaveBeenCalled();
        }
        finally {
            // Reset Date.now even if the test fails.
            nowSpy.mockRestore();
        }
    });
    (0, bun_test_1.it)("short-circuits on waitForExistenceTimeoutMs before overall timeout", async () => {
        const service = new coderService_1.CoderService();
        let now = 0;
        const nowSpy = (0, bun_test_1.spyOn)(Date, "now").mockImplementation(() => now);
        const getWorkspaceStatusSpy = (0, bun_test_1.spyOn)(service, "getWorkspaceStatus").mockResolvedValue({
            kind: "not_found",
        });
        const serviceHack = service;
        serviceHack.runCoderCommand = bun_test_1.vi.fn(() => Promise.resolve({ exitCode: 0, stdout: "", stderr: "" }));
        serviceHack.sleep = bun_test_1.vi.fn((ms) => {
            now += ms;
            return Promise.resolve();
        });
        try {
            const result = await service.deleteWorkspaceEventually("mux-my-workspace", {
                timeoutMs: 60_000,
                waitForExistence: true,
                // Short existence-wait window: succeed after ~5s of only not_found
                waitForExistenceTimeoutMs: 5_000,
            });
            (0, bun_test_1.expect)(result.success).toBe(true);
            (0, bun_test_1.expect)(getWorkspaceStatusSpy).toHaveBeenCalled();
            // Should never attempt `coder delete` since we only saw not_found
            (0, bun_test_1.expect)(serviceHack.runCoderCommand).not.toHaveBeenCalled();
            // Should have returned well before the 60s overall timeout
            (0, bun_test_1.expect)(now).toBeLessThan(10_000);
        }
        finally {
            nowSpy.mockRestore();
        }
    });
    (0, bun_test_1.it)("treats a successful delete as terminal even if status polling errors", async () => {
        const service = new coderService_1.CoderService();
        (0, bun_test_1.spyOn)(service, "getWorkspaceStatus").mockResolvedValue({
            kind: "error",
            error: "auth failed",
        });
        const serviceHack = service;
        serviceHack.runCoderCommand = bun_test_1.vi.fn(() => Promise.resolve({ exitCode: 0, stdout: "", stderr: "" }));
        serviceHack.sleep = bun_test_1.vi.fn(() => Promise.resolve());
        const result = await service.deleteWorkspaceEventually("mux-my-workspace", {
            timeoutMs: 60_000,
            waitForExistence: false,
        });
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(serviceHack.runCoderCommand).toHaveBeenCalledTimes(1);
        (0, bun_test_1.expect)(serviceHack.sleep).not.toHaveBeenCalled();
    });
    (0, bun_test_1.it)("treats a successful delete as terminal even when waitForExistence=true", async () => {
        const service = new coderService_1.CoderService();
        (0, bun_test_1.spyOn)(service, "getWorkspaceStatus").mockResolvedValue({
            kind: "error",
            error: "auth failed",
        });
        const serviceHack = service;
        serviceHack.runCoderCommand = bun_test_1.vi.fn(() => Promise.resolve({ exitCode: 0, stdout: "", stderr: "" }));
        serviceHack.sleep = bun_test_1.vi.fn(() => Promise.resolve());
        const result = await service.deleteWorkspaceEventually("mux-my-workspace", {
            timeoutMs: 60_000,
            waitForExistence: true,
        });
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(serviceHack.runCoderCommand).toHaveBeenCalledTimes(1);
        (0, bun_test_1.expect)(serviceHack.sleep).not.toHaveBeenCalled();
    });
});
(0, bun_test_1.describe)("compareVersions", () => {
    (0, bun_test_1.it)("returns 0 for equal versions", () => {
        (0, bun_test_1.expect)((0, coderService_1.compareVersions)("2.28.6", "2.28.6")).toBe(0);
    });
    (0, bun_test_1.it)("returns 0 for equal versions with different formats", () => {
        (0, bun_test_1.expect)((0, coderService_1.compareVersions)("v2.28.6", "2.28.6")).toBe(0);
        (0, bun_test_1.expect)((0, coderService_1.compareVersions)("v2.28.6+hash", "2.28.6")).toBe(0);
    });
    (0, bun_test_1.it)("returns negative when first version is older", () => {
        (0, bun_test_1.expect)((0, coderService_1.compareVersions)("2.25.0", "2.28.6")).toBeLessThan(0);
        (0, bun_test_1.expect)((0, coderService_1.compareVersions)("2.28.5", "2.28.6")).toBeLessThan(0);
        (0, bun_test_1.expect)((0, coderService_1.compareVersions)("1.0.0", "2.0.0")).toBeLessThan(0);
    });
    (0, bun_test_1.it)("returns positive when first version is newer", () => {
        (0, bun_test_1.expect)((0, coderService_1.compareVersions)("2.28.6", "2.25.0")).toBeGreaterThan(0);
        (0, bun_test_1.expect)((0, coderService_1.compareVersions)("2.28.6", "2.28.5")).toBeGreaterThan(0);
        (0, bun_test_1.expect)((0, coderService_1.compareVersions)("3.0.0", "2.28.6")).toBeGreaterThan(0);
    });
    (0, bun_test_1.it)("handles versions with v prefix", () => {
        (0, bun_test_1.expect)((0, coderService_1.compareVersions)("v2.28.6", "2.25.0")).toBeGreaterThan(0);
        (0, bun_test_1.expect)((0, coderService_1.compareVersions)("v2.25.0", "v2.28.6")).toBeLessThan(0);
    });
    (0, bun_test_1.it)("handles dev versions correctly", () => {
        // v2.28.2-devel+903c045b9 should be compared as 2.28.2
        (0, bun_test_1.expect)((0, coderService_1.compareVersions)("v2.28.2-devel+903c045b9", "2.25.0")).toBeGreaterThan(0);
        (0, bun_test_1.expect)((0, coderService_1.compareVersions)("v2.28.2-devel+903c045b9", "2.28.2")).toBe(0);
    });
    (0, bun_test_1.it)("handles missing patch version", () => {
        (0, bun_test_1.expect)((0, coderService_1.compareVersions)("2.28", "2.28.0")).toBe(0);
        (0, bun_test_1.expect)((0, coderService_1.compareVersions)("2.28", "2.28.1")).toBeLessThan(0);
    });
});
//# sourceMappingURL=coderService.test.js.map