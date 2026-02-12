"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const codexOauthAuth_1 = require("./codexOauthAuth");
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/** Encode a claims object into a fake JWT (header.payload.signature). */
function fakeJwt(claims) {
    const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
    return `${header}.${payload}.fakesig`;
}
// ---------------------------------------------------------------------------
// parseCodexOauthAuth
// ---------------------------------------------------------------------------
(0, bun_test_1.describe)("parseCodexOauthAuth", () => {
    (0, bun_test_1.it)("accepts a valid object with all required fields", () => {
        const input = {
            type: "oauth",
            access: "at_123",
            refresh: "rt_456",
            expires: Date.now() + 60_000,
        };
        const result = (0, codexOauthAuth_1.parseCodexOauthAuth)(input);
        (0, bun_test_1.expect)(result).toEqual(input);
    });
    (0, bun_test_1.it)("accepts a valid object with optional accountId", () => {
        const input = {
            type: "oauth",
            access: "at_123",
            refresh: "rt_456",
            expires: Date.now() + 60_000,
            accountId: "acct_abc",
        };
        const result = (0, codexOauthAuth_1.parseCodexOauthAuth)(input);
        (0, bun_test_1.expect)(result).toEqual(input);
    });
    (0, bun_test_1.it)("returns null for non-object values", () => {
        (0, bun_test_1.expect)((0, codexOauthAuth_1.parseCodexOauthAuth)(null)).toBeNull();
        (0, bun_test_1.expect)((0, codexOauthAuth_1.parseCodexOauthAuth)(undefined)).toBeNull();
        (0, bun_test_1.expect)((0, codexOauthAuth_1.parseCodexOauthAuth)("string")).toBeNull();
        (0, bun_test_1.expect)((0, codexOauthAuth_1.parseCodexOauthAuth)(42)).toBeNull();
        (0, bun_test_1.expect)((0, codexOauthAuth_1.parseCodexOauthAuth)([])).toBeNull();
    });
    (0, bun_test_1.it)("returns null when type is not 'oauth'", () => {
        (0, bun_test_1.expect)((0, codexOauthAuth_1.parseCodexOauthAuth)({ type: "api-key", access: "a", refresh: "r", expires: 123 })).toBeNull();
    });
    (0, bun_test_1.it)("returns null when access is missing or empty", () => {
        (0, bun_test_1.expect)((0, codexOauthAuth_1.parseCodexOauthAuth)({ type: "oauth", access: "", refresh: "r", expires: 123 })).toBeNull();
        (0, bun_test_1.expect)((0, codexOauthAuth_1.parseCodexOauthAuth)({ type: "oauth", refresh: "r", expires: 123 })).toBeNull();
    });
    (0, bun_test_1.it)("returns null when refresh is missing or empty", () => {
        (0, bun_test_1.expect)((0, codexOauthAuth_1.parseCodexOauthAuth)({ type: "oauth", access: "a", refresh: "", expires: 123 })).toBeNull();
    });
    (0, bun_test_1.it)("returns null when expires is not a finite number", () => {
        (0, bun_test_1.expect)((0, codexOauthAuth_1.parseCodexOauthAuth)({ type: "oauth", access: "a", refresh: "r", expires: NaN })).toBeNull();
        (0, bun_test_1.expect)((0, codexOauthAuth_1.parseCodexOauthAuth)({ type: "oauth", access: "a", refresh: "r", expires: Infinity })).toBeNull();
        (0, bun_test_1.expect)((0, codexOauthAuth_1.parseCodexOauthAuth)({ type: "oauth", access: "a", refresh: "r", expires: "soon" })).toBeNull();
    });
    (0, bun_test_1.it)("returns null when accountId is present but empty string", () => {
        (0, bun_test_1.expect)((0, codexOauthAuth_1.parseCodexOauthAuth)({
            type: "oauth",
            access: "a",
            refresh: "r",
            expires: 123,
            accountId: "",
        })).toBeNull();
    });
});
// ---------------------------------------------------------------------------
// isCodexOauthAuthExpired
// ---------------------------------------------------------------------------
(0, bun_test_1.describe)("isCodexOauthAuthExpired", () => {
    const base = { type: "oauth", access: "a", refresh: "r" };
    (0, bun_test_1.it)("returns false when token is not yet expired (with default skew)", () => {
        // Token expires 60s from now, default skew is 30s → not expired
        const auth = { ...base, expires: Date.now() + 60_000 };
        (0, bun_test_1.expect)((0, codexOauthAuth_1.isCodexOauthAuthExpired)(auth)).toBe(false);
    });
    (0, bun_test_1.it)("returns true when token is within the skew window", () => {
        // Token expires in 20s, default skew 30s → expired
        const now = Date.now();
        const auth = { ...base, expires: now + 20_000 };
        (0, bun_test_1.expect)((0, codexOauthAuth_1.isCodexOauthAuthExpired)(auth, { nowMs: now })).toBe(true);
    });
    (0, bun_test_1.it)("returns true when token is already past expiry", () => {
        const auth = { ...base, expires: Date.now() - 1000 };
        (0, bun_test_1.expect)((0, codexOauthAuth_1.isCodexOauthAuthExpired)(auth)).toBe(true);
    });
    (0, bun_test_1.it)("respects custom skew", () => {
        const now = 1_000_000;
        const auth = { ...base, expires: now + 5_000 };
        // With 0 skew, not expired
        (0, bun_test_1.expect)((0, codexOauthAuth_1.isCodexOauthAuthExpired)(auth, { nowMs: now, skewMs: 0 })).toBe(false);
        // With 10s skew, expired
        (0, bun_test_1.expect)((0, codexOauthAuth_1.isCodexOauthAuthExpired)(auth, { nowMs: now, skewMs: 10_000 })).toBe(true);
    });
});
// ---------------------------------------------------------------------------
// parseJwtClaims
// ---------------------------------------------------------------------------
(0, bun_test_1.describe)("parseJwtClaims", () => {
    (0, bun_test_1.it)("decodes a valid JWT payload", () => {
        const claims = { sub: "user_123", iss: "https://auth.openai.com" };
        const token = fakeJwt(claims);
        (0, bun_test_1.expect)((0, codexOauthAuth_1.parseJwtClaims)(token)).toEqual(claims);
    });
    (0, bun_test_1.it)("returns null for tokens with wrong number of parts", () => {
        (0, bun_test_1.expect)((0, codexOauthAuth_1.parseJwtClaims)("")).toBeNull();
        (0, bun_test_1.expect)((0, codexOauthAuth_1.parseJwtClaims)("one.two")).toBeNull();
        (0, bun_test_1.expect)((0, codexOauthAuth_1.parseJwtClaims)("a.b.c.d")).toBeNull();
    });
    (0, bun_test_1.it)("returns null for non-object payloads", () => {
        const header = Buffer.from("{}").toString("base64url");
        const payload = Buffer.from('"just a string"').toString("base64url");
        (0, bun_test_1.expect)((0, codexOauthAuth_1.parseJwtClaims)(`${header}.${payload}.sig`)).toBeNull();
    });
    (0, bun_test_1.it)("returns null for invalid base64", () => {
        (0, bun_test_1.expect)((0, codexOauthAuth_1.parseJwtClaims)("a.!!!invalid!!!.c")).toBeNull();
    });
});
// ---------------------------------------------------------------------------
// extractAccountIdFromClaims
// ---------------------------------------------------------------------------
(0, bun_test_1.describe)("extractAccountIdFromClaims", () => {
    (0, bun_test_1.it)("prefers direct chatgpt_account_id claim", () => {
        const claims = {
            chatgpt_account_id: "direct_id",
            "https://api.openai.com/auth": { chatgpt_account_id: "nested_id" },
            organizations: [{ id: "org_id" }],
        };
        (0, bun_test_1.expect)((0, codexOauthAuth_1.extractAccountIdFromClaims)(claims)).toBe("direct_id");
    });
    (0, bun_test_1.it)("falls back to nested auth namespace", () => {
        const claims = {
            "https://api.openai.com/auth": { chatgpt_account_id: "nested_id" },
            organizations: [{ id: "org_id" }],
        };
        (0, bun_test_1.expect)((0, codexOauthAuth_1.extractAccountIdFromClaims)(claims)).toBe("nested_id");
    });
    (0, bun_test_1.it)("falls back to organizations[0].id", () => {
        const claims = {
            organizations: [{ id: "org_id" }],
        };
        (0, bun_test_1.expect)((0, codexOauthAuth_1.extractAccountIdFromClaims)(claims)).toBe("org_id");
    });
    (0, bun_test_1.it)("returns null when no account id is found", () => {
        (0, bun_test_1.expect)((0, codexOauthAuth_1.extractAccountIdFromClaims)({})).toBeNull();
        (0, bun_test_1.expect)((0, codexOauthAuth_1.extractAccountIdFromClaims)({ organizations: [] })).toBeNull();
        (0, bun_test_1.expect)((0, codexOauthAuth_1.extractAccountIdFromClaims)({ "https://api.openai.com/auth": "not an object" })).toBeNull();
    });
    (0, bun_test_1.it)("skips empty string values", () => {
        (0, bun_test_1.expect)((0, codexOauthAuth_1.extractAccountIdFromClaims)({ chatgpt_account_id: "" })).toBeNull();
    });
});
// ---------------------------------------------------------------------------
// extractAccountIdFromToken / extractAccountIdFromTokens
// ---------------------------------------------------------------------------
(0, bun_test_1.describe)("extractAccountIdFromToken", () => {
    (0, bun_test_1.it)("extracts account id from a JWT", () => {
        const token = fakeJwt({ chatgpt_account_id: "from_jwt" });
        (0, bun_test_1.expect)((0, codexOauthAuth_1.extractAccountIdFromToken)(token)).toBe("from_jwt");
    });
    (0, bun_test_1.it)("returns null for an invalid token", () => {
        (0, bun_test_1.expect)((0, codexOauthAuth_1.extractAccountIdFromToken)("not-a-jwt")).toBeNull();
    });
});
(0, bun_test_1.describe)("extractAccountIdFromTokens", () => {
    (0, bun_test_1.it)("prefers id_token over access token", () => {
        const idToken = fakeJwt({ chatgpt_account_id: "from_id_token" });
        const accessToken = fakeJwt({ chatgpt_account_id: "from_access_token" });
        (0, bun_test_1.expect)((0, codexOauthAuth_1.extractAccountIdFromTokens)({ accessToken, idToken })).toBe("from_id_token");
    });
    (0, bun_test_1.it)("falls back to access token when id_token is missing", () => {
        const accessToken = fakeJwt({ chatgpt_account_id: "from_access_token" });
        (0, bun_test_1.expect)((0, codexOauthAuth_1.extractAccountIdFromTokens)({ accessToken })).toBe("from_access_token");
    });
    (0, bun_test_1.it)("falls back to access token when id_token has no account id", () => {
        const idToken = fakeJwt({ sub: "user" });
        const accessToken = fakeJwt({ chatgpt_account_id: "from_access_token" });
        (0, bun_test_1.expect)((0, codexOauthAuth_1.extractAccountIdFromTokens)({ accessToken, idToken })).toBe("from_access_token");
    });
});
//# sourceMappingURL=codexOauthAuth.test.js.map