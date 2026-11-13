import crypto from "node:crypto";

const PBKDF2_ITERATIONS = 100000;
const KEY_LEN = 64;
const DIGEST = "sha512";
const SESSION_SECRET = process.env.SESSION_SECRET || "fingrow_secure_production_quality_session_secret_32bytes";

export type Role = "student" | "young_professional" | "educator" | "institution_admin" | "platform_admin";

export interface SessionPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
  exp: number; // unix timestamp in ms
  iat?: number; // unix timestamp in ms
}

/**
 * Hashes a password using PBKDF2 with a unique random salt (100,000 iterations, sha512)
 */
export function hashPassword(password: string): string {
  if (typeof password !== "string" || password.length === 0) {
    throw new Error("Password must be a non-empty string");
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LEN, DIGEST).toString("hex");
  return `${salt}:${derivedKey}`;
}

/**
 * Verifies a candidate password against stored salt:hash using constant-time comparison
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    if (!password || !storedHash || typeof password !== "string" || typeof storedHash !== "string") {
      return false;
    }
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LEN, DIGEST);
    
    if (keyBuffer.byteLength !== derivedKey.byteLength) {
      return false;
    }
    
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Creates a signed JWT-style session token with HMAC-SHA256
 */
export function signSession(
  payload: Omit<SessionPayload, "exp" | "iat"> & { exp?: number; iat?: number },
  expiresInHours = 72
): string {
  const iat = payload.iat || Date.now();
  const exp = payload.exp || iat + expiresInHours * 60 * 60 * 1000;
  const fullPayload: SessionPayload = { ...payload, exp, iat };
  
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(`${header}.${data}`).digest("base64url");
  
  return `${header}.${data}.${signature}`;
}

/**
 * Verifies and decodes a signed session token using constant-time HMAC comparison
 */
export function verifySession(token: string): SessionPayload | null {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, data, signature] = parts;
    if (!header || !data || !signature) return null;
    
    const expectedSignature = crypto.createHmac("sha256", SESSION_SECRET).update(`${header}.${data}`).digest("base64url");
    
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    
    if (sigBuf.byteLength !== expBuf.byteLength) {
      return null;
    }
    
    // Constant-time signature comparison to prevent timing side-channel attacks
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    
    const payload: SessionPayload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) {
      return null; // Expired
    }
    
    return payload;
  } catch {
    return null;
  }
}
