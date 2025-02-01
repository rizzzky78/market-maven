/* eslint-disable @next/next/no-img-element */
import { DynamicCompare } from "@/components/maven/dynamic-compare";
import { ProductComparison } from "@/components/maven/dynamic-comparison";
import { ProductCompare } from "@/components/maven/product-compare";
import { ProductInsight } from "@/components/maven/product-insight";
import { ExtendedToolResult } from "@/lib/types/ai";
import { ProductSpecifications } from "@/lib/types/product";
import { FC } from "react";

const data = [
  {
    LENOVO: {
      "Basic Information": {
        "Model Name": "LENOVO YOGA SLIM PRO 9",
        Brand: "LENOVO",
        Series: "YOGA SLIM PRO",
        Price: "Rp19.599.000",
        "Original Price": "Rp27.999.000",
        Discount: "30%",
        "Warranty Duration": "1 Tahun",
        "Replace Policy":
          "7 Hari tukar unit, jika ada kerusakan yang di akibatkan oleh cacat pabrik",
        "Warranty Notes": [
          "Barang ori dan Baru 100%",
          "Konstultasi kendala barang selama masa garansi bebas biaya",
          "Jaminan klaim garansi dibantu toko selama masa garansi",
        ],
        Stock: "82",
        Sold: "50+",
        Rating: "4.7",
        "Rating Count": "23",
      },
      "Primary Specifications": {
        "Processor Brand": "Intel",
        "Processor Model": "Core i9-13905H",
        "Graphics Brand": "NVIDIA",
        "Graphics Model": "GeForce RTX 4050",
        "RAM Size": "32 GB",
        "RAM Type": "LPDDR5x",
        "RAM Speed": "6400 MHz",
        "Storage Size": "1 TB",
        "Storage Type": "SSD",
        "Display Size": "16 inch",
        "Display Resolution": "3200x2000",
        "Display Type": "Mini LED",
        "Operating System": "Windows 11 Home",
      },
      "Technical Details": {
        "Processor Cores": "14",
        "Processor Threads": "20",
        "P-Core Base Frequency": "2.6 GHz",
        "P-Core Max Frequency": "5.4 GHz",
        "E-Core Base Frequency": "1.9 GHz",
        "E-Core Max Frequency": "4.1 GHz",
        "Processor Cache": "24 MB",
        "RAM Configuration": "Soldered",
        "Storage Interface": "M.2 2280 PCIe 4.0x4 NVMe",
        "Graphics Memory": "6 GB",
        "Graphics Memory Type": "GDDR6",
        "Display Brightness": "1200 nits",
        "Display Surface": "Glossy / Anti-fingerprint",
        "Color Gamut DCI-P3": "100%",
        "Color Gamut Adobe RGB": "100%",
        "Color Gamut sRGB": "100%",
        "Display Refresh Rate": "165 Hz",
        "Display Features": [
          "Eyesafe",
          "Dolby Vision",
          "DisplayHDR 1000",
          "Touch",
          "TCON",
        ],
        "Wireless WiFi": "Wi-Fi 6E, 11ax 2x2",
        "Wireless Bluetooth": "BT5.1",
        "Battery Capacity": "75 Wh",
        "Battery Type": "Integrated",
        "Camera Resolution": "5.0 MP",
        "Camera Features": ["IR with E-shutter", "ToF Sensor"],
        Ports: [
          "1x HDMI, up to 4K/30Hz",
          "1x Headphone / microphone combo jack (3.5mm)",
          "1x Power connector",
          "1x SD card reader",
          "1x Thunderbolt 4 / USB4 40Gbps (support data transfer, Power Delivery 3.0 and DisplayPort 1.4)",
          "1x USB 3.2 Gen 1",
          "1x USB 3.2 Gen 1 (Always On)",
        ],
      },
      "Included Items": [
        "UNIT",
        "CHARGER",
        "DUS",
        "GARANSI",
        "NOTA",
        "TAS DAN MOUSE",
      ],
    },
  },
  {
    ASUS: {
      "Basic Information": {
        "Model Name": "ASUS TUF GAMING F15 FX507ZC4",
        Brand: "ASUS",
        Series: "TUF GAMING",
        Price: "Unspecified",
        "Original Price": "Unspecified",
        Discount: "Unspecified",
        "Warranty Duration": "2 Tahun",
        "Replace Policy": "Unspecified",
        "Warranty Notes": [
          "Garansi Resmi Asus Indonesia",
          "1st year perfect warranty",
        ],
        Stock: "Unspecified",
        Sold: "Unspecified",
        Rating: "Unspecified",
        "Rating Count": "Unspecified",
      },
      "Primary Specifications": {
        "Processor Brand": "Intel",
        "Processor Model": "Core i5-12500H",
        "Graphics Brand": "NVIDIA",
        "Graphics Model": "GeForce RTX 3050",
        "RAM Size": "16 GB",
        "RAM Type": "DDR4",
        "RAM Speed": "3200 MHz",
        "Storage Size": "512 GB",
        "Storage Type": "SSD",
        "Display Size": "15.6 inch",
        "Display Resolution": "1920x1080",
        "Display Type": "IPS-level",
        "Operating System": "Windows 11 Home",
      },
      "Technical Details": {
        "Processor Cores": "12",
        "Processor Threads": "Unspecified",
        "P-Core Base Frequency": "N/A",
        "P-Core Max Frequency": "N/A",
        "E-Core Base Frequency": "N/A",
        "E-Core Max Frequency": "N/A",
        "Processor Cache": "18 MB",
        "RAM Configuration": "SO-DIMM",
        "Storage Interface": "M.2 NVMe PCIe 3.0",
        "Graphics Memory": "4 GB",
        "Graphics Memory Type": "GDDR6",
        "Display Brightness": "N/A",
        "Display Surface": "Anti-glare",
        "Color Gamut DCI-P3": "N/A",
        "Color Gamut Adobe RGB": "47.34%",
        "Color Gamut sRGB": "62.50%",
        "Display Refresh Rate": "144 Hz",
        "Display Features": ["Adaptive-Sync", "MUX Switch + Optimus"],
        "Wireless WiFi": "Wi-Fi 6(802.11ax)+Bluetooth 5.2 (Dual band) 2*2",
        "Wireless Bluetooth": "5.2",
        "Battery Capacity": "56 Wh",
        "Battery Type": "4-cell Li-ion",
        "Camera Resolution": "720P HD",
        "Camera Features": "Unspecified",
        Ports: [
          "1x 3.5mm Combo Audio Jack",
          "1x HDMI 2.0b",
          "2x USB 3.2 Gen 1 Type-A",
          "1x USB 3.2 Gen 2 Type-C support DisplayPort / G-SYNC",
          "1x RJ45 LAN port",
          "1x Thunderbolt 4 support DisplayPort",
        ],
      },
      "Physical Attributes": {
        Dimensions: "35.4 x 25.1 x 2.24 ~ 2.49 cm",
        Weight: "2.20 Kg",
        Keyboard: "Backlit Chiclet Keyboard RGB",
      },
      "Included Items": ["TUF backpack"],
      "Additional Features": {
        Office: "Office Home and Student 2021",
        Speaker:
          '2-speaker system "AI noise-canceling technology Dolby Atmos Hi-Res certification"',
      },
    },
  },
];

