import type { Types } from "mongoose";
import type { AMENITIES, CATEGORIES } from "@/lib/constants";
export type Category = (typeof CATEGORIES)[number];
export type Amenity = (typeof AMENITIES)[number];
export interface ListingImage {
  url: string;
  filename: string;
}
export interface Geometry {
  type: "Point";
  coordinates: [number, number];
}
export interface ListingDocument {
  title: string;
  description: string;
  image: ListingImage;
  images: ListingImage[];
  price: number;
  location: string;
  country: string;
  category: Category;
  amenities: Amenity[];
  geometry: Geometry;
  owner: Types.ObjectId;
  reviews: Types.ObjectId[];
}
export interface ReviewDocument {
  comment: string;
  rating: number;
  createdAt: Date;
  author: Types.ObjectId;
}
export interface UserDocument {
  username: string;
  email: string;
  passwordHash?: string;
  hash?: string;
  salt?: string;
}
export interface UserSummary {
  id: string;
  username: string;
}
export interface ReviewDTO {
  id: string;
  comment: string;
  rating: number;
  createdAt: string;
  author: UserSummary | null;
}
export interface ListingDTO {
  id: string;
  title: string;
  description: string;
  image: ListingImage;
  images: ListingImage[];
  price: number;
  location: string;
  country: string;
  category: Category;
  amenities: Amenity[];
  geometry: Geometry;
  owner: UserSummary | null;
  rating: number;
  reviewCount: number;
}
export interface ListingDetailDTO extends ListingDTO {
  reviews: ReviewDTO[];
}
export interface SearchResult {
  listings: ListingDTO[];
  total: number;
  page: number;
  pages: number;
}
