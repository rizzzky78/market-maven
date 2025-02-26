import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Smartphone } from "lucide-react";

export default function PhoneRecommendations() {
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

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {recommendations.recommendation.map((phone, index) => (
          <Card
            key={index}
            className="overflow-hidden rounded-3xl bg-background"
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between">
                <Badge variant={'secondary'} className="text-xs font-medium">
                  {phone.brand}
                </Badge>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <h3 className="font-semibold text-sm">{phone.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Model: {phone.productModel}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
