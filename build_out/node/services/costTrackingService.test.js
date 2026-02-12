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
const fs = __importStar(require("fs/promises"));
const costTrackingService_1 = require("./costTrackingService");
const write_file_atomic_1 = __importDefault(require("write-file-atomic"));
// Mock dependencies
jest.mock('fs/promises');
jest.mock('write-file-atomic');
jest.mock('@/node/services/log', () => ({
    log: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));
// Mock config
const mockConfig = {
    rootDir: '/test/root',
    loadConfigOrDefault: jest.fn().mockReturnValue({ customModelPrices: [] }),
};
describe('CostTrackingService', () => {
    let service;
    const mockFileContent = JSON.stringify({
        version: 1,
        entries: [],
        dailySummaries: {},
    });
    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default fs mock
        fs.readFile.mockResolvedValue(mockFileContent);
        fs.mkdir.mockResolvedValue(undefined);
        service = new costTrackingService_1.CostTrackingService(mockConfig);
    });
    it('should initialize correctly', () => {
        expect(service).toBeDefined();
    });
    describe('recordCost', () => {
        it('should read existing file, append entry, and write back', async () => {
            const entry = {
                timestamp: Date.now(),
                workspaceId: 'ws-1',
                model: 'claude-3-opus',
                inputTokens: 100,
                outputTokens: 50,
                cachedTokens: 0,
                cacheCreateTokens: 0,
                reasoningTokens: 0,
                cost: 0.05,
            };
            await service.recordCost(entry);
            expect(fs.readFile).toHaveBeenCalled();
            expect(write_file_atomic_1.default).toHaveBeenCalled();
            const callArgs = write_file_atomic_1.default.mock.calls[0];
            const writtenData = JSON.parse(callArgs[1]);
            expect(writtenData.entries).toHaveLength(1);
            expect(writtenData.entries[0]).toEqual(entry);
            // Should also update daily summary
            const today = new Date().toISOString().slice(0, 10);
            expect(writtenData.dailySummaries[today]).toBeDefined();
            expect(writtenData.dailySummaries[today].totalCost).toBe(0.05);
        });
        it('should handle read errors by initializing empty state', async () => {
            fs.readFile.mockRejectedValue(new Error('File not found'));
            const entry = {
                timestamp: 1234567890,
                workspaceId: 'ws-1',
                model: 'test-model',
                inputTokens: 10,
                outputTokens: 10,
                cachedTokens: 0,
                cacheCreateTokens: 0,
                reasoningTokens: 0,
                cost: 0.01,
            };
            await service.recordCost(entry);
            // Should still write despite read error (creates new file)
            expect(write_file_atomic_1.default).toHaveBeenCalled();
        });
    });
    describe('trackCost', () => {
        it('should calculate cost for known model and record it', async () => {
            const spyRecord = jest.spyOn(service, 'recordCost');
            // We are using a mock model 'gpt-4o' which should be resolved by createDisplayUsage
            // utilizing the real or default model stats if not mocked.
            // Since we can't easily mock createDisplayUsage without dependency injection or module mocking
            // and jest.mock works on module level, we'll assume standard behavior.
            await service.trackCost('ws-1', 'gpt-4o', {
                inputTokens: 100,
                outputTokens: 100,
            });
            expect(spyRecord).toHaveBeenCalled();
            const args = spyRecord.mock.calls[0][0];
            expect(args.model).toBe('gpt-4o');
        });
    });
    describe('pruneOldEntries', () => {
        it('should remove entries older than retention period', async () => {
            const now = Date.now();
            const oldTime = now - (91 * 24 * 60 * 60 * 1000); // 91 days ago
            const newTime = now - (1 * 24 * 60 * 60 * 1000); // 1 day ago
            const mockData = {
                version: 1,
                entries: [
                    { timestamp: oldTime, cost: 1, model: 'old' },
                    { timestamp: newTime, cost: 2, model: 'new' },
                ],
                dailySummaries: {
                    [new Date(oldTime).toISOString().slice(0, 10)]: { totalCost: 1 },
                    [new Date(newTime).toISOString().slice(0, 10)]: { totalCost: 2 },
                }
            };
            fs.readFile.mockResolvedValue(JSON.stringify(mockData));
            const removedCount = await service.pruneOldEntries(90);
            expect(removedCount).toBe(1);
            expect(write_file_atomic_1.default).toHaveBeenCalled();
            const callArgs = write_file_atomic_1.default.mock.calls[0];
            const writtenData = JSON.parse(callArgs[1]);
            expect(writtenData.entries).toHaveLength(1);
            expect(writtenData.entries[0].model).toBe('new');
        });
    });
});
//# sourceMappingURL=costTrackingService.test.js.map