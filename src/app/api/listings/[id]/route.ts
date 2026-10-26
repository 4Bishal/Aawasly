import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { listingSchema } from "@/lib/validation";
import { assertSameOrigin, readJSON, apiError, HttpError } from "@/lib/http";
import {
  deleteListing,
  getListing,
  saveListing,
} from "@/lib/services/listings";
import { rateLimit } from "@/lib/auth/rate-limit";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    const listing = await getListing((await context.params).id);
    if (!listing) throw new HttpError(404, "Stay not found");
    return NextResponse.json(listing);
  } catch (error) {
    return apiError(error);
  }
}
export async function PATCH(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    await rateLimit(`listing:${user.id}`, 30);
    const id = await saveListing(
      listingSchema.parse(await readJSON(request)),
      user.id,
      (await context.params).id,
    );
    return NextResponse.json({ id });
  } catch (error) {
    return apiError(error);
  }
}
export async function DELETE(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    await deleteListing((await context.params).id, user.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
