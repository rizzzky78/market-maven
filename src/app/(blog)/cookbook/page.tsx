import { Cookbook } from "@/components/maven/cookbook";
import { Footer } from "@/components/maven/footer";
import { NavigationBar } from "@/components/maven/navigation-bar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maven AI Cookbook - Mastering Product Research with AI",
  description:
    "Unlock the full potential of Maven AI with our comprehensive guide, featuring tips, strategies, and best practices for optimal product research.",
  keywords: [
    "Maven AI guide",
    "product research tips",
    "AI assistant best practices",
    "electronic product research guide",
  ],
  authors: [{ name: "Rizky Agung Prasetyo" }],
  openGraph: {
    title: "Maven AI Cookbook",
    description:
      "Master product research with Maven AI using our expert tips and strategies.",
    url: "https://maven-ai-six.vercel.app/cookbook",
    siteName: "Maven AI",
    images: [
      {
        url: "https://res.cloudinary.com/dberoyocy/image/upload/v1745408174/light-desktop-default-screen_wodwin.png",
        width: 1200,
        height: 630,
        alt: "Maven AI Cookbook Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maven AI Cookbook",
    description:
      "Master product research with Maven AI using our expert tips and strategies.",
    creator: "@codebyrzky",
    images: [
      "https://res.cloudinary.com/dberoyocy/image/upload/v1745408174/light-desktop-default-screen_wodwin.png",
    ],
  },
};

export default function Page() {
  return (
    <div>
      <NavigationBar />
      <main>
        <Cookbook />
      </main>
      <Footer />
    </div>
  );
}
