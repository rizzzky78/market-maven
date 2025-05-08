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
