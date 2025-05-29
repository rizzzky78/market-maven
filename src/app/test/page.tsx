import {
  InsightProductCard,
  InsightProductCardProps,
} from "@/components/maven/insight-product-card";
import { InsightProductCardSkeleton } from "@/components/maven/insight-product-card-skeleton";
import { ProductDetails } from "@/components/maven/product-details";
import {
  ProductDetailsInsight,
  ProductDetailsInsightProps,
} from "@/components/maven/product-details-insight";
import { ExtendedToolResult } from "@/lib/types/ai";
import { ProductDetailsResponse } from "@/lib/types/product";

type ProductDetailsProps = ExtendedToolResult<
  { query: string; link: string; source: "tokopedia" | "global" },
  ProductDetailsResponse
>;

const toolData: ProductDetailsProps = {
  success: true,
  name: "getProductDetails",
  args: {
    source: "tokopedia",
    link: "https://www.tokopedia.com/protechcom/lenovo-loq-gaming-15irh8-i7-13620h-8gb-512gb-rtx4050-6gb-15-6-ohs-w11-ddr5-12gb-381c7?extParam=ivf%3Dfalse%26keyword%3Dlenovo+loq+15irh8%26search_id%3D2025052807412111B9842E0A271F3AD4KH%26src%3Dsearch",
    query:
      'LENOVO LOQ GAMING 15IRH8 i7-13620H 8GB 512GB RTX4050 6GB 15.6" OHS W11',
  },
  data: {
    callId: "c3fcdcff-0070-4af4-acb5-2157e6c29095",
    screenshot:
      "https://service.firecrawl.dev/storage/v1/object/public/media/screenshot-99e0e036-94df-4b91-a385-1e79b2ec9e5a.png",
    externalData: {
      tavily:
        'The Lenovo LOQ 15IRH8 features an i7-13620H processor, 8GB RAM, 512GB SSD, and RTX 4050 6GB graphics. It runs on Windows 11 and has a 15.6" display.',
      markdown:
        "# Lenovo LOQ Gaming 15IRH8\n\n## Overview\n\nThe Lenovo LOQ Gaming 15IRH8 is a mid-range gaming laptop designed to offer a balance of performance and affordability. It features an Intel Core i7 processor, NVIDIA GeForce RTX 4050 graphics, and a 15.6-inch display, making it suitable for both gaming and everyday tasks.\n\n## Detailed Specifications\n\n### Design & Construction\n\n-   Materials: Plastic | 0.80\n-   Dimensions: 359.6 x 264.8 x 22.1-25.2 mm | 0.85\n-   Weight: Starting at 2.4 kg | 0.85\n-   Color: Storm Grey | 0.90\n\n### Display\n\n-   Size: 15.6 inch | 1.00\n-   Technology: IPS | 0.95\n-   Resolution: 1920 x 1080 (FHD) | 1.00\n-   Refresh Rate: 144Hz | 1.00\n-   Brightness: 350 nits | 0.80\n-   Color Gamut: 45% NTSC | 0.75\n-   Anti-glare: Yes | 0.90\n\n### Processor\n\n-   Model: Intel Core i7-13620H | 1.00\n-   Cores/Threads: 10 cores / 16 threads | 1.00\n-   Base Clock: 2.4 GHz | 1.00\n-   Boost Clock: Up to 4.9 GHz | 1.00\n-   Cache: 24MB | 1.00\n\n### Graphics\n\n-   Dedicated: NVIDIA GeForce RTX 4050 | 1.00\n-   VRAM: 6GB GDDR6 | 1.00\n-   Features: Ray Tracing, DLSS 3 | 0.95\n\n### Memory\n\n-   RAM: 8GB DDR5 | 0.90\n-   RAM Speed: 5200MHz | 0.90\n-   Expandability: Up to 32GB (2 SODIMM slots) | 0.75\n\n### Storage\n\n-   Type: NVMe PCIe Gen4 SSD | 0.95\n-   Capacity: 512GB | 1.00\n-   Expandability: One M.2 2280 PCIe 4.0 x4 slot available | 0.75\n\n### Connectivity\n\n-   Ports:\n    -   USB 3.2 Gen 1: 2 | 1.00\n    -   USB 3.2 Gen 2: 1 | 1.00\n    -   USB-C 3.2 Gen 2 (supports DisplayPort 1.4): 1 | 1.00\n    -   HDMI 2.1: 1 | 1.00\n    -   Ethernet (RJ45): 1 | 1.00\n    -   Headphone/microphone combo jack: 1 | 1.00\n    -   Power connector: 1 | 1.00\n-   Wi-Fi: Wi-Fi 6 (802.11ax) | 0.95\n-   Bluetooth: Bluetooth 5.1 | 0.95\n\n### Input/Output\n\n-   Keyboard: Full-size with numeric keypad, optional 4-zone RGB backlighting | 0.85\n-   Touchpad: Precision touchpad | 0.90\n-   Webcam: 1080p with privacy shutter | 0.90\n-   Speakers: Stereo speakers, Nahimic Audio | 0.85\n\n### Battery\n\n-   Capacity: 60Wh | 0.80\n-   Adapter: 170W | 0.80\n-   Battery Life: Up to 7 hours (mixed usage) | 0.60\n\n### Operating System & Software\n\n-   Operating System: Windows 11 Home | 1.00\n-   Pre-installed Software: Lenovo Vantage, Microsoft Office Trial | 0.80\n\n### Security Features\n\n-   Kensington Nano Security Slot | 0.80\n\n### Warranty & Support\n\n-   Standard Warranty: 1 year (may vary by region) | 0.70\n\n## Data Confidence Summary\n\n-   Overall Confidence Score: 0.88\n-   Last Verified: 2024-05-02\n-   Data Source Reliability: 0.85\n\n## Notes\n\n-   The specifications are based on the provided query and available information.\n-   Battery life is estimated and may vary depending on usage.\n-   RAM and storage are upgradeable, but the specific configurations may vary.\n-   Regional availability and configurations may differ.\n",
    },
    productDetails: {
      product_name:
        'LENOVO LOQ GAMING 15IRH8 i7-13620H 8GB 512GB RTX4050 6GB 15.6" OHS W11',
      brand: "LENOVO",
      price: "Rp15.849.000",
      rating: "5.0",
      category: "gaming_laptop",
      key_specifications: {
        display: {
          screen_size: "15.6 in",
          resolution: "1920x1080",
          refresh_rate: "144Hz",
          technology: "IPS",
        },
        performance: {
          processor: "Intel Core i7-13620H",
          ram: "8GB",
          storage: "512GB",
          gpu: "NVIDIA GeForce RTX 4050",
        },
        connectivity: {
          wifi: "Wi-Fi 6",
          bluetooth: "Bluetooth 5.2",
          ports: [
            "USB 3.2 Gen 1",
            "USB 3.2 Gen 2",
            "USB-C",
            "HDMI 2.1",
            "Ethernet",
            "Headphone / microphone combo jack",
          ],
        },
      },
      additional_features: [
        "4-Zone RGB Backlit Keyboard",
        "Windows 11 Home",
        "Lenovo LOQ M100 RGB Mouse",
      ],
    },
  },
};

