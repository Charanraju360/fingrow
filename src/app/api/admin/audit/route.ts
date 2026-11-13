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

    const logs = db.admin.getAuditLogs();
    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    console.error("Admin audit fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
