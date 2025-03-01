import { NextResponse } from "next/server";
import { getShareAnalytics } from "@/lib/service/share-analytics";

export async function GET() {
  try {
    const analytics = await getShareAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
