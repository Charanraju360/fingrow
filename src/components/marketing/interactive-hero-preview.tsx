"use client";

import React, { useState } from "react";
import { TrendingUp, Sparkles, CheckCircle2, XCircle, ArrowRight, RotateCcw, Cpu, Trophy, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    question: "What happens to bond prices when central bank interest rates rise?",
    options: ["Bond prices fall", "Bond prices rise", "Bond coupons increase immediately"],
    correctIndex: 0,
    explanation: "Bond prices and interest rates have an inverse relationship. When new bonds pay higher rates, older bonds become less attractive unless discounted.",
  },
  {
    question: "Which metric measures core operating profitability before interest, taxes, and non-cash depreciation?",
    options: ["Gross Margin", "EBITDA", "Free Cash Flow to Equity"],
    correctIndex: 1,
    explanation: "EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization) strips non-operating and non-cash costs to reveal operational performance.",
  },
  {
    question: "Under the popular 50/30/20 budgeting rule, what should the 20% bucket be allocated towards?",
    options: ["Dining & Entertainment", "Investments, Debt Payoff & Savings", "Mortgage & Utilities"],
    correctIndex: 1,
    explanation: "20% is earmarked for financial freedom: emergency savings, index fund investments, and accelerated high-interest debt repayment.",
  },
];

