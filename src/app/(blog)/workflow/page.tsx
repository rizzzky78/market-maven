import { Mermaid } from "@/components/maven/workflow";

export default function Page() {
  const mermaidSyntax = `graph LR
    A[Tool Execution Result] --> B{mutateTool};
    B --> C{Validate Args/Results (Optional)};
    C --> D{Transform Result (Optional)};
    D --> E[Update MutableAIState];
    B --> F{Override Assistant (Optional)};
    F --> E;`;

  return (
    <div>
      <Mermaid chart={mermaidSyntax} />
    </div>
  );
}
