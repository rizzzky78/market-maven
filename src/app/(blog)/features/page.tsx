import { Features } from "@/components/maven/features";
import { Footer } from "@/components/maven/footer";
import { NavigationBar } from "@/components/maven/navigation-bar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maven AI Features - Explore Our AI-Powered Tools",
  description:
    "Discover the powerful features of Maven AI, including personalized recommendations, fast product search, in-depth insights, side-by-side comparisons, and interactive user inquiries.",
  keywords: [
    "Maven AI features",
    "AI product recommendations",
    "product search AI",
    "product comparison tools",
    "electronic product assistant",
  ],
  authors: [{ name: "Rizky Agung Prasetyo" }],
  openGraph: {
    title: "Maven AI Features",
    description:
      "Explore the AI-powered tools that make Maven AI your ultimate product research assistant.",
    url: "https://maven-ai-six.vercel.app/features",
    siteName: "Maven AI",
    images: [
      {
        url: "https://res.cloudinary.com/dberoyocy/image/upload/v1745408125/dark-desktop-recommendations_ulacwj.png",
        width: 1200,
        height: 630,
        alt: "Maven AI Features Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maven AI Features",
    description:
      "Explore the AI-powered tools that make Maven AI your ultimate product research assistant.",
    creator: "@codebyrzky",
    images: [
      "https://res.cloudinary.com/dberoyocy/image/upload/v1745408125/dark-desktop-recommendations_ulacwj.png",
    ],
  },
};

export default function Page() {
  return (
    <div>
      <NavigationBar />
      <Features />
      <Footer />
    </div>
  );
}
