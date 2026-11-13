import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySession, SessionPayload, Role } from "./crypto";

export const COOKIE_NAME = "fingrow_session";

export const ROLES = {
  STUDENT: "student",
  YOUNG_PROFESSIONAL: "young_professional",
  EDUCATOR: "educator",
  INSTITUTION_ADMIN: "institution_admin",
  PLATFORM_ADMIN: "platform_admin",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

/**
 * Extracts and verifies session from either:
 * 1. Request Authorization Bearer header (for API / mobile clients)
 * 2. Next.js cookies store (for web browsers)
 */
export async function getCurrentUser(request?: Request): Promise<SessionPayload | null> {
  // 1. Try Authorization header if request object is available
  if (request) {
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      const token = authHeader.slice(7).trim();
      const payload = verifySession(token);
      if (payload) return payload;
    }
  }

  // 2. Try cookie store
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySession(token);
  } catch {
    return null;
  }
}

/**
 * Server-side RBAC: ensures a user is logged in
 * Throws an Error("UNAUTHORIZED") if missing or invalid
 */
export async function requireAuth(request?: Request): Promise<SessionPayload> {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

/**
 * Server-side RBAC: ensures the current user has one of the allowed roles
 * Throws Error("UNAUTHORIZED") if not logged in, or Error("FORBIDDEN") if role is not allowed
 */
export async function requireRole(allowedRoles: Role[], request?: Request): Promise<SessionPayload> {
  const user = await requireAuth(request);
  if (!allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

/**
 * Server-side RBAC Route Guard for Route Handlers:
 * Validates request session and role. Returns either { user } or { errorResponse }
 */
export async function rbacGuard(
  request: Request,
  allowedRoles?: Role[]
): Promise<
  | { user: SessionPayload; errorResponse?: never }
  | { user?: never; errorResponse: NextResponse }
> {
  const user = await getCurrentUser(request);
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { error: "Unauthorized: Active session required" },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      errorResponse: NextResponse.json(
        { error: `Forbidden: Role '${user.role}' lacks sufficient permissions` },
        { status: 403 }
      ),
    };
  }

  return { user };
}

/**
 * Checks whether user has an allowed role
 */
export function hasRole(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Checks whether user is an educator, institution admin, or platform admin
 */
export function isEducatorOrHigher(role: string): boolean {
  return role === "educator" || role === "institution_admin" || role === "platform_admin";
}

/**
 * Checks whether user has administrative privileges (institution or platform)
 */
export function isAdmin(role: string): boolean {
  return role === "institution_admin" || role === "platform_admin";
}

/**
 * Checks whether user has platform super-admin privileges
 */
export function isPlatformAdmin(role: string): boolean {
  return role === "platform_admin";
}
