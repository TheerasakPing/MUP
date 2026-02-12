"use strict";
/**
 * Codex OAuth token parsing + JWT claim extraction.
 *
 * We intentionally do not validate token signatures here; we only need to
 * extract non-sensitive claims (e.g. ChatGPT-Account-Id) from OAuth responses.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractChatGptAccountIdFromTokens = exports.extractChatGptAccountIdFromToken = exports.extractChatGptAccountIdFromClaims = exports.decodeJwtClaims = void 0;
exports.parseCodexOauthAuth = parseCodexOauthAuth;
exports.isCodexOauthAuthExpired = isCodexOauthAuthExpired;
exports.parseJwtClaims = parseJwtClaims;
exports.extractAccountIdFromClaims = extractAccountIdFromClaims;
exports.extractAccountIdFromToken = extractAccountIdFromToken;
exports.extractAccountIdFromTokens = extractAccountIdFromTokens;
function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function isUnknownArray(value) {
    return Array.isArray(value);
}
function parseCodexOauthAuth(value) {
    if (!isPlainObject(value)) {
        return null;
    }
    const type = value.type;
    const access = value.access;
    const refresh = value.refresh;
    const expires = value.expires;
    const accountId = value.accountId;
    if (type !== "oauth")
        return null;
    if (typeof access !== "string" || !access)
        return null;
    if (typeof refresh !== "string" || !refresh)
        return null;
    if (typeof expires !== "number" || !Number.isFinite(expires))
        return null;
    if (typeof accountId !== "undefined") {
        if (typeof accountId !== "string" || !accountId)
            return null;
    }
    return { type: "oauth", access, refresh, expires, accountId };
}
function isCodexOauthAuthExpired(auth, opts) {
    const now = opts?.nowMs ?? Date.now();
    const skew = opts?.skewMs ?? 30_000;
    return now + skew >= auth.expires;
}
/**
 * Best-effort JWT claim decoding (no signature verification).
 */
function parseJwtClaims(token) {
    const parts = token.split(".");
    if (parts.length !== 3) {
        return null;
    }
    try {
        const json = Buffer.from(parts[1], "base64url").toString("utf-8");
        const parsed = JSON.parse(json);
        return isPlainObject(parsed) ? parsed : null;
    }
    catch {
        return null;
    }
}
function extractAccountIdFromClaims(claims) {
    // OpenCode guide extraction order:
    // 1) claims.chatgpt_account_id
    // 2) claims["https://api.openai.com/auth"].chatgpt_account_id
    // 3) claims.organizations?.[0]?.id
    const direct = claims.chatgpt_account_id;
    if (typeof direct === "string" && direct) {
        return direct;
    }
    const openAiAuth = claims["https://api.openai.com/auth"];
    if (isPlainObject(openAiAuth)) {
        const candidate = openAiAuth.chatgpt_account_id;
        if (typeof candidate === "string" && candidate) {
            return candidate;
        }
    }
    const organizations = claims.organizations;
    if (isUnknownArray(organizations) && organizations.length > 0) {
        const first = organizations[0];
        if (isPlainObject(first)) {
            const candidate = first.id;
            if (typeof candidate === "string" && candidate) {
                return candidate;
            }
        }
    }
    return null;
}
function extractAccountIdFromToken(token) {
    const claims = parseJwtClaims(token);
    if (!claims) {
        return null;
    }
    return extractAccountIdFromClaims(claims);
}
function extractAccountIdFromTokens(input) {
    // Prefer id_token when present; fall back to access token.
    if (typeof input.idToken === "string" && input.idToken) {
        const fromId = extractAccountIdFromToken(input.idToken);
        if (fromId) {
            return fromId;
        }
    }
    return extractAccountIdFromToken(input.accessToken);
}
// ------------------------------------------------------------------------------------
// Backwards-compatible export names.
// ------------------------------------------------------------------------------------
exports.decodeJwtClaims = parseJwtClaims;
exports.extractChatGptAccountIdFromClaims = extractAccountIdFromClaims;
exports.extractChatGptAccountIdFromToken = extractAccountIdFromToken;
exports.extractChatGptAccountIdFromTokens = extractAccountIdFromTokens;
//# sourceMappingURL=codexOauthAuth.js.map