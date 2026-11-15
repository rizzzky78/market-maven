import { LoginForm } from "@/components/maven/login-form";
import { RedirectCard } from "@/components/maven/redirect-card";
import { getSession } from "@/lib/auth";
import { getAuthFeatures } from "@/lib/auth/config";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    return <RedirectCard redirectTo="/chat" />;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-7xl">
        <LoginForm features={getAuthFeatures()} />
      </div>
    </div>
  );
}
