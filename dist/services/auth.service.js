"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.sendPasswordResetEmail = exports.verifyEmail = exports.loginUser = exports.createAccount = void 0;
const env_1 = require("../constants/env");
const http_1 = require("../constants/http");
const user_model_1 = __importDefault(require("../models/user.model"));
const verificationCode_model_1 = __importDefault(require("../models/verificationCode.model"));
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const bcrypt_1 = require("../utils/bcrypt");
const date_1 = require("../utils/date");
const emailTemplates_1 = require("../utils/emailTemplates");
const jwt_1 = require("../utils/jwt");
const sendMail_1 = require("../utils/sendMail");
const createAccount = async (data) => {
    // verify email is not taken
    const existingUser = await user_model_1.default.exists({
        email: data.email,
    });
    (0, appAssert_1.default)(!existingUser, http_1.CONFLICT, "Email already in use");
    const user = await user_model_1.default.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
    });
    const userId = user._id;
    const verificationCode = await verificationCode_model_1.default.create({
        userId,
        type: "email_verification" /* VerificationCodeType.EmailVerification */,
        expiresAt: (0, date_1.oneHourFromNow)(),
    });
    const url = `${env_1.APP_ORIGIN}/email/verify/${verificationCode._id}`;
    // send verification email
    const { error } = await (0, sendMail_1.sendMail)({
        to: user.email,
        ...(0, emailTemplates_1.getVerifyEmailTemplate)(url),
    });
    // ignore email errors for now
    if (error)
        console.error(error);
    // Stateless tokens (no sessions)
    const accessToken = (0, jwt_1.signToken)({
        userId,
    });
    return {
        user: user.omitPassword(),
        accessToken,
    };
};
exports.createAccount = createAccount;
const loginUser = async ({ email, password, userAgent, }) => {
    const user = await user_model_1.default.findOne({ email });
    (0, appAssert_1.default)(user, http_1.UNAUTHORIZED, "Invalid email or password");
    const isValid = await user.comparePassword(password);
    (0, appAssert_1.default)(isValid, http_1.UNAUTHORIZED, "Invalid email or password");
    const userId = user._id;
    const sessionInfo = {
        userId,
    };
    const accessToken = (0, jwt_1.signToken)({
        userId,
    });
    return {
        user: user.omitPassword(),
        accessToken,
    };
};
exports.loginUser = loginUser;
const verifyEmail = async (code) => {
    const validCode = await verificationCode_model_1.default.findOne({
        _id: code,
        type: "email_verification" /* VerificationCodeType.EmailVerification */,
        expiresAt: { $gt: new Date() },
    });
    (0, appAssert_1.default)(validCode, http_1.NOT_FOUND, "Invalid or expired verification code");
    const updatedUser = await user_model_1.default.findByIdAndUpdate(validCode.userId, {
        verified: true,
    }, { new: true });
    (0, appAssert_1.default)(updatedUser, http_1.INTERNAL_SERVER_ERROR, "Failed to verify email");
    await validCode.deleteOne();
    return {
        user: updatedUser.omitPassword(),
    };
};
exports.verifyEmail = verifyEmail;
const sendPasswordResetEmail = async (email) => {
    // Catch any errors that were thrown and log them (but always return a success)
    // This will prevent leaking sensitive data back to the client (e.g. user not found, email not sent).
    try {
        const user = await user_model_1.default.findOne({ email });
        (0, appAssert_1.default)(user, http_1.NOT_FOUND, "User not found");
        // check for max password reset requests (2 emails in 5min)
        const fiveMinAgo = (0, date_1.fiveMinutesAgo)();
        const count = await verificationCode_model_1.default.countDocuments({
            userId: user._id,
            type: "password_reset" /* VerificationCodeType.PasswordReset */,
            createdAt: { $gt: fiveMinAgo },
        });
        (0, appAssert_1.default)(count <= 1, http_1.TOO_MANY_REQUESTS, "Too many requests, please try again later");
        const expiresAt = (0, date_1.oneHourFromNow)();
        const verificationCode = await verificationCode_model_1.default.create({
            userId: user._id,
            type: "password_reset" /* VerificationCodeType.PasswordReset */,
            expiresAt,
        });
        const url = `${env_1.APP_ORIGIN}/password/reset?code=${verificationCode._id}&exp=${expiresAt.getTime()}`;
        const { data, error } = await (0, sendMail_1.sendMail)({
            to: email,
            ...(0, emailTemplates_1.getPasswordResetTemplate)(url),
        });
        (0, appAssert_1.default)(data?.id, http_1.INTERNAL_SERVER_ERROR, `${error?.name} - ${error?.message}`);
        return {
            url,
            emailId: data.id,
        };
    }
    catch (error) {
        console.log("SendPasswordResetError:", error.message);
        return {};
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const resetPassword = async ({ verificationCode, password, }) => {
    const validCode = await verificationCode_model_1.default.findOne({
        _id: verificationCode,
        type: "password_reset" /* VerificationCodeType.PasswordReset */,
        expiresAt: { $gt: new Date() },
    });
    (0, appAssert_1.default)(validCode, http_1.NOT_FOUND, "Invalid or expired verification code");
    const updatedUser = await user_model_1.default.findByIdAndUpdate(validCode.userId, {
        password: await (0, bcrypt_1.hashValue)(password),
    });
    (0, appAssert_1.default)(updatedUser, http_1.INTERNAL_SERVER_ERROR, "Failed to reset password");
    await validCode.deleteOne();
    // Stateless JWTs: no server-side sessions to delete
    return { user: updatedUser.omitPassword() };
};
exports.resetPassword = resetPassword;
