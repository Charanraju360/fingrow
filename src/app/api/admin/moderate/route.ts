import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "platform_admin") {
      return NextResponse.json(
        { error: "Forbidden: Platform administrator access required" },
        { status: 403 }
      );
    }

    const reports = db.admin.getModerationQueue();
    return NextResponse.json({ success: true, reports });
  } catch (err: any) {
    console.error("Moderation queue fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch moderation queue" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "platform_admin") {
      return NextResponse.json(
        { error: "Forbidden: Platform administrator access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reportId, decision, notes = "Moderated per platform safety guidelines" } = body;

    if (!reportId || !decision) {
      return NextResponse.json(
        { error: "Report ID and decision are required" },
        { status: 400 }
      );
    }

    if (decision !== "resolved" && decision !== "dismissed") {
      return NextResponse.json(
        { error: "Invalid decision. Must be 'resolved' or 'dismissed'" },
        { status: 400 }
      );
    }

    const updated = db.admin.resolveReport(
      reportId,
      decision,
      notes,
      session.userId,
      session.name
    );

    if (!updated) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, report: updated });
  } catch (err: any) {
    console.error("Moderation resolution error:", err);
    return NextResponse.json({ error: "Failed to resolve report" }, { status: 500 });
  }
}
