import { Features } from "@/components/maven/features";
import { Footer } from "@/components/maven/footer";
import { NavigationBar } from "@/components/maven/navigation-bar";

export default function Page() {
  return (
    <div>
      <NavigationBar />
      <Features />
      <Footer />
    </div>
  );
}
