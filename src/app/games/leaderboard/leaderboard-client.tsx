"use client";

import React, { useState, useMemo } from "react";
import {
  Trophy,
  Flame,
  Award,
  Zap,
  Search,
  ArrowUpDown,
  CheckCircle2,
  Lock,
  Sparkles,
  ShieldAlert,
  ArrowLeft,
  Crown,
  Medal,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LeaderboardEntry } from "@/lib/gamification/engine";
import type { AchievementEntity, UserAchievementEntity } from "@/lib/db/seed-data";

interface LeaderboardClientProps {
  initialLeaders: LeaderboardEntry[];
  currentUserId: string | null;
  allAchievements: AchievementEntity[];
  userAchievements: UserAchievementEntity[];
}

export function LeaderboardClient({
  initialLeaders,
  currentUserId,
  allAchievements,
  userAchievements,
}: LeaderboardClientProps) {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"xp" | "streak">("xp");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Unlocked codes set for current user
  const myUnlockedCodes = useMemo(
    () => new Set(userAchievements.map((ua) => ua.achievementCode)),
    [userAchievements]
  );

  // Filtered and sorted list
  const filteredLeaders = useMemo(() => {
    let result = [...initialLeaders];

    if (roleFilter !== "all") {
      result = result.filter(
        (l) => l.role.toLowerCase().replace(/[-\s]/g, "_") === roleFilter
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.role.toLowerCase().includes(q) ||
          l.level.title.toLowerCase().includes(q)
      );
    }

    if (sortBy === "streak") {
      result.sort((a, b) => b.streakDays - a.streakDays || b.xp - a.xp);
    } else {
      result.sort((a, b) => b.xp - a.xp || b.streakDays - a.streakDays);
    }

    return result;
  }, [initialLeaders, roleFilter, sortBy, searchQuery]);

  // Current user's ranking in the active list
  const myRank = useMemo(() => {
    if (!currentUserId) return null;
    const index = filteredLeaders.findIndex((l) => l.id === currentUserId);
    return index >= 0 ? index + 1 : null;
  }, [filteredLeaders, currentUserId]);

  const myEntry = useMemo(() => {
    if (!currentUserId) return null;
    return initialLeaders.find((l) => l.id === currentUserId) || null;
  }, [initialLeaders, currentUserId]);

  // Top 3 Podium
  const top1 = filteredLeaders[0];
  const top2 = filteredLeaders[1];
  const top3 = filteredLeaders[2];

  // Helper for role badge variant
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "student":
        return "emerald";
      case "young_professional":
        return "tangerine";
      case "educator":
        return "lime";
      case "institution_admin":
        return "yellow";
      case "platform_admin":
        return "midnight";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-10">
      {/* Current User Quick Status Strip (if logged in) */}
      {myEntry && (
        <div className="bg-gradient-to-r from-fingrow-midnight via-[#0D2232] to-fingrow-midnight text-white rounded-3xl p-6 sm:p-7 border border-fingrow-emerald/30 shadow-finCard flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-fingrow-emerald flex items-center justify-center font-extrabold text-2xl text-white shadow-md">
              {myEntry.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-lg sm:text-xl text-white">{myEntry.name}</span>
                <Badge variant="lime" size="sm">
                  Lvl {myEntry.level.level} • {myEntry.level.title}
                </Badge>
                <Badge variant="emerald" size="sm">
                  YOU
                </Badge>
              </div>
              <p className="text-xs text-white/70">
                Ranked <strong className="text-fingrow-lime">#{myRank || "—"}</strong> on the FinGrow Global Board
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[85px]">
              <div className="flex items-center justify-center gap-1 text-fingrow-tangerine">
                <Flame className="w-4 h-4 fill-fingrow-tangerine" />
                <span className="text-base font-extrabold text-white">{myEntry.streakDays}d</span>
              </div>
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider block mt-0.5">
                Streak
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[85px]">
              <div className="flex items-center justify-center gap-1 text-fingrow-lime">
                <Award className="w-4 h-4" />
                <span className="text-base font-extrabold text-white">{myEntry.xp}</span>
              </div>
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider block mt-0.5">
                Total XP
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[85px]">
              <div className="flex items-center justify-center gap-1 text-white">
                <Sparkles className="w-4 h-4 text-fingrow-yellow" />
                <span className="text-base font-extrabold text-white">{myEntry.achievementsCount}</span>
              </div>
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider block mt-0.5">
                Badges
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Podium Display (Top 3) */}
      {filteredLeaders.length >= 3 && !searchQuery && (
        <div className="space-y-4">
          <div className="text-center">
            <Badge variant="yellow" size="sm">
              <Crown className="w-3.5 h-3.5 mr-1" />
              HALL OF MASTERY
            </Badge>
            <h2 className="text-2xl font-extrabold text-fingrow-midnight tracking-tight mt-1">
              Top Financial Pioneers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-end">
            {/* Rank 2 (Silver) */}
            {top2 && (
              <div className="order-2 md:order-1 bg-white rounded-3xl p-6 border border-gray-200 shadow-finCard hover:shadow-lg transition-all text-center space-y-3 relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-300 text-gray-700 mx-auto flex items-center justify-center font-extrabold text-xl shadow-sm">
                  <Medal className="w-6 h-6 text-gray-500" />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="w-7 h-7 rounded-xl bg-gray-200 text-gray-700 text-xs font-black inline-flex items-center justify-center">
                    #2
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-fingrow-midnight">{top2.name}</h3>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <Badge variant={getRoleBadgeVariant(top2.role)} size="sm">
                      {top2.role.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-[11px] font-semibold text-fingrow-midnight/60 mt-1">
                    {top2.level.title}
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-around text-xs">
                  <div>
                    <span className="text-[10px] text-fingrow-midnight/50 uppercase font-bold block">XP</span>
                    <strong className="text-fingrow-emerald font-extrabold text-sm">{top2.xp}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-fingrow-midnight/50 uppercase font-bold block">Streak</span>
                    <span className="text-fingrow-tangerine font-extrabold flex items-center justify-center gap-0.5">
                      <Flame className="w-3 h-3 fill-fingrow-tangerine" />
                      {top2.streakDays}d
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 1 (Gold - Elevated) */}
            {top1 && (
              <div className="order-1 md:order-2 bg-gradient-to-b from-[#FFFDF0] to-white rounded-3xl p-7 border-2 border-fingrow-yellow shadow-xl hover:shadow-2xl transition-all text-center space-y-3 relative md:-translate-y-3">
                <div className="w-16 h-16 rounded-2xl bg-fingrow-yellow/30 border-2 border-fingrow-yellow text-yellow-700 mx-auto flex items-center justify-center font-extrabold text-2xl shadow-md">
                  <Crown className="w-8 h-8 text-yellow-600 fill-yellow-500" />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="w-8 h-8 rounded-xl bg-fingrow-yellow text-fingrow-midnight text-xs font-black inline-flex items-center justify-center shadow-sm">
                    #1
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-fingrow-midnight">{top1.name}</h3>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <Badge variant={getRoleBadgeVariant(top1.role)} size="sm">
                      {top1.role.replace("_", " ")}
                    </Badge>
                    <Badge variant="lime" size="sm">Lvl {top1.level.level}</Badge>
                  </div>
                  <p className="text-xs font-bold text-fingrow-emerald mt-1">
                    {top1.level.title}
                  </p>
                </div>
                <div className="pt-2 border-t border-fingrow-yellow/20 flex items-center justify-around text-xs">
                  <div>
                    <span className="text-[10px] text-fingrow-midnight/50 uppercase font-bold block">XP</span>
                    <strong className="text-fingrow-emerald font-black text-base">{top1.xp}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-fingrow-midnight/50 uppercase font-bold block">Streak</span>
                    <span className="text-fingrow-tangerine font-black text-sm flex items-center justify-center gap-0.5">
                      <Flame className="w-3.5 h-3.5 fill-fingrow-tangerine" />
                      {top1.streakDays}d
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-fingrow-midnight/50 uppercase font-bold block">Badges</span>
                    <span className="text-fingrow-midnight font-bold">{top1.achievementsCount}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {top3 && (
              <div className="order-3 md:order-3 bg-white rounded-3xl p-6 border border-fingrow-tangerine/30 shadow-finCard hover:shadow-lg transition-all text-center space-y-3 relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-fingrow-tangerine/15 border border-fingrow-tangerine/30 text-fingrow-tangerine mx-auto flex items-center justify-center font-extrabold text-xl shadow-sm">
                  <Award className="w-6 h-6 text-fingrow-tangerine" />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="w-7 h-7 rounded-xl bg-fingrow-tangerine/20 text-[#8A3E00] text-xs font-black inline-flex items-center justify-center">
                    #3
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-fingrow-midnight">{top3.name}</h3>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <Badge variant={getRoleBadgeVariant(top3.role)} size="sm">
                      {top3.role.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-[11px] font-semibold text-fingrow-midnight/60 mt-1">
                    {top3.level.title}
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-around text-xs">
                  <div>
                    <span className="text-[10px] text-fingrow-midnight/50 uppercase font-bold block">XP</span>
                    <strong className="text-fingrow-emerald font-extrabold text-sm">{top3.xp}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-fingrow-midnight/50 uppercase font-bold block">Streak</span>
                    <span className="text-fingrow-tangerine font-extrabold flex items-center justify-center gap-0.5">
                      <Flame className="w-3 h-3 fill-fingrow-tangerine" />
                      {top3.streakDays}d
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Control Bar: Filters, Sorting & Search */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-fingrow-midnight/10 shadow-finCard space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: "all", label: "All Learners" },
              { id: "student", label: "Students" },
              { id: "young_professional", label: "Young Pros" },
              { id: "educator", label: "Educators" },
            ].map((tab) => {
              const active = roleFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    active
                      ? "bg-fingrow-emerald text-white shadow-sm"
                      : "bg-fingrow-ivory text-fingrow-midnight/70 hover:bg-fingrow-emerald/10 hover:text-fingrow-emerald"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right Tools: Search & Sort Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-fingrow-midnight/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search learner..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-fingrow-ivory border border-fingrow-midnight/10 focus:outline-none focus:ring-2 focus:ring-fingrow-emerald/40 text-fingrow-midnight"
              />
            </div>

            {/* Sort Dropdown / Toggle */}
            <div className="flex items-center rounded-xl bg-fingrow-ivory p-0.5 border border-fingrow-midnight/10 text-xs font-bold">
              <button
                onClick={() => setSortBy("xp")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  sortBy === "xp"
                    ? "bg-white text-fingrow-emerald shadow-sm font-extrabold"
                    : "text-fingrow-midnight/60 hover:text-fingrow-midnight"
                }`}
              >
                XP
              </button>
              <button
                onClick={() => setSortBy("streak")}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  sortBy === "streak"
                    ? "bg-white text-fingrow-tangerine shadow-sm font-extrabold"
                    : "text-fingrow-midnight/60 hover:text-fingrow-midnight"
                }`}
              >
                <Flame className="w-3 h-3 fill-fingrow-tangerine" />
                Streak
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-fingrow-midnight/10 shadow-finCard overflow-hidden">
        {/* Table Header */}
        <div className="p-4 sm:px-6 bg-fingrow-midnight text-white grid grid-cols-12 text-xs font-bold uppercase tracking-wider">
          <span className="col-span-2 sm:col-span-1">Rank</span>
          <span className="col-span-6 sm:col-span-5">Learner</span>
          <span className="hidden sm:block sm:col-span-2 text-center">Level</span>
          <span className="col-span-2 text-center">Streak</span>
          <span className="col-span-2 sm:col-span-2 text-right">Total XP</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-fingrow-midnight/5">
          {filteredLeaders.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Users className="w-8 h-8 text-fingrow-midnight/30 mx-auto" />
              <p className="font-bold text-sm text-fingrow-midnight">No learners found</p>
              <p className="text-xs text-fingrow-midnight/50">
                Try loosening your filter or search query.
              </p>
            </div>
          ) : (
            filteredLeaders.map((lead, idx) => {
              const isMe = currentUserId === lead.id;
              const rank = idx + 1;

              return (
                <div
                  key={lead.id}
                  className={`p-4 sm:px-6 grid grid-cols-12 items-center text-sm transition-colors ${
                    isMe
                      ? "bg-fingrow-emerald/5 font-semibold border-l-4 border-l-fingrow-emerald"
                      : "hover:bg-fingrow-ivory/60"
                  }`}
                >
                  {/* Rank Column */}
                  <div className="col-span-2 sm:col-span-1">
                    <span
                      className={`w-7 h-7 rounded-xl inline-flex items-center justify-center font-black text-xs ${
                        rank === 1
                          ? "bg-fingrow-yellow text-fingrow-midnight shadow-sm"
                          : rank === 2
                          ? "bg-gray-200 text-fingrow-midnight"
                          : rank === 3
                          ? "bg-fingrow-tangerine/30 text-fingrow-midnight"
                          : "text-fingrow-midnight/50"
                      }`}
                    >
                      {rank}
                    </span>
                  </div>

                  {/* Learner Info */}
                  <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-fingrow-emerald/15 text-fingrow-emerald flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {lead.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-fingrow-midnight flex items-center gap-1.5 truncate">
                        <span className="truncate">{lead.name}</span>
                        {isMe && <Badge variant="emerald" size="sm">You</Badge>}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-fingrow-midnight/50 capitalize">
                          {lead.role.replace("_", " ")}
                        </span>
                        <span className="text-fingrow-midnight/30">•</span>
                        <span className="text-[11px] text-fingrow-midnight/50 font-medium">
                          {lead.achievementsCount} badges
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Level Pill */}
                  <div className="hidden sm:flex sm:col-span-2 items-center justify-center">
                    <div className="text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-fingrow-ivory border border-fingrow-midnight/10 text-fingrow-midnight">
                        Lvl {lead.level.level}
                      </span>
                      <span className="block text-[10px] text-fingrow-midnight/60 font-semibold truncate max-w-[120px]">
                        {lead.level.title}
                      </span>
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="col-span-2 text-center flex items-center justify-center gap-1 text-xs font-black text-fingrow-tangerine">
                    <Flame className="w-4 h-4 fill-fingrow-tangerine flex-shrink-0" />
                    <span>{lead.streakDays}d</span>
                  </div>

                  {/* Total XP */}
                  <div className="col-span-2 sm:col-span-2 text-right">
                    <span className="font-black text-sm sm:text-base text-fingrow-emerald">
                      {lead.xp}
                    </span>
                    <span className="text-[10px] text-fingrow-emerald/70 font-bold ml-1">XP</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Gamification Rules & Achievement Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rules Card */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-fingrow-emerald" />
              <h3 className="font-bold text-lg text-fingrow-midnight">Gamification & XP Rules</h3>
            </div>

            <div className="space-y-3 text-xs text-fingrow-midnight/70 leading-relaxed">
              <div className="p-3 bg-fingrow-ivory rounded-2xl border border-fingrow-midnight/10 space-y-1">
                <strong className="text-fingrow-midnight block font-bold">
                  1. Server-Authoritative Idempotent XP
                </strong>
                <p>
                  Every quiz completion, simulator finish, and 1v1 battle carries a unique idempotency key. XP is awarded exactly once per lesson milestone and cannot be duplicated.
                </p>
              </div>

              <div className="p-3 bg-fingrow-ivory rounded-2xl border border-fingrow-midnight/10 space-y-1">
                <strong className="text-fingrow-midnight block font-bold">
                  2. Calendar-Day Daily Streaks
                </strong>
                <p>
                  Your streak increments by 1 for each active calendar day you complete a quiz, battle, or simulation. Repeating exercises on the same day maintains your streak; skipping a day resets it to 1.
                </p>
              </div>

              <div className="p-3 bg-fingrow-ivory rounded-2xl border border-fingrow-midnight/10 space-y-1">
                <strong className="text-fingrow-midnight block font-bold">
                  3. Competitive 1v1 Game Victories
                </strong>
                <p>
                  Winning a 1v1 Financial Speed Duel awards <strong>+150 XP</strong> and unlocks the Battle Tested achievement. Close matches award <strong>+50 XP</strong> for participation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Achievements Preview */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-fingrow-lime" />
                <h3 className="font-bold text-lg text-fingrow-midnight">Unlockable Badges</h3>
              </div>
              <span className="text-xs font-bold text-fingrow-emerald">
                {myUnlockedCodes.size} / {allAchievements.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
              {allAchievements.map((ach) => {
                const isUnlocked = myUnlockedCodes.has(ach.code);
                return (
                  <div
                    key={ach.code}
                    className={`p-3 rounded-2xl border text-xs space-y-1 transition-all ${
                      isUnlocked
                        ? "bg-fingrow-emerald/5 border-fingrow-emerald/25"
                        : "bg-white border-fingrow-midnight/10 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-fingrow-midnight truncate">
                        {ach.title}
                      </span>
                      {isUnlocked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-fingrow-emerald flex-shrink-0" />
                      ) : (
                        <Lock className="w-3 h-3 text-fingrow-midnight/40 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-fingrow-midnight/60 line-clamp-2">
                      {ach.description}
                    </p>
                    <span className="text-[10px] font-bold text-fingrow-emerald block">
                      +{ach.xpBonus} XP Bonus
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
