import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { db } from "../../src/lib/db/index.ts";

test("Database Persistence: auto-seeds initial data correctly", () => {
  const users = db.users.getAll();
  assert.ok(users.length >= 5, "Must have at least 5 demo users seeded");

  const student = db.users.getByEmail("alex.student@fingrow.dev");
  assert.ok(student !== undefined);
  assert.equal(student?.role, "student");

  const educator = db.users.getByEmail("sarah.teacher@fingrow.dev");
  assert.ok(educator !== undefined);
  assert.equal(educator?.role, "educator");

  const admin = db.users.getByEmail("admin@fingrow.dev");
  assert.ok(admin !== undefined);
  assert.equal(admin?.role, "platform_admin");

  const courses = db.courses.getAll();
  assert.ok(courses.length >= 8, "Must have 8 comprehensive financial courses");
});

test("Curriculum & Lessons: each course has ordered lessons and knowledge checks", () => {
  const stockCourse = db.courses.getBySlug("stock-market-fundamentals");
  assert.ok(stockCourse !== undefined);

  const lessons = db.lessons.getByCourseSlug("stock-market-fundamentals");
  assert.ok(lessons.length >= 2, "Stock course must have lessons");

  const firstLesson = lessons[0];
  assert.equal(firstLesson.slug, "what-is-a-stock");
  assert.ok(firstLesson.quiz.length >= 2, "Lesson must have multiple quiz questions");
  assert.ok(firstLesson.quiz[0].explanation.length > 10, "Quiz questions must include explanations");
});

test("Idempotent Progress & XP: duplicate completions do not double award XP", () => {
  const testUserId = "usr_student_alex";
  const userBefore = db.users.getById(testUserId);
  const initialXp = userBefore?.xp || 0;
  const testLessonSlug = `order-books-${Date.now()}`;

  // 1st completion
  const res1 = db.progress.recordLessonCompletion(
    testUserId,
    "stock-market-fundamentals",
    testLessonSlug,
    100
  );

  assert.ok(res1.awardedXp > 0, "First completion must award XP");
  const userAfter1 = db.users.getById(testUserId);
  assert.ok(userAfter1!.xp > initialXp, "User XP must increase");

  const currentXp = userAfter1!.xp;

  // 2nd duplicate completion of identical lesson
  const res2 = db.progress.recordLessonCompletion(
    testUserId,
    "stock-market-fundamentals",
    testLessonSlug,
    100
  );

  assert.equal(res2.awardedXp, 0, "Duplicate completion must award 0 XP (idempotency key protection)");
  const userAfter2 = db.users.getById(testUserId);
  assert.equal(userAfter2!.xp, currentXp, "User XP must remain identical on duplicate submission");
});

test("Classrooms & Join Codes: teacher creates class, student enrolls with unique code", () => {
  const teacherId = "usr_edu_sarah";
  const uniqueCode = `TEST-${Date.now().toString().slice(-4)}`;

  const createdClass = db.classrooms.create({
    code: uniqueCode,
    name: "Economics 101 Test Group",
    subject: "Macroeconomics",
    educatorId: teacherId,
    educatorName: "Sarah Jenkins",
    institution: "Oakridge High School",
  });

  assert.equal(createdClass.code, uniqueCode);
  assert.equal(createdClass.educatorId, teacherId);

  // Student joins with code
  const studentId = "usr_student_alex";
  const enrolled = db.classrooms.enrollStudent(uniqueCode, studentId);

  assert.ok(enrolled !== null);
  assert.ok(enrolled!.studentIds.includes(studentId), "Student must be in classroom roster");

  // Create an assignment
  const assignment = db.classrooms.createAssignment({
    classroomId: createdClass.id,
    title: "Complete Order Books Quiz",
    courseSlug: "stock-market-fundamentals",
    lessonSlug: "how-order-books-work",
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
  });

  assert.equal(assignment.classroomId, createdClass.id);
  const classAssignments = db.classrooms.getAssignments(createdClass.id);
  assert.ok(classAssignments.some((a) => a.id === assignment.id));
});

