import React from "react";
import type { Metadata } from "next";
import { Cpu, DollarSign, Wallet, TrendingUp, Compass, Calculator, ArrowRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SimulationsPreviewClient } from "./simulations-preview-client";

export const metadata: Metadata = {
  title: "Financial Simulations Showcase — FinGrow",
  description:
    "Experience 5 interactive financial simulators: First Salary 50/30/20, Monthly Budget Shocks, Investment Portfolio Challenge, SIP Wealth, and Startup Runway.",
  openGraph: {
    title: "Financial Simulations Showcase — FinGrow",
    description: "Experience 5 interactive virtual financial simulators. Risk-free practice for real-world confidence.",
    url: "https://fingrow.dev/simulations-showcase",
  },
};

export default function SimulationsShowcasePage() {
  const sims = [
    {
      title: "First Salary Simulator",
      icon: DollarSign,
      desc: "Receive your first real-world paycheck. Allocate between rent, emergency runway, utilities, and tax-deferred retirement accounts under the 50/30/20 framework.",
      href: "/simulations/first-salary",
      badge: "ESSENTIAL",
    },
    {
      title: "Monthly Budget & Shock Simulator",
      icon: Wallet,
      desc: "Life is unpredictable. Navigate surprise automotive repairs, unexpected dental bills, and inflation price hikes without falling into payday debt traps.",
      href: "/simulations/budget",
      badge: "REAL-WORLD",
    },
    {
      title: "Investment Portfolio Challenge",
      icon: TrendingUp,
      desc: "Manage a virtual $50,000 portfolio across global equities, treasury bonds, and index funds. Experience how market recessions test emotional discipline.",
      href: "/simulations/investing",
      badge: "MARKETS",
    },
    {
      title: "SIP & Compound Wealth Simulator",
      icon: Calculator,
      desc: "Visualize geometric wealth growth. Contrast systematic dollar-cost averaging against lump-sum investing with historical market return curves.",
      href: "/simulations/sip",
      badge: "COMPOUNDING",
    },
    {
      title: "Startup Builder & Runway Engine",
      icon: Compass,
      desc: "Found a venture. Manage your cash runway, optimize customer acquisition costs (CAC), maximize customer lifetime value (LTV), and reach positive EBITDA.",
      href: "/simulations/startup",
      badge: "ENTREPRENEURSHIP",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="emerald" size="sm">RISK-FREE VIRTUAL ENGINES</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-fingrow-midnight tracking-tight">
          Financial Simulations
        </h1>
        <p className="text-fingrow-midnight/70 text-base leading-relaxed">
          All virtual balances and market scenarios are 100% simulated for educational clarity. Make bold decisions, see immediate consequences, and learn without financial risk.
        </p>
      </div>

      {/* Interactive Sandbox Preview */}
      <SimulationsPreviewClient />

      {/* 5 Simulators Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-fingrow-midnight">Choose Your Simulation Lab</h2>
          <p className="text-sm text-fingrow-midnight/60">Hands-on scenarios with full parameter control and guided debriefs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sims.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.title} className="hover:border-fingrow-emerald transition-all flex flex-col justify-between">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-fingrow-emerald/10 text-fingrow-emerald flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="emerald" size="sm">{s.badge}</Badge>
                  </div>
                  <h3 className="font-bold text-xl text-fingrow-midnight">{s.title}</h3>
                  <p className="text-sm text-fingrow-midnight/70 leading-relaxed">{s.desc}</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <a href={s.href}>
                    <Button variant="outline" className="w-full justify-between">
                      <span>Launch Simulator</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Calculators Banner */}
      <div className="bg-fingrow-midnight text-white rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-2xl font-bold text-white">Need Quick Mathematical Calculations?</h3>
          <p className="text-white/70 text-sm max-w-xl">
            Access our free suite of Compound Interest, SIP Wealth, Loan EMI, and Inflation Purchasing Power calculators with dynamic graphs.
          </p>
        </div>
        <a href="/simulations/calculators">
          <Button variant="accent" size="lg" className="whitespace-nowrap font-bold">
            Open Financial Calculators
          </Button>
        </a>
      </div>
    </div>
  );
}
