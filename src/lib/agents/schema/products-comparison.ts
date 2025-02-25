import { z } from "zod";

// Define the common specifications schema
const CommonSpecsSchema = z
  .object({
    display_size: z
      .string()
      .describe(
        "The physical size of the product's display, typically in inches with quotation marks (e.g., '6.1\"')"
      ),
    processor: z
      .string()
      .describe(
        "The name and model of the product's processor or chipset (e.g., 'A17 Pro', 'Snapdragon 8 Gen 2')"
      ),
    storage: z
      .string()
      .optional()
      .describe(
        "The amount of internal storage capacity, typically in GB or TB (e.g., '128GB', '1TB')"
      ),
    battery: z
      .string()
      .describe(
        "The battery capacity, typically in mAh or Wh (e.g., '3274 mAh', '5000 mAh')"
      ),
    ram: z
      .string()
      .optional()
      .describe(
        "The amount of RAM memory, typically in GB (e.g., '8GB', '12GB')"
      ),
  })
  .catchall(
    z
      .string()
      .describe(
        "Additional common specifications not explicitly defined in the schema"
      )
  )
  .describe("Common specifications shared across product categories");

// Define the product schema
const ProductSchema = z
  .object({
    product_name: z
      .string()
      .describe(
        "The full name of the product, including model number if applicable (e.g., 'iPhone 15 Pro', 'Galaxy S23 Ultra')"
      ),
    brand: z
      .string()
      .describe(
        "The manufacturer or brand name of the product (e.g., 'Apple', 'Samsung')"
      ),
    price: z
      .string()
      .describe(
        "The product's price, typically including currency symbol (e.g., '$999', '€1199')"
      ),
    external_data: z
      .string()
      .or(z.record(z.string()))
      .optional()
      .describe(
        "Additional data from external sources like review ratings, expert opinions, or market analysis"
      ),
    common_specs: CommonSpecsSchema,
    category_specific_specs: z
      .record(z.string())
      .optional()
      .describe(
        "Specifications unique to the product's category (e.g., 'mobile_os' for smartphones, 'lens_type' for cameras)"
      ),
  })
  .describe("Detailed information about a single product");

// Define the main output schema
export const comparisonOutputSchema = z
  .object({
    products: z
      .array(ProductSchema)
      .length(2)
      .describe("Array containing exactly two products to be compared"),
    key_differences: z
      .array(z.string())
      .describe(
        "List of notable differences between the two products, formatted as human-readable descriptions"
      ),
  })
  .describe(
    "Structured comparison data for two products, highlighting specifications and key differences"
  );

export type ProductsComparison = z.infer<typeof comparisonOutputSchema>;
