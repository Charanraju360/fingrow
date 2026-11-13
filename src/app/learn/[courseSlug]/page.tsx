import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Clock, CheckCircle2, BookOpen, Award, Sparkles } from "lucide-react";

interface CoursePageProps {
  params: Promise<{ courseSlug: string }>;
}

export async function generateMetadata({ params }: CoursePageProps) {
  const { courseSlug } = await params;
  const course = db.courses.getBySlug(courseSlug);
  if (!course) return { title: "Course Not Found" };
  return {
    title: `${course.title} — FinGrow Learning`,
    description: course.description,
  };
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { courseSlug } = await params;
  const course = db.courses.getBySlug(courseSlug);
  if (!course) {
    notFound();
  }

  const session = await getCurrentUser();
  const lessons = db.lessons.getByCourseSlug(courseSlug);
  const userProgress = session ? db.progress.getUserProgress(session.userId) : [];

  const completedCount = lessons.filter((l) =>
    userProgress.some((p) => p.courseSlug === courseSlug && p.lessonSlug === l.slug && p.completed)
  ).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const isMastered = lessons.length > 0 && completedCount === lessons.length;

  const nextUncompletedLesson = lessons.find(
    (l) => !userProgress.some((p) => p.courseSlug === courseSlug && p.lessonSlug === l.slug && p.completed)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Back button */}
      <div>
        <a
          href="/learn"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-fingrow-midnight/60 hover:text-fingrow-emerald transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Learning Tracks</span>
        </a>
      </div>

      {/* Course Overview Header */}
      <div className="bg-white rounded-3xl p-8 border border-fingrow-midnight/10 shadow-finCard space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="emerald">{course.category.toUpperCase()}</Badge>
            <Badge variant="outline">{course.level}</Badge>
            {isMastered && (
              <span className="flex items-center gap-1 text-xs font-bold text-fingrow-emerald bg-fingrow-emerald/15 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Track Mastered</span>
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-fingrow-midnight/60 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{course.estimatedMinutes} minutes total</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-fingrow-midnight">
          {course.title}
        </h1>

        <p className="text-sm sm:text-base text-fingrow-midnight/70 leading-relaxed max-w-3xl">
          {course.description}
        </p>

        {/* Progress bar for logged-in users */}
        {session && (
          <div className="p-4 rounded-2xl bg-fingrow-ivory/60 border border-fingrow-midnight/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-fingrow-midnight">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-fingrow-emerald" />
                <span>Track Mastery</span>
              </span>
              <span>{completedCount} of {lessons.length} lessons completed ({progressPercent}%)</span>
            </div>
            <div className="h-2.5 w-full bg-fingrow-midnight/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-fingrow-emerald rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Action CTA */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          {nextUncompletedLesson ? (
            <a href={`/learn/${course.slug}/${nextUncompletedLesson.slug}`}>
              <Button size="lg" variant="primary">
                <span>{completedCount > 0 ? `Continue: ${nextUncompletedLesson.title}` : `Start First Lesson: ${nextUncompletedLesson.title}`}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </a>
          ) : lessons[0] ? (
            <a href={`/learn/${course.slug}/${lessons[0].slug}`}>
              <Button size="lg" variant="outline">
                <span>Review First Lesson: {lessons[0].title}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </a>
          ) : null}

          <div className="text-xs text-fingrow-midnight/50 flex items-center gap-1.5 font-medium ml-1">
            <Award className="w-4 h-4 text-fingrow-emerald" />
            <span>Unlocks <strong>{course.badgeCode}</strong> badge</span>
          </div>
        </div>
      </div>

      {/* Lesson Syllabus Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-fingrow-midnight">Course Syllabus & Lessons</h2>
          <span className="text-xs text-fingrow-midnight/60 font-semibold">{lessons.length} Lessons</span>
        </div>

        <div className="space-y-3">
          {lessons.map((lesson, idx) => {
            const isCompleted = userProgress.some(
              (p) => p.courseSlug === courseSlug && p.lessonSlug === lesson.slug && p.completed
            );
            const userScore = userProgress.find(
              (p) => p.courseSlug === courseSlug && p.lessonSlug === lesson.slug && p.completed
            )?.score;

            return (
              <div
                key={lesson.id}
                className={`bg-white rounded-2xl p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted
                    ? "border-fingrow-emerald/30 bg-fingrow-emerald/5"
                    : "border-fingrow-midnight/10 hover:border-fingrow-emerald/60 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      isCompleted
                        ? "bg-fingrow-emerald text-white"
                        : "bg-fingrow-midnight/10 text-fingrow-midnight"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-fingrow-midnight">{lesson.title}</h3>
                      {isCompleted && (
                        <span className="text-[10px] font-bold text-fingrow-emerald bg-fingrow-emerald/15 px-2 py-0.5 rounded-full">
                          Score: {userScore}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-fingrow-midnight/70 mt-0.5 line-clamp-1">
                      {lesson.summary}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-fingrow-midnight/50 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-fingrow-emerald" />
                        <span>{lesson.estimatedMinutes} mins reading</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-fingrow-emerald" />
                        <span>{lesson.quiz.length} Knowledge Check Questions</span>
                      </span>
                    </div>
                  </div>
                </div>

                <a href={`/learn/${courseSlug}/${lesson.slug}`} className="self-end sm:self-center flex-shrink-0">
                  <Button size="sm" variant={isCompleted ? "outline" : "primary"} className="text-xs">
                    <span>{isCompleted ? "Review Lesson" : "Start Lesson"}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
