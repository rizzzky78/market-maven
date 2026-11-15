/**
 * Secondary account line for the UI: `@username` for credential accounts,
 * whose stored email is an internal placeholder, otherwise the OAuth email.
 */
export function getAccountLabel(
  user: { email?: string | null; username?: string | null } | null | undefined
): string | undefined {
  if (!user) return undefined;
  if (user.username) return `@${user.username}`;
  return user.email ?? undefined;
}
