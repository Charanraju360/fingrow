import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    const { courseSlug, lessonSlug, answers } = await request.json();

    if (!courseSlug || !lessonSlug || !answers) {
      return NextResponse.json({ error: "Course slug, lesson slug, and answers are required" }, { status: 400 });
    }

    const lesson = db.lessons.getBySlug(courseSlug, lessonSlug);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const quiz = lesson.quiz;
    if (!quiz || quiz.length === 0) {
      return NextResponse.json({ error: "This lesson has no quiz" }, { status: 400 });
    }

    let correctCount = 0;
    const results = quiz.map((q) => {
      const userAnswerIndex = answers[q.id];
      const isCorrect = userAnswerIndex === q.correctIndex;
      if (isCorrect) correctCount += 1;

      const userChoiceExplanation =
        q.optionExplanations && typeof userAnswerIndex === "number" && q.optionExplanations[userAnswerIndex]
          ? q.optionExplanations[userAnswerIndex]
          : null;

      return {
        questionId: q.id,
        userAnswerIndex,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation,
        incorrectExplanation: q.incorrectExplanation || "Incorrect selection. Review the core financial principles below.",
        userChoiceExplanation,
        optionExplanations: q.optionExplanations,
      };
    });

    const score = Math.round((correctCount / quiz.length) * 100);
    const passed = score >= 70;

    let awardedXp = 0;
    let totalXp = 0;

    if (session) {
      if (passed) {
        const completionResult = db.progress.recordLessonCompletion(
          session.userId,
          courseSlug,
          lessonSlug,
          score
        );
        awardedXp = completionResult.awardedXp;
      }

      // Automatically sync submission with any enrolled classroom assignments
      try {
        const enrolledClassrooms = db.classrooms.getByStudent(session.userId);
        for (const cls of enrolledClassrooms) {
          const classAssignments = db.classrooms.getAssignments(cls.id);
          const matchingAssignment = classAssignments.find(
            (a) => a.courseSlug === courseSlug && a.lessonSlug === lessonSlug
          );
          if (matchingAssignment) {
            db.classrooms.recordSubmission({
              assignmentId: matchingAssignment.id,
              classroomId: cls.id,
              studentId: session.userId,
              studentName: session.name,
              score,
            });
          }
        }
      } catch (classSyncErr) {
        console.warn("Could not sync classroom submission:", classSyncErr);
      }

      const updatedUser = db.users.getById(session.userId);
      totalXp = updatedUser?.xp || 0;
    }

    return NextResponse.json({
      success: true,
      score,
      passed,
      correctCount,
      totalQuestions: quiz.length,
      awardedXp,
      totalXp,
      saved: !!session,
      guest: !session,
      results,
    });
  } catch (err: any) {
    console.error("Quiz submission error", err);
    return NextResponse.json({ error: "Failed to process quiz submission" }, { status: 500 });
  }
}

