"use client";

import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  PenToolIcon as Tool,
  Lightbulb,
  Zap,
  Search,
  Layers,
  SplitSquareVertical,
  FileText,
  HelpCircle,
  Compass,
  Workflow,
  ArrowUpRight,
} from "lucide-react";
import { useState, useEffect, ReactNode } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { Lens } from "./lens";

type Recipe = {
  id: string;
  title: string;
  icon: ReactNode; // Assuming this is a React component
  goal: string;
  ingredients: string[];
  steps: Array<{
    title: string;
    description: string;
    example?: string;
    examples?: string[];
    subPoints?: string[];
    diagram?: ReactNode;
  }>;
  outcome: string;
  troubleshooting?: Array<{
    problem: string;
    solution: string;
  }>;
  exampleFlow?: string;
  exampleFlowDiagram?: ReactNode;
};

// Replace the entire MavenCookbook function with this updated version
export function Cookbook() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-background">
      <div className="container mx-auto px-0 md:px-16">
        <div className="flex flex-col md:flex-row">
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 px-4 py-8 md:py-12">
            <Introduction />
            <CoreConcepts />
            <RecipesTabs />
            <TipsAndTricks />
            <Conclusion />
          </main>
        </div>
      </div>
    </div>
  );
}

// Add this new Sidebar component after the MavenCookbook function
function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}) {
  const [activeSection, setActiveSection] = useState("introduction");
  const [activeSubSection, setActiveSubSection] = useState("");

  // Setup intersection observer to detect which section is in view
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.3,
    };

    const observerCallback = (entries: any[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id.includes("-sub-")) {
            setActiveSubSection(id);
          } else {
            setActiveSection(id);
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    // Observe all sections
    document.querySelectorAll("section[id]").forEach((section) => {
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  type ContentItems = {
    id: string;
    title: string;
    subItems?: {
      id: string;
      title: string;
      subItems?: {
        id: string;
        title: string;
      }[];
    }[];
  };

  const navItems: ContentItems[] = [
    {
      id: "introduction",
      title: "Introduction",
    },
    {
      id: "core-concepts",
      title: "Core Concepts",
      subItems: [
        { id: "core-concepts-sub-orchestrator", title: "The Orchestrator" },
        { id: "core-concepts-sub-agent-tools", title: "Agent Tools" },
        { id: "core-concepts-sub-ai-insights", title: "AI-Powered Insights" },
        { id: "core-concepts-sub-streamed-results", title: "Streamed Results" },
      ],
    },
    {
      id: "recipes",
      title: "Recipes",
      subItems: [
        {
          id: "recipes-sub-basic",
          title: "Basic",
          subItems: [
            { id: "recipe1", title: "Getting Personalized Recommendations" },
            { id: "recipe2", title: "Finding a Specific Product" },
            { id: "recipe4", title: "Getting Detailed Product Information" },
          ],
        },
        {
          id: "recipes-sub-advanced",
          title: "Advanced",
          subItems: [
            { id: "recipe3", title: "Comparing Two Products" },
            { id: "recipe5", title: "Interacting with Maven's Inquiries" },
          ],
        },
        {
          id: "recipes-sub-expert",
          title: "Expert",
          subItems: [
            { id: "recipe6", title: "Leveraging Related Queries" },
            { id: "recipe7", title: "Combining Multiple Tools" },
          ],
        },
      ],
    },
    {
      id: "tips-and-tricks",
      title: "Tips and Tricks",
    },
    {
      id: "conclusion",
      title: "Conclusion",
    },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        className="fixed bottom-4 right-4 md:hidden z-50 bg-primary text-primary-foreground p-3 rounded-full shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-x"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-menu"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 md:top-24 h-screen md:h-[calc(100vh-6rem)] 
          w-[280px] overflow-y-auto z-50 md:z-0
          bg-background border-r p-6
          transition-transform duration-300 ease-in-out
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        <div className="text-xl font-bold mb-6 text-purple-500">
          Maven Cookbook
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <div key={item.id} className="mb-2">
              <button
                onClick={() => scrollToSection(item.id)}
                className={`
                  w-full text-left px-2 py-1.5 rounded-md text-sm font-medium
                  transition-colors hover:bg-muted
                  ${
                    activeSection === item.id
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground"
                  }
                `}
              >
                {item.title}
              </button>

              {item.subItems && activeSection === item.id && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-muted pl-2">
                  {item.subItems.map((subItem) => (
                    <div key={subItem.id}>
                      <button
                        onClick={() => scrollToSection(subItem.id)}
                        className={`
                          w-full text-left px-2 py-1.5 rounded-md text-sm
                          transition-colors hover:bg-muted
                          ${
                            activeSubSection === subItem.id ||
                            activeSection === subItem.id
                              ? "text-primary font-medium"
                              : "text-muted-foreground"
                          }
                        `}
                      >
                        {subItem.title}
                      </button>

                      {subItem.subItems &&
                        (activeSubSection === subItem.id ||
                          activeSection === subItem.id) && (
                          <div className="ml-3 mt-1 space-y-1 border-l border-muted pl-2">
                            {subItem.subItems.map((nestedItem) => (
                              <button
                                key={nestedItem.id}
                                onClick={() => scrollToSection(nestedItem.id)}
                                className={`
                                w-full text-left px-2 py-1 rounded-md text-xs
                                transition-colors hover:bg-muted
                                ${
                                  activeSection === nestedItem.id
                                    ? "text-primary font-medium"
                                    : "text-muted-foreground"
                                }
                              `}
                              >
                                {nestedItem.title}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

// Update the Introduction function to add an ID
function Introduction() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };
  return (
    <motion.section
      id="introduction"
      className="my-20 md:my-32 md:px-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto">
        <motion.h1
          className="text-4xl max-w-4xl md:text-5xl font-bold mb-6"
          variants={fadeInUp}
        >
          Mastering <span className="text-purple-500">Product Research</span>{" "}
          with AI
        </motion.h1>
        <motion.p
          className="text-md md:text-lg text-muted-foreground mb-8 max-w-4xl"
          variants={fadeInUp}
        >
          Welcome to the Maven Cookbook! This guide provides you with the best
          practices and strategies to get the most out of Maven, your AI-powered
          product assistant. Whether you&apos;re searching for a specific item,
          comparing options, or seeking recommendations, these
          &quot;recipes&quot; will help you achieve optimal results. Learn how
          to craft effective queries, leverage Maven&apos;s tools, and interpret
          the insights provided.
        </motion.p>
      </div>
    </motion.section>
  );
}

// Update the CoreConcepts function to add IDs
function CoreConcepts() {
  const concepts = [
    {
      id: "core-concepts-sub-orchestrator",
      title: "The Orchestrator",
      icon: <Workflow className="h-6 w-6" />,
      description:
        "Maven's orchestrator is the central intelligence that drives the entire process. It's responsible for understanding your input, selecting the appropriate tools, and managing the flow of information. Think of it as a highly skilled research assistant that knows exactly how to find and process the information you need. The orchestrator uses advanced natural language processing (NLP) to interpret your requests, even if they are complex or ambiguous.",
    },
    {
      id: "core-concepts-sub-agent-tools",
      title: "Agent Tools",
      icon: <Tool className="h-6 w-6" />,
      description:
        "Maven utilizes specialized tools to gather and process information, each designed for specific tasks.",
      subItems: [
        {
          title: "Recommendator",
          description:
            "Provides personalized product recommendations based on your needs and preferences.",
        },
        {
          title: "Search Product",
          description:
            "Quickly finds specific products based on their names (full or partial).",
        },
        {
          title: "Get Product Details",
          description:
            "Gathers comprehensive information about a specific product.",
        },
        {
          title: "Products Comparison",
          description:
            "Allows you to directly compare two products side-by-side.",
        },
        {
          title: "Inquire User",
          description:
            "Asks clarifying questions to ensure Maven fully understands your needs.",
        },
      ],
    },
    {
      id: "core-concepts-sub-ai-insights",
      title: "AI-Powered Insights",
      icon: <Lightbulb className="h-6 w-6" />,
      description:
        "Maven goes beyond simply presenting data; it provides AI-powered insights to help you understand the why behind the results. These insights are generated using natural language generation and explain the reasoning behind recommendations, highlight key features of products, and summarize comparisons. They are designed to be concise, informative, and easy to understand.",
    },
    {
      id: "core-concepts-sub-streamed-results",
      title: "Streamed Results",
      icon: <Zap className="h-6 w-6" />,
      description:
        "Maven delivers results progressively as they become available, thanks to its streamed result architecture. This means you see information appear on the screen in real-time, rather than waiting for a long processing period. This provides a more interactive and responsive experience, allowing you to start evaluating results immediately.",
    },
  ];

  return (
    <section id="core-concepts" className="my-16 md:my-24">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
          Understanding Maven&apos;s Core Concepts
        </h2>
        <div className="flex justify-center">
          <div className="w-16 h-1 bg-primary rounded-full" />
        </div>
      </motion.div>

      <div className="space-y-10">
        {concepts.map((concept, index) => (
          <motion.div
            key={index}
            id={concept.id}
            className="rounded-3xl shadow-sm border p-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl text-purple-500">
                {concept.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 text-purple-500">
                  {concept.title}
                </h3>
                <p className="text-sm md:text-md text-muted-foreground mb-4">
                  {concept.description}
                </p>

                {concept.subItems && (
                  <div className="space-y-4 mt-6">
                    {concept.subItems.map((subItem, subIndex) => (
                      <motion.div
                        key={subIndex}
                        className="border rounded-b-2xl rounded-tr-2xl p-4"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.4,
                          delay: 0.2 + subIndex * 0.1,
                        }}
                      >
                        <h4 className="font-medium text-primary mb-1">{`${subItem.title}`}</h4>
                        <p className="text-sm text-muted-foreground">
                          {subItem.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// Update the RecipesTabs function to add IDs
function RecipesTabs() {
  // First, let's categorize our recipes
  const recipeCategories = [
    {
      id: "recipes-sub-basic",
      name: "Basic",
      recipes: ["recipe1", "recipe2", "recipe4"], // Getting Recommendations, Finding Products, Product Details
    },
    {
      id: "recipes-sub-advanced",
      name: "Advanced",
      recipes: ["recipe3", "recipe5"], // Comparing Products, Inquiries
    },
    {
      id: "recipes-sub-expert",
      name: "Expert",
      recipes: ["recipe6", "recipe7"], // Related Queries, Combining Tools
    },
  ];

  const recipes: Recipe[] = [
    {
      id: "recipe1",
      title: "Personalized Recommendations",
      icon: <Compass className="h-5 w-5 shrink-0" />,
      goal: "Learn how to use Maven to discover products tailored to your specific needs and preferences.",
      ingredients: [
        'A general idea of what you\'re looking for (e.g., "headphones," "gaming laptop").',
        '(Optional) Specific requirements or preferences (e.g., "noise-canceling," "under $1000," "lightweight," "good battery life").',
      ],
      steps: [
        {
          title: "Start with a broad query",
          description:
            "Begin by entering a general description of the product you're interested in.",
          example: 'User Input: "I need new headphones."',
        },
        {
          title: "Provide context (essential for best results)",
          description:
            "Add as much detail as possible about your needs, preferences, and intended use. The more context you provide, the better Maven can understand your intent and generate relevant recommendations.",
          subPoints: [
            "Use Case: Where and how will you use the product?",
            "Budget: What's your price range?",
            "Key Features: Are there any specific features that are important to you?",
            "Brand Preferences: Do you have any preferred brands?",
            "Style Preferences: Do you have any preferences regarding style or design?",
          ],
          examples: [
            'User Input: "I need new headphones for working from home. Noise-canceling is essential, and my budget is around $300. I prefer over-ear headphones."',
            'User Input: "Looking for a gaming laptop under $1500. It needs to have a good graphics card and at least 16GB of RAM."',
          ],
        },
        {
          title: "Review the recommendations",
          description:
            "Maven's Recommendator tool will analyze your input and generate a list of personalized product suggestions. Pay attention to the order of the recommendations; they are typically ranked by relevance.",
        },
        {
          title: "Explore the insights",
          description:
            "Carefully read the AI-powered insights provided with each recommendation. These insights explain why a particular product was suggested, highlighting its key features and how they align with your needs. This is crucial for understanding the recommendations and making an informed decision.",
        },
        {
          title: "Refine your query (iterative process)",
          description:
            "If the initial recommendations aren't quite right, don't hesitate to refine your query.",
          subPoints: [
            "Add more details: Provide additional context or specifications.",
            "Adjust your criteria: Change your budget, feature requirements, or brand preferences.",
            "Use different keywords: Try using synonyms or alternative phrasing.",
            "Correct Misunderstandings: If Maven seems to have misinterpreted your intent, clarify your request.",
          ],
        },
        {
          title: "Utilize related queries",
          description:
            "If the related query feature is enabled, explore the suggested related searches to discover alternative products or refine your search further.",
        },
        {
          title: "Attach Product",
          description:
            "If you have a product in mind, you can attach it to get a recommendation based on it.",
        },
      ],
      outcome:
        "You'll receive a list of product recommendations that are highly relevant to your input, along with detailed explanations to help you understand the suggestions and make an informed choice.",
      troubleshooting: [
        {
          problem: "I'm not getting any recommendations.",
          solution:
            "Make sure you've entered a valid query. Try starting with a broader query and then adding more details. Ensure your query is not too niche or specific.",
        },
        {
          problem: "The recommendations are irrelevant.",
          solution:
            "Double-check that you've provided enough context. Refine your query with more specific details about your needs and preferences.",
        },
        {
          problem: "I'm seeing too many recommendations.",
          solution:
            "Narrow down your search by adding more constraints, such as a stricter budget or more specific feature requirements.",
        },
      ],
    },
    {
      id: "recipe2",
      title: "Finding a Specific Product",
      icon: <Search className="h-5 w-5 shrink-0" />,
      goal: "Learn how to use Maven to quickly locate a particular product, even with incomplete information.",
      ingredients: [
        "The full or partial name of the product.",
        "(Optional) Any additional details you know about the product (brand, model number, etc.).",
      ],
      steps: [
        {
          title: "Enter the product name",
          description:
            "Type the full or partial product name into Maven's input field. Accuracy is key here.",
          examples: [
            'User Input: "Sony WH-1000XM5" (Full Name - Ideal)',
            'User Input: "WH-1000XM" (Partial Name - Less Precise)',
            'User Input: "Sony noise canceling headphones" (Descriptive - Less Precise, relies more on interpretation)',
          ],
        },
        {
          title: "Add details (if using a partial name)",
          description:
            "If you're using a partial name or a description, provide as much additional information as possible to help Maven narrow down the search.",
          examples: [
            'User Input: "WH-1000XM black over-ear"',
            'User Input: "Sony noise canceling headphones around $300"',
          ],
        },
        {
          title: "Review the search results",
          description:
            "Maven's Search Product tool will use the provided information to find matching products. The results will be displayed, often with images and brief descriptions.",
        },
        {
          title: "Examine the insights",
          description:
            "Maven will provide concise summaries and highlight key details about the products found. This helps you quickly identify the correct product.",
        },
        {
          title: "Use the product link",
          description:
            "Once you've identified the desired product, click on the provided link to view more information on the retailer's website.",
        },
        {
          title: "Attach Product",
          description:
            "If you have a product in mind, you can attach it to get a recommendation and refinement based on it.",
        },
      ],
      outcome:
        "You'll quickly find the specific product you're looking for (or a very short list of highly relevant candidates), along with summaries and links to more details.",
      troubleshooting: [
        {
          problem: "I can't find the product I'm looking for.",
          solution:
            "Check spelling, try variations, add more details, or broaden your search if being too specific.",
        },
        {
          problem: "I'm getting too many results.",
          solution:
            "Add more specific details to your query to narrow down the search.",
        },
      ],
    },
    {
      id: "recipe3",
      title: "Comparing Two Products",
      icon: <SplitSquareVertical className="h-5 w-5 shrink-0" />,
      goal: "Learn how to use Maven to directly compare two products, analyze their differences, and make a well-informed decision.",
      ingredients: [
        "Two products you want to compare (you should have more than one product details/insight on current conversation).",
      ],
      steps: [
        {
          title: "Find and Detail the Products",
          description:
            "Use Maven's Search Product and Get Product Details tools to find the two products you want to compare. Crucially, you must use Get Product Details on each product before you can compare them (to get detailed product data). This ensures Maven has the necessary data.",
        },
        {
          title: "Attach Comparison",
          description:
            "After using Get Product Details, each product will have a Compare UI button with it. You'll need to attach the compared product for the comparison. The Compare button is typically displayed in the UI after you've retrieved the product details.",
        },
        {
          title: "Initiate the Comparison",
          description:
            "Use the product comparison feature, attaching the data values of the two products. You can also make custom request with text inputs along with comparison (optional).",
        },
        {
          title: "Review the Comparison Result",
          description:
            "Maven's Product Comparison tool will generate a UI that presents the key features and specifications of the two products side-by-side. This UI will highlight both product specifications, key differences, and similarities, making it easy to evaluate the options.",
        },
        {
          title: "Analyze the Insights",
          description:
            "Read the AI-powered insights provided below the comparison UI. Ths response is depends on text inputs (if provided), otherwise the insights will summarize the key differences, point out the strengths and weaknesses of each product, and potentially offer a recommendation based on your (previously stated) needs.",
        },
        {
          title: "Consider Your Priorities",
          description:
            "Based on the comparison UI and the insights, consider which product best aligns with your priorities and requirements, or you can refine it on next conversation.",
        },
      ],
      outcome:
        "You'll receive a clear, structured comparison of the two products, highlighting their key differences and similarities, along with AI-powered insights to guide your decision-making process.",
      troubleshooting: [
        {
          problem: "I can't initiate the comparison.",
          solution:
            "Make sure you have used Get Product Details on both targeted products before attempting the comparison. Ensure you have to attach comparison for each product, the mininum to perform comparison are two products at once.",
        },
        {
          problem: "The comparison is missing information.",
          solution:
            "The comparison is based on the data retrieved by Get Product Details. If some information is missing, it might be because it wasn't available on the product pages that were scraped.",
        },
        {
          problem: "The insights are not helpful.",
          solution:
            "The insights are generated based on the available data and your (potentially) previously stated needs. If the insights are not relevant, it might be because your initial queries or interactions with Maven didn't provide enough context.",
        },
      ],
    },
    {
      id: "recipe4",
      title: "Detailed Product Information",
      icon: <FileText className="h-5 w-5 shrink-0" />,
      goal: "Learn how to use Maven to access comprehensive information about a specific product, including specifications, features, reviews, and more.",
      ingredients: ["The product name or a link to the product page."],
      steps: [
        {
          title: "Attach product via <Ask AI> shortcut button",
          description:
            "Access selected product via Ask AI button to get product details plus insight along with text inputs (optional).",
          examples: [
            'User Input: "Attach product via Ask AI Button + wihout text inputs"',
            'User Input: "Attach product via Ask AI Button + with text inputs"',
          ],
        },
        {
          title: "Review the Product Details",
          description:
            "Maven's Get Product Details tool will automatically gather information from various sources including web scraping and external APIs.",
        },
        {
          title: "Explore the Different Sections",
          description:
            "The product details will typically be organized into different sections, such as overview, specifications, features, reviews, and pricing.",
        },
        {
          title: "Read the Insights",
          description:
            "Pay close attention to the AI-powered insights provided by Maven. These insights will summarize the key aspects of the product and may highlight its strengths and weaknesses.",
        },
        {
          title: "(Optional) Request an External Search",
          description:
            'If the "external search" option is enabled, Maven can perform a broader search across the web to gather even more information, including news articles, blog posts, and forum discussions.',
        },
      ],
      outcome:
        "You'll receive a comprehensive overview of the product, including detailed specifications, features, reviews, pricing, and AI-powered insights.",
      troubleshooting: [
        {
          problem: "I'm not seeing all the information I expect.",
          solution:
            "The information Maven can retrieve depends on the availability of data online. Some product pages may have limited information, or certain details may not be accessible to web scraping.",
        },
        {
          problem: "The information is outdated.",
          solution:
            "Maven strives to provide up-to-date information, but product details (especially pricing and availability) can change rapidly. Always double-check the information on the retailer's website.",
        },
      ],
    },
    {
      id: "recipe5",
      title: "Interacting with Maven's Inquiries",
      icon: <HelpCircle className="h-5 w-5 shrink-0" />,
      goal: "Learn how to effectively respond to Maven's clarifying questions to ensure you receive the most accurate and personalized results.",
      ingredients: [
        "An initial query or request that is potentially ambiguous or requires further specification.",
      ],
      steps: [
        {
          title: "Start with Your Request",
          description:
            "Begin by asking Maven a question or making a request, just as you normally would.",
        },
        {
          title: "Recognize Inquiry Prompts",
          description:
            "If Maven needs more information to understand your needs, it will present you with a clarifying question using the `inquireUser` tool. These prompts are designed to be clear and easy to understand.",
        },
        {
          title: "Provide Precise Answers",
          description:
            "Respond to the inquiries as accurately and concisely as possible.",
          subPoints: [
            "Use Specific Keywords: Use precise terms related to your needs.",
            "Provide Quantifiable Information: If applicable, provide numerical values (e.g., budget, screen size, storage capacity).",
            "Choose from Options: If Maven presents multiple-choice options, select the ones that best match your preferences.",
            'Use the "Other" or "Input" Field: If none of the provided options are suitable, use the "Other" or "Input" field to provide your own answer.',
            "Don't Be Afraid to Skip: If you're unsure about a question or don't have a preference, you can often skip it.",
          ],
        },
        {
          title: "Continue the Conversation",
          description:
            "After you respond to an inquiry, Maven will process your answer and may provide results, ask further questions, or continue with the original workflow.",
        },
        {
          title: "Example",
          description:
            'User: "Find me a good laptop."\nMaven (inquireUser): `What will you primarily use the laptop for?`\n* `Work/Productivity`\n* `Gaming`\n* `Creative Tasks (Video Editing, Graphic Design)`\n* `General Use`\n* `Other (Please Specify)`\nUser: Selects `Work/Productivity`\nMaven: (Continues with the workflow, potentially asking more questions or providing results)',
          diagram: (
            <Image
              src={"/inquire-workflow.png"}
              alt="workflow diagram"
              width={500}
              height={500}
            />
          ),
        },
      ],
      outcome:
        "By actively participating in the inquiry process, you guide Maven towards a deeper understanding of your needs, resulting in more accurate, relevant, and personalized results.",
      troubleshooting: [
        {
          problem: "I don't understand the question.",
          solution:
            "The inquiries are designed to be clear, but if you're unsure, try rephrasing your original request or providing more context.",
        },
        {
          problem: "I don't see an option that fits my needs.",
          solution:
            'Use the "Other" or "Input" field to provide your own answer.',
        },
      ],
    },
    {
      id: "recipe6",
      title: "Leveraging Related Queries",
      icon: <Layers className="h-5 w-5 shrink-0" />,
      goal: "Learn how to use Maven's related query suggestions to explore alternative products and refine your search.",
      ingredients: ["An initial query or request."],
      steps: [
        {
          title: "Make a Request",
          description: "Start by asking Maven a question or making a request.",
        },
        {
          title: "Look for Related Queries",
          description:
            'After Maven processes your request, look for a section labeled "Related Queries" or something similar (the exact UI element will depend on the design).',
        },
        {
          title: "Explore the Suggestions",
          description:
            "Maven will generate a list of related search queries based on your original input and the current conversation context. These queries might suggest alternative products, offer more specific search terms, or explore different aspects of your request.",
        },
        {
          title: "Click on a Related Query",
          description:
            "Clicking on a related query will automatically initiate a new search using that query, allowing you to quickly explore different options.",
        },
      ],
      outcome:
        "You'll discover alternative products, refine your search criteria, and potentially find exactly what you're looking for, even if your initial request wasn't perfectly precise.",
    },
    {
      id: "recipe7",
      title: "Combining Multiple Tools",
      icon: <Workflow className="h-5 w-5 shrink-0" />,
      goal: "Learn how to combine multiple Maven tools for complex research tasks.",
      ingredients: [
        "A more complex research need that requires multiple steps.",
      ],
      steps: [
        {
          title: "Start with a broad need",
          description:
            "Begin with a general request, for example:\nUser: `I need a new laptop for video editing, and I'd like to compare it to my current one.`",
        },
        {
          title: "Use Recommendator",
          description:
            "Maven might initially use the Recommendator to suggest some video editing laptops.",
        },
        {
          title: "Use Get Product Details",
          description:
            "Select a promising laptop from the recommendations and use Get Product Details to get more information.",
        },
        {
          title: "Use Search Product (if needed)",
          description:
            "If you have a specific laptop in mind (your current one, in this example), use `searchProduct` to find it.",
        },
        {
          title: "Use Get Product Details (again)",
          description:
            "Get the details of your current laptop using Get Product Details.",
        },
        {
          title: "Use Products Comparison",
          description:
            "Now that you have details for both laptops (using their `callId` values), use Products Comparison to compare them directly.",
        },
        {
          title: "Use Inquire User (throughout)",
          description:
            "Maven might use Inquire User at various points to clarify your needs (e.g., your budget, preferred screen size).",
        },
      ],
      outcome:
        "You can perform a complex, multi-step research task by combining different Maven tools, leveraging the strengths of each.",
      exampleFlow:
        "User requests recommendations for video editing laptops. → Maven uses Recommendator. → User selects a recommended laptop. → Maven uses Get Product Details. → User requests to compare with their current laptop. → User provides details of their current laptop (or uses Search Product). → Maven uses Get Product Details on the current laptop. → Maven uses Products Comparison. → Maven uses Inquire User as needed throughout the process.",
      exampleFlowDiagram: (
        <Image
          src={"/combine-tool-workflow.svg"}
          alt="Example Flow Diagram"
          height={500}
          width={500}
          quality={100}
        />
      ),
    },
  ];

  // State to track the active category
  const [activeCategory, setActiveCategory] = useState(recipeCategories[0].id);

  // Find the active category object
  const currentCategory =
    recipeCategories.find((cat) => cat.id === activeCategory) ||
    recipeCategories[0];

  // Get the first recipe ID from the active category to use as default tab
  const defaultRecipeId = currentCategory.recipes[0];

  return (
    <section id="recipes" className="my-16 md:my-24">
      <motion.div
        className="px-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
          Recipes
        </h2>
        <div className="flex justify-start">
          <div className="w-16 h-1 bg-primary rounded-full" />
        </div>
      </motion.div>

      {/* Category Tabs */}
      <div className="mb-6">
        <div className="flex justify-start mb-2">
          <div className="inline-flex bg-muted rounded-full p-1">
            {recipeCategories.map((category) => (
              <Button
                variant={"ghost"}
                key={category.id}
                id={category.id}
                size={"sm"}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Tabs - Only show tabs for the active category */}
      <Tabs defaultValue={defaultRecipeId} className="w-full">
        <TabsList className="flex flex-wrap mb-8 rounded-3xl w-fit space-x-4 md:space-x-0">
          {recipes
            .filter((recipe) => currentCategory.recipes.includes(recipe.id))
            .map((recipe) => (
              <TabsTrigger
                key={recipe.id}
                value={recipe.id}
                className="flex px-5 md:px-2 items-center gap-2 rounded-2xl font-normal"
              >
                {recipe.icon}
                <span className="hidden md:inline">
                  {recipe.title.split(":")[0]}
                </span>
              </TabsTrigger>
            ))}
        </TabsList>

        {recipes.map((recipe) => (
          <TabsContent key={recipe.id} value={recipe.id}>
            <motion.div
              id={recipe.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-background rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-purple-500 flex items-center gap-2 text-xl md:text-2xl">
                    {recipe.icon}
                    {recipe.title}
                  </CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    {recipe.goal}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium text-lg mb-2 text-primary">
                      Ingredients
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {recipe.ingredients.map((ingredient, idx) => (
                        <li
                          key={idx}
                          className="text-sm md:text-md text-muted-foreground"
                        >
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-lg mb-3 text-primary">
                      Steps
                    </h4>
                    <div className="space-y-4">
                      {recipe.steps.map((step, idx) => (
                        <motion.div
                          key={idx}
                          className="border-l-2 border-primary/30 pl-4 py-1"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: idx * 0.1 }}
                        >
                          <h5 className="font-medium text-base">
                            {idx + 1}. {step.title}
                          </h5>
                          <p className="text-sm md:text-md text-muted-foreground mt-1">
                            {step.description}
                          </p>

                          {step.diagram && (
                            <div className="bg-white mt-3 flex items-center justify-center rounded-3xl">
                              {step.diagram}
                            </div>
                          )}

                          {step.subPoints && (
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                              {step.subPoints.map((point, pointIdx) => (
                                <li
                                  key={pointIdx}
                                  className="text-sm text-muted-foreground"
                                >
                                  {point}
                                </li>
                              ))}
                            </ul>
                          )}

                          {step.examples && (
                            <div className="mt-2 space-y-2">
                              {step.examples.map((example, exampleIdx) => (
                                <div
                                  key={exampleIdx}
                                  className="bg-muted p-2 rounded text-sm font-mono w-fit"
                                >
                                  {example}
                                </div>
                              ))}
                            </div>
                          )}

                          {step.example && (
                            <div className="bg-muted p-2 rounded text-sm font-mono mt-2 w-fit">
                              {step.example}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-lg mb-2 text-primary">
                      Expected Outcome
                    </h4>
                    <p className="text-muted-foreground text-sm md:text-md">
                      {recipe.outcome}
                    </p>

                    {recipe.exampleFlow && (
                      <div className="bg-muted p-3 rounded-md mt-2 text-sm">
                        <h5 className="font-medium mb-1">Example Flow:</h5>
                        <p>{recipe.exampleFlow}</p>
                      </div>
                    )}

                    {recipe.exampleFlowDiagram && (
                      <div className="bg-white rounded-3xl mt-3 flex justify-center">
                        <Lens zoomFactor={2} lensSize={270}>
                          {recipe.exampleFlowDiagram}
                        </Lens>
                      </div>
                    )}
                  </div>

                  {recipe.troubleshooting &&
                    recipe.troubleshooting.length > 0 && (
                      <div>
                        <h4 className="font-medium text-lg mb-2 text-primary">
                          Troubleshooting
                        </h4>
                        <div className="space-y-3">
                          {recipe.troubleshooting.map((item, idx) => (
                            <motion.div
                              key={idx}
                              className="bg-muted/50 p-3 rounded-2xl"
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 0.4,
                                delay: 0.2 + idx * 0.1,
                              }}
                            >
                              <h5 className="font-medium text-sm">
                                {item.problem}
                              </h5>
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.solution}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}

// Update the TipsAndTricks function to add an ID
function TipsAndTricks() {
  const tips = [
    "Be Specific: The more specific your queries and requests, the better Maven can understand your needs and provide relevant results. Use precise language and avoid ambiguity.",
    "Provide Comprehensive Context: Include all relevant details, such as your budget, intended use, desired features, brand preferences, and any other constraints.",
    "Use Full Product Names (When Possible): When searching for a specific product, use the full and accurate product name for the best results.",
    "Leverage AI-Powered Insights: Always read the insights provided by Maven. They explain the reasoning behind recommendations, highlight key features, and summarize comparisons, helping you make informed decisions.",
    "Iterate and Refine: Don't be afraid to refine your queries or requests based on the initial results. Product research is often an iterative process.",
    "Master the Inquiry System: Actively participate in Maven's inquiries by providing clear and concise answers. This is crucial for personalization.",
    "Explore Related Queries: Use the related queries feature to discover alternative products and broaden your search.",
    "Combine Tools Strategically: For complex research tasks, learn how to combine multiple Maven tools to achieve your goals.",
    "Understand Limitations: While Maven is powerful, it relies on available online data. Information may be incomplete, outdated, or unavailable for certain products.",
    "Double-Check Information: Always verify critical information (especially pricing and availability) on the retailer's website before making a purchase.",
    "Provide Feedback (If Possible): If your application has a feedback mechanism, use it to report any issues or suggest improvements. This helps the developers improve Maven over time.",
    "Start Broad, Then Narrow: If you're unsure where to begin, start with a broad query and gradually add more details to narrow down the results.",
    "Use Natural Language: Maven is designed to understand natural language, so you don't need to use special keywords or commands. Just ask your questions as you would to a human research assistant.",
    "Experiment: The best way to learn how to use Maven effectively is to experiment with different queries, requests, and tools.",
  ];

  return (
    <section id="tips-and-tricks" className="my-16 md:my-24">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
          General Tips and Tricks
        </h2>
        <div className="flex justify-center">
          <div className="w-16 h-1 bg-primary rounded-full" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tips.map((tip, index) => (
          <motion.div
            key={index}
            className="rounded-3xl p-4 border shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center text-primary">
                  <ArrowUpRight className="h-4 w-4 text-purple-500" />
                </div>
              </div>
              <p className="text-sm md:text-md text-muted-foreground">{tip}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// Update the Conclusion function to add an ID
function Conclusion() {
  return (
    <motion.section
      id="conclusion"
      className="my-16 md:my-24"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="bg-primary/5 rounded-3xl p-8 text-center max-w-3xl mx-auto">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
          Become a Maven Master!
        </h2>
        <p className="text-sm md:text-md text-muted-foreground">
          By following the guide and best practices outlined in this cookbook,
          you can unlock the full potential of Maven and transform your product
          research experience. Remember to be specific, provide context,
          leverage the insights, and iterate on your queries. With practice,
          you&apos;ll become a Maven master, making informed decisions with
          confidence and ease. Start exploring today!
        </p>
      </div>
    </motion.section>
  );
}
