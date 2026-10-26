import "server-only";
import { createHash } from "node:crypto";
import { RateLimit } from "@/models/RateLimit";
import { connectDB } from "@/lib/db";
import { HttpError } from "@/lib/http";
export async function rateLimit(
  key: string,
  limit: number,
  windowMs = 15 * 60 * 1000,
) {
  await connectDB();
  const bucket = Math.floor(Date.now() / windowMs);
  const id = createHash("sha256").update(`${key}:${bucket}`).digest("hex");
  const record = await RateLimit.findOneAndUpdate(
    { _id: id },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: new Date((bucket + 1) * windowMs) },
    },
    { upsert: true, new: true },
  );
  if (record.count > limit)
    throw new HttpError(429, "Too many attempts. Please try again later.");
}
export function clientIP(headers: Headers) {
  // Vercel overwrites this header; ignore arbitrary forwarded headers elsewhere.
  return process.env.VERCEL
    ? (headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown")
    : "local";
}
