import {
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  it,
  expect,
  vi,
} from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { resolve } from "node:path";
import { Listing } from "@/models/Listing";
import { User } from "@/models/User";
import { Review } from "@/models/Review";
import { RateLimit } from "@/models/RateLimit";
import {
  addReview,
  deleteReview,
  deleteListing,
  getListing,
  searchListings,
} from "@/lib/services/listings";
import { searchSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/auth/rate-limit";
import { assertSameOrigin, readJSON } from "@/lib/http";
let replica: MongoMemoryReplSet;
let owner: string;
let guest: string;
let listingId: string;
beforeAll(async () => {
  // Always ephemeral: never load or connect to .env / .env.local / production.
  replica = await MongoMemoryReplSet.create({
    binary: { downloadDir: resolve(".cache/mongodb-binaries") },
    replSet: { count: 1 },
  });
  await mongoose.connect(replica.getUri("aawasly_test"));
  await Promise.all([
    Listing.createCollection(),
    Review.createCollection(),
    User.createCollection(),
    RateLimit.createCollection(),
  ]);
  await User.createIndexes();
});
afterAll(async () => {
  await mongoose.disconnect();
  await replica?.stop();
});
beforeEach(async () => {
  await Promise.all([
    Listing.deleteMany({}),
    Review.deleteMany({}),
    User.deleteMany({}),
    RateLimit.deleteMany({}),
  ]);
  const users = await User.create([
    { username: "host", email: "host@example.com" },
    { username: "guest", email: "guest@example.com" },
  ]);
  owner = users[0]._id.toString();
  guest = users[1]._id.toString();
  const listing = await Listing.create({
    title: "Quiet mountain retreat",
    description: "A lovely peaceful place to rest.",
    price: 1500,
    location: "Pokhara",
    country: "Nepal",
    category: "Mountains",
    owner,
    geometry: { type: "Point", coordinates: [83.9856, 28.2096] },
    amenities: ["Wi-Fi"],
    reviews: [],
  });
  listingId = listing._id.toString();
});
describe("transactional listing and review rules", () => {
  it("adds a review and links it atomically", async () => {
    const review = await addReview(listingId, guest, {
      comment: "Such a peaceful place",
      rating: 5,
    });
    const listing = await getListing(listingId);
    expect(listing?.reviews[0].id).toBe(review.id);
    expect(listing?.rating).toBe(5);
    expect(listing?.owner?.username).toBe("host");
  });
  it("rejects review creation on a missing listing without creating an orphan", async () => {
    await expect(
      addReview(new mongoose.Types.ObjectId().toString(), guest, {
        comment: "Hello",
        rating: 5,
      }),
    ).rejects.toMatchObject({ status: 404 });
    expect(await Review.countDocuments()).toBe(0);
  });
  it("rejects deletion by someone other than the author", async () => {
    const review = await addReview(listingId, guest, {
      comment: "Lovely stay",
      rating: 4,
    });
    await expect(
      deleteReview(listingId, review.id, owner),
    ).rejects.toMatchObject({ status: 403 });
    expect(await Review.countDocuments()).toBe(1);
  });
  it("rejects a review ID attached to a different listing", async () => {
    const review = await addReview(listingId, guest, {
      comment: "Lovely stay",
      rating: 4,
    });
    const other = await Listing.create({
      title: "Another stay",
      price: 2000,
      location: "Kathmandu",
      country: "Nepal",
      category: "Rooms",
      owner,
      geometry: { type: "Point", coordinates: [85.32, 27.71] },
    });
    await expect(
      deleteReview(other._id.toString(), review.id, guest),
    ).rejects.toMatchObject({ status: 404 });
    expect((await getListing(listingId))?.reviewCount).toBe(1);
  });
  it("removes an authored review and its listing reference", async () => {
    const review = await addReview(listingId, guest, {
      comment: "Lovely stay",
      rating: 4,
    });
    await deleteReview(listingId, review.id, guest);
    expect(await Review.countDocuments()).toBe(0);
    expect((await getListing(listingId))?.reviews).toEqual([]);
  });
  it("enforces listing ownership and cascades review deletion", async () => {
    await addReview(listingId, guest, { comment: "Lovely stay", rating: 4 });
    await expect(deleteListing(listingId, guest)).rejects.toMatchObject({
      status: 403,
    });
    expect(await Listing.countDocuments()).toBe(1);
    await deleteListing(listingId, owner);
    expect(await Listing.countDocuments()).toBe(0);
    expect(await Review.countDocuments()).toBe(0);
  });
  it("filters on MongoDB by location, price, amenities, and actual ratings", async () => {
    await addReview(listingId, guest, {
      comment: "Wonderful views",
      rating: 5,
    });
    const result = await searchListings(
      searchSchema.parse({
        q: "pok",
        maxPrice: "1600",
        minRating: "4.5",
        amenities: "Wi-Fi",
      }),
    );
    expect(result.total).toBe(1);
    expect(result.listings[0].rating).toBe(5);
    expect((await searchListings(searchSchema.parse({ q: ".*" }))).total).toBe(
      0,
    );
    expect(
      (await searchListings(searchSchema.parse({ maxPrice: "1000" }))).total,
    ).toBe(0);
  });
  it("limits requests across callers using the database", async () => {
    await rateLimit("shared-test", 2);
    await rateLimit("shared-test", 2);
    await expect(rateLimit("shared-test", 2)).rejects.toMatchObject({
      status: 429,
    });
  });
});
describe("HTTP mutation safeguards", () => {
  it("rejects cross-origin mutations", () => {
    vi.stubEnv("MONGODB_URI", "mongodb://localhost/test");
    vi.stubEnv("NEXTAUTH_URL", "https://aawasly.example");
    vi.stubEnv("NEXTAUTH_SECRET", "x".repeat(32));
    for (const key of [
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
      "MAPTILER_API_KEY",
    ])
      vi.stubEnv(key, "test");
    expect(() =>
      assertSameOrigin(
        new Request("https://aawasly.example/api/listings", {
          headers: { origin: "https://evil.example" },
        }),
      ),
    ).toThrow("Request origin");
    expect(() =>
      assertSameOrigin(
        new Request("https://aawasly.example/api/listings", {
          headers: { origin: "https://aawasly.example" },
        }),
      ),
    ).not.toThrow();
  });
  it("caps JSON bodies even without Content-Length", async () => {
    const request = new Request("https://aawasly.example/api/listings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ description: "x".repeat(70_000) }),
    });
    await expect(readJSON(request)).rejects.toMatchObject({ status: 413 });
  });
});
