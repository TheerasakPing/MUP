"use strict";
// Re-export all schemas from subdirectory modules
// This file serves as the single entry point for all schema imports
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPAddParamsSchema = exports.MuxProviderOptionsSchema = exports.PolicyRuntimeIdSchema = exports.PolicyGetResponseSchema = exports.EffectivePolicySchema = exports.PolicyStatusSchema = exports.PolicySourceSchema = exports.PolicyFileSchema = exports.SecretSchema = exports.FileTreeNodeSchema = exports.BashToolResultSchema = exports.StreamErrorTypeSchema = exports.SendMessageErrorSchema = exports.AgentIdSchema = exports.AgentDefinitionScopeSchema = exports.AgentDefinitionPackageSchema = exports.AgentDefinitionFrontmatterSchema = exports.AgentDefinitionDescriptorSchema = exports.SkillNameSchema = exports.AgentSkillScopeSchema = exports.AgentSkillPackageSchema = exports.AgentSkillIssueSchema = exports.AgentSkillFrontmatterSchema = exports.AgentSkillDescriptorSchema = exports.TokenConsumerSchema = exports.SessionUsageFileSchema = exports.ChatUsageDisplaySchema = exports.ChatUsageComponentSchema = exports.ChatStatsSchema = exports.WorkspaceStatsSnapshotSchema = exports.TimingAnomalySchema = exports.SessionTimingStatsSchema = exports.SessionTimingFileSchema = exports.ModelTimingStatsSchema = exports.CompletedStreamStatsSchema = exports.ActiveStreamStatsSchema = exports.WorkspaceMetadataSchema = exports.WorkspaceActivitySnapshotSchema = exports.GitStatusSchema = exports.FrontendWorkspaceMetadataSchema = exports.WorkspaceAISettingsSchema = exports.WorkspaceConfigSchema = exports.SectionConfigSchema = exports.ProjectConfigSchema = exports.DevcontainerConfigInfoSchema = exports.RuntimeAvailabilityStatusSchema = exports.RuntimeAvailabilitySchema = exports.RuntimeModeSchema = exports.RuntimeConfigSchema = exports.ResultSchema = void 0;
exports.TaskCreatedEventSchema = exports.BashOutputEventSchema = exports.ToolCallStartEventSchema = exports.ToolCallEndEventSchema = exports.ToolCallDeltaEventSchema = exports.StreamStartEventSchema = exports.StreamErrorMessageSchema = exports.StreamEndEventSchema = exports.StreamDeltaEventSchema = exports.StreamAbortEventSchema = exports.StreamAbortReasonSchema = exports.SendMessageOptionsSchema = exports.RuntimeStatusEventSchema = exports.RestoreToInputEventSchema = exports.ReasoningEndEventSchema = exports.ReasoningDeltaEventSchema = exports.QueuedMessageChangedEventSchema = exports.LanguageModelV2UsageSchema = exports.ErrorEventSchema = exports.DeleteMessageSchema = exports.CompletedMessagePartSchema = exports.ChatMuxMessageSchema = exports.CaughtUpMessageSchema = exports.MuxToolPartSchema = exports.MuxTextPartSchema = exports.MuxReasoningPartSchema = exports.MuxMessageSchema = exports.MuxFilePartSchema = exports.FilePartSchema = exports.DynamicToolPartSchema = exports.DynamicToolPartRedactedSchema = exports.DynamicToolPartPendingSchema = exports.DynamicToolPartAvailableSchema = exports.BranchListResultSchema = exports.TerminalSessionSchema = exports.TerminalResizeParamsSchema = exports.TerminalCreateParamsSchema = exports.RightSidebarWidthPresetSchema = exports.RightSidebarPresetTabSchema = exports.RightSidebarLayoutPresetStateSchema = exports.RightSidebarLayoutPresetNodeSchema = exports.LayoutSlotSchema = exports.LayoutPresetsConfigSchema = exports.LayoutPresetSchema = exports.KeybindSchema = exports.MCPTestResultSchema = exports.MCPTestParamsSchema = exports.MCPSetEnabledParamsSchema = exports.MCPServerMapSchema = exports.MCPRemoveParamsSchema = void 0;
exports.workspace = exports.window = exports.voice = exports.update = exports.tokenizer = exports.terminal = exports.signing = exports.TelemetryEventSchema = exports.telemetry = exports.ExperimentValueSchema = exports.experiments = exports.tasks = exports.splashScreens = exports.server = exports.ProvidersConfigMapSchema = exports.providers = exports.policy = exports.codexOauth = exports.muxGovernorOauth = exports.copilotOauth = exports.muxGatewayOauth = exports.muxGateway = exports.CustomModelMetadataSchema = exports.ProviderConfigInfoSchema = exports.secrets = exports.mcp = exports.mcpOauth = exports.projects = exports.nameGeneration = exports.agents = exports.agentSkills = exports.menu = exports.general = exports.features = exports.debug = exports.uiLayouts = exports.config = exports.CoderWorkspaceStatusSchema = exports.CoderWorkspaceSchema = exports.CoderWorkspaceConfigSchema = exports.CoderTemplateSchema = exports.CoderPresetSchema = exports.CoderInfoSchema = exports.coder = exports.AWSCredentialStatusSchema = exports.ApiServerStatusSchema = exports.WorkspaceInitEventSchema = exports.WorkspaceChatMessageSchema = exports.UsageDeltaEventSchema = exports.UpdateStatusSchema = void 0;
exports.InstalledIconThemeSchema = exports.IconThemeDocumentSchema = exports.iconTheme = exports.OverallStatusSchema = exports.CheckStatusSchema = exports.CheckResultSchema = exports.HealthCheckResultSchema = exports.modelHealth = exports.ModelPresetSchema = exports.modelPresets = void 0;
// Result helper
const result_1 = require("./schemas/result");
Object.defineProperty(exports, "ResultSchema", { enumerable: true, get: function () { return result_1.ResultSchema; } });
// Runtime schemas
const runtime_1 = require("./schemas/runtime");
Object.defineProperty(exports, "RuntimeConfigSchema", { enumerable: true, get: function () { return runtime_1.RuntimeConfigSchema; } });
Object.defineProperty(exports, "RuntimeModeSchema", { enumerable: true, get: function () { return runtime_1.RuntimeModeSchema; } });
Object.defineProperty(exports, "RuntimeAvailabilitySchema", { enumerable: true, get: function () { return runtime_1.RuntimeAvailabilitySchema; } });
Object.defineProperty(exports, "RuntimeAvailabilityStatusSchema", { enumerable: true, get: function () { return runtime_1.RuntimeAvailabilityStatusSchema; } });
Object.defineProperty(exports, "DevcontainerConfigInfoSchema", { enumerable: true, get: function () { return runtime_1.DevcontainerConfigInfoSchema; } });
// Project schemas
const project_1 = require("./schemas/project");
Object.defineProperty(exports, "ProjectConfigSchema", { enumerable: true, get: function () { return project_1.ProjectConfigSchema; } });
Object.defineProperty(exports, "SectionConfigSchema", { enumerable: true, get: function () { return project_1.SectionConfigSchema; } });
Object.defineProperty(exports, "WorkspaceConfigSchema", { enumerable: true, get: function () { return project_1.WorkspaceConfigSchema; } });
// Workspace schemas
const workspaceAiSettings_1 = require("./schemas/workspaceAiSettings");
Object.defineProperty(exports, "WorkspaceAISettingsSchema", { enumerable: true, get: function () { return workspaceAiSettings_1.WorkspaceAISettingsSchema; } });
const workspace_1 = require("./schemas/workspace");
Object.defineProperty(exports, "FrontendWorkspaceMetadataSchema", { enumerable: true, get: function () { return workspace_1.FrontendWorkspaceMetadataSchema; } });
Object.defineProperty(exports, "GitStatusSchema", { enumerable: true, get: function () { return workspace_1.GitStatusSchema; } });
Object.defineProperty(exports, "WorkspaceActivitySnapshotSchema", { enumerable: true, get: function () { return workspace_1.WorkspaceActivitySnapshotSchema; } });
Object.defineProperty(exports, "WorkspaceMetadataSchema", { enumerable: true, get: function () { return workspace_1.WorkspaceMetadataSchema; } });
// Workspace stats schemas
const workspaceStats_1 = require("./schemas/workspaceStats");
Object.defineProperty(exports, "ActiveStreamStatsSchema", { enumerable: true, get: function () { return workspaceStats_1.ActiveStreamStatsSchema; } });
Object.defineProperty(exports, "CompletedStreamStatsSchema", { enumerable: true, get: function () { return workspaceStats_1.CompletedStreamStatsSchema; } });
Object.defineProperty(exports, "ModelTimingStatsSchema", { enumerable: true, get: function () { return workspaceStats_1.ModelTimingStatsSchema; } });
Object.defineProperty(exports, "SessionTimingFileSchema", { enumerable: true, get: function () { return workspaceStats_1.SessionTimingFileSchema; } });
Object.defineProperty(exports, "SessionTimingStatsSchema", { enumerable: true, get: function () { return workspaceStats_1.SessionTimingStatsSchema; } });
Object.defineProperty(exports, "TimingAnomalySchema", { enumerable: true, get: function () { return workspaceStats_1.TimingAnomalySchema; } });
Object.defineProperty(exports, "WorkspaceStatsSnapshotSchema", { enumerable: true, get: function () { return workspaceStats_1.WorkspaceStatsSnapshotSchema; } });
// Chat stats schemas
const chatStats_1 = require("./schemas/chatStats");
Object.defineProperty(exports, "ChatStatsSchema", { enumerable: true, get: function () { return chatStats_1.ChatStatsSchema; } });
Object.defineProperty(exports, "ChatUsageComponentSchema", { enumerable: true, get: function () { return chatStats_1.ChatUsageComponentSchema; } });
Object.defineProperty(exports, "ChatUsageDisplaySchema", { enumerable: true, get: function () { return chatStats_1.ChatUsageDisplaySchema; } });
Object.defineProperty(exports, "SessionUsageFileSchema", { enumerable: true, get: function () { return chatStats_1.SessionUsageFileSchema; } });
Object.defineProperty(exports, "TokenConsumerSchema", { enumerable: true, get: function () { return chatStats_1.TokenConsumerSchema; } });
// Agent Skill schemas
const agentSkill_1 = require("./schemas/agentSkill");
Object.defineProperty(exports, "AgentSkillDescriptorSchema", { enumerable: true, get: function () { return agentSkill_1.AgentSkillDescriptorSchema; } });
Object.defineProperty(exports, "AgentSkillFrontmatterSchema", { enumerable: true, get: function () { return agentSkill_1.AgentSkillFrontmatterSchema; } });
Object.defineProperty(exports, "AgentSkillIssueSchema", { enumerable: true, get: function () { return agentSkill_1.AgentSkillIssueSchema; } });
Object.defineProperty(exports, "AgentSkillPackageSchema", { enumerable: true, get: function () { return agentSkill_1.AgentSkillPackageSchema; } });
Object.defineProperty(exports, "AgentSkillScopeSchema", { enumerable: true, get: function () { return agentSkill_1.AgentSkillScopeSchema; } });
Object.defineProperty(exports, "SkillNameSchema", { enumerable: true, get: function () { return agentSkill_1.SkillNameSchema; } });
// Error schemas
// Agent Definition schemas
const agentDefinition_1 = require("./schemas/agentDefinition");
Object.defineProperty(exports, "AgentDefinitionDescriptorSchema", { enumerable: true, get: function () { return agentDefinition_1.AgentDefinitionDescriptorSchema; } });
Object.defineProperty(exports, "AgentDefinitionFrontmatterSchema", { enumerable: true, get: function () { return agentDefinition_1.AgentDefinitionFrontmatterSchema; } });
Object.defineProperty(exports, "AgentDefinitionPackageSchema", { enumerable: true, get: function () { return agentDefinition_1.AgentDefinitionPackageSchema; } });
Object.defineProperty(exports, "AgentDefinitionScopeSchema", { enumerable: true, get: function () { return agentDefinition_1.AgentDefinitionScopeSchema; } });
Object.defineProperty(exports, "AgentIdSchema", { enumerable: true, get: function () { return agentDefinition_1.AgentIdSchema; } });
const errors_1 = require("./schemas/errors");
Object.defineProperty(exports, "SendMessageErrorSchema", { enumerable: true, get: function () { return errors_1.SendMessageErrorSchema; } });
Object.defineProperty(exports, "StreamErrorTypeSchema", { enumerable: true, get: function () { return errors_1.StreamErrorTypeSchema; } });
// Tool schemas
const tools_1 = require("./schemas/tools");
Object.defineProperty(exports, "BashToolResultSchema", { enumerable: true, get: function () { return tools_1.BashToolResultSchema; } });
Object.defineProperty(exports, "FileTreeNodeSchema", { enumerable: true, get: function () { return tools_1.FileTreeNodeSchema; } });
// Secrets schemas
const secrets_1 = require("./schemas/secrets");
Object.defineProperty(exports, "SecretSchema", { enumerable: true, get: function () { return secrets_1.SecretSchema; } });
// Policy schemas
const policy_1 = require("./schemas/policy");
Object.defineProperty(exports, "PolicyFileSchema", { enumerable: true, get: function () { return policy_1.PolicyFileSchema; } });
Object.defineProperty(exports, "PolicySourceSchema", { enumerable: true, get: function () { return policy_1.PolicySourceSchema; } });
Object.defineProperty(exports, "PolicyStatusSchema", { enumerable: true, get: function () { return policy_1.PolicyStatusSchema; } });
Object.defineProperty(exports, "EffectivePolicySchema", { enumerable: true, get: function () { return policy_1.EffectivePolicySchema; } });
Object.defineProperty(exports, "PolicyGetResponseSchema", { enumerable: true, get: function () { return policy_1.PolicyGetResponseSchema; } });
Object.defineProperty(exports, "PolicyRuntimeIdSchema", { enumerable: true, get: function () { return policy_1.PolicyRuntimeIdSchema; } });
// Provider options schemas
const providerOptions_1 = require("./schemas/providerOptions");
Object.defineProperty(exports, "MuxProviderOptionsSchema", { enumerable: true, get: function () { return providerOptions_1.MuxProviderOptionsSchema; } });
// MCP schemas
const mcp_1 = require("./schemas/mcp");
Object.defineProperty(exports, "MCPAddParamsSchema", { enumerable: true, get: function () { return mcp_1.MCPAddParamsSchema; } });
Object.defineProperty(exports, "MCPRemoveParamsSchema", { enumerable: true, get: function () { return mcp_1.MCPRemoveParamsSchema; } });
Object.defineProperty(exports, "MCPServerMapSchema", { enumerable: true, get: function () { return mcp_1.MCPServerMapSchema; } });
Object.defineProperty(exports, "MCPSetEnabledParamsSchema", { enumerable: true, get: function () { return mcp_1.MCPSetEnabledParamsSchema; } });
Object.defineProperty(exports, "MCPTestParamsSchema", { enumerable: true, get: function () { return mcp_1.MCPTestParamsSchema; } });
Object.defineProperty(exports, "MCPTestResultSchema", { enumerable: true, get: function () { return mcp_1.MCPTestResultSchema; } });
// UI Layouts schemas
const uiLayouts_1 = require("./schemas/uiLayouts");
Object.defineProperty(exports, "KeybindSchema", { enumerable: true, get: function () { return uiLayouts_1.KeybindSchema; } });
Object.defineProperty(exports, "LayoutPresetSchema", { enumerable: true, get: function () { return uiLayouts_1.LayoutPresetSchema; } });
Object.defineProperty(exports, "LayoutPresetsConfigSchema", { enumerable: true, get: function () { return uiLayouts_1.LayoutPresetsConfigSchema; } });
Object.defineProperty(exports, "LayoutSlotSchema", { enumerable: true, get: function () { return uiLayouts_1.LayoutSlotSchema; } });
Object.defineProperty(exports, "RightSidebarLayoutPresetNodeSchema", { enumerable: true, get: function () { return uiLayouts_1.RightSidebarLayoutPresetNodeSchema; } });
Object.defineProperty(exports, "RightSidebarLayoutPresetStateSchema", { enumerable: true, get: function () { return uiLayouts_1.RightSidebarLayoutPresetStateSchema; } });
Object.defineProperty(exports, "RightSidebarPresetTabSchema", { enumerable: true, get: function () { return uiLayouts_1.RightSidebarPresetTabSchema; } });
Object.defineProperty(exports, "RightSidebarWidthPresetSchema", { enumerable: true, get: function () { return uiLayouts_1.RightSidebarWidthPresetSchema; } });
// Terminal schemas
const terminal_1 = require("./schemas/terminal");
Object.defineProperty(exports, "TerminalCreateParamsSchema", { enumerable: true, get: function () { return terminal_1.TerminalCreateParamsSchema; } });
Object.defineProperty(exports, "TerminalResizeParamsSchema", { enumerable: true, get: function () { return terminal_1.TerminalResizeParamsSchema; } });
Object.defineProperty(exports, "TerminalSessionSchema", { enumerable: true, get: function () { return terminal_1.TerminalSessionSchema; } });
// Message schemas
const message_1 = require("./schemas/message");
Object.defineProperty(exports, "BranchListResultSchema", { enumerable: true, get: function () { return message_1.BranchListResultSchema; } });
Object.defineProperty(exports, "DynamicToolPartAvailableSchema", { enumerable: true, get: function () { return message_1.DynamicToolPartAvailableSchema; } });
Object.defineProperty(exports, "DynamicToolPartPendingSchema", { enumerable: true, get: function () { return message_1.DynamicToolPartPendingSchema; } });
Object.defineProperty(exports, "DynamicToolPartRedactedSchema", { enumerable: true, get: function () { return message_1.DynamicToolPartRedactedSchema; } });
Object.defineProperty(exports, "DynamicToolPartSchema", { enumerable: true, get: function () { return message_1.DynamicToolPartSchema; } });
Object.defineProperty(exports, "FilePartSchema", { enumerable: true, get: function () { return message_1.FilePartSchema; } });
Object.defineProperty(exports, "MuxFilePartSchema", { enumerable: true, get: function () { return message_1.MuxFilePartSchema; } });
Object.defineProperty(exports, "MuxMessageSchema", { enumerable: true, get: function () { return message_1.MuxMessageSchema; } });
Object.defineProperty(exports, "MuxReasoningPartSchema", { enumerable: true, get: function () { return message_1.MuxReasoningPartSchema; } });
Object.defineProperty(exports, "MuxTextPartSchema", { enumerable: true, get: function () { return message_1.MuxTextPartSchema; } });
Object.defineProperty(exports, "MuxToolPartSchema", { enumerable: true, get: function () { return message_1.MuxToolPartSchema; } });
// Stream event schemas
const stream_1 = require("./schemas/stream");
Object.defineProperty(exports, "CaughtUpMessageSchema", { enumerable: true, get: function () { return stream_1.CaughtUpMessageSchema; } });
Object.defineProperty(exports, "ChatMuxMessageSchema", { enumerable: true, get: function () { return stream_1.ChatMuxMessageSchema; } });
Object.defineProperty(exports, "CompletedMessagePartSchema", { enumerable: true, get: function () { return stream_1.CompletedMessagePartSchema; } });
Object.defineProperty(exports, "DeleteMessageSchema", { enumerable: true, get: function () { return stream_1.DeleteMessageSchema; } });
Object.defineProperty(exports, "ErrorEventSchema", { enumerable: true, get: function () { return stream_1.ErrorEventSchema; } });
Object.defineProperty(exports, "LanguageModelV2UsageSchema", { enumerable: true, get: function () { return stream_1.LanguageModelV2UsageSchema; } });
Object.defineProperty(exports, "QueuedMessageChangedEventSchema", { enumerable: true, get: function () { return stream_1.QueuedMessageChangedEventSchema; } });
Object.defineProperty(exports, "ReasoningDeltaEventSchema", { enumerable: true, get: function () { return stream_1.ReasoningDeltaEventSchema; } });
Object.defineProperty(exports, "ReasoningEndEventSchema", { enumerable: true, get: function () { return stream_1.ReasoningEndEventSchema; } });
Object.defineProperty(exports, "RestoreToInputEventSchema", { enumerable: true, get: function () { return stream_1.RestoreToInputEventSchema; } });
Object.defineProperty(exports, "RuntimeStatusEventSchema", { enumerable: true, get: function () { return stream_1.RuntimeStatusEventSchema; } });
Object.defineProperty(exports, "SendMessageOptionsSchema", { enumerable: true, get: function () { return stream_1.SendMessageOptionsSchema; } });
Object.defineProperty(exports, "StreamAbortReasonSchema", { enumerable: true, get: function () { return stream_1.StreamAbortReasonSchema; } });
Object.defineProperty(exports, "StreamAbortEventSchema", { enumerable: true, get: function () { return stream_1.StreamAbortEventSchema; } });
Object.defineProperty(exports, "StreamDeltaEventSchema", { enumerable: true, get: function () { return stream_1.StreamDeltaEventSchema; } });
Object.defineProperty(exports, "StreamEndEventSchema", { enumerable: true, get: function () { return stream_1.StreamEndEventSchema; } });
Object.defineProperty(exports, "StreamErrorMessageSchema", { enumerable: true, get: function () { return stream_1.StreamErrorMessageSchema; } });
Object.defineProperty(exports, "StreamStartEventSchema", { enumerable: true, get: function () { return stream_1.StreamStartEventSchema; } });
Object.defineProperty(exports, "ToolCallDeltaEventSchema", { enumerable: true, get: function () { return stream_1.ToolCallDeltaEventSchema; } });
Object.defineProperty(exports, "ToolCallEndEventSchema", { enumerable: true, get: function () { return stream_1.ToolCallEndEventSchema; } });
Object.defineProperty(exports, "ToolCallStartEventSchema", { enumerable: true, get: function () { return stream_1.ToolCallStartEventSchema; } });
Object.defineProperty(exports, "BashOutputEventSchema", { enumerable: true, get: function () { return stream_1.BashOutputEventSchema; } });
Object.defineProperty(exports, "TaskCreatedEventSchema", { enumerable: true, get: function () { return stream_1.TaskCreatedEventSchema; } });
Object.defineProperty(exports, "UpdateStatusSchema", { enumerable: true, get: function () { return stream_1.UpdateStatusSchema; } });
Object.defineProperty(exports, "UsageDeltaEventSchema", { enumerable: true, get: function () { return stream_1.UsageDeltaEventSchema; } });
Object.defineProperty(exports, "WorkspaceChatMessageSchema", { enumerable: true, get: function () { return stream_1.WorkspaceChatMessageSchema; } });
Object.defineProperty(exports, "WorkspaceInitEventSchema", { enumerable: true, get: function () { return stream_1.WorkspaceInitEventSchema; } });
// API router schemas
const api_1 = require("./schemas/api");
Object.defineProperty(exports, "ApiServerStatusSchema", { enumerable: true, get: function () { return api_1.ApiServerStatusSchema; } });
Object.defineProperty(exports, "AWSCredentialStatusSchema", { enumerable: true, get: function () { return api_1.AWSCredentialStatusSchema; } });
Object.defineProperty(exports, "coder", { enumerable: true, get: function () { return api_1.coder; } });
Object.defineProperty(exports, "CoderInfoSchema", { enumerable: true, get: function () { return api_1.CoderInfoSchema; } });
Object.defineProperty(exports, "CoderPresetSchema", { enumerable: true, get: function () { return api_1.CoderPresetSchema; } });
Object.defineProperty(exports, "CoderTemplateSchema", { enumerable: true, get: function () { return api_1.CoderTemplateSchema; } });
Object.defineProperty(exports, "CoderWorkspaceConfigSchema", { enumerable: true, get: function () { return api_1.CoderWorkspaceConfigSchema; } });
Object.defineProperty(exports, "CoderWorkspaceSchema", { enumerable: true, get: function () { return api_1.CoderWorkspaceSchema; } });
Object.defineProperty(exports, "CoderWorkspaceStatusSchema", { enumerable: true, get: function () { return api_1.CoderWorkspaceStatusSchema; } });
Object.defineProperty(exports, "config", { enumerable: true, get: function () { return api_1.config; } });
Object.defineProperty(exports, "uiLayouts", { enumerable: true, get: function () { return api_1.uiLayouts; } });
Object.defineProperty(exports, "debug", { enumerable: true, get: function () { return api_1.debug; } });
Object.defineProperty(exports, "features", { enumerable: true, get: function () { return api_1.features; } });
Object.defineProperty(exports, "general", { enumerable: true, get: function () { return api_1.general; } });
Object.defineProperty(exports, "menu", { enumerable: true, get: function () { return api_1.menu; } });
Object.defineProperty(exports, "agentSkills", { enumerable: true, get: function () { return api_1.agentSkills; } });
Object.defineProperty(exports, "agents", { enumerable: true, get: function () { return api_1.agents; } });
Object.defineProperty(exports, "nameGeneration", { enumerable: true, get: function () { return api_1.nameGeneration; } });
Object.defineProperty(exports, "projects", { enumerable: true, get: function () { return api_1.projects; } });
Object.defineProperty(exports, "mcpOauth", { enumerable: true, get: function () { return api_1.mcpOauth; } });
Object.defineProperty(exports, "mcp", { enumerable: true, get: function () { return api_1.mcp; } });
Object.defineProperty(exports, "secrets", { enumerable: true, get: function () { return api_1.secrets; } });
Object.defineProperty(exports, "ProviderConfigInfoSchema", { enumerable: true, get: function () { return api_1.ProviderConfigInfoSchema; } });
Object.defineProperty(exports, "CustomModelMetadataSchema", { enumerable: true, get: function () { return api_1.CustomModelMetadataSchema; } });
Object.defineProperty(exports, "muxGateway", { enumerable: true, get: function () { return api_1.muxGateway; } });
Object.defineProperty(exports, "muxGatewayOauth", { enumerable: true, get: function () { return api_1.muxGatewayOauth; } });
Object.defineProperty(exports, "copilotOauth", { enumerable: true, get: function () { return api_1.copilotOauth; } });
Object.defineProperty(exports, "muxGovernorOauth", { enumerable: true, get: function () { return api_1.muxGovernorOauth; } });
Object.defineProperty(exports, "codexOauth", { enumerable: true, get: function () { return api_1.codexOauth; } });
Object.defineProperty(exports, "policy", { enumerable: true, get: function () { return api_1.policy; } });
Object.defineProperty(exports, "providers", { enumerable: true, get: function () { return api_1.providers; } });
Object.defineProperty(exports, "ProvidersConfigMapSchema", { enumerable: true, get: function () { return api_1.ProvidersConfigMapSchema; } });
Object.defineProperty(exports, "server", { enumerable: true, get: function () { return api_1.server; } });
Object.defineProperty(exports, "splashScreens", { enumerable: true, get: function () { return api_1.splashScreens; } });
Object.defineProperty(exports, "tasks", { enumerable: true, get: function () { return api_1.tasks; } });
Object.defineProperty(exports, "experiments", { enumerable: true, get: function () { return api_1.experiments; } });
Object.defineProperty(exports, "ExperimentValueSchema", { enumerable: true, get: function () { return api_1.ExperimentValueSchema; } });
Object.defineProperty(exports, "telemetry", { enumerable: true, get: function () { return api_1.telemetry; } });
Object.defineProperty(exports, "TelemetryEventSchema", { enumerable: true, get: function () { return api_1.TelemetryEventSchema; } });
Object.defineProperty(exports, "signing", { enumerable: true, get: function () { return api_1.signing; } });
Object.defineProperty(exports, "terminal", { enumerable: true, get: function () { return api_1.terminal; } });
Object.defineProperty(exports, "tokenizer", { enumerable: true, get: function () { return api_1.tokenizer; } });
Object.defineProperty(exports, "update", { enumerable: true, get: function () { return api_1.update; } });
Object.defineProperty(exports, "voice", { enumerable: true, get: function () { return api_1.voice; } });
Object.defineProperty(exports, "window", { enumerable: true, get: function () { return api_1.window; } });
Object.defineProperty(exports, "workspace", { enumerable: true, get: function () { return api_1.workspace; } });
Object.defineProperty(exports, "modelPresets", { enumerable: true, get: function () { return api_1.modelPresets; } });
Object.defineProperty(exports, "ModelPresetSchema", { enumerable: true, get: function () { return api_1.ModelPresetSchema; } });
Object.defineProperty(exports, "modelHealth", { enumerable: true, get: function () { return api_1.modelHealth; } });
Object.defineProperty(exports, "HealthCheckResultSchema", { enumerable: true, get: function () { return api_1.HealthCheckResultSchema; } });
Object.defineProperty(exports, "CheckResultSchema", { enumerable: true, get: function () { return api_1.CheckResultSchema; } });
Object.defineProperty(exports, "CheckStatusSchema", { enumerable: true, get: function () { return api_1.CheckStatusSchema; } });
Object.defineProperty(exports, "OverallStatusSchema", { enumerable: true, get: function () { return api_1.OverallStatusSchema; } });
// Icon Theme schemas
const iconTheme_1 = require("./schemas/iconTheme");
Object.defineProperty(exports, "iconTheme", { enumerable: true, get: function () { return iconTheme_1.iconTheme; } });
Object.defineProperty(exports, "IconThemeDocumentSchema", { enumerable: true, get: function () { return iconTheme_1.IconThemeDocumentSchema; } });
Object.defineProperty(exports, "InstalledIconThemeSchema", { enumerable: true, get: function () { return iconTheme_1.InstalledIconThemeSchema; } });
//# sourceMappingURL=schemas.js.map