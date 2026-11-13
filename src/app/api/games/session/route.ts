import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const joinCode = searchParams.get("joinCode") || searchParams.get("code");

    if (id) {
      const session = db.games.getSessionById(id);
      if (!session) {
        return NextResponse.json({ error: "Game session not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, session });
    }

    if (joinCode) {
      const session = db.games.getSessionByCode(joinCode);
      if (!session) {
        return NextResponse.json({ error: "Game session not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, session });
    }

    return NextResponse.json({ error: "Either id or joinCode is required" }, { status: 400 });
  } catch (err: any) {
    console.error("Game session GET error", err);
    return NextResponse.json({ error: "Failed to retrieve game session" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    // Allow guest play with fallback identity if not logged in
    const userId = session?.userId || `guest_${Math.random().toString(36).substring(2, 9)}`;
    const userName = session?.name || "Guest Adventurer";

    const body = await request.json().catch(() => ({}));
    const { action, mode = "quick", joinCode, sessionId } = body;

    if (action === "join") {
      if (!joinCode || typeof joinCode !== "string") {
        return NextResponse.json({ error: "6-character join code is required" }, { status: 400 });
      }

      const cleanCode = joinCode.trim().toUpperCase();
      if (cleanCode.length !== 6) {
        return NextResponse.json({ error: "Join code must be exactly 6 characters" }, { status: 400 });
      }

      const game = db.games.joinSession(cleanCode, userId, userName);
      if (!game) {
        return NextResponse.json(
          { error: "Invalid join code, room not found, or match already started" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, session: game });
    } else if (action === "start") {
      if (!sessionId) {
        return NextResponse.json({ error: "Session ID is required to start match" }, { status: 400 });
      }
      const game = db.games.getSessionById(sessionId);
      if (!game) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
      game.status = "in_progress";
      return NextResponse.json({ success: true, session: game });
    } else if (action === "get" || action === "poll") {
      if (!sessionId) {
        return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
      }
      const game = db.games.getSessionById(sessionId);
      if (!game) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, session: game });
    } else {
      // Create session
      const validMode = mode === "battle" ? "battle" : "quick";
      const game = db.games.createSession(userId, userName, validMode);
      return NextResponse.json({ success: true, session: game });
    }
  } catch (err: any) {
    console.error("Game session POST error", err);
    return NextResponse.json({ error: "Failed to manage game session" }, { status: 500 });
  }
}
