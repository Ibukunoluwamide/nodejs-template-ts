"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.sendPasswordResetEmail = exports.refreshUserAccessToken = exports.verifyEmail = exports.continueWithGoogleUser = exports.loginUser = exports.createAccount = void 0;
const env_1 = require("../constants/env");
const http_1 = require("../constants/http");
const session_model_1 = __importDefault(require("../models/session.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const verificationCode_model_1 = __importDefault(require("../models/verificationCode.model"));
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const bcrypt_1 = require("../utils/bcrypt");
const date_1 = require("../utils/date");
const emailTemplates_1 = require("../utils/emailTemplates");
const jwt_1 = require("../utils/jwt");
const sendMail_1 = require("../utils/sendMail");
const googleAuth_1 = require("../utils/googleAuth");
const rateLimit_1 = require("../utils/rateLimit");
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
    // create session
    const session = await session_model_1.default.create({
        userId,
        userAgent: data.userAgent,
    });
    const refreshToken = (0, jwt_1.signToken)({
        sessionId: session._id,
    }, jwt_1.refreshTokenSignOptions);
    const accessToken = (0, jwt_1.signToken)({
        userId,
        sessionId: session._id,
    });
    return {
        user: user.omitPassword(),
        accessToken,
        refreshToken,
    };
};
exports.createAccount = createAccount;
const loginUser = async ({ email, password, userAgent, }) => {
    const user = await user_model_1.default.findOne({ email });
    (0, appAssert_1.default)(user, http_1.UNAUTHORIZED, "Invalid email or password");
    const isValid = await user.comparePassword(password);
    (0, appAssert_1.default)(isValid, http_1.UNAUTHORIZED, "Invalid email or password");
    const userId = user._id;
    const session = await session_model_1.default.create({
        userId,
        userAgent,
    });
    const sessionInfo = {
        sessionId: session._id,
    };
    const refreshToken = (0, jwt_1.signToken)(sessionInfo, jwt_1.refreshTokenSignOptions);
    const accessToken = (0, jwt_1.signToken)({
        ...sessionInfo,
        userId,
    });
    return {
        user: user.omitPassword(),
        accessToken,
        refreshToken,
    };
};
exports.loginUser = loginUser;
const continueWithGoogleUser = async ({ idToken, userAgent, }) => {
    // Rate limiting based on IP or user agent
    const rateLimitKey = userAgent || 'unknown';
    (0, rateLimit_1.checkRateLimit)(rateLimitKey, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes
    // Verify Google ID token
    const googlePayload = await (0, googleAuth_1.verifyGoogleToken)(idToken);
    // Additional security checks
    (0, appAssert_1.default)(googlePayload.email_verified, http_1.UNAUTHORIZED, 'Google email not verified');
    (0, appAssert_1.default)(googlePayload.email, http_1.UNAUTHORIZED, 'No email in Google token');
    let user;
    const existingUser = await user_model_1.default.findOne({
        $or: [
            { email: googlePayload.email },
            { googleId: googlePayload.sub }
        ]
    });
    if (existingUser) {
        // Update existing user with Google ID if not already set
        if (!existingUser.googleId) {
            existingUser.googleId = googlePayload.sub;
            existingUser.provider = 'google';
            // If Google email is verified, mark user as verified
            if (googlePayload.email_verified) {
                existingUser.verified = true;
            }
            await existingUser.save();
        }
        user = existingUser;
    }
    else {
        // Create new user
        user = await user_model_1.default.create({
            firstName: googlePayload.given_name || 'User',
            lastName: googlePayload.family_name || 'User',
            email: googlePayload.email,
            provider: 'google',
            googleId: googlePayload.sub,
            profileImage: googlePayload.picture || null,
            verified: googlePayload.email_verified, // Auto-verify if Google email is verified
        });
    }
    // Check if user account is active
    (0, appAssert_1.default)(user.accountStatus === 'active', http_1.UNAUTHORIZED, 'Account is not active');
    const userId = user._id;
    const session = await session_model_1.default.create({
        userId,
        userAgent,
    });
    const sessionInfo = {
        sessionId: session._id,
    };
    const refreshToken = (0, jwt_1.signToken)(sessionInfo, jwt_1.refreshTokenSignOptions);
    const accessToken = (0, jwt_1.signToken)({
        ...sessionInfo,
        userId,
    });
    return {
        user: user.omitPassword(),
        accessToken,
        refreshToken,
    };
};
exports.continueWithGoogleUser = continueWithGoogleUser;
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
const refreshUserAccessToken = async (refreshToken) => {
    const { payload } = (0, jwt_1.verifyToken)(refreshToken, {
        secret: jwt_1.refreshTokenSignOptions.secret,
    });
    (0, appAssert_1.default)(payload, http_1.UNAUTHORIZED, "Invalid refresh token");
    const session = await session_model_1.default.findById(payload.sessionId);
    const now = Date.now();
    (0, appAssert_1.default)(session && session.expiresAt.getTime() > now, http_1.UNAUTHORIZED, "Session expired");
    // refresh the session if it expires in the next 24hrs
    const sessionNeedsRefresh = session.expiresAt.getTime() - now <= date_1.ONE_DAY_MS;
    if (sessionNeedsRefresh) {
        session.expiresAt = (0, date_1.thirtyDaysFromNow)();
        await session.save();
    }
    const newRefreshToken = sessionNeedsRefresh
        ? (0, jwt_1.signToken)({
            sessionId: session._id,
        }, jwt_1.refreshTokenSignOptions)
        : undefined;
    const accessToken = (0, jwt_1.signToken)({
        userId: session.userId,
        sessionId: session._id,
    });
    return {
        accessToken,
        newRefreshToken,
    };
};
exports.refreshUserAccessToken = refreshUserAccessToken;
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
    // delete all sessions
    await session_model_1.default.deleteMany({ userId: validCode.userId });
    return { user: updatedUser.omitPassword() };
};
exports.resetPassword = resetPassword;
