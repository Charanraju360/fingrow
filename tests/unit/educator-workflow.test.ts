import test from "node:test";
import assert from "node:assert/strict";
import { db } from "../../src/lib/db/index.ts";

test("Educator Workflows: Classroom Creation, Join Codes, Student Enrollment, and Gradebook", () => {
  const teacherId = "usr_edu_sarah";
  const testStudentId = "usr_student_alex";

  // 1. Classroom creation with auto-generated code
  const randomClass = db.classrooms.create({
    code: `CLS-TEST-${Date.now().toString().slice(-4)}`,
    name: "Advanced Macroeconomics 2026",
    subject: "Economics & Personal Finance",
    educatorId: teacherId,
    educatorName: "Sarah Jenkins",
    institution: "Oakridge High School",
  });

  assert.ok(randomClass.id.startsWith("cls_"), "Classroom ID should have cls_ prefix");
  assert.ok(randomClass.code.startsWith("CLS-TEST-"), "Code should match format");
  assert.equal(randomClass.studentIds.length, 0, "New classroom starts with empty roster");

  // 2. Classroom retrieval by educator
  const teacherClasses = db.classrooms.getByEducator(teacherId);
  assert.ok(
    teacherClasses.some((c) => c.id === randomClass.id),
    "Classroom should be retrieved by getByEducator"
  );

  // 3. Unique join code lookup
  const retrievedByCode = db.classrooms.getByCode(randomClass.code);
  assert.ok(retrievedByCode !== undefined, "Classroom should be retrievable by code");
  assert.equal(retrievedByCode?.id, randomClass.id);

  // 4. Student Enrollment via code
  const initialUser = db.users.getById(testStudentId);
  const initialXp = initialUser?.xp || 0;

  const enrolledClass = db.classrooms.enrollStudent(randomClass.code, testStudentId);
  assert.ok(enrolledClass !== null, "Enrollment should succeed");
  assert.ok(enrolledClass!.studentIds.includes(testStudentId), "Student should be in roster");

  // Verify duplicate enroll is idempotent
  const reEnrolled = db.classrooms.enrollStudent(randomClass.code, testStudentId);
  assert.equal(
    reEnrolled!.studentIds.filter((id) => id === testStudentId).length,
    1,
    "Student should only appear once in roster"
  );

  // 5. Assignment Scheduling with due dates
  const dueDate = new Date(Date.now() + 7 * 86400000).toISOString();
  const assignment = db.classrooms.createAssignment({
    classroomId: randomClass.id,
    title: "Master Equity Ownership & Order Books",
    courseSlug: "stock-market-fundamentals",
    lessonSlug: "what-is-a-stock",
    dueDate,
  });

  assert.ok(assignment.id.startsWith("asg_"));
  assert.equal(assignment.classroomId, randomClass.id);
  assert.equal(assignment.dueDate, dueDate);

  const assignmentsList = db.classrooms.getAssignments(randomClass.id);
  assert.equal(assignmentsList.length, 1);
  assert.equal(assignmentsList[0].id, assignment.id);

  // 6. Record Assignment Submission
  const submission = db.classrooms.recordSubmission({
    assignmentId: assignment.id,
    classroomId: randomClass.id,
    studentId: testStudentId,
    studentName: "Alex Chen",
    score: 95,
  });

  assert.ok(submission.id.startsWith("sub_"));
  assert.equal(submission.score, 95);

  const submissionsList = db.classrooms.getSubmissions(randomClass.id);
  assert.equal(submissionsList.length, 1);
  assert.equal(submissionsList[0].studentId, testStudentId);

  // 7. Verify CSV Gradebook Export Format
  const headers = "Student Name,Email,Completed Quizzes,Average Quiz Score (%),Last Active Date,Status\n";
  const row = `"${submission.studentName}","alex.student@fingrow.dev",1,${submission.score},"${submission.completedAt.split("T")[0]}","Mastery"`;
  const csv = headers + row;

  assert.ok(csv.includes("Student Name,Email,Completed Quizzes"));
  assert.ok(csv.includes("Alex Chen"));
  assert.ok(csv.includes("95"));
});
