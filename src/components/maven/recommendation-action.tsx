"use client";

import { FC, useCallback, useEffect, useState } from "react";
import { RotateCwSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { AI } from "@/app/action";
import { useAppState } from "@/lib/utility/provider/app-state-provider";
import {
  useUIState,
  useActions,
  readStreamableValue,
  StreamableValue,
  useStreamableValue,
} from "@ai-sdk/rsc";
import { useMavenStateController } from "@/components/hooks/maven-state-controller";
import { StreamGeneration } from "@/lib/types/ai";
import { DeepPartial, generateId } from "ai";
import { toast } from "sonner";
import { UserMessage } from "@/components/maven/user-message";
import { ProductsRecommendation } from "@/lib/agents/schema/product";
import { ErrorMessage } from "@/components/maven/error-message";
import { ProductRecommendationProps } from "@/lib/types/props";

/** Web pages the recommendations were grounded on. */
const RecommendationSources: FC<{
  sources?: { url: string; title?: string }[];
}> = ({ sources }) => {
  if (!sources?.length) return null;

  return (
    <div className="mt-4 ml-2 text-xs text-muted-foreground">
      <p className="mb-1 font-semibold text-foreground">Based on</p>
      <ul className="flex flex-wrap gap-x-3 gap-y-1">
        {sources.map((source, index) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              {index + 1}. {source.title || "Source"}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const RecommendationAction: FC<ProductRecommendationProps> = ({
  content,
}) => {
  const [, setUIState] = useUIState<typeof AI>();
  const { orchestrator } = useActions<typeof AI>();
  const { isGenerating, setIsGenerating } = useAppState();
  const { attachment, activeComparison, flush, search, related, reffSource } =
    useMavenStateController();

  const actionSubmit = useCallback(
    async (query: string) => {
      if (isGenerating) return;

      try {
        const template = `Search for ${query}`;

        setIsGenerating(true);

        const componentId = generateId();

        setUIState((prevUI) => [
          ...prevUI,
          {
            id: generateId(),
            display: (
              <UserMessage
                key={componentId}
                content={{
                  text_input: template,
                }}
              />
            ),
          },
        ]);

        flush();

        const { id, display, generation } = await orchestrator(
          {
            textInput: template,
          },
          { onRequest: { search, related, reffSource } }
        );

        setUIState((prevUI) => [...prevUI, { id, display }]);

        if (generation) {
          const gens = readStreamableValue(
            generation
          ) as AsyncIterable<StreamGeneration>;
          for await (const { loading } of gens) {
            setIsGenerating(loading);
          }
        }
      } catch (error) {
        console.error("An Error occured when submitting the query!", error);
        toast.error("Error When Submitting the Query!", {
          position: "top-center",
          richColors: true,
          className:
            "text-xs flex justify-center rounded-xl border-none text-white dark:text-black bg-[#1A1A1D] dark:bg-white",
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [
      flush,
      isGenerating,
      orchestrator,
      reffSource,
      related,
      search,
      setIsGenerating,
      setUIState,
    ]
  );

  const isButtonDisabled = attachment
    ? true
    : activeComparison
    ? true
    : isGenerating;

  return (
    <motion.div
      key={content.data.callId}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, scale: 0.98 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: {
            duration: 0.5,
            when: "beforeChildren",
            staggerChildren: 0.1,
          },
        },
      }}
    >
      <div className="w-full border rounded-2xl py-1 mt-6 -mb-6">
        <div className="absolute ml-5 -mt-4">
          <motion.div
            className="rounded-full border bg-background text-muted-foreground py-1 pl-2 pr-3 flex items-center"
            variants={{
              hidden: { opacity: 0, x: -20 },
              visible: {
                opacity: 1,
                x: 0,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                },
              },
            }}
          >
            <RotateCwSquare className="size-4 mr-1 text-muted-foreground" />
            <p className="text-xs font-semibold">Recommendations</p>
          </motion.div>
        </div>
        <div className="p-4 mt-3 -mb-1">
          <motion.div
            className="flex items-center ml-2 mb-4 text-foreground"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.3,
                  delay: 0.2,
                },
              },
            }}
          >
            <Search className="w-4 h-4 mr-2" />
            <p className="text-sm font-semibold">
              Quick Search
              <span className="ml-2 font-normal text-muted-foreground">
                (tap to append query search)
              </span>
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 gap-2 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
            {content.data.recommendations.map((item, index) => (
              <motion.div
                key={item.name}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.95 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                    },
                  },
                }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
                custom={index}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto w-full flex flex-col rounded-xl border bg-background items-start p-2 text-left whitespace-normal shadow-none hover:bg-accent transition-colors"
                  onClick={async () => await actionSubmit(item.name)}
                  disabled={isButtonDisabled}
                >
                  <div className="flex items-center">
                    <motion.div
                      className="flex p-2 shrink-0 rounded-lg bg-muted items-center justify-center text-xs font-medium size-14 md:size-16"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <p>{item.brand}</p>
                    </motion.div>
                    <div className="ml-3 flex flex-col">
                      <p className="text-sm font-medium w-full line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-xs font-normal text-muted-foreground">
                        Model: {item.productModel}
                      </p>
                      {item.reason && (
                        <p className="mt-1 text-xs font-normal text-muted-foreground line-clamp-3">
                          {item.reason}
                        </p>
                      )}
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </motion.div>
          <RecommendationSources sources={content.data.sources} />
        </div>
      </div>
    </motion.div>
  );
};

export const TemplateRecommendationAction: FC<ProductRecommendationProps> = ({
  content,
}) => {
  return (
    <motion.div
      key={content.data.callId}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, scale: 0.98 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: {
            duration: 0.5,
            when: "beforeChildren",
            staggerChildren: 0.1,
          },
        },
      }}
    >
      <div className="w-full border rounded-2xl py-1 mt-6">
        <div className="absolute ml-5 -mt-4">
          <motion.div
            className="rounded-full border bg-background text-muted-foreground py-1 pl-2 pr-3 flex items-center"
            variants={{
              hidden: { opacity: 0, x: -20 },
              visible: {
                opacity: 1,
                x: 0,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                },
              },
            }}
          >
            <RotateCwSquare className="size-4 mr-1 text-muted-foreground" />
            <p className="text-xs font-semibold">Recommendations</p>
          </motion.div>
        </div>
        <div className="p-4 mt-3 -mb-1">
          <motion.div
            className="flex items-center ml-2 mb-4 text-foreground"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.3,
                  delay: 0.2,
                },
              },
            }}
          >
            <Search className="w-4 h-4 mr-2" />
            <p className="text-sm font-semibold">
              Quick Search
              <span className="ml-2 font-normal text-muted-foreground">
                (tap to append query search)
              </span>
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 gap-2 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
            {content.data.recommendations.map((item, index) => (
              <motion.div
                key={item.name}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.95 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                    },
                  },
                }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
                custom={index}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto w-full flex flex-col rounded-xl border bg-background items-start p-2 text-left whitespace-normal shadow-none hover:bg-accent transition-colors"
                  disabled
                >
                  <div className="flex items-center">
                    <motion.div
                      className="flex p-2 shrink-0 rounded-lg bg-muted items-center justify-center text-xs font-medium size-14 md:size-16"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <p>{item.brand}</p>
                    </motion.div>
                    <div className="ml-3 flex flex-col">
                      <p className="text-sm font-medium w-full line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-xs font-normal text-muted-foreground">
                        Model: {item.productModel}
                      </p>
                      {item.reason && (
                        <p className="mt-1 text-xs font-normal text-muted-foreground line-clamp-3">
                          {item.reason}
                        </p>
                      )}
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </motion.div>
          <RecommendationSources sources={content.data.sources} />
        </div>
      </div>
    </motion.div>
  );
};

