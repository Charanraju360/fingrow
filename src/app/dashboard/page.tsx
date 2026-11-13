import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  Flame,
  Award,
  BookOpen,
  Cpu,
  Gamepad2,
  GraduationCap,
  Users,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  PlusCircle,
  TrendingUp,
  Briefcase,
  Target,
  Sparkles,
  Calculator,
  Compass,
  Zap,
  Lock,
  ChevronRight,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const metadata = {
  title: "Dashboard — FinGrow Learner Hub",
  description: "Personalized financial learning dashboard, active streak tracking, curriculum progress, and interactive simulators.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/login");
  }

  const user = db.users.getById(session.userId);
  const profile = db.profiles.getByUserId(session.userId);
  const userProgress = db.progress.getUserProgress(session.userId);
  const allAchievements = db.achievements.getAll();
  const userAchievements = db.achievements.getUserAchievements(session.userId);
  const courses = db.courses.getAll();
  const simRuns = db.simulations.getUserRuns(session.userId);

  // Role categorization
  const isEducator = session.role === "educator" || session.role === "institution_admin";
  const isStudent = session.role === "student";
  const isYoungPro = session.role === "young_professional";
  const isAdmin = session.role === "platform_admin";

  const teacherClassrooms = isEducator ? db.classrooms.getByEducator(session.userId) : [];
  const studentClassrooms = !isEducator ? db.classrooms.getByStudent(session.userId) : [];
  const pendingModeration = isAdmin
    ? db.admin.getModerationQueue().filter((r) => r.status === "pending")
    : [];

  // Flatten all lessons across courses to calculate metrics & find next lesson
  const allLessonsWithCourse = courses.flatMap((course) => {
    const lessons = db.lessons.getByCourseSlug(course.slug);
    return lessons.map((l) => ({ ...l, courseTitle: course.title, courseCategory: course.category }));
  });

  const totalLessonsCount = allLessonsWithCourse.length;
  const completedLessonsCount = userProgress.filter((p) => p.completed).length;
  const completionPercentage = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

  // Determine next uncompleted lesson
  const nextUnfinishedLesson = allLessonsWithCourse.find(
    (l) => !userProgress.some((p) => p.courseSlug === l.courseSlug && p.lessonSlug === l.slug && p.completed)
  ) || allLessonsWithCourse[0];

  // User XP and Level calculation
  const currentXp = user?.xp || 0;
  const currentStreak = user?.streakDays || 1;

  // Level thresholds: 0-250 (Lv 1), 251-600 (Lv 2), 601-1200 (Lv 3), 1201-2000 (Lv 4), 2001+ (Lv 5)
  function getLevelInfo(xp: number) {
    if (xp < 250) {
      return { level: 1, title: "Apprentice", current: xp, next: 250, pct: Math.round((xp / 250) * 100) };
    } else if (xp < 600) {
      return { level: 2, title: "Explorer", current: xp - 250, next: 350, pct: Math.round(((xp - 250) / 350) * 100) };
    } else if (xp < 1200) {
      return { level: 3, title: "Strategist", current: xp - 600, next: 600, pct: Math.round(((xp - 600) / 600) * 100) };
    } else if (xp < 2000) {
      return { level: 4, title: "Portfolio Builder", current: xp - 1200, next: 800, pct: Math.round(((xp - 1200) / 800) * 100) };
    } else {
      return { level: 5, title: "Financial Titan", current: xp, next: xp, pct: 100 };
    }
  }

  const levelInfo = getLevelInfo(currentXp);

  // Active Streak Day indicators (visual 7-day habits)
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const currentDayIndex = (new Date().getDay() + 6) % 7; // 0 for Mon, 6 for Sun
  // An active day is determined by current streak length extending backwards from today
  const activeDays = daysOfWeek.map((day, idx) => {
    const isPastOrToday = idx <= currentDayIndex;
    const daysAgo = currentDayIndex - idx;
    const wasActive = isPastOrToday && daysAgo < currentStreak;
    const isToday = idx === currentDayIndex;
    return { day, wasActive, isToday };
  });

  // Next achievement to unlock
  const unlockedCodes = new Set(userAchievements.map((ua) => ua.achievementCode));
  const nextBadge = allAchievements.find((ach) => !unlockedCodes.has(ach.code)) || allAchievements[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Welcome Header with Role & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white rounded-3xl p-6 sm:p-8 border border-fingrow-midnight/10 shadow-finCard">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-fingrow-emerald bg-fingrow-emerald/10 px-2.5 py-1 rounded-full">
              {isStudent && "Student Learning Track"}
              {isYoungPro && "Young Professional Wealth Track"}
              {isEducator && "Educator Portal"}
              {isAdmin && "Platform Superuser"}
              {!isStudent && !isYoungPro && !isEducator && !isAdmin && `${session.role.replace("_", " ")}`}
            </span>
            <span className="text-[11px] font-semibold text-fingrow-midnight/50">
              {profile?.experienceLevel ? `• ${profile.experienceLevel.toUpperCase()}` : "• BEGINNER"}
            </span>
            <a
              href="/onboarding"
              className="text-[11px] font-bold text-fingrow-emerald hover:underline ml-1"
            >
              (Customize Track)
            </a>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-fingrow-midnight">
            Welcome back, {session.name}
          </h1>

          <p className="text-xs sm:text-sm text-fingrow-midnight/70 max-w-xl">
            {profile?.institution ? `${profile.institution} • ` : ""}
            {isStudent && "Build real financial intuition, ace classroom quizzes, and understand compounding early."}
            {isYoungPro && "Optimize cash flow, evaluate index SIPs, stress-test business metrics, and grow wealth."}
            {isEducator && "Manage your enrolled students, create curriculum assignments, and review classroom analytics."}
            {isAdmin && "Monitor platform health, verify user registrations, and manage content moderation."}
          </p>
        </div>

        {/* Gamification Pills & Active Streak Card */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Streak Indicator */}
          <div className="flex items-center gap-3 bg-fingrow-ivory px-4 py-3 rounded-2xl border border-fingrow-midnight/10 shadow-sm min-w-[140px]">
            <div className="w-10 h-10 rounded-xl bg-fingrow-tangerine/15 flex items-center justify-center flex-shrink-0">
              <Flame className="w-6 h-6 text-fingrow-tangerine fill-fingrow-tangerine" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-fingrow-midnight/60 uppercase tracking-wider">
                Active Streak
              </div>
              <div className="text-base font-extrabold text-fingrow-midnight">
                {currentStreak} {currentStreak === 1 ? "Day" : "Days"}
              </div>
            </div>
          </div>

          {/* XP & Level Badge */}
          <div className="flex items-center gap-3 bg-fingrow-ivory px-4 py-3 rounded-2xl border border-fingrow-midnight/10 shadow-sm min-w-[150px]">
            <div className="w-10 h-10 rounded-xl bg-fingrow-lime/20 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-fingrow-emerald" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-fingrow-midnight/60 uppercase tracking-wider">
                Lv. {levelInfo.level} {levelInfo.title}
              </div>
              <div className="text-base font-extrabold text-fingrow-emerald">
                {currentXp} XP
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Active Habit Tracker & Next Badge Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Weekly Habit Tracker */}
        <div className="md:col-span-2 bg-white rounded-2xl p-4 sm:p-5 border border-fingrow-midnight/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-fingrow-tangerine" />
              <span className="text-xs font-bold text-fingrow-midnight uppercase tracking-wider">
                Weekly Habit Streak
              </span>
            </div>
            <p className="text-xs text-fingrow-midnight/60">
              {currentStreak >= 3 ? "🔥 Great momentum! Keep studying daily to unlock Streak Habit badges." : "Study a lesson today to build your financial habit."}
            </p>
          </div>

          {/* 7 Day Dots */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {activeDays.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-fingrow-midnight/50">{d.day}</span>
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    d.wasActive
                      ? "bg-fingrow-emerald text-white shadow-sm"
                      : d.isToday
                      ? "border-2 border-dashed border-fingrow-tangerine text-fingrow-tangerine bg-fingrow-tangerine/5"
                      : "bg-fingrow-midnight/5 text-fingrow-midnight/40"
                  }`}
                  title={`${d.day}: ${d.wasActive ? "Completed" : d.isToday ? "Today" : "Rest"}`}
                >
                  {d.wasActive ? <Check className="w-4 h-4" /> : d.isToday ? "!" : "•"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Level XP Progress */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-fingrow-midnight/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-fingrow-midnight uppercase tracking-wider">
              Level {levelInfo.level} Progress
            </span>
            <span className="text-xs font-extrabold text-fingrow-emerald">
              {levelInfo.pct}%
            </span>
          </div>
          <div className="py-2">
            <Progress value={levelInfo.pct} className="h-2" />
          </div>
          <div className="text-[11px] text-fingrow-midnight/60 flex justify-between">
            <span>{currentXp} XP</span>
            <span>Target: {levelInfo.level < 5 ? `${currentXp + (levelInfo.next - levelInfo.current)} XP` : "Max Level"}</span>
          </div>
        </div>
      </div>

      {/* EDUCATOR-SPECIFIC VIEW */}
      {isEducator ? (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-fingrow-midnight">Your Classrooms</h2>
              <p className="text-xs text-fingrow-midnight/60 mt-0.5">
                Oversee student engagement, distribute curriculum homework, and inspect performance.
              </p>
            </div>
            <a href="/educator/classrooms/new">
              <Button size="sm" variant="primary">
                <PlusCircle className="w-4 h-4 mr-1.5" />
                <span>Create New Class</span>
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherClassrooms.map((cls) => {
              const assignments = db.classrooms.getAssignments(cls.id);
              return (
                <Card key={cls.id} className="hover:border-fingrow-emerald transition-all">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="emerald" size="sm">{cls.code}</Badge>
                      <span className="text-xs font-semibold text-fingrow-midnight/60">
                        {cls.studentIds.length} Students Enrolled
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg text-fingrow-midnight">{cls.name}</h3>
                      <p className="text-xs text-fingrow-midnight/60 mt-0.5">{cls.subject}</p>
                    </div>

                    <div className="p-3 bg-fingrow-ivory rounded-xl text-xs space-y-1.5">
                      <div className="flex justify-between text-fingrow-midnight/70">
                        <span>Active Assignments:</span>
                        <strong className="text-fingrow-midnight">{assignments.length}</strong>
                      </div>
                      <div className="flex justify-between text-fingrow-midnight/70">
                        <span>Institution:</span>
                        <span className="truncate max-w-[150px]">{cls.institution}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <a href={`/educator/classrooms/${cls.id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          Manage Roster
                        </Button>
                      </a>
                      <a href={`/educator/classrooms/${cls.id}/assign`} className="flex-1">
                        <Button size="sm" variant="primary" className="w-full text-xs">
                          Assign Lesson
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* ========================================================
           AUTHENTICATED LEARNER VIEW (STUDENT & YOUNG PROFESSIONAL)
           ======================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2-Column: Progress, Next Action & Curriculum Tracks */}
          <div className="lg:col-span-2 space-y-8">
            {/* Actionable "Resume Learning" Hero Card */}
            {nextUnfinishedLesson && (
              <div className="bg-gradient-to-br from-fingrow-midnight to-[#0f2438] text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-md">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-fingrow-lime bg-fingrow-lime/10 px-2.5 py-0.5 rounded-full">
                      <Zap className="w-3 h-3 text-fingrow-lime" />
                      Next Recommended Step
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      {nextUnfinishedLesson.title}
                    </h2>
                    <p className="text-xs text-white/70 line-clamp-2">
                      {nextUnfinishedLesson.summary}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-xs text-white/60">
                      <span>Course: {nextUnfinishedLesson.courseTitle}</span>
                      <span>•</span>
                      <span>Est: {nextUnfinishedLesson.estimatedMinutes} mins</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 pt-2 sm:pt-0">
                    <a href={`/learn/${nextUnfinishedLesson.courseSlug}/${nextUnfinishedLesson.slug}`}>
                      <Button size="lg" variant="accent" className="font-bold text-fingrow-midnight shadow-md">
                        <span>Continue Lesson</span>
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Overall Curriculum Mastery Card */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-lg text-fingrow-midnight">Curriculum Mastery</h3>
                    <p className="text-xs text-fingrow-midnight/60">
                      {completedLessonsCount} of {totalLessonsCount} lessons finished across all tracks
                    </p>
                  </div>
                  <span className="text-2xl font-extrabold text-fingrow-emerald">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-3" />

                {/* Course Breakdown List */}
                <div className="pt-3 border-t border-fingrow-midnight/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {courses.map((c) => {
                    const lessons = db.lessons.getByCourseSlug(c.slug);
                    const courseCompleted = userProgress.filter((p) => p.courseSlug === c.slug && p.completed).length;
                    const coursePct = lessons.length > 0 ? Math.round((courseCompleted / lessons.length) * 100) : 0;
                    return (
                      <div key={c.id} className="p-3 rounded-xl bg-fingrow-ivory/80 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-fingrow-midnight truncate pr-2">{c.title}</span>
                          <span className="text-fingrow-emerald font-extrabold flex-shrink-0">{coursePct}%</span>
                        </div>
                        <Progress value={coursePct} className="h-1.5" />
                        <div className="text-[10px] text-fingrow-midnight/50 flex justify-between">
                          <span>{courseCompleted}/{lessons.length} finished</span>
                          <span>{c.level}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* STUDENT SPECIFIC: Classroom Enrolled Homework & Peer Battles */}
            {isStudent && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-fingrow-midnight flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-fingrow-emerald" />
                    <span>Classroom Homework & Assignments</span>
                  </h3>
                  <div className="flex items-center gap-3">
                    <a href="/join" className="text-xs font-bold text-fingrow-emerald hover:underline">
                      + Join Classroom
                    </a>
                    <a href="/curriculum" className="text-xs font-bold text-fingrow-midnight/60 hover:underline">
                      View Syllabus →
                    </a>
                  </div>
                </div>

                {studentClassrooms.length > 0 ? (
                  <div className="space-y-3">
                    {studentClassrooms.flatMap((cls) => {
                      const asgs = db.classrooms.getAssignments(cls.id);
                      if (asgs.length === 0) {
                        return (
                          <div key={cls.id} className="bg-white rounded-2xl p-4 border border-fingrow-midnight/10 text-xs text-fingrow-midnight/60">
                            No open assignments for {cls.name}. You are all caught up!
                          </div>
                        );
                      }
                      return asgs.map((asg) => (
                        <div
                          key={asg.id}
                          className="bg-white rounded-2xl p-4 sm:p-5 border border-fingrow-midnight/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-fingrow-emerald/50 transition-colors"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-fingrow-emerald bg-fingrow-emerald/10 px-2 py-0.5 rounded">
                                {cls.name}
                              </span>
                              <Badge variant="outline" size="sm">ASSIGNED</Badge>
                            </div>
                            <h4 className="font-bold text-sm sm:text-base text-fingrow-midnight">{asg.title}</h4>
                            <p className="text-xs text-fingrow-midnight/60 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-fingrow-tangerine" />
                              <span>Due by {new Date(asg.dueDate).toLocaleDateString()}</span>
                            </p>
                          </div>
                          <a href={`/learn/${asg.courseSlug}/${asg.lessonSlug}`}>
                            <Button size="sm" variant="primary" className="w-full sm:w-auto">
                              Complete Quiz
                            </Button>
                          </a>
                        </div>
                      ));
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-5 border border-dashed border-fingrow-midnight/20 text-center space-y-3">
                    <p className="text-xs text-fingrow-midnight/70">
                      Not enrolled in a classroom yet? Join with a teacher invite code to earn the Classroom Scholar badge and compete on leaderboards.
                    </p>
                    <div className="flex justify-center gap-3">
                      <a href="/join">
                        <Button size="sm" variant="primary" className="text-xs">
                          Join with Class Code
                        </Button>
                      </a>
                      <a href="/curriculum">
                        <Button size="sm" variant="outline" className="text-xs">
                          Browse Foundations
                        </Button>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* YOUNG PROFESSIONAL SPECIFIC: Wealth Milestones & Cash-Flow Focus */}
            {isYoungPro && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-fingrow-midnight flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-fingrow-emerald" />
                    <span>Wealth Accelerator Milestones</span>
                  </h3>
                  <a href="/simulations" className="text-xs font-bold text-fingrow-emerald hover:underline">
                    All Simulators →
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Salary Allocation Simulation Card */}
                  <div className="bg-white rounded-2xl p-5 border border-fingrow-midnight/10 shadow-sm flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Badge variant="emerald" size="sm">CASH FLOW</Badge>
                        <span className="text-[11px] font-bold text-fingrow-emerald">50/30/20 Rule</span>
                      </div>
                      <h4 className="font-bold text-base text-fingrow-midnight">First Salary Budgeter</h4>
                      <p className="text-xs text-fingrow-midnight/70 leading-relaxed">
                        Split post-tax take-home pay into essentials, investments, and guilt-free fun. Avoid the lifestyle inflation trap.
                      </p>
                    </div>
                    <a href="/simulations/first-salary">
                      <Button size="sm" variant="outline" className="w-full justify-between text-xs">
                        <span>Launch Budgeter</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  </div>

                  {/* SIP & Index Compounder Card */}
                  <div className="bg-white rounded-2xl p-5 border border-fingrow-midnight/10 shadow-sm flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Badge variant="accent" size="sm">WEALTH INDEX</Badge>
                        <span className="text-[11px] font-bold text-fingrow-tangerine">Rule of 72</span>
                      </div>
                      <h4 className="font-bold text-base text-fingrow-midnight">SIP Growth Simulator</h4>
                      <p className="text-xs text-fingrow-midnight/70 leading-relaxed">
                        Simulate 15-year dollar-cost averaging in broad market index funds. See fee drag vs low-cost ETFs.
                      </p>
                    </div>
                    <a href="/simulations/sip">
                      <Button size="sm" variant="primary" className="w-full justify-between text-xs">
                        <span>Simulate SIP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Learning Courses Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-fingrow-midnight">
                    {isStudent ? "Student Core Curriculum" : "Recommended Next Lessons"}
                  </h3>
                  <p className="text-xs text-fingrow-midnight/60">
                    Bite-sized modules with practical interactive knowledge checks
                  </p>
                </div>
                <a href="/learn" className="text-xs font-bold text-fingrow-emerald hover:underline">
                  Full Catalogue →
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {courses.slice(0, 4).map((c) => {
                  const lessons = db.lessons.getByCourseSlug(c.slug);
                  const firstLesson = lessons[0];
                  const completedInCourse = userProgress.filter((p) => p.courseSlug === c.slug && p.completed).length;
                  const isDone = completedInCourse === lessons.length && lessons.length > 0;

                  return (
                    <Card key={c.id} className="hover:border-fingrow-emerald transition-all flex flex-col justify-between">
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="emerald" size="sm">{c.level}</Badge>
                          <span className="text-[11px] font-medium text-fingrow-midnight/60">
                            {completedInCourse}/{lessons.length} done
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-fingrow-midnight line-clamp-1">{c.title}</h4>
                        <p className="text-xs text-fingrow-midnight/70 line-clamp-2 leading-relaxed">
                          {c.description}
                        </p>
                      </CardContent>
                      <div className="p-6 pt-0">
                        {firstLesson && (
                          <a href={`/learn/${c.slug}/${firstLesson.slug}`}>
                            <Button size="sm" variant={isDone ? "outline" : "primary"} className="w-full justify-between text-xs">
                              <span>{isDone ? "Review Module" : "Start Lesson"}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Daily Trivia Challenge, Simulators & Badges */}
          <div className="space-y-6">
            {/* Daily Challenge & Peer Battle Card */}
            <Card className="bg-gradient-to-br from-fingrow-midnight to-black text-white border-0 shadow-xl">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="lime" size="sm">DAILY HABIT</Badge>
                  <Gamepad2 className="w-5 h-5 text-fingrow-lime" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white">Financial Speed Duel</h4>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    Answer 5 rapid-fire questions on inflation, compound growth, and debt traps to earn +150 XP!
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <a href="/games/quick" className="flex-1">
                    <Button size="sm" variant="accent" className="w-full text-xs font-bold text-fingrow-midnight">
                      Play Solo
                    </Button>
                  </a>
                  <a href="/games/battle" className="flex-1">
                    <Button size="sm" variant="outline" className="w-full text-xs text-white border-white/20 hover:bg-white/10">
                      1v1 Battle
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Simulators Quick Access Hub */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-fingrow-midnight flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-fingrow-emerald" />
                    <span>Interactive Simulators</span>
                  </h4>
                  <span className="text-[11px] font-bold text-fingrow-emerald">{simRuns.length} Runs</span>
                </div>
                <div className="space-y-2 pt-1">
                  <a
                    href="/simulations/first-salary"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-fingrow-ivory hover:bg-fingrow-emerald/10 transition-colors text-xs font-semibold text-fingrow-midnight"
                  >
                    <span>First Salary Budgeter (50/30/20)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-fingrow-emerald" />
                  </a>
                  <a
                    href="/simulations/sip"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-fingrow-ivory hover:bg-fingrow-emerald/10 transition-colors text-xs font-semibold text-fingrow-midnight"
                  >
                    <span>SIP & Index Wealth Calculator</span>
                    <ArrowRight className="w-3.5 h-3.5 text-fingrow-emerald" />
                  </a>
                  <a
                    href="/simulations/budget"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-fingrow-ivory hover:bg-fingrow-emerald/10 transition-colors text-xs font-semibold text-fingrow-midnight"
                  >
                    <span>Emergency Expense Shock Test</span>
                    <ArrowRight className="w-3.5 h-3.5 text-fingrow-emerald" />
                  </a>
                  <a
                    href="/simulations/investing"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-fingrow-ivory hover:bg-fingrow-emerald/10 transition-colors text-xs font-semibold text-fingrow-midnight"
                  >
                    <span>$50k Portfolio Challenge</span>
                    <ArrowRight className="w-3.5 h-3.5 text-fingrow-emerald" />
                  </a>
                  <a
                    href="/simulations/startup"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-fingrow-ivory hover:bg-fingrow-emerald/10 transition-colors text-xs font-semibold text-fingrow-midnight"
                  >
                    <span>Startup Runway & EBITDA Builder</span>
                    <ArrowRight className="w-3.5 h-3.5 text-fingrow-emerald" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Achievement Badges Showcase */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-base text-fingrow-midnight">Earned Badges</h4>
                    <p className="text-[11px] text-fingrow-midnight/60">
                      {userAchievements.length} of {allAchievements.length} unlocked
                    </p>
                  </div>
                  <a href="/profile" className="text-xs font-bold text-fingrow-emerald hover:underline">
                    View All →
                  </a>
                </div>

                {/* Display unlocked badges */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {userAchievements.slice(0, 4).map((ach) => {
                    const meta = allAchievements.find((a) => a.code === ach.achievementCode);
                    return (
                      <div
                        key={ach.id}
                        className="p-3 rounded-xl bg-fingrow-emerald/5 border border-fingrow-emerald/20 text-center space-y-1"
                      >
                        <Award className="w-5 h-5 text-fingrow-emerald mx-auto" />
                        <div className="text-[11px] font-bold text-fingrow-midnight truncate">
                          {meta?.title || ach.achievementCode.replace("_", " ")}
                        </div>
                        <span className="text-[10px] font-semibold text-fingrow-emerald block">
                          +{meta?.xpBonus || 50} XP
                        </span>
                      </div>
                    );
                  })}
                  {userAchievements.length === 0 && (
                    <div className="col-span-2 text-center py-4 text-xs text-fingrow-midnight/50">
                      Complete your first lesson to earn the First Step badge!
                    </div>
                  )}
                </div>

                {/* Next Badge to Unlock */}
                {nextBadge && (
                  <div className="p-3 rounded-xl bg-fingrow-ivory border border-dashed border-fingrow-midnight/20 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-fingrow-midnight/60">
                        Next Goal
                      </span>
                      <span className="text-[10px] font-bold text-fingrow-emerald">+{nextBadge.xpBonus} XP</span>
                    </div>
                    <div className="font-bold text-xs text-fingrow-midnight">{nextBadge.title}</div>
                    <p className="text-[11px] text-fingrow-midnight/60">{nextBadge.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* PLATFORM ADMIN SPECIAL WIDGET */}
      {isAdmin && (
        <div className="mt-8 bg-fingrow-midnight text-white rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-fingrow-lime" />
              <h3 className="font-bold text-lg text-white">Platform Oversight & Moderation Queue</h3>
            </div>
            <a href="/admin">
              <Button size="sm" variant="accent">
                Open Admin Portal
              </Button>
            </a>
          </div>
          <p className="text-xs text-white/70">
            {pendingModeration.length} pending moderation reports require staff review. All system audit logs and user roles are accessible via the platform console.
          </p>
        </div>
      )}
    </div>
  );
}
