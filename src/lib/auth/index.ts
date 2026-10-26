import "server-only";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import { getServerEnv } from "@/lib/env";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { rateLimit } from "@/lib/auth/rate-limit";
import { HttpError } from "@/lib/http";

export function getAuthOptions(): NextAuthOptions {
  const env = getServerEnv();
  return {
    secret: env.NEXTAUTH_SECRET,
    session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
    useSecureCookies: new URL(env.NEXTAUTH_URL).protocol === "https:",
    pages: { signIn: "/login" },
    providers: [
      CredentialsProvider({
        name: "Aawasly",
        credentials: {
          username: { label: "Username", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) return null;
          const { username, password } = parsed.data;
          await rateLimit(`login:username:${username.toLowerCase()}`, 10);
          const user = await User.findOne({ username }).select(
            "+passwordHash +hash +salt",
          );
          if (!user) {
            // Comparable work for unknown usernames.
            await hashPassword(password);
            return null;
          }
          if (!(await verifyPassword(password, user))) return null;
          if (!user.passwordHash) {
            await User.updateOne(
              { _id: user._id, passwordHash: { $exists: false } },
              {
                $set: { passwordHash: await hashPassword(password) },
                $unset: { hash: "", salt: "" },
              },
            );
          }
          return {
            id: user._id.toString(),
            name: user.username,
            email: user.email,
          };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) token.sub = user.id;
        return token;
      },
      async session({ session, token }) {
        if (session.user && token.sub) session.user.id = token.sub;
        return session;
      },
      async redirect({ url, baseUrl }) {
        try {
          const target = new URL(url, baseUrl);
          if (target.origin === new URL(baseUrl).origin)
            return target.toString();
        } catch {
          /* use home */
        }
        return `${baseUrl}/listing`;
      },
    },
  };
}
export async function getSession() {
  return getServerSession(getAuthOptions());
}
export async function requireUser() {
  const session = await getSession();
  if (!session?.user?.id) throw new HttpError(401, "Please log in to continue");
  await connectDB();
  const user = await User.findById(session.user.id).select("username email");
  if (!user) throw new HttpError(401, "Your account is no longer available");
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
  };
}
