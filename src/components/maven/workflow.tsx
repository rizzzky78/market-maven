"use client";
import {
  MessageSquare,
  Paperclip,
  GitCompare,
  MessageCircleQuestion,
  Workflow,
  PenToolIcon as Tool,
  Layout,
  AlertTriangle,
  CheckCircle2,
  MessageSquareMore,
  RefreshCcwDot,
  AlertCircle,
  AppWindow,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AnimatedSection } from "@/components/maven/animated-section";
import { CodeBlock } from "@/components/maven/code-block";
import Image from "next/image";
import { TracingBeam } from "./tracing-beam";
import { useState } from "react";
import { Badge } from "../ui/badge";

export function WorkflowContent() {
  const [activeTab, setActiveTab] = useState("all");

  const errorList = [
    {
      type: "Scraping",
      description: "handleScrapingWithCache handles web scraping errors.",
      category: "external",
    },
    {
      type: "API",
      description: "Errors from external API calls are caught.",
      category: "external",
    },
    {
      type: "LLM Generation",
      description: "Errors during text/object generation are caught.",
      category: "processing",
    },
    {
      type: "Database",
      description: "Errors accessing the database are handled.",
      category: "data",
    },
    {
      type: "Input Validation",
      description:
        "inputInquirySchema and validation functions handle invalid input.",
      category: "user",
    },
  ];

  const filteredErrors =
    activeTab === "all"
      ? errorList
      : errorList.filter((error) => error.category === activeTab);

  const codebase = {
    payloadData: `export type PayloadData = {
  textInput?: string;
  attachProduct?: AttachProduct;
  productCompare?: ProductCompare;
  inquiryResponse?: InquiryResponse;
};`,
    availableTool: `export const AvailableTools = {
  SEARCH_PRODUCT: "searchProduct",
  GET_PRODUCT_DETAILS: "getProductDetails",
  PRODUCTS_COMPARISON: "productsComparison",
  INQUIRE_USER: "inquireUser",
  RECOMMENDATOR: "recommendator",
} as const;`,
    mutationPayload: `export type MutationPayload<ARGS, DATA> = {
  name: AvailableTool;
  args: ARGS;
  result: DATA;
  overrideAssistant?: {
    content: string;
  };
};`,
    uiState: `export type UIState = {
  id: string;
  display: ReactNode;
}[];`,
    streamGeneration: `export type StreamGeneration = {
  loading: boolean;
  process:
  "initial"
  | "generating"
  | "api_success"
  | "api_error"
  | "database_error"
  | "fatal_error"
  | "done"
  | ({} & string);
  error?: string;
};`,
  };

  return (
    <div className="flex justify-center px-2">
      <div className="w-full max-w-5xl">
        <div className="space-y-12">
          <AnimatedSection>
            <div className="space-y-4 py-[32vh]">
              <h1 className="text-5xl font-bold tracking-tight">
                <span className="text-purple-500">Agentic</span> Application
                Workflow
              </h1>
              <h2 className="text-4xl font-bold tracking-tight">
                How Maven Works: An End-to-End Workflow
              </h2>
              <p className="text-xl text-muted-foreground">
                Maven is an AI-powered product assistant designed to streamline
                the process of researching, selecting, and comparing
                <span className="mx-1 text-purple-500">Electronic</span>
                categorized products. This document details the complete yet
                simple operational workflow of Maven, from the initial user
                interaction to the delivery of AI-powered results.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <Card className="bg-white rounded-none">
              <CardHeader>
                <CardTitle className="flex text-2xl text-purple-500 items-center gap-2">
                  <Workflow className="size-7 shrink-0" />
                  Complete Workflow Overview
                </CardTitle>
                <CardDescription className="text-black/80">
                  A high-level view of Maven&apos;s end-to-end workflow process
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="">
                  <Image
                    src={"/app-workflow-simplyfied.png"}
                    width={800}
                    height={1000}
                    className="object-fill"
                    alt="Application Workflow"
                  />
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
          {/* Workflow Process Section */}
          <div className="px-2">
            <TracingBeam className="pl-6 md:px-0">
              <div className="max-w-5xl mx-auto antialiased pt-4 relative">
                <AnimatedSection>
                  <div>
                    <h2 className="text-4xl font-bold text-purple-500">
                      Workflow
                    </h2>
                  </div>
                  <div className="space-y-2">
                    <h2
                      className="text-3xl font-semibold tracking-tight"
                      id="user-input"
                    >
                      1. User Input Initiation
                    </h2>
                    <p className="text-muted-foreground">
                      The workflow begins when a user interacts with Maven,
                      providing input through one of several methods.
                    </p>
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    <Card className="overflow-hidden rounded-3xl bg-background">
                      <CardHeader className="bg-muted/50 rounded-2xl m-2">
                        <CardTitle className="flex items-center gap-2 text-black/90 dark:text-white/90">
                          <MessageSquareMore className="size-6" />
                          Text Input
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <p>
                          The user enters a text-based query or request (e.g.,
                          &ldquo;find me the best noise-canceling
                          headphones&ldquo;).
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden rounded-3xl bg-background">
                      <CardHeader className="bg-muted/50 rounded-2xl m-2">
                        <CardTitle className="flex items-center gap-2 text-black/90 dark:text-white/90">
                          <Paperclip className="size-6" />
                          Product Attachment
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <p>
                          The user attaches a product (represented by its ID,
                          title, and link) to the conversation.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden rounded-3xl bg-background">
                      <CardHeader className="bg-muted/50 rounded-2xl m-2">
                        <CardTitle className="flex items-center gap-2 text-black/90 dark:text-white/90">
                          <GitCompare className="size-6" />
                          Product Comparison
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <p>
                          The user requests a comparison between two products
                          (identified by their call IDs).
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden rounded-3xl bg-background">
                      <CardHeader className="bg-muted/50 rounded-2xl m-2">
                        <CardTitle className="flex items-center gap-2 text-black/90 dark:text-white/90">
                          <MessageCircleQuestion className="size-6" />
                          Inquiry Response
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <p>
                          The user responds to a previous inquiry from Maven,
                          providing additional information.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6">
                    <CodeBlock
                      language="typescript"
                      code={codebase.payloadData}
                      title="PayloadData Type Definition"
                    />
                  </div>
                </AnimatedSection>

                <Separator />

                <AnimatedSection>
                  <div className="space-y-2">
                    <h2
                      className="text-3xl font-semibold tracking-tight"
                      id="orchestrator"
                    >
                      2. Orchestrator Processing
                    </h2>
                    <p className="text-muted-foreground">
                      The PayloadData is passed to the orchestrator function,
                      the central control unit that manages the workflow.
                    </p>
                  </div>

                  <div className="mt-6 space-y-6">
                    <Card className="bg-background rounded-3xl">
                      <CardContent className="pt-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2  text-black/90 dark:text-white/90">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                1
                              </div>
                              <h3 className="font-semibold te">
                                Message Unification
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              The user&lsquo;s input is converted into a
                              standardized{" "}
                              <span className="text-purple-500 font-mono  ">
                                UserContentMessage
                              </span>{" "}
                              and then into a{" "}
                              <span className="text-purple-500 font-mono  ">
                                MessageProperty
                              </span>{" "}
                              object, adding it to the conversation history.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-black/90 dark:text-white/90">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                2
                              </div>
                              <h3 className="font-semibold">
                                Intent Determination
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              The orchestrator analyzes the user&apos;s input to
                              determine their intent (e.g., search for a
                              product, get product details, compare products).
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-black/90 dark:text-white/90">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                3
                              </div>
                              <h3 className="font-semibold">Tool Selection</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Based on the intent, the orchestrator selects the
                              most appropriate agent tool(s) from the available
                              options.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-black/90 dark:text-white/90">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                4
                              </div>
                              <h3 className="font-semibold">
                                State Management
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              The orchestrator interacts with{" "}
                              <span className="text-purple-500 font-mono  ">
                                MutableAIState
                              </span>{" "}
                              to update the conversation history and manage the
                              AI&apos;s state.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <CodeBlock
                      language="typescript"
                      code={codebase.availableTool}
                      title="Available Tools"
                    />
                  </div>
                </AnimatedSection>

                <Separator className="mt-4" />

                <AnimatedSection>
                  <div className="space-y-2">
                    <h2
                      className="text-3xl font-semibold tracking-tight"
                      id="agent-tools"
                    >
                      3. Agentic Tool Execution
                    </h2>
                    <p className="text-muted-foreground">
                      The selected agent tool(s) are executed. Each tool
                      performs a specific task, leveraging AI models and
                      external APIs.
                    </p>
                  </div>

                  <Tabs defaultValue="recommendator" className="mt-6">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 rounded-3xl *:font-normal">
                      <TabsTrigger
                        value="recommendator"
                        className="rounded-2xl"
                      >
                        Recommendator
                      </TabsTrigger>
                      <TabsTrigger
                        value="searchProduct"
                        className="rounded-2xl"
                      >
                        Search Product
                      </TabsTrigger>
                      <TabsTrigger
                        value="getProductDetails"
                        className="rounded-2xl"
                      >
                        Product Details
                      </TabsTrigger>
                      <TabsTrigger
                        value="productsComparison"
                        className="rounded-2xl"
                      >
                        Comparison
                      </TabsTrigger>
                      <TabsTrigger value="inquireUser" className="rounded-2xl">
                        Inquire User
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent
                      value="recommendator"
                      className="mt-4 space-y-4"
                    >
                      <Card className="bg-background rounded-3xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Tool className="h-5 w-5 text-primary" />
                            AI Product Picks (recommendator)
                          </CardTitle>
                          <CardDescription>
                            Provides personalized product recommendations based
                            on user intent and scope
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <h4 className="font-medium">Input</h4>
                                <ul className="list-disc pl-5 text-sm">
                                  <li>User intent</li>
                                  <li>Scope parameters</li>
                                </ul>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium">Output</h4>
                                <ul className="list-disc pl-5 text-sm">
                                  <li>Personalized product recommendations</li>
                                  <li>Explanatory insights</li>
                                  <li>Optional related queries</li>
                                </ul>
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                              <h4 className="font-medium">Process Flow</h4>
                              <ol className="list-decimal pl-5 text-sm space-y-2">
                                <li>Takes the user&apos;s intent and scope</li>
                                <li>
                                  Generates recommendations using{" "}
                                  <span className="text-purple-500 font-mono  ">
                                    streamObject
                                  </span>{" "}
                                  and the{" "}
                                  <span className="text-purple-500 font-mono  ">
                                    recommendationSchema
                                  </span>{" "}
                                </li>
                                <li>
                                  Generates explanatory insights using{" "}
                                  <span className="text-purple-500 font-mono  ">
                                    streamText
                                  </span>{" "}
                                </li>
                                <li>Updates the AI state</li>
                                <li>Optionally generates related queries</li>
                              </ol>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent
                      value="searchProduct"
                      className="mt-4 space-y-4"
                    >
                      <Card className="bg-background rounded-3xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Tool className="h-5 w-5 text-primary" />
                            Find Products Fast (searchProduct)
                          </CardTitle>
                          <CardDescription>
                            Performs targeted product searches based on user
                            queries
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <h4 className="font-medium">Input</h4>
                                <ul className="list-disc pl-5 text-sm">
                                  <li>Precise product query</li>
                                </ul>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium">Output</h4>
                                <ul className="list-disc pl-5 text-sm">
                                  <li>Product search results</li>
                                  <li>Insights about the products</li>
                                  <li>Optional related queries</li>
                                </ul>
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                              <h4 className="font-medium">Process Flow</h4>
                              <ol className="list-decimal pl-5 text-sm space-y-2">
                                <li>Takes a precise product query</li>
                                <li>
                                  Scrapes data using{" "}
                                  <span className="text-purple-500 font-mono  ">
                                    handleScrapingWithCache
                                  </span>{" "}
                                  and scrapeUrl
                                </li>
                                <li>
                                  Extracts product information using{" "}
                                  <span className="text-purple-500 font-mono  ">
                                    streamObject
                                  </span>{" "}
                                  and{" "}
                                  <span className="text-purple-500 font-mono  ">
                                    productsSchema
                                  </span>{" "}
                                </li>
                                <li>Generates insights using streamText</li>
                                <li>Updates the AI state</li>
                                <li>Optionally generates related queries</li>
                              </ol>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent
                      value="getProductDetails"
                      className="mt-4 space-y-4"
                    >
                      <Card className="bg-background rounded-3xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Tool className="h-5 w-5 text-primary" />
                            Deep Product Insights (getProductDetails)
                          </CardTitle>
                          <CardDescription>
                            Retrieves detailed information about a specific
                            product
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <h4 className="font-medium">Input</h4>
                                <ul className="list-disc pl-5 text-sm">
                                  <li>Product query</li>
                                  <li>Product link</li>
                                </ul>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium">Output</h4>
                                <ul className="list-disc pl-5 text-sm">
                                  <li>Detailed product information</li>
                                  <li>Product insights</li>
                                  <li>Optional related queries</li>
                                </ul>
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                              <h4 className="font-medium">Process Flow</h4>
                              <ol className="list-decimal pl-5 text-sm space-y-2">
                                <li>Takes a product query and link</li>
                                <li>Scrapes data from the product page</li>
                                <li>
                                  Optionally performs an external search using{" "}
                                  <span className="text-purple-500 font-mono  ">
                                    externalTavilySearch
                                  </span>{" "}
                                </li>
                                <li>
                                  Extracts details using{" "}
                                  <span className="text-purple-500 font-mono  ">
                                    streamObject
                                  </span>{" "}
                                  (without a schema)
                                </li>
                                <li>
                                  Generates insights using{" "}
                                  <span className="text-purple-500 font-mono  ">
                                    streamText
                                  </span>{" "}
                                </li>
                                <li>Updates the AI state</li>
                                <li>Optionally generates related queries</li>
                              </ol>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent
                      value="productsComparison"
                      className="mt-4 space-y-4"
                    >
                      <Card className="bg-background rounded-3xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Tool className="h-5 w-5 text-primary" />
                            Compare Side-by-Side (productsComparison)
                          </CardTitle>
                          <CardDescription>
                            Compares multiple products to help users make
                            informed decisions
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <h4 className="font-medium">Input</h4>
                                <ul className="list-disc pl-5 text-sm">
                                  <li>List of product call IDs</li>
                                </ul>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium">Output</h4>
                                <ul className="list-disc pl-5 text-sm">
                                  <li>Side-by-side product comparison</li>
                                  <li>Comparative insights</li>
                                  <li>Optional related queries</li>
                                </ul>
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                              <h4 className="font-medium">Process Flow</h4>
                              <ol className="list-decimal pl-5 text-sm space-y-2">
                                <li>Takes a list of product call IDs</li>
                                <li>
                                  Retrieves product data using{" "}
                                  <span className="text-purple-500 font-mono  ">
                                    getObjectEntry
                                  </span>{" "}
                                </li>
                                <li>Handles database errors</li>
                                <li>
                                  Generates a comparison using{" "}
                                  <span className="text-purple-500 font-mono  ">
                                    streamObject
                                  </span>{" "}
                                  (without a schema)
                                </li>
                                <li>
                                  Generates insights using{" "}
                                  <span className="text-purple-500 font-mono  ">
                                    streamText
                                  </span>{" "}
                                </li>
                                <li>Updates the AI state</li>
                                <li>Optionally generates related queries</li>
                              </ol>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="inquireUser" className="mt-4 space-y-4">
                      <Card className="bg-background rounded-3xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Tool className="h-5 w-5 text-primary" />
                            User Inquiry (inquireUser)
                          </CardTitle>
                          <CardDescription>
                            Prompts the user for additional information to
                            refine results
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <h4 className="font-medium">Input</h4>
                                <ul className="list-disc pl-5 text-sm">
                                  <li>Inquiry object</li>
                                </ul>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium">Output</h4>
                                <ul className="list-disc pl-5 text-sm">
                                  <li>User inquiry UI components</li>
                                </ul>
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                              <h4 className="font-medium">Process Flow</h4>
                              <ol className="list-decimal pl-5 text-sm space-y-2">
                                <li>Takes an inquiry object</li>
                                <li>
                                  Parses it using{" "}
                                  <span className="text-purple-500 font-mono  ">
                                    inputInquirySchema
                                  </span>{" "}
                                </li>
                                <li>Handles parsing errors</li>
                                <li>
                                  Generates a user inquiry using{" "}
                                  <span className="text-purple-500 font-mono  ">
                                    streamObject
                                  </span>{" "}
                                  and{" "}
                                  <span className="text-purple-500 font-mono  ">
                                    inquireUserSchema
                                  </span>{" "}
                                </li>
                                <li>Updates the AI state</li>
                                <li>Returns UI components</li>
                              </ol>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </AnimatedSection>

                <AnimatedSection>
                  <div className="space-y-2">
                    <h2
                      className="text-3xl font-bold tracking-tight"
                      id="state-mutation"
                    >
                      4. State Mutation
                    </h2>
                    <p className="text-muted-foreground">
                      After a tool completes,{" "}
                      <span className="text-purple-500 font-mono  ">
                        mutateTool
                      </span>{" "}
                      is called to update the AI state with the results.
                    </p>
                  </div>

                  <div className="mt-6 space-y-6">
                    <Card className="bg-background rounded-3xl">
                      <CardContent className="pt-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-black/90 dark:text-white/90">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                1
                              </div>
                              <h3 className="font-semibold">
                                Validation (Optional)
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Uses validateArgs and{" "}
                              <span className="text-purple-500 font-mono  ">
                                validateResult
                              </span>{" "}
                              from{" "}
                              <span className="text-purple-500 font-mono  ">
                                ToolMutationConfig
                              </span>{" "}
                              to validate input/output.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-black/90 dark:text-white/90">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                2
                              </div>
                              <h3 className="font-semibold">
                                Transformation (Optional)
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Uses{" "}
                              <span className="text-purple-500 font-mono  ">
                                transformResult
                              </span>{" "}
                              to transform output before storing in the AI
                              state.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-black/90 dark:text-white/90">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                3
                              </div>
                              <h3 className="font-semibold">State Update</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Updates{" "}
                              <span className="text-purple-500 font-mono  ">
                                MutableAIState
                              </span>{" "}
                              with tool results and generated messages.
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-black/90 dark:text-white/90">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                4
                              </div>
                              <h3 className="font-semibold">
                                Override Assistant (Optional)
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              If provided, updates the AI state with the given
                              content.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <CodeBlock
                      language="typescript"
                      code={codebase.mutationPayload}
                      title="MutationPayload Type Definition"
                    />
                  </div>
                </AnimatedSection>

                <AnimatedSection>
                  <div className="space-y-2">
                    <h2
                      className="text-3xl font-semibold tracking-tight"
                      id="ui-update"
                    >
                      5. UI Update and Rendering
                    </h2>
                    <p className="text-muted-foreground">
                      The{" "}
                      <span className="text-purple-500 font-mono  ">
                        streamUI
                      </span>{" "}
                      function generates UI components based on the AI&apos;s
                      state.
                    </p>
                  </div>

                  <div className="mt-6 space-y-6">
                    <Card className="bg-background rounded-3xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black/90 dark:text-white/90">
                          <Layout className="h-5 w-5" />
                          UI Component Generation
                        </CardTitle>
                        <CardDescription>
                          The streamUI function generates React components to
                          display results
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                          <div className="rounded-2xl border flex items-center justify-center bg-background text-sm font-normal text-black/90 dark:text-white/90 py-2">
                            <p className="text-sm">AssistantMessage</p>
                          </div>
                          <div className="rounded-2xl border flex items-center justify-center bg-background text-sm font-normal text-black/90 dark:text-white/90 py-2">
                            <p className="text-sm font-medium">ProductSearch</p>
                          </div>
                          <div className="rounded-2xl border flex items-center justify-center bg-background text-sm font-normal text-black/90 dark:text-white/90 py-2">
                            <p className="text-sm">ProductDetails</p>
                          </div>
                          <div className="rounded-2xl border flex items-center justify-center bg-background text-sm font-normal text-black/90 dark:text-white/90 py-2">
                            <p className="text-sm">ProductComparison</p>
                          </div>
                          <div className="rounded-2xl border flex items-center justify-center bg-background text-sm font-normal text-black/90 dark:text-white/90 py-2">
                            <p className="text-sm">RecommendationAction</p>
                          </div>
                          <div className="rounded-2xl border flex items-center justify-center bg-background text-sm font-normal text-black/90 dark:text-white/90 py-2">
                            <p className="text-sm">UserInquiry</p>
                          </div>
                          <div className="rounded-2xl border flex items-center justify-center bg-background text-sm font-normal text-black/90 dark:text-white/90 py-2">
                            <p className="text-sm">RelatedMessage</p>
                          </div>
                          <div className="rounded-2xl border flex items-center justify-center bg-background text-sm font-normal text-black/90 dark:text-white/90 py-2">
                            <p className="text-sm">ErrorMessage</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <CodeBlock
                      language="typescript"
                      code={codebase.uiState}
                      title="UIState Type Definition"
                    />
                  </div>
                </AnimatedSection>

                <AnimatedSection>
                  <div className="space-y-2">
                    <h2
                      className="text-3xl font-semibold tracking-tight"
                      id="error-handling"
                    >
                      6. Error Handling
                    </h2>
                    <p className="text-muted-foreground">
                      Error handling is implemented throughout the workflow to
                      ensure robustness.
                    </p>
                  </div>

                  <div className="mt-6 space-y-6">
                    <div className="grid gap-2 md:grid-cols-1">
                      <div className="w-full space-y-6">
                        <Tabs
                          defaultValue="all"
                          value={activeTab}
                          onValueChange={setActiveTab}
                          className="w-full"
                        >
                          <TabsList className="grid grid-cols-5 md:w-auto w-full rounded-3xl">
                            <TabsTrigger
                              value="all"
                              className="rounded-2xl font-normal"
                            >
                              All
                            </TabsTrigger>
                            <TabsTrigger
                              value="external"
                              className="rounded-2xl font-normal"
                            >
                              External
                            </TabsTrigger>
                            <TabsTrigger
                              value="processing"
                              className="rounded-2xl font-normal"
                            >
                              Processing
                            </TabsTrigger>
                            <TabsTrigger
                              value="data"
                              className="rounded-2xl font-normal"
                            >
                              Data
                            </TabsTrigger>
                            <TabsTrigger
                              value="user"
                              className="rounded-2xl font-normal"
                            >
                              User
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value={activeTab} className="mt-6">
                            <div className="grid gap-3 md:grid-cols-2">
                              {filteredErrors.map((error, index) => (
                                <Card
                                  key={index}
                                  className="border-l-4 border-l-purple-500 bg-background rounded-3xl"
                                >
                                  <CardHeader className="pb-1">
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-md flex items-center gap-2 text-black/90 dark:text-white/90">
                                        <AlertCircle className="size-5" />
                                        {error.type} Errors
                                      </CardTitle>
                                      <Badge
                                        variant="outline"
                                        className="font-mono text-xs rounded-full"
                                      >
                                        {error.category}
                                      </Badge>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-sm text-muted-foreground font-mono">
                                      {error.description}
                                    </p>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>

                      <Card className="bg-background rounded-t-3xl mt-5">
                        <CardHeader className="bg-muted/50 rounded-2xl m-2">
                          <CardTitle className="flex items-center gap-2  text-black/90 dark:text-white/90">
                            <RefreshCcwDot className="h-5 w-5" />
                            Stream Generation Status
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="-mx-4 -mb-8">
                          <CodeBlock
                            language="typescript"
                            code={codebase.streamGeneration}
                            title="StreamGeneration Type"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </AnimatedSection>

                <AnimatedSection>
                  <div className="space-y-2">
                    <h2
                      className="text-3xl font-semibold tracking-tight"
                      id="final-output"
                    >
                      7. Final Output
                    </h2>
                    <p className="text-muted-foreground">
                      The final output is the updated UI, presented to the user.
                      This reflects the AI agent&apos;s processing, including
                      generated text, product information, comparisons,
                      recommendations, or inquiries. The user can then continue
                      the interaction.
                    </p>
                  </div>

                  <div className="mt-6">
                    <Card className="bg-background rounded-3xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black/90 dark:text-white/90">
                          <CheckCircle2 className="h-5 w-5" />
                          Final UI Rendering
                        </CardTitle>
                        <CardDescription>
                          The final step in Maven&apos;s workflow is rendering
                          the UI components to the user
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center justify-center p-6 text-center">
                          <div className="mb-4 rounded-full bg-primary/10 p-3">
                            <AppWindow className="size-10 text-purple-500" />
                          </div>
                          <h3 className="text-xl font-medium text-black/90 dark:text-white/90">
                            Complete Workflow Cycle
                          </h3>
                          <p className="mt-2 text-muted-foreground">
                            The user can now view the results and continue the
                            interaction, starting a new workflow cycle.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </AnimatedSection>
              </div>
            </TracingBeam>
          </div>
          <AnimatedSection>
            <div className="border-none bg-background p-6">
              <h2 className="text-2xl font-bold">Conclusion</h2>
              <p className="mt-2 text-muted-foreground">
                This document provides a simple, technical overview of
                Maven&apos;s workflow. By combining user input, AI-powered
                tools, state management, and dynamic UI generation, Maven
                delivers a powerful product research experience. The modular
                design ensures robustness and maintainability.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
