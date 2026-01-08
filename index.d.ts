import mongoose from "mongoose";

declare global {
  namespace Express {
    interface Request {
      userId: mongoose.Types.ObjectId;
      role?: "user" | "admin";
    }
  }
}
export {};
