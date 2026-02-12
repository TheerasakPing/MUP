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
/* eslint-disable @typescript-eslint/unbound-method */
const bun_test_1 = require("bun:test");
const partialService_1 = require("./partialService");
const message_1 = require("../../common/types/message");
const result_1 = require("../../common/types/result");
const testHistoryService_1 = require("./testHistoryService");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
(0, bun_test_1.describe)("PartialService - Error Recovery", () => {
    let partialService;
    let config;
    let historyService;
    let cleanup;
    (0, bun_test_1.beforeEach)(async () => {
        ({ config, historyService, cleanup } = await (0, testHistoryService_1.createTestHistoryService)());
        partialService = new partialService_1.PartialService(config, historyService);
    });
    (0, bun_test_1.afterEach)(async () => {
        await cleanup();
    });
    (0, bun_test_1.test)("commitToHistory should strip error metadata and commit parts from errored partial", async () => {
        const workspaceId = "test-workspace";
        const erroredPartial = {
            id: "msg-1",
            role: "assistant",
            metadata: {
                historySequence: 1,
                timestamp: Date.now(),
                model: "test-model",
                partial: true,
                error: "Stream error occurred",
                errorType: "network",
            },
            parts: [
                { type: "text", text: "Hello, I was processing when" },
                { type: "text", text: " the error occurred" },
            ],
        };
        // Mock readPartial to return errored partial
        partialService.readPartial = (0, bun_test_1.mock)(() => Promise.resolve(erroredPartial));
        // Mock deletePartial
        partialService.deletePartial = (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(undefined)));
        // Spy on historyService methods to verify calls
        const appendSpy = (0, bun_test_1.spyOn)(historyService, "appendToHistory");
        // Call commitToHistory
        const result = await partialService.commitToHistory(workspaceId);
        // Should succeed
        (0, bun_test_1.expect)(result.success).toBe(true);
        // Should have called appendToHistory with cleaned metadata (no error/errorType)
        (0, bun_test_1.expect)(appendSpy).toHaveBeenCalledTimes(1);
        const appendedMessage = appendSpy.mock.calls[0][1];
        (0, bun_test_1.expect)(appendedMessage.id).toBe("msg-1");
        (0, bun_test_1.expect)(appendedMessage.parts).toEqual(erroredPartial.parts);
        (0, bun_test_1.expect)(appendedMessage.metadata?.error).toBeUndefined();
        (0, bun_test_1.expect)(appendedMessage.metadata?.errorType).toBeUndefined();
        (0, bun_test_1.expect)(appendedMessage.metadata?.historySequence).toBe(1);
        // Should have deleted the partial after committing
        const deletePartial = partialService.deletePartial;
        (0, bun_test_1.expect)(deletePartial).toHaveBeenCalledWith(workspaceId);
    });
    (0, bun_test_1.test)("commitToHistory should update existing placeholder when errored partial has more parts", async () => {
        const workspaceId = "test-workspace";
        const erroredPartial = {
            id: "msg-1",
            role: "assistant",
            metadata: {
                historySequence: 1,
                timestamp: Date.now(),
                model: "test-model",
                partial: true,
                error: "Stream error occurred",
                errorType: "network",
            },
            parts: [
                { type: "text", text: "Accumulated content before error" },
                {
                    type: "dynamic-tool",
                    toolCallId: "call-1",
                    toolName: "bash",
                    state: "input-available",
                    input: { script: "echo test", timeout_secs: 10, display_name: "Test" },
                },
            ],
        };
        const existingPlaceholder = {
            id: "msg-1",
            role: "assistant",
            metadata: {
                historySequence: 1,
                timestamp: Date.now(),
                model: "test-model",
                partial: true,
            },
            parts: [], // Empty placeholder
        };
        // Mock readPartial to return errored partial
        partialService.readPartial = (0, bun_test_1.mock)(() => Promise.resolve(erroredPartial));
        // Mock deletePartial
        partialService.deletePartial = (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(undefined)));
        // Seed existing placeholder into history so getHistoryFromLatestBoundary finds it
        await historyService.appendToHistory(workspaceId, existingPlaceholder);
        // Spy on historyService methods AFTER seeding to verify only commitToHistory calls
        const appendSpy = (0, bun_test_1.spyOn)(historyService, "appendToHistory");
        const updateSpy = (0, bun_test_1.spyOn)(historyService, "updateHistory");
        // Call commitToHistory
        const result = await partialService.commitToHistory(workspaceId);
        // Should succeed
        (0, bun_test_1.expect)(result.success).toBe(true);
        // Should have called updateHistory (not append) with cleaned metadata
        (0, bun_test_1.expect)(updateSpy).toHaveBeenCalledTimes(1);
        (0, bun_test_1.expect)(appendSpy).not.toHaveBeenCalled();
        const updatedMessage = updateSpy.mock.calls[0][1];
        (0, bun_test_1.expect)(updatedMessage.parts).toEqual(erroredPartial.parts);
        (0, bun_test_1.expect)(updatedMessage.metadata?.error).toBeUndefined();
        (0, bun_test_1.expect)(updatedMessage.metadata?.errorType).toBeUndefined();
        // Should have deleted the partial after updating
        const deletePartial = partialService.deletePartial;
        (0, bun_test_1.expect)(deletePartial).toHaveBeenCalledWith(workspaceId);
    });
    (0, bun_test_1.test)("commitToHistory should skip tool-only incomplete partials", async () => {
        const workspaceId = "test-workspace";
        const toolOnlyPartial = {
            id: "msg-1",
            role: "assistant",
            metadata: {
                historySequence: 1,
                timestamp: Date.now(),
                model: "test-model",
                partial: true,
                error: "Stream interrupted",
                errorType: "network",
            },
            parts: [
                {
                    type: "dynamic-tool",
                    toolCallId: "call-1",
                    toolName: "bash",
                    state: "input-available",
                    input: { script: "echo test", timeout_secs: 10, display_name: "Test" },
                },
            ],
        };
        partialService.readPartial = (0, bun_test_1.mock)(() => Promise.resolve(toolOnlyPartial));
        partialService.deletePartial = (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(undefined)));
        // Spy on historyService methods to verify calls
        const appendSpy = (0, bun_test_1.spyOn)(historyService, "appendToHistory");
        const updateSpy = (0, bun_test_1.spyOn)(historyService, "updateHistory");
        const result = await partialService.commitToHistory(workspaceId);
        (0, bun_test_1.expect)(result.success).toBe(true);
        (0, bun_test_1.expect)(appendSpy).not.toHaveBeenCalled();
        (0, bun_test_1.expect)(updateSpy).not.toHaveBeenCalled();
        const deletePartial = partialService.deletePartial;
        (0, bun_test_1.expect)(deletePartial).toHaveBeenCalledWith(workspaceId);
    });
    (0, bun_test_1.test)("commitToHistory should skip empty errored partial", async () => {
        const workspaceId = "test-workspace";
        const emptyErrorPartial = {
            id: "msg-1",
            role: "assistant",
            metadata: {
                historySequence: 1,
                timestamp: Date.now(),
                model: "test-model",
                partial: true,
                error: "Network error",
                errorType: "network",
            },
            parts: [], // Empty - no content accumulated before error
        };
        // Mock readPartial to return empty errored partial
        partialService.readPartial = (0, bun_test_1.mock)(() => Promise.resolve(emptyErrorPartial));
        // Mock deletePartial
        partialService.deletePartial = (0, bun_test_1.mock)(() => Promise.resolve((0, result_1.Ok)(undefined)));
        // Spy on historyService methods to verify calls
        const appendSpy = (0, bun_test_1.spyOn)(historyService, "appendToHistory");
        // Call commitToHistory
        const result = await partialService.commitToHistory(workspaceId);
        // Should succeed
        (0, bun_test_1.expect)(result.success).toBe(true);
        // Should NOT call appendToHistory for empty message (no value to preserve)
        (0, bun_test_1.expect)(appendSpy).not.toHaveBeenCalled();
        // Should still delete the partial (cleanup)
        const deletePartial = partialService.deletePartial;
        (0, bun_test_1.expect)(deletePartial).toHaveBeenCalledWith(workspaceId);
    });
});
(0, bun_test_1.describe)("PartialService - Legacy compatibility", () => {
    let config;
    let partialService;
    let cleanup;
    (0, bun_test_1.beforeEach)(async () => {
        let historyService;
        ({ config, historyService, cleanup } = await (0, testHistoryService_1.createTestHistoryService)());
        partialService = new partialService_1.PartialService(config, historyService);
    });
    (0, bun_test_1.afterEach)(async () => {
        await cleanup();
    });
    (0, bun_test_1.test)("readPartial upgrades legacy cmuxMetadata", async () => {
        const workspaceId = "legacy-ws";
        const workspaceDir = config.getSessionDir(workspaceId);
        await fs.mkdir(workspaceDir, { recursive: true });
        const partialMessage = (0, message_1.createMuxMessage)("partial-1", "assistant", "legacy", {
            historySequence: 0,
        });
        partialMessage.metadata.cmuxMetadata = { type: "normal" };
        const partialPath = path.join(workspaceDir, "partial.json");
        await fs.writeFile(partialPath, JSON.stringify(partialMessage));
        const result = await partialService.readPartial(workspaceId);
        (0, bun_test_1.expect)(result?.metadata?.muxMetadata?.type).toBe("normal");
    });
});
//# sourceMappingURL=partialService.test.js.map