"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";
import Image from "next/image";
import { FC, ReactNode } from "react";

type AuthShellProps = {
  /** Heading text before the brand mark, e.g. "Login to". */
  title: string;
  description: ReactNode;
  children: ReactNode;
};

/**
 * Split card shared by the login, signup and password reset pages: the form
 * on the left, the brand illustration on the right from `md` up.
 */
export const AuthShell: FC<AuthShellProps> = ({
  title,
  description,
  children,
}) => (
  <motion.div
    className="flex flex-col gap-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <Card className="bg-[#D8D2C2] dark:bg-black rounded-4xl w-full border-none lg:pl-6">
      <CardContent className="grid p-0 md:grid-cols-2">
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-6">
            <motion.div
              className="w-full flex flex-col items-center lg:items-start text-center lg:text-left"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="font-(family-name:--font-array) text-3xl tracking-wider font-semibold text-black dark:text-white">
                {title} <span className="text-purple-500">MAVEN AI</span>
              </h1>
              <div className="font-(family-name:--font-khand) text-balance text-lg text-muted-foreground mt-2">
                {description}
              </div>
            </motion.div>
            {children}
          </div>
        </div>
        <motion.div
          className="relative hidden md:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <Image
            fill
            src="/login-pict.png"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-contain"
          />
        </motion.div>
      </CardContent>
    </Card>
  </motion.div>
);
