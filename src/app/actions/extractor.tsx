import { StreamAssistantMessage } from "@/components/maven/assistant-message";
import { ErrorMessage } from "@/components/maven/error-message";
import {
  StreamProductDetails,
  ProductDetails,
} from "@/components/maven/product-details";
import { ShinyText } from "@/components/maven/shining-glass";
import {
  toUnifiedUserMessage,
  toCoreMessage,
} from "@/lib/agents/action/mutator/mutate-messages";
import { mutateTool } from "@/lib/agents/action/mutator/mutate-tool";
import SYSTEM_INSTRUCTION from "@/lib/agents/constant/md";
import { getProductDetailsSchema } from "@/lib/agents/schema/tool-parameters";
import { scrapeUrl } from "@/lib/agents/tools/api/firecrawl";
import { AttachProduct, MutableAIState, AIState } from "@/lib/types/ai";
import { ProductDetailsResponse } from "@/lib/types/product";
import logger from "@/lib/utility/logger";
import { google } from "@ai-sdk/google";
import { generateId, streamObject, streamText } from "ai";
import { getMutableAIState, streamUI, createStreamableValue } from "ai/rsc";
import { v4 } from "uuid";
import { AI } from "../action";
import { root } from "@/lib/agents/constant";
import { storeKeyValue } from "@/lib/service/store";

export async function extractor(product: AttachProduct) {
  "use server";

  logger.info("Using extractor", { product });

  const state: MutableAIState<AIState> = getMutableAIState(typeof AI);

  const payloadUserMessage = toUnifiedUserMessage({ attachProduct: product });

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

  const { value } = await streamUI({
    model: google("gemini-2.0-flash-exp"),
    system: `Use tool for every requests`,
    messages: toCoreMessage(state.get().messages),
    initial: <ShinyText text="Maven is thinking..." />,
    tools: {
      getProductDetails: {
        description: root.GetProductDetailsDescription,
        parameters: getProductDetailsSchema,
        generate: async function* ({ query, link }) {
          yield <ShinyText text={`Getting data product for ${query}`} />;

          await new Promise((resolve) => setTimeout(resolve, 3000));

          const scrapeResult = await scrapeUrl({
            url: link,
            formats: ["markdown", "screenshot"],
            waitFor: 4000,
          });

          /** Handle if Scrape Operation is Error */
          if (!scrapeResult.success) {
            return (
              <ErrorMessage
                errorName="Scrape Operation Failed"
                reason="There was an error while scrapping the content from the firecrawl service."
                raw={{
                  payload: { query, link },
                  error: scrapeResult.error,
                  message: scrapeResult.message,
                }}
              />
            );
          }

          /** Handle if Scrape Operation is Success */
          if (scrapeResult.success && scrapeResult.markdown) {
            yield <ShinyText text="Found product details, please hang on..." />;

            await new Promise((resolve) => setTimeout(resolve, 3000));

            let finalizedObject: ProductDetailsResponse = {
              productDetails: {},
            };

            const payloadContent = JSON.stringify({
              prompt: root.ExtractionDetails,
              refference: { query, link },
              markdown: scrapeResult.markdown,
            });

            const streamableObject =
              createStreamableValue<Record<string, any>>();

            yield (
              <StreamProductDetails
                query={query}
                link={link}
                callId={finalizedObject.callId}
                content={streamableObject.value}
                screenshot={scrapeResult.screenshot}
              />
            );

            const { partialObjectStream } = streamObject({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCTION.PRODUCT_DETAILS_EXTRACTOR,
              prompt: payloadContent,
              output: "no-schema",
              onFinish: async ({ object }) => {
                finalizedObject = {
                  callId: v4(),
                  screenshot: scrapeResult.screenshot,
                  productDetails: object as Record<string, any>,
                };
              },
            });

            for await (const objProduct of partialObjectStream) {
              finalizedObject = {
                productDetails: objProduct as Record<string, any>,
              };
              streamableObject.update(finalizedObject.productDetails);
            }

            streamableObject.done();

            const stored = await storeKeyValue<ProductDetailsResponse>({
              key: finalizedObject.callId as string,
              metadata: {
                chatId: state.get().chatId,
                email: state.get().username,
              },
              value: finalizedObject,
            });

            const streamableText = createStreamableValue<string>("");

            yield (
              <>
                <ProductDetails
                  content={{
                    success: true,
                    name: "getProductDetails",
                    args: { query, link },
                    data: {
                      insight: stored.value.productDetails,
                      screenshot: stored.value.screenshot as string,
                      callId: stored.value.callId as string,
                    },
                  }}
                />
                <StreamAssistantMessage content={streamableText.value} />
              </>
            );

            let finalizedText: string = "";

            const { textStream } = streamText({
              model: google("gemini-2.0-flash-exp"),
              system: SYSTEM_INSTRUCTION.PRODUCT_COMPARE_INSIGHT,
              prompt: JSON.stringify(stored.value.productDetails),
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
              result: stored.value,
              overrideAssistant: {
                content: finalizedText,
              },
            });

            state.done({
              ...state.get(),
              messages: [...state.get().messages, ...mutate],
            });
          }
        },
      },
    },
  });
}
