import { Markdown } from "@/components/maven/markdown";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";

export default async function ChatPage() {
  const markdownContent = SYSTEM_INSTRUCTION.CORE_ORCHESTRATOR;
  return (
    <div>
      <Markdown>{markdownContent}</Markdown>
    </div>
  );
}
