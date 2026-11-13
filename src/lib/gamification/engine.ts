import crypto from "node:crypto";
import type { DatabaseSchema } from "../db/index";
import type { AchievementEntity, UserAchievementEntity, XPEventEntity, UserEntity } from "../db/seed-data";

export interface GamificationLevel {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  role: string;
  xp: number;
  streakDays: number;
  level: GamificationLevel;
  achievementsCount: number;
  achievements: string[];
  lastActiveDate: string;
}

export interface StreakUpdateResult {
  streakDays: number;
  streakIncremented: boolean;
  streakReset: boolean;
  today: string;
  unlockedAchievements: string[];
}

export interface AwardXPResult {
  awarded: boolean;
  awardedXp: number;
  newTotalXp: number;
  idempotencyKey: string;
  reason: string;
  event?: XPEventEntity;
}

export interface AchievementUnlockResult {
  unlocked: boolean;
  achievementCode: string;
  xpAwarded: number;
  title?: string;
}

export const ADDITIONAL_ACHIEVEMENTS: AchievementEntity[] = [
  {
    code: "STREAK_7",
    title: "Week Strong",
    description: "Maintain an unbroken 7-day active learning streak.",
    icon: "Zap",
    xpBonus: 300,
  },
  {
    code: "CENTURION_XP",
    title: "Centurion",
    description: "Amass over 1,000 XP in total financial mastery.",
    icon: "Trophy",
    xpBonus: 200,
  },
];

/**
 * Calculates user gamification level, tier title, and progress percentage to next level.
 */
export function calculateLevel(xp: number): GamificationLevel {
  const safeXp = Math.max(0, xp || 0);
  const tiers = [
    { level: 1, title: "Novice Saver", minXp: 0, maxXp: 250 },
    { level: 2, title: "Smart Budgeter", minXp: 250, maxXp: 500 },
    { level: 3, title: "Informed Investor", minXp: 500, maxXp: 1000 },
    { level: 4, title: "Portfolio Strategist", minXp: 1000, maxXp: 2000 },
    { level: 5, title: "Wealth Architect", minXp: 2000, maxXp: 3500 },
    { level: 6, title: "Financial Master", minXp: 3500, maxXp: 5000 },
    { level: 7, title: "Ecosystem Titan", minXp: 5000, maxXp: 10000 },
  ];

  for (const t of tiers) {
    if (safeXp < t.maxXp) {
      const range = t.maxXp - t.minXp;
      const current = safeXp - t.minXp;
      const progressPercent = Math.min(100, Math.max(0, Math.round((current / range) * 100)));
      return {
        level: t.level,
        title: t.title,
        minXp: t.minXp,
        maxXp: t.maxXp,
        nextLevelXp: t.maxXp,
        progressPercent,
      };
    }
  }

  return {
    level: 7,
    title: "Ecosystem Titan",
    minXp: 5000,
    maxXp: 10000,
    nextLevelXp: 10000,
    progressPercent: 100,
  };
}

/**
 * Returns difference in full calendar days between two YYYY-MM-DD date strings.
 * Handles month and leap-year boundaries via UTC epoch timestamps.
 */
export function getCalendarDayDiff(dateStr1?: string, dateStr2?: string): number {
  if (!dateStr1 || !dateStr2) return -1;
  const [y1, m1, d1] = dateStr1.split("-").map(Number);
  const [y2, m2, d2] = dateStr2.split("-").map(Number);
  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return -1;

  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  const MS_PER_DAY = 86400000;
  return Math.floor((utc2 - utc1) / MS_PER_DAY);
}

/**
 * Calculates next daily streak based on active calendar days.
 * - Same calendar day: streak stays unchanged (no double counting).
 * - Exactly 1 day after lastActiveDate: streak increments.
 * - More than 1 day elapsed: streak resets to 1.
 * - Initial activity: streak sets to 1.
 */
export function computeStreak(
  currentStreak: number,
  lastActiveDate?: string,
  referenceDateStr?: string
): {
  streakDays: number;
  streakIncremented: boolean;
  streakReset: boolean;
  today: string;
} {
  const today = referenceDateStr || new Date().toISOString().split("T")[0];
  const safeCurrent = Math.max(0, currentStreak || 0);

  if (!lastActiveDate) {
    return {
      streakDays: 1,
      streakIncremented: true,
      streakReset: false,
      today,
    };
  }

  const diff = getCalendarDayDiff(lastActiveDate, today);

  if (diff === 0) {
    // Already active today; retain existing streak
    return {
      streakDays: Math.max(1, safeCurrent),
      streakIncremented: false,
      streakReset: false,
      today,
    };
  } else if (diff === 1) {
    // Consecutive active calendar day
    return {
      streakDays: safeCurrent + 1,
      streakIncremented: true,
      streakReset: false,
      today,
    };
  } else if (diff > 1) {
    // Gap of 1 or more calendar days: reset streak
    return {
      streakDays: 1,
      streakIncremented: false,
      streakReset: true,
      today,
    };
  } else {
    // Clock skew / past date
    return {
      streakDays: Math.max(1, safeCurrent),
      streakIncremented: false,
      streakReset: false,
      today,
    };
  }
}

/**
 * Idempotently awards XP to a user. If an event with the given idempotencyKey
 * already exists, returns awarded: false and does not increment user XP.
 */
