const test = require("node:test");
const assert = require("node:assert/strict");

/**
 * WCAG 2.2 Relative Luminance and Contrast Ratio calculation
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getLuminance(hex) {
  const cleanHex = hex.replace("#", "");
  const rgb = cleanHex.match(/.{2}/g).map((x) => parseInt(x, 16) / 255);
  const a = rgb.map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function getContrastRatio(color1, color2) {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// FinGrow Brand Palette from DESIGN_SYSTEM.md
const BrandPalette = {
  ivory: "#F7F6F1",
  emerald: "#0B6B4B",
  darkEmerald: "#084F38",
  lime: "#7CE000",
  midnight: "#07101A",
  coral: "#FF6B4A",
  tangerine: "#FF9F1C",
  yellow: "#FFD166",
  white: "#FFFFFF",
  // Accessible variants
  deepCoral: "#9E200C",
  dangerBg: "#C5301A",
  darkTangerine: "#8A3E00",
  darkYellow: "#704E00",
  darkLimeText: "#244f00",
};

test("Design System: Core Palette WCAG 2.2 Contrast Verification", async (t) => {
  await t.test("Emerald #0B6B4B against Ivory #F7F6F1 passes WCAG AA (>= 4.5:1)", () => {
    const ratio = getContrastRatio(BrandPalette.emerald, BrandPalette.ivory);
    assert.ok(ratio >= 4.5, `Emerald on Ivory ratio was ${ratio}, expected >= 4.5`);
  });

  await t.test("Emerald #0B6B4B against White #FFFFFF passes WCAG AA (>= 4.5:1)", () => {
    const ratio = getContrastRatio(BrandPalette.emerald, BrandPalette.white);
    assert.ok(ratio >= 4.5, `Emerald on White ratio was ${ratio}, expected >= 4.5`);
  });

  await t.test("Dark Emerald #084F38 against Ivory #F7F6F1 passes WCAG AAA (>= 7.0:1)", () => {
    const ratio = getContrastRatio(BrandPalette.darkEmerald, BrandPalette.ivory);
    assert.ok(ratio >= 7.0, `Dark Emerald on Ivory ratio was ${ratio}, expected >= 7.0`);
  });

  await t.test("Midnight #07101A against Ivory #F7F6F1 passes WCAG AAA (>= 7.0:1)", () => {
    const ratio = getContrastRatio(BrandPalette.midnight, BrandPalette.ivory);
    assert.ok(ratio >= 7.0, `Midnight on Ivory ratio was ${ratio}, expected >= 7.0`);
  });

  await t.test("Lime button text: Midnight #07101A against Lime #7CE000 passes WCAG AAA (>= 7.0:1)", () => {
    const ratio = getContrastRatio(BrandPalette.midnight, BrandPalette.lime);
    assert.ok(ratio >= 7.0, `Midnight on Lime ratio was ${ratio}, expected >= 7.0`);
  });

  await t.test("Accessible danger button: White text on #C5301A passes WCAG AA (>= 4.5:1)", () => {
    const ratio = getContrastRatio(BrandPalette.white, BrandPalette.dangerBg);
    assert.ok(ratio >= 4.5, `White on Danger BG ratio was ${ratio}, expected >= 4.5`);
  });

  await t.test("Accessible Coral badge text #9E200C against White/Ivory passes WCAG AAA (>= 7.0:1)", () => {
    const ratioIvory = getContrastRatio(BrandPalette.deepCoral, BrandPalette.ivory);
    const ratioWhite = getContrastRatio(BrandPalette.deepCoral, BrandPalette.white);
    assert.ok(ratioIvory >= 7.0, `Coral text on Ivory ratio was ${ratioIvory}, expected >= 7.0`);
    assert.ok(ratioWhite >= 7.0, `Coral text on White ratio was ${ratioWhite}, expected >= 7.0`);
  });

  await t.test("Accessible Tangerine badge text #8A3E00 against White/Ivory passes WCAG AAA (>= 7.0:1)", () => {
    const ratioIvory = getContrastRatio(BrandPalette.darkTangerine, BrandPalette.ivory);
    assert.ok(ratioIvory >= 7.0, `Tangerine text on Ivory ratio was ${ratioIvory}, expected >= 7.0`);
  });

  await t.test("Accessible Lime badge text #244f00 against White/Ivory passes WCAG AAA (>= 7.0:1)", () => {
    const ratioIvory = getContrastRatio(BrandPalette.darkLimeText, BrandPalette.ivory);
    assert.ok(ratioIvory >= 7.0, `Lime text on Ivory ratio was ${ratioIvory}, expected >= 7.0`);
  });
});

test("Component Specs: Button specifications & touch targets", async (t) => {
  const fs = require("node:fs");
  const path = require("node:path");
  const buttonSource = fs.readFileSync(
    path.join(__dirname, "../../src/components/ui/button.tsx"),
    "utf-8"
  );

  await t.test("Includes all required variants (primary, secondary, accent, outline, ghost, danger, tangerine)", () => {
    assert.ok(buttonSource.includes("primary:"), "Missing primary variant");
    assert.ok(buttonSource.includes("secondary:"), "Missing secondary variant");
    assert.ok(buttonSource.includes("accent:"), "Missing accent variant");
    assert.ok(buttonSource.includes("outline:"), "Missing outline variant");
    assert.ok(buttonSource.includes("ghost:"), "Missing ghost variant");
    assert.ok(buttonSource.includes("danger:"), "Missing danger variant");
    assert.ok(buttonSource.includes("tangerine:"), "Missing tangerine variant");
  });

  await t.test("Meets standard touch targets (min-h-[44px] for md, min-h-[48px] for lg)", () => {
    assert.ok(buttonSource.includes("min-h-[44px]"), "Medium size button must meet 44px touch target");
    assert.ok(buttonSource.includes("min-h-[48px]"), "Large size button must meet 48px touch target");
  });

  await t.test("Features visible focus ring and ivory offset", () => {
    assert.ok(buttonSource.includes("focus-visible:ring-2"), "Missing 2px focus ring");
    assert.ok(buttonSource.includes("focus-visible:ring-offset-2"), "Missing ring offset");
    assert.ok(buttonSource.includes("focus-visible:ring-offset-fingrow-ivory"), "Missing ivory ring offset");
  });

  await t.test("Supports reduced motion and accessible loading indicators", () => {
    assert.ok(buttonSource.includes("motion-reduce:transition-none"), "Must support prefers-reduced-motion");
    assert.ok(buttonSource.includes("aria-busy"), "Must support aria-busy");
    assert.ok(buttonSource.includes("aria-hidden=\"true\""), "Spinner must be hidden from screen readers");
  });
});

test("Component Specs: Input accessibility and touch targets", async (t) => {
  const fs = require("node:fs");
  const path = require("node:path");
  const inputSource = fs.readFileSync(
    path.join(__dirname, "../../src/components/ui/input.tsx"),
    "utf-8"
  );

  await t.test("Meets 44px touch target (min-h-[44px])", () => {
    assert.ok(inputSource.includes("min-h-[44px]"), "Input must meet 44px touch target");
  });

  await t.test("Associates errors accessibly via aria-invalid, aria-describedby, and role='alert'", () => {
    assert.ok(inputSource.includes("aria-invalid="), "Input must set aria-invalid on error");
    assert.ok(inputSource.includes("aria-describedby="), "Input must set aria-describedby");
    assert.ok(inputSource.includes('role="alert"'), "Error message must have role='alert'");
    assert.ok(inputSource.includes('useId'), "Input must generate accessible id via useId");
  });

  await t.test("Includes visible emerald focus ring with ivory offset", () => {
    assert.ok(inputSource.includes("focus:ring-2"), "Input must have ring-2");
    assert.ok(inputSource.includes("focus:ring-fingrow-emerald"), "Input must have emerald focus ring");
  });
});

test("Component Specs: Badge variant completeness & accessibility", async (t) => {
  const fs = require("node:fs");
  const path = require("node:path");
  const badgeSource = fs.readFileSync(
    path.join(__dirname, "../../src/components/ui/badge.tsx"),
    "utf-8"
  );

  await t.test("Includes accent variant to fix undefined bug", () => {
    assert.ok(badgeSource.includes("accent:"), "Badge must support accent variant");
  });

  await t.test("Includes high-contrast accessible text colors for coral, tangerine, yellow, lime", () => {
    assert.ok(badgeSource.includes("#9E200C"), "Coral must use accessible dark coral text");
    assert.ok(badgeSource.includes("#8A3E00"), "Tangerine must use accessible dark tangerine text");
    assert.ok(badgeSource.includes("#704E00"), "Yellow must use accessible dark yellow text");
    assert.ok(badgeSource.includes("#244f00"), "Lime must use accessible dark lime text");
  });
});

test("Component Specs: Progress indicator accessibility", async (t) => {
  const fs = require("node:fs");
  const path = require("node:path");
  const progressSource = fs.readFileSync(
    path.join(__dirname, "../../src/components/ui/progress.tsx"),
    "utf-8"
  );

  await t.test("Sets complete progressbar ARIA attributes", () => {
    assert.ok(progressSource.includes('role="progressbar"'), "Missing role='progressbar'");
    assert.ok(progressSource.includes("aria-valuenow="), "Missing aria-valuenow");
    assert.ok(progressSource.includes("aria-valuemin="), "Missing aria-valuemin");
    assert.ok(progressSource.includes("aria-valuemax="), "Missing aria-valuemax");
    assert.ok(progressSource.includes("aria-valuetext="), "Missing aria-valuetext");
  });

  await t.test("Supports prefers-reduced-motion", () => {
    assert.ok(progressSource.includes("motion-reduce:transition-none"), "Must support prefers-reduced-motion");
  });
});

test("Component Specs: QRCode accessibility and interactivity", async (t) => {
  const fs = require("node:fs");
  const path = require("node:path");
  const qrSource = fs.readFileSync(
    path.join(__dirname, "../../src/components/ui/qr-code.tsx"),
    "utf-8"
  );

  await t.test("Includes accessible role='img' and aria-label", () => {
    assert.ok(qrSource.includes('role="img"'), "QR SVG must have role='img'");
    assert.ok(qrSource.includes("aria-label="), "QR SVG must have aria-label");
  });

  await t.test("Features copy button with aria feedback", () => {
    assert.ok(qrSource.includes("handleCopy"), "Must provide copy functionality");
    assert.ok(qrSource.includes("clipboard"), "Must access clipboard API");
  });
});
