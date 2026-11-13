import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  calculateLevel,
  computeStreak,
  awardXPInternal,
  unlockAchievementInternal,
  recordCalendarActivityInternal,
  getLeaderboardInternal,
  ADDITIONAL_ACHIEVEMENTS,
} from "../gamification/engine.ts";
import {
  getInitialSeedData,
  type UserEntity,
  type ProfileEntity,
  type CourseEntity,
  type LessonEntity,
  type ProgressEntity,
  type XPEventEntity,
  type AchievementEntity,
  type UserAchievementEntity,
  type GameSessionEntity,
  type SimulationRunEntity,
  type ClassroomEntity,
  type AssignmentEntity,
  type AssignmentSubmissionEntity,
  type CommunityPostEntity,
  type CommunityCommentEntity,
  type ModerationReportEntity,
  type AuditLogEntity,
} from "./seed-data.ts";

export interface DatabaseSchema {
  users: UserEntity[];
  profiles: ProfileEntity[];
  courses: CourseEntity[];
  lessons: LessonEntity[];
  progress: ProgressEntity[];
  xpEvents: XPEventEntity[];
  achievements: AchievementEntity[];
  userAchievements: UserAchievementEntity[];
  gameSessions: GameSessionEntity[];
  simulationRuns: SimulationRunEntity[];
  classrooms: ClassroomEntity[];
  assignments: AssignmentEntity[];
  assignmentSubmissions: AssignmentSubmissionEntity[];
  communityPosts: CommunityPostEntity[];
  communityComments: CommunityCommentEntity[];
  moderationReports: ModerationReportEntity[];
  auditLogs: AuditLogEntity[];
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "fingrow.json");

let memoryCache: DatabaseSchema | null = null;

function ensureDbFile(): DatabaseSchema {
  if (memoryCache) return memoryCache;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    const seed = getInitialSeedData();
    const initialData: DatabaseSchema = {
      ...seed,
      progress: [],
      xpEvents: [],
      gameSessions: [],
      simulationRuns: [],
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), "utf8");
    memoryCache = initialData;
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    memoryCache = JSON.parse(raw);
    // Keep courses, lessons, and achievements synchronized with seed-data
    const seed = getInitialSeedData();
    memoryCache!.courses = seed.courses;
    memoryCache!.lessons = seed.lessons;
    return memoryCache!;
  } catch (err) {
    console.error("Failed to parse fingrow.json, re-seeding safely:", err);
    const seed = getInitialSeedData();
    const initialData: DatabaseSchema = {
      ...seed,
      progress: [],
      xpEvents: [],
      gameSessions: [],
      simulationRuns: [],
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), "utf8");
    memoryCache = initialData;
    return initialData;
  }
}

function saveDb(data: DatabaseSchema): void {
  memoryCache = data;
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  const serialized = JSON.stringify(data, null, 2);
  const tempPath = `${DB_PATH}.${Date.now()}.${crypto.randomBytes(4).toString("hex")}.tmp`;

  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      fs.writeFileSync(tempPath, serialized, "utf8");
      try {
        fs.renameSync(tempPath, DB_PATH);
        return;
      } catch {
        // Fallback on Windows when rename throws EPERM / EBUSY due to file locks
        fs.copyFileSync(tempPath, DB_PATH);
        try {
          fs.unlinkSync(tempPath);
        } catch {}
        return;
      }
    } catch (err: any) {
      if ((err.code === "EBUSY" || err.code === "EPERM") && attempt < 7) {
        const waitTill = Date.now() + 20 * (attempt + 1);
        while (Date.now() < waitTill) {}
        continue;
      }
      try {
        fs.writeFileSync(DB_PATH, serialized, "utf8");
        return;
      } catch (directErr: any) {
        if ((directErr.code === "EBUSY" || directErr.code === "EPERM") && attempt < 7) {
          const waitTill = Date.now() + 20 * (attempt + 1);
          while (Date.now() < waitTill) {}
          continue;
        }
        break;
      }
    }
  }
}

