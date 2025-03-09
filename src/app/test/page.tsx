import { AgenticShowcase } from "@/components/maven/agentic-showcase";
import { ImagePreviewer } from "@/components/maven/image-previewer";
import { SnapshotCard } from "@/components/maven/snapshots-card";

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <AgenticShowcase />
    </main>
  );
}