export function InteractiveHeroPreview() {
  // Simulator 1: Salary State
  const [salary, setSalary] = useState<number>(4000);
  const needs = Math.round(salary * 0.5);
  const wants = Math.round(salary * 0.3);
  const savings = Math.round(salary * 0.2);

  // Simulator 2: SIP State
  const [monthlySip, setMonthlySip] = useState<number>(500);
  const [sipYears, setSipYears] = useState<number>(10);
  const annualRate = 0.12; // 12% p.a.
  const monthlyRate = annualRate / 12;
  const totalMonths = sipYears * 12;
  const totalInvested = monthlySip * totalMonths;
  // SIP Future Value formula: P * [((1 + i)^n - 1) / i] * (1 + i)
  const sipFutureValue = Math.round(
    monthlySip * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate)
  );
  const compoundGain = Math.max(0, sipFutureValue - totalInvested);

  // Simulator 3: Trivia State
  const [triviaIndex, setTriviaIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  const currentTrivia = TRIVIA_QUESTIONS[triviaIndex];

  function handleSelectOption(index: number) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
  }

  function handleNextTrivia() {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTriviaIndex((prev) => (prev + 1) % TRIVIA_QUESTIONS.length);
  }

  return (
    <div className="relative rounded-3xl bg-fingrow-midnight text-white p-6 sm:p-8 lg:p-10 shadow-2xl border border-white/10 overflow-hidden">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fingrow-emerald flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-fingrow-lime" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">Live Virtual Simulation Engine</h3>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-fingrow-lime/20 text-fingrow-lime">
                INTERACTIVE PREVIEW
              </span>
            </div>
            <p className="text-xs text-white/60">Real-time educational financial models • Zero risk</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="lime" size="sm">
            ● SIMULATED ENGINE ACTIVE
          </Badge>
          <span className="text-xs text-white/50 hidden md:inline">USD $50,000 Sandbox</span>
        </div>
      </div>

      {/* 3 Interactive Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {/* Module 1: First Salary & Budget */}
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/70">First Salary Allocation</span>
              <span className="text-xs font-bold text-fingrow-lime bg-white/5 px-2 py-0.5 rounded">
                50/30/20 Rule
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-extrabold text-white">
                ${salary.toLocaleString()} <span className="text-xs font-normal text-white/60">/ mo</span>
              </div>
              <span className="text-[11px] text-white/50">Drag to adjust</span>
            </div>

            {/* Salary Slider */}
            <div>
              <input
                type="range"
                min="2000"
                max="10000"
                step="500"
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
                className="w-full accent-fingrow-lime cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                aria-label="Monthly Salary Slider"
              />
            </div>

            {/* Breakdown bars */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Needs (50%)</span>
                <span className="text-white font-medium">${needs.toLocaleString()}</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-fingrow-emerald h-full w-1/2 rounded-full transition-all duration-300" />
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-white/70">Wants (30%)</span>
                <span className="text-white font-medium">${wants.toLocaleString()}</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-fingrow-coral h-full w-[30%] rounded-full transition-all duration-300" />
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-white/70">Savings & Freedom (20%)</span>
                <span className="text-white font-medium">${savings.toLocaleString()}</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-fingrow-lime h-full w-[20%] rounded-full transition-all duration-300" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <a href="/simulations/first-salary" className="block">
              <Button size="sm" variant="outline" className="w-full text-xs text-white border-white/20 hover:bg-white/10 justify-between">
                <span>Open Salary Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>
        </div>

        {/* Module 2: SIP & Compound Wealth */}
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/70">SIP Compound Wealth</span>
              <span className="text-xs font-bold text-fingrow-emerald bg-fingrow-emerald/20 px-2 py-0.5 rounded">
                +12% p.a.
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-extrabold text-fingrow-lime">
                ${sipFutureValue.toLocaleString()}
              </div>
              <span className="text-[11px] text-white/50">{sipYears} Year Total</span>
            </div>

            {/* SIP Inputs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>Monthly: <strong>${monthlySip}</strong></span>
                <div className="flex gap-1">
                  {[5, 10, 20].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setSipYears(yr)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        sipYears === yr ? "bg-fingrow-lime text-fingrow-midnight" : "bg-white/10 text-white/60 hover:bg-white/20"
                      }`}
                    >
                      {yr}y
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={monthlySip}
                onChange={(e) => setMonthlySip(Number(e.target.value))}
                className="w-full accent-fingrow-lime cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                aria-label="Monthly SIP Amount Slider"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1 text-xs">
              <div className="flex justify-between text-white/60">
                <span>Principal Invested:</span>
                <span className="text-white font-medium">${totalInvested.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-fingrow-lime">
                <span>Compound Gains:</span>
                <span className="font-bold">+${compoundGain.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <a href="/simulations/sip" className="block">
              <Button size="sm" variant="accent" className="w-full text-xs justify-between font-bold">
                <span>Open Full SIP Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>
        </div>

        {/* Module 3: 1v1 Battle Arena / Interactive Trivia */}
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/70">Interactive Trivia Round</span>
              <Badge variant="coral" size="sm">
                1v1 ARENA
              </Badge>
            </div>

            <div className="text-sm font-bold text-white leading-snug min-h-[40px]">
              &quot;{currentTrivia.question}&quot;
            </div>

            {/* Answer Options */}
            <div className="space-y-1.5 pt-1">
              {currentTrivia.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === currentTrivia.correctIndex;
                let btnStyle = "bg-white/5 text-white/80 hover:bg-white/10 border-white/10";

                if (selectedAnswer !== null) {
                  if (isCorrect) {
                    btnStyle = "bg-fingrow-emerald/40 border-fingrow-emerald text-white font-semibold";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "bg-fingrow-coral/30 border-fingrow-coral text-white font-semibold";
                  } else {
                    btnStyle = "bg-white/5 text-white/40 border-transparent opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={selectedAnswer !== null}
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl border transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {selectedAnswer !== null && isCorrect && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-fingrow-lime flex-shrink-0" />
                    )}
                    {selectedAnswer !== null && isSelected && !isCorrect && (
                      <XCircle className="w-3.5 h-3.5 text-fingrow-coral flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Explanation */}
            {showExplanation && (
              <div className="text-[11px] leading-relaxed p-2.5 rounded-xl bg-white/10 border border-white/10 space-y-1 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${selectedAnswer === currentTrivia.correctIndex ? "text-fingrow-lime" : "text-fingrow-coral"}`}>
                    {selectedAnswer === currentTrivia.correctIndex ? "✓ Correct! +50 XP" : "✗ Not quite"}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextTrivia}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-white/80 hover:text-white underline underline-offset-2"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    Next Question
                  </button>
                </div>
                <p className="text-white/70">{currentTrivia.explanation}</p>
              </div>
            )}
          </div>

          <div className="pt-2">
            <a href="/games/quick" className="block">
              <Button size="sm" variant="outline" className="w-full text-xs text-white border-white/20 hover:bg-white/10 justify-between">
                <span>Play Quick Round</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
