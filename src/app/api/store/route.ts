import { storeValueSchema } from "@/lib/types/neon";
import { neon } from "@neondatabase/serverless";
import { NextRequest } from "next/server";
import { z } from "zod";

// Database connection
const sql = neon(process.env.DATABASE_URL!);

// API route handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = storeValueSchema.parse(body);

    // Store value in database
    await sql`
      INSERT INTO key_value_store (key, metadata, value)
      VALUES (
        ${validatedData.key},
        ${JSON.stringify(validatedData.metadata)}::jsonb,
        ${validatedData.value}
      )
    `;

    return Response.json(
      { message: "Value stored successfully", payload: validatedData },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    // Handle duplicate key errors specifically
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return Response.json({ error: "Key already exists" }, { status: 409 });
    }

    console.error("Error storing value:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return Response.json(
        { error: "Key parameter is required" },
        { status: 400 }
      );
    }

    // Validate UUID format
    if (!z.string().uuid().safeParse(key).success) {
      return Response.json(
        { error: "Invalid key format. Must be a valid UUID" },
        { status: 400 }
      );
    }

    // Retrieve value from database
    const result = await sql`
      SELECT key, value
      FROM key_value_store
      WHERE key = ${key}
    `;

    if (result.length === 0) {
      return Response.json({ error: "Key not found" }, { status: 404 });
    }

    // Parse stored JSON value
    const storedValue = result[0];

    let isParsed = true;
    let parsed: Record<string, any> = {};

    try {
      parsed = JSON.parse(storedValue.value);
    } catch {
      isParsed = false;
      parsed = storedValue;
    }

    return Response.json({
      parsed: isParsed,
      stored: parsed,
    });
  } catch (error) {
    console.error("Error retrieving value:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
