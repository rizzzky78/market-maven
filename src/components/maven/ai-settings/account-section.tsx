"use client";

import { FC, FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";

export type AccountView = {
  /** `@username` for credential accounts, otherwise the OAuth email. */
  label: string;
  /** Masked phone number of credential accounts. */
  phoneHint: string | null;
  /** Whether the account signs in with a password (needs it to delete). */
  hasPassword: boolean;
};

/** Word an OAuth user types to confirm deletion, since there is no password. */
const CONFIRM_WORD = "DELETE";

/**
 * Account overview and permanent deletion. Deleting removes the user with
 * its sessions, chats, shares and AI settings (database cascades); public
 * ratings stay without an author link.
 */
export const AccountSection: FC<{ account: AccountView }> = ({ account }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = account.hasPassword
    ? password.length > 0
    : confirmText === CONFIRM_WORD;

  async function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setPending(true);

    const { error: deleteError } = await authClient.deleteUser(
      account.hasPassword ? { password } : {}
    );

    if (deleteError) {
      setPending(false);
      setError(
        deleteError.status === 429
          ? "Too many attempts. Try again later."
          : deleteError.code === "SESSION_EXPIRED"
            ? "For your security, sign out and sign in again, then retry within a day."
            : deleteError.message || "Could not delete the account."
      );
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <section className="flex w-full max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Account</h2>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="text-foreground">{account.label}</span>
          {account.phoneHint ? <> with WhatsApp {account.phoneHint}</> : null}.
        </p>
      </div>

      <div className="flex flex-col gap-4 border-t pt-6">
        <div className="flex flex-col gap-1">
          <h3 className="font-medium text-red-600 dark:text-red-400">Delete account</h3>
          <p className="text-sm text-muted-foreground">
            Permanently removes your account, chats, shared links, AI
            connections and usage history. This cannot be undone.
          </p>
        </div>

        <AlertDialog
          open={open}
          onOpenChange={(next) => {
            if (pending) return;
            setOpen(next);
            if (!next) {
              setPassword("");
              setConfirmText("");
              setError(null);
            }
          }}
        >
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-fit rounded-full">
              Delete account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <form onSubmit={handleDelete} className="flex flex-col gap-4">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  Everything tied to {account.label} is deleted immediately and
                  cannot be recovered.
                </AlertDialogDescription>
              </AlertDialogHeader>

              {account.hasPassword ? (
                <div className="grid gap-1.5">
                  <Label htmlFor="delete-account-password">Password</Label>
                  <Input
                    id="delete-account-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoFocus
                  />
                </div>
              ) : (
                <div className="grid gap-1.5">
                  <Label htmlFor="delete-account-confirm">
                    Type {CONFIRM_WORD} to confirm
                  </Label>
                  <Input
                    id="delete-account-confirm"
                    autoComplete="off"
                    value={confirmText}
                    onChange={(event) => setConfirmText(event.target.value)}
                    autoFocus
                  />
                </div>
              )}

              {error ? (
                <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              ) : null}

              <AlertDialogFooter>
                <AlertDialogCancel type="button" disabled={pending}>
                  Cancel
                </AlertDialogCancel>
                <Button type="submit" variant="destructive" disabled={pending || !canSubmit}>
                  {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                  Delete permanently
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
};
