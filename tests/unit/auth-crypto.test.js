const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const PBKDF2_ITERATIONS = 100000;
const KEY_LEN = 64;
const DIGEST = "sha512";
const SESSION_SECRET = "test_fingrow_secret_key_32chars_long!";

function hashPassword(password) {
  if (typeof password !== "string" || password.length === 0) {
    throw new Error("Password must be a non-empty string");
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LEN, DIGEST).toString("hex");
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password, storedHash) {
  try {
    if (!password || !storedHash || typeof password !== "string" || typeof storedHash !== "string") {
      return false;
    }
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LEN, DIGEST);
    if (keyBuffer.byteLength !== derivedKey.byteLength) return false;
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

function signSession(payload, expiresInHours = 72) {
  const iat = payload.iat || Date.now();
  const exp = payload.exp || iat + expiresInHours * 60 * 60 * 1000;
  const fullPayload = { ...payload, exp, iat };
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(`${header}.${data}`).digest("base64url");
  return `${header}.${data}.${signature}`;
}

function verifySession(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, data, signature] = parts;
    if (!header || !data || !signature) return null;
    
    const expectedSignature = crypto.createHmac("sha256", SESSION_SECRET).update(`${header}.${data}`).digest("base64url");
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    
    if (sigBuf.byteLength !== expBuf.byteLength) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// RBAC logic helpers
const ROLES = {
  STUDENT: "student",
  YOUNG_PROFESSIONAL: "young_professional",
  EDUCATOR: "educator",
  INSTITUTION_ADMIN: "institution_admin",
  PLATFORM_ADMIN: "platform_admin",
};

function hasRole(userRole, allowedRoles) {
  return allowedRoles.includes(userRole);
}

function isEducatorOrHigher(role) {
  return role === "educator" || role === "institution_admin" || role === "platform_admin";
}

function isAdmin(role) {
  return role === "institution_admin" || role === "platform_admin";
}

function isPlatformAdmin(role) {
  return role === "platform_admin";
}

// In-memory rate limiter test logic
function createRateLimiter() {
  const store = new Map();
  return function checkRateLimit(key, limit, windowMs) {
    const now = Date.now();
    const record = store.get(key);
    if (!record || now > record.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1 };
    }
    if (record.count >= limit) {
      return { allowed: false, remaining: 0 };
    }
    record.count += 1;
    return { allowed: true, remaining: limit - record.count };
  };
}

test("Password Hashing: produces salted hashes and verifies authentic candidate", () => {
  const password = "FinGrowSecret2026!";
  const hash = hashPassword(password);
  
  assert.notEqual(password, hash);
  assert.ok(hash.includes(":"));
  assert.ok(verifyPassword(password, hash), "Correct password must verify successfully");
  assert.ok(!verifyPassword("WrongPassword123", hash), "Wrong password must be rejected");
});

test("Password Hashing: generates unique salts for duplicate passwords", () => {
  const password = "SamePassword123!";
  const hash1 = hashPassword(password);
  const hash2 = hashPassword(password);

  assert.notEqual(hash1, hash2, "Identical passwords must produce distinct salted hashes");
  assert.ok(verifyPassword(password, hash1));
  assert.ok(verifyPassword(password, hash2));
});

test("Password Hashing: gracefully handles malformed hashes without crashing", () => {
  assert.equal(verifyPassword("pass", "malformed_no_colon"), false);
  assert.equal(verifyPassword("pass", ":empty_salt"), false);
  assert.equal(verifyPassword("pass", "invalid_hex:zzz"), false);
  assert.equal(verifyPassword("", "salt:hex"), false);
});

test("Session Cryptography: signs and verifies JWT tokens with constant-time HMAC", () => {
  const payload = { userId: "usr_123", email: "alex@fingrow.dev", role: "student", name: "Alex Chen" };
  const token = signSession(payload, 24);

  assert.ok(token.length > 50);
  const verified = verifySession(token);
  assert.ok(verified !== null);
  assert.equal(verified.userId, "usr_123");
  assert.equal(verified.email, "alex@fingrow.dev");
  assert.equal(verified.role, "student");
});

test("Session Cryptography: rejects tampered signature tokens", () => {
  const payload = { userId: "usr_123", role: "student" };
  const token = signSession(payload);
  const tamperedToken = token.slice(0, -5) + "aaaaa";

  const verified = verifySession(tamperedToken);
  assert.equal(verified, null, "Tampered signature must fail verification");
});

test("Session Cryptography: rejects expired session tokens", () => {
  const payload = { userId: "usr_expired", role: "student", exp: Date.now() - 5000 };
  const token = signSession(payload);

  const verified = verifySession(token);
  assert.equal(verified, null, "Expired token must be rejected");
});

test("Server-side RBAC: validates role hierarchies correctly", () => {
  assert.ok(isEducatorOrHigher("educator"));
  assert.ok(isEducatorOrHigher("institution_admin"));
  assert.ok(isEducatorOrHigher("platform_admin"));
  assert.ok(!isEducatorOrHigher("student"));
  assert.ok(!isEducatorOrHigher("young_professional"));

  assert.ok(isAdmin("platform_admin"));
  assert.ok(isAdmin("institution_admin"));
  assert.ok(!isAdmin("educator"));
  assert.ok(!isAdmin("student"));

  assert.ok(isPlatformAdmin("platform_admin"));
  assert.ok(!isPlatformAdmin("institution_admin"));

  assert.ok(hasRole("student", ["student", "young_professional"]));
  assert.ok(!hasRole("educator", ["student", "young_professional"]));
});

test("Rate Limiting: enforces maximum request quota per sliding window", () => {
  const checkRateLimit = createRateLimiter();
  const key = "test_ip_127.0.0.1";
  const limit = 5;

  for (let i = 0; i < limit; i++) {
    const res = checkRateLimit(key, limit, 10000);
    assert.ok(res.allowed, `Attempt ${i + 1} within limit should be allowed`);
  }

  const blockedRes = checkRateLimit(key, limit, 10000);
  assert.equal(blockedRes.allowed, false, "Request exceeding limit must be blocked");
  assert.equal(blockedRes.remaining, 0);
});
