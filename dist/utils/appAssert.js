"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const AppError_1 = __importDefault(require("./AppError"));
/**
 * Asserts a condition and throws an AppError if the condition is falsy.
 */
const appAssert = (condition, httpStatusCode, message, appErrorCode) => (0, node_assert_1.default)(condition, new AppError_1.default(httpStatusCode, message, appErrorCode));
exports.default = appAssert;
