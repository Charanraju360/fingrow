import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateLevel,
  getCalendarDayDiff,
  computeStreak,
  awardXPInternal,
  unlockAchievementInternal,
  recordCalendarActivityInternal,
  getLeaderboardInternal,
} from "../../src/lib/gamification/engine.ts";

test("Gamification Engine: calculateLevel accurately calculates level tiers and progress", () => {
  const l0 = calculateLevel(0);
  assert.equal(l0.level, 1);
  assert.equal(l0.title, "Novice Saver");
  assert.equal(l0.progressPercent, 0);

  const l125 = calculateLevel(125);
  assert.equal(l125.level, 1);
  assert.equal(l125.progressPercent, 50);

  const l350 = calculateLevel(350);
  assert.equal(l350.level, 2);
  assert.equal(l350.title, "Smart Budgeter");

  const l1500 = calculateLevel(1500);
  assert.equal(l1500.level, 4);
  assert.equal(l1500.title, "Portfolio Strategist");

  const l6000 = calculateLevel(6000);
  assert.equal(l6000.level, 7);
  assert.equal(l6000.title, "Ecosystem Titan");
  assert.equal(l6000.progressPercent, 20);

  const l12000 = calculateLevel(12000);
  assert.equal(l12000.progressPercent, 100);
});

test("Gamification Engine: getCalendarDayDiff handles month boundaries and consecutive days", () => {
  assert.equal(getCalendarDayDiff("2026-11-12", "2026-11-12"), 0);
  assert.equal(getCalendarDayDiff("2026-11-12", "2026-11-13"), 1);
  assert.equal(getCalendarDayDiff("2026-10-31", "2026-11-01"), 1); // Month rollover
  assert.equal(getCalendarDayDiff("2026-12-31", "2027-01-01"), 1); // Year rollover
  assert.equal(getCalendarDayDiff("2026-11-10", "2026-11-13"), 3); // Missed 2 days
});

test("Gamification Engine: computeStreak enforces correct daily calendar streak rules", () => {
  // First activity
  const res1 = computeStreak(0, undefined, "2026-11-10");
  assert.equal(res1.streakDays, 1);
  assert.equal(res1.streakIncremented, true);
  assert.equal(res1.streakReset, false);

  // Same day activity: streak unchanged
  const resSameDay = computeStreak(1, "2026-11-10", "2026-11-10");
  assert.equal(resSameDay.streakDays, 1);
  assert.equal(resSameDay.streakIncremented, false);
  assert.equal(resSameDay.streakReset, false);

  // Consecutive day: streak increments
  const resNextDay = computeStreak(1, "2026-11-10", "2026-11-11");
  assert.equal(resNextDay.streakDays, 2);
  assert.equal(resNextDay.streakIncremented, true);
  assert.equal(resNextDay.streakReset, false);

  // Missed day (gap > 1 day): streak resets to 1
  const resMissed = computeStreak(5, "2026-11-10", "2026-11-13");
  assert.equal(resMissed.streakDays, 1);
  assert.equal(resMissed.streakIncremented, false);
  assert.equal(resMissed.streakReset, true);
});

test("Gamification Engine: awardXPInternal strictly prevents duplicate XP via idempotencyKey", () => {
  const mockState = {
    users: [
      {
        id: "usr_test_1",
        email: "test@fingrow.dev",
        passwordHash: "",
        name: "Test User",
        role: "student",
        xp: 100,
        streakDays: 1,
        lastActiveDate: "2026-11-10",
        createdAt: "2026-11-01T00:00:00Z",
      },
    ],
    xpEvents: [],
    achievements: [],
    userAchievements: [],
  };

  const key = "xp_quiz_test_1_lesson_1";

  // First award
  const award1 = awardXPInternal(mockState, "usr_test_1", 100, "Completed Lesson 1", key);
  assert.equal(award1.awarded, true);
  assert.equal(award1.awardedXp, 100);
  assert.equal(award1.newTotalXp, 200);
  assert.equal(mockState.xpEvents.length, 1);
  assert.equal(mockState.users[0].xp, 200);

  // Duplicate award attempt with same idempotency key
  const award2 = awardXPInternal(mockState, "usr_test_1", 100, "Completed Lesson 1", key);
  assert.equal(award2.awarded, false);
  assert.equal(award2.awardedXp, 0);
  assert.equal(award2.newTotalXp, 200);
  assert.equal(mockState.xpEvents.length, 1, "Duplicate event must not be created");
  assert.equal(mockState.users[0].xp, 200, "XP must remain identical");
});

