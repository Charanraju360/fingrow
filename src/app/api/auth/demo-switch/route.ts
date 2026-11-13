import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signSession } from "@/lib/auth/crypto";
import { COOKIE_NAME } from "@/lib/auth/session";

const DEMO_ACCOUNTS = [
  {
    role: "student",
    name: "Alex Chen",
    email: "alex.student@fingrow.dev",
    label: "Student",
    description: "High school / college learner exploring foundational finance & investing",
    redirectUrl: "/dashboard",
  },
  {
    role: "young_professional",
    name: "Priya Sharma",
    email: "priya.pro@fingrow.dev",
    label: "Young Professional",
    description: "Early career specialist focusing on budgeting, salary optimization & SIPs",
    redirectUrl: "/dashboard",
  },
  {
    role: "educator",
    name: "Sarah Jenkins",
    email: "sarah.teacher@fingrow.dev",
    label: "Educator / Teacher",
    description: "High school financial teacher managing classrooms, assignments & rosters",
    redirectUrl: "/educator",
  },
  {
    role: "institution_admin",
    name: "Marcus Vance",
    email: "marcus.admin@fingrow.dev",
    label: "Institution Admin",
    description: "School district coordinator overseeing classrooms, faculty & compliance",
    redirectUrl: "/educator",
  },
  {
    role: "platform_admin",
    name: "FinGrow Platform Admin",
    email: "admin@fingrow.dev",
    label: "Platform Admin",
    description: "Root system superuser with moderation, analytics & user management controls",
    redirectUrl: "/admin",
  },
];

const DEMO_EMAIL_BY_ROLE: Record<string, string> = {
  student: "alex.student@fingrow.dev",
  young_professional: "priya.pro@fingrow.dev",
  educator: "sarah.teacher@fingrow.dev",
  institution_admin: "marcus.admin@fingrow.dev",
  platform_admin: "admin@fingrow.dev",
};

/**
 * GET: Lists all available 1-click demo accounts
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    demoAccounts: DEMO_ACCOUNTS,
  });
}

/**
 * POST: Instantly switches to a demo profile with 1 click
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let targetEmail: string | undefined = body.email;

    if (!targetEmail && body.role && DEMO_EMAIL_BY_ROLE[body.role]) {
      targetEmail = DEMO_EMAIL_BY_ROLE[body.role];
    }

    if (!targetEmail) {
      return NextResponse.json(
        { error: "Target demo email or valid role ('student' | 'young_professional' | 'educator' | 'institution_admin' | 'platform_admin') is required." },
        { status: 400 }
      );
    }

    const cleanEmail = targetEmail.toLowerCase().trim();
    const user = db.users.getByEmail(cleanEmail);

    if (!user) {
      return NextResponse.json(
        { error: `Demo account for '${cleanEmail}' not found in database.` },
        { status: 404 }
      );
    }

    const token = signSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    let redirectUrl = "/dashboard";
    if (user.role === "educator" || user.role === "institution_admin") {
      redirectUrl = "/educator";
    } else if (user.role === "platform_admin") {
      redirectUrl = "/admin";
    }

    const response = NextResponse.json({
      success: true,
      message: `Switched to demo user: ${user.name} (${user.role})`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        xp: user.xp,
        streakDays: user.streakDays,
      },
      redirectUrl,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 72, // 3 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Demo switch error", err);
    return NextResponse.json({ error: "Internal server error during demo switch." }, { status: 500 });
  }
}
