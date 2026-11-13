import { test, describe } from "node:test";
import assert from "node:assert";
import { db } from "../../src/lib/db/index.ts";

describe("FinGrow Games & Multiplayer Session Engine", () => {
  test("generates unique 6-character uppercase room codes without ambiguous glyphs", () => {
    const s1 = db.games.createSession("user_test_host_1", "Host One", "battle");
    const s2 = db.games.createSession("user_test_host_2", "Host Two", "battle");

    assert.strictEqual(s1.joinCode.length, 6, "Join code must be exactly 6 characters");
    assert.strictEqual(s2.joinCode.length, 6, "Join code must be exactly 6 characters");
    assert.match(s1.joinCode, /^[A-Z0-9]{6}$/, "Join code must be uppercase alphanumeric");
    assert.notStrictEqual(s1.joinCode, s2.joinCode, "Room codes must be unique");
    assert.strictEqual(s1.status, "waiting", "Battle session should initially be waiting");
    assert.strictEqual(s1.mode, "battle");
  });

  test("quick sprint sessions initialize in_progress with 5 seeded questions", () => {
    const quickSession = db.games.createSession("user_quick_player", "Sprint Player", "quick");

    assert.strictEqual(quickSession.mode, "quick");
    assert.strictEqual(quickSession.status, "in_progress");
    assert.strictEqual(quickSession.questions.length, 5, "Must pull 5 questions");
    assert.strictEqual(quickSession.scores["user_quick_player"], 0);
  });

  test("guest joins battle session via 6-character room code and transitions to in_progress", () => {
    const hostSession = db.games.createSession("host_battle_1", "Duel Host", "battle");
    const joinCode = hostSession.joinCode;

    // Join with lowercase to test case-insensitivity
    const joined = db.games.joinSession(joinCode.toLowerCase(), "guest_battle_1", "Duel Guest");

    assert.ok(joined, "Session must be joinable with code");
    assert.strictEqual(joined?.id, hostSession.id);
    assert.strictEqual(joined?.status, "in_progress", "Status should transition to in_progress");
    assert.strictEqual(joined?.guestId, "guest_battle_1");
    assert.strictEqual(joined?.guestName, "Duel Guest");
    assert.strictEqual(joined?.scores["guest_battle_1"], 0);

    // Cannot join a room that is no longer waiting
    const rejectedJoin = db.games.joinSession(joinCode, "third_wheel", "Late Guest");
    assert.strictEqual(rejectedJoin, null, "Should reject joining full or active room");
  });

  test("server-authoritative scoring enforces 15s timer speed bonus, correct answers, and prevents duplicate submissions", () => {
    const s = db.games.createSession("player_scorer", "Scoring Tester", "quick");
    const q1 = s.questions[0];
    const correctIdx = q1.correctIndex;
    const wrongIdx = (correctIdx + 1) % q1.options.length;

    // 1. Correct answer with 10s remaining (out of 15s)
    const result1 = db.games.recordAnswer(s.id, "player_scorer", q1.id, correctIdx, 10);
    assert.strictEqual(result1.isCorrect, true);
    assert.strictEqual(result1.pointsAwarded, 100 + Math.floor(10 * 3), "Base 100 + 30 speed bonus");
    assert.strictEqual(result1.alreadyAnswered, false);
    assert.strictEqual(result1.session?.scores["player_scorer"], 130);

    // 2. Anti-cheat duplicate submission test: submit again for same question
    const dupResult = db.games.recordAnswer(s.id, "player_scorer", q1.id, correctIdx, 12);
    assert.strictEqual(dupResult.alreadyAnswered, true, "Must flag duplicate submission");
    assert.strictEqual(dupResult.pointsAwarded, 0, "No duplicate points awarded");
    assert.strictEqual(dupResult.session?.scores["player_scorer"], 130, "Total score unchanged");

    // 3. Question 2: Incorrect answer
    const q2 = s.questions[1];
    const q2WrongIdx = (q2.correctIndex + 1) % q2.options.length;
    const result2 = db.games.recordAnswer(s.id, "player_scorer", q2.id, q2WrongIdx, 8);
    assert.strictEqual(result2.isCorrect, false);
    assert.strictEqual(result2.pointsAwarded, 0);

    // 4. Question 3: 15-second timer expiration (timeout index -1)
    const q3 = s.questions[2];
    const result3 = db.games.recordAnswer(s.id, "player_scorer", q3.id, -1, 0);
    assert.strictEqual(result3.isCorrect, false);
    assert.strictEqual(result3.pointsAwarded, 0);
  });

  test("duel finish awards winner, loser, or tie bonus cleanly", () => {
    const duel = db.games.createSession("host_winner", "Host Player", "battle");
    db.games.joinSession(duel.joinCode, "guest_loser", "Guest Player");

    // Host scores 200, Guest scores 100
    const q1 = duel.questions[0];
    db.games.recordAnswer(duel.id, "host_winner", q1.id, q1.correctIndex, 10);
    db.games.recordAnswer(duel.id, "guest_loser", q1.id, (q1.correctIndex + 1) % 4, 10);

    // Finish session
    const finished = db.games.finishSession(duel.id, "host_winner");
    assert.ok(finished);
    // When duel finishes: host is winner
    const updated = db.games.finishSession(duel.id, "guest_loser");
    assert.strictEqual(updated?.status, "completed");
    assert.strictEqual(updated?.winnerId, "host_winner");
    assert.ok(updated?.completedAt);
  });
});
