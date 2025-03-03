import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Search,
  FileText,
  LayoutList,
  MessageSquareIcon as MessageSquareQuestion,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import { Footer } from "./footer";

export const Features: FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header section */}
      <header className="container mx-auto px-4 py-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Maven Features: Your AI-Powered Product Toolkit
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Maven is designed to revolutionize the way you research and choose
            products. Our suite of AI-powered tools provides everything you
            need, from personalized recommendations to in-depth comparisons, all
            in one intuitive platform. Explore the features below to see how
            Maven can help you make smarter decisions, faster.
          </p>
          <p className="text-sm text-muted-foreground">
            Last Updated: March 2025 |{" "}
            <span className="font-medium">Developer</span>
          </p>
        </div>
      </header>

      {/* Features section */}
      <main className="container mx-auto px-4 py-12">
        {/* Feature 1: recommendator */}
        <section className="grid md:grid-cols-2 gap-8 items-center mb-24">
          <div className="order-2 md:order-1">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">AI Product Picks</h2>
            </div>
            <p className="text-lg mb-6">
              Discover the perfect products for you. Maven&apos;s intelligent
              recommender analyzes your needs and preferences, providing
              personalized suggestions and insightful explanations, guiding you
              to the best choices quickly and confidently.
            </p>
            <Link
              href="#"
              className="text-primary font-medium hover:underline inline-flex items-center"
            >
              Learn More <span className="ml-1">→</span>
            </Link>
          </div>
          <div className="order-1 md:order-2">
            <div className="rounded-[2rem] overflow-hidden border shadow-sm">
              <Image
                src="/rate-img-1.jpg"
                alt="AI Product Picks screenshot showing personalized recommendations"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* Feature 2: searchProduct */}
        <section className="grid md:grid-cols-2 gap-8 items-center mb-24">
          <div className="order-1">
            <div className="rounded-[2rem] overflow-hidden border shadow-sm">
              <Image
                src="/rate-img-2.jpg"
                alt="Find Products Fast screenshot showing search results"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          <div className="order-2">
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Find Products Fast</h2>
            </div>
            <p className="text-lg mb-6">
              Instantly locate the products you&lsquo;re looking for.
              Maven&apos;s precise search engine swiftly retrieves relevant
              results from the web, even with partial names, presenting you with
              concise summaries and key details to streamline your research.
            </p>
            <Link
              href="#"
              className="text-primary font-medium hover:underline inline-flex items-center"
            >
              Learn More <span className="ml-1">→</span>
            </Link>
          </div>
        </section>

        {/* Feature 3: getProductDetails */}
        <section className="grid md:grid-cols-2 gap-8 items-center mb-24">
          <div className="order-2 md:order-1">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Deep Product Insights</h2>
            </div>
            <p className="text-lg mb-6">
              Go beyond the surface. Maven gathers comprehensive product
              information from multiple sources, including web scraping and
              external databases, delivering in-depth details, specifications,
              and insightful summaries to empower your decision-making.
            </p>
            <Link
              href="#"
              className="text-primary font-medium hover:underline inline-flex items-center"
            >
              Learn More <span className="ml-1">→</span>
            </Link>
          </div>
          <div className="order-1 md:order-2">
            <div className="rounded-[2rem] overflow-hidden border shadow-sm">
              <Image
                src="/rate-img-3.jpg"
                alt="Deep Product Insights screenshot showing detailed product information"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* Feature 4: productsComparison */}
        <section className="grid md:grid-cols-2 gap-8 items-center mb-24">
          <div className="order-1">
            <div className="rounded-[2rem] overflow-hidden border shadow-sm">
              <Image
                src="/rate-img-4.jpg"
                alt="Compare Side-by-Side screenshot showing product comparison table"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          <div className="order-2">
            <div className="flex items-center gap-2 mb-4">
              <LayoutList className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Compare Side-by-Side</h2>
            </div>
            <p className="text-lg mb-6">
              Make informed choices with ease. Maven lets you directly compare
              multiple products, highlighting key differences and similarities,
              providing clear, concise comparisons and expert insights to help
              you choose the best option.
            </p>
            <Link
              href="#"
              className="text-primary font-medium hover:underline inline-flex items-center"
            >
              Learn More <span className="ml-1">→</span>
            </Link>
          </div>
        </section>

        {/* Feature 5: inquireUser */}
        <section className="grid md:grid-cols-2 gap-8 items-center mb-24">
          <div className="order-2 md:order-1">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquareQuestion className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Maven Understands You</h2>
            </div>
            <p className="text-lg mb-6">
              Experience a truly personalized interaction. When more information
              is needed, Maven proactively asks clarifying questions, ensuring
              it fully understands your requirements and delivers the most
              relevant and accurate results. This interactive approach ensures
              you get exactly what you&apos;re looking for.
            </p>
            <Link
              href="#"
              className="text-primary font-medium hover:underline inline-flex items-center"
            >
              Learn More <span className="ml-1">→</span>
            </Link>
          </div>
          <div className="order-1 md:order-2">
            <div className="rounded-[2rem] overflow-hidden border shadow-sm">
              <Image
                src="/rate-img-5.jpg"
                alt="Maven Understands You screenshot showing inquiry prompt"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* Call to Action section */}
        <section className="bg-muted rounded-xl p-8 text-center max-w-3xl mx-auto mb-16">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Experience Maven?
          </h3>
          <p className="text-lg mb-6">
            Try Maven today and see how it can transform your product research.
          </p>
          <Button size="lg" className="px-8">
            Try Maven Now
          </Button>
        </section>

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

      {/* Footer */}
      <Footer />
    </div>
  );
};
