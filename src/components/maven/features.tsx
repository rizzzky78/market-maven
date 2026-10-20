"use client";

import { createLucideIcon } from "lucide-react";
import Link from "next/link";
import { FC } from "react";
import { AutoplayVideo } from "../ui/autoplay-video";

// Brand icons were removed in lucide-react 1.0; these are the icon nodes
// from lucide-react 0.473 (ISC licensed) so the share links render unchanged.
const Facebook = createLucideIcon("Facebook", [
  [
    "path",
    {
      d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
      key: "1jg4f8",
    },
  ],
]);

const Twitter = createLucideIcon("Twitter", [
  [
    "path",
    {
      d: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",
      key: "pff0z6",
    },
  ],
]);

const Linkedin = createLucideIcon("Linkedin", [
  [
    "path",
    {
      d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",
      key: "c2jq9f",
    },
  ],
  ["rect", { width: "4", height: "12", x: "2", y: "9", key: "mk3on5" }],
  ["circle", { cx: "4", cy: "4", r: "2", key: "bt5ra8" }],
]);

export const Features: FC = () => {
  return (
    <div className="w-full flex justify-center">
      <div className="bg-background">
        {/* Header section */}
        <header className="px-4 pt-[120px] lg:pt-[18vh] pb-12 lg:pb-0 flex justify-start">
          <div className="text-start max-w-5xl">
            <h1 className="font-[family-name:var(--font-array)] tracking-wider text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-purple-500">Maven Features:</span> Your
              AI-Powered Product Toolkit
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-4 font-[family-name:var(--font-khand)]">
              Maven is designed to revolutionize the way you research and choose{" "}
              <span className="text-purple-500"> electronic</span> categorized
              products. This suite of AI-powered tools provides everything you
              need, from personalized recommendations to in-depth comparisons,
              all in one intuitive platform. Explore the features below to see
              how Maven can help you make smarter decisions, faster.
            </p>
            <p className="text-sm text-muted-foreground font-[family-name:var(--font-khand)]">
              Last Updated: May 2025 |{" "}
              <span className="font-medium">Rzky</span>
            </p>
          </div>
        </header>

        {/* Features section */}
        <main className="max-w-7xl mx-auto px-4 pb-12 font-[family-name:var(--font-khand)] flex flex-col space-y-[50px]">
          <VideoShowcase />

          {/* Social sharing */}
          <div className="flex justify-center gap-4 mb-16">
            <p className="text-muted-foreground mr-2">Share this page:</p>
            <Link href="#" aria-label="Share on Facebook">
              <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
            <Link href="#" aria-label="Share on Twitter">
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
            <Link href="#" aria-label="Share on LinkedIn">
              <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

const VideoShowcase = () => {
  type ShowcaseData = {
    title: string;
    description: string;
    src: string;
    poster: string;
  };

  const showcaseData: ShowcaseData[] = [
    {
      title: "AI Product Picks",
      description:
        "Discover the perfect products for you. Maven's intelligent recommender analyzes your needs and preferences, providing personalized suggestions and insightful explanations, guiding you to the best choices quickly and confidently.",
      src: "https://res.cloudinary.com/dberoyocy/video/upload/v1747032956/compressed-Raw-Maven-Recommendations_o6vped.mp4",
      poster:
        "https://res.cloudinary.com/dberoyocy/image/upload/v1746757592/dark-maven-recommendations_k8zqwi.png",
    },
    {
      title: "Find Products Fast",
      description:
        "Instantly locate the products you're looking for. Maven's precise search engine swiftly retrieves relevant results from the web, even with partial names, presenting you with concise summaries and key details to streamline your research.",
      src: "https://res.cloudinary.com/dberoyocy/video/upload/v1747016758/compressed-Maven-Search-Product-Q-Lenovo_pcachy.mp4",
      poster:
        "https://res.cloudinary.com/dberoyocy/image/upload/v1746757593/dark-maven-search-results_btdul2.png",
    },
    {
      title: "Deep Product Insights",
      description:
        "Go beyond the surface. Maven gathers comprehensive product information from multiple sources, including web scraping and external databases, delivering in-depth details, specifications, and insightful summaries to empower your decision-making.",
      src: "https://res.cloudinary.com/dberoyocy/video/upload/v1747035285/compressed-Maven-Details-Product-Q-Lenovo_uskb66.mp4",
      poster:
        "https://res.cloudinary.com/dberoyocy/image/upload/v1746757592/dark-maven-details-result_t9shmn.png",
    },
    {
      title: "Compare Side-by-Side",
      description:
        "Make informed choices with ease. Maven lets you directly compare multiple products, highlighting key differences and similarities, providing clear, concise comparisons and expert insights to help you choose the best option.",
      src: "https://res.cloudinary.com/dberoyocy/video/upload/v1747016882/compressed-Maven-Comparison-Q-Laptop_dwepga.mp4",
      poster:
        "https://res.cloudinary.com/dberoyocy/image/upload/v1747033967/dark-maven-comparison_qvottq.png",
    },
    {
      title: "User Inquiry",
      description:
        "Experience a truly personalized interaction. When more information is needed, Maven proactively asks clarifying questions, ensuring it fully understands your requirements and delivers the most relevant and accurate results. This interactive approach ensures you get exactly what you're looking for.",
      src: "https://res.cloudinary.com/dberoyocy/video/upload/v1747035157/compressed-Raw-Maven-Inquiry_bn6bno.mp4",
      poster:
        "https://res.cloudinary.com/dberoyocy/image/upload/v1747034773/dark-maven-inquiry_qu32tp.png",
    },
  ];

  return (
    <main className="pt-[60px] lg:pt-[200px] w-full flex justify-center">
      <div className="w-full flex flex-col space-y-[90px]">
        {showcaseData.map((snapshot, index) => (
          <section
            key={index}
            className="w-full flex flex-col space-y-[30px] lg:flex-row justify-between items-start"
          >
            <div className="pt-[40px] w-fit lg:w-[500px] flex flex-col pr-6">
              <h2 className="mb-4 font-[family-name:var(--font-array)] text-purple-500 text-4xl tracking-wider">
                {snapshot.title}
              </h2>
              <p className="font-[family-name:var(--font-khand)] text-sm lg:text-lg ">
                {snapshot.description}
              </p>
            </div>

            <AutoplayVideo
              key={index}
              src={snapshot.src}
              poster={snapshot.poster}
              aspectRatio="16/9"
              threshold={0.1}
              className=""
              videoClassName="rounded-3xl border border-white/10"
            />
          </section>
        ))}
      </div>
    </main>
  );
};
