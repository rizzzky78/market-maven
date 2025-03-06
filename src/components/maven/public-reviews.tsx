"use client";

import { FC, useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Rating } from "@/lib/types/neon";

// Mockup data for demonstration
const mockRatings: Rating[] = [
  {
    id: 1,
    username: "Sarah Johnson",
    rating: 5,
    comment:
      "Absolutely love this product! It exceeded all my expectations and the quality is outstanding. Would definitely recommend to friends and family.",
    created_at: "2023-11-15T14:22:30Z",
  },
  {
    id: 2,
    username: "Michael Chen",
    rating: 4,
    comment:
      "Great product overall. The only reason I'm not giving 5 stars is because shipping took a bit longer than expected. Otherwise, very satisfied with my purchase.",
    created_at: "2023-11-10T09:15:45Z",
  },
  {
    id: 3,
    username: "Emily Rodriguez",
    rating: 5,
    comment:
      "This is exactly what I was looking for! Perfect size, great functionality, and the design is beautiful. Will definitely be purchasing again.",
    created_at: "2023-11-05T18:30:12Z",
  },
  {
    id: 4,
    username: "David Kim",
    rating: 3,
    comment:
      "Decent product for the price. It works as advertised, but I think there's room for improvement in terms of durability. Still, it serves its purpose well.",
    created_at: "2023-10-28T11:45:22Z",
  },
  {
    id: 5,
    username: "Jessica Patel",
    rating: 5,
    comment:
      "I've tried many similar products before, but this one is by far the best! The attention to detail is impressive and it's clear that a lot of thought went into the design.",
    created_at: "2023-10-22T15:10:38Z",
  },
  {
    id: 6,
    username: "Robert Wilson",
    rating: 4,
    comment:
      "Very happy with my purchase. The product is well-made and functions exactly as described. Customer service was also very helpful when I had questions.",
    created_at: "2023-10-18T08:55:19Z",
  },
  {
    id: 7,
    username: "Amanda Lee",
    rating: 2,
    comment:
      "Unfortunately, this didn't quite meet my expectations. The material feels a bit cheap and it's not as durable as I had hoped. On the positive side, the design is nice.",
    created_at: "2023-10-12T13:20:45Z",
  },
  {
    id: 8,
    username: "Thomas Garcia",
    rating: 5,
    comment:
      "Exceptional quality and value for money! This product has made my daily routine so much easier. I'm already thinking about buying another one as a gift.",
    created_at: "2023-10-05T16:40:30Z",
  },
  {
    id: 9,
    username: "Olivia Martinez",
    rating: 4,
    comment:
      "I'm really impressed with the quality and functionality. It's intuitive to use and has all the features I was looking for. Shipping was fast too!",
    created_at: "2023-10-01T10:25:15Z",
  },
  {
    id: 10,
    username: "James Taylor",
    rating: 5,
    comment:
      "Best purchase I've made this year! The product is sturdy, well-designed, and performs flawlessly. Customer service was also excellent when I had a question.",
    created_at: "2023-09-25T14:50:33Z",
  },
  {
    id: 11,
    username: "Sophia Brown",
    rating: 3,
    comment:
      "It's a good product that does what it promises. I'm giving it 3 stars because I think the price could be a bit lower for what you get, but overall I'm satisfied.",
    created_at: "2023-09-20T09:15:40Z",
  },
  {
    id: 12,
    username: "Daniel White",
    rating: 5,
    comment:
      "Absolutely fantastic! The attention to detail is impressive and it's clear that a lot of thought went into creating this product. Highly recommend!",
    created_at: "2023-09-15T16:30:22Z",
  },
];

// Fetch function for SWR with fallback to mockup data
const fetcher = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Failed to fetch ratings");
    }
    return res.json();
  } catch {
    console.log("Using mockup data instead of API");
    return mockRatings;
  }
};

export const PublicReviews: FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Use SWR for data fetching with caching and fallback to mockup data
  const { data: allRatings, isLoading } = useSWR<Rating[]>(
    "/api/ratings",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 60000, // 1 minute,
      fallbackData: mockRatings,
    }
  );

  // Calculate pagination values
  const totalItems = allRatings?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page items
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRatings = allRatings?.slice(startIndex, endIndex) || [];

  // Handle page changes
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of ratings section
      // window.scrollTo({
      //   top: document.getElementById("ratings-gallery")?.offsetTop || 0,
      //   behavior: "smooth",
      // });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div
      id="ratings-gallery"
      className="px-4 lg:px-0 max-w-5xl pt-[16vh] lg:pt-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold text-purple-500">
          Public Reviews
          <br />
          <span className="text-sm text-muted-foreground font-normal">
            Note: This section are still under construction.
          </span>
        </h2>
        <p className="text-muted-foreground text-sm">
          Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{" "}
          {totalItems} reviews
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {currentRatings.map((rating, index) => (
            <RatingCard key={rating.id} rating={rating} index={index} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination controls */}
      <div className="flex justify-center items-center mt-8 gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="rounded-l-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-1">
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;
            // Show first page, last page, current page, and pages around current page
            if (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNumber)}
                  className="w-9 h-9"
                  aria-label={`Page ${pageNumber}`}
                  aria-current={currentPage === pageNumber ? "page" : undefined}
                >
                  {pageNumber}
                </Button>
              );
            } else if (
              (pageNumber === currentPage - 2 && currentPage > 3) ||
              (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
            ) {
              // Show ellipsis for skipped pages
              return (
                <Button
                  key={`ellipsis-${pageNumber}`}
                  variant="outline"
                  size="sm"
                  disabled
                  className="w-9 h-9"
                >
                  ...
                </Button>
              );
            }
            return null;
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="rounded-r-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

function RatingCard({ rating, index }: { rating: Rating; index: number }) {
  // Animation variants for staggered appearance
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Format date
  const formattedDate = formatDistanceToNow(new Date(rating.created_at), {
    addSuffix: true,
  });

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover={{ scale: 1.03 }}
      className="h-full"
    >
      <Card className="h-full w-full flex flex-col bg-background rounded-3xl">
        <CardContent className="pt-6 flex-grow -mb-2">
          <div className="flex items-center gap-3 mb-2">
            <Avatar>
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${rating.username}`}
                alt={rating.username}
              />
              <AvatarFallback>{getInitials(rating.username)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-black/90 dark:text-white/90">
                {rating.username}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating.rating
                        ? "fill-purple-500 text-purple-500"
                        : "fill-muted text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm tect-black/80 dark:text-white/80">
            {rating.comment}
          </p>
        </CardContent>
        <CardFooter className="">
          <div className="flex justify-between items-center w-full">
            <Badge
              variant={"secondary"}
              className="font-normal rounded-full py-1"
            >
              {formattedDate}
            </Badge>
            <span className="text-xs text-muted-foreground">#{rating.id}</span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
