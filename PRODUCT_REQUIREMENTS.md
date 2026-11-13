# Product Requirements & User Journeys

## Product positioning
FinGrow is an interactive financial and business learning ecosystem. It connects learning, games, simulations, classrooms and community in one account and progress system.

## Roles
- Learner/student.
- Young professional (learner profile, not a separate privileged role unless needed).
- Educator.
- Institution administrator.
- Platform administrator/moderator.

Apply least-privilege authorization on the server. Hiding a button is not authorization.

## Core user journey
1. Visitor discovers FinGrow through SEO-friendly public pages.
2. Visitor registers or signs in.
3. User completes onboarding: display name, age-appropriate settings, interests, goals and optional role selection.
4. Learner dashboard recommends a starting path.
5. Learner studies a short lesson, answers questions and receives explanations.
6. Progress is saved and XP is awarded once.
7. Learner joins a game or starts a simulation.
8. Learner can join a classroom/community.
9. Profile shows progress, achievements and activity history.

## Module A — Interactive Learning
Initial foundations track:
1. Stock Market.
2. Mutual Funds & SIPs.
3. Risk & Portfolio Diversification.
4. Inflation, Interest & Compound Interest.
5. Credit & Debit.

Additional categories:
- Personal Finance.
- Investing.
- Entrepreneurship.
- Business and business terminology (revenue, profit, EBITDA, ROI).
- Side hustles.
- Career and skills.

Features:
- Searchable catalogue, categories, levels and estimated duration.
- Lesson pages with short sections, examples, diagrams and knowledge checks.
- Quiz types: single-choice, multiple-choice and scenario-based where supported.
- Explanations for correct and incorrect answers.
- Save/bookmark and resume.
- Completion and progress persistence.
- Educator-assigned lessons.
- Content authoring/moderation workflow for trusted roles.

## Module B — Gamification & Multiplayer
Modes:
- 1v1 battles.
- Group games.
- Quick games.
Features:
- Create/join private room using safe invite code.
- Match/session state machine.
- Timers, question delivery, answer validation and scoring.
- Reconnection and graceful disconnect handling.
- Results, XP, achievements and leaderboards.
- Anti-cheat basics: server-authoritative question/answer timing and score calculation.
- Tie handling and abandoned-session policy.
- Rate limits and duplicate-submission protection.

Do not rely on client-side score values. Multiplayer may use WebSockets/realtime provider only after architecture review; provide graceful fallback and clear reconnect states.

## Module C — Simulations
Initial scenarios:
- First Salary: salary, rent, expenses, emergency fund, savings and virtual investments.
- Monthly Budget: categories, goals, unexpected expenses and trade-offs.
- Investment Challenge: virtual portfolio, risk/return, diversification and market scenarios.
- Mutual Fund/SIP simulator: virtual contributions, assumed return scenarios and clear non-guarantee labels.
- Startup Builder: virtual capital, product, marketing, customers, costs, revenue and cash flow.

Requirements:
- Virtual currency clearly labelled.
- Explain assumptions and formulas.
- Show decisions, timeline, outcomes and lessons learned.
- Allow reset/replay where appropriate.
- Persist history.
- Avoid implying simulated performance predicts actual returns.
- No real brokerage integration or real-money transaction.

## Module D — Educator & Classroom
- Educator application/profile and role verification process appropriate to launch scope.
- Create/edit/archive classroom.
- Generate unique class join code and QR code.
- Students join by code/QR with abuse controls.
- Assign lessons, quizzes and games.
- Set due dates and instructions.
- View participation and performance.
- Classroom leaderboard with privacy controls.
- Export reports only for authorized educators.
- Institution admin can manage educators/classrooms if enabled.
- Audit sensitive actions.

## Module E — Community
Topics:
- Investing.
- Entrepreneurship.
- Personal finance.
- Business.
- Career development.

Features:
- Browse topics, create posts, comments and replies.
- Like/react, bookmark and follow.
- Search and sort.
- Report content/user.
- Moderator queue and actions.
- Rate limits, spam controls and safe rendering.
- Privacy controls and block/mute where appropriate.
- Do not expose private classroom content publicly.

## Supporting modules
- Dashboards and profiles.
- XP, levels, streaks, achievements and certificates.
- Friends/following (optional staged release).
- Notifications and invitations.
- Search/explore.
- Admin console.
- Account settings, privacy and data export/deletion workflow.

## Important product rules
- Do not gamify risky financial behaviour or reward high simulated returns alone. Reward learning quality, consistency and responsible decision-making.
- Do not use real-money balances in the virtual wallet.
- Clearly distinguish educational content from financial advice.
- Make content understandable to beginners; explain jargon inline.
- Provide a usable demo experience with seeded data.
