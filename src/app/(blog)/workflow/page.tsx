import { Footer } from "@/components/maven/footer";
import { NavigationBar } from "@/components/maven/navigation-bar";
import { WorkflowContent } from "@/components/maven/workflow";
import { Metadata } from "next";

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
      <WorkflowContent />
      <Footer />
    </div>
  );
}
