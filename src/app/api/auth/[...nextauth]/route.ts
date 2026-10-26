import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth";
import { apiError } from "@/lib/http";
import { clientIP, rateLimit } from "@/lib/auth/rate-limit";
import type { NextRequest } from "next/server";
export const runtime = "nodejs";
type Context = { params: Promise<{ nextauth: string[] }> };
async function handler(request: NextRequest, context: Context) {
  try {
    const params = await context.params;
    if (request.method === "POST" && params.nextauth.includes("callback"))
      await rateLimit(`login:ip:${clientIP(request.headers)}`, 40);
    // NextAuth v4 expects resolved route params; adapt the Next.js async params contract.
    return NextAuth(getAuthOptions())(request, { params });
  } catch (error) {
    return apiError(error);
  }
}
export { handler as GET, handler as POST };