test("Financial Simulations: runs start with virtual capital and record audit step deltas", () => {
  const userId = "usr_pro_priya";
  const run = db.simulations.startRun(userId, "first_salary", 5000, {
    monthlySalary: 5000,
  });

  assert.equal(run.scenarioType, "first_salary");
  assert.equal(run.virtualBalance, 5000);
  assert.equal(run.currentPeriod, 1);

  // Record an emergency repair shock step
  const updatedRun = db.simulations.recordStep(
    run.id,
    "EMERGENCY_REPAIR",
    -800,
    "Paid $800 out of pocket for unexpected brake replacement",
    false
  );

  assert.ok(updatedRun !== null);
  assert.equal(updatedRun!.virtualBalance, 4200);
  assert.equal(updatedRun!.currentPeriod, 2);
  assert.equal(updatedRun!.history.length, 2);
});

test("Multiplayer Games Engine: creates sessions, accepts answers, and calculates winner", () => {
  const hostId = "usr_student_alex";
  const session = db.games.createSession(hostId, "Alex Chen", "battle");

  assert.ok(session.joinCode.length === 6, "Join code must be 6 alphanumeric chars");
  assert.equal(session.status, "waiting");
  assert.equal(session.questions.length, 5);

  // Guest joins
  const guestId = "usr_pro_priya";
  const joined = db.games.joinSession(session.joinCode, guestId, "Priya Sharma");
  assert.ok(joined !== null);
  assert.equal(joined!.status, "in_progress");
  assert.equal(joined!.guestId, guestId);

  // Host submits correct answer for Q1
  const q1 = session.questions[0];
  const ansResult = db.games.recordAnswer(session.id, hostId, q1.id, q1.correctIndex);
  assert.ok(ansResult.isCorrect);
  assert.equal(ansResult.pointsAwarded, 100);

  // Finish session
  const finished = db.games.finishSession(session.id);
  assert.equal(finished!.status, "completed");
  assert.equal(finished!.winnerId, hostId);
});

test("Community & Moderation: creates discussions, comments, and resolves report queue", () => {
  const authorId = "usr_student_alex";
  const post = db.community.createPost({
    userId: authorId,
    authorName: "Alex Chen",
    authorRole: "Student",
    category: "Personal Finance",
    title: "How to budget on a part-time student income?",
    content: "Balancing textbook fees and living costs is tricky. How do you all split your expenses?",
  });

  assert.ok(post.id.startsWith("post_"));

  // Add comment
  const comment = db.community.addComment({
    postId: post.id,
    userId: "usr_pro_priya",
    authorName: "Priya Sharma",
    authorRole: "Young Professional",
    content: "I recommend tracking daily expenses with the 50/30/20 framework!",
  });

  assert.equal(comment.postId, post.id);

  // Like post
  const likeResult = db.community.toggleLike(post.id, "usr_pro_priya");
  assert.equal(likeResult.hasLiked, true);
  assert.equal(likeResult.likes, 1);

  // Flag report
  const report = db.community.createReport({
    targetType: "post",
    targetId: post.id,
    reporterUserId: "usr_edu_sarah",
    reporterName: "Sarah Jenkins",
    reason: "Testing moderation resolution pipeline",
  });

  assert.equal(report.status, "pending");

  // Admin resolves report
  const resolved = db.admin.resolveReport(
    report.id,
    "resolved",
    "Inspected by admin and approved",
    "usr_admin_root",
    "FinGrow Platform Admin"
  );

  assert.ok(resolved !== null);
  assert.equal(resolved!.status, "resolved");

  // Verify audit log exists
  const auditLogs = db.admin.getAuditLogs();
  assert.ok(auditLogs.some((l) => l.action === "MODERATION_RESOLVED" && l.target === report.id));
});

