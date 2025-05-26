/* eslint-disable @next/next/no-img-element */
import React from "react";

// Re-defining interfaces with all properties optional
interface Sitelink {
  title?: string;
  link?: string;
}

interface OrganicResult {
  title?: string;
  link?: string;
  snippet?: string;
  rating?: number;
  ratingCount?: number;
  position?: number;
  sitelinks?: Sitelink[];
  date?: string;
}

interface SearchParameters {
  q?: string;
  gl?: string;
  type?: string;
  engine?: string;
  num?: number;
}

interface WebPayload {
  searchParameters?: SearchParameters;
  organic?: OrganicResult[];
  peopleAlsoAsk?: PeopleAlsoAsk[];
  relatedSearches?: RelatedSearch[];
  credits?: number;
}

interface PeopleAlsoAsk {
  question?: string;
  snippet?: string;
  title?: string;
  link?: string;
}

interface RelatedSearch {
  query?: string;
}

interface ShoppingItem {
  title?: string;
  source?: string;
  link?: string;
  price?: string;
  delivery?: string;
  imageUrl?: string;
  rating?: number;
  ratingCount?: number;
  position?: number;
  offers?: string;
  productId?: string;
}

interface ShoppingPayload {
  searchParameters?: SearchParameters;
  shopping?: ShoppingItem[];
  credits?: number;
}

interface ImageItem {
  title?: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  thumbnailUrl?: string;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  source?: string;
  domain?: string;
  link?: string;
  googleUrl?: string;
  position?: number;
}

interface ImagePayload {
  searchParameters?: SearchParameters;
  images?: ImageItem[];
  credits?: number;
}

interface VideoItem {
  title?: string;
  link?: string;
  snippet?: string;
  imageUrl?: string;
  videoUrl?: string;
  duration?: string;
  source?: string;
  channel?: string;
  date?: string;
  position?: number;
}

interface VideoPayload {
  searchParameters?: SearchParameters;
  videos?: VideoItem[];
  credits?: number;
}

interface PayloadDataset {
  web?: WebPayload;
  shopping?: ShoppingPayload;
  image?: ImagePayload;
  videos?: VideoPayload;
}

interface RootObject {
  query?: string;
  payloadDataset?: PayloadDataset;
}

