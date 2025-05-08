"use client";

import { AgenticShowcase } from "@/components/maven/agentic-showcase";
import { Footer } from "@/components/maven/footer";
import { HeroSection } from "@/components/maven/hero-section";
import { NavigationBar } from "@/components/maven/navigation-bar";
import { SnapshotCard } from "@/components/maven/snapshots-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { motion } from "framer-motion";
import ReactLenis from "lenis/react";
import {
  Brain,
  Search,
  MessageSquare,
  CheckCircle,
  Clock,
  Lightbulb,
  UserCircle,
} from "lucide-react";
import Image from "next/image";

export function LandingPage() {
  return (
    <ReactLenis root>
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
            <h2 className="font-[family-name:var(--font-array)] text-3xl md:text-4xl font-semibold tracking-wider mb-4">
              <span className="mr-1 text-purple-500">How Maven Works:</span>{" "}
              Your Journey to Informed Choices
            </h2>
            <p className="font-[family-name:var(--font-khand)] text-xl text-muted-foreground max-w-2xl mx-auto">
              Maven&apos;s intelligent workflow makes product research simple
              and effective.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative font-[family-name:var(--font-khand)]">
            {[
              {
                icon: <MessageSquare className="h-10 w-10" />,
                title: "You Ask",
                description:
                  "Start with a question or request about a product.",
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
                <h3 className="text-2xl font-semibold text-purple-500 mb-2">
                  {step.title}
                </h3>
                <p className="text-black/90 text-md dark:text-white/70">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <SnapshotCard />

        {/* Features Section */}

        <section className="mt-[16vh] lg:mt-0">
          <div className="flex items-center justify-center">
            <h2 className="text-5xl lg:text-6xl font-semibold mb-10 font-[family-name:var(--font-array)] tracking-wider">
              <span className="text-purple-500 font-[family-name:var(--font-array)]">
                Agentic
              </span>{" "}
              Tools
            </h2>
          </div>

          <div className="p-2 my-10 flex items-center justify-center">
            <AgenticShowcase />
          </div>
        </section>

        {/* Benefits Section */}
        <section
          id="benefits"
          className="container mx-auto py-[20vh] px-4 md:px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="font-[family-name:var(--font-khand)] text-3xl md:text-5xl font-semibold tracking-wider mb-4">
              <span className="font-[family-name:var(--font-array)] text-purple-500">
                Why Choose Maven?
              </span>{" "}
              Make Smarter Decisions, Faster.
            </h2>
            <p className="font-[family-name:var(--font-khand)] text-lg lg:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Maven transforms how you research and choose products.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative h-[500px] lg:h-[700px] w-full rounded-[2rem] overflow-hidden"
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
                    className="flex gap-4 font-[family-name:var(--font-khand)]"
                  >
                    <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center text-purple-400">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-3xl font-semibold mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground text-xl">
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
          className="container mx-auto my-[20vh] py-20 px-4 md:px-6 bg-muted/50 rounded-[2rem]"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="font-[family-name:var(--font-array)] text-3xl md:text-5xl font-semibold tracking-wider mb-4">
              What Users Are Saying
            </h2>
            <p className="font-[family-name:var(--font-khand)] text-lg lg:text-2xl text-muted-foreground max-w-2xl mx-auto">
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
                <Card className="font-[family-name:var(--font-khand)] h-full rounded-3xl border-border/50 bg-background/80 backdrop-blur-sm">
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
        <section className="container mx-auto py-20 px-4 md:px-6 my-[20vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-[2rem] bg-gradient-to-r from-white/30 via-purple-500/40 to-white/30 p-8 md:p-12 text-center"
          >
            <h2 className="font-[family-name:var(--font-array)] text-3xl md:text-5xl font-semibold tracking-wide mb-4">
              Ready to Transform Your Product Research?
            </h2>
            <p className="font-[family-name:var(--font-khand)] text-lg lg:text-2xl text-black/90 dark:text-white/90 max-w-2xl mx-auto my-8">
              Join thousands of users who are making smarter product decisions
              with Maven.
            </p>
            <motion.div>
              <MagneticWrapper>
                <Button
                  size="lg"
                  className="font-[family-name:var(--font-array)] font-medium text-2xl p-[30px] rounded-full hover:bg-purple-500 hover:text-white/90"
                >
                  <div className="flex items-center justify-center">
                    <span>Get Started</span>
                  </div>
                </Button>
              </MagneticWrapper>
            </motion.div>
          </motion.div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </ReactLenis>
  );
}
