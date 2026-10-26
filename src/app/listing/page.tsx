import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Compass, Leaf, MapPin } from "lucide-react";
import { searchSchema } from "@/lib/validation";
import { searchListings } from "@/lib/services/listings";
import { ListingCard } from "@/components/listings/listing-card";
import { Filters } from "@/components/listings/filters";
import { Button } from "@/components/ui/button";
import type { SearchResult } from "@/types";
export const metadata = { title: "Explore stays" };
export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const parsed = searchSchema.safeParse(params);
  const result: SearchResult = parsed.success
    ? await searchListings(parsed.data)
    : { listings: [], total: 0, page: 1, pages: 0 };
  function pageURL(page: number) {
    const next = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (typeof v === "string") next.set(k, v);
    });
    next.set("page", String(page));
    return `/listing?${next}`;
  }
  return (
    <main id="main" className="page-enter">
      <div className="page-shell pt-6 sm:pt-8">
        <section className="relative isolate min-h-96 overflow-hidden rounded-[1.8rem] bg-foreground sm:min-h-[425px]">
          <Image
            src="https://images.unsplash.com/photo-1464822759023-7fed622f2c3b?auto=format&fit=crop&w=2000&q=85"
            alt="Sunlight settling over a peaceful mountain landscape"
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1240px"
            className="-z-20 object-cover object-[center_60%]"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#132d26]/85 via-[#1c352d]/55 to-transparent" />
          <div className="px-7 pb-24 pt-12 sm:px-14 sm:pt-14">
            <p className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.25em] text-white/80">
              <span className="h-px w-7 bg-white/60" />
              Where stays begin
            </p>
            <h1 className="max-w-xl text-[2.7rem] leading-[1.08] font-medium tracking-[-.055em] text-white sm:text-[4.2rem]">
              Find a stay.
              <br />
              <span className="font-serif italic font-normal tracking-[-.04em] text-[#f2d6b6]">
                Feel a little further.
              </span>
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/75">
              From quiet mountain mornings to a new city’s rhythm. Find a space
              that feels like you.
            </p>
          </div>
          <span className="absolute bottom-6 right-7 hidden items-center gap-2 text-xs text-white/80 sm:flex">
            <MapPin className="size-3.5" />A little closer to nature
          </span>
        </section>
      </div>
      <section className="page-shell">
        <Suspense
          fallback={<div className="h-48 animate-pulse rounded-3xl bg-muted" />}
        >
          <Filters total={result.total} />
        </Suspense>
        {!parsed.success ? (
          <div
            role="alert"
            className="rounded-3xl border border-border p-10 text-center"
          >
            <h2 className="text-xl font-semibold">
              Let’s adjust those filters
            </h2>
            <p className="my-4 text-sm text-muted-foreground">
              {parsed.error.issues[0]?.message}
            </p>
            <Button asChild variant="outline">
              <Link href="/listing">Reset filters</Link>
            </Button>
          </div>
        ) : result.listings.length ? (
          <div className="grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {result.listings.map((listing, i) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                priority={i < 3}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-border px-5 py-16 text-center">
            <Compass className="mb-4 size-10 text-primary" />
            <h2 className="text-xl font-semibold">
              Your next stay is still out there
            </h2>
            <p className="my-4 text-sm text-muted-foreground">
              Try a different destination or give your filters a little room.
            </p>
            <Button asChild variant="outline">
              <Link href="/listing">Explore all stays</Link>
            </Button>
          </div>
        )}
        {result.pages > 1 && (
          <nav
            aria-label="Listing pages"
            className="mt-12 flex items-center justify-center gap-6"
          >
            {result.page > 1 && (
              <Button asChild variant="outline">
                <Link href={pageURL(result.page - 1)}>
                  <ArrowLeft className="size-4" />
                  Previous
                </Link>
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              Page {result.page} of {result.pages}
            </span>
            {result.page < result.pages && (
              <Button asChild variant="outline">
                <Link href={pageURL(result.page + 1)}>
                  Next
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
          </nav>
        )}
        <div className="mt-16 grid gap-7 border-y border-border py-7 sm:grid-cols-3">
          {[
            {
              Icon: Compass,
              title: "Find your kind of somewhere",
              text: "Thoughtful spaces for every kind of escape.",
            },
            {
              Icon: Leaf,
              title: "More than a place to sleep",
              text: "Little details. Local character. Lasting memories.",
            },
            {
              Icon: MapPin,
              title: "A world worth wandering",
              text: "From familiar favourites to new horizons.",
            },
          ].map(({ Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <Icon className="mt-1 size-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-semibold">{title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
        <section className="mt-12 flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-accent px-7 py-8 sm:px-10">
          <div>
            <p className="eyebrow mb-2">Good spaces deserve good company</p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Your space. Someone’s favourite escape.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Open your doors to a new story.
            </p>
          </div>
          <Button asChild variant="dark">
            <Link href="/listing/new">
              Become a host
              <ArrowUpRightIcon />
            </Link>
          </Button>
        </section>
      </section>
    </main>
  );
}
function ArrowUpRightIcon() {
  return <ArrowRight className="size-4 -rotate-45" />;
}
