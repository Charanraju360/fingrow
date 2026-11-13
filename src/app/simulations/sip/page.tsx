"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Calculator,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  Award,
  RotateCcw,
  Info,
  CheckCircle2,
  Percent,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { calculateSIP, formatCurrency, decimalRound, formatPercent } from "@/lib/utils";
import {
  VirtualDisclaimerBanner,
  VirtualFundsBadge,
} from "@/components/simulations/VirtualDisclaimer";

export default function SIPSimulatorPage() {
  const [monthlyAmount, setMonthlyAmount] = useState<number>(500);
  const [annualRate, setAnnualRate] = useState<number>(12);
  const [years, setYears] = useState<number>(15);
  const [adjustForInflation, setAdjustForInflation] = useState<boolean>(false);
  const [inflationRate, setInflationRate] = useState<number>(3.5);

  // Persistence
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error" | "unauthenticated">("idle");
  const [saveMessage, setSaveMessage] = useState<string>("");

  const nominalResult = calculateSIP(monthlyAmount, annualRate, years);

  // Real inflation-adjusted purchasing power: Real FV = Nominal FV / (1 + r_inf)^years
  const realFutureValue = adjustForInflation
    ? decimalRound(nominalResult.futureValue / Math.pow(1 + inflationRate / 100, years), 2)
    : nominalResult.futureValue;

  const realWealthGain = adjustForInflation
    ? decimalRound(realFutureValue - nominalResult.totalInvested, 2)
    : nominalResult.wealthGain;

  // Rule of 72 doubling period
  const doublingYears = annualRate > 0 ? decimalRound(72 / annualRate, 1) : "N/A";

  // Calculate year when interest overtakes principal
  let crossoverYear: number | null = null;
  for (let y = 1; y <= 40; y++) {
    const s = calculateSIP(monthlyAmount, annualRate, y);
    if (s.wealthGain >= s.totalInvested) {
      crossoverYear = y;
      break;
    }
  }

  // Milestones table across horizons
  const milestoneYears = [5, 10, 15, 20, 25, 30, 35];
  const milestones = milestoneYears.map((y) => {
    const r = calculateSIP(monthlyAmount, annualRate, y);
    const adjustedVal = adjustForInflation
      ? decimalRound(r.futureValue / Math.pow(1 + inflationRate / 100, y), 2)
      : r.futureValue;
    const adjustedGain = adjustForInflation
      ? decimalRound(adjustedVal - r.totalInvested, 2)
      : r.wealthGain;
    return {
      year: y,
      totalInvested: r.totalInvested,
      wealthGain: adjustedGain,
      futureValue: adjustedVal,
    };
  });

  function handleReset() {
    setMonthlyAmount(500);
    setAnnualRate(12);
    setYears(15);
    setAdjustForInflation(false);
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
          scenarioType: "sip_growth",
          initialBalance: monthlyAmount * 12 * years,
          parameters: {
            monthlyAmount,
            annualRate,
            years,
            adjustForInflation,
            inflationRate,
            nominalFutureValue: nominalResult.futureValue,
            realFutureValue,
            totalInvested: nominalResult.totalInvested,
            wealthGain: realWealthGain,
          },
        }),
      });

      if (res.status === 401) {
        setSaveStatus("unauthenticated");
        setSaveMessage("Please sign in to record SIP projections to your profile.");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to save simulation");
      }

      setSaveStatus("saved");
      setSaveMessage("SIP simulation run saved to your FinGrow profile!");
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
          <Badge variant="emerald" size="sm">SIMULATION 4 OF 5</Badge>
          <VirtualFundsBadge />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-fingrow-midnight tracking-tight">
          Systematic Investment Plan (SIP) Wealth Projector
        </h1>
        <p className="text-sm text-fingrow-midnight/70 leading-relaxed max-w-2xl">
          Experience the exponential mechanics of monthly compounding and dollar-cost averaging. See when compounding interest overtakes personal deposits, and adjust for inflation to see true future purchasing power.
        </p>
      </div>

      {/* Virtual Disclaimer Banner */}
      <VirtualDisclaimerBanner
        scenarioName="SIP Compounding Engine"
        assumptions={[
          "Future Value calculation uses standard compound annuity formula: FV = P × [((1+i)^n - 1) / i] × (1+i), compounded monthly.",
          "Expected annual return rates represent nominal long-term index averages; actual equity market returns fluctuate year-to-year.",
          "Mutual funds are subject to market risks. FinGrow does not sell securities, funds, or manage client capital.",
          "Inflation adjustment uses standard discounted purchasing power calculations based on constant annual inflation.",
        ]}
      />

      {/* Main Controls & Summary Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sliders Card */}
        <Card className="lg:col-span-1 border-fingrow-midnight/15 shadow-sm space-y-6 p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-fingrow-midnight">
              <span>Monthly Virtual Investment</span>
              <span className="text-fingrow-emerald font-extrabold">{formatCurrency(monthlyAmount)}</span>
            </div>
            <input
              type="range"
              min={50}
              max={3000}
              step={50}
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Number(e.target.value))}
              className="w-full accent-fingrow-emerald cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-fingrow-midnight/50">
              <span>$50/mo</span>
              <span>$1,500/mo</span>
              <span>$3,000/mo</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-fingrow-midnight">
              <span>Expected Annual Return Rate</span>
              <span className="text-fingrow-emerald font-extrabold">{annualRate}%</span>
            </div>
            <input
              type="range"
              min={2}
              max={18}
              step={1}
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className="w-full accent-fingrow-emerald cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-fingrow-midnight/50">
              <span>5% (Treasuries)</span>
              <span>10-12% (Index ETF)</span>
              <span>16% (Aggressive)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-fingrow-midnight">
              <span>Time Horizon (Years)</span>
              <span className="text-fingrow-emerald font-extrabold">{years} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={35}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-fingrow-emerald cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-fingrow-midnight/50">
              <span>1 Year</span>
              <span>15 Years</span>
              <span>35 Years</span>
            </div>
          </div>

          {/* Inflation Toggle */}
          <div className="pt-4 border-t border-fingrow-midnight/10 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-fingrow-midnight">
              <input
                type="checkbox"
                checked={adjustForInflation}
                onChange={(e) => setAdjustForInflation(e.target.checked)}
                className="w-4 h-4 rounded text-fingrow-emerald accent-fingrow-emerald"
              />
              <span>Adjust for Inflation (Real Value)</span>
            </label>

            {adjustForInflation && (
              <div className="space-y-1.5 pl-6">
                <div className="flex justify-between text-[11px] font-semibold text-fingrow-midnight/70">
                  <span>Assumed Annual Inflation</span>
                  <span>{inflationRate}%</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={8}
                  step={0.5}
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="w-full accent-fingrow-coral cursor-pointer"
                />
                <p className="text-[10px] text-fingrow-midnight/50">
                  Shows today&apos;s purchasing power equivalent after {inflationRate}% annual price inflation.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Results Hero Card */}
        <div className="lg:col-span-2 bg-fingrow-midnight text-white rounded-3xl p-8 flex flex-col justify-between shadow-xl border border-white/10 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-fingrow-lime">
                {adjustForInflation ? "Real Purchasing Power (Inflation-Adjusted)" : "Nominal Wealth Projection"} at {years} Years
              </span>
              <VirtualFundsBadge className="border-white/20 text-fingrow-lime bg-white/10" />
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold text-white">
              {formatCurrency(realFutureValue)}
            </div>
            <p className="text-xs text-white/60">
              Monthly contribution of {formatCurrency(monthlyAmount)} over {years * 12} continuous monthly installments.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
            <div className="space-y-1">
              <span className="text-xs text-white/60">Total Deposited Principal</span>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {formatCurrency(nominalResult.totalInvested)}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-white/60">
                {adjustForInflation ? "Real Wealth Gain (After Inflation)" : "Estimated Compound Wealth Gain"}
              </span>
              <div
                className={`text-xl sm:text-2xl font-bold ${
                  realWealthGain >= 0 ? "text-fingrow-lime" : "text-fingrow-coral"
                }`}
              >
                {realWealthGain >= 0 ? `+${formatCurrency(realWealthGain)}` : formatCurrency(realWealthGain)}
              </div>
            </div>
          </div>

          {/* Inflection point & Rule of 72 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-white/5 rounded-xl text-xs space-y-1">
              <div className="font-bold text-fingrow-lime flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Rule of 72 Doubling Time
              </div>
              <p className="text-white/70 text-[11px]">
                At {annualRate}% annual return, your invested capital doubles approximately every{" "}
                <strong className="text-white">{doublingYears} years</strong>.
              </p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl text-xs space-y-1">
              <div className="font-bold text-fingrow-lime flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Compounding Inflection Point
              </div>
              <p className="text-white/70 text-[11px]">
                {crossoverYear ? (
                  <>
                    By <strong className="text-white">Year {crossoverYear}</strong>, compound interest earned permanently exceeds your out-of-pocket deposits!
                  </>
                ) : (
                  "Increase rate or horizon to reach the compounding tipping point."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Compounding Milestones Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-fingrow-midnight/10 shadow-finCard space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-xl text-fingrow-midnight">
              The Compounding Acceleration Matrix
            </h3>
            <p className="text-xs text-fingrow-midnight/70">
              Notice how compounding interest scales non-linearly over decades:
            </p>
          </div>
          <Badge variant="emerald" size="sm">
            {adjustForInflation ? `Adjusted @ ${inflationRate}% Inflation` : "Nominal Face Value"}
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-fingrow-midnight/10 text-fingrow-midnight/60 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Timeline</th>
                <th className="py-3 px-4">Total Deposited</th>
                <th className="py-3 px-4">Compound Interest Earned</th>
                <th className="py-3 px-4">Portfolio Valuation</th>
                <th className="py-3 px-4">Ratio (Wealth / Cost)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fingrow-midnight/5 font-medium">
              {milestones.map((m) => {
                const ratio = m.totalInvested > 0 ? (m.futureValue / m.totalInvested).toFixed(2) : "1.00";
                return (
                  <tr
                    key={m.year}
                    className={`transition-colors ${
                      m.year === years
                        ? "bg-fingrow-emerald/15 font-bold"
                        : "hover:bg-fingrow-ivory"
                    }`}
                  >
                    <td className="py-3 px-4 text-fingrow-midnight font-bold">
                      Year {m.year} {m.year === years ? "★ (Selected)" : ""}
                    </td>
                    <td className="py-3 px-4 text-fingrow-midnight/70">{formatCurrency(m.totalInvested)}</td>
                    <td className="py-3 px-4 text-fingrow-emerald font-semibold">
                      +{formatCurrency(m.wealthGain)}
                    </td>
                    <td className="py-3 px-4 font-bold text-fingrow-midnight">{formatCurrency(m.futureValue)}</td>
                    <td className="py-3 px-4 font-mono text-fingrow-midnight/80">{ratio}x</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-fingrow-midnight/10">
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-fingrow-midnight/60">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Inputs
          </Button>

          <Button
            variant="primary"
            size="lg"
            disabled={saveStatus === "saving"}
            onClick={handleSaveSimulation}
            className="w-full sm:w-auto"
          >
            <span>{saveStatus === "saving" ? "Saving..." : "Save SIP Projection"}</span>
            <Sparkles className="w-4 h-4 ml-1.5 text-fingrow-lime" />
          </Button>
        </div>

        {/* Status Notification Banner */}
        {saveStatus !== "idle" && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold ${
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
