import mongoose, { Schema, type Model } from "mongoose";
import { AMENITIES, CATEGORIES, DEFAULT_IMAGE } from "@/lib/constants";
import type { ListingDocument } from "@/types";
const imageSchema = new Schema(
  { url: { type: String, default: DEFAULT_IMAGE }, filename: String },
  { _id: false },
);
const listingSchema = new Schema<ListingDocument>(
  {
    title: { type: String, required: true, maxlength: 120 },
    description: { type: String, maxlength: 5000 },
    image: { type: imageSchema, default: () => ({ url: DEFAULT_IMAGE }) },
    images: { type: [imageSchema], default: [] },
    price: { type: Number, required: true, min: 1, max: 10_000_000 },
    location: { type: String, required: true },
    country: { type: String, required: true },
    category: { type: String, enum: CATEGORIES, required: true },
    amenities: { type: [{ type: String, enum: AMENITIES }], default: [] },
    geometry: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (v: number[]) =>
            v.length === 2 &&
            v.every(Number.isFinite) &&
            Math.abs(v[0]) <= 180 &&
            Math.abs(v[1]) <= 90,
          message: "Invalid longitude/latitude",
        },
      },
    },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  },
  { collection: "listings", autoIndex: false },
);
listingSchema.index({ category: 1, price: 1 });
listingSchema.index({ owner: 1 });
listingSchema.index({ geometry: "2dsphere" });
// Cascading deletion is performed transactionally in the listing service.
export const Listing =
  (mongoose.models.Listing as Model<ListingDocument> | undefined) ??
  mongoose.model<ListingDocument>("Listing", listingSchema);
