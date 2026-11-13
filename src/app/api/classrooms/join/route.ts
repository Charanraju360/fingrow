import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Please sign in to join a classroom" }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Classroom code is required" }, { status: 400 });
    }

    const rateCheck = checkRateLimit(`join_class_${session.userId}`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "Too many join attempts. Please slow down." }, { status: 429 });
    }

    const classroom = db.classrooms.enrollStudent(code, session.userId);
    if (!classroom) {
      return NextResponse.json({ error: "Classroom code not found. Please verify with your teacher." }, { status: 404 });
    }

    return NextResponse.json({ success: true, classroom });
  } catch (err: any) {
    console.error("Classroom join error", err);
    return NextResponse.json({ error: "Failed to join classroom" }, { status: 500 });
  }
}

