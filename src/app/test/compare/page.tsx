"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircleArrowRight, Search, Smartphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
export default function PhoneRecommendations() {
  const [searching, setSearching] = useState<string | null>(null);

  const recommendations = {
    recommendation: [
      {
        name: "Samsung Galaxy S23 Ultra",
        productModel: "S23 Ultra",
        brand: "Samsung",
      },
      {
        name: "Google Pixel 7 Pro",
        productModel: "Pixel 7 Pro",
        brand: "Google",
      },
      {
        name: "Apple iPhone 14 Pro",
        productModel: "iPhone 14 Pro",
        brand: "Apple",
      },
      {
        name: "OnePlus 11",
        productModel: "11",
        brand: "OnePlus",
      },
    ],
  };

  const handleSearch = (phone: (typeof recommendations.recommendation)[0]) => {
    setSearching(phone.name);

    // Simulate search action
    setTimeout(() => {
      setSearching(null);
      toast(`Searched for ${phone.name}`);
    }, 1000);

    // In a real application, you would perform an actual search here
    console.log(
      `Searching for ${phone.name} (${phone.productModel}) by ${phone.brand}`
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {recommendations.recommendation.map((phone, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto py-3 px-4 flex flex-col items-start justify-between gap-2 hover:bg-secondary transition-colors rounded-3xl"
            onClick={() => handleSearch(phone)}
            disabled={searching === phone.name}
          >
            <div className="flex w-full items-center justify-between">
              <Badge variant="secondary" className="text-xs font-medium">
                {phone.brand}
              </Badge>
              {searching === phone.name ? (
                <div className="animate-spin">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
              ) : (
                <CircleArrowRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">{phone.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Model: {phone.productModel}
              </p>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
