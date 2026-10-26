import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { getServerEnv } from "@/lib/env";
import { MAX_IMAGE_BYTES, UPLOAD_FOLDER } from "@/lib/constants";
import { HttpError } from "@/lib/http";
import type { ListingImage } from "@/types";
export function getCloudinary() {
  const env = getServerEnv();
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}
/** Validate uploaded resources server-side; a client URL is never proof of upload. */
export async function verifyImages(
  images: ListingImage[],
  userId: string,
  existing: ListingImage[] = [],
) {
  for (const image of images) {
    if (
      existing.some(
        (old) =>
          (old.filename || "legacy") === image.filename &&
          old.url === image.url,
      )
    )
      continue;
    if (!image.filename.startsWith(`${UPLOAD_FOLDER}/${userId}/`))
      throw new HttpError(400, "Invalid listing photo");
    const resource = (await getCloudinary().api.resource(image.filename, {
      resource_type: "image",
    })) as { secure_url: string; bytes: number; format: string };
    if (
      resource.secure_url !== image.url ||
      resource.bytes > MAX_IMAGE_BYTES ||
      !["jpg", "jpeg", "png", "webp"].includes(resource.format)
    )
      throw new HttpError(
        400,
        "Photos must be JPG, PNG or WebP and smaller than 8 MB",
      );
  }
}
