"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { AuthFeatures, OAuthProviderId } from "@/lib/auth/config";
import { signIn } from "@/lib/auth/client";
import { isEmail, isPhoneNumber, normalizePhoneNumber } from "@/lib/auth/schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, FormEvent, useRef, useState } from "react";
import { AuthField, AuthFormError, authSubmitClassName } from "./auth/auth-field";
import { AuthShell } from "./auth/auth-shell";
import { OAuthButtons } from "./auth/oauth-buttons";
import { TermsConsent } from "./auth/terms-consent";
import { TurnstileHandle, TurnstileWidget } from "./auth/turnstile-widget";

type LoginFormProps = {
  features: AuthFeatures;
  /** Outcome passed back by the verification or reset redirect. */
  status?: "verify-failed" | "password-reset" | null;
};

/** Better Auth client error to a user-facing sentence. */
function describeAuthError(error: {
  status?: number;
  code?: string;
  message?: string;
}): string {
  if (error.status === 429) return "Too many attempts. Wait a minute and try again.";
  if (error.code === "EMAIL_NOT_VERIFIED") {
    return "Verify your email first. We just sent you a new verification link.";
  }
  return error.message || "Sign in failed. Try again.";
}

/**
 * Login with username or phone number plus password, and with any OAuth
 * provider configured on the server. Terms consent is required for both.
 */
export const LoginForm: FC<LoginFormProps> = ({ features, status = null }) => {
  const router = useRouter();
  const turnstileRef = useRef<TurnstileHandle>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    status === "verify-failed"
      ? "That verification link is invalid or expired. Sign in to get a new one."
      : null
  );

  const captchaRequired = Boolean(features.captchaSiteKey);

  async function handleCredentialSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!accepted) {
      setError("Please accept the terms and conditions to continue.");
      return;
    }
    if (captchaRequired && !captchaToken) {
      setError("Please complete the captcha check.");
      return;
    }

    setPending(true);
    const fetchOptions = captchaToken
      ? { headers: { "x-captcha-response": captchaToken } }
      : undefined;
    const value = identifier.trim();

    const { error: signInError } = isEmail(value)
      ? await signIn.email({
          email: value.toLowerCase(),
          password,
          rememberMe: true,
          callbackURL: "/login",
          fetchOptions,
        })
      : isPhoneNumber(value)
      ? await signIn.phoneNumber({
          phoneNumber: normalizePhoneNumber(value),
          password,
          rememberMe: true,
          fetchOptions,
        })
      : await signIn.username({
          username: value,
          password,
          rememberMe: true,
          fetchOptions,
        });

    if (signInError) {
      setError(describeAuthError(signInError));
      turnstileRef.current?.reset();
      setPending(false);
      return;
    }

    router.replace("/chat");
    router.refresh();
  }

  async function handleOAuth(provider: OAuthProviderId) {
    setError(null);
    if (!accepted) {
      setError("Please accept the terms and conditions to continue.");
      return;
    }
    setPending(true);
    const { error: oauthError } = await signIn.social({
      provider,
      callbackURL: "/chat",
    });
    if (oauthError) {
      setError(describeAuthError(oauthError));
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Login to"
      description="Sign in with your username, email or phone number and password."
    >
      {status === "password-reset" ? (
        <p
          role="status"
          className="font-(family-name:--font-khand) rounded-3xl bg-purple-500/10 px-5 py-3 text-base text-purple-700 dark:text-purple-300"
        >
          Password updated. Sign in with your new password.
        </p>
      ) : null}
      <form className="grid gap-4" onSubmit={handleCredentialSubmit} noValidate>
        <AuthField
          label="Username, email or phone number"
          name="identifier"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="maven_user or you@example.com"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          required
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          labelAction={
            features.email || features.whatsappOtp ? (
              <Link
                href="/forgot-password"
                className="font-(family-name:--font-khand) text-sm text-blue-500 underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            ) : null
          }
        />
        {features.captchaSiteKey ? (
          <TurnstileWidget
            ref={turnstileRef}
            siteKey={features.captchaSiteKey}
            onToken={setCaptchaToken}
          />
        ) : null}
        <AuthFormError message={error} />
        <Button
          type="submit"
          className={authSubmitClassName}
          disabled={pending || !identifier.trim() || !password}
        >
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      {features.oauthProviders.length > 0 ? (
        <>
          <div className="flex items-center gap-3 font-(family-name:--font-khand) text-sm text-muted-foreground">
            <Separator className="flex-1 bg-black/15 dark:bg-white/15" />
            or continue with
            <Separator className="flex-1 bg-black/15 dark:bg-white/15" />
          </div>
          <OAuthButtons
            providers={features.oauthProviders}
            disabled={pending}
            onSelect={handleOAuth}
          />
        </>
      ) : null}

      <TermsConsent checked={accepted} onCheckedChange={setAccepted} />

      {features.email ? (
        <p className="font-(family-name:--font-khand) text-center text-base text-muted-foreground lg:text-left">
          New to Maven?{" "}
          <Link href="/register" className="text-blue-500 underline underline-offset-4">
            Create an account
          </Link>
        </p>
      ) : null}
    </AuthShell>
  );
};
