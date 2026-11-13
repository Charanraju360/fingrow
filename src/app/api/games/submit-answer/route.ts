import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    const body = await request.json().catch(() => ({}));
    const { sessionId, questionId, answerIndex, timeRemaining, isFinalQuestion, guestUserId } = body;

    const activeUserId = session?.userId || guestUserId;
    if (!activeUserId) {
      return NextResponse.json({ error: "Active player identity is required" }, { status: 401 });
    }

    if (!sessionId || !questionId || answerIndex === undefined) {
      return NextResponse.json(
        { error: "Session ID, question ID, and answer index are required" },
        { status: 400 }
      );
    }

    // Server-authoritative answer scoring
    const result = db.games.recordAnswer(
      sessionId,
      activeUserId,
      questionId,
      Number(answerIndex),
      typeof timeRemaining === "number" ? timeRemaining : undefined
    );

    if (!result.session) {
      return NextResponse.json({ error: "Game session not found" }, { status: 404 });
    }

    // If final question, mark player as finished or complete the session
    if (isFinalQuestion) {
      db.games.finishSession(sessionId, activeUserId);
    }

    const updatedSession = db.games.getSessionById(sessionId);

    return NextResponse.json({
      success: true,
      isCorrect: result.isCorrect,
      correctIndex: result.correctIndex,
      explanation: result.explanation,
      pointsAwarded: result.pointsAwarded,
      alreadyAnswered: result.alreadyAnswered || false,
      session: updatedSession,
    });
  } catch (err: any) {
    console.error("Game submit answer error", err);
    return NextResponse.json({ error: "Failed to record answer" }, { status: 500 });
  }
}
