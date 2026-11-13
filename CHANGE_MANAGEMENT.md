# Future Changes, Extensibility and Safe Workflow

## Adding a feature
Every feature request should follow:
1. Clarify user outcome and acceptance criteria.
2. Identify affected domains and dependencies.
3. Check whether an existing module can own the capability.
4. Write/update a short design decision and contract.
5. Assign exclusive ownership to an agent.
6. Add migrations/API/events behind stable interfaces.
7. Add tests and observability.
8. Integrate behind a feature flag if rollout risk warrants it.
9. Update docs and release notes.
10. Verify no unrelated module regressed.

## Changing workflows
- Map the current user journey before changing it.
- Preserve backward compatibility where possible.
- Version breaking API/event changes.
- Use expand-migrate-contract for risky schema changes.
- Add a migration plan and rollback/forward-fix plan.
- Do not remove data fields or routes without checking consumers.
- Update tests, docs and analytics definitions.

## Module independence checklist
- Does this module own its business rules and data?
- Are dependencies explicit and one-directional?
- Can the module fail without taking down unrelated modules?
- Are external calls bounded by timeouts?
- Are background events retryable and idempotent?
- Are failures visible and recoverable?
- Is there a clear interface for future service extraction?

## Agent change protocol
Agents must:
- Read current docs and code before edits.
- Stay within assigned ownership.
- Avoid changing shared contracts without approval.
- Add tests for changed behavior.
- Report files changed, decisions, tests and known risks.
- Never silently delete existing features or rewrite unrelated code.
