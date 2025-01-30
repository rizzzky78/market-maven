import { ProductInsight } from "@/components/maven/product-insight";
import { ExtendedToolResult } from "@/lib/types/ai";
import { FC } from "react";

const insight = {
  page_type: "product_page",
  product: {
    name: "Lenovo Yoga Slim 7 Pro X 14 3K Touch RTX3050 Ryzen 9 6900 32GB 1TB SSD - LAPTOP",
    images: [
      "https://images.tokopedia.net/img/cache/500-square/VqbcmM/2023/1/26/eced3f20-6f6d-4d08-84a8-57a34f914baa.jpg.webp?ect=4g",
      "https://images.tokopedia.net/img/cache/100-square/VqbcmM/2023/1/26/eced3f20-6f6d-4d08-84a8-57a34f914baa.jpg.webp?ect=4g",
      "https://images.tokopedia.net/img/cache/100-square/VqbcmM/2023/1/26/b0e2bbfb-f0d0-485d-9be9-c650b3f9345c.png.webp?ect=4g",
      "https://images.tokopedia.net/img/cache/100-square/VqbcmM/2023/1/26/ec6154c9-edae-4b5b-90b7-1a675db3d3f9.png.webp?ect=4g",
      "https://images.tokopedia.net/img/cache/100-square/VqbcmM/2023/1/26/a833b15d-b42f-44af-a8f2-d7d632d815ed.png.webp?ect=4g",
      "https://images.tokopedia.net/img/cache/100-square/VqbcmM/2023/1/26/fc7cb73b-9412-47c3-b759-d7b53ff627b1.png.webp?ect=4g",
      "https://assets.tokopedia.net/assets-tokopedia-lite/v2/zeus/kratos/85cc883d.svg",
      "https://assets.tokopedia.net/assets-tokopedia-lite/v2/zeus/kratos/85cc883d.svg",
      "https://assets.tokopedia.net/assets-tokopedia-lite/v2/zeus/kratos/85cc883d.svg",
      "https://assets.tokopedia.net/assets-tokopedia-lite/v2/zeus/kratos/85cc883d.svg",
      "https://assets.tokopedia.net/assets-tokopedia-lite/v2/zeus/kratos/85cc883d.svg",
    ],
    brand: "Lenovo",
    category: "LAPTOP",
    description:
      'LENOVO YOGA SLIM 7 PRO X 14 3K TOUCH RTX3050 4GB/ RYZEN 9 6900 32GB 1TBSSD W11 14.5 IPS 120HZ\n\nSpesifikasi :\n\nProcessor ; AMD Ryzen 9 6900HS Creator Edition (8C / 16T, 3.3 / 4.9GHz, 4MB L2 / 16MB L3)\n\nGraphics ; NVIDIA GeForce RTX 3050 4GB GDDR6\n\nChipset ; AMD SoC Platform\n\nMemory ; 32GB Soldered LPDDR5-6400\n\nMemory Slots ; Memory soldered to systemboard, no slots, dual-channel\n\nMax Memory ; 32GB soldered memory, not upgradable\n\nStorage : 1TB SSD M.2 2280 PCIe 4.0x4 NVMe\n\nDisplay :14.5" 3K (3072x1920) IPS 400nits Glossy, 100% sRGB, 120Hz, Eyesafe, Glass, Touch, Dolby Vision\n\nTouchscreen : OGM, 10-point Multi-touch\n\nKeyboard : Backlit, English (US)\n\nOperating System : Windows 11 Home, English\n\nBundled Software : Office Trial\n\nWLAN + Bluetooth : Wi-Fi 6, 11ax 2x2 + BT5.1\n\nStandard Ports\n\n1x USB 3.2 Gen 1\n\n1x USB 3.2 Gen 1 (Always On)\n\n2x USB-C 3.2 Gen 2 (support data transfer, Power Delivery 3.0 and DisplayPort 1.4)\n\n1x Headphone / microphone combo jack (3.5mm)\n\nFree :\n\nTas Slempang & Mouse Kabel\n\nKelengkapan :\n\n- Dus Laptop\n\n- Laptop\n\n- Charger\n\nLihat Selengkapnya',
    attributes: {
      dynamic: [
        {
          key: "Processor",
          value:
            "AMD Ryzen 9 6900HS Creator Edition (8C / 16T, 3.3 / 4.9GHz, 4MB L2 / 16MB L3)",
        },
        {
          key: "Graphics",
          value: "NVIDIA GeForce RTX 3050 4GB GDDR6",
        },
        {
          key: "Chipset",
          value: "AMD SoC Platform",
        },
        {
          key: "Memory",
          value: "32GB Soldered LPDDR5-6400",
        },
        {
          key: "Memory Slots",
          value: "Memory soldered to systemboard, no slots, dual-channel",
        },
        {
          key: "Max Memory",
          value: "32GB soldered memory, not upgradable",
        },
        {
          key: "Storage",
          value: "1TB SSD M.2 2280 PCIe 4.0x4 NVMe",
        },
        {
          key: "Display",
          value:
            '14.5" 3K (3072x1920) IPS 400nits Glossy, 100% sRGB, 120Hz, Eyesafe, Glass, Touch, Dolby Vision',
        },
        {
          key: "Touchscreen",
          value: "OGM, 10-point Multi-touch",
        },
        {
          key: "Keyboard",
          value: "Backlit, English (US)",
        },
        {
          key: "Operating System",
          value: "Windows 11 Home, English",
        },
        {
          key: "Bundled Software",
          value: "Office Trial",
        },
        {
          key: "WLAN + Bluetooth",
          value: "Wi-Fi 6, 11ax 2x2 + BT5.1",
        },
        {
          key: "Standard Ports",
          value:
            "1x USB 3.2 Gen 1, 1x USB 3.2 Gen 1 (Always On), 2x USB-C 3.2 Gen 2 (support data transfer, Power Delivery 3.0 and DisplayPort 1.4), 1x Headphone / microphone combo jack (3.5mm)",
        },
      ],
    },
    price: {
      current: 16249000,
      original: 23699000,
      discount_percentage: 31,
    },
    stock: 94,
    sold_count: "100+",
    rating: {
      average: 5,
      count: 68,
      percentage_satisfied: 98,
      rating_distribution: {
        "1": 0,
        "2": 0,
        "3": 1,
        "4": 1,
        "5": 66,
      },
    },
    bundles: ["LAPTOP", "PAKET ANTIGORES", "PAKET+SLEVECASE", "PAKET+OHS"],
    min_order: 1,
    condition: "Baru",
    etalase: {
      name: "BEST SELLER",
      url: "https://www.tokopedia.com/rogsstoreid/etalase/best-seller",
    },
    free_items: ["Tas Slempang", "Mouse Kabel"],
    warranty: {
      type: "Toko",
      duration: "1 Tahun",
    },
    return_policy:
      "GARANSI 7 HARI TUKAR UNIT APABILA ADA KERUSAKAN DARI PABRIK\n\n( Apabila Sudah Aktivasi Office Home Student Maka Garansi Toko VOID)",
  },
  seller: {
    name: "ROGS STORE",
    logo: "https://images.tokopedia.net/img/cache/215-square/GAnVPX/2024/5/2/d4ed3b62-ea1e-4fe4-a86f-b8851be0ea61.png",
    is_official_store: true,
    location: "Jakarta Utara",
    rating: 4.9,
    rating_count: "19,8 rb",
    process_time: "± 3 jam",
    follow_url: "https://www.tokopedia.com/rogsstoreid",
  },
  shipping: {
    origin: "Jakarta Utara",
    regular_cost: "32 rb - 40 rb",
    estimated_arrival: "besok - 3 Feb",
    other_couriers: ["Instan"],
  },
  reviews: [
    {
      user: {
        name: "Andreano",
        profile_picture:
          "https://accounts.tokopedia.com/image/v1/u/9749400/user_thumbnail/desktop?ect=4g",
      },
      variant: "LAPTOP",
      text: "Laptop sudah ditest selama 4 hari sejak pembelian, yang harus jadi catatan untuk kalian yg mau beli adalah : laptop ini garanasi IWS (International Warranty Service) dan... Selengkapnya",
      images: [
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2024/4/27/079ff022-2acb-43ef-b93f-b22c3e166c79.jpg.webp?ect=4g",
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2024/4/27/c65af901-27e9-452a-acdc-b43ba34ba3d0.jpg.webp?ect=4g",
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2024/4/27/2c352614-3a25-44ab-b066-d5ff105b9e13.jpg.webp?ect=4g",
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2024/4/27/ba6870fc-8d62-481e-861c-b3bfaced278c.jpg.webp?ect=4g",
      ],
      helpful_count: 85,
      date: "9 bulan lalu",
    },
    {
      user: {
        name: "M***d",
        profile_picture:
          "https://images.tokopedia.net/img/cache/100-square/default_v3-usrnophoto.png.webp?ect=4g",
      },
      variant: "PAKET ANTIGORES",
      text: "So far laptop berjalan lancar, tapi layar sempat ga nyala waktu update windows mungkin karena drivernya ga cocok, jadi harus dimatiin lewat tombol power, semoga kedepanny... Selengkapnya",
      images: [
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2024/5/8/cba41811-4519-4dbf-9d17-42112933a6e7.jpg.webp?ect=4g",
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2024/5/8/a46afd45-cfa2-4a89-9184-e3ea20288ab6.jpg.webp?ect=4g",
      ],
      helpful_count: 8,
      date: "8 bulan lalu",
    },
    {
      user: {
        name: "Muhammad",
        profile_picture:
          "https://accounts.tokopedia.com/image/v1/u/37956637/user_thumbnail/desktop?ect=4g",
      },
      variant: "LAPTOP",
      text: "Barang bagus tanpa goresan sedikitpun di box laptop meskipun tanpa packing kayu. Pengiriman luar jawa ok, barang sampai dengan selamat.\n\nOverall barang bagus, sebelum me... Selengkapnya",
      images: [
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2024/4/22/9bee825a-7caf-4375-8a81-665efdb4197c.jpg.webp?ect=4g",
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2024/4/22/48b68c21-0bb8-4bed-b724-fcc240c7f838.jpg.webp?ect=4g",
      ],
      helpful_count: 5,
      date: "9 bulan lalu",
    },
    {
      user: {
        name: "a***m",
        profile_picture:
          "https://images.tokopedia.net/img/cache/100-square/default_v3-usrnophoto.png.webp?ect=4g",
      },
      variant: "LAPTOP",
      text: "Beli versi tanpa paketan, jadi bener2 segel utuh semua pas unboxing.\nSpeknya mumpuni banget dengan harga bersaing, sebelumnya riset dulu dan bandingin harga/spek pake cha... Selengkapnya",
      images: [
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2025/1/16/0f214332-bb3a-4c8d-beb6-9d9c7f4d9090.jpg.webp?ect=4g",
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2025/1/16/04db420b-b25b-48e4-8f0c-50b4b56c354a.jpg.webp?ect=4g",
      ],
      helpful_count: 1,
      date: "2 minggu lalu",
    },
    {
      user: {
        name: "M***d",
        profile_picture:
          "https://images.tokopedia.net/img/cache/100-square/default_v3-usrnophoto.png.webp?ect=4g",
      },
      variant: "LAPTOP",
      text: "Admin Aktif dm, packing rapih juga, langsung proses\n\nLaptop yg cukup dan nyaman buat kerja atau hiburan. dimensi kecil tapi powerful, speaker cukup ok bisa lebih baik tap... Selengkapnya",
      images: [
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2023/2/14/6d8be3df-5238-46a5-a7e6-aa94478b2ed0.jpg.webp?ect=4g",
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2023/2/14/566d3adb-dd95-435e-b120-17a225a9af83.jpg.webp?ect=4g",
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2023/2/14/5991af15-087b-4653-8b82-b76ba0038a75.jpg.webp?ect=4g",
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2023/2/14/2d7316eb-225e-46a0-8bea-8c63f0ca6946.jpg.webp?ect=4g",
      ],
      helpful_count: 5,
      date: "Lebih dari 1 tahun lalu",
    },
    {
      user: {
        name: "o***i",
        profile_picture:
          "https://images.tokopedia.net/img/cache/100-square/default_v3-usrnophoto.png.webp?ect=4g",
      },
      variant: "PAKET+SLEVECASE",
      text: "Laptop mendarat dengan selamat sentosa dan pesanan sesuai semua dengan lengkap apalagi dikasih bonusss, sejauh ini belum menemukan kendala teknis (semoga gaada dan tetap... Selengkapnya",
      images: [
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2024/6/1/2b38a5ce-21a7-478d-9902-94fa07597b5a.jpg.webp?ect=4g",
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2024/6/1/0b3f6eed-7feb-4a87-ad53-2e8e1a19527e.jpg.webp?ect=4g",
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2024/6/1/65a6295f-232a-432e-b0fd-d62ce4b7f9a6.jpg.webp?ect=4g",
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2024/6/1/d9f80b7b-8e43-4de9-8121-abd1a237c094.jpg.webp?ect=4g",
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2024/6/1/0d4b573a-2a9e-4f48-8d4b-0153c23ce01b.jpg.webp?ect=4g",
      ],
      helpful_count: 4,
      date: "8 bulan lalu",
    },
    {
      user: {
        name: "Reymond",
        profile_picture:
          "https://accounts.tokopedia.com/image/v1/u/1539628/user_thumbnail/desktop?ect=4g",
      },
      variant: "LAPTOP",
      text: 'barang sesuai spesifikasi yang disebutkan seller.\ngaransi distributor.\n\ndi Indonesia disebutnya "Yoga Slim 7 Pro X", kalau di US "Slim 7 Pro X" saja, ga... Selengkapnya',
      images: [
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2023/4/7/1735df33-214a-4132-be13-913a5aa2b9e9.jpg.webp?ect=4g",
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2023/4/7/4a500c15-2049-4a88-9148-ce7ebedefcac.jpg.webp?ect=4g",
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2023/4/7/c799c01d-60bf-41e3-b80d-53d36785ec72.jpg.webp?ect=4g",
      ],
      helpful_count: 14,
      date: "Lebih dari 1 tahun lalu",
    },
    {
      user: {
        name: "Hisma",
        profile_picture:
          "https://accounts.tokopedia.com/image/v1/u/41870025/user_thumbnail/desktop?ect=4g",
      },
      variant: "PAKET+OHS",
      text: "untuk laptop oke banget pengiriman cepat sesuai dengan jadwal. tpi bonus mouse dan tas yg di janjikan tdak ada",
      images: [
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2025/1/12/44d9c483-95c3-42eb-9d60-4186244e112a.jpg.webp?ect=4g",
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2025/1/12/0cdf81d5-bf95-4119-b10b-aab75498eb6c.jpg.webp?ect=4g",
      ],
      helpful_count: 2,
      date: "2 minggu lalu",
    },
    {
      user: {
        name: "Danang",
        profile_picture:
          "https://accounts.tokopedia.com/image/v1/u/3627582/user_thumbnail/desktop?ect=4g",
      },
      variant: "PAKET ANTIGORES",
      text: "Mantep ini sih... ngga kaleng2.. seandainya ada yg resmi indo dgn spek yang bener2 sama, akan lebih ciamik..\n\n***kurang rapih aja sih masang anti-goresnya,..",
      images: [],
      helpful_count: 3,
      date: "Lebih dari 1 tahun lalu",
    },
    {
      user: {
        name: "Yeremia",
        profile_picture:
          "https://accounts.tokopedia.com/image/v1/u/38703695/user_thumbnail/desktop?ect=4g",
      },
      variant: "PAKET+SLEVECASE",
      text: "Pelayanan toko ini sangat cepat dan ramah. Awalnya ingin split payment dan dibantu dengan baik, tapi karena ada kendala di cc jadi melakukan pembayaran normal dengan tran... Selengkapnya",
      images: [
        "https://images.tokopedia.net/img/cache/200-square/bjFkPX/2024/5/18/b8b8f055-3eaf-426f-b49c-0b66d0be0e46.jpg.webp?ect=4g",
      ],
      helpful_count: 9,
      date: "8 bulan lalu",
    },
  ],
  related_products: [
    {
      name: "AXIOO HYPE 7 RYZEN 7 5700 16GB 512GB WINDOWS 11 PRO 14.0 FULL HD",
      image:
        "https://images.tokopedia.net/img/cache/250-square/VqbcmM/2024/11/9/d8dad1e3-8e84-46ff-8284-9a7a8f947edd.jpg",
      price: {
        current: 6399000,
        original: 9599000,
        discount_percentage: 33,
      },
      rating: {
        average: 5,
        count: 24,
      },
      url: "https://www.tokopedia.com/rogsstoreid/axioo-hype-7-ryzen-7-5700-16gb-512gb-windows-11-pro-14-0-full-hd-standard-8gb-512-dos-23a33",
    },
    {
      name: 'ACER SWIFT GO OLED SFG14 CORE ULTRA 5 125H 32GB 512GB SSD OHS 14" 2.8K',
      image:
        "https://images.tokopedia.net/img/cache/250-square/VqbcmM/2024/7/17/17ef8e19-410b-4954-8c91-ef117a1c4823.jpg",
      price: {
        current: 11349000,
        original: 13999000,
        discount_percentage: 19,
      },
      rating: {
        average: 5,
        count: 1,
      },
      url: "https://www.tokopedia.com/rogsstoreid/acer-swift-go-oled-sfg14-core-ultra-5-125h-32gb-512gb-ssd-ohs-14-2-8k-no-bundle-16gb-0f28e",
    },
    {
      name: 'AXIOO HYPE 5 G12 CORE I5 1235 16GB 512GB W11 14.0"FHD IPS BLK',
      image:
        "https://images.tokopedia.net/img/cache/250-square/VqbcmM/2024/11/12/c03a21fb-1ebc-4e85-8fbb-4a1b55a56887.jpg",
      price: {
        current: 5999000,
        original: 7599000,
        discount_percentage: 21,
      },
      rating: null,
      url: "https://www.tokopedia.com/rogsstoreid/axioo-hype-5-g12-core-i5-1235-16gb-512gb-w11-14-0-fhd-ips-blk-non-bundle-8-256-dos-6a6ce",
    },
    {
      name: "MSI PRESTIGE 14 AI C1MG CORE ULTRA 7 155H 16GB 1TB W11+OHS 14.0FHD+ 144HZ EVO EDITION",
      image:
        "https://images.tokopedia.net/img/cache/250-square/VqbcmM/2024/8/5/f5194555-6f04-4dd7-8d58-61fac106d331.jpg",
      price: {
        current: 17199000,
        original: 22999000,
        discount_percentage: 25,
      },
      rating: null,
      url: "https://www.tokopedia.com/rogsstoreid/msi-prestige-14-ai-c1mg-core-ultra-7-155h-16gb-1tb-w11-ohs-14-0fhd-144hz-evo-edition-standard-603fe",
    },
    {
      name: "LENOVO YOGA 9 14 OLED 2IN1 TOUCH CORE ULTRA 7 155H 16GB 1TB SSD W11 14.0QHD 2.8K",
      image:
        "https://images.tokopedia.net/img/cache/250-square/VqbcmM/2024/5/30/4c5a4897-9dc3-4c69-9c10-b9c2429d46fc.jpg",
      price: {
        current: 19999000,
        original: 21999000,
        discount_percentage: 9,
      },
      rating: {
        average: 5,
        count: 3,
      },
      url: "https://www.tokopedia.com/rogsstoreid/lenovo-yoga-9-14-oled-2in1-touch-core-ultra-7-155h-16gb-1tb-ssd-w11-14-0qhd-2-8k-laptop-9540a",
    },
    {
      name: 'HP PAVILION PLUS 14 OLED CORE ULTRA 7 155H 32GB 1TB 14" 2.8K 120HZ EVO EDITION -  EW1005TU EW1006TU',
      image:
        "https://images.tokopedia.net/img/cache/250-square/VqbcmM/2024/6/18/92d51155-15bd-41fd-87ef-24114d9fcd77.jpg",
      price: {
        current: 18799000,
        original: 22000000,
        discount_percentage: 15,
      },
      rating: {
        average: 5,
        count: 3,
      },
      url: "https://www.tokopedia.com/rogsstoreid/hp-pavilion-plus-14-oled-core-ultra-7-155h-32gb-1tb-14-2-8k-120hz-evo-edition-ew1005tu-ew1006tu-silver-laptop-77e06",
    },
    {
      name: "ACER SWIFT GO 14 AI SFG14 EVO CORE ULTRA 7 155H 16GB 1TB SSD W11+OHS 14.0 2.8K 100SRGB 2Y+ADP",
      image:
        "https://images.tokopedia.net/img/cache/250-square/VqbcmM/2024/11/11/fc256ee2-f7ff-4f06-b853-d5ff3a298cfe.jpg",
      price: {
        current: 13799000,
        original: 24399000,
        discount_percentage: 43,
      },
      rating: {
        average: 5,
        count: 1,
      },
      url: "https://www.tokopedia.com/rogsstoreid/acer-swift-go-14-ai-sfg14-evo-core-ultra-7-155h-16gb-1tb-ssd-w11-ohs-14-0-2-8k-100srgb-2y-adp-non-bundling-windows-11-home-3f402",
    },
    {
      name: 'ACER SWIFT GO OLED SFG14 CORE ULTRA 7 155H 32GB 1TB OHS 14" 2.8K',
      image:
        "https://images.tokopedia.net/img/cache/250-square/VqbcmM/2024/4/3/0",
    },
  ],
};

const Page: FC = () => {
  const content: ExtendedToolResult<
    { link: string; query: string },
    { insight: Record<string, any>; screenshot: string; callId: string }
  > = {
    success: true,
    name: "insight",
    args: { link: "", query: "" },
    data: {
      insight,
      screenshot: `https://service.firecrawl.dev/storage/v1/object/public/media/screenshot-e47f3e98-2174-4c59-8cfc-08a2017db773.png`,
      callId: "42619244-36ab-44af-8bf4-975edee38996",
    },
  };

  return (
    <div className="px-2 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24 max-w-[484px] md:max-w-3xl w-full mx-auto flex flex-col space-y-3 md:space-y-4">
      <div>
        <ProductInsight content={content} />
      </div>
    </div>
  );
};

export default Page;
