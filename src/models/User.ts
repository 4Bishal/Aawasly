import mongoose, { Schema, type Model } from "mongoose";
import type { UserDocument } from "@/types";
const userSchema = new Schema<UserDocument>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    passwordHash: { type: String, select: false },
    // Retain Passport's PBKDF2 fields until a successful login upgrades the hash.
    hash: { type: String, select: false },
    salt: { type: String, select: false },
  },
  { collection: "users", autoIndex: false },
);
export const User =
  (mongoose.models.User as Model<UserDocument> | undefined) ??
  mongoose.model<UserDocument>("User", userSchema);
