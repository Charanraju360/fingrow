"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  TrendingUp,
  ShieldCheck,
  PieChart,
  DollarSign,
  Sparkles,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercent, decimalRound } from "@/lib/utils";
import {
  VirtualDisclaimerBanner,
  VirtualFundsBadge,
} from "@/components/simulations/VirtualDisclaimer";

interface Scenario {
  label: string;
  badge: string;
  indexReturn: number;
  techReturn: number;
  bondsReturn: number;
  cashReturn: number;
  summary: string;
  lessonTakeaway: string;
}

interface ScenarioOutcome {
  finalTotal: number;
  gainLoss: number;
  gainLossPct: number;
  summary: string;
  lessonTakeaway: string;
  breakdown: {
    asset: string;
    start: number;
    rate: number;
    delta: number;
    final: number;
  }[];
}

export default function InvestmentChallengePage() {
  const TOTAL_CAPITAL = 50000;

  const [indexAllocation, setIndexAllocation] = useState<number>(50); // %
  const [techAllocation, setTechAllocation] = useState<number>(20);
  const [bondsAllocation, setBondsAllocation] = useState<number>(20);
  const [cashAllocation, setCashAllocation] = useState<number>(10);

  const [activeScenario, setActiveScenario] = useState<string | null>("recession");

  // Persistence
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error" | "unauthenticated">("idle");
  const [saveMessage, setSaveMessage] = useState<string>("");

  const totalPct = indexAllocation + techAllocation + bondsAllocation + cashAllocation;

  // Decimal-safe dollar allocations
  const indexAmount = decimalRound((TOTAL_CAPITAL * indexAllocation) / 100, 2);
  const techAmount = decimalRound((TOTAL_CAPITAL * techAllocation) / 100, 2);
  const bondsAmount = decimalRound((TOTAL_CAPITAL * bondsAllocation) / 100, 2);
  const cashAmount = decimalRound((TOTAL_CAPITAL * cashAllocation) / 100, 2);

  // Preset Allocation Portfolios
  function applyPreset(preset: "allWeather" | "aggressive" | "conservative" | "equal") {
    if (preset === "allWeather") {
      setIndexAllocation(35);
      setTechAllocation(15);
      setBondsAllocation(35);
      setCashAllocation(15);
    } else if (preset === "aggressive") {
      setIndexAllocation(60);
      setTechAllocation(30);
      setBondsAllocation(5);
      setCashAllocation(5);
    } else if (preset === "conservative") {
      setIndexAllocation(25);
      setTechAllocation(10);
      setBondsAllocation(50);
      setCashAllocation(15);
    } else if (preset === "equal") {
      setIndexAllocation(25);
      setTechAllocation(25);
      setBondsAllocation(25);
      setCashAllocation(25);
    }
  }

  // Scenarios with transparent returns
  const scenarios: Record<string, Scenario> = {
    boom: {
      label: "Tech Expansion & Bull Market",
      badge: "BULL RUN",
      indexReturn: 0.14,
      techReturn: 0.32,
      bondsReturn: -0.02,
      cashReturn: 0.04,
      summary: "Corporate profits beat estimates, risk appetite is high, and innovative technology firms lead rapid capital expansion.",
      lessonTakeaway: "In bull markets, equities outshine fixed income. However, holding all your money in tech exposes you to extreme drawdowns during subsequent corrections.",
    },
    recession: {
      label: "Global Recession & Bear Market",
      badge: "BEAR MARKET",
      indexReturn: -0.22,
      techReturn: -0.38,
      bondsReturn: 0.12,
      cashReturn: 0.04,
      summary: "Macroeconomic deceleration triggers a broad equity selloff. Investors flee risk assets to sovereign treasury bonds and cash.",
      lessonTakeaway: "Notice how government bonds appreciated (+12%) and cash buffered capital, cutting the total portfolio loss compared to an all-stock portfolio (-38%).",
    },
    inflation: {
      label: "Stagflation & Central Bank Rate Hikes",
      badge: "RATE SHOCK",
      indexReturn: -0.08,
      techReturn: -0.20,
      bondsReturn: -0.05,
      cashReturn: 0.05,
      summary: "Stubborn supply inflation forces aggressive central bank interest rate hikes, depressing high-multiple tech valuations and existing bonds.",
      lessonTakeaway: "Cash yield increases to 5% during rate hikes, providing purchasing safety when both equities and long-duration bonds face simultaneous headwinds.",
    },
    steady: {
      label: "Steady Balanced Growth",
      badge: "EQUILIBRIUM",
      indexReturn: 0.09,
      techReturn: 0.15,
      bondsReturn: 0.04,
      cashReturn: 0.035,
      summary: "Moderate GDP growth, normalized 2% inflation, and solid corporate earnings yield steady returns across all asset classes.",
      lessonTakeaway: "In balanced economic climates, broad index funds provide reliable compound growth without the extreme volatility of individual stock picking.",
    },
  };

  // Calculate scenario outcomes
  let scenarioOutcome: ScenarioOutcome | null = null;
  if (activeScenario && scenarios[activeScenario] && totalPct === 100) {
    const s = scenarios[activeScenario];
    const newIndex = decimalRound(indexAmount * (1 + s.indexReturn), 2);
    const newTech = decimalRound(techAmount * (1 + s.techReturn), 2);
    const newBonds = decimalRound(bondsAmount * (1 + s.bondsReturn), 2);
    const newCash = decimalRound(cashAmount * (1 + s.cashReturn), 2);
    const finalTotal = decimalRound(newIndex + newTech + newBonds + newCash, 2);
    const gainLoss = decimalRound(finalTotal - TOTAL_CAPITAL, 2);
    const gainLossPct = decimalRound((gainLoss / TOTAL_CAPITAL) * 100, 2);

    scenarioOutcome = {
      finalTotal,
      gainLoss,
      gainLossPct,
      summary: s.summary,
      lessonTakeaway: s.lessonTakeaway,
      breakdown: [
        {
          asset: "Broad Index Fund",
          start: indexAmount,
          rate: s.indexReturn,
          delta: decimalRound(newIndex - indexAmount, 2),
          final: newIndex,
        },
        {
          asset: "Tech Growth Equities",
          start: techAmount,
          rate: s.techReturn,
          delta: decimalRound(newTech - techAmount, 2),
          final: newTech,
        },
        {
          asset: "Treasury Bonds",
          start: bondsAmount,
          rate: s.bondsReturn,
          delta: decimalRound(newBonds - bondsAmount, 2),
          final: newBonds,
        },
        {
          asset: "Liquid Cash Reserves",
          start: cashAmount,
          rate: s.cashReturn,
          delta: decimalRound(newCash - cashAmount, 2),
          final: newCash,
        },
      ],
    };
  }

  // Diversification Score & Evaluation
  const isWellDiversified =
    indexAllocation >= 25 &&
    bondsAllocation >= 15 &&
    cashAllocation >= 5 &&
    techAllocation <= 35 &&
    totalPct === 100;

  async function handleSaveSimulation() {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/simulations/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          scenarioType: "investment_challenge",
          initialBalance: TOTAL_CAPITAL,
          parameters: {
            indexAllocation,
            techAllocation,
            bondsAllocation,
            cashAllocation,
            activeScenario,
            finalValuation: scenarioOutcome?.finalTotal || TOTAL_CAPITAL,
            gainLossPct: scenarioOutcome?.gainLossPct || 0,
          },
        }),
      });

      if (res.status === 401) {
        setSaveStatus("unauthenticated");
        setSaveMessage("Please log in to save portfolio simulation runs to your profile.");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to save simulation");
      }

      setSaveStatus("saved");
      setSaveMessage("Investment Challenge portfolio saved to your FinGrow profile!");
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
          <Badge variant="emerald" size="sm">SIMULATION 3 OF 5</Badge>
          <VirtualFundsBadge />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-fingrow-midnight tracking-tight">
          $50,000 Virtual Investment Challenge
        </h1>
        <p className="text-sm text-fingrow-midnight/70 leading-relaxed max-w-2xl">
          Construct a balanced multi-asset portfolio. Stress-test your capital across 4 distinct economic regimes—bull run, bear market, stagflation, and steady expansion—to see firsthand how asset allocation reduces drawdown risk.
        </p>
      </div>

      {/* Virtual Disclaimer Banner */}
      <VirtualDisclaimerBanner
        scenarioName="Virtual Investment Challenge"
        assumptions={[
          "Starting balance of $50,000 consists entirely of simulated virtual currency. No real brokerage or financial trading is executed.",
          "Scenario returns are historically modeled approximations of how asset classes correlate during economic expansion and recession.",
          "Past simulated market cycles do not guarantee or predict future real-world asset price movements.",
          "Diversification mitigates single-asset drawdown risk, but does not guarantee against portfolio loss.",
        ]}
      />

      {/* Starting Capital & Allocation Status Card */}
      <Card className="bg-fingrow-midnight text-white border-0 shadow-xl">
        <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-fingrow-lime">
                Virtual Portfolio Starting Capital
              </span>
              <VirtualFundsBadge />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {formatCurrency(TOTAL_CAPITAL)}
            </div>
            <p className="text-xs text-white/60">
              Total Weight:{" "}
              <strong className={totalPct === 100 ? "text-fingrow-lime" : "text-fingrow-coral font-bold"}>
                {totalPct}% {totalPct === 100 ? "✓ (Balanced)" : `(${100 - totalPct}% remaining)`}
              </strong>
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <Badge variant={isWellDiversified ? "lime" : "yellow"} size="sm">
              {isWellDiversified ? "★ BALANCED ASSET CORRELATION" : "⚠ CONCENTRATED RISK WARNING"}
            </Badge>
            <p className="text-xs text-white/60">
              {isWellDiversified
                ? "Excellent mix of growth equities, hedging bonds, and cash cushion."
                : "Heavily skewed portfolio. Consider rebalancing weights across bonds & cash."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preset Portfolio Quick Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-fingrow-midnight/70 mr-1 flex items-center gap-1">
          <PieChart className="w-3.5 h-3.5 text-fingrow-emerald" />
          Model Portfolios:
        </span>
        <button
          onClick={() => applyPreset("allWeather")}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-fingrow-midnight/15 hover:border-fingrow-emerald hover:bg-fingrow-emerald/5 transition-all text-fingrow-midnight"
        >
          All-Weather (35/15/35/15)
        </button>
        <button
          onClick={() => applyPreset("aggressive")}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-fingrow-midnight/15 hover:border-fingrow-emerald hover:bg-fingrow-emerald/5 transition-all text-fingrow-midnight"
        >
          Aggressive Growth (60/30/5/5)
        </button>
        <button
          onClick={() => applyPreset("conservative")}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-fingrow-midnight/15 hover:border-fingrow-emerald hover:bg-fingrow-emerald/5 transition-all text-fingrow-midnight"
        >
          Conservative Income (25/10/50/15)
        </button>
        <button
          onClick={() => applyPreset("equal")}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-fingrow-midnight/15 hover:border-fingrow-emerald hover:bg-fingrow-emerald/5 transition-all text-fingrow-midnight"
        >
          Equal Weight (25/25/25/25)
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Index Funds */}
        <Card className="border-t-4 border-t-fingrow-emerald">
          <CardContent className="pt-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-fingrow-emerald uppercase">Broad Index Fund</span>
              <span className="text-xs font-bold text-fingrow-midnight">{indexAllocation}%</span>
            </div>
            <div className="text-xl font-extrabold text-fingrow-midnight">
              {formatCurrency(indexAmount)}
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={indexAllocation}
              onChange={(e) => setIndexAllocation(Number(e.target.value))}
              className="w-full accent-fingrow-emerald cursor-pointer"
            />
            <p className="text-[11px] text-fingrow-midnight/60">S&P 500 / Global All-Cap ETF</p>
          </CardContent>
        </Card>

        {/* Tech Growth */}
        <Card className="border-t-4 border-t-fingrow-coral">
          <CardContent className="pt-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-fingrow-coral uppercase">Tech Growth Stocks</span>
              <span className="text-xs font-bold text-fingrow-midnight">{techAllocation}%</span>
            </div>
            <div className="text-xl font-extrabold text-fingrow-midnight">
              {formatCurrency(techAmount)}
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={techAllocation}
              onChange={(e) => setTechAllocation(Number(e.target.value))}
              className="w-full accent-fingrow-coral cursor-pointer"
            />
            <p className="text-[11px] text-fingrow-midnight/60">High volatility, high upside potential</p>
          </CardContent>
        </Card>

        {/* Treasury Bonds */}
        <Card className="border-t-4 border-t-[#3f7700]">
          <CardContent className="pt-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#3f7700] uppercase">Treasury Bonds</span>
              <span className="text-xs font-bold text-fingrow-midnight">{bondsAllocation}%</span>
            </div>
            <div className="text-xl font-extrabold text-fingrow-midnight">
              {formatCurrency(bondsAmount)}
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={bondsAllocation}
              onChange={(e) => setBondsAllocation(Number(e.target.value))}
              className="w-full accent-[#3f7700] cursor-pointer"
            />
            <p className="text-[11px] text-fingrow-midnight/60">Fixed yield, capital preservation hedge</p>
          </CardContent>
        </Card>

        {/* Cash Reserves */}
        <Card className="border-t-4 border-t-fingrow-midnight">
          <CardContent className="pt-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-fingrow-midnight/70 uppercase">Liquid Cash / MM</span>
              <span className="text-xs font-bold text-fingrow-midnight">{cashAllocation}%</span>
            </div>
            <div className="text-xl font-extrabold text-fingrow-midnight">
              {formatCurrency(cashAmount)}
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={cashAllocation}
              onChange={(e) => setCashAllocation(Number(e.target.value))}
              className="w-full accent-fingrow-midnight cursor-pointer"
            />
            <p className="text-[11px] text-fingrow-midnight/60">Risk-free rate, dry powder for dips</p>
          </CardContent>
        </Card>
      </div>

      {/* Stress-Test Market Scenarios */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-fingrow-midnight/10 shadow-finCard space-y-6">
        <div className="space-y-1">
          <h3 className="font-bold text-xl text-fingrow-midnight">
            Stress-Test Market Scenarios
          </h3>
          <p className="text-xs text-fingrow-midnight/70">
            Select an economic condition to simulate how your allocated portfolio behaves:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(scenarios).map(([key, sc]) => (
            <button
              key={key}
              type="button"
              disabled={totalPct !== 100}
              onClick={() => setActiveScenario(key)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeScenario === key
                  ? "border-fingrow-emerald bg-fingrow-emerald/5 ring-2 ring-fingrow-emerald/20"
                  : "border-fingrow-midnight/15 hover:border-fingrow-midnight/30 bg-white"
              } ${totalPct !== 100 ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <Badge variant={key === "boom" ? "lime" : key === "recession" ? "coral" : "emerald"} size="sm">
                  {sc.badge}
                </Badge>
              </div>
              <div className="font-bold text-sm text-fingrow-midnight">{sc.label}</div>
              <p className="text-[11px] text-fingrow-midnight/60 mt-1 line-clamp-2">{sc.summary}</p>
            </button>
          ))}
        </div>

        {totalPct !== 100 && (
          <div className="p-3.5 rounded-xl bg-fingrow-coral/10 text-fingrow-coral text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              Your allocations total <strong>{totalPct}%</strong>. Please adjust sliders so asset weights equal exactly 100% to run scenario testing.
            </span>
          </div>
        )}

        {scenarioOutcome && (
          <div className="p-6 rounded-2xl bg-fingrow-ivory border border-fingrow-midnight/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-fingrow-midnight/60 uppercase">
                  Simulated Portfolio Valuation After Scenario
                </span>
                <div className="text-3xl font-extrabold text-fingrow-midnight">
                  {formatCurrency(scenarioOutcome.finalTotal)}
                </div>
              </div>

              <div
                className={`text-lg font-extrabold px-4 py-2 rounded-xl self-start sm:self-auto ${
                  scenarioOutcome.gainLoss >= 0
                    ? "bg-fingrow-emerald/15 text-fingrow-emerald"
                    : "bg-fingrow-coral/15 text-fingrow-coral"
                }`}
              >
                {formatPercent(scenarioOutcome.gainLossPct)} ({formatCurrency(scenarioOutcome.gainLoss)})
              </div>
            </div>

            {/* Asset Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-fingrow-midnight/10 text-fingrow-midnight/60 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Asset Class</th>
                    <th className="py-2.5 px-3">Starting Value</th>
                    <th className="py-2.5 px-3">Simulated Return</th>
                    <th className="py-2.5 px-3">Dollar Delta</th>
                    <th className="py-2.5 px-3">Ending Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fingrow-midnight/5 font-medium">
                  {scenarioOutcome.breakdown.map((row, i) => (
                    <tr key={i} className="hover:bg-white/40">
                      <td className="py-2.5 px-3 font-bold text-fingrow-midnight">{row.asset}</td>
                      <td className="py-2.5 px-3 text-fingrow-midnight/70">{formatCurrency(row.start)}</td>
                      <td
                        className={`py-2.5 px-3 font-semibold ${
                          row.rate >= 0 ? "text-fingrow-emerald" : "text-fingrow-coral"
                        }`}
                      >
                        {formatPercent(row.rate * 100)}
                      </td>
                      <td
                        className={`py-2.5 px-3 font-semibold ${
                          row.delta >= 0 ? "text-fingrow-emerald" : "text-fingrow-coral"
                        }`}
                      >
                        {row.delta >= 0 ? `+${formatCurrency(row.delta)}` : formatCurrency(row.delta)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-fingrow-midnight">{formatCurrency(row.final)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Educational Lesson Card */}
            <div className="p-4 rounded-xl bg-white border border-fingrow-midnight/10 text-xs text-fingrow-midnight/80 space-y-1">
              <strong className="text-fingrow-midnight block font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-fingrow-emerald" />
                Key Investment Takeaway:
              </strong>
              <p className="leading-relaxed">{scenarioOutcome.lessonTakeaway}</p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applyPreset("allWeather")}
                className="text-xs text-fingrow-midnight/60"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset to All-Weather Model
              </Button>

              <Button
                variant="primary"
                size="lg"
                disabled={saveStatus === "saving"}
                onClick={handleSaveSimulation}
                className="w-full sm:w-auto"
              >
                <span>{saveStatus === "saving" ? "Saving..." : "Save Portfolio Run"}</span>
                <Sparkles className="w-4 h-4 ml-1.5 text-fingrow-lime" />
              </Button>
            </div>

            {/* Status notification banner */}
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
        )}
      </div>
    </div>
  );
}
