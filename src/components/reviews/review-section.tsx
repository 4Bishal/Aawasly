"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Trash2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/client-api";
import { addReviewAction, deleteReviewAction } from "@/lib/actions/listings";
import { unwrapAction } from "@/lib/action-result";
import { reviewSchema, type ReviewInput } from "@/lib/validation";
import type { ReviewDTO } from "@/types";
function reviewQuery(id: string, initial: ReviewDTO[]) {
  return {
    queryKey: ["reviews", id],
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      api<ReviewDTO[]>(`/api/listings/${id}/reviews`, { signal }),
    initialData: initial,
  };
}
export function RatingSummary({
  id,
  initial,
}: {
  id: string;
  initial: ReviewDTO[];
}) {
  const { data } = useQuery(reviewQuery(id, initial));
  const average = data.length
    ? data.reduce((sum, review) => sum + review.rating, 0) / data.length
    : 0;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <Star className="size-4 fill-primary text-primary" />
      {data.length ? average.toFixed(1) : "New"}
      <span className="text-muted-foreground">
        · {data.length} {data.length === 1 ? "review" : "reviews"}
      </span>
    </span>
  );
}
export function ReviewSection({
  id,
  initial,
}: {
  id: string;
  initial: ReviewDTO[];
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const key = ["reviews", id];
  const { data: reviews, isError } = useQuery(reviewQuery(id, initial));
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, comment: "" },
  });
  const rating = watch("rating");
  async function settled() {
    await queryClient.invalidateQueries({ queryKey: key });
    router.refresh();
  }
  const add = useMutation({
    mutationFn: async (input: ReviewInput) =>
      unwrapAction(await addReviewAction(id, input)),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ReviewDTO[]>(key);
      queryClient.setQueryData<ReviewDTO[]>(key, (current) => [
        {
          ...input,
          id: `pending-${Date.now()}`,
          createdAt: new Date().toISOString(),
          author: {
            id: session!.user.id,
            username: session!.user.name ?? "You",
          },
        },
        ...(current ?? []),
      ]);
      return { previous };
    },
    onError: (error, _input, context) => {
      queryClient.setQueryData(key, context?.previous);
      toast.error(error.message);
    },
    onSuccess: () => {
      reset();
      toast.success("Thanks for sharing your stay");
    },
    onSettled: settled,
  });
  const remove = useMutation({
    mutationFn: async (reviewId: string) =>
      unwrapAction(await deleteReviewAction(id, reviewId)),
    onMutate: async (reviewId) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ReviewDTO[]>(key);
      queryClient.setQueryData<ReviewDTO[]>(key, (current) =>
        current?.filter((r) => r.id !== reviewId),
      );
      return { previous };
    },
    onError: (error, _id, context) => {
      queryClient.setQueryData(key, context?.previous);
      toast.error(error.message);
    },
    onSuccess: () => toast.success("Review deleted"),
    onSettled: settled,
  });
  const busy = add.isPending || remove.isPending;
  return (
    <section id="reviews" className="border-t border-border pt-8">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">
          Stories from our guests
        </h2>
        <RatingSummary id={id} initial={initial} />
      </div>
      {isError && (
        <p role="alert" className="mb-5 text-sm text-primary">
          Reviews could not be refreshed. Please try again.
        </p>
      )}
      {!reviews.length && (
        <p className="mb-8 rounded-2xl bg-muted p-6 text-sm text-muted-foreground">
          Every great stay starts with a first story. Be the first to share
          yours.
        </p>
      )}
      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        {reviews.map((review) => (
          <article
            key={review.id}
            className={`rounded-2xl border border-border p-5 ${review.id.startsWith("pending-") ? "opacity-60" : ""}`}
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-accent text-sm font-semibold">
                {(review.author?.username ?? "Guest").slice(0, 1).toUpperCase()}
              </span>
              <div>
                <h3 className="text-sm font-semibold">
                  {review.author?.username ?? "Former member"}
                </h3>
                <time
                  dateTime={review.createdAt}
                  className="text-xs text-muted-foreground"
                >
                  {new Intl.DateTimeFormat("en-NP", {
                    month: "short",
                    year: "numeric",
                    timeZone: "Asia/Kathmandu",
                  }).format(new Date(review.createdAt))}
                </time>
              </div>
              {session?.user.id === review.author?.id && (
                <button
                  className="ml-auto rounded-full p-2 text-muted-foreground hover:bg-muted disabled:opacity-40"
                  aria-label="Delete your review"
                  disabled={busy || review.id.startsWith("pending-")}
                  onClick={() => remove.mutate(review.id)}
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
            <div
              className="my-3 flex gap-0.5"
              aria-label={`${review.rating} out of 5 stars`}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`size-3 ${i < review.rating ? "fill-primary text-primary" : "text-border"}`}
                />
              ))}
            </div>
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
              {review.comment}
            </p>
            {review.id.startsWith("pending-") && (
              <p className="mt-2 text-xs" role="status">
                Sharing your story…
              </p>
            )}
          </article>
        ))}
      </div>
      {session?.user ? (
        <form
          className="rounded-3xl bg-muted/60 p-6"
          onSubmit={handleSubmit((input) => add.mutate(input))}
        >
          <h3 className="font-semibold">How was your stay?</h3>
          <fieldset disabled={busy} className="mt-4">
            <legend className="sr-only">Rating</legend>
            <div
              className="mb-4 flex gap-2"
              role="radiogroup"
              aria-label="Rating"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <label
                  key={value}
                  className="relative cursor-pointer rounded p-1"
                >
                  <input
                    type="radio"
                    name="review-rating"
                    value={value}
                    checked={rating === value}
                    aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                    onChange={() => setValue("rating", value)}
                    className="peer sr-only"
                  />
                  <Star
                    className={`size-6 rounded peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-primary ${value <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                  />
                </label>
              ))}
            </div>
            <label className="field-label">
              Your review
              <textarea
                className="input min-h-24 bg-card"
                placeholder="The little details, the big moments…"
                {...register("comment")}
                aria-invalid={!!errors.comment}
              />
            </label>
            {errors.comment && (
              <p className="field-error mt-2">{errors.comment.message}</p>
            )}
            <Button className="mt-4" disabled={busy}>
              {add.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              Share your story
            </Button>
          </fieldset>
        </form>
      ) : (
        <p className="rounded-2xl bg-muted p-6 text-sm text-muted-foreground">
          <Link
            href={`/login?callbackUrl=/listing/${id}`}
            className="font-semibold text-primary underline"
          >
            Log in
          </Link>{" "}
          to share your experience.
        </p>
      )}
    </section>
  );
}
