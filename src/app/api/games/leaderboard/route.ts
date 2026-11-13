import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || undefined;
    const sortBy = (searchParams.get("sortBy") as "xp" | "streak") || "xp";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : undefined;

    const leaders = db.gamification.getLeaderboard({ role, sortBy, limit });

    // Aggregate summary stats for the client
    const allUsers = db.users.getAll();
    const topXp = allUsers.length > 0 ? Math.max(...allUsers.map((u) => u.xp)) : 0;
    const topStreak = allUsers.length > 0 ? Math.max(...allUsers.map((u) => u.streakDays)) : 0;
    const allAchievements = db.achievements.getAll();

    return NextResponse.json({
      success: true,
      leaders,
      totalCount: leaders.length,
      metrics: {
        totalRankedLearners: allUsers.length,
        topXp,
        topStreak,
        totalAvailableAchievements: allAchievements.length,
      },
    });
  } catch (err: any) {
    console.error("Leaderboard GET error:", err);
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
  }
}
