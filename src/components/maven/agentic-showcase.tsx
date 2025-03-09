"use client";

import Image from "next/image";
import { useState, memo, Dispatch, SetStateAction } from "react";
import { cn } from "@/lib/utils";

const Card = memo(
  ({
    card,
    index,
    hovered,
    setHovered,
  }: {
    card: Card;
    index: number;
    hovered: number | null;
    setHovered: Dispatch<SetStateAction<number | null>>;
  }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "rounded-[2rem] relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-[500px] w-full transition-all duration-300 ease-out",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
    >
      <Image
        src={card.src}
        alt={card.title}
        fill
        className="object-cover absolute inset-0"
      />
      <div
        className={cn(
          "absolute inset-0 bg-black/50 flex items-end py-8 px-4 transition-opacity duration-300",
          hovered === index ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200">
          <h4 className="text-xl md:text-2xl font-medium">{card.title}</h4>
          <p>{card.description}</p>
        </div>
      </div>
    </div>
  )
);

Card.displayName = "Card";

type Card = {
  title: string;
  description: string;
  src: string;
};

const cards: Card[] = [
  {
    title: "AI Product Picks",
    description:
      "Discover the perfect products for you. Maven's intelligent recommender analyzes your needs and preferences, providing personalized suggestions and insightful explanations, guiding you to the best choices quickly and confidently.",
    src: "/showcase/showcase-1.jpg",
  },
  {
    title: "Find Products Fast",
    description:
      "Instantly locate the products you're looking for. Maven's precise search engine swiftly retrieves relevant results from the web, even with partial names, presenting you with concise summaries and key details to streamline your research.",
    src: "/showcase/showcase-2.jpg",
  },
  {
    title: "Deep Product Insights",
    description:
      "Go beyond the surface. Maven gathers comprehensive product information from multiple sources, including web scraping and external databases, delivering in-depth details, specifications, and insightful summaries to empower your decision-making.",
    src: "/showcase/showcase-3.jpg",
  },
  {
    title: "Compare Side-by-Side",
    description:
      "Make informed choices with ease. Maven lets you directly compare multiple products, highlighting key differences and similarities, providing clear, concise comparisons and expert insights to help you choose the best option.",
    src: "/showcase/showcase-4.jpg",
  },
  {
    title: "User Inquirer",
    description:
      "Experience a truly personalized interaction. When more information is needed, Maven proactively asks clarifying questions, ensuring it fully understands your requirements and delivers the most relevant and accurate results. This interactive approach ensures you get exactly what you're looking for.",
    src: "/showcase/showcase-5.jpg",
  },
  {
    title: "External Data Search",
    description:
      "A process of retrieving and analyzing information from sources outside a system's app, such as web content, social media platforms, forums, public records, or other third-party data repositories, to provide comprehensive and up-to-date insights.",
    src: "/showcase/showcase-6.jpg",
  },
];

export function AgenticShowcase() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 container mx-auto md:px-8 w-full">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}
