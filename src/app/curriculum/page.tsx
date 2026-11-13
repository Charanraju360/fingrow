import React from "react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Clock, BarChart } from "lucide-react";

export const metadata = {
  title: "Curriculum & Learning Paths — FinGrow",
  description:
    "Explore our complete financial education curriculum: personal finance, stock market mechanics, SIPs, portfolio risk, debt management, and EBITDA.",
};

export default function CurriculumOverviewPage() {
  const courses = db.courses.getAll();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="emerald" size="sm">COMPREHENSIVE SYLLABUS</Badge>
        <h1 className="text-4xl font-extrabold text-fingrow-midnight tracking-tight">
          Learning Paths for Every Stage
        </h1>
        <p className="text-fingrow-midnight/70 text-base leading-relaxed">
          From high school foundations to young professional wealth management and entrepreneurship analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {courses.map((course) => {
          const lessons = db.lessons.getByCourseSlug(course.slug);
          return (
            <div
              key={course.id}
              className="bg-white rounded-3xl p-8 border border-fingrow-midnight/10 shadow-finCard flex flex-col justify-between hover:border-fingrow-emerald transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="emerald">{course.category.toUpperCase()}</Badge>
                  <div className="flex items-center gap-2 text-xs font-semibold text-fingrow-midnight/60">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{course.estimatedMinutes} mins total</span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-fingrow-midnight">{course.title}</h2>
                <p className="text-sm text-fingrow-midnight/70 leading-relaxed">{course.description}</p>

                <div className="pt-3 border-t border-fingrow-midnight/5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-fingrow-midnight/50 mb-2">
                    Lessons in this track ({lessons.length})
                  </h4>
                  <ul className="space-y-2">
                    {lessons.map((lesson, idx) => (
                      <li key={lesson.id} className="text-sm font-medium text-fingrow-midnight flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-fingrow-midnight/5 text-fingrow-midnight text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span>{lesson.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-fingrow-midnight/10">
                <a href={`/learn/${course.slug}`}>
                  <Button variant="primary" className="w-full justify-center">
                    <span>Start This Path</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

