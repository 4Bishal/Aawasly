// Disposable local QA only. This process never reads or connects to Atlas.
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createRequire } from "node:module";
import { pbkdf2Sync, randomBytes, scryptSync } from "node:crypto";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
const require = createRequire(import.meta.url);
const replica = await MongoMemoryReplSet.create({
  binary: { downloadDir: resolve(".cache/mongodb-binaries") },
  replSet: { count: 1 },
});
const uri = replica.getUri("aawasly_preview");
await mongoose.connect(uri);
const db = mongoose.connection.db;
const salt = "disposable-legacy-fixture";
const owner = new mongoose.Types.ObjectId();
const guest = new mongoose.Types.ObjectId();
const passwordSalt = randomBytes(32).toString("hex");
await db.collection("users").insertMany([
  {
    _id: owner,
    username: "preview_host",
    email: "host@example.test",
    salt,
    hash: pbkdf2Sync(
      "preview-only-password",
      salt,
      25000,
      512,
      "sha256",
    ).toString("hex"),
  },
  {
    _id: guest,
    username: "preview_guest",
    email: "guest@example.test",
    passwordHash: `scrypt$${passwordSalt}$${scryptSync("preview-only-password", passwordSalt, 64).toString("hex")}`,
  },
]);
await db.collection("users").createIndex({ username: 1 }, { unique: true });
const samples = require("../init/data.js").data;
const categories = [
  "Rooms",
  "Iconic Cities",
  "Mountains",
  "Castles",
  "Camping",
  "Farms",
];
await db.collection("listings").insertMany(
  samples.slice(0, 6).map((listing, i) => ({
    ...listing,
    owner,
    category: categories[i],
    geometry: { type: "Point", coordinates: [83.9856, 28.2096] },
    amenities: ["Wi-Fi", "Kitchen"],
    reviews: [],
  })),
);
await mongoose.disconnect();
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3100",
  ],
  {
    stdio: "inherit",
    windowsHide: true,
    env: {
      ...process.env,
      MONGODB_URI: uri,
      NEXTAUTH_URL: "http://localhost:3100",
      NEXTAUTH_SECRET: randomBytes(32).toString("hex"),
      AAWASLY_QA_FIXTURE: "true",
    },
  },
);
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  child.kill();
  await replica.stop();
}
process.on("SIGINT", () => void stop());
process.on("SIGTERM", () => void stop());
child.on("exit", async (code) => {
  await stop();
  process.exitCode = code ?? 0;
});
