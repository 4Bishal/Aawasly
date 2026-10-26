"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ListingImage } from "@/types";
export function Gallery({
  images,
  title,
}: {
  images: ListingImage[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  return (
    <section
      aria-label="Property photos"
      className="relative overflow-hidden rounded-3xl bg-muted"
    >
      <div
        className="relative aspect-[16/10] sm:aspect-[2.1/1]"
        aria-live="polite"
      >
        <Image
          src={images[index].url}
          alt={`${title} — photo ${index + 1}`}
          fill
          priority={index === 0}
          sizes="(max-width: 1280px) 100vw, 1200px"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2"
            aria-label="Previous photo"
            onClick={() =>
              setIndex((index - 1 + images.length) % images.length)
            }
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2"
            aria-label="Next photo"
            onClick={() => setIndex((index + 1) % images.length)}
          >
            <ChevronRight className="size-5" />
          </Button>
        </>
      )}
      <span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-card/95 px-4 py-2 text-xs font-medium">
        <Images className="size-4" />
        {index + 1} / {images.length}
      </span>
    </section>
  );
}
