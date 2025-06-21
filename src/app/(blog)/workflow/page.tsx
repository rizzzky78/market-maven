import { Footer } from "@/components/maven/footer";
import { NavigationBar } from "@/components/maven/navigation-bar";
import { WorkflowContent } from "@/components/maven/workflow";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Maven AI Workflow - How Our AI Assistant Works",
  description:
    "Learn about the seamless workflow of Maven AI, from user input to AI-driven product research and insights.",
  keywords: [
    "Maven AI workflow",
    "AI assistant process",
    "product research workflow",
    "electronic product research",
  ],
  authors: [{ name: "Rzky Prasetyo" }],
  openGraph: {
    title: "Maven AI Workflow",
    description:
      "Understand how Maven AI processes your requests to deliver accurate and helpful product insights.",
    url: "https://maven-ai-six.vercel.app/workflow",
    siteName: "Maven AI",
    images: [
      {
        url: "https://res.cloudinary.com/dberoyocy/image/upload/v1745408210/light-desktop-search_ftzyyz.png",
        width: 1200,
        height: 630,
        alt: "Maven AI Workflow Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maven AI Workflow",
    description:
      "Understand how Maven AI processes your requests to deliver accurate and helpful product insights.",
    creator: "@codebyrzky",
    images: [
      "https://res.cloudinary.com/dberoyocy/image/upload/v1745408210/light-desktop-search_ftzyyz.png",
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
      <WorkflowContent />
      <Footer />
    </div>
  );
}
