// app/api/ratings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { sql } from "@/database/neon";
import { Rating } from "@/lib/types/neon";

// GET handler to retrieve ratings
export async function GET() {
  try {
    const ratings = (await sql`
      SELECT id, username, rating, comment, created_at 
      FROM ratings 
      ORDER BY created_at DESC
    `) as Rating[];

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
    const session = await getServerSession();
    const { rating, comment } = await request.json();

    // Basic validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Get user information from session or use provided values
    const username = session?.user?.name || "anonymous";
    const email = session?.user?.email || "anonymous@example.com";

    // Insert the rating into the database
    const result = await sql`
      INSERT INTO ratings (username, email, rating, comment)
      VALUES (${username}, ${email}, ${rating}, ${comment})
      RETURNING id
    `;

    return NextResponse.json(
      { message: "Rating submitted successfully", id: result[0].id },
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
