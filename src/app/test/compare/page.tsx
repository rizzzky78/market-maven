/* eslint-disable @next/next/no-img-element */
import { AssistantMessage } from "@/components/maven/assistant-message";
import { ErrorMessage } from "@/components/maven/error-message";
import { ProductComparison } from "@/components/maven/product-comparison";
import { ProductDetails } from "@/components/maven/product-details";
import { RelatedMessage } from "@/components/maven/related-message";
import { RelatedQuery } from "@/lib/agents/schema/related";
import { ExtendedToolResult } from "@/lib/types/ai";
import { ProductSpecifications } from "@/lib/types/product";
import { FC } from "react";

const comparisonData = {
  callId: "42175c3a-a573-4285-8ae6-76fb49193a73",
  comparison: {
    data: {
      category: "laptop",
      sub_category: "gaming laptop",
      products: [
        {
          product: {
            brand: "Lenovo",
            model: "LOQ 15",
            price: 11649000,
          },
          specifications: {
            display: {
              size: "15.6 inches",
              resolution: "1920x1080",
              refreshRate: "144Hz",
            },
            performance: {
              processor: "Intel Core i5-12450HX",
              ram: "12GB SO-DIMM DDR5-4800",
              storage: "512GB SSD M.2 2242 PCIe 4.0x4 NVMe",
              gpu: "NVIDIA GeForce RTX 3050 6GB GDDR6",
            },
            battery: {
              capacity: "60Wh",
              charging: "170W Slim Tip (3-pin)",
            },
            connectivity: {
              ports: [
                "USB-A (USB 5Gbps / USB 3.2 Gen 1)",
                "USB-C (USB 10Gbps / USB 3.2 Gen 2), with PD 140W and DisplayPort 1.4",
                "HDMI 2.1",
                "Headphone / microphone combo jack (3.5mm)",
                "Ethernet (RJ-45)",
                "Power connector",
              ],
            },
            os: "Windows 11 Home Single Language, English",
          },
        },
        {
          product: {
            brand: "ASUS",
            model: "ROG ALLY RC71L",
            price: 7989000,
          },
          specifications: {
            display: {
              size: "7-inch",
              resolution: "1920 x 1080",
              refreshRate: "120Hz",
            },
            performance: {
              processor: "AMD Ryzen Z1 Extreme Processor",
              ram: "16GB LPDDR5",
              storage: "512GB PCIe 4.0 NVMe M.2 SSD",
              gpu: "AMD Radeon Graphics",
            },
            battery: {
              capacity: "40WHrs",
            },
            connectivity: {
              wifi: "Wi-Fi 6E(802.11ax)",
              bluetooth: "Bluetooth 5.2",
              ports: [
                "3.5mm Combo Audio Jack",
                "ROG XG Mobile Interface and USB Type-C combo port",
                "UHS-II microSD card reader",
              ],
            },
            os: "Windows 11",
          },
        },
      ],
      differences: {
        key_differences: [
          "Lenovo LOQ 15 has a larger 15.6-inch display compared to the 7-inch display of ASUS ROG ALLY RC71L.",
          "Lenovo LOQ 15 uses an Intel Core i5 processor, while ASUS ROG ALLY RC71L uses an AMD Ryzen Z1 Extreme processor.",
          "Lenovo LOQ 15 has a 60Wh battery, while ASUS ROG ALLY RC71L has a 40WHrs battery.",
          "Lenovo LOQ 15 has a dedicated NVIDIA GeForce RTX 3050 GPU, while ASUS ROG ALLY RC71L uses integrated AMD Radeon Graphics.",
        ],
        spec_comparison: {
          display_size: ["15.6 inches", "7-inch"],
          processor: [
            "Intel Core i5-12450HX",
            "AMD Ryzen Z1 Extreme Processor",
          ],
          ram: ["12GB SO-DIMM DDR5-4800", "16GB LPDDR5"],
          gpu: ["NVIDIA GeForce RTX 3050 6GB GDDR6", "AMD Radeon Graphics"],
          battery_capacity: ["60Wh", "40WHrs"],
          refreshRate: ["144Hz", "120Hz"],
        },
      },
    },
  },
};

type ComparisonTool = ExtendedToolResult<
  {
    compare: Array<{
      title: string;
      callId: string;
    }>;
  },
  {
    callId: string;
    productImages: string[];
    comparison: Record<string, any>;
  }
>;

