import { Card, CardContent } from "@/components/ui/card";

export function ProductCardSkeleton() {
  return (
    <div className="max-w-[250px] w-full mx-auto">
      <Card
        className={`overflow-hidden border bg-card h-full flex flex-col rounded-xl shadow-none`}
      >
        <CardContent className="p-0 grow relative">
          <div className="w-full h-40 bg-muted animate-pulse" />
          <div className="absolute top-2 right-2 bg-muted animate-pulse p-1 rounded-lg">
            <div className="w-5 h-5 bg-muted rounded-full" />
          </div>
          <div className="px-3 py-2 space-y-1">
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-muted rounded-full animate-pulse" />
              <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-muted rounded-full animate-pulse" />
              <div className="h-3 bg-muted rounded w-1/3 animate-pulse" />
              <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
            </div>
          </div>
          <div className={`px-3 py-2`}>
            <div className="flex items-start space-x-1 mb-1">
              <div className="w-3 h-3 bg-muted rounded-full animate-pulse" />
              <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
            </div>
            <div className="flex items-start space-x-1">
              <div className="w-3 h-3 bg-muted rounded-full animate-pulse" />
              <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
