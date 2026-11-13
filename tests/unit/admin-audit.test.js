import test from "node:test";
import assert from "node:assert/strict";
import { db } from "../../src/lib/db/index.ts";

test("Admin Platform Metrics: accurately aggregates platform statistics across all models", () => {
  const metrics = db.admin.getPlatformMetrics();

  assert.ok(typeof metrics.totalUsers === "number" && metrics.totalUsers >= 5, "totalUsers must be >= 5");
  assert.ok(typeof metrics.studentsCount === "number" && metrics.studentsCount >= 1, "studentsCount must be >= 1");
  assert.ok(typeof metrics.educatorsCount === "number" && metrics.educatorsCount >= 1, "educatorsCount must be >= 1");
  assert.ok(typeof metrics.classroomsCount === "number", "classroomsCount must be a number");
  assert.ok(typeof metrics.completedLessonsCount === "number", "completedLessonsCount must be a number");
  assert.ok(typeof metrics.pendingReportsCount === "number", "pendingReportsCount must be a number");

  const allUsers = db.users.getAll();
  assert.equal(metrics.totalUsers, allUsers.length, "totalUsers matches db.users.getAll length");
  assert.equal(
    metrics.studentsCount,
    allUsers.filter((u) => u.role === "student").length,
    "studentsCount matches role filter"
  );
  assert.equal(
    metrics.educatorsCount,
    allUsers.filter((u) => u.role === "educator").length,
    "educatorsCount matches educator role filter"
  );
});

test("Admin Moderation Queue: resolves and dismisses reports, generating immutable audit events", () => {
  // 1. Create a moderation report
  const testReport = db.community.createReport({
    targetType: "post",
    targetId: "post_sample_audit_1",
    reporterUserId: "usr_student_alex",
    reporterName: "Alex Chen",
    reason: "Harmful financial advice violating platform policies",
  });

  assert.equal(testReport.status, "pending", "Initial report status must be pending");

  // 2. Admin resolves the report
  const resolutionNote = "Action taken: content inspected and warning issued.";
  const resolved = db.admin.resolveReport(
    testReport.id,
    "resolved",
    resolutionNote,
    "usr_admin_root",
    "Platform Administrator"
  );

  assert.ok(resolved !== null, "Resolved report returned");
  assert.equal(resolved?.status, "resolved", "Status should be resolved");
  assert.equal(resolved?.resolutionNotes, resolutionNote);
  assert.ok(resolved?.resolvedAt, "Must include resolution timestamp");

  // 3. Verify in audit logs
  const auditLogs = db.admin.getAuditLogs();
  const foundLog = auditLogs.find(
    (l) => l.action === "MODERATION_RESOLVED" && l.target === testReport.id
  );
  assert.ok(foundLog !== undefined, "Audit log for MODERATION_RESOLVED must exist");
  assert.equal(foundLog?.actorName, "Platform Administrator");
  assert.equal(foundLog?.metadata?.decision, "resolved");

  // 4. Create another report and dismiss it
  const report2 = db.community.createReport({
    targetType: "comment",
    targetId: "comment_sample_audit_2",
    reporterUserId: "usr_student_alex",
    reporterName: "Alex Chen",
    reason: "False flag test",
  });

  const dismissNote = "Dismissed: verified compliant with discussion rules.";
  const dismissed = db.admin.resolveReport(
    report2.id,
    "dismissed",
    dismissNote,
    "usr_admin_root",
    "Platform Administrator"
  );

  assert.ok(dismissed !== null);
  assert.equal(dismissed?.status, "dismissed");
  assert.equal(dismissed?.resolutionNotes, dismissNote);

  const dismissLog = db.admin.getAuditLogs().find(
    (l) => l.action === "MODERATION_RESOLVED" && l.target === report2.id
  );
  assert.ok(dismissLog !== undefined);
  assert.equal(dismissLog?.metadata?.decision, "dismissed");
});

test("Admin User Role Promotion: promotes user role and records audit trail with previous and new role", () => {
  // Find a target user
  const student = db.users.getByEmail("alex.student@fingrow.dev");
  assert.ok(student !== undefined, "Target student must exist");
  const originalRole = student.role;

  // Promote to educator
  const updatedUser = db.admin.updateUserRole(
    student.id,
    "educator",
    "usr_admin_root",
    "Platform Administrator"
  );

  assert.ok(updatedUser !== null);
  assert.equal(updatedUser?.role, "educator", "User role must now be educator");

  // Verify in audit logs
  const auditLogs = db.admin.getAuditLogs();
  const promotionLog = auditLogs.find(
    (l) => l.action === "ROLE_MODIFIED" && l.target === student.id
  );
  assert.ok(promotionLog !== undefined, "ROLE_MODIFIED audit log must exist");
  assert.equal(promotionLog?.actorName, "Platform Administrator");
  assert.equal(promotionLog?.metadata?.previousRole, originalRole);
  assert.equal(promotionLog?.metadata?.newRole, "educator");

  // Promote to institution_admin
  const promotedInstAdmin = db.admin.updateUserRole(
    student.id,
    "institution_admin",
    "usr_admin_root",
    "Platform Administrator"
  );
  assert.equal(promotedInstAdmin?.role, "institution_admin");

  // Restore original role
  const restoredUser = db.admin.updateUserRole(
    student.id,
    originalRole,
    "usr_admin_root",
    "Platform Administrator"
  );
  assert.equal(restoredUser?.role, originalRole);
});

test("Admin Audit Trail: logs are ordered chronologically descending (newest first)", () => {
  const logs = db.admin.getAuditLogs();
  assert.ok(logs.length >= 2, "Must have multiple audit logs");

  for (let i = 0; i < logs.length - 1; i++) {
    const cur = new Date(logs[i].timestamp).getTime();
    const next = new Date(logs[i + 1].timestamp).getTime();
    assert.ok(cur >= next, "Logs must be sorted newest first");
  }
});
