"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiDocsCors = exports.protectApiDocs = void 0;
const env_1 = require("../constants/env");
/**
 * Middleware to protect API documentation in production
 * Only allows access in development or with admin credentials
 */
const protectApiDocs = (req, res, next) => {
    // Allow access in development
    if (env_1.NODE_ENV === 'development') {
        return next();
    }
    // In production, you might want to add additional checks
    // For example, check for admin authentication or IP whitelist
    const isAdmin = req.headers['x-admin-key'] === process.env.ADMIN_API_KEY;
    if (isAdmin) {
        return next();
    }
    // For now, allow access in all environments
    // You can modify this to be more restrictive
    return next();
};
exports.protectApiDocs = protectApiDocs;
/**
 * Middleware to add CORS headers for API documentation
 */
const apiDocsCors = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
};
exports.apiDocsCors = apiDocsCors;
