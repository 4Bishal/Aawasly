import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, MapPin, Star } from "lucide-react";
import { Price } from "@/components/listings/price";
import type { ListingDTO } from "@/types";
export function ListingCard({
  listing,
  priority = false,
}: {
  listing: ListingDTO;
  priority?: boolean;
}) {
  return (
    <article className="group min-w-0">
      <Link
        href={`/listing/${listing.id}`}
        className="relative block aspect-[4/3] overflow-hidden rounded-[1.4rem] bg-muted"
        aria-label={`Explore ${listing.title}`}
      >
        <Image
          src={listing.image.url}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority={priority}
        />
        <span className="absolute left-4 top-4 rounded-full bg-card/95 px-3 py-1.5 text-[11px] font-semibold tracking-wide shadow-sm">
          {listing.category}
        </span>
        <span className="absolute bottom-4 right-4 flex size-9 items-center justify-center rounded-full bg-card/95 opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </Link>
      <div className="px-1 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="truncate text-base font-semibold">
            <Link href={`/listing/${listing.id}`}>{listing.title}</Link>
          </h3>
          <span className="flex shrink-0 items-center gap-1 text-xs">
            <Star className="size-3.5 fill-foreground" />
            {listing.reviewCount ? listing.rating.toFixed(1) : "New"}
          </span>
        </div>
        <p className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          {listing.location}, {listing.country}
        </p>
        <div className="mt-3">
          <Price price={listing.price} />
        </div>
      </div>
    </article>
  );
}
