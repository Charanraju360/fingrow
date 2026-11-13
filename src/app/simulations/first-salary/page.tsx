"use client";

import React, { useState } from "react";
import {
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
  Sliders,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercent, decimalRound } from "@/lib/utils";
import {
  VirtualDisclaimerBanner,
  VirtualFundsBadge,
} from "@/components/simulations/VirtualDisclaimer";

export default function FirstSalarySimulatorPage() {
  const [monthlySalary, setMonthlySalary] = useState<number>(4500); // Net take-home
  const [rent, setRent] = useState<number>(1400);
  const [groceriesUtilities, setGroceriesUtilities] = useState<number>(600);
  const [minimumDebt, setMinimumDebt] = useState<number>(250);
  const [diningEntertainment, setDiningEntertainment] = useState<number>(700);
  const [hobbiesSubscriptions, setHobbiesSubscriptions] = useState<number>(400);
  const [emergencySavings, setEmergencySavings] = useState<number>(500);
  const [investments, setInvestments] = useState<number>(650);

  // Persistence status
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error" | "unauthenticated">("idle");
  const [saveMessage, setSaveMessage] = useState<string>("");

  // Decimal-safe totals
  const totalNeeds = decimalRound(rent + groceriesUtilities + minimumDebt, 2);
  const totalWants = decimalRound(diningEntertainment + hobbiesSubscriptions, 2);
  const totalFreedom = decimalRound(emergencySavings + investments, 2);
  const totalAllocated = decimalRound(totalNeeds + totalWants + totalFreedom, 2);
  const unallocated = decimalRound(monthlySalary - totalAllocated, 2);

  // 50/30/20 Percentages
  const needsPct = monthlySalary > 0 ? Math.round((totalNeeds / monthlySalary) * 100) : 0;
  const wantsPct = monthlySalary > 0 ? Math.round((totalWants / monthlySalary) * 100) : 0;
  const freedomPct = monthlySalary > 0 ? Math.round((totalFreedom / monthlySalary) * 100) : 0;

  // Projections
  const emergencyRunwayMonths =
    totalNeeds > 0 ? decimalRound((emergencySavings * 12) / totalNeeds, 1) : 0;
  const annualInvestmentGrowth = decimalRound(investments * 12 * 1.08, 2); // 8% assumed return
  const fiveYearInvestmentGrowth = decimalRound(investments * 12 * ((Math.pow(1.08, 5) - 1) / 0.08), 2);

  // Auto balance preset
  function handleAutoBalance() {
    const targetNeeds = monthlySalary * 0.5;
    const targetWants = monthlySalary * 0.3;
    const targetFreedom = monthlySalary * 0.2;

    setRent(Math.round(targetNeeds * 0.65));
    setGroceriesUtilities(Math.round(targetNeeds * 0.25));
    setMinimumDebt(Math.round(targetNeeds * 0.10));

    setDiningEntertainment(Math.round(targetWants * 0.6));
    setHobbiesSubscriptions(Math.round(targetWants * 0.4));

    setEmergencySavings(Math.round(targetFreedom * 0.45));
    setInvestments(Math.round(targetFreedom * 0.55));
  }

  function handleReset() {
    setMonthlySalary(4500);
    setRent(1400);
    setGroceriesUtilities(600);
    setMinimumDebt(250);
    setDiningEntertainment(700);
    setHobbiesSubscriptions(400);
    setEmergencySavings(500);
    setInvestments(650);
    setSaveStatus("idle");
    setSaveMessage("");
  }

  async function handleSaveSimulation() {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/simulations/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          scenarioType: "first_salary",
          initialBalance: monthlySalary,
          parameters: {
            monthlySalary,
            needsPct,
            wantsPct,
            freedomPct,
            totalNeeds,
            totalWants,
            totalFreedom,
            emergencyRunwayMonths,
            annualInvestmentGrowth,
          },
        }),
      });

      if (res.status === 401) {
        setSaveStatus("unauthenticated");
        setSaveMessage("Please log in to persist simulation runs to your learner profile.");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to save simulation run");
      }

      setSaveStatus("saved");
      setSaveMessage("Simulation run successfully saved to your FinGrow profile!");
    } catch (err: any) {
      console.error("Save failed", err);
      setSaveStatus("error");
      setSaveMessage("Could not save simulation. Please check your connection.");
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <a
          href="/simulations"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-fingrow-midnight/60 hover:text-fingrow-emerald transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Simulations Hub</span>
        </a>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="emerald" size="sm">SIMULATION 1 OF 5</Badge>
          <VirtualFundsBadge />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-fingrow-midnight tracking-tight">
          First Salary & 50/30/20 Budgeting Simulator
        </h1>
        <p className="text-sm text-fingrow-midnight/70 max-w-2xl leading-relaxed">
          Allocate your first real post-tax monthly paycheck. Learn how the standard 50/30/20 framework protects you from the common trap of lifestyle inflation while establishing your emergency foundation.
        </p>
      </div>

      {/* Virtual Disclaimer Banner with Transparent Assumptions */}
      <VirtualDisclaimerBanner
        scenarioName="First Salary Budgeting"
        assumptions={[
          "Monthly Take-Home Pay assumes net earnings after Federal/State income tax, Social Security, Medicare, and payroll deductions.",
          "Emergency Fund runway calculation divides 12 months of savings by essential needs (rent, utilities, debt minimums).",
          "Virtual Investment projection assumes an 8.0% historical nominal annualized return on broad-market index funds, compounded monthly.",
          "No actual bank accounts, debit cards, or brokerage accounts are touched; all allocations are 100% simulated.",
        ]}
      />

      {/* Monthly Net Salary Selector */}
      <Card className="bg-fingrow-midnight text-white border-0 shadow-xl">
        <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-fingrow-lime">
                Virtual Net Take-Home Pay
              </span>
              <VirtualFundsBadge />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {formatCurrency(monthlySalary)}
              <span className="text-xs font-normal text-white/60 ml-2">/ month</span>
            </div>
            <p className="text-xs text-white/60">Estimated net cash deposited into virtual checking account</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[3500, 4500, 6000, 8000].map((amt) => (
              <button
                key={amt}
                onClick={() => setMonthlySalary(amt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  monthlySalary === amt
                    ? "bg-fingrow-lime text-fingrow-midnight ring-2 ring-white/20"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                ${amt / 1000}k/mo
              </button>
            ))}
            <button
              onClick={handleAutoBalance}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-fingrow-emerald hover:bg-fingrow-darkEmerald text-white transition-all flex items-center gap-1"
              title="Automatically distribute funds into ideal 50/30/20 proportions"
            >
              <Sparkles className="w-3.5 h-3.5 text-fingrow-lime" />
              <span>Auto-Balance 50/30/20</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 50/30/20 Health Bar & Status */}
      <div className="bg-white rounded-3xl p-6 border border-fingrow-midnight/10 shadow-finCard space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-fingrow-midnight">
              50/30/20 Rule Allocation Gauge
            </h3>
            <p className="text-xs text-fingrow-midnight/60">
              Needs (≤50%) • Wants (≤30%) • Freedom & Future (≥20%)
            </p>
          </div>
          <div className="text-xs font-bold">
            {unallocated === 0 ? (
              <span className="text-fingrow-emerald flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> 100% Balanced ({formatCurrency(totalAllocated)})
              </span>
            ) : unallocated > 0 ? (
              <span className="text-fingrow-tangerine flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {formatCurrency(unallocated)} Unallocated Left
              </span>
            ) : (
              <span className="text-fingrow-coral flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Overallocated by {formatCurrency(Math.abs(unallocated))}!
              </span>
            )}
          </div>
        </div>

        {/* Triple Segment Progress Bar */}
        <div className="h-4 w-full bg-fingrow-midnight/10 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${Math.min(100, needsPct)}%` }}
            className="bg-fingrow-emerald h-full transition-all duration-300"
            title={`Needs: ${needsPct}%`}
          />
          <div
            style={{ width: `${Math.min(100, wantsPct)}%` }}
            className="bg-fingrow-coral h-full transition-all duration-300"
            title={`Wants: ${wantsPct}%`}
          />
          <div
            style={{ width: `${Math.min(100, freedomPct)}%` }}
            className="bg-fingrow-lime h-full transition-all duration-300"
            title={`Freedom: ${freedomPct}%`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs">
          <div
            className={`p-2.5 rounded-xl font-bold transition-all ${
              needsPct <= 50
                ? "bg-fingrow-emerald/10 text-fingrow-emerald"
                : "bg-fingrow-coral/15 text-fingrow-coral"
            }`}
          >
            Needs: {needsPct}% {needsPct <= 50 ? "✓ (Target ≤50%)" : "⚠ Exceeds 50%"}
          </div>
          <div
            className={`p-2.5 rounded-xl font-bold transition-all ${
              wantsPct <= 30
                ? "bg-fingrow-coral/10 text-fingrow-coral"
                : "bg-fingrow-tangerine/20 text-[#8a4200]"
            }`}
          >
            Wants: {wantsPct}% {wantsPct <= 30 ? "✓ (Target ≤30%)" : "⚠ Exceeds 30%"}
          </div>
          <div
            className={`p-2.5 rounded-xl font-bold transition-all ${
              freedomPct >= 20
                ? "bg-fingrow-lime/20 text-[#2f5a00]"
                : "bg-fingrow-midnight/10 text-fingrow-midnight/70"
            }`}
          >
            Freedom: {freedomPct}% {freedomPct >= 20 ? "★ (Target ≥20%)" : "⚠ Below 20%"}
          </div>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Needs Column */}
        <Card className="border-t-4 border-t-fingrow-emerald">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-fingrow-midnight">Needs (50%)</h3>
                <span className="text-[11px] text-fingrow-midnight/60">Non-negotiable obligations</span>
              </div>
              <span className="text-sm font-extrabold text-fingrow-emerald">
                {formatCurrency(totalNeeds)}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Rent & Housing</span>
                  <span className="font-bold text-fingrow-midnight">{formatCurrency(rent)}</span>
                </div>
                <input
                  type="range"
                  min={600}
                  max={3500}
                  step={50}
                  value={rent}
                  onChange={(e) => setRent(Number(e.target.value))}
                  className="w-full accent-fingrow-emerald cursor-pointer"
                />
                <p className="text-[10px] text-fingrow-midnight/50">Base rent, tenant insurance & maintenance</p>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Groceries & Basic Utilities</span>
                  <span className="font-bold text-fingrow-midnight">{formatCurrency(groceriesUtilities)}</span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={1500}
                  step={50}
                  value={groceriesUtilities}
                  onChange={(e) => setGroceriesUtilities(Number(e.target.value))}
                  className="w-full accent-fingrow-emerald cursor-pointer"
                />
                <p className="text-[10px] text-fingrow-midnight/50">Electricity, home WiFi, water, staple foods</p>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Minimum Debt Payments</span>
                  <span className="font-bold text-fingrow-midnight">{formatCurrency(minimumDebt)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1200}
                  step={25}
                  value={minimumDebt}
                  onChange={(e) => setMinimumDebt(Number(e.target.value))}
                  className="w-full accent-fingrow-emerald cursor-pointer"
                />
                <p className="text-[10px] text-fingrow-midnight/50">Student loans, car loan, credit card minimums</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wants Column */}
        <Card className="border-t-4 border-t-fingrow-coral">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-fingrow-midnight">Wants (30%)</h3>
                <span className="text-[11px] text-fingrow-midnight/60">Lifestyle & enjoyment</span>
              </div>
              <span className="text-sm font-extrabold text-fingrow-coral">
                {formatCurrency(totalWants)}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Dining & Social Life</span>
                  <span className="font-bold text-fingrow-midnight">{formatCurrency(diningEntertainment)}</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={1800}
                  step={50}
                  value={diningEntertainment}
                  onChange={(e) => setDiningEntertainment(Number(e.target.value))}
                  className="w-full accent-fingrow-coral cursor-pointer"
                />
                <p className="text-[10px] text-fingrow-midnight/50">Restaurants, cafes, concerts, outings</p>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Hobbies, Gear & Streaming</span>
                  <span className="font-bold text-fingrow-midnight">{formatCurrency(hobbiesSubscriptions)}</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={1200}
                  step={25}
                  value={hobbiesSubscriptions}
                  onChange={(e) => setHobbiesSubscriptions(Number(e.target.value))}
                  className="w-full accent-fingrow-coral cursor-pointer"
                />
                <p className="text-[10px] text-fingrow-midnight/50">Subscriptions, sports gear, gaming, fashion</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Freedom Column */}
        <Card className="border-t-4 border-t-fingrow-lime">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-fingrow-midnight">Freedom (20%)</h3>
                <span className="text-[11px] text-fingrow-midnight/60">Reserves & Compound Wealth</span>
              </div>
              <span className="text-sm font-extrabold text-[#2f5a00]">
                {formatCurrency(totalFreedom)}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Emergency Fund Savings</span>
                  <span className="font-bold text-fingrow-midnight">{formatCurrency(emergencySavings)}</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={2000}
                  step={50}
                  value={emergencySavings}
                  onChange={(e) => setEmergencySavings(Number(e.target.value))}
                  className="w-full accent-[#3f7700] cursor-pointer"
                />
                <p className="text-[10px] text-fingrow-midnight/50">High-yield liquid savings buffer</p>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Index Fund & SIP Investments</span>
                  <span className="font-bold text-fingrow-midnight">{formatCurrency(investments)}</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={3000}
                  step={50}
                  value={investments}
                  onChange={(e) => setInvestments(Number(e.target.value))}
                  className="w-full accent-[#3f7700] cursor-pointer"
                />
                <p className="text-[10px] text-fingrow-midnight/50">Diversified broad equities for long-term compound</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outcome Analysis & Educational Trajectory */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-fingrow-midnight/10 shadow-finCard space-y-6">
        <div>
          <h3 className="font-bold text-xl text-fingrow-midnight">
            Financial Health & Compounding Projections
          </h3>
          <p className="text-xs text-fingrow-midnight/60">
            Educational projection based on your current virtual salary distribution:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-fingrow-ivory border border-fingrow-midnight/10 space-y-1.5">
            <span className="text-xs font-semibold text-fingrow-midnight/60 block">
              1-Year Emergency Safety Moat
            </span>
            <div className="text-2xl font-extrabold text-fingrow-midnight">
              {formatCurrency(emergencySavings * 12)}
            </div>
            <p className="text-xs text-fingrow-midnight/70 leading-relaxed">
              Provides <strong>{emergencyRunwayMonths} months</strong> of baseline living costs.
              {emergencyRunwayMonths >= 3 ? (
                <span className="text-fingrow-emerald block font-semibold mt-1">
                  ✓ Meets recommended 3-6 month safety threshold.
                </span>
              ) : (
                <span className="text-fingrow-tangerine block font-semibold mt-1">
                  ⚠ Below 3 months runway. Increase savings buffer.
                </span>
              )}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-fingrow-ivory border border-fingrow-midnight/10 space-y-1.5">
            <span className="text-xs font-semibold text-fingrow-midnight/60 block">
              1-Year Portfolio Capital (8% Assumed)
            </span>
            <div className="text-2xl font-extrabold text-fingrow-emerald">
              {formatCurrency(annualInvestmentGrowth)}
            </div>
            <p className="text-xs text-fingrow-midnight/70 leading-relaxed">
              {formatCurrency(investments * 12)} invested + {formatCurrency(annualInvestmentGrowth - investments * 12)} compound gains.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-fingrow-ivory border border-fingrow-midnight/10 space-y-1.5">
            <span className="text-xs font-semibold text-fingrow-midnight/60 block">
              5-Year Compound Growth
            </span>
            <div className="text-2xl font-extrabold text-[#2f5a00]">
              {formatCurrency(fiveYearInvestmentGrowth)}
            </div>
            <p className="text-xs text-fingrow-midnight/70 leading-relaxed">
              {formatCurrency(investments * 12 * 5)} total deposits yielding +{formatCurrency(fiveYearInvestmentGrowth - investments * 60)} in simulated returns.
            </p>
          </div>
        </div>

        {/* Practical Lesson Card */}
        <div className="p-4 rounded-2xl bg-fingrow-emerald/5 border border-fingrow-emerald/20 text-xs text-fingrow-midnight/80 space-y-1">
          <strong className="text-fingrow-midnight block font-bold">
            🎓 Practical First Salary Lesson:
          </strong>
          <p>
            When you land your first job, the natural temptation is lifestyle inflation—upgrading apartments, leasing a new vehicle, and dining out frequently. Keeping <strong>Needs strictly at or under 50%</strong> ensures you stay resilient during economic downturns, while automating <strong>20% to savings and index investments</strong> builds compounding wealth before lifestyle costs expand.
          </p>
        </div>

        {/* Action Buttons & Feedback */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-fingrow-midnight/60">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset to Defaults
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              disabled={saveStatus === "saving"}
              onClick={handleSaveSimulation}
              className="w-full sm:w-auto"
            >
              <span>{saveStatus === "saving" ? "Saving Record..." : "Save Simulation Run"}</span>
              <Sparkles className="w-4 h-4 ml-1.5 text-fingrow-lime" />
            </Button>
          </div>
        </div>

        {/* Notification Status Banner */}
        {saveStatus !== "idle" && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
              saveStatus === "saved"
                ? "bg-fingrow-emerald/10 text-fingrow-emerald border border-fingrow-emerald/20"
                : saveStatus === "unauthenticated"
                ? "bg-fingrow-tangerine/15 text-[#8a4200] border border-fingrow-tangerine/30"
                : "bg-fingrow-coral/15 text-fingrow-coral border border-fingrow-coral/30"
            }`}
          >
            <span>{saveMessage}</span>
            {saveStatus === "unauthenticated" && (
              <a href="/login" className="underline font-bold ml-2 hover:opacity-80">
                Log In Now
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
