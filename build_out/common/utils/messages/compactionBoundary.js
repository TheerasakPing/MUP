"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDurableCompactionBoundaryMarker = isDurableCompactionBoundaryMarker;
exports.findLatestCompactionBoundaryIndex = findLatestCompactionBoundaryIndex;
exports.sliceMessagesFromLatestCompactionBoundary = sliceMessagesFromLatestCompactionBoundary;
const assert_1 = __importDefault(require("../../../common/utils/assert"));
function isPositiveInteger(value) {
  return (
    typeof value === "number" && Number.isFinite(value) && Number.isInteger(value) && value > 0
  );
}
function hasDurableCompactedMarker(value) {
  return value === true || value === "user" || value === "idle";
}
function isDurableCompactionBoundaryMarker(message) {
  if (message?.metadata?.compactionBoundary !== true) {
    return false;
  }
  if (message.role !== "assistant") {
    return false;
  }
  // Self-healing read path: malformed persisted boundary metadata should be ignored,
  // not crash request assembly.
  if (!hasDurableCompactedMarker(message.metadata.compacted)) {
    return false;
  }
  const epoch = message.metadata.compactionEpoch;
  if (!isPositiveInteger(epoch)) {
    return false;
  }
  return true;
}
/**
 * Locate the latest durable compaction boundary in reverse chronological order.
 *
 * Returns the index of the newest message tagged with valid boundary metadata,
 * or `-1` when no durable boundary exists in the provided history.
 */
function findLatestCompactionBoundaryIndex(messages) {
  (0, assert_1.default)(
    Array.isArray(messages),
    "findLatestCompactionBoundaryIndex requires a message array"
  );
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (isDurableCompactionBoundaryMarker(messages[i])) {
      return i;
    }
  }
  return -1;
}
/**
 * Slice request payload history from the latest compaction boundary (inclusive).
 *
 * This is request-only and must not be used to mutate persisted replay history.
 */
function sliceMessagesFromLatestCompactionBoundary(messages) {
  const boundaryIndex = findLatestCompactionBoundaryIndex(messages);
  if (boundaryIndex === -1) {
    return messages;
  }
  (0, assert_1.default)(
    boundaryIndex >= 0 && boundaryIndex < messages.length,
    "compaction boundary index must be within message history bounds"
  );
  const sliced = messages.slice(boundaryIndex);
  (0, assert_1.default)(
    sliced.length > 0,
    "compaction boundary slicing must retain at least one message"
  );
  (0, assert_1.default)(
    isDurableCompactionBoundaryMarker(sliced[0]),
    "compaction boundary slicing must start on a durable compaction boundary message"
  );
  return sliced;
}
//# sourceMappingURL=compactionBoundary.js.map
