"use client";

import { FC, useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { SquareArrowOutUpRight } from "lucide-react";
import { Button } from "../ui/button";

export const SnapshotsSection: FC = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      y: 50,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const images = [
    {
      origin:
        "https://ac1wy0nbjb.ufs.sh/f/UTUjFq2sQuvaIAMgyATPKcH70djJsQmNyrgM4h5bEiWOVwfq",
      blur: "/snapshots/blur/app-chat-home.webp",
    },
    {
      origin:
        "https://ac1wy0nbjb.ufs.sh/f/UTUjFq2sQuvaWDY9nDsCcASqaKQ4BiHMob1m6LJjInZ9d2rk",
      blur: "/snapshots/blur/app-chat-0.webp",
    },
    {
      origin:
        "https://ac1wy0nbjb.ufs.sh/f/UTUjFq2sQuvaJh28GEJgKVZ2EkOdFoPYu5sf1hmDxz7erBA9",
      blur: "/snapshots/blur/app-chat-1.webp",
    },
    {
      origin:
        "https://ac1wy0nbjb.ufs.sh/f/UTUjFq2sQuva3LeAwN0b9amcGQENDJXltVAUBCIdjoZ2ry0h",
      blur: "/snapshots/blur/app-chat-1.webp",
    },
    {
      origin:
        "https://ac1wy0nbjb.ufs.sh/f/UTUjFq2sQuvawT0I8hs7g7hw3ijMa0JnoRVLqet6Bm9A24KH",
      blur: "/snapshots/blur/app-chat-3.webp",
    },
    {
      origin:
        "https://ac1wy0nbjb.ufs.sh/f/UTUjFq2sQuvas4UePbZ9gWZbjfYwIEpyK52zCarBJNOAunkL",
      blur: "/snapshots/blur/app-chat-4.webp",
    },
  ];

  return (
    <section ref={sectionRef} className="flex justify-center my-32 px-5">
      <div className="flex flex-col space-y-4 lg:space-y-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-6 lg:mb-0"
        >
          <h2 className="text-4xl font-semibold text-purple-500">Snapshots</h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col space-y-4 lg:space-y-24"
        >
          {images.map((image, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="border rounded-lg overflow-hidden"
            >
              <Image
                src={image.origin}
                alt={`Snapshot ${index + 1}`}
                height={820}
                width={1200}
                quality={100}
                className="rounded-lg w-full h-auto transition-transform duration-700 hover:scale-105"
                placeholder={"blur"}
                blurDataURL={image.blur}
              />
            </motion.div>
          ))}
        </motion.div>
        <div className="flex justify-center">
          <Button variant={"ghost"} className="rounded-3xl hover:bg-muted">
            <Link
              href={`${process.env.NEXT_PUBLIC_APP_URL}/share?type=public-chat&component-id=da02795d-1eaf-4818-a4c0-8ade07e15354&reff-id=shvtw546`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg hover:text-purple-500 flex items-center space-x-2"
            >
              <span className="hover:underline">
                See the shared content chat
              </span>
              <SquareArrowOutUpRight className="size-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
