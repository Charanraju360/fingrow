"use client";

import React, { useState } from "react";
import { Cpu, DollarSign, ShieldAlert, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SimulationsPreviewClient() {
  const [activeTab, setActiveTab] = useState<"salary" | "shock" | "portfolio">("salary");

  // Salary state
  const [income, setIncome] = useState<number>(4500);
  const needs = Math.round(income * 0.5);
  const wants = Math.round(income * 0.3);
  const investments = Math.round(income * 0.2);

  // Shock state
  const [emergencyFund, setEmergencyFund] = useState<number>(3000);
  const [selectedShock, setSelectedShock] = useState<{ title: string; cost: number; impact: string }>({
    title: "Unexpected Car Transmission Breakdown",
    cost: 1400,
    impact: "Covered by emergency buffer without taking high-APR credit card debt.",
  });

  // Portfolio state
  const [riskTolerance, setRiskTolerance] = useState<"Conservative" | "Balanced" | "Aggressive">("Balanced");

  return (
    <div className="bg-fingrow-midnight text-white rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fingrow-emerald flex items-center justify-center">
            <Cpu className="w-5 h-5 text-fingrow-lime" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Interactive Simulator Sandbox</h3>
            <p className="text-xs text-white/60">Simulate financial decisions and test outcomes in real time</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("salary")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === "salary" ? "bg-fingrow-emerald text-white" : "text-white/70 hover:text-white"
            }`}
          >
            Salary 50/30/20
          </button>
          <button
            onClick={() => setActiveTab("shock")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === "shock" ? "bg-fingrow-emerald text-white" : "text-white/70 hover:text-white"
            }`}
          >
            Shock Resilience
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === "portfolio" ? "bg-fingrow-emerald text-white" : "text-white/70 hover:text-white"
            }`}
          >
            Asset Allocation
          </button>
        </div>
      </div>

      {/* Tab 1: Salary 50/30/20 */}
      {activeTab === "salary" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
          <div className="space-y-4">
            <Badge variant="lime" size="sm">REAL-TIME ALLOCATOR</Badge>
            <h4 className="text-2xl font-bold text-white">
              First Salary: ${income.toLocaleString()} / month
            </h4>
            <p className="text-sm text-white/70 leading-relaxed">
              Drag the slider to test how the 50/30/20 principle balances essentials, quality of life, and wealth accumulation at different income levels.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-white/60">
                <span>Monthly Net Pay:</span>
                <span className="text-fingrow-lime font-bold text-sm">${income.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="2500"
                max="12000"
                step="500"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full accent-fingrow-lime cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
                aria-label="Monthly Net Pay Slider"
              />
            </div>
            <div className="pt-2">
              <a href="/simulations/first-salary">
                <Button size="sm" variant="accent" className="font-bold">
                  <span>Launch Full First Salary Simulator</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Needs (50%): Housing, Groceries, Healthcare</span>
                <span className="text-white font-bold">${needs.toLocaleString()}</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-fingrow-emerald h-full w-1/2 rounded-full" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Wants (30%): Dining, Streaming, Shopping, Trips</span>
                <span className="text-white font-bold">${wants.toLocaleString()}</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-fingrow-coral h-full w-[30%] rounded-full" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Freedom & Investments (20%): Index Funds & Buffer</span>
                <span className="text-fingrow-lime font-bold">${investments.toLocaleString()}</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-fingrow-lime h-full w-[20%] rounded-full" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 text-xs text-white/60 border border-white/5">
              💡 <strong>1-Year Projection:</strong> Saving 20% (${investments.toLocaleString()}/mo) yields <strong>${(investments * 12).toLocaleString()}</strong> in liquid resilience in year one.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Shock Resilience */}
      {activeTab === "shock" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
          <div className="space-y-4">
            <Badge variant="coral" size="sm">EMERGENCY PREPAREDNESS</Badge>
            <h4 className="text-2xl font-bold text-white">
              Unexpected Expense Resilience
            </h4>
            <p className="text-sm text-white/70 leading-relaxed">
              Select an unexpected life event to see how an emergency savings fund cushions real-world financial stress.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              {[
                { title: "Car Transmission Breakdown", cost: 1400, impact: "Easily absorbed with your emergency buffer; no credit debt incurred." },
                { title: "Urgent Root Canal & Crown", cost: 850, impact: "Medical buffer covers dental out-of-pocket costs with zero stress." },
                { title: "Sudden Appliance Replacement", cost: 600, impact: "Modest expense absorbed cleanly without tapping stock investments." },
              ].map((shock) => (
                <button
                  key={shock.title}
                  type="button"
                  onClick={() => setSelectedShock(shock)}
                  className={`p-3 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                    selectedShock.title === shock.title
                      ? "bg-fingrow-coral/20 border-fingrow-coral text-white font-bold"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <span>{shock.title}</span>
                  <span className="font-mono text-fingrow-coral">-${shock.cost}</span>
                </button>
              ))}
            </div>
            <div className="pt-2">
              <a href="/simulations/budget">
                <Button size="sm" variant="outline" className="text-white border-white/20 hover:bg-white/10">
                  <span>Launch Monthly Shock Simulator</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
            <h5 className="font-bold text-sm text-white">Emergency Buffer Impact</h5>
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Starting Cash Reserve:</span>
              <span className="font-bold text-white">${emergencyFund.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-fingrow-coral">
              <span>Emergency Expense:</span>
              <span className="font-bold">-${selectedShock.cost.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-sm text-fingrow-lime font-bold">
              <span>Remaining Runway:</span>
              <span>${(emergencyFund - selectedShock.cost).toLocaleString()}</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white/70 leading-relaxed">
              ✅ <strong>Outcome:</strong> {selectedShock.impact}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Asset Allocation */}
      {activeTab === "portfolio" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in">
          <div className="space-y-4">
            <Badge variant="emerald" size="sm">MODERN PORTFOLIO THEORY</Badge>
            <h4 className="text-2xl font-bold text-white">
              Virtual $50,000 Portfolio Allocation
            </h4>
            <p className="text-sm text-white/70 leading-relaxed">
              Pick your risk appetite to view how diversification dampens drawdown volatility during bear markets.
            </p>
            <div className="flex gap-2">
              {(["Conservative", "Balanced", "Aggressive"] as const).map((strat) => (
                <button
                  key={strat}
                  type="button"
                  onClick={() => setRiskTolerance(strat)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                    riskTolerance === strat
                      ? "bg-fingrow-emerald text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {strat}
                </button>
              ))}
            </div>
            <div className="pt-2">
              <a href="/simulations/investing">
                <Button size="sm" variant="accent" className="font-bold">
                  <span>Enter $50,000 Investment Challenge</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
            <h5 className="font-bold text-sm text-white">{riskTolerance} Asset Mix</h5>
            {riskTolerance === "Conservative" && (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-white/70 mb-1">
                    <span>Treasury & Investment-Grade Bonds</span>
                    <span className="font-bold text-white">60% ($30,000)</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-fingrow-emerald h-full w-[60%] rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-white/70 mb-1">
                    <span>Broad Market Index Equities</span>
                    <span className="font-bold text-white">30% ($15,000)</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-fingrow-lime h-full w-[30%] rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-white/70 mb-1">
                    <span>Cash Equivalents & Short Bills</span>
                    <span className="font-bold text-white">10% ($5,000)</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-white/40 h-full w-[10%] rounded-full" />
                  </div>
                </div>
              </div>
            )}

            {riskTolerance === "Balanced" && (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-white/70 mb-1">
                    <span>Broad Market Index Equities</span>
                    <span className="font-bold text-white">60% ($30,000)</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-fingrow-emerald h-full w-[60%] rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-white/70 mb-1">
                    <span>Treasury Bonds & Fixed Income</span>
                    <span className="font-bold text-white">30% ($15,000)</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-fingrow-coral h-full w-[30%] rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-white/70 mb-1">
                    <span>Liquid Buffer / Cash</span>
                    <span className="font-bold text-white">10% ($5,000)</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-fingrow-lime h-full w-[10%] rounded-full" />
                  </div>
                </div>
              </div>
            )}

            {riskTolerance === "Aggressive" && (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-white/70 mb-1">
                    <span>Global Equities & Tech Index</span>
                    <span className="font-bold text-white">85% ($42,500)</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-fingrow-lime h-full w-[85%] rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-white/70 mb-1">
                    <span>Treasury Bonds</span>
                    <span className="font-bold text-white">10% ($5,000)</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-fingrow-emerald h-full w-[10%] rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-white/70 mb-1">
                    <span>Cash Reserves</span>
                    <span className="font-bold text-white">5% ($2,500)</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-white/40 h-full w-[5%] rounded-full" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
