import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { reviewSchema } from "@/lib/validation";
import { assertSameOrigin, readJSON, apiError, HttpError } from "@/lib/http";
import { addReview, getListing } from "@/lib/services/listings";
import { rateLimit } from "@/lib/auth/rate-limit";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    const listing = await getListing((await context.params).id);
    if (!listing) throw new HttpError(404, "Stay not found");
    return NextResponse.json(listing.reviews);
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    await rateLimit(`review:${user.id}`, 20);
    const review = await addReview(
      (await context.params).id,
      user.id,
      reviewSchema.parse(await readJSON(request)),
    );
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
