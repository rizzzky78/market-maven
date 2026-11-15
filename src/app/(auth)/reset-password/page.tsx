import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/maven/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password | Maven AI",
  robots: { index: false },
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string; error?: string }>;
};

/**
 * Landing page of the emailed reset link. Better Auth redirects here with
 * `?token=...` for a valid link or `?error=INVALID_TOKEN` otherwise.
 */
export default async function ResetPasswordPage(props: ResetPasswordPageProps) {
  const { token, error } = await props.searchParams;
  const validToken = !error && typeof token === "string" && token ? token : null;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-7xl">
        <ResetPasswordForm token={validToken} />
      </div>
    </div>
  );
}
