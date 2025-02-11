import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { createShare } from "@/lib/service/share-analytics";
import { createShareURL } from "@/lib/service/share";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { componentId, componentType } = await request.json();

    const referenceId = await createShare(
      session.user.email!,
      componentId,
      componentType
    );

    const shareUrl = createShareURL(
      process.env.NEXT_PUBLIC_APP_URL!,
      componentType,
      componentId,
      referenceId
    );

    return NextResponse.json({ shareUrl });
  } catch (error) {
    console.error("Share creation error:", error);
    return NextResponse.json(
      { error: "Failed to create share" },
      { status: 500 }
    );
  }
}
