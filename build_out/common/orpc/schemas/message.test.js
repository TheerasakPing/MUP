"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const message_1 = require("./message");
function createMessage() {
    return {
        id: "msg-1",
        role: "assistant",
        parts: [{ type: "text", text: "Hello" }],
    };
}
(0, bun_test_1.describe)("MuxMessageSchema compactionEpoch parsing", () => {
    (0, bun_test_1.test)("preserves valid positive integer compactionEpoch", () => {
        const parsed = message_1.MuxMessageSchema.parse({
            ...createMessage(),
            metadata: {
                compactionEpoch: 7,
            },
        });
        (0, bun_test_1.expect)(parsed.metadata?.compactionEpoch).toBe(7);
    });
    (0, bun_test_1.test)("tolerates malformed compactionEpoch values by treating them as absent", () => {
        const malformedCompactionEpochValues = [
            0,
            -1,
            1.5,
            Number.NaN,
            Number.POSITIVE_INFINITY,
            "7",
            null,
            true,
            {},
            [],
        ];
        for (const malformedCompactionEpoch of malformedCompactionEpochValues) {
            const parsed = message_1.MuxMessageSchema.parse({
                ...createMessage(),
                metadata: {
                    compactionEpoch: malformedCompactionEpoch,
                },
            });
            (0, bun_test_1.expect)(parsed.metadata?.compactionEpoch).toBeUndefined();
        }
    });
});
//# sourceMappingURL=message.test.js.map