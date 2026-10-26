"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, ImagePlus, LoaderCircle, X } from "lucide-react";
import { listingSchema, type ListingInput } from "@/lib/validation";
import { AMENITIES, CATEGORIES, MAX_IMAGE_BYTES } from "@/lib/constants";
import { api } from "@/lib/client-api";
import { saveListingAction } from "@/lib/actions/listings";
import { unwrapAction } from "@/lib/action-result";
import { Button } from "@/components/ui/button";
import type { ListingDetailDTO } from "@/types";
const uploadResponseSchema = z.object({
  secure_url: z.url(),
  public_id: z.string(),
});
interface Signature {
  timestamp: number;
  public_id: string;
  overwrite: boolean;
  allowed_formats: string;
  signature: string;
  api_key: string;
  cloud_name: string;
}
export function ListingForm({ listing }: { listing?: ListingDetailDTO }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ListingInput>({
    resolver: zodResolver(listingSchema),
    defaultValues: listing
      ? {
          title: listing.title,
          description: listing.description,
          price: listing.price,
          location: listing.location,
          country: listing.country,
          category: listing.category,
          amenities: listing.amenities,
          images: listing.images,
        }
      : {
          title: "",
          description: "",
          location: "",
          country: "Nepal",
          category: "Rooms",
          amenities: [],
          images: [],
        },
  });
  const images = watch("images");
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const selection = Array.from(files);
    if (images.length + selection.length > 8) {
      toast.error("Choose up to 8 photos in total");
      return;
    }
    if (
      selection.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > MAX_IMAGE_BYTES,
      )
    ) {
      toast.error("Choose JPG, PNG or WebP photos smaller than 8 MB");
      return;
    }
    setUploading(true);
    try {
      for (const file of selection) {
        const { cloud_name, ...signature } = await api<Signature>(
          "/api/uploads/signature",
          { method: "POST" },
        );
        const body = new FormData();
        body.append("file", file);
        Object.entries(signature).forEach(([key, value]) =>
          body.append(key, String(value)),
        );
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud_name)}/image/upload`,
          { method: "POST", body },
        );
        if (!response.ok)
          throw new Error("Photo upload failed. Please try again.");
        const result = uploadResponseSchema.parse(await response.json());
        setValue(
          "images",
          [
            ...watch("images"),
            { url: result.secure_url, filename: result.public_id },
          ],
          { shouldValidate: true },
        );
      }
      toast.success("Photos are ready");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  return (
    <form
      className="space-y-10"
      onSubmit={handleSubmit(async (values) => {
        try {
          const result = unwrapAction(
            await saveListingAction(values, listing?.id),
          );
          toast.success(
            listing
              ? "Your stay has been updated"
              : "Your space is ready to explore",
          );
          router.push(`/listing/${result.id}`);
          router.refresh();
        } catch (error) {
          setError("root", {
            message:
              error instanceof Error
                ? error.message
                : "Unable to save your listing",
          });
        }
      })}
    >
      <fieldset
        disabled={isSubmitting || uploading}
        className="space-y-7 disabled:opacity-70"
      >
        <div>
          <p className="eyebrow mb-4">01 / Set the scene</p>
          <label className="field-label">
            Give your stay a name
            <input
              className="input"
              placeholder="A little hideaway in the hills"
              {...register("title")}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <span className="field-error">{errors.title.message}</span>
            )}
          </label>
        </div>
        <label className="field-label">
          Tell its story
          <textarea
            className="input min-h-36 resize-y"
            placeholder="What makes your place special?"
            {...register("description")}
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <span className="field-error">{errors.description.message}</span>
          )}
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field-label">
            City or area
            <input
              className="input"
              placeholder="Pokhara"
              {...register("location")}
              aria-invalid={!!errors.location}
            />
            {errors.location && (
              <span className="field-error">{errors.location.message}</span>
            )}
          </label>
          <label className="field-label">
            Country
            <input
              className="input"
              {...register("country")}
              aria-invalid={!!errors.country}
            />
            {errors.country && (
              <span className="field-error">{errors.country.message}</span>
            )}
          </label>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field-label">
            Nightly rate (NPR / रू, before VAT)
            <input
              className="input"
              type="number"
              min="1"
              max="10000000"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
              aria-invalid={!!errors.price}
            />
            {errors.price && (
              <span className="field-error">{errors.price.message}</span>
            )}
          </label>
          <label className="field-label">
            Kind of stay
            <select className="input" {...register("category")}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="border-t border-border pt-7">
          <p className="eyebrow mb-4">02 / Let it shine</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Add up to 8 photos. JPG, PNG or WebP, up to 8 MB each. Your first
            photo is the cover.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image, index) => (
              <div
                key={image.filename}
                className="relative aspect-square overflow-hidden rounded-2xl bg-muted"
              >
                <Image
                  src={image.url}
                  alt={`Listing photo ${index + 1}`}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                <button
                  type="button"
                  aria-label={`Remove photo ${index + 1}`}
                  className="absolute right-2 top-2 rounded-full bg-card p-1"
                  onClick={() =>
                    setValue(
                      "images",
                      images.filter((_, i) => i !== index),
                      { shouldValidate: true },
                    )
                  }
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
            {images.length < 8 && (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground"
              >
                <ImagePlus className="size-6" />
                Add photos
              </button>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Upload listing photos"
            onChange={(event) => void upload(event.target.files)}
          />
          {errors.images && (
            <p className="field-error mt-2">
              {errors.images.message ?? "Please check your photos"}
            </p>
          )}
        </div>
        <div className="border-t border-border pt-7">
          <p className="eyebrow mb-5">03 / The little comforts</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {AMENITIES.map((amenity) => (
              <label key={amenity} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  value={amenity}
                  className="size-4 accent-primary"
                  {...register("amenities")}
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>
      </fieldset>
      {uploading && (
        <p className="flex items-center gap-2 text-sm" role="status">
          <LoaderCircle className="size-4 animate-spin" />
          Uploading your photos…
        </p>
      )}
      {errors.root && (
        <p className="field-error" role="alert">
          {errors.root.message}
        </p>
      )}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Go back
        </Button>
        <Button type="submit" size="lg" disabled={isSubmitting || uploading}>
          {isSubmitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" /> Saving your stay…
            </>
          ) : (
            <>
              {listing ? "Save changes" : "Publish your stay"}
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
