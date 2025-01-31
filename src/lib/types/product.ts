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
  data: Product[];
  screenshot?: string;
};

export interface ProductDetails {
  id: string;
  name: string;
  brand: string;
  model?: string;
  category: string;
  subCategory?: string;
  keyFeatures: string[];
  specifications?: {
    processor?: {
      brand?: string;
      model?: string;
      clockSpeed?: string;
      cores?: number;
    };
    memory?: {
      ramSize?: string;
      type?: string;
      speed?: string;
    };
    storage?: {
      capacity?: string;
      type?: string;
    };
    display?: {
      size?: string;
      resolution?: string;
      panelType?: string;
      refreshRate?: string;
    };
    battery?: {
      capacity?: string;
      fastCharging?: boolean;
    };
    connectivity?: {
      wireless?: string[];
      ports?: string[];
    };
  };
  warranty?: {
    period?: string;
    type?: string;
  };
  price: {
    value: number;
    currency: string;
    discount?: number;
  };
}

export interface ProsCons {
  productId: string;
  pros: string[];
  cons: string[];
}

export interface ComparisonSummary {
  keyDifferences: string[];
  keySimilarities: string[];
  prosAndCons: ProsCons[];
}

export interface ProductComparison {
  products: Product[];
  comparisonSummary: ComparisonSummary;
}

export interface FinalizedCompare {
  callId: string;
  comparison: ProductComparison;
}
