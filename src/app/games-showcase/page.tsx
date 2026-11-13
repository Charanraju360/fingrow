import React from "react";
import type { Metadata } from "next";
import { Gamepad2, Swords, Trophy, Flame, Zap, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GamesPreviewClient } from "./games-preview-client";

export const metadata: Metadata = {
  title: "Financial Games & Multiplayer Showcase — FinGrow",
  description:
    "Play speed trivia, 1v1 battle arena, and daily challenges. Earn XP, maintain learning streaks, and climb the global leaderboard.",
  openGraph: {
    title: "Financial Games & Multiplayer Showcase — FinGrow",
    description: "Multiplayer financial learning battles, speed trivia, and streak challenges.",
    url: "https://fingrow.dev/games-showcase",
  },
};

export default function GamesShowcasePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <Badge variant="lime" size="sm">GAMIFIED MASTERY</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-fingrow-midnight tracking-tight">
          Learn by Playing & Competing
        </h1>
        <p className="text-fingrow-midnight/70 text-base leading-relaxed">
          Friendly competition accelerates retention. Test your financial instincts under pressure in server-authoritative multiplayer rounds.
        </p>
      </div>

      {/* Interactive Sandbox Preview */}
      <GamesPreviewClient />

      {/* 3 Game Modes Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-fingrow-midnight">Choose Your Game Mode</h2>
          <p className="text-sm text-fingrow-midnight/60">Designed for solo learners, study groups, and classroom tournaments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover:border-fingrow-emerald transition-all">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-fingrow-emerald/10 text-fingrow-emerald flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-fingrow-midnight">Quick Game Solo</h3>
              <p className="text-sm text-fingrow-midnight/70 leading-relaxed">
                5 fast-paced financial questions with a 15-second timer per question. Perfect for your morning commute or study break.
              </p>
              <div className="pt-2">
                <a href="/games/quick">
                  <Button variant="primary" className="w-full justify-between">
                    <span>Play Quick Game</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-fingrow-emerald transition-all">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-fingrow-coral/15 text-fingrow-coral flex items-center justify-center">
                <Swords className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-fingrow-midnight">1v1 Battle Arena</h3>
              <p className="text-sm text-fingrow-midnight/70 leading-relaxed">
                Create a private room code, share with a friend or classmate, and duel head-to-head for XP dominance and bragging rights.
              </p>
              <div className="pt-2">
                <a href="/games/battle">
                  <Button variant="danger" className="w-full justify-between">
                    <span>Enter 1v1 Arena</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-fingrow-emerald transition-all">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-fingrow-yellow/20 text-[#855e00] flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-fingrow-midnight">Leaderboards & Streaks</h3>
              <p className="text-sm text-fingrow-midnight/70 leading-relaxed">
                Track global top performers, view weekly streak legends, and earn verified achievement badges for your profile.
              </p>
              <div className="pt-2">
                <a href="/games/leaderboard">
                  <Button variant="outline" className="w-full justify-between">
                    <span>View Leaderboards</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
