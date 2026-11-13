import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import robots from "../../src/app/robots.ts";
import sitemap from "../../src/app/sitemap.ts";
import nextConfig from "../../next.config.mjs";

// Helper: WCAG relative luminance & contrast ratio calculation
function getLuminance(hex) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  const [rl, gl, bl] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function getContrastRatio(hex1, hex2) {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

test("SEO: robots.txt protects private and sensitive routes while exposing sitemap", () => {
  const robotsConfig = robots();
  assert.ok(robotsConfig.rules, "robots rules must be defined");
  
  const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules;
  assert.strictEqual(rules.userAgent, "*", "User agent should target all crawlers");
  assert.strictEqual(rules.allow, "/", "Root allow rule must be defined");

  const disallowed = Array.isArray(rules.disallow) ? rules.disallow : [rules.disallow];
  
  // Required private routes that must NEVER be crawled
  const requiredDisallowed = [
    "/admin",
    "/api/",
    "/dashboard",
    "/profile",
    "/educator",
    "/onboarding",
  ];

  for (const route of requiredDisallowed) {
    const isDisallowed = disallowed.some((d) => d.startsWith(route) || route.startsWith(d));
    assert.ok(isDisallowed, `Private route '${route}' must be disallowed in robots.txt`);
  }

  // Ensure sitemap is present
  assert.ok(robotsConfig.sitemap, "Sitemap URL must be present in robots.txt");
  assert.ok(robotsConfig.sitemap.includes("/sitemap.xml"), "Sitemap must reference sitemap.xml");
});

test("SEO: sitemap.ts generates complete public inventory and excludes private routes", () => {
  const entries = sitemap();
  assert.ok(Array.isArray(entries), "Sitemap must return an array of route entries");
  assert.ok(entries.length >= 20, `Sitemap must contain comprehensive route inventory (found ${entries.length})`);

  const urls = entries.map((e) => e.url);

  // Core public marketing and educational discovery routes
  const mandatoryPublicRoutes = [
    "",
    "/about",
    "/curriculum",
    "/learn",
    "/simulations",
    "/simulations/first-salary",
    "/simulations/budget",
    "/simulations/investing",
    "/simulations/sip",
    "/simulations/startup",
    "/simulations/calculators",
    "/games",
    "/games/leaderboard",
    "/for-educators",
    "/community",
    "/faq",
    "/disclaimer",
    "/privacy",
    "/terms",
  ];

  for (const route of mandatoryPublicRoutes) {
    const hasRoute = urls.some((u) => u.endsWith(route) || u.endsWith(`${route}/`));
    assert.ok(hasRoute, `Mandatory public route '${route}' must be present in sitemap`);
  }

  // Verify dynamic course routes exist
  const courseUrls = urls.filter((u) => u.includes("/learn/") && !u.endsWith("/learn"));
  assert.ok(courseUrls.length > 0, "Sitemap must contain dynamic course/lesson URLs");

  // Verify strict omission of private routes
  const forbiddenRoutePrefixes = [
    "/admin",
    "/dashboard",
    "/profile",
    "/educator/classrooms",
    "/api/",
    "/login",
    "/register",
    "/onboarding",
  ];

  for (const forbidden of forbiddenRoutePrefixes) {
    const leaked = urls.filter((u) => u.includes(forbidden));
    assert.strictEqual(leaked.length, 0, `Private/auth route '${forbidden}' must NEVER appear in sitemap: ${leaked.join(", ")}`);
  }

  // Verify all entries have valid priority and changeFrequency
  for (const entry of entries) {
    assert.ok(entry.priority >= 0.1 && entry.priority <= 1.0, `Priority must be between 0.1 and 1.0: ${entry.url}`);
    assert.ok(entry.changeFrequency, `changeFrequency must be specified for ${entry.url}`);
    assert.ok(entry.lastModified instanceof Date, `lastModified must be a Date for ${entry.url}`);
  }
});

test("Security: Content Security Policy and HTTP security headers in next.config.mjs", async () => {
  assert.ok(nextConfig.headers, "next.config.mjs must define async headers()");
  const headersConfig = await nextConfig.headers();
  assert.ok(Array.isArray(headersConfig), "headers() must return an array of path rules");

  const catchAllRule = headersConfig.find((r) => r.source === "/:path*");
  assert.ok(catchAllRule, "A catch-all rule /:path* must be defined");

  const headerMap = new Map(catchAllRule.headers.map((h) => [h.key, h.value]));

  // Verify Content Security Policy
  const csp = headerMap.get("Content-Security-Policy");
  assert.ok(csp, "Content-Security-Policy must be configured");
  assert.ok(csp.includes("default-src 'self'"), "CSP must include default-src 'self'");
  assert.ok(csp.includes("frame-ancestors 'none'"), "CSP must prevent clickjacking with frame-ancestors 'none'");
  assert.ok(csp.includes("object-src 'none'"), "CSP must block object-src");
  assert.ok(csp.includes("form-action 'self'"), "CSP must restrict form actions to self");
  assert.ok(csp.includes("fonts.googleapis.com") || csp.includes("fonts.gstatic.com"), "CSP must allow Google Fonts");

  // Verify other standard OWASP recommended security headers
  assert.strictEqual(headerMap.get("X-Frame-Options"), "DENY", "X-Frame-Options must be DENY");
  assert.strictEqual(headerMap.get("X-Content-Type-Options"), "nosniff", "X-Content-Type-Options must be nosniff");
  assert.strictEqual(headerMap.get("Referrer-Policy"), "strict-origin-when-cross-origin", "Referrer-Policy must be strict-origin-when-cross-origin");
  assert.ok(headerMap.get("Permissions-Policy")?.includes("camera=()"), "Permissions-Policy must restrict camera");
  assert.ok(headerMap.get("Permissions-Policy")?.includes("microphone=()"), "Permissions-Policy must restrict microphone");
  assert.ok(headerMap.get("Strict-Transport-Security")?.includes("max-age="), "HSTS must be enabled");
});

test("Accessibility: WCAG 2.2 AA Color Contrast verification on Ivory #F7F6F1 canvas", () => {
  const IVORY = "#F7F6F1";
  const MIDNIGHT = "#07101A";
  const EMERALD = "#0B6B4B";
  const DARK_EMERALD = "#084F38";
  const LIME = "#7CE000";

  // WCAG 2.2 Level AA requires:
  // - 4.5:1 for normal body text
  // - 3.0:1 for large text (>= 18pt or >= 14pt bold) and UI components/focus rings

  // Midnight body text on Ivory canvas
  const midnightOnIvory = getContrastRatio(MIDNIGHT, IVORY);
  assert.ok(midnightOnIvory >= 7.0, `Midnight on Ivory (${midnightOnIvory.toFixed(2)}:1) must meet WCAG Level AAA (>= 7:1)`);

  // Emerald primary brand text on Ivory canvas
  const emeraldOnIvory = getContrastRatio(EMERALD, IVORY);
  assert.ok(emeraldOnIvory >= 4.5, `Emerald on Ivory (${emeraldOnIvory.toFixed(2)}:1) must meet WCAG Level AA (>= 4.5:1)`);

  // Dark Emerald on Ivory canvas
  const darkEmeraldOnIvory = getContrastRatio(DARK_EMERALD, IVORY);
  assert.ok(darkEmeraldOnIvory >= 7.0, `Dark Emerald on Ivory (${darkEmeraldOnIvory.toFixed(2)}:1) must meet WCAG Level AAA (>= 7:1)`);

  // Ivory text on dark containers
  const ivoryOnMidnight = getContrastRatio(IVORY, MIDNIGHT);
  assert.ok(ivoryOnMidnight >= 7.0, `Ivory on Midnight (${ivoryOnMidnight.toFixed(2)}:1) must meet WCAG Level AAA`);

  const ivoryOnEmerald = getContrastRatio(IVORY, EMERALD);
  assert.ok(ivoryOnEmerald >= 4.5, `Ivory on Emerald (${ivoryOnEmerald.toFixed(2)}:1) must meet WCAG Level AA`);

  const ivoryOnDarkEmerald = getContrastRatio(IVORY, DARK_EMERALD);
  assert.ok(ivoryOnDarkEmerald >= 7.0, `Ivory on Dark Emerald (${ivoryOnDarkEmerald.toFixed(2)}:1) must meet WCAG Level AAA`);

  // Lime accent contrast verification
  const limeOnMidnight = getContrastRatio(LIME, MIDNIGHT);
  assert.ok(limeOnMidnight >= 7.0, `Lime on Midnight (${limeOnMidnight.toFixed(2)}:1) must meet WCAG Level AAA`);

  const limeOnDarkEmerald = getContrastRatio(LIME, DARK_EMERALD);
  assert.ok(limeOnDarkEmerald >= 4.5, `Lime on Dark Emerald (${limeOnDarkEmerald.toFixed(2)}:1) must meet WCAG Level AA`);

  // Guard: Lime on Ivory is intentionally NOT compliant for body text (must be used only as selection/accent with dark text)
  const limeOnIvory = getContrastRatio(LIME, IVORY);
  assert.ok(limeOnIvory < 3.0, `Lime on Ivory is ${limeOnIvory.toFixed(2)}:1, mathematically confirming it cannot be used for standalone text on Ivory`);
});

test("Accessibility: Keyboard focus indicators and landmark navigation structure", () => {
  // Check layout.tsx for skip-to-content bypass link and main landmark
  const layoutPath = path.join(process.cwd(), "src/app/layout.tsx");
  const layoutContent = fs.readFileSync(layoutPath, "utf-8");

  assert.ok(layoutContent.includes('href="#main-content"'), "layout.tsx must contain a skip link pointing to #main-content (WCAG 2.4.1)");
  assert.ok(layoutContent.includes('id="main-content"'), "layout.tsx must have an element with id='main-content'");

  // Check globals.css for :focus-visible rules
  const cssPath = path.join(process.cwd(), "src/app/globals.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  assert.ok(cssContent.includes(":focus-visible"), "globals.css must define :focus-visible rules");
  assert.ok(cssContent.includes("outline: 2px solid"), "Focus indicator must have at least 2px width");
  assert.ok(cssContent.includes("prefers-reduced-motion"), "globals.css must respect prefers-reduced-motion");
});
