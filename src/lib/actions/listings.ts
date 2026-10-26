"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/auth/rate-limit";
import { executeAction } from "@/lib/actions/execute";
import { listingSchema, objectIdSchema, reviewSchema } from "@/lib/validation";
import {
  addReview,
  deleteListing,
  deleteReview,
  saveListing,
} from "@/lib/services/listings";

function refreshStay(id: string) {
  revalidatePath("/listing");
  revalidatePath(`/listing/${id}`);
}

export async function saveListingAction(input: unknown, listingId?: unknown) {
  return executeAction(async () => {
    const user = await requireUser();
    const values = listingSchema.parse(input);
    const existingId =
      listingId === undefined ? undefined : objectIdSchema.parse(listingId);
    await rateLimit(`listing:${user.id}`, 30);
    const id = await saveListing(values, user.id, existingId);
    refreshStay(id);
    return { id };
  });
}

export async function deleteListingAction(listingId: unknown) {
  return executeAction(async () => {
    const user = await requireUser();
    const id = objectIdSchema.parse(listingId);
    await rateLimit(`listing:${user.id}`, 30);
    await deleteListing(id, user.id);
    refreshStay(id);
    return null;
  });
}

export async function addReviewAction(listingId: unknown, input: unknown) {
  return executeAction(async () => {
    const user = await requireUser();
    const id = objectIdSchema.parse(listingId);
    const values = reviewSchema.parse(input);
    await rateLimit(`review:${user.id}`, 20);
    const review = await addReview(id, user.id, values);
    refreshStay(id);
    return review;
  });
}

export async function deleteReviewAction(
  listingId: unknown,
  reviewId: unknown,
) {
  return executeAction(async () => {
    const user = await requireUser();
    const id = objectIdSchema.parse(listingId);
    const review = objectIdSchema.parse(reviewId);
    await rateLimit(`review:${user.id}`, 20);
    await deleteReview(id, review, user.id);
    refreshStay(id);
    return null;
  });
}
