// import {
//   QueryEnhancement,
//   QueryEnhancementSkeleton,
// } from "@/components/maven/query-enhancement";
// import {
//   QueryValidation,
//   QueryValidationProps,
//   QueryValidationSkeleton,
// } from "@/components/maven/query-validation";
// import { QueryEnhancedData } from "@/lib/types/subtools";

import { AssistantMessage } from "@/components/maven/assistant-message";
import { InsightProductCard } from "@/components/maven/insight-product-card";
import { InsightProductCardSkeleton } from "@/components/maven/insight-product-card-skeleton";
import { QueryEnhancement } from "@/components/maven/query-enhancement";
import { QueryEnhancementSkeleton } from "@/components/maven/query-enhancement-skeleton";
import {
  QueryValidation,
  QueryValidationProps,
} from "@/components/maven/query-validation";
import { QueryValidationSkeleton } from "@/components/maven/query-validation-skeleton";
import { QueryEnhancedData } from "@/lib/types/subtools";

// export default function Home() {
//   // Example data matching the schema
//   const exampleData: QueryValidationProps["data"] = {
//     query_input: "Samsung Galaxy S23 Ultra",
//     is_electronic_product: true,
//     product_exists: true,
//     product_category: "smartphone",
//     brand_verified: true,
//     market_availability: "widely_available",
//     information_sources: [
//       "official_manufacturer",
//       "major_retailer",
//       "tech_review_sites",
//     ],
//     confidence_level: "very_high",
//     validation_score: 9,
//     detailed_reasoning:
//       "The Samsung Galaxy S23 Ultra is a verified flagship smartphone from Samsung. It has extensive documentation from Samsung's official website, is sold by all major retailers, and has been reviewed by numerous tech publications. Technical specifications are widely available and consistent across sources.",
//     specifications_found: true,
//     alternative_suggestions: [
//       "Samsung Galaxy S23+",
//       "Samsung Galaxy S23",
//       "Google Pixel 7 Pro",
//     ],
//     red_flags: ["none_detected"],
//   };

//   // Example of a product with issues
//   const problematicExample: QueryValidationProps["data"] = {
//     query_input: "SuperTech X9000 Smartphone",
//     is_electronic_product: true,
//     product_exists: false,
//     product_category: "smartphone",
//     brand_verified: false,
//     market_availability: "unknown",
//     information_sources: ["user_forums", "social_media", "no_reliable_sources"],
//     confidence_level: "very_low",
//     validation_score: 2,
//     detailed_reasoning:
//       "The SuperTech X9000 appears to be a fictional smartphone. No information could be found from official manufacturers or reputable retailers. Limited mentions exist only in user forums with contradictory specifications. The brand 'SuperTech' does not appear to be a legitimate smartphone manufacturer.",
//     specifications_found: false,
//     alternative_suggestions: [
//       "Samsung Galaxy S23",
//       "iPhone 14 Pro",
//       "Google Pixel 7",
//     ],
//     red_flags: [
//       "potential_counterfeit",
//       "no_official_sources",
//       "suspicious_branding",
//     ],
//   };

