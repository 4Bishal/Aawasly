import "server-only";
import { z } from "zod";
const environmentSchema = z.object({
  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\//),
  NEXTAUTH_URL: z.url(),
  NEXTAUTH_SECRET: z.string().min(32),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  MAPTILER_API_KEY: z.string().min(1),
});
export type ServerEnvironment = z.infer<typeof environmentSchema>;
let cached: ServerEnvironment | undefined;
/** Validate at request time so builds never need database access or secrets. */
export function getServerEnv(): ServerEnvironment {
  if (cached) return cached;
  const result = environmentSchema.safeParse(process.env);
  if (!result.success) {
    const keys = result.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");
    throw new Error(
      `Missing or invalid server configuration: ${keys}. See .env.example.`,
    );
  }
  cached = result.data;
  return cached;
}
