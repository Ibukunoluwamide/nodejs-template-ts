"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("../constants/http");
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const authorize = (roles) => {
    return (req, res, next) => {
        (0, appAssert_1.default)(req.role && roles.includes(req.role), http_1.FORBIDDEN, "You do not have permission to access this resource");
        next();
    };
};
exports.default = authorize;
