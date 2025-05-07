import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/utility/provider/theme-provider";
import { Toaster } from "sonner";
import { getServerSession } from "next-auth";
import { SessionProvider } from "@/lib/utility/provider/session-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import localFont from "next/font/local";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const array = localFont({
  src: "./fonts/Array-Regular.woff2",
  variable: "--font-array",
  display: "swap",
});

const khand = localFont({
  src: "./fonts/Khand-Variable.woff2",
  variable: "--font-khand",
  display: "swap",
});

const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maven AI - Agentic Data Driven Purchase Decision | Rzky",
  description:
    "Maven AI by Rzky Prasetyo: Your intelligent companion for market analysis and trading insights. Powered by AI to deliver real-time stock market trends and predictive analytics.",
  keywords: [
    "Maven AI",
    "Market Maven",
    "data driven analysis",
    "helper purchase decision",
    "AI helper",
    "predictive analytics",
    "Rzky Prasetyo portfolio",
  ],
  authors: [{ name: "Rzky Prasetyo", url: "https://rzkyprasetyo.vercel.app" }],
  openGraph: {
    title: "Maven AI - AI-Powered Market Analysis",
    description:
      "Discover Maven AI, a cutting-edge agentic tool for data driven purchase insights, built by Rzky Prasetyo.",
    url: "https://rzkyprasetyo.vercel.app/projects/maven-ai",
    siteName: "Rzky Prasetyo Portfolio",
    images: [
      {
        url: "https://rzkyprasetyo.vercel.app/images/maven-ai-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Maven AI Market Analysis Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maven AI - Market Analysis & Trading Insights",
    description:
      "Explore Maven AI by Rzky Prasetyo for AI-driven electronic products purchase decision and insights.",
    images: [
      "https://rzkyprasetyo.vercel.app/images/maven-ai-twitter-image.jpg",
    ],
    creator: "@rzkyprasetyo",
  },
  alternates: {
    canonical: "https://rzkyprasetyo.vercel.app/projects/maven-ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${array.variable} ${khand.variable} ${satoshi.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SpeedInsights />
          <Toaster />
          <SessionProvider session={session}>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
