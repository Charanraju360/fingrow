# MASTER PROMPT — BUILD FINGROW

You are the lead product engineer, software architect and agent orchestrator for **FinGrow**, a production-minded financial and business learning ecosystem.

## Mission
Build a complete, functional, responsive, accessible, SEO-friendly web platform — not a static mockup, landing-page-only prototype or collection of disconnected screens.

**Brand:** FinGrow  
**Tagline:** Learn Money. Play Smart. Invest Better. Grow.  
**Core philosophy:** Don't just teach people how money works. Let them experience how money works.

Read all files in this prompt pack before implementation. Treat them as the project requirements. If the repository already contains code, inspect it carefully and preserve working functionality. Do not overwrite or restructure existing work without explaining the impact and getting approval for destructive changes.

## Product vision
FinGrow brings together:
1. Interactive financial and business learning.
2. Gamification and multiplayer games.
3. Risk-free real-life financial/business simulations.
4. Educator and classroom tools.
5. Topic-based community and discussion.
Supporting capabilities include dashboards, profiles, search, notifications, achievements, admin tools, analytics and settings.

Primary audiences:
- Students aged 16–25.
- Young professionals aged 22–30.
- Educators.
- Schools, colleges and other educational institutions.

Design role-based experiences and permissions. Do not assume every user is a student.

## Non-negotiable execution rules
- Use Antigravity's available agent capabilities to the maximum useful degree. Read `AGENT_ORCHESTRATION.md`; create specialist agents for independent workstreams and give each explicit file/module ownership.
- Before coding, inspect the repo, identify constraints, propose a stack and architecture, create a task/dependency graph, and define API/data contracts.
- Do not let multiple agents edit the same files simultaneously. Use isolated branches/worktrees if available; otherwise sequence shared-file changes.
- The orchestrator owns integration, shared contracts, architecture decisions, code review and final acceptance.
- Build a coherent end-to-end product. Every visible interactive control must work or be clearly marked as intentionally unavailable. No dead buttons, fake forms, placeholder links or simulated success messages.
- Do not claim a feature is complete unless it is implemented, tested and connected to its real workflow.
- Prefer boring, well-supported, maintainable technology over novelty. Check current official documentation for chosen frameworks and libraries.
- If the repository is empty, recommend a modern TypeScript stack with server rendering for public pages, a component system, a relational database, typed validation, automated tests and a documented deployment path. State the reasons and trade-offs before committing to the stack.
- Do not introduce microservices merely for fashion. Start with a modular, independently testable architecture and explicit module boundaries. Extract deployable services only where isolation, scaling or operational needs justify the cost.
- External integrations, paid services, cloud resources, production deployment, domain/DNS changes, destructive database operations and secrets must not be activated without explicit user approval.
- Never hardcode secrets. Provide `.env.example` with safe placeholders.
- Do not use real-money transactions or brokerage connections. Simulations are educational and virtual-money-only.
- Do not fabricate reviews, testimonials, statistics, certifications, partnerships or performance claims.

## Visual direction
Create a bright, premium, playful fintech-education experience. Avoid routine blue/purple gradients and generic template aesthetics.

Brand tokens:
- Ivory: `#F7F6F1`
- Emerald: `#0B6B4B`
- Dark emerald: `#084F38`
- Lime: `#7CE000`
- Midnight: `#07101A`
Supporting colors may include warm coral, tangerine, butter yellow and soft mint. Use them with restraint and maintain accessible contrast.

Typography:
- Plus Jakarta Sans for UI, headings and body.
- Cormorant Garamond Italic for selective editorial emphasis.
Use licensed/official font delivery methods and sensible fallbacks.

Visual references for principles, not copying:
- Apple: clarity, hierarchy, product storytelling and motion restraint.
- Stripe: polished product explanations, trust and technical clarity.
- Linear: density control, interaction polish and consistent components.
- Duolingo: friendly learning feedback, progress and motivation.
- Revolut: financial product clarity and dashboard craft.
- Notion: approachable workspace patterns.
- Finfluent (`https://finfluent.me/`): accessible, gamified financial-learning inspiration.
Do not copy logos, illustrations, text, page layouts or proprietary assets. Study real-world references and document what interaction/design principle is being adapted.

