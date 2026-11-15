"use client";

import { Button } from "@/components/ui/button";
import type { AuthFeatures } from "@/lib/auth/config";
import { authClient } from "@/lib/auth/client";
import { OTP_LENGTH, otpSchema, passwordSchema, phoneNumberSchema } from "@/lib/auth/schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, FormEvent, useEffect, useRef, useState } from "react";
import { AuthField, AuthFormError, authSubmitClassName } from "./auth/auth-field";
import { AuthShell } from "./auth/auth-shell";
import { TurnstileHandle, TurnstileWidget } from "./auth/turnstile-widget";

type ForgotPasswordFormProps = {
  features: AuthFeatures;
};

/** Seconds before another reset code can be requested. */
const RESEND_COOLDOWN_SECONDS = 60;

/** Better Auth client error to a user-facing sentence. */
function describeAuthError(error: { status?: number; message?: string }): string {
  if (error.status === 429) return error.message || "Too many attempts. Try again later.";
  return error.message || "Something went wrong. Try again.";
}

/**
 * Password reset over WhatsApp: request a code for the phone number, then
 * set a new password with it. All sessions are signed out on success.
 */
export const ForgotPasswordForm: FC<ForgotPasswordFormProps> = ({ features }) => {
  const router = useRouter();
  const turnstileRef = useRef<TurnstileHandle>(null);
  const [step, setStep] = useState<"request" | "reset">("request");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const captchaRequired = Boolean(features.captchaSiteKey);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function requestCode(): Promise<boolean> {
    const parsedPhone = phoneNumberSchema.safeParse(phoneNumber);
    if (!parsedPhone.success) {
      setError(parsedPhone.error.issues[0]?.message ?? "Invalid phone number");
      return false;
    }
    if (captchaRequired && !captchaToken) {
      setError("Please complete the captcha check.");
      return false;
    }

    setPending(true);
    const { error: requestError } = await authClient.phoneNumber.requestPasswordReset({
      phoneNumber: parsedPhone.data,
      fetchOptions: captchaToken
        ? { headers: { "x-captcha-response": captchaToken } }
        : undefined,
    });
    turnstileRef.current?.reset();
    setPending(false);

    if (requestError) {
      setError(describeAuthError(requestError));
      return false;
    }
    setPhoneNumber(parsedPhone.data);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    return true;
  }

  async function handleRequestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (await requestCode()) {
      setCode("");
      setStep("reset");
    }
  }

  async function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const codeIssue = otpSchema.safeParse(code);
    if (!codeIssue.success) {
      setError(codeIssue.error.issues[0]?.message ?? "Invalid code");
      return;
    }
    const passwordIssue = passwordSchema.safeParse(password);
    if (!passwordIssue.success) {
      setError(passwordIssue.error.issues[0]?.message ?? "Invalid password");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setPending(true);
    const { error: resetError } = await authClient.phoneNumber.resetPassword({
      phoneNumber,
      otp: code,
      newPassword: password,
    });

    if (resetError) {
      setPending(false);
      setError(describeAuthError(resetError));
      return;
    }

    router.replace("/login");
  }

  if (!features.whatsappOtp) {
    return (
      <AuthShell title="Reset password for" description="Password reset is not available right now.">
        <p className="font-(family-name:--font-khand) text-lg text-muted-foreground">
          Please try again later or{" "}
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
      title="Reset password for"
      description={
        step === "request" ? (
          "Enter the WhatsApp number of your account and we will send you a code."
        ) : (
          <>
            If <span className="text-black dark:text-white">{phoneNumber}</span> belongs
            to an account, a {OTP_LENGTH}-digit code is on its way via WhatsApp.
          </>
        )
      }
    >
      {step === "request" ? (
        <form className="grid gap-4" onSubmit={handleRequestSubmit} noValidate>
          <AuthField
            label="WhatsApp number"
            name="phoneNumber"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+6281234567890"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            hint="International format with country code."
            required
          />
          {features.captchaSiteKey ? (
            <TurnstileWidget
              ref={turnstileRef}
              siteKey={features.captchaSiteKey}
              onToken={setCaptchaToken}
            />
          ) : null}
          <AuthFormError message={error} />
          <Button type="submit" className={authSubmitClassName} disabled={pending || !phoneNumber.trim()}>
            {pending ? "Sending code..." : "Send reset code"}
          </Button>
        </form>
      ) : (
        <form className="grid gap-4" onSubmit={handleResetSubmit} noValidate>
          <AuthField
            label="Reset code"
            name="code"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={OTP_LENGTH}
            placeholder={"0".repeat(OTP_LENGTH)}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            className="tracking-[0.5em]"
            autoFocus
            required
          />
          <AuthField
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            hint="At least 8 characters. You will be signed out everywhere."
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
          {features.captchaSiteKey ? (
            <TurnstileWidget
              ref={turnstileRef}
              siteKey={features.captchaSiteKey}
              onToken={setCaptchaToken}
            />
          ) : null}
          <AuthFormError message={error} />
          <Button type="submit" className={authSubmitClassName} disabled={pending}>
            {pending ? "Saving..." : "Set new password"}
          </Button>
          <div className="flex items-center justify-between gap-2 font-(family-name:--font-khand) text-base">
            <button
              type="button"
              className="text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => {
                setStep("request");
                setError(null);
              }}
              disabled={pending}
            >
              Change number
            </button>
            <button
              type="button"
              className="text-blue-500 underline-offset-4 hover:underline disabled:text-muted-foreground disabled:no-underline"
              onClick={() => {
                setError(null);
                void requestCode();
              }}
              disabled={pending || cooldown > 0}
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </form>
      )}

      <p className="font-(family-name:--font-khand) text-center text-base text-muted-foreground lg:text-left">
        Remembered it?{" "}
        <Link href="/login" className="text-blue-500 underline underline-offset-4">
          Back to login
        </Link>
      </p>
    </AuthShell>
  );
};
