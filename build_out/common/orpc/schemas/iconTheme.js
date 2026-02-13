"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iconTheme =
  exports.InstalledIconThemeSchema =
  exports.IconThemeDocumentSchema =
  exports.IconDefinitionSchema =
    void 0;
const zod_1 = require("zod");
exports.IconDefinitionSchema = zod_1.z.object({
  iconPath: zod_1.z.string(),
  fontCharacter: zod_1.z.string().optional(),
  fontColor: zod_1.z.string().optional(),
  fontSize: zod_1.z.string().optional(),
  fontId: zod_1.z.string().optional(),
});
// Recursive parts simplified for now to avoid deep nesting issues in Zod inference if not needed strictly
exports.IconThemeDocumentSchema = zod_1.z.object({
  fonts: zod_1.z.array(zod_1.z.unknown()).optional(),
  iconDefinitions: zod_1.z.record(zod_1.z.string(), exports.IconDefinitionSchema),
  file: zod_1.z.string().optional(),
  folder: zod_1.z.string().optional(),
  folderExpanded: zod_1.z.string().optional(),
  rootFolder: zod_1.z.string().optional(),
  rootFolderExpanded: zod_1.z.string().optional(),
  fileExtensions: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
  fileNames: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
  folderNames: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
  folderNamesExpanded: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
  languageIds: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
  hidesExplorerArrows: zod_1.z.boolean().optional(),
  light: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
  highContrast: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
});
exports.InstalledIconThemeSchema = zod_1.z.object({
  id: zod_1.z.string(),
  label: zod_1.z.string(),
  description: zod_1.z.string().optional(),
  publisher: zod_1.z.string().optional(),
  version: zod_1.z.string().optional(),
  themeDir: zod_1.z.string(),
  themeJsonPath: zod_1.z.string(),
  isBuiltin: zod_1.z.boolean(),
});
exports.iconTheme = {
  getActiveThemeId: {
    input: zod_1.z.void(),
    output: zod_1.z.string(),
  },
  setActiveTheme: {
    input: zod_1.z.object({ themeId: zod_1.z.string() }),
    output: zod_1.z.void(),
  },
  getInstalledThemes: {
    input: zod_1.z.void(),
    output: zod_1.z.array(exports.InstalledIconThemeSchema),
  },
  deleteTheme: {
    input: zod_1.z.object({ themeId: zod_1.z.string() }),
    output: zod_1.z.boolean(),
  },
  getActiveThemeDocument: {
    input: zod_1.z.void(),
    output: exports.IconThemeDocumentSchema.nullable(),
  },
  importVsix: {
    input: zod_1.z.object({ vsixBase64: zod_1.z.string() }),
    output: zod_1.z.object({
      importedThemeIds: zod_1.z.array(zod_1.z.string()),
      errors: zod_1.z.array(zod_1.z.string()),
    }),
  },
  getIconFile: {
    input: zod_1.z.object({ themeId: zod_1.z.string(), iconPath: zod_1.z.string() }),
    output: zod_1.z.object({ data: zod_1.z.string(), mimeType: zod_1.z.string() }).nullable(),
  },
};
//# sourceMappingURL=iconTheme.js.map
