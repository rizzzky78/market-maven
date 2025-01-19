"use client";

import { Session } from "next-auth";
import { FC, ReactNode } from "react";
import { SessionProvider as NextSessionProvider } from "next-auth/react";

interface AuthProps {
  children: ReactNode;
  session: Session | null;
}

export const SessionProvider: FC<AuthProps> = ({ children, session }) => {
  return (
    <NextSessionProvider session={session}>{children}</NextSessionProvider>
  );
};
