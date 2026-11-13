import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, signSession } from "@/lib/auth/crypto";
import { COOKIE_NAME } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "local_ip";
    
    // Rate limit: 20 login attempts per minute per IP
    const rateCheck = checkRateLimit(`login_${ip}`, 20, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${rateCheck.resetInSeconds} seconds.` },
        { 
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.resetInSeconds),
          },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.users.getByEmail(cleanEmail);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
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
    console.error("Login error", err);
    return NextResponse.json({ error: "Internal server error during authentication." }, { status: 500 });
  }
}
