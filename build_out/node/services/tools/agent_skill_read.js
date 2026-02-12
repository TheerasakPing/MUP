"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAgentSkillReadTool = void 0;
const muxChat_1 = require("../../../common/constants/muxChat");
const builtInSkillDefinitions_1 = require("../../../node/services/agentSkills/builtInSkillDefinitions");
const ai_1 = require("ai");
const toolDefinitions_1 = require("../../../common/utils/tools/toolDefinitions");
const schemas_1 = require("../../../common/orpc/schemas");
const agentSkillsService_1 = require("../../../node/services/agentSkills/agentSkillsService");
function formatError(error) {
    return error instanceof Error ? error.message : String(error);
}
/**
 * Build dynamic agent_skill_read tool description with available skills.
 * Injects the list of available skills directly into the tool description
 * so the model sees them adjacent to the tool call schema.
 */
function buildSkillReadDescription(config) {
    const baseDescription = toolDefinitions_1.TOOL_DEFINITIONS.agent_skill_read.description;
    // Filter out unadvertised skills from the tool description.
    // Unadvertised skills can still be invoked via /skill-name or agent_skill_read.
    const skills = (config.availableSkills ?? []).filter((s) => s.advertise !== false);
    if (skills.length === 0) {
        return baseDescription;
    }
    const MAX_SKILLS = 50;
    const shown = skills.slice(0, MAX_SKILLS);
    const omitted = skills.length - shown.length;
    const skillLines = shown.map((skill) => `- ${skill.name}: ${skill.description} (scope: ${skill.scope})`);
    if (omitted > 0) {
        skillLines.push(`(+${omitted} more not shown)`);
    }
    const usageHint = `\nTo read referenced files inside a skill directory:\n- agent_skill_read_file({ name: "<skill-name>", filePath: "references/whatever.txt" })`;
    return `${baseDescription}\n\nAvailable skills:\n${skillLines.join("\n")}${usageHint}`;
}
/**
 * Agent Skill read tool factory.
 * Reads and validates a skill's SKILL.md from project-local or global skills roots.
 */
const createAgentSkillReadTool = (config) => {
    return (0, ai_1.tool)({
        description: buildSkillReadDescription(config),
        inputSchema: toolDefinitions_1.TOOL_DEFINITIONS.agent_skill_read.schema,
        execute: async ({ name }) => {
            const workspacePath = config.cwd;
            if (!workspacePath) {
                return {
                    success: false,
                    error: "Tool misconfigured: cwd is required.",
                };
            }
            // Defensive: validate again even though inputSchema should guarantee shape.
            const parsedName = schemas_1.SkillNameSchema.safeParse(name);
            if (!parsedName.success) {
                return {
                    success: false,
                    error: parsedName.error.message,
                };
            }
            try {
                // Chat with Mux intentionally has no generic filesystem access. Restrict skill reads to
                // built-in skills (bundled in the app) so users can access help like `mux-docs` without
                // granting access to project/global skills on disk.
                if (config.workspaceId === muxChat_1.MUX_HELP_CHAT_WORKSPACE_ID) {
                    const builtIn = (0, builtInSkillDefinitions_1.getBuiltInSkillByName)(parsedName.data);
                    if (!builtIn) {
                        return {
                            success: false,
                            error: `Only built-in skills are available in Chat with Mux (requested: ${parsedName.data}).`,
                        };
                    }
                    return {
                        success: true,
                        skill: builtIn,
                    };
                }
                const resolved = await (0, agentSkillsService_1.readAgentSkill)(config.runtime, workspacePath, parsedName.data);
                return {
                    success: true,
                    skill: resolved.package,
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: formatError(error),
                };
            }
        },
    });
};
exports.createAgentSkillReadTool = createAgentSkillReadTool;
//# sourceMappingURL=agent_skill_read.js.map