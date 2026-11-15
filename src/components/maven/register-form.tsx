"use client";

import { Button } from "@/components/ui/button";
import { completeSignup, requestSignupOtp, type SignupActionResult } from "@/lib/auth/actions";
import type { AuthFeatures } from "@/lib/auth/config";
import {
  OTP_LENGTH,
  passwordSchema,
  phoneNumberSchema,
  usernameSchema,
} from "@/lib/auth/schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Record<"username" | "phoneNumber" | "password" | "confirmPassword" | "code", string>
>;

/** Seconds before another code can be requested from the verify step. */
const RESEND_COOLDOWN_SECONDS = 60;

/** First zod issue message, or `undefined` when the value is valid. */
function firstIssue(schema: ZodType, value: string): string | undefined {
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

/**
 * Two-step signup: account details, then the WhatsApp code sent to the
 * phone number. The account is only created once the code checks out.
 */
export const RegisterForm: FC<RegisterFormProps> = ({ features }) => {
  const router = useRouter();
  const turnstileRef = useRef<TurnstileHandle>(null);
  const [step, setStep] = useState<"details" | "verify">("details");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [cooldown, setCooldown] = useState(0);

  const captchaRequired = Boolean(features.captchaSiteKey);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  /** Shows an action failure on its field when known, else as a banner. */
  function applyResult(result: Extract<SignupActionResult, { ok: false }>) {
    if (result.field && result.field !== "captcha") {
      setFieldErrors({ [result.field]: result.error });
      setError(null);
    } else {
      setError(result.error);
    }
  }

  async function sendCode(): Promise<boolean> {
    if (captchaRequired && !captchaToken) {
      setError("Please complete the captcha check.");
      return false;
    }

    setPending(true);
    const result = await requestSignupOtp({
      username,
      phoneNumber,
      password,
      captchaToken: captchaToken ?? undefined,
    });
    turnstileRef.current?.reset();
    setPending(false);

    if (!result.ok) {
      applyResult(result);
      return false;
    }
    setCooldown(RESEND_COOLDOWN_SECONDS);
    return true;
  }

  async function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const errors: FieldErrors = {
      username: firstIssue(usernameSchema, username),
      phoneNumber: firstIssue(phoneNumberSchema, phoneNumber),
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

    if (await sendCode()) {
      setCode("");
      setStep("verify");
    }
  }

  async function handleVerifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    setPending(true);
    const result = await completeSignup({ username, phoneNumber, password, code });

    if (!result.ok) {
      setPending(false);
      if (result.field && result.field !== "code" && result.field !== "captcha") {
        // A detail became invalid (e.g. username taken meanwhile): go back.
        setStep("details");
      }
      applyResult(result);
      return;
    }

    router.replace("/chat");
    router.refresh();
  }

  if (!features.whatsappOtp) {
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
          <>
            Create an account; we verify your phone number with a code on
            WhatsApp. Maven AI is a demo app with daily usage limits.
          </>
        ) : (
          <>
            Enter the {OTP_LENGTH}-digit code sent to{" "}
            <span className="text-black dark:text-white">{phoneNumber}</span> on WhatsApp.
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
            label="WhatsApp number"
            name="phoneNumber"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+6281234567890"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            error={fieldErrors.phoneNumber}
            hint="International format with country code."
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
            {pending ? "Sending code..." : "Send WhatsApp code"}
          </Button>
        </form>
      ) : (
        <form className="grid gap-4" onSubmit={handleVerifySubmit} noValidate>
          <AuthField
            label="Verification code"
            name="code"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={OTP_LENGTH}
            placeholder={"0".repeat(OTP_LENGTH)}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            error={fieldErrors.code}
            className="tracking-[0.5em]"
            autoFocus
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
          <Button
            type="submit"
            className={authSubmitClassName}
            disabled={pending || code.length !== OTP_LENGTH}
          >
            {pending ? "Creating account..." : "Verify and create account"}
          </Button>
          <div className="flex items-center justify-between gap-2 font-(family-name:--font-khand) text-base">
            <button
              type="button"
              className="text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => {
                setStep("details");
                setError(null);
                setFieldErrors({});
              }}
              disabled={pending}
            >
              Change details
            </button>
            <button
              type="button"
              className="text-blue-500 underline-offset-4 hover:underline disabled:text-muted-foreground disabled:no-underline"
              onClick={() => {
                setError(null);
                void sendCode();
              }}
              disabled={pending || cooldown > 0}
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </form>
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
