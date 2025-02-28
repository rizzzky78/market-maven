"use client";

import { FC } from "react";
import { RotateCwSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { RecommendationResponse } from "@/lib/types/product";

interface RecommendationsProps {
  content: RecommendationResponse;
}

export const RecommendationAction: FC<RecommendationsProps> = ({ content }) => {
  return (
    <motion.div
      key={content.callId}
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
      <div className="w-full border-[#1A1A1D] dark:border-inherit border rounded-[2rem] py-1 my-6">
        <div className="absolute ml-5 -mt-4">
          <motion.div
            className="bg-[#1A1A1D] dark:bg-white text-white dark:text-[#1A1A1D] rounded-3xl py-1 pl-2 pr-3 flex items-center"
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
            <RotateCwSquare className="size-4 mr-1 text-purple-400" />
            <p className="text-xs font-semibold">Recommendations</p>
          </motion.div>
        </div>
        <div className="p-4 mt-3 -mb-1">
          <motion.div
            className="flex items-center ml-2 mb-4 text-black/90 dark:text-white/90"
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
              Quick Search Shortcuts
              <span className="ml-2 font-normal text-muted-foreground">
                (tap to append query search)
              </span>
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-2">
            {content.recommendations.map((item, index) => (
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
                  className="h-auto bg-[#1A1A1D]/20 w-full flex flex-col rounded-3xl items-start p-2 text-left hover:bg-muted-foreground/50 dark:hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center">
                    <motion.div
                      className="flex p-2 shrink-0 rounded-2xl bg-[#1A1A1D]/20 dark:bg-muted items-center justify-center text-xs font-normal size-20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <p>{item.brand}</p>
                    </motion.div>
                    <p className="ml-3 text-sm font-medium w-full line-clamp-2">
                      {item.name}
                    </p>
                  </div>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
