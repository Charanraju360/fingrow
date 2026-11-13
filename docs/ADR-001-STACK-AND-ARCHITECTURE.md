# Architecture Decision Record (ADR) 001: Technology Stack and Domain Architecture

## Status
Accepted

## Context
FinGrow is a comprehensive financial and business education platform requiring:
- High-performance, SEO-optimized public pages with server rendering, meta tags, and structured data.
- Rich, highly interactive client-side learning, gamified quizzes, multiplayer game engines, and financial simulations.
- Real persistence for users, sessions, roles, progress, XP, achievements, classrooms, assignments, community posts, simulations, and audit logs.
- Strict security, role-based authorization, rate limiting, and input validation.
- Responsive, accessible (WCAG 2.2 AA) UI matching the FinGrow design system (Ivory `#F7F6F1`, Emerald `#0B6B4B`, Lime `#7CE000`, Midnight `#07101A`).
- Zero-friction developer setup and robust local execution on Windows/Node.js v24.

## Decision

### 1. Framework & Runtime
- **Next.js 15 (App Router)** with **React 19/18** and **TypeScript 5**.
  - Server-Side Rendering (SSR) & Static Site Generation (SSG) for public marketing and SEO-rich educational pages.
  - Route Handlers (`/api/...`) for structured RESTful API domain contracts.
  - Strong TypeScript type safety throughout frontend and backend domains.

### 2. Styling & Component System
- **Tailwind CSS 3.4** configured with custom FinGrow brand tokens:
  - Ivory canvas (`#F7F6F1`), Emerald action (`#0B6B4B`), Dark Emerald (`#084F38`), Lime highlight (`#7CE000`), Midnight (`#07101A`), Coral (`#E26D5C`), Tangerine (`#F39C12`), Butter Yellow (`#F4D06F`), Soft Mint (`#D8F3DC`).
- Custom typography configurations for `Plus Jakarta Sans` and `Cormorant Garamond`.
- **Lucide React** for clean, accessible UI icons.
- Accessible primitives with full keyboard focus states, ARIA landmarks, and screen-reader announcements.

### 3. Persistence & Database
- **Modular Monolith Repository Architecture** with persistent, ACID-safe, transactional relational-style file storage (`data/fingrow.json` with atomic writes, indexing, relational joins, and foreign key integrity) and automatic migration/seeding.
- Clean abstract domain repositories (`IUserRepository`, `ILearningRepository`, `IGameRepository`, `ISimulationRepository`, `IClassroomRepository`, `ICommunityRepository`, `IAuditRepository`), enabling seamless deployment swapping to PostgreSQL/Prisma without modifying domain logic.
- Idempotency key tracking on XP awards, quiz submissions, simulation transactions, and game scores to eliminate duplicate awards and race conditions.

### 4. Authentication & Security
- Cryptographic session handling with HTTP-only, secure, same-site cookies and token verification.
- Passwords hashed using salted `bcryptjs`.
- Server-side role-based access control (RBAC): `student`, `young_professional`, `educator`, `institution_admin`, `platform_admin`.
- In-memory sliding-window rate limiters for authentication, posting, classroom joining, and game invites.
- Safe XSS sanitization and strict validation schemas.
- Strict virtual-money isolation: simulated currencies and calculations are explicitly watermarked and completely decoupled from any external financial system.

### 5. Domain Boundaries
1. **Identity & Auth**: Registration, login, profile, onboarding preferences, session validation, RBAC.
2. **Learning Platform**: Courses, modules, lessons, knowledge checks, quizzes, idempotent progress, explanations.
3. **Gamification & Games**: XP engine, levels, streaks, achievements, daily challenges, leaderboards, 1v1 battle rooms, group games, quick games.
4. **Simulations & Calculators**: First Salary, Monthly Budget, Investment Challenge, Mutual Fund/SIP, Startup Builder, compound interest/EMI calculators.
5. **Classrooms & Educators**: Classroom creation, join codes, QR codes, student rosters, assignments, performance reporting, CSV export.
6. **Community & Discussions**: Categories, posts, comments, likes, search, content reporting, moderator review queue.
7. **Admin & Moderation**: User management, content administration, report resolution, platform audit log, metrics.
8. **Public & SEO**: Landing page, curriculum showcase, simulator showcase, games showcase, educator showcase, FAQ, about, contact, legal disclaimer, sitemap, robots.txt.

## Consequences
- Single cohesive codebase that builds, type-checks, tests, and deploys without external microservice orchestration overhead.
- Excellent developer velocity with instant local setup and reliable tests.
- High testability with pure business logic in domain layers.

