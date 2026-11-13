"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Compass,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Flame,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Users,
  Briefcase,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, decimalRound, formatPercent } from "@/lib/utils";
import {
  VirtualDisclaimerBanner,
  VirtualFundsBadge,
} from "@/components/simulations/VirtualDisclaimer";

export default function StartupBuilderPage() {
  const [cashTreasury, setCashTreasury] = useState<number>(100000); // $100k seed capital
  const [activeCustomers, setActiveCustomers] = useState<number>(150);
  const [pricePerUser, setPricePerUser] = useState<number>(49); // $49/mo
  const [marketingBudget, setMarketingBudget] = useState<number>(4000);
  const [engineeringBudget, setEngineeringBudget] = useState<number>(7000);
  const [month, setMonth] = useState<number>(1);
  const [history, setHistory] = useState<
    { month: number; event: string; revenue: number; ebitda: number; treasury: number; customers: number }[]
  >([]);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Persistence
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error" | "unauthenticated">("idle");
  const [saveMessage, setSaveMessage] = useState<string>("");

  // Decimal-safe Unit Economics
  const cac = 80; // $80 to acquire 1 new subscriber
  const newCustomersThisMonth = Math.floor(marketingBudget / cac);
  const churnRate = 0.05; // 5% monthly churn
  const churnedCustomers = Math.floor(activeCustomers * churnRate);
  const netCustomers = Math.max(1, activeCustomers + newCustomersThisMonth - churnedCustomers);

  const monthlyRevenue = decimalRound(netCustomers * pricePerUser, 2);
  const cogs = decimalRound(monthlyRevenue * 0.15, 2); // 15% hosting and payment processing
  const grossProfit = decimalRound(monthlyRevenue - cogs, 2);
  const opex = decimalRound(marketingBudget + engineeringBudget, 2);
  const monthlyEBITDA = decimalRound(grossProfit - opex, 2);

  const monthlyNetBurn = monthlyEBITDA < 0 ? Math.abs(monthlyEBITDA) : 0;
  const runwayMonths =
    monthlyNetBurn > 0 ? (cashTreasury / monthlyNetBurn).toFixed(1) : "Profitable (Infinite)";

  // LTV & CAC health
  const ltv = decimalRound(pricePerUser / churnRate, 2); // $49 / 0.05 = $980
  const ltvCacRatio = decimalRound(ltv / cac, 1);

  // Founder events per month
  const monthlyMilestoneNotes = [
    "Seed launch: Optimizing onboarding conversion and initial user feedback.",
    "Product iteration: Reducing feature friction to keep churn under control.",
    "Marketing expansion: Testing acquisition channels and paid search keywords.",
    "Enterprise interest: First multi-seat team requests custom security review.",
    "Hiring milestone: Scaling engineering to reduce bugs and maintain uptime.",
    "Halfway mark: Assessing 6-month burn rate against customer lifetime value.",
    "Retention focus: Launching automated engagement emails to cut customer churn.",
    "Pricing power test: Exploring tier expansions and premium add-on modules.",
    "Cash conservation: Balancing aggressive marketing against remaining treasury.",
    "Runway optimization: Aligning cost structure toward positive operating cash flow.",
    "Series A preparation: Preparing cohort metrics, churn rates, and EBITDA margins.",
    "Fiscal year completion: Evaluating 12-month sustainability and enterprise valuation.",
  ];

  function handleAdvanceMonth() {
    const nextCash = decimalRound(cashTreasury + monthlyEBITDA, 2);
    const nextMonth = month + 1;
    const currentMilestone = monthlyMilestoneNotes[month - 1] || "Ongoing operational cycle";

    setCashTreasury(Math.max(0, nextCash));
    setActiveCustomers(netCustomers);
    setMonth(nextMonth);

    setHistory((prev) => [
      ...prev,
      {
        month,
        event: currentMilestone,
        revenue: monthlyRevenue,
        ebitda: monthlyEBITDA,
        treasury: Math.max(0, nextCash),
        customers: netCustomers,
      },
    ]);

    // End condition: Treasury exhausted or 12 months completed
    if (nextCash <= 0 || nextMonth > 12) {
      setGameOver(true);
    }
  }

  function handleReset() {
    setCashTreasury(100000);
    setActiveCustomers(150);
    setPricePerUser(49);
    setMarketingBudget(4000);
    setEngineeringBudget(7000);
    setMonth(1);
    setHistory([]);
    setGameOver(false);
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
          scenarioType: "startup_builder",
          initialBalance: 100000,
          parameters: {
            finalCashTreasury: cashTreasury,
            finalCustomers: activeCustomers,
            finalRevenue: monthlyRevenue,
            finalEBITDA: monthlyEBITDA,
            runwayMonths,
            survivedMonths: history.length,
            isProfitable: monthlyEBITDA >= 0,
          },
        }),
      });

      if (res.status === 401) {
        setSaveStatus("unauthenticated");
        setSaveMessage("Please log in to record startup simulations to your FinGrow profile.");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to save simulation");
      }

      setSaveStatus("saved");
      setSaveMessage("Startup Builder run recorded to your FinGrow profile!");
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
          <Badge variant="emerald" size="sm">SIMULATION 5 OF 5</Badge>
          <VirtualFundsBadge />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-fingrow-midnight tracking-tight">
          Startup Builder & Runway Engine
        </h1>
        <p className="text-sm text-fingrow-midnight/70 leading-relaxed max-w-2xl">
          Lead a software venture with $100,000 in virtual seed capital. Balance engineering spend, customer acquisition marketing (CAC), and customer churn to reach positive EBITDA before your cash runway burns to zero!
        </p>
      </div>

      {/* Virtual Disclaimer Banner */}
      <VirtualDisclaimerBanner
        scenarioName="Startup Runway Engine"
        assumptions={[
          "Initial $100,000 treasury is 100% simulated play money. No corporate equity, legal entity, or commercial risk is involved.",
          "Customer Acquisition Cost (CAC) is fixed at $80 per customer. Churn rate defaults to 5.0% monthly.",
          "COGS (Cost of Goods Sold) models 15% hosting and cloud compute overhead per dollar of revenue generated.",
          "EBITDA = Gross Profit - Operating Expenses (Engineering + Marketing). Reaching positive EBITDA achieves self-sustaining runway.",
        ]}
      />

      {/* Dashboard KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-fingrow-midnight text-white border-0 shadow-lg">
          <CardContent className="pt-6 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-fingrow-lime uppercase">Virtual Treasury</span>
              <Flame className={`w-3.5 h-3.5 ${monthlyEBITDA < 0 ? "text-fingrow-coral" : "text-fingrow-lime"}`} />
            </div>
            <div className="text-2xl font-extrabold text-white">{formatCurrency(cashTreasury)}</div>
            <p className="text-[10px] text-white/60">
              Runway: <strong className="text-white">{runwayMonths} {runwayMonths !== "Profitable (Infinite)" ? "mos" : ""}</strong>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-1">
            <span className="text-[10px] font-bold text-fingrow-midnight/60 uppercase">Monthly Revenue</span>
            <div className="text-2xl font-extrabold text-fingrow-midnight">{formatCurrency(monthlyRevenue)}</div>
            <p className="text-[10px] text-fingrow-midnight/60">{netCustomers} Paying Subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-1">
            <span className="text-[10px] font-bold text-fingrow-midnight/60 uppercase">Monthly EBITDA</span>
            <div
              className={`text-2xl font-extrabold ${
                monthlyEBITDA >= 0 ? "text-fingrow-emerald" : "text-fingrow-coral"
              }`}
            >
              {monthlyEBITDA >= 0 ? `+${formatCurrency(monthlyEBITDA)}` : formatCurrency(monthlyEBITDA)}
            </div>
            <p className="text-[10px] text-fingrow-midnight/60">
              {monthlyEBITDA >= 0 ? "✓ Cash-Flow Positive" : `Burning ${formatCurrency(monthlyNetBurn)}/mo`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-1">
            <span className="text-[10px] font-bold text-fingrow-midnight/60 uppercase">Timeline Progress</span>
            <div className="text-2xl font-extrabold text-fingrow-midnight">Month {month} / 12</div>
            <p className="text-[10px] text-fingrow-midnight/60">Goal: 12 Mos Survival</p>
          </CardContent>
        </Card>
      </div>

      {!gameOver ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Controls */}
          <Card className="space-y-6 p-6 border-fingrow-midnight/15 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-fingrow-midnight/10">
              <h3 className="font-bold text-base text-fingrow-midnight">Operational Budget Levers</h3>
              <Badge variant="emerald" size="sm">MONTH {month}</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-fingrow-midnight">
                <span>Product & Engineering Payroll</span>
                <span className="text-fingrow-emerald">{formatCurrency(engineeringBudget)}</span>
              </div>
              <input
                type="range"
                min={2000}
                max={15000}
                step={500}
                value={engineeringBudget}
                onChange={(e) => setEngineeringBudget(Number(e.target.value))}
                className="w-full accent-fingrow-emerald cursor-pointer"
              />
              <p className="text-[10px] text-fingrow-midnight/50">Core development, infrastructure stability, and support</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-fingrow-midnight">
                <span>Customer Acquisition Marketing (CAC)</span>
                <span className="text-fingrow-emerald">{formatCurrency(marketingBudget)}</span>
              </div>
              <input
                type="range"
                min={1000}
                max={12000}
                step={500}
                value={marketingBudget}
                onChange={(e) => setMarketingBudget(Number(e.target.value))}
                className="w-full accent-fingrow-emerald cursor-pointer"
              />
              <p className="text-[10px] text-fingrow-midnight/60">
                At $80 CAC, acquires <strong>+{newCustomersThisMonth} new customers</strong> this month (against -{churnedCustomers} churned).
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-fingrow-midnight">
                <span>Subscription Price Per User</span>
                <span className="text-fingrow-emerald">${pricePerUser}/mo</span>
              </div>
              <input
                type="range"
                min={19}
                max={99}
                step={5}
                value={pricePerUser}
                onChange={(e) => setPricePerUser(Number(e.target.value))}
                className="w-full accent-fingrow-emerald cursor-pointer"
              />
              <p className="text-[10px] text-fingrow-midnight/50">
                Customer Lifetime Value (LTV): <strong>${ltv}</strong> ({ltvCacRatio}x CAC)
              </p>
            </div>

            <Button size="lg" variant="primary" className="w-full" onClick={handleAdvanceMonth}>
              <span>Advance to Month {month + 1} →</span>
            </Button>
          </Card>

          {/* Educational Financial Statement Breakdown */}
          <Card className="space-y-4 p-6 bg-fingrow-ivory border-fingrow-midnight/10">
            <div className="flex items-center justify-between pb-2 border-b border-fingrow-midnight/10">
              <h3 className="font-bold text-base text-fingrow-midnight">Monthly Financial P&L Statement</h3>
              <span className="text-xs font-mono text-fingrow-midnight/60">Month {month}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-fingrow-midnight/10">
                <span className="font-semibold text-fingrow-midnight">
                  Gross Revenue ({netCustomers} users × ${pricePerUser})
                </span>
                <strong className="text-fingrow-midnight">{formatCurrency(monthlyRevenue)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-fingrow-midnight/10 text-fingrow-midnight/70">
                <span>COGS (15% cloud servers & payment fees)</span>
                <span>-{formatCurrency(cogs)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-fingrow-midnight/10 font-bold text-fingrow-emerald">
                <span>Gross Profit (85% Margin)</span>
                <span>{formatCurrency(grossProfit)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-fingrow-midnight/10 text-fingrow-midnight/70">
                <span>Total OPEX (Eng ${engineeringBudget} + Mktg ${marketingBudget})</span>
                <span>-{formatCurrency(opex)}</span>
              </div>
              <div
                className={`flex justify-between py-2 text-sm font-extrabold ${
                  monthlyEBITDA >= 0 ? "text-fingrow-emerald" : "text-fingrow-coral"
                }`}
              >
                <span>Operating EBITDA</span>
                <span>{formatCurrency(monthlyEBITDA)}</span>
              </div>
            </div>

            {/* Educational takeaway */}
            <div className="p-3.5 rounded-xl bg-white border border-fingrow-midnight/10 text-xs text-fingrow-midnight/80 space-y-1">
              <strong className="text-fingrow-midnight block font-bold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-fingrow-emerald" />
                Startup Unit Economics Lesson:
              </strong>
              <p className="text-[11px] leading-relaxed">
                Your LTV-to-CAC ratio is <strong>{ltvCacRatio}x</strong>. A healthy SaaS benchmark is <strong>3x or higher</strong>. If your CAC exceeds LTV, increasing marketing spend only accelerates bankruptcy. Positive EBITDA is what makes a venture truly independent.
              </p>
            </div>
          </Card>
        </div>
      ) : (
        /* GAME OVER / VICTORY SCREEN */
        <div className="bg-fingrow-midnight text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="space-y-2">
            <Badge variant={cashTreasury > 0 ? "lime" : "coral"}>
              {cashTreasury > 0 ? "12-MONTH VENTURE SURVIVED" : "RUNWAY EXHAUSTED (CASH ZERO)"}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              {cashTreasury > 0 ? "Venture Scaled & Sustainable!" : "Startup Depleted Treasury"}
            </h2>
            <p className="text-white/70 text-sm max-w-lg mx-auto leading-relaxed">
              {cashTreasury > 0 ? (
                <>
                  Congratulations! You concluded the 12-month seed cycle with{" "}
                  <strong>{formatCurrency(cashTreasury)}</strong> remaining in treasury and monthly EBITDA of{" "}
                  <strong className="text-fingrow-lime">{formatCurrency(monthlyEBITDA)}</strong> with{" "}
                  <strong>{activeCustomers}</strong> active paying subscribers.
                </>
              ) : (
                <>
                  Your burn rate exceeded incoming customer revenues before cash reserves could sustain operations. In venture building, understanding cash runway is the ultimate survival metric.
                </>
              )}
            </p>
          </div>

          {/* Outcome Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left">
            <div className="p-3 bg-white/10 rounded-xl text-xs space-y-1">
              <span className="text-white/60 block">Ending Treasury</span>
              <strong className="text-base text-white">{formatCurrency(cashTreasury)}</strong>
            </div>
            <div className="p-3 bg-white/10 rounded-xl text-xs space-y-1">
              <span className="text-white/60 block">Monthly Revenue Run-Rate</span>
              <strong className="text-base text-fingrow-lime">{formatCurrency(monthlyRevenue)}</strong>
            </div>
            <div className="p-3 bg-white/10 rounded-xl text-xs space-y-1">
              <span className="text-white/60 block">Final Monthly EBITDA</span>
              <strong
                className={`text-base ${
                  monthlyEBITDA >= 0 ? "text-fingrow-lime" : "text-fingrow-coral"
                }`}
              >
                {formatCurrency(monthlyEBITDA)}
              </strong>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl max-w-lg mx-auto text-left text-xs font-mono text-white/80 space-y-1 max-h-48 overflow-y-auto">
            <strong className="text-white block font-sans mb-1">Monthly Venture Ledger:</strong>
            {history.map((h, i) => (
              <div key={i} className="py-0.5 border-b border-white/5 last:border-0">
                <span className="text-fingrow-lime">Month {h.month}:</span> Rev: ${h.revenue} | EBITDA: ${h.ebitda} | Treasury: ${h.treasury} ({h.customers} users)
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" variant="accent" onClick={handleReset} className="font-bold w-full sm:w-auto">
              <RotateCcw className="w-4 h-4 mr-2" />
              <span>Restart Venture</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={saveStatus === "saving"}
              onClick={handleSaveSimulation}
              className="font-bold border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4 mr-2 text-fingrow-lime" />
              <span>{saveStatus === "saving" ? "Saving..." : "Save Run to Profile"}</span>
            </Button>
          </div>

          {/* Persistence notification banner */}
          {saveStatus !== "idle" && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold max-w-lg mx-auto ${
                saveStatus === "saved"
                  ? "bg-fingrow-emerald/20 text-fingrow-lime border border-fingrow-lime/30"
                  : saveStatus === "unauthenticated"
                  ? "bg-fingrow-tangerine/20 text-fingrow-tangerine border border-fingrow-tangerine/30"
                  : "bg-fingrow-coral/20 text-fingrow-coral border border-fingrow-coral/30"
              }`}
            >
              <span>{saveMessage}</span>
              {saveStatus === "unauthenticated" && (
                <a href="/login" className="underline font-bold ml-2 text-white hover:opacity-80">
                  Log In
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
