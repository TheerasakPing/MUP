"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeAgentAiDefaults = normalizeAgentAiDefaults;
const schemas_1 = require("../../common/orpc/schemas");
const thinking_1 = require("./thinking");
function normalizeAgentAiDefaults(raw) {
    const record = raw && typeof raw === "object" ? raw : {};
    const result = {};
    for (const [agentIdRaw, entryRaw] of Object.entries(record)) {
        const agentId = agentIdRaw.trim().toLowerCase();
        if (!agentId)
            continue;
        if (!schemas_1.AgentIdSchema.safeParse(agentId).success)
            continue;
        if (!entryRaw || typeof entryRaw !== "object")
            continue;
        const entry = entryRaw;
        const modelString = typeof entry.modelString === "string" && entry.modelString.trim().length > 0
            ? entry.modelString.trim()
            : undefined;
        const thinkingLevel = (0, thinking_1.coerceThinkingLevel)(entry.thinkingLevel);
        const enabled = typeof entry.enabled === "boolean" ? entry.enabled : undefined;
        if (!modelString && !thinkingLevel && enabled === undefined) {
            continue;
        }
        result[agentId] = { modelString, thinkingLevel, enabled };
    }
    return result;
}
//# sourceMappingURL=agentAiDefaults.js.map