# FinGrow Delivery, Environments, CI/CD and Operations Guide

This document defines the deployment architecture, developer workflow, continuous integration pipeline, production operations, and disaster recovery specifications for the **FinGrow Financial & Business Learning Ecosystem**.

---

## 1. System Overview & Technology Stack

FinGrow is architected as a high-performance, modular Next.js application designed for low-latency interactive simulations, server-authoritative gamification, classroom management, and financial education.

- **Frontend & App Framework**: Next.js 15 (App Router), React 19, TypeScript 5.9, Tailwind CSS 3.4, Lucide React icons.
- **Runtime & Execution**: Node.js >= 20.18.0 LTS (Node 22/24 supported), pnpm >= 9.0.0.
- **Security & Cryptography**: PBKDF2 with 100,000 iterations for password hashing, HMAC-SHA256 session signatures, constant-time comparisons, Content Security Policy (CSP), HTTP security headers.
- **Persistence Engine**: Atomic filesystem JSON database with temporary write & rename semantics (`src/lib/db/`), portable to SQLite/PostgreSQL via the DB abstraction layer.
- **Mathematical Accuracy**: Decimal-safe financial formulas with boundary input guards (`src/lib/utils.ts` and `src/app/simulations/calculators/`).

---

## 2. Environment Configuration

FinGrow maintains strict separation between development, testing/preview, and production environments.

### Environment Matrix

| Variable | Required | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `development` / `production` | Node.js execution environment |
| `PORT` | No | `3000` | HTTP port server listens on |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` | Canonical platform URL for sitemap, CORS, and redirects |
| `SESSION_SECRET` | Yes | *Cryptographically secure 32+ bytes* | HMAC key for signing and verifying user session tokens |
| `DATABASE_FILE` | No | `./data/fingrow.json` | Path to persistent storage database file |
| `RATE_LIMIT_AUTH` | No | `15` | Maximum requests per minute per IP on authentication routes |
| `RATE_LIMIT_API` | No | `120` | Maximum requests per minute per IP across standard APIs |
| `NEXT_PUBLIC_ENABLE_COMMUNITY` | No | `true` | Feature flag: community discussions and comments |
| `NEXT_PUBLIC_ENABLE_SIMULATIONS`| No | `true` | Feature flag: virtual financial simulators |
| `NEXT_PUBLIC_ENABLE_GAMES` | No | `true` | Feature flag: multiplayer 1v1 battle games |
| `NEXT_PUBLIC_ENABLE_EDUCATOR` | No | `true` | Feature flag: classroom and educator workflows |

### Production Secret Hygiene
- **Never commit `.env` or `.env.local` to version control.** The `.gitignore` file enforces exclusion.
- Generate production `SESSION_SECRET` with strong entropy:
  ```bash
  openssl rand -base64 32
  ```
- In cloud environments (Vercel, AWS, GCP, Railway, Render), configure environment variables via the platform's encrypted secrets manager.

---

## 3. Developer Quickstart & Command Reference

### Prerequisites
- **Node.js**: `v20.18.0` or higher (`node -v`)
- **Package Manager**: `pnpm` v9+ (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Git**: standard Git CLI

### Clean Setup from Repository Checkout
```bash
# 1. Clone repository
git clone <repository-url> amar-prod
cd amar-prod

# 2. Install dependencies with frozen lockfile
pnpm install --frozen-lockfile

# 3. Initialize local environment variables
cp .env.example .env.local

# 4. Verify TypeScript and Linting
pnpm run typecheck
pnpm run lint

# 5. Run full test suite (60 automated unit & integration tests)
pnpm test

# 6. Start development server
pnpm dev
# Platform available at http://localhost:3000
```

### Script Dictionary
| Script | Command | Purpose |
| :--- | :--- | :--- |
| `pnpm dev` | `next dev -p 3000` | Starts local Next.js development server with hot reloading |
| `pnpm build` | `next build` | Produces optimized, tree-shaken static and server production build |
| `pnpm start` | `next start -p 3000` | Boots production server from compiled `.next` artifacts |
| `pnpm lint` | `next lint` | Executes ESLint validation across code routes and components |
| `pnpm run typecheck` | `tsc --noEmit` | Validates strict TypeScript types with zero emissions |
| `pnpm test` | `node --experimental-strip-types ...` | Executes all 60 unit, math, crypto, and integration tests |
| `pnpm run test:unit` | `node ... tests/unit/` | Executes 42 unit test suites (math, UX, games, gamification, auth) |
| `pnpm run test:integration`| `node ... tests/integration/`| Executes 18 integration tests (persistence, community, gamification)|

---

## 4. Continuous Integration (CI) Pipeline

Every pull request and branch merge triggers automated quality gate enforcement.

### Recommended GitHub Actions Workflow (`.github/workflows/ci.yml`)
```yaml
name: FinGrow CI Quality Pipeline

