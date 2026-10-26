import "server-only";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { geometrySchema } from "@/lib/validation";
import { HttpError } from "@/lib/http";
const responseSchema = z.object({
  features: z.array(z.object({ geometry: geometrySchema })),
});
export async function geocode(location: string, country: string) {
  const url = new URL(
    `https://api.maptiler.com/geocoding/${encodeURIComponent(`${location}, ${country}`)}.json`,
  );
  url.searchParams.set("key", getServerEnv().MAPTILER_API_KEY);
  url.searchParams.set("limit", "1");
  const response = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!response.ok)
    throw new HttpError(
      502,
      "Location lookup is unavailable. Please try again.",
    );
  const result = responseSchema.safeParse(await response.json());
  if (!result.success || !result.data.features[0])
    throw new HttpError(
      422,
      "We could not find that location. Try a nearby city.",
    );
  return result.data.features[0].geometry;
}
