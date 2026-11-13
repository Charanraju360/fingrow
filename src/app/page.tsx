import React from "react";
import type { Metadata } from "next";
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Gamepad2,
  Cpu,
  GraduationCap,
  Users,
  ArrowRight,
  CheckCircle2,
  PieChart,
  Award,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { InteractiveHeroPreview } from "@/components/marketing/interactive-hero-preview";

export const metadata: Metadata = {
  title: "FinGrow — Learn Money. Play Smart. Invest Better. Grow.",
  description:
    "Interactive financial and business learning ecosystem. Master budgeting, stock markets, SIPs, and entrepreneurship through multiplayer games and risk-free virtual simulations.",
  openGraph: {
    title: "FinGrow — Interactive Financial Learning & Virtual Simulations",
    description: "Don't just teach people how money works. Let them experience how money works in a risk-free virtual world.",
    url: "https://fingrow.dev",
    siteName: "FinGrow",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FinGrow — Learn Money. Play Smart. Invest Better.",
    description: "Interactive financial education, gamified competitions, and risk-free simulation engine.",
  },
};

export default async function HomePage() {
  const session = await getCurrentUser();
  const courses = db.courses.getAll();
  const metrics = db.admin.getPlatformMetrics();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "FinGrow",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Interactive financial education, gamified competitions, and risk-free simulation sandbox."
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fingrow-emerald/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-fingrow-emerald/10 border border-fingrow-emerald/20 text-fingrow-emerald text-xs font-bold tracking-wide animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-fingrow-lime" />
              <span>THE FINANCIAL EXPERIENCE PLATFORM</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-fingrow-midnight leading-[1.15]">
              Learn Money. <br className="hidden sm:inline" />
              <span className="font-editorial italic font-normal text-fingrow-emerald">Play Smart. </span>
              Invest Better.
            </h1>

            <p className="text-lg sm:text-xl text-fingrow-midnight/70 leading-relaxed font-normal max-w-2xl mx-auto">
              Don&apos;t just read about finance. Experience market shocks, manage your first salary, build virtual investment portfolios, and compete in multiplayer financial games.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a href={session ? "/dashboard" : "/register"}>
                <Button size="lg" variant="primary" className="w-full sm:w-auto shadow-md">
                  <span>{session ? "Go to Dashboard" : "Start Learning Free"}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </a>
              <a href="/simulations">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Cpu className="w-4 h-4 mr-2" />
                  <span>Try Simulations</span>
                </Button>
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-fingrow-midnight/60">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-fingrow-emerald" />
                <span>Zero Real-Money Risk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-fingrow-emerald" />
                <span>Classroom Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-fingrow-emerald" />
                <span>Gamified XP & Streaks</span>
              </div>
            </div>
          </div>

          {/* INTERACTIVE PRODUCT PREVIEW CARD */}
          <div className="mt-14 max-w-5xl mx-auto">
            <InteractiveHeroPreview />
          </div>
        </div>
      </section>

      {/* CORE VALUE PROPOSITIONS */}
      <section className="py-20 bg-white border-y border-fingrow-midnight/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold tracking-widest uppercase text-fingrow-emerald">
              WHY FINGROW IS DIFFERENT
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-fingrow-midnight">
              Built for how the next generation actually learns.
            </h3>
            <p className="text-fingrow-midnight/70 text-base leading-relaxed">
              Dull textbooks and intimidating brokerage charts fail young learners. FinGrow combines game theory, real market simulations, and educator tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="hover:border-fingrow-emerald transition-colors">
              <CardContent className="pt-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-fingrow-emerald/10 text-fingrow-emerald flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-fingrow-midnight">Bite-Sized Modules</h4>
                <p className="text-sm text-fingrow-midnight/70 leading-relaxed">
                  Learn personal finance, stock order books, and EBITDA through 10-minute micro-lessons with immediate knowledge checks.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:border-fingrow-emerald transition-colors">
              <CardContent className="pt-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-fingrow-lime/20 text-[#3f7700] flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-fingrow-midnight">Multiplayer Games</h4>
                <p className="text-sm text-fingrow-midnight/70 leading-relaxed">
                  Challenge classmates or coworkers in 1v1 battles and speed rounds. Earn XP, maintain streaks, and climb the leaderboard.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:border-fingrow-emerald transition-colors">
              <CardContent className="pt-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-fingrow-midnight/10 text-fingrow-midnight flex items-center justify-center">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-fingrow-midnight">Safe Simulations</h4>
                <p className="text-sm text-fingrow-midnight/70 leading-relaxed">
                  Test realistic budgeting emergencies, startup runway burn, and index fund asset allocations without losing real money.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:border-fingrow-emerald transition-colors">
              <CardContent className="pt-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-fingrow-tangerine/15 text-fingrow-tangerine flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-fingrow-midnight">Educator Portals</h4>
                <p className="text-sm text-fingrow-midnight/70 leading-relaxed">
                  Create classrooms, share instant QR codes, assign quizzes, track student mastery, and export verified grade reports.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CURRICULUM SPOTLIGHT */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <Badge variant="emerald" size="sm" className="mb-2">CURRICULUM</Badge>
              <h2 className="text-3xl font-extrabold text-fingrow-midnight">
                FinGrow Foundations Track
              </h2>
              <p className="text-fingrow-midnight/70 text-sm mt-1">
                8 comprehensive courses authored for clarity, practical wisdom, and zero jargon.
              </p>
            </div>
            <a href="/curriculum">
              <Button variant="outline" size="sm">
                <span>View Full Curriculum</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.slice(0, 4).map((course) => (
              <a
                key={course.id}
                href={`/learn/${course.slug}`}
                className="group flex flex-col bg-white rounded-2xl p-6 border border-fingrow-midnight/10 shadow-finCard hover:shadow-finElevated hover:border-fingrow-emerald transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="emerald" size="sm">{course.level}</Badge>
                  <span className="text-xs text-fingrow-midnight/60 font-medium">
                    {course.estimatedMinutes} mins
                  </span>
                </div>
                <h3 className="font-bold text-lg text-fingrow-midnight group-hover:text-fingrow-emerald transition-colors line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-sm text-fingrow-midnight/70 mt-2 line-clamp-3 leading-relaxed flex-1">
                  {course.description}
                </p>
                <div className="pt-4 mt-4 border-t border-fingrow-midnight/5 flex items-center justify-between text-xs font-bold text-fingrow-emerald">
                  <span>Start Lesson</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-20 bg-fingrow-midnight text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6 relative z-10">
          <Badge variant="lime" size="sm">GET STARTED TODAY</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Financial confidence starts with hands-on practice.
          </h2>
          <p className="text-white/70 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
            Join students, young professionals, and classrooms already mastering money the smart way. Free to start, no credit card required.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/register">
              <Button size="lg" variant="accent" className="w-full sm:w-auto font-bold">
                Create Free Account
              </Button>
            </a>
            <a href="/for-educators">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10">
                Educator Solutions
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
