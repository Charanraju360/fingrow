import React from "react";
import { Cpu, DollarSign, Wallet, TrendingUp, Calculator, Compass, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VirtualDisclaimerBanner, VirtualFundsBadge } from "@/components/simulations/VirtualDisclaimer";

export const metadata = {
  title: "Simulations Hub — FinGrow",
  description: "Explore 5 interactive financial simulators and calculators with 100% virtual currency.",
};

export default function SimulationsHubPage() {
  const sims = [
    {
      title: "First Salary Simulator",
      icon: DollarSign,
      category: "Personal Finance",
      desc: "Manage your first real paycheck under the 50/30/20 framework. Balance housing, student loans, emergency reserves, and index fund contributions with automated 50/30/20 balance presets.",
      href: "/simulations/first-salary",
      actionLabel: "Budget First Paycheck",
    },
    {
      title: "Monthly Budget & Emergency Shock",
      icon: Wallet,
      category: "Risk Management",
      desc: "Experience how unexpected car breakdowns, medical deductibles, and rent hikes impact cash flow. Learn how liquid emergency funds prevent predatory 24% credit card debt spirals.",
      href: "/simulations/budget",
      actionLabel: "Survive Budget Shocks",
    },
    {
      title: "$50,000 Virtual Investment Challenge",
      icon: TrendingUp,
      category: "Asset Allocation",
      desc: "Construct an all-weather portfolio across global index funds, corporate equities, and treasury bonds. Stress-test your holdings against bull runs, bear markets, and stagflation rate hikes.",
      href: "/simulations/investing",
      actionLabel: "Build Portfolio",
    },
    {
      title: "SIP & Geometric Wealth Projector",
      icon: Calculator,
      category: "Compound Interest",
      desc: "Visualize the Rule of 72 and the exponential acceleration of dollar-cost averaging over 10, 20, and 30-year horizons with real inflation purchasing power adjustments.",
      href: "/simulations/sip",
      actionLabel: "Project SIP Growth",
    },
    {
      title: "Startup Builder & Runway Engine",
      icon: Compass,
      category: "Entrepreneurship",
      desc: "Lead a tech venture with $100,000 in virtual seed capital. Allocate funds between product engineering, paid marketing, and user pricing. Optimize CAC, LTV, and reach positive EBITDA.",
      href: "/simulations/startup",
      actionLabel: "Build Startup",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="emerald" size="sm">VIRTUAL FINANCIAL ENGINES</Badge>
          <VirtualFundsBadge />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-fingrow-midnight tracking-tight">
          Risk-Free Financial Simulations
        </h1>
        <p className="text-fingrow-midnight/70 text-sm sm:text-base max-w-2xl leading-relaxed">
          Experience market mechanics, budgeting trade-offs, compounding acceleration, and entrepreneurial unit economics with zero risk to your real bank account.
        </p>
      </div>

      {/* Global Virtual Disclaimer Banner */}
      <VirtualDisclaimerBanner
        scenarioName="FinGrow Simulations Suite"
        assumptions={[
          "All simulations operate on 100% virtual play funds. FinGrow has no integration with live bank accounts, brokerages, or payment networks.",
          "Mathematical calculations are decimal-safe and follow industry-standard formulas (50/30/20, Rule of 72, compound annuity, SaaS unit economics).",
          "Simulated historical market scenarios are educational illustrations; past performance does not predict future real-world investment returns.",
          "Learners can persist simulation runs and results directly to their authenticated FinGrow profile.",
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sims.map((sim) => {
          const Icon = sim.icon;
          return (
            <Card key={sim.title} className="hover:border-fingrow-emerald transition-all flex flex-col justify-between">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-fingrow-emerald/10 text-fingrow-emerald flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="emerald" size="sm">{sim.category}</Badge>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-fingrow-midnight">{sim.title}</h3>
                  <p className="text-xs text-fingrow-midnight/70 mt-1 leading-relaxed line-clamp-3">
                    {sim.desc}
                  </p>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <a href={sim.href}>
                  <Button variant="primary" className="w-full justify-between text-xs">
                    <span>{sim.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </a>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Calculators Banner */}
      <div className="bg-fingrow-midnight text-white rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-white/10">
        <div className="space-y-2">
          <Badge variant="lime" size="sm">CALCULATORS</Badge>
          <h2 className="text-2xl font-bold text-white">Mathematical Financial Calculators</h2>
          <p className="text-white/70 text-sm max-w-xl">
            Live interactive calculators for Compound Interest, SIP Wealth, Loan EMI, and Inflation Purchasing Power with instant numerical breakdowns.
          </p>
        </div>
        <a href="/simulations/calculators">
          <Button variant="accent" size="lg" className="whitespace-nowrap font-bold">
            Launch Calculators
          </Button>
        </a>
      </div>
    </div>
  );
}
