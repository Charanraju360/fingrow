"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Timer,
  Award,
  Zap,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  Swords,
  ChevronRight,
  Clock,
  Check,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface QuestionAnswerResult {
  questionId: string;
  questionText: string;
  userAnswerIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  pointsAwarded: number;
  timeRemaining: number;
}

export default function QuickGamePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<QuestionAnswerResult[]>([]);

  // Ref to hold timeLeft to avoid stale closure in timeout callback
  const timeLeftRef = useRef(15);
  timeLeftRef.current = timeLeft;

  const initGame = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/games/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", mode: "quick" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start quick sprint game");
      }
      setSessionData(data.session);
      setCurrentIdx(0);
      setTimeLeft(15);
      setTotalScore(0);
      setGameOver(false);
      setSelectedAnswer(null);
      setQuestionAnswered(false);
      setLastResult(null);
      setHistory([]);
    } catch (err: any) {
      setError(err.message || "Failed to initialize game session");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize game on mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Submit answer handler (server-authoritative)
  const submitAnswer = useCallback(
    async (answerIdx: number) => {
      if (questionAnswered || !sessionData) return;

      setSelectedAnswer(answerIdx);
      setQuestionAnswered(true);

      const currentQ = sessionData.questions[currentIdx];
      const isFinal = currentIdx === sessionData.questions.length - 1;
      const remainingAtSubmit = answerIdx === -1 ? 0 : timeLeftRef.current;

      try {
        const res = await fetch("/api/games/submit-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionData.id,
            guestUserId: sessionData.hostId,
            questionId: currentQ.id,
            answerIndex: answerIdx,
            timeRemaining: remainingAtSubmit,
            isFinalQuestion: isFinal,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setLastResult(data);
          if (data.pointsAwarded > 0) {
            setTotalScore((prev) => prev + data.pointsAwarded);
          }
          // Record question history
          setHistory((prev) => [
            ...prev,
            {
              questionId: currentQ.id,
              questionText: currentQ.question,
              userAnswerIndex: answerIdx,
              correctIndex: data.correctIndex ?? currentQ.correctIndex,
              isCorrect: data.isCorrect,
              pointsAwarded: data.pointsAwarded,
              timeRemaining: remainingAtSubmit,
            },
          ]);
        } else {
          console.error("Answer submission response error", data);
        }
      } catch (err) {
        console.error("Answer submission failed", err);
      }
    },
    [questionAnswered, sessionData, currentIdx]
  );

  // 15-second countdown timer per question
  useEffect(() => {
    if (loading || gameOver || questionAnswered) return;

    if (timeLeft <= 0) {
      submitAnswer(-1); // Auto-submit timed out
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, gameOver, questionAnswered, submitAnswer]);

  function handleNextQuestion() {
    if (!sessionData?.questions) return;

    if (currentIdx < sessionData.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setTimeLeft(15);
      setSelectedAnswer(null);
      setQuestionAnswered(false);
      setLastResult(null);
    } else {
      setGameOver(true);
      router.refresh();
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-fingrow-emerald/15 flex items-center justify-center text-fingrow-emerald animate-pulse">
          <Zap className="w-8 h-8" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="font-extrabold text-lg text-fingrow-midnight">Starting Quick Sprint...</h3>
          <p className="text-xs text-fingrow-midnight/60">Loading financial quiz questions & session</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-fingrow-midnight/10 text-center space-y-5 shadow-finCard">
        <div className="w-12 h-12 rounded-2xl bg-fingrow-coral/15 text-fingrow-coral flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-extrabold text-lg text-fingrow-midnight">Unable to Start Sprint</h3>
          <p className="text-xs text-fingrow-midnight/70 leading-relaxed">{error}</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Button size="md" variant="primary" onClick={initGame}>
            Retry Sprint
          </Button>
          <a href="/games">
            <Button size="md" variant="outline">
              Back to Arena
            </Button>
          </a>
        </div>
      </div>
    );
  }

  const currentQuestion = sessionData?.questions?.[currentIdx];
  const timerPercentage = (timeLeft / 15) * 100;
  const isUrgent = timeLeft <= 5;
  const correctCount = history.filter((h) => h.isCorrect).length;
  const accuracyPercentage = history.length > 0 ? Math.round((correctCount / history.length) * 100) : 0;
  const earnedXp = Math.max(50, Math.round(totalScore * 0.3));

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-fingrow-midnight/10 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Badge variant="emerald" size="sm">
              <Zap className="w-3.5 h-3.5 mr-1" />
              QUICK SPRINT
            </Badge>
            <span className="text-xs font-bold text-fingrow-midnight/60">
              Question {currentIdx + 1} of {sessionData?.questions?.length || 5}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* 15-second countdown timer display */}
            <div
              className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full transition-colors ${
                isUrgent
                  ? "bg-fingrow-coral/15 text-fingrow-coral animate-pulse"
                  : "bg-fingrow-midnight/5 text-fingrow-midnight"
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>{timeLeft}s</span>
            </div>

            {/* Total Points */}
            <div className="text-xs font-mono font-extrabold text-fingrow-emerald bg-fingrow-emerald/10 px-3 py-1 rounded-full">
              {totalScore} PTS
            </div>
          </div>
        </div>

        {/* Countdown visual progress bar */}
        <Progress
          value={timerPercentage}
          className="h-1.5"
          indicatorClassName={isUrgent ? "bg-fingrow-coral" : "bg-fingrow-emerald"}
        />
      </div>

      {!gameOver && currentQuestion ? (
        <Card className="border-fingrow-midnight/15 shadow-finElevated overflow-hidden">
          <CardContent className="pt-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-fingrow-midnight/50">
                <span>15 SECONDS PER QUESTION</span>
                {isUrgent && !questionAnswered && (
                  <span className="text-fingrow-coral font-bold animate-pulse">Hurry, time running out!</span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-fingrow-midnight leading-snug">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt: string, optIdx: number) => {
                const isSelected = selectedAnswer === optIdx;
                const correctIdx = lastResult?.correctIndex ?? currentQuestion.correctIndex;

                let btnStyle =
                  "border-fingrow-midnight/15 hover:border-fingrow-emerald hover:bg-fingrow-ivory/60 bg-white text-fingrow-midnight";

                if (questionAnswered) {
                  if (optIdx === correctIdx) {
                    btnStyle =
                      "border-fingrow-emerald bg-fingrow-emerald/15 text-fingrow-darkEmerald font-bold shadow-sm";
                  } else if (isSelected && !lastResult?.isCorrect) {
                    btnStyle = "border-fingrow-coral bg-fingrow-coral/15 text-fingrow-coral font-bold";
                  } else {
                    btnStyle = "opacity-40 border-fingrow-midnight/10 bg-white text-fingrow-midnight/50";
                  }
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={questionAnswered}
                    onClick={() => submitAnswer(optIdx)}
                    className={`w-full text-left p-4 rounded-2xl border text-sm transition-all flex items-center justify-between font-medium cursor-pointer ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-fingrow-midnight/5 flex items-center justify-center text-xs font-bold text-fingrow-midnight/70 flex-shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </div>

                    {questionAnswered && optIdx === correctIdx && (
                      <CheckCircle2 className="w-5 h-5 text-fingrow-emerald flex-shrink-0 ml-2" />
                    )}
                    {questionAnswered && isSelected && !lastResult?.isCorrect && (
                      <XCircle className="w-5 h-5 text-fingrow-coral flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Detailed Explanation and Server Feedback */}
            {questionAnswered && (
              <div
                className={`p-5 rounded-2xl border text-xs space-y-2 animate-fade-in ${
                  lastResult?.isCorrect
                    ? "bg-fingrow-emerald/10 border-fingrow-emerald/20 text-fingrow-midnight"
                    : selectedAnswer === -1
                    ? "bg-fingrow-coral/10 border-fingrow-coral/20 text-fingrow-midnight"
                    : "bg-fingrow-ivory border-fingrow-midnight/10 text-fingrow-midnight"
                }`}
              >
                <div className="flex items-center justify-between font-extrabold">
                  <span className="flex items-center gap-1.5">
                    {lastResult?.isCorrect ? (
                      <>
                        <Check className="w-4 h-4 text-fingrow-emerald" />
                        <span className="text-fingrow-emerald">
                          Correct! +{lastResult?.pointsAwarded || 100} Points
                        </span>
                      </>
                    ) : selectedAnswer === -1 ? (
                      <>
                        <Clock className="w-4 h-4 text-fingrow-coral" />
                        <span className="text-fingrow-coral">Time Expired (0 Points)</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-fingrow-coral" />
                        <span className="text-fingrow-coral">Incorrect (0 Points)</span>
                      </>
                    )}
                  </span>
                  <span className="text-fingrow-midnight/60 font-mono text-[11px]">
                    Answer verified by server
                  </span>
                </div>
                <p className="text-fingrow-midnight/80 leading-relaxed font-normal">
                  {lastResult?.explanation || currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Next Action Button */}
            {questionAnswered && (
              <div className="pt-2 flex justify-end">
                <Button size="lg" variant="primary" onClick={handleNextQuestion} className="font-bold">
                  <span>
                    {currentIdx < sessionData.questions.length - 1 ? "Next Question" : "View Final Results"}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* CLEAN GAME OVER / COMPLETION SCREEN */
        <div className="bg-fingrow-midnight text-white rounded-3xl p-8 sm:p-12 text-center space-y-8 shadow-2xl border border-white/10">
          <div className="w-20 h-20 rounded-3xl bg-fingrow-lime/20 text-fingrow-lime flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <Badge variant="lime" size="sm">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              SPRINT COMPLETED
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Final Score: {totalScore} Points
            </h1>
            <p className="text-white/70 text-sm max-w-md mx-auto leading-relaxed">
              Fantastic sprint! Server-authoritative scoring verified your financial reflexes under 15-second time
              pressure.
            </p>
          </div>

          {/* XP Bonus Callout */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-4 py-2 rounded-2xl text-xs font-bold text-fingrow-lime">
            <Award className="w-4 h-4" />
            <span>+{earnedXp} XP Awarded to Your FinGrow Profile</span>
          </div>

          {/* Performance Stats Grid */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
              <span className="text-[11px] text-white/50 uppercase font-bold block">Correct</span>
              <span className="text-xl font-extrabold text-white">
                {correctCount}/{sessionData?.questions?.length || 5}
              </span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
              <span className="text-[11px] text-white/50 uppercase font-bold block">Accuracy</span>
              <span className="text-xl font-extrabold text-fingrow-lime">{accuracyPercentage}%</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-center">
              <span className="text-[11px] text-white/50 uppercase font-bold block">XP Gained</span>
              <span className="text-xl font-extrabold text-fingrow-yellow">+{earnedXp}</span>
            </div>
          </div>

          {/* Question Breakdown List */}
          {history.length > 0 && (
            <div className="max-w-lg mx-auto bg-white/5 rounded-2xl p-4 border border-white/10 text-left space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                Question Breakdown
              </h4>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div
                    key={h.questionId || i}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {h.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-fingrow-lime flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-fingrow-coral flex-shrink-0" />
                      )}
                      <span className="truncate text-white/80">
                        Q{i + 1}: {h.questionText}
                      </span>
                    </div>
                    <span
                      className={`font-mono font-bold flex-shrink-0 ${
                        h.isCorrect ? "text-fingrow-lime" : "text-white/40"
                      }`}
                    >
                      {h.isCorrect ? `+${h.pointsAwarded}` : "0"} PTS
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button size="lg" variant="accent" onClick={initGame} className="w-full sm:w-auto font-bold">
              <RotateCcw className="w-4 h-4 mr-2" />
              <span>Play Another Sprint</span>
            </Button>

            <a href="/games/battle" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-white border-white/20 hover:bg-white/10"
              >
                <Swords className="w-4 h-4 mr-2 text-fingrow-coral" />
                <span>Try 1v1 Battle</span>
              </Button>
            </a>

            <a href="/games/leaderboard" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-white border-white/20 hover:bg-white/10"
              >
                Leaderboard
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