test("Gamification Engine: unlockAchievementInternal is idempotent and awards bonus XP once", () => {
  const mockState = {
    users: [
      {
        id: "usr_test_1",
        email: "test@fingrow.dev",
        passwordHash: "",
        name: "Test User",
        role: "student",
        xp: 50,
        streakDays: 1,
        lastActiveDate: "2026-11-10",
        createdAt: "2026-11-01T00:00:00Z",
      },
    ],
    xpEvents: [],
    achievements: [
      {
        code: "FIRST_STEP",
        title: "First Step",
        description: "Complete your very first financial knowledge lesson.",
        icon: "Footprints",
        xpBonus: 50,
      },
    ],
    userAchievements: [],
  };

  // 1st unlock
  const unlock1 = unlockAchievementInternal(mockState, "usr_test_1", "FIRST_STEP");
  assert.equal(unlock1.unlocked, true);
  assert.equal(unlock1.xpAwarded, 50);
  assert.equal(mockState.users[0].xp, 100);
  assert.equal(mockState.userAchievements.length, 1);

  // 2nd duplicate unlock attempt
  const unlock2 = unlockAchievementInternal(mockState, "usr_test_1", "FIRST_STEP");
  assert.equal(unlock2.unlocked, false);
  assert.equal(unlock2.xpAwarded, 0);
  assert.equal(mockState.users[0].xp, 100, "XP must not increase on duplicate unlock");
  assert.equal(mockState.userAchievements.length, 1, "Must not add duplicate user achievement record");
});

test("Gamification Engine: recordCalendarActivityInternal awards STREAK_3 on 3rd consecutive day", () => {
  const mockState = {
    users: [
      {
        id: "usr_test_streak",
        email: "streak@fingrow.dev",
        passwordHash: "",
        name: "Streak Tester",
        role: "student",
        xp: 100,
        streakDays: 2,
        lastActiveDate: "2026-11-11",
        createdAt: "2026-11-01T00:00:00Z",
      },
    ],
    xpEvents: [],
    achievements: [
      {
        code: "STREAK_3",
        title: "Daily Habit",
        description: "Maintain a 3-day active learning streak.",
        icon: "Flame",
        xpBonus: 150,
      },
    ],
    userAchievements: [],
  };

  const res = recordCalendarActivityInternal(mockState, "usr_test_streak", "2026-11-12");
  assert.equal(res.streakDays, 3);
  assert.equal(res.streakIncremented, true);
  assert.ok(res.unlockedAchievements.includes("STREAK_3"));

  // Check that user received bonus XP
  assert.equal(mockState.users[0].xp, 250); // 100 + 150 bonus
  assert.equal(mockState.userAchievements.length, 1);
  assert.equal(mockState.userAchievements[0].achievementCode, "STREAK_3");
});

test("Gamification Engine: getLeaderboardInternal correctly filters and sorts users", () => {
  const mockState = {
    users: [
      { id: "1", name: "User 1", role: "student", xp: 500, streakDays: 2, lastActiveDate: "2026-11-12", createdAt: "" },
      { id: "2", name: "User 2", role: "young_professional", xp: 1200, streakDays: 8, lastActiveDate: "2026-11-12", createdAt: "" },
      { id: "3", name: "User 3", role: "student", xp: 800, streakDays: 5, lastActiveDate: "2026-11-12", createdAt: "" },
    ],
    xpEvents: [],
    achievements: [],
    userAchievements: [],
  };

  // Sort by XP (default)
  const leadersByXp = getLeaderboardInternal(mockState);
  assert.equal(leadersByXp[0].id, "2");
  assert.equal(leadersByXp[1].id, "3");
  assert.equal(leadersByXp[2].id, "1");

  // Filter by role student
  const studentLeaders = getLeaderboardInternal(mockState, { role: "student" });
  assert.equal(studentLeaders.length, 2);
  assert.equal(studentLeaders[0].id, "3");
  assert.equal(studentLeaders[1].id, "1");

  // Sort by streak
  const leadersByStreak = getLeaderboardInternal(mockState, { sortBy: "streak" });
  assert.equal(leadersByStreak[0].id, "2"); // 8 days
  assert.equal(leadersByStreak[1].id, "3"); // 5 days
  assert.equal(leadersByStreak[2].id, "1"); // 2 days
});
