"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Wallet,
  AlertTriangle,
  ShieldCheck,
  DollarSign,
  TrendingDown,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, decimalRound } from "@/lib/utils";
import {
  VirtualDisclaimerBanner,
  VirtualFundsBadge,
} from "@/components/simulations/VirtualDisclaimer";

interface MonthlyEvent {
  month: number;
  title: string;
  category: string;
  desc: string;
  cost: number;
  lessonTip: string;
  options: {
    label: string;
    description: string;
    useCash?: number;
    useDebt?: number;
    payDebtFirst?: boolean;
  }[];
}

export default function MonthlyBudgetShockPage() {
  const [month, setMonth] = useState<number>(1);
  const [cashBuffer, setCashBuffer] = useState<number>(3000);
  const [creditCardDebt, setCreditCardDebt] = useState<number>(0);
  const [totalInterestPaid, setTotalInterestPaid] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [history, setHistory] = useState<
    { month: number; event: string; decision: string; interestAdded: number; cash: number; debt: number }[]
  >([]);

  // Persistence
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error" | "unauthenticated">("idle");
  const [saveMessage, setSaveMessage] = useState<string>("");

  const monthlyEvents: MonthlyEvent[] = [
    {
      month: 1,
      title: "Automotive Alternator Breakdown",
      category: "Transportation Emergency",
      desc: "Your alternator failed on the highway during your morning commute. The towing fee and certified repair total $950.",
      lessonTip: "Car repairs are irregular but inevitable. Relying on high-APR cards turns a $950 fix into a $1,200+ burden over time.",
      cost: 950,
      options: [
        {
          label: "Pay in full from Emergency Cash Buffer ($950)",
          description: "Absorbs full cost immediately with zero interest or lingering debt.",
          useCash: 950,
          useDebt: 0,
        },
        {
          label: "Put $950 on Credit Card (24% APR interest)",
          description: "Keeps cash buffer untouched, but triggers 2% monthly compounding interest ($19/mo).",
          useCash: 0,
          useDebt: 950,
        },
        {
          label: "Split 50/50 ($475 cash + $475 debt)",
          description: "Partial cushion: preserves half your cash while minimizing interest exposure.",
          useCash: 475,
          useDebt: 475,
        },
      ],
    },
    {
      month: 2,
      title: "Dental Root Canal & Crown",
      category: "Healthcare Deductible",
      desc: "Severe tooth pain requires emergency dental care. After standard insurance copay, the out-of-pocket invoice is $750.",
      lessonTip: "Medical deductibles are one of the most common reasons households without savings fall into debt.",
      cost: 750,
      options: [
        {
          label: "Pay $750 from Cash Reserves",
          description: "Eliminate the bill immediately from emergency savings.",
          useCash: 750,
          useDebt: 0,
        },
        {
          label: "Charge $750 to Credit Card",
          description: "Add to revolving credit balance subject to monthly APR charges.",
          useCash: 0,
          useDebt: 750,
        },
      ],
    },
    {
      month: 3,
      title: "Quarterly Performance Bonus",
      category: "Windfall / Income Boost",
      desc: "Great performance! Your team hit its milestone and you received an unexpected $1,200 post-tax quarterly bonus.",
      lessonTip: "Smart money rule: Always eliminate high-interest debt first before adding to low-yield savings accounts.",
      cost: -1200, // Cash injection
      options: [
        {
          label: "Pay off high-interest credit card debt first, rest to cash",
          description: "Guaranteed 24% risk-free return by extinguishing predatory credit card interest.",
          payDebtFirst: true,
        },
        {
          label: "Add all $1,200 directly into Emergency Savings",
          description: "Keeps debt revolving while maximizing cash liquidity.",
          useCash: -1200,
          useDebt: 0,
        },
      ],
    },
    {
      month: 4,
      title: "Winter Utility Spike & Rent Adjustment",
      category: "Living Cost Surge",
      desc: "An unexpected cold snap drives up heating bills, combined with an annual lease adjustment of $300 this month.",
      lessonTip: "Variable utility bills in summer/winter can strain monthly cash flow if not accounted for in seasonal budgets.",
      cost: 300,
      options: [
        {
          label: "Absorb $300 from Cash Cushion",
          description: "Cover the seasonal surge cleanly from savings.",
          useCash: 300,
          useDebt: 0,
        },
        {
          label: "Charge $300 to Credit Card",
          description: "Finance the utility surge through credit.",
          useCash: 0,
          useDebt: 300,
        },
      ],
    },
    {
      month: 5,
      title: "Work Laptop Screen & Power Supply Died",
      category: "Productivity Equipment",
      desc: "Your primary work laptop won't turn on. A replacement display and charger are required for your job: $450.",
      lessonTip: "Essential tools of income generation must be repaired immediately to prevent lost wages.",
      cost: 450,
      options: [
        {
          label: "Pay $450 from Cash",
          description: "Settle invoice directly from savings buffer.",
          useCash: 450,
          useDebt: 0,
        },
        {
          label: "Charge $450 to Credit Card",
          description: "Add to revolving card balance.",
          useCash: 0,
          useDebt: 450,
        },
      ],
    },
  ];

  const currentEvent = monthlyEvents[month - 1];

  function handleDecision(opt: MonthlyEvent["options"][0]) {
    let newCash = cashBuffer;
    let newDebt = creditCardDebt;
    let monthlyInterest = 0;

    // Apply monthly 2% credit card interest (24% APR / 12) on existing revolving debt
    if (newDebt > 0) {
      monthlyInterest = decimalRound(newDebt * 0.02, 2);
      newDebt = decimalRound(newDebt + monthlyInterest, 2);
    }

    if (opt.payDebtFirst) {
      const bonus = 1200;
      const debtPaid = Math.min(newDebt, bonus);
      newDebt = decimalRound(newDebt - debtPaid, 2);
      const remainingCash = decimalRound(bonus - debtPaid, 2);
      newCash = decimalRound(newCash + remainingCash, 2);
    } else {
      if (opt.useCash) {
        newCash = decimalRound(newCash - opt.useCash, 2);
      }
      if (opt.useDebt) {
        newDebt = decimalRound(newDebt + opt.useDebt, 2);
      }
    }

    const updatedInterestPaid = decimalRound(totalInterestPaid + monthlyInterest, 2);
    setTotalInterestPaid(updatedInterestPaid);
    setCashBuffer(Math.max(0, newCash));
    setCreditCardDebt(newDebt);

    setHistory((prev) => [
      ...prev,
      {
        month,
        event: currentEvent.title,
        decision: opt.label,
        interestAdded: monthlyInterest,
        cash: Math.max(0, newCash),
        debt: newDebt,
      },
    ]);

    if (month < monthlyEvents.length) {
      setMonth((m) => m + 1);
    } else {
      setGameOver(true);
    }
  }

  function handleReset() {
    setMonth(1);
    setCashBuffer(3000);
    setCreditCardDebt(0);
    setTotalInterestPaid(0);
    setGameOver(false);
    setHistory([]);
    setSaveStatus("idle");
    setSaveMessage("");
  }

  async function handleSaveSimulation() {
    setSaveStatus("saving");
    try {
      const netLiquid = decimalRound(cashBuffer - creditCardDebt, 2);
      const res = await fetch("/api/simulations/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          scenarioType: "monthly_budget",
          initialBalance: 3000,
          parameters: {
            finalCashBuffer: cashBuffer,
            finalDebt: creditCardDebt,
            totalInterestPaid,
            netLiquidPosition: netLiquid,
            shocksHandled: history.length,
          },
        }),
      });

      if (res.status === 401) {
        setSaveStatus("unauthenticated");
        setSaveMessage("Please log in to persist simulation records to your profile.");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to save simulation");
      }

      setSaveStatus("saved");
      setSaveMessage("Budget Shock simulation successfully recorded to your FinGrow profile!");
    } catch (err: any) {
      console.error("Save failed", err);
      setSaveStatus("error");
      setSaveMessage("Could not save simulation. Please check your connection.");
    }
  }

  const finalNetLiquid = decimalRound(cashBuffer - creditCardDebt, 2);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
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
          <Badge variant="emerald" size="sm">SIMULATION 2 OF 5</Badge>
          <VirtualFundsBadge />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-fingrow-midnight tracking-tight">
          Monthly Budget & Emergency Shock Simulator
        </h1>
        <p className="text-sm text-fingrow-midnight/70 leading-relaxed">
          Navigate 5 months of realistic unexpected financial shocks. Discover why a dedicated emergency fund serves as your financial shield against predatory 24% credit card debt spirals.
        </p>
      </div>

      {/* Virtual Disclaimer Banner */}
      <VirtualDisclaimerBanner
        scenarioName="Budget Shock Survival"
        assumptions={[
          "All cash reserves and debt balances are 100% simulated numbers with zero real-world financial liability.",
          "Credit card interest is compounded monthly at 2.0% (representing a typical 24% annual APR).",
          "Surprise shocks simulate real-world probabilities of automotive, healthcare, and home emergencies.",
          "Windfalls prioritize paying down high-interest debt first to eliminate compounding interest drag.",
        ]}
      />

      {/* Account Balances Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-fingrow-emerald/30 bg-fingrow-emerald/5">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-fingrow-emerald">
                  Virtual Cash Reserves
                </span>
                <VirtualFundsBadge />
              </div>
              <div className="text-3xl font-extrabold text-fingrow-midnight">
                {formatCurrency(cashBuffer)}
              </div>
              <p className="text-[11px] text-fingrow-midnight/60">Liquid buffer available for emergencies</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-fingrow-emerald/15 text-fingrow-emerald flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-fingrow-coral/30 bg-fingrow-coral/5">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-fingrow-coral">
                  Virtual Credit Debt (24% APR)
                </span>
                <VirtualFundsBadge />
              </div>
              <div className="text-3xl font-extrabold text-fingrow-coral">
                {formatCurrency(creditCardDebt)}
              </div>
              <p className="text-[11px] text-fingrow-midnight/60">
                Interest accrued to date: <strong>{formatCurrency(totalInterestPaid)}</strong>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-fingrow-coral/15 text-fingrow-coral flex items-center justify-center">
              <TrendingDown className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {!gameOver && currentEvent ? (
        <Card className="border-fingrow-midnight/15 shadow-finElevated">
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-fingrow-midnight/10">
              <div className="flex items-center gap-2">
                <Badge variant={currentEvent.cost < 0 ? "lime" : "coral"}>
                  MONTH {month} EVENT
                </Badge>
                <span className="text-xs font-semibold text-fingrow-midnight/60">
                  {currentEvent.category}
                </span>
              </div>
              <span className="text-xs font-bold text-fingrow-midnight/60">
                Month {month} of {monthlyEvents.length}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-fingrow-midnight">{currentEvent.title}</h2>
                <span
                  className={`text-lg font-extrabold ${
                    currentEvent.cost < 0 ? "text-fingrow-emerald" : "text-fingrow-coral"
                  }`}
                >
                  {currentEvent.cost < 0
                    ? `+${formatCurrency(Math.abs(currentEvent.cost))}`
                    : `-${formatCurrency(currentEvent.cost)}`}
                </span>
              </div>
              <p className="text-sm text-fingrow-midnight/70 leading-relaxed">
                {currentEvent.desc}
              </p>
            </div>

            {/* Practical Takeaway Tip Box */}
            <div className="p-3.5 rounded-xl bg-fingrow-ivory border border-fingrow-midnight/10 text-xs text-fingrow-midnight/80 flex items-start gap-2">
              <Info className="w-4 h-4 text-fingrow-emerald flex-shrink-0 mt-0.5" />
              <span>
                <strong>Financial Literacy Principle: </strong>
                {currentEvent.lessonTip}
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-fingrow-midnight/60">
                Select Your Financial Strategy:
              </h4>
              {currentEvent.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDecision(opt)}
                  className="w-full text-left p-4 rounded-xl border border-fingrow-midnight/15 hover:border-fingrow-emerald hover:bg-fingrow-emerald/5 transition-all text-sm font-semibold text-fingrow-midnight flex flex-col sm:flex-row sm:items-center justify-between gap-2 group"
                >
                  <div className="space-y-0.5">
                    <span className="group-hover:text-fingrow-emerald transition-colors font-bold block">
                      {opt.label}
                    </span>
                    <span className="text-xs text-fingrow-midnight/60 font-normal">
                      {opt.description}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-fingrow-midnight/40 group-hover:text-fingrow-emerald transition-colors self-end sm:self-center flex-shrink-0" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* FINISHED SCOREBOARD */
        <div className="bg-fingrow-midnight text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="space-y-2">
            <Badge variant="lime">5-MONTH SIMULATION COMPLETE</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Final Net Liquid Position: {formatCurrency(finalNetLiquid)}
            </h2>
            <p className="text-white/70 text-sm max-w-lg mx-auto leading-relaxed">
              {creditCardDebt === 0 ? (
                <>
                  Outstanding! You navigated all 5 surprise shocks without carrying high-interest debt. Because you maintained cash reserves, you avoided paying hundreds in predatory credit card fees.
                </>
              ) : (
                <>
                  You completed the scenario with <strong>{formatCurrency(creditCardDebt)}</strong> in revolving credit debt, having accumulated <strong>{formatCurrency(totalInterestPaid)}</strong> in interest fees. In real life, 24% APR makes escaping revolving debt difficult without strict debt snowball/avalanche plans.
                </>
              )}
            </p>
          </div>

          {/* Outcome comparison grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-white/10 text-xs space-y-1">
              <span className="text-white/60 block">Remaining Cash Cushion</span>
              <strong className="text-base text-white">{formatCurrency(cashBuffer)}</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 text-xs space-y-1">
              <span className="text-white/60 block">Ending Credit Card Debt</span>
              <strong className="text-base text-fingrow-coral">{formatCurrency(creditCardDebt)}</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 text-xs space-y-1">
              <span className="text-white/60 block">Total Interest Cost Incurred</span>
              <strong className="text-base text-fingrow-lime">+{formatCurrency(totalInterestPaid)}</strong>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl max-w-xl mx-auto text-left text-xs font-mono text-white/80 space-y-1 max-h-48 overflow-y-auto">
            <strong className="text-white block font-sans mb-1">5-Month Transaction Ledger:</strong>
            {history.map((h, i) => (
              <div key={i} className="py-0.5 border-b border-white/5 last:border-0">
                <span className="text-fingrow-lime">Month {h.month}:</span> {h.event} → {h.decision}{" "}
                {h.interestAdded > 0 ? `(+$${h.interestAdded} int)` : ""} [Cash: ${h.cash}, Debt: ${h.debt}]
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" variant="accent" onClick={handleReset} className="font-bold w-full sm:w-auto">
              <RotateCcw className="w-4 h-4 mr-2" />
              <span>Replay Simulation</span>
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
