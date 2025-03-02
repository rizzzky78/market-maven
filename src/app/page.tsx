"use client";

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
  ArrowRight,
  Hexagon,
  Laptop,
  Moon,
  Sun,
  Grip,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 font-sans">
      {/* Header */}
      <NavigationBar />

      {/* Hero Section */}
      <section className="*:font-sans min-h-screen container flex justify-center mx-auto py-20 px-4 md:px-6">
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
              Unlock the Power of
              <span className="mx-2 text-purple-500">AI</span>
              for
              <span className="mx-2 text-purple-500">Smarter</span>
              Product Decisions
            </h1>
            <p className="text-xl text-black/80 dark:text-white/80">
              From research to recommendations, Maven helps you
              <span className="ml-1 text-purple-400">find</span>,
              <span className="ml-1 text-purple-400">compare</span>, and
              understand products with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="font-medium rounded-full hover:bg-purple-500 hover:text-white"
              >
                <Link href={"/register"}>Try Maven Now</Link>
              </Button>
              <Button
                size="lg"
                variant="link"
                className="font-medium rounded-full hover:text-purple-500"
              >
                <Link href={"/understanding-app"}>Learn More</Link>
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
              <h3 className="text-xl font-semibold text-purple-500 mb-2">{step.title}</h3>
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
              Get Started <ArrowRight className="ml-1 size-6 shrink-0" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-32 py-12 px-4 md:px-12">
        <div className="container mx-auto">
          <div className=" flex flex-wrap gap-5 xl:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Hexagon className="h-6 w-6 text-purple-500" />
                <span className="text-xl font-bold tracking-tight">Maven</span>
              </div>
              <p className="text-black/90 dark:text-white/90">
                Your AI-powered product assistant for smarter decisions.
              </p>
            </div>
            <div className="bg-[#1A1A1D] text-white pt-2 pb-4 px-4 h-fit w-fit rounded-2xl">
              <h3 className="font-semibold">Application</h3>
              <Separator className="my-2 bg-purple-500" />
              <ul className="space-y-2 *:text-sm">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                  >
                    <Grip className="size-4 shrink-0" />
                    <span>Features</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                  >
                    <Grip className="size-4 shrink-0" />
                    <span>Cookbook</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                  >
                    <Grip className="size-4 shrink-0" />
                    <span>Public Reviews</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                  >
                    <Grip className="size-4 shrink-0" />
                    <span>Workflow</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                  >
                    <Grip className="size-4 shrink-0" />
                    <span>Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                  >
                    <Grip className="size-4 shrink-0" />
                    <span>Terms of Service</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div className="bg-[#1A1A1D] text-white pt-2 pb-4 px-4 h-fit w-fit rounded-2xl">
              <h3 className="font-semibold">Legal</h3>
              <Separator className="my-2 bg-purple-500" />
              <ul className="space-y-2 *:text-sm">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                  >
                    <Grip className="size-4 shrink-0" />
                    <span>Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                  >
                    <Grip className="size-4 shrink-0" />
                    <span>Terms of Service</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="bg-[#1A1A1D] text-white pt-2 pb-4 px-4 h-fit w-fit rounded-2xl">
              <h3 className="font-semibold">Developer Contacts</h3>
              <Separator className="my-2 bg-purple-500" />
              <ul className="space-y-2 *:text-sm">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                  >
                    <svg
                      width="1em"
                      height="1em"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="xMidYMid"
                      viewBox="0 0 256 256"
                    >
                      <path
                        d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453"
                        fill="#0A66C2"
                      />
                    </svg>
                    <span>LinkedIn</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                      preserveAspectRatio="xMidYMid"
                      viewBox="0 0 256 256"
                    >
                      <path
                        fill="#fff"
                        d="M128 23.064c34.177 0 38.225.13 51.722.745 12.48.57 19.258 2.655 23.769 4.408 5.974 2.322 10.238 5.096 14.717 9.575 4.48 4.479 7.253 8.743 9.575 14.717 1.753 4.511 3.838 11.289 4.408 23.768.615 13.498.745 17.546.745 51.723 0 34.178-.13 38.226-.745 51.723-.57 12.48-2.655 19.257-4.408 23.768-2.322 5.974-5.096 10.239-9.575 14.718-4.479 4.479-8.743 7.253-14.717 9.574-4.511 1.753-11.289 3.839-23.769 4.408-13.495.616-17.543.746-51.722.746-34.18 0-38.228-.13-51.723-.746-12.48-.57-19.257-2.655-23.768-4.408-5.974-2.321-10.239-5.095-14.718-9.574-4.479-4.48-7.253-8.744-9.574-14.718-1.753-4.51-3.839-11.288-4.408-23.768-.616-13.497-.746-17.545-.746-51.723 0-34.177.13-38.225.746-51.722.57-12.48 2.655-19.258 4.408-23.769 2.321-5.974 5.095-10.238 9.574-14.717 4.48-4.48 8.744-7.253 14.718-9.575 4.51-1.753 11.288-3.838 23.768-4.408 13.497-.615 17.545-.745 51.723-.745M128 0C93.237 0 88.878.147 75.226.77c-13.625.622-22.93 2.786-31.071 5.95-8.418 3.271-15.556 7.648-22.672 14.764C14.367 28.6 9.991 35.738 6.72 44.155 3.555 52.297 1.392 61.602.77 75.226.147 88.878 0 93.237 0 128c0 34.763.147 39.122.77 52.774.622 13.625 2.785 22.93 5.95 31.071 3.27 8.417 7.647 15.556 14.763 22.672 7.116 7.116 14.254 11.492 22.672 14.763 8.142 3.165 17.446 5.328 31.07 5.95 13.653.623 18.012.77 52.775.77s39.122-.147 52.774-.77c13.624-.622 22.929-2.785 31.07-5.95 8.418-3.27 15.556-7.647 22.672-14.763 7.116-7.116 11.493-14.254 14.764-22.672 3.164-8.142 5.328-17.446 5.95-31.07.623-13.653.77-18.012.77-52.775s-.147-39.122-.77-52.774c-.622-13.624-2.786-22.929-5.95-31.07-3.271-8.418-7.648-15.556-14.764-22.672C227.4 14.368 220.262 9.99 211.845 6.72c-8.142-3.164-17.447-5.328-31.071-5.95C167.122.147 162.763 0 128 0Zm0 62.27C91.698 62.27 62.27 91.7 62.27 128c0 36.302 29.428 65.73 65.73 65.73 36.301 0 65.73-29.428 65.73-65.73 0-36.301-29.429-65.73-65.73-65.73Zm0 108.397c-23.564 0-42.667-19.103-42.667-42.667S104.436 85.333 128 85.333s42.667 19.103 42.667 42.667-19.103 42.667-42.667 42.667Zm83.686-110.994c0 8.484-6.876 15.36-15.36 15.36-8.483 0-15.36-6.876-15.36-15.36 0-8.483 6.877-15.36 15.36-15.36 8.484 0 15.36 6.877 15.36 15.36Z"
                      />
                    </svg>
                    <span>Instagram</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                      fill="none"
                      viewBox="0 0 1200 1227"
                    >
                      <path
                        fill="#fff"
                        d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"
                      />
                    </svg>
                    <span>X/Twitter</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="flex items-center space-x-2 text-white/90 hover:text-purple-500 transition-colors"
                  >
                    <svg
                      viewBox="0 0 256 199"
                      width="1em"
                      height="1em"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="xMidYMid"
                    >
                      <path
                        d="M216.856 16.597A208.502 208.502 0 0 0 164.042 0c-2.275 4.113-4.933 9.645-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.809 207.809 0 0 0-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.094 161.094 0 0 0 79.735 175.3a136.413 136.413 0 0 1-21.846-10.632 108.636 108.636 0 0 0 5.356-4.237c42.122 19.702 87.89 19.702 129.51 0a131.66 131.66 0 0 0 5.355 4.237 136.07 136.07 0 0 1-21.886 10.653c4.006 8.02 8.638 15.67 13.873 22.848 21.142-6.58 42.646-16.637 64.815-33.213 5.316-56.288-9.08-105.09-38.056-148.36ZM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18Zm85.051 0c-12.645 0-23.014-11.805-23.014-26.18s10.148-26.2 23.014-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18Z"
                        fill="#5865F2"
                      />
                    </svg>
                    <span>Discord</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="inline-flex space-x-1 h-10 items-center justify-center rounded-3xl border border-input bg-background px-1 text-muted-foreground shadow-sm">
                <Button
                  variant={"ghost"}
                  size={"sm"}
                  className={cn(
                    "inline-flex items-center justify-center rounded-2xl px-2.5 py-1.5 text-xs font-medium transition-all",
                    theme === "system"
                      ? "bg-secondary text-secondary-foreground shadow-sm"
                      : "hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setTheme("system")}
                  aria-label="System theme"
                >
                  <Laptop className="h-4 w-4 text-purple-500" />
                  <span>System</span>
                </Button>
                <Button
                  variant={"ghost"}
                  size={"sm"}
                  className={cn(
                    "inline-flex items-center justify-center rounded-2xl px-2.5 py-1.5 text-xs font-medium transition-all",
                    theme === "light"
                      ? "bg-secondary text-secondary-foreground shadow-sm"
                      : "hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setTheme("light")}
                  aria-label="Light theme"
                >
                  <Sun className="h-4 w-4 text-purple-500" />
                  <span>Light</span>
                </Button>
                <Button
                  variant={"ghost"}
                  size={"sm"}
                  className={cn(
                    "inline-flex items-center justify-center rounded-2xl px-2.5 py-1.5 text-xs font-medium transition-all",
                    theme === "dark"
                      ? "bg-secondary text-secondary-foreground shadow-sm"
                      : "hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setTheme("dark")}
                  aria-label="Dark theme"
                >
                  <Moon className="h-4 w-4 text-purple-500" />
                  <span>Dark</span>
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-purple-500 border-t border-border/40 text-center text-muted-foreground">
            <p className="text-sm text-black/90 dark:text-white/80">
              © 2025 Maven AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
