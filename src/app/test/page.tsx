import { Markdown } from "@/components/maven/markdown";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";
import { list } from "@vercel/blob";

export default async function Page() {
  const markdown = await SYSTEM_INSTRUCTION.INQUIRY_CRAFTER;
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="max-w-3xl">
        <Markdown>{markdown}</Markdown>
      </div>
    </div>
  );
}
