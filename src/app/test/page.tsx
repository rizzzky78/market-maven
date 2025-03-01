"use client";
import React from "react";
import Image from "next/image";
import { StickyScroll } from "@/components/maven/sticky-scroll";

const content = [
  {
    title: "AI Product Picks",
    description:
      "Discover the perfect products for you. Maven's intelligent recommender analyzes your needs and preferences, providing personalized suggestions and insightful explanations, guiding you to the best choices quickly and confidently.",
    content: (
      <div className="h-full w-full  flex items-center justify-center text-white">
        <Image
          src="/rate-img-5.jpg"
          width={500}
          height={500}
          className="h-full w-full object-cover"
          alt="linear board demo"
        />
      </div>
    ),
  },
  {
    title: "Find Products Fast",
    description:
      "Instantly locate the products you're looking for. Maven's precise search engine swiftly retrieves relevant results from the web, even with partial names, presenting you with concise summaries and key details to streamline your research.",
    content: (
      <div className="h-full w-full  flex items-center justify-center text-white">
        <Image
          src="/rate-img-1.jpg"
          width={300}
          height={300}
          className="h-full w-full object-cover"
          alt="linear board demo"
        />
      </div>
    ),
  },
  {
    title: "Deep Product Insights",
    description:
      "Go beyond the surface. Maven gathers comprehensive product information from multiple sources, including web scraping and external databases, delivering in-depth details, specifications, and insightful summaries to empower your decision-making.",
    content: (
      <div className="h-full w-full  flex items-center justify-center text-white">
        <Image
          src="/rate-img-2.jpg"
          width={300}
          height={300}
          className="h-full w-full object-cover"
          alt="linear board demo"
        />
      </div>
    ),
  },
  {
    title: "Compare Side-by-Side",
    description:
      "Make informed choices with ease. Maven lets you directly compare multiple products, highlighting key differences and similarities, providing clear, concise comparisons and expert insights to help you choose the best option.",
    content: (
      <div className="h-full w-full  flex items-center justify-center text-white">
        <Image
          src="/rate-img-3.jpg"
          width={300}
          height={300}
          className="h-full w-full object-cover"
          alt="linear board demo"
        />
      </div>
    ),
  },
  {
    title: "Maven Understands You",
    description:
      "Experience a truly personalized interaction. When more information is needed, Maven proactively asks clarifying questions, ensuring it fully understands your requirements and delivers the most relevant and accurate results. This interactive approach ensures you get exactly what you're looking for.",
    content: (
      <div className="h-full w-full  flex items-center justify-center text-white">
        <Image
          src="/rate-img-4.jpg"
          width={300}
          height={300}
          className="h-full w-full object-cover"
          alt="linear board demo"
        />
      </div>
    ),
  },
];
export default function StickyScrollRevealDemo() {
  return (
    <div className="p-10 flex items-center justify-center">
      <StickyScroll content={content} />
    </div>
  );
}
