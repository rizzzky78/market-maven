"use client";

import { FC, useCallback, useState } from "react";
import { Button } from "../ui/button";
import { clearChats } from "@/lib/agents/action/chat-service";
import { ErrorMessage } from "./error-message";

export const ClearChats: FC = () => {
  const [error, setError] = useState(false);

  const handleClearChats = useCallback(async () => {
    const result = await clearChats();
    if (result.error) setError(true);
  }, []);

  if (error) {
    return (
      <div>
        <ErrorMessage errorName="Clear Chats Error" reason="Unknown Error!" />
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
