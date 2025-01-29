import { ProductCompare } from "@/components/maven/product-compare";
import { ExtendedToolResult } from "@/lib/types/ai";
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

type ToolResult = ExtendedToolResult<
  { insightCallId: string[] },
  { insight: Record<string, any>[] }
>;

const content: ToolResult = {
  success: true,
  name: "comparison",
  args: { insightCallId: ["1", "2"] },
  data: { insight: data },
};

const Page: FC = () => {
  return (
    <div className="px-2 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24 max-w-[484px] md:max-w-3xl w-full mx-auto flex flex-col space-y-3 md:space-y-4">
      <div>
        <ProductCompare content={content} />
      </div>
    </div>
  );
};

export default Page;

const example = {
  comparison: {
    products: [
      {
        name: "LENOVO YOGA SLIM PRO 9",
        processor: "Intel Core i9-13905H",
        ram: "32GB LPDDR5x-6400",
        storage: "1TB SSD PCIe 4.0 NVMe",
        graphics: "NVIDIA GeForce RTX 4050 6GB GDDR6",
        display: '16" 3.2K Mini LED 165Hz Touch',
        os: "Windows 11 Home",
        ports: [
          "HDMI",
          "Headphone/mic jack",
          "Power connector",
          "SD card reader",
          "Thunderbolt 4/USB4",
          "USB 3.2 Gen 1",
          "USB 3.2 Gen 1 (Always On)",
        ],
        battery: "75Wh",
        camera: "5.0MP + IR with E-shutter",
        wireless: "Wi-Fi 6E + BT5.1",
        price: "Rp19.599.000",
        discount: "30%",
        original_price: "Rp27.999.000",
        warranty: "1 Tahun",
        replace_policy: "7 Hari tukar unit",
        rating: "4.7",
        rating_count: "23",
      },
      {
        name: "ASUS TUF GAMING F15 FX507ZC4",
        processor: "Intel Core i5-12500H",
        ram: "16GB/32GB DDR4-3200",
        storage: "512GB SSD PCIe 3.0 NVMe",
        graphics: "NVIDIA GeForce RTX 3050 4GB GDDR6",
        display: '15.6" FHD IPS 144Hz',
        os: "Windows 11 Home",
        ports: [
          "3.5mm Combo Audio Jack",
          "HDMI 2.0b",
          "USB 3.2 Gen 1 Type-A",
          "USB 3.2 Gen 2 Type-C (DisplayPort/G-SYNC)",
          "RJ45 LAN port",
          "Thunderbolt 4",
        ],
        battery: "56Wh",
        camera: "720P HD",
        wireless: "Wi-Fi 6 + BT 5.2",
        office: "Office Home and Student 2021",
        warranty: "2 Tahun",
        weight: "2.20 Kg",
      },
    ],
    differences: [
      {
        feature: "Processor",
        lenovo: "Intel Core i9-13905H",
        asus: "Intel Core i5-12500H",
        note: "Lenovo has a higher-end, newer generation processor.",
      },
      {
        feature: "RAM",
        lenovo: "32GB LPDDR5x-6400",
        asus: "16GB/32GB DDR4-3200",
        note: "Lenovo uses faster and more modern RAM technology.",
      },
      {
        feature: "Storage",
        lenovo: "1TB SSD PCIe 4.0 NVMe",
        asus: "512GB SSD PCIe 3.0 NVMe",
        note: "Lenovo offers double the storage and a faster PCIe 4.0 interface.",
      },
      {
        feature: "Graphics",
        lenovo: "NVIDIA GeForce RTX 4050 6GB GDDR6",
        asus: "NVIDIA GeForce RTX 3050 4GB GDDR6",
        note: "Lenovo has a newer and more powerful graphics card with more VRAM.",
      },
      {
        feature: "Display",
        lenovo: '16" 3.2K Mini LED 165Hz Touch',
        asus: '15.6" FHD IPS 144Hz',
        note: "Lenovo has a higher resolution, better display technology, and a higher refresh rate with touch capability.",
      },
      {
        feature: "Battery",
        lenovo: "75Wh",
        asus: "56Wh",
        note: "Lenovo has a larger battery capacity.",
      },
      {
        feature: "Camera",
        lenovo: "5.0MP + IR with E-shutter",
        asus: "720P HD",
        note: "Lenovo has a higher resolution camera with additional features.",
      },
      {
        feature: "Wireless",
        lenovo: "Wi-Fi 6E + BT5.1",
        asus: "Wi-Fi 6 + BT 5.2",
        note: "Lenovo has Wi-Fi 6E support, which is a newer standard.",
      },
      {
        feature: "Warranty",
        lenovo: "1 Tahun",
        asus: "2 Tahun",
        note: "Asus offers a longer warranty period.",
      },
      {
        feature: "Office Software",
        lenovo: "None",
        asus: "Office Home and Student 2021",
        note: "Asus includes Office Home and Student 2021.",
      },
      {
        feature: "Price",
        lenovo: "Rp19.599.000",
        asus: "Not specified",
        note: "Lenovo's price is specified, while Asus's is not.",
      },
      {
        feature: "Weight",
        lenovo: "Not specified",
        asus: "2.20 Kg",
        note: "Asus's weight is specified, while Lenovo's is not.",
      },
    ],
    summary:
      "The Lenovo Yoga Slim Pro 9 is a higher-end laptop with a more powerful processor, more RAM, faster storage, a better graphics card, and a superior display. However, the ASUS TUF Gaming F15 offers a longer warranty and includes Office software. The Lenovo is positioned as a premium device, while the ASUS is a gaming-focused laptop.",
  },
};