// Component for displaying Web Payload data
const WebPayloadDisplay: React.FC<{ data?: WebPayload }> = ({ data }) => (
  <div className="p-2 bg-gray-50 rounded-md shadow-sm">
    <h3 className="text-base font-semibold text-gray-800 mb-2">Web Results</h3>
    {data?.searchParameters?.q && (
      <p className="text-xs text-gray-600 mb-2">
        Query: {data.searchParameters.q}
      </p>
    )}
    <div className="space-y-2">
      {data?.organic && data.organic.length > 0 && (
        <>
          <h4 className="text-sm font-medium text-gray-700">
            Organic Results:
          </h4>
          {data.organic.map((item, index) => (
            <div
              key={index}
              className="p-2 bg-white rounded-sm shadow-sm border border-gray-200"
            >
              {item.link && item.title && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium text-sm"
                >
                  {item.title}
                </a>
              )}
              {item.snippet && (
                <p className="text-xs text-gray-700 mt-1">{item.snippet}</p>
              )}
              {item.rating && (
                <p className="text-xs text-gray-500 mt-1">
                  Rating: {item.rating} ({item.ratingCount})
                </p>
              )}
              {item.sitelinks && item.sitelinks.length > 0 && (
                <div className="mt-1 text-xs text-gray-600">
                  Sitelinks:{" "}
                  {item.sitelinks
                    .map((s) => s.title)
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {data?.peopleAlsoAsk && data.peopleAlsoAsk.length > 0 && (
        <>
          <h4 className="text-sm font-medium text-gray-700 mt-3">
            People Also Ask:
          </h4>
          {data.peopleAlsoAsk.map((item, index) => (
            <div
              key={index}
              className="p-2 bg-white rounded-sm shadow-sm border border-gray-200"
            >
              {item.question && (
                <p className="font-medium text-gray-800 text-sm">
                  {item.question}
                </p>
              )}
              {item.snippet && (
                <p className="text-xs text-gray-700 mt-1">{item.snippet}</p>
              )}
              {item.link && item.title && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs mt-1 block"
                >
                  Source: {item.title}
                </a>
              )}
            </div>
          ))}
        </>
      )}

      {data?.relatedSearches && data.relatedSearches.length > 0 && (
        <>
          <h4 className="text-sm font-medium text-gray-700 mt-3">
            Related Searches:
          </h4>
          <div className="flex flex-wrap gap-1">
            {data.relatedSearches.map(
              (item, index) =>
                item.query && (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full"
                  >
                    {item.query}
                  </span>
                )
            )}
          </div>
        </>
      )}
    </div>
  </div>
);

// Component for displaying Shopping Payload data
const ShoppingPayloadDisplay: React.FC<{ data?: ShoppingPayload }> = ({
  data,
}) => (
  <div className="p-2 bg-gray-50 rounded-md shadow-sm">
    <h3 className="text-base font-semibold text-gray-800 mb-2">
      Shopping Results
    </h3>
    <div className="grid grid-cols-2 gap-2">
      {data?.shopping &&
        data.shopping.map((item, index) => (
          <div
            key={index}
            className="p-2 bg-white rounded-sm shadow-sm border border-gray-200 flex flex-col items-center text-center"
          >
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.title || "Product image"}
                className="w-20 h-20 object-contain rounded-sm mb-1"
              />
            )}
            {item.link && item.title && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium text-xs"
              >
                {item.title}
              </a>
            )}
            {item.price && (
              <p className="text-gray-800 font-bold text-sm mt-1">
                {item.price}
              </p>
            )}
            {(item.source || item.delivery) && (
              <p className="text-xs text-gray-600">
                {item.source} {item.delivery ? `- ${item.delivery}` : ""}
              </p>
            )}
            {item.rating && (
              <p className="text-xs text-gray-500 mt-1">
                Rating: {item.rating} ({item.ratingCount})
              </p>
            )}
          </div>
        ))}
    </div>
  </div>
);

// Component for displaying Image Payload data
const ImagePayloadDisplay: React.FC<{ data?: ImagePayload }> = ({ data }) => (
  <div className="p-2 bg-gray-50 rounded-md shadow-sm">
    <h3 className="text-base font-semibold text-gray-800 mb-2">
      Image Results
    </h3>
    <div className="grid grid-cols-3 gap-2">
      {data?.images &&
        data.images.map((item, index) => (
          <div
            key={index}
            className="p-1 bg-white rounded-sm shadow-sm border border-gray-200 flex flex-col items-center text-center"
          >
            {item.thumbnailUrl && (
              <img
                src={item.thumbnailUrl}
                alt={item.title || "Image thumbnail"}
                className="w-full h-20 object-cover rounded-sm mb-1"
              />
            )}
            {item.link && item.title && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-xs"
              >
                {item.title}
              </a>
            )}
            {item.source && (
              <p className="text-xs text-gray-500 mt-1">{item.source}</p>
            )}
          </div>
        ))}
    </div>
  </div>
);

// Component for displaying Video Payload data
const VideoPayloadDisplay: React.FC<{ data?: VideoPayload }> = ({ data }) => (
  <div className="p-2 bg-gray-50 rounded-md shadow-sm">
    <h3 className="text-base font-semibold text-gray-800 mb-2">
      Video Results
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {data?.videos &&
        data.videos.map((item, index) => (
          <div
            key={index}
            className="p-2 bg-white rounded-sm shadow-sm border border-gray-200 flex flex-col"
          >
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.title || "Video thumbnail"}
                className="w-[120px] h-[60px] object-cover rounded-sm mb-1"
              />
            )}
            {item.link && item.title && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium text-sm"
              >
                {item.title}
              </a>
            )}
            {item.snippet && (
              <p className="text-xs text-gray-700 mt-1 line-clamp-2">
                {item.snippet}
              </p>
            )}
            {(item.channel || item.duration || item.date) && (
              <p className="text-xs text-gray-500 mt-1">
                {item.channel} {item.duration ? `- ${item.duration}` : ""}{" "}
                {item.date ? `- ${item.date}` : ""}
              </p>
            )}
          </div>
        ))}
    </div>
  </div>
);

export const SerperAPIResult: React.FC<{ data: RootObject }> = ({ data }) => {
  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="max-w-full bg-white rounded-lg shadow-lg p-4 space-y-4">
        {/* Web Payload Section */}
        {data.payloadDataset?.web && (
          <section className="border-b pb-4 border-gray-200">
            <WebPayloadDisplay data={data.payloadDataset.web} />
          </section>
        )}

        {/* Shopping Payload Section */}
        {data.payloadDataset?.shopping && (
          <section className="border-b pb-4 border-gray-200">
            <ShoppingPayloadDisplay data={data.payloadDataset.shopping} />
          </section>
        )}

        {/* Image Payload Section */}
        {data.payloadDataset?.image && (
          <section className="border-b pb-4 border-gray-200">
            <ImagePayloadDisplay data={data.payloadDataset.image} />
          </section>
        )}

        {/* Video Payload Section */}
        {data.payloadDataset?.videos && (
          <section>
            <VideoPayloadDisplay data={data.payloadDataset.videos} />
          </section>
        )}
      </div>
    </div>
  );
};
