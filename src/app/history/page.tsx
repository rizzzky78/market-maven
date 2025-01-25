import { ChatHistoryGrid } from "@/components/maven/chat-history-grid";
import { ClearChats } from "@/components/maven/clear-chats";
import { getChats } from "@/lib/agents/action/chat-service";
import { ChatProperties } from "@/lib/types/ai";
import { getServerSession } from "next-auth";
import { cache } from "react";

async function getChatHistory(): Promise<ChatProperties[]> {
  // This is a mock function. In a real app, you'd fetch this data from your API
  return [
    {
      chatId: "1",
      title: "AI Assistance",
      created: new Date("2023-06-01"),
      userId: "user1",
      messages: [
        {
          id: "1",
          role: "user",
          content: "Hello, can you help me with a coding problem?",
        },
        {
          id: "2",
          role: "assistant",
          content: "Of course! What's the issue you're facing?",
        },
      ],
    },
    {
      chatId: "2",
      title: "Code Review",
      created: new Date("2023-06-02"),
      userId: "user1",
      messages: [
        {
          id: "1",
          role: "user",
          content:
            "I need help optimizing my React component. It's rendering too slowly.",
        },
        {
          id: "2",
          role: "assistant",
          content: "I'd be happy to help. Can you share the component code?",
        },
      ],
    },
    {
      chatId: "3",
      title: "Database Query",
      created: new Date("2023-06-03"),
      userId: "user1",
      messages: [
        {
          id: "1",
          role: "user",
          content: "How can I improve the performance of my SQL query?",
        },
        {
          id: "2",
          role: "assistant",
          content:
            "Let's take a look at your query. Can you provide the current SQL statement?",
        },
      ],
    },
    {
      chatId: "4",
      title: "API Integration",
      created: new Date("2023-06-04"),
      userId: "user1",
      messages: [
        {
          id: "1",
          role: "user",
          content:
            "I'm having trouble integrating a third-party API into my application.",
        },
        {
          id: "2",
          role: "assistant",
          content:
            "I can help you with that. What specific issues are you encountering?",
        },
      ],
    },
  ];
}

const loadChats = cache(async (userId: string) => {
  return await getChats(userId);
});

export default async function ChatHistoryPage() {
  // const chats = await getChatHistory();
  const session = await getServerSession();
  const chats = await loadChats(session?.user?.email || "anonymous");
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-md font-semibold mb-6 mx-4">Chat History</h1>
      <ChatHistoryGrid chats={chats} />
    </div>
  );
}
