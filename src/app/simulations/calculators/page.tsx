"use client";

import React, { useState, useId } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calculator,
  TrendingUp,
  DollarSign,
  Percent,
  Clock,
  Sparkles,
  ShieldAlert,
  Info,
  Calendar,
  ArrowUpRight,
  HelpCircle,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  PiggyBank,
  Home,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  calculateCompoundInterest,
  getCompoundInterestSchedule,
  calculateSIP,
  getSIPSchedule,
  calculateEMI,
  getEMIAmortizationSchedule,
  calculateInflationImpact,
  getInflationSchedule,
  formatCurrency,
  formatNumber,
  formatPercent,
  decimalRound,
} from "@/lib/utils";

// -----------------------------------------------------------------------------
// REUSABLE SYNCHRONIZED SLIDER & NUMERIC INPUT COMPONENT
// -----------------------------------------------------------------------------
interface SynchronizedControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
  onChange: (val: number) => void;
  presets?: { label: string; value: number }[];
}

function SynchronizedControl({
  label,
  value,
  min,
  max,
  step,
  prefix = "",
  suffix = "",
  hint,
  onChange,
  presets,
}: SynchronizedControlProps) {
  const inputId = useId();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange(0);
      return;
    }
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      onChange(Math.max(0, parsed));
    }
  };

  return (
    <div className="space-y-2 p-3.5 bg-fingrow-ivory/60 rounded-xl border border-fingrow-midnight/10 transition-colors hover:border-fingrow-emerald/30">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-xs font-bold text-fingrow-midnight flex items-center gap-1.5">
          <span>{label}</span>
          {hint && (
            <span className="text-[10px] font-normal text-fingrow-midnight/50 hidden sm:inline">
              ({hint})
            </span>
          )}
        </label>

        {/* Synchronized Direct Number Input Box */}
        <div className="flex items-center rounded-lg border border-fingrow-midnight/20 bg-white px-2 py-1 shadow-inner focus-within:ring-2 focus-within:ring-fingrow-emerald focus-within:border-transparent">
          {prefix && <span className="text-xs font-semibold text-fingrow-midnight/60 mr-1">{prefix}</span>}
          <input
            id={inputId}
            type="number"
            min={min}
            max={max * 2} // allow entering values beyond standard slider max
            step={step}
            value={value}
            onChange={handleInputChange}
            className="w-20 text-right text-xs font-bold text-fingrow-midnight focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {suffix && <span className="text-xs font-semibold text-fingrow-midnight/60 ml-1">{suffix}</span>}
        </div>
      </div>

      {/* Synchronized Range Slider */}
      <div className="pt-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(max, Math.max(min, value))}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-fingrow-midnight/15 rounded-lg appearance-none cursor-pointer accent-fingrow-emerald focus:outline-none focus:ring-2 focus:ring-fingrow-emerald/40"
        />
        <div className="flex justify-between text-[10px] text-fingrow-midnight/45 font-medium mt-1">
          <span>{prefix}{formatNumber(min)}{suffix}</span>
          <span>{prefix}{formatNumber(max)}{suffix}</span>
        </div>
      </div>

      {/* Preset Chips */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange(p.value)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                value === p.value
                  ? "bg-fingrow-emerald text-white shadow-xs"
                  : "bg-white text-fingrow-midnight/70 border border-fingrow-midnight/10 hover:bg-fingrow-emerald/10 hover:text-fingrow-emerald"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// MAIN PAGE COMPONENT
// -----------------------------------------------------------------------------
export default function FinancialCalculatorsPage() {
  const [activeTab, setActiveTab] = useState<"compound" | "sip" | "emi" | "inflation">("compound");
  const [copied, setCopied] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  // 1. COMPOUND INTEREST STATE
  const [ciPrincipal, setCiPrincipal] = useState(10000);
  const [ciRate, setCiRate] = useState(8);
  const [ciYears, setCiYears] = useState(10);
  const [ciCompoundsPerYear, setCiCompoundsPerYear] = useState(12);

  const ciResult = calculateCompoundInterest(ciPrincipal, ciRate, ciYears, ciCompoundsPerYear);
  const ciSchedule = getCompoundInterestSchedule(ciPrincipal, ciRate, ciYears, ciCompoundsPerYear);
  const ciYearsToDouble = ciRate > 0 ? (72 / ciRate).toFixed(1) : "N/A";
  const ciInterestRatio = ciPrincipal > 0 ? (ciResult.interestEarned / ciPrincipal).toFixed(2) : "0";
  const ciInterestPct = ciResult.totalAmount > 0
    ? Math.round((ciResult.interestEarned / ciResult.totalAmount) * 100)
    : 0;

  // 2. SIP WEALTH STATE
  const [sipMonthly, setSipMonthly] = useState(500);
  const [sipRate, setSipRate] = useState(12);
  const [sipYears, setSipYears] = useState(15);

  const sipResult = calculateSIP(sipMonthly, sipRate, sipYears);
  const sipSchedule = getSIPSchedule(sipMonthly, sipRate, sipYears);
  const sipMultiplier = sipResult.totalInvested > 0
    ? (sipResult.futureValue / sipResult.totalInvested).toFixed(2)
    : "1.00";
  const sipGainPct = sipResult.futureValue > 0
    ? Math.round((sipResult.wealthGain / sipResult.futureValue) * 100)
    : 0;
  // Delay cost: what if you wait 5 years?
  const sipDelayedResult = sipYears > 5 ? calculateSIP(sipMonthly, sipRate, sipYears - 5) : null;
  const sipCostOfWaiting = sipDelayedResult
    ? Math.max(0, sipResult.futureValue - sipDelayedResult.futureValue)
    : 0;

  // 3. LOAN EMI STATE
  const [emiPrincipal, setEmiPrincipal] = useState(250000);
  const [emiRate, setEmiRate] = useState(6.5);
  const [emiYears, setEmiYears] = useState(30);

  const emiResult = calculateEMI(emiPrincipal, emiRate, emiYears);
  const emiSchedule = getEMIAmortizationSchedule(emiPrincipal, emiRate, emiYears);
  const emiInterestRatio = emiPrincipal > 0
    ? (emiResult.totalInterest / emiPrincipal).toFixed(2)
    : "0";
  const emiPrincipalPct = emiResult.totalPayment > 0
    ? Math.round((emiPrincipal / emiResult.totalPayment) * 100)
    : 100;

  // 4. INFLATION STATE
  const [infCost, setInfCost] = useState(50000);
  const [infRate, setInfRate] = useState(4);
  const [infYears, setInfYears] = useState(15);

  const infResult = calculateInflationImpact(infCost, infRate, infYears);
  const infSchedule = getInflationSchedule(infCost, infRate, infYears);
  const infDollarTodayValue = infResult.futureCost > 0
    ? (infCost / infResult.futureCost).toFixed(2)
    : "1.00";

  // COPY CURRENT CALCULATION SUMMARY
  const handleCopySummary = () => {
    let text = "";
    if (activeTab === "compound") {
      text = `FinGrow Compound Interest Summary:
Principal: ${formatCurrency(ciPrincipal)}
Annual Rate: ${ciRate}% (Compounded ${ciCompoundsPerYear === 12 ? "Monthly" : ciCompoundsPerYear === 1 ? "Annually" : ciCompoundsPerYear === 4 ? "Quarterly" : "Daily"})
Duration: ${ciYears} Years
Future Balance: ${formatCurrency(ciResult.totalAmount)}
Interest Accrued: +${formatCurrency(ciResult.interestEarned)} (${ciInterestRatio}x original deposit)
Rule of 72: Doubles every ~${ciYearsToDouble} years.`;
    } else if (activeTab === "sip") {
      text = `FinGrow SIP Wealth Summary:
Monthly Deposit: ${formatCurrency(sipMonthly)}
Expected Annual Return: ${sipRate}%
Tenure: ${sipYears} Years
Total Invested: ${formatCurrency(sipResult.totalInvested)}
Terminal Wealth: ${formatCurrency(sipResult.futureValue)}
Wealth Gain: +${formatCurrency(sipResult.wealthGain)} (${sipMultiplier}x invested)`;
    } else if (activeTab === "emi") {
      text = `FinGrow Loan EMI Summary:
Principal: ${formatCurrency(emiPrincipal)}
Interest Rate: ${emiRate}%
Tenure: ${emiYears} Years
Monthly EMI: ${formatCurrency(emiResult.monthlyEMI)}
Total Repayment: ${formatCurrency(emiResult.totalPayment)}
Total Interest: ${formatCurrency(emiResult.totalInterest)} ($${emiInterestRatio} interest per $1 borrowed)`;
    } else {
      text = `FinGrow Inflation Impact Summary:
Current Annual Cost: ${formatCurrency(infCost)}
Annual Inflation: ${infRate}%
Horizon: ${infYears} Years
Future Equivalent Cost: ${formatCurrency(infResult.futureCost)}
Purchasing Power Lost: -${infResult.purchasingPowerLossPct}%
$1 today will purchase only $${infDollarTodayValue} worth of goods.`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/simulations"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-fingrow-midnight/60 hover:text-fingrow-emerald transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Simulations Hub</span>
        </Link>
        <span className="text-[11px] font-semibold text-fingrow-midnight/50 bg-fingrow-midnight/5 px-2.5 py-1 rounded-full">
          100% Decimal-Safe Precision
        </span>
      </div>

      {/* Hero Header */}
      <div className="space-y-2">
        <Badge variant="emerald" size="sm">
          MATHEMATICAL CALCULATOR SUITE
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-fingrow-midnight tracking-tight">
          Financial Mathematical Calculators
        </h1>
        <p className="text-sm sm:text-base text-fingrow-midnight/70 leading-relaxed max-w-3xl">
          High-precision computational models with synchronized slider controls, step-by-step formula breakdowns, boundary condition checks, and practical wealth insights.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-fingrow-midnight/10 shadow-finCard">
        {[
          { id: "compound", label: "Compound Interest", icon: Sparkles },
          { id: "sip", label: "SIP Wealth", icon: TrendingUp },
          { id: "emi", label: "Loan EMI", icon: DollarSign },
          { id: "inflation", label: "Inflation Erosion", icon: Percent },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setShowSchedule(false);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isActive
                  ? "bg-fingrow-emerald text-white shadow-sm"
                  : "text-fingrow-midnight/70 hover:bg-fingrow-midnight/5 hover:text-fingrow-midnight"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 1. COMPOUND INTEREST CALCULATOR */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === "compound" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Synchronized Parameter Controls (7 cols) */}
            <Card className="lg:col-span-7 p-6 space-y-5 bg-white shadow-finCard border-fingrow-midnight/10">
              <div className="flex items-center justify-between border-b border-fingrow-midnight/10 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-fingrow-emerald" />
                  <h2 className="font-bold text-base text-fingrow-midnight">Compound Parameters</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCiPrincipal(10000);
                    setCiRate(8);
                    setCiYears(10);
                    setCiCompoundsPerYear(12);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-fingrow-midnight/60 hover:text-fingrow-emerald"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              {/* Boundary Feedback Notice */}
              {ciRate === 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                  <div>
                    <strong>0% Interest Boundary:</strong> At 0% annual interest, money earns no return. Your final balance strictly equals the original principal deposit.
                  </div>
                </div>
              )}
              {ciYears >= 35 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-fingrow-emerald" />
                  <div>
                    <strong>Long Horizon Compounding:</strong> Over a {ciYears}-year tenure, exponential compounding produces a hockey-stick effect where interest earned exceeds initial principal by {ciInterestRatio}x.
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Principal */}
                <SynchronizedControl
                  label="Initial Principal Deposit (P)"
                  hint="Lump-sum starting capital"
                  value={ciPrincipal}
                  min={500}
                  max={250000}
                  step={500}
                  prefix="$"
                  onChange={setCiPrincipal}
                  presets={[
                    { label: "$5,000", value: 5000 },
                    { label: "$10,000", value: 10000 },
                    { label: "$25,000", value: 25000 },
                    { label: "$50,000", value: 50000 },
                    { label: "$100,000", value: 100000 },
                  ]}
                />

                {/* Annual Rate */}
                <SynchronizedControl
                  label="Annual Interest Rate (r)"
                  hint="Expected annual yield"
                  value={ciRate}
                  min={0}
                  max={25}
                  step={0.25}
                  suffix="%"
                  onChange={setCiRate}
                  presets={[
                    { label: "0% (Zero)", value: 0 },
                    { label: "5% (Treasuries)", value: 5 },
                    { label: "7% (Conservative)", value: 7 },
                    { label: "10% (S&P 500 Avg)", value: 10 },
                    { label: "14% (Aggressive)", value: 14 },
                  ]}
                />

                {/* Duration */}
                <SynchronizedControl
                  label="Investment Horizon (t)"
                  hint="Years to let capital compound"
                  value={ciYears}
                  min={1}
                  max={50}
                  step={1}
                  suffix=" yrs"
                  onChange={setCiYears}
                  presets={[
                    { label: "3 yrs", value: 3 },
                    { label: "5 yrs", value: 5 },
                    { label: "10 yrs", value: 10 },
                    { label: "20 yrs", value: 20 },
                    { label: "30 yrs", value: 30 },
                    { label: "40 yrs", value: 40 },
                  ]}
                />

                {/* Compounding Frequency Selector */}
                <div className="space-y-1.5 p-3.5 bg-fingrow-ivory/60 rounded-xl border border-fingrow-midnight/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-fingrow-midnight">
                      Compounding Frequency (n)
                    </span>
                    <span className="text-[11px] font-semibold text-fingrow-emerald">
                      {ciCompoundsPerYear === 12
                        ? "Monthly (12x/yr)"
                        : ciCompoundsPerYear === 1
                        ? "Annually (1x/yr)"
                        : ciCompoundsPerYear === 4
                        ? "Quarterly (4x/yr)"
                        : "Daily (365x/yr)"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {[
                      { label: "Annual", value: 1 },
                      { label: "Quarterly", value: 4 },
                      { label: "Monthly", value: 12 },
                      { label: "Daily", value: 365 },
                    ].map((freq) => (
                      <button
                        key={freq.label}
                        type="button"
                        onClick={() => setCiCompoundsPerYear(freq.value)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all ${
                          ciCompoundsPerYear === freq.value
                            ? "bg-fingrow-emerald text-white shadow-xs"
                            : "bg-white text-fingrow-midnight/70 border border-fingrow-midnight/10 hover:bg-fingrow-emerald/10"
                        }`}
                      >
                        {freq.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Right: Results Display Card (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="bg-fingrow-midnight text-white border-0 p-7 shadow-finElevated space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-fingrow-lime flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Future Value Projected</span>
                  </span>
                  <button
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-1 text-[11px] text-white/70 hover:text-fingrow-lime transition-colors"
                    title="Copy calculation summary"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-fingrow-lime" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                {/* Primary Future Value */}
                <div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                    {formatCurrency(ciResult.totalAmount)}
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    Total accumulated balance after {ciYears} year{ciYears > 1 ? "s" : ""}
                  </p>
                </div>

                {/* Breakdown Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-white/70">
                    <span>Principal: {100 - ciInterestPct}%</span>
                    <span className="text-fingrow-lime">Interest: {ciInterestPct}%</span>
                  </div>
                  <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-fingrow-emerald transition-all duration-300"
                      style={{ width: `${Math.max(0, 100 - ciInterestPct)}%` }}
                      title={`Principal: ${formatCurrency(ciPrincipal)}`}
                    />
                    <div
                      className="h-full bg-fingrow-lime transition-all duration-300"
                      style={{ width: `${Math.min(100, ciInterestPct)}%` }}
                      title={`Interest: ${formatCurrency(ciResult.interestEarned)}`}
                    />
                  </div>
                </div>

                {/* Grid Metrics */}
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
                  <div>
                    <span className="text-xs text-white/60 block">Initial Deposit</span>
                    <div className="text-xl font-bold text-white">{formatCurrency(ciPrincipal)}</div>
                  </div>
                  <div>
                    <span className="text-xs text-white/60 block">Interest Accrued</span>
                    <div className="text-xl font-bold text-fingrow-lime">
                      +{formatCurrency(ciResult.interestEarned)}
                    </div>
                  </div>
                </div>

                {/* Rule of 72 & Ratio Insights */}
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-white/80">Rule of 72 Doubling Period:</span>
                    <span className="text-fingrow-lime font-bold">~{ciYearsToDouble} Years</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-white/80">Growth Multiplier:</span>
                    <span className="text-white font-bold">{ciInterestRatio}x original principal</span>
                  </div>
                </div>
              </Card>

              {/* Toggle Milestone Schedule Button */}
              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-fingrow-midnight/10 text-xs font-bold text-fingrow-midnight hover:bg-fingrow-ivory transition-colors shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5 text-fingrow-emerald" />
                <span>{showSchedule ? "Hide Milestone Schedule" : "Show Milestone Growth Schedule"}</span>
                {showSchedule ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Milestone Schedule Table */}
          {showSchedule && (
            <Card className="p-6 bg-white shadow-finCard border-fingrow-midnight/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-fingrow-midnight">
                    Compound Growth Progression Schedule
                  </h3>
                  <p className="text-xs text-fingrow-midnight/60">
                    Periodic trajectory of principal and accumulated interest over {ciYears} years.
                  </p>
                </div>
                <Badge variant="emerald" size="sm">
                  {ciCompoundsPerYear === 12 ? "Monthly Compounding" : `${ciCompoundsPerYear}x per Year`}
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-fingrow-midnight/10 text-fingrow-midnight/60 font-semibold">
                      <th className="py-2.5 px-3">Tenure Year</th>
                      <th className="py-2.5 px-3">Principal Capital</th>
                      <th className="py-2.5 px-3">Cumulative Interest</th>
                      <th className="py-2.5 px-3 text-right">Total Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-fingrow-midnight/5">
                    {ciSchedule.map((m) => (
                      <tr key={m.year} className="hover:bg-fingrow-ivory/50">
                        <td className="py-2.5 px-3 font-bold text-fingrow-midnight">Year {m.year}</td>
                        <td className="py-2.5 px-3 text-fingrow-midnight/70">{formatCurrency(m.principal)}</td>
                        <td className="py-2.5 px-3 font-semibold text-fingrow-emerald">+{formatCurrency(m.interestEarned)}</td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-fingrow-midnight">{formatCurrency(m.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Educational Formula & Concept Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white border-fingrow-midnight/10 shadow-finCard space-y-3">
              <div className="flex items-center gap-2 text-fingrow-emerald">
                <Calculator className="w-4 h-4" />
                <h3 className="font-bold text-sm text-fingrow-midnight">Mathematical Formula Mechanics</h3>
              </div>
              <div className="p-3 bg-fingrow-midnight/5 rounded-xl font-mono text-xs text-fingrow-midnight space-y-1">
                <div className="font-bold text-fingrow-emerald">A = P * (1 + r / n)^(n * t)</div>
                <div className="text-[11px] text-fingrow-midnight/70">
                  A = {formatCurrency(ciPrincipal)} * (1 + {ciRate / 100} / {ciCompoundsPerYear})^({ciCompoundsPerYear} * {ciYears})
                </div>
              </div>
              <ul className="text-xs text-fingrow-midnight/75 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li><strong>P (Principal):</strong> Your initial lump-sum deposit (${formatNumber(ciPrincipal)}).</li>
                <li><strong>r (Annual Rate):</strong> Nominal annual interest in decimal ({ciRate}% = {ciRate / 100}).</li>
                <li><strong>n (Frequency):</strong> Compounding events per year ({ciCompoundsPerYear}x).</li>
                <li><strong>t (Time):</strong> Duration of compounding ({ciYears} years).</li>
              </ul>
            </Card>

            <Card className="p-6 bg-white border-fingrow-midnight/10 shadow-finCard space-y-3">
              <div className="flex items-center gap-2 text-fingrow-emerald">
                <Sparkles className="w-4 h-4" />
                <h3 className="font-bold text-sm text-fingrow-midnight">Core Concept: The Power of Compounding</h3>
              </div>
              <p className="text-xs text-fingrow-midnight/75 leading-relaxed">
                Compound interest is often called the <em>&quot;eighth wonder of the world&quot;</em>. In simple interest, you only earn returns on your initial principal. In compound interest, you earn interest on your previously accrued interest.
              </p>
              <div className="p-3 bg-fingrow-softMint/40 rounded-xl border border-fingrow-emerald/20 text-xs text-fingrow-midnight space-y-1">
                <span className="font-bold text-fingrow-emerald block">The Rule of 72 Shortcut:</span>
                <p className="text-[11px] text-fingrow-midnight/75">
                  Divide 72 by your annual interest rate ({ciRate}%) to approximate how many years it takes for your investment to double: <strong>72 ÷ {ciRate} ≈ {ciYearsToDouble} years</strong>.
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 2. SIP (SYSTEMATIC INVESTMENT PLAN) CALCULATOR */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === "sip" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Parameter Controls (7 cols) */}
            <Card className="lg:col-span-7 p-6 space-y-5 bg-white shadow-finCard border-fingrow-midnight/10">
              <div className="flex items-center justify-between border-b border-fingrow-midnight/10 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-fingrow-emerald" />
                  <h2 className="font-bold text-base text-fingrow-midnight">SIP Parameters</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSipMonthly(500);
                    setSipRate(12);
                    setSipYears(15);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-fingrow-midnight/60 hover:text-fingrow-emerald"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              {/* Boundary Feedback Notice */}
              {sipRate === 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                  <div>
                    <strong>0% Return Boundary:</strong> At 0% market return, you accumulate only your total cash deposits ({formatCurrency(sipResult.totalInvested)}) without any capital gains.
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Monthly Amount */}
                <SynchronizedControl
                  label="Monthly Contribution (P)"
                  hint="Automated recurring investment"
                  value={sipMonthly}
                  min={25}
                  max={5000}
                  step={25}
                  prefix="$"
                  onChange={setSipMonthly}
                  presets={[
                    { label: "$100/mo", value: 100 },
                    { label: "$250/mo", value: 250 },
                    { label: "$500/mo", value: 500 },
                    { label: "$1,000/mo", value: 1000 },
                    { label: "$2,500/mo", value: 2500 },
                  ]}
                />

                {/* Annual Return */}
                <SynchronizedControl
                  label="Expected Annual Return Rate (r)"
                  hint="Long-term index fund CAGR"
                  value={sipRate}
                  min={0}
                  max={25}
                  step={0.5}
                  suffix="%"
                  onChange={setSipRate}
                  presets={[
                    { label: "0% (Cash)", value: 0 },
                    { label: "6% (Balanced)", value: 6 },
                    { label: "8% (Index)", value: 8 },
                    { label: "12% (Equity)", value: 12 },
                    { label: "15% (High Growth)", value: 15 },
                  ]}
                />

                {/* Horizon */}
                <SynchronizedControl
                  label="Investment Period (t)"
                  hint="Time spent in dollar-cost averaging"
                  value={sipYears}
                  min={1}
                  max={40}
                  step={1}
                  suffix=" yrs"
                  onChange={setSipYears}
                  presets={[
                    { label: "5 yrs", value: 5 },
                    { label: "10 yrs", value: 10 },
                    { label: "15 yrs", value: 15 },
                    { label: "20 yrs", value: 20 },
                    { label: "30 yrs", value: 30 },
                  ]}
                />
              </div>
            </Card>

            {/* Right: Results Card (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="bg-fingrow-midnight text-white border-0 p-7 shadow-finElevated space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-fingrow-lime flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Terminal SIP Wealth</span>
                  </span>
                  <button
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-1 text-[11px] text-white/70 hover:text-fingrow-lime transition-colors"
                    title="Copy calculation summary"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-fingrow-lime" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                {/* Terminal Wealth */}
                <div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                    {formatCurrency(sipResult.futureValue)}
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    Portfolio value after {sipYears * 12} monthly contributions
                  </p>
                </div>

                {/* Breakdown Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-white/70">
                    <span>Invested: {100 - sipGainPct}%</span>
                    <span className="text-fingrow-lime">Wealth Gain: {sipGainPct}%</span>
                  </div>
                  <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-fingrow-emerald transition-all duration-300"
                      style={{ width: `${Math.max(0, 100 - sipGainPct)}%` }}
                      title={`Invested: ${formatCurrency(sipResult.totalInvested)}`}
                    />
                    <div
                      className="h-full bg-fingrow-lime transition-all duration-300"
                      style={{ width: `${Math.min(100, sipGainPct)}%` }}
                      title={`Gain: ${formatCurrency(sipResult.wealthGain)}`}
                    />
                  </div>
                </div>

                {/* Grid Metrics */}
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
                  <div>
                    <span className="text-xs text-white/60 block">Total Invested</span>
                    <div className="text-xl font-bold text-white">{formatCurrency(sipResult.totalInvested)}</div>
                  </div>
                  <div>
                    <span className="text-xs text-white/60 block">Estimated Gain</span>
                    <div className="text-xl font-bold text-fingrow-lime">
                      +{formatCurrency(sipResult.wealthGain)}
                    </div>
                  </div>
                </div>

                {/* Multiplier Badge */}
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-white/80">Capital Multiplier:</span>
                  <span className="text-fingrow-lime font-bold">{sipMultiplier}x Total Money Invested</span>
                </div>
              </Card>

              {/* Toggle Milestone Schedule Button */}
              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-fingrow-midnight/10 text-xs font-bold text-fingrow-midnight hover:bg-fingrow-ivory transition-colors shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5 text-fingrow-emerald" />
                <span>{showSchedule ? "Hide SIP Schedule" : "Show SIP Milestone Schedule"}</span>
                {showSchedule ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Milestone Schedule */}
          {showSchedule && (
            <Card className="p-6 bg-white shadow-finCard border-fingrow-midnight/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-fingrow-midnight">
                    Systematic Investment Milestone Schedule
                  </h3>
                  <p className="text-xs text-fingrow-midnight/60">
                    Milestone projection of regular monthly savings compounding at {sipRate}% annual return.
                  </p>
                </div>
                <Badge variant="emerald" size="sm">
                  {formatCurrency(sipMonthly)} / month
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-fingrow-midnight/10 text-fingrow-midnight/60 font-semibold">
                      <th className="py-2.5 px-3">Milestone</th>
                      <th className="py-2.5 px-3">Total Invested</th>
                      <th className="py-2.5 px-3">Wealth Gains</th>
                      <th className="py-2.5 px-3 text-right">Portfolio Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-fingrow-midnight/5">
                    {sipSchedule.map((m) => (
                      <tr key={m.year} className="hover:bg-fingrow-ivory/50">
                        <td className="py-2.5 px-3 font-bold text-fingrow-midnight">Year {m.year}</td>
                        <td className="py-2.5 px-3 text-fingrow-midnight/70">{formatCurrency(m.totalInvested)}</td>
                        <td className="py-2.5 px-3 font-semibold text-fingrow-emerald">+{formatCurrency(m.wealthGain)}</td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-fingrow-midnight">{formatCurrency(m.futureValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Educational Insights: Cost of Waiting */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white border-fingrow-midnight/10 shadow-finCard space-y-3">
              <div className="flex items-center gap-2 text-fingrow-coral">
                <Clock className="w-4 h-4" />
                <h3 className="font-bold text-sm text-fingrow-midnight">The High Cost of Delaying 5 Years</h3>
              </div>
              <p className="text-xs text-fingrow-midnight/75 leading-relaxed">
                Starting today vs waiting just 5 years creates a massive gap in terminal wealth due to missed compounding in the later years.
              </p>
              {sipYears > 5 && sipDelayedResult ? (
                <div className="p-3.5 bg-fingrow-coral/10 rounded-xl border border-fingrow-coral/20 space-y-2 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span>If you start today ({sipYears} yrs):</span>
                    <span className="font-bold text-fingrow-midnight">{formatCurrency(sipResult.futureValue)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-fingrow-midnight/70">
                    <span>If you wait 5 years ({sipYears - 5} yrs):</span>
                    <span className="font-bold">{formatCurrency(sipDelayedResult.futureValue)}</span>
                  </div>
                  <div className="border-t border-fingrow-coral/20 pt-2 flex justify-between font-bold text-fingrow-coral">
                    <span>Cost of 5-year procrastination:</span>
                    <span>-{formatCurrency(sipCostOfWaiting)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-fingrow-midnight/60 italic">
                  Increase tenure to over 5 years to see the 5-year delay cost comparison.
                </p>
              )}
            </Card>

            <Card className="p-6 bg-white border-fingrow-midnight/10 shadow-finCard space-y-3">
              <div className="flex items-center gap-2 text-fingrow-emerald">
                <Calculator className="w-4 h-4" />
                <h3 className="font-bold text-sm text-fingrow-midnight">SIP Annuity Formula Breakdown</h3>
              </div>
              <div className="p-3 bg-fingrow-midnight/5 rounded-xl font-mono text-xs text-fingrow-midnight space-y-1">
                <div className="font-bold text-fingrow-emerald">FV = P * [((1 + i)^n - 1) / i] * (1 + i)</div>
                <div className="text-[11px] text-fingrow-midnight/70">
                  Where i = {sipRate}% / 1200 = {(sipRate / 100 / 12).toFixed(6)}, n = {sipYears * 12} installments
                </div>
              </div>
              <p className="text-xs text-fingrow-midnight/75 leading-relaxed">
                A Systematic Investment Plan uses <strong>Dollar-Cost Averaging</strong>: you automatically buy more fund units when prices are low and fewer when prices are high, eliminating emotional market timing.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 3. LOAN EMI CALCULATOR */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === "emi" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Parameter Controls (7 cols) */}
            <Card className="lg:col-span-7 p-6 space-y-5 bg-white shadow-finCard border-fingrow-midnight/10">
              <div className="flex items-center justify-between border-b border-fingrow-midnight/10 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-fingrow-emerald" />
                  <h2 className="font-bold text-base text-fingrow-midnight">Loan Terms</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmiPrincipal(250000);
                    setEmiRate(6.5);
                    setEmiYears(30);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-fingrow-midnight/60 hover:text-fingrow-emerald"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              {/* Boundary Feedback Notice */}
              {emiRate === 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-fingrow-emerald" />
                  <div>
                    <strong>0% APR Promotional Financing:</strong> No interest charges apply! Monthly EMI is simply principal divided evenly across {emiYears * 12} monthly payments. Total interest is $0.
                  </div>
                </div>
              )}
              {emiResult.totalInterest > emiPrincipal && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                  <div>
                    <strong>Interest Exceeds Principal:</strong> Over a {emiYears}-year tenure at {emiRate}%, total interest paid ({formatCurrency(emiResult.totalInterest)}) exceeds the original amount borrowed!
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Principal */}
                <SynchronizedControl
                  label="Loan Principal Borrowed (P)"
                  hint="Mortgage, auto, or student loan balance"
                  value={emiPrincipal}
                  min={5000}
                  max={1000000}
                  step={5000}
                  prefix="$"
                  onChange={setEmiPrincipal}
                  presets={[
                    { label: "$25,000 (Auto)", value: 25000 },
                    { label: "$50,000 (Personal)", value: 50000 },
                    { label: "$150,000 (Condo)", value: 150000 },
                    { label: "$300,000 (Home)", value: 300000 },
                    { label: "$500,000 (Jumbo)", value: 500000 },
                  ]}
                />

                {/* Annual Rate */}
                <SynchronizedControl
                  label="Annual Loan Interest Rate (r)"
                  hint="APR fixed interest rate"
                  value={emiRate}
                  min={0}
                  max={20}
                  step={0.25}
                  suffix="%"
                  onChange={setEmiRate}
                  presets={[
                    { label: "0% (Promo)", value: 0 },
                    { label: "4.5% (Prime)", value: 4.5 },
                    { label: "6.5% (Mortgage)", value: 6.5 },
                    { label: "9.0% (Unsecured)", value: 9 },
                    { label: "13.0% (Personal)", value: 13 },
                  ]}
                />

                {/* Tenure */}
                <SynchronizedControl
                  label="Loan Tenure Duration (t)"
                  hint="Total repayment duration"
                  value={emiYears}
                  min={1}
                  max={35}
                  step={1}
                  suffix=" yrs"
                  onChange={setEmiYears}
                  presets={[
                    { label: "3 yrs (Auto)", value: 3 },
                    { label: "5 yrs (Medium)", value: 5 },
                    { label: "15 yrs (Mortgage)", value: 15 },
                    { label: "20 yrs", value: 20 },
                    { label: "30 yrs (Standard)", value: 30 },
                  ]}
                />
              </div>
            </Card>

            {/* Right: Results Card (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="bg-fingrow-midnight text-white border-0 p-7 shadow-finElevated space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-fingrow-lime flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Monthly EMI Payment</span>
                  </span>
                  <button
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-1 text-[11px] text-white/70 hover:text-fingrow-lime transition-colors"
                    title="Copy calculation summary"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-fingrow-lime" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                {/* Monthly Payment */}
                <div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                    {formatCurrency(emiResult.monthlyEMI)}
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    Fixed monthly installment over {emiYears * 12} installments
                  </p>
                </div>

                {/* Breakdown Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-white/70">
                    <span>Principal: {emiPrincipalPct}%</span>
                    <span className="text-fingrow-coral">Interest: {100 - emiPrincipalPct}%</span>
                  </div>
                  <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-fingrow-emerald transition-all duration-300"
                      style={{ width: `${Math.max(0, emiPrincipalPct)}%` }}
                      title={`Principal: ${formatCurrency(emiPrincipal)}`}
                    />
                    <div
                      className="h-full bg-fingrow-coral transition-all duration-300"
                      style={{ width: `${Math.min(100, 100 - emiPrincipalPct)}%` }}
                      title={`Interest: ${formatCurrency(emiResult.totalInterest)}`}
                    />
                  </div>
                </div>

                {/* Grid Metrics */}
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
                  <div>
                    <span className="text-xs text-white/60 block">Total Repayment</span>
                    <div className="text-xl font-bold text-white">{formatCurrency(emiResult.totalPayment)}</div>
                  </div>
                  <div>
                    <span className="text-xs text-white/60 block">Total Interest Paid</span>
                    <div className="text-xl font-bold text-fingrow-coral">
                      +{formatCurrency(emiResult.totalInterest)}
                    </div>
                  </div>
                </div>

                {/* Cost of Borrowing Badge */}
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-white/80">Borrowing Ratio:</span>
                  <span className="text-fingrow-coral font-bold">${emiInterestRatio} interest per $1 borrowed</span>
                </div>
              </Card>

              {/* Toggle Amortization Schedule */}
              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-fingrow-midnight/10 text-xs font-bold text-fingrow-midnight hover:bg-fingrow-ivory transition-colors shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5 text-fingrow-emerald" />
                <span>{showSchedule ? "Hide Amortization Schedule" : "Show Yearly Amortization Schedule"}</span>
                {showSchedule ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Amortization Schedule Table */}
          {showSchedule && (
            <Card className="p-6 bg-white shadow-finCard border-fingrow-midnight/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-fingrow-midnight">
                    Yearly Loan Amortization Schedule
                  </h3>
                  <p className="text-xs text-fingrow-midnight/60">
                    Observe how interest dominates early years while principal repayment accelerates later.
                  </p>
                </div>
                <Badge variant="emerald" size="sm">
                  {formatCurrency(emiPrincipal)} Loan
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-fingrow-midnight/10 text-fingrow-midnight/60 font-semibold">
                      <th className="py-2.5 px-3">Year</th>
                      <th className="py-2.5 px-3">Annual Paid</th>
                      <th className="py-2.5 px-3">Principal Applied</th>
                      <th className="py-2.5 px-3">Interest Paid</th>
                      <th className="py-2.5 px-3 text-right">Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-fingrow-midnight/5">
                    {emiSchedule.map((m) => (
                      <tr key={m.year} className="hover:bg-fingrow-ivory/50">
                        <td className="py-2.5 px-3 font-bold text-fingrow-midnight">Year {m.year}</td>
                        <td className="py-2.5 px-3 font-semibold text-fingrow-midnight">{formatCurrency(m.yearlyPaid)}</td>
                        <td className="py-2.5 px-3 font-semibold text-fingrow-emerald">{formatCurrency(m.principalPaidYear)}</td>
                        <td className="py-2.5 px-3 text-fingrow-coral font-medium">{formatCurrency(m.interestPaidYear)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-fingrow-midnight">{formatCurrency(m.remainingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Educational Amortization Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white border-fingrow-midnight/10 shadow-finCard space-y-3">
              <div className="flex items-center gap-2 text-fingrow-coral">
                <ShieldAlert className="w-4 h-4" />
                <h3 className="font-bold text-sm text-fingrow-midnight">Amortization Front-Loading</h3>
              </div>
              <p className="text-xs text-fingrow-midnight/75 leading-relaxed">
                In standard mortgage amortization, your monthly payment stays fixed, but its internal composition shifts dramatically over time:
              </p>
              <ul className="text-xs text-fingrow-midnight/75 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li><strong>Early Years:</strong> Up to 70-80% of each payment goes directly to interest because the outstanding principal balance is at its highest.</li>
                <li><strong>Later Years:</strong> As principal balance declines, interest charges shrink, directing the bulk of each payment toward equity.</li>
                <li><strong>Prepayment Strategy:</strong> Making even small extra principal payments in the first 5 years drastically reduces total lifetime interest!</li>
              </ul>
            </Card>

            <Card className="p-6 bg-white border-fingrow-midnight/10 shadow-finCard space-y-3">
              <div className="flex items-center gap-2 text-fingrow-emerald">
                <Calculator className="w-4 h-4" />
                <h3 className="font-bold text-sm text-fingrow-midnight">EMI Mathematical Formula</h3>
              </div>
              <div className="p-3 bg-fingrow-midnight/5 rounded-xl font-mono text-xs text-fingrow-midnight space-y-1">
                <div className="font-bold text-fingrow-emerald">EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]</div>
                <div className="text-[11px] text-fingrow-midnight/70">
                  Where r = {emiRate}% / 1200 = {(emiRate / 100 / 12).toFixed(6)}, n = {emiYears * 12} monthly installments
                </div>
              </div>
              <p className="text-xs text-fingrow-midnight/75 leading-relaxed">
                The standard annuity equation balances equal cash flows across all periods so that the final installment brings the remaining loan balance to exactly $0.00.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 4. INFLATION PURCHASING POWER CALCULATOR */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === "inflation" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Parameter Controls (7 cols) */}
            <Card className="lg:col-span-7 p-6 space-y-5 bg-white shadow-finCard border-fingrow-midnight/10">
              <div className="flex items-center justify-between border-b border-fingrow-midnight/10 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-fingrow-emerald" />
                  <h2 className="font-bold text-base text-fingrow-midnight">Inflation Assumptions</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setInfCost(50000);
                    setInfRate(4);
                    setInfYears(15);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-fingrow-midnight/60 hover:text-fingrow-emerald"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              {/* Boundary Feedback Notice */}
              {infRate === 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-fingrow-emerald" />
                  <div>
                    <strong>0% Inflation Boundary:</strong> If the Consumer Price Index does not increase, prices remain identical over time and purchasing power suffers 0% loss.
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Current Cost */}
                <SynchronizedControl
                  label="Current Annual Living Cost (PV)"
                  hint="Annual expenditure or target asset cost today"
                  value={infCost}
                  min={5000}
                  max={250000}
                  step={2500}
                  prefix="$"
                  onChange={setInfCost}
                  presets={[
                    { label: "$25,000 (Student)", value: 25000 },
                    { label: "$50,000 (Individual)", value: 50000 },
                    { label: "$80,000 (Family)", value: 80000 },
                    { label: "$120,000 (Affluent)", value: 120000 },
                  ]}
                />

                {/* Annual Inflation Rate */}
                <SynchronizedControl
                  label="Expected Annual Inflation Rate (r)"
                  hint="Historical CPI baseline averages 2.5% - 4.5%"
                  value={infRate}
                  min={0}
                  max={15}
                  step={0.25}
                  suffix="%"
                  onChange={setInfRate}
                  presets={[
                    { label: "0% (Constant)", value: 0 },
                    { label: "2.5% (Fed Target)", value: 2.5 },
                    { label: "4.0% (Historical Avg)", value: 4 },
                    { label: "6.5% (Elevated)", value: 6.5 },
                    { label: "9.0% (High Inflation)", value: 9 },
                  ]}
                />

                {/* Horizon */}
                <SynchronizedControl
                  label="Years into the Future (t)"
                  hint="Duration of currency purchasing power decay"
                  value={infYears}
                  min={1}
                  max={50}
                  step={1}
                  suffix=" yrs"
                  onChange={setInfYears}
                  presets={[
                    { label: "5 yrs", value: 5 },
                    { label: "10 yrs", value: 10 },
                    { label: "15 yrs", value: 15 },
                    { label: "20 yrs", value: 20 },
                    { label: "30 yrs", value: 30 },
                  ]}
                />
              </div>
            </Card>

            {/* Right: Results Card (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="bg-fingrow-midnight text-white border-0 p-7 shadow-finElevated space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-fingrow-lime flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5" />
                    <span>Future Equivalent Cost</span>
                  </span>
                  <button
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-1 text-[11px] text-white/70 hover:text-fingrow-lime transition-colors"
                    title="Copy calculation summary"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-fingrow-lime" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                {/* Future Cost */}
                <div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                    {formatCurrency(infResult.futureCost)}
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    Annual cost required in {infYears} years to maintain today&apos;s standard of living
                  </p>
                </div>

                {/* Erosion Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-white/70">
                    <span>Power Retained: {(100 - infResult.purchasingPowerLossPct).toFixed(1)}%</span>
                    <span className="text-fingrow-coral">Purchasing Power Lost: -{infResult.purchasingPowerLossPct}%</span>
                  </div>
                  <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-fingrow-emerald transition-all duration-300"
                      style={{ width: `${Math.max(0, 100 - infResult.purchasingPowerLossPct)}%` }}
                    />
                    <div
                      className="h-full bg-fingrow-coral transition-all duration-300"
                      style={{ width: `${Math.min(100, infResult.purchasingPowerLossPct)}%` }}
                    />
                  </div>
                </div>

                {/* Grid Metrics */}
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
                  <div>
                    <span className="text-xs text-white/60 block">Current Living Cost</span>
                    <div className="text-xl font-bold text-white">{formatCurrency(infCost)}</div>
                  </div>
                  <div>
                    <span className="text-xs text-white/60 block">Cost Inflation Jump</span>
                    <div className="text-xl font-bold text-fingrow-coral">
                      +{formatCurrency(infResult.futureCost - infCost)}
                    </div>
                  </div>
                </div>

                {/* Value of $1 Today Badge */}
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-white/80">Value of $1.00 Today in {infYears} Years:</span>
                  <span className="text-fingrow-coral font-bold">${infDollarTodayValue}</span>
                </div>
              </Card>

              {/* Toggle Milestone Schedule Button */}
              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-fingrow-midnight/10 text-xs font-bold text-fingrow-midnight hover:bg-fingrow-ivory transition-colors shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5 text-fingrow-emerald" />
                <span>{showSchedule ? "Hide Inflation Progression" : "Show Inflation Milestone Schedule"}</span>
                {showSchedule ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Milestone Schedule */}
          {showSchedule && (
            <Card className="p-6 bg-white shadow-finCard border-fingrow-midnight/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-fingrow-midnight">
                    Purchasing Power Erosion Milestone Schedule
                  </h3>
                  <p className="text-xs text-fingrow-midnight/60">
                    How living costs surge and cash purchasing power deteriorates at {infRate}% annual inflation.
                  </p>
                </div>
                <Badge variant="emerald" size="sm">
                  {infRate}% Annual Inflation
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-fingrow-midnight/10 text-fingrow-midnight/60 font-semibold">
                      <th className="py-2.5 px-3">Milestone Year</th>
                      <th className="py-2.5 px-3">Equivalent Annual Cost</th>
                      <th className="py-2.5 px-3">Purchasing Power Value of $1</th>
                      <th className="py-2.5 px-3 text-right">Cumulative Value Loss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-fingrow-midnight/5">
                    {infSchedule.map((m) => (
                      <tr key={m.year} className="hover:bg-fingrow-ivory/50">
                        <td className="py-2.5 px-3 font-bold text-fingrow-midnight">Year {m.year}</td>
                        <td className="py-2.5 px-3 font-bold text-fingrow-midnight">{formatCurrency(m.futureCost)}</td>
                        <td className="py-2.5 px-3 font-semibold text-fingrow-emerald">${m.purchasingPowerMultiplier.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-fingrow-coral">-{m.lossPct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Educational Insights: Inflation & Real Returns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white border-fingrow-midnight/10 shadow-finCard space-y-3">
              <div className="flex items-center gap-2 text-fingrow-coral">
                <ShieldAlert className="w-4 h-4" />
                <h3 className="font-bold text-sm text-fingrow-midnight">The Silent Tax on Cash</h3>
              </div>
              <p className="text-xs text-fingrow-midnight/75 leading-relaxed">
                Inflation acts as an invisible stealth tax on uninvested money. When prices rise at {infRate}% per year, cash sitting in a checking account or under a mattress loses purchasing power every single day.
              </p>
              <div className="p-3 bg-fingrow-coral/10 rounded-xl border border-fingrow-coral/20 text-xs text-fingrow-midnight space-y-1">
                <span className="font-bold text-fingrow-coral block">Real vs. Nominal Returns:</span>
                <p className="text-[11px] text-fingrow-midnight/75">
                  <strong>Real Return = Nominal Return - Inflation Rate</strong>. If your savings account yields 1.5% and inflation is {infRate}%, your real return is <strong>{(1.5 - infRate).toFixed(1)}%</strong>!
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-white border-fingrow-midnight/10 shadow-finCard space-y-3">
              <div className="flex items-center gap-2 text-fingrow-emerald">
                <Calculator className="w-4 h-4" />
                <h3 className="font-bold text-sm text-fingrow-midnight">Purchasing Power Decay Formula</h3>
              </div>
              <div className="p-3 bg-fingrow-midnight/5 rounded-xl font-mono text-xs text-fingrow-midnight space-y-1">
                <div className="font-bold text-fingrow-emerald">FV = PV * (1 + r)^t</div>
                <div className="text-[11px] text-fingrow-midnight/70">
                  Loss % = [1 - (PV / FV)] * 100 = [1 - (1 / (1 + {infRate / 100})^{infYears})] * 100
                </div>
              </div>
              <p className="text-xs text-fingrow-midnight/75 leading-relaxed">
                To outpace inflation over decade-long horizons, individuals historically invest in productive assets like diversified global index funds, equities, and real estate whose dividends and revenues adjust upward with economic growth.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Cross-Link Footer to Interactive Simulators */}
      <div className="border-t border-fingrow-midnight/10 pt-8 mt-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-fingrow-midnight/10 shadow-finCard">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-fingrow-midnight">
              Want to test these formulas in interactive life simulations?
            </h4>
            <p className="text-xs text-fingrow-midnight/65">
              Experience the 50/30/20 First Salary budget, test market volatility in the $50k Challenge, or launch a tech startup.
            </p>
          </div>
          <Link
            href="/simulations"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-fingrow-emerald text-white text-xs font-bold hover:bg-fingrow-darkEmerald transition-colors shadow-sm shrink-0"
          >
            <span>Explore All Simulators</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
