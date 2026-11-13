"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Swords,
  Copy,
  Check,
  Users,
  ArrowRight,
  Trophy,
  RotateCcw,
  Timer,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Clock,
  QrCode as QrIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { QRCode } from "@/components/ui/qr-code";

interface QuestionResult {
  questionId: string;
  questionText: string;
  userAnswerIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  pointsAwarded: number;
}

export default function BattleArenaPage() {
  const [viewState, setViewState] = useState<"lobby" | "waiting" | "playing" | "finished">("lobby");
  const [session, setSession] = useState<any>(null);
  const [myUserId, setMyUserId] = useState<string>("");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [history, setHistory] = useState<QuestionResult[]>([]);

  const timeLeftRef = useRef(15);
  timeLeftRef.current = timeLeft;

  // Poll session state when waiting for opponent
  useEffect(() => {
    if (viewState !== "waiting" || !session?.id) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/games/session?id=${session.id}`);
        const data = await res.json();
        if (res.ok && data.session) {
          setSession(data.session);
          // If guest joined, auto-start or notify host
          if (data.session.guestId && data.session.status === "in_progress") {
            setViewState("playing");
            setCurrentIdx(0);
            setTimeLeft(15);
            setMyScore(0);
            setOpponentScore(0);
          }
        }
      } catch (err) {
        console.error("Polling battle session error", err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [viewState, session?.id]);

  // Poll opponent score periodically while playing
  useEffect(() => {
    if (viewState !== "playing" || !session?.id) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/games/session?id=${session.id}`);
        const data = await res.json();
        if (res.ok && data.session) {
          const s = data.session;
          setSession(s);
          const isHost = s.hostId === myUserId;
          const oppId = isHost ? s.guestId : s.hostId;
          if (oppId && s.scores?.[oppId] !== undefined) {
            setOpponentScore(s.scores[oppId]);
          }
        }
      } catch (err) {
        console.error("Score poll error", err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [viewState, session?.id, myUserId]);

  async function handleCreateRoom() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/games/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", mode: "battle" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create battle room");
      setSession(data.session);
      setMyUserId(data.session.hostId);
      setViewState("waiting");
    } catch (err: any) {
      setError(err.message || "Could not create duel room");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinRoom() {
    const code = joinCodeInput.trim().toUpperCase();
    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-character room code");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/games/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", joinCode: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join battle room");
      setSession(data.session);
      setMyUserId(data.session.guestId);
      setViewState("playing");
      setCurrentIdx(0);
      setTimeLeft(15);
      setMyScore(0);
      setOpponentScore(data.session.scores?.[data.session.hostId] || 0);
      setHistory([]);
    } catch (err: any) {
      setError(err.message || "Failed to join duel room");
    } finally {
      setLoading(false);
    }
  }

  function handleStartBattleAsHost() {
    setViewState("playing");
    setCurrentIdx(0);
    setTimeLeft(15);
    setMyScore(0);
    setOpponentScore(session?.scores?.[session?.guestId] || 0);
    setHistory([]);
  }

  // Answer submission with server-authoritative scoring
  const handleAnswer = useCallback(
    async (optIdx: number) => {
      if (isAnswered || !session) return;
      setSelectedAnswer(optIdx);
      setIsAnswered(true);

      const q = session.questions[currentIdx];
      const isFinal = currentIdx === session.questions.length - 1;
      const remainingAtSubmit = optIdx === -1 ? 0 : timeLeftRef.current;

      try {
        const res = await fetch("/api/games/submit-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.id,
            guestUserId: myUserId,
            questionId: q.id,
            answerIndex: optIdx,
            timeRemaining: remainingAtSubmit,
            isFinalQuestion: isFinal,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setLastResult(data);
          if (data.pointsAwarded > 0) {
            setMyScore((prev) => prev + data.pointsAwarded);
          }
          setHistory((prev) => [
            ...prev,
            {
              questionId: q.id,
              questionText: q.question,
              userAnswerIndex: optIdx,
              correctIndex: data.correctIndex ?? q.correctIndex,
              isCorrect: data.isCorrect,
              pointsAwarded: data.pointsAwarded,
            },
          ]);

          // Update opponent score from returned session
          if (data.session) {
            setSession(data.session);
            const isHost = data.session.hostId === myUserId;
            const oppId = isHost ? data.session.guestId : data.session.hostId;
            if (oppId && data.session.scores?.[oppId] !== undefined) {
              setOpponentScore(data.session.scores[oppId]);
            }
          }
        }
      } catch (err) {
        console.error("Answer failed", err);
      }
    },
    [isAnswered, session, currentIdx, myUserId]
  );

  // 15-second timer per question
  useEffect(() => {
    if (viewState !== "playing" || isAnswered) return;

    if (timeLeft <= 0) {
      handleAnswer(-1); // Timeout
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [viewState, timeLeft, isAnswered, handleAnswer]);

  function handleNext() {
    if (!session?.questions) return;

    if (currentIdx < session.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setTimeLeft(15);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setLastResult(null);
    } else {
      setViewState("finished");
    }
  }

  function copyCode() {
    if (!session?.joinCode) return;
    navigator.clipboard.writeText(session.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const currentQ = session?.questions?.[currentIdx];
  const timerPercentage = (timeLeft / 15) * 100;
  const isUrgent = timeLeft <= 5;

  // Determine Duel Outcome
  const isHost = session?.hostId === myUserId;
  const myFinalScore = myScore;
  const opponentName = isHost ? session?.guestName || "Opponent" : session?.hostName || "Host";
  const myName = isHost ? session?.hostName || "You" : session?.guestName || "You";

  const isWon = myFinalScore > opponentScore;
  const isTie = myFinalScore === opponentScore;
  const earnedXp = isWon ? 150 : isTie ? 75 : 50;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <Badge variant="coral" size="sm">
          <Swords className="w-3.5 h-3.5 mr-1" />
          1v1 ARENA
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-fingrow-midnight tracking-tight">
          Financial Head-to-Head Duel
        </h1>
        <p className="text-sm text-fingrow-midnight/70 max-w-lg mx-auto">
          Private room code matchmaking, 15-second countdown timers, and server-authoritative scoring.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-fingrow-coral/10 border border-fingrow-coral/20 text-fingrow-coral text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* LOBBY VIEW */}
      {viewState === "lobby" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="hover:border-fingrow-coral transition-all border-fingrow-midnight/10 shadow-finCard flex flex-col justify-between">
            <CardContent className="pt-6 sm:p-7 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-fingrow-coral/15 text-fingrow-coral flex items-center justify-center">
                <Swords className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-xl text-fingrow-midnight">Host a New Duel</h3>
                <p className="text-xs text-fingrow-midnight/70 leading-relaxed">
                  Generate a private 6-character room code and QR code. Invite a friend or classmate to battle.
                </p>
              </div>
              <div className="p-3 bg-fingrow-ivory rounded-xl text-xs space-y-1">
                <div className="flex justify-between text-fingrow-midnight/70">
                  <span>Match Type:</span>
                  <strong className="text-fingrow-midnight">Synchronized 1v1</strong>
                </div>
                <div className="flex justify-between text-fingrow-midnight/70">
                  <span>Winner Award:</span>
                  <strong className="text-fingrow-coral">+150 XP Bonus</strong>
                </div>
              </div>
            </CardContent>
            <div className="p-6 pt-0">
              <Button
                variant="danger"
                size="lg"
                className="w-full font-bold"
                onClick={handleCreateRoom}
                isLoading={loading}
              >
                <span>Create Battle Room</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </Card>

          <Card className="hover:border-fingrow-emerald transition-all border-fingrow-midnight/10 shadow-finCard flex flex-col justify-between">
            <CardContent className="pt-6 sm:p-7 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-fingrow-emerald/10 text-fingrow-emerald flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-xl text-fingrow-midnight">Join an Existing Duel</h3>
                <p className="text-xs text-fingrow-midnight/70 leading-relaxed">
                  Have a 6-character room code from your peer? Enter it below to join the match immediately.
                </p>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Enter 6-char Code (e.g. 8K2M9N)"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase().slice(0, 6))}
                  maxLength={6}
                  className="font-mono uppercase tracking-widest text-center font-bold text-base"
                />
              </div>
            </CardContent>
            <div className="p-6 pt-0">
              <Button
                variant="primary"
                size="lg"
                className="w-full font-bold"
                onClick={handleJoinRoom}
                isLoading={loading}
                disabled={joinCodeInput.trim().length !== 6}
              >
                <span>Join Duel Match</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* WAITING ROOM (Host View) */}
      {viewState === "waiting" && session && (
        <Card className="text-center p-8 sm:p-12 space-y-8 border-fingrow-midnight/15 shadow-finElevated">
          <div className="space-y-2">
            <Badge variant="coral">
              <Clock className="w-3.5 h-3.5 mr-1 animate-spin" />
              WAITING FOR OPPONENT
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-fingrow-midnight">
              Share Duel Room Code
            </h2>
            <p className="text-xs sm:text-sm text-fingrow-midnight/60 max-w-md mx-auto">
              Your opponent enters this 6-character code or scans the QR code to join your match.
            </p>
          </div>

          {/* 6-Character Room Code Display */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="inline-flex items-center gap-3 bg-fingrow-ivory border-2 border-fingrow-midnight/20 px-8 py-5 rounded-3xl shadow-inner">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-fingrow-midnight">
                {session.joinCode}
              </span>
              <Button size="sm" variant="outline" onClick={copyCode} className="ml-2">
                {copied ? (
                  <Check className="w-4 h-4 text-fingrow-emerald" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* QR Code Toggle & Display */}
            <div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowQR((prev) => !prev)}
                className="text-xs"
              >
                <QrIcon className="w-3.5 h-3.5 mr-1" />
                <span>{showQR ? "Hide QR Code" : "Show QR Code"}</span>
              </Button>
            </div>

            {showQR && (
              <div className="p-4 bg-white rounded-2xl border border-fingrow-midnight/10 shadow-sm animate-fade-in">
                <QRCode value={session.joinCode} size={160} />
              </div>
            )}
          </div>

          {/* Opponent Status Indicator */}
          <div className="p-4 rounded-2xl bg-fingrow-ivory border border-fingrow-midnight/10 max-w-sm mx-auto flex items-center justify-center gap-3">
            {session.guestName ? (
              <div className="flex items-center gap-2 text-fingrow-emerald font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Opponent Connected: {session.guestName}!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-fingrow-midnight/60 font-medium text-xs">
                <div className="w-2 h-2 rounded-full bg-fingrow-coral animate-ping" />
                <span>Waiting for opponent to connect code...</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              variant="danger"
              onClick={handleStartBattleAsHost}
              className="w-full sm:w-auto font-bold"
            >
              <span>{session.guestName ? "Start Duel Now" : "Start Practice Round"}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setViewState("lobby")}
              className="w-full sm:w-auto"
            >
              Cancel Room
            </Button>
          </div>
        </Card>
      )}

      {/* PLAYING VIEW */}
      {viewState === "playing" && session && currentQ && (
        <Card className="border-fingrow-midnight/15 shadow-finElevated overflow-hidden">
          {/* Top Head-to-Head Banner */}
          <div className="bg-fingrow-midnight text-white p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="coral" size="sm">
                <Swords className="w-3.5 h-3.5 mr-1" />
                DUEL IN PROGRESS
              </Badge>
              <span className="text-xs text-white/60 font-semibold hidden sm:inline">
                Question {currentIdx + 1} of {session.questions.length}
              </span>
            </div>

            {/* Live Scoreboard */}
            <div className="flex items-center gap-4 text-xs font-mono font-bold">
              <div className="text-fingrow-lime bg-white/10 px-3 py-1 rounded-full">
                {myName}: {myScore} PTS
              </div>
              <div className="text-white/40">VS</div>
              <div className="text-fingrow-coral bg-white/10 px-3 py-1 rounded-full">
                {opponentName}: {opponentScore} PTS
              </div>
            </div>
          </div>

          {/* 15-second Timer countdown bar */}
          <div className="px-6 pt-4 pb-2 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-fingrow-midnight/60">
                Question {currentIdx + 1}/{session.questions.length}
              </span>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${
                  isUrgent
                    ? "bg-fingrow-coral/15 text-fingrow-coral animate-pulse"
                    : "bg-fingrow-midnight/5 text-fingrow-midnight"
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                <span>{timeLeft}s</span>
              </div>
            </div>
            <Progress
              value={timerPercentage}
              className="h-1.5"
              indicatorClassName={isUrgent ? "bg-fingrow-coral" : "bg-fingrow-emerald"}
            />
          </div>

          <CardContent className="pt-4 sm:p-6 space-y-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-fingrow-midnight leading-snug">
              {currentQ.question}
            </h2>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt: string, optIdx: number) => {
                const isSelected = selectedAnswer === optIdx;
                const correctIdx = lastResult?.correctIndex ?? currentQ.correctIndex;

                let optStyle =
                  "border-fingrow-midnight/15 hover:border-fingrow-coral hover:bg-fingrow-ivory/60 bg-white text-fingrow-midnight";

                if (isAnswered) {
                  if (optIdx === correctIdx) {
                    optStyle =
                      "border-fingrow-emerald bg-fingrow-emerald/15 text-fingrow-darkEmerald font-bold";
                  } else if (isSelected && !lastResult?.isCorrect) {
                    optStyle = "border-fingrow-coral bg-fingrow-coral/15 text-fingrow-coral font-bold";
                  } else {
                    optStyle = "opacity-40 border-fingrow-midnight/10 bg-white text-fingrow-midnight/50";
                  }
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleAnswer(optIdx)}
                    className={`w-full text-left p-4 rounded-2xl border text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${optStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-fingrow-midnight/5 flex items-center justify-center text-xs font-bold text-fingrow-midnight/70 flex-shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </div>

                    {isAnswered && optIdx === correctIdx && (
                      <CheckCircle2 className="w-5 h-5 text-fingrow-emerald flex-shrink-0 ml-2" />
                    )}
                    {isAnswered && isSelected && !lastResult?.isCorrect && (
                      <XCircle className="w-5 h-5 text-fingrow-coral flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Concept Explanation Box */}
            {isAnswered && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-1.5 animate-fade-in ${
                  lastResult?.isCorrect
                    ? "bg-fingrow-emerald/10 border-fingrow-emerald/20 text-fingrow-midnight"
                    : "bg-fingrow-coral/10 border-fingrow-coral/20 text-fingrow-midnight"
                }`}
              >
                <div className="font-extrabold flex items-center justify-between">
                  <span>
                    {lastResult?.isCorrect
                      ? `Correct! +${lastResult?.pointsAwarded || 100} Points`
                      : selectedAnswer === -1
                      ? "Time Expired (0 Points)"
                      : "Incorrect (0 Points)"}
                  </span>
                  <span className="text-[11px] font-mono text-fingrow-midnight/60">
                    Server Verified
                  </span>
                </div>
                <p className="text-fingrow-midnight/80 leading-relaxed font-normal">
                  {lastResult?.explanation || currentQ.explanation}
                </p>
              </div>
            )}

            {isAnswered && (
              <div className="pt-2 flex justify-end">
                <Button size="lg" variant="primary" onClick={handleNext} className="font-bold">
                  <span>
                    {currentIdx < session.questions.length - 1 ? "Next Round" : "Finish Duel"}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* FINISHED VIEW (Duel Completion) */}
      {viewState === "finished" && (
        <div className="bg-fingrow-midnight text-white rounded-3xl p-8 sm:p-12 text-center space-y-8 shadow-2xl border border-white/10">
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-inner ${
              isWon
                ? "bg-fingrow-lime/20 text-fingrow-lime"
                : isTie
                ? "bg-fingrow-yellow/20 text-fingrow-yellow"
                : "bg-fingrow-coral/20 text-fingrow-coral"
            }`}
          >
            {isWon ? <Trophy className="w-10 h-10" /> : <Swords className="w-10 h-10" />}
          </div>

          <div className="space-y-3">
            <Badge variant={isWon ? "lime" : isTie ? "yellow" : "coral"} size="sm">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              {isWon ? "MATCH VICTORY" : isTie ? "HONORABLE DRAW" : "MATCH DEFEAT"}
            </Badge>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {isWon
                ? "You Won the Duel!"
                : isTie
                ? "Equal Financial Mastery!"
                : `${opponentName} Took the Win!`}
            </h2>

            <p className="text-white/70 text-sm max-w-md mx-auto leading-relaxed">
              {isWon
                ? `You outmaneuvered ${opponentName} on timing and financial precision. +150 XP bonus awarded!`
                : isTie
                ? "Incredible duel! Both players matched point for point under pressure. +75 XP awarded!"
                : `A fiercely contested match. Review the questions to sharpen your concepts. +50 XP awarded!`}
            </p>
          </div>

          {/* Head-to-Head Comparison Card */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto bg-white/5 rounded-3xl p-6 border border-white/10">
            <div className="text-center space-y-1">
              <span className="text-xs text-white/60 font-semibold block truncate">{myName} (You)</span>
              <span
                className={`text-3xl font-extrabold font-mono block ${
                  isWon ? "text-fingrow-lime" : "text-white"
                }`}
              >
                {myFinalScore}
              </span>
              <span className="text-[11px] text-white/50 uppercase">Points</span>
            </div>

            <div className="text-center space-y-1 border-l border-white/10">
              <span className="text-xs text-white/60 font-semibold block truncate">{opponentName}</span>
              <span
                className={`text-3xl font-extrabold font-mono block ${
                  !isWon && !isTie ? "text-fingrow-coral" : "text-white"
                }`}
              >
                {opponentScore}
              </span>
              <span className="text-[11px] text-white/50 uppercase">Points</span>
            </div>
          </div>

          {/* XP Awarded Callout */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-5 py-2.5 rounded-2xl text-xs font-bold text-fingrow-lime">
            <ShieldCheck className="w-4 h-4" />
            <span>+{earnedXp} XP Verified & Credited to Profile</span>
          </div>

          {/* Questions Recap */}
          {history.length > 0 && (
            <div className="max-w-lg mx-auto bg-white/5 rounded-2xl p-4 border border-white/10 text-left space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                Your Duel Question Breakdown
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

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              variant="accent"
              onClick={() => {
                setViewState("lobby");
                setSession(null);
                setJoinCodeInput("");
                setHistory([]);
              }}
              className="w-full sm:w-auto font-bold"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              <span>Host Another Duel</span>
            </Button>

            <a href="/games/leaderboard" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-white border-white/20 hover:bg-white/10"
              >
                Check Leaderboard
              </Button>
            </a>

            <a href="/games" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-white border-white/20 hover:bg-white/10"
              >
                Back to Arena
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
