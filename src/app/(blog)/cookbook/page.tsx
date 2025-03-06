import { Cookbook } from "@/components/maven/cookbook";
import { Footer } from "@/components/maven/footer";
import { NavigationBar } from "@/components/maven/navigation-bar";

export default function Page() {
  return (
    <div>
      <NavigationBar />
      <div>
        <Cookbook />
      </div>
      <Footer />
    </div>
  );
}
