import mongoose, { Schema, type Model } from "mongoose";
import type { ReviewDocument } from "@/types";
const reviewSchema = new Schema<ReviewDocument>(
  {
    comment: { type: String, required: true, maxlength: 2000 },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: Number.isInteger,
    },
    createdAt: { type: Date, default: Date.now },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { collection: "reviews", autoIndex: false },
);
export const Review =
  (mongoose.models.Review as Model<ReviewDocument> | undefined) ??
  mongoose.model<ReviewDocument>("Review", reviewSchema);
