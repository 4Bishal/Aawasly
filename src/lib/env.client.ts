import { z } from "zod";
// Static access is necessary for Next.js to inline browser-visible variables.
const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_MAPTILER_KEY: z.string().optional(),
});
export const publicEnv = publicEnvironmentSchema.parse({
  NEXT_PUBLIC_MAPTILER_KEY: process.env.NEXT_PUBLIC_MAPTILER_KEY,
});