const productDetailsData = {
  callId: "ee078e83-e672-4a25-8eec-95db3869a8b2",
  insight: {
    brand: "Lenovo",
    model: "LOQ 15",
    category: "laptop",
    price: {
      current: 11649000,
      original: 18999000,
      currency: "IDR",
      price_currency: "Rp11.649.000",
      discount_percentage: 39,
    },
    specifications: {
      general: {
        weight: "Starting at 2.38 kg (5.25 lbs)",
        dimensions:
          "359.86 x 258.7 x 21.9-23.9 mm (14.17 x 10.19 x 0.86-0.94 inches)",
        color: "Luna Grey",
        material: "PC-ABS (Top), PC-ABS (Bottom)",
      },
      display: {
        size: "15.6 inches",
        resolution: "1920x1080",
        type: "IPS",
        refreshRate: "144Hz",
      },
      performance: {
        processor: "Intel Core i5-12450HX",
        ram: "12GB SO-DIMM DDR5-4800",
        storage: "512GB SSD M.2 2242 PCIe 4.0x4 NVMe",
        gpu: "NVIDIA GeForce RTX 3050 6GB GDDR6",
      },
      battery: {
        capacity: "60Wh",
        type: "Integrated",
        charging: "170W Slim Tip (3-pin)",
      },
      connectivity: {
        ports: [
          "USB-A (USB 5Gbps / USB 3.2 Gen 1)",
          "USB-C (USB 10Gbps / USB 3.2 Gen 2), with PD 140W and DisplayPort 1.4",
          "HDMI 2.1",
          "Headphone / microphone combo jack (3.5mm)",
          "Ethernet (RJ-45)",
          "Power connector",
        ],
      },
      os: "Windows 11 Home Single Language, English",
      additional_features: {
        audio: "Stereo speakers, 2W x2, optimized with Nahimic Audio",
      },
    },
  },
  screenshot:
    "https://service.firecrawl.dev/storage/v1/object/public/media/screenshot-1770c871-3340-4cdd-b00e-ff7544cc79b0.png",
};

const contentToolComparison: ComparisonTool = {
  success: true,
  name: "product_details",
  args: {
    compare: [
      {
        title: "LENOVO LOQ 15 GeForce RTX 3050 - I5 12450HX 12GB 512SSD OHS",
        callId: "a20b8a86-24de-4447-b892-38f6794099da",
      },
      {
        title:
          'ASUS ROG Ally Ryzen Z1 / Ryzen Z1 Extreme 16GB 512GB 7" FHD 120Hz W11',
        callId: "fce7c1b3-ee58-4775-87b5-1c80071c6480",
      },
    ],
  },
  data: {
    callId: "70d8dadc-fef6-4698-b91f-d9f9b95eedc4",
    productImages: [
      "https://service.firecrawl.dev/storage/v1/object/public/media/screenshot-1770c871-3340-4cdd-b00e-ff7544cc79b0.png",
      "https://service.firecrawl.dev/storage/v1/object/public/media/screenshot-84e577ab-2792-4801-8b43-f622d02cc759.png",
    ],
    comparison: comparisonData.comparison.data,
  },
};

type ProductDetailsTool = ExtendedToolResult<
  { link: string; query: string },
  { productDetails: Record<string, any>; screenshot: string; callId: string }
>;

const contentToolDetails: ProductDetailsTool = {
  success: true,
  name: "product_details",
  args: {
    query: "LENOVO LOQ 15 GeForce RTX 3050 - I5 12450HX 12GB 512SSD OHS",
    link: "https://www.tokopedia.com/nvidiageforcelt/lenovo-loq-15-geforce-rtx-3050-i5-12450hx-12gb-512ssd-ohs-ram-12gb-tanpa-antigores-d46d5?extParam=ivf%3Dtrue%26keyword%3Dlenovo+loq%26search_id%3D20250131114341841F9DA1BCE6F603B87T%26src%3Dsearch",
  },
  data: {
    callId: "70d8dadc-fef6-4698-b91f-d9f9b95eedc4",
    productDetails: productDetailsData,
    screenshot:
      "https://service.firecrawl.dev/storage/v1/object/public/media/screenshot-1770c871-3340-4cdd-b00e-ff7544cc79b0.png",
  },
};

const markdownText = `**Insights for Lenovo Yoga**

1.  **Price Range**: The products range from **Rp2.200.000** (Lenovo Thinkpad Yoga 11e) to **Rp27.999.000** (Lenovo Yoga Slim 7 Aura Edition), showing a very wide range of options from budget-friendly to high-end premium.

2.  **Best Value**: The **Lenovo Thinkpad Yoga X13 G2** offers a good balance of features and price at **Rp4.090.000**, with a 5.0 rating and 40+ units sold, making it a solid mid-range option.

3.  **Top Performer**: The **Lenovo Yoga Pro 7i** stands out with a **5.0 rating** and **90+ units sold**, indicating high customer satisfaction. It also features a high-end RTX4050 GPU and OLED display.

4.  **Store Reputation**: **ROGS STORE**, **Top Tech**, **Sinarmulia Sukses Makmur**, and **Lenovo Yoga Official** are official retailers, providing assurance of product authenticity and reliable customer service.

5. **Feature Trends**: The list includes both traditional ThinkPad Yogas and the newer, more premium Yoga Slim and Pro series. The higher-end models offer features like OLED displays, high refresh rates (120Hz), and dedicated RTX GPUs.
`;

const related: RelatedQuery = {
  items: [
    {
      label: "Weather",
      query: "What's the weather like today?",
    },
    {
      label: "Recipe",
      query: "How do I make a vegetarian lasagna?",
    },
    {
      label: "Tech",
      query: "Why is my Wi-Fi so slow?",
    },
  ],
};

export default function Page() {
  return (
    <div className="px-2 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24 max-w-[484px] md:max-w-3xl w-full mx-auto flex flex-col space-y-3 md:space-y-4">
      <ProductDetails content={contentToolDetails} />
      <ProductComparison content={contentToolComparison} />
      <ErrorMessage
        errorName="Scrape Operation Error"
        reason="There was an error while fetching data from the server. Please try again later or contact support if the problem persists."
        raw={productDetailsData}
      />
      <AssistantMessage content={markdownText} />
      <RelatedMessage related={related} />
    </div>
  );
}
