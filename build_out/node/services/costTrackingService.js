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
exports.CostTrackingService = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const write_file_atomic_1 = __importDefault(require("write-file-atomic"));
const log_1 = require("./log");
const displayUsage_1 = require("../../common/utils/tokens/displayUsage");
// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------
const EMPTY_FILE = { version: 1, entries: [], dailySummaries: {} };
const DEFAULT_RETENTION_DAYS = 90;
class CostTrackingService {
    filePath;
    config;
    constructor(config) {
        this.config = config;
        this.filePath = path.join(config.rootDir, "cost-history.json");
    }
    // -- Read / Write ---------------------------------------------------------
    async read() {
        try {
            const raw = await fs.readFile(this.filePath, "utf-8");
            const data = JSON.parse(raw);
            if (data.version !== 1)
                return { ...EMPTY_FILE };
            return data;
        }
        catch {
            return { ...EMPTY_FILE };
        }
    }
    async write(data) {
        const dir = path.dirname(this.filePath);
        await fs.mkdir(dir, { recursive: true });
        await (0, write_file_atomic_1.default)(this.filePath, JSON.stringify(data, null, 2));
    }
    // -- Public API -----------------------------------------------------------
    /**
     * Record a cost entry from a completed stream.
     * Also updates the daily summary atomically.
     */
    async recordCost(entry) {
        const data = await this.read();
        data.entries.push(entry);
        // Update daily summary
        const dateKey = new Date(entry.timestamp).toISOString().slice(0, 10);
        const summary = data.dailySummaries[dateKey] ?? {
            date: dateKey,
            totalCost: 0,
            requestCount: 0,
            byModel: {},
        };
        summary.totalCost += entry.cost;
        summary.requestCount += 1;
        const modelSummary = summary.byModel[entry.model] ?? { cost: 0, requests: 0, tokens: 0 };
        modelSummary.cost += entry.cost;
        modelSummary.requests += 1;
        modelSummary.tokens +=
            entry.inputTokens + entry.outputTokens + entry.cachedTokens + entry.reasoningTokens;
        summary.byModel[entry.model] = modelSummary;
        // Ensure the summary is assigned back to the data object
        data.dailySummaries[dateKey] = summary;
        await this.write(data);
    }
    /**
     * Calculate cost and record it.
     */
    async trackCost(workspaceId, model, usage, providerMetadata) {
        // Load latest config to check for custom model prices
        const currentConfig = this.config.loadConfigOrDefault();
        const customPrice = currentConfig.customModelPrices?.[model];
        const displayUsage = (0, displayUsage_1.createDisplayUsage)(usage, model, providerMetadata, customPrice);
        if (!displayUsage)
            return;
        const totalCost = (displayUsage.input.cost_usd ?? 0) +
            (displayUsage.output.cost_usd ?? 0) +
            (displayUsage.cached.cost_usd ?? 0) +
            (displayUsage.cacheCreate.cost_usd ?? 0) +
            (displayUsage.reasoning.cost_usd ?? 0);
        const entry = {
            timestamp: Date.now(),
            workspaceId,
            model,
            inputTokens: displayUsage.input.tokens,
            outputTokens: displayUsage.output.tokens,
            cachedTokens: displayUsage.cached.tokens,
            cacheCreateTokens: displayUsage.cacheCreate.tokens,
            reasoningTokens: displayUsage.reasoning.tokens,
            cost: totalCost,
        };
        await this.recordCost(entry);
    }
    /**
     * Get cost entries within a time range.
     */
    async getCostHistory(range) {
        const data = await this.read();
        if (!range?.start && !range?.end)
            return data.entries;
        return data.entries.filter((e) => {
            if (range.start && e.timestamp < range.start)
                return false;
            if (range.end && e.timestamp > range.end)
                return false;
            return true;
        });
    }
    /**
     * Get daily summaries within a date range.
     */
    async getDailySummaries(startDate, endDate) {
        const data = await this.read();
        const summaries = Object.values(data.dailySummaries).sort((a, b) => a.date.localeCompare(b.date));
        if (!startDate && !endDate)
            return summaries;
        return summaries.filter((s) => {
            if (startDate && s.date < startDate)
                return false;
            if (endDate && s.date > endDate)
                return false;
            return true;
        });
    }
    /**
     * Get per-model cost breakdown for the given range.
     */
    async getModelBreakdown(range) {
        const entries = await this.getCostHistory(range);
        const breakdown = {};
        for (const e of entries) {
            const m = breakdown[e.model] ?? { cost: 0, requests: 0, tokens: 0 };
            m.cost += e.cost;
            m.requests += 1;
            m.tokens += e.inputTokens + e.outputTokens + e.cachedTokens + e.reasoningTokens;
            breakdown[e.model] = m;
        }
        return breakdown;
    }
    /**
     * Remove entries older than retentionDays from the file.
     */
    async pruneOldEntries(retentionDays = DEFAULT_RETENTION_DAYS) {
        const data = await this.read();
        const cutoff = Date.now() - retentionDays * 86_400_000;
        const cutoffDate = new Date(cutoff).toISOString().slice(0, 10);
        const before = data.entries.length;
        data.entries = data.entries.filter((e) => e.timestamp >= cutoff);
        // Prune daily summaries too
        for (const key of Object.keys(data.dailySummaries)) {
            if (key < cutoffDate)
                delete data.dailySummaries[key];
        }
        const pruned = before - data.entries.length;
        if (pruned > 0) {
            await this.write(data);
            log_1.log.info(`Pruned ${pruned} old cost entries (retention: ${retentionDays}d)`);
        }
        return pruned;
    }
    /**
     * Get summary totals for today, this week, and this month.
     */
    async getSummaryTotals() {
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        // Week start (Monday)
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - mondayOffset);
        weekStart.setHours(0, 0, 0, 0);
        // Month start
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        // Previous periods for comparison
        const prevDayStr = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);
        const prevWeekStart = new Date(weekStart.getTime() - 7 * 86_400_000);
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const data = await this.read();
        const summaries = data.dailySummaries;
        let today = 0;
        let thisWeek = 0;
        let thisMonth = 0;
        let previousDay = 0;
        let previousWeek = 0;
        let previousMonth = 0;
        for (const [date, summary] of Object.entries(summaries)) {
            if (date === todayStr)
                today += summary.totalCost;
            if (date === prevDayStr)
                previousDay += summary.totalCost;
            if (date >= weekStart.toISOString().slice(0, 10) && date <= todayStr) {
                thisWeek += summary.totalCost;
            }
            if (date >= prevWeekStart.toISOString().slice(0, 10) &&
                date < weekStart.toISOString().slice(0, 10)) {
                previousWeek += summary.totalCost;
            }
            if (date >= monthStart.toISOString().slice(0, 10) && date <= todayStr) {
                thisMonth += summary.totalCost;
            }
            if (date >= prevMonthStart.toISOString().slice(0, 10) &&
                date <= prevMonthEnd.toISOString().slice(0, 10)) {
                previousMonth += summary.totalCost;
            }
        }
        return { today, thisWeek, thisMonth, previousDay, previousWeek, previousMonth };
    }
}
exports.CostTrackingService = CostTrackingService;
//# sourceMappingURL=costTrackingService.js.map