# Agent Orchestration & Parallel Work Strategy

## Goal
Use the maximum useful parallelism supported by Antigravity. Prioritize correctness, integration and clear ownership over raw agent count.

## Orchestrator responsibilities
The primary agent is accountable for:
- Reading all project instructions.
- Repository reconnaissance and stack recommendation.
- Architecture decision records (ADRs).
- Shared design/API/data contracts.
- Assigning exclusive ownership.
- Resolving dependencies and conflicts.
- Reviewing security, quality and consistency.
- Running full integration tests and maintaining the backlog.

## Specialist agent roster
Create these agents when supported. If Antigravity has a lower agent limit, combine adjacent roles without losing ownership boundaries.

1. **Product & UX Research Agent** — user journeys, information architecture, competitor/reference research, page flows, usability acceptance criteria. No production code.
2. **Design System Agent** — tokens, typography, component primitives, responsive rules, interaction patterns and Storybook/component showcase if appropriate. Own shared UI package only.
3. **Frontend Public Website Agent** — marketing pages, navigation, SEO-friendly content layout and CTA flows. Own public-site route area.
4. **Frontend Learner App Agent** — learner dashboard, onboarding, learning catalogue/player, profile and progress UI. Own learner route area.
5. **Learning Backend Agent** — courses, lessons, quizzes, completion and progress domain. Own learning module/API/migrations.
6. **Gamification & Multiplayer Agent** — XP, achievements, leaderboards, matchmaking/rooms, game sessions and scoring. Own games/gamification domain.
7. **Simulation Engine Agent** — virtual wallet, salary/budget, stock/SIP educational simulation, portfolio risk and startup simulation. Own simulation domain.
8. **Educator & Institution Agent** — educator dashboard, classrooms, class codes/QR, assignments, student reports. Own educator domain.
9. **Community Agent** — topics, posts, comments, reporting, moderation workflows and community UI/API. Own community domain.
10. **Platform & Identity Agent** — authentication, authorization, roles, account settings, notification foundation and audit events. Own identity/platform domain.
11. **QA & Accessibility Agent** — test plans, automated tests, keyboard/screen-reader checks, responsive checks and bug reproduction. Do not rewrite modules without coordinating with their owner.
12. **Security & SEO Agent** — threat review, privacy review, technical SEO, structured data, metadata, performance and security findings. Findings first; fixes coordinated with owners.
13. **DevOps & Observability Agent** — local developer experience, CI, environment templates, logs/metrics/health checks and deployment documentation. No production deployment without approval.

## Parallelization plan
### Wave 0 — sequential
- Orchestrator inspects repository and all prompt files.
- Product/UX agent drafts journeys and sitemap.
- Architecture owner defines stack, domain boundaries, route conventions, API schemas, event contracts, naming, error format and migration ownership.
- Design agent proposes tokens and component contracts.
- Orchestrator approves contracts before dependent coding.

### Wave 1 — parallel foundation
- Design system.
- Identity/auth foundation.
- Public marketing shell.
- CI/test scaffolding.
- Product content model and seed content.

### Wave 2 — parallel product domains
- Learning.
- Gamification/multiplayer.
- Simulations.
- Educator/classrooms.
- Community.
Each domain must work against agreed contracts and use isolated ownership.

### Wave 3 — integration
- Learner dashboard integration.
- Cross-module notifications and progress events.
- Admin and institution views.
- Search and discovery.
- End-to-end tests.

### Wave 4 — hardening
- Security review.
- SEO review.
- Accessibility review.
- Performance and load checks.
- Documentation and deployment rehearsal.

## Mandatory agent task format
Every task assigned to an agent must state:
- Objective and user outcome.
- Exact files/directories owned.
- Files/directories it must not edit.
- Dependencies and agreed contracts.
- Expected outputs.
- Tests required.
- Acceptance criteria.
- How to report blockers and integration assumptions.

## Conflict prevention
- Never let two agents own the same migration, shared schema, route registry, global styles or package manifest simultaneously.
- Shared contracts are owned by the orchestrator/architecture owner.
- Use feature branches/worktrees if available.
- If not, agents work in separate directories and submit changes for orchestrator integration.
- Avoid parallel edits to lockfiles. One integration owner updates dependencies.
- Agents must not silently change shared types or API response shapes.
- Any contract change requires a short ADR and coordinated updates.
- Do not merge untested code merely to keep agents busy.

## Progress reporting
Maintain `docs/BUILD_STATUS.md` with:
- Agent/workstream.
- Status: queued / in progress / blocked / review / done.
- Files changed.
- Tests run and results.
- Blockers.
- Integration status.

Maintain `docs/DECISIONS.md` for material architectural/product decisions.
