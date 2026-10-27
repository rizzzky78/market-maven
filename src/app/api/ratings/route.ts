import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/database/prisma";
import { Rating } from "@/lib/types/neon";

// GET handler to retrieve ratings
export async function GET() {
  try {
    const rows = await prisma.rating.findMany({
      select: {
        id: true,
        username: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // The reviews UI reads snake_case `created_at`.
    const ratings: Rating[] = rows.map(({ createdAt, ...row }) => ({
      ...row,
      created_at: createdAt.toISOString(),
    }));

    const response = NextResponse.json(ratings, { status: 200 });

    response.cookies.set("rating_has_submitted", "true", {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { message: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}

// POST handler to submit a new rating
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const { rating, comment } = await request.json();

    // Basic validation
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Get user information from session or use provided values
    const username = session?.user?.name || "anonymous";
    const email = session?.user?.email || "anonymous@example.com";

    // Insert the rating into the database
    const { id } = await prisma.rating.create({
      data: { username, email, rating, comment },
      select: { id: true },
    });

    return NextResponse.json(
      { message: "Rating submitted successfully", id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { message: "Failed to submit rating" },
      { status: 500 }
    );
  }
}
