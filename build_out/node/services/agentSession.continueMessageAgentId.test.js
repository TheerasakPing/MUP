"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const message_1 = require("../../common/types/message");
const agentSession_1 = require("./agentSession");
const testHistoryService_1 = require("./testHistoryService");
(0, bun_test_1.describe)("AgentSession continue-message agentId fallback", () => {
    let historyCleanup;
    (0, bun_test_1.afterEach)(async () => {
        await historyCleanup?.();
    });
    (0, bun_test_1.test)("legacy continueMessage.mode does not fall back to compact agent", async () => {
        // Track the follow-up message that gets dispatched
        let dispatchedMessage;
        let dispatchedOptions;
        const aiService = {
            on() {
                return this;
            },
            off() {
                return this;
            },
            isStreaming: () => false,
            stopStream: (0, bun_test_1.mock)(() => Promise.resolve({ success: true, data: undefined })),
        };
        // Create a mock compaction summary with legacy mode field
        const baseContinueMessage = (0, message_1.buildContinueMessage)({
            text: "follow up",
            model: "openai:gpt-4o",
            agentId: "exec",
        });
        if (!baseContinueMessage) {
            throw new Error("Expected base continue message to be built");
        }
        // Simulate legacy format: no agentId, but has mode instead
        const legacyFollowUp = {
            text: baseContinueMessage.text,
            model: "openai:gpt-4o",
            agentId: undefined, // Legacy: missing agentId
            mode: "plan", // Legacy: mode field instead of agentId
        };
        // Mock history service to return a compaction summary with pending follow-up
        const mockSummaryMessage = {
            id: "summary-1",
            role: "assistant",
            parts: [{ type: "text", text: "Compaction summary" }],
            metadata: {
                muxMetadata: {
                    type: "compaction-summary",
                    pendingFollowUp: legacyFollowUp,
                },
            },
        };
        const { historyService, cleanup } = await (0, testHistoryService_1.createTestHistoryService)();
        historyCleanup = cleanup;
        await historyService.appendToHistory("ws", mockSummaryMessage);
        const initStateManager = {
            on() {
                return this;
            },
            off() {
                return this;
            },
        };
        const backgroundProcessManager = {
            cleanup: (0, bun_test_1.mock)(() => Promise.resolve()),
            setMessageQueued: (0, bun_test_1.mock)(() => undefined),
        };
        const config = {
            srcDir: "/tmp",
            getSessionDir: (0, bun_test_1.mock)(() => "/tmp"),
        };
        const partialService = {};
        const session = new agentSession_1.AgentSession({
            workspaceId: "ws",
            config,
            historyService,
            partialService,
            aiService,
            initStateManager,
            costTrackingService: {},
            backgroundProcessManager,
        });
        const internals = session;
        // Intercept sendMessage to capture what dispatchPendingFollowUp sends
        internals.sendMessage = (0, bun_test_1.mock)((message, options) => {
            dispatchedMessage = message;
            dispatchedOptions = options;
            return Promise.resolve({ success: true });
        });
        // Call dispatchPendingFollowUp directly (normally called after compaction completes)
        await internals.dispatchPendingFollowUp();
        // Verify the follow-up was dispatched with correct agentId derived from legacy mode
        (0, bun_test_1.expect)(dispatchedMessage).toBe("follow up");
        (0, bun_test_1.expect)(dispatchedOptions?.agentId).toBe("plan");
        session.dispose();
    });
});
//# sourceMappingURL=agentSession.continueMessageAgentId.test.js.map