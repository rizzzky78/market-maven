import {
  createToolDataEntry,
  getToolDataEntryByChatId,
  getToolDataEntryByKey,
} from "@/lib/service/store";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handles GET requests to fetch tool data
 * @example
 * ```typescript
 * const response = await fetch('/api/tool-data-store?key=2883cf1b-cd8a-4dd2-94b0-b633ce625a11')
 * // or
 * const response = await fetch('/api/tool-data-store?chatId=chat-123')
 * ```
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get("key");
  const chatId = searchParams.get("chatId");

  try {
    if (key) {
      const data = await getToolDataEntryByKey(key);
      if (!data) {
        return NextResponse.json(
          { error: "Tool data not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(data);
    }

    if (chatId) {
      const data = await getToolDataEntryByChatId(chatId);
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: "Missing key or chatId parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching tool data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to create new tool data
 * @example
 * ```typescript
* const response = await fetch("/api/tool-data-store", {
  method: "POST",
  body: JSON.stringify({
    key: "2883cf1b-cd8a-4dd2-94b0-b633ce625a11",
    chatId: "come-chat-id",
    owner: "whoaiam@gmail.com",
    tool: {
      success: true,
      name: "searchProduct",
      args: { query: "Lenovo Yoga" },
      data: {},
    },
  }),
});
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await createToolDataEntry(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating tool data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
