"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Shield,
  Layers,
  Award,
  BookOpen,
  DollarSign,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 3;

  const [role, setRole] = useState<"student" | "young_professional">("student");
  const [experienceLevel, setExperienceLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [institution, setInstitution] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    async function loadUserData() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUserName(data.user.name || "");
            if (data.user.role === "young_professional") {
              setRole("young_professional");
            } else {
              setRole("student");
            }
          }
          if (data.profile) {
            if (data.profile.experienceLevel) setExperienceLevel(data.profile.experienceLevel);
            if (data.profile.interests && data.profile.interests.length > 0) {
              setSelectedInterests(data.profile.interests);
            }
            if (data.profile.goals && data.profile.goals.length > 0) {
              setSelectedGoals(data.profile.goals);
            }
            if (data.profile.institution) setInstitution(data.profile.institution);
          }
        }
      } catch (err) {
        console.error("Failed to load user info", err);
      }
    }
    loadUserData();
  }, []);

  // Preset topics tailored for student vs young professional
  const studentInterests = [
    "Pocket Money & College Budgeting",
    "How Compound Interest Creates Wealth",
    "Stock Market 101: Shares & Tickers",
    "Credit Cards vs Debit: Avoiding Debt Traps",
    "Emergency Funds: First $1,000 Safety Net",
    "Understanding Student Loans & APR",
    "Financial Trivia & Peer Battles",
    "Side Hustles & Freelance Basics",
  ];

  const youngProInterests = [
    "First Salary 50/30/20 Rule & Cash Flow",
    "Systematic Investment Plans (SIPs) & Index Funds",
    "Portfolio Risk & Asset Diversification",
    "Tax Optimization & Retirement Accounts",
    "Understanding Corporate Finance & EBITDA",
    "Stock Market Mechanics & Order Books",
    "Real Estate & Mortgage Math",
    "Startup Economics & Equity Compensation",
  ];

  const interestOptions = role === "student" ? studentInterests : youngProInterests;

  // Preset goals tailored for student vs young professional
  const studentGoals = [
    "Build good money habits before entering the workforce",
    "Understand student loans and avoid credit card interest",
    "Learn stock investing safely without real money risk",
    "Compete with classmates in financial trivia challenges",
    "Complete classroom assignments from my educator",
  ];

  const youngProGoals = [
    "Optimize my monthly salary and automate emergency savings",
    "Build a long-term wealth compounding index portfolio",
    "Master corporate finance metrics like EBITDA, ROI, and runway",
    "Understand mortgage calculations and high-yield savings (HYSA)",
    "Run interactive business simulations to sharpen decision making",
  ];

  const goalOptions = role === "student" ? studentGoals : youngProGoals;

  function toggleInterest(item: string) {
    if (selectedInterests.includes(item)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== item));
    } else {
      setSelectedInterests([...selectedInterests, item]);
    }
  }

  function toggleGoal(item: string) {
    if (selectedGoals.includes(item)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== item));
    } else {
      setSelectedGoals([...selectedGoals, item]);
    }
  }

  async function handleFinish() {
    setSaving(true);
    try {
      await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          experienceLevel,
          interests: selectedInterests.length > 0 ? selectedInterests : interestOptions.slice(0, 3),
          goals: selectedGoals.length > 0 ? selectedGoals : goalOptions.slice(0, 2),
          institution: institution.trim() || (role === "student" ? "Oakridge Academy" : "Tech & Finance Cohort"),
        }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Onboarding failed", err);
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  }

  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex flex-col justify-center">
      {/* Header & Step Tracker */}
      <div className="space-y-4 mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-fingrow-emerald/10 text-fingrow-emerald px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step {currentStep} of {totalSteps}: {currentStep === 1 ? "Path & Experience" : currentStep === 2 ? "Topics of Interest" : "Goals & Environment"}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-fingrow-midnight tracking-tight">
          Personalize Your FinGrow Journey
        </h1>
        <p className="text-xs sm:text-sm text-fingrow-midnight/70 max-w-xl mx-auto">
          {userName ? `Welcome, ${userName}! ` : ""}We tailor your curriculum modules, financial simulators, and daily challenges based on your role and aspirations.
        </p>

        {/* Progress bar */}
        <div className="max-w-md mx-auto pt-2 space-y-1">
          <div className="flex justify-between text-[11px] font-bold text-fingrow-midnight/60">
            <span>Setup Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      <Card className="border border-fingrow-midnight/10 shadow-finCard bg-white">
        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* STEP 1: Role & Experience Level */}
          {currentStep === 1 && (
            <div className="space-y-8">
              {/* Role Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-fingrow-midnight/80">
                    1. Select Your Learning Track
                  </label>
                  <span className="text-[11px] text-fingrow-emerald font-semibold">Customizes curriculum & simulators</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Student Track */}
                  <button
                    type="button"
                    onClick={() => {
                      setRole("student");
                      setSelectedInterests([]);
                      setSelectedGoals([]);
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all relative ${
                      role === "student"
                        ? "border-fingrow-emerald bg-fingrow-emerald/5 ring-2 ring-fingrow-emerald/30 shadow-sm"
                        : "border-fingrow-midnight/15 hover:border-fingrow-midnight/30 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${role === "student" ? "bg-fingrow-emerald text-white" : "bg-fingrow-ivory text-fingrow-midnight/70"}`}>
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      {role === "student" && (
                        <span className="w-6 h-6 rounded-full bg-fingrow-emerald text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="font-extrabold text-base text-fingrow-midnight">Student Learner</div>
                    <p className="text-xs text-fingrow-midnight/70 mt-1.5 leading-relaxed">
                      High school or university students looking to master money habits, avoid student debt, and build compound wealth early.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-semibold bg-fingrow-ivory text-fingrow-midnight/80 px-2 py-0.5 rounded-md">Classroom Enrolment</span>
                      <span className="text-[10px] font-semibold bg-fingrow-ivory text-fingrow-midnight/80 px-2 py-0.5 rounded-md">1v1 Battles</span>
                    </div>
                  </button>

                  {/* Young Professional Track */}
                  <button
                    type="button"
                    onClick={() => {
                      setRole("young_professional");
                      setSelectedInterests([]);
                      setSelectedGoals([]);
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all relative ${
                      role === "young_professional"
                        ? "border-fingrow-emerald bg-fingrow-emerald/5 ring-2 ring-fingrow-emerald/30 shadow-sm"
                        : "border-fingrow-midnight/15 hover:border-fingrow-midnight/30 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${role === "young_professional" ? "bg-fingrow-emerald text-white" : "bg-fingrow-ivory text-fingrow-midnight/70"}`}>
                        <Briefcase className="w-5 h-5" />
                      </div>
                      {role === "young_professional" && (
                        <span className="w-6 h-6 rounded-full bg-fingrow-emerald text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="font-extrabold text-base text-fingrow-midnight">Young Professional</div>
                    <p className="text-xs text-fingrow-midnight/70 mt-1.5 leading-relaxed">
                      Early to mid-career professionals optimizing salaries, automated SIPs, tax planning, and startup business literacy.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-semibold bg-fingrow-ivory text-fingrow-midnight/80 px-2 py-0.5 rounded-md">First Salary Simulator</span>
                      <span className="text-[10px] font-semibold bg-fingrow-ivory text-fingrow-midnight/80 px-2 py-0.5 rounded-md">SIP Compounder</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-fingrow-midnight/80 block">
                  2. Your Financial Knowledge Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "beginner", title: "Beginner", desc: "Starting fresh with budgeting & interest fundamentals" },
                    { id: "intermediate", title: "Intermediate", desc: "Familiar with index funds, debt types & stock basics" },
                    { id: "advanced", title: "Advanced", desc: "Ready for EBITDA, DCF valuation, options & portfolio risk" },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setExperienceLevel(lvl.id as any)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        experienceLevel === lvl.id
                          ? "border-fingrow-emerald bg-fingrow-emerald/5 ring-2 ring-fingrow-emerald/20"
                          : "border-fingrow-midnight/15 hover:border-fingrow-midnight/30 bg-white"
                      }`}
                    >
                      <div className="font-bold text-sm text-fingrow-midnight flex items-center justify-between">
                        <span>{lvl.title}</span>
                        {experienceLevel === lvl.id && <Check className="w-4 h-4 text-fingrow-emerald" />}
                      </div>
                      <div className="text-xs text-fingrow-midnight/60 mt-1">{lvl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="pt-4 border-t border-fingrow-midnight/10 flex justify-end">
                <Button size="lg" variant="primary" onClick={() => setCurrentStep(2)}>
                  <span>Continue to Interests</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Topics You Want to Master */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-fingrow-midnight">
                  Choose Your Core Financial Interests
                </h3>
                <p className="text-xs text-fingrow-midnight/60">
                  Select the topics that matter most right now. We highlight these on your personalized dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {interestOptions.map((topic) => {
                  const isSelected = selectedInterests.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleInterest(topic)}
                      className={`p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between min-h-[52px] ${
                        isSelected
                          ? "border-fingrow-emerald bg-fingrow-emerald/10 text-fingrow-midnight shadow-sm ring-1 ring-fingrow-emerald/30"
                          : "border-fingrow-midnight/15 hover:border-fingrow-midnight/35 bg-white text-fingrow-midnight/80"
                      }`}
                    >
                      <span className="pr-2">{topic}</span>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected ? "bg-fingrow-emerald text-white" : "border border-fingrow-midnight/20"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Step 2 Actions */}
              <div className="pt-4 border-t border-fingrow-midnight/10 flex items-center justify-between">
                <Button size="md" variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  <span>Back</span>
                </Button>
                <Button size="lg" variant="primary" onClick={() => setCurrentStep(3)}>
                  <span>Continue to Goals</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Goals & Environment */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-fingrow-midnight">
                  Set Your Primary Milestones & Goals
                </h3>
                <p className="text-xs text-fingrow-midnight/60">
                  What specific financial outcomes do you want to achieve with FinGrow?
                </p>
              </div>

              <div className="space-y-2.5">
                {goalOptions.map((goal) => {
                  const isSelected = selectedGoals.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`w-full p-3.5 rounded-2xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-fingrow-emerald bg-fingrow-emerald/5 text-fingrow-midnight font-bold shadow-sm"
                          : "border-fingrow-midnight/15 hover:border-fingrow-midnight/30 bg-white text-fingrow-midnight/80"
                      }`}
                    >
                      <span>{goal}</span>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ml-3 transition-colors ${
                          isSelected ? "bg-fingrow-emerald text-white" : "border border-fingrow-midnight/20"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Institution or Company Input */}
              <div className="pt-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-fingrow-midnight/80 block">
                  {role === "student" ? "School, College, or Academy (Optional)" : "Company or Industry Focus (Optional)"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-fingrow-midnight/40">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder={role === "student" ? "e.g., Oakridge High School, Stanford, UT Austin" : "e.g., FinTech, SaaS, Healthcare, Engineering"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-fingrow-midnight/20 text-xs sm:text-sm text-fingrow-midnight focus:outline-none focus:ring-2 focus:ring-fingrow-emerald focus:border-fingrow-emerald bg-white"
                  />
                </div>
                <p className="text-[11px] text-fingrow-midnight/50">
                  {role === "student" ? "Helps match you with verified classroom assignments." : "Helps tailor industry salary simulations and cash-flow benchmarks."}
                </p>
              </div>

              {/* Step 3 Actions */}
              <div className="pt-4 border-t border-fingrow-midnight/10 flex items-center justify-between">
                <Button size="md" variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  <span>Back</span>
                </Button>
                <Button size="lg" variant="primary" onClick={handleFinish} isLoading={saving}>
                  <span>Complete Setup & Launch Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
