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
  callId?: string;
  screenshot?: string;
  data: Product[];
};

export type ProductDetailsResponse = {
  callId?: string;
  screenshot?: string;
  productDetails: Record<string, any>;
};

export type ProductsComparisonResponse = {
  callId?: string;
  productImages?: string[];
  comparison: Record<string, any>;
};

export type ProductSpecifications = {
  brand?: string;
  model?: string;
  category?:
    | "smartphone"
    | "laptop"
    | "tv"
    | "tablet"
    | "wearable"
    | "audio"
    | "camera"
    | "accessory";
  releaseDate?: string; // ISO 8601 format
  specifications?: Specifications;
};

export type Specifications = {
  general?: GeneralSpecifications;
  display?: DisplaySpecifications;
  performance?: PerformanceSpecifications;
  battery?: BatterySpecifications;
  connectivity?: ConnectivitySpecifications;
  camera?: CameraSpecifications;
  os?: string;
  additionalFeatures?: AdditionalFeatures;
};

export type GeneralSpecifications = {
  weight?: string;
  dimensions?: string;
  color?: string;
  material?: string;
};

export type DisplaySpecifications = {
  size?: string;
  resolution?: string;
  type?: string;
  refreshRate?: string;
};

export type PerformanceSpecifications = {
  processor?: string;
  ram?: string;
  storage?: string;
  gpu?: string;
};

export type BatterySpecifications = {
  capacity?: string;
  type?: string;
  charging?: string;
};

export type ConnectivitySpecifications = {
  wifi?: string;
  bluetooth?: string;
  ports?: string[];
  cellular?: string;
};

export type CameraSpecifications = {
  rear?: string;
  front?: string;
  video?: string;
};

export type AdditionalFeatures = {
  waterResistance?: string;
  biometrics?: string[];
  audio?: string;
};
