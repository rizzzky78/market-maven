import { cache, FC } from "react";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { getChats } from "@/lib/agents/action/chat-service";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const loadChats = cache(async (userId: string) => {
  return await getChats(userId);
});

const Page: FC = async () => {
  const id = uuidv4();
  const session = await getServerSession();
  const username = session?.user?.email || "anonymous";

  const chats = await loadChats(username);

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6 text-purple-800">
        Chat History
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chats.map((chat) => (
          <Link
            href={`/chat/c/${chat.chatId}`}
            key={chat.chatId}
            className="block"
          >
            <Card className="h-full bg-purple-50 hover:bg-purple-100 transition-colors duration-200">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium text-purple-800 truncate">
                  {chat.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs text-purple-600">
                  {new Date(chat.created).toLocaleDateString()}
                </p>
                <p className="text-xs text-purple-700 mt-2 line-clamp-2">
                  {chat.messages[chat.messages.length - 1].content as string}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Page;
