"use strict";
/**
 * Model Health Check Service
 *
 * Validates model configurations by running a series of checks:
 * 1. Authentication  - Verify provider credentials are configured
 * 2. Model Exists    - Check if model ID is recognized (built-in) or custom
 * 3. Token Limits    - Validate configured limits are reasonable
 * 4. Pricing         - Sanity-check custom pricing values
 * 5. Connectivity    - Basic reachability check (provider base URL validation)
 */
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
exports.ModelHealthService = void 0;
const knownModels_1 = require("../../common/constants/knownModels");
const providers_1 = require("../../common/constants/providers");
const providerRequirements_1 = require("../../node/utils/providerRequirements");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ────────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────────
class ModelHealthService {
    config;
    cache = new Map();
    constructor(config) {
        this.config = config;
    }
    async checkModel(provider, modelId, customMetadata) {
        const authentication = this.checkAuthentication(provider);
        const modelExists = this.checkModelExists(provider, modelId);
        const tokenLimits = this.checkTokenLimits(customMetadata);
        const pricing = this.checkPricing(customMetadata);
        const connectivity = this.checkConnectivity(provider);
        const checks = { authentication, modelExists, tokenLimits, pricing, connectivity };
        const statuses = Object.values(checks).map((c) => c.status);
        let status = "healthy";
        if (statuses.some((s) => s === "fail"))
            status = "error";
        else if (statuses.some((s) => s === "warn"))
            status = "warning";
        const result = {
            modelId,
            provider,
            timestamp: Date.now(),
            status,
            checks,
        };
        this.cache.set(`${provider}:${modelId}`, result);
        return result;
    }
    async checkAllModels(models) {
        const results = [];
        for (const m of models) {
            results.push(await this.checkModel(m.provider, m.modelId, m.metadata));
        }
        return results;
    }
    getLastResults() {
        return Array.from(this.cache.values());
    }
    // ────────────── Individual checks ──────────────
    checkAuthentication(provider) {
        try {
            const rawConfig = this.loadProviderConfig(provider);
            if (!rawConfig) {
                return {
                    status: "warn",
                    message: "No provider config found",
                    details: "Provider section missing from providers.jsonc",
                };
            }
            if (!providers_1.SUPPORTED_PROVIDERS.includes(provider)) {
                const hasKey = typeof rawConfig.apiKey === "string" && rawConfig.apiKey.length > 0;
                return hasKey
                    ? { status: "pass", message: "API key present (custom provider)" }
                    : { status: "warn", message: "No API key found for custom provider" };
            }
            const creds = (0, providerRequirements_1.resolveProviderCredentials)(provider, rawConfig);
            if (creds.isConfigured) {
                return { status: "pass", message: "Credentials configured" };
            }
            return {
                status: "fail",
                message: `Missing ${creds.missingRequirement ?? "credentials"}`,
                details: `Provider "${provider}" requires ${creds.missingRequirement ?? "credentials"} to be set`,
            };
        }
        catch {
            return { status: "fail", message: "Error checking authentication" };
        }
    }
    checkModelExists(provider, modelId) {
        const fullId = `${provider}:${modelId}`;
        const known = knownModels_1.KNOWN_MODELS[fullId];
        if (known) {
            return { status: "pass", message: "Built-in model recognized" };
        }
        const knownByAlias = Object.values(knownModels_1.KNOWN_MODELS).find((m) => m.provider === provider && m.aliases?.includes(modelId));
        if (knownByAlias) {
            return { status: "pass", message: `Known model (alias of ${knownByAlias.id})` };
        }
        return {
            status: "warn",
            message: "Custom model — not in built-in registry",
            details: "Model may still work if the provider supports it. Verify by sending a test request.",
        };
    }
    checkTokenLimits(customMetadata) {
        if (!customMetadata?.maxInputTokens && !customMetadata?.maxOutputTokens) {
            return { status: "skip", message: "No custom token limits configured" };
        }
        const warnings = [];
        if (customMetadata.maxInputTokens && customMetadata.maxInputTokens < 1000) {
            warnings.push(`Input token limit (${customMetadata.maxInputTokens}) seems very low`);
        }
        if (customMetadata.maxOutputTokens && customMetadata.maxOutputTokens < 100) {
            warnings.push(`Output token limit (${customMetadata.maxOutputTokens}) seems very low`);
        }
        if (customMetadata.maxInputTokens &&
            customMetadata.maxOutputTokens &&
            customMetadata.maxOutputTokens > customMetadata.maxInputTokens) {
            warnings.push("Output limit exceeds input limit — this is unusual");
        }
        if (warnings.length > 0) {
            return {
                status: "warn",
                message: "Token limit configuration may need review",
                details: warnings.join("; "),
            };
        }
        return { status: "pass", message: "Token limits look reasonable" };
    }
    checkPricing(customMetadata) {
        if (!customMetadata?.inputCostPerToken && !customMetadata?.outputCostPerToken) {
            return { status: "skip", message: "No custom pricing configured" };
        }
        const warnings = [];
        if (customMetadata.inputCostPerToken && customMetadata.inputCostPerToken < 0) {
            warnings.push("Input cost per token is negative");
        }
        if (customMetadata.outputCostPerToken && customMetadata.outputCostPerToken < 0) {
            warnings.push("Output cost per token is negative");
        }
        if (customMetadata.inputCostPerToken &&
            customMetadata.outputCostPerToken &&
            customMetadata.inputCostPerToken > customMetadata.outputCostPerToken) {
            warnings.push("Input cost is higher than output cost — this is unusual for most providers");
        }
        if (warnings.length > 0) {
            return {
                status: "warn",
                message: "Pricing configuration may need review",
                details: warnings.join("; "),
            };
        }
        return { status: "pass", message: "Pricing looks reasonable" };
    }
    checkConnectivity(provider) {
        try {
            const rawConfig = this.loadProviderConfig(provider);
            if (!rawConfig) {
                return { status: "skip", message: "No provider config — skipping connectivity" };
            }
            if (rawConfig.baseUrl || rawConfig.baseURL) {
                const url = rawConfig.baseUrl ?? rawConfig.baseURL ?? "";
                try {
                    new URL(url);
                    return { status: "pass", message: `Custom base URL configured: ${url}` };
                }
                catch {
                    return {
                        status: "fail",
                        message: "Invalid base URL",
                        details: `"${url}" is not a valid URL`,
                    };
                }
            }
            return { status: "pass", message: "Using default provider endpoint" };
        }
        catch {
            return { status: "warn", message: "Unable to check connectivity" };
        }
    }
    // ────────────── Helpers ──────────────
    loadProviderConfig(provider) {
        try {
            const providersFile = path.join(this.config.rootDir, "providers.jsonc");
            if (!fs.existsSync(providersFile))
                return null;
            const raw = fs.readFileSync(providersFile, "utf-8");
            const stripped = raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
            const parsed = JSON.parse(stripped);
            const providerConfig = parsed[provider];
            if (!providerConfig || typeof providerConfig !== "object")
                return null;
            return providerConfig;
        }
        catch {
            return null;
        }
    }
}
exports.ModelHealthService = ModelHealthService;
//# sourceMappingURL=modelHealthService.js.map