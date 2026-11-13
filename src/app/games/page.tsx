import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  Gamepad2,
  Swords,
  Flame,
  Award,
  Zap,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "FinGrow Games Lobby — 1v1 Battles & Quick Trivia",
  description: "Compete in live financial trivia, challenge friends in 1v1 duels, earn XP, and climb the leaderboard.",
};

export default async function GamesLobbyPage() {
  const session = await getCurrentUser();
  const user = session ? db.users.getById(session.userId) : null;
  const leaders = db.games.getLeaderboard().slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-fingrow-midnight via-[#0a1b2b] to-fingrow-midnight text-white rounded-3xl p-8 shadow-xl border border-white/10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fingrow-lime/20 text-fingrow-lime text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SEASON 1 ACTIVE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Financial Game Arena
          </h1>
          <p className="text-sm text-white/70 max-w-xl leading-relaxed">
            Test your knowledge under time pressure. Complete daily rounds, maintain your streak flame, and duel peers in real-time rooms.
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
            <div className="text-center px-3 border-r border-white/20">
              <Flame className="w-6 h-6 text-fingrow-tangerine fill-fingrow-tangerine mx-auto" />
              <div className="text-xs text-white/60 font-semibold mt-1">Streak</div>
              <div className="text-xl font-extrabold text-white">{user.streakDays}d</div>
            </div>
            <div className="text-center px-3">
              <Award className="w-6 h-6 text-fingrow-lime mx-auto" />
              <div className="text-xs text-white/60 font-semibold mt-1">Total XP</div>
              <div className="text-xl font-extrabold text-fingrow-lime">{user.xp}</div>
            </div>
          </div>
        )}
      </div>

      {/* Game Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Quick Trivia Mode */}
        <Card className="hover:border-fingrow-emerald transition-all flex flex-col justify-between">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-fingrow-emerald/10 text-fingrow-emerald flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <Badge variant="emerald">SOLO SPEED</Badge>
            </div>
            <div>
              <h3 className="font-bold text-2xl text-fingrow-midnight">Quick Financial Sprint</h3>
              <p className="text-sm text-fingrow-midnight/70 mt-2 leading-relaxed">
                5 rapid-fire questions covering personal finance, stock order books, interest math, and business metrics. 15-second countdown timer per question.
              </p>
            </div>
            <div className="p-3 bg-fingrow-ivory rounded-xl text-xs space-y-1">
              <div className="flex justify-between text-fingrow-midnight/70">
                <span>Time Per Question:</span>
                <strong className="text-fingrow-midnight">15 Seconds</strong>
              </div>
              <div className="flex justify-between text-fingrow-midnight/70">
                <span>Potential Reward:</span>
                <strong className="text-fingrow-emerald">+100 to +500 XP</strong>
              </div>
            </div>
          </CardContent>
          <div className="p-6 pt-0">
            <a href="/games/quick">
              <Button size="lg" variant="primary" className="w-full justify-between">
                <span>Play Quick Sprint</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </Card>

        {/* 1v1 Battle Arena */}
        <Card className="hover:border-fingrow-coral transition-all flex flex-col justify-between">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-fingrow-coral/15 text-fingrow-coral flex items-center justify-center">
                <Swords className="w-6 h-6" />
              </div>
              <Badge variant="coral">HEAD-TO-HEAD</Badge>
            </div>
            <div>
              <h3 className="font-bold text-2xl text-fingrow-midnight">1v1 Battle Duel</h3>
              <p className="text-sm text-fingrow-midnight/70 mt-2 leading-relaxed">
                Generate a 6-character private duel code. Share it with a classmate or friend to battle on identical questions with server-authoritative scoring.
              </p>
            </div>
            <div className="p-3 bg-fingrow-ivory rounded-xl text-xs space-y-1">
              <div className="flex justify-between text-fingrow-midnight/70">
                <span>Game Engine:</span>
                <strong className="text-fingrow-midnight">Private Room Codes</strong>
              </div>
              <div className="flex justify-between text-fingrow-midnight/70">
                <span>Winner Bonus:</span>
                <strong className="text-fingrow-coral">+150 XP Bonus</strong>
              </div>
            </div>
          </CardContent>
          <div className="p-6 pt-0">
            <a href="/games/battle">
              <Button size="lg" variant="danger" className="w-full justify-between">
                <span>Enter 1v1 Duel Arena</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </Card>
      </div>

      {/* Leaderboard Snapshot */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-fingrow-midnight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-fingrow-yellow" />
              <span>Top Financial Minds</span>
            </h2>
            <p className="text-xs text-fingrow-midnight/60">Ranked by total earned XP across learning & games</p>
          </div>
          <a href="/games/leaderboard">
            <Button size="sm" variant="outline" className="text-xs">
              View All Rankings →
            </Button>
          </a>
        </div>

        <div className="bg-white rounded-3xl border border-fingrow-midnight/10 shadow-finCard divide-y divide-fingrow-midnight/5">
          {leaders.map((lead, idx) => (
            <div key={lead.id} className="p-4 sm:px-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs ${
                    idx === 0
                      ? "bg-fingrow-yellow text-fingrow-midnight"
                      : idx === 1
                      ? "bg-fingrow-midnight/10 text-fingrow-midnight"
                      : idx === 2
                      ? "bg-fingrow-tangerine/20 text-fingrow-tangerine"
                      : "text-fingrow-midnight/40"
                  }`}
                >
                  {idx + 1}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-fingrow-midnight">{lead.name}</h4>
                  <span className="text-[11px] text-fingrow-midnight/50 capitalize">
                    {lead.role.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1 text-fingrow-tangerine">
                  <Flame className="w-3.5 h-3.5 fill-fingrow-tangerine" />
                  <span>{lead.streakDays}d</span>
                </div>
                <div className="text-fingrow-emerald bg-fingrow-emerald/10 px-2.5 py-1 rounded-full">
                  {lead.xp} XP
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

