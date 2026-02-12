"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const events_1 = require("events");
const mockAiStreamPlayer_1 = require("./mockAiStreamPlayer");
const message_1 = require("../../../common/types/message");
const result_1 = require("../../../common/types/result");
const testHistoryService_1 = require("../testHistoryService");
function readWorkspaceId(payload) {
    if (!payload || typeof payload !== "object")
        return undefined;
    if (!("workspaceId" in payload))
        return undefined;
    const workspaceId = payload.workspaceId;
    return typeof workspaceId === "string" ? workspaceId : undefined;
}
(0, bun_test_1.describe)("MockAiStreamPlayer", () => {
    let historyService;
    let cleanup;
    (0, bun_test_1.beforeEach)(async () => {
        const testHistory = await (0, testHistoryService_1.createTestHistoryService)();
        historyService = testHistory.historyService;
        cleanup = testHistory.cleanup;
    });
    (0, bun_test_1.afterEach)(async () => {
        await cleanup();
    });
    (0, bun_test_1.test)("appends assistant placeholder even when router turn ends with stream error", async () => {
        const aiServiceStub = new events_1.EventEmitter();
        const player = new mockAiStreamPlayer_1.MockAiStreamPlayer({
            historyService,
            aiService: aiServiceStub,
        });
        const workspaceId = "workspace-1";
        const firstTurnUser = (0, message_1.createMuxMessage)("user-1", "user", "[mock:list-languages] List 3 programming languages", {
            timestamp: Date.now(),
        });
        const firstResult = await player.play([firstTurnUser], workspaceId);
        (0, bun_test_1.expect)(firstResult.success).toBe(true);
        player.stop(workspaceId);
        // Read back what was appended during the first turn
        const historyResult = await historyService.getLastMessages(workspaceId, 100);
        const historyBeforeSecondTurn = historyResult.success ? historyResult.data : [];
        const secondTurnUser = (0, message_1.createMuxMessage)("user-2", "user", "[mock:error:api] Trigger API error", {
            timestamp: Date.now(),
        });
        const secondResult = await player.play([firstTurnUser, ...historyBeforeSecondTurn, secondTurnUser], workspaceId);
        (0, bun_test_1.expect)(secondResult.success).toBe(true);
        // Read back all messages and check the assistant placeholders
        const allResult = await historyService.getLastMessages(workspaceId, 100);
        const allMessages = allResult.success ? allResult.data : [];
        const assistantMessages = allMessages.filter((m) => m.role === "assistant");
        (0, bun_test_1.expect)(assistantMessages).toHaveLength(2);
        const [firstAppend, secondAppend] = assistantMessages;
        (0, bun_test_1.expect)(firstAppend.id).not.toBe(secondAppend.id);
        const firstSeq = firstAppend.metadata?.historySequence ?? -1;
        const secondSeq = secondAppend.metadata?.historySequence ?? -1;
        (0, bun_test_1.expect)(secondSeq).toBe(firstSeq + 1);
        player.stop(workspaceId);
    });
    (0, bun_test_1.test)("removes assistant placeholder when aborted before stream scheduling", async () => {
        // Control when appendToHistory resolves to test the abort race condition.
        // The real service writes to disk immediately; we gate the returned promise
        // so the player sees a pending append while we trigger abort.
        let appendResolve;
        const appendGate = new Promise((resolve) => {
            appendResolve = resolve;
        });
        let appendedMessageResolve;
        const appendedMessage = new Promise((resolve) => {
            appendedMessageResolve = resolve;
        });
        const originalAppend = historyService.appendToHistory.bind(historyService);
        (0, bun_test_1.spyOn)(historyService, "appendToHistory").mockImplementation(async (wId, message) => {
            // Write to disk so deleteMessage can find it later
            await originalAppend(wId, message);
            appendedMessageResolve(message);
            // Delay returning to the caller until the gate opens
            return appendGate;
        });
        const aiServiceStub = new events_1.EventEmitter();
        const player = new mockAiStreamPlayer_1.MockAiStreamPlayer({
            historyService,
            aiService: aiServiceStub,
        });
        const workspaceId = "workspace-abort-startup";
        const userMessage = (0, message_1.createMuxMessage)("user-1", "user", "[mock:list-languages] List 3 programming languages", {
            timestamp: Date.now(),
        });
        const abortController = new AbortController();
        const playPromise = player.play([userMessage], workspaceId, {
            abortSignal: abortController.signal,
        });
        const assistantMsg = await appendedMessage;
        appendResolve((0, result_1.Ok)(undefined));
        abortController.abort();
        const result = await playPromise;
        (0, bun_test_1.expect)(result.success).toBe(true);
        // Verify the placeholder was deleted from history
        const storedResult = await historyService.getLastMessages(workspaceId, 100);
        const storedMessages = storedResult.success ? storedResult.data : [];
        (0, bun_test_1.expect)(storedMessages.some((msg) => msg.id === assistantMsg.id)).toBe(false);
    });
    (0, bun_test_1.test)("stop prevents queued stream events from emitting", async () => {
        const aiServiceStub = new events_1.EventEmitter();
        const player = new mockAiStreamPlayer_1.MockAiStreamPlayer({
            historyService,
            aiService: aiServiceStub,
        });
        const workspaceId = "workspace-2";
        let deltaCount = 0;
        let abortCount = 0;
        let stopped = false;
        aiServiceStub.on("stream-abort", (payload) => {
            if (readWorkspaceId(payload) === workspaceId) {
                abortCount += 1;
            }
        });
        const firstDelta = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("Timed out waiting for stream-delta"));
            }, 1000);
            aiServiceStub.on("stream-delta", (payload) => {
                if (readWorkspaceId(payload) !== workspaceId)
                    return;
                deltaCount += 1;
                if (!stopped) {
                    stopped = true;
                    clearTimeout(timeout);
                    player.stop(workspaceId);
                    resolve();
                }
            });
        });
        const forceTurnUser = (0, message_1.createMuxMessage)("user-force", "user", "[force] keep streaming", {
            timestamp: Date.now(),
        });
        const playResult = await player.play([forceTurnUser], workspaceId);
        (0, bun_test_1.expect)(playResult.success).toBe(true);
        await firstDelta;
        const deltasAtStop = deltaCount;
        await new Promise((resolve) => setTimeout(resolve, 150));
        (0, bun_test_1.expect)(deltaCount).toBe(deltasAtStop);
        (0, bun_test_1.expect)(abortCount).toBe(1);
    });
});
//# sourceMappingURL=mockAiStreamPlayer.test.js.map