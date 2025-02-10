import {
  createToolDataEntry,
  getToolDataEntryByChatId,
  getToolDataEntryByKey,
} from "@/lib/service/store";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handles GET requests to fetch tool data
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
