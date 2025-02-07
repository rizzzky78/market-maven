"use client";

import { Button } from "@/components/ui/button";
import { testingValueStreamResponse } from "@/lib/agents/action/server-action/testing";
import { readStreamableValue } from "ai/rsc";
import { ReactNode, useState } from "react";

export default function Page() {
  const [raw, setRaw] = useState<string>("");

  async function trigger() {
    const simulatedPayload = {
      query: "LENOVO LOQ 15 GeForce RTX 3050 - I5 12450HX 12GB 512SSD OHS",
      link: "https://www.tokopedia.com/nvidiageforcelt/lenovo-loq-15-geforce-rtx-3050-i5-12450hx-12gb-512ssd-ohs-ram-12gb-tanpa-antigores-d46d5?extParam=ivf%3Dtrue%26keyword%3Dlenovo+loq%26search_id%3D20250131114341841F9DA1BCE6F603B87T%26src%3Dsearch",
    };

    const { value } = await testingValueStreamResponse(simulatedPayload);

    for await (const chunk of readStreamableValue(value)) {
      setRaw(JSON.stringify(chunk, null, 2));
    }
  }

  return (
    <div className="mt-10 max-w-2xl">
      <div>
        <Button variant={"outline"} onClick={trigger}>
          Get Product Details
        </Button>

        <div>
          <pre className="text-xs overflow-x-auto">{raw}</pre>
        </div>
      </div>
    </div>
  );
}