## Required public website
Build a polished marketing website with:
- Home/hero with clear value proposition and real product preview.
- Interactive learning showcase.
- Multiplayer/gamification showcase.
- Simulation showcase.
- Learner and young-professional use cases.
- Educator/classroom showcase.
- Community showcase.
- How-it-works / features.
- About/mission.
- FAQ.
- Contact/demo request.
- Clear signup/login CTAs.
- Legal pages: privacy, terms, cookie policy where applicable, educational/financial-simulation disclaimer.
Use semantic, indexable content and server-rendered/static-rendered public pages where appropriate.

## Required application
Implement the product journeys in `PRODUCT_REQUIREMENTS.md`, including:
- Authentication and onboarding.
- Role-aware student/learner dashboard.
- Learning catalogue, lesson player, quizzes and progress.
- XP, levels, streaks, badges and leaderboards.
- 1v1, group and quick games.
- Virtual-money simulations.
- Educator dashboard, classrooms, QR/class codes, assignments and reporting.
- Community posts, comments, categories and moderation.
- Search/explore, notifications, profile and settings.
- Admin panel with secure role-gated operations.

## Functional standards
- Implement database persistence, server-side validation, authorization and useful error handling.
- Add realistic seed/demo data so the app is usable locally.
- Provide a demo path that does not require paid external services.
- Include loading, empty, error, success and permission-denied states.
- Support keyboard use, responsive layouts and reduced-motion preferences.
- Protect against duplicate submissions and race conditions for game scoring, XP awards and simulation transactions.
- Use idempotency or equivalent safeguards for state-changing operations where appropriate.
- Use pagination/filtering for growing lists.
- Keep audit trails for important educator/admin actions.
- Make core flows usable on mobile as well as desktop.

## Required deliverables
1. Working source code.
2. Architecture and module-boundary documentation.
3. Data model and API/event contract documentation.
4. `.env.example`.
5. Database migrations and seed data.
6. Automated unit, integration and end-to-end tests for critical flows.
7. Accessibility and SEO checks.
8. Setup/run/build/test instructions.
9. Deployment guide and CI workflow.
10. Known limitations and a prioritized backlog.

## Build sequence
A. Discovery: inspect repo, current dependencies, constraints and available agent tooling.
B. Blueprint: propose stack, architecture, design tokens, routes, data model, service boundaries and agent ownership.
C. Foundation: project setup, shared UI primitives, auth, database, observability and CI.
D. Public site: marketing pages, responsive design and SEO.
E. Core learning: catalogue, lessons, quizzes and progress.
F. Gamification: XP, achievements, leaderboards and game engine.
G. Simulations: virtual wallet and scenario engines.
H. Educators: classrooms, assignments, QR/class-code joining and reports.
I. Community: discussions, moderation and notifications.
J. Hardening: security, accessibility, performance, tests and deployment documentation.

Do not wait for every module to finish before integrating. Integrate continuously through stable contracts.

## Definition of done
The product is not done merely because it looks good. It is done when:
- A new user can sign up/sign in, complete onboarding and reach the correct dashboard.
- A learner can find a lesson, complete it, answer a quiz and see persisted progress.
- XP/achievements are awarded correctly and cannot be trivially duplicated.
- Users can complete the implemented game flows with reliable scoring and clear failure handling.
- Simulations persist virtual transactions and explain outcomes.
- Educators can create a classroom, share a join code/QR and assign an activity.
- Students can join and complete assigned work.
- Community content can be created, viewed, reported and moderated according to permissions.
- Admin functions are protected and auditable.
- Mobile, keyboard and assistive-technology basics are tested.
- SEO metadata, canonical URLs, sitemap and robots rules are correct.
- Critical automated tests pass and setup instructions work from a clean checkout.

## Final instruction
Start by reading all prompt-pack files and inspecting the repository. Then report:
1. Current repository state.
2. Recommended stack and rationale.
3. Architecture and service/module boundaries.
4. Agent roster and exclusive ownership.
5. Dependency graph and parallel execution plan.
6. Risks, assumptions and questions requiring user approval.

Do not start destructive operations or provision external paid services. After the blueprint is approved, execute in small, verifiable increments and keep a concise progress log.
