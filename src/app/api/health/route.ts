import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const metrics = db.admin.getPlatformMetrics();
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "1.0.0",
      database: "connected (ACID JSON repository)",
      metrics,
    });
  } catch (err: any) {
    return NextResponse.json({ status: "unhealthy", error: err.message }, { status: 500 });
  }
}

