import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { assertSameOrigin, apiError } from "@/lib/http";
import { rateLimit } from "@/lib/auth/rate-limit";
import { getServerEnv } from "@/lib/env";
import { getCloudinary } from "@/lib/services/cloudinary";
import { UPLOAD_FOLDER } from "@/lib/constants";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    await rateLimit(`upload:${user.id}`, 40);
    const env = getServerEnv();
    const params = {
      timestamp: Math.floor(Date.now() / 1000),
      public_id: `${UPLOAD_FOLDER}/${user.id}/${randomUUID()}`,
      overwrite: false,
      allowed_formats: "jpg,png,jpeg,webp",
    };
    const signature = getCloudinary().utils.api_sign_request(
      params,
      env.CLOUDINARY_API_SECRET,
    );
    return NextResponse.json({
      ...params,
      signature,
      api_key: env.CLOUDINARY_API_KEY,
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    return apiError(error);
  }
}
