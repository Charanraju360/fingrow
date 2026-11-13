import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classroomId, title, courseSlug, lessonSlug, dueDate } = await request.json();

    if (!classroomId || !title || !courseSlug || !lessonSlug || !dueDate) {
      return NextResponse.json({ error: "Missing required assignment fields" }, { status: 400 });
    }

    const classroom = db.classrooms.getById(classroomId);
    if (!classroom) {
      return NextResponse.json({ error: "Classroom not found" }, { status: 404 });
    }

    if (classroom.educatorId !== session.userId && session.role !== "platform_admin") {
      return NextResponse.json({ error: "Only the classroom educator can create assignments" }, { status: 403 });
    }

    const assignment = db.classrooms.createAssignment({
      classroomId,
      title: title.trim(),
      courseSlug,
      lessonSlug,
      dueDate,
    });

    return NextResponse.json({ success: true, assignment });
  } catch (err: any) {
    console.error("Create assignment error", err);
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
  }
}

