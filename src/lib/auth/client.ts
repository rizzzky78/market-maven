import { createAuthClient } from "better-auth/react";

/** Better Auth browser client; talks to /api/auth on the current origin. */
export const authClient = createAuthClient();

export const { signIn, signOut, useSession } = authClient;
