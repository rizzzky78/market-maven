import { createMarkdownEntry, getMarkdownEntry } from "@/lib/service/store";
import { MarkdownStoreDTO } from "@/lib/types/neon";
import { NextRequest, NextResponse } from "next/server";

/**
 * Append new markdown store data to database
 * @example
 * ```ts
 * // Create a new entry
    const response = await fetch('/api/markdown-store', {
      method: 'POST',
      body: JSON.stringify({
        key: 'unique-key',
        chatId: 'chat-123',
        owner: 'user-456',
        type: 'product-search',
        markdown: '# Search Results...'
    })
});
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as MarkdownStoreDTO;

    const result = await createMarkdownEntry(payload);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating markdown entry:", error);

    return NextResponse.json(
      { error: "Failed to create markdown entry" },
      { status: 500 }
    );
  }
}

/**
 * Get specific markdown data from given key
 * @example
 * ```ts
 * // Get a specific entry
   const response = await fetch('/api/markdown-store?key=9ad0725e-b72f-4efb-be83-61dea1865b5f');
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "The { key } parameter on search params is required" },
        { status: 400 }
      );
    }

    const entry = await getMarkdownEntry(key);

    if (!entry) {
      return NextResponse.json(
        { error: "Markdown entry not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error fetching markdown entry:", error);

    return NextResponse.json(
      { error: "Failed to fetch markdown entry" },
      { status: 500 }
    );
  }
}
