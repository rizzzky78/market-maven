const SearchProductDescription = `Search a product based on user query. The query must be exact of product name (can be full or partial product name), cannot proceed word or sentence.`;

const ExtractionOjective = `Extract only product data including: product images, product link, and store link.`;

export const root = {
  SearchProductDescription,
  ExtractionOjective,
} as const;
