"use client";

import { FC, useState } from "react";
import { Star, Coffee } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import useSWRMutation from "swr/mutation";

interface RatingSubmission {
  rating: number;
  comment: string;
}

// Constants
const SENTIMENTS = [
  "Very Dissatisfied",
  "Dissatisfied",
  "Neutral",
  "Satisfied",
  "Very Satisfied",
];

const MOTIVATION_STORIES = [
  "This is my first step into advanced AI technologies.",
  "Developing this application represents my journey from traditional chatbots to innovative AI solutions.",
  "Your feedback could help me secure a meaningful opportunity in tech.",
  "I'm committed to growing my skills and creating impactful applications.",
  "This project is a milestone in my professional development journey.",
];

async function submitRating(url: string, { arg }: { arg: RatingSubmission }) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to submit rating");
  }

  return response.json();
}

// Component props
interface RatingFormProps {
  initialHasSubmitted?: boolean;
}

export const RatingForm: FC<RatingFormProps> = ({
  initialHasSubmitted = false,
}) => {
  // State
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [hasSubmitted, setHasSubmitted] =
    useState<boolean>(initialHasSubmitted);

  // Hooks
  const router = useRouter();

  const { trigger, isMutating, error } = useSWRMutation(
    "/api/ratings",
    submitRating
  );

  // Event handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await trigger({ rating, comment });
      setHasSubmitted(true);
      router.refresh();
    } catch (err) {
      console.error("Error submitting rating:", err);
      alert(error?.message || "Failed to submit rating. Please try again.");
    }
  };

  // Render thank you card after submission
  if (hasSubmitted) {
    return <ThankYouCard />;
  }

  // Render rating form
  return (
    <Card className="max-w-4xl w-full rounded-3xl bg-background text-white border">
      <CardHeader className="space-y-4">
        <div className="flex items-center space-x-4">
          <CardTitle className="text-3xl tracking-wider text-black/90 dark:text-white/90 font-[family-name:var(--font-array)]">
            Rate <span className="text-purple-500 uppercase">Maven AI</span>
          </CardTitle>
        </div>
        <Separator />
        <CardDescription className="font-[family-name:var(--font-khand)] text-black/70 dark:text-white/80 text-lg pb-[60px]">
          Help support a developer&apos;s journey in creating innovative
          AI-integrated applications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <StarRating rating={rating} onChange={setRating} />

        {rating > 0 && (
          <RatingFeedback
            sentiment={SENTIMENTS[rating - 1]}
            story={MOTIVATION_STORIES[rating - 1]}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xl">
          <Textarea
            placeholder="Your detailed feedback can help support my professional growth (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="font-[family-name:var(--font-khand)] text-lg md:text-lg w-full bg-white/10 border-none text-black/90 dark:text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400"
          />
          <div className="flex items-center space-x-2">
            <p className="font-thin font-[family-name:var(--font-khand)] text-lg text-black/70 dark:text-white/70">
              <span className="text-purple-500">*</span> Your constructive
              insights could be instrumental in advancing my tech career.
            </p>
          </div>
          <Button
            type="submit"
            className="font-[family-name:var(--font-khand)] text-2xl p-[30px] w-full rounded-full bg-purple-400 hover:bg-purple-500 transition-colors"
            disabled={rating === 0 || isMutating}
          >
            {isMutating ? "Submitting..." : "Submit Rating"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Sub-components
const StarRating: FC<{
  rating: number;
  onChange: (rating: number) => void;
}> = ({ rating, onChange }) => {
  return (
    <div className="flex justify-center space-x-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none group"
          aria-label={`${SENTIMENTS[star - 1]} rating`}
        >
          <Star
            size={40}
            className={`${
              rating >= star
                ? "text-purple-400 fill-purple-400"
                : "text-black/50 dark:text-white/30 group-hover:text-purple-400/60"
            } transition-colors duration-300`}
          />
        </button>
      ))}
    </div>
  );
};

const RatingFeedback: FC<{
  sentiment: string;
  story: string;
}> = ({ sentiment, story }) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <Badge
        variant="secondary"
        className="rounded-full px-4 py-1 text-xl font-normal font-[family-name:var(--font-khand)]"
      >
        {sentiment}
      </Badge>
      <p className="font-[family-name:var(--font-khand)] text-black/80 dark:text-white/80 text-center italic text-lg">
        {story}
      </p>
    </div>
  );
};

const ThankYouCard: FC = () => {
  return (
    <div className="max-w-5xl">
      <Card className="w-full max-w-4xl border rounded-none bg-background">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coffee className="size-[50px] text-purple-400" />
            <div className="w-full flex flex-col">
              <p className="text-5xl text-black/80 dark:text-white/90 font-[family-name:var(--font-array)]">
                Thank You for Your{" "}
                <span className="text-purple-500">Support!</span>
              </p>
              <p className="text-black/70 dark:text-white/70 text-xl font-normal font-[family-name:var(--font-khand)]">
                Your feedback is crucial in supporting my professional journey.
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-purple-400/10 p-4 rounded-none">
            <p className="font-[family-name:var(--font-khand)] text-lg italic text-black/80 dark:text-white/80 text-center">
              &quot;Continuous improvement is better than delayed
              perfection.&quot; - Mark Twain
            </p>
          </div>
        </CardContent>
      </Card>
      <div className="pt-[100px] flex items-center justify-center font-[family-name:var(--font-khand)]">
        <Button
          variant="outline"
          className="text-purple-500 dark:text-purple-300 rounded-full p-[30px] text-2xl font-normal"
        >
          <Link href="/chat">Go back to App</Link>
        </Button>
      </div>
    </div>
  );
};
