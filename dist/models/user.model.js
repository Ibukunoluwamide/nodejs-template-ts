"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = require("../utils/bcrypt");
const userSchema = new mongoose_1.default.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    provider: {
        type: String,
        enum: ['manual', 'google'],
        default: 'manual',
        required: true
    },
    googleId: { type: String, unique: true, sparse: true },
    profileImage: { type: String, default: null },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    nationality: { type: String, default: null },
    language: { type: String, default: null },
    languageToLearn: { type: String, default: null },
    type: {
        type: String,
        enum: ['user', 'tutor', 'admin'],
        default: 'user'
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    accountStatus: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    password: { type: String, required: function () { return this.provider === 'manual'; } },
    verified: { type: Boolean, required: true, default: false },
}, {
    timestamps: true,
});
userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) {
        return next();
    }
    this.password = await (0, bcrypt_1.hashValue)(this.password);
    return next();
});
userSchema.methods.comparePassword = async function (val) {
    return (0, bcrypt_1.compareValue)(val, this.password);
};
userSchema.methods.omitPassword = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};
const UserModel = mongoose_1.default.model("User", userSchema);
exports.default = UserModel;