const productSearchToolResult: InsightProductCardProps["content"] = {
  success: true,
  name: "searchProduct",
  args: {
    query: "asus rog zephyrus",
    reffSource: "insight",
  },
  data: {
    callId: "5c03e600-fb0d-4c84-b29f-d2777aea060a",
    data: {
      marketSource: "global",
      title: "ASUS ROG Zephyrus G14 (2024)",
      images: [
        "https://dlcdnwebimgs.asus.com/gain/E0275281-F18B-42C3-A025-3331C35A888F",
        "https://www.asus.com/us/site/gaming/assets/images/rog/Zephyrus-G14/kv-hero.webp",
        "https://i.pcmag.com/imagery/reviews/06n6ndAJmuUvKYLGv1njcn0-1..v1710540681.jpg",
        "https://m.media-amazon.com/images/I/61SEuRLdrYL._AC_UF894,1000_QL80_.jpg",
        "https://rog.asus.com/media/1704422071559.jpg",
        "https://dlcdnwebimgs.asus.com/files/media/F78BEA60-7937-4C78-A45A-F1AE66AADC68/v1/images/large/1x/audio_laptop_solid.png",
      ],
      videos: [
        "https://www.youtube.com/watch?v=-PQRLw-5RAw",
        "https://www.youtube.com/watch?v=PPAPD8Ld3JU",
        "https://www.youtube.com/watch?v=VDfLx4d7b8g",
        "https://www.youtube.com/watch?v=pB0HiKroITA",
        "https://www.youtube.com/watch?v=LFJcNXRPi-s",
        "https://www.youtube.com/watch?v=yrLtB944SjE",
      ],
      estimatedPrice: "$1,999.99",
      availableStore: [
        {
          name: "Best Buy",
          location: "US",
          isOfficial: false,
          rating: "4.5",
          sold: null,
          link: "https://www.bestbuy.com/site/asus-rog-zephyrus-g14-14-oled-3k-120hz-gaming-laptop-amd-ryzen-9-8945hs-32gb-lpddr5x-nvidia-geforce-rtx-4070-1tb-ssd-platinum-white/6570271.p?skuId=6570271",
        },
        {
          name: "Amazon.com - Seller",
          location: "US",
          isOfficial: false,
          rating: null,
          sold: null,
          link: "https://www.amazon.com/HIDevolution-Zephyrus-GA403UI-LPDDR5X-Windows/dp/B0CVL8QPQP?source=ps-sl-shoppingads-lpcontext&ref_=fplfs&psc=1&smid=A37874AY7SX62V",
        },
        {
          name: "Techinn.com",
          location: "US",
          isOfficial: false,
          rating: null,
          sold: null,
          link: "https://www.tradeinn.com/techinn/en/asus-rog-zephyrus-g14-2024-3k-oled-14-r9-8945hs-32gb-1tb-ssd-rtx-4060-gaming-laptop/142233842/p?utm_source=google_products&utm_medium=merchant&id_producte=148625506&country=us&srsltid=AfmBOoqcjwOG5jnzBMoJ0L2JKHGdI-mIVO6DVpJOVUmMgTOarq7WZ2r744M",
        },
        {
          name: "Microless.com",
          location: "US",
          isOfficial: false,
          rating: "4.5",
          sold: null,
          link: "https://global.microless.com/product/asus-rog-zephyrus-g14-ga403uv-gaming-laptop-14-3k-oled-120hz-display-amd-ryzen-9-8945hs-32gb-ram-1tb-ssd-geforce-rtx-4060-8gb-gpu-eng-arab-k-b-win11-white-ga403uv-oled9132w/?currency=usd&srsltid=AfmBOoqwU7C42-qySGnqQzdqMiZ5JISl1dhdPu8IHJpr39oGJ4GB8p3EUkQ",
        },
        {
          name: "Techinn.com",
          location: "US",
          isOfficial: false,
          rating: null,
          sold: null,
          link: "https://www.tradeinn.com/techinn/en/asus-rog-zephyrus-g14-2024-oled-14-r9-8945hs-32gb-1tb-ssd-rtx-4070-gaming-laptop/142233843/p?utm_source=google_products&utm_medium=merchant&id_producte=148625507&country=us&srsltid=AfmBOorAcRU5uPrrdEtvi1imAwMjvzCkzNSkZ3cFe0K3ie9pNuS0c-PGNBY",
        },
        {
          name: "Mercari",
          location: "US",
          isOfficial: false,
          rating: null,
          sold: null,
          link: "https://www.mercari.com/us/item/m21032342425/?srsltid=AfmBOoreQh4keNbT5MHX94LSOt1MWzjUCC_gNTY5iRYf39Ipr8nyW5k1liE",
        },
        {
          name: "Jawa.gg",
          location: "US",
          isOfficial: false,
          rating: null,
          sold: null,
          link: "https://www.jawa.gg/product/76778/asus-zephyrus-g14-oled-3k-120hz-g-sync-ryzen-9-8945hs-rtx-4060-1tb-16gb-accessories?srsltid=AfmBOoosRJpfh7UVqNeZVLO4o5DfrBhf72AKO-wnX_Myc6yr2Ab2fdPwctw",
        },
        {
          name: "eBay",
          location: "US",
          isOfficial: false,
          rating: "4.5",
          sold: null,
          link: "https://www.ebay.com/itm/146539547895?chn=ps&mkevt=1&mkcid=28&google_free_listing_action=view_item",
        },
        {
          name: "Truegether - Seller",
          location: "US",
          isOfficial: false,
          rating: "4.5",
          sold: null,
          link: "https://www.truegether.com/listing.html?id=USER.19040d14-0de5-45eb-b7fc-60a8f217f078&srsltid=AfmBOooOYMX5wf0Pp9gHOgWqB8ujhm6szhK3GFcUUloXUbOiV9AnKJAksRQ",
        },
        {
          name: "Walmart - Value Tech",
          location: "US",
          isOfficial: false,
          rating: "4",
          sold: null,
          link: "https://www.walmart.com/ip/ASUS-ROG-Zephyrus-G16-16-165Hz-Gaming-Laptop-FHD-Intel-13th-Gen-Core-i7-with-16GB-Memory-NVIDIA-GeForce-RTX-4070-512GB-SSD-Eclipse-Gray/7559354166?wmlspartner=wlpa&selectedSellerId=102705873&selectedOfferId=868D97F96CCC3A828A6B50413CA45B1E&conditionGroupCode=1",
        },
      ],
    },
  },
};

