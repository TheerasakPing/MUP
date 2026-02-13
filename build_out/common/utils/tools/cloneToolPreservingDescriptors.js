"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneToolPreservingDescriptors = cloneToolPreservingDescriptors;
const assert_1 = __importDefault(require("../../../common/utils/assert"));
/**
 * Shallow-clone a Tool preserving property descriptors (getters, etc.).
 *
 * This avoids invoking getters during cloning, which matters for some
 * dynamic tools. Used whenever we need a writable copy of a frozen tool
 * object (e.g., to override `execute` or `description`).
 */
function cloneToolPreservingDescriptors(tool) {
  (0, assert_1.default)(tool && typeof tool === "object", "tool must be an object");
  const prototype = Object.getPrototypeOf(tool);
  (0, assert_1.default)(
    prototype === null || typeof prototype === "object",
    "tool prototype must be an object or null"
  );
  const clone = Object.create(prototype);
  Object.defineProperties(clone, Object.getOwnPropertyDescriptors(tool));
  return clone;
}
//# sourceMappingURL=cloneToolPreservingDescriptors.js.map
