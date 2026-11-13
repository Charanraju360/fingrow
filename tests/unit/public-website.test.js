import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Public Website: All 12 required public routes plus /join exist", () => {
  const publicRoutes = [
    { route: "/", file: "src/app/page.tsx" },
    { route: "/about", file: "src/app/about/page.tsx" },
    { route: "/curriculum", file: "src/app/curriculum/page.tsx" },
    { route: "/simulations-showcase", file: "src/app/simulations-showcase/page.tsx" },
    { route: "/games-showcase", file: "src/app/games-showcase/page.tsx" },
    { route: "/for-educators", file: "src/app/for-educators/page.tsx" },
    { route: "/community-preview", file: "src/app/community-preview/page.tsx" },
    { route: "/faq", file: "src/app/faq/page.tsx" },
    { route: "/contact", file: "src/app/contact/page.tsx" },
    { route: "/disclaimer", file: "src/app/disclaimer/page.tsx" },
    { route: "/privacy", file: "src/app/privacy/page.tsx" },
    { route: "/terms", file: "src/app/terms/page.tsx" },
    { route: "/join", file: "src/app/join/page.tsx" },
  ];

  publicRoutes.forEach(({ route, file }) => {
    const fullPath = path.resolve(file);
    assert.equal(
      fs.existsSync(fullPath),
      true,
      `Public route ${route} must have a page file at ${file}`
    );
  });
});

test("Public Website: SEO metadata is exported across all public pages", () => {
  const metadataPages = [
    "src/app/page.tsx",
    "src/app/about/page.tsx",
    "src/app/curriculum/page.tsx",
    "src/app/simulations-showcase/page.tsx",
    "src/app/games-showcase/page.tsx",
    "src/app/for-educators/page.tsx",
    "src/app/community-preview/page.tsx",
    "src/app/faq/page.tsx",
    "src/app/contact/page.tsx",
    "src/app/disclaimer/page.tsx",
    "src/app/privacy/page.tsx",
    "src/app/terms/page.tsx",
    "src/app/join/page.tsx",
  ];

  metadataPages.forEach((file) => {
    const content = fs.readFileSync(path.resolve(file), "utf8");
    const hasMetadata =
      content.includes("export const metadata") ||
      content.includes("export async function generateMetadata");
    assert.equal(
      hasMetadata,
      true,
      `File ${file} should export metadata for crawlability and SEO`
    );
    assert.match(
      content,
      /title\s*:/,
      `File ${file} metadata should include a title`
    );
    assert.match(
      content,
      /description\s*:/,
      `File ${file} metadata should include a description`
    );
  });
});

test("Public Website: Interactive hero and showcase preview components exist", () => {
  const previewComponents = [
    "src/components/marketing/interactive-hero-preview.tsx",
    "src/app/simulations-showcase/simulations-preview-client.tsx",
    "src/app/games-showcase/games-preview-client.tsx",
    "src/app/community-preview/community-preview-client.tsx",
    "src/app/faq/faq-client.tsx",
    "src/app/contact/contact-form.tsx",
    "src/app/join/join-client.tsx",
  ];

  previewComponents.forEach((file) => {
    const fullPath = path.resolve(file);
    assert.equal(
      fs.existsSync(fullPath),
      true,
      `Interactive preview component must exist at ${file}`
    );
    const content = fs.readFileSync(fullPath, "utf8");
    assert.equal(
      content.startsWith('"use client";'),
      true,
      `${file} must be an interactive client component ("use client")`
    );
  });
});

test("Public Website: Link integrity across Navbar and Footer", () => {
  const layoutFiles = [
    "src/components/layout/navbar.tsx",
    "src/components/layout/footer.tsx",
  ];

  layoutFiles.forEach((file) => {
    const content = fs.readFileSync(path.resolve(file), "utf8");
    // Assert zero href="#"
    assert.doesNotMatch(
      content,
      /href=["']#["']/,
      `${file} must not contain empty hash placeholder links href="#"`
    );
  });
});
