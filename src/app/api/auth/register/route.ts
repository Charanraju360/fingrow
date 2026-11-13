import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, signSession, Role } from "@/lib/auth/crypto";
import { COOKIE_NAME } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_REGISTER_ROLES: Role[] = ["student", "young_professional", "educator", "institution_admin"];

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "local_ip";

    // Rate limit: 10 registration attempts per minute per IP
    const rateCheck = checkRateLimit(`register_${ip}`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many registration attempts. Please try again in ${rateCheck.resetInSeconds} seconds.` },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.resetInSeconds),
          },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { name, email, password, role = "student", institution } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "A valid full name (at least 2 characters) is required." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.users.getByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const assignedRole: Role = ALLOWED_REGISTER_ROLES.includes(role) ? (role as Role) : "student";

    const newUser = db.users.create({
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      passwordHash: hashPassword(password),
      name: name.trim(),
      role: assignedRole,
      xp: 100, // Welcome bonus
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    });

    db.profiles.upsert(newUser.id, {
      interests: [],
      experienceLevel: "beginner",
      goals: [],
      completedOnboarding: false,
      institution: institution ? String(institution).trim() : undefined,
    });

    const token = signSession({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        xp: newUser.xp,
        streakDays: newUser.streakDays,
      },
      redirectUrl: "/onboarding",
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 72,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Registration error", err);
    return NextResponse.json({ error: "Internal server error during registration." }, { status: 500 });
  }
}