interface StreamRecommendationActionProps {
  callId: string;
  content: StreamableValue<DeepPartial<ProductsRecommendation>>;
}

export const StreamRecommendationAction: FC<
  StreamRecommendationActionProps
> = ({ callId, content }) => {
  const [raw, error, pending] = useStreamableValue(content);
  const [data, setData] = useState<DeepPartial<ProductsRecommendation>>();

  useEffect(() => {
    if (raw) setData(raw);
  }, [raw]);

  if (error) {
    return (
      <ErrorMessage
        errorName="Stream Object Parsing Operation Failed"
        reason="There was an error while parsing the streamable-value input."
        raw={{ trace: raw }}
      />
    );
  }

  return (
    <div>
      <motion.div
        key={callId}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, scale: 0.98 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: {
              duration: 0.5,
              when: "beforeChildren",
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <div className="w-full border rounded-2xl py-1 my-6">
          <div className="absolute ml-5 -mt-4">
            <motion.div
              className="rounded-full border bg-background text-muted-foreground py-1 pl-2 pr-3 flex items-center"
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  },
                },
              }}
            >
              <RotateCwSquare className="size-4 mr-1 text-muted-foreground" />
              <p className="text-xs font-semibold">Recommendations</p>
            </motion.div>
          </div>
          <div className="p-4 mt-3 -mb-1">
            <motion.div
              className="flex items-center ml-2 mb-4 text-foreground"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.3,
                    delay: 0.2,
                  },
                },
              }}
            >
              <Search className="w-4 h-4 mr-2" />
              <p className="text-sm font-semibold">
                Quick Search
                <span className="ml-2 font-normal text-muted-foreground">
                  (tap to append query search)
                </span>
              </p>
            </motion.div>

            <motion.div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              {data?.recommendations &&
                Array.isArray(data.recommendations) &&
                data.recommendations.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 20, scale: 0.95 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: {
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                        },
                      },
                    }}
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 },
                    }}
                    custom={index}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto w-full flex flex-col rounded-xl border bg-background items-start p-2 text-left whitespace-normal shadow-none hover:bg-accent transition-colors"
                      disabled={pending}
                    >
                      <div className="flex items-center">
                        <motion.div
                          className="flex p-2 shrink-0 rounded-lg bg-muted items-center justify-center text-xs font-medium size-14 md:size-16"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                        >
                          <p>{item?.brand || "-"}</p>
                        </motion.div>
                        <div className="ml-3 flex flex-col">
                          <p className="text-sm font-medium w-full line-clamp-2">
                            {item?.name}
                          </p>
                          <p className="text-xs font-normal text-muted-foreground">
                            Model: {item?.productModel || "-"}
                          </p>
                          {item?.reason && (
                            <p className="mt-1 text-xs font-normal text-muted-foreground line-clamp-3">
                              {item.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