const payload = {
  finalizedCompare: {
    callId: "9f5198ba-1138-44b5-b4ed-4cc6f934a7c8",
    comparison: {
      products: [
        {
          id: "70d8dadc-fef6-4698-b91f-d9f9b95eedc4",
          name: "ASUS TUF Gaming A15 FA506NF",
          model: "FA506NF-R525B6T-OM",
          brand: "ASUS",
          category: "Laptop",
          subCategory: "Gaming Laptop",
          keyFeatures: [
            "GARANSI RESMI ASUS INDONESIA 2 TAHUN + 1 THN PERFECT WARRANTY",
            "Military Standard",
          ],
          specifications: {
            processor: {
              brand: "AMD",
              model: "Ryzen 5 7535HS",
              cores: 6,
              threads: 12,
              clockSpeed: "3.3GHz",
              architecture: null,
            },
            memory: {
              ramSize: "8GB",
              type: "DDR5-4800",
              speed: null,
            },
            storage: {
              type: "SSD",
              capacity: "512GB",
              interface: "PCIe 4.0 NVMe M.2",
            },
            display: {
              size: "15.6-inch",
              resolution: "1920 x 1080",
              panelType: "IPS-level",
              refreshRate: "144Hz",
              brightness: "250nits",
              touchscreen: null,
            },
            battery: {
              capacity: "48WHrs",
              type: "Li-ion",
              fastCharging: null,
              wirelessCharging: null,
              estimatedLife: null,
            },
            connectivity: {
              wireless: ["Wi-Fi 6(802.11ax)", "Bluetooth 5.3"],
              ports: [
                "1x RJ45 LAN port",
                "1x USB 3.2 Gen 2 Type-C support DisplayPort",
                "3x USB 3.2 Gen 2 Type-A",
                "1x HDMI 2.0b",
                "1x 3.5mm Combo Audio Jack",
              ],
              network: ["10/100/1000 Mbps"],
            },
          },
          compatibility: {
            supportedOS: ["Windows 11 Home"],
            supportedFormats: null,
          },
          includedAccessories: ["TUF Gaming backpack"],
          certifications: null,
          warranty: {
            period: "2 years + 1 year perfect warranty",
            type: "manufacturer",
            coverage: null,
          },
        },
        {
          id: "30ff2195-eb29-491e-8b40-2cb14699430a",
          name: "Lenovo Yoga Slim 7 Pro X 14 3K Touch RTX3050 Ryzen 9 6900 32GB 1TB SSD - LAPTOP",
          model: "Yoga Slim 7 Pro X 14",
          brand: "Lenovo",
          category: "Laptop",
          subCategory: "Gaming Laptop",
          keyFeatures: [
            "3K Touch Display",
            "NVIDIA GeForce RTX 3050 4GB GDDR6",
            "AMD Ryzen 9 6900HS Creator Edition",
            "32GB LPDDR5-6400 RAM",
            "1TB SSD M.2 PCIe 4.0 NVMe",
            '14.5" 120Hz Display',
          ],
          specifications: {
            processor: {
              brand: "AMD",
              model: "Ryzen 9 6900HS Creator Edition",
              cores: 8,
              threads: 16,
              clockSpeed: "3.3 / 4.9GHz",
            },
            memory: {
              ramSize: "32GB",
              type: "LPDDR5-6400",
            },
            storage: {
              type: "SSD",
              capacity: "1TB",
              interface: "M.2 2280 PCIe 4.0x4 NVMe",
            },
            display: {
              size: '14.5"',
              resolution: "3072x1920",
              panelType: "IPS",
              refreshRate: "120Hz",
              brightness: "400 nits",
              touchscreen: true,
            },
            battery: {
              type: "Li-ion",
            },
            connectivity: {
              wireless: ["Wi-Fi 6", "Bluetooth 5.1"],
              ports: [
                "1x USB 3.2 Gen 1",
                "1x USB 3.2 Gen 1 (Always On)",
                "2x USB-C 3.2 Gen 2",
                "1x Headphone / microphone combo jack (3.5mm)",
              ],
            },
          },
          compatibility: {
            supportedOS: ["Windows 11 Home"],
          },
          includedAccessories: ["Tas Slempang", "Mouse Kabel"],
          warranty: {
            period: "1 Tahun",
            type: "Toko",
            coverage: "Kerusakan dari Pabrik",
          },
        },
      ],
      comparisonSummary: {
        keyDifferences: [
          "The Lenovo has a higher-resolution 3K touch display compared to the ASUS's FHD non-touch display.",
          "The Lenovo has a more powerful AMD Ryzen 9 processor, while the ASUS has a Ryzen 5 processor.",
          "The Lenovo has 32GB of LPDDR5 RAM, while the ASUS has 8GB of DDR5 RAM.",
          "The Lenovo has 1TB of SSD storage, while the ASUS has 512GB.",
          "The Lenovo has a dedicated NVIDIA GeForce RTX 3050 graphics card, while the ASUS does not specify a dedicated GPU.",
          "The ASUS has a longer warranty period (2 years + 1 year perfect warranty) compared to the Lenovo's 1 year warranty.",
          "The ASUS includes a TUF Gaming backpack, while the Lenovo includes a bag and a wired mouse.",
          "The Lenovo has a 120Hz refresh rate display, while the ASUS has a 144Hz refresh rate display.",
        ],
        keySimilarities: [
          "Both are gaming laptops.",
          "Both use AMD Ryzen processors.",
          "Both have SSD storage.",
          "Both have Wi-Fi 6 and Bluetooth connectivity.",
          "Both come with Windows 11 Home.",
        ],
        prosAndCons: [
          {
            productId: "70d8dadc-fef6-4698-b91f-d9f9b95eedc4",
            pros: [
              "Longer warranty period (2 years + 1 year perfect warranty).",
              "Includes a TUF Gaming backpack.",
              "144Hz refresh rate display.",
            ],
            cons: [
              "Less powerful AMD Ryzen 5 processor.",
              "Lower RAM (8GB) compared to the Lenovo.",
              "Smaller storage capacity (512GB) compared to the Lenovo.",
              "Lower resolution display (FHD) and no touch screen.",
              "No dedicated GPU specified.",
            ],
          },
          {
            productId: "30ff2195-eb29-491e-8b40-2cb14699430a",
            pros: [
              "More powerful AMD Ryzen 9 processor.",
              "Higher RAM (32GB) for better multitasking.",
              "Larger storage capacity (1TB).",
              "Higher resolution 3K touch display.",
              "Dedicated NVIDIA GeForce RTX 3050 graphics card.",
              "Includes a bag and a wired mouse.",
            ],
            cons: [
              "Shorter warranty period (1 year).",
              "120Hz refresh rate display.",
            ],
          },
        ],
      },
    },
  },
};

