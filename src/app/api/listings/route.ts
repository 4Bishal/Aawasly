import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { listingSchema, searchSchema } from "@/lib/validation";
import { assertSameOrigin, readJSON, apiError } from "@/lib/http";
import { saveListing, searchListings } from "@/lib/services/listings";
import { rateLimit } from "@/lib/auth/rate-limit";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    return NextResponse.json(
      await searchListings(
        searchSchema.parse(
          Object.fromEntries(new URL(request.url).searchParams),
        ),
      ),
    );
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    await rateLimit(`listing:${user.id}`, 30);
    const id = await saveListing(
      listingSchema.parse(await readJSON(request)),
      user.id,
    );
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
