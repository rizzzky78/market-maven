import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinalizedCompare, ProductDetails } from "@/lib/types/product";
import { CheckCircle2, XCircle } from "lucide-react";
import React from "react"; // Import React

interface ProductComparisonProps {
  data: FinalizedCompare;
}

export function ProductComparison({ data }: ProductComparisonProps) {
  const {
    products = [],
    comparisonSummary = {
      keyDifferences: [],
      keySimilarities: [],
      prosAndCons: [],
    },
  } = data.comparison || {};

  if (!products.length) {
    return (
      <div className="text-center p-4">
        No product data available for comparison.
      </div>
    );
  }

  const renderSpecifications = (product: ProductDetails) => {
    if (!product.specifications) return null;

    return Object.entries(product.specifications).map(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        return (
          <div key={key}>
            <h4 className="text-sm font-semibold mb-1 capitalize">{key}</h4>
            <dl className="grid grid-cols-3 gap-x-2 gap-y-1">
              {Object.entries(value).map(([subKey, subValue]) => (
                <React.Fragment key={subKey}>
                  <dt className="font-medium col-span-1 capitalize">
                    {subKey}
                  </dt>
                  <dd className="col-span-2">
                    {Array.isArray(subValue)
                      ? subValue.join(", ")
                      : String(subValue)}
                  </dd>
                </React.Fragment>
              ))}
            </dl>
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl text-xs">
      <h1 className="text-lg font-bold text-center mb-4">Product Comparison</h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground p-2">
              <CardTitle className="text-sm">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div>
                <h3 className="text-sm font-semibold mb-1">Key Features</h3>
                <ul className="list-disc pl-4 space-y-0.5">
                  {product.keyFeatures.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              {renderSpecifications(product)}

              {product.warranty && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Warranty</h3>
                  <p>
                    {`${product.warranty.period || ""} ${
                      product.warranty.type || ""
                    } warranty`.trim()}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold mb-1">Price</h3>
                <p>
                  {`${product.price.currency} ${product.price.value.toFixed(
                    2
                  )}`}
                  {product.price.discount &&
                    ` (${product.price.discount}% off)`}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-4">
        <CardHeader className="p-2">
          <CardTitle className="text-sm">Comparison Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          <div>
            <h3 className="text-sm font-semibold mb-1">Key Differences</h3>
            <ul className="list-disc pl-4 space-y-0.5">
              {comparisonSummary.keyDifferences.map((difference, index) => (
                <li key={index}>{difference}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-1">Key Similarities</h3>
            <ul className="list-disc pl-4 space-y-0.5">
              {comparisonSummary.keySimilarities.map((similarity, index) => (
                <li key={index}>{similarity}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {comparisonSummary.prosAndCons.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return (
            <Card key={item.productId}>
              <CardHeader className="p-2">
                <CardTitle className="text-sm">{product?.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                <div>
                  <h4 className="font-semibold mb-1 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                    Pros
                  </h4>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {item.pros.map((pro, index) => (
                      <li key={index}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 flex items-center">
                    <XCircle className="w-4 h-4 mr-1 text-red-500" />
                    Cons
                  </h4>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {item.cons.map((con, index) => (
                      <li key={index}>{con}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
