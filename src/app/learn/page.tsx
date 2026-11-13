import React from "react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { LearnCatalogueClient, CourseWithStats } from "./learn-catalogue-client";

export const metadata = {
  title: "Learning Catalogue — FinGrow",
  description: "Explore all 8 interactive FinGrow financial tracks with micro-lessons, knowledge checks, and explanations.",
};

export default async function LearnCataloguePage() {
  const session = await getCurrentUser();
  const rawCourses = db.courses.getAll();
  const userProgress = session ? db.progress.getUserProgress(session.userId) : [];

  const coursesWithStats: CourseWithStats[] = rawCourses.map((c) => {
    const lessons = db.lessons.getByCourseSlug(c.slug);
    const completedCount = lessons.filter((l) =>
      userProgress.some((p) => p.courseSlug === c.slug && p.lessonSlug === l.slug && p.completed)
    ).length;
    const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

    return {
      ...c,
      lessonCount: lessons.length,
      completedCount,
      progressPercent,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-3">
        <Badge variant="emerald" size="sm">FINANCIAL CURRICULUM</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-fingrow-midnight tracking-tight">
          Financial & Business Knowledge Catalogue
        </h1>
        <p className="text-fingrow-midnight/70 text-sm sm:text-base max-w-3xl leading-relaxed">
          Master equity mechanics, compound interest formulas, credit card APR pitfalls, corporate EBITDA statements, and freelance unit economics through short, actionable lessons with interactive knowledge checks.
        </p>
      </div>

      <LearnCatalogueClient courses={coursesWithStats} session={session} />
    </div>
  );
}
