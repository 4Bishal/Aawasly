import { requireUser } from "@/lib/auth";
import { assertSameOrigin, apiError } from "@/lib/http";
import { deleteReview } from "@/lib/services/listings";
export const runtime = "nodejs";
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; reviewId: string }> },
) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const { id, reviewId } = await context.params;
    await deleteReview(id, reviewId, user.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
