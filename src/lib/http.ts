import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(getServerEnv().NEXTAUTH_URL).origin;
  if (!origin || origin !== expected)
    throw new HttpError(403, "Request origin is not allowed");
}
export async function readJSON(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new HttpError(415, "Expected JSON");
  // Stream cap prevents chunked bodies from bypassing Content-Length checks.
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Request body is required");
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 64 * 1024) {
        await reader.cancel();
        throw new HttpError(413, "Request body is too large");
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "Invalid JSON body");
  }
}
export function publicError(error: unknown) {
  if (error instanceof HttpError)
    return { body: { error: error.message }, status: error.status };
  if (error instanceof z.ZodError)
    return {
      body: {
        error: error.issues[0]?.message ?? "Invalid input",
        issues: error.issues.map((i) => ({ path: i.path, message: i.message })),
      },
      status: 400,
    };
  if (
    typeof error === "object" &&
    error &&
    "code" in error &&
    error.code === 11000
  )
    return { body: { error: "This username is already taken" }, status: 409 };
  // Never return provider responses, connection strings, or stack traces.
  console.error("Aawasly request failed", {
    name: error instanceof Error ? error.name : "UnknownError",
  });
  return {
    body: { error: "Something went wrong. Please try again." },
    status: 500,
  };
}
export function apiError(error: unknown) {
  const failure = publicError(error);
  return NextResponse.json(failure.body, { status: failure.status });
}
