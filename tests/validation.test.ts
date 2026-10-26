import { describe, it, expect } from "vitest";
import {
  geometrySchema,
  listingSchema,
  reviewSchema,
  searchSchema,
  signupSchema,
} from "@/lib/validation";
const listing = {
  title: "Mountain retreat",
  description: "A quiet escape overlooking the hills.",
  price: 1500,
  location: "Pokhara",
  country: "Nepal",
  category: "Mountains",
  images: [
    {
      url: "https://res.cloudinary.com/test/image/upload/test.jpg",
      filename: "test",
    },
  ],
  amenities: [],
};
describe("shared input validation", () => {
  it("rejects attempts to set protected listing fields", () => {
    expect(
      listingSchema.safeParse({ ...listing, owner: "attacker" }).success,
    ).toBe(false);
    expect(listingSchema.safeParse({ ...listing, reviews: [] }).success).toBe(
      false,
    );
  });
  it("validates money precision and review stars", () => {
    expect(listingSchema.safeParse({ ...listing, price: 1.123 }).success).toBe(
      false,
    );
    expect(
      reviewSchema.safeParse({ comment: "A lovely stay", rating: 4.5 }).success,
    ).toBe(false);
  });
  it("rejects inverted prices and unknown categories", () => {
    expect(
      searchSchema.safeParse({ minPrice: "100", maxPrice: "50" }).success,
    ).toBe(false);
    expect(searchSchema.safeParse({ category: "Unknown" }).success).toBe(false);
  });
  it("accepts empty filters and comma separated amenities", () => {
    expect(searchSchema.parse({ minPrice: "" }).minPrice).toBeUndefined();
    expect(
      searchSchema.parse({ amenities: "Wi-Fi,Kitchen" }).amenities,
    ).toEqual(["Wi-Fi", "Kitchen"]);
  });
  it("keeps longitude and latitude in range", () => {
    expect(
      geometrySchema.safeParse({ type: "Point", coordinates: [181, 20] })
        .success,
    ).toBe(false);
  });
  it("requires stronger passwords for new accounts", () => {
    expect(
      signupSchema.safeParse({
        username: "guest",
        email: "guest@example.com",
        password: "short",
      }).success,
    ).toBe(false);
  });
});
