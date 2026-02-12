"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const deepLink_1 = require("./deepLink");
(0, bun_test_1.describe)("parseMuxDeepLink", () => {
    (0, bun_test_1.test)("parses mux://chat/new", () => {
        const payload = (0, deepLink_1.parseMuxDeepLink)("mux://chat/new/?project=mux&projectPath=%2Ftmp%2Frepo&projectId=proj_123&prompt=hello%20world&sectionId=sec_456");
        (0, bun_test_1.expect)(payload).toEqual({
            type: "new_chat",
            project: "mux",
            projectPath: "/tmp/repo",
            projectId: "proj_123",
            prompt: "hello world",
            sectionId: "sec_456",
        });
    });
    (0, bun_test_1.test)("returns null for invalid scheme", () => {
        (0, bun_test_1.expect)((0, deepLink_1.parseMuxDeepLink)("http://chat/new?prompt=hi")).toBeNull();
    });
    (0, bun_test_1.test)("returns null for unknown route", () => {
        (0, bun_test_1.expect)((0, deepLink_1.parseMuxDeepLink)("mux://chat/old?prompt=hi")).toBeNull();
    });
    (0, bun_test_1.test)("resolves deep-link project query by final path segment", () => {
        const resolved = (0, deepLink_1.resolveProjectPathFromProjectQuery)(["/Users/mike/repos/mux", "/Users/mike/repos/cmux"], "mux");
        (0, bun_test_1.expect)(resolved).toBe("/Users/mike/repos/mux");
    });
    (0, bun_test_1.test)("falls back to substring match when no exact match exists", () => {
        const resolved = (0, deepLink_1.resolveProjectPathFromProjectQuery)(["/Users/mike/repos/coder", "/Users/mike/repos/cmux"], "mux");
        (0, bun_test_1.expect)(resolved).toBe("/Users/mike/repos/cmux");
    });
    (0, bun_test_1.test)("returns null when no project matches", () => {
        (0, bun_test_1.expect)((0, deepLink_1.resolveProjectPathFromProjectQuery)(["/Users/mike/repos/coder"], "mux")).toBeNull();
    });
});
//# sourceMappingURL=deepLink.test.js.map