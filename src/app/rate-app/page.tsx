// app/rate-app/page.tsx
import { cookies } from "next/headers";
import RatingForm from "./rating-form";

export default async function RatingPage() {
  // Check if rating has been submitted via server-side cookie check
  const cookie = await cookies();
  const hasSubmitted = cookie.has("marketMavenRatingSubmitted");

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <RatingForm initialHasSubmitted={hasSubmitted} />
    </div>
  );
}
