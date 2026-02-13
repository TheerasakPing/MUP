"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretSchema = exports.SecretValueSchema = void 0;
const zod_1 = require("zod");
/** A secret value can be a literal string, or an alias to another secret key. */
exports.SecretValueSchema = zod_1.z.union([
  zod_1.z.string(),
  zod_1.z
    .object({
      secret: zod_1.z.string(),
    })
    .strict(),
]);
exports.SecretSchema = zod_1.z
  .object({
    key: zod_1.z.string(),
    value: exports.SecretValueSchema,
  })
  .meta({
    description: "A key-value pair for storing sensitive configuration",
  });
//# sourceMappingURL=secrets.js.map
