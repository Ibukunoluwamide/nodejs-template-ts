"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../models/user.model"));
const MONGO_URI = process.env.MONGO_URI;
async function seed() {
    console.log("Seeding database...");
    await mongoose_1.default.connect(MONGO_URI);
    // Clear existing data
    await Promise.all([
        user_model_1.default.deleteMany({}),
    ]);
    // ----------------------
    // Admin
    // ----------------------
    const adminPassword = "admin123";
    const admin = await user_model_1.default.create({
        firstName: "Admin",
        lastName: "Admin",
        email: "admin@admin.com",
        password: adminPassword,
        role: "admin",
        verified: true
    });
    // ----------------------
    // Users
    // ----------------------
    const userPassword = "user123";
    const users = await user_model_1.default.insertMany([
        {
            firstName: "User",
            lastName: "User1",
            email: "user1@test.com",
            password: userPassword,
            role: "user",
            verified: true
        },
        {
            firstName: "User",
            lastName: "User2",
            email: "user2@test.com",
            password: userPassword,
            role: "user",
            verified: true
        },
        {
            firstName: "User",
            lastName: "User3",
            email: "user3@test.com",
            password: userPassword,
            role: "user",
            verified: true
        }
    ]);
    console.log("✅ Seed completed successfully");
    console.log("🔐 Admin login:");
    console.log("   Email: admin@jobportal.com");
    console.log("   Password: admin123");
    console.log("👤 User login:");
    console.log("   Email: user1@test.com");
    console.log("   Password: user123");
    await mongoose_1.default.disconnect();
    process.exit(0);
}
seed().catch(err => {
    console.error("❌ Seed failed", err);
    process.exit(1);
});
