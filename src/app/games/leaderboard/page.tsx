import React from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { ArrowLeft, Trophy, Flame, Users, Award, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LeaderboardClient } from "./leaderboard-client";

export const metadata = {
  title: "Leaderboard & Streaks — FinGrow",
  description:
    "Live global rankings of students, young professionals, and educators mastering financial literacy, building streaks, and winning 1v1 duels.",
};

export default async function LeaderboardPage() {
  const session = await getCurrentUser();
  const leaders = db.gamification.getLeaderboard();
  const allAchievements = db.achievements.getAll();
  const userAchievements = session ? db.achievements.getUserAchievements(session.userId) : [];

  // Platform metrics
  const totalRanked = leaders.length;
  const topXp = leaders.length > 0 ? leaders[0].xp : 0;
  const longestStreak = leaders.length > 0 ? Math.max(...leaders.map((l) => l.streakDays)) : 0;
  const totalBadgesAwarded = leaders.reduce((acc, l) => acc + l.achievementsCount, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Back button */}
      <div>
        <a
          href="/games"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-fingrow-midnight/60 hover:text-fingrow-emerald transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Game Arena</span>
        </a>
      </div>

      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Badge variant="yellow" size="sm">
            <Trophy className="w-3.5 h-3.5 mr-1" />
            GLOBAL STANDINGS
          </Badge>
          <Badge variant="emerald" size="sm">
            <Sparkles className="w-3 h-3 mr-1" />
            REAL PERSISTED DATA
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-fingrow-midnight tracking-tight">
          FinGrow Leaderboard
        </h1>
        <p className="text-sm sm:text-base text-fingrow-midnight/70 max-w-2xl mx-auto leading-relaxed">
          Master foundational finance, maintain unbroken daily learning streaks, and climb the global ranks through interactive quizzes, simulations, and multiplayer battles.
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-fingrow-midnight/10 shadow-finCard flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-fingrow-emerald/10 text-fingrow-emerald flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-fingrow-midnight/50 uppercase tracking-wider block">
              Top Score
            </span>
            <strong className="text-lg font-black text-fingrow-midnight">{topXp} XP</strong>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-fingrow-midnight/10 shadow-finCard flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-fingrow-tangerine/15 text-fingrow-tangerine flex items-center justify-center">
            <Flame className="w-5 h-5 fill-fingrow-tangerine" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-fingrow-midnight/50 uppercase tracking-wider block">
              Longest Streak
            </span>
            <strong className="text-lg font-black text-fingrow-midnight">{longestStreak} Days</strong>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-fingrow-midnight/10 shadow-finCard flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-fingrow-lime/20 text-[#244f00] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-fingrow-midnight/50 uppercase tracking-wider block">
              Active Learners
            </span>
            <strong className="text-lg font-black text-fingrow-midnight">{totalRanked} Ranked</strong>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-fingrow-midnight/10 shadow-finCard flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-fingrow-yellow/30 text-[#704E00] flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-fingrow-midnight/50 uppercase tracking-wider block">
              Badges Mastered
            </span>
            <strong className="text-lg font-black text-fingrow-midnight">{totalBadgesAwarded} Total</strong>
          </div>
        </div>
      </div>

      {/* Interactive Leaderboard Client */}
      <LeaderboardClient
        initialLeaders={leaders}
        currentUserId={session ? session.userId : null}
        allAchievements={allAchievements}
        userAchievements={userAchievements}
      />
    </div>
  );
}