export function awardXPInternal(
  state: DatabaseSchema,
  userId: string,
  amount: number,
  reason: string,
  idempotencyKey: string
): AwardXPResult {
  const user = state.users.find((u) => u.id === userId);
  if (!user) {
    return {
      awarded: false,
      awardedXp: 0,
      newTotalXp: 0,
      idempotencyKey,
      reason,
    };
  }

  // Check if idempotency key was already recorded
  const existingEvent = state.xpEvents.find((e) => e.idempotencyKey === idempotencyKey);
  if (existingEvent) {
    return {
      awarded: false,
      awardedXp: 0,
      newTotalXp: user.xp,
      idempotencyKey,
      reason,
      event: existingEvent,
    };
  }

  // Create new XP event
  const newEvent: XPEventEntity = {
    id: `xpe_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
    userId,
    amount,
    reason,
    idempotencyKey,
    createdAt: new Date().toISOString(),
  };

  state.xpEvents.push(newEvent);
  user.xp += amount;

  // Check for 1,000 XP Centurion milestone
  if (user.xp >= 1000) {
    unlockAchievementInternal(state, userId, "CENTURION_XP");
  }

  return {
    awarded: true,
    awardedXp: amount,
    newTotalXp: user.xp,
    idempotencyKey,
    reason,
    event: newEvent,
  };
}

/**
 * Idempotently unlocks an achievement for a user and awards its bonus XP.
 */
export function unlockAchievementInternal(
  state: DatabaseSchema,
  userId: string,
  achievementCode: string
): AchievementUnlockResult {
  const user = state.users.find((u) => u.id === userId);
  if (!user) {
    return { unlocked: false, achievementCode, xpAwarded: 0 };
  }

  // Check if already unlocked
  const alreadyUnlocked = state.userAchievements.some(
    (ua) => ua.userId === userId && ua.achievementCode === achievementCode
  );
  if (alreadyUnlocked) {
    return { unlocked: false, achievementCode, xpAwarded: 0 };
  }

  // Find achievement definition from seeded or extended list
  const allAchievements = [...state.achievements, ...ADDITIONAL_ACHIEVEMENTS];
  const definition = allAchievements.find((a) => a.code === achievementCode);

  const newUserAch: UserAchievementEntity = {
    id: `ua_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
    userId,
    achievementCode,
    unlockedAt: new Date().toISOString(),
  };
  state.userAchievements.push(newUserAch);

  let xpAwarded = 0;
  if (definition && definition.xpBonus > 0) {
    const achIdempotencyKey = `xp_ach_${userId}_${achievementCode}`;
    const xpRes = awardXPInternal(
      state,
      userId,
      definition.xpBonus,
      `Unlocked achievement: ${definition.title}`,
      achIdempotencyKey
    );
    xpAwarded = xpRes.awardedXp;
  }

  return {
    unlocked: true,
    achievementCode,
    xpAwarded,
    title: definition?.title,
  };
}

/**
 * Updates calendar streak for a user on activity, idempotently awarding streak badges.
 */
export function recordCalendarActivityInternal(
  state: DatabaseSchema,
  userId: string,
  referenceDateStr?: string
): StreakUpdateResult {
  const user = state.users.find((u) => u.id === userId);
  if (!user) {
    return {
      streakDays: 0,
      streakIncremented: false,
      streakReset: false,
      today: new Date().toISOString().split("T")[0],
      unlockedAchievements: [],
    };
  }

  const { streakDays, streakIncremented, streakReset, today } = computeStreak(
    user.streakDays,
    user.lastActiveDate,
    referenceDateStr
  );

  user.streakDays = streakDays;
  user.lastActiveDate = today;

  const unlockedAchievements: string[] = [];

  // Evaluate streak-based achievements
  if (user.streakDays >= 3) {
    const res = unlockAchievementInternal(state, userId, "STREAK_3");
    if (res.unlocked) unlockedAchievements.push("STREAK_3");
  }

  if (user.streakDays >= 7) {
    const res = unlockAchievementInternal(state, userId, "STREAK_7");
    if (res.unlocked) unlockedAchievements.push("STREAK_7");
  }

  return {
    streakDays,
    streakIncremented,
    streakReset,
    today,
    unlockedAchievements,
  };
}

/**
 * Builds detailed leaderboard reflecting real persisted database users, XP, streaks, and levels.
 */
export function getLeaderboardInternal(
  state: DatabaseSchema,
  options: {
    role?: string;
    sortBy?: "xp" | "streak";
    limit?: number;
  } = {}
): LeaderboardEntry[] {
  let list = [...state.users];

  if (options.role && options.role !== "all") {
    const targetRole = options.role.toLowerCase().replace(/[-\s]/g, "_");
    list = list.filter((u) => u.role.toLowerCase() === targetRole);
  }

  if (options.sortBy === "streak") {
    list.sort((a, b) => b.streakDays - a.streakDays || b.xp - a.xp);
  } else {
    // Default: by XP descending, ties broken by streakDays
    list.sort((a, b) => b.xp - a.xp || b.streakDays - a.streakDays);
  }

  if (options.limit && options.limit > 0) {
    list = list.slice(0, options.limit);
  }

  return list.map((u) => {
    const userAchs = state.userAchievements
      .filter((ua) => ua.userId === u.id)
      .map((ua) => ua.achievementCode);

    return {
      id: u.id,
      name: u.name,
      role: u.role,
      xp: u.xp,
      streakDays: u.streakDays,
      level: calculateLevel(u.xp),
      achievementsCount: userAchs.length,
      achievements: userAchs,
      lastActiveDate: u.lastActiveDate,
    };
  });
}
