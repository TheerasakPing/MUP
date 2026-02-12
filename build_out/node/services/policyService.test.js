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
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const node_http_1 = require("node:http");
const promises_1 = require("node:fs/promises");
const node_os_1 = require("node:os");
const path = __importStar(require("node:path"));
const config_1 = require("../../node/config");
const policyService_1 = require("./policyService");
const PREFIX = "mux-policy-service-test-";
(0, bun_test_1.describe)("PolicyService", () => {
    let tempDir;
    let policyPath;
    let config;
    let prevPolicyFileEnv;
    (0, bun_test_1.beforeEach)(async () => {
        tempDir = await (0, promises_1.mkdtemp)(path.join((0, node_os_1.tmpdir)(), PREFIX));
        policyPath = path.join(tempDir, "policy.json");
        config = new config_1.Config(tempDir);
        prevPolicyFileEnv = process.env.MUX_POLICY_FILE;
    });
    (0, bun_test_1.afterEach)(async () => {
        if (prevPolicyFileEnv === undefined) {
            delete process.env.MUX_POLICY_FILE;
        }
        else {
            process.env.MUX_POLICY_FILE = prevPolicyFileEnv;
        }
        await (0, promises_1.rm)(tempDir, { recursive: true, force: true });
    });
    (0, bun_test_1.test)("disabled when MUX_POLICY_FILE is unset", async () => {
        delete process.env.MUX_POLICY_FILE;
        const service = new policyService_1.PolicyService(config);
        await service.initialize();
        (0, bun_test_1.expect)(service.getStatus()).toEqual({ state: "disabled" });
        (0, bun_test_1.expect)(service.getEffectivePolicy()).toBeNull();
        service.dispose();
    });
    (0, bun_test_1.test)("blocks startup when policy file fails to parse", async () => {
        await (0, promises_1.writeFile)(policyPath, '{"policy_format_version":"0.1",', "utf-8");
        process.env.MUX_POLICY_FILE = policyPath;
        const service = new policyService_1.PolicyService(config);
        await service.initialize();
        const status = service.getStatus();
        (0, bun_test_1.expect)(status.state).toBe("blocked");
        if (status.state === "blocked") {
            (0, bun_test_1.expect)(status.reason).toContain("Failed to load policy");
        }
        service.dispose();
    });
    (0, bun_test_1.test)("blocks startup when minimum_client_version is higher than client", async () => {
        await (0, promises_1.writeFile)(policyPath, JSON.stringify({
            policy_format_version: "0.1",
            minimum_client_version: "9999.0.0",
        }), "utf-8");
        process.env.MUX_POLICY_FILE = policyPath;
        const service = new policyService_1.PolicyService(config);
        await service.initialize();
        const status = service.getStatus();
        (0, bun_test_1.expect)(status.state).toBe("blocked");
        if (status.state === "blocked") {
            (0, bun_test_1.expect)(status.reason).toContain("minimum_client_version");
        }
        service.dispose();
    });
    (0, bun_test_1.test)("enforces provider_access model_access allowlist when non-empty", async () => {
        await (0, promises_1.writeFile)(policyPath, JSON.stringify({
            policy_format_version: "0.1",
            provider_access: [{ id: "openai", model_access: ["gpt-4"] }],
        }), "utf-8");
        process.env.MUX_POLICY_FILE = policyPath;
        const service = new policyService_1.PolicyService(config);
        await service.initialize();
        (0, bun_test_1.expect)(service.isEnforced()).toBe(true);
        (0, bun_test_1.expect)(service.isProviderAllowed("openai")).toBe(true);
        (0, bun_test_1.expect)(service.isProviderAllowed("anthropic")).toBe(false);
        (0, bun_test_1.expect)(service.isModelAllowed("openai", "gpt-4")).toBe(true);
        (0, bun_test_1.expect)(service.isModelAllowed("openai", "gpt-3.5")).toBe(false);
        service.dispose();
    });
    (0, bun_test_1.test)("treats empty model_access as allow-all for that provider", async () => {
        await (0, promises_1.writeFile)(policyPath, JSON.stringify({
            policy_format_version: "0.1",
            provider_access: [{ id: "openai", model_access: [] }],
        }), "utf-8");
        process.env.MUX_POLICY_FILE = policyPath;
        const service = new policyService_1.PolicyService(config);
        await service.initialize();
        (0, bun_test_1.expect)(service.isEnforced()).toBe(true);
        (0, bun_test_1.expect)(service.isModelAllowed("openai", "gpt-4")).toBe(true);
        (0, bun_test_1.expect)(service.isModelAllowed("openai", "gpt-3.5")).toBe(true);
        service.dispose();
    });
    (0, bun_test_1.test)("loads policy from a remote URI", async () => {
        const policy = {
            policy_format_version: "0.1",
            provider_access: [{ id: "openai", model_access: ["gpt-4"] }],
        };
        const server = (0, node_http_1.createServer)((_req, res) => {
            res.writeHead(200, {
                "content-type": "application/json",
            });
            res.end(JSON.stringify(policy));
        });
        await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
        try {
            const address = server.address();
            if (!address || typeof address === "string") {
                throw new Error("Failed to bind test server");
            }
            process.env.MUX_POLICY_FILE = `http://127.0.0.1:${address.port}/policy.json`;
            const service = new policyService_1.PolicyService(config);
            await service.initialize();
            (0, bun_test_1.expect)(service.isEnforced()).toBe(true);
            (0, bun_test_1.expect)(service.isProviderAllowed("openai")).toBe(true);
            (0, bun_test_1.expect)(service.isModelAllowed("openai", "gpt-4")).toBe(true);
            (0, bun_test_1.expect)(service.isModelAllowed("openai", "gpt-3.5")).toBe(false);
            service.dispose();
        }
        finally {
            await new Promise((resolve) => server.close(() => resolve()));
        }
    });
    (0, bun_test_1.test)("loads policy from Governor when enrolled", async () => {
        delete process.env.MUX_POLICY_FILE;
        const token = "governor-test-token";
        const policy = {
            policy_format_version: "0.1",
            provider_access: [{ id: "openai", model_access: ["gpt-4"] }],
        };
        let receivedAuth;
        const server = (0, node_http_1.createServer)((req, res) => {
            receivedAuth = req.headers["mux-governor-session-token"];
            if (req.url !== "/api/v1/policy.json") {
                res.writeHead(404);
                res.end("Not found");
                return;
            }
            if (req.headers["mux-governor-session-token"] !== token) {
                res.writeHead(401);
                res.end("Unauthorized");
                return;
            }
            res.writeHead(200, {
                "content-type": "application/json",
            });
            res.end(JSON.stringify(policy));
        });
        await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
        try {
            const address = server.address();
            if (!address || typeof address === "string") {
                throw new Error("Failed to bind test server");
            }
            const governorOrigin = `http://127.0.0.1:${address.port}`;
            await config.editConfig((existing) => ({
                ...existing,
                muxGovernorUrl: governorOrigin,
                muxGovernorToken: token,
            }));
            const service = new policyService_1.PolicyService(config);
            await service.initialize();
            (0, bun_test_1.expect)(service.getPolicyGetResponse().source).toBe("governor");
            (0, bun_test_1.expect)(service.isEnforced()).toBe(true);
            (0, bun_test_1.expect)(service.isProviderAllowed("openai")).toBe(true);
            (0, bun_test_1.expect)(service.isProviderAllowed("anthropic")).toBe(false);
            (0, bun_test_1.expect)(receivedAuth).toBe(token);
            service.dispose();
        }
        finally {
            await new Promise((resolve) => server.close(() => resolve()));
        }
    });
    (0, bun_test_1.test)("MUX_POLICY_FILE takes precedence over Governor enrollment", async () => {
        const token = "governor-test-token";
        const policy = {
            policy_format_version: "0.1",
            provider_access: [{ id: "anthropic", model_access: ["claude-3"] }],
        };
        let requestCount = 0;
        const server = (0, node_http_1.createServer)((req, res) => {
            requestCount += 1;
            if (req.url !== "/api/v1/policy.json") {
                res.writeHead(404);
                res.end("Not found");
                return;
            }
            res.writeHead(200, {
                "content-type": "application/json",
            });
            res.end(JSON.stringify(policy));
        });
        await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
        try {
            const address = server.address();
            if (!address || typeof address === "string") {
                throw new Error("Failed to bind test server");
            }
            const governorOrigin = `http://127.0.0.1:${address.port}`;
            await config.editConfig((existing) => ({
                ...existing,
                muxGovernorUrl: governorOrigin,
                muxGovernorToken: token,
            }));
            await (0, promises_1.writeFile)(policyPath, JSON.stringify({
                policy_format_version: "0.1",
                provider_access: [{ id: "openai", model_access: ["gpt-4"] }],
            }), "utf-8");
            process.env.MUX_POLICY_FILE = policyPath;
            const service = new policyService_1.PolicyService(config);
            await service.initialize();
            (0, bun_test_1.expect)(service.getPolicyGetResponse().source).toBe("env");
            (0, bun_test_1.expect)(service.isEnforced()).toBe(true);
            (0, bun_test_1.expect)(service.isProviderAllowed("openai")).toBe(true);
            (0, bun_test_1.expect)(service.isProviderAllowed("anthropic")).toBe(false);
            (0, bun_test_1.expect)(requestCount).toBe(0);
            service.dispose();
        }
        finally {
            await new Promise((resolve) => server.close(() => resolve()));
        }
    });
    (0, bun_test_1.test)("refreshNow returns Err on Governor errors and keeps last-known-good", async () => {
        delete process.env.MUX_POLICY_FILE;
        const token = "governor-test-token";
        const policy = {
            policy_format_version: "0.1",
            provider_access: [{ id: "openai", model_access: ["gpt-4"] }],
        };
        let mode = "ok";
        const server = (0, node_http_1.createServer)((req, res) => {
            if (req.url !== "/api/v1/policy.json") {
                res.writeHead(404);
                res.end("Not found");
                return;
            }
            if (mode === "error") {
                res.writeHead(500);
                res.end("boom");
                return;
            }
            res.writeHead(200, {
                "content-type": "application/json",
            });
            res.end(JSON.stringify(policy));
        });
        await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
        try {
            const address = server.address();
            if (!address || typeof address === "string") {
                throw new Error("Failed to bind test server");
            }
            const governorOrigin = `http://127.0.0.1:${address.port}`;
            await config.editConfig((existing) => ({
                ...existing,
                muxGovernorUrl: governorOrigin,
                muxGovernorToken: token,
            }));
            const service = new policyService_1.PolicyService(config);
            await service.initialize();
            (0, bun_test_1.expect)(service.getPolicyGetResponse().source).toBe("governor");
            (0, bun_test_1.expect)(service.isEnforced()).toBe(true);
            mode = "error";
            const refresh = await service.refreshNow();
            (0, bun_test_1.expect)(refresh.success).toBe(false);
            if (!refresh.success) {
                (0, bun_test_1.expect)(refresh.error).toContain("HTTP 500");
            }
            (0, bun_test_1.expect)(service.isEnforced()).toBe(true);
            (0, bun_test_1.expect)(service.isProviderAllowed("openai")).toBe(true);
            (0, bun_test_1.expect)(service.isModelAllowed("openai", "gpt-4")).toBe(true);
            service.dispose();
        }
        finally {
            await new Promise((resolve) => server.close(() => resolve()));
        }
    });
});
//# sourceMappingURL=policyService.test.js.map