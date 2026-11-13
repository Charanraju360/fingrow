import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Please sign in to report content" }, { status: 401 });
    }

    const { targetType = "post", targetId, reason, notes } = await request.json();

    if (!targetId || !reason) {
      return NextResponse.json({ error: "Target ID and reason are required" }, { status: 400 });
    }

    const report = db.community.createReport({
      targetType,
      targetId,
      reporterUserId: session.userId,
      reporterName: session.name,
      reason: reason.trim(),
      notes: notes ? notes.trim() : undefined,
    });

    return NextResponse.json({
      success: true,
      report,
      message: "Thank you for reporting. Our moderation team has received the alert and will review it.",
    });
  } catch (err: any) {
    console.error("Report error", err);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
