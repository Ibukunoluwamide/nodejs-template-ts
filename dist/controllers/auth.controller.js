"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordHandler = exports.sendPasswordResetHandler = exports.verifyEmailHandler = exports.refreshHandler = exports.logoutHandler = exports.continueWithGoogleHandler = exports.loginHandler = exports.registerHandler = void 0;
const http_1 = require("../constants/http");
const session_model_1 = __importDefault(require("../models/session.model"));
const auth_service_1 = require("../services/auth.service");
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const jwt_1 = require("../utils/jwt");
const catchErrors_1 = __importDefault(require("../utils/catchErrors"));
const auth_schemas_1 = require("../schemas/auth.schemas");
exports.registerHandler = (0, catchErrors_1.default)(async (req, res) => {
    const request = auth_schemas_1.registerSchema.parse({
        ...req.body,
        userAgent: req.headers["user-agent"],
    });
    const { user, accessToken, refreshToken } = await (0, auth_service_1.createAccount)(request);
    // Return tokens in JSON response
    return res.status(http_1.CREATED).json({
        message: "User registered successfully",
        user,
        accessToken,
        refreshToken,
    });
});
exports.loginHandler = (0, catchErrors_1.default)(async (req, res) => {
    const request = auth_schemas_1.loginSchema.parse({
        ...req.body,
        userAgent: req.headers["user-agent"],
    });
    const { accessToken, refreshToken } = await (0, auth_service_1.loginUser)(request);
    // Return tokens in JSON response
    return res.status(http_1.OK).json({
        message: "Login successful",
        accessToken,
        refreshToken,
    });
});
exports.continueWithGoogleHandler = (0, catchErrors_1.default)(async (req, res) => {
    const request = auth_schemas_1.continueWithGoogleSchema.parse({
        ...req.body,
        userAgent: req.headers["user-agent"],
    });
    try {
        const { user, accessToken, refreshToken } = await (0, auth_service_1.continueWithGoogleUser)(request);
        // Log successful Google authentication
        console.log(`Google authentication successful for user: ${user.email}`);
        // Return tokens in JSON response
        return res.status(http_1.OK).json({
            message: "Successfully signed in with Google",
            user,
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        // Log failed Google authentication attempts
        console.error(`Google authentication failed: ${error.message}`, {
            userAgent: request.userAgent,
            timestamp: new Date().toISOString(),
        });
        throw error;
    }
});
exports.logoutHandler = (0, catchErrors_1.default)(async (req, res) => {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : undefined;
    const { payload } = (0, jwt_1.verifyToken)(accessToken || "");
    if (payload) {
        // remove session from db
        await session_model_1.default.findByIdAndDelete(payload.sessionId);
    }
    return res.status(http_1.OK).json({ message: "Logout successful" });
});
exports.refreshHandler = (0, catchErrors_1.default)(async (req, res) => {
    // Accept refresh token from request body instead of cookies
    const { refreshToken } = req.body;
    (0, appAssert_1.default)(refreshToken, http_1.UNAUTHORIZED, "Missing refresh token");
    const { accessToken, newRefreshToken } = await (0, auth_service_1.refreshUserAccessToken)(refreshToken);
    // Return new tokens in JSON response
    return res.status(http_1.OK).json({
        message: "Access token refreshed",
        accessToken,
        refreshToken: newRefreshToken || refreshToken,
    });
});
exports.verifyEmailHandler = (0, catchErrors_1.default)(async (req, res) => {
    const verificationCode = auth_schemas_1.verificationCodeSchema.parse(req.params.code);
    await (0, auth_service_1.verifyEmail)(verificationCode);
    return res.status(http_1.OK).json({ message: "Email was successfully verified" });
});
exports.sendPasswordResetHandler = (0, catchErrors_1.default)(async (req, res) => {
    const email = auth_schemas_1.emailSchema.parse(req.body.email);
    await (0, auth_service_1.sendPasswordResetEmail)(email);
    return res.status(http_1.OK).json({ message: "Password reset email sent" });
});
exports.resetPasswordHandler = (0, catchErrors_1.default)(async (req, res) => {
    const request = auth_schemas_1.resetPasswordSchema.parse(req.body);
    await (0, auth_service_1.resetPassword)(request);
    return res.status(http_1.OK).json({ message: "Password was reset successfully" });
});