const mutated: ProductDetailsInsightProps["content"] = {
  success: true,
  name: "getProductDetails",
  args: {
    source: "insight" as const,
    query: "ASUS ROG Zephyrus G14 (2024)",
  },
  data: {
    callId: "c3fcdcff-0070-4af4-acb5-2157e6c29095",
    prevData: {
      title: "ASUS ROG Zephyrus G14 (2024)",
      estimatedPrice: "$1,999.99",
      reffCallId: "",
    },
    snapshots: {
      images: [
        "https://dlcdnwebimgs.asus.com/gain/E0275281-F18B-42C3-A025-3331C35A888F",
        "https://www.asus.com/us/site/gaming/assets/images/rog/Zephyrus-G14/kv-hero.webp",
        "https://i.pcmag.com/imagery/reviews/06n6ndAJmuUvKYLGv1njcn0-1..v1710540681.jpg",
        "https://m.media-amazon.com/images/I/61SEuRLdrYL._AC_UF894,1000_QL80_.jpg",
        "https://rog.asus.com/media/1704422071559.jpg",
        "https://dlcdnwebimgs.asus.com/files/media/F78BEA60-7937-4C78-A45A-F1AE66AADC68/v1/images/large/1x/audio_laptop_solid.png",
      ],
      videos: [
        "https://www.youtube.com/watch?v=-PQRLw-5RAw",
        "https://www.youtube.com/watch?v=PPAPD8Ld3JU",
        "https://www.youtube.com/watch?v=VDfLx4d7b8g",
        "https://www.youtube.com/watch?v=pB0HiKroITA",
        "https://www.youtube.com/watch?v=LFJcNXRPi-s",
        "https://www.youtube.com/watch?v=yrLtB944SjE",
      ],
    },
    externalData: {
      tavily:
        'The Lenovo LOQ 15IRH8 features an i7-13620H processor, 8GB RAM, 512GB SSD, and RTX 4050 6GB graphics. It runs on Windows 11 and has a 15.6" display.',
      markdown:
        "# Lenovo LOQ Gaming 15IRH8\n\n## Overview\n\nThe Lenovo LOQ Gaming 15IRH8 is a mid-range gaming laptop designed to offer a balance of performance and affordability. It features an Intel Core i7 processor, NVIDIA GeForce RTX 4050 graphics, and a 15.6-inch display, making it suitable for both gaming and everyday tasks.\n\n## Detailed Specifications\n\n### Design & Construction\n\n-   Materials: Plastic | 0.80\n-   Dimensions: 359.6 x 264.8 x 22.1-25.2 mm | 0.85\n-   Weight: Starting at 2.4 kg | 0.85\n-   Color: Storm Grey | 0.90\n\n### Display\n\n-   Size: 15.6 inch | 1.00\n-   Technology: IPS | 0.95\n-   Resolution: 1920 x 1080 (FHD) | 1.00\n-   Refresh Rate: 144Hz | 1.00\n-   Brightness: 350 nits | 0.80\n-   Color Gamut: 45% NTSC | 0.75\n-   Anti-glare: Yes | 0.90\n\n### Processor\n\n-   Model: Intel Core i7-13620H | 1.00\n-   Cores/Threads: 10 cores / 16 threads | 1.00\n-   Base Clock: 2.4 GHz | 1.00\n-   Boost Clock: Up to 4.9 GHz | 1.00\n-   Cache: 24MB | 1.00\n\n### Graphics\n\n-   Dedicated: NVIDIA GeForce RTX 4050 | 1.00\n-   VRAM: 6GB GDDR6 | 1.00\n-   Features: Ray Tracing, DLSS 3 | 0.95\n\n### Memory\n\n-   RAM: 8GB DDR5 | 0.90\n-   RAM Speed: 5200MHz | 0.90\n-   Expandability: Up to 32GB (2 SODIMM slots) | 0.75\n\n### Storage\n\n-   Type: NVMe PCIe Gen4 SSD | 0.95\n-   Capacity: 512GB | 1.00\n-   Expandability: One M.2 2280 PCIe 4.0 x4 slot available | 0.75\n\n### Connectivity\n\n-   Ports:\n    -   USB 3.2 Gen 1: 2 | 1.00\n    -   USB 3.2 Gen 2: 1 | 1.00\n    -   USB-C 3.2 Gen 2 (supports DisplayPort 1.4): 1 | 1.00\n    -   HDMI 2.1: 1 | 1.00\n    -   Ethernet (RJ45): 1 | 1.00\n    -   Headphone/microphone combo jack: 1 | 1.00\n    -   Power connector: 1 | 1.00\n-   Wi-Fi: Wi-Fi 6 (802.11ax) | 0.95\n-   Bluetooth: Bluetooth 5.1 | 0.95\n\n### Input/Output\n\n-   Keyboard: Full-size with numeric keypad, optional 4-zone RGB backlighting | 0.85\n-   Touchpad: Precision touchpad | 0.90\n-   Webcam: 1080p with privacy shutter | 0.90\n-   Speakers: Stereo speakers, Nahimic Audio | 0.85\n\n### Battery\n\n-   Capacity: 60Wh | 0.80\n-   Adapter: 170W | 0.80\n-   Battery Life: Up to 7 hours (mixed usage) | 0.60\n\n### Operating System & Software\n\n-   Operating System: Windows 11 Home | 1.00\n-   Pre-installed Software: Lenovo Vantage, Microsoft Office Trial | 0.80\n\n### Security Features\n\n-   Kensington Nano Security Slot | 0.80\n\n### Warranty & Support\n\n-   Standard Warranty: 1 year (may vary by region) | 0.70\n\n## Data Confidence Summary\n\n-   Overall Confidence Score: 0.88\n-   Last Verified: 2024-05-02\n-   Data Source Reliability: 0.85\n\n## Notes\n\n-   The specifications are based on the provided query and available information.\n-   Battery life is estimated and may vary depending on usage.\n-   RAM and storage are upgradeable, but the specific configurations may vary.\n-   Regional availability and configurations may differ.\n",
    },
    /** dynamic mutable */
    productDetails: {
      product_name:
        'LENOVO LOQ GAMING 15IRH8 i7-13620H 8GB 512GB RTX4050 6GB 15.6" OHS W11',
      brand: "LENOVO",
      price: "Rp15.849.000",
      rating: "5.0",
      category: "gaming_laptop",
      key_specifications: {
        display: {
          screen_size: "15.6 in",
          resolution: "1920x1080",
          refresh_rate: "144Hz",
          technology: "IPS",
        },
        performance: {
          processor: "Intel Core i7-13620H",
          ram: "8GB",
          storage: "512GB",
          gpu: "NVIDIA GeForce RTX 4050",
        },
        connectivity: {
          wifi: "Wi-Fi 6",
          bluetooth: "Bluetooth 5.2",
          ports: [
            "USB 3.2 Gen 1",
            "USB 3.2 Gen 2",
            "USB-C",
            "HDMI 2.1",
            "Ethernet",
            "Headphone / microphone combo jack",
          ],
        },
      },
      additional_features: [
        "4-Zone RGB Backlit Keyboard",
        "Windows 11 Home",
        "Lenovo LOQ M100 RGB Mouse",
      ],
    },
  },
};

export default function Page() {
  return (
    <div>
      <div className="flex flex-1 flex-col px-4">
        <div
          className="px-2 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24 max-w-[484px] md:max-w-3xl w-full mx-auto flex flex-col space-y-3 md:space-y-4"
          data-testid="chat-messages"
        >
          <ProductDetails content={toolData} />
          <ProductDetailsInsight content={mutated} />
          <InsightProductCardSkeleton type="details" />
        </div>
      </div>
    </div>
  );
}
