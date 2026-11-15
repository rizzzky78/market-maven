import { createAuthClient } from "better-auth/react";
import { phoneNumberClient, usernameClient } from "better-auth/client/plugins";

/** Better Auth browser client; talks to /api/auth on the current origin. */
export const authClient = createAuthClient({
  plugins: [usernameClient(), phoneNumberClient()],
});

export const { signIn, signOut, useSession } = authClient;
