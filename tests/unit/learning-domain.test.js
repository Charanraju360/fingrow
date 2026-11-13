import test from "node:test";
import assert from "node:assert/strict";
import { db } from "../../src/lib/db/index.ts";

test("FinGrow Learning Domain: 5 Foundations + Personal Finance, EBITDA, and Side Hustles exist", () => {
  const courses = db.courses.getAll();
  assert.ok(courses.length >= 8, `Expected at least 8 courses, found ${courses.length}`);

  const requiredSlugs = [
    // 5 FinGrow Foundations
    "stock-market-fundamentals",
    "mutual-funds-and-sips",
    "risk-and-diversification",
    "inflation-and-compound-interest",
    "credit-and-debit-mastery",
    // Personal Finance, EBITDA, Side Hustles
    "personal-finance-and-budgeting",
    "business-fundamentals-and-ebitda",
    "career-skills-and-side-hustles",
  ];

  for (const slug of requiredSlugs) {
    const course = db.courses.getBySlug(slug);
    assert.ok(course !== undefined, `Course with slug '${slug}' must exist`);
    assert.ok(course.title.length > 3, `Course '${slug}' must have a descriptive title`);
    assert.ok(course.description.length > 10, `Course '${slug}' must have a descriptive summary`);
    assert.ok(course.estimatedMinutes > 0, `Course '${slug}' must have an estimated duration`);
    assert.ok(["Beginner", "Intermediate", "Advanced"].includes(course.level));
  }
});

test("FinGrow Curriculum: Every course has sequential lessons with educational blocks", () => {
  const courses = db.courses.getAll();

  for (const course of courses) {
    const lessons = db.lessons.getByCourseSlug(course.slug);
    assert.ok(
      lessons.length >= 2,
      `Course '${course.slug}' must contain at least 2 micro-lessons, found ${lessons.length}`
    );

    // Verify ordering
    lessons.forEach((lesson, idx) => {
      assert.equal(lesson.order, idx + 1, `Lesson '${lesson.slug}' must be sequentially ordered`);
      assert.ok(lesson.blocks.length >= 2, `Lesson '${lesson.slug}' must contain educational content blocks`);
      assert.ok(lesson.estimatedMinutes > 0);
      assert.ok(lesson.summary.length > 10);
    });
  }
});

test("FinGrow Quiz Engine: Explanations exist for correct and incorrect answers on every question", () => {
  const courses = db.courses.getAll();
  let totalQuestionsCount = 0;

  for (const course of courses) {
    const lessons = db.lessons.getByCourseSlug(course.slug);

    for (const lesson of lessons) {
      assert.ok(
        lesson.quiz.length >= 2,
        `Lesson '${lesson.slug}' must contain at least 2 quiz questions, found ${lesson.quiz.length}`
      );

      for (const q of lesson.quiz) {
        totalQuestionsCount += 1;
        assert.ok(q.id.length > 0, "Question must have an ID");
        assert.ok(q.question.length > 10, `Question '${q.id}' must have prompt text`);
        assert.ok(q.options.length >= 4, `Question '${q.id}' must provide 4 multiple-choice options`);
        assert.ok(
          q.correctIndex >= 0 && q.correctIndex < q.options.length,
          `Question '${q.id}' correctIndex must be within options bounds`
        );

        // Explanations for correct answer
        assert.ok(
          typeof q.explanation === "string" && q.explanation.length > 15,
          `Question '${q.id}' must include a clear explanation of the correct financial concept`
        );

        // Explanations for incorrect choices / misconceptions
        assert.ok(
          typeof q.incorrectExplanation === "string" && q.incorrectExplanation.length > 10,
          `Question '${q.id}' must include an explanation addressing the incorrect misconception`
        );

        // Per-option breakdown explanations
        assert.ok(
          Array.isArray(q.optionExplanations) && q.optionExplanations.length === q.options.length,
          `Question '${q.id}' must have optionExplanations matching each option choice`
        );

        // Ensure each option has its rationale
        q.optionExplanations.forEach((optExp, optIdx) => {
          assert.ok(
            typeof optExp === "string" && optExp.length > 5,
            `Question '${q.id}' option ${optIdx} must have a rationale explanation`
          );
        });
      }
    }
  }

  assert.ok(totalQuestionsCount >= 32, `Expected at least 32 questions across curriculum, found ${totalQuestionsCount}`);
});

test("FinGrow Idempotency: Lesson completion and XP awards are strictly idempotent", () => {
  const testUserId = "usr_student_alex";
  const userBefore = db.users.getById(testUserId);
  assert.ok(userBefore !== undefined);
  const initialXp = userBefore.xp;

  const testCourseSlug = "stock-market-fundamentals";
  const uniqueLessonSlug = `idempotency-test-${Date.now()}`;

  // 1st completion with 70% (passing non-perfect)
  const firstRes = db.progress.recordLessonCompletion(testUserId, testCourseSlug, uniqueLessonSlug, 70);
  assert.equal(firstRes.awardedXp, 50, "First pass must award 50 XP");

  const userAfter1 = db.users.getById(testUserId);
  const xpAfter1 = userAfter1.xp;
  assert.equal(xpAfter1, initialXp + 50);

  // 2nd duplicate submission with identical score (must NOT double-award XP)
  const dupRes = db.progress.recordLessonCompletion(testUserId, testCourseSlug, uniqueLessonSlug, 70);
  assert.equal(dupRes.awardedXp, 0, "Duplicate submission must award 0 XP");

  const userAfterDup = db.users.getById(testUserId);
  assert.equal(userAfterDup.xp, xpAfter1, "User XP must remain unchanged on duplicate submission");

  // Retake with 100% score (upgrades to perfect score +50 XP bonus idempotently)
  const upgradeRes = db.progress.recordLessonCompletion(testUserId, testCourseSlug, uniqueLessonSlug, 100);
  assert.equal(upgradeRes.awardedXp, 50, "Retake upgrade to 100% must award remaining 50 XP");

  const userAfterUpgrade = db.users.getById(testUserId);
  assert.equal(userAfterUpgrade.xp, xpAfter1 + 50);

  // Retake again with 100% (must NOT award any further XP)
  const finalDup = db.progress.recordLessonCompletion(testUserId, testCourseSlug, uniqueLessonSlug, 100);
  assert.equal(finalDup.awardedXp, 0, "Subsequent 100% retake must award 0 XP");

  const userFinal = db.users.getById(testUserId);
  assert.equal(userFinal.xp, userAfterUpgrade.xp, "Final XP must remain exactly capped");
});
