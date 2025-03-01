"use client";

import { NavigationBar } from "@/components/maven/navigation-bar";
import { StickyScroll } from "@/components/maven/sticky-scroll";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Brain,
  Search,
  ListFilter,
  FileText,
  BarChart3,
  MessageSquare,
  CheckCircle,
  Clock,
  Lightbulb,
  UserCircle,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 font-sans">
      {/* Header */}
      <NavigationBar />

      {/* Hero Section */}
      <section className="min-h-screen container flex justify-center mx-auto py-20 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
              Unlock the Power of AI for Smarter Product Decisions
            </h1>
            <p className="text-xl font-thin text-white/80">
              From research to recommendations, Maven helps you find, compare,
              and understand products with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="font-medium rounded-full">
                Try Maven Now
              </Button>
              <Button
                size="lg"
                variant="link"
                className="font-medium rounded-full"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative h-[400px] w-full flex justify-center"
          >
            <svg
              className="coolshapes polygon-7 "
              height="400"
              width="400"
              fill="none"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#cs_clip_1_polygon-7)">
                <mask
                  height="200"
                  id="cs_mask_1_polygon-7"
                  style={{ maskType: "alpha" }}
                  width="182"
                  x="9"
                  y="0"
                  maskUnits="userSpaceOnUse"
                >
                  <path
                    d="M86.449 3.601a27.296 27.296 0 0127.102 0l63.805 36.514C185.796 44.945 191 53.9 191 63.594v72.812c0 9.694-5.204 18.649-13.644 23.479l-63.805 36.514a27.3 27.3 0 01-27.102 0l-63.805-36.514C14.204 155.055 9 146.1 9 136.406V63.594c0-9.694 5.204-18.649 13.644-23.48L86.45 3.602z"
                    fill="#fff"
                  />
                </mask>
                <g mask="url(#cs_mask_1_polygon-7)">
                  <path d="M200 0H0v200h200V0z" fill="#fff" />
                  <path d="M200 0H0v200h200V0z" fill="#0E6FFF" />
                  <g filter="url(#filter0_f_748_4355)">
                    <path d="M209 126H-9v108h218V126z" fill="#8F5BFF" />
                    <ellipse
                      cx="87"
                      cy="57.5"
                      fill="#00F0FF"
                      rx="59"
                      ry="34.5"
                    />
                  </g>
                </g>
              </g>
              <g
                style={{ mixBlendMode: "overlay" }}
                mask="url(#cs_mask_1_polygon-7)"
              >
                <path
                  d="M200 0H0v200h200V0z"
                  fill="gray"
                  stroke="transparent"
                  filter="url(#cs_noise_1_polygon-7)"
                />
              </g>
              <defs>
                <filter
                  height="331"
                  id="filter0_f_748_4355"
                  width="338"
                  x="-69"
                  y="-37"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood result="BackgroundImageFix" floodOpacity="0" />
                  <feBlend
                    result="shape"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                  />
                  <feGaussianBlur
                    result="effect1_foregroundBlur_748_4355"
                    stdDeviation="30"
                  />
                </filter>
                <clipPath id="cs_clip_1_polygon-7">
                  <path d="M0 0H200V200H0z" fill="#fff" />
                </clipPath>
              </defs>
              <defs>
                <filter
                  height="100%"
                  id="cs_noise_1_polygon-7"
                  width="100%"
                  x="0%"
                  y="0%"
                  filterUnits="objectBoundingBox"
                >
                  <feBlend result="out3" in="SourceGraphic" in2="out2" />
                </filter>
              </defs>
            </svg>
          </motion.div>
        </div>
      </section>

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
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How Maven Works: Your Journey to Informed Choices
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Maven&apos;s intelligent workflow makes product research simple and
            effective.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {[
            {
              icon: <MessageSquare className="h-10 w-10 text-primary" />,
              title: "You Ask",
              description: "Start with a question or request about a product.",
            },
            {
              icon: <Brain className="h-10 w-10 text-primary" />,
              title: "Maven Thinks",
              description:
                "Maven's intelligent orchestrator analyzes your input.",
            },
            {
              icon: <Search className="h-10 w-10 text-primary" />,
              title: "Smart Actions",
              description:
                "Maven selects the best tools to get you the answers you need.",
            },
            {
              icon: <CheckCircle className="h-10 w-10 text-primary" />,
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
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <div className="p-2 flex items-center justify-center">
        <StickyScroll
          content={[
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
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Why Choose Maven? Make Smarter Decisions, Faster.
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
            className="relative h-[400px] w-full rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-border/50"
          >
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 p-8 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="rounded-md bg-background/10 backdrop-blur-sm border border-border/20 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                >
                  <Image
                    src={`/placeholder.svg?height=150&width=150`}
                    alt="Product visualization"
                    width={150}
                    height={150}
                    className="object-cover"
                  />
                </motion.div>
              ))}
            </div>
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
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary">
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
        className="container mx-auto py-20 px-4 md:px-6 bg-muted/50 rounded-3xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            What Users Are Saying
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover how Maven is transforming product research for users
            worldwide.
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
              <Card className="h-full border-border/50 bg-background/80 backdrop-blur-sm">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="mb-4 text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="inline-block mr-1">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-lg mb-6 flex-grow">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
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
          className="rounded-3xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/20 p-8 md:p-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to Transform Your Product Research?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of users who are making smarter product decisions
            with Maven.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="lg" className="font-medium text-lg px-8">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold tracking-tight">Maven</span>
              </div>
              <p className="text-muted-foreground">
                Your AI-powered product assistant for smarter decisions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    API
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/40 text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} Maven AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
