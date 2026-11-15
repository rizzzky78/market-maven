"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { passwordSchema } from "@/lib/auth/schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, FormEvent, useState } from "react";
import { AuthField, AuthFormError, authSubmitClassName } from "./auth/auth-field";
import { AuthShell } from "./auth/auth-shell";

type ResetPasswordFormProps = {
  /** Single-use token from the emailed link, or `null` when it was rejected. */
  token: string | null;
};

/**
 * Sets a new password from an emailed reset link. Success signs the account
 * out everywhere and returns to login.
 */
export const ResetPasswordForm: FC<ResetPasswordFormProps> = ({ token }) => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setError(null);

    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid password");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setPending(true);
    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (resetError) {
      setPending(false);
      setError(
        resetError.status === 429
          ? "Too many attempts. Try again later."
          : resetError.code === "INVALID_TOKEN"
            ? "This reset link is invalid or expired. Request a new one."
            : resetError.message || "Could not reset the password."
      );
      return;
    }

    router.replace("/login?reset=1");
  }

  if (!token) {
    return (
      <AuthShell title="Reset password for" description="This reset link is invalid or expired.">
        <p className="font-(family-name:--font-khand) text-lg text-muted-foreground">
          Reset links work once and expire after an hour.{" "}
          <Link href="/forgot-password" className="text-blue-500 underline underline-offset-4">
            Request a new link
          </Link>
          .
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset password for" description="Choose a new password for your account.">
      <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
        <AuthField
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          hint="At least 8 characters. You will be signed out everywhere."
          autoFocus
          required
        />
        <AuthField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
        <AuthFormError message={error} />
        <Button type="submit" className={authSubmitClassName} disabled={pending}>
          {pending ? "Saving..." : "Set new password"}
        </Button>
      </form>
    </AuthShell>
  );
};
