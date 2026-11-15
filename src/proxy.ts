import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Validates the Better Auth session (Node.js runtime) and sends signed-out
// visitors of app pages to the login page.
export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/chat",
    "/chat/:path*",
    "/chat/c",
    "/chat/c/:id",
    "/history",
    "/rate-app",
  ],
};
