import { LandingPage } from "@/components/maven/landing-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maven AI - Your AI Assistant for Smart Electronic Product Choices",
  description:
    "Maven AI simplifies product research with AI-powered recommendations, comparisons, and insights for electronic products.",
  keywords: [
    "AI product assistant",
    "electronic product research",
    "product comparison AI",
    "Maven AI",
    "electronics",
    "gadgets",
  ],
  authors: [{ name: "Rizky Agung Prasetyo" }],
  openGraph: {
    title: "Maven AI - AI-Powered Product Research",
    description:
      "Discover how Maven AI can help you make smarter electronic product choices with ease.",
    url: "https://maven-ai-six.vercel.app/",
    siteName: "Maven AI",
    images: [
      {
        url: "https://res.cloudinary.com/dberoyocy/image/upload/v1745408208/light-desktop-insight-2_we92om.png",
        width: 1200,
        height: 630,
        alt: "Maven AI Product Research Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maven AI - AI-Powered Product Research",
    description:
      "Discover how Maven AI can help you make smarter electronic product choices with ease.",
    creator: "@codebyrzky",
    images: [
      "https://res.cloudinary.com/dberoyocy/image/upload/v1745408208/light-desktop-insight-2_we92om.png",
    ],
  },
};

export default function Page() {
  return (
    <main>
      <LandingPage />
    </main>
  );
}
