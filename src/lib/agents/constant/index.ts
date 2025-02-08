const SearchProductDescription = `Search a product based on user query. The query must be exact of product name (can be full or partial product name), cannot proceed word or sentence.`;

const GetProductDetailsDescription = `Get product details by given query and link`;

const ExtractionOjective = `Extract only product data including: product images, product link, and store link.`;

const ExtractionDetails = `Extract the product description with a full details. This also includes product ratings which include images and comments (if any) with a maximum of 5 product rating data (take the rating that is most helpful to the user).`;

const PRODUCTS_COMPARISON_DESCRIPTION = `Compare two products based on user requested data`;

const INQUIRE_USER_DESCIRPTION = `Inquire the user if current provided context is not enough to take an further action`;

export const TEMPLATE = {
  SearchProductDescription,
  GetProductDetailsDescription,
  ExtractionOjective,
  ExtractionDetails,
  PRODUCTS_COMPARISON_DESCRIPTION,
  INQUIRE_USER_DESCIRPTION,
} as const;
