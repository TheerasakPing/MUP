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
exports.IconThemeService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const jszip_1 = __importDefault(require("jszip"));
const log_1 = require("../../node/services/log");
const iconTheme_1 = require("../../common/types/iconTheme");
const paths_1 = require("../../common/constants/paths");
/**
 * Service to manage icon themes in MUP.
 * Handles loading, activating, and listing icon themes.
 */
class IconThemeService {
    config;
    iconThemesDir;
    constructor(config) {
        this.config = config;
        this.iconThemesDir = path.join((0, paths_1.getMuxHome)(), "icon-themes");
        // Ensure icon themes directory exists
        if (!fs.existsSync(this.iconThemesDir)) {
            try {
                fs.mkdirSync(this.iconThemesDir, { recursive: true });
            }
            catch (err) {
                log_1.log.error("Failed to create icon themes directory:", err);
            }
        }
    }
    /**
     * Get the ID of the currently active icon theme.
     */
    getActiveThemeId() {
        const config = this.config.loadConfigOrDefault();
        return config.iconThemeConfig?.activeThemeId ?? iconTheme_1.DEFAULT_MUP_THEME_ID;
    }
    /**
     * Set the active icon theme.
     */
    async setActiveTheme(themeId) {
        await this.config.editConfig((config) => {
            const currentConfig = config.iconThemeConfig ?? {
                activeThemeId: iconTheme_1.DEFAULT_MUP_THEME_ID,
                installedThemes: [],
            };
            return {
                ...config,
                iconThemeConfig: {
                    ...currentConfig,
                    activeThemeId: themeId,
                },
            };
        });
        log_1.log.info(`Active icon theme set to: ${themeId}`);
    }
    /**
     * Get the list of all installed icon themes.
     */
    getInstalledThemes() {
        const config = this.config.loadConfigOrDefault();
        const installed = config.iconThemeConfig?.installedThemes ?? [];
        // Always include the built-in MUP default theme if not present
        const hasDefault = installed.some((t) => t.id === iconTheme_1.DEFAULT_MUP_THEME_ID);
        if (!hasDefault) {
            return [this.getBuiltinThemeDefinition(), ...installed];
        }
        return installed;
    }
    /**
     * Get the built-in MUP default theme definition.
     * This theme uses the legacy hardcoded icons.
     */
    getBuiltinThemeDefinition() {
        // For now, the built-in theme doesn't have a real JSON file or folder on disk
        // In Phase 5, we will bundle it properly.
        return {
            id: iconTheme_1.DEFAULT_MUP_THEME_ID,
            label: "MUP Default",
            description: "Default MUP file icons",
            isBuiltin: true,
            themeDir: "", // Built-in, handled specially on frontend
            themeJsonPath: "",
        };
    }
    /**
     * Get the IconThemeDocument for the currently active theme.
     */
    async getActiveThemeDocument() {
        const activeId = this.getActiveThemeId();
        return this.loadThemeDocument(activeId);
    }
    /**
     * Load the IconThemeDocument (JSON) for a given theme ID.
     * Returns null if theme not found or invalid.
     */
    async loadThemeDocument(themeId) {
        if (themeId === iconTheme_1.DEFAULT_MUP_THEME_ID) {
            // Built-in theme is handled by frontend fallback logic for now (Phase 3/5)
            // or we could return a minimal JSON here.
            return null;
        }
        const themes = this.getInstalledThemes();
        const theme = themes.find((t) => t.id === themeId);
        if (!theme) {
            log_1.log.warn(`Icon theme not found: ${themeId}`);
            return null;
        }
        try {
            const jsonPath = path.join(theme.themeDir, theme.themeJsonPath);
            if (!fs.existsSync(jsonPath)) {
                log_1.log.error(`Icon theme JSON file missing: ${jsonPath}`);
                return null;
            }
            const content = await fs.promises.readFile(jsonPath, "utf-8");
            const doc = JSON.parse(content);
            // Resolve iconPath values: they are relative to the JSON file, but the
            // static file server serves from themeDir. Rewrite them to be relative
            // to the theme root so the frontend can use them directly.
            const jsonDir = path.posix.dirname(theme.themeJsonPath.replace(/\\/g, "/"));
            if (doc.iconDefinitions) {
                for (const def of Object.values(doc.iconDefinitions)) {
                    if (def.iconPath) {
                        // e.g. jsonDir="dist/macchiato", iconPath="./icons/git.svg"
                        // → "dist/macchiato/icons/git.svg"
                        const joined = path.posix.join(jsonDir, def.iconPath.replace(/\\/g, "/"));
                        // Normalize away any ".." or "." segments
                        def.iconPath = path.posix.normalize(joined);
                    }
                }
            }
            return doc;
        }
        catch (err) {
            log_1.log.error(`Failed to load icon theme ${themeId}:`, err);
            return null;
        }
    }
    /**
     * Delete an installed theme by ID.
     * Cannot delete built-in themes.
     */
    async deleteTheme(themeId) {
        if (themeId === iconTheme_1.DEFAULT_MUP_THEME_ID) {
            return false; // Cannot delete built-in theme
        }
        const config = this.config.loadConfigOrDefault();
        const installed = config.iconThemeConfig?.installedThemes ?? [];
        const themeIndex = installed.findIndex((t) => t.id === themeId);
        if (themeIndex === -1) {
            return false; // Theme not found
        }
        const theme = installed[themeIndex];
        if (theme.isBuiltin) {
            return false; // Should satisfy check above, but safe guard
        }
        // 1. Remove from config
        await this.config.editConfig((cfg) => {
            const currentConfig = cfg.iconThemeConfig;
            if (!currentConfig)
                return cfg;
            const newInstalled = [...currentConfig.installedThemes];
            newInstalled.splice(themeIndex, 1);
            // If deleted theme was active, revert to default
            let newActiveId = currentConfig.activeThemeId;
            if (newActiveId === themeId) {
                newActiveId = iconTheme_1.DEFAULT_MUP_THEME_ID;
            }
            return {
                ...cfg,
                iconThemeConfig: {
                    ...currentConfig,
                    activeThemeId: newActiveId,
                    installedThemes: newInstalled,
                },
            };
        });
        // 2. Delete files from disk
        try {
            if (theme.themeDir && theme.themeDir.startsWith(this.iconThemesDir)) {
                await fs.promises.rm(theme.themeDir, { recursive: true, force: true });
                log_1.log.info(`Deleted icon theme files: ${theme.themeDir}`);
            }
        }
        catch (err) {
            log_1.log.error(`Failed to delete theme directory: ${theme.themeDir}`, err);
            // We still return true because it's removed from config
        }
        return true;
    }
    /**
     * Import an icon theme from a .vsix file (base64-encoded).
     * Extracts the ZIP, parses package.json for contributes.iconThemes,
     * stores the theme files to disk, and registers in config.
     */
    async importVsix(vsixBase64) {
        const importedThemeIds = [];
        const errors = [];
        try {
            const buffer = Buffer.from(vsixBase64, "base64");
            const zip = await jszip_1.default.loadAsync(buffer);
            // Find package.json inside the extension
            const packageJsonFile = zip.file("extension/package.json") ?? zip.file("package.json");
            if (!packageJsonFile) {
                return { importedThemeIds, errors: ["No package.json found in .vsix"] };
            }
            const packageJsonStr = await packageJsonFile.async("string");
            const packageJson = JSON.parse(packageJsonStr);
            const iconThemes = packageJson.contributes?.iconThemes;
            if (!iconThemes || iconThemes.length === 0) {
                return { importedThemeIds, errors: ["No icon themes found in extension contributes"] };
            }
            // Determine the prefix for files inside the ZIP
            // .vsix files typically have files under "extension/"
            const hasExtensionPrefix = zip.file("extension/package.json") !== null;
            const zipPrefix = hasExtensionPrefix ? "extension/" : "";
            for (const themeContrib of iconThemes) {
                try {
                    const themeId = `${packageJson.publisher ?? "unknown"}.${packageJson.name ?? "unknown"}-${themeContrib.id}`;
                    const themeDir = path.join(this.iconThemesDir, themeId);
                    // Clean existing directory if re-importing
                    if (fs.existsSync(themeDir)) {
                        await fs.promises.rm(themeDir, { recursive: true, force: true });
                    }
                    await fs.promises.mkdir(themeDir, { recursive: true });
                    // Extract all files from extension/ to the theme directory
                    const zipEntries = Object.keys(zip.files);
                    for (const entryName of zipEntries) {
                        const entry = zip.files[entryName];
                        if (entry.dir)
                            continue;
                        if (!entryName.startsWith(zipPrefix))
                            continue;
                        // Strip the prefix to get relative path
                        const relativePath = entryName.slice(zipPrefix.length);
                        if (!relativePath)
                            continue;
                        const targetPath = path.join(themeDir, relativePath);
                        const targetDir = path.dirname(targetPath);
                        // Security: ensure target stays within themeDir
                        const resolvedTarget = path.resolve(targetPath);
                        const resolvedThemeDir = path.resolve(themeDir);
                        if (!resolvedTarget.startsWith(resolvedThemeDir)) {
                            log_1.log.warn(`Skipping suspicious path in .vsix: ${entryName}`);
                            continue;
                        }
                        await fs.promises.mkdir(targetDir, { recursive: true });
                        const content = await entry.async("nodebuffer");
                        await fs.promises.writeFile(targetPath, content);
                    }
                    // Normalize the theme JSON path (remove leading ./)
                    const themeJsonPath = themeContrib.path.replace(/^\.[\/\\]/, "");
                    // Verify the theme JSON file was extracted
                    const fullThemeJsonPath = path.join(themeDir, themeJsonPath);
                    if (!fs.existsSync(fullThemeJsonPath)) {
                        errors.push(`Theme JSON not found after extraction: ${themeJsonPath}`);
                        continue;
                    }
                    // Register the theme in config
                    const newTheme = {
                        id: themeId,
                        label: themeContrib.label || packageJson.displayName || themeContrib.id,
                        description: `Imported from ${packageJson.publisher ?? "unknown"}.${packageJson.name ?? "unknown"}`,
                        publisher: packageJson.publisher,
                        version: packageJson.version,
                        themeDir,
                        themeJsonPath,
                        isBuiltin: false,
                    };
                    await this.config.editConfig((cfg) => {
                        const currentConfig = cfg.iconThemeConfig ?? {
                            activeThemeId: iconTheme_1.DEFAULT_MUP_THEME_ID,
                            installedThemes: [],
                        };
                        // Remove existing theme with same ID if re-importing
                        const filteredThemes = currentConfig.installedThemes.filter((t) => t.id !== themeId);
                        return {
                            ...cfg,
                            iconThemeConfig: {
                                ...currentConfig,
                                installedThemes: [...filteredThemes, newTheme],
                            },
                        };
                    });
                    importedThemeIds.push(themeId);
                    log_1.log.info(`Imported icon theme: ${themeId} → ${themeDir}`);
                }
                catch (themeErr) {
                    const msg = themeErr instanceof Error ? themeErr.message : String(themeErr);
                    errors.push(`Failed to import theme ${themeContrib.id}: ${msg}`);
                    log_1.log.error(`Failed to import theme ${themeContrib.id}:`, themeErr);
                }
            }
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            errors.push(`Failed to parse .vsix file: ${msg}`);
            log_1.log.error("Failed to parse .vsix file:", err);
        }
        return { importedThemeIds, errors };
    }
    /**
     * Get the content of an icon file from a theme directory.
     * Returns base64-encoded data and MIME type.
     */
    async getIconFile(themeId, iconPath) {
        const themes = this.getInstalledThemes();
        const theme = themes.find((t) => t.id === themeId);
        if (!theme?.themeDir)
            return null;
        // Resolve and validate path (prevent traversal)
        const fullPath = path.resolve(theme.themeDir, iconPath);
        const resolvedThemeDir = path.resolve(theme.themeDir);
        if (!fullPath.startsWith(resolvedThemeDir)) {
            log_1.log.warn(`Path traversal attempt blocked: ${iconPath}`);
            return null;
        }
        if (!fs.existsSync(fullPath))
            return null;
        const content = await fs.promises.readFile(fullPath);
        const ext = path.extname(fullPath).toLowerCase();
        const mimeType = this.getMimeType(ext);
        return {
            data: content.toString("base64"),
            mimeType,
        };
    }
    /**
     * Get the base directory path for icon themes (for static file serving).
     */
    getIconThemesDir() {
        return this.iconThemesDir;
    }
    getMimeType(ext) {
        const mimeMap = {
            ".svg": "image/svg+xml",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".webp": "image/webp",
            ".ico": "image/x-icon",
            ".woff": "font/woff",
            ".woff2": "font/woff2",
            ".ttf": "font/ttf",
        };
        return mimeMap[ext] ?? "application/octet-stream";
    }
}
exports.IconThemeService = IconThemeService;
//# sourceMappingURL=iconThemeService.js.map