import { Footer } from "@/components/maven/footer";
import { NavigationBar } from "@/components/maven/navigation-bar";
import { WorkflowContent } from "@/components/maven/workflow";

export default function Page() {
  return (
    <div>
      <NavigationBar />
      <WorkflowContent />
      <Footer />
    </div>
  );
}
