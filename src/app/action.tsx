import {
  SYSTEM_INSTRUCT_DEFINED_INSIGHT,
  SYSTEM_INSTRUCT_EXTRACTOR,
  SYSTEM_INSTRUCT_INSIGHT,
  SYSTEM_INSTRUCT_PRODUCTS,
  SYSTEM_INSTRUCT_RELATED,
} from "@/lib/agents/system-instructions";
import { scrapeUrl } from "@/lib/agents/tools/api/firecrawl";
import { google } from "@ai-sdk/google";
import {
  DeepPartial,
  generateId,
  JSONValue,
  streamObject,
  streamText,
} from "ai";
import {
  createAI,
  createStreamableUI,
  createStreamableValue,
  getAIState,
  getMutableAIState,
  streamUI,
} from "ai/rsc";
import { z } from "zod";
import {
  SendMessageCallback,
  AIState,
  UIState,
  UseAction,
  AssignController,
} from "@/lib/types/ai";
import { groq } from "@ai-sdk/groq";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { v4 } from "uuid";
import { StreamAssistantMessage } from "@/components/maven/assistant-message";
import { toCoreMessage } from "@/lib/agents/action/mutator/mutate-messages";
import { Product, ProductsResponse } from "@/lib/types/product";
import { ProductsContainer } from "@/components/maven/products-container";
import { productsSchema } from "@/lib/agents/schema/product";
import { mutateTool } from "@/lib/agents/action/mutator/mutate-tool";
import { PartialRelated } from "@/lib/agents/schema/related";
import logger from "@/lib/utility/logger";
import { StreamProductInsight } from "@/components/maven/product-insight";
import { mapUIState } from "@/components/custom/ui-mapper";
import { saveAIState } from "@/lib/agents/action/mutator/save-ai-state";
import { ExperimentalStreamProductsContainer } from "@/components/maven/exp-stream-products-container";
import { ShinyText } from "@/components/maven/shining-glass";

