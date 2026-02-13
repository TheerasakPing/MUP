"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const planStorage_1 = require("./planStorage");
describe("planStorage", () => {
    // Plan paths use tilde prefix for portability across local/remote runtimes
    const expectedMuxHome = "~/.mux";
    describe("getPlanFilePath", () => {
        it("should return path with project name and workspace name", () => {
            const result = (0, planStorage_1.getPlanFilePath)("fix-plan-a1b2", "mux");
            expect(result).toBe(`${expectedMuxHome}/plans/mux/fix-plan-a1b2.md`);
        });
        it("should produce same path for same inputs", () => {
            const result1 = (0, planStorage_1.getPlanFilePath)("fix-bug-x1y2", "myproject");
            const result2 = (0, planStorage_1.getPlanFilePath)("fix-bug-x1y2", "myproject");
            expect(result1).toBe(result2);
        });
        it("should organize plans by project folder", () => {
            const result1 = (0, planStorage_1.getPlanFilePath)("sidebar-a1b2", "mux");
            const result2 = (0, planStorage_1.getPlanFilePath)("auth-c3d4", "other-project");
            expect(result1).toBe(`${expectedMuxHome}/plans/mux/sidebar-a1b2.md`);
            expect(result2).toBe(`${expectedMuxHome}/plans/other-project/auth-c3d4.md`);
        });
        it("should use custom muxHome when provided (Docker uses /var/mux)", () => {
            const result = (0, planStorage_1.getPlanFilePath)("fix-plan-a1b2", "mux", "/var/mux");
            expect(result).toBe("/var/mux/plans/mux/fix-plan-a1b2.md");
        });
        it("should default to ~/.mux when muxHome not provided", () => {
            const withDefault = (0, planStorage_1.getPlanFilePath)("workspace", "project");
            const withExplicit = (0, planStorage_1.getPlanFilePath)("workspace", "project", "~/.mux");
            expect(withDefault).toBe(withExplicit);
        });
    });
    describe("getLegacyPlanFilePath", () => {
        it("should return path with workspace ID", () => {
            const result = (0, planStorage_1.getLegacyPlanFilePath)("a1b2c3d4e5");
            expect(result).toBe(`${expectedMuxHome}/plans/a1b2c3d4e5.md`);
        });
        it("should handle legacy format IDs", () => {
            const result = (0, planStorage_1.getLegacyPlanFilePath)("mux-main");
            expect(result).toBe(`${expectedMuxHome}/plans/mux-main.md`);
        });
    });
});
//# sourceMappingURL=planStorage.test.js.map