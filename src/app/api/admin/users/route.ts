import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { UserEntity } from "@/lib/db/seed-data";

const VALID_ROLES: UserEntity["role"][] = [
  "student",
  "young_professional",
  "educator",
  "institution_admin",
  "platform_admin",
];

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "platform_admin") {
      return NextResponse.json(
        { error: "Forbidden: Platform administrator access required" },
        { status: 403 }
      );
    }

    const users = db.users.getAll().map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      xp: u.xp,
      streakDays: u.streakDays,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    console.error("Admin users fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
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

    const { userId, role } = await request.json();
    if (!userId || !role) {
      return NextResponse.json(
        { error: "User ID and new role are required" },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role specified. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    // Safeguard: prevent sole admin or self-demotion lockout if this is the current admin
    if (userId === session.userId && role !== "platform_admin") {
      const allAdmins = db.users.getAll().filter((u) => u.role === "platform_admin");
      if (allAdmins.length <= 1) {
        return NextResponse.json(
          { error: "Cannot demote the sole active platform administrator." },
          { status: 400 }
        );
      }
    }

    const updated = db.admin.updateUserRole(userId, role, session.userId, session.name);
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        xp: updated.xp,
        streakDays: updated.streakDays,
        createdAt: updated.createdAt,
      },
    });
  } catch (err: any) {
    console.error("Admin user update error:", err);
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}
