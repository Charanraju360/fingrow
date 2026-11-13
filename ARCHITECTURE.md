# Architecture — Modular, Fault-Isolated and Extensible

## Architecture principle
Start with a **modular monolith** unless repository constraints or verified scale requirements justify independently deployed services. A modular monolith can provide strong domain isolation, independent tests and future service extraction without premature distributed-system complexity.

“Independent services” means:
- Clear domain ownership and interfaces.
- No cross-module database table writes.
- Module failures should degrade only dependent capabilities.
- Background work is isolated and retryable.
- Shared platform dependencies are small and explicit.
- Each module can later be extracted behind its existing interface.

## Suggested logical domains
1. Identity & Access.
2. Learning & Content.
3. Gamification.
4. Games & Realtime Sessions.
5. Simulations.
6. Classrooms & Educators.
7. Community & Moderation.
8. Notifications.
9. Search & Discovery.
10. Admin & Audit.
11. Analytics/Reporting.

## Boundary rules
- Each domain owns its business logic, validation, persistence and tests.
- Other domains interact through public application interfaces or versioned events, not direct table access.
- Shared kernel should contain only stable primitives (IDs, timestamps, error contracts, auth context), not business logic.
- Avoid circular dependencies.
- Keep UI components separate from domain rules.
- Keep provider-specific code behind adapters.
- Use typed contracts and runtime validation at boundaries.

## Fault isolation
- A failure in community must not prevent learning or simulations from loading.
- Notifications are best-effort and must not block core transactions.
- Search indexing failure must not prevent content creation; queue/retry indexing.
- Analytics failures must not block user-facing actions.
- Multiplayer disconnects must not corrupt completed scores.
- Simulation calculation errors must roll back that simulation operation and preserve previous valid state.
- Use timeouts, bounded retries with backoff and dead-letter handling for async jobs.
- Avoid unbounded retries and cascading calls.
- Use health/readiness checks and graceful degradation.
- Add circuit breakers only where there is a real remote dependency and a clear recovery policy.

## Data and transaction rules
- One authoritative owner per data entity.
- Use database transactions for related state changes.
- Use idempotency keys or unique constraints for XP awards, quiz completion, game answers and virtual transactions.
- Use an outbox pattern where reliable domain-event publication is needed.
- Do not promise exactly-once delivery; design consumers to be idempotent.
- Add indexes for real query patterns and pagination.
- Use migrations with rollback/forward-fix strategy.
- Never let agents independently modify the same schema/migration files.

## API conventions
- Version external/public APIs where compatibility matters.
- Validate all input at the server boundary.
- Standard response/error format.
- Consistent pagination, sorting and filtering.
- Authentication and authorization on every protected endpoint.
- Rate-limit sensitive or abuse-prone endpoints.
- Generate API documentation from typed contracts where practical.

## Realtime
Use realtime only for features that need it (live game state, presence, live classroom activity). Keep game/session state server-authoritative. Define reconnect, timeout, room expiry and disconnect rules. Do not make core learning dependent on realtime availability.

## Stack selection
If no stack exists, the orchestrator should compare and choose a maintainable TypeScript-first stack that supports:
- SSR/SSG for SEO-friendly public pages.
- Accessible reusable UI.
- Typed backend/API.
- Relational database and migrations.
- Background jobs.
- Realtime where justified.
- Automated unit/integration/E2E tests.
- Observability and deployment portability.

Do not blindly install a predetermined stack. Inspect current official docs and existing repository constraints, document the decision in an ADR and get approval before paid services or infrastructure.

## Extensibility
- Use feature flags for staged releases.
- Keep configuration out of business logic.
- Version event payloads.
- Maintain module README and ownership.
- Add a new module through documented scaffolding, contract, migration, tests, UI and observability checklist.
- Prefer adapters for email, storage, analytics, realtime and identity providers.
