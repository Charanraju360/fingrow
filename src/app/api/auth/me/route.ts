import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const user = db.users.getById(session.userId);
  const profile = db.profiles.getByUserId(session.userId);

  return NextResponse.json({
    authenticated: true,
    user: user
      ? {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          xp: user.xp,
          streakDays: user.streakDays,
        }
      : null,
    profile,
  });
}

