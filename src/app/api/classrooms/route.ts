import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role === "educator" || session.role === "institution_admin") {
    const classrooms = db.classrooms.getByEducator(session.userId);
    return NextResponse.json({ success: true, classrooms });
  } else {
    const classrooms = db.classrooms.getByStudent(session.userId);
    return NextResponse.json({ success: true, classrooms });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "educator" && session.role !== "institution_admin" && session.role !== "platform_admin") {
      return NextResponse.json({ error: "Only educators and institution admins can create classrooms" }, { status: 403 });
    }

    const { name, subject, institution, customCode } = await request.json();

    if (!name || !subject) {
      return NextResponse.json({ error: "Classroom name and subject are required" }, { status: 400 });
    }

    let code = customCode ? customCode.trim().toUpperCase() : "";
    if (code) {
      // Clean invalid characters
      code = code.replace(/[^A-Z0-9-]/g, "");
      const existing = db.classrooms.getByCode(code);
      if (existing) {
        return NextResponse.json({ error: "A classroom with this code already exists. Please choose another code." }, { status: 409 });
      }
    } else {
      let attempts = 0;
      do {
        code = `CLS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        attempts++;
      } while (db.classrooms.getByCode(code) && attempts < 20);
    }

    const classroom = db.classrooms.create({
      code,
      name: name.trim(),
      subject: subject.trim(),
      educatorId: session.userId,
      educatorName: session.name,
      institution: institution || "FinGrow Academy",
    });

    return NextResponse.json({ success: true, classroom });
  } catch (err: any) {
    console.error("Create classroom error", err);
    return NextResponse.json({ error: "Failed to create classroom" }, { status: 500 });
  }
}

