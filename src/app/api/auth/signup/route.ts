import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validation";
import { assertSameOrigin, readJSON, apiError } from "@/lib/http";
import { clientIP, rateLimit } from "@/lib/auth/rate-limit";
import { hashPassword } from "@/lib/auth/password";
import { User } from "@/models/User";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await rateLimit(`signup:${clientIP(request.headers)}`, 10);
    const input = signupSchema.parse(await readJSON(request));
    const user = await User.create({
      username: input.username,
      email: input.email,
      passwordHash: await hashPassword(input.password),
    });
    return NextResponse.json({ id: user._id.toString() }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
