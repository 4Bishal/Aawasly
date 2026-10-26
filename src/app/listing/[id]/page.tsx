import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  House,
  Wifi,
  Check,
} from "lucide-react";
import { getListing } from "@/lib/services/listings";
import { getSession } from "@/lib/auth";
import { Gallery } from "@/components/listings/gallery";
import { PricePanel } from "@/components/listings/price";
import { OwnerActions } from "@/components/listings/owner-actions";
import { PropertyMap } from "@/components/maps/property-map";
import {
  RatingSummary,
  ReviewSection,
} from "@/components/reviews/review-section";
export const metadata = { title: "A place to call yours" };
export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [listing, session] = await Promise.all([getListing(id), getSession()]);
  if (!listing) notFound();
  return (
    <main id="main" className="page-shell page-enter pt-8">
      <Link
        href="/listing"
        className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to exploring
      </Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow mb-3">{listing.category} · Aawasly stays</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {listing.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <RatingSummary id={id} initial={listing.reviews} />
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {listing.location}, {listing.country}
            </span>
          </div>
        </div>
        {session?.user.id === listing.owner?.id && <OwnerActions id={id} />}
      </div>
      <Gallery images={listing.images} title={listing.title} />
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
        <div className="min-w-0 space-y-9">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">
                A {listing.category.toLowerCase()} escape in {listing.location}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Hosted by {listing.owner?.username ?? "a former member"}
              </p>
            </div>
            <span className="flex size-13 shrink-0 items-center justify-center rounded-full bg-accent text-xl font-semibold">
              {(listing.owner?.username ?? "A").slice(0, 1).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-wrap gap-6 border-y border-border py-6">
            <div className="flex items-center gap-2 text-xs">
              <ShieldCheck className="size-5 text-primary" />A space with
              character
            </div>
            <div className="flex items-center gap-2 text-xs">
              <House className="size-5 text-primary" />
              Make yourself at home
            </div>
          </div>
          <section>
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">
              A little about this place
            </h2>
            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
              {listing.description ||
                "Your host has not added a description yet."}
            </p>
          </section>
          {!!listing.amenities.length && (
            <section className="border-t border-border pt-8">
              <h2 className="mb-5 text-2xl font-semibold tracking-tight">
                The little comforts
              </h2>
              <div className="grid grid-cols-2 gap-5">
                {listing.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="flex items-center gap-3 text-sm"
                  >
                    {amenity === "Wi-Fi" ? (
                      <Wifi className="size-5 text-muted-foreground" />
                    ) : (
                      <Check className="size-5 text-muted-foreground" />
                    )}
                    {amenity}
                  </span>
                ))}
              </div>
            </section>
          )}
          <PropertyMap
            geometry={listing.geometry}
            location={listing.location}
            country={listing.country}
          />
          <ReviewSection id={id} initial={listing.reviews} />
        </div>
        <PricePanel price={listing.price} />
      </div>
    </main>
  );
}
