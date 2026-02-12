"use strict";
/**
 * Agent Performance Analytics Types
 * Defines metrics for tracking agent and model performance
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANALYTICS_TIME_RANGES = void 0;
exports.ANALYTICS_TIME_RANGES = [
    {
        start: 0,
        end: Date.now(),
        label: "All Time",
    },
    {
        start: Date.now() - 30 * 24 * 60 * 60 * 1000,
        end: Date.now(),
        label: "Last 30 Days",
    },
    {
        start: Date.now() - 7 * 24 * 60 * 60 * 1000,
        end: Date.now(),
        label: "Last 7 Days",
    },
    {
        start: Date.now() - 24 * 60 * 60 * 1000,
        end: Date.now(),
        label: "Last 24 Hours",
    },
];
//# sourceMappingURL=agentAnalytics.js.map