import "server-only";
import mongoose from "mongoose";
import { getServerEnv } from "@/lib/env";
const globalCache = globalThis as typeof globalThis & {
  aawaslyMongo?: Promise<typeof mongoose>;
};
export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!globalCache.aawaslyMongo) {
    globalCache.aawaslyMongo = mongoose
      .connect(getServerEnv().MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 5,
        minPoolSize: 0,
        serverSelectionTimeoutMS: 8000,
      })
      .catch((error) => {
        globalCache.aawaslyMongo = undefined;
        throw error;
      });
  }
  return globalCache.aawaslyMongo;
}
