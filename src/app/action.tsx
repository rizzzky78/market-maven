import {
  SYSTEM_INSTRUCT_CORE,
  SYSTEM_INSTRUCT_DEFINED_INSIGHT,
  SYSTEM_INSTRUCT_EXTRACTOR,
  SYSTEM_INSTRUCT_INSIGHT,
  SYSTEM_INSTRUCT_PRODUCTS,
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
import {
  SendMessageCallback,
  AIState,
  UIState,
  UseAction,
  AssignController,
  PayloadData,
  StreamGeneration,
  UserContentMessage,
} from "@/lib/types/ai";
import { groq } from "@ai-sdk/groq";
import { getServerSession } from "next-auth";
import { v4 } from "uuid";
import { StreamAssistantMessage } from "@/components/maven/assistant-message";
import { toCoreMessage } from "@/lib/agents/action/mutator/mutate-messages";
import { Product, ProductsResponse } from "@/lib/types/product";
import { ProductsContainer } from "@/components/maven/products-container";
import { productsSchema } from "@/lib/agents/schema/product";
import { mutateTool } from "@/lib/agents/action/mutator/mutate-tool";
import logger from "@/lib/utility/logger";
import { StreamProductInsight } from "@/components/maven/product-insight";
import { mapUIState } from "@/components/custom/ui-mapper";
import { saveAIState } from "@/lib/agents/action/mutator/save-ai-state";
import { StreamProductsContainer } from "@/components/maven/exp-stream-products-container";
import { ShinyText } from "@/components/maven/shining-glass";
import { UserInquiry } from "@/components/maven/user-inquiry";
import {
  getProductDetailsSchema,
  inquireUserSchema,
  searchProductSchema,
} from "@/lib/agents/schema/tool-parameters";
import { processURLQuery } from "@/lib/utils";
import { ErrorMessage } from "@/components/maven/error-message";
import { root } from "@/lib/agents/constant";

const sendMessage = async (
  payload: PayloadData,
  assignController?: AssignController
): Promise<SendMessageCallback> => {
  "use server";
  const { textInput, attachProduct, inquiryResponse } = payload;

  const payloadUserMessage: UserContentMessage = {
    text_input: textInput ?? null,
    attach_product: attachProduct ?? null,
    inquiry_response: inquiryResponse ?? null,
  };

  const userMessage = JSON.stringify(payloadUserMessage);

  logger.info("Process on Server Action", { payload });

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

  const streamableGeneration = createStreamableValue<StreamGeneration>({
    process: "initial",
    loading: true,
  });

  const streamableText = createStreamableValue<string>("");

  const assistantMessage = (
    <StreamAssistantMessage content={streamableText.value} />
  );

  const { value, stream } = await streamUI({
    model: google("gemini-2.0-flash-exp"),
    system: SYSTEM_INSTRUCT_CORE,
    messages: toCoreMessage(aiState.get().messages),
    onFinish: async () => {},
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

        streamableGeneration.done({
          process: "done",
          loading: false,
        });

        streamableText.done();
      } else {
        streamableGeneration.update({
          process: "generating",
          loading: true,
        });

        streamableText.update(content);
      }

      return assistantMessage;
    },
    tools: {
      searchProduct: {
        description: root.SearchProductDescription,
        parameters: searchProductSchema,
        generate: async function* ({ query }) {
          // Comprehensive Stream Initialization
          const streamableGeneration = createStreamableValue<StreamGeneration>({
            process: "initial",
            loading: true,
          });

          const uiStream = createStreamableUI();
          const streamableProducts =
            createStreamableValue<DeepPartial<Product[]>>();
          const streamableText = createStreamableValue<string>("");

          try {
            // Initial Search Indication
            uiStream.append(<ShinyText text={`Searching for ${query}`} />);
            yield uiStream.value;

            // Update Generation State
            streamableGeneration.update({
              process: "initial",
              loading: true,
            });

            // Scraping Process
            const scrapeContent = await scrapeUrl({
              url: processURLQuery(query),
              formats: ["markdown", "screenshot"],
              waitFor: 4000,
            });

            // Comprehensive Error Handling
            if (!scrapeContent.success) {
              logger.error("Scrape Operation Failed", {
                query,
                error: scrapeContent.error,
              });

              uiStream.update(
                <ErrorMessage
                  name="Scrape Error"
                  messsage={scrapeContent.error}
                  raw={{ query }}
                />
              );

              streamableGeneration.done({
                process: "error",
                loading: false,
                error: scrapeContent.error,
              });

              uiStream.done();
              return uiStream.value;
            }

            // Successful Scrape Indication
            uiStream.update(
              <ShinyText
                text="Found products, proceeding to data extraction..."
                speed={1}
              />
            );
            yield uiStream.value;

            // Intentional Processing Delay
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Prepare Extraction Payload
            const extractionPayload = JSON.stringify({
              objective: root.ExtractionOjective,
              markdown: scrapeContent.markdown,
            });

            // Update UI with Products Container
            uiStream.update(
              <StreamProductsContainer
                query={query}
                screenshot={scrapeContent.screenshot}
                products={streamableProducts.value}
              />
            );
            yield uiStream.value;

            // Product Extraction Process
            let finalizedResults: ProductsResponse = { data: [] };

            const { partialObjectStream } = streamObject({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCT_PRODUCTS,
              prompt: extractionPayload,
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

            // Streaming Product Data
            for await (const chunk of partialObjectStream) {
              if (chunk.data) {
                streamableProducts.update(chunk.data);
                yield uiStream.value;
              }
            }

            // Final Products Container
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
            yield uiStream.value;

            // Assistant Message Stream
            uiStream.append(
              <StreamAssistantMessage content={streamableText.value} />
            );
            yield uiStream.value;

            // Generate Insights
            let finalizedText: string = "";
            const { textStream } = streamText({
              model: groq("llama-3.2-90b-vision-preview"),
              system: SYSTEM_INSTRUCT_INSIGHT,
              prompt: JSON.stringify(finalizedResults),
              onFinish: ({ text }) => {
                finalizedText = text;
              },
            });

            // Streaming Insight Text
            for await (const texts of textStream) {
              finalizedText += texts;
              streamableText.update(finalizedText);
              yield uiStream.value;
            }

            // Tool Mutation and AI State Update
            const { mutate } = mutateTool({
              name: "searchProduct",
              args: { query },
              result: finalizedResults,
              overrideAssistant: {
                content: finalizedText,
              },
            });

            // Update AI State
            aiState.done({
              ...aiState.get(),
              messages: [...aiState.get().messages, ...mutate],
            });
          } catch (error) {
            // Unexpected Error Handling
            const errMessage =
              error instanceof Error ? error.message : "Unknown Error";

            logger.error("Unexpected Error in searchProduct", {
              query,
              error: errMessage,
            });

            uiStream.update(
              <ErrorMessage name="Unexpected Error" messsage={errMessage} />
            );

            streamableGeneration.done({
              process: "error",
              loading: false,
              error: errMessage,
            });
          } finally {
            // Guaranteed Stream Finalization
            streamableGeneration.done({
              process: "done",
              loading: false,
            });
            streamableProducts.done();
            streamableText.done();
            uiStream.done();
          }

          // Logging Completion
          logger.info("Completed searchProduct tool", {
            query,
            status: "success",
          });

          return uiStream.value;
        },
      },
      getProductDetails: {
        description: root.GetProductDetailsDescription,
        parameters: getProductDetailsSchema,
        generate: async function* ({ query, link }) {
          logger.info("Using getProductDetails tool", {
            progress: "initial",
            request: { query, link },
          });

          streamableGeneration.update({
            process: "generating",
            loading: true,
          });

          const uiStream = createStreamableUI(
            <ShinyText text={`Getting data product for ${query}`} />
          );

          yield uiStream.value;

          await new Promise((resolve) => setTimeout(resolve, 3000));

          const scrapeResult = await scrapeUrl({
            url: link,
            formats: ["markdown", "screenshot"],
            waitFor: 4000,
          });

          /** Handle if Scrape Operation is Error */
          if (!scrapeResult.success) {
            streamableGeneration.done({
              process: "error",
              loading: false,
              error: scrapeResult.error,
            });

            uiStream.done(
              <ErrorMessage
                name="Scrape Error"
                messsage={scrapeResult.error}
                raw={{ query }}
              />
            );

            return uiStream.value;
          }

          /** Handle if Scrape Operation is Success */
          if (scrapeResult.success && scrapeResult.markdown) {
            uiStream.update(
              <ShinyText text="Found product details, please hang on..." />
            );

            yield uiStream.value;

            await new Promise((resolve) => setTimeout(resolve, 3000));

            let finalizedObject: {
              insight: JSONValue;
              screenshot?: string;
              callId?: string;
            } = { callId: v4(), insight: {} };

            const streamableObject = createStreamableValue();

            uiStream.update(
              <StreamProductInsight
                callId={finalizedObject.callId}
                content={streamableObject.value}
                screenshot={scrapeResult.screenshot}
              />
            );

            yield uiStream.value;

            const payloadContent = JSON.stringify({
              prompt: root.ExtractionDetails,
              refference: { query, link },
              markdown: scrapeResult.markdown,
            });

            const { partialObjectStream } = streamObject({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCT_EXTRACTOR,
              prompt: payloadContent,
              output: "no-schema",
              onFinish: async ({ object }) => {
                finalizedObject = {
                  callId: v4(),
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

            const streamableText = createStreamableValue<string>("");

            uiStream.append(
              <StreamAssistantMessage content={streamableText.value} />
            );

            yield uiStream.value;

            let finalizedText: string = "";

            const { textStream } = streamText({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCT_DEFINED_INSIGHT,
              prompt: JSON.stringify({ data: finalizedObject.insight }),
              onFinish: async ({ text }) => {
                finalizedText = text;
              },
            });

            for await (const text of textStream) {
              finalizedText += text;
              streamableText.update(finalizedText);
            }

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

            /** DONE ALL STREAMABLE */
            streamableObject.done();

            streamableText.done();

            streamableGeneration.done({
              process: "done",
              loading: false,
            });

            uiStream.done();
            /** DONE ALL STREAMABLE */

            logger.info("Done using getProductDetails tool", {
              progress: "finish",
              request: { query, link },
            });

            return uiStream.value;
          }
        },
      },
      inquireUser: {
        description: `Inquire the user is provided prompt or information are not enough`,
        parameters: inquireUserSchema,
        generate: async function* (inquiry) {
          logger.info("Using inquireUser tool");

          streamableGeneration.update({
            process: "generating",
            loading: false,
          });

          const callId = generateId();
          const uiStream = createStreamableUI(
            <ShinyText key={callId} text="Creating an Inquiry" />
          );

          yield uiStream.value;

          await new Promise((resolve) => setTimeout(resolve, 3000));

          uiStream.update(<UserInquiry inquiry={inquiry} />);

          const { mutate } = mutateTool({
            name: "inquireUser",
            args: { inquiry },
            result: { data: "no-result" },
            overrideAssistant: {
              content: `Inquiry have been provided, please fill them in accordingly.`,
            },
          });

          aiState.done({
            ...aiState.get(),
            messages: [...aiState.get().messages, ...mutate],
          });

          /** DONE ALL STREAMABLE */
          streamableGeneration.done({
            process: "done",
            loading: false,
          });

          uiStream.done();
          /** DONE ALL STREAMABLE */

          logger.info("Done using inquireUser tool");

          return uiStream.value;
        },
      },
    },
  });

  return {
    id: generateId(),
    display: value,
    stream,
    generation: streamableGeneration.value,
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
