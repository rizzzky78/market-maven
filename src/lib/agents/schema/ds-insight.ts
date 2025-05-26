import { z } from "zod";

/**
 * Data Souurce: Insight
 * 
 * Schema definition for validating and typing product data.
 * This schema expects a single product with detailed information
 * about product, including title, image, price, rating, and store details.
 */
export const dataSourceInsightSchema = z.object({
  data: z.object({
    marketSource: z
      .enum(["global", "shopee"])
      .describe(
        "The choosen market source, came from payload data, if it shopee otherwise global"
      ),
    title: z.string().describe("The full product title or name"),

    images: z
      .array(z.string().describe("Product image URL"))
      .min(5)
      .describe(
        "The extracted images url from images data source, minimum is 5 and max 6"
      ),

    videos: z
      .array(z.string())
      .min(4)
      .describe(
        "The extracted youtube video url from videos data source, minimum is 4 and maximum is 6, choose the most popular and helpful for the users"
      ),

    estimatedPrice: z
      .string()
      .describe("Product price in USD or following with current curency"),
    availableStore: z
      .array(
        z.object({
          name: z.string().describe("Store or seller name"),
          location: z
            .string()
            .describe("Store location, if unindentified use '-'"),
          isOfficial: z
            .boolean()
            .describe("Whether the store is an official store"),
          rating: z
            .string()
            .nullable()
            .describe("Product rating from 0.0 to 5.0, if not exist use '-'"),
          sold: z
            .string()
            .nullable()
            .describe("Number of products sold, if not exist use '-'"),
          link: z
            .string()
            .describe("Product detail page URL, if not exist use '-'"),
        })
      )
      .max(10)
      .describe(
        "The available store data, maximum data extracted is 10 items."
      ),
  }),
});