on:
  push:
    branches: [ master, main ]
  pull_request:
    branches: [ master, main ]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  validate:
    name: Lint, Typecheck, and Test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source
        uses: actions/checkout@v4

      - name: Setup Node.js 22 LTS
        uses: actions/setup-node@v4
        with:
          node-version: 22.x

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Cache pnpm Store
        uses: actions/cache@v4
        with:
          path: ~/.local/share/pnpm/store
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Environment Configuration
        run: cp .env.example .env.local

      - name: Type Verification
        run: pnpm run typecheck

      - name: Execute Full Test Suite
        run: pnpm test

      - name: Production Build Check
        run: pnpm run build
```

---

## 5. Production Deployment Architectures

### Option A: Containerized Deployment (Docker)
A multi-stage `Dockerfile` minimizes image surface and isolates production dependencies.

```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN pnpm run build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/data ./data

RUN chown -R nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000
CMD ["node_modules/.bin/next", "start", "-p", "3000"]
```

### Option B: Cloud Serverless / Edge (Vercel, Netlify)
1. Link GitHub repository to Vercel/Netlify.
2. Framework preset: **Next.js**.
3. Build command: `pnpm run build`.
4. Output directory: `.next`.
5. Install command: `pnpm install --frozen-lockfile`.
6. Inject production environment variables via dashboard:
   - `SESSION_SECRET`: 64-character random string.
   - `NEXT_PUBLIC_APP_URL`: Production domain.
   - Rate limiters and feature flags.

---

## 6. Observability, Monitoring & Reliability

### Health & Readiness Endpoints
- **Health Probe**: `/api/admin/metrics` returns system counts, user aggregates, database integrity, and pending moderation queue length.
- **Liveness**: Root route `GET /` responds with HTTP 200 and Cache-Control headers.

### Structured Logging Strategy
All critical system events emit structured audit logs with ISO-8601 timestamps and non-sensitive metadata:
- **Authentication**: `USER_REGISTER`, `USER_LOGIN`, `PASSWORD_RESET`.
- **Role Modifications**: `ROLE_MODIFIED` with previous and new roles recorded by authorized admin actors.
- **Moderation Actions**: `MODERATION_RESOLVED` and `POST_DELETED` with moderation reasoning.
- **Classroom Enrollment**: Join code redemptions and assignment submissions.
- **Privacy Assurance**: No passwords, hashed keys, credit card numbers, or PII are logged.

### Alerting Thresholds
| Metric | Threshold | Actionable Response |
| :--- | :--- | :--- |
| Auth Rate Limit Exceeded | > 50 hits/min | Investigate credential stuffing attempts; review IP blocklist |
| API 5xx Error Rate | > 1% over 5m window | Inspect server error logs, memory consumption, and disk space |
| Database Write Latency | > 500ms | Check filesystem I/O load or concurrent file locking contention |
| Unresolved Moderation Queue | > 25 pending reports | Alert compliance moderators to review reported content |

---

## 7. Backup, Disaster Recovery & Zero-Data-Loss Plan

### Database Snapshot Cadence
- **Automated Snapshots**: In production, schedule hourly snapshots of `./data/` with 30-day retention.
  ```bash
  # Hourly automated backup script
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  cp ./data/fingrow.json ./backups/fingrow_${TIMESTAMP}.json
  # Sync to cold offsite storage (e.g. AWS S3 / Cloud Storage with server-side encryption)
  ```
- **Pre-Rollout Backup**: Create an explicit snapshot immediately prior to deploying platform updates.

### Recovery Runbook
1. **Incident Triage**: Detect corruption or loss via health check failure or audit discrepancy.
2. **Maintenance Mode**: Route ingress traffic to a static 503 maintenance page.
3. **Restore**:
   ```bash
   cp ./backups/fingrow_<RESTORE_TIMESTAMP>.json ./data/fingrow.json
   ```
4. **Verification**: Run `pnpm test` to verify database schema parsing and integrity tests.
5. **Resume**: Remove maintenance redirect and verify platform metrics at `/admin`.
