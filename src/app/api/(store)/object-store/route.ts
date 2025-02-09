import { createObjectEntry, getObjectEntry } from "@/lib/service/store";
import { NextRequest, NextResponse } from "next/server";

/**
 * Append new object data to database
 * @example 
 * ```ts
 * const searchResult = await fetch('/api/object-store', {
    method: 'POST',
    body: JSON.stringify({
        key: 'search-123',
        chatId: 'chat-456',
        owner: 'user-789',
        type: 'searchProduct',
        object: {
            query: 'laptop',
            results: [
                { id: '1', name: 'ThinkPad', price: 999 }
            ]
        }
    })
});
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = await createObjectEntry(payload);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating object entry:", error);
    return NextResponse.json(
      { error: "Failed to create object entry" },
      { status: 500 }
    );
  }
}

/**
 * Get existing object data by given key
 * @example
 * ```ts
 * const result = await fetch('/api/object-store?key=9ad0725e-b72f-4efb-be83-61dea1865b5f');
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Type parameter is required" },
        { status: 400 }
      );
    }

    const entry = await getObjectEntry(key);

    if (!entry) {
      return NextResponse.json(
        { error: "Object entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error fetching object entry:", error);
    return NextResponse.json(
      { error: "Failed to fetch object entry" },
      { status: 500 }
    );
  }
}
