// app/api/rate/route.ts
import logger from "@/lib/utility/logger";
import { NextRequest, NextResponse } from "next/server";

interface RatingSubmission {
  rating: number;
  comment?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: RatingSubmission = await request.json();

    // Input validation
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    // Here you would typically integrate with your backend/database
    // For this example, we'll just set a cookie to track submission
    const response = NextResponse.json({
      success: true,
      message: "Rating submitted successfully",
    });

    response.cookies.set("marketMavenRatingSubmitted", "true", {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (error) {
    logger.error("Rating submission error:", error);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Check if rating has been submitted
  const hasSubmitted = request.cookies.has("marketMavenRatingSubmitted");

  return NextResponse.json({ hasSubmitted });
}
