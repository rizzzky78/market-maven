import { ExtendedMessage } from "@/components/maven/extended-message";
import { LoadingText } from "@/components/maven/shining-glass";

export default function Page() {
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
`

const tavilyAnswer = ``

  return (
    <div className="px-2 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24 max-w-[484px] md:max-w-3xl w-full mx-auto flex flex-col space-y-3 md:space-y-4">
      <LoadingText text="Helo World from another world!" />
      <ExtendedMessage title="Agent Search" content={exampleData} />
      <ExtendedMessage title="Tavily Search" content={tavilyAnswer} />
    </div>
  );
}
