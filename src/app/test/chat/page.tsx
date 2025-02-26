"use client";

import { ExtendedMessage } from "@/components/maven/extended-message";
import { LoadingText } from "@/components/maven/shining-glass";
import { Chat } from "@/components/maven/main-chat";
import { ChatProperties, MessageProperty } from "@/lib/types/ai";
import { useSmartTextarea } from "@/components/hooks/use-smart-textare";
import { ProductComparisonSkeleton } from "@/components/maven/products-comparison-skeleton";
import { ProductComparison } from "@/components/maven/product-comparison";

const exampleMessages: MessageProperty[] = [
  {
    id: "L91jUORZzQJkeh6V",
    role: "user",
    content:
      '{"text_input":"Search for Lenovo Yoga","attach_product":null,"product_compare":null,"inquiry_response":null}',
  },
  {
    id: "mJwzjvbsr9MQZ4yC",
    role: "assistant",
    content: [
      {
        type: "tool-call",
        toolCallId: "vj2uviCGbr2W2U9V",
        toolName: "searchProduct",
        args: {
          query: "Lenovo Yoga",
        },
      },
    ],
  },
  {
    id: "uDYJRbcWVllncIIs",
    role: "tool",
    content: [
      {
        type: "tool-result",
        toolCallId: "vj2uviCGbr2W2U9V",
        toolName: "searchProduct",
        result:
          '{"success":true,"name":"searchProduct","args":{"query":"Lenovo Yoga"},"data":{"callId":"cb61913e-5c22-4ba3-9596-693b2d904d9c","screenshot":"https://service.firecrawl.dev/storage/v1/object/public/media/screenshot-860b5a2a-8840-4855-82ca-4dc381891143.png","data":[{"title":"Lenovo Yoga Slim 7 Pro X 14 3K Touch RTX3050 Ryzen 9 6900 32GB 1TB SSD","image":"https://images.tokopedia.net/img/cache/200-square/VqbcmM/2023/1/26/eced3f20-6f6d-4d08-84a8-57a34f914baa.jpg.webp?ect=4g","price":"Rp15.999.000","rating":"5.0","sold":"100+","link":"https://www.tokopedia.com/rogsstoreid/lenovo-yoga-slim-7-pro-x-14-3k-touch-rtx3050-ryzen-9-6900-32gb-1tb-ssd-laptop?extParam=ivf%3Dfalse%26keyword%3Dlenovo+yoga%26search_id%3D20250210124327E5AF7B92904D6F277Y5T%26src%3Dsearch","store":{"name":"ROGS STORE","location":"Jakarta Utara","isOfficial":true}},{"title":"Lenovo Thinkpad Yoga 11e Core i7 RAM 16GB BERGARANSI","image":"https://images.tokopedia.net/img/cache/200-square/VqbcmM/2024/10/29/8713c074-9d42-4bff-9328-fcba70183dd0.jpg.webp?ect=4g","price":"Rp2.200.000","rating":"4.7","sold":"24","link":"https://www.tokopedia.com/foxcomp/lenovo-thinkpad-yoga-11e-core-i7-ram-16gb-bergaransi-1730827134429791872?extParam=ivf%3Dfalse%26keyword%3Dlenovo+yoga%26search_id%3D20250210124327E5AF7B92904D6F277Y5T%26src%3Dsearch","store":{"name":"FoxComp","location":"Jakarta Pusat","isOfficial":false}},{"title":"LAPTOP LENOVO THINKPAD YOGA X13 G2 GEN11 RAM 16 GB NVME 4 TB PROMO MURAH BAGUS BERGARANSI","image":"https://images.tokopedia.net/img/cache/200-square/VqbcmM/2024/12/31/c4506472-4ae0-4ee1-898a-a0b508972f8a.jpg.webp?ect=4g","price":"Rp4.090.000","rating":"5.0","sold":"40+","link":"https://www.tokopedia.com/rajamurahpedia/laptop-lenovo-thinkpad-yoga-x13-g2-gen11-ram-16-gb-nvme-4-tb-promo-murah-bagus-bergaransi-x13-i5-g10-nt-ram-16-nvme-256-29d31?extParam=ivf%3Dfalse%26keyword%3Dlenovo+yoga%26search_id%3D20250210124327E5AF7B92904D6F277Y5T%26src%3Dsearch","store":{"name":"Raja Murah Pedia","location":"Jakarta Utara","isOfficial":false}},{"title":"LENOVO YOGA SLIM PRO 9 3K CORE i9 13095H 32GB 1T RTX4050 6G W11PRO 16\\"","image":"https://images.tokopedia.net/img/cache/200-square/VqbcmM/2024/11/6/6823d16d-c361-41df-a227-67e32d2c8ebb.jpg.webp?ect=4g","price":"Rp19.399.000","rating":"4.8","sold":"50+","link":"https://www.tokopedia.com/toptech/lenovo-yoga-slim-pro-9-3k-core-i9-13095h-32gb-1t-rtx4050-6g-w11pro-16-non-bundling-bc6ed?extParam=ivf%3Dfalse%26keyword%3Dlenovo+yoga%26search_id%3D20250210124327E5AF7B92904D6F277Y5T%26src%3Dsearch","store":{"name":"Top Tech","location":"Jakarta Utara","isOfficial":true}},{"title":"Lenovo Yoga Pro 7i Intel Ultra 7 155H RTX4050 1TB SSD 32GB OLED 2.8K 120Hz Win11+OHS","image":"https://images.tokopedia.net/img/cache/200-square/VqbcmM/2024/12/9/3e8959ec-6fbf-4b30-8c78-f7e1efe717aa.jpg.webp?ect=4g","price":"Rp23.499.000","rating":"5.0","sold":"90+","link":"https://www.tokopedia.com/sinarmulia/lenovo-yoga-pro-7i-intel-ultra-7-155h-rtx4050-1tb-ssd-32gb-oled-2-8k-120hz-win11-ohs-tanpa-antigores-f4322?extParam=ivf%3Dfalse%26keyword%3Dlenovo+yoga%26search_id%3D20250210124327E5AF7B92904D6F277Y5T%26src%3Dsearch","store":{"name":"Sinarmulia Sukses Makmur","location":"Jakarta Barat","isOfficial":true}},{"title":"Lenovo Yoga Slim 7 Aura Edition 15ILL9 Ultra 7 258V 32GB 1TB SSD 15.3 2.8K 120Hz Touch","image":"https://images.tokopedia.net/img/cache/200-square/VqbcmM/2024/11/22/2d08552d-6db7-41eb-935b-22192a0cc8ba.jpg.webp?ect=4g","price":"Rp27.999.000","rating":"5.0","sold":"10","link":"https://www.tokopedia.com/lenovoyogaofficial/lenovo-yoga-slim-7-aura-edition-15ill9-ultra-7-258v-32gb-1tb-ssd-15-3-2-8k-120hz-touch-tanpa-paket-windows-11-home-e696f?extParam=ivf%3Dfalse%26keyword%3Dlenovo+yoga%26search_id%3D20250210124327E5AF7B92904D6F277Y5T%26src%3Dsearch","store":{"name":"Lenovo Yoga Official","location":"Jakarta Pusat","isOfficial":true}}]}}',
      },
    ],
  },
  {
    id: "p3anXluJIOCDIKHJ",
    role: "assistant",
    content:
      "**Insights for Lenovo Yoga**\n\n1.  **Price Range**: The products range from **Rp2.200.000** (Lenovo Thinkpad Yoga 11e) to **Rp27.999.000** (Lenovo Yoga Slim 7 Aura Edition), showing a very wide range of options from budget-friendly to high-end premium.\n\n2.  **Best Value**: The **Lenovo Thinkpad Yoga X13 G2** offers a good balance of features and price at **Rp4.090.000**, with a 5.0 rating and 40+ units sold, making it a solid mid-range option.\n\n3.  **Top Performer**: The **Lenovo Yoga Slim 7 Pro X 14** stands out with a **5.0 rating** and **100+ units sold**, indicating high customer satisfaction and a strong reputation.\n\n4. **Store Reputation**: **ROGS STORE, Top Tech, Sinarmulia Sukses Makmur, and Lenovo Yoga Official** are official retailers, ensuring product authenticity and reliable customer service.\n\n5. **Feature Trends**: Most products offer high-resolution displays and powerful processors, but the higher-end models like the **Lenovo Yoga Pro 7i** and **Lenovo Yoga Slim 7 Aura Edition** include advanced features such as OLED screens, dedicated RTX graphics cards, and higher refresh rates.\n",
  },
  {
    id: "6IHiwUmPxE0TlBuP",
    role: "user",
    content:
      '{"text_input":"Does the RTX capability are equal to desktop version?","attach_product":{"product":{"id":"uNqnSLvgonEubYcJ","title":"Lenovo Yoga Slim 7 Pro X 14 3K Touch RTX3050 Ryzen 9 6900 32GB 1TB SSD","link":"https://www.tokopedia.com/rogsstoreid/lenovo-yoga-slim-7-pro-x-14-3k-touch-rtx3050-ryzen-9-6900-32gb-1tb-ssd-laptop?extParam=ivf%3Dfalse%26keyword%3Dlenovo+yoga%26search_id%3D20250210124327E5AF7B92904D6F277Y5T%26src%3Dsearch"}},"product_compare":null,"inquiry_response":null}',
  },
  {
    id: "lkjxswftMnvCfgZK",
    role: "assistant",
    content: [
      {
        type: "tool-call",
        toolCallId: "xyfBTxXulLelroMu",
        toolName: "getProductDetails",
        args: {
          link: "https://www.tokopedia.com/rogsstoreid/lenovo-yoga-slim-7-pro-x-14-3k-touch-rtx3050-ryzen-9-6900-32gb-1tb-ssd-laptop?extParam=ivf%3Dfalse%26keyword%3Dlenovo+yoga%26search_id%3D20250210124327E5AF7B92904D6F277Y5T%26src%3Dsearch",
          query:
            "Lenovo Yoga Slim 7 Pro X 14 3K Touch RTX3050 Ryzen 9 6900 32GB 1TB SSD",
        },
      },
    ],
  },
  {
    id: "nsGlt3kUzMqnUXMx",
    role: "tool",
    content: [
      {
        type: "tool-result",
        toolCallId: "xyfBTxXulLelroMu",
        toolName: "getProductDetails",
        result:
          '{"success":true,"name":"getProductDetails","args":{"link":"https://www.tokopedia.com/rogsstoreid/lenovo-yoga-slim-7-pro-x-14-3k-touch-rtx3050-ryzen-9-6900-32gb-1tb-ssd-laptop?extParam=ivf%3Dfalse%26keyword%3Dlenovo+yoga%26search_id%3D20250210124327E5AF7B92904D6F277Y5T%26src%3Dsearch","query":"Lenovo Yoga Slim 7 Pro X 14 3K Touch RTX3050 Ryzen 9 6900 32GB 1TB SSD"},"data":{"callId":"c43654fa-795d-493e-bfc9-98532d71c9a5","screenshot":"https://service.firecrawl.dev/storage/v1/object/public/media/screenshot-a53ec9d0-2b46-4a15-a168-d6ee3b3cfc2a.png","productDetails":{"product_name":"Lenovo Yoga Slim 7 Pro X 14 3K Touch RTX3050 Ryzen 9 6900 32GB 1TB SSD","brand":"Lenovo","price":"Rp15.999.000","category":"laptop","key_specifications":{"display":{"screen_size":"14.5 in","resolution":"3072x1920","refresh_rate":"120Hz","technology":"IPS"},"performance":{"processor":"AMD Ryzen 9 6900HS Creator Edition","ram":"32GB","storage":"1TB","gpu":"NVIDIA GeForce RTX 3050 4GB GDDR6"},"connectivity":{"wifi":"Wi-Fi 6","bluetooth":"BT5.1","ports":["USB 3.2 Gen 1","USB 3.2 Gen 1 (Always On)","USB-C 3.2 Gen 2 (support data transfer, Power Delivery 3.0 and DisplayPort 1.4)","Headphone / microphone combo jack (3.5mm)"]}},"additional_features":["Touchscreen"]}}}',
      },
    ],
  },
  {
    id: "xO91BIDIgNgkjznr",
    role: "assistant",
    content:
      "When it comes to the RTX 3050 in the Lenovo Yoga Slim 7 Pro X, it's important to know that laptop GPUs like this one don't quite match the power of their desktop counterparts.\n\n**Here's what you should keep in mind:**\n\n*   **Performance Trade-off:** The RTX 3050 in this laptop is designed to balance performance with battery life and thermal efficiency. This means it won't deliver the exact same level of graphical horsepower as a desktop RTX 3050.\n*   **Still Great for Many Tasks:** That being said, the RTX 3050 is still a capable GPU. You'll be able to enjoy smooth gaming at medium settings, handle video editing, and run other graphically intensive applications without major issues.\n*   **Consider Your Needs:** If you're a hardcore gamer looking for the highest frame rates and ultra settings, a desktop with a dedicated GPU might be a better choice. But if you value portability and need a machine that can handle both work and play, the Yoga Slim 7 Pro X is a solid option.",
  },
  {
    id: "Fup111CQ1QQHYx0u",
    role: "user",
    content:
      '{"text_input":"Search for Asus TUF laptop","attach_product":null,"product_compare":null,"inquiry_response":null}',
  },
  {
    id: "rbDYUrOG1ybhLoVe",
    role: "assistant",
    content: [
      {
        type: "tool-call",
        toolCallId: "uTedi2h1wX1vNMPd",
        toolName: "searchProduct",
        args: {
          query: "Asus TUF laptop",
        },
      },
    ],
  },
  {
    id: "xtyuSt498ZAMiMI6",
    role: "tool",
    content: [
      {
        type: "tool-result",
        toolCallId: "uTedi2h1wX1vNMPd",
        toolName: "searchProduct",
        result:
          '{"success":true,"name":"searchProduct","args":{"query":"Asus TUF laptop"},"data":{"callId":"e0f072a7-440f-40d7-86a2-8145525b5677","screenshot":"https://service.firecrawl.dev/storage/v1/object/public/media/screenshot-a76518d3-6daf-4575-b5b8-a7655a28d4e2.png","data":[{"title":"Laptop Asus TUF A15 FA507NUR-R745K6M-O AMD Ryzen 7-7435HS 16GB 512GB SSD RTX4050 6GB 15.6″ FHD 144Hz Win 11 - Mecha Gray","image":"https://images.tokopedia.net/img/cache/200-square/VqbcmM/2024/6/18/6970b39c-9f8d-49ca-b843-b2aac9c129de.jpg.webp?ect=4g","price":"Rp15.999.000","rating":"5.0","sold":"12 terjual","link":"https://www.tokopedia.com/asusrogindonesia/laptop-asus-tuf-a15-fa507nur-r745k6m-o-amd-ryzen-7-7435hs-16gb-512gb-ssd-rtx4050-6gb-15-6-fhd-144hz-win-11-mecha-gray-laptop-16gb-512gb-6488d?extParam=ivf%3Dfalse%26keyword%3Dasus+tuf+laptop%26search_id%3D2025021606020495C86292085D9D374KDE%26src%3Dsearch","store":{"name":"ASUS ROG Indonesia","location":"Jakarta Pusat","isOfficial":true}},{"title":"ASUS LAPTOP GAMING TUF A15 FA507NVR-R746K6M-O 15.6\\" FHD AMD RYZEN 7 7435HS NVIDIA GEFORCE RTX 4060 RAM 16GB ROM 512GB SSD WINDOWS 11","image":"https://images.tokopedia.net/img/cache/200-square/VqbcmM/2024/7/13/2e20de59-aaf3-4afe-b572-0169bb41ecfa.jpg.webp?ect=4g","price":"Rp16.669.000","rating":"5.0","sold":null,"link":"https://www.tokopedia.com/amdauthorizedjakarta/asus-laptop-gaming-tuf-a15-fa507nvr-r746k6m-o-15-6-fhd-amd-ryzen-7-7435hs-nvidia-geforce-rtx-4060-ram-16gb-rom-512gb-ssd-windows-11-m365-b98f0?extParam=ivf%3Dfalse%26keyword%3Dasus+tuf+laptop%26search_id%3D2025021606020495C86292085D9D374KDE%26src%3Dsearch","store":{"name":"AMD Authorized Jakarta","location":"Jakarta Timur","isOfficial":false}},{"title":"Laptop Asus TUF A15 FA506NFR-R725B6T-O AMD Ryzen 7-7435HS 16GB 512GB SSD RTX2050 4G 15.6″ FHD 144Hz Win 11 OHS - Graphite Black","image":"https://images.tokopedia.net/img/cache/200-square/VqbcmM/2024/6/28/ef6a6fd9-1506-4d2c-b7a1-b7a4bc49248c.jpg.webp?ect=4g","price":"Rp11.099.000","rating":"5.0","sold":"15 terjual","link":"https://www.tokopedia.com/asusrogindonesia/laptop-asus-tuf-a15-fa506nfr-r725b6t-o-amd-ryzen-7-7435hs-16gb-512gb-ssd-rtx2050-4g-15-6-fhd-144hz-win-11-ohs-graphite-black-laptop-16gb-512gb-b3831?extParam=ivf%3Dfalse%26keyword%3Dasus+tuf+laptop%26search_id%3D2025021606020495C86292085D9D374KDE%26src%3Dsearch","store":{"name":"ASUS ROG Indonesia","location":"Jakarta Pusat","isOfficial":true}},{"title":"Laptop Gaming Asus TUF A16 FA617NT ADVANTAGE AMD Ryzen 7 7735H Radeon RX 7700S Ram 64GB 1TB SSD 16.0 Inch 165Hz IPS Windows 11 Home Black","image":"https://images.tokopedia.net/img/cache/200-square/VqbcmM/2025/1/13/714e1bc1-a385-47cc-b854-96ba599552fd.jpg.webp?ect=4g","price":"Rp17.399.000","rating":"5.0","sold":"6 terjual","link":"https://www.tokopedia.com/maximal-id/laptop-gaming-asus-tuf-a16-fa617nt-advantage-amd-ryzen-7-7735h-radeon-rx-7700s-ram-64gb-1tb-ssd-16-0-inch-165hz-ips-windows-11-home-black-rx7700s-16gb-2tb-ssd-9a43c?extParam=ivf%3Dfalse%26keyword%3Dasus+tuf+laptop%26search_id%3D2025021606020495C86292085D9D374KDE%26src%3Dsearch","store":{"name":"MAXIMAL ID JAKARTA","location":"Jakarta Selatan","isOfficial":false}},{"title":"TERMURAH NASIONAL Laptop Asus TUF ThunderBolt Core Gen12 i7 12650 RTX3","image":"https://images.tokopedia.net/img/cache/200-square/VqbcmM/2024/11/8/1edd60e5-28f7-4093-ac8a-766390a8fb84.jpg.webp?ect=4g","price":"Rp11.866.000","rating":"5.0","sold":"12 terjual","link":"https://www.tokopedia.com/laptopjutawan/termurah-nasional-laptop-asus-tuf-thunderbolt-core-gen12-i7-12650-rtx3-i5-rtx3050-d7b6b?extParam=ivf%3Dfalse%26keyword%3Dasus+tuf+laptop%26search_id%3D2025021606020495C86292085D9D374KDE%26src%3Dsearch","store":{"name":"LAPTOP JUTAWAN","location":"Jakarta Selatan","isOfficial":false}},{"title":"Laptop Asus TUF Gaming FX505DD Ryzen 5-3550H Ram8/1TB VGA GTX1050 4GB","image":"https://images.tokopedia.net/img/cache/200-square/VqbcmM/2023/1/13/9764e471-0a29-4a6d-b4d0-f1f2d95c8f50.jpg.webp?ect=4g","price":"Rp6.800.000","rating":"4.7","sold":"4 terjual","link":"https://www.tokopedia.com/syifarezza/laptop-asus-tuf-gaming-fx505dd-ryzen-5-3550h-ram8-1tb-vga-gtx1050-4gb?extParam=ivf%3Dfalse%26keyword%3Dasus+tuf+laptop%26search_id%3D2025021606020495C86292085D9D374KDE%26src%3Dsearch","store":{"name":"Syifa Rezza","location":"Jakarta Barat","isOfficial":false}}]}}',
      },
    ],
  },
  {
    id: "6dFPxcTRtNNMoAVk",
    role: "assistant",
    content:
      "**Insights for [ASUS TUF Laptop]**\n\n1.  **Price Range**: The products range from **Rp6.800.000** (ASUS TUF Gaming FX505DD) to **Rp17.399.000** (Laptop Gaming Asus TUF A16 FA617NT), offering options for various budgets.\n\n2.  **Best Value**: The **Laptop Asus TUF A15 FA506NFR-R725B6T-O** at **Rp11.099.000** offers a good balance of price and features, including an RTX 2050 GPU and 144Hz display, suitable for budget-conscious gamers.\n\n3.  **Top Performer**: The **Laptop Asus TUF A15 FA507NUR-R745K6M-O** and **Laptop Asus TUF A15 FA506NFR-R725B6T-O** stand out with **5.0 ratings** and **12 and 15 units sold** respectively, indicating high customer satisfaction.\n\n4.  **Store Reputation**: **ASUS ROG Indonesia** is an official retailer, offering two of the listed laptops (FA507NUR-R745K6M-O and FA506NFR-R725B6T-O), ensuring authenticity and reliable support.\n\n5. **Feature Variety**: Most products feature Ryzen 7 processors and 144Hz displays, but graphics cards range from GTX 1050 to RTX 4060, catering to different gaming performance needs. The lowest priced option has significantly lower specifications than the others, and should be considered separately.\n",
  },
  {
    id: "FLsJIvsu5nbDrkq3",
    role: "user",
    content:
      '{"text_input":"Does it good for 3d rendering?","attach_product":{"product":{"id":"N5TleVDLwmKiIqa5","title":"Laptop Asus TUF A15 FA507NUR-R745K6M-O AMD Ryzen 7-7435HS 16GB 512GB SSD RTX4050 6GB 15.6″ FHD 144Hz Win 11 - Mecha Gray","link":"https://www.tokopedia.com/asusrogindonesia/laptop-asus-tuf-a15-fa507nur-r745k6m-o-amd-ryzen-7-7435hs-16gb-512gb-ssd-rtx4050-6gb-15-6-fhd-144hz-win-11-mecha-gray-laptop-16gb-512gb-6488d?extParam=ivf%3Dfalse%26keyword%3Dasus+tuf+laptop%26search_id%3D2025021606020495C86292085D9D374KDE%26src%3Dsearch"}},"product_compare":null,"inquiry_response":null}',
  },
  {
    id: "e7slsgRkameBWEzz",
    role: "assistant",
    content: [
      {
        type: "tool-call",
        toolCallId: "2colve7PM5QrWgbs",
        toolName: "getProductDetails",
        args: {
          link: "https://www.tokopedia.com/asusrogindonesia/laptop-asus-tuf-a15-fa507nur-r745k6m-o-amd-ryzen-7-7435hs-16gb-512gb-ssd-rtx4050-6gb-15-6-fhd-144hz-win-11-mecha-gray-laptop-16gb-512gb-6488d?extParam=ivf%3Dfalse%26keyword%3Dasus+tuf+laptop%26search_id%3D2025021606020495C86292085D9D374KDE%26src%3Dsearch",
          query:
            "Laptop Asus TUF A15 FA507NUR-R745K6M-O AMD Ryzen 7-7435HS 16GB 512GB SSD RTX4050 6GB 15.6″ FHD 144Hz Win 11 - Mecha Gray",
        },
      },
    ],
  },
  {
    id: "oiHpQh7Etk0UZrhJ",
    role: "tool",
    content: [
      {
        type: "tool-result",
        toolCallId: "2colve7PM5QrWgbs",
        toolName: "getProductDetails",
        result:
          '{"success":true,"name":"getProductDetails","args":{"link":"https://www.tokopedia.com/asusrogindonesia/laptop-asus-tuf-a15-fa507nur-r745k6m-o-amd-ryzen-7-7435hs-16gb-512gb-ssd-rtx4050-6gb-15-6-fhd-144hz-win-11-mecha-gray-laptop-16gb-512gb-6488d?extParam=ivf%3Dfalse%26keyword%3Dasus+tuf+laptop%26search_id%3D2025021606020495C86292085D9D374KDE%26src%3Dsearch","query":"Laptop Asus TUF A15 FA507NUR-R745K6M-O AMD Ryzen 7-7435HS 16GB 512GB SSD RTX4050 6GB 15.6″ FHD 144Hz Win 11 - Mecha Gray"},"data":{"callId":"9de6c882-d340-404d-adc0-1bd36e7f43fb","screenshot":"https://service.firecrawl.dev/storage/v1/object/public/media/screenshot-d8a2a149-45e1-49ac-9252-c54abe55e486.png","productDetails":{"product_name":"Laptop Asus TUF A15 FA507NUR-R745K6M-O AMD Ryzen 7-7435HS 16GB 512GB SSD RTX4050 6GB 15.6″ FHD 144Hz Win 11 - Mecha Gray","brand":"ASUS","price":"Rp19.999.000","category":"laptop","key_specifications":{"display":{"screen_size":"15.6 in","resolution":"1920 x 1080","refresh_rate":"144Hz"},"performance":{"processor":"AMD Ryzen 7 7435HS","ram":"16GB","storage":"512GB","gpu":"NVIDIA GeForce RTX 4050"},"connectivity":{"ports":["1x 3.5mm Combo Audio Jack","1x HDMI 2.1 FRL","2x USB 3.2 Gen 1 Type-A","1x USB 3.2 Gen 2 Type-C","1x RJ45 LAN port","1x Type C USB 4 support DisplayPort"],"wifi":"Wi-Fi 6","bluetooth":"Bluetooth 5.3"},"battery":{"capacity":"90WHrs"},"audio":{"speakers":"2-speaker system","microphone":"unspecified"}},"additional_features":["Backlit Chiclet Keyboard 1-Zone RGB","720P HD camera"]}}}',
      },
    ],
  },
  {
    id: "SZJ4HacgYHmq56ZQ",
    role: "assistant",
    content:
      "Okay, let's talk about whether the Asus TUF A15 is a good fit for 3D rendering.\n\nFor 3D rendering, you'll want a laptop that can handle demanding tasks, and this one has some promising specs. The **NVIDIA GeForce RTX 4050** is a solid graphics card that should give you a good experience with most 3D software. Plus, the **AMD Ryzen 7 7435HS** processor and **16GB of RAM** mean you'll be able to run multiple programs smoothly.\n\nThe **512GB SSD** might fill up quickly with large project files, so you might want to consider an external drive for extra storage.\n\nOverall, this laptop should be capable for 3D rendering, especially if you're not working on super complex scenes.\n",
  },
  {
    id: "wBOGFnDmds6Lh1gn",
    role: "user",
    content:
      '{"text_input":"Which has better in terms of versatility?, especially in 3D rendering and video editing and multi tasking?","attach_product":null,"product_compare":{"for":[{"title":"Lenovo Yoga Slim 7 Pro X 14 3K Touch RTX3050 Ryzen 9 6900 32GB 1TB SSD","callId":"c43654fa-795d-493e-bfc9-98532d71c9a5"},{"title":"Laptop Asus TUF A15 FA507NUR-R745K6M-O AMD Ryzen 7-7435HS 16GB 512GB SSD RTX4050 6GB 15.6″ FHD 144Hz Win 11 - Mecha Gray","callId":"9de6c882-d340-404d-adc0-1bd36e7f43fb"}]},"inquiry_response":null}',
  },
  {
    id: "t2C7lX26jtbUyrZt",
    role: "assistant",
    content: [
      {
        type: "tool-call",
        toolCallId: "9WmWKYHRRS2bd3ru",
        toolName: "productsComparison",
        args: {
          compare: [
            {
              title:
                "Lenovo Yoga Slim 7 Pro X 14 3K Touch RTX3050 Ryzen 9 6900 32GB 1TB SSD",
              callId: "c43654fa-795d-493e-bfc9-98532d71c9a5",
            },
            {
              title:
                "Laptop Asus TUF A15 FA507NUR-R745K6M-O AMD Ryzen 7-7435HS 16GB 512GB SSD RTX4050 6GB 15.6″ FHD 144Hz Win 11 - Mecha Gray",
              callId: "9de6c882-d340-404d-adc0-1bd36e7f43fb",
            },
          ],
        },
      },
    ],
  },
  {
    id: "aOb8o8swADK8OjmQ",
    role: "tool",
    content: [
      {
        type: "tool-result",
        toolCallId: "9WmWKYHRRS2bd3ru",
        toolName: "productsComparison",
        result:
          '{"success":true,"name":"productsComparison","args":{"compare":[{"title":"Lenovo Yoga Slim 7 Pro X 14 3K Touch RTX3050 Ryzen 9 6900 32GB 1TB SSD","callId":"c43654fa-795d-493e-bfc9-98532d71c9a5"},{"title":"Laptop Asus TUF A15 FA507NUR-R745K6M-O AMD Ryzen 7-7435HS 16GB 512GB SSD RTX4050 6GB 15.6″ FHD 144Hz Win 11 - Mecha Gray","callId":"9de6c882-d340-404d-adc0-1bd36e7f43fb"}]},"data":{"callId":"e4cd9ab0-7bc9-416f-9529-aa6f169eef39","productImages":["https://service.firecrawl.dev/storage/v1/object/public/media/screenshot-a53ec9d0-2b46-4a15-a168-d6ee3b3cfc2a.png","https://service.firecrawl.dev/storage/v1/object/public/media/screenshot-d8a2a149-45e1-49ac-9252-c54abe55e486.png"],"comparison":{"products":[{"product_name":"Lenovo Yoga Slim 7 Pro X 14","brand":"Lenovo","price":"Rp15.999.000","external_data":null,"common_specs":{"display_size":"14.5\\"","processor":"AMD Ryzen 9 6900HS","ram":"32 GB","storage":"1 TB SSD","gpu":"NVIDIA GeForce RTX 3050"},"category_specific_specs":{"display_resolution":"3072x1920","display_technology":"IPS","display_refresh_rate":"120 Hz","ports":["USB 3.2 Gen 1","USB 3.2 Gen 1 (Always On)","USB-C 3.2 Gen 2","Headphone / microphone combo jack (3.5mm)"],"wireless":"Wi-Fi 6, BT5.1"}},{"product_name":"ASUS TUF A15 FA507NUR","brand":"ASUS","price":"Rp19.999.000","external_data":null,"common_specs":{"display_size":"15.6\\"","processor":"AMD Ryzen 7 7435HS","ram":"16 GB","storage":"512 GB SSD","gpu":"NVIDIA GeForce RTX 4050"},"category_specific_specs":{"display_resolution":"1920x1080","display_refresh_rate":"144 Hz","battery_capacity":"90 Wh","ports":["3.5mm Combo Audio Jack","HDMI 2.1 FRL","USB 3.2 Gen 1 Type-A","USB 3.2 Gen 2 Type-C","RJ45 LAN port","Type C USB 4"],"wireless":"Wi-Fi 6, Bluetooth 5.3"}}],"key_differences":["Display Size: ASUS is 1.1\\" larger","Processor: Lenovo has Ryzen 9 vs ASUS Ryzen 7","RAM: Lenovo has 32GB vs ASUS 16GB","Storage: Lenovo has 1TB vs ASUS 512GB","GPU: ASUS has RTX 4050 vs Lenovo RTX 3050","Display Resolution: Lenovo has higher resolution (3072x1920 vs 1920x1080)","Battery: ASUS has a specified battery capacity (90Whrs) while Lenovo\'s is unspecified."]}}}',
      },
    ],
  },
  {
    id: "OlQ0o9hWE1n0nRJp",
    role: "assistant",
    content:
      "**Insight for Versatility in 3D Rendering, Video Editing, and Multitasking:**\n\nBoth laptops offer strengths for demanding tasks, but the **ASUS TUF A15 FA507NUR** generally provides better versatility for 3D rendering and video editing due to its more powerful GPU, while the **Lenovo Yoga Slim 7 Pro X 14** excels in multitasking due to its larger RAM.\n\n1.  **GPU Performance (3D Rendering & Video Editing):**\n\n    *   The ASUS TUF A15's **RTX 4050** is a newer generation GPU and offers significantly better performance in 3D rendering and video editing compared to the Lenovo Yoga Slim 7 Pro X 14's RTX 3050. Expect faster render times and smoother performance in GPU-intensive tasks.\n    *   While specific benchmark data isn't provided, the RTX 4050 generally outperforms the RTX 3050 by a significant margin in tasks like ray tracing and AI-assisted rendering.\n\n2.  **Processor Performance:**\n\n    *   The Lenovo Yoga Slim 7 Pro X 14 has **AMD Ryzen 9 6900HS** which is a higher end processor than the **AMD Ryzen 7 7435HS** in the ASUS TUF A15.\n\n3.  **RAM (Multitasking):**\n\n    *   The Lenovo Yoga Slim 7 Pro X 14's **32GB of RAM** is a significant advantage for heavy multitasking, especially when working with large files in video editing or 3D rendering software. The ASUS TUF A15's 16GB might become a bottleneck in such scenarios.\n\n4.  **Storage:**\n\n    *   The Lenovo Yoga Slim 7 Pro X 14's **1TB SSD** provides more storage space for large project files and software installations compared to the ASUS TUF A15's 512GB SSD.\n\n5.  **Display:**\n\n    *   The Lenovo Yoga Slim 7 Pro X 14 has a higher resolution display (3072x1920) which is better for detail-oriented work in video editing and 3D modeling. The ASUS TUF A15 has a lower resolution (1920x1080).\n\n**Recommendation:**\n\n*   **For users prioritizing 3D rendering and video editing performance:** The **ASUS TUF A15** is the better choice due to its more powerful RTX 4050 GPU.\n*   **For users prioritizing heavy multitasking and larger storage:** The **Lenovo Yoga Slim 7 Pro X 14** is the better choice due to its larger RAM and storage.\n",
  },
];