const sendMessage = async (
  f: FormData,
  assignController?: AssignController
): Promise<SendMessageCallback> => {
  "use server";

  const textInput = f.get("text_input") as string;

  const attachLink = f.get("attach_link") as string | null;

  const userMessage = JSON.stringify({
    text_input: textInput,
    attach_link: attachLink ?? null,
  });

  console.log(`triggered server action - sendMessage, meta: ${userMessage}`);

  const aiState = getMutableAIState<typeof AI>();

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: generateId(),
        role: "user",
        content: userMessage,
      },
    ],
  });

  const streamableGeneration = createStreamableValue<boolean>(true);

  const streamableText = createStreamableValue<string>("");

  const assistantMessage = (
    <StreamAssistantMessage content={streamableText.value} />
  );

  const { value, stream } = await streamUI({
    model: google("gemini-2.0-flash-exp"),
    system: `You are very helpfull assistant!`,
    messages: toCoreMessage(aiState.get().messages),
    text: async function* ({ content, done }) {
      if (done) {
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: generateId(),
              role: "assistant",
              content,
            },
          ],
        });
      } else {
        streamableGeneration.done(false);
        streamableText.update(content);
      }

      return assistantMessage;
    },
    tools: {
      searchProduct: {
        description: `Search product from user query`,
        parameters: z.object({
          query: z.string(),
        }),
        generate: async function* ({ query }) {
          let finalizedResults: ProductsResponse = { data: [] };

          const uiStream = createStreamableUI();

          uiStream.append(
            <ShinyText
              text={`Searching for ${query}`}
              speed={1}
              className=" font-semibold"
            />
          );

          const encodedQuery = encodeURIComponent(
            query.replace(/\s+/g, "+")
          ).replace(/%2B/g, "+");

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

            streamableGeneration.done(false);

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

            const streamableProducts =
              createStreamableValue<DeepPartial<Product[]>>();

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

          uiStream.append(
            <StreamAssistantMessage content={streamableText.value} />
          );

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

          aiState.done({
            ...aiState.get(),
            messages: [...aiState.get().messages, ...mutate],
          });

          const streamableRelated = createStreamableValue<PartialRelated>();

          // uiStream.append(
          //   <RelatedMessage relatedQueries={streamableRelated.value} />
          // );

          yield uiStream.value;

          const payloadRelated = toCoreMessage(aiState.get().messages);

          const relateds = streamObject({
            model: google("gemini-1.5-pro"),
            system: SYSTEM_INSTRUCT_RELATED,
            prompt: JSON.stringify(
              payloadRelated.filter((m) => m.role !== "tool")
            ),
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

          streamableGeneration.done(false);

          uiStream.done();

          return uiStream.value;
        },
      },
      getProductDetails: {
        description: `Get product details by given link or URL.`,
        parameters: z.object({
          link: z.string().describe("The given url or link by user"),
          query: z
            .string()
            .describe("This must be a product title given from the user"),
        }),
        generate: async function* ({ link, query }) {
          logger.info(`Executing tool: <getProductDetails>`, { query });

          const uiStream = createStreamableUI(
            <ShinyText
              text={`Getting data product for ${query}`}
              speed={1}
              className=" font-semibold"
            />
          );

          yield uiStream.value;

          const scrapeResult = await scrapeUrl({
            url: link,
            formats: ["markdown", "screenshot"],
            waitFor: 4000,
          });

          if (scrapeResult.success && scrapeResult.markdown) {
            const callId = v4();

            let finalizedObject: {
              insight: JSONValue;
              screenshot?: string;
              callId?: string;
            } = { callId, insight: {} };

            const streamableObject = createStreamableValue();

            uiStream.update(
              <StreamProductInsight
                callId={finalizedObject.callId}
                content={streamableObject.value}
                screenshot={scrapeResult.screenshot}
              />
            );

            yield uiStream.value;

            const payloadContent = {
              prompt: `Extract the product description with a full details. This also includes product ratings which include images and comments (if any) with a maximum of 5 product rating data (take the rating that is most helpful to the user).`,
              refference: { link },
              markdown: scrapeResult.markdown,
            };

            const { partialObjectStream } = streamObject({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCT_EXTRACTOR,
              prompt: JSON.stringify(payloadContent),
              output: "no-schema",
              onFinish: async ({ object }) => {
                finalizedObject = {
                  callId,
                  insight: object as JSONValue,
                  screenshot: scrapeResult.screenshot,
                };
              },
            });

            for await (const objProduct of partialObjectStream) {
              finalizedObject = {
                insight: objProduct,
              };
              streamableObject.update(finalizedObject.insight);
            }

            streamableObject.done();

            const streamableText = createStreamableValue<string>("");

            uiStream.append(
              <StreamAssistantMessage content={streamableText.value} />
            );

            yield uiStream.value;

            const payloadRequest = {
              // query,
              data: finalizedObject.insight,
            };

            let finalizedText: string = "";

            const { textStream } = streamText({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCT_DEFINED_INSIGHT,
              prompt: JSON.stringify(payloadRequest),
              onFinish: async ({ text }) => {
                finalizedText = text;
              },
            });

            for await (const text of textStream) {
              finalizedText += text;
              streamableText.update(finalizedText);
            }

            streamableText.done();

            const { mutate } = mutateTool({
              name: "getProductDetails",
              args: { link, query },
              result: finalizedObject,
              overrideAssistant: {
                content: finalizedText,
              },
            });

            aiState.done({
              ...aiState.get(),
              messages: [...aiState.get().messages, ...mutate],
            });
          }

          streamableGeneration.done(false);
          // final
          uiStream.done();

          return uiStream.value;
        },
      },
    },
  });

  return {
    id: generateId(),
    display: value,
    stream,
    isGenerating: streamableGeneration.value,
  };
};

/**
 * AI Provider for: **StreamUI**
 *
 * @method StreamUI
 */
export const AI = createAI<AIState, UIState, UseAction>({
  initialUIState: [],
  initialAIState: {
    chatId: generateId(),
    messages: [],
  },
  actions: {
    sendMessage,
  },
  onSetAIState: async ({ state, done }) => {
    "use server";

    if (done) {
      const session = await getServerSession();
      await saveAIState(state, session);
    }
  },
  onGetUIState: async () => {
    "use server";

    const aiState = getAIState<typeof AI>();

    if (aiState) {
      const uiState = mapUIState(aiState);
      return uiState;
    } else {
      return;
    }
  },
});
