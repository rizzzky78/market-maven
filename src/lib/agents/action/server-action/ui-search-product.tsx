import { StreamAssistantMessage } from "@/components/maven/assistant-message";
import { ExperimentalStreamProductsContainer } from "@/components/maven/exp-stream-products-container";
import { ProductsContainer } from "@/components/maven/products-container";
import { ShinyText } from "@/components/maven/shining-glass";
import { MutableAIState, StreamGeneration } from "@/lib/types/ai";
import { ProductsResponse, Product } from "@/lib/types/product";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { DeepPartial, streamObject, streamText } from "ai";
import { createStreamableUI, createStreamableValue } from "ai/rsc";
import { z } from "zod";
import { productsSchema } from "../../schema/product";
import { PartialRelated } from "../../schema/related";
import {
  SYSTEM_INSTRUCT_PRODUCTS,
  SYSTEM_INSTRUCT_INSIGHT,
  SYSTEM_INSTRUCT_RELATED,
} from "../../system-instructions";
import { scrapeUrl } from "../../tools/api/firecrawl";
import { toCoreMessage } from "../mutator/mutate-messages";
import { mutateTool } from "../mutator/mutate-tool";
import { ReactNode } from "react";

type UIPayload = {
  data: { query: string };
  state: MutableAIState;
  uiStream: ReturnType<typeof createStreamableUI>;
  streamableGeneration: ReturnType<
    typeof createStreamableValue<StreamGeneration>
  >;
};

export async function* uiSearchProduct(
  p: UIPayload
): AsyncGenerator<ReactNode> {
  const {
    data: { query },
    state,
    uiStream,
    streamableGeneration,
  } = p;

  streamableGeneration.update({
    process: "generating",
    loading: true,
  });

  let finalizedResults: ProductsResponse = { data: [] };

  uiStream.append(
    <ShinyText text={`Searching for ${query}`} speed={1} className="" />
  );

  const encodedQuery = encodeURIComponent(query.replace(/\s+/g, "+")).replace(
    /%2B/g,
    "+"
  );

  const URLQuery = `https://www.tokopedia.com/search?q=${encodedQuery}`;

  yield uiStream.value;

  const scrapeContent = await scrapeUrl({
    url: URLQuery,
    formats: ["markdown", "screenshot"],
    waitFor: 4000,
  });

  if (!scrapeContent.success) {
    const errorUI = (
      <div>
        <div>
          <p className="text-xs">An Error Occured!</p>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(scrapeContent, null, 2)}
          </pre>
        </div>
      </div>
    );

    uiStream.done(errorUI);

    streamableGeneration.done({
      process: "error",
      loading: false,
      error: scrapeContent.error,
    });

    return uiStream.value;
  }

  if (scrapeContent.success && scrapeContent.markdown) {
    if (scrapeContent.screenshot) {
      uiStream.update(
        <ShinyText
          text="Found products, proceed to data extraction..."
          speed={1}
          className=" font-semibold"
        />
      );

      yield uiStream.value;
    }

    const payload = {
      objective: `Extract only product data including: product images, product link, and store link.`,
      markdown: scrapeContent.markdown,
    };

    const streamableProducts = createStreamableValue<DeepPartial<Product[]>>();

    uiStream.update(
      <ExperimentalStreamProductsContainer
        screenshot={scrapeContent.screenshot}
        products={streamableProducts.value}
      />
    );

    const { partialObjectStream } = streamObject({
      model: google("gemini-2.0-flash-exp"),
      system: SYSTEM_INSTRUCT_PRODUCTS,
      prompt: JSON.stringify(payload),
      schema: productsSchema,
      onFinish: async ({ object }) => {
        if (object) {
          finalizedResults = {
            screenshot: scrapeContent.screenshot,
            data: object.data,
          };
        }
      },
    });

    for await (const chunk of partialObjectStream) {
      if (chunk.data) {
        streamableProducts.update(chunk.data);
      }
    }

    streamableProducts.done();
  }

  uiStream.update(
    <ProductsContainer
      content={{
        success: true,
        name: "searchProduct",
        args: { query },
        data: finalizedResults,
      }}
      isFinished={true}
    />
  );

  const streamableText = createStreamableValue<string>("");

  uiStream.append(<StreamAssistantMessage content={streamableText.value} />);

  yield uiStream.value;

  let finalizedText: string = "";

  const { textStream } = streamText({
    model: groq("llama-3.2-90b-vision-preview"),
    system: SYSTEM_INSTRUCT_INSIGHT,
    prompt: JSON.stringify(finalizedResults),
    onFinish: ({ text }) => {
      finalizedText = text;
    },
  });

  for await (const texts of textStream) {
    finalizedText += texts;
    streamableText.update(finalizedText);
  }

  streamableText.done();

  const { mutate } = mutateTool({
    name: "searchProduct",
    args: { query },
    result: finalizedResults,
    overrideAssistant: {
      content: finalizedText,
    },
  });

  state.done({
    ...state.get(),
    messages: [...state.get().messages, ...mutate],
  });

  const streamableRelated = createStreamableValue<PartialRelated>();

  // uiStream.append(
  //   <RelatedMessage relatedQueries={streamableRelated.value} />
  // );

  yield uiStream.value;

  const payloadRelated = toCoreMessage(state.get().messages);

  const relateds = streamObject({
    model: google("gemini-1.5-pro"),
    system: SYSTEM_INSTRUCT_RELATED,
    prompt: JSON.stringify(payloadRelated.filter((m) => m.role !== "tool")),
    schema: z.object({
      items: z
        .array(
          z.object({
            query: z.string(),
          })
        )
        .length(3),
    }),
  });

  for await (const related of relateds.partialObjectStream) {
    streamableRelated.update(related);
  }

  streamableRelated.done();

  streamableGeneration.done({
    process: "done",
    loading: false,
  });

  uiStream.done();

  return uiStream.value;
}
