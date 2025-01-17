import { DeepPartial } from "ai";
import { z } from "zod";

/**
 * Schema for basic product information.
 * Contains essential details such as product name, brand, price, and stock.
 */
const product_basic_info = z
  .object({
    product_name: z
      .string()
      .describe(
        "Full product name including key specifications and model - this should be detailed enough for product identification"
      ),
    product_brand: z
      .string()
      .describe(
        "Brand/manufacturer name of the product - should be standardized across all products"
      ),
    product_model: z
      .string()
      .optional()
      .describe(
        "Specific model identifier or number - may not be available for all products"
      ),
    product_price: z
      .string()
      .describe(
        "Current selling price including currency symbol - format: 'Rp123.456'"
      ),
    product_original_price: z
      .string()
      .optional()
      .describe("Original price before any discounts - format: 'Rp123.456'"),
    product_discount: z
      .string()
      .optional()
      .describe("Discount percentage if available - format: '15%'"),
    product_condition: z
      .string()
      .describe("Product condition: 'Baru' (New) or 'Bekas' (Used)"),
    product_stock: z
      .string()
      .or(z.number())
      .describe("Available stock quantity - can be number or string format"),
    product_min_order: z
      .string()
      .describe("Minimum order quantity - format: '1 Buah'"),
    product_category: z
      .string()
      .optional()
      .describe(
        "Product category or etalase name - helps in product classification"
      ),
  })
  .describe(
    "Contains essential product information displayed at the top of product page"
  );

// Product Specifications
const product_specs = z
  .object({
    specs_list: z.array(
      z.object({
        spec_name: z
          .string()
          .describe(
            "Technical specification name - should use standardized naming"
          ),
        spec_value: z
          .string()
          .or(z.number())
          .or(z.boolean())
          .nullable()
          .describe(
            "Specification value - can be string, number, boolean, or null if not applicable"
          ),
      })
    ),
  })
  .describe(
    "Technical specifications in a consistent, structured format for easy display"
  );

// Product Features
const product_features = z
  .object({
    features_list: z.array(
      z
        .string()
        .describe(
          "Individual feature description - should be clear and concise"
        )
    ),
  })
  .describe("Key product features and highlights");

// Product Package
const product_package = z
  .object({
    package_items: z.array(
      z
        .string()
        .describe(
          "Individual item included in the package - standardized naming recommended"
        )
    ),
  })
  .describe("Items included in the product package");

// Product Ratings Summary
const product_rating_summary = z
  .object({
    rating_overall: z
      .string()
      .describe("Average rating score - format: '4.9/5.0'"),
    rating_satisfaction: z
      .string()
      .describe(
        "Customer satisfaction percentage - format: '99% pembeli merasa puas'"
      ),
    rating_total: z
      .string()
      .or(z.number())
      .describe("Total number of ratings received"),
    reviews_total: z
      .string()
      .or(z.number())
      .describe("Total number of written reviews"),
    rating_counts: z
      .object({
        rating_1: z
          .string()
          .or(z.number())
          .describe("Number of 1-star ratings"),
        rating_2: z
          .string()
          .or(z.number())
          .describe("Number of 2-star ratings"),
        rating_3: z
          .string()
          .or(z.number())
          .describe("Number of 3-star ratings"),
        rating_4: z
          .string()
          .or(z.number())
          .describe("Number of 4-star ratings"),
        rating_5: z
          .string()
          .or(z.number())
          .describe("Number of 5-star ratings"),
      })
      .describe("Distribution of ratings across star levels"),
  })
  .describe("Complete rating statistics and summary");

// Product Reviews
const product_reviews = z
  .object({
    reviews_list: z.array(
      z.object({
        review_user: z
          .string()
          .describe(
            "Username of reviewer - may be partially masked for privacy"
          ),
        review_variant: z
          .string()
          .optional()
          .describe("Specific product variant purchased - if applicable"),
        review_comment: z.string().describe("Full review text content"),
        review_images: z
          .array(z.string().describe("The review image URL"))
          .optional()
          .describe("URLs of images uploaded with the review"),
        review_helpful_count: z
          .string()
          .or(z.number())
          .describe("Number of users who found this review helpful"),
        review_date: z
          .string()
          .describe("Review submission date - relative or absolute format"),
      })
    ),
  })
  .describe("Collection of customer reviews with associated metadata");

// Seller Information
const seller_info = z
  .object({
    seller_name: z.string().describe("Store or seller name"),
    seller_rating: z
      .string()
      .describe("Seller's average rating - format: '4.9'"),
    seller_total_reviews: z
      .string()
      .describe("Total number of seller reviews - format: '50,2 rb'"),
    seller_location: z.string().describe("Seller's location/city"),
    seller_process_time: z
      .string()
      .describe("Average order processing time - format: '± 1 jam'"),
  })
  .describe("Seller's shop information and performance metrics");

// Shipping Information
const shipping_info = z
  .object({
    shipping_origin: z.string().describe("Shipping origin location"),
    shipping_fee: z
      .string()
      .describe("Shipping cost range - format: '48 rb - 69 rb'"),
    shipping_estimation: z
      .string()
      .describe("Estimated delivery time - format: 'besok - 15 Jan'"),
  })
  .describe("Shipping-related information and estimates");

/**
 * Schema for the complete product data structure.
 * Optimized for e-commerce display, including optional fields for varying product types.
 */
export const ProductInsightSchema = z
  .object({
    basic_info: product_basic_info,
    specs: product_specs,
    features: product_features.optional(),
    package: product_package.optional(),
    rating_summary: product_rating_summary,
    reviews: product_reviews,
    seller: seller_info.optional(),
    shipping: shipping_info.optional(),
  })
  .describe(
    "Complete product data structure optimized for e-commerce display. " +
      "Optional fields handle varying product types and available information. " +
      "Consistent naming patterns used throughout for maintainability."
  );

/**
 * Type for the complete product insight description.
 * Represents the validated structure of product data.
 */
export type ProductInsightDescription = z.infer<typeof ProductInsightSchema>;

/**
 * Partial type for the product insight description.
 * Allows for partial structures to be used, making fields optional.
 */
export type PartialProductInsightDescription =
  DeepPartial<ProductInsightDescription>;
