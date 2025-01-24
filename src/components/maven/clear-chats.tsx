"use client";

import { FC, useCallback, useState } from "react";
import { Button } from "../ui/button";
import { clearChats } from "@/lib/agents/action/chat-service";
import { useSession } from "next-auth/react";
import { ErrorMessage } from "./error-message";

export const ClearChats: FC = () => {
  const [error, setError] = useState(false);
  const session = useSession();

  const handleClearChats = useCallback(async () => {
    const result = await clearChats(session.data?.user?.email || "anonymous");
    if (result.error) setError(true);
  }, [session.data?.user?.email]);

  if (error) {
    return (
      <div>
        <ErrorMessage name="Clear Chats Error" messsage="Unknown Error!" />
      </div>
    );
  }

  return (
    <div>
      <div>
        <Button
          variant={"outline"}
          className="rounded-3xl"
          onClick={handleClearChats}
        >
          Clear Chats
        </Button>
      </div>
    </div>
  );
};