//   const examples: QueryEnhancedData[] = [
//     {
//       original_query: "iphone",
//       enhanced_query: "iPhone 14 Pro",
//       enhancement_type: "brand_to_specific_model" as const,
//       confidence_score: 0.85,
//       reasoning:
//         "The query 'iphone' is a brand name without a specific model. Based on current market trends and popularity, enhanced to 'iPhone 14 Pro' which is the latest flagship model at the time of this enhancement.",
//     },
//     {
//       original_query: "samsng galxy",
//       enhanced_query: "Samsung Galaxy S23",
//       enhancement_type: "typo_correction" as const,
//       confidence_score: 0.92,
//       reasoning:
//         "The original query contains typos in both the brand name 'Samsung' and product line 'Galaxy'. Corrected the spelling and added the current flagship model 'S23' for more specificity.",
//     },
//     {
//       original_query: "good laptop for gaming",
//       enhanced_query: "ASUS ROG Zephyrus G14 gaming laptop",
//       enhancement_type: "vague_to_specific" as const,
//       confidence_score: 0.68,
//       reasoning:
//         "The original query is vague, asking for a 'good laptop for gaming'. Enhanced to a specific, well-reviewed gaming laptop model that offers good performance for its price range.",
//     },
//     {
//       original_query: "MacBook Pro",
//       enhanced_query: "MacBook Pro 16-inch M2 Pro",
//       enhancement_type: "specification_added" as const,
//       confidence_score: 0.75,
//       reasoning:
//         "The original query mentions 'MacBook Pro' but doesn't specify the size or processor. Added the screen size and processor type to make the query more specific to the latest model.",
//     },
//     {
//       original_query: "Sony WH-1000XM4",
//       enhanced_query: "Sony WH-1000XM4",
//       enhancement_type: "no_change_needed" as const,
//       confidence_score: 0.98,
//       reasoning:
//         "The original query is already specific with the exact model number of Sony's noise-cancelling headphones. No enhancement needed as it already contains the brand and precise model.",
//     },
//   ];

//   return (
//     <main className="p-4 max-w-3xl mx-auto space-y-6">
//       <h1 className="text-lg font-semibold text-center mb-4">
//         Query Search Validation Reasoner Examples
//       </h1>

//       <div>
//         <QueryValidation
//           data={exampleData}
//           usage={{
//             promptTokens: 160,
//             completionTokens: 87,
//             totalTokens: 247,
//           }}
//         />
//       </div>

//       <div>
//         <QueryValidation
//           data={problematicExample}
//           usage={{
//             promptTokens: 160,
//             completionTokens: 87,
//             totalTokens: 247,
//           }}
//         />
//       </div>
//       <div>
//         <QueryValidationSkeleton />
//       </div>
//       {examples.map((example, index) => (
//         <QueryEnhancement
//           key={index}
//           data={example}
//           usage={{
//             promptTokens: 160,
//             completionTokens: 87,
//             totalTokens: 247,
//           }}
//         />
//       ))}
//       <QueryEnhancementSkeleton />
//     </main>
//   );
// }

