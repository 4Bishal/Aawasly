import { z } from "zod";
import { AMENITIES, CATEGORIES } from "@/lib/constants";
export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid document ID");
export const imageSchema = z.object({
  url: z
    .url()
    .refine((url) => url.startsWith("https://"), "Use a secure image URL"),
  filename: z.string().min(1).max(250),
});
export const geometrySchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([
    z.number().min(-180).max(180),
    z.number().min(-90).max(90),
  ]),
});
export const listingSchema = z
  .object({
    title: z.string().trim().min(5).max(120),
    description: z.string().trim().min(20).max(5000),
    price: z
      .number()
      .min(1)
      .max(10_000_000)
      .refine(
        (value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.00001,
        "Use at most two decimal places",
      ),
    location: z.string().trim().min(2).max(150),
    country: z.string().trim().min(2).max(100),
    category: z.enum(CATEGORIES),
    amenities: z.array(z.enum(AMENITIES)).max(AMENITIES.length),
    images: z.array(imageSchema).min(1, "Upload at least one photo").max(8),
  })
  .strict();
export const reviewSchema = z
  .object({
    comment: z.string().trim().min(3).max(2000),
    rating: z.number().int().min(1).max(5),
  })
  .strict();
export const loginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  // Legacy accounts may predate the stronger registration password policy.
  password: z.string().min(1).max(128),
});
export const signupSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/, "Use letters, numbers, and underscores"),
    email: z
      .email()
      .max(254)
      .transform((value) => value.toLowerCase()),
    password: z.string().min(12, "Use at least 12 characters").max(128),
  })
  .strict();
const optionalNumber = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.coerce.number().finite().nonnegative().optional(),
);
export const searchSchema = z
  .object({
    q: z.string().trim().max(120).default(""),
    category: z.enum(CATEGORIES).optional(),
    minPrice: optionalNumber,
    maxPrice: optionalNumber,
    minRating: z.coerce.number().min(0).max(5).default(0),
    amenities: z.preprocess(
      (value) =>
        typeof value === "string" ? value.split(",").filter(Boolean) : value,
      z.array(z.enum(AMENITIES)).default([]),
    ),
    sort: z
      .enum(["newest", "price-asc", "price-desc", "rating"])
      .default("newest"),
    page: z.coerce.number().int().min(1).max(10000).default(1),
  })
  .refine(
    (value) =>
      value.minPrice === undefined ||
      value.maxPrice === undefined ||
      value.minPrice <= value.maxPrice,
    {
      message: "Maximum price must be greater than minimum price",
      path: ["maxPrice"],
    },
  );
export type ListingInput = z.infer<typeof listingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
