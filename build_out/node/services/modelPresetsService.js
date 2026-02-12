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
exports.ModelPresetsService = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const write_file_atomic_1 = __importDefault(require("write-file-atomic"));
const log_1 = require("./log");
const EMPTY_FILE = { version: 1, presets: [] };
/**
 * Service for managing model presets.
 *
 * Presets let users snapshot their model configurations and restore them later.
 * Data is stored in `~/.mux/model-presets.json` using atomic writes.
 */
class ModelPresetsService {
    PRESETS_FILE = "model-presets.json";
    config;
    constructor(config) {
        this.config = config;
    }
    getFilePath() {
        return path.join(this.config.rootDir, this.PRESETS_FILE);
    }
    async readFile() {
        try {
            const data = await fs.readFile(this.getFilePath(), "utf-8");
            return JSON.parse(data);
        }
        catch (error) {
            if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
                return { ...EMPTY_FILE };
            }
            log_1.log.warn("[ModelPresetsService] Error reading presets file", { error });
            return { ...EMPTY_FILE };
        }
    }
    async writeFile(data) {
        const filePath = this.getFilePath();
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await (0, write_file_atomic_1.default)(filePath, JSON.stringify(data, null, 2));
    }
    /** List all saved presets. */
    async listPresets() {
        const file = await this.readFile();
        return file.presets;
    }
    /** Save a new preset from the provided models. */
    async savePreset(name, models, description) {
        const file = await this.readFile();
        const now = Date.now();
        const preset = {
            id: crypto.randomUUID(),
            name,
            description,
            createdAt: now,
            updatedAt: now,
            models,
        };
        file.presets.push(preset);
        await this.writeFile(file);
        return preset;
    }
    /** Get a single preset by ID. */
    async getPreset(id) {
        const file = await this.readFile();
        return file.presets.find((p) => p.id === id);
    }
    /** Delete a preset by ID. Returns success/error result. */
    async deletePreset(id) {
        const file = await this.readFile();
        const index = file.presets.findIndex((p) => p.id === id);
        if (index === -1) {
            return { success: false, error: `Preset not found: ${id}` };
        }
        file.presets.splice(index, 1);
        await this.writeFile(file);
        return { success: true, data: undefined };
    }
    /** Update an existing preset. */
    async updatePreset(id, updates) {
        const file = await this.readFile();
        const preset = file.presets.find((p) => p.id === id);
        if (!preset) {
            return { success: false, error: `Preset not found: ${id}` };
        }
        if (updates.name !== undefined)
            preset.name = updates.name;
        if (updates.description !== undefined)
            preset.description = updates.description;
        if (updates.models !== undefined)
            preset.models = updates.models;
        preset.updatedAt = Date.now();
        await this.writeFile(file);
        return { success: true, data: preset };
    }
    /**
     * Export presets as a portable JSON string.
     * If ids are provided, only those presets are exported; otherwise all.
     */
    async exportPresets(ids) {
        const file = await this.readFile();
        const presets = ids ? file.presets.filter((p) => ids.includes(p.id)) : file.presets;
        const exportData = { version: 1, presets };
        return JSON.stringify(exportData, null, 2);
    }
    /**
     * Import presets from a JSON string. Validates structure before importing.
     * Imported presets get new IDs to avoid collisions.
     */
    async importPresets(json) {
        let parsed;
        try {
            parsed = JSON.parse(json);
        }
        catch {
            return { success: false, error: "Invalid JSON" };
        }
        if (!parsed || typeof parsed !== "object") {
            return { success: false, error: "Expected an object with presets array" };
        }
        const obj = parsed;
        if (!Array.isArray(obj.presets)) {
            return { success: false, error: "Missing or invalid 'presets' array" };
        }
        const file = await this.readFile();
        const imported = [];
        const now = Date.now();
        for (const raw of obj.presets) {
            if (!raw || typeof raw !== "object")
                continue;
            const p = raw;
            if (typeof p.name !== "string" || !Array.isArray(p.models)) {
                continue; // skip malformed entries
            }
            const models = [];
            for (const m of p.models) {
                if (!m || typeof m !== "object")
                    continue;
                const model = m;
                if (typeof model.provider !== "string" || typeof model.modelId !== "string")
                    continue;
                models.push({
                    provider: model.provider,
                    modelId: model.modelId,
                    metadata: model.metadata,
                });
            }
            const preset = {
                id: crypto.randomUUID(), // new ID to avoid collision
                name: p.name,
                description: typeof p.description === "string" ? p.description : undefined,
                createdAt: now,
                updatedAt: now,
                models,
            };
            file.presets.push(preset);
            imported.push(preset);
        }
        if (imported.length === 0) {
            return { success: false, error: "No valid presets found in import data" };
        }
        await this.writeFile(file);
        return { success: true, data: imported };
    }
}
exports.ModelPresetsService = ModelPresetsService;
//# sourceMappingURL=modelPresetsService.js.map