const productData: {
  callId: string;
  insight: Record<string, any>;
  screenshot: string;
} = {
  callId: "ea2d773d-7a1e-4947-9df0-cdc32bb15329",
  insight: {
    brand: "Lenovo",
    model: "LOQ 15IAX9",
    category: "laptop",
    specifications: {
      general: {
        weight: "2.38 kg (5.25 lbs)",
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
          "USB-C (USB 10Gbps / USB 3.2 Gen 2)",
          "HDMI 2.1",
          "Headphone / microphone combo jack (3.5mm)",
          "Ethernet (RJ-45)",
          "Power connector",
        ],
      },
      os: "Windows 11 Home Single Language, English",
      additionalFeatures: {
        audio: "Stereo speakers, 2W x2, optimized with Nahimic Audio",
      },
    },
  },

  screenshot:
    "https://service.firecrawl.dev/storage/v1/object/public/media/screenshot-0b63f0c9-29be-42b9-9f40-d305c7c12cd2.png",
};

// const Page: FC = () => {
//   // return (
//   //   <div className="px-2 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24 max-w-[484px] md:max-w-3xl w-full mx-auto flex flex-col space-y-3 md:space-y-4">
//   //     <div>
//   //       {/* <ProductCompare content={content} /> */}
//   //       {/* <ProductComparison
//   //         data={payload.finalizedCompare as unknown as FinalizedCompare}
//   //       /> */}
//   //       <ProductDetails product={productData.insight[0]} />
//   //     </div>
//   //   </div>
//   // );

