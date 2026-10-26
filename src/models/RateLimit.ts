import mongoose, { Schema, type Model } from "mongoose";
interface RateLimitDocument {
  _id: string;
  count: number;
  expiresAt: Date;
}
const schema = new Schema<RateLimitDocument>(
  {
    _id: String,
    count: { type: Number, required: true },
    expiresAt: { type: Date, required: true },
  },
  { collection: "rate_limits", autoIndex: false },
);
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const RateLimit =
  (mongoose.models.RateLimit as Model<RateLimitDocument> | undefined) ??
  mongoose.model<RateLimitDocument>("RateLimit", schema);
