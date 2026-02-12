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
const compactionHandler_1 = require("./compactionHandler");
const testHistoryService_1 = require("./testHistoryService");
const fsPromises = __importStar(require("fs/promises"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const message_1 = require("../../common/types/message");
const result_1 = require("../../common/types/result");
const createMockPartialService = () => {
    let deletePartialResult = (0, result_1.Ok)(undefined);
    const deletePartial = (0, bun_test_1.mock)((_) => Promise.resolve(deletePartialResult));
    const readPartial = (0, bun_test_1.mock)((_) => Promise.resolve(null));
    const writePartial = (0, bun_test_1.mock)((_, __) => Promise.resolve((0, result_1.Ok)(undefined)));
    const commitToHistory = (0, bun_test_1.mock)((_) => Promise.resolve((0, result_1.Ok)(undefined)));
    return {
        deletePartial,
        readPartial,
        writePartial,
        commitToHistory,
        // Allow setting mock return values
        mockDeletePartial: (result) => {
            deletePartialResult = result;
        },
    };
};
const createMockEmitter = () => {
    const events = [];
    const emitter = {
        emit: (_event, data) => {
            events.push({ event: _event, data });
            return true;
        },
    };
    return { emitter: emitter, events };
};
const createCompactionRequest = (id = "req-1") => (0, message_1.createMuxMessage)(id, "user", "Please summarize the conversation", {
    historySequence: 0,
    muxMetadata: { type: "compaction-request", rawCommand: "/compact", parsed: {} },
});
const createSuccessfulFileEditMessage = (id, filePath, diff, metadata) => ({
    id,
    role: "assistant",
    parts: [
        {
            type: "dynamic-tool",
            toolCallId: `tool-${id}`,
            toolName: "file_edit_replace_string",
            state: "output-available",
            input: { file_path: filePath },
            output: { success: true, diff },
        },
    ],
    metadata: {
        timestamp: 1234,
        ...(metadata ?? {}),
    },
});
const createStreamEndEvent = (summary, metadata) => ({
    type: "stream-end",
    workspaceId: "test-workspace",
    messageId: "msg-id",
    parts: [{ type: "text", text: summary }],
    metadata: {
        model: "claude-3-5-sonnet-20241022",
        usage: { inputTokens: 100, outputTokens: 50, totalTokens: undefined },
        duration: 1500,
        ...metadata,
    },
});
const getEmittedStreamEndEvent = (events) => {
    return events
        .map((event) => event.data.message)
        .find((message) => {
        return (typeof message === "object" &&
            message !== null &&
            "type" in message &&
            message.type === "stream-end");
    });
};
(0, bun_test_1.describe)("CompactionHandler", () => {
    let handler;
    let historyService;
    let cleanup;
    let mockPartialService;
    let mockEmitter;
    let telemetryCapture;
    let telemetryService;
    let sessionDir;
    let emittedEvents;
    const workspaceId = "test-workspace";
    // Helper: seed messages into real history and return spies for tracking handler calls.
    // Spies are created AFTER seeding so they only track handler-initiated calls.
    const seedHistory = async (...messages) => {
        for (const msg of messages) {
            const result = await historyService.appendToHistory(workspaceId, msg);
            if (!result.success)
                throw new Error(`Seed failed: ${result.error}`);
        }
        return {
            appendSpy: (0, bun_test_1.spyOn)(historyService, "appendToHistory"),
            clearSpy: (0, bun_test_1.spyOn)(historyService, "clearHistory"),
            updateSpy: (0, bun_test_1.spyOn)(historyService, "updateHistory"),
        };
    };
    (0, bun_test_1.beforeEach)(async () => {
        const testHistory = await (0, testHistoryService_1.createTestHistoryService)();
        historyService = testHistory.historyService;
        cleanup = testHistory.cleanup;
        const { emitter, events } = createMockEmitter();
        mockEmitter = emitter;
        emittedEvents = events;
        telemetryCapture = (0, bun_test_1.mock)((_payload) => {
            void _payload;
        });
        telemetryService = { capture: telemetryCapture };
        sessionDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "mux-compaction-handler-"));
        mockPartialService = createMockPartialService();
        handler = new compactionHandler_1.CompactionHandler({
            workspaceId,
            historyService,
            partialService: mockPartialService,
            sessionDir,
            telemetryService,
            emitter: mockEmitter,
        });
    });
    (0, bun_test_1.afterEach)(async () => {
        await cleanup();
    });
    (0, bun_test_1.describe)("handleCompletion() - Normal Compaction Flow", () => {
        (0, bun_test_1.it)("should return false when no compaction request found", async () => {
            const normalMsg = (0, message_1.createMuxMessage)("msg1", "user", "Hello", {
                historySequence: 0,
                muxMetadata: { type: "normal" },
            });
            const { clearSpy } = await seedHistory(normalMsg);
            const event = createStreamEndEvent("Summary");
            const result = await handler.handleCompletion(event);
            (0, bun_test_1.expect)(result).toBe(false);
            (0, bun_test_1.expect)(clearSpy.mock.calls).toHaveLength(0);
        });
        (0, bun_test_1.it)("should return false when historyService fails", async () => {
            (0, bun_test_1.spyOn)(historyService, "getLastMessages").mockResolvedValueOnce((0, result_1.Err)("Database error"));
            const event = createStreamEndEvent("Summary");
            const result = await handler.handleCompletion(event);
            (0, bun_test_1.expect)(result).toBe(false);
        });
        (0, bun_test_1.it)("should capture compaction_completed telemetry on successful compaction", async () => {
            const compactionReq = createCompactionRequest();
            await seedHistory(compactionReq);
            const event = createStreamEndEvent("Summary", {
                duration: 1500,
                // Prefer contextUsage (context size) over total usage.
                contextUsage: { inputTokens: 1000, outputTokens: 333, totalTokens: undefined },
            });
            await handler.handleCompletion(event);
            (0, bun_test_1.expect)(telemetryCapture.mock.calls).toHaveLength(1);
            const payload = telemetryCapture.mock.calls[0][0];
            (0, bun_test_1.expect)(payload.event).toBe("compaction_completed");
            if (payload.event !== "compaction_completed") {
                throw new Error("Expected compaction_completed payload");
            }
            (0, bun_test_1.expect)(payload.properties).toEqual({
                model: "claude-3-5-sonnet-20241022",
                // 1.5s -> 2
                duration_b2: 2,
                // 1000 -> 1024
                input_tokens_b2: 1024,
                // 333 -> 512
                output_tokens_b2: 512,
                compaction_source: "manual",
            });
        });
        (0, bun_test_1.it)("persists pending diffs to disk and reloads them on restart", async () => {
            const compactionReq = createCompactionRequest();
            const fileEditMessage = createSuccessfulFileEditMessage("assistant-edit", "/tmp/foo.ts", "@@ -1 +1 @@\n-foo\n+bar\n");
            await seedHistory(fileEditMessage, compactionReq);
            const event = createStreamEndEvent("Summary");
            const handled = await handler.handleCompletion(event);
            (0, bun_test_1.expect)(handled).toBe(true);
            const persistedPath = path.join(sessionDir, "post-compaction.json");
            const raw = await fsPromises.readFile(persistedPath, "utf-8");
            const parsed = JSON.parse(raw);
            (0, bun_test_1.expect)(parsed.version).toBe(1);
            const diffs = parsed.diffs;
            (0, bun_test_1.expect)(Array.isArray(diffs)).toBe(true);
            if (Array.isArray(diffs)) {
                (0, bun_test_1.expect)(diffs[0]?.path).toBe("/tmp/foo.ts");
                (0, bun_test_1.expect)(diffs[0]?.diff).toContain("@@ -1 +1 @@");
            }
            // Simulate a restart: create a new handler and load from disk.
            const { emitter: newEmitter } = createMockEmitter();
            const reloaded = new compactionHandler_1.CompactionHandler({
                workspaceId,
                historyService,
                partialService: mockPartialService,
                sessionDir,
                telemetryService,
                emitter: newEmitter,
            });
            const pending = await reloaded.peekPendingDiffs();
            (0, bun_test_1.expect)(pending).not.toBeNull();
            (0, bun_test_1.expect)(pending?.[0]?.path).toBe("/tmp/foo.ts");
            await reloaded.ackPendingDiffsConsumed();
            let exists = true;
            try {
                await fsPromises.stat(persistedPath);
            }
            catch {
                exists = false;
            }
            (0, bun_test_1.expect)(exists).toBe(false);
        });
        (0, bun_test_1.it)("persists only latest-epoch diffs when a durable compaction boundary exists", async () => {
            const staleEditMessage = createSuccessfulFileEditMessage("assistant-stale-edit", "/tmp/stale.ts", "@@ -1 +1 @@\n-old\n+stale\n", { historySequence: 0 });
            const latestBoundary = (0, message_1.createMuxMessage)("summary-boundary", "assistant", "Older summary", {
                historySequence: 1,
                compacted: "user",
                compactionBoundary: true,
                compactionEpoch: 1,
            });
            const recentEditMessage = createSuccessfulFileEditMessage("assistant-recent-edit", "/tmp/recent.ts", "@@ -1 +1 @@\n-before\n+after\n", { historySequence: 2 });
            const compactionReq = (0, message_1.createMuxMessage)("req-latest-epoch", "user", "Please summarize", {
                historySequence: 3,
                muxMetadata: { type: "compaction-request", rawCommand: "/compact", parsed: {} },
            });
            await seedHistory(staleEditMessage, latestBoundary, recentEditMessage, compactionReq);
            const handled = await handler.handleCompletion(createStreamEndEvent("Summary"));
            (0, bun_test_1.expect)(handled).toBe(true);
            const pending = await handler.peekPendingDiffs();
            (0, bun_test_1.expect)(pending?.map((diff) => diff.path)).toEqual(["/tmp/recent.ts"]);
            const persistedPath = path.join(sessionDir, "post-compaction.json");
            const raw = await fsPromises.readFile(persistedPath, "utf-8");
            const parsed = JSON.parse(raw);
            (0, bun_test_1.expect)(parsed.diffs?.map((diff) => diff.path)).toEqual(["/tmp/recent.ts"]);
        });
        (0, bun_test_1.it)("falls back to full-history diff extraction when boundary marker is malformed", async () => {
            const staleEditMessage = createSuccessfulFileEditMessage("assistant-stale-edit", "/tmp/stale.ts", "@@ -1 +1 @@\n-old\n+stale\n", { historySequence: 0 });
            const malformedBoundaryMissingEpoch = (0, message_1.createMuxMessage)("summary-malformed-boundary", "assistant", "Malformed summary", {
                historySequence: 1,
                compacted: "user",
                compactionBoundary: true,
                // Missing compactionEpoch should be treated as malformed and ignored.
            });
            const recentEditMessage = createSuccessfulFileEditMessage("assistant-recent-edit", "/tmp/recent.ts", "@@ -1 +1 @@\n-before\n+after\n", { historySequence: 2 });
            const compactionReq = (0, message_1.createMuxMessage)("req-malformed-boundary", "user", "Please summarize", {
                historySequence: 3,
                muxMetadata: { type: "compaction-request", rawCommand: "/compact", parsed: {} },
            });
            await seedHistory(staleEditMessage, malformedBoundaryMissingEpoch, recentEditMessage, compactionReq);
            const handled = await handler.handleCompletion(createStreamEndEvent("Summary"));
            (0, bun_test_1.expect)(handled).toBe(true);
            const pending = await handler.peekPendingDiffs();
            (0, bun_test_1.expect)(pending?.map((diff) => diff.path)).toEqual(["/tmp/recent.ts", "/tmp/stale.ts"]);
            const persistedPath = path.join(sessionDir, "post-compaction.json");
            const raw = await fsPromises.readFile(persistedPath, "utf-8");
            const parsed = JSON.parse(raw);
            (0, bun_test_1.expect)(parsed.diffs?.map((diff) => diff.path)).toEqual(["/tmp/recent.ts", "/tmp/stale.ts"]);
        });
        (0, bun_test_1.it)("should return true when successful", async () => {
            const compactionReq = createCompactionRequest();
            await seedHistory(compactionReq);
            const event = createStreamEndEvent("Complete summary");
            const result = await handler.handleCompletion(event);
            (0, bun_test_1.expect)(result).toBe(true);
        });
        (0, bun_test_1.it)("should join multiple text parts from event.parts", async () => {
            const compactionReq = createCompactionRequest();
            const { appendSpy } = await seedHistory(compactionReq);
            // Create event with multiple text parts
            const event = {
                type: "stream-end",
                workspaceId: "test-workspace",
                messageId: "msg-id",
                parts: [
                    { type: "text", text: "Part 1 " },
                    { type: "text", text: "Part 2 " },
                    { type: "text", text: "Part 3" },
                ],
                metadata: {
                    model: "claude-3-5-sonnet-20241022",
                    usage: { inputTokens: 100, outputTokens: 50, totalTokens: undefined },
                    duration: 1500,
                },
            };
            await handler.handleCompletion(event);
            const appendedMsg = appendSpy.mock.calls[0][1];
            (0, bun_test_1.expect)(appendedMsg.parts[0].text).toBe("Part 1 Part 2 Part 3");
        });
        (0, bun_test_1.it)("should extract summary text from event.parts", async () => {
            const compactionReq = createCompactionRequest();
            const { appendSpy } = await seedHistory(compactionReq);
            const event = createStreamEndEvent("This is the summary");
            await handler.handleCompletion(event);
            const appendedMsg = appendSpy.mock.calls[0][1];
            (0, bun_test_1.expect)(appendedMsg.parts[0].text).toBe("This is the summary");
        });
        (0, bun_test_1.it)("should delete partial.json before appending summary (race condition fix)", async () => {
            const compactionReq = createCompactionRequest();
            await seedHistory(compactionReq);
            const event = createStreamEndEvent("Summary");
            await handler.handleCompletion(event);
            // deletePartial should be called once before appendToHistory
            (0, bun_test_1.expect)(mockPartialService.deletePartial.mock.calls).toHaveLength(1);
            (0, bun_test_1.expect)(mockPartialService.deletePartial.mock.calls[0][0]).toBe(workspaceId);
            // Verify deletePartial was called (we can't easily verify order without more complex mocking,
            // but the important thing is that it IS called during compaction)
        });
        (0, bun_test_1.it)("should append summary without clearing history", async () => {
            const compactionReq = createCompactionRequest();
            const { appendSpy, clearSpy } = await seedHistory(compactionReq);
            const event = createStreamEndEvent("Summary");
            await handler.handleCompletion(event);
            (0, bun_test_1.expect)(clearSpy.mock.calls).toHaveLength(0);
            (0, bun_test_1.expect)(appendSpy.mock.calls).toHaveLength(1);
            (0, bun_test_1.expect)(appendSpy.mock.calls[0][0]).toBe(workspaceId);
            const appendedMsg = appendSpy.mock.calls[0][1];
            (0, bun_test_1.expect)(appendedMsg.role).toBe("assistant");
            (0, bun_test_1.expect)(appendedMsg.parts[0].text).toBe("Summary");
        });
        (0, bun_test_1.it)("should not emit delete events when compaction is append-only", async () => {
            const compactionReq = createCompactionRequest();
            await seedHistory(compactionReq);
            const event = createStreamEndEvent("Summary");
            await handler.handleCompletion(event);
            const deleteEvent = emittedEvents.find((_e) => _e.data.message?.type === "delete");
            (0, bun_test_1.expect)(deleteEvent).toBeUndefined();
        });
        (0, bun_test_1.it)("should emit summary message with complete metadata", async () => {
            const compactionReq = createCompactionRequest();
            await seedHistory(compactionReq);
            const usage = { inputTokens: 200, outputTokens: 100, totalTokens: 300 };
            const event = createStreamEndEvent("Summary", {
                model: "claude-3-5-sonnet-20241022",
                usage,
                duration: 2000,
                providerMetadata: { anthropic: { cacheCreationInputTokens: 50000 } },
                systemMessageTokens: 100,
            });
            await handler.handleCompletion(event);
            const summaryEvent = emittedEvents.find((_e) => {
                const m = _e.data.message;
                return m?.role === "assistant" && m?.parts !== undefined;
            });
            (0, bun_test_1.expect)(summaryEvent).toBeDefined();
            const sevt = summaryEvent?.data.message;
            // providerMetadata is omitted to avoid inflating context with pre-compaction cacheCreationInputTokens
            (0, bun_test_1.expect)(sevt.metadata).toMatchObject({
                model: "claude-3-5-sonnet-20241022",
                usage,
                duration: 2000,
                systemMessageTokens: 100,
                compacted: "user",
                compactionBoundary: true,
                compactionEpoch: 1,
            });
            (0, bun_test_1.expect)(sevt.metadata?.providerMetadata).toBeUndefined();
        });
        (0, bun_test_1.it)("should emit stream-end event to frontend", async () => {
            const compactionReq = createCompactionRequest();
            await seedHistory(compactionReq);
            const event = createStreamEndEvent("Summary", { duration: 1234 });
            await handler.handleCompletion(event);
            const streamMsg = getEmittedStreamEndEvent(emittedEvents);
            (0, bun_test_1.expect)(streamMsg).toBeDefined();
            (0, bun_test_1.expect)(streamMsg?.workspaceId).toBe(workspaceId);
            (0, bun_test_1.expect)(streamMsg?.metadata.duration).toBe(1234);
        });
        (0, bun_test_1.it)("should set boundary metadata and keep historySequence monotonic", async () => {
            const priorMessage = (0, message_1.createMuxMessage)("user-1", "user", "Earlier", {
                historySequence: 4,
            });
            const compactionReq = (0, message_1.createMuxMessage)("req-1", "user", "Please summarize", {
                historySequence: 5,
                muxMetadata: { type: "compaction-request", rawCommand: "/compact", parsed: {} },
            });
            const { appendSpy } = await seedHistory(priorMessage, compactionReq);
            const event = createStreamEndEvent("Summary");
            await handler.handleCompletion(event);
            const appendedMsg = appendSpy.mock.calls[0][1];
            (0, bun_test_1.expect)(appendedMsg.metadata?.compacted).toBe("user");
            (0, bun_test_1.expect)(appendedMsg.metadata?.compactionBoundary).toBe(true);
            (0, bun_test_1.expect)(appendedMsg.metadata?.compactionEpoch).toBe(1);
            (0, bun_test_1.expect)(appendedMsg.metadata?.historySequence).toBe(6);
        });
        (0, bun_test_1.it)("should ignore malformed persisted historySequence values when deriving monotonic bounds", async () => {
            const malformedNegativeSequence = (0, message_1.createMuxMessage)("assistant-malformed-negative-sequence", "assistant", "Corrupted persisted metadata", {
                historySequence: -7,
            });
            const malformedFractionalSequence = (0, message_1.createMuxMessage)("assistant-malformed-fractional-sequence", "assistant", "Corrupted persisted metadata", {
                historySequence: 99.5,
            });
            const priorMessage = (0, message_1.createMuxMessage)("user-1", "user", "Earlier", {
                historySequence: 4,
            });
            const compactionReq = (0, message_1.createMuxMessage)("req-1", "user", "Please summarize", {
                historySequence: 5,
                muxMetadata: { type: "compaction-request", rawCommand: "/compact", parsed: {} },
            });
            // Seed valid messages so the service's sequence counter advances to 6,
            // then mock getLastMessages to inject the malformed messages alongside them.
            // The malformed historySequence values (-7, 99.5) would fail real appendToHistory assertions,
            // so they can only be introduced via the mocked read path.
            await historyService.appendToHistory(workspaceId, priorMessage);
            await historyService.appendToHistory(workspaceId, compactionReq);
            (0, bun_test_1.spyOn)(historyService, "getLastMessages").mockResolvedValueOnce((0, result_1.Ok)([malformedNegativeSequence, malformedFractionalSequence, priorMessage, compactionReq]));
            const appendSpy = (0, bun_test_1.spyOn)(historyService, "appendToHistory");
            const event = createStreamEndEvent("Summary");
            const result = await handler.handleCompletion(event);
            (0, bun_test_1.expect)(result).toBe(true);
            (0, bun_test_1.expect)(appendSpy.mock.calls).toHaveLength(1);
            const appendedMsg = appendSpy.mock.calls[0][1];
            (0, bun_test_1.expect)(appendedMsg.metadata?.historySequence).toBe(6);
            (0, bun_test_1.expect)(appendedMsg.metadata?.compactionBoundary).toBe(true);
            (0, bun_test_1.expect)(appendedMsg.metadata?.compactionEpoch).toBe(1);
        });
        (0, bun_test_1.it)("should derive next compaction epoch from legacy compacted summaries", async () => {
            const legacySummary = (0, message_1.createMuxMessage)("summary-legacy", "assistant", "Older summary", {
                historySequence: 2,
                compacted: "user",
            });
            const compactionReq = (0, message_1.createMuxMessage)("req-epoch", "user", "Please summarize", {
                historySequence: 3,
                muxMetadata: { type: "compaction-request", rawCommand: "/compact", parsed: {} },
            });
            const { appendSpy } = await seedHistory(legacySummary, compactionReq);
            const event = createStreamEndEvent("Summary");
            await handler.handleCompletion(event);
            const appendedMsg = appendSpy.mock.calls[0][1];
            (0, bun_test_1.expect)(appendedMsg.metadata?.compactionEpoch).toBe(2);
            (0, bun_test_1.expect)(appendedMsg.metadata?.compactionBoundary).toBe(true);
            (0, bun_test_1.expect)(appendedMsg.metadata?.historySequence).toBe(4);
        });
        (0, bun_test_1.it)("should update streamed summaries in-place without carrying stale provider metadata", async () => {
            const compactionReq = (0, message_1.createMuxMessage)("req-streamed", "user", "Please summarize", {
                historySequence: 5,
                muxMetadata: { type: "compaction-request", rawCommand: "/compact", parsed: {} },
            });
            const streamedSummary = (0, message_1.createMuxMessage)("msg-id", "assistant", "Summary", {
                historySequence: 6,
                timestamp: Date.now(),
                model: "claude-3-5-sonnet-20241022",
                providerMetadata: { anthropic: { cacheCreationInputTokens: 50_000 } },
                contextProviderMetadata: { anthropic: { cacheReadInputTokens: 10_000 } },
            });
            const { appendSpy, updateSpy } = await seedHistory(compactionReq, streamedSummary);
            const event = createStreamEndEvent("Summary");
            const result = await handler.handleCompletion(event);
            (0, bun_test_1.expect)(result).toBe(true);
            (0, bun_test_1.expect)(updateSpy.mock.calls).toHaveLength(1);
            (0, bun_test_1.expect)(appendSpy.mock.calls).toHaveLength(0);
            const updatedSummary = updateSpy.mock.calls[0][1];
            (0, bun_test_1.expect)(updatedSummary.id).toBe("msg-id");
            (0, bun_test_1.expect)(updatedSummary.metadata?.historySequence).toBe(6);
            (0, bun_test_1.expect)(updatedSummary.metadata?.compactionBoundary).toBe(true);
            (0, bun_test_1.expect)(updatedSummary.metadata?.compactionEpoch).toBe(1);
            (0, bun_test_1.expect)(updatedSummary.metadata?.providerMetadata).toBeUndefined();
            (0, bun_test_1.expect)(updatedSummary.metadata?.contextProviderMetadata).toBeUndefined();
            const summaryEvent = emittedEvents.find((_e) => {
                const m = _e.data.message;
                return m?.id === "msg-id" && m?.metadata?.compactionBoundary === true;
            });
            (0, bun_test_1.expect)(summaryEvent).toBeDefined();
        });
        (0, bun_test_1.it)("should strip stale provider metadata from emitted stream-end when reusing streamed summary ID", async () => {
            const compactionReq = (0, message_1.createMuxMessage)("req-streamed-sanitize", "user", "Please summarize", {
                historySequence: 5,
                muxMetadata: { type: "compaction-request", rawCommand: "/compact", parsed: {} },
            });
            const streamedSummary = (0, message_1.createMuxMessage)("msg-id", "assistant", "Summary", {
                historySequence: 6,
                timestamp: Date.now(),
                model: "claude-3-5-sonnet-20241022",
            });
            await seedHistory(compactionReq, streamedSummary);
            const event = createStreamEndEvent("Summary", {
                providerMetadata: { anthropic: { cacheCreationInputTokens: 50_000 } },
                contextProviderMetadata: { anthropic: { cacheReadInputTokens: 10_000 } },
                customField: "preserved",
            });
            const result = await handler.handleCompletion(event);
            (0, bun_test_1.expect)(result).toBe(true);
            const streamMsg = getEmittedStreamEndEvent(emittedEvents);
            (0, bun_test_1.expect)(streamMsg).toBeDefined();
            (0, bun_test_1.expect)(streamMsg?.messageId).toBe("msg-id");
            (0, bun_test_1.expect)(streamMsg?.metadata.providerMetadata).toBeUndefined();
            (0, bun_test_1.expect)(streamMsg?.metadata.contextProviderMetadata).toBeUndefined();
            (0, bun_test_1.expect)(streamMsg?.metadata?.customField).toBe("preserved");
        });
        (0, bun_test_1.it)("should skip malformed compaction boundary markers when deriving next epoch", async () => {
            const validBoundary = (0, message_1.createMuxMessage)("summary-valid", "assistant", "Valid summary", {
                historySequence: 1,
                compacted: "user",
                compactionBoundary: true,
                compactionEpoch: 3,
            });
            const malformedBoundaryMissingEpoch = (0, message_1.createMuxMessage)("summary-malformed-1", "assistant", "Malformed boundary", {
                historySequence: 2,
                compacted: "user",
                compactionBoundary: true,
            });
            const malformedBoundaryMissingCompacted = (0, message_1.createMuxMessage)("summary-malformed-2", "assistant", "Malformed boundary", {
                historySequence: 3,
                compactionBoundary: true,
                compactionEpoch: 99,
            });
            const malformedBoundaryInvalidCompacted = (0, message_1.createMuxMessage)("summary-malformed-invalid-compacted", "assistant", "Malformed boundary", {
                historySequence: 4,
                compactionBoundary: true,
                compactionEpoch: 200,
            });
            if (malformedBoundaryInvalidCompacted.metadata) {
                malformedBoundaryInvalidCompacted.metadata.compacted =
                    "corrupted";
            }
            const malformedBoundaryInvalidEpoch = (0, message_1.createMuxMessage)("summary-malformed-3", "assistant", "Malformed boundary", {
                historySequence: 4,
                compacted: "user",
                compactionBoundary: true,
                compactionEpoch: 0,
            });
            const compactionReq = (0, message_1.createMuxMessage)("req-malformed", "user", "Please summarize", {
                historySequence: 5,
                muxMetadata: { type: "compaction-request", rawCommand: "/compact", parsed: {} },
            });
            const { appendSpy } = await seedHistory(validBoundary, malformedBoundaryMissingEpoch, malformedBoundaryMissingCompacted, malformedBoundaryInvalidCompacted, malformedBoundaryInvalidEpoch, compactionReq);
            const result = await handler.handleCompletion(createStreamEndEvent("Summary"));
            (0, bun_test_1.expect)(result).toBe(true);
            (0, bun_test_1.expect)(appendSpy.mock.calls).toHaveLength(1);
            const appendedMsg = appendSpy.mock.calls[0][1];
            (0, bun_test_1.expect)(appendedMsg.metadata?.compactionEpoch).toBe(4);
            (0, bun_test_1.expect)(appendedMsg.metadata?.compactionBoundary).toBe(true);
        });
    });
    (0, bun_test_1.describe)("handleCompletion() - Deduplication", () => {
        (0, bun_test_1.it)("should track processed compaction-request IDs", async () => {
            const compactionReq = createCompactionRequest("req-unique");
            const { appendSpy, clearSpy } = await seedHistory(compactionReq);
            const event = createStreamEndEvent("Summary");
            await handler.handleCompletion(event);
            (0, bun_test_1.expect)(clearSpy.mock.calls).toHaveLength(0);
            (0, bun_test_1.expect)(appendSpy.mock.calls).toHaveLength(1);
        });
        (0, bun_test_1.it)("should return true without re-processing when same request ID seen twice", async () => {
            const compactionReq = createCompactionRequest("req-dupe");
            const { appendSpy, clearSpy } = await seedHistory(compactionReq);
            const event = createStreamEndEvent("Summary");
            const result1 = await handler.handleCompletion(event);
            const result2 = await handler.handleCompletion(event);
            (0, bun_test_1.expect)(result1).toBe(true);
            (0, bun_test_1.expect)(result2).toBe(true);
            (0, bun_test_1.expect)(clearSpy.mock.calls).toHaveLength(0);
            (0, bun_test_1.expect)(appendSpy.mock.calls).toHaveLength(1);
        });
        (0, bun_test_1.it)("should not emit duplicate events", async () => {
            const compactionReq = createCompactionRequest("req-dupe-2");
            await seedHistory(compactionReq);
            const event = createStreamEndEvent("Summary");
            await handler.handleCompletion(event);
            const eventCountAfterFirst = emittedEvents.length;
            await handler.handleCompletion(event);
            const eventCountAfterSecond = emittedEvents.length;
            (0, bun_test_1.expect)(eventCountAfterSecond).toBe(eventCountAfterFirst);
        });
        (0, bun_test_1.it)("should not append summary twice", async () => {
            const compactionReq = createCompactionRequest("req-dupe-3");
            const { appendSpy, clearSpy } = await seedHistory(compactionReq);
            const event = createStreamEndEvent("Summary");
            await handler.handleCompletion(event);
            await handler.handleCompletion(event);
            (0, bun_test_1.expect)(clearSpy.mock.calls).toHaveLength(0);
            (0, bun_test_1.expect)(appendSpy.mock.calls).toHaveLength(1);
        });
    });
    (0, bun_test_1.describe)("Error Handling", () => {
        (0, bun_test_1.it)("should return false when appendToHistory() fails", async () => {
            const compactionReq = createCompactionRequest();
            const { appendSpy } = await seedHistory(compactionReq);
            appendSpy.mockResolvedValueOnce((0, result_1.Err)("Append failed"));
            const event = createStreamEndEvent("Summary");
            const result = await handler.handleCompletion(event);
            (0, bun_test_1.expect)(result).toBe(false);
            // Ensure we don't keep a persisted snapshot when summary append fails.
            const persistedPath = path.join(sessionDir, "post-compaction.json");
            let exists = true;
            try {
                await fsPromises.stat(persistedPath);
            }
            catch {
                exists = false;
            }
            (0, bun_test_1.expect)(exists).toBe(false);
        });
        (0, bun_test_1.it)("should log errors but not throw", async () => {
            const compactionReq = createCompactionRequest();
            const { appendSpy } = await seedHistory(compactionReq);
            appendSpy.mockResolvedValueOnce((0, result_1.Err)("Database corruption"));
            const event = createStreamEndEvent("Summary");
            // Should not throw
            const result = await handler.handleCompletion(event);
            (0, bun_test_1.expect)(result).toBe(false);
        });
        (0, bun_test_1.it)("should not emit events when compaction fails mid-process", async () => {
            const compactionReq = createCompactionRequest();
            const { appendSpy } = await seedHistory(compactionReq);
            appendSpy.mockResolvedValueOnce((0, result_1.Err)("Append failed"));
            const event = createStreamEndEvent("Summary");
            await handler.handleCompletion(event);
            (0, bun_test_1.expect)(emittedEvents).toHaveLength(0);
        });
    });
    (0, bun_test_1.describe)("Event Emission", () => {
        (0, bun_test_1.it)("should include workspaceId in all chat-event emissions", async () => {
            const compactionReq = createCompactionRequest();
            await seedHistory(compactionReq);
            const event = createStreamEndEvent("Summary");
            await handler.handleCompletion(event);
            const chatEvents = emittedEvents.filter((e) => e.event === "chat-event");
            (0, bun_test_1.expect)(chatEvents.length).toBeGreaterThan(0);
            chatEvents.forEach((e) => {
                (0, bun_test_1.expect)(e.data.workspaceId).toBe(workspaceId);
            });
        });
        (0, bun_test_1.it)("should not emit DeleteMessage events during append-only compaction", async () => {
            const compactionReq = createCompactionRequest();
            await seedHistory(compactionReq);
            const event = createStreamEndEvent("Summary");
            await handler.handleCompletion(event);
            const deleteEvent = emittedEvents.find((_e) => _e.data.message?.type === "delete");
            (0, bun_test_1.expect)(deleteEvent).toBeUndefined();
        });
        (0, bun_test_1.it)("should emit summary message with proper MuxMessage structure", async () => {
            const compactionReq = createCompactionRequest();
            await seedHistory(compactionReq);
            const event = createStreamEndEvent("Summary text");
            await handler.handleCompletion(event);
            const summaryEvent = emittedEvents.find((_e) => {
                const m = _e.data.message;
                return m?.role === "assistant" && m?.parts !== undefined;
            });
            (0, bun_test_1.expect)(summaryEvent).toBeDefined();
            const summaryMsg = summaryEvent?.data.message;
            (0, bun_test_1.expect)(summaryMsg).toMatchObject({
                id: bun_test_1.expect.stringContaining("summary-"),
                role: "assistant",
                parts: [{ type: "text", text: "Summary text" }],
                metadata: bun_test_1.expect.objectContaining({
                    compacted: "user",
                    compactionBoundary: true,
                    compactionEpoch: 1,
                    muxMetadata: { type: "compaction-summary" },
                }),
            });
        });
        (0, bun_test_1.it)("should forward stream events (stream-end, stream-abort) correctly", async () => {
            const compactionReq = createCompactionRequest();
            await seedHistory(compactionReq);
            const event = createStreamEndEvent("Summary", { customField: "test" });
            await handler.handleCompletion(event);
            const streamMsg = getEmittedStreamEndEvent(emittedEvents);
            (0, bun_test_1.expect)(streamMsg).toBeDefined();
            (0, bun_test_1.expect)(streamMsg?.metadata?.customField).toBe("test");
        });
    });
    (0, bun_test_1.describe)("Idle Compaction", () => {
        (0, bun_test_1.it)("should preserve original recency timestamp from last user message", async () => {
            const originalTimestamp = Date.now() - 3600 * 1000; // 1 hour ago
            const userMessage = (0, message_1.createMuxMessage)("user-1", "user", "Hello", {
                timestamp: originalTimestamp,
                historySequence: 0,
            });
            const idleCompactionReq = (0, message_1.createMuxMessage)("req-1", "user", "Summarize", {
                historySequence: 1,
                muxMetadata: {
                    type: "compaction-request",
                    source: "idle-compaction",
                    rawCommand: "/compact",
                    parsed: {},
                },
            });
            await seedHistory(userMessage, idleCompactionReq);
            const event = createStreamEndEvent("Summary");
            await handler.handleCompletion(event);
            const summaryEvent = emittedEvents.find((_e) => {
                const m = _e.data.message;
                return m?.role === "assistant" && m?.metadata?.compacted;
            });
            (0, bun_test_1.expect)(summaryEvent).toBeDefined();
            const summaryMsg = summaryEvent?.data.message;
            (0, bun_test_1.expect)(summaryMsg.metadata?.timestamp).toBe(originalTimestamp);
            (0, bun_test_1.expect)(summaryMsg.metadata?.compacted).toBe("idle");
        });
        (0, bun_test_1.it)("should preserve recency from last compacted message if no user message", async () => {
            const compactedTimestamp = Date.now() - 7200 * 1000; // 2 hours ago
            const compactedMessage = (0, message_1.createMuxMessage)("compacted-1", "assistant", "Previous summary", {
                timestamp: compactedTimestamp,
                compacted: "user",
                historySequence: 0,
            });
            const idleCompactionReq = (0, message_1.createMuxMessage)("req-1", "user", "Summarize", {
                historySequence: 1,
                muxMetadata: {
                    type: "compaction-request",
                    source: "idle-compaction",
                    rawCommand: "/compact",
                    parsed: {},
                },
            });
            await seedHistory(compactedMessage, idleCompactionReq);
            const event = createStreamEndEvent("Summary");
            await handler.handleCompletion(event);
            const summaryEvent = emittedEvents.find((_e) => {
                const m = _e.data.message;
                return m?.role === "assistant" && m?.metadata?.compacted === "idle";
            });
            (0, bun_test_1.expect)(summaryEvent).toBeDefined();
            const summaryMsg = summaryEvent?.data.message;
            (0, bun_test_1.expect)(summaryMsg.metadata?.timestamp).toBe(compactedTimestamp);
        });
        (0, bun_test_1.it)("should use max of user and compacted timestamps", async () => {
            const olderCompactedTimestamp = Date.now() - 7200 * 1000; // 2 hours ago
            const newerUserTimestamp = Date.now() - 3600 * 1000; // 1 hour ago
            const compactedMessage = (0, message_1.createMuxMessage)("compacted-1", "assistant", "Previous summary", {
                timestamp: olderCompactedTimestamp,
                compacted: "user",
                historySequence: 0,
            });
            const userMessage = (0, message_1.createMuxMessage)("user-1", "user", "Hello", {
                timestamp: newerUserTimestamp,
                historySequence: 1,
            });
            const idleCompactionReq = (0, message_1.createMuxMessage)("req-1", "user", "Summarize", {
                historySequence: 2,
                muxMetadata: {
                    type: "compaction-request",
                    source: "idle-compaction",
                    rawCommand: "/compact",
                    parsed: {},
                },
            });
            await seedHistory(compactedMessage, userMessage, idleCompactionReq);
            const event = createStreamEndEvent("Summary");
            await handler.handleCompletion(event);
            const summaryEvent = emittedEvents.find((_e) => {
                const m = _e.data.message;
                return m?.role === "assistant" && m?.metadata?.compacted === "idle";
            });
            (0, bun_test_1.expect)(summaryEvent).toBeDefined();
            const summaryMsg = summaryEvent?.data.message;
            // Should use the newer timestamp (user message)
            (0, bun_test_1.expect)(summaryMsg.metadata?.timestamp).toBe(newerUserTimestamp);
        });
        (0, bun_test_1.it)("should skip compaction-request message when finding timestamp to preserve", async () => {
            const originalTimestamp = Date.now() - 3600 * 1000; // 1 hour ago - the real user message
            const freshTimestamp = Date.now(); // The compaction request has a fresh timestamp
            const userMessage = (0, message_1.createMuxMessage)("user-1", "user", "Hello", {
                timestamp: originalTimestamp,
                historySequence: 0,
            });
            // Idle compaction request WITH a timestamp (as happens in production)
            const idleCompactionReq = (0, message_1.createMuxMessage)("req-1", "user", "Summarize", {
                timestamp: freshTimestamp,
                historySequence: 1,
                muxMetadata: {
                    type: "compaction-request",
                    source: "idle-compaction",
                    rawCommand: "/compact",
                    parsed: {},
                },
            });
            await seedHistory(userMessage, idleCompactionReq);
            const event = createStreamEndEvent("Summary");
            await handler.handleCompletion(event);
            const summaryEvent = emittedEvents.find((_e) => {
                const m = _e.data.message;
                return m?.role === "assistant" && m?.metadata?.compacted;
            });
            (0, bun_test_1.expect)(summaryEvent).toBeDefined();
            const summaryMsg = summaryEvent?.data.message;
            // Should use the OLD user message timestamp, NOT the fresh compaction request timestamp
            (0, bun_test_1.expect)(summaryMsg.metadata?.timestamp).toBe(originalTimestamp);
            (0, bun_test_1.expect)(summaryMsg.metadata?.compacted).toBe("idle");
        });
        (0, bun_test_1.it)("should use current time for non-idle compaction", async () => {
            const oldTimestamp = Date.now() - 3600 * 1000; // 1 hour ago
            const userMessage = (0, message_1.createMuxMessage)("user-1", "user", "Hello", {
                timestamp: oldTimestamp,
                historySequence: 0,
            });
            // Regular compaction (not idle)
            const compactionReq = createCompactionRequest();
            await seedHistory(userMessage, compactionReq);
            const beforeTime = Date.now();
            const event = createStreamEndEvent("Summary");
            await handler.handleCompletion(event);
            const afterTime = Date.now();
            const summaryEvent = emittedEvents.find((_e) => {
                const m = _e.data.message;
                return m?.role === "assistant" && m?.metadata?.compacted;
            });
            (0, bun_test_1.expect)(summaryEvent).toBeDefined();
            const summaryMsg = summaryEvent?.data.message;
            // Should use current time, not the old user message timestamp
            (0, bun_test_1.expect)(summaryMsg.metadata?.timestamp).toBeGreaterThanOrEqual(beforeTime);
            (0, bun_test_1.expect)(summaryMsg.metadata?.timestamp).toBeLessThanOrEqual(afterTime);
            (0, bun_test_1.expect)(summaryMsg.metadata?.compacted).toBe("user");
        });
    });
    (0, bun_test_1.describe)("Empty Summary Validation", () => {
        (0, bun_test_1.it)("should reject compaction when summary is empty (stream crashed)", async () => {
            const compactionRequestMsg = (0, message_1.createMuxMessage)("compact-req-1", "user", "/compact", {
                historySequence: 0,
                timestamp: Date.now() - 1000,
                muxMetadata: { type: "compaction-request", rawCommand: "/compact", parsed: {} },
            });
            const { appendSpy, clearSpy } = await seedHistory(compactionRequestMsg);
            // Empty parts array simulates stream crash before producing content
            const event = createStreamEndEvent("");
            const result = await handler.handleCompletion(event);
            // Should return false and NOT perform compaction
            (0, bun_test_1.expect)(result).toBe(false);
            (0, bun_test_1.expect)(clearSpy).not.toHaveBeenCalled();
            (0, bun_test_1.expect)(appendSpy).not.toHaveBeenCalled();
        });
        (0, bun_test_1.it)("should reject compaction when summary is only whitespace", async () => {
            const compactionRequestMsg = (0, message_1.createMuxMessage)("compact-req-1", "user", "/compact", {
                historySequence: 0,
                timestamp: Date.now() - 1000,
                muxMetadata: { type: "compaction-request", rawCommand: "/compact", parsed: {} },
            });
            const { clearSpy } = await seedHistory(compactionRequestMsg);
            // Whitespace-only should also be rejected
            const event = createStreamEndEvent("   \n\t  ");
            const result = await handler.handleCompletion(event);
            (0, bun_test_1.expect)(result).toBe(false);
            (0, bun_test_1.expect)(clearSpy).not.toHaveBeenCalled();
        });
    });
    (0, bun_test_1.describe)("Raw JSON Object Validation", () => {
        (0, bun_test_1.it)("should reject compaction when summary is a raw JSON object", async () => {
            const compactionRequestMsg = (0, message_1.createMuxMessage)("compact-req-1", "user", "/compact", {
                historySequence: 0,
                timestamp: Date.now() - 1000,
                muxMetadata: { type: "compaction-request", rawCommand: "/compact", parsed: {} },
            });
            const { appendSpy, clearSpy } = await seedHistory(compactionRequestMsg);
            // Any JSON object should be rejected - this catches all tool call leaks
            const jsonObject = JSON.stringify({
                script: "cd tpred && sed -n '405,520p' train/trainer.py",
                timeout_secs: 10,
                run_in_background: false,
                display_name: "Inspect trainer",
            });
            const event = createStreamEndEvent(jsonObject);
            const result = await handler.handleCompletion(event);
            // Should return false and NOT perform compaction
            (0, bun_test_1.expect)(result).toBe(false);
            (0, bun_test_1.expect)(clearSpy).not.toHaveBeenCalled();
            (0, bun_test_1.expect)(appendSpy).not.toHaveBeenCalled();
        });
        (0, bun_test_1.it)("should reject any JSON object regardless of structure", async () => {
            const compactionRequestMsg = (0, message_1.createMuxMessage)("compact-req-1", "user", "/compact", {
                historySequence: 0,
                timestamp: Date.now() - 1000,
                muxMetadata: { type: "compaction-request", rawCommand: "/compact", parsed: {} },
            });
            await seedHistory(compactionRequestMsg);
            // Even arbitrary JSON objects should be rejected
            const arbitraryJson = JSON.stringify({
                foo: "bar",
                nested: { a: 1, b: 2 },
            });
            const event = createStreamEndEvent(arbitraryJson);
            const result = await handler.handleCompletion(event);
            (0, bun_test_1.expect)(result).toBe(false);
        });
        (0, bun_test_1.it)("should accept valid compaction summary text", async () => {
            const compactionRequestMsg = (0, message_1.createMuxMessage)("compact-req-1", "user", "/compact", {
                historySequence: 0,
                timestamp: Date.now() - 1000,
                muxMetadata: { type: "compaction-request", rawCommand: "/compact", parsed: {} },
            });
            const { appendSpy, clearSpy } = await seedHistory(compactionRequestMsg);
            // Normal summary text
            const event = createStreamEndEvent("The user was working on implementing a new feature. Key decisions included using TypeScript.");
            const result = await handler.handleCompletion(event);
            (0, bun_test_1.expect)(result).toBe(true);
            (0, bun_test_1.expect)(clearSpy).not.toHaveBeenCalled();
            (0, bun_test_1.expect)(appendSpy).toHaveBeenCalled();
        });
        (0, bun_test_1.it)("should accept summary with embedded JSON as part of prose", async () => {
            const compactionRequestMsg = (0, message_1.createMuxMessage)("compact-req-1", "user", "/compact", {
                historySequence: 0,
                timestamp: Date.now() - 1000,
                muxMetadata: { type: "compaction-request", rawCommand: "/compact", parsed: {} },
            });
            await seedHistory(compactionRequestMsg);
            // Prose that contains JSON snippets is fine - only reject pure JSON objects
            const event = createStreamEndEvent('The user configured {"apiKey": "xxx", "endpoint": "http://localhost"} in config.json.');
            const result = await handler.handleCompletion(event);
            (0, bun_test_1.expect)(result).toBe(true);
        });
        (0, bun_test_1.it)("should not reject JSON arrays (only objects)", async () => {
            const compactionRequestMsg = (0, message_1.createMuxMessage)("compact-req-1", "user", "/compact", {
                historySequence: 0,
                timestamp: Date.now() - 1000,
                muxMetadata: { type: "compaction-request", rawCommand: "/compact", parsed: {} },
            });
            await seedHistory(compactionRequestMsg);
            // Arrays are not tool calls, so they should pass (even though unusual)
            const event = createStreamEndEvent('["item1", "item2"]');
            const result = await handler.handleCompletion(event);
            (0, bun_test_1.expect)(result).toBe(true);
        });
    });
});
//# sourceMappingURL=compactionHandler.test.js.map