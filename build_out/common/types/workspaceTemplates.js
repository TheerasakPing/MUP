"use strict";
/**
 * Workspace Template Types
 * Defines structure for pre-configured workspace setups
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TEMPLATES = void 0;
exports.DEFAULT_TEMPLATES = [
  {
    id: "feature-dev",
    name: "Feature Development",
    description: "Standard setup for implementing new features",
    runtime: "worktree",
    thinkingLevel: 2,
    created: Date.now(),
    isDefault: true,
  },
  {
    id: "bug-fix",
    name: "Bug Fix",
    description: "Quick setup for debugging and fixing issues",
    runtime: "local",
    thinkingLevel: 1,
    created: Date.now(),
    isDefault: true,
  },
  {
    id: "code-review",
    name: "Code Review",
    description: "Review-focused workspace with minimal context",
    runtime: "local",
    thinkingLevel: 0,
    created: Date.now(),
    isDefault: true,
  },
];
//# sourceMappingURL=workspaceTemplates.js.map
