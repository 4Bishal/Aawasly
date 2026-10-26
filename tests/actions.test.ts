import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "@/lib/http";

const mocks = vi.hoisted(() => ({
  user: vi.fn(),
  rateLimit: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
  addReview: vi.fn(),
  deleteReview: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ requireUser: mocks.user }));
vi.mock("@/lib/auth/rate-limit", () => ({ rateLimit: mocks.rateLimit }));
vi.mock("@/lib/services/listings", () => ({
  saveListing: mocks.save,
  deleteListing: mocks.remove,
  addReview: mocks.addReview,
  deleteReview: mocks.deleteReview,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
import {
  addReviewAction,
  deleteListingAction,
  deleteReviewAction,
  saveListingAction,
} from "@/lib/actions/listings";
import { unwrapAction } from "@/lib/action-result";

const id = "0123456789abcdef01234567";
const reviewId = "1123456789abcdef01234567";
const listing = {
  title: "Mountain retreat",
  description: "A peaceful home overlooking the valley.",
  price: 1500,
  location: "Pokhara",
  country: "Nepal",
  category: "Mountains",
  amenities: [],
  images: [
    {
      url: "https://res.cloudinary.com/test/image/upload/stay.jpg",
      filename: "aawasly/listings/host/stay",
    },
  ],
};
beforeEach(() => {
  vi.resetAllMocks();
  mocks.user.mockResolvedValue({ id: "host", username: "host" });
  mocks.save.mockResolvedValue(id);
});

describe("validated Server Actions", () => {
  it("requires authentication independently of the calling UI", async () => {
    mocks.user.mockRejectedValue(
      new HttpError(401, "Please log in to continue"),
    );
    expect(await saveListingAction(listing)).toEqual({
      success: false,
      error: "Please log in to continue",
    });
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("rejects attempts to inject ownership", async () => {
    expect(
      (await saveListingAction({ ...listing, owner: "attacker" })).success,
    ).toBe(false);
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("saves using the authenticated identity and refreshes browse/detail pages", async () => {
    expect(unwrapAction(await saveListingAction(listing, id))).toEqual({ id });
    expect(mocks.save).toHaveBeenCalledWith(listing, "host", id);
    expect(mocks.rateLimit).toHaveBeenCalledWith("listing:host", 30);
    expect(mocks.revalidate).toHaveBeenCalledWith("/listing");
    expect(mocks.revalidate).toHaveBeenCalledWith(`/listing/${id}`);
  });
  it("preserves ownership errors from the shared service", async () => {
    mocks.remove.mockRejectedValue(
      new HttpError(403, "Only the listing owner can delete this stay"),
    );
    const result = await deleteListingAction(id);
    expect(result).toEqual({
      success: false,
      error: "Only the listing owner can delete this stay",
    });
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });
  it("validates review stars and document IDs before mutation", async () => {
    expect(
      (await addReviewAction(id, { comment: "Lovely stay", rating: 6 }))
        .success,
    ).toBe(false);
    expect((await deleteReviewAction(id, "invalid-id")).success).toBe(false);
    expect(mocks.addReview).not.toHaveBeenCalled();
    expect(mocks.deleteReview).not.toHaveBeenCalled();
  });
  it("passes review authorship to the service and returns a serializable result", async () => {
    await deleteReviewAction(id, reviewId);
    expect(mocks.deleteReview).toHaveBeenCalledWith(id, reviewId, "host");
    expect(mocks.rateLimit).toHaveBeenCalledWith("review:host", 20);
  });
  it("does not expose unexpected provider or database details", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.save.mockRejectedValue(
      new Error("mongodb://private:password@example.invalid"),
    );
    const result = await saveListingAction(listing);
    expect(result).toEqual({
      success: false,
      error: "Something went wrong. Please try again.",
    });
    expect(JSON.stringify(log.mock.calls)).not.toContain("password");
    log.mockRestore();
  });
});
