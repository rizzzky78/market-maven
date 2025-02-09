import { ShareNotFound } from "@/components/maven/share-not-found";
import { z } from "zod";

// Define the allowed types
const allowedTypes = [
  "product-search",
  "product-details",
  "products-comparison",
  "public-chat",
] as const;
type AllowedType = (typeof allowedTypes)[number];

// Zod schema for UUID v4
const uuidV4Schema = z.string().uuid();

// Define props type
type SharePageProps = {
  searchParams: {
    type?: string;
    "component-id"?: string;
  };
};

export default async function SharePage({ searchParams }: SharePageProps) {
  // Await the searchParams
  const { type, "component-id": componentId } = await searchParams;

  // Validate type and component-id
  const isValidType = type && allowedTypes.includes(type as AllowedType);
  const isValidComponentId =
    componentId && uuidV4Schema.safeParse(componentId).success;

  // If either parameter is invalid, render the CustomNotFound component
  if (!isValidType || !isValidComponentId) {
    return <ShareNotFound />;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-lg sm:text-xl font-bold mb-4">Share Page</h1>
      <div className="bg-white p-4 rounded-md shadow-sm">
        <p className="text-sm mb-2">
          <strong>Type:</strong> {type}
        </p>
        <p className="text-sm">
          <strong>Component ID:</strong> {componentId}
        </p>
      </div>
    </div>
  );
}