const chat: ChatProperties = {
  created: new Date("2025-02-22T03:44:06.877Z"),
  title: "Lenovo Yoga Laptops: Prices, Specs & Top Picks",
  userId: "agungprase9957@gmail.com",
  chatId: "5936071e-ace4-4973-8176-8c84a1dfb45e",
  messages: exampleMessages,
};

export default function Page() {
  const {
    input,
    attachment,
    setInput,
    detach,
    flush,
    removeFromComparison,
    activeComparison,
    search,
    related,
    setSearch,
    setRelated,
  } = useSmartTextarea();

  const exampleData = `
## Laptop Lenovo Yoga Slim 7 14
## Overview

The Lenovo Yoga Slim 7 is a highperformance laptop designed for content creators. It features a 14-inch display, AMD Ryzen processor, and a dedicated graphics card.

## Detailed Specifications

### Design & Build

-   **Dimensions:** 305.5 x 223.5 x 17.9 mm | 1.00
-   **Weight:** 1.4 kg | 1.00
-   **Materials:** Aluminum | 1.00
-   **Colors:** Storm Grey | 1.00
-   **Durability Ratings:** N/A | 0.00

### Display

-   **Size:** 14-inch | 1.00
-   **Technology:** IPS | 1.00
-   **Resolution:** 2880 x 1800 | 1.00
-   **Refresh Rate:** 90Hz | 1.00
-   **Touchscreen:** Yes | 1.00
-   **Protection:** Corning Gorilla Glass | 0.80

### Performance

-   **Processor:** AMD Ryzen 9 6900HS | 1.00
-   **GPU:** NVIDIA GeForce RTX 3050 | 1.00
-   **Benchmarks:** N/A | 0.00

### Memory & Storage

-   **RAM:** 32GB | 1.00
-   **RAM Type:** LPDDR5 | 1.00
-   **Storage:** 1TB SSD | 1.00
-   **Expandable Storage:** N/A | 0.00

### Camera System

-   **Webcam:** 1080p | 1.00
-   **Features:** Privacy Shutter | 1.00

### Battery

-   **Capacity:** 61Wh | 1.00
-   **Charging:** 65W USB-C | 1.00

### Connectivity

-   **Ports:** 2 x USB 3.2 Gen 1, 2 x USB4 Type-C, HDMI 2.1, Headphone/Mic Combo Jack | 1.00
-   **Wi-Fi:** Wi-Fi 6E | 1.00
-   **Bluetooth:** 5.2 | 1.00

### Software

-   **Operating System:** Windows 11 Home | 1.00
-   **Pre-installed Software:** Lenovo Vantage | 1.00

### Security Features

-   **Fingerprint Reader:** Yes | 1.00
-   **Encryption:** TPM 2.0 | 1.00

### Additional Features

-   **Speakers:** Stereo Speakers | 1.00
-   **Microphone:** Dual Array Microphones | 1.00

### Package Contents

-   **Laptop:** Lenovo Yoga Slim 7 | 1.00
-   **Charger:** 65W USB-C Charger | 1.00
-   **Documentation:** User Manual | 1.00

### Warranty Information

-   **Warranty:** 1 Year Limited Warranty | 1.00

## Data Confidence Summary

-   **Overall Confidence Score:** 0.95
-   **Last Verified:** 2024-05-08
-   **Data Source Reliability:** 0.95

## Notes

-   The specifications are based on the Lenovo Yoga Slim 7 Pro 14.
-   The data is based on the information available from the manufacturer and other reliable sources.
-   Some specifications may vary depending on the specific configuration.
-   The "Durability Ratings" and "Benchmarks" are not available.
`;

  const tavilyAnswer = `The Lenovo Yoga Slim 7 Pro X 14 is a high-performance laptop featuring a 14.5-inch 3K IPS touchscreen display with a 120Hz refresh rate. It is powered by an AMD Ryzen 9 6900HS Creator Edition processor with 8 cores and 16 threads, capable of speeds up to 4.9GHz. The laptop comes with 32GB of soldered LPDDR5-6400 RAM and a 1TB PCIe SSD Gen 4 for storage. Graphics are handled by an NVIDIA GeForce RTX 3050 with 4GB GDDR6 memory. The device runs on Windows 11 and includes features such as WiFi 6, Bluetooth 5.1, a FHD 1080P IR hybrid camera, and Dolby Atmos audio with 2x2W Harman speakers. It has a slim profile at 15.9mm thick and weighs starting from 1.45kg. The laptop is available in Storm Grey color and offers various connectivity options including USB-C and USB-A ports.`;

  const payloadComparison = {
    success: true,
    name: "productsComparison",
    args: {
      compare: [
        {
          title:
            'LENOVO LEGION GO S 8ARP1 AMD Ryzen Z2 Go 16GB 512GB W11 8" WUXGA 120HZ - WHITE',
          callId: "7c65dbd8-5614-4001-9b7e-5ba0aa13f1ba",
        },
        {
          title: "ASUS ROG ALLY X AMD Z1 EXTREME 24GB 1TB W11 7.0FHD 120HZ BLK",
          callId: "060457aa-fc0b-4f5a-806d-1fc9ec8b0f0d",
        },
      ],
    },
    data: {
      callId: "8c305561-be1a-4e52-be7d-88b550c6e5af",
      productImages: [
        "https://service.firecrawl.dev/storage/v1/object/public/media/screenshot-be6319c5-45e8-4083-8e35-8b8d4661a149.png",
        "https://service.firecrawl.dev/storage/v1/object/public/media/screenshot-081e76cc-8b16-4c6f-822e-15be9c69facb.png",
      ],
      comparison: {
        products: [
          {
            product_name: "LENOVO LEGION GO S 8ARP1",
            brand: "Lenovo",
            price: "Rp8.939.000",
            external_data: null,
            common_specs: {
              display_size: "8 in",
              processor: "AMD Ryzen Z2 Go",
              storage: "512GB",
              ram: "16GB",
              battery: "55.5Wh",
            },
            category_specific_specs: {
              display_resolution: "1920x1200",
              display_technology: "IPS",
              display_refresh_rate: "120Hz",
              audio_speakers: "Stereo speakers, 2W x2",
              audio_microphone: "2x, Array",
              connectivity_wifi: "Wi-Fi 6E",
              connectivity_bluetooth: "BT5.3",
              connectivity_ports: [
                "USB4",
                "Headphone / microphone combo jack (3.5mm)",
                "Card reader",
              ],
              additional_features: [
                "Touchscreen",
                "microSD Card Reader",
                "Firmware TPM 2.0 Enabled",
              ],
            },
          },
          {
            product_name:
              "ASUS ROG ALLY X AMD Z1 EXTREME 24GB 1TB W11 7.0FHD 120HZ BLK - ROG ALLY X",
            brand: "ASUS",
            price: "Rp13.999.000",
            external_data: null,
            common_specs: {
              display_size: "7.0 in",
              processor: "AMD Ryzen Z1 Extreme",
              storage: "1TB",
              ram: "24GB",
              battery: "80WHrs",
            },
            category_specific_specs: {
              display_resolution: "1920 x 1080",
              display_technology: "IPS-level glossy",
              display_refresh_rate: "120Hz",
              audio_speakers:
                "2-speaker system with Smart Amplifier Technology, Dolby Atmos",
              audio_microphone:
                "Built-in array microphone, AI noise-canceling technology",
              connectivity_wifi: "Wi-Fi 6E(802.11ax) (Triple band) 2*2",
              connectivity_bluetooth: "Bluetooth 5.2",
              connectivity_ports: [
                "1x 3.5mm Combo Audio Jack",
                "1x USB 3.2 Gen 2 Type-C support DisplayPort / power delivery",
                "1x Type C support USB 4 (Thunderbolt 4 compliance, DisplayPort 1.4 with Freesync support, Power Delivery 3.0)",
                "1x UHS-II microSD card reader (supports SD, SDXC and SDHC)",
              ],
              additional_features: [
                "AURA SYNC",
                "Built-in Fingerprint Sensor",
                "Microsoft Pluton security processor",
                "Xbox Game Pass Ultimate_3 months",
              ],
              gpu: "AMD Radeon Graphics (AMD RDNA 3, 12 CUs, up to 2.7 GHz, up to 8.6 Teraflops)",
            },
          },
        ],
        key_differences: [
          "display_size: Lenovo has a larger display (8 in vs 7 in)",
          "ram: ASUS has more RAM (24GB vs 16GB)",
          "storage: ASUS has more storage (1TB vs 512GB)",
          "battery: ASUS has a larger battery capacity (80WHrs vs 55.5Wh)",
          "processor: Different processors (AMD Ryzen Z2 Go vs AMD Ryzen Z1 Extreme)",
          "price: ASUS is more expensive (Rp13.999.000 vs Rp8.939.000)",
        ],
      },
    },
  };

  return (
    <div className="px-2 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24 max-w-[484px] md:max-w-3xl w-full mx-auto flex flex-col space-y-3 md:space-y-4">
      {/* <LoadingText text="Helo World from another world!" />
      <ExtendedMessage content={exampleData} tavilyAnswer={tavilyAnswer} />
      <ExtendedMessage content={tavilyAnswer} /> */}
      <ProductComparison
        content={{
          success: true,
          name: "productsComparison",
          args: payloadComparison.args,
          data: payloadComparison.data,
        }}
      />
      <ProductComparisonSkeleton />
    </div>
  );
  // return (
  //   <div>
  //     <Chat chat={chat} />
  //   </div>
  // );
}
