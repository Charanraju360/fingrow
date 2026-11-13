import test from "node:test";
import assert from "node:assert/strict";
import { db } from "../../src/lib/db/index.ts";
import { calculateLevel, computeStreak, getCalendarDayDiff } from "../../src/lib/gamification/engine.ts";

test("Gamification Integration: Calendar Day Daily Streaks", () => {
  const testUserId = "usr_streak_test_" + Date.now();
  
  // Create a temporary user in the database
  db.users.create({
    id: testUserId,
    email: `streak.${Date.now()}@fingrow.dev`,
    passwordHash: "dummy",
    name: "Streak Tester",
    role: "student",
    xp: 0,
    streakDays: 0,
    lastActiveDate: "",
    createdAt: new Date().toISOString(),
  });

  // Day 1 Activity (e.g. 2026-11-01)
  const d1 = db.gamification.recordCalendarActivity(testUserId, "2026-11-01");
  assert.equal(d1.streakDays, 1);
  assert.equal(d1.streakIncremented, true);

  const userAfterD1 = db.users.getById(testUserId);
  assert.equal(userAfterD1?.streakDays, 1);
  assert.equal(userAfterD1?.lastActiveDate, "2026-11-01");

  // Same Day Repeating Activity (2026-11-01): Must NOT double increment!
  const d1Repeat = db.gamification.recordCalendarActivity(testUserId, "2026-11-01");
  assert.equal(d1Repeat.streakDays, 1, "Repeating on same calendar day must maintain streak at 1");
  assert.equal(d1Repeat.streakIncremented, false);

  const userAfterD1Repeat = db.users.getById(testUserId);
  assert.equal(userAfterD1Repeat?.streakDays, 1);

  // Day 2 Consecutive Activity (2026-11-02): Must increment to 2!
  const d2 = db.gamification.recordCalendarActivity(testUserId, "2026-11-02");
  assert.equal(d2.streakDays, 2);
  assert.equal(d2.streakIncremented, true);

  // Day 3 Consecutive Activity (2026-11-03): Must increment to 3 and unlock STREAK_3!
  const d3 = db.gamification.recordCalendarActivity(testUserId, "2026-11-03");
  assert.equal(d3.streakDays, 3);
  assert.ok(d3.unlockedAchievements.includes("STREAK_3"), "Must automatically award STREAK_3 achievement");

  // Verify bonus XP from achievement
  const userAfterD3 = db.users.getById(testUserId);
  assert.equal(userAfterD3?.streakDays, 3);
  assert.ok((userAfterD3?.xp || 0) >= 150, "User must receive STREAK_3 achievement XP bonus");

  // Gap / Inactivity: User misses 2026-11-04 and is next active on 2026-11-06 (3 days later)
  const dBroken = db.gamification.recordCalendarActivity(testUserId, "2026-11-06");
  assert.equal(dBroken.streakDays, 1, "Missed calendar day must reset streak to 1");
  assert.equal(dBroken.streakReset, true);

  const userAfterBreak = db.users.getById(testUserId);
  assert.equal(userAfterBreak?.streakDays, 1);
  assert.equal(userAfterBreak?.lastActiveDate, "2026-11-06");
});

test("Gamification Integration: Strictly Idempotent XP Awards", () => {
  const testUserId = "usr_student_alex";
  const userBefore = db.users.getById(testUserId);
  const startXp = userBefore?.xp || 0;

  const idempotencyKey = `test_xp_${Date.now()}`;

  // 1st XP Award
  const res1 = db.gamification.awardXP(testUserId, 150, "Testing idempotent XP award", idempotencyKey);
  assert.equal(res1.awarded, true);
  assert.equal(res1.awardedXp, 150);
  assert.equal(res1.newTotalXp, startXp + 150);

  const userAfter1 = db.users.getById(testUserId);
  assert.equal(userAfter1?.xp, startXp + 150);

  // 2nd Duplicate XP Award attempt with identical key
  const res2 = db.gamification.awardXP(testUserId, 150, "Testing idempotent XP award", idempotencyKey);
  assert.equal(res2.awarded, false, "Duplicate key must reject award");
  assert.equal(res2.awardedXp, 0);
  assert.equal(res2.newTotalXp, startXp + 150);

  const userAfter2 = db.users.getById(testUserId);
  assert.equal(userAfter2?.xp, startXp + 150, "Database score must not increase on duplicate call");
});

test("Gamification Integration: Idempotent Achievement Unlocking", () => {
  const testUserId = "usr_student_alex";
  
  // Unlocking an already unlocked achievement
  const resDuplicate = db.gamification.unlockAchievement(testUserId, "FIRST_STEP");
  assert.equal(resDuplicate.unlocked, false, "Cannot re-unlock already earned achievement");
  assert.equal(resDuplicate.xpAwarded, 0);
});

test("Gamification Integration: Leaderboard Sorting, Filtering & Database Score Reflection", () => {
  const allLeaders = db.gamification.getLeaderboard();
  assert.ok(allLeaders.length >= 5, "Must list all active database users");

  // Verify descending XP ordering
  for (let i = 0; i < allLeaders.length - 1; i++) {
    assert.ok(
      allLeaders[i].xp >= allLeaders[i + 1].xp,
      `Leaderboard must be sorted descending by XP: ${allLeaders[i].xp} >= ${allLeaders[i + 1].xp}`
    );
  }

  // Verify each leader object has calculated Level and achievements count
  for (const leader of allLeaders) {
    assert.ok(leader.level !== undefined);
    assert.ok(leader.level.level >= 1 && leader.level.level <= 7);
    assert.ok(typeof leader.level.title === "string");
    assert.ok(typeof leader.achievementsCount === "number");
  }

  // Filter by role: students only
  const studentLeaders = db.gamification.getLeaderboard({ role: "student" });
  assert.ok(studentLeaders.length >= 1);
  for (const s of studentLeaders) {
    assert.equal(s.role, "student");
  }

  // Sort by streak
  const streakLeaders = db.gamification.getLeaderboard({ sortBy: "streak" });
  for (let i = 0; i < streakLeaders.length - 1; i++) {
    assert.ok(
      streakLeaders[i].streakDays >= streakLeaders[i + 1].streakDays,
      "Streak sort must order by streakDays descending"
    );
  }
});

test("Gamification Integration: 1v1 Battle Game awards winner XP and BATTLE_CHAMP", () => {
  const hostId = "usr_student_alex";
  const guestId = "usr_pro_priya";

  // Create battle session
  const session = db.games.createSession(hostId, "Alex Chen", "battle");
  db.games.joinSession(session.joinCode, guestId, "Priya Sharma");

  // Host answers 3 questions correctly
  const q1 = session.questions[0];
  const q2 = session.questions[1];
  db.games.recordAnswer(session.id, hostId, q1.id, q1.correctIndex, 10);
  db.games.recordAnswer(session.id, hostId, q2.id, q2.correctIndex, 10);

  // Complete session: both host and guest finish
  db.games.finishSession(session.id, hostId);
  const finished = db.games.finishSession(session.id, guestId);
  assert.ok(finished !== null);
  assert.equal(finished?.winnerId, hostId);

  // Verify host unlocked BATTLE_CHAMP
  const userAchs = db.achievements.getUserAchievements(hostId);
  assert.ok(
    userAchs.some((ua) => ua.achievementCode === "BATTLE_CHAMP"),
    "Host winner must receive BATTLE_CHAMP achievement"
  );
});
