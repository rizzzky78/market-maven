export type Store = {
  name: string;
  location: string;
  isOfficial: boolean;
};

export type Product = {
  title: string;
  image: string;
  price: string;
  rating: string | null;
  sold: string | null;
  link: string;
  store: Store;
};

export type ProductsResponse = {
  callId: string;
  screenshot: string;
  data: Product[];
};

export type ProductDetailsResponse = {
  callId: string;
  screenshot: string;
  externalData: { tavily: string | null; markdown: string | null };
  productDetails: Record<string, any>;
};

export type ProductsComparisonResponse = {
  callId: string;
  productImages: string[];
  comparison: Record<string, any>;
};
