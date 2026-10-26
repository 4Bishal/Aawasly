import { createRequire } from "node:module";
import mongoose from "mongoose";
const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd());
// Explicit maintenance command; never runs automatically during builds or startup.
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
try {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) throw new Error("Database unavailable");
  await db.collection("users").createIndex({ username: 1 }, { unique: true });
  await db.collection("listings").createIndex({ category: 1, price: 1 });
  await db.collection("listings").createIndex({ owner: 1 });
  await db.collection("listings").createIndex({ geometry: "2dsphere" });
  await db
    .collection("rate_limits")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  console.log(
    "Required indexes are present. Existing documents were not modified.",
  );
} finally {
  await mongoose.disconnect();
}
