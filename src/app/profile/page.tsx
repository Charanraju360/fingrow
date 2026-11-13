import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  User,
  Award,
  Flame,
  BookOpen,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Mail,
  GraduationCap,
  Briefcase,
  Lock,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const metadata = {
  title: "My Profile & Achievements — FinGrow",
  description: "View your earned XP, streak status, unlocked badges, simulation records, and learning history.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfilePage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/login");
  }

  const user = db.users.getById(session.userId);
  const profile = db.profiles.getByUserId(session.userId);
  const allAchievements = db.achievements.getAll();
  const unlocked = db.achievements.getUserAchievements(session.userId);
  const userProgress = db.progress.getUserProgress(session.userId);
  const simRuns = db.simulations.getUserRuns(session.userId);

  const isStudent = session.role === "student";
  const isYoungPro = session.role === "young_professional";

  const totalBadgesCount = allAchievements.length;
  const unlockedBadgesCount = unlocked.length;
  const badgeProgressPct = totalBadgesCount > 0 ? Math.round((unlockedBadgesCount / totalBadgesCount) * 100) : 0;

  // Level determination
  const xp = user?.xp || 0;
  let levelTitle = "Apprentice";
  let levelNum = 1;
  if (xp >= 2000) {
    levelTitle = "Financial Titan";
    levelNum = 5;
  } else if (xp >= 1200) {
    levelTitle = "Portfolio Builder";
    levelNum = 4;
  } else if (xp >= 600) {
    levelTitle = "Strategist";
    levelNum = 3;
  } else if (xp >= 250) {
    levelTitle = "Explorer";
    levelNum = 2;
  }

  // Friendly formatted scenario names
  const scenarioLabels: Record<string, string> = {
    first_salary: "First Salary Budgeter (50/30/20)",
    monthly_budget: "Monthly Shock Navigator",
    investment_challenge: "$50k Investment Challenge",
    sip_growth: "SIP & Compound Wealth Simulator",
    startup_builder: "Startup Runway & EBITDA Builder",
  };

  const scenarioLinks: Record<string, string> = {
    first_salary: "/simulations/first-salary",
    monthly_budget: "/simulations/budget",
    investment_challenge: "/simulations/investing",
    sip_growth: "/simulations/sip",
    startup_builder: "/simulations/startup",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-fingrow-midnight/10 shadow-finCard flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-fingrow-emerald to-fingrow-darkEmerald text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-sm flex-shrink-0">
            {session.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-fingrow-midnight">{session.name}</h1>
              <Badge variant="emerald" size="sm">
                {isStudent && "STUDENT LEARNER"}
                {isYoungPro && "YOUNG PROFESSIONAL"}
                {!isStudent && !isYoungPro && session.role.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-fingrow-midnight/60 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                <span>{session.email}</span>
              </span>
              {profile?.institution && (
                <>
                  <span>•</span>
                  <span>{profile.institution}</span>
                </>
              )}
            </p>
            <div className="text-[11px] text-fingrow-midnight/50 flex items-center gap-2 pt-0.5">
              <Calendar className="w-3 h-3" />
              <span>Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Nov 2026"}</span>
            </div>
          </div>
        </div>

        {/* Gamification Stats */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Streak pill */}
          <div className="bg-fingrow-ivory p-3.5 rounded-2xl border border-fingrow-midnight/10 text-center min-w-[100px] flex-1 sm:flex-initial">
            <Flame className="w-5 h-5 text-fingrow-tangerine fill-fingrow-tangerine mx-auto" />
            <div className="text-[10px] font-bold text-fingrow-midnight/60 uppercase mt-1">Streak</div>
            <div className="text-base sm:text-lg font-extrabold text-fingrow-midnight">{user?.streakDays || 1} Days</div>
          </div>

          {/* XP pill */}
          <div className="bg-fingrow-ivory p-3.5 rounded-2xl border border-fingrow-midnight/10 text-center min-w-[100px] flex-1 sm:flex-initial">
            <Award className="w-5 h-5 text-fingrow-lime mx-auto" />
            <div className="text-[10px] font-bold text-fingrow-midnight/60 uppercase mt-1">Total XP</div>
            <div className="text-base sm:text-lg font-extrabold text-fingrow-emerald">{user?.xp || 0}</div>
          </div>

          {/* Level pill */}
          <div className="bg-fingrow-ivory p-3.5 rounded-2xl border border-fingrow-midnight/10 text-center min-w-[110px] flex-1 sm:flex-initial">
            <Sparkles className="w-5 h-5 text-fingrow-emerald mx-auto" />
            <div className="text-[10px] font-bold text-fingrow-midnight/60 uppercase mt-1">Level {levelNum}</div>
            <div className="text-xs sm:text-sm font-extrabold text-fingrow-midnight">{levelTitle}</div>
          </div>
        </div>
      </div>

      {/* Grid: Badges & Learning History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Achievements & Learning History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Achievements & Badges Grid */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-fingrow-midnight">Achievements & Badges</h2>
                <p className="text-xs text-fingrow-midnight/60">
                  {unlockedBadgesCount} of {totalBadgesCount} badges unlocked ({badgeProgressPct}%)
                </p>
              </div>
              <div className="w-full sm:w-40">
                <Progress value={badgeProgressPct} className="h-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allAchievements.map((ach) => {
                const userAch = unlocked.find((u) => u.achievementCode === ach.code);
                const isUnlocked = !!userAch;

                return (
                  <div
                    key={ach.code}
                    className={`p-5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      isUnlocked
                        ? "bg-white border-fingrow-emerald/35 shadow-sm"
                        : "bg-white/60 border-fingrow-midnight/10 opacity-60"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isUnlocked
                          ? "bg-fingrow-emerald/15 text-fingrow-emerald"
                          : "bg-fingrow-midnight/10 text-fingrow-midnight/40"
                      }`}
                    >
                      {isUnlocked ? <Award className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <h4 className="font-bold text-sm text-fingrow-midnight truncate">{ach.title}</h4>
                        {isUnlocked ? (
                          <CheckCircle2 className="w-4 h-4 text-fingrow-emerald flex-shrink-0" />
                        ) : (
                          <span className="text-[10px] font-bold text-fingrow-midnight/40 flex-shrink-0">LOCKED</span>
                        )}
                      </div>
                      <p className="text-xs text-fingrow-midnight/70 leading-relaxed">
                        {ach.description}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-bold text-fingrow-emerald">
                          +{ach.xpBonus} XP
                        </span>
                        {isUnlocked && userAch?.unlockedAt && (
                          <span className="text-[10px] text-fingrow-midnight/40">
                            Unlocked {new Date(userAch.unlockedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Module Activity History */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-fingrow-midnight">Completed Knowledge Lessons</h3>
              <span className="text-xs font-bold text-fingrow-emerald">{userProgress.length} Lessons</span>
            </div>

            {userProgress.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-dashed border-fingrow-midnight/20 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-fingrow-midnight/30 mx-auto" />
                <p className="text-xs text-fingrow-midnight/60">No completed lessons yet. Start your first lesson today!</p>
                <a href="/learn" className="inline-block pt-1">
                  <Button size="sm" variant="primary" className="text-xs">
                    Start Learning
                  </Button>
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-fingrow-midnight/10 divide-y divide-fingrow-midnight/5 shadow-sm overflow-hidden">
                {userProgress.map((prg) => (
                  <div key={prg.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-fingrow-ivory/50 transition-colors">
                    <div className="space-y-0.5">
                      <strong className="text-fingrow-midnight text-sm capitalize block">
                        {prg.lessonSlug.replace(/-/g, " ")}
                      </strong>
                      <span className="text-xs text-fingrow-midnight/50 block">
                        Course: {prg.courseSlug.replace(/-/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-left sm:text-right">
                        <span className="text-xs font-bold text-fingrow-emerald block">
                          Quiz Score: {prg.score}%
                        </span>
                        <span className="text-[10px] text-fingrow-midnight/40">
                          {new Date(prg.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <a href={`/learn/${prg.courseSlug}/${prg.lessonSlug}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          Review
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Simulation Runs History */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-fingrow-midnight">Financial Simulation History</h3>
              <span className="text-xs font-bold text-fingrow-emerald">{simRuns.length} Runs Recorded</span>
            </div>

            {simRuns.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-dashed border-fingrow-midnight/20 text-center space-y-2">
                <Cpu className="w-8 h-8 text-fingrow-midnight/30 mx-auto" />
                <p className="text-xs text-fingrow-midnight/60">No simulation runs recorded yet. Test your financial intuition safely!</p>
                <a href="/simulations" className="inline-block pt-1">
                  <Button size="sm" variant="primary" className="text-xs">
                    Explore Simulators
                  </Button>
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-fingrow-midnight/10 divide-y divide-fingrow-midnight/5 shadow-sm overflow-hidden">
                {simRuns.map((run) => (
                  <div key={run.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-fingrow-ivory/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-fingrow-midnight text-sm">
                          {scenarioLabels[run.scenarioType] || run.scenarioType.replace(/_/g, " ")}
                        </strong>
                        <Badge variant={run.status === "completed" ? "emerald" : "outline"} size="sm">
                          {run.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-fingrow-midnight/60">
                        Virtual Net Worth: <strong className="text-fingrow-midnight">${run.netWorth.toLocaleString()}</strong> • Period {run.currentPeriod}
                      </p>
                    </div>

                    <a href={scenarioLinks[run.scenarioType] || "/simulations"}>
                      <Button size="sm" variant="outline" className="text-xs">
                        <RefreshCw className="w-3.5 h-3.5 mr-1" />
                        <span>Run Again</span>
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Preferences, Learning Profile & Goals */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-fingrow-midnight">Learning Profile</h3>
                <Badge variant="emerald" size="sm">
                  {profile?.experienceLevel?.toUpperCase() || "BEGINNER"}
                </Badge>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-fingrow-midnight/50 block font-semibold mb-1">Track Focus:</span>
                  <div className="font-extrabold text-sm text-fingrow-midnight">
                    {isStudent ? "Student Learning & Foundations" : "Young Professional Wealth Building"}
                  </div>
                </div>

                <div>
                  <span className="text-fingrow-midnight/50 block font-semibold mb-1.5">Selected Interests:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile?.interests && profile.interests.length > 0 ? (
                      profile.interests.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-fingrow-emerald/10 text-fingrow-emerald text-[11px] font-semibold"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-fingrow-midnight/50">Personal Finance & Budgeting</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-fingrow-midnight/50 block font-semibold mb-1.5">Personal Milestones & Goals:</span>
                  <ul className="space-y-2 text-fingrow-midnight/80">
                    {profile?.goals && profile.goals.length > 0 ? (
                      profile.goals.map((g, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-fingrow-ivory p-2 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-fingrow-emerald flex-shrink-0 mt-0.5" />
                          <span className="leading-tight">{g}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start gap-2 bg-fingrow-ivory p-2 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-fingrow-emerald flex-shrink-0 mt-0.5" />
                        <span>Master core budgeting & avoid high interest debt</span>
                      </li>
                    )}
                  </ul>
                </div>

                {profile?.institution && (
                  <div>
                    <span className="text-fingrow-midnight/50 block font-semibold mb-1">
                      {isStudent ? "School / Institution:" : "Organization / Focus:"}
                    </span>
                    <div className="font-semibold text-fingrow-midnight">{profile.institution}</div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-fingrow-midnight/10">
                <a href="/onboarding">
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    Update Onboarding Preferences
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
