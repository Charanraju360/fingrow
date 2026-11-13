import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("UX Route Architecture: all 40 UX_SPEC documented routes exist as page.tsx", () => {
  const documentedRoutes = [
    "/",
    "/about",
    "/admin",
    "/community",
    "/community/new",
    "/community/post/[id]",
    "/community-preview",
    "/contact",
    "/curriculum",
    "/dashboard",
    "/disclaimer",
    "/educator",
    "/educator/classrooms/new",
    "/educator/classrooms/[id]",
    "/educator/classrooms/[id]/assign",
    "/educator/classrooms/[id]/reports",
    "/faq",
    "/for-educators",
    "/games",
    "/games/battle",
    "/games/leaderboard",
    "/games/quick",
    "/games-showcase",
    "/learn",
    "/learn/[courseSlug]",
    "/learn/[courseSlug]/[lessonSlug]",
    "/login",
    "/onboarding",
    "/privacy",
    "/profile",
    "/register",
    "/simulations",
    "/simulations/budget",
    "/simulations/calculators",
    "/simulations/first-salary",
    "/simulations/investing",
    "/simulations/sip",
    "/simulations/startup",
    "/simulations-showcase",
    "/terms",
  ];

  const appDir = path.resolve("./src/app");

  documentedRoutes.forEach((route) => {
    let checkPath;
    if (route === "/") {
      checkPath = path.join(appDir, "page.tsx");
    } else if (route === "/login" || route === "/register" || route === "/onboarding") {
      checkPath = path.join(appDir, "(auth)", route.slice(1), "page.tsx");
    } else {
      const parts = route.split("/").filter(Boolean);
      checkPath = path.join(appDir, ...parts, "page.tsx");
    }

    assert.equal(
      fs.existsSync(checkPath),
      true,
      `Route ${route} should exist at ${checkPath}`
    );
  });
});

test("UX Integrity: zero placeholder href='#' across all component files", () => {
  function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const full = path.join(dir, file);
      const stat = fs.statSync(full);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(full));
      } else if (file.endsWith(".tsx")) {
        results.push(full);
      }
    });
    return results;
  }

  const files = walk("./src");
  const violations = [];

  files.forEach((f) => {
    const content = fs.readFileSync(f, "utf8");
    const lines = content.split("\n");
    lines.forEach((line, idx) => {
      if (
        /href=["']#["']/.test(line) ||
        /href=["']""["']/.test(line) ||
        /href=\{\s*["']#["']\s*\}/.test(line)
      ) {
        violations.push(`${f}:${idx + 1}: ${line.trim()}`);
      }
    });
  });

  assert.equal(
    violations.length,
    0,
    `Found placeholder hrefs:\n${violations.join("\n")}`
  );
});

test("UX Specification: docs/UX_SPEC.md includes all 4 personas and journey matrices", () => {
  const specPath = path.resolve("./docs/UX_SPEC.md");
  assert.equal(fs.existsSync(specPath), true, "docs/UX_SPEC.md must exist");
  const content = fs.readFileSync(specPath, "utf8");

  assert.ok(content.includes("P-01: Student"), "Must cover Student persona");
  assert.ok(content.includes("P-02: Young Pro"), "Must cover Young Pro persona");
  assert.ok(content.includes("P-03: Educator"), "Must cover Educator persona");
  assert.ok(content.includes("P-04: Admin"), "Must cover Admin persona");
  assert.ok(content.includes("Comprehensive User Journey Matrix"), "Must include Journey Matrix");
  assert.ok(content.includes("WCAG 2.2 AA"), "Must document accessibility standards");
});
