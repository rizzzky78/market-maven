"use client";

import { Footer } from "@/components/maven/footer";
import { HeroSection } from "@/components/maven/hero-section";
import { NavigationBar } from "@/components/maven/navigation-bar";
import { StickyScroll } from "@/components/maven/sticky-scroll";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Brain,
  Search,
  MessageSquare,
  CheckCircle,
  Clock,
  Lightbulb,
  UserCircle,
  MoveRight,
  Hexagon,
  Laptop,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 font-sans">
      {/* Header */}
      <NavigationBar />

      {/* Hero Section */}
      <HeroSection />

      {/* Workflow Section */}
      <section
        id="workflow"
        className="container min-h-screen mx-auto pt-20 px-4 md:px-6 overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            <span className="mr-1 text-purple-500">How Maven Works:</span> Your
            Journey to Informed Choices
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Maven&apos;s intelligent workflow makes product research simple and
            effective.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {[
            {
              icon: <MessageSquare className="h-10 w-10" />,
              title: "You Ask",
              description: "Start with a question or request about a product.",
            },
            {
              icon: <Brain className="h-10 w-10" />,
              title: "Maven Thinks",
              description:
                "Maven's intelligent orchestrator analyzes your input.",
            },
            {
              icon: <Search className="h-10 w-10" />,
              title: "Smart Actions",
              description:
                "Maven selects the best tools to get you the answers you need.",
            },
            {
              icon: <CheckCircle className="h-10 w-10" />,
              title: "Clear Results",
              description:
                "Get clear, concise, and insightful results, powered by AI.",
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center relative z-10"
            >
              <div className="h-20 w-20 flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-purple-500 mb-2">
                {step.title}
              </h3>
              <p className="text-black/90 dark:text-white/70">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}

      <div className="p-2 my-20 flex items-center justify-center border-y">
        <StickyScroll
          content={[
            {
              title: "AI Product Picks",
              description:
                "Discover the perfect products for you. Maven's intelligent recommender analyzes your needs and preferences, providing personalized suggestions and insightful explanations, guiding you to the best choices quickly and confidently.",
              content: (
                <div className="h-full w-full flex items-center justify-center">
                  <Image
                    src="/rate-img-5.jpg"
                    width={500}
                    height={500}
                    className="h-full w-full object-cover rounded-[2rem]"
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
                    className="h-full w-full object-cover rounded-[2rem]"
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
                    className="h-full w-full object-cover rounded-[2rem]"
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
                    className="h-full w-full object-cover rounded-[2rem]"
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
                    className="h-full w-full object-cover rounded-[2rem]"
                    alt="linear board demo"
                  />
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Benefits Section */}
      <section id="benefits" className="container mx-auto py-20 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            <span className="mr-1 text-purple-500">Why Choose Maven?</span> Make
            Smarter Decisions, Faster.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Maven transforms how you research and choose products.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative h-[400px] w-full rounded-[2rem] overflow-hidden"
          >
            <Image
              src={`/tmp-foot.jpg`}
              alt="Product visualization"
              fill
              className="object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <ul className="space-y-6">
              {[
                {
                  icon: <Clock />,
                  title: "Save Time",
                  description:
                    "Stop wasting hours researching. Maven delivers the information you need in seconds.",
                },
                {
                  icon: <Lightbulb />,
                  title: "Make Informed Choices",
                  description:
                    "Get the full picture with comprehensive data, comparisons, and insights.",
                },
                {
                  icon: <UserCircle />,
                  title: "Personalized Experience",
                  description:
                    "Maven adapts to your needs and provides tailored recommendations.",
                },
                {
                  icon: <Brain />,
                  title: "AI-Powered Accuracy",
                  description:
                    "Leverage the power of AI for reliable and up-to-date information.",
                },
              ].map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center text-purple-400">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="container mx-auto py-20 px-4 md:px-6 bg-muted/50 rounded-[2rem]"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            What Users Are Saying
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover how Maven is transforming product research for users
            worldwide.
            <br />
            <span className="text-purple-400">
              Note: This section are still under construction
            </span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote:
                "Maven saved me hours of research time when I was looking for a new laptop. The comparison feature is incredible!",
              author: "Alex Johnson",
              role: "Tech Enthusiast",
            },
            {
              quote:
                "As someone who struggles with decision paralysis, Maven has been a game-changer. It helps me focus on what matters.",
              author: "Sarah Chen",
              role: "Product Manager",
            },
            {
              quote:
                "The personalized recommendations are spot on. Maven understood exactly what I was looking for in a camera.",
              author: "Michael Rodriguez",
              role: "Photographer",
            },
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full rounded-3xl border-border/50 bg-background/80 backdrop-blur-sm">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="mb-4 text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className="inline-block text-purple-400 mr-1"
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-lg mb-6 flex-grow text-black/90 dark:text-white/90">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCircle className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-black/80 dark:text-white/80">
                        {testimonial.author}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto py-20 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-[2rem] bg-gradient-to-r from-white/30 via-purple-500/40 to-white/30 p-8 md:p-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Ready to Transform Your Product Research?
          </h2>
          <p className="text-xl text-black/90 dark:text-white/90 max-w-2xl mx-auto mb-8">
            Join thousands of users who are making smarter product decisions
            with Maven.
          </p>
          <motion.div>
            <Button
              size="lg"
              className="font-medium text-lg px-8 rounded-full hover:bg-purple-500 hover:text-white/90"
            >
              Get Started <MoveRight className="ml-1 size-6 shrink-0" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
