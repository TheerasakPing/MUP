"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const muxMd_1 = require("./muxMd");
const itIntegration = process.env.TEST_INTEGRATION === "1" ? bun_test_1.it : bun_test_1.it.skip;
(0, bun_test_1.describe)("muxMd", () => {
    (0, bun_test_1.describe)("getMuxMdBaseUrl", () => {
        (0, bun_test_1.it)("should default to the production mux.md origin", () => {
            const originalOverride = process.env.MUX_MD_URL_OVERRIDE;
            try {
                delete process.env.MUX_MD_URL_OVERRIDE;
                (0, bun_test_1.expect)((0, muxMd_1.getMuxMdBaseUrl)()).toBe(muxMd_1.MUX_MD_BASE_URL);
            }
            finally {
                if (originalOverride === undefined) {
                    delete process.env.MUX_MD_URL_OVERRIDE;
                }
                else {
                    process.env.MUX_MD_URL_OVERRIDE = originalOverride;
                }
            }
        });
        (0, bun_test_1.it)("should normalize and accept a MUX_MD_URL_OVERRIDE host", () => {
            const originalOverride = process.env.MUX_MD_URL_OVERRIDE;
            process.env.MUX_MD_URL_OVERRIDE = "https://mux-md-staging.test/some/path";
            try {
                (0, bun_test_1.expect)((0, muxMd_1.getMuxMdBaseUrl)()).toBe("https://mux-md-staging.test");
                // Override host should be allowed.
                (0, bun_test_1.expect)((0, muxMd_1.isMuxMdUrl)("https://mux-md-staging.test/abc123#key456")).toBe(true);
                // Production links should still be recognized while an override is set.
                (0, bun_test_1.expect)((0, muxMd_1.isMuxMdUrl)("https://mux.md/abc123#key456")).toBe(true);
                (0, bun_test_1.expect)((0, muxMd_1.isMuxMdUrl)("https://not-mux-md.test/abc123#key456")).toBe(false);
            }
            finally {
                if (originalOverride === undefined) {
                    delete process.env.MUX_MD_URL_OVERRIDE;
                }
                else {
                    process.env.MUX_MD_URL_OVERRIDE = originalOverride;
                }
            }
        });
        (0, bun_test_1.it)("should prefer window.api.muxMdUrlOverride over process.env", () => {
            const originalOverride = process.env.MUX_MD_URL_OVERRIDE;
            const globalWithWindow = globalThis;
            const originalWindow = globalWithWindow.window;
            process.env.MUX_MD_URL_OVERRIDE = "https://mux-md-staging.test";
            globalWithWindow.window = {
                api: {
                    muxMdUrlOverride: "http://localhost:8787/foo",
                },
            };
            try {
                (0, bun_test_1.expect)((0, muxMd_1.getMuxMdBaseUrl)()).toBe("http://localhost:8787");
            }
            finally {
                if (originalOverride === undefined) {
                    delete process.env.MUX_MD_URL_OVERRIDE;
                }
                else {
                    process.env.MUX_MD_URL_OVERRIDE = originalOverride;
                }
                if (originalWindow === undefined) {
                    delete globalWithWindow.window;
                }
                else {
                    globalWithWindow.window = originalWindow;
                }
            }
        });
        (0, bun_test_1.it)("should use globalThis.__MUX_MD_URL_OVERRIDE__ in browser mode without preload", () => {
            const originalOverride = process.env.MUX_MD_URL_OVERRIDE;
            const originalDefineOverride = globalThis.__MUX_MD_URL_OVERRIDE__;
            const globalWithWindow = globalThis;
            const originalWindow = globalWithWindow.window;
            // When running `make dev-server`, the renderer runs in a normal browser where `window.api`
            // is not available, so we rely on the Vite-injected define.
            process.env.MUX_MD_URL_OVERRIDE = "https://should-not-be-used.test";
            globalThis.__MUX_MD_URL_OVERRIDE__ = "https://mux-md-staging.test/some/path";
            globalWithWindow.window = {};
            try {
                (0, bun_test_1.expect)((0, muxMd_1.getMuxMdBaseUrl)()).toBe("https://mux-md-staging.test");
            }
            finally {
                if (originalOverride === undefined) {
                    delete process.env.MUX_MD_URL_OVERRIDE;
                }
                else {
                    process.env.MUX_MD_URL_OVERRIDE = originalOverride;
                }
                globalThis.__MUX_MD_URL_OVERRIDE__ = originalDefineOverride;
                if (originalWindow === undefined) {
                    delete globalWithWindow.window;
                }
                else {
                    globalWithWindow.window = originalWindow;
                }
            }
        });
    });
    (0, bun_test_1.describe)("isMuxMdUrl", () => {
        (0, bun_test_1.it)("should detect valid mux.md URLs", () => {
            (0, bun_test_1.expect)((0, muxMd_1.isMuxMdUrl)("https://mux.md/abc123#key456")).toBe(true);
            (0, bun_test_1.expect)((0, muxMd_1.isMuxMdUrl)("https://mux.md/RQJe3#Fbbhosspt9q9Ig")).toBe(true);
        });
        (0, bun_test_1.it)("should reject URLs without fragment", () => {
            (0, bun_test_1.expect)((0, muxMd_1.isMuxMdUrl)("https://mux.md/abc123")).toBe(false);
            (0, bun_test_1.expect)((0, muxMd_1.isMuxMdUrl)("https://mux.md/abc123#")).toBe(false);
        });
        (0, bun_test_1.it)("should reject non-mux.md URLs", () => {
            (0, bun_test_1.expect)((0, muxMd_1.isMuxMdUrl)("https://example.com/page#hash")).toBe(false);
        });
    });
    (0, bun_test_1.describe)("parseMuxMdUrl", () => {
        (0, bun_test_1.it)("should extract id and key from URL", () => {
            (0, bun_test_1.expect)((0, muxMd_1.parseMuxMdUrl)("https://mux.md/abc123#key456")).toEqual({
                id: "abc123",
                key: "key456",
            });
        });
        (0, bun_test_1.it)("should return null for invalid URLs", () => {
            (0, bun_test_1.expect)((0, muxMd_1.parseMuxMdUrl)("https://mux.md/abc123")).toBeNull();
            (0, bun_test_1.expect)((0, muxMd_1.parseMuxMdUrl)("https://mux.md/#key")).toBeNull();
            (0, bun_test_1.expect)((0, muxMd_1.parseMuxMdUrl)("not-a-url")).toBeNull();
        });
    });
    // Round-trip test: upload then download
    itIntegration("should upload and download content correctly", async () => {
        const testContent = "# Test Message\n\nThis is a test of mux.md encryption.";
        const testFileInfo = {
            name: "test-message.md",
            type: "text/markdown",
            size: testContent.length,
            model: "test-model",
        };
        // Upload
        const uploadResult = await (0, muxMd_1.uploadToMuxMd)(testContent, testFileInfo, {
            expiresAt: new Date(Date.now() + 60000), // Expire in 1 minute
        });
        (0, bun_test_1.expect)(uploadResult.url).toContain(`${(0, muxMd_1.getMuxMdBaseUrl)()}/`);
        (0, bun_test_1.expect)(uploadResult.url).toContain("#");
        (0, bun_test_1.expect)(uploadResult.id).toBeTruthy();
        (0, bun_test_1.expect)(uploadResult.key).toBeTruthy();
        (0, bun_test_1.expect)(uploadResult.mutateKey).toBeTruthy();
        try {
            // Download and decrypt
            const downloadResult = await (0, muxMd_1.downloadFromMuxMd)(uploadResult.id, uploadResult.key);
            (0, bun_test_1.expect)(downloadResult.content).toBe(testContent);
            (0, bun_test_1.expect)(downloadResult.fileInfo).toBeDefined();
            (0, bun_test_1.expect)(downloadResult.fileInfo?.name).toBe("test-message.md");
            (0, bun_test_1.expect)(downloadResult.fileInfo?.model).toBe("test-model");
        }
        finally {
            // Clean up - delete the uploaded file
            await (0, muxMd_1.deleteFromMuxMd)(uploadResult.id, uploadResult.mutateKey);
        }
    });
    itIntegration("should fail gracefully for non-existent shares", async () => {
        let error;
        try {
            await (0, muxMd_1.downloadFromMuxMd)("nonexistent123", "fakekey456");
        }
        catch (e) {
            error = e;
        }
        (0, bun_test_1.expect)(error).toBeDefined();
        (0, bun_test_1.expect)(error?.message).toMatch(/not found|expired/i);
    });
});
//# sourceMappingURL=muxMd.test.js.map