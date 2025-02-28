export const TEMPLATE = {
  search_product_description: `Search a product based on user query. The query must be exact of product name (can be full or partial product name), cannot proceed word or sentence.`,
  get_product_details_description: `Get product details by given query and link`,
  gpd_extraction_objective: `Extract only product data including: product images, product link, and store link.`,
  products_comparison_description: `Compare two products based on user requested data`,
  inquire_user_description: `Ask the user if the current information provided is insufficient for taking further action.`,
  recommendator_description: `This tool provides product recommendations based on the current context. It generates a final output in the form of a list of recommended products tailored to the user's intent. Utilize this tool as a means of interpreting user intent to deliver personalized product suggestions.`,
} as const;
