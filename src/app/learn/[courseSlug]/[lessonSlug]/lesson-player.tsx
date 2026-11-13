"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  HelpCircle,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CourseEntity, LessonEntity } from "@/lib/db/seed-data";

interface LessonPlayerProps {
  course: CourseEntity;
  lesson: LessonEntity;
  nextLesson?: LessonEntity;
  session?: any;
  previouslyCompleted: boolean;
  previousScore?: number;
}

export function LessonPlayer({
  course,
  lesson,
  nextLesson,
  session,
  previouslyCompleted,
  previousScore,
}: LessonPlayerProps) {
  const router = useRouter();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSelectOption(questionId: string, optionIdx: number) {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  }

  async function handleQuizSubmit() {
    setErrorMessage(null);

    // Validate that all questions have been answered
    const unanswered = lesson.quiz.some((q) => selectedAnswers[q.id] === undefined);
    if (unanswered) {
      setErrorMessage("Please select an answer for all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/learning/quiz-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: course.slug,
          lessonSlug: lesson.slug,
          answers: selectedAnswers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit quiz");
      }

      setQuizResult(data);
      setSubmitted(true);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Navigation header */}
      <div className="flex items-center justify-between">
        <a
          href={`/learn/${course.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-fingrow-midnight/60 hover:text-fingrow-emerald transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {course.title}</span>
        </a>
        <Badge variant="emerald" size="sm">{course.title}</Badge>
      </div>

      {/* Lesson Header */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-fingrow-midnight tracking-tight">
          {lesson.title}
        </h1>
        <p className="text-base text-fingrow-midnight/70 leading-relaxed font-editorial italic text-lg sm:text-xl">
          &quot;{lesson.summary}&quot;
        </p>
      </div>

      {/* Content Blocks */}
      <div className="space-y-6">
        {lesson.blocks.map((block, idx) => {
          if (block.type === "callout") {
            return (
              <div
                key={idx}
                className="bg-fingrow-midnight text-white p-6 sm:p-8 rounded-3xl space-y-2 border border-white/10"
              >
                {block.title && <h3 className="font-bold text-base text-fingrow-lime">{block.title}</h3>}
                <p className="text-sm text-white/90 leading-relaxed">{block.content}</p>
              </div>
            );
          }

          if (block.type === "stat") {
            return (
              <div
                key={idx}
                className="bg-fingrow-emerald/10 border border-fingrow-emerald/25 p-6 rounded-2xl space-y-2"
              >
                {block.title && <h3 className="font-bold text-sm text-fingrow-emerald">{block.title}</h3>}
                <p className="text-sm font-semibold text-fingrow-midnight leading-relaxed">{block.content}</p>
              </div>
            );
          }

          if (block.type === "key_takeaway") {
            return (
              <div
                key={idx}
                className="bg-fingrow-lime/20 border border-fingrow-lime/40 p-5 rounded-2xl flex items-start gap-3"
              >
                <Sparkles className="w-5 h-5 text-[#3f7700] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#3f7700]">Key Financial Takeaway</h4>
                  <p className="text-sm font-bold text-fingrow-midnight mt-1 leading-relaxed">{block.content}</p>
                </div>
              </div>
            );
          }

          return (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-fingrow-midnight/10 shadow-sm space-y-2">
              {block.title && <h3 className="font-bold text-lg text-fingrow-midnight">{block.title}</h3>}
              <p className="text-sm sm:text-base text-fingrow-midnight/80 leading-relaxed whitespace-pre-line">
                {block.content}
              </p>
            </div>
          );
        })}
      </div>

      {/* Interactive Quiz Engine */}
      <div className="space-y-6 pt-6 border-t-2 border-fingrow-midnight/10">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="emerald" size="sm">KNOWLEDGE CHECK</Badge>
            <h2 className="text-2xl font-extrabold text-fingrow-midnight mt-1">
              Lesson Quiz & Concept Test
            </h2>
          </div>
          {previouslyCompleted && !submitted && (
            <span className="text-xs font-bold text-fingrow-emerald bg-fingrow-emerald/15 px-3 py-1 rounded-full">
              Previous Score: {previousScore}%
            </span>
          )}
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-fingrow-coral/10 border border-fingrow-coral/25 text-fingrow-coral text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Question Cards */}
        <div className="space-y-6">
          {lesson.quiz.map((q, qIdx) => {
            const selectedIdx = selectedAnswers[q.id];
            const resultItem = quizResult?.results?.find((r: any) => r.questionId === q.id);

            return (
              <Card key={q.id} className="border-fingrow-midnight/15">
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-bold text-base text-fingrow-midnight flex items-start gap-2">
                    <span className="w-6 h-6 rounded-lg bg-fingrow-midnight text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                      Q{qIdx + 1}
                    </span>
                    <span>{q.question}</span>
                  </h3>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = selectedIdx === optIdx;
                      let optionStateStyle = "border-fingrow-midnight/15 hover:border-fingrow-emerald/60 bg-white";

                      if (submitted && resultItem) {
                        if (optIdx === q.correctIndex) {
                          optionStateStyle = "border-fingrow-emerald bg-fingrow-emerald/15 text-fingrow-emerald font-bold";
                        } else if (isChosen && !resultItem.isCorrect) {
                          optionStateStyle = "border-fingrow-coral bg-fingrow-coral/15 text-fingrow-coral line-through";
                        } else {
                          optionStateStyle = "opacity-50 border-fingrow-midnight/10";
                        }
                      } else if (isChosen) {
                        optionStateStyle = "border-fingrow-emerald bg-fingrow-emerald/5 ring-2 ring-fingrow-emerald/30 font-semibold";
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={submitted}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-center justify-between ${optionStateStyle}`}
                        >
                          <span>{opt}</span>
                          {submitted && optIdx === q.correctIndex && (
                            <CheckCircle2 className="w-4 h-4 text-fingrow-emerald flex-shrink-0 ml-2" />
                          )}
                          {submitted && isChosen && !resultItem?.isCorrect && (
                            <XCircle className="w-4 h-4 text-fingrow-coral flex-shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Detailed Explanation Display */}
                  {submitted && resultItem && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-fingrow-midnight/10 text-xs">
                      {resultItem.isCorrect ? (
                        <div className="p-3.5 rounded-xl bg-fingrow-emerald/10 border border-fingrow-emerald/30 space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-fingrow-emerald text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Correct Decision!</span>
                          </div>
                          {resultItem.userChoiceExplanation && (
                            <p className="text-fingrow-midnight font-medium">
                              {resultItem.userChoiceExplanation}
                            </p>
                          )}
                          <p className="text-fingrow-midnight/80 leading-relaxed">
                            <strong className="text-fingrow-midnight font-semibold">Financial Principle: </strong>
                            {resultItem.explanation}
                          </p>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-fingrow-coral/10 border border-fingrow-coral/30 space-y-2">
                          <div className="flex items-center gap-1.5 font-bold text-fingrow-coral text-sm">
                            <XCircle className="w-4 h-4" />
                            <span>Incorrect Choice</span>
                          </div>
                          <p className="text-fingrow-midnight leading-relaxed">
                            <strong className="text-fingrow-coral font-semibold">Why your choice was flawed: </strong>
                            {resultItem.userChoiceExplanation || resultItem.incorrectExplanation || "This option does not align with core financial mechanics."}
                          </p>
                          <div className="pt-2 border-t border-fingrow-coral/20 text-fingrow-midnight/80 leading-relaxed">
                            <strong className="text-fingrow-midnight font-semibold">Correct Concept & Analysis: </strong>
                            {resultItem.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Submit or Score Banner */}
        {!submitted ? (
          <div className="pt-2 flex justify-end">
            <Button size="lg" variant="primary" onClick={handleQuizSubmit} isLoading={submitting}>
              <span>Submit Quiz Answers</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        ) : (
          <div className="bg-fingrow-midnight text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-fingrow-lime" />
                  <h3 className="text-2xl font-extrabold text-white">
                    Score: {quizResult?.score}% ({quizResult?.correctCount}/{quizResult?.totalQuestions} Correct)
                  </h3>
                </div>
                <p className="text-xs text-white/70">
                  {quizResult?.passed
                    ? "Congratulations! You passed this knowledge check."
                    : "Review the correct and incorrect answer explanations above to strengthen your financial intuition."}
                </p>
              </div>

              {quizResult?.awardedXp > 0 && (
                <div className="bg-fingrow-emerald/30 border border-fingrow-emerald px-4 py-2 rounded-2xl flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-fingrow-lime" />
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-white/70">XP Earned</div>
                    <div className="text-base font-extrabold text-fingrow-lime">+{quizResult.awardedXp} XP</div>
                  </div>
                </div>
              )}
            </div>

            {quizResult?.guest && (
              <div className="p-3.5 rounded-xl bg-white/10 border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-fingrow-lime">Preview Mode: </span>
                  <span className="text-white/80">Sign in to save your score, earn XP, maintain daily streaks, and earn badges!</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href="/login">
                    <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10 text-xs">
                      Sign In
                    </Button>
                  </a>
                  <a href="/register">
                    <Button variant="accent" size="sm" className="text-xs">
                      Create Account
                    </Button>
                  </a>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10"
                onClick={() => {
                  setSubmitted(false);
                  setSelectedAnswers({});
                  setQuizResult(null);
                }}
              >
                Retake Quiz
              </Button>

              {nextLesson ? (
                <a href={`/learn/${course.slug}/${nextLesson.slug}`} className="w-full sm:w-auto">
                  <Button variant="accent" size="sm" className="w-full sm:w-auto font-bold">
                    <span>Next Lesson: {nextLesson.title}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </a>
              ) : (
                <a href="/learn" className="w-full sm:w-auto">
                  <Button variant="accent" size="sm" className="w-full sm:w-auto font-bold">
                    Track Complete! Explore Next Course
                  </Button>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

