import React from "react";
import { TrendingUp, Target, Heart, Award, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About FinGrow — Our Mission, Philosophy & Team",
  description:
    "FinGrow was founded on a simple premise: financial literacy cannot be memorized from a textbook. It must be experienced through risk-free interactive practice.",
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="emerald" size="sm">OUR MISSION</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-fingrow-midnight tracking-tight">
          Financial education built for the real world.
        </h1>
        <p className="text-lg text-fingrow-midnight/70 leading-relaxed font-editorial italic">
          &quot;Don&apos;t just teach people how money works. Let them experience how money works.&quot;
        </p>
      </div>

      {/* Story */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4 text-fingrow-midnight/80 leading-relaxed">
          <h2 className="text-2xl font-bold text-fingrow-midnight">Why We Built FinGrow</h2>
          <p>
            Traditional financial education suffers from a profound paradox: textbooks teach formulas that students forget three days after an exam, while high-risk trading apps gamify speculative day-trading that leads to devastating real-world financial losses.
          </p>
          <p>
            FinGrow bridges this gap. We provide a safe, risk-free simulation world where teenagers, college students, and young professionals can test real-world scenarios—from budgeting their first paycheck and deciphering credit card APRs to building low-cost index fund portfolios and understanding company EBITDA.
          </p>
          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-fingrow-midnight">
              <CheckCircle2 className="w-4 h-4 text-fingrow-emerald" />
              <span>Evidence-based personal finance, zero speculative hype</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-fingrow-midnight">
              <CheckCircle2 className="w-4 h-4 text-fingrow-emerald" />
              <span>Free for students, powerful for teachers</span>
            </div>
          </div>
        </div>

        <div className="bg-fingrow-midnight text-white p-8 rounded-3xl shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-fingrow-emerald flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6 text-fingrow-lime" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Our Core Commitments</h3>
              <p className="text-xs text-white/60">Strictly educational & independent</p>
            </div>
          </div>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <span className="text-fingrow-lime font-bold">•</span>
              <span><strong>100% Virtual Money:</strong> We never execute real trades, link brokerage accounts, or sell financial products.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-fingrow-lime font-bold">•</span>
              <span><strong>No Predatory Ads:</strong> No crypto pump schemes, no payday loan promotions, and no sponsored stock recommendations.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-fingrow-lime font-bold">•</span>
              <span><strong>Educator-First:</strong> Designed in collaboration with economics teachers to align with state standards.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Pillars */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-center text-fingrow-midnight">Our Design Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-fingrow-emerald/10 text-fingrow-emerald flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="font-bold text-lg text-fingrow-midnight">Experiential First</h3>
              <p className="text-sm text-fingrow-midnight/70 leading-relaxed">
                Concepts are internalized when you feel their impact. A student who experiences a compound interest simulation remembers it for life.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-fingrow-lime/20 text-[#3f7700] flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="font-bold text-lg text-fingrow-midnight">Wholesome Gamification</h3>
              <p className="text-sm text-fingrow-midnight/70 leading-relaxed">
                We reward positive habits: emergency reserves, index diversification, and consistent daily learning streaks—not risky speculation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-fingrow-midnight/10 text-fingrow-midnight flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="font-bold text-lg text-fingrow-midnight">Radical Clarity</h3>
              <p className="text-sm text-fingrow-midnight/70 leading-relaxed">
                Zero gatekeeping terminology. Every financial concept is explained with plain language, intuitive graphs, and realistic numerical models.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-8">
        <a href="/register">
          <Button size="lg" variant="primary">
            Join FinGrow Today
          </Button>
        </a>
      </div>
    </div>
  );
}

