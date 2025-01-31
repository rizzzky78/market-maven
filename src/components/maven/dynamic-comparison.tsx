import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

interface ProductComparisonProps {
  data: Record<string, any>;
}

export function ProductComparison({ data }: ProductComparisonProps) {
  const { products = [], comparisonSummary = {} } = data.comparison || {};

  const renderDynamicContent = (
    content: Record<string, any> | any[] | any,
    depth = 0
  ) => {
    if (content == null) {
      return <span>N/A</span>;
    }

    if (typeof content !== "object") {
      return <span>{String(content)}</span>;
    }

    if (Array.isArray(content)) {
      return content.length > 0 ? (
        <ul className="list-disc pl-4 space-y-0.5">
          {content.map((item, index) => (
            <li key={index}>{renderDynamicContent(item, depth + 1)}</li>
          ))}
        </ul>
      ) : (
        <span>No items</span>
      );
    }

    return Object.keys(content).length > 0 ? (
      <div className={`space-y-${depth > 0 ? "1" : "3"}`}>
        {Object.entries(content).map(([key, value]) => (
          <div key={key}>
            <h4
              className={`text-sm font-semibold mb-1 capitalize ${
                depth > 0 ? "mt-2" : ""
              }`}
            >
              {key}
            </h4>
            {renderDynamicContent(value, depth + 1)}
          </div>
        ))}
      </div>
    ) : (
      <span>No data available</span>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl text-xs">
      <h1 className="text-lg font-bold text-center mb-4">Product Comparison</h1>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {products.map((product: Record<string, any>) => (
            <Card key={product.id || "unknown"} className="overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground p-2">
                <CardTitle className="text-sm">
                  {product.name || "Unknown Product"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                {renderDynamicContent(product)}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center">No products available for comparison.</p>
      )}

      {Object.keys(comparisonSummary).length > 0 && (
        <Card className="mb-4">
          <CardHeader className="p-2">
            <CardTitle className="text-sm">Comparison Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-3">
            {renderDynamicContent(comparisonSummary)}
          </CardContent>
        </Card>
      )}

      {comparisonSummary.prosAndCons &&
        comparisonSummary.prosAndCons.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {comparisonSummary.prosAndCons.map((item: Record<string, any>) => {
              const product = products.find(
                (p: Record<string, any>) => p.id === item.productId
              );
              return (
                <Card key={item.productId || "unknown"}>
                  <CardHeader className="p-2">
                    <CardTitle className="text-sm">
                      {product?.name || "Unknown Product"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    <div>
                      <h4 className="font-semibold mb-1 flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                        Pros
                      </h4>
                      {renderDynamicContent(item.pros || [])}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 flex items-center">
                        <XCircle className="w-4 h-4 mr-1 text-red-500" />
                        Cons
                      </h4>
                      {renderDynamicContent(item.cons || [])}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
    </div>
  );
}
