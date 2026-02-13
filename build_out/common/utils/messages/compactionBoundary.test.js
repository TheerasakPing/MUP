"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const message_1 = require("../../../common/types/message");
const compactionBoundary_1 = require("./compactionBoundary");
(0, bun_test_1.describe)("findLatestCompactionBoundaryIndex", () => {
  (0, bun_test_1.it)("returns the newest compaction boundary via reverse scan", () => {
    const messages = [
      (0, message_1.createMuxMessage)("u0", "user", "before"),
      (0, message_1.createMuxMessage)("summary-1", "assistant", "first summary", {
        compacted: "user",
        compactionBoundary: true,
        compactionEpoch: 1,
      }),
      (0, message_1.createMuxMessage)("u1", "user", "middle"),
      (0, message_1.createMuxMessage)("summary-2", "assistant", "second summary", {
        compacted: "user",
        compactionBoundary: true,
        compactionEpoch: 2,
      }),
      (0, message_1.createMuxMessage)("u2", "user", "latest"),
    ];
    (0, bun_test_1.expect)(
      (0, compactionBoundary_1.findLatestCompactionBoundaryIndex)(messages)
    ).toBe(3);
  });
  (0, bun_test_1.it)("returns -1 when only legacy compacted summaries exist", () => {
    const messages = [
      (0, message_1.createMuxMessage)("u0", "user", "before"),
      (0, message_1.createMuxMessage)("legacy-summary", "assistant", "legacy summary", {
        compacted: "user",
      }),
      (0, message_1.createMuxMessage)("u1", "user", "after"),
    ];
    (0, bun_test_1.expect)(
      (0, compactionBoundary_1.findLatestCompactionBoundaryIndex)(messages)
    ).toBe(-1);
  });
  (0, bun_test_1.it)("ignores boundary markers that are missing compactionEpoch", () => {
    const messages = [
      (0, message_1.createMuxMessage)("u0", "user", "before"),
      (0, message_1.createMuxMessage)("summary-valid", "assistant", "valid summary", {
        compacted: "user",
        compactionBoundary: true,
        compactionEpoch: 1,
      }),
      (0, message_1.createMuxMessage)("u1", "user", "middle"),
      (0, message_1.createMuxMessage)("summary-missing-epoch", "assistant", "malformed summary", {
        compacted: "user",
        compactionBoundary: true,
        // Corrupted/normalized persisted metadata: missing epoch must not be durable.
      }),
      (0, message_1.createMuxMessage)("u2", "user", "after"),
    ];
    (0, bun_test_1.expect)(
      (0, compactionBoundary_1.findLatestCompactionBoundaryIndex)(messages)
    ).toBe(1);
  });
  (0, bun_test_1.it)(
    "skips malformed boundary markers and keeps scanning for the latest durable boundary",
    () => {
      const messages = [
        (0, message_1.createMuxMessage)("u0", "user", "before"),
        (0, message_1.createMuxMessage)("summary-valid", "assistant", "valid summary", {
          compacted: "user",
          compactionBoundary: true,
          compactionEpoch: 1,
        }),
        (0, message_1.createMuxMessage)("u1", "user", "middle"),
        (0, message_1.createMuxMessage)("summary-malformed", "assistant", "malformed summary", {
          // Corrupted persisted metadata: looks like a boundary but is not a compacted summary.
          compacted: false,
          compactionBoundary: true,
          compactionEpoch: 2,
        }),
        (0, message_1.createMuxMessage)("u2", "user", "after"),
      ];
      (0, bun_test_1.expect)(
        (0, compactionBoundary_1.findLatestCompactionBoundaryIndex)(messages)
      ).toBe(1);
    }
  );
  (0, bun_test_1.it)("ignores boundary markers with malformed compacted values", () => {
    const malformedCompactedBoundary = (0, message_1.createMuxMessage)(
      "summary-malformed-compacted",
      "assistant",
      "malformed summary",
      {
        compactionBoundary: true,
        compactionEpoch: 99,
      }
    );
    if (malformedCompactedBoundary.metadata) {
      malformedCompactedBoundary.metadata.compacted = "corrupt";
    }
    const messages = [
      (0, message_1.createMuxMessage)("u0", "user", "before"),
      (0, message_1.createMuxMessage)("summary-valid", "assistant", "valid summary", {
        compacted: "user",
        compactionBoundary: true,
        compactionEpoch: 1,
      }),
      malformedCompactedBoundary,
      (0, message_1.createMuxMessage)("u1", "user", "after"),
    ];
    (0, bun_test_1.expect)(
      (0, compactionBoundary_1.findLatestCompactionBoundaryIndex)(messages)
    ).toBe(1);
  });
  (0, bun_test_1.it)("ignores user-role messages with boundary-like metadata", () => {
    const messages = [
      (0, message_1.createMuxMessage)("u0", "user", "before"),
      (0, message_1.createMuxMessage)("summary-valid", "assistant", "valid summary", {
        compacted: "user",
        compactionBoundary: true,
        compactionEpoch: 1,
      }),
      (0, message_1.createMuxMessage)("u1", "user", "not-a-summary", {
        compacted: "user",
        compactionBoundary: true,
        compactionEpoch: 2,
      }),
      (0, message_1.createMuxMessage)("u2", "user", "after"),
    ];
    (0, bun_test_1.expect)(
      (0, compactionBoundary_1.findLatestCompactionBoundaryIndex)(messages)
    ).toBe(1);
  });
});
(0, bun_test_1.describe)("sliceMessagesFromLatestCompactionBoundary", () => {
  (0, bun_test_1.it)("slices request payload history from the latest compaction boundary", () => {
    const messages = [
      (0, message_1.createMuxMessage)("u0", "user", "before"),
      (0, message_1.createMuxMessage)("summary-1", "assistant", "first summary", {
        compacted: "user",
        compactionBoundary: true,
        compactionEpoch: 1,
      }),
      (0, message_1.createMuxMessage)("u1", "user", "middle"),
      (0, message_1.createMuxMessage)("summary-2", "assistant", "second summary", {
        compacted: "user",
        compactionBoundary: true,
        compactionEpoch: 2,
      }),
      (0, message_1.createMuxMessage)("u2", "user", "latest"),
      (0, message_1.createMuxMessage)("a2", "assistant", "reply"),
    ];
    const sliced = (0, compactionBoundary_1.sliceMessagesFromLatestCompactionBoundary)(messages);
    (0, bun_test_1.expect)(sliced.map((msg) => msg.id)).toEqual(["summary-2", "u2", "a2"]);
    (0, bun_test_1.expect)(sliced[0]?.metadata?.compactionBoundary).toBe(true);
  });
  (0, bun_test_1.it)("falls back to full history when no durable boundary exists", () => {
    const messages = [
      (0, message_1.createMuxMessage)("u0", "user", "before"),
      (0, message_1.createMuxMessage)("legacy-summary", "assistant", "legacy summary", {
        compacted: "user",
      }),
      (0, message_1.createMuxMessage)("u1", "user", "after"),
    ];
    const sliced = (0, compactionBoundary_1.sliceMessagesFromLatestCompactionBoundary)(messages);
    (0, bun_test_1.expect)(sliced).toBe(messages);
    (0, bun_test_1.expect)(sliced.map((msg) => msg.id)).toEqual(["u0", "legacy-summary", "u1"]);
  });
  (0, bun_test_1.it)("treats missing compactionEpoch boundary markers as non-boundaries", () => {
    const messages = [
      (0, message_1.createMuxMessage)("u0", "user", "before"),
      (0, message_1.createMuxMessage)("summary-missing-epoch", "assistant", "malformed summary", {
        compacted: "user",
        compactionBoundary: true,
        // Schema normalization can drop malformed epochs to undefined.
      }),
      (0, message_1.createMuxMessage)("u1", "user", "after"),
    ];
    const sliced = (0, compactionBoundary_1.sliceMessagesFromLatestCompactionBoundary)(messages);
    (0, bun_test_1.expect)(sliced).toBe(messages);
    (0, bun_test_1.expect)(sliced.map((msg) => msg.id)).toEqual([
      "u0",
      "summary-missing-epoch",
      "u1",
    ]);
  });
  (0, bun_test_1.it)("treats malformed compacted boundary markers as non-boundaries", () => {
    const malformedCompactedBoundary = (0, message_1.createMuxMessage)(
      "summary-malformed-compacted",
      "assistant",
      "malformed summary",
      {
        compactionBoundary: true,
        compactionEpoch: 2,
      }
    );
    if (malformedCompactedBoundary.metadata) {
      malformedCompactedBoundary.metadata.compacted = "corrupt";
    }
    const messages = [
      (0, message_1.createMuxMessage)("u0", "user", "before"),
      malformedCompactedBoundary,
      (0, message_1.createMuxMessage)("u1", "user", "after"),
    ];
    const sliced = (0, compactionBoundary_1.sliceMessagesFromLatestCompactionBoundary)(messages);
    (0, bun_test_1.expect)(sliced).toBe(messages);
    (0, bun_test_1.expect)(sliced.map((msg) => msg.id)).toEqual([
      "u0",
      "summary-malformed-compacted",
      "u1",
    ]);
  });
  (0, bun_test_1.it)("does not slice from user-role messages with boundary-like metadata", () => {
    const messages = [
      (0, message_1.createMuxMessage)("u0", "user", "before"),
      (0, message_1.createMuxMessage)("summary-valid", "assistant", "valid summary", {
        compacted: "user",
        compactionBoundary: true,
        compactionEpoch: 1,
      }),
      (0, message_1.createMuxMessage)("u1", "user", "not-a-summary", {
        compacted: "user",
        compactionBoundary: true,
        compactionEpoch: 2,
      }),
      (0, message_1.createMuxMessage)("a1", "assistant", "after"),
    ];
    const sliced = (0, compactionBoundary_1.sliceMessagesFromLatestCompactionBoundary)(messages);
    (0, bun_test_1.expect)(sliced.map((msg) => msg.id)).toEqual(["summary-valid", "u1", "a1"]);
    (0, bun_test_1.expect)(sliced[0]?.id).toBe("summary-valid");
  });
  (0, bun_test_1.it)(
    "treats malformed boundary markers as non-boundaries instead of crashing",
    () => {
      const messages = [
        (0, message_1.createMuxMessage)("u0", "user", "before"),
        (0, message_1.createMuxMessage)("summary-malformed", "assistant", "malformed summary", {
          compacted: "user",
          compactionBoundary: true,
          // Corrupted persisted metadata: invalid epoch should not brick request assembly.
          compactionEpoch: 0,
        }),
        (0, message_1.createMuxMessage)("u1", "user", "after"),
      ];
      const sliced = (0, compactionBoundary_1.sliceMessagesFromLatestCompactionBoundary)(messages);
      (0, bun_test_1.expect)(sliced).toBe(messages);
      (0, bun_test_1.expect)(sliced.map((msg) => msg.id)).toEqual([
        "u0",
        "summary-malformed",
        "u1",
      ]);
    }
  );
});
//# sourceMappingURL=compactionBoundary.test.js.map
