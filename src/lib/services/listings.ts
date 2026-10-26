import "server-only";
import mongoose, { Types, type PipelineStage } from "mongoose";
import { connectDB } from "@/lib/db";
import { Listing } from "@/models/Listing";
import { Review } from "@/models/Review";
import { User } from "@/models/User";
import { DEFAULT_IMAGE } from "@/lib/constants";
import { HttpError } from "@/lib/http";
import {
  objectIdSchema,
  type ListingInput,
  type ReviewInput,
  type SearchInput,
} from "@/lib/validation";
import type {
  ListingDetailDTO,
  ListingDTO,
  ListingDocument,
  ReviewDocument,
  ReviewDTO,
  SearchResult,
  UserDocument,
} from "@/types";

type PopulatedUser = UserDocument & { _id: Types.ObjectId };
type PopulatedReview = Omit<ReviewDocument, "author"> & {
  _id: Types.ObjectId;
  author: PopulatedUser | null;
};
type ListingRow = Omit<ListingDocument, "owner"> & {
  _id: Types.ObjectId;
  owner: PopulatedUser | null;
  rating?: number;
  reviewCount?: number;
};
function listingDTO(row: ListingRow): ListingDTO {
  const image = {
    url: row.image?.url || DEFAULT_IMAGE,
    filename: row.image?.filename || "legacy",
  };
  return {
    id: row._id.toString(),
    title: row.title,
    description: row.description || "",
    image,
    images: row.images?.length
      ? row.images.map((i) => ({ url: i.url, filename: i.filename }))
      : [image],
    price: row.price,
    location: row.location,
    country: row.country,
    category: row.category,
    amenities: row.amenities ?? [],
    geometry: row.geometry,
    owner: row.owner
      ? { id: row.owner._id.toString(), username: row.owner.username }
      : null,
    rating: row.rating ?? 0,
    reviewCount: row.reviewCount ?? 0,
  };
}
export function reviewDTO(review: PopulatedReview): ReviewDTO {
  return {
    id: review._id.toString(),
    comment: review.comment,
    rating: review.rating,
    createdAt: review.createdAt.toISOString(),
    author: review.author
      ? { id: review.author._id.toString(), username: review.author.username }
      : null,
  };
}
export const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function searchListings(
  input: SearchInput,
): Promise<SearchResult> {
  await connectDB();
  const match: Record<string, unknown> = {};
  if (input.q)
    match.$or = ["title", "location", "country"].map((field) => ({
      [field]: { $regex: escapeRegex(input.q), $options: "i" },
    }));
  if (input.category) match.category = input.category;
  if (input.minPrice !== undefined || input.maxPrice !== undefined)
    match.price = {
      ...(input.minPrice !== undefined ? { $gte: input.minPrice } : {}),
      ...(input.maxPrice !== undefined ? { $lte: input.maxPrice } : {}),
    };
  if (input.amenities.length) match.amenities = { $all: input.amenities };
  const sort: Record<string, 1 | -1> =
    input.sort === "price-asc"
      ? { price: 1, _id: -1 }
      : input.sort === "price-desc"
        ? { price: -1, _id: -1 }
        : input.sort === "rating"
          ? { rating: -1, _id: -1 }
          : { _id: -1 };
  const ratingStages: PipelineStage.FacetPipelineStage[] = [
    {
      $lookup: {
        from: "reviews",
        localField: "reviews",
        foreignField: "_id",
        pipeline: [{ $project: { rating: 1 } }],
        as: "reviewStats",
      },
    },
    {
      $addFields: {
        rating: { $ifNull: [{ $avg: "$reviewStats.rating" }, 0] },
        reviewCount: { $size: "$reviewStats" },
      },
    },
  ];
  // The common browse path only joins reviews for the current page. Rating
  // filtering/sorting needs the averages before pagination to stay correct.
  const needsRating = input.minRating > 0 || input.sort === "rating";
  const pipeline: PipelineStage[] = [
    { $match: match },
    ...(needsRating ? ratingStages : []),
    ...(input.minRating > 0
      ? [{ $match: { rating: { $gte: input.minRating } } }]
      : []),
    { $sort: sort },
    {
      $facet: {
        listings: [
          { $skip: (input.page - 1) * 12 },
          { $limit: 12 },
          ...(needsRating ? [] : ratingStages),
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              pipeline: [{ $project: { username: 1 } }],
              as: "owner",
            },
          },
          { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
          { $project: { reviewStats: 0 } },
        ],
        count: [{ $count: "total" }],
      },
    },
  ];
  const [result] = await Listing.aggregate<{
    listings: ListingRow[];
    count: { total: number }[];
  }>(pipeline).option({ maxTimeMS: 8000 });
  const total = result?.count[0]?.total ?? 0;
  return {
    listings: (result?.listings ?? []).map(listingDTO),
    total,
    page: input.page,
    pages: Math.ceil(total / 12),
  };
}
export async function getListing(id: string): Promise<ListingDetailDTO | null> {
  if (!objectIdSchema.safeParse(id).success) return null;
  await connectDB();
  // Import model registration explicitly before populate in serverless bundles.
  void User;
  void Review;
  const row = await Listing.findById(id)
    .populate<{ owner: PopulatedUser | null }>("owner", "username")
    .populate<{ reviews: PopulatedReview[] }>({
      path: "reviews",
      options: { sort: { createdAt: -1 } },
      populate: { path: "author", select: "username" },
    })
    .lean();
  if (!row) return null;
  const reviews = row.reviews.map(reviewDTO);
  return {
    ...listingDTO({
      ...row,
      reviews: [],
      rating: reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0,
      reviewCount: reviews.length,
    }),
    reviews,
  };
}
export async function getOwnedListing(id: string, userId: string) {
  objectIdSchema.parse(id);
  await connectDB();
  const listing = await Listing.findById(id);
  if (!listing) throw new HttpError(404, "This stay could not be found");
  if (listing.owner?.toString() !== userId)
    throw new HttpError(403, "Only the listing owner can change this stay");
  return listing;
}
export async function saveListing(
  input: ListingInput,
  userId: string,
  id?: string,
) {
  await connectDB();
  const listing = id ? await getOwnedListing(id, userId) : null;
  // Keep provider calls outside transactions and perform auth checks first.
  const { verifyImages } = await import("@/lib/services/cloudinary");
  const { geocode } = await import("@/lib/services/geocoding");
  await verifyImages(
    input.images,
    userId,
    listing ? [listing.image, ...listing.images] : [],
  );
  const geometry =
    listing &&
    listing.location === input.location &&
    listing.country === input.country
      ? listing.geometry
      : await geocode(input.location, input.country);
  const data = { ...input, image: input.images[0], geometry };
  if (listing) {
    const result = await Listing.findOneAndUpdate(
      { _id: listing._id, owner: userId },
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!result) throw new HttpError(404, "This stay could not be found");
    return result._id.toString();
  }
  const result = await Listing.create({
    ...data,
    owner: new Types.ObjectId(userId),
  });
  return result._id.toString();
}
export async function deleteListing(id: string, userId: string) {
  objectIdSchema.parse(id);
  await connectDB();
  await mongoose.connection.transaction(async (session) => {
    const listing = await Listing.findById(id).session(session);
    if (!listing) throw new HttpError(404, "This stay could not be found");
    if (listing.owner?.toString() !== userId)
      throw new HttpError(403, "Only the listing owner can delete this stay");
    await Review.deleteMany({ _id: { $in: listing.reviews } }).session(session);
    await Listing.deleteOne({ _id: listing._id, owner: userId }).session(
      session,
    );
  });
}
export async function addReview(
  id: string,
  userId: string,
  input: ReviewInput,
) {
  objectIdSchema.parse(id);
  await connectDB();
  let reviewId = "";
  await mongoose.connection.transaction(async (session) => {
    const listing = await Listing.findById(id).session(session);
    if (!listing) throw new HttpError(404, "This stay could not be found");
    const [review] = await Review.create(
      [{ ...input, author: new Types.ObjectId(userId) }],
      { session },
    );
    await Listing.updateOne(
      { _id: id },
      { $push: { reviews: review._id } },
    ).session(session);
    reviewId = review._id.toString();
  });
  const review = await Review.findById(reviewId)
    .populate<{ author: PopulatedUser | null }>("author", "username")
    .lean();
  if (!review) throw new HttpError(500, "Review could not be loaded");
  return reviewDTO(review);
}
export async function deleteReview(
  id: string,
  reviewId: string,
  userId: string,
) {
  objectIdSchema.parse(id);
  objectIdSchema.parse(reviewId);
  await connectDB();
  await mongoose.connection.transaction(async (session) => {
    const listing = await Listing.findOne({
      _id: id,
      reviews: reviewId,
    }).session(session);
    if (!listing) throw new HttpError(404, "Review not found on this listing");
    const review = await Review.findById(reviewId).session(session);
    if (!review) throw new HttpError(404, "Review not found");
    if (review.author.toString() !== userId)
      throw new HttpError(403, "Only the review author can delete this review");
    await Listing.updateOne(
      { _id: id },
      { $pull: { reviews: review._id } },
    ).session(session);
    await Review.deleteOne({ _id: review._id, author: userId }).session(
      session,
    );
  });
}
