import { RedirectCard } from "@/components/maven/redirect-card";
import { getServerSession } from "next-auth";

export default async function RegisterPage() {
  const session = await getServerSession();

  if (session) {
    return <RedirectCard redirectTo="/chat" redirectDelay={500000} />;
  }

  return (
    <div>
      <div>{/* The Register Page */}</div>
    </div>
  );
}
