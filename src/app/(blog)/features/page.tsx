import { Features } from "@/components/maven/features";
import { Footer } from "@/components/maven/footer";
import { NavigationBar } from "@/components/maven/navigation-bar";
import { Metadata } from "next";
import Link from "next/link";

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
      <div className="sticky top-[70px] right-0 w-full flex justify-center z-[99999]">
        <Link
          href={"https://maven-ai-webpage.vercel.app/"}
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
          <div className="group-hover:translate-y-[10px] transition-all duration-700 border-2 text-lg border-purple-500 h-[60px] w-fit bg-white text-black rounded-full px-4 flex items-center font-semibold">
            <p className="group-hover:text-purple-500 transition-colors duration-300">
              Click here for Maven Webpage v2
            </p>
          </div>
        </Link>
      </div>
      <Features />
      <Footer />
    </div>
  );
}
