import type { Metadata } from "next";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { RoleBanner } from "@/components/layout/role-banner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fingrow.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FinGrow — Learn Money. Play Smart. Invest Better. Grow.",
    template: "%s | FinGrow",
  },
  description:
    "FinGrow is an interactive financial and business education platform. Experience how money works with real-life simulations, gamified competitions, and classroom tools.",
  keywords: [
    "financial education",
    "stock market simulation",
    "SIP calculator",
    "budgeting simulator",
    "business fundamentals",
    "EBITDA",
    "classroom finance",
    "financial literacy",
    "money management for students",
    "investing basics",
  ],
  authors: [{ name: "FinGrow Team", url: siteUrl }],
  creator: "FinGrow Team",
  publisher: "FinGrow Inc.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FinGrow — Learn Money. Play Smart. Invest Better.",
    description: "Don't just teach people how money works. Let them experience how money works.",
    url: siteUrl,
    siteName: "FinGrow",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FinGrow — Interactive Financial & Business Learning Ecosystem",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FinGrow — Learn Money. Play Smart. Invest Better.",
    description: "Interactive financial education and risk-free simulation platform.",
    images: ["/og-image.png"],
    creator: "@FinGrowApp",
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
  const session = await getCurrentUser();
  let userStats = null;
  if (session) {
    const user = db.users.getById(session.userId);
    if (user) {
      userStats = {
        xp: user.xp,
        streakDays: user.streakDays,
      };
    }
  }

  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-full bg-fingrow-ivory text-fingrow-midnight antialiased">
        {/* WCAG 2.2 AA 2.4.1 Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-fingrow-emerald focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-fingrow-lime font-bold text-sm transition-all"
        >
          Skip to main content
        </a>
        <RoleBanner currentUser={session} />
        <Navbar user={session} userStats={userStats} />
        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
