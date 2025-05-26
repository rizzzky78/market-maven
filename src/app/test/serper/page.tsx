import { SerperAPIResult } from "@/components/maven/serper-api-result";
import { ScrollArea } from "@/components/ui/scroll-area";

const sampleData = {
  query: "Samsung Galaxy S24 Ultra",
  payloadDataset: {
    web: {
      searchParameters: {
        q: "Samsung Galaxy S24 Ultra",
        gl: "id",
        type: "search",
        engine: "google",
      },
      organic: [
        {
          title:
            "Harga Hp Samsung Galaxy S24 Ultra 5G - Spek, Penawaran Terbaru",
          link: "https://www.samsung.com/id/smartphones/galaxy-s24-ultra/buy/",
          snippet:
            "Harga Samsung Galaxy S24 Ultra mulai Rp 21999000. Beli seri Galaxy S24 terbaru dengan opsi gratis ongkos kirim & cicilan 0% mulai Rp 916625/bln.",
          rating: 4.6,
          ratingCount: 2062,
          position: 1,
        },
        {
          title: "Galaxy S24 Ultra | Galaxy AI | Samsung Indonesia",
          link: "https://www.samsung.com/id/smartphones/galaxy-s24-ultra/",
          snippet:
            "Temukan Samsung Galaxy S24 Ultra, didukung dengan Galaxy AI. Ponsel terbaru kami dimana AI Smart bertemu dengan Titanium Tough dengan fitur seperti Circle ...",
          sitelinks: [
            {
              title: "Harga Hp Samsung Galaxy...",
              link: "https://www.samsung.com/id/smartphones/galaxy-s24-ultra/buy/",
            },
            {
              title: "Specification",
              link: "https://www.samsung.com/id/smartphones/galaxy-s24-ultra/specs/",
            },
            {
              title: "Upgrade your Galaxy",
              link: "https://www.samsung.com/id/smartphones/galaxy-s24-ultra/upgrade/",
            },
            {
              title: "Accessories",
              link: "https://www.samsung.com/id/smartphones/galaxy-s24-ultra/accessories/",
            },
          ],
          position: 2,
        },
        {
          title: "Samsung Galaxy S24 Ultra - Full phone specifications",
          link: "https://www.gsmarena.com/samsung_galaxy_s24_ultra-12771.php",
          snippet:
            "Samsung Galaxy S24 Ultra Android smartphone. Announced Jan 2024. Features 6.8″ display, Snapdragon 8 Gen 3 chipset, 5000 mAh battery, 1024 GB storage, ...",
          position: 3,
        },
        {
          title: "Samsung Galaxy S24 Ultra - Harga Terbaik Mei 2025 - Blibli",
          link: "https://www.blibli.com/jual/hp-samsung-s-24-ultra",
          snippet:
            "Untuk varian Samsung Galaxy S24 Ultra 12/256 GB dibanderol Rp 18.499.000, sementara untuk varian Samsung Galaxy S24 Ultra 12/512 dijual dengan harga Rp 20.899.",
          rating: 5,
          ratingCount: 35,
          position: 4,
        },
        {
          title: "Spesifikasi Kamera & Fitur AI Samsung Galaxy S24 Ultra",
          link: "https://www.samsung.com/id/smartphones/galaxy-s24-ultra/specs/",
          snippet:
            "Physical specification · Dimension (HxWxD, mm). 162.3 x 79.0 x 8.6 · Weight (g). 232. Battery. Video Playback Time (Hours, Wireless). Up to 30.",
          sitelinks: [
            {
              title: "Galaxy S24 Ultra",
              link: "https://www.samsung.com/id/support/model/SM-S928BZTQXID/",
            },
            {
              title: "Accessories",
              link: "https://www.samsung.com/id/smartphones/galaxy-s24-ultra/accessories/",
            },
            {
              title: "Reviews",
              link: "https://www.samsung.com/id/smartphones/galaxy-s24-ultra/reviews/",
            },
          ],
          position: 5,
        },
        {
          title: "Samsung Galaxy S24 Ultra  - Harga & Spesifikasi Terbaru 2025",
          link: "https://erafone.com/produk/samsung-galaxy-s24-ultra-5g-con",
          snippet:
            "Ponsel cerdas Anda. Epik, begitu saja. ... Perkenalkan Galaxy S24 Ultra, bentuk terbaik dari Galaxy Ultra dengan eksterior titanium baru dan layar datar 6,8 inci.",
          position: 6,
        },
        {
          title: "Harga Samsung Galaxy S24 Ultra Terbaru Mei 2025 - Tokopedia",
          link: "https://www.tokopedia.com/find/samsung-s24-ultra?utm_source=google&utm_medium=organic&utm_campaign=find",
          snippet:
            "Samsung Galaxy S24 Ultra dengan kamera 200MP dan 5x zoom telefoto. Hemat dengan bebas ongkir, harga terbaik. Bisa pakai GoPayLater!",
          rating: 5,
          ratingCount: 2236,
          position: 7,
        },
        {
          title: "Upgrade your Galaxy | Samsung Galaxy S24 Ultra",
          link: "https://www.samsung.com/id/smartphones/galaxy-s24-ultra/upgrade/",
          snippet:
            "An upgraded battery to bring you more fun. Enjoy Video by about +8 hrs. Enjoy Audio by about +14 hrs on Galaxy S24 Ultra than on a Galaxy S21 Ultra 5G.",
          position: 8,
        },
        {
          title: "Samsung S24 Ultra - Harga, Spesifikasi, dan Review 2025",
          link: "https://datascripmall.id/blog/samsung-s24-ultra/?srsltid=AfmBOoq3MN4XES2Ayn8bqrbZzF6gv5YzYCUekYdfJ2XGO9ptJcoS_fq6",
          snippet:
            "Tipe Produk: Galaxy S24 Ultra. ; Dimensi: 162,3 mm x 79 mm x 8,6 mm. ; Bobot: 232 gram. ; Build: Kaca depan (Corning Gorilla Armor), kaca belakang ...",
          date: "2 May 2025",
          position: 9,
        },
        {
          title:
            "Samsung Galaxy S24 Ultra Handphone AI, Original, Kamera 200MP ...",
          link: "https://shopee.co.id/Samsung-Galaxy-S24-Ultra-Handphone-AI-Original-Kamera-200MP-12-512GB-12-256GB-i.1101386382.25312356619",
          snippet:
            "Free sesuai dengan foto produk yang tertera, - Processor : Snapdragon 8 Gen 3 for Galaxy - Size : 6,8 inch - Technology : Dynamic AMOLED 2X, ...",
          rating: 5,
          ratingCount: 735,
          position: 10,
        },
      ],
      peopleAlsoAsk: [
        {
          question: "Samsung S24 Ultra harga berapa?",
          snippet:
            "Daftar Harga Samsung S24 Ultra Terbaru Mei 2025\nHarga Samsung Galaxy S24 Ultra 12/256 12/512 12/1TB 12GB 256GB 512GB 1TB\nRp15.299.000\nHarga Samsung Galaxy S24 Ultra 5G 12/256GB [Smartphone]\nRp15.999.000\nHarga Samsung Galaxy S24 Ultra 5G 12/256GB\nRp15.695.000",
          title: "Harga Samsung Galaxy S24 Ultra Terbaru Mei 2025 - Tokopedia",
          link: "https://www.tokopedia.com/find/samsung-s24-ultra?utm_source=google&utm_medium=organic&utm_campaign=find",
        },
        {
          question: "Kapan Samsung S24 Ultra dirilis?",
          snippet:
            'Samsung Galaxy S24, Galaxy S24 Plus, dan Galaxy S24 Ultra diluncurkan di Tanah Air dalam sebuah acara yang digelar di Jakarta Pusat, Kamis (1/2/2024). Trio ponsel flagship terbaru Samsung ini menjadi lini ponsel perdana Samsung yang mengunggulkan fitur teknologi kecerdasan buatan lewat "Galaxy AI".',
          title:
            "Samsung Galaxy S24, S24 Plus, dan S24 Ultra Resmi Dirilis di Indonesia ...",
          link: "https://tekno.kompas.com/read/2024/02/01/17183057/samsung-galaxy-s24-s24-plus-dan-s24-ultra-resmi-dirilis-di-indonesia-ini?page=all",
        },
        {
          question: "Kenapa Samsung S24 Ultra mahal?",
          snippet:
            "Kenapa Samsung S24 Ultra Mahal? Samsung S24 Ultra mahal karena sudah menggunakan material dari titanium yang menawarkan durabilitas lebih kuat dibandingkan seri pendahulunya.",
          title: "Kenapa Samsung S24 Ultra Mahal? - suara kalbar",
          link: "https://kalbar.suara.com/read/2024/11/23/133507/kenapa-samsung-s24-ultra-mahal",
        },
        {
          question: "Samsung Galaxy S23 Ultra harganya berapa?",
          snippet:
            "Daftar Harga Samsung Galaxy S23 Ultra Terbaru Mei 2025\nProduk\nHarga\nSamsung Galaxy S23 Ultra 5G 12/256GB Garansi Resmi\nRp12.600.000\nSamsung Galaxy S23 Ultra 5G\nRp12.589.400\nSamsung Galaxy S23 Ultra 5G Smartphone 12GB/512GB\nRp19.334.000\nSamsung Galaxy S23 Ultra 5G Garansi Resmi\nRp13.000.000",
          title:
            "Harga Samsung Galaxy S23 Ultra Terbaru & Lengkap Mei 2025 - Blibli",
          link: "https://www.blibli.com/jual/samsung-galaxy-s23-ultra",
        },
      ],
      relatedSearches: [
        {
          query: "Samsung Galaxy S23...",
        },
        {
          query: "Samsung Galaxy S24 Ultra harga",
        },
        {
          query: "Samsung Galaxy S23 Ultra",
        },
        {
          query: "Samsung Galaxy S24 Ultra price",
        },
        {
          query: "Samsung S24 Ultra Indonesia",
        },
        {
          query: "Samsung Galaxy S24 Ultra release date",
        },
        {
          query: "Samsung S24 Ultra Harga dan Spesifikasi",
        },
        {
          query: "Samsung S24 Ultra Spesifikasi",
        },
        {
          query: "Samsung Galaxy S24 Ultra 5G",
        },
      ],
      credits: 1,
    },
    shopping: {
      searchParameters: {
        q: "Samsung Galaxy S24 Ultra - - Shopee",
        gl: "id",
        type: "shopping",
        engine: "google",
      },
      shopping: [
        {
          title:
            "SEIN Samsung Galaxy S24 Ultra 5G 12/1TB 512GB 256GB | S24 Plus 12/512 256 Second Fullset Original",
          source: "Shopee",
          link: "https://shopee.co.id/product/510454339/26813414049?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkWVp3RFo3Mkw5czd4Z0hzdEF1WVFiblFiSGthd0hwUWlOa09lOGwxU2VqcDRJbmdpYnJMeXpuODQzMDBtVUl1a1EwVzhjRVNZREIxeE41ZVc0TG8wdHFYV3NTaVdDQ1F6NXNIUDZHQjh4YjI",
          price: "Rp 7.585.000,00 used",
          delivery: "Free shipping",
          imageUrl:
            "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQ_GrQWWAzks9K8LvT0a4geNWi2H7BrGK64sukOscECKXXhPktaB9m1sHMA&usqp=CAE",
          rating: 5,
          ratingCount: 3,
          position: 1,
        },
        {
          title: "Samsung S24 Ultra 256Gb//512gb// 1TB Second SEIN",
          source: "Shopee",
          link: "https://shopee.co.id/product/127358061/29513823018?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkWVp3RFo3Mkw5czd4Z0hzdEF1WVFibFFLUkg2cFByWnpJb0dxamYwSUxQdmFXT3BQT2lXdWFkdC9EaS9jNnFNQzBNc1BQZUhoNWZkMzNLSk5EbE1aUGVTdEVNenZWM0pJbjQ4NTdJT0lWOXY",
          price: "Rp 12.998.000,00 used",
          delivery: "Free shipping",
          imageUrl:
            "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQi9iz94sCnl2fgut740FTMIa8Skrohecu2QK0Wgq4iqFto7oWwQ4MadGua&usqp=CAE",
          rating: 5,
          ratingCount: 14,
          position: 2,
        },
        {
          title:
            "Samsung Galaxy S24 Ultra 5G 256Gb 512Gb 1Tb Garansi Resmi SEIN",
          source: "Shopee",
          link: "https://shopee.co.id/product/9435108/25278657623?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkVEg0SDd3VWo1MDQyT052d3EvY1B4WVYxaEM1d1N4VTU4UWF0cXJWRTNsSlJBMEM0cm9CK1hyRytwUU11SmZJUHNqcUcwZnB6TVcxS2piK0Jpc3dESTJHazhKM2haQUNTY3pFdUJVdEUrcSs",
          price: "Rp 14.999.000,00",
          delivery: "Free shipping",
          imageUrl:
            "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcS8eGihpVOVfmTUrzZdbMtB6IV2HiL4Y6IGZRgQLkKM9xS-In0M3q9YsIIhTs81OJyvZNpZ9A&usqp=CAE",
          rating: 5,
          ratingCount: 3,
          position: 3,
        },
        {
          title: "Samsung S24 Ultra 256GB 512GB 1TB -Garansi Resmi",
          source: "Shopee",
          link: "https://shopee.co.id/product/281627987/25414227018?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkWVp3RFo3Mkw5czd4Z0hzdEF1WVFibGlwNlJmOThCRjY5ZCtpQVA3dzBuVGd2Rk91YkF0Q2h2aEtFdURHTEk4c2V0RU9SVE9ac0dFaWJKR3FKTitLcldMc3JJMkR3QXZ2UTd6dFZ6MFVMZnQ",
          price: "Rp 15.499.000,00",
          delivery: "Free shipping",
          imageUrl:
            "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcT4T3GVPpdS__0xEJ9vRLJ69a_4Nepj6Kt6q_Ei93j5FfK18HzbrWAdaCImQZRNmP14mdQuKg&usqp=CAE",
          rating: 4.5,
          ratingCount: 84.893,
          position: 4,
        },
        {
          title:
            "HP BARU SAMSUNG GALAXY S24 5G | S24+ 5G | S24 ULTRA 5G 8/256GB - 12/512GB GARANSI RESMI 100% ORIGINAL",
          source: "Shopee",
          link: "https://shopee.co.id/product/322427170/14954521431?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkWVp3RFo3Mkw5czd4Z0hzdEF1WVFibHNQK2NuNEhsTzZvSWhGai9TSGowdVo0OUdKd0RLNm83cDY0dHRyWEZWNHhXUDBkcDRpbmdLKysrdWNZSGJpMjBHdzNvS1haUE1jamloWUlXY3VvUzc",
          price: "Rp 13.249.000,00",
          delivery: "Free shipping",
          imageUrl:
            "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQHMu1ti_py7jSN8yqDsg673azxnCn9tYGV1oJtvlfy8GMEtrP1cMLWJorMTdrtPqgbCkNb&usqp=CAE",
          rating: 5,
          ratingCount: 105,
          position: 5,
        },
        {
          title:
            "SEIN SAMSUNG GALAXY S24 ULTRA 5G 12/256GB 12/512GB 12/1TB | S24 PLUS | S24+ SECOND RESMI",
          source: "Shopee",
          link: "https://shopee.co.id/product/966993360/25538121161?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkWVp3RFo3Mkw5czd4Z0hzdEF1WVFia1RUSGl2TFl3WVVlYVhPSXR0WDFkRnk1YVVGQzBOOHhqUDNaN3AyblhtQVRqeGpJU2pxbWxac0xTNzhQTWxYS3I2UUZQM3dQOUhnQ2NJVy84MUxyZDc",
          price: "Rp 7.620.000,00 used",
          delivery: "Free shipping",
          imageUrl:
            "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSijh_ZKHvm26IZ8qYt6Y0Tdx0OK7AuyuEkhUMTNIDrdvtvcg1n2e3JCaNBclAMyXzUkX8Pbw&usqp=CAE",
          rating: 4.5,
          ratingCount: 84.893,
          position: 6,
        },
        {
          title:
            "Samsung Galaxy S24 Ultra S24+ S24 Series [12/1TB 12/512GB 12/256GB] Black Gray Violet Yellow (100% Garansi Resmi)",
          source: "Shopee",
          link: "https://shopee.co.id/product/1513371507/29832359855?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkVHQ3ZkZSUTMrR3pBWmZZNzdrcnRBM2FwMGI0QW44Qk02RGxZWEFONEpGNDNBSjFoMlMyN1FILzV1UGFYWjVhNXExbDFPSktPZ0cvU1VxY3JmTlBmWmRMUG94SkdxeVRyTTNaSFJPU1B3VGJRUWV4eTN6L3EyRkRydzJBYWlXeVh3PT0",
          price: "Rp 10.400.000,00",
          delivery: "Free shipping",
          imageUrl:
            "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSvSH9ZGEHzhG3zh6w_1yQHXXldiJgOkjsHBn7HBVXpULi21N_dzpx3YLfHLMlGlt39FQLprA&usqp=CAE",
          rating: 4.5,
          ratingCount: 84.893,
          position: 7,
        },
        {
          title: "Dus Box Samsung Galaxy S24 Ultra Original asli copotan",
          source: "Shopee",
          link: "https://shopee.co.id/product/405815104/28907943490?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkWVp3RFo3Mkw5czd4Z0hzdEF1WVFia3ZNd3JhMFIrRlhUb0d6d3c1L1RSRkh6amZ1RlgwWkNDbjNQWTJQMXZlMXBxWUtWcjByVzRHdjd2MEprcUUzdDR1a2p3cFJ4QlorREI1TUJLVzM1cVU",
          price: "Rp 400.000,00 used",
          delivery: "Free shipping",
          imageUrl:
            "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSJ-XUMbf0Wy4Fro8_oGFpi0jVytaEx8QyRupIs9_dNkpLIEfURCsixhvHwmR_JUygAnz0sNA&usqp=CAE",
          position: 8,
        },
        {
          title: "Samsung Galaxy S24 Ultra 256 GB 12 GB Titanium Gray",
          source: "Samsung Indonesia",
          link: "https://www.samsung.com/id/smartphones/galaxy-s24-ultra/buy/?modelCode=SM-S928BZTCXID",
          price: "Rp 17.999.000,00",
          delivery: "Free shipping",
          imageUrl:
            "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRtLBcMV6l9dyFG0V3FZ79V1B1EPcY0FBY8ZffLrvN-U0qLLHYR3JVA9NFArj1XwEx0ngbjQg&usqp=CAE",
          rating: 4.5,
          ratingCount: 84.893,
          offers: "3",
          productId: "275436932521419513",
          position: 9,
        },
        {
          title:
            "Samsung Galaxy S24 Ultra 12/256 Smartphone AI, AI Phone, Handphone AI, Kamera 50MP, Layar besar, RAM besar, Baterai tahan lama",
          source: "Shopee",
          link: "https://shopee.co.id/product/654830944/26220391824?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkWVp3RFo3Mkw5czd4Z0hzdEF1WVFibk9ITVovaTdTWlJYVnJ2NTkwRy9GNUhnbnVMcU90dGxxeHFmUFR0b2VyclVvL0wyRExyWHhPRk5uOC8zUzVZa1lNbzBlZGZEWnloRnpkQW1FLzE2N0c",
          price: "Rp 15.789.000,00",
          delivery: "Free shipping",
          imageUrl:
            "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT0DNuUFG0T3pLCV0Fz5xo_UfzNEgi5ni_T2IO17PAQZTiEguOPlwA_AOZZrG4ZCCyCzHkG&usqp=CAE",
          rating: 4.5,
          ratingCount: 84.893,
          position: 10,
        },
        {
          title: "Samsung Galaxy S24 Ultra - 512 GB - Titanium Gray",
          source: "iTradeit",
          link: "https://itradeit.in/shop/samsung-s24-ultra-5g-openbox/?attribute_pa_color=titanium-gray&attribute_pa_storage=12gb-512gb&srsltid=AfmBOopY0BVpyVFcC2CrCR3BlGBW0FbbfpoTPmyZjms4vIYEmgYPDnNPWGM",
          price: "Rp 18.615.335,56",
          imageUrl:
            "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQsM4IvmM-5cHxMm61L-ii-6LbZKcJBZQUJ3yKJoukAbSn8dU3-q7iGQIsjUj_02Cs61SEYsA&usqp=CAE",
          rating: 4.5,
          ratingCount: 84.893,
          position: 11,
        },
        {
          title:
            "Samsung Galaxy S24 Ultra (Online Exclusive) 1 TB 12 GB Titanium Orange",
          source: "Samsung Indonesia",
          link: "https://www.samsung.com/id/smartphones/galaxy-s24-ultra/buy/?modelCode=SM-S928BZOWXID",
          price: "Rp 27.999.000,00",
          delivery: "Free shipping",
          imageUrl:
            "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSccm6I1Tom4wTpooHymDn4ycl8obmRKoCZ29ymc08Iv7_msInUOM0e5D-1YjYjtV9oUWE&usqp=CAE",
          rating: 4.5,
          ratingCount: 84.893,
          position: 12,
        },
        {
          title:
            "SEIN | SAMSUNG GALAXY S24 ULTRA 5G 12/1TB 12/512GB 12/256GB SECOND RESMI",
          source: "Shopee",
          link: "https://shopee.co.id/product/1002518364/27809233787?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkVHQ3ZkZSUTMrR3pBWmZZNzdrcnRBMlpuTm80RDVzZTFjbDF1TUZUVHU5N0J6dTg2WTVuYWxrYVNNQ0lVVHdKcUlWSjJmT1VCVFQ2K1h0NlZybnVPWndFNUU4elhpOUhENXBzQXJNNmtNK0VMV0VEN0pHWmlxQkZjeWxBY0ZJQnRnPT0",
          price: "Rp 12.545.000,00 used",
          delivery: "Free shipping",
          imageUrl:
            "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSOcY-StCTILQSWbi319LFwmFY391t0BK8KPp9n749M76d1KR9K-gqoXFvP_STGhFzyewBOHA&usqp=CAE",
          rating: 4.5,
          ratingCount: 84.893,
          position: 13,
        },
        {
          title: "Samsung S24 Ultra 12 256 Bnob",
          source: "Tokopedia",
          link: "https://www.tokopedia.com/rekomendasi/16417242065",
          price: "Rp 15.000.000,00",
          delivery: "Free shipping",
          imageUrl:
            "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTa4ZoJi7OXFKfRbZIW6lSfs8dA-0PEKR3ndYvojLm19OyJTPcaaLKey5Q&usqp=CAE",
          rating: 4.5,
          ratingCount: 84.893,
          position: 14,
        },
        {
          title:
            "HP Samsung S24 Ultra 256GB 512GB 1TB Resmi SEIN 2nd Dual Sim Fullset Bekas Mulus",
          source: "Shopee",
          link: "https://shopee.co.id/product/116153895/29331088364?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkWVp3RFo3Mkw5czd4Z0hzdEF1WVFibjZGN1Bob0ozT1VVNlNEbjVEdXJjZ2xUUjJ3S0ljZHorTlhhZ3dHTWV4RVREVTlNRExjbTVlWlE5MFZNRFpvbDdWRDBwcml1Z0kxZXNTZmI0RVRKRE8",
          price: "Rp 13.499.000,00 used",
          delivery: "Free shipping",
          imageUrl:
            "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRmPojV_EQ3Vrjaul23JCjikdZncv5NzvGOE5lW1ZS6d5tENTosmVqdqJA&usqp=CAE",
          rating: 4.5,
          ratingCount: 84.893,
          position: 15,
        },
        {
          title: "Samsung S24 Ultra Resmi 256 / 512 gb sein",
          source: "Shopee",
          link: "https://shopee.co.id/product/263857215/28712935562?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkWVp3RFo3Mkw5czd4Z0hzdEF1WVFibUF1OGpxRXB3STJiU1FmaUxFdS81Q0ZBRVp6ZFVXK3BTa0FZTlhMYzlhbTRqWXFUYy9BV0w3dDlab2VEdkdqcEdmUFNTYlBNU0pxbEVPQ3FSRk54L2U",
          price: "Rp 13.550.000,00 used",
          delivery: "Free shipping",
          imageUrl:
            "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTebiEREeRxC9wzu8q-Akwxcq_mmHXtjFJERZiQqQJs40lCaRbf4vy070A&usqp=CAE",
          rating: 4.5,
          ratingCount: 84.893,
          position: 16,
        },
        {
          title: "Samsung S24 ultraaa second",
          source: "Shopee",
          link: "https://shopee.co.id/product/1369176881/40300420852?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkVHQ3ZkZSUTMrR3pBWmZZNzdrcnRBMTZWdkp3WE85enVReC9zcCtyVWwvM1BPeGI0SWdVemtGbnNhZ2F5RlhFZUpWT015YnN1TExVL1BIWEVybzVsYzc5MDhka3NoUmV4dzdQOVpzS0hTZ2RTVWpvZGhqUlRsMHRtc3BoM0VQMVB3PT0",
          price: "Rp 7.000.000,00",
          delivery: "Free shipping",
          imageUrl:
            "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTaX1lfS8_mn6u4FYtwU_I3l1EP6F5JtwsY_Y4D7Q_gxO28Owa6wEf9JE4&usqp=CAE",
          rating: 4.5,
          ratingCount: 84.893,
          position: 17,
        },
        {
          title: "samsung Galaxy s24 ultra 5g",
          source: "Shopee",
          link: "https://shopee.co.id/product/759603785/28876397969?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkWVp3RFo3Mkw5czd4Z0hzdEF1WVFia0k2dlNjeGpsYXBHcFVOSHZDbi9CWmpCTWVtamtZNjBCVDUrNkVHRUdZdlRUNzhJRjEwWHlIZXJnc2djRm9yNmFTcm9DM0V5b2JuWE5LeXVLSE9CNVE",
          price: "Rp 15.000.000,00",
          delivery: "Free shipping",
          imageUrl:
            "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRdTDyPITmyRxQWgU2erZPZtKykCUyCefzTPLzsQQpm12cl-sQqaFwHJvA&usqp=CAE",
          rating: 4.5,
          ratingCount: 84.893,
          position: 18,
        },
        {
          title:
            "Samsung Galaxy S24 Ultra Second Garansi Resmi SEIN | Samsung Second | Samsung S24 Ultra | Samsung Bekas Mulus | S24 Ultra Bekas",
          source: "Shopee",
          link: "https://shopee.co.id/product/45948441/29630702100?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkVzBLS2xuUGZzMlQ5NjlFWklmRkZjU1NucnRVS05FeVY1YmNDM1RsS0JXMGhhZWFHVzhJRUxNUnUzblAvcDBPamVURW5McGlTTjc2ZWsyN3ZLbkwxMzljN2UxT3NqN1JPVi9ybmd0SHFzQmw",
          price: "Rp 13.065.000,00 used",
          delivery: "Free shipping",
          imageUrl:
            "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSpx8Sc9-7KD7wccCKxFb59yENKvi360Qre9bR7d97yoLUpYVCV7HFJHGo&usqp=CAE",
          rating: 4.5,
          ratingCount: 84.893,
          position: 19,
        },
        {
          title: "Samsung Galaxy S24 Ultra",
          source: "Shopee",
          link: "https://shopee.co.id/product/410078108/24891102508?gads_t_sig=VTJGc2RHVmtYMTlxTFVSVVRrdENkWVp3RFo3Mkw5czd4Z0hzdEF1WVFia1hsdnA0bUVqU3l5eXFyK1BKTkZOZnBBdURTak5uODBlVDNWa1d2V1EyTGFvaTN6emgzQmF1Q0w4bTBSbjFlL2s0R1YwZ3lVaWpsNDNUbFNwSmp5K1c",
          price: "Rp 15.000.000,00 used",
          delivery: "Free shipping",
          imageUrl:
            "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT4-bDzC3bPYd4OhZeAJH8gljEPkQxSExmzlhvWczsTuObQ5vT_ld_WEwQTo2h-stDYvUdPXw&usqp=CAE",
          rating: 4.5,
          ratingCount: 84.893,
          position: 20,
        },
      ],
      credits: 2,
    },
    image: {
      searchParameters: {
        q: "Samsung Galaxy S24 Ultra",
        type: "images",
        engine: "google",
        num: 10,
      },
      images: [
        {
          title:
            "Samsung Galaxy S24 Ultra 256GB Titanium Gray (Verizon) SM ...",
          imageUrl:
            "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6570/6570393_sd.jpg",
          imageWidth: 3153,
          imageHeight: 3173,
          thumbnailUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHvjK9fKTobTL7BCS2iCs3w53zolC8toR4hgf3CqUhqarZ6vnZ&s",
          thumbnailWidth: 224,
          thumbnailHeight: 225,
          source: "Best Buy",
          domain: "www.bestbuy.com",
          link: "https://www.bestbuy.com/site/samsung-galaxy-s24-ultra-256gb-titanium-gray-verizon/6570393.p?skuId=6570393",
          googleUrl:
            "https://www.google.com/imgres?imgurl=https%3A%2F%2Fpisces.bbystatic.com%2Fimage2%2FBestBuy_US%2Fimages%2Fproducts%2F6570%2F6570393_sd.jpg&tbnid=VzTD2dLOELVXlM&imgrefurl=https%3A%2F%2Fwww.bestbuy.com%2Fsite%2Fsamsung-galaxy-s24-ultra-256gb-titanium-gray-verizon%2F6570393.p%3FskuId%3D6570393&docid=FNVJCexmYq_SFM&w=3153&h=3173&ved=0ahUKEwjJxPjg28CNAxUzSGwGHY5DLY8QvFcIAigA",
          position: 1,
        },
        {
          title:
            "SAMSUNG Galaxy S24 Ultra 5G Factory Unlocked 512GB - Titanium Black  (Renewed)",
          imageUrl:
            "https://m.media-amazon.com/images/I/510GGm-pGgL._AC_UF894,1000_QL80_.jpg",
          imageWidth: 894,
          imageHeight: 903,
          thumbnailUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDz-hpnGd04F1MNMRcaBs9t-meZj-6MrkjVgDE7tiVLPkelg8C&s",
          thumbnailWidth: 223,
          thumbnailHeight: 226,
          source: "Amazon.com",
          domain: "www.amazon.com",
          link: "https://www.amazon.com/SAMSUNG-Galaxy-S24-Ultra-Unlocked/dp/B0D2RXKLD8",
          googleUrl:
            "https://www.google.com/imgres?imgurl=https%3A%2F%2Fm.media-amazon.com%2Fimages%2FI%2F510GGm-pGgL._AC_UF894%2C1000_QL80_.jpg&tbnid=5JMk7Xm5xTx9-M&imgrefurl=https%3A%2F%2Fwww.amazon.com%2FSAMSUNG-Galaxy-S24-Ultra-Unlocked%2Fdp%2FB0D2RXKLD8&docid=GNjQ1ih0578GxM&w=894&h=903&ved=0ahUKEwjJxPjg28CNAxUzSGwGHY5DLY8QvFcIAygB",
          position: 2,
        },
        {
          title:
            "New Samsung Galaxy S24 Ultra 512GB Titanium Gray (Verizon) SM ...",
          imageUrl:
            "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6570/6570396cv11d.jpg",
          imageWidth: 2372,
          imageHeight: 4216,
          thumbnailUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6ksNwtF9WdMS08Ea3Z2UZfrQ3hAObDvljSb_xtiZc6ReIszo&s",
          thumbnailWidth: 168,
          thumbnailHeight: 299,
          source: "Best Buy",
          domain: "www.bestbuy.com",
          link: "https://www.bestbuy.com/site/samsung-galaxy-s24-ultra-512gb-titanium-gray-verizon/6570396.p?skuId=6570396",
          googleUrl:
            "https://www.google.com/imgres?imgurl=https%3A%2F%2Fpisces.bbystatic.com%2Fimage2%2FBestBuy_US%2Fimages%2Fproducts%2F6570%2F6570396cv11d.jpg&tbnid=xB5YASVoTJj07M&imgrefurl=https%3A%2F%2Fwww.bestbuy.com%2Fsite%2Fsamsung-galaxy-s24-ultra-512gb-titanium-gray-verizon%2F6570396.p%3FskuId%3D6570396&docid=cU5eC5NRyPt17M&w=2372&h=4216&ved=0ahUKEwjJxPjg28CNAxUzSGwGHY5DLY8QvFcIBCgC",
          position: 3,
        },
        {
          title:
            "Samsung S24 Ultra 512GB Gray - Premium Smartphone at Uvation ...",
          imageUrl:
            "https://cdn.uvation.com/uvationmarketplace/catalog/product/g/a/galaxy_s24_ultra_761_576_2_1.png",
          imageWidth: 761,
          imageHeight: 576,
          thumbnailUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuR5MWuBWmbtX6OhpowNXjzLgB2hBofVmN3oowjeG_xvCeWl-L&s",
          thumbnailWidth: 258,
          thumbnailHeight: 195,
          source: "Uvation Marketplace",
          domain: "marketplace.uvation.com",
          link: "https://marketplace.uvation.com/samsung-s24-ultra-512gb-gray/",
          googleUrl:
            "https://www.google.com/imgres?imgurl=https%3A%2F%2Fcdn.uvation.com%2Fuvationmarketplace%2Fcatalog%2Fproduct%2Fg%2Fa%2Fgalaxy_s24_ultra_761_576_2_1.png&tbnid=gnXAt6GhxNEmsM&imgrefurl=https%3A%2F%2Fmarketplace.uvation.com%2Fsamsung-s24-ultra-512gb-gray%2F&docid=tTZlU-OW02ThlM&w=761&h=576&ved=0ahUKEwjJxPjg28CNAxUzSGwGHY5DLY8QvFcIBSgD",
          position: 4,
        },
        {
          title:
            "SAMSUNG Galaxy S24 Ultra 5G, US Version, 256GB, Titanium Blue - Unlocked  (Renewed)",
          imageUrl:
            "https://m.media-amazon.com/images/I/61KH0Ri7U-L._AC_UF894,1000_QL80_.jpg",
          imageWidth: 737,
          imageHeight: 1000,
          thumbnailUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQ7G2scThURPj3SLmV_WEU6sgLVmTNcngF1j12mg8nJVF42ind&s",
          thumbnailWidth: 193,
          thumbnailHeight: 262,
          source: "Amazon.com",
          domain: "www.amazon.com",
          link: "https://www.amazon.com/SAMSUNG-Galaxy-S24-Ultra-Titanium/dp/B0D364P7F4",
          googleUrl:
            "https://www.google.com/imgres?imgurl=https%3A%2F%2Fm.media-amazon.com%2Fimages%2FI%2F61KH0Ri7U-L._AC_UF894%2C1000_QL80_.jpg&tbnid=bKaUmXlwBTWFeM&imgrefurl=https%3A%2F%2Fwww.amazon.com%2FSAMSUNG-Galaxy-S24-Ultra-Titanium%2Fdp%2FB0D364P7F4&docid=zjicrsbD3adI8M&w=737&h=1000&ved=0ahUKEwjJxPjg28CNAxUzSGwGHY5DLY8QvFcIBigE",
          position: 5,
        },
        {
          title:
            "Samsung Galaxy S24 Ultra | Features & Highlights | Samsung US",
          imageUrl:
            "https://images.samsung.com/is/image/samsung/assets/us/2501/pcd/smartphones/galaxy-s24-ultra/galaxy-S24-ultra-ft02-kv_MO.jpg?$720_N_JPG$",
          imageWidth: 720,
          imageHeight: 1100,
          thumbnailUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyUwJXIW3VgU3TCNg8mADIoFCdYty2HcQfB8aIknruRD6N9hg&s",
          thumbnailWidth: 182,
          thumbnailHeight: 278,
          source: "Samsung",
          domain: "www.samsung.com",
          link: "https://www.samsung.com/us/smartphones/galaxy-s24-ultra/",
          googleUrl:
            "https://www.google.com/imgres?imgurl=https%3A%2F%2Fimages.samsung.com%2Fis%2Fimage%2Fsamsung%2Fassets%2Fus%2F2501%2Fpcd%2Fsmartphones%2Fgalaxy-s24-ultra%2Fgalaxy-S24-ultra-ft02-kv_MO.jpg%3F%24720_N_JPG%24&tbnid=zUSliyAkGUZQrM&imgrefurl=https%3A%2F%2Fwww.samsung.com%2Fus%2Fsmartphones%2Fgalaxy-s24-ultra%2F&docid=DtYymthxHMn59M&w=720&h=1100&ved=0ahUKEwjJxPjg28CNAxUzSGwGHY5DLY8QvFcIBygF",
          position: 6,
        },
        {
          title:
            "Samsung Galaxy S24 Ultra review: Still the flagship of Android ...",
          imageUrl:
            "https://www.zdnet.com/a/img/2024/02/02/1bfa7d30-112c-4906-83a7-ce12551b7b16/galaxy-s24-ultra.jpg",
          imageWidth: 2048,
          imageHeight: 1365,
          thumbnailUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF0Qyu0AkQ1JqJV_so8QsZR6_7je1dJFF85sZSFhSYvZ6G8WQ&s",
          thumbnailWidth: 275,
          thumbnailHeight: 183,
          source: "ZDNET",
          domain: "www.zdnet.com",
          link: "https://www.zdnet.com/article/samsung-galaxy-s24-ultra-review/",
          googleUrl:
            "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwww.zdnet.com%2Fa%2Fimg%2F2024%2F02%2F02%2F1bfa7d30-112c-4906-83a7-ce12551b7b16%2Fgalaxy-s24-ultra.jpg&tbnid=Ydo7cIPqsCJoYM&imgrefurl=https%3A%2F%2Fwww.zdnet.com%2Farticle%2Fsamsung-galaxy-s24-ultra-review%2F&docid=o5Whhm0BxRCrAM&w=2048&h=1365&ved=0ahUKEwjJxPjg28CNAxUzSGwGHY5DLY8QvFcICCgG",
          position: 7,
        },
        {
          title:
            "AT&T Samsung Galaxy S24 Ultra Titanium Black 256GB - Walmart.com",
          imageUrl:
            "https://i5.walmartimages.com/seo/AT-T-Samsung-Galaxy-S24-Ultra-Titanium-Violet-512GB_784b47ee-bfb7-4543-af9d-5406c37ffed5.fa51da09222008a396f35c6e245e2e2a.jpeg",
          imageWidth: 5400,
          imageHeight: 5400,
          thumbnailUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQL423vNsPDCQtapvfkB6deKE5UgjA2XgAHhq6Z6v90dKP7u0&s",
          thumbnailWidth: 225,
          thumbnailHeight: 225,
          source: "Walmart",
          domain: "www.walmart.com",
          link: "https://www.walmart.com/ip/AT-T-Samsung-Galaxy-S24-Ultra-Titanium-Black-256GB/5303769194",
          googleUrl:
            "https://www.google.com/imgres?imgurl=https%3A%2F%2Fi5.walmartimages.com%2Fseo%2FAT-T-Samsung-Galaxy-S24-Ultra-Titanium-Violet-512GB_784b47ee-bfb7-4543-af9d-5406c37ffed5.fa51da09222008a396f35c6e245e2e2a.jpeg&tbnid=6KlYJhX7S_TvgM&imgrefurl=https%3A%2F%2Fwww.walmart.com%2Fip%2FAT-T-Samsung-Galaxy-S24-Ultra-Titanium-Black-256GB%2F5303769194&docid=1p5SzyCH-epcPM&w=5400&h=5400&ved=0ahUKEwjJxPjg28CNAxUzSGwGHY5DLY8QvFcICSgH",
          position: 8,
        },
        {
          title: "Samsung Galaxy S24 Ultra with Galaxy AI | Samsung Jordan",
          imageUrl:
            "https://images.samsung.com/levant/smartphones/galaxy-s24-ultra/images/galaxy-s24-ultra-highlights-color-titanium-yellow-back-mo.jpg?imbypass=true",
          imageWidth: 1068,
          imageHeight: 696,
          thumbnailUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTD0WpS43fbxF_KAni--jOXeL6oyXaWrYOIGlDQtc74WZk6q24&s",
          thumbnailWidth: 278,
          thumbnailHeight: 181,
          source: "Samsung",
          domain: "www.samsung.com",
          link: "https://www.samsung.com/levant/smartphones/galaxy-s24-ultra/",
          googleUrl:
            "https://www.google.com/imgres?imgurl=https%3A%2F%2Fimages.samsung.com%2Flevant%2Fsmartphones%2Fgalaxy-s24-ultra%2Fimages%2Fgalaxy-s24-ultra-highlights-color-titanium-yellow-back-mo.jpg%3Fimbypass%3Dtrue&tbnid=0BniC3li0keYNM&imgrefurl=https%3A%2F%2Fwww.samsung.com%2Flevant%2Fsmartphones%2Fgalaxy-s24-ultra%2F&docid=zcdfG3UG6CoO8M&w=1068&h=696&ved=0ahUKEwjJxPjg28CNAxUzSGwGHY5DLY8QvFcICigI",
          position: 9,
        },
        {
          title:
            "Samsung Galaxy S24 Ultra: Prices, 1 Colors, Sizes, Features & Specs",
          imageUrl:
            "https://t-mobile.scene7.com/is/image/Tmusprod/Samsung-Galaxy-S24-Ultra-Titanium-Black-frontimage",
          imageWidth: 250,
          imageHeight: 400,
          thumbnailUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTr_NGeIrKdyyPgGDXQLLOq4amw_eZJo3PYzudBYFxAdNxtIrc&s",
          thumbnailWidth: 177,
          thumbnailHeight: 284,
          source: "T-Mobile",
          domain: "www.t-mobile.com",
          link: "https://www.t-mobile.com/cell-phone/samsung-galaxy-s24-ultra",
          googleUrl:
            "https://www.google.com/imgres?imgurl=https%3A%2F%2Ft-mobile.scene7.com%2Fis%2Fimage%2FTmusprod%2FSamsung-Galaxy-S24-Ultra-Titanium-Black-frontimage&tbnid=b8M5Ps9K3sRGcM&imgrefurl=https%3A%2F%2Fwww.t-mobile.com%2Fcell-phone%2Fsamsung-galaxy-s24-ultra&docid=x85glYLU0KL0LM&w=250&h=400&ved=0ahUKEwjJxPjg28CNAxUzSGwGHY5DLY8QvFcICygJ",
          position: 10,
        },
      ],
      credits: 1,
    },
    videos: {
      searchParameters: {
        q: "Samsung Galaxy S24 Ultra",
        gl: "id",
        type: "videos",
        engine: "google",
      },
      videos: [
        {
          title: "Samsung Galaxy S24 Ultra Review Setelah 1 Tahun ...",
          link: "https://www.youtube.com/watch?v=Ci3b--LZ-Jw",
          snippet:
            "Timecode: Intro - 00:00 Harga Dan Spec - 00:31 Design Dan Display - 01:18 Biometrics - 03:33 Audio Quality - 04:33 Speaker Test - 06:03 ...",
          imageUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTvixIlkJoevFKOxo0i_oUayt-Lea8rC_vMtPpmzYyOxRf&s",
          videoUrl:
            "https://encrypted-vtbn0.gstatic.com/video?q=tbn:ANd9GcTrdzKab5L0I7nsBlo2cPpxDE05bO4hBqKCwA",
          duration: "18:45",
          source: "YouTube",
          channel: "Steff Tech",
          date: "5 Jan 2025",
          position: 1,
        },
        {
          title: "Samsung S24 Ultra vs S25 Ultra | Mending Mana Nih?",
          link: "https://www.youtube.com/watch?v=j78p75aVHUE",
          snippet:
            "Jadi mending beli yang mana? Samsung Galaxy S24 Ultra atau S25 Ultra sekalian? Tonton video versus-nya di sini. List alat syuting: Camera 1 ...",
          imageUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoEZ0ZTcGg4E2c9kDOR3Aao7TQSJ23O6EY-h6drjVKmmSH&s",
          videoUrl:
            "https://encrypted-vtbn0.gstatic.com/video?q=tbn:ANd9GcT8lNANr6gJdamyDUypIZzBNOcMNu3MipqRwg",
          duration: "17:32",
          source: "YouTube",
          channel: "TrendingTek",
          date: "1 month ago",
          position: 2,
        },
        {
          title: "Hardware GANAS Software CERDAS - Review Samsung S24 ...",
          link: "https://www.youtube.com/watch?v=daFpfaCmrAs&pp=0gcJCdgAo7VqN5tD",
          snippet:
            "No spill spill. Link pembelian Samsung Galaxy S24 Series: https://omgrefer.com/Hb9q7 Barang bekas review biasanya saya jual disini: ...",
          imageUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhtlVDv0k_sNkga8sGkiQaTCqKrW1JH0TNt3xJLSXli4Ol&s",
          duration: "16:03",
          source: "YouTube",
          channel: "GadgetIn",
          date: "3 Feb 2024",
          position: 3,
        },
        {
          title:
            "Wajib Beli Versi ULTRA!!! | Full Review Samsung Galaxy S24 ...",
          link: "https://www.youtube.com/watch?v=CA6asQ0xqSI",
          snippet:
            "Emang sih lebih mahal, tapi JAUH LEBIH WORTH IT dibanding versi Reguler Mau beli hp nya? Pastiin di Distributor Ponsel yaa.",
          imageUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRv8vaCQNqQ8QbqAzTxhuIRHW_oJ7NhBkPhSyIxpJKYgjcR&s",
          duration: "11:06",
          source: "YouTube",
          channel: "Gadgetalk",
          date: "16 Jul 2024",
          position: 4,
        },
        {
          title: "Suka Duka Pakai Samsung Galaxy S24 Ultra Review",
          link: "https://www.youtube.com/watch?v=utE2eXVmo4o",
          snippet:
            "Masih Jadi yang terbaik! Galaxy AI nya sih kaya jadi pamungkas Cek tempat belinya : https://invol.co/cllcpp9 Thanks udah nonton, ...",
          imageUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRqQVbq4wNzQPQmJXYC7PZiUQK3u4XN-8MLdtWH4d8h4-a&s",
          duration: "9:47",
          source: "YouTube",
          channel: "Arrinish",
          date: "4 Jul 2024",
          position: 5,
        },
        {
          title: "SAMSUNG GALAXY S24 ULTRA - BEGINI PENGALAMAN ...",
          link: "https://www.youtube.com/watch?v=jT8EKPYqfRk",
          snippet:
            "Ada yang sudah pakai S24 Ultra juga disini? Samsung Galaxy S24 Ultra sudah menemani saya selama dua bulan lebih.",
          imageUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGj6DsQ6Y_kVwX6O-ZRdSDPJX_5bbAcGcuQ_GkEFIsdOuA&s",
          duration: "11:45",
          source: "YouTube",
          channel: "Ibro Kumar",
          date: "4 May 2024",
          position: 6,
        },
        {
          title: "Samsung Galaxy S24 Ultra Review Setelah 5 Bulan ...",
          link: "https://www.youtube.com/watch?v=y_-fbZIqgvE",
          snippet:
            "Samsung galaxy s24 ultra ini udh gue pakai sebagai hape utama selama 4 bulan, bagaimanakah experiencenya? yuk mari kita langsung aja review ...",
          imageUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLKUDGGYJTedCrI3dFUwWBEsv_clH9R9hFnyisKMFKH-AX&s",
          duration: "24:24",
          source: "YouTube",
          channel: "Steff Tech",
          date: "22 Jun 2024",
          position: 7,
        },
        {
          title: "Peningkatan Kamera? AI nya Berguna? Galaxy S24 Ultra and ...",
          link: "https://www.youtube.com/watch?v=qJRfuVM15S8",
          snippet:
            "Samsung Galaxy S24 Ultra resmi hadir di Indonesia. Seperti apa produknya ? Apa jualan utamanya ? Dan bagaimana karakter inti dari cameranya ...",
          imageUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpLoX_3NWkiKcQmVL66y3ldknJRAurBqJTSSw841kIOhpK&s",
          duration: "11:05",
          source: "YouTube",
          channel: "K2G",
          date: "18 Jan 2024",
          position: 8,
        },
        {
          title: "MAKE LAGI SAMSUNG S24 ULTRA SEBELUM S25 ULTRA ...",
          link: "https://www.youtube.com/watch?v=q_gP3vGKC_s",
          snippet:
            "Tolong bantu gw dong, upgrade apa enggak nih ke Samsung S25 Ultra nanti.. Samsung S24 Ultra Shopee: https://s.shopee.co.id/g8zBaw1B3 Lazada: ...",
          imageUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUewGOcwdoQTNICQZnkTeIcGalfJfKAXeT4oCE_42Fm4oX&s",
          videoUrl:
            "https://encrypted-vtbn0.gstatic.com/video?q=tbn:ANd9GcQTNjrY_u7r4KWnjtk-508SrKOSUX7kRH7nyw",
          duration: "10:21",
          source: "YouTube",
          channel: "NYANTECH",
          date: "19 Nov 2024",
          position: 9,
        },
        {
          title: "Review 5 Menit: Samsung Galaxy S24 Ultra!",
          link: "https://www.youtube.com/watch?v=HJ6byqynzEg",
          snippet:
            "Quick Review dan Hands-On Samsung Galaxy S24 Ultra dari Wisnu Kumoro. #CurhatGadget #GalaxyS24Ultra #SamsungID.",
          imageUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTT4JJwBy8Wr0I8C1EMYCZjX5EAAYTK_nb54cLX2VwEg-A8&s",
          videoUrl:
            "https://encrypted-vtbn0.gstatic.com/video?q=tbn:ANd9GcQH3myOzy5efxc1FIomJ5ELnHg737yR-Mq1iQ",
          duration: "5:29",
          source: "YouTube",
          channel: "Wisnu Kumoro",
          date: "18 Jan 2024",
          position: 10,
        },
      ],
      credits: 1,
    },
  },
};

export default function Page() {
  return (
    <main className="py-10 bg-black ">
      {/* <SerperRawResult data={sampleData} /> */}
      <div className="flex justify-center">
        <ScrollArea className="w-[400px] h-[500px]">
          <SerperAPIResult data={sampleData} />
        </ScrollArea>
      </div>
    </main>
  );
}
