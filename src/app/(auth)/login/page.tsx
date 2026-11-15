import { LoginForm } from "@/components/maven/login-form";
import { RedirectCard } from "@/components/maven/redirect-card";
import { getSession } from "@/lib/auth";
import { getAuthFeatures } from "@/lib/auth/config";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; reset?: string }>;
};

export default async function LoginPage(props: LoginPageProps) {
  const [session, searchParams] = await Promise.all([
    getSession(),
    props.searchParams,
  ]);
  /** Verification links redirect here with `?error=...` when they fail. */
  const status = searchParams.error
    ? "verify-failed"
    : searchParams.reset === "1"
      ? "password-reset"
      : null;

  if (session) {
    return <RedirectCard redirectTo="/chat" />;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-7xl">
        <LoginForm features={getAuthFeatures()} status={status} />
      </div>
    </div>
  );
}
