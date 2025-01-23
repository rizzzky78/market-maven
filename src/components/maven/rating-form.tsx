// app/rate-app/rating-form.tsx
"use client";

import { FC, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

const sentiments = [
  "Very Dissatisfied",
  "Dissatisfied",
  "Neutral",
  "Satisfied",
  "Very Satisfied",
];

interface RatingFormProps {
  initialHasSubmitted: boolean;
}

export const RatingForm: FC<RatingFormProps> = ({ initialHasSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(initialHasSubmitted);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/rate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, comment }),
      });

      const result = await response.json();

      if (response.ok) {
        setHasSubmitted(true);
        router.refresh();
      } else {
        // Handle submission error
        console.error(result.error);
        alert(result.error || "Submission failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasSubmitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Thank You!</CardTitle>
          <CardDescription>
            You have already submitted your assessment for MarketMaven.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            We appreciate your feedback.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Rate MarketMaven</CardTitle>
        <CardDescription>
          How satisfied are you with our application?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
              aria-label={`${sentiments[star - 1]} rating`}
            >
              <Star
                size={32}
                className={`${
                  rating >= star
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                } hover:text-yellow-400 transition-colors`}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="text-center font-medium text-gray-700">
            {sentiments[rating - 1]}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Additional comments (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full"
          />
          <Button
            type="submit"
            className="w-full"
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
