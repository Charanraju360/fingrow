import { NextResponse } from "next/server";
import { getCurrentUser, COOKIE_NAME } from "@/lib/auth/session";
import { signSession } from "@/lib/auth/crypto";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interests, experienceLevel, goals, institution, role } = await request.json();

    const profile = db.profiles.upsert(session.userId, {
      interests: Array.isArray(interests) ? interests : [],
      experienceLevel: experienceLevel || "beginner",
      goals: Array.isArray(goals) ? goals : [],
      completedOnboarding: true,
      institution: institution || undefined,
    });

    let updatedRole = session.role;
    if (role && (role === "student" || role === "young_professional" || role === "educator")) {
      db.users.update(session.userId, { role });
      updatedRole = role;
    }

    const token = signSession({
      userId: session.userId,
      email: session.email,
      name: session.name,
      role: updatedRole,
    });

    const response = NextResponse.json({ success: true, profile, role: updatedRole });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 72,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Onboarding error", err);
    return NextResponse.json({ error: "Failed to update onboarding preferences" }, { status: 500 });
  }
}
