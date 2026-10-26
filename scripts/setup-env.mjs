import fs from "node:fs";
import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env");
if (fs.existsSync(".env.local")) {
  console.log(".env.local already exists; no changes made.");
} else {
  loadEnvConfig(process.cwd());
  const env = {
    MONGODB_URI: process.env.MONGODB_URI ?? process.env.ATLASDB_URL ?? "",
    NEXTAUTH_URL: "http://localhost:3000",
    NEXTAUTH_SECRET: randomBytes(32).toString("base64"),
    CLOUDINARY_CLOUD_NAME:
      process.env.CLOUDINARY_CLOUD_NAME ?? process.env.CLOUD_NAME ?? "",
    CLOUDINARY_API_KEY:
      process.env.CLOUDINARY_API_KEY ?? process.env.CLOUD_API_KEY ?? "",
    CLOUDINARY_API_SECRET:
      process.env.CLOUDINARY_API_SECRET ?? process.env.CLOUD_API_SECRET ?? "",
    MAPTILER_API_KEY:
      process.env.MAPTILER_API_KEY ?? process.env.MAP_TOKEN ?? "",
    NEXT_PUBLIC_MAPTILER_KEY:
      process.env.NEXT_PUBLIC_MAPTILER_KEY ?? process.env.MAP_TOKEN ?? "",
  };
  fs.writeFileSync(
    ".env.local",
    Object.entries(env)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join("\n") + "\n",
    { mode: 0o600, flag: "wx" },
  );
  console.log(
    "Created ignored .env.local using existing configuration and a new session secret. No database changes made.",
  );
  const missing = Object.entries(env)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length)
    console.log(`Configure these variables: ${missing.join(", ")}`);
}
