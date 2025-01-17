import { z } from "zod";

/**
 * Schema definition for validating and typing product data.
 * This schema expects a list of products with detailed information
 * about each product, including title, image, price, rating, and store details.
 */
export const productsSchema = z.object({
  data: z.array(
    z.object({
      /**
       * @property {string} title - Product title or name.
       */
      title: z.string().describe("Product title or name"),

      /**
       * @property {string} image - URL of the product image.
       */
      image: z.string().describe("Product image URL"),

      /**
       * @property {string} price - Price of the product.
       */
      price: z.string().describe("Product price"),

      /**
       * @property {string | null} rating - Product rating ranging from 0.0 to 5.0.
       * Can be null if no rating is available.
       */
      rating: z.string().nullable().describe("Product rating from 0.0 to 5.0"),

      /**
       * @property {string | null} sold - Number of products sold.
       * Can be null if this information is unavailable.
       */
      sold: z.string().nullable().describe("Number of products sold"),

      /**
       * @property {string} link - URL to the product's detail page.
       */
      link: z.string().describe("Product detail page URL"),

      /**
       * @property {Object} store - Information about the store or seller.
       * @property {string} store.name - Name of the store or seller.
       * @property {string} store.location - Physical location of the store.
       * @property {boolean} store.isOfficial - Indicates if the store is an official store.
       */
      store: z.object({
        name: z.string().describe("Store or seller name"),
        location: z.string().describe("Store location"),
        isOfficial: z
          .boolean()
          .describe("Whether the store is an official store"),
      }),
    })
  ),
});

/**
 * Type inferred from the productSchema.
 * Represents the validated structure of the product data.
 */
export type Products = z.infer<typeof productsSchema>;
