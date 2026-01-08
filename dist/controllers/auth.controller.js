"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordHandler = exports.sendPasswordResetHandler = exports.verifyEmailHandler = exports.logoutHandler = exports.loginHandler = exports.registerHandler = void 0;
const http_1 = require("../constants/http");
const auth_service_1 = require("../services/auth.service");
const catchErrors_1 = __importDefault(require("../utils/catchErrors"));
const auth_schemas_1 = require("../schemas/auth.schemas");
exports.registerHandler = (0, catchErrors_1.default)(async (req, res) => {
    const request = auth_schemas_1.registerSchema.parse({
        ...req.body,
        userAgent: req.headers["user-agent"],
    });
    const { user, accessToken } = await (0, auth_service_1.createAccount)(request);
    // Return tokens in JSON response
    return res.status(http_1.CREATED).json({
        message: "User registered successfully",
        user,
        accessToken,
    });
});
exports.loginHandler = (0, catchErrors_1.default)(async (req, res) => {
    const request = auth_schemas_1.loginSchema.parse({
        ...req.body,
        userAgent: req.headers["user-agent"],
    });
    const { accessToken } = await (0, auth_service_1.loginUser)(request);
    // Return tokens in JSON response
    return res.status(http_1.OK).json({
        message: "Login successful",
        accessToken,
    });
});
exports.logoutHandler = (0, catchErrors_1.default)(async (req, res) => {
    return res.status(http_1.OK).json({ message: "Logout successful" });
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
