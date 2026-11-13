# FinGrow Design System & UI/UX Direction

## Art direction
Bright, confident, editorial, warm, premium and playful. The product should feel like a modern learning world with fintech credibility — not a generic bank dashboard or school LMS.

Avoid:
- Routine blue/purple gradients.
- Generic glassmorphism everywhere.
- Excessive cards within cards.
- Tiny low-contrast text.
- Stock-photo-heavy layouts.
- Overly childish visuals for adult learners.
- Copying any reference site's layout or assets.

## Brand palette
Core:
- Ivory `#F7F6F1` — primary canvas.
- Emerald `#0B6B4B` — primary action/brand.
- Dark Emerald `#084F38` — depth and emphasis.
- Lime `#7CE000` — progress/highlight, use sparingly.
- Midnight `#07101A` — primary dark text/dark sections.

Supporting colors:
- Warm coral, tangerine, butter yellow, soft mint, muted sage and warm neutrals.
Define accessible semantic tokens for success, warning, danger and info. Do not use color alone to convey status.

## Typography
- Plus Jakarta Sans: navigation, UI, body and headings.
- Cormorant Garamond Italic: selective editorial statements and hero emphasis.
Use responsive type scale, readable line lengths and consistent weights.

## Layout
- Strong whitespace and editorial grid.
- Responsive max-width containers.
- Consistent spacing scale and radii.
- Clear hierarchy and strong CTA placement.
- Desktop: rich multi-column product layouts.
- Tablet: simplified grids and navigation.
- Mobile: compact navigation, stacked content, touch-friendly controls.
- Dashboards must prioritize the next useful action, not vanity metrics.

## Motion and interaction
- Scroll-driven storytelling on marketing pages, but never trap scroll.
- Short, purposeful transitions.
- Micro-interactions for progress, success, selection and feedback.
- Respect `prefers-reduced-motion`.
- Avoid animation that blocks reading, keyboard navigation or task completion.
- Provide skeleton/loading, empty, error and success states.

## Reference principles
Study:
- Apple for product storytelling and clarity.
- Stripe for trust, documentation-like clarity and product presentation.
- Linear for interaction quality and information hierarchy.
- Duolingo for motivating progress and friendly feedback.
- Revolut for financial dashboard clarity.
- Notion for approachable productivity patterns.
- Finfluent (`https://finfluent.me/`) for gamified financial-learning inspiration.
Use original layout, copy, iconography and illustrations. Record references and the design principle learned; do not reproduce their assets or exact compositions.

## Components
Create a consistent reusable component library:
- Buttons, links, inputs, selects, checkboxes, radio controls.
- Navigation, breadcrumbs, tabs, dialogs, drawers, tooltips.
- Cards, badges, progress indicators, charts and stat displays.
- Lesson blocks, quiz question/answer states.
- Game room, timer, scoreboard and results.
- Simulation controls, virtual balance and outcome summaries.
- Classroom roster, assignment table and analytics.
- Community post, comment and moderation controls.
Document variants, states, keyboard behavior and responsive behavior.

## UX quality
- Every form has validation, useful errors and submission feedback.
- Every action has a clear outcome.
- Destructive actions require confirmation.
- Do not rely on hover for essential functionality.
- Empty states explain how to get started.
- Keep labels plain-language and explain financial terms contextually.
- Do not fabricate data in production views; seeded demo data must be clearly identified.
