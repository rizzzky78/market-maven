"use client";

import { FC, useState } from "react";
import { Star, Code, Lightbulb, Coffee, BookUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Separator } from "../ui/separator";
import Link from "next/link";

const sentiments = [
  "Very Dissatisfied",
  "Dissatisfied",
  "Neutral",
  "Satisfied",
  "Very Satisfied",
];

const motivationStories = [
  "This is my first step into advanced AI technologies.",
  "Developing this application represents my journey from traditional chatbots to innovative AI solutions.",
  "Your feedback could help me secure a meaningful opportunity in tech.",
  "I'm committed to growing my skills and creating impactful applications.",
  "This project is a milestone in my professional development journey.",
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
      <div>
        <Card className="w-full border rounded-3xl max-w-2xl bg-background">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coffee className="w-8 h-8 text-purple-400" />
              <p className="text-white">
                Thank You for Your Support!
                <br />
                <span className="text-white text-sm font-normal">
                  Your feedback is crucial in supporting my professional
                  journey.
                </span>
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-white/90 text-sm">
              By taking a moment to provide feedback, you&apos;re helping me
              move closer to my career goals in technology.
            </p>
            <div className="bg-purple-400/10 p-4 rounded-3xl">
              <p className="italic text-white/80 text-center">
                &quot;Continuous improvement is better than delayed
                perfection.&quot; - Mark Twain
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center justify-center pt-6">
          <Button variant={"outline"} className="text-purple-300 rounded-3xl font-normal">
            <Link href={"/chat"}>Go back to App</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full rounded-3xl bg-background max-w-2xl text-white border">
      <CardHeader className="space-y-4">
        <div className="flex items-center space-x-4">
          <BookUp className="w-10 h-10 text-purple-400" />
          <CardTitle className="text-2xl">Rate MarketMaven</CardTitle>
        </div>
        <Separator />
        <CardDescription className="text-white/80 text-sm lg:text-base">
          Help support a developer&apos;s journey in creating innovative
          AI-integrated applications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none group"
              aria-label={`${sentiments[star - 1]} rating`}
            >
              <Star
                size={40}
                className={`${
                  rating >= star
                    ? "text-purple-400 fill-purple-400"
                    : "text-white/30 group-hover:text-white/60"
                } transition-colors duration-300`}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <div className="flex flex-col items-center space-y-2">
            <Badge
              variant="secondary"
              className="rounded-full px-4 py-1 text-xs"
            >
              {sentiments[rating - 1]}
            </Badge>
            <p className="text-white/80 text-center italic">
              {motivationStories[rating - 1]}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Your detailed feedback can help support my professional growth (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-white/10 border-none text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400"
          />
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-6 h-6 text-purple-400" />
            <p className="text-sm text-white/70">
              Your constructive insights could be instrumental in advancing my
              tech career.
            </p>
          </div>
          <Button
            type="submit"
            className="w-full rounded-full bg-purple-400 hover:bg-purple-500 transition-colors"
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
