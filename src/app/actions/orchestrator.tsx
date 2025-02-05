"use server";

import { StreamAssistantMessage } from "@/components/maven/assistant-message";
import { ShinyText } from "@/components/maven/shining-glass";
import {
  toUnifiedUserMessage,
  toCoreMessage,
} from "@/lib/agents/action/mutator/mutate-messages";
import {
  SYSTEM_INSTRUCT_CORE,
  SYSTEM_INSTRUCT_INSIGHT,
  SYSTEM_INSTRUCT_PRODUCTS,
} from "@/lib/agents/system-instructions";
import {
  PayloadData,
  AssignController,
  OrchestratorCallback,
  MutableAIState,
  AIState,
  StreamGeneration,
} from "@/lib/types/ai";
import logger from "@/lib/utility/logger";
import { google } from "@ai-sdk/google";
import { DeepPartial, generateId, streamObject, streamText } from "ai";
import { getMutableAIState, createStreamableValue, streamUI } from "ai/rsc";
import { AI } from "../action";
import { searchProductSchema } from "@/lib/agents/schema/tool-parameters";
import { root } from "@/lib/agents/constant";
import { ErrorMessage } from "@/components/maven/error-message";
import { StreamProductsContainer } from "@/components/maven/exp-stream-products-container";
import { ProductsContainer } from "@/components/maven/products-container";
import { mutateTool } from "@/lib/agents/action/mutator/mutate-tool";
import { productsSchema } from "@/lib/agents/schema/product";
import { scrapeUrl } from "@/lib/agents/tools/api/firecrawl";
import { storeKeyValue } from "@/lib/service/store";
import { ProductsResponse, Product } from "@/lib/types/product";
import { processURLQuery } from "@/lib/utils";
import { groq } from "@ai-sdk/groq";
import { v4 } from "uuid";

export async function orchestrator(
  payload: PayloadData,
  assignController?: AssignController
): Promise<OrchestratorCallback> {
  logger.info("Process on Server Action", { payload });

  const payloadUserMessage = toUnifiedUserMessage(payload);

  const state: MutableAIState<AIState> = getMutableAIState<typeof AI>();

  state.update({
    ...state.get(),
    messages: [
      ...state.get().messages,
      {
        id: generateId(),
        role: "user",
        content: JSON.stringify(payloadUserMessage),
      },
    ],
  });

  const generation = createStreamableValue<StreamGeneration>({
    process: "initial",
    loading: true,
  });

  const streamableText = createStreamableValue<string>("");

  const textUi = <StreamAssistantMessage content={streamableText.value} />;

  const { value, stream } = await streamUI({
    model: google("gemini-2.0-flash-exp"),
    system: SYSTEM_INSTRUCT_CORE,
    // messages: toCoreMessage(state.get().messages),
    prompt: JSON.stringify(payloadUserMessage),
    initial: <ShinyText text="Maven is thinking..." />,
    text: async function* ({ content, done }) {
      if (done) {
        state.done({
          ...state.get(),
          messages: [
            ...state.get().messages,
            {
              id: generateId(),
              role: "assistant",
              content,
            },
          ],
        });

        streamableText.done();
        generation.done({
          process: "done",
          loading: false,
        });
      } else {
        streamableText.update(content);
        generation.update({
          process: "generating",
          loading: true,
        });
      }

      return textUi;
    },
    tools: {
      searchProduct: {
        description: root.SearchProductDescription,
        parameters: searchProductSchema,
        generate: async function* ({ query }) {
          logger.info("Using searchProduct tool", {
            progress: "initial",
            request: { query },
          });

          generation.update({
            process: "generating",
            loading: true,
          });

          yield <ShinyText text={`Searching for ${query}`} />;

          let finalizedResults: ProductsResponse = { data: [] };

          const scrapeContent = await scrapeUrl({
            url: processURLQuery(query),
            formats: ["markdown", "screenshot"],
            waitFor: 4000,
          });

          /** Handle if Scrape Operation is Error */
          if (!scrapeContent.success) {
            return (
              <ErrorMessage
                errorName="Scrape Operation Failed"
                reason="There was an error while scrapping the content from the firecrawl service."
                raw={{
                  payload: { query },
                  error: scrapeContent.error,
                  message: scrapeContent.message,
                }}
              />
            );
          }

          /** Handle if Scrape Operation is Success */
          if (scrapeContent.success && scrapeContent.markdown) {
            yield (
              <ShinyText text="Found products, proceed to data extraction..." />
            );

            await new Promise((resolve) => setTimeout(resolve, 3000));

            const payload = JSON.stringify({
              objective: root.ExtractionOjective,
              markdown: scrapeContent.markdown,
            });

            const streamableProducts =
              createStreamableValue<DeepPartial<Product[]>>();

            yield (
              <StreamProductsContainer
                query={query}
                screenshot={scrapeContent.screenshot}
                products={streamableProducts.value}
              />
            );

            let isObjectGenerationDone = false;

            const { partialObjectStream } = streamObject({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCT_PRODUCTS,
              prompt: payload,
              schema: productsSchema,
              onFinish: async ({ object }) => {
                isObjectGenerationDone = true;

                if (object) {
                  finalizedResults = {
                    callId: v4(),
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

            if (isObjectGenerationDone) {
              const stored = await storeKeyValue<ProductsResponse>({
                key: finalizedResults.callId as string,
                metadata: {
                  chatId: "temporary",
                  email: "temporary",
                },
                value: finalizedResults,
              });

              const streamableText = createStreamableValue<string>("");

              yield (
                <>
                  <ProductsContainer
                    content={{
                      success: true,
                      name: "searchProduct",
                      args: { query },
                      data: stored.value,
                    }}
                    isFinished={true}
                  />
                  <StreamAssistantMessage content={streamableText.value} />
                </>
              );

              let finalizedText: string = "";

              const { textStream } = streamText({
                model: groq("llama-3.3-70b-versatile"),
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

              logger.info("Done using searchProduct tool", {
                progress: "finish",
                request: { query },
              });
            }
          }

          generation.done({
            process: "done",
            loading: false,
          });
        },
      },
    },
  });

  return {
    source: "orchestrator",
    id: generateId(),
    display: value,
    generation: generation.value,
  };
}