export default function Page() {
  // Example data matching the schema
  const exampleData: QueryValidationProps["data"] = {
    query_input: "Samsung Galaxy S23 Ultra",
    is_electronic_product: true,
    product_exists: true,
    product_category: "smartphone",
    brand_verified: true,
    market_availability: "widely_available",
    information_sources: [
      "official_manufacturer",
      "major_retailer",
      "tech_review_sites",
    ],
    confidence_level: "very_high",
    validation_score: 9,
    detailed_reasoning:
      "The Samsung Galaxy S23 Ultra is a verified flagship smartphone from Samsung. It has extensive documentation from Samsung's official website, is sold by all major retailers, and has been reviewed by numerous tech publications. Technical specifications are widely available and consistent across sources.",
    specifications_found: true,
    alternative_suggestions: [
      "Samsung Galaxy S23+",
      "Samsung Galaxy S23",
      "Google Pixel 7 Pro",
    ],
    red_flags: ["none_detected"],
  };

  // Example of a product with issues
  const problematicExample: QueryValidationProps["data"] = {
    query_input: "SuperTech X9000 Smartphone",
    is_electronic_product: true,
    product_exists: false,
    product_category: "smartphone",
    brand_verified: false,
    market_availability: "unknown",
    information_sources: ["user_forums", "social_media", "no_reliable_sources"],
    confidence_level: "very_low",
    validation_score: 2,
    detailed_reasoning:
      "The SuperTech X9000 appears to be a fictional smartphone. No information could be found from official manufacturers or reputable retailers. Limited mentions exist only in user forums with contradictory specifications. The brand 'SuperTech' does not appear to be a legitimate smartphone manufacturer.",
    specifications_found: false,
    alternative_suggestions: [
      "Samsung Galaxy S23",
      "iPhone 14 Pro",
      "Google Pixel 7",
    ],
    red_flags: [
      "potential_counterfeit",
      "no_official_sources",
      "suspicious_branding",
    ],
  };

  const examples: QueryEnhancedData[] = [
    {
      original_query: "iphone",
      enhanced_query: "iPhone 14 Pro",
      enhancement_type: "brand_to_specific_model" as const,
      confidence_score: 0.85,
      reasoning:
        "The query 'iphone' is a brand name without a specific model. Based on current market trends and popularity, enhanced to 'iPhone 14 Pro' which is the latest flagship model at the time of this enhancement.",
    },
    {
      original_query: "samsng galxy",
      enhanced_query: "Samsung Galaxy S23",
      enhancement_type: "typo_correction" as const,
      confidence_score: 0.92,
      reasoning:
        "The original query contains typos in both the brand name 'Samsung' and product line 'Galaxy'. Corrected the spelling and added the current flagship model 'S23' for more specificity.",
    },
    {
      original_query: "good laptop for gaming",
      enhanced_query: "ASUS ROG Zephyrus G14 gaming laptop",
      enhancement_type: "vague_to_specific" as const,
      confidence_score: 0.68,
      reasoning:
        "The original query is vague, asking for a 'good laptop for gaming'. Enhanced to a specific, well-reviewed gaming laptop model that offers good performance for its price range.",
    },
    {
      original_query: "MacBook Pro",
      enhanced_query: "MacBook Pro 16-inch M2 Pro",
      enhancement_type: "specification_added" as const,
      confidence_score: 0.75,
      reasoning:
        "The original query mentions 'MacBook Pro' but doesn't specify the size or processor. Added the screen size and processor type to make the query more specific to the latest model.",
    },
    {
      original_query: "Sony WH-1000XM4",
      enhanced_query: "Sony WH-1000XM4",
      enhancement_type: "no_change_needed" as const,
      confidence_score: 0.98,
      reasoning:
        "The original query is already specific with the exact model number of Sony's noise-cancelling headphones. No enhancement needed as it already contains the brand and precise model.",
    },
  ];

  const productData = {
    data: {
      marketSource: "shopee" as any,
      title: "Samsung Galaxy S24 Ultra",
      images: [
        "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6570/6570393_sd.jpg",
        "https://m.media-amazon.com/images/I/510GGm-pGgL._AC_UF894,1000_QL80_.jpg",
        "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6570/6570396cv11d.jpg",
        "https://cdn.uvation.com/uvationmarketplace/catalog/product/g/a/galaxy_s24_ultra_761_576_2_1.png",
        "https://m.media-amazon.com/images/I/61KH0Ri7U-L._AC_UF894,1000_QL80_.jpg",
        "https://images.samsung.com/is/image/samsung/assets/us/2501/pcd/smartphones/galaxy-s24-ultra/galaxy-S24-ultra-ft02-kv_MO.jpg?$720_N_JPG$",
      ],
      videos: [
        "https://www.youtube.com/watch?v=Ci3b--LZ-Jw",
        "https://www.youtube.com/watch?v=j78p75aVHUE",
        "https://www.youtube.com/watch?v=daFpfaCmrAs&pp=0gcJCdgAo7VqN5tD",
      ],
      estimatedPrice: "Rp\t15.789.000,00",
      availableStore: [
        {
          name: "SEIN Samsung Galaxy S24 Ultra 5G 12/1TB 512GB 256GB | S24 Plus 12/512 256 Second Fullset Original",
          location: "Jakarta Barat",
          isOfficial: false,
          rating: "5",
          sold: null,
          link: "https://shopee.co.id/product/510454339/26813414049?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkWVp3RFo3Mkw5czd4Z0hzdEF1WVFiblFiSGthd0hwUWlOa09lOGwxU2VqcDRJbmdpYnJMeXpuODQzMDBtVUl1a1EwVzhjRVNZREIxeE41ZVc0TG8wdHFYV3NTaVdDQ1F6NXNIUDZHQjh4YjI",
        },
        {
          name: "Samsung S24 Ultra 256Gb//512gb// 1TB Second SEIN",
          location: "Jakarta Barat",
          isOfficial: false,
          rating: "5",
          sold: null,
          link: "https://shopee.co.id/product/127358061/29513823018?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkWVp3RFo3Mkw5czd4Z0hzdEF1WVFibFFLUkg2cFByWnpJb0dxamYwSUxQdmFXT3BQT2lXdWFkdC9EaS9jNnFNQzBNc1BQZUhoNWZkMzNLSk5EbE1aUGVTdEVNenZWM0pJbjQ4NTdJT0lWOXY",
        },
        {
          name: "Samsung Galaxy S24 Ultra 5G 256Gb 512Gb 1Tb Garansi Resmi SEIN",
          location: "Jakarta Barat",
          isOfficial: false,
          rating: "5",
          sold: null,
          link: "https://shopee.co.id/product/9435108/25278657623?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkVEg0SDd3VWo1MDQyT052d3EvY1B4WVYxaEM1d1N4VTU4UWF0cXJWRTNsSlJBMEM0cm9CK1hyRytwUU11SmZJUHNqcUcwZnB6TVcxS2piK0Jpc3dESTJHazhKM2haQUNTY3pFdUJVdEUrcSs",
        },
        {
          name: "Samsung S24 Ultra 256GB 512GB 1TB -Garansi Resmi",
          location: "Jakarta Barat",
          isOfficial: false,
          rating: "4.5",
          sold: "84.893",
          link: "https://shopee.co.id/product/281627987/25414227018?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkWVp3RFo3Mkw5czd4Z0hzdEF1WVFibGlwNlJmOThCRjY5ZCtpQVA3dzBuVGd2Rk91YkF0Q2h2aEtFdURHTEk4c2V0RU9SVE9ac0dFaWJKR3FKTitLcldMc3JJMkR3QXZ2UTd6dFZ6MFVMZnQ",
        },
        {
          name: "HP BARU SAMSUNG GALAXY S24 5G | S24+ 5G | S24 ULTRA 5G 8/256GB - 12/512GB GARANSI RESMI 100% ORIGINAL",
          location: "Jakarta Barat",
          isOfficial: false,
          rating: "5",
          sold: null,
          link: "https://shopee.co.id/product/322427170/14954521431?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkWVp3RFo3Mkw5czd4Z0hzdEF1WVFibHNQK2NuNEhsTzZvSWhGai9TSGowdVo0OUdKd0RLNm83cDY0dHRyWEZWNHhXUDBkcDRpbmdLKysrdWNZSGJpMjBHdzNvS1haUE1jamloWUlXY3VvUzc",
        },
        {
          name: "SEIN SAMSUNG GALAXY S24 ULTRA 5G 12/256GB 12/512GB 12/1TB | S24 PLUS | S24+ SECOND RESMI",
          location: "Jakarta Barat",
          isOfficial: false,
          rating: "4.5",
          sold: "84.893",
          link: "https://shopee.co.id/product/966993360/25538121161?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkWVp3RFo3Mkw5czd4Z0hzdEF1WVFia1RUSGl2TFl3WVVlYVhPSXR0WDFkRnk1YVVGQzBOOHhqUDNaN3AyblhtQVRqeGpJU2pxbWxac0xTNzhQTWxYS3I2UUZQM3dQOUhnQ2NJVy84MUxyZDc",
        },
        {
          name: "Samsung Galaxy S24 Ultra S24+ S24 Series [12/1TB 12/512GB 12/256GB] Black Gray Violet Yellow (100% Garansi Resmi)",
          location: "Jakarta Barat",
          isOfficial: false,
          rating: "4.5",
          sold: "84.893",
          link: "https://shopee.co.id/product/1513371507/29832359855?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkVHQ3ZkZSUTMrR3pBWmZZNzdrcnRBMTZWdkp3WE85enVReC9zcCtyVWwvM1BPeGI0SWdVemtGbnNhZ2F5RlhFZUpWT015YnN1TExVL1BIWEVybzVsYzc5MDhka3NoUmV4dzdQOVpzS0hTZ2RTVWpvZGhqUlRsMHRtc3BoM0VQMVB3PT0",
        },
        {
          name: "Dus Box Samsung Galaxy S24 Ultra Original asli copotan",
          location: "Jakarta Barat",
          isOfficial: false,
          rating: "4.5",
          sold: "84.893",
          link: "https://shopee.co.id/product/405815104/28907943490?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkWVp3RFo3Mkw5czd4Z0hzdEF1WVFia3ZNd3JhMFIrRlhUb0d6d3c1L1RSRkh6amZ1RlgwWkNDbjNQWTJQMXZlMXBxWUtWcjByVzRHdjd2MEprcUUzdDR1a2p3cFJ4QlorREI1TUJLVzM1cVU",
        },
        {
          name: "Samsung Galaxy S24 Ultra 256 GB 12 GB Titanium Gray",
          location: "Jakarta Selatan",
          isOfficial: true,
          rating: "4.5",
          sold: "84.893",
          link: "https://www.samsung.com/id/smartphones/galaxy-s24-ultra/buy/?modelCode=SM-S928BZTCXID",
        },
        {
          name: "Samsung Galaxy S24 Ultra 12/256 Smartphone AI, AI Phone, Handphone AI, Kamera 50MP, Layar besar, RAM besar, Baterai tahan lama",
          location: "Jakarta Barat",
          isOfficial: false,
          rating: "4.5",
          sold: "84.893",
          link: "https://shopee.co.id/product/654830944/26220391824?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkWVp3RFo3Mkw5czd4Z0hzdEF1WVFibk9ITVovaTdTWlJYVnJ2NTkwRy9GNUhnbnVMcU90dGxxeHFmUFR0b2VyclVvL0wyRExyWHhPRk5uOC8zUzVZa1lNbzBlZGZEWnloRnpkQW1FLzE2N0c",
        },
      ],
    },
  };

  const content = `No, a "Gemini Pro subscription" for the Gemini app (like Google AI Pro or Google AI Ultra plans) does **not** include a "Gemini API plan."

Here's the distinction:

* **Gemini Pro Subscription (Google AI Pro/Ultra):** These are consumer-facing subscriptions that give you enhanced access to the Gemini web app and mobile app, along with features like Deep Research, video generation (with Veo), NotebookLM, Gemini in other Google apps (Gmail, Docs, etc.), and increased Google One storage. This is for using Gemini as a personal AI assistant.

* **Gemini API Plan:** This is for developers who want to integrate Gemini's AI capabilities into their own applications and services. The Gemini API has its own separate pricing structure, which is typically pay-as-you-go based on token usage (input, output, caching) and the specific Gemini model you use (e.g., Gemini 1.5 Pro, Gemini 1.5 Flash). While there's a free tier for testing, to scale up or use more advanced features, you'll need to enable Cloud Billing for your Google Cloud project.

So, while both involve "Gemini Pro" models, they are for different use cases and have separate billing.`;

  const usage = {
    promptTokens: 14363,
    completionTokens: 2676,
    totalTokens: 17039,
  };

  return (
    <main className="container mx-auto py-10 max-w-3xl px-2 sm:px-12">
      <div className="flex flex-col space-y-5">
        <div>
          <QueryValidation
            data={exampleData}
            usage={{
              promptTokens: 160,
              completionTokens: 87,
              totalTokens: 247,
            }}
          />
        </div>

        <div>
          <QueryValidation
            data={problematicExample}
            usage={{
              promptTokens: 160,
              completionTokens: 87,
              totalTokens: 247,
            }}
          />
        </div>
        <div>
          <QueryValidationSkeleton />
        </div>
        {examples.map((example, index) => (
          <QueryEnhancement
            key={index}
            data={example}
            usage={{
              promptTokens: 160,
              completionTokens: 87,
              totalTokens: 247,
            }}
          />
        ))}
        <QueryEnhancementSkeleton />
        <InsightProductCard data={productData} usage={usage} />
        <InsightProductCardSkeleton />
        <AssistantMessage content={content} />
      </div>
    </main>
  );
}
