import { Features } from "@/components/maven/features";
import { NavigationBar } from "@/components/maven/navigation-bar";

export default function Page() {
  return (
    <div>
      <NavigationBar />
      <div className="w-full flex justify-center">
        <Features />
      </div>
    </div>
  );
}