export const db = {
  // Reset or reseed
  reset(): void {
    const seed = getInitialSeedData();
    const data: DatabaseSchema = {
      ...seed,
      progress: [],
      xpEvents: [],
      gameSessions: [],
      simulationRuns: [],
    };
    saveDb(data);
  },

  // USERS
  users: {
    getAll(): UserEntity[] {
      return ensureDbFile().users;
    },
    getById(id: string): UserEntity | undefined {
      return ensureDbFile().users.find((u) => u.id === id);
    },
    getByEmail(email: string): UserEntity | undefined {
      return ensureDbFile().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    },
    create(user: UserEntity): UserEntity {
      const state = ensureDbFile();
      state.users.push(user);
      saveDb(state);
      return user;
    },
    update(id: string, updates: Partial<UserEntity>): UserEntity | null {
      const state = ensureDbFile();
      const idx = state.users.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      state.users[idx] = { ...state.users[idx], ...updates };
      saveDb(state);
      return state.users[idx];
    },
  },

  // PROFILES
  profiles: {
    getByUserId(userId: string): ProfileEntity | undefined {
      return ensureDbFile().profiles.find((p) => p.userId === userId);
    },
    upsert(userId: string, data: Partial<ProfileEntity>): ProfileEntity {
      const state = ensureDbFile();
      const idx = state.profiles.findIndex((p) => p.userId === userId);
      if (idx >= 0) {
        state.profiles[idx] = { ...state.profiles[idx], ...data };
        saveDb(state);
        return state.profiles[idx];
      } else {
        const newProfile: ProfileEntity = {
          userId,
          interests: data.interests || [],
          experienceLevel: data.experienceLevel || "beginner",
          goals: data.goals || [],
          completedOnboarding: data.completedOnboarding ?? true,
          institution: data.institution,
        };
        state.profiles.push(newProfile);
        saveDb(state);
        return newProfile;
      }
    },
  },

  // COURSES & LESSONS
  courses: {
    getAll(): CourseEntity[] {
      return ensureDbFile().courses;
    },
    getBySlug(slug: string): CourseEntity | undefined {
      return ensureDbFile().courses.find((c) => c.slug === slug);
    },
  },
  lessons: {
    getByCourseSlug(courseSlug: string): LessonEntity[] {
      return ensureDbFile().lessons.filter((l) => l.courseSlug === courseSlug).sort((a, b) => a.order - b.order);
    },
    getBySlug(courseSlug: string, lessonSlug: string): LessonEntity | undefined {
      return ensureDbFile().lessons.find((l) => l.courseSlug === courseSlug && l.slug === lessonSlug);
    },
  },

  // LEARNING PROGRESS & IDEMPOTENT XP
  progress: {
    getUserProgress(userId: string): ProgressEntity[] {
      return ensureDbFile().progress.filter((p) => p.userId === userId);
    },
    recordLessonCompletion(userId: string, courseSlug: string, lessonSlug: string, score: number): {
      progress: ProgressEntity;
      awardedXp: number;
    } {
      const state = ensureDbFile();
      let record = state.progress.find(
        (p) => p.userId === userId && p.courseSlug === courseSlug && p.lessonSlug === lessonSlug
      );
      
      const isFirstCompletion = !record || !record.completed;
      let awardedXp = 0;

      if (!record) {
        record = {
          id: `prg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId,
          courseSlug,
          lessonSlug,
          completed: true,
          score,
          completedAt: new Date().toISOString(),
        };
        state.progress.push(record);
      } else {
        record.completed = true;
        record.score = Math.max(record.score, score);
        record.completedAt = new Date().toISOString();
      }

      // Record active calendar day for streak tracking
      recordCalendarActivityInternal(state, userId);

      // Idempotently award XP if first completion
      if (isFirstCompletion) {
        const xpAmount = score === 100 ? 100 : 50; // Bonus for perfect quiz
        const idempotencyKey = `xp_lesson_${userId}_${courseSlug}_${lessonSlug}`;
        
        const xpResult = awardXPInternal(
          state,
          userId,
          xpAmount,
          `Completed lesson: ${lessonSlug}`,
          idempotencyKey
        );
        awardedXp = xpResult.awardedXp;

        // Unlock FIRST_STEP achievement
        unlockAchievementInternal(state, userId, "FIRST_STEP");

        // Unlock PERFECT_SCORE achievement if 100%
        if (score === 100) {
          unlockAchievementInternal(state, userId, "PERFECT_SCORE");
        }
      } else if (score === 100) {
        // Upgrade bonus if previously completed with < 100%
        const perfKey = `xp_lesson_perf_${userId}_${courseSlug}_${lessonSlug}`;
        const existingPerf = state.xpEvents.find((e) => e.idempotencyKey === perfKey);
        if (!existingPerf) {
          const baseKey = `xp_lesson_${userId}_${courseSlug}_${lessonSlug}`;
          const baseEvent = state.xpEvents.find((e) => e.idempotencyKey === baseKey);
          if (baseEvent && baseEvent.amount === 50) {
            const xpResult = awardXPInternal(
              state,
              userId,
              50,
              `Perfect score upgrade: ${lessonSlug}`,
              perfKey
            );
            awardedXp = xpResult.awardedXp;
          }
        }
        unlockAchievementInternal(state, userId, "PERFECT_SCORE");
      }

      saveDb(state);
      return { progress: record, awardedXp };
    },
  },

  // ACHIEVEMENTS
  achievements: {
    getAll(): AchievementEntity[] {
      const state = ensureDbFile();
      const existingCodes = new Set(state.achievements.map((a) => a.code));
      const combined = [...state.achievements];
      for (const extra of ADDITIONAL_ACHIEVEMENTS) {
        if (!existingCodes.has(extra.code)) {
          combined.push(extra);
        }
      }
      return combined;
    },
    getUserAchievements(userId: string): UserAchievementEntity[] {
      return ensureDbFile().userAchievements.filter((ua) => ua.userId === userId);
    },
  },

  // GAMES & SESSIONS
  games: {
    createSession(hostId: string, hostName: string, mode: GameSessionEntity["mode"] = "quick"): GameSessionEntity {
      const state = ensureDbFile();
      
      // Generate guaranteed 6-character unambiguous uppercase room code
      const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
      const existingCodes = new Set(
        state.gameSessions
          .filter((s) => s.status !== "completed")
          .map((s) => s.joinCode)
      );
      let joinCode = "";
      let attempts = 0;
      do {
        joinCode = "";
        for (let i = 0; i < 6; i++) {
          joinCode += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        }
        attempts++;
      } while (existingCodes.has(joinCode) && attempts < 100);

      // Pull 5 random questions from seeded lessons
      const allQuestions = state.lessons.flatMap((l) => l.quiz);
      const shuffled = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, 5);

      const session: GameSessionEntity = {
        id: `game_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        mode,
        joinCode,
        status: mode === "quick" ? "in_progress" : "waiting",
        hostId,
        hostName,
        scores: { [hostId]: 0 },
        questions: shuffled,
        answers: { [hostId]: {} },
        playerProgress: { [hostId]: { isFinished: false } },
        createdAt: new Date().toISOString(),
      };

      state.gameSessions.push(session);
      saveDb(state);
      return session;
    },

    getSessionById(id: string): GameSessionEntity | undefined {
      return ensureDbFile().gameSessions.find((s) => s.id === id);
    },

    getSessionByCode(code: string): GameSessionEntity | undefined {
      return ensureDbFile().gameSessions.find(
        (s) => s.joinCode.trim().toUpperCase() === code.trim().toUpperCase()
      );
    },

    joinSession(code: string, guestId: string, guestName: string): GameSessionEntity | null {
      const state = ensureDbFile();
      const session = state.gameSessions.find(
        (s) => s.joinCode.trim().toUpperCase() === code.trim().toUpperCase()
      );
      if (!session) return null;
      if (session.status !== "waiting") return null;

      session.guestId = guestId;
      session.guestName = guestName;
      session.status = "in_progress";
      session.scores[guestId] = 0;
      if (!session.answers) session.answers = {};
      session.answers[guestId] = {};
      if (!session.playerProgress) session.playerProgress = {};
      session.playerProgress[guestId] = { isFinished: false };

      saveDb(state);
      return session;
    },

    recordAnswer(
      sessionId: string,
      userId: string,
      questionId: string,
      answerIndex: number,
      timeRemaining?: number
    ): {
      session: GameSessionEntity | null;
      isCorrect: boolean;
      correctIndex?: number;
      explanation?: string;
      pointsAwarded: number;
      alreadyAnswered?: boolean;
    } {
      const state = ensureDbFile();
      const session = state.gameSessions.find((s) => s.id === sessionId);
      if (!session) {
        return { session: null, isCorrect: false, pointsAwarded: 0 };
      }

      const question = session.questions.find((q) => q.id === questionId);
      if (!question) {
        return { session, isCorrect: false, pointsAwarded: 0 };
      }

      // Initialize structures
      if (!session.answers) session.answers = {};
      if (!session.answers[userId]) session.answers[userId] = {};

      // Anti-cheat / duplicate-submission protection:
      // If user already submitted an answer for this question, reject re-scoring
      if (session.answers[userId][questionId]) {
        const prev = session.answers[userId][questionId];
        return {
          session,
          isCorrect: prev.isCorrect,
          correctIndex: question.correctIndex,
          explanation: question.explanation,
          pointsAwarded: 0,
          alreadyAnswered: true,
        };
      }

      // Server-authoritative scoring & time validation
      // Valid answer within 15-second timer
      const isCorrect = answerIndex >= 0 && question.correctIndex === answerIndex;
      let points = 0;

      if (isCorrect) {
        // Base points: 100
        const basePoints = 100;
        // Time bonus: up to +45 points for fast accurate answers (15s timer)
        const bonus =
          timeRemaining && timeRemaining > 0 && timeRemaining <= 15
            ? Math.floor(timeRemaining * 3)
            : 0;
        points = basePoints + bonus;
      }

      // Record answer
      session.answers[userId][questionId] = {
        answerIndex,
        isCorrect,
        pointsAwarded: points,
        timeRemaining: timeRemaining ?? 0,
        answeredAt: new Date().toISOString(),
      };

      session.scores[userId] = (session.scores[userId] || 0) + points;

      saveDb(state);
      return {
        session,
        isCorrect,
        correctIndex: question.correctIndex,
        explanation: question.explanation,
        pointsAwarded: points,
        alreadyAnswered: false,
      };
    },

    finishSession(sessionId: string, userId?: string): GameSessionEntity | null {
      const state = ensureDbFile();
      const session = state.gameSessions.find((s) => s.id === sessionId);
      if (!session) return null;

      if (!session.playerProgress) session.playerProgress = {};
      if (userId) {
        session.playerProgress[userId] = {
          isFinished: true,
          finishedAt: new Date().toISOString(),
        };
      }

      // Check whether session is fully completed
      let shouldComplete = false;
      if (!userId || session.mode === "quick") {
        shouldComplete = true;
      } else if (session.mode === "battle") {
        // In battle mode: if both host and guest finished (or guest not set)
        const hostFinished = session.playerProgress[session.hostId]?.isFinished;
        const guestFinished = session.guestId
          ? session.playerProgress[session.guestId]?.isFinished
          : true;
        if (hostFinished && guestFinished) {
          shouldComplete = true;
        } else if (!session.guestId) {
          shouldComplete = true;
        }
      }

      if (shouldComplete) {
        session.status = "completed";
        session.completedAt = new Date().toISOString();

        // Determine winner
        const hostScore = session.scores[session.hostId] || 0;
        const guestScore = session.guestId ? session.scores[session.guestId] || 0 : -1;

        if (session.mode === "quick" || !session.guestId) {
          session.winnerId = session.hostId;
          const earnedXp = Math.max(50, Math.round(hostScore * 0.3));
          awardXPInternal(
            state,
            session.hostId,
            earnedXp,
            `Completed Quick Game session: ${session.id}`,
            `xp_game_quick_${session.id}_${session.hostId}`
          );
          recordCalendarActivityInternal(state, session.hostId);
        } else {
          // 1v1 Battle comparison
          if (hostScore > guestScore) {
            session.winnerId = session.hostId;
            awardXPInternal(
              state,
              session.hostId,
              150,
              `Won 1v1 Battle Game (${session.id})`,
              `xp_game_winner_${session.id}_${session.hostId}`
            );
            awardXPInternal(
              state,
              session.guestId,
              50,
              `Participated in 1v1 Battle Game (${session.id})`,
              `xp_game_runnerup_${session.id}_${session.guestId}`
            );
            unlockAchievementInternal(state, session.hostId, "BATTLE_CHAMP");
          } else if (guestScore > hostScore) {
            session.winnerId = session.guestId;
            awardXPInternal(
              state,
              session.guestId,
              150,
              `Won 1v1 Battle Game (${session.id})`,
              `xp_game_winner_${session.id}_${session.guestId}`
            );
            awardXPInternal(
              state,
              session.hostId,
              50,
              `Participated in 1v1 Battle Game (${session.id})`,
              `xp_game_runnerup_${session.id}_${session.hostId}`
            );
            unlockAchievementInternal(state, session.guestId, "BATTLE_CHAMP");
          } else {
            // Draw / Tie
            session.winnerId = undefined;
            awardXPInternal(
              state,
              session.hostId,
              75,
              `Tied 1v1 Battle Game (${session.id})`,
              `xp_game_tie_${session.id}_${session.hostId}`
            );
            awardXPInternal(
              state,
              session.guestId,
              75,
              `Tied 1v1 Battle Game (${session.id})`,
              `xp_game_tie_${session.id}_${session.guestId}`
            );
          }
          recordCalendarActivityInternal(state, session.hostId);
          if (session.guestId) {
            recordCalendarActivityInternal(state, session.guestId);
          }
        }
      }

      saveDb(state);
      return session;
    },
    getLeaderboard(options?: { role?: string; sortBy?: "xp" | "streak"; limit?: number }) {
      const state = ensureDbFile();
      return getLeaderboardInternal(state, options);
    },
  },

  // SIMULATIONS
  simulations: {
    getUserRuns(userId: string): SimulationRunEntity[] {
      return ensureDbFile().simulationRuns.filter((r) => r.userId === userId);
    },
    getRunById(runId: string): SimulationRunEntity | undefined {
      return ensureDbFile().simulationRuns.find((r) => r.id === runId);
    },
    startRun(
      userId: string,
      scenarioType: SimulationRunEntity["scenarioType"],
      initialBalance: number,
      parameters: Record<string, any> = {}
    ): SimulationRunEntity {
      const state = ensureDbFile();
      const run: SimulationRunEntity = {
        id: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        scenarioType,
        virtualBalance: initialBalance,
        netWorth: initialBalance,
        currentPeriod: 1,
        status: "active",
        history: [
          {
            period: 1,
            action: "SIMULATION_INITIALIZED",
            amount: initialBalance,
            balanceAfter: initialBalance,
            outcomeMessage: "Simulation scenario started with virtual capital.",
          },
        ],
        parameters,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.simulationRuns.push(run);
      saveDb(state);
      return run;
    },
    recordStep(
      runId: string,
      action: string,
      amountDelta: number,
      outcomeMessage: string,
      isCompleted = false
    ): SimulationRunEntity | null {
      const state = ensureDbFile();
      const run = state.simulationRuns.find((r) => r.id === runId);
      if (!run) return null;

      run.virtualBalance = Math.max(0, run.virtualBalance + amountDelta);
      run.netWorth = Math.max(0, run.netWorth + amountDelta);
      run.currentPeriod += 1;
      if (isCompleted) run.status = "completed";

      run.history.push({
        period: run.currentPeriod,
        action,
        amount: amountDelta,
        balanceAfter: run.virtualBalance,
        outcomeMessage,
      });

      run.updatedAt = new Date().toISOString();

      // Award XP & achievements idempotently if completed
      if (isCompleted) {
        awardXPInternal(
          state,
          run.userId,
          150,
          `Completed simulation: ${run.scenarioType}`,
          `xp_sim_completion_${run.id}_${run.userId}`
        );
        unlockAchievementInternal(state, run.userId, "SIM_COMPLETED");
        recordCalendarActivityInternal(state, run.userId);
      }

      saveDb(state);
      return run;
    },
  },

  // CLASSROOMS & EDUCATORS
  classrooms: {
    getByEducator(educatorId: string): ClassroomEntity[] {
      return ensureDbFile().classrooms.filter((c) => c.educatorId === educatorId);
    },
    getByStudent(studentId: string): ClassroomEntity[] {
      return ensureDbFile().classrooms.filter((c) => c.studentIds.includes(studentId));
    },
    getById(id: string): ClassroomEntity | undefined {
      return ensureDbFile().classrooms.find((c) => c.id === id);
    },
    getByCode(code: string): ClassroomEntity | undefined {
      return ensureDbFile().classrooms.find((c) => c.code === code.toUpperCase());
    },
    create(data: Omit<ClassroomEntity, "id" | "createdAt" | "studentIds">): ClassroomEntity {
      const state = ensureDbFile();
      const classroom: ClassroomEntity = {
        ...data,
        id: `cls_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        code: data.code.toUpperCase(),
        studentIds: [],
        createdAt: new Date().toISOString(),
      };
      state.classrooms.push(classroom);
      
      // Audit log
      state.auditLogs.push({
        id: `aud_${Date.now()}`,
        actorId: data.educatorId,
        actorName: data.educatorName,
        action: "CLASSROOM_CREATED",
        target: classroom.id,
        metadata: { name: data.name, code: classroom.code },
        timestamp: new Date().toISOString(),
      });

      saveDb(state);
      return classroom;
    },
    enrollStudent(code: string, studentId: string): ClassroomEntity | null {
      const state = ensureDbFile();
      const classroom = state.classrooms.find((c) => c.code === code.toUpperCase());
      if (!classroom) return null;

      if (!classroom.studentIds.includes(studentId)) {
        classroom.studentIds.push(studentId);
        
        // Award CLASSROOM_SCHOLAR achievement idempotently
        unlockAchievementInternal(state, studentId, "CLASSROOM_SCHOLAR");
        recordCalendarActivityInternal(state, studentId);

        saveDb(state);
      }
      return classroom;
    },
    getAssignments(classroomId: string): AssignmentEntity[] {
      return ensureDbFile().assignments.filter((a) => a.classroomId === classroomId);
    },
    createAssignment(data: Omit<AssignmentEntity, "id" | "createdAt">): AssignmentEntity {
      const state = ensureDbFile();
      const assignment: AssignmentEntity = {
        ...data,
        id: `asg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      state.assignments.push(assignment);
      saveDb(state);
      return assignment;
    },
    getSubmissions(classroomId: string): AssignmentSubmissionEntity[] {
      return ensureDbFile().assignmentSubmissions.filter((s) => s.classroomId === classroomId);
    },
    recordSubmission(data: Omit<AssignmentSubmissionEntity, "id" | "completedAt">): AssignmentSubmissionEntity {
      const state = ensureDbFile();
      const existing = state.assignmentSubmissions.find(
        (s) => s.assignmentId === data.assignmentId && s.studentId === data.studentId
      );
      if (existing) {
        existing.score = Math.max(existing.score, data.score);
        existing.completedAt = new Date().toISOString();
        saveDb(state);
        return existing;
      }
      const submission: AssignmentSubmissionEntity = {
        ...data,
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        completedAt: new Date().toISOString(),
      };
      state.assignmentSubmissions.push(submission);
      saveDb(state);
      return submission;
    },
  },

  // COMMUNITY & DISCUSSIONS
  community: {
    getPosts(category?: string, query?: string): CommunityPostEntity[] {
      const posts = ensureDbFile().communityPosts;
      let filtered = [...posts];
      if (category && category !== "All") {
        filtered = filtered.filter((p) => p.category === category);
      }
      if (query && query.trim()) {
        const q = query.toLowerCase().trim();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q) ||
            p.authorName.toLowerCase().includes(q)
        );
      }
      return filtered.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.createdAt.localeCompare(a.createdAt);
      });
    },
    getPostById(id: string): CommunityPostEntity | undefined {
      return ensureDbFile().communityPosts.find((p) => p.id === id);
    },
    createPost(data: Omit<CommunityPostEntity, "id" | "likes" | "likedBy" | "commentsCount" | "createdAt">): CommunityPostEntity {
      const state = ensureDbFile();
      const post: CommunityPostEntity = {
        ...data,
        id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        likes: 0,
        likedBy: [],
        commentsCount: 0,
        createdAt: new Date().toISOString(),
      };
      state.communityPosts.unshift(post);
      
      // Award XP for contributing to community
      const user = state.users.find((u) => u.id === data.userId);
      if (user) user.xp += 25;

      saveDb(state);
      return post;
    },
    deletePost(postId: string, userId: string, userRole: string): boolean {
      const state = ensureDbFile();
      const postIndex = state.communityPosts.findIndex((p) => p.id === postId);
      if (postIndex === -1) return false;
      const post = state.communityPosts[postIndex];

      const canDelete =
        post.userId === userId ||
        userRole === "platform_admin" ||
        userRole === "institution_admin";
      if (!canDelete) return false;

      state.communityPosts.splice(postIndex, 1);
      state.communityComments = state.communityComments.filter((c) => c.postId !== postId);

      if (userRole === "platform_admin" || userRole === "institution_admin") {
        state.auditLogs.unshift({
          id: `aud_${Date.now()}`,
          actorId: userId,
          actorName: userRole,
          action: "COMMUNITY_POST_DELETED",
          target: postId,
          metadata: { postTitle: post.title, originalAuthor: post.authorName },
          timestamp: new Date().toISOString(),
        });
      }

      saveDb(state);
      return true;
    },
    toggleLike(postId: string, userId: string): { likes: number; hasLiked: boolean } {
      const state = ensureDbFile();
      const post = state.communityPosts.find((p) => p.id === postId);
      if (!post) return { likes: 0, hasLiked: false };

      const idx = post.likedBy.indexOf(userId);
      let hasLiked = false;
      if (idx >= 0) {
        post.likedBy.splice(idx, 1);
        post.likes = Math.max(0, post.likes - 1);
      } else {
        post.likedBy.push(userId);
        post.likes += 1;
        hasLiked = true;
      }

      saveDb(state);
      return { likes: post.likes, hasLiked };
    },
    getComments(postId: string): CommunityCommentEntity[] {
      return ensureDbFile().communityComments
        .filter((c) => c.postId === postId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
    addComment(data: Omit<CommunityCommentEntity, "id" | "createdAt">): CommunityCommentEntity {
      const state = ensureDbFile();
      const comment: CommunityCommentEntity = {
        ...data,
        id: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      state.communityComments.push(comment);

      const post = state.communityPosts.find((p) => p.id === data.postId);
      if (post) post.commentsCount += 1;

      // Award XP for engaging in constructive discussion (+10 XP)
      const user = state.users.find((u) => u.id === data.userId);
      if (user) user.xp += 10;

      saveDb(state);
      return comment;
    },
    deleteComment(commentId: string, userId: string, userRole: string): boolean {
      const state = ensureDbFile();
      const commentIndex = state.communityComments.findIndex((c) => c.id === commentId);
      if (commentIndex === -1) return false;
      const comment = state.communityComments[commentIndex];

      const canDelete =
        comment.userId === userId ||
        userRole === "platform_admin" ||
        userRole === "institution_admin";
      if (!canDelete) return false;

      const postId = comment.postId;
      const repliesCount = state.communityComments.filter((c) => c.parentId === commentId).length;
      state.communityComments = state.communityComments.filter(
        (c) => c.id !== commentId && c.parentId !== commentId
      );

      const post = state.communityPosts.find((p) => p.id === postId);
      if (post) {
        post.commentsCount = Math.max(0, post.commentsCount - (1 + repliesCount));
      }

      if (userRole === "platform_admin" || userRole === "institution_admin") {
        state.auditLogs.unshift({
          id: `aud_${Date.now()}`,
          actorId: userId,
          actorName: userRole,
          action: "COMMUNITY_COMMENT_DELETED",
          target: commentId,
          metadata: { postId, authorName: comment.authorName },
          timestamp: new Date().toISOString(),
        });
      }

      saveDb(state);
      return true;
    },
    createReport(data: Omit<ModerationReportEntity, "id" | "status" | "createdAt">): ModerationReportEntity {
      const state = ensureDbFile();
      const report: ModerationReportEntity = {
        ...data,
        id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      state.moderationReports.unshift(report);
      saveDb(state);
      return report;
    },
  },

  // ADMIN, MODERATION & AUDIT
  admin: {
    getModerationQueue(): ModerationReportEntity[] {
      return ensureDbFile().moderationReports;
    },
    resolveReport(reportId: string, status: "resolved" | "dismissed", notes: string, adminId: string, adminName: string): ModerationReportEntity | null {
      const state = ensureDbFile();
      const report = state.moderationReports.find((r) => r.id === reportId);
      if (!report) return null;

      report.status = status;
      report.resolutionNotes = notes;
      report.resolvedAt = new Date().toISOString();

      state.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorId: adminId,
        actorName: adminName,
        action: "MODERATION_RESOLVED",
        target: reportId,
        metadata: { decision: status, notes },
        timestamp: new Date().toISOString(),
      });

      saveDb(state);
      return report;
    },
    updateUserRole(userId: string, newRole: UserEntity["role"], adminId: string, adminName: string): UserEntity | null {
      const state = ensureDbFile();
      const user = state.users.find((u) => u.id === userId);
      if (!user) return null;

      const previousRole = user.role;
      user.role = newRole;

      state.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        actorId: adminId,
        actorName: adminName,
        action: "ROLE_MODIFIED",
        target: userId,
        metadata: { previousRole, newRole },
        timestamp: new Date().toISOString(),
      });

      saveDb(state);
      return user;
    },
    getAuditLogs(): AuditLogEntity[] {
      return ensureDbFile().auditLogs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    },
    getPlatformMetrics() {
      const state = ensureDbFile();
      return {
        totalUsers: state.users.length,
        studentsCount: state.users.filter((u) => u.role === "student").length,
        youngProsCount: state.users.filter((u) => u.role === "young_professional").length,
        educatorsCount: state.users.filter((u) => u.role === "educator").length,
        coursesCount: state.courses.length,
        lessonsCount: state.lessons.length,
        classroomsCount: state.classrooms.length,
        completedLessonsCount: state.progress.filter((p) => p.completed).length,
        activeSimulationsCount: state.simulationRuns.length,
        communityPostsCount: state.communityPosts.length,
        pendingReportsCount: state.moderationReports.filter((r) => r.status === "pending").length,
      };
    },
  },

  // GAMIFICATION & XP ENGINE
  gamification: {
    awardXP(userId: string, amount: number, reason: string, idempotencyKey: string) {
      const state = ensureDbFile();
      const res = awardXPInternal(state, userId, amount, reason, idempotencyKey);
      saveDb(state);
      return res;
    },
    unlockAchievement(userId: string, achievementCode: string) {
      const state = ensureDbFile();
      const res = unlockAchievementInternal(state, userId, achievementCode);
      saveDb(state);
      return res;
    },
    recordCalendarActivity(userId: string, referenceDateStr?: string) {
      const state = ensureDbFile();
      const res = recordCalendarActivityInternal(state, userId, referenceDateStr);
      saveDb(state);
      return res;
    },
    getLeaderboard(options?: { role?: string; sortBy?: "xp" | "streak"; limit?: number }) {
      const state = ensureDbFile();
      return getLeaderboardInternal(state, options);
    },
    getUserStats(userId: string) {
      const state = ensureDbFile();
      const user = state.users.find((u) => u.id === userId);
      const userAchs = state.userAchievements.filter((ua) => ua.userId === userId);
      const userEvents = state.xpEvents.filter((e) => e.userId === userId);
      return {
        user,
        level: user ? calculateLevel(user.xp) : null,
        achievements: userAchs,
        xpEvents: userEvents,
      };
    },
    getLevel(xp: number) {
      return calculateLevel(xp);
    },
  },
};
