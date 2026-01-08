"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const http_1 = require("../constants/http");
const jwt_1 = require("../utils/jwt");
const user_model_1 = __importDefault(require("../models/user.model"));
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    (0, appAssert_1.default)(authHeader && authHeader.startsWith("Bearer "), http_1.UNAUTHORIZED, "Authorization header with Bearer token required", "InvalidAccessToken" /* AppErrorCode.InvalidAccessToken */);
    const accessToken = authHeader.substring(7);
    const { error, payload } = (0, jwt_1.verifyToken)(accessToken);
    (0, appAssert_1.default)(payload, http_1.UNAUTHORIZED, error === "jwt expired" ? "Token expired" : "Invalid token", "InvalidAccessToken" /* AppErrorCode.InvalidAccessToken */);
    const user = await user_model_1.default.findById(payload.userId).select("_id role");
    (0, appAssert_1.default)(user, http_1.UNAUTHORIZED, "User no longer exists", "InvalidAccessToken" /* AppErrorCode.InvalidAccessToken */);
    req.userId = user._id.toString();
    req.role = user.role;
    next();
};
exports.default = authenticate;
