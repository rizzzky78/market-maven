import { ContentRegister } from "@/components/maven/content-register";
import { Footer } from "@/components/maven/footer";
import { NavigationBar } from "@/components/maven/navigation-bar";
import { RedirectCard } from "@/components/maven/redirect-card";
import { getServerSession } from "next-auth";

export default async function RegisterPage() {
  const session = await getServerSession();

  if (session) {
    return <RedirectCard redirectTo="/chat" />;
  }

  return (
    <div>
      <NavigationBar />
      <ContentRegister />
      <Footer />
    </div>
  );
}
