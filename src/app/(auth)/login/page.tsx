import { LoginForm } from "@/components/maven/login-form";
import { RedirectCard } from "@/components/maven/redirect-card";
import { getServerSession } from "next-auth";

export default async function LoginPage() {
  const session = await getServerSession();

  if (session) {
    return <RedirectCard redirectTo="/chat" />;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-7xl">
        <LoginForm />
      </div>
    </div>
  );
}
