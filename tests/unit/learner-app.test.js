import test from "node:test";
import assert from "node:assert/strict";

test("Learner Progress: calculates completion percentage accurately", () => {
  function calculateProgress(completed, total) {
    if (total === 0) return 0;
    return Math.min(100, Math.max(0, Math.round((completed / total) * 100)));
  }

  assert.equal(calculateProgress(0, 10), 0);
  assert.equal(calculateProgress(5, 10), 50);
  assert.equal(calculateProgress(3, 9), 33);
  assert.equal(calculateProgress(10, 10), 100);
  assert.equal(calculateProgress(0, 0), 0);
});

test("Learner Gamification: calculates level and next milestone accurately", () => {
  function getLevelInfo(xp) {
    if (xp < 250) {
      return { level: 1, title: "Apprentice", current: xp, next: 250, pct: Math.round((xp / 250) * 100) };
    } else if (xp < 600) {
      return { level: 2, title: "Explorer", current: xp - 250, next: 350, pct: Math.round(((xp - 250) / 350) * 100) };
    } else if (xp < 1200) {
      return { level: 3, title: "Strategist", current: xp - 600, next: 600, pct: Math.round(((xp - 600) / 600) * 100) };
    } else if (xp < 2000) {
      return { level: 4, title: "Portfolio Builder", current: xp - 1200, next: 800, pct: Math.round(((xp - 1200) / 800) * 100) };
    } else {
      return { level: 5, title: "Financial Titan", current: xp, next: xp, pct: 100 };
    }
  }

  const lv1 = getLevelInfo(100);
  assert.equal(lv1.level, 1);
  assert.equal(lv1.title, "Apprentice");
  assert.equal(lv1.pct, 40);

  const lv2 = getLevelInfo(420);
  assert.equal(lv2.level, 2);
  assert.equal(lv2.title, "Explorer");

  const lv3 = getLevelInfo(890);
  assert.equal(lv3.level, 3);
  assert.equal(lv3.title, "Strategist");

  const lv5 = getLevelInfo(2500);
  assert.equal(lv5.level, 5);
  assert.equal(lv5.title, "Financial Titan");
  assert.equal(lv5.pct, 100);
});

test("Learner Streaks: maps 7-day habit indicators correctly", () => {
  function getActiveDays(currentStreak, currentDayIndex) {
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return daysOfWeek.map((day, idx) => {
      const isPastOrToday = idx <= currentDayIndex;
      const daysAgo = currentDayIndex - idx;
      const wasActive = isPastOrToday && daysAgo < currentStreak;
      const isToday = idx === currentDayIndex;
      return { day, wasActive, isToday };
    });
  }

  // Suppose today is Wednesday (index 2), streak is 3 days (Mon, Tue, Wed)
  const days = getActiveDays(3, 2);
  assert.equal(days[0].wasActive, true); // Mon
  assert.equal(days[1].wasActive, true); // Tue
  assert.equal(days[2].wasActive, true); // Wed
  assert.equal(days[2].isToday, true);
  assert.equal(days[3].wasActive, false); // Thu
});

test("Learner Badges: distinguishes unlocked vs locked and calculates total badge progress", () => {
  const allAchievements = [
    { code: "FIRST_STEP", title: "First Step", xpBonus: 50 },
    { code: "PERFECT_SCORE", title: "Quiz Whiz", xpBonus: 100 },
    { code: "STREAK_3", title: "Daily Habit", xpBonus: 150 },
    { code: "SIM_COMPLETED", title: "Simulator Master", xpBonus: 200 },
    { code: "BATTLE_CHAMP", title: "Battle Tested", xpBonus: 250 },
    { code: "CLASSROOM_SCHOLAR", title: "Classroom Scholar", xpBonus: 100 },
  ];

  const userAchievements = [
    { achievementCode: "FIRST_STEP" },
    { achievementCode: "STREAK_3" },
  ];

  const unlockedCodes = new Set(userAchievements.map((u) => u.achievementCode));
  const unlockedBadges = allAchievements.filter((a) => unlockedCodes.has(a.code));
  const lockedBadges = allAchievements.filter((a) => !unlockedCodes.has(a.code));

  assert.equal(unlockedBadges.length, 2);
  assert.equal(lockedBadges.length, 4);

  const progressPct = Math.round((unlockedBadges.length / allAchievements.length) * 100);
  assert.equal(progressPct, 33);

  // Next badge to unlock
  const nextBadge = lockedBadges[0];
  assert.equal(nextBadge.code, "PERFECT_SCORE");
});
