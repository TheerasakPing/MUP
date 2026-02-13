"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSkillIssueSchema =
  exports.AgentSkillPackageSchema =
  exports.AgentSkillDescriptorSchema =
  exports.AgentSkillFrontmatterSchema =
  exports.SkillNameSchema =
  exports.AgentSkillScopeSchema =
    void 0;
const zod_1 = require("zod");
exports.AgentSkillScopeSchema = zod_1.z.enum(["project", "global", "built-in"]);
/**
 * Skill name per agentskills.io
 * - 1–64 chars
 * - lowercase letters/numbers/hyphens
 * - no leading/trailing hyphen
 * - no consecutive hyphens
 */
exports.SkillNameSchema = zod_1.z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
exports.AgentSkillFrontmatterSchema = zod_1.z.object({
  name: exports.SkillNameSchema,
  description: zod_1.z.string().min(1).max(1024),
  license: zod_1.z.string().optional(),
  compatibility: zod_1.z.string().min(1).max(500).optional(),
  metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
  // When false, skill is NOT listed in the tool description's skill index.
  // Unadvertised skills can still be invoked via /skill-name or agent_skill_read({ name: "skill-name" }).
  // Use for internal orchestration skills, sub-agent-only skills, or power-user workflows.
  advertise: zod_1.z.boolean().optional(),
});
exports.AgentSkillDescriptorSchema = zod_1.z.object({
  name: exports.SkillNameSchema,
  description: zod_1.z.string().min(1).max(1024),
  scope: exports.AgentSkillScopeSchema,
  advertise: zod_1.z.boolean().optional(),
});
exports.AgentSkillPackageSchema = zod_1.z
  .object({
    scope: exports.AgentSkillScopeSchema,
    directoryName: exports.SkillNameSchema,
    frontmatter: exports.AgentSkillFrontmatterSchema,
    body: zod_1.z.string(),
  })
  .refine((value) => value.directoryName === value.frontmatter.name, {
    message: "SKILL.md frontmatter.name must match the parent directory name",
    path: ["frontmatter", "name"],
  });
// Diagnostics (invalid skill discovery)
exports.AgentSkillIssueSchema = zod_1.z.object({
  /** Directory name under the skills root (may be invalid / non-kebab-case). */
  directoryName: zod_1.z.string().min(1),
  scope: exports.AgentSkillScopeSchema,
  /** User-facing path to the problematic skill (typically .../<dir>/SKILL.md). */
  displayPath: zod_1.z.string().min(1),
  /** What went wrong while trying to load the skill. */
  message: zod_1.z.string().min(1),
  /** Optional fix suggestion. */
  hint: zod_1.z.string().min(1).optional(),
});
//# sourceMappingURL=agentSkill.js.map