//   return <ProductDetails product={productData.insight[0]} />;
// };

// export default Page;

import type React from "react";

const ProductDetails: React.FC = () => {
  const product = productData.insight[0];

  return (
    <div className="max-w-2xl mx-auto p-4 shadow-sm">
      <div className="space-y-4">
        {/* Product Image */}
        <img
          src={productData.screenshot || "/placeholder.svg"}
          alt={`${product.brand} ${product.model}`}
          className="w-full h-auto object-cover rounded-sm"
        />

        {/* Title & Category */}
        <div>
          <h1 className="text-md font-semibold">
            {product.brand} {product.model}
          </h1>
          <p className="text-xs text-gray-500 capitalize">{product.category}</p>
        </div>

        {/* Pricing Stack (placeholder since not in the example data) */}
        <div className="flex items-baseline gap-2">
          <span className="text-md font-bold text-blue-600">$999.99</span>
          <span className="text-xs line-through text-gray-400">$1,199.99</span>
          <span className="text-xs font-semibold text-green-600">Save 17%</span>
        </div>

        {/* Key Features */}
        <div>
          <h2 className="text-md font-semibold mb-2">Key Features</h2>
          <ul className="text-sm space-y-1">
            <li>• {product.specifications?.performance?.processor}</li>
            <li>• {product.specifications?.performance?.ram}</li>
            <li>• {product.specifications?.performance?.storage}</li>
            <li>• {product.specifications?.performance?.gpu}</li>
            <li>
              • {product.specifications?.display?.size}{" "}
              {product.specifications?.display?.type} Display
            </li>
          </ul>
        </div>

        {/* Technical Specifications */}
        <div>
          <h2 className="text-md font-semibold mb-2">
            Technical Specifications
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600">OS</td>
                <td className="py-2">{product.specifications?.os}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600">Weight</td>
                <td className="py-2">
                  {product.specifications?.general?.weight}
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600">Dimensions</td>
                <td className="py-2">
                  {product.specifications?.general?.dimensions}
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-600">Battery</td>
                <td className="py-2">
                  {product.specifications?.battery?.capacity},{" "}
                  {product.specifications?.battery?.type}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Ports</td>
                <td className="py-2">
                  {product.specifications?.connectivity?.ports?.join(", ")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Inventory Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Inventory Status</span>
          <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
            In Stock
          </span>
        </div>
      </div>
    </div>
  );
};

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

type ToolResult = ExtendedToolResult<
  { callId: string[] },
  {
    comparison: {
      products: Record<string, any>[];
      differences: Record<string, any>;
    };
  }
>;

const content: ToolResult = {
  success: true,
  name: "product_details",
  args: { callId: ["123", "ABC"] },
  data: {
    comparison: comparisonData.comparison.data,
  },
};

export default function Page() {
  return (
    <div className="px-2 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24 max-w-[484px] md:max-w-3xl w-full mx-auto flex flex-col space-y-3 md:space-y-4">
      {/* <ProductInsight content={content} /> */}
      <ProductCompare content={content} />
    </div>
  );
}
