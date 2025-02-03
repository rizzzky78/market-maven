import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storeValueSchema } from "@/lib/types/neon";
import {
  retrieveKeyValue,
  storeKeyValue,
} from "@/lib/service/key-value-service";
import logger from "@/lib/utility/logger";

const ERROR_MESSAGE = {
  INVALID_REQUEST: "Invalid request data",
  KEY_EXISTS: "Key already exists",
  KEY_REQUIRED: "Key parameter is required",
  INVALID_UUID: "Invalid key format. Must be a valid UUID",
  KEY_NOT_FOUND: "Key not found",
  INTERNAL_ERROR: "Internal server error",
} as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = storeValueSchema.parse(body);

    const stored = await storeKeyValue(validatedData);

    logger.info("Success storing value", { key: validatedData.key });

    return NextResponse.json(
      { message: "Value stored successfully", stored },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error("Validation error in POST request", {
        errors: error.errors,
        operation: "validate",
      });

      return NextResponse.json(
        {
          error: ERROR_MESSAGE.INVALID_REQUEST,
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("duplicate key")) {
      logger.error("Duplicate key error", {
        error: error.message,
        operation: "store",
      });

      return NextResponse.json(
        { error: ERROR_MESSAGE.KEY_EXISTS },
        { status: 409 }
      );
    }

    logger.error("Unexpected error in POST request", {
      error: (error as Error).message,
      operation: "store",
    });

    return NextResponse.json(
      { error: ERROR_MESSAGE.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      logger.warn("Missing key parameter", { operation: "retrieve" });

      return NextResponse.json(
        { error: ERROR_MESSAGE.KEY_REQUIRED },
        { status: 400 }
      );
    }

    if (!z.string().uuid().safeParse(key).success) {
      logger.warn("Invalid UUID format", {
        key,
        operation: "validate",
      });

      return NextResponse.json(
        { error: ERROR_MESSAGE.INVALID_UUID },
        { status: 400 }
      );
    }

    const result = await retrieveKeyValue({ key });

    if (!result) {
      logger.info("Key not found", { key, operation: "retrieve" });

      return NextResponse.json(
        { error: ERROR_MESSAGE.KEY_NOT_FOUND },
        { status: 404 }
      );
    }

    logger.info("Success retrieving value", { key, operation: "retrieve" });

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Unexpected error in GET request", {
      error: (error as Error).message,
      operation: "retrieve",
    });

    return NextResponse.json(
      { error: ERROR_MESSAGE.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}
