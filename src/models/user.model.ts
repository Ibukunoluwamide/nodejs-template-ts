import mongoose from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt";

export interface UserDocument extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  provider: 'manual' | 'google';
  googleId?: string;
  profileImage?: string | null;
  gender: 'male' | 'female' | 'other';
  nationality?: string | null;
  language?: string | null;
  languageToLearn?: string | null;
  emailVerified: boolean;
  type: 'user' | 'tutor' | 'admin';
  isAdmin: boolean;
  accountStatus: 'active' | 'inactive' | 'suspended';
  password: string;
  verified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(val: string): Promise<boolean>;
  omitPassword(): Pick<
    UserDocument,
    "_id" | "email" | "verified" | "createdAt" | "updatedAt" | "__v"
  >;
}



const userSchema = new mongoose.Schema<UserDocument>(
  {
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
    password: { type: String, required: function() { return this.provider === 'manual'; } },
    verified: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  this.password = await hashValue(this.password);
  return next();
});

userSchema.methods.comparePassword = async function (val: string) {
  return compareValue(val, this.password);
};

userSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;
