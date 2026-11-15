"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import type { AuthFeatures } from "@/lib/auth/config";
import { emailSchema, passwordSchema, usernameSchema } from "@/lib/auth/schema";
import Link from "next/link";
import { FC, FormEvent, useEffect, useRef, useState } from "react";
import type { ZodType } from "zod";
import { AuthField, AuthFormError, authSubmitClassName } from "./auth/auth-field";
import { AuthShell } from "./auth/auth-shell";
import { TermsConsent } from "./auth/terms-consent";
import { TurnstileHandle, TurnstileWidget } from "./auth/turnstile-widget";

type RegisterFormProps = {
  features: AuthFeatures;
};

type FieldErrors = Partial<
  Record<"username" | "email" | "password" | "confirmPassword", string>
>;

/** Where the verification link lands; login shows the outcome. */
const VERIFY_CALLBACK_URL = "/login";

/** Seconds before another verification email can be requested. */
const RESEND_COOLDOWN_SECONDS = 60;

/** First zod issue message, or `undefined` when the value is valid. */
function firstIssue(schema: ZodType, value: string): string | undefined {
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

/** Better Auth client error to a user-facing sentence. */
function describeAuthError(error: { status?: number; message?: string }): string {
  if (error.status === 429) return error.message || "Too many attempts. Try again later.";
  return error.message || "Something went wrong. Try again.";
}

/**
 * Signup with username, email and password. The account stays locked until
 * the emailed verification link is opened, which also signs the user in.
 */
export const RegisterForm: FC<RegisterFormProps> = ({ features }) => {
  const turnstileRef = useRef<TurnstileHandle>(null);
  const [step, setStep] = useState<"details" | "sent">("details");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [cooldown, setCooldown] = useState(0);

  const captchaRequired = Boolean(features.captchaSiteKey);
  const fetchOptions = captchaToken
    ? { headers: { "x-captcha-response": captchaToken } }
    : undefined;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const errors: FieldErrors = {
      username: firstIssue(usernameSchema, username),
      email: firstIssue(emailSchema, email),
      password: firstIssue(passwordSchema, password),
      confirmPassword:
        password !== confirmPassword ? "Passwords do not match" : undefined,
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    if (!accepted) {
      setError("Please accept the terms and conditions to continue.");
      return;
    }
    if (captchaRequired && !captchaToken) {
      setError("Please complete the captcha check.");
      return;
    }

    setPending(true);
    const normalizedEmail = email.trim().toLowerCase();
    const { error: signUpError } = await authClient.signUp.email({
      name: username.trim(),
      username: username.trim(),
      displayUsername: username.trim(),
      email: normalizedEmail,
      password,
      callbackURL: VERIFY_CALLBACK_URL,
      fetchOptions,
    });
    turnstileRef.current?.reset();
    setPending(false);

    if (signUpError) {
      if (signUpError.code === "USERNAME_IS_ALREADY_TAKEN") {
        setFieldErrors({ username: "This username is taken" });
      } else {
        setError(describeAuthError(signUpError));
      }
      return;
    }

    setEmail(normalizedEmail);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setStep("sent");
  }

  async function handleResend() {
    setError(null);
    setNotice(null);
    if (captchaRequired && !captchaToken) {
      setError("Please complete the captcha check.");
      return;
    }

    setPending(true);
    const { error: resendError } = await authClient.sendVerificationEmail({
      email,
      callbackURL: VERIFY_CALLBACK_URL,
      fetchOptions,
    });
    turnstileRef.current?.reset();
    setPending(false);

    if (resendError) {
      setError(describeAuthError(resendError));
      return;
    }
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setNotice("A new verification link is on its way.");
  }

  if (!features.email) {
    return (
      <AuthShell title="Register to" description="Sign up is not available right now.">
        <p className="font-(family-name:--font-khand) text-lg text-muted-foreground">
          Account registration is temporarily closed. Please try again later or{" "}
          <Link href="/login" className="text-blue-500 underline underline-offset-4">
            go to login
          </Link>
          .
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Register to"
      description={
        step === "details" ? (
          "Create an account; we send a link to verify your email. Maven AI is a demo app with daily usage limits."
        ) : (
          <>
            If <span className="text-black dark:text-white">{email}</span> can be
            registered, a verification link is in its inbox. Open it within an
            hour to activate your account.
          </>
        )
      }
    >
      {step === "details" ? (
        <form className="grid gap-4" onSubmit={handleDetailsSubmit} noValidate>
          <AuthField
            label="Username"
            name="username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="maven_user"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            error={fieldErrors.username}
            required
          />
          <AuthField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldErrors.email}
            required
          />
          <AuthField
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
            hint="At least 8 characters."
            required
          />
          <AuthField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            error={fieldErrors.confirmPassword}
            required
          />
          {features.captchaSiteKey ? (
            <TurnstileWidget
              ref={turnstileRef}
              siteKey={features.captchaSiteKey}
              onToken={setCaptchaToken}
            />
          ) : null}
          <TermsConsent checked={accepted} onCheckedChange={setAccepted} />
          <AuthFormError message={error} />
          <Button type="submit" className={authSubmitClassName} disabled={pending}>
            {pending ? "Creating account..." : "Create account"}
          </Button>
        </form>
      ) : (
        <div className="grid gap-4">
          {features.captchaSiteKey ? (
            <TurnstileWidget
              ref={turnstileRef}
              siteKey={features.captchaSiteKey}
              onToken={setCaptchaToken}
            />
          ) : null}
          <AuthFormError message={error} />
          {notice ? (
            <p role="status" className="font-(family-name:--font-khand) pl-5 text-base text-muted-foreground">
              {notice}
            </p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="w-full text-lg rounded-3xl py-6 font-(family-name:--font-khand)"
            onClick={() => void handleResend()}
            disabled={pending || cooldown > 0}
          >
            {cooldown > 0 ? `Resend link in ${cooldown}s` : "Resend verification link"}
          </Button>
          <p className="font-(family-name:--font-khand) pl-5 text-sm text-muted-foreground">
            Typo in the email? Unverified signups expire after an hour, then
            the username and email can be registered again.
          </p>
        </div>
      )}

      <p className="font-(family-name:--font-khand) text-center text-base text-muted-foreground lg:text-left">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-500 underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
};
