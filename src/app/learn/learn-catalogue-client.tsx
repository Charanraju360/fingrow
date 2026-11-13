"use client";

import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Clock,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  PieChart,
  Zap,
  CreditCard,
  Wallet,
  Briefcase,
  Compass,
  Search,
  Filter,
} from "lucide-react";
import { CourseEntity } from "@/lib/db/seed-data";

export interface CourseWithStats extends CourseEntity {
  lessonCount: number;
  completedCount: number;
  progressPercent: number;
}

interface LearnCatalogueClientProps {
  courses: CourseWithStats[];
  session: any;
}

export function LearnCatalogueClient({ courses, session }: LearnCatalogueClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const iconsMap: Record<string, any> = {
    TrendingUp,
    PieChart,
    ShieldCheck,
    Zap,
    CreditCard,
    Wallet,
    Briefcase,
    Compass,
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Category filter
      if (selectedCategory !== "all" && c.category !== selectedCategory) {
        return false;
      }
      // Level filter
      if (selectedLevel !== "all" && c.level.toLowerCase() !== selectedLevel.toLowerCase()) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesDesc = c.description.toLowerCase().includes(query);
        const matchesCategory = c.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCategory) {
          return false;
        }
      }
      return true;
    });
  }, [courses, selectedCategory, selectedLevel, searchQuery]);

  const categories = [
    { id: "all", label: "All Curricula", count: courses.length },
    { id: "foundations", label: "FinGrow Foundations", count: courses.filter((c) => c.category === "foundations").length },
    { id: "business", label: "Business & Valuation", count: courses.filter((c) => c.category === "business").length },
    { id: "career", label: "Career & Hustles", count: courses.filter((c) => c.category === "career").length },
  ];

  const levels = ["all", "Beginner", "Intermediate"];

  return (
    <div className="space-y-8">
      {/* Search and Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-fingrow-midnight/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-fingrow-midnight/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, e.g. 'stocks', 'EBITDA', 'SIP'..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-fingrow-midnight/15 focus:outline-none focus:ring-2 focus:ring-fingrow-emerald/30 focus:border-fingrow-emerald bg-fingrow-ivory/30"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <span className="text-xs font-semibold text-fingrow-midnight/60 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Level:</span>
            </span>
            {levels.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedLevel === lvl
                    ? "bg-fingrow-midnight text-white"
                    : "bg-fingrow-midnight/5 text-fingrow-midnight/70 hover:bg-fingrow-midnight/10"
                }`}
              >
                {lvl === "all" ? "All Levels" : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? "bg-fingrow-emerald text-white shadow-sm"
                  : "bg-fingrow-midnight/5 text-fingrow-midnight/70 hover:bg-fingrow-midnight/10"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-fingrow-midnight/10 text-fingrow-midnight"
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-fingrow-midnight/10 space-y-3">
          <BookOpen className="w-10 h-10 text-fingrow-midnight/30 mx-auto" />
          <h3 className="text-lg font-bold text-fingrow-midnight">No tracks match your search</h3>
          <p className="text-xs text-fingrow-midnight/60 max-w-sm mx-auto">
            Try adjusting your query or resetting category and difficulty filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedLevel("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((c) => {
            const Icon = iconsMap[c.iconName] || BookOpen;
            const isFullyCompleted = c.lessonCount > 0 && c.completedCount === c.lessonCount;

            return (
              <Card key={c.id} className="hover:border-fingrow-emerald transition-all flex flex-col justify-between shadow-finCard">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-fingrow-emerald/10 text-fingrow-emerald flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="emerald" size="sm">{c.level}</Badge>
                      {isFullyCompleted && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-fingrow-emerald bg-fingrow-emerald/15 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Mastered</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-fingrow-midnight leading-snug">{c.title}</h3>
                    <p className="text-xs text-fingrow-midnight/70 mt-1.5 leading-relaxed line-clamp-3">
                      {c.description}
                    </p>
                  </div>

                  {/* Progress bar if user is logged in */}
                  {session && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-fingrow-midnight/60">
                        <span>Progress</span>
                        <span>{c.completedCount} of {c.lessonCount} lessons ({c.progressPercent}%)</span>
                      </div>
                      <div className="h-2 w-full bg-fingrow-midnight/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-fingrow-emerald rounded-full transition-all duration-300"
                          style={{ width: `${c.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-fingrow-midnight/5 flex items-center justify-between text-xs text-fingrow-midnight/60 font-medium">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-fingrow-emerald" />
                      <span>{c.lessonCount} Lessons</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-fingrow-emerald" />
                      <span>{c.estimatedMinutes} mins</span>
                    </span>
                  </div>
                </CardContent>

                <div className="p-6 pt-0">
                  <a href={`/learn/${c.slug}`}>
                    <Button variant={isFullyCompleted ? "outline" : "primary"} className="w-full justify-between">
                      <span>{c.completedCount > 0 ? (isFullyCompleted ? "Review Track" : "Continue Track") : "Explore Track"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
