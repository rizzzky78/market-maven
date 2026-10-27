import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { prisma } from "@/database/prisma";
import { getEnv } from "@/lib/utility/get-env";

/**
 * Better Auth server instance: Google and GitHub OAuth, with users, sessions
 * and linked accounts stored in PostgreSQL through Prisma.
 */
export const auth = betterAuth({
  // ponytail: NEXTAUTH_* fallbacks keep pre-Better Auth deployments working; drop them once envs are renamed.
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  socialProviders: {
    google: {
      clientId: getEnv("AUTH_GOOGLE_ID"),
      clientSecret: getEnv("AUTH_GOOGLE_SECRET"),
    },
    github: {
      clientId: getEnv("AUTH_GITHUB_ID"),
      clientSecret: getEnv("AUTH_GITHUB_SECRET"),
    },
  },
  session: {
    // Signed session data in a short-lived cookie spares a database lookup
    // for every proxy and page session check.
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  // Must stay last: lets server actions set auth cookies.
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;

/**
 * Current session (`{ user, session }`) for server components, route
 * handlers and server actions, or `null` when signed out.
 */
export async function getSession(): Promise<AuthSession | null> {
  return auth.api.getSession({ headers: await headers() });
}
