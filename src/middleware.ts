import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // other configfurations here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = { matcher: ["/chat", "/chat/:path*"] };
