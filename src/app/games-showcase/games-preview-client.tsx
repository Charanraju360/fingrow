"use client";

import React, { useState, useEffect } from "react";
import { Zap, CheckCircle2, XCircle, RotateCcw, Trophy, Flame, Swords, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MiniQuestion {
  prompt: string;
  options: string[];
  correct: number;
  tip: string;
}

const SAMPLE_QUESTIONS: MiniQuestion[] = [
  {
    prompt: "If an investment grows at 7.2% per year, approximately how many years does it take to double (Rule of 72)?",
    options: ["5 years", "10 years", "14 years"],
    correct: 1,
    tip: "72 ÷ 7.2 = 10 years! The Rule of 72 is an easy mental math shortcut to estimate compounding doubling time.",
  },
  {
    prompt: "Which asset class has historically provided the highest long-term inflation hedge?",
    options: ["Broad Market Equities / Index Funds", "Physical Cash", "Short-term CDs"],
    correct: 0,
    tip: "Over multi-decade horizons, diversified equity index funds have historically outpaced inflation by 6-7% annualized.",
  },
  {
    prompt: "What does maintaining an active daily streak primarily build in behavioral finance?",
    options: ["Speculative leverage", "Consistent daily compounding habit", "Margin debt"],
    correct: 1,
    tip: "Consistent daily engagement creates lasting financial habits without burnout or impulsive emotional trading.",
  },
];

export function GamesPreviewClient() {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(3);

  const q = SAMPLE_QUESTIONS[qIndex];

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correct) {
      setScore((s) => s + 50);
      setStreak((st) => st + 1);
    }
  }

  function handleNext() {
    setSelected(null);
    setQIndex((prev) => (prev + 1) % SAMPLE_QUESTIONS.length);
  }

  return (
    <div className="bg-fingrow-midnight text-white rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fingrow-coral flex items-center justify-center">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Live Speed Battle Sandbox</h3>
            <p className="text-xs text-white/60">Test your reflexes before entering the live arena</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-fingrow-tangerine">
            <Flame className="w-4 h-4 fill-fingrow-tangerine" />
            <span>{streak} Day Streak</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-fingrow-lime">
            <Trophy className="w-4 h-4" />
            <span>+{score} XP Earned</span>
          </div>
        </div>
      </div>

      <div className="pt-6 max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="lime" size="sm">
            SAMPLE ARENA CHALLENGE #{qIndex + 1}
          </Badge>
          <h4 className="text-lg sm:text-xl font-bold text-white leading-snug">
            {q.prompt}
          </h4>
        </div>

        <div className="space-y-2.5">
          {q.options.map((opt, idx) => {
            const isSelected = selected === idx;
            const isCorrect = idx === q.correct;
            let style = "bg-white/5 border-white/10 text-white/80 hover:bg-white/10";

            if (selected !== null) {
              if (isCorrect) {
                style = "bg-fingrow-emerald/50 border-fingrow-emerald text-white font-bold";
              } else if (isSelected && !isCorrect) {
                style = "bg-fingrow-coral/40 border-fingrow-coral text-white font-bold";
              } else {
                style = "bg-white/5 border-transparent text-white/30";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(idx)}
                disabled={selected !== null}
                className={`w-full p-4 rounded-2xl border text-left text-sm transition-all flex items-center justify-between ${style}`}
              >
                <span>{opt}</span>
                {selected !== null && isCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-fingrow-lime" />
                )}
                {selected !== null && isSelected && !isCorrect && (
                  <XCircle className="w-4 h-4 text-fingrow-coral" />
                )}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${selected === q.correct ? "text-fingrow-lime" : "text-fingrow-coral"}`}>
                {selected === q.correct ? "✓ Spot On! +50 XP" : "✗ Good try!"}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="text-xs font-bold text-white/80 hover:text-white underline inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Try Next Sample
              </button>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">{q.tip}</p>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="/games/quick" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" className="w-full">
              <span>Start 5-Question Solo Speed Run</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
          <a href="/games/battle" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full text-white border-white/30 hover:bg-white/10">
              Create 1v1 Room Code
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
