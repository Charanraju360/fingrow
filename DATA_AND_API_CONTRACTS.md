# Data Model, API and Event Contracts

This file defines conceptual contracts. The architecture owner must adapt names/types to the chosen stack and document the final schema before parallel implementation.

## Core entities
- User: id, email/identity reference, display name, status, created/updated timestamps.
- UserProfile: user id, interests, goals, locale, preferences.
- Role/Permission: role assignments and explicit permissions.
- Course: id, title, slug, description, category, level, status, author.
- Lesson: id, course id, title, content blocks, order, estimated duration.
- Quiz: id, lesson/course reference, questions, scoring policy.
- QuizAttempt: user, quiz, answers, score, status, timestamps.
- LearningProgress: user, course/lesson, completion state, progress.
- XPEvent: user, reason, source reference, amount, idempotency key, timestamp.
- Achievement: definition, criteria, version.
- UserAchievement: user, achievement, awarded timestamp.
- GameRoom/GameSession: owner, mode, participants, status, rules, timestamps.
- GameQuestion/Answer: session, question reference, answer, server score, timing.
- SimulationScenario: type, version, assumptions and rules.
- SimulationRun: user, scenario, state, virtual balance, status, timestamps.
- SimulationTransaction: run, type, amount, description, idempotency key.
- Classroom: educator, institution reference, name, join code, status.
- ClassroomMembership: classroom, user, role, joined timestamp.
- Assignment: classroom, activity reference, instructions, due date, status.
- AssignmentSubmission: assignment, user, result, timestamps.
- CommunityTopic/Post/Comment/Reaction/Report.
- Notification: recipient, type, payload reference, read state.
- AuditEvent: actor, action, target, timestamp, safe metadata.

## Data ownership
Each entity belongs to one domain. Do not allow other domains to write directly to its tables. Cross-domain reads use explicit query/application interfaces or read models.

## Event contracts
Use versioned event names and schemas, for example:
- `learning.lesson.completed.v1`
- `learning.quiz.passed.v1`
- `gamification.xp.awarded.v1`
- `games.session.completed.v1`
- `classrooms.assignment.created.v1`
- `community.post.reported.v1`

Event payloads should include event id, occurredAt, version, actor/user reference where permitted, source aggregate reference and minimal necessary data. Do not put secrets or unnecessary personal data in events.

## Reliability
- Consumers must be idempotent.
- Events should be retried with bounded backoff.
- Failed events should be observable and recoverable.
- Use an outbox or equivalent reliable publication approach when transaction/event consistency matters.
- Notifications and analytics consume events asynchronously and must not block source operations.

## API requirements
Document endpoints/actions, auth requirement, permission, request schema, response schema, error cases and rate limits. Use consistent errors such as validation, unauthenticated, forbidden, not found, conflict, rate limited and internal failure.

## Financial calculation rules
- Use decimal-safe arithmetic or integer minor units; avoid floating-point currency errors.
- Store currency code explicitly.
- Document rounding rules and assumptions.
- Version simulation formulas/scenarios so historical runs remain interpretable.
- Keep virtual balances separate from any real financial account data.
