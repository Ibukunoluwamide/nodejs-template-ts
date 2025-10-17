"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyGoogleToken = void 0;
const google_auth_library_1 = require("google-auth-library");
const appAssert_1 = __importDefault(require("./appAssert"));
const http_1 = require("../constants/http");
const env_1 = require("../constants/env");
const client = new google_auth_library_1.OAuth2Client();
const verifyGoogleToken = async (idToken) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: env_1.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        (0, appAssert_1.default)(payload, http_1.UNAUTHORIZED, 'Invalid Google token');
        // Additional security checks
        (0, appAssert_1.default)(payload.email_verified, http_1.UNAUTHORIZED, 'Google email not verified');
        (0, appAssert_1.default)(payload.email, http_1.UNAUTHORIZED, 'No email in Google token');
        (0, appAssert_1.default)(payload.sub, http_1.UNAUTHORIZED, 'No Google user ID in token');
        return {
            sub: payload.sub,
            email: payload.email,
            email_verified: payload.email_verified,
            name: payload.name || '',
            given_name: payload.given_name || '',
            family_name: payload.family_name || '',
            picture: payload.picture || '',
            aud: payload.aud,
            iss: payload.iss,
            iat: payload.iat,
            exp: payload.exp,
        };
    }
    catch (error) {
        console.error('Google token verification error:', error);
        (0, appAssert_1.default)(false, http_1.UNAUTHORIZED, 'Invalid Google authentication token');
    }
};
exports.verifyGoogleToken = verifyGoogleToken;
