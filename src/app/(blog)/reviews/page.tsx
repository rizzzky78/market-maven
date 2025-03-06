import { Footer } from "@/components/maven/footer";
import { NavigationBar } from "@/components/maven/navigation-bar";
import { PublicReviews } from "@/components/maven/public-reviews";

export default function Page() {
  return (
    <div>
      <NavigationBar />
      <div className="min-h-screen flex items-center justify-center">
        <PublicReviews />
      </div>
      <Footer />
    </div>
  );
}
