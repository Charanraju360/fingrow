# FinGrow — Financial Education Platform

> **"Learn Money. Play Smart. Invest Better. Grow."**
> Core Philosophy: *Don't just teach people how money works. Let them experience how money works.*

FinGrow is a full-stack, production-quality, responsive financial literacy and simulation platform tailored for students (16–25), young professionals (22–30), educators, and institutions.

---

## 🌟 Key Features

### 1. Distinctive Brand Identity & Design System
- **Color Palette**: Ivory (`#F7F6F1`), Deep Emerald (`#0B6B4B`), Forest Dark (`#084F38`), Electric Lime (`#7CE000`), Midnight Dark (`#07101A`), Coral (`#FF6B4A`), Tangerine (`#FF9F1C`).
- **Typography**: *Plus Jakarta Sans* for clean, modern interfaces, paired with *Cormorant Garamond Italic* editorial accents.
- **Micro-Interactions**: Realtime XP counter, dynamic streak flames, progress indicators, zero dead buttons, and accessible keyboard navigation (WCAG 2.2 AA).

### 2. Role-Based Identity & Onboarding (5 Roles)
- **Roles**:
  - `student` (16–25): Gamified learning, student leaderboards, classroom join codes.
  - `young_professional` (22–30): Career salary planning, portfolio diversification, tax and side hustles.
  - `educator`: Classroom creation, live QR code enrollment, lesson assignments, student analytics CSV export.
  - `institution_admin`: Multi-classroom visibility, cohort performance reporting, institutional audits.
  - `platform_admin`: System health monitoring, moderation report queue, user role management, immutable audit logs.
- **Security**: Node native PBKDF2 with 100,000 iterations & unique cryptographic salt, HMAC-SHA256 JWT sessions, sliding-window rate limiters, strict server-side RBAC guards.
- **Instant Role Switcher**: A sticky preview banner at the top of every page allows 1-click role swapping for live demonstration without re-entering credentials.

### 3. Interactive Learning & Quiz Engine
- **Curriculum**: 8 foundation-to-advanced courses:
  1. *Stock Market Fundamentals & Order Books*
  2. *Mutual Funds, ETFs & Systematic Investment Plans (SIP)*
  3. *Risk, Volatility & Modern Portfolio Diversification*
  4. *Inflation, Real Returns & Compound Interest Mastery*
  5. *Credit, Debt, Credit Scores & The Debt Avalanche*
  6. *Personal Finance, Emergency Funds & 50/30/20 Budgeting*
  7. *Entrepreneurship, Unit Economics, EBITDA & Valuation*
  8. *Career, High-Income Skills, Freelancing & Side Hustles*
- **Lesson Engine**: Structured reading content, takeaways, interactive knowledge checks, instant explanations for correct and incorrect answers, and idempotent XP award tracking.

### 4. Financial Simulations & Calculators
- **First Salary Simulator**: Interactive 50/30/20 allocation gauge with dynamic lifestyle inflation adjustments.
- **Monthly Budget Simulator**: Navigate dynamic emergency financial shocks (medical bills, car repairs, salary bonuses).
- **Virtual Investment Challenge**: Realistic $50,000 portfolio builder across Equities, Index Funds, Bonds, Real Estate, and Cash with historical stress tests.
- **SIP Wealth Growth Simulator**: Multi-decade compound curve projector with deposit vs. wealth gains.
- **Startup Builder**: Unit economics cockpit tracking Burn Rate, CAC, LTV, Monthly Recurring Revenue, and EBITDA runway.
- **Financial Calculators**:
  - Compound Interest (Annual/Monthly/Quarterly/Daily compounding)
  - SIP / Mutual Fund Future Value Calculator
  - Loan EMI Amortization Calculator
  - Inflation & Purchasing Power Depreciation Calculator

### 5. Gamification & Multiplayer Arenas
- **Quick Quiz Blitz**: Rapid-fire 60-second financial trivia against the clock.
- **1v1 Battle Arena**: Generate a 6-character room code, share with a peer, compete synchronously, and declare a winner based on accuracy and speed.
- **Global & Role Leaderboards**: Filter by weekly, all-time, students, or young professionals.
- **Streak & Level System**: Earn XP, level up from *Novice Saver* to *Market Wizard*, unlock achievements (e.g. *First Step*, *Compounder*, *Risk Master*, *Arena Champion*).

### 6. Educator Classroom Tools
- **Classroom Management**: Create cohorts with unique 6-character join codes.
- **Interactive SVG QR Joining**: Instant vector-rendered QR codes for frictionless mobile classroom enrollment.
- **Assignments**: Assign courses with deadlines to specific student cohorts.
- **Analytics & Gradebook**: Realtime progress percentages, average quiz scores, and one-click CSV export.

### 7. Community & Safety Moderation
- **Discussion Channels**: Categories covering *Personal Finance*, *Investing*, *Entrepreneurship*, *Career*, and *General*.
- **Safety Reporting Modal**: Protect learners from financial scams, misleading advice, and spam with automated queue placement.
- **Social Engagement**: Threaded replies, upvote counters, and verified educator/admin badges.

### 8. Platform Administration & Health
- **Live System Health**: Memory metrics, uptime, database record counts.
- **Audit Logs**: Immutable log of sensitive operations (role changes, bans, content moderation).
- **Moderation Queue**: Realtime queue for reviewing flagged content with dismissal or permanent ban actions.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (tested with Node.js 24)
- pnpm (or npm / yarn)

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd amar-prod

# Install dependencies
pnpm install

# Run database tests (100% passing)
npm test

# Start the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Accounts (Ready to Test)

Use any of these pre-seeded accounts (password is `password123` for all), or click the **Demo Role Switcher banner** at the top of the screen:

| Role | Email | Password | Display Name |
| :--- | :--- | :--- | :--- |
| **Student** | `alex@fingrow.io` | `password123` | Alex Chen |
| **Young Professional** | `priya@fingrow.io` | `password123` | Priya Sharma |
| **Educator** | `prof.sharma@fingrow.io` | `password123` | Dr. Rajesh Sharma |
| **Institution Admin** | `admin.apex@fingrow.io` | `password123` | Apex Academy Admin |
| **Platform Admin** | `super@fingrow.io` | `password123` | Sarah Jenkins |

---

## 🧪 Testing & Verification

The platform includes full unit, integration, and UX test suites running natively with Node test runner:
```bash
npm test
```
**Test Results (27/27 Passing)**:
- `tests/unit/financial-formulas.test.js`: Compound interest, SIP future value, loan EMI, inflation loss, boundary and zero-rate assertions.
- `tests/unit/auth-crypto.test.js`: PBKDF2 100k rounds, HMAC-SHA256 token verification, tampering protection, expiration handling, sliding-window rate limiters.
- `tests/unit/ux-journeys.test.js`: Route architecture verification (all 40 spec routes exist), zero placeholder `#` links, persona matrix completeness.
- `tests/integration/platform-integration.test.ts`: End-to-end ACID storage, seed fixtures, idempotent XP awards, 1v1 game flow, classroom enrollment, moderation queue.

---

## 🔒 Security & Privacy Notice
All money on FinGrow is **strictly virtual simulation currency**. No real brokerage accounts, bank credentials, or financial payment gateways are integrated.

