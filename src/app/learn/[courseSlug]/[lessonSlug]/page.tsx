import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { LessonPlayer } from "./lesson-player";

interface LessonPageProps {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}

export async function generateMetadata({ params }: LessonPageProps) {
  const { courseSlug, lessonSlug } = await params;
  const lesson = db.lessons.getBySlug(courseSlug, lessonSlug);
  if (!lesson) return { title: "Lesson Not Found" };
  return {
    title: `${lesson.title} — FinGrow`,
    description: lesson.summary,
  };
}

export default async function LessonDetailPage({ params }: LessonPageProps) {
  const { courseSlug, lessonSlug } = await params;
  const course = db.courses.getBySlug(courseSlug);
  const lesson = db.lessons.getBySlug(courseSlug, lessonSlug);

  if (!course || !lesson) {
    notFound();
  }

  const session = await getCurrentUser();
  const allLessons = db.lessons.getByCourseSlug(courseSlug);
  const currentIdx = allLessons.findIndex((l) => l.slug === lessonSlug);
  const nextLesson = allLessons[currentIdx + 1];

  // Check if previously completed
  const userProgress = session ? db.progress.getUserProgress(session.userId) : [];
  const existingRecord = userProgress.find(
    (p) => p.courseSlug === courseSlug && p.lessonSlug === lessonSlug && p.completed
  );

  return (
    <LessonPlayer
      course={course}
      lesson={lesson}
      nextLesson={nextLesson}
      session={session}
      previouslyCompleted={!!existingRecord}
      previousScore={existingRecord?.score}
    />
  );
}

