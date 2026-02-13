"use strict";
/**
 * OAuth constants and helpers for Mux Governor (enterprise policy service).
 * Uses same client credentials as Mux Gateway but with a user-provided origin.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MUX_GATEWAY_CLIENT_SECRET = exports.MUX_GATEWAY_CLIENT_ID = void 0;
exports.normalizeGovernorUrl = normalizeGovernorUrl;
exports.buildGovernorAuthorizeUrl = buildGovernorAuthorizeUrl;
exports.buildGovernorExchangeUrl = buildGovernorExchangeUrl;
exports.buildGovernorExchangeBody = buildGovernorExchangeBody;
const muxGatewayOAuth_1 = require("../../common/constants/muxGatewayOAuth");
Object.defineProperty(exports, "MUX_GATEWAY_CLIENT_ID", {
  enumerable: true,
  get: function () {
    return muxGatewayOAuth_1.MUX_GATEWAY_CLIENT_ID;
  },
});
Object.defineProperty(exports, "MUX_GATEWAY_CLIENT_SECRET", {
  enumerable: true,
  get: function () {
    return muxGatewayOAuth_1.MUX_GATEWAY_CLIENT_SECRET;
  },
});
/**
 * Normalize a user-entered URL to an origin (scheme + host + port).
 * Throws if URL is invalid or uses unsupported scheme.
 */
function normalizeGovernorUrl(inputUrl) {
  const url = new URL(inputUrl);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`Unsupported URL scheme: ${url.protocol}. Must be http or https.`);
  }
  return url.origin;
}
/**
 * Build the OAuth2 authorize URL for a Mux Governor server.
 */
function buildGovernorAuthorizeUrl(input) {
  const url = new URL("/oauth2/authorize", input.governorOrigin);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", muxGatewayOAuth_1.MUX_GATEWAY_CLIENT_ID);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("state", input.state);
  return url.toString();
}
/**
 * Build the OAuth2 token exchange URL for a Mux Governor server.
 */
function buildGovernorExchangeUrl(governorOrigin) {
  return new URL("/api/v1/oauth2/exchange", governorOrigin).toString();
}
/**
 * Build the request body for the OAuth2 token exchange.
 */
function buildGovernorExchangeBody(input) {
  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("code", input.code);
  body.set("client_id", muxGatewayOAuth_1.MUX_GATEWAY_CLIENT_ID);
  body.set("client_secret", muxGatewayOAuth_1.MUX_GATEWAY_CLIENT_SECRET);
  return body;
}
//# sourceMappingURL=muxGovernorOAuth.js.map
