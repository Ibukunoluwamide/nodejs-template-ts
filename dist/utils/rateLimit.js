"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRateLimit = void 0;
const http_1 = require("../constants/http");
const appAssert_1 = __importDefault(require("./appAssert"));
// Simple in-memory rate limiting (in production, use Redis)
const rateLimitStore = new Map();
const checkRateLimit = (identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000 // 15 minutes
) => {
    const now = Date.now();
    const key = `google_auth_${identifier}`;
    const record = rateLimitStore.get(key);
    if (!record || now > record.resetTime) {
        // First attempt or window expired
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return;
    }
    if (record.count >= maxAttempts) {
        (0, appAssert_1.default)(false, http_1.TOO_MANY_REQUESTS, 'Too many Google authentication attempts. Please try again later.');
    }
    // Increment count
    record.count++;
    rateLimitStore.set(key, record);
};
exports.checkRateLimit = checkRateLimit;
// Clean up expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
        if (now > record.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000); // Clean up every 5 minutes
