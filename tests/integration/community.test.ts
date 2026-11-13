import test from "node:test";
import assert from "node:assert/strict";
import { db } from "../../src/lib/db/index.ts";
import {
  checkCommunityContentSafety,
  sanitizePublicAuthor,
} from "../../src/lib/community-safety.ts";

test("Community Safety & PII Guard: prevents accidental leakage of student emails, phones, and account numbers", () => {
  // Email leak attempt
  const emailAttempt = checkCommunityContentSafety(
    "Hey Alex, reach out to me at student.alex@university.edu for the notes!"
  );
  assert.equal(emailAttempt.isSafe, false);
  assert.match(emailAttempt.reason || "", /Detected email address/);

  // Phone number leak attempt
  const phoneAttempt = checkCommunityContentSafety(
    "Call my cell 555-234-5678 if you have questions about the simulation"
  );
  assert.equal(phoneAttempt.isSafe, false);
  assert.match(phoneAttempt.reason || "", /Detected phone number/);

  // SSN or financial account number leak attempt
  const ssnAttempt = checkCommunityContentSafety(
    "My student account verification number is 123-45-6789"
  );
  assert.equal(ssnAttempt.isSafe, false);
  assert.match(ssnAttempt.reason || "", /Detected potential account or ID number/);

  // Safe educational discussion
  const safeDiscussion = checkCommunityContentSafety(
    "I found that dollar-cost averaging into a broad index fund lowered volatility significantly."
  );
  assert.equal(safeDiscussion.isSafe, true);

  // Public author sanitization
  const sanitized = sanitizePublicAuthor({
    userId: "usr_student_alex",
    name: "Alex Chen",
    role: "student",
    email: "alex.student@fingrow.dev",
  });
  assert.equal(sanitized.userId, "usr_student_alex");
  assert.equal(sanitized.name, "Alex Chen");
  assert.equal(sanitized.role, "student");
  assert.equal((sanitized as any).email, undefined, "Email must never be exposed publicly");
});

test("Community Post Lifecycle: creation, XP reward, search, and category filtering", () => {
  const authorId = "usr_student_alex";
  const userBefore = db.users.getById(authorId);
  const initialXp = userBefore?.xp || 0;

  const testTitle = `Understanding Compound Growth in High School [${Date.now()}]`;
  const post = db.community.createPost({
    userId: authorId,
    authorName: "Alex Chen",
    authorRole: "Student",
    category: "Personal Finance",
    title: testTitle,
    content:
      "Starting an emergency fund with 3 months of living expenses gave me tremendous peace of mind.",
  });

  assert.ok(post.id.startsWith("post_"));
  assert.equal(post.title, testTitle);
  assert.equal(post.category, "Personal Finance");
  assert.equal(post.likes, 0);
  assert.equal(post.commentsCount, 0);

  // Verify XP award (+25 XP for contributing to community)
  const userAfter = db.users.getById(authorId);
  assert.equal(userAfter!.xp, initialXp + 25);

  // Verify category filter
  const personalFinancePosts = db.community.getPosts("Personal Finance");
  assert.ok(personalFinancePosts.some((p) => p.id === post.id));

  const stockPosts = db.community.getPosts("Stock Investing");
  assert.ok(!stockPosts.some((p) => p.id === post.id));

  // Verify search query filter
  const searchResults = db.community.getPosts("All", "emergency fund");
  assert.ok(searchResults.some((p) => p.id === post.id));

  const noResults = db.community.getPosts("All", "completely_unrelated_query_xyz");
  assert.equal(noResults.length, 0);
});

test("Threaded Discussions: top-level comments and nested replies with XP awards", () => {
  const post = db.community.createPost({
    userId: "usr_pro_priya",
    authorName: "Priya Sharma",
    authorRole: "Young Professional",
    category: "Stock Investing",
    title: `Threaded Discussion Test ${Date.now()}`,
    content: "What is your philosophy on emergency fund sizing?",
  });

  const studentUser = db.users.getById("usr_student_alex");
  const studentInitialXp = studentUser?.xp || 0;

  // 1. Top-level comment
  const rootComment = db.community.addComment({
    postId: post.id,
    userId: "usr_student_alex",
    authorName: "Alex Chen",
    authorRole: "Student",
    content: "I keep 3 months in a high-yield savings account.",
  });

  assert.ok(rootComment.id.startsWith("cmt_"));
  assert.equal(rootComment.parentId, undefined);

  // Check XP award (+10 XP for comment)
  const studentAfter = db.users.getById("usr_student_alex");
  assert.equal(studentAfter!.xp, studentInitialXp + 10);

  // 2. Threaded reply referencing rootComment.id as parentId
  const replyComment = db.community.addComment({
    postId: post.id,
    parentId: rootComment.id,
    userId: "usr_edu_sarah",
    authorName: "Sarah Jenkins",
    authorRole: "Educator",
    content: "Great rule of thumb Alex. 3 to 6 months covers most emergencies.",
  });

  assert.ok(replyComment.id.startsWith("cmt_"));
  assert.equal(replyComment.parentId, rootComment.id);

  // Verify post commentsCount updated
  const updatedPost = db.community.getPostById(post.id);
  assert.equal(updatedPost!.commentsCount, 2);

  // Verify comments list
  const postComments = db.community.getComments(post.id);
  assert.equal(postComments.length, 2);
  assert.ok(postComments.some((c) => c.id === rootComment.id));
  assert.ok(postComments.some((c) => c.id === replyComment.id && c.parentId === rootComment.id));
});

test("Dynamic Likes: toggle on, toggle off, and multi-user support", () => {
  const post = db.community.createPost({
    userId: "usr_edu_sarah",
    authorName: "Sarah Jenkins",
    authorRole: "Educator",
    category: "Startups & Business",
    title: `Dynamic Like Test ${Date.now()}`,
    content: "Testing like functionality idempotency and user state.",
  });

  // User 1 likes
  const res1 = db.community.toggleLike(post.id, "usr_student_alex");
  assert.equal(res1.hasLiked, true);
  assert.equal(res1.likes, 1);

  // User 2 likes
  const res2 = db.community.toggleLike(post.id, "usr_pro_priya");
  assert.equal(res2.hasLiked, true);
  assert.equal(res2.likes, 2);

  // User 1 unlikes (toggle off)
  const res3 = db.community.toggleLike(post.id, "usr_student_alex");
  assert.equal(res3.hasLiked, false);
  assert.equal(res3.likes, 1);

  // User 2 unlikes
  const res4 = db.community.toggleLike(post.id, "usr_pro_priya");
  assert.equal(res4.hasLiked, false);
  assert.equal(res4.likes, 0);
});

test("Scam/Spam Reporting: posts and comments can be reported into moderation queue", () => {
  const post = db.community.createPost({
    userId: "usr_student_alex",
    authorName: "Alex Chen",
    authorRole: "Student",
    category: "General",
    title: `Flagging Test Post ${Date.now()}`,
    content: "Sample content to test reporting modal flow.",
  });

  // Report post
  const postReport = db.community.createReport({
    targetType: "post",
    targetId: post.id,
    reporterUserId: "usr_pro_priya",
    reporterName: "Priya Sharma",
    reason: "Suspected spam or promotional link",
    notes: "Appears to contain external unverified links",
  });

  assert.ok(postReport.id.startsWith("rep_"));
  assert.equal(postReport.status, "pending");
  assert.equal(postReport.targetType, "post");
  assert.equal(postReport.targetId, post.id);

  // Create a comment and report the comment
  const comment = db.community.addComment({
    postId: post.id,
    userId: "usr_student_alex",
    authorName: "Alex Chen",
    authorRole: "Student",
    content: "Guaranteed 500% returns join my telegram group!",
  });

  const commentReport = db.community.createReport({
    targetType: "comment",
    targetId: comment.id,
    reporterUserId: "usr_edu_sarah",
    reporterName: "Sarah Jenkins",
    reason: "Misleading or predatory financial scheme / crypto scam",
    notes: "Aggressive crypto scam bot language",
  });

  assert.equal(commentReport.status, "pending");
  assert.equal(commentReport.targetType, "comment");
  assert.equal(commentReport.targetId, comment.id);

  // Admin resolves comment report
  const resolved = db.admin.resolveReport(
    commentReport.id,
    "resolved",
    "Confirmed spam scam, comment flagged for removal",
    "usr_admin_root",
    "Platform Admin"
  );

  assert.ok(resolved !== null);
  assert.equal(resolved!.status, "resolved");
});

test("Moderator & Author Actions: deleting posts and comments with cascade and audit logs", () => {
  // Author creates post
  const authorId = "usr_student_alex";
  const post = db.community.createPost({
    userId: authorId,
    authorName: "Alex Chen",
    authorRole: "Student",
    category: "Personal Finance",
    title: `Post to be deleted ${Date.now()}`,
    content: "This post will be deleted by moderator or author.",
  });

  const rootCmt = db.community.addComment({
    postId: post.id,
    userId: "usr_pro_priya",
    authorName: "Priya Sharma",
    authorRole: "Young Professional",
    content: "Comment 1 on post",
  });

  const childReply = db.community.addComment({
    postId: post.id,
    parentId: rootCmt.id,
    userId: authorId,
    authorName: "Alex Chen",
    authorRole: "Student",
    content: "Child reply on comment 1",
  });

  // Verify deleteComment authorization: unauthorized user cannot delete
  const unauthorizedDelete = db.community.deleteComment(
    rootCmt.id,
    "usr_other_random",
    "student"
  );
  assert.equal(unauthorizedDelete, false, "Unauthorized user cannot delete comment");

  // Comment author or admin can delete comment: deleting root comment also cleans up child replies
  const authorDeleteComment = db.community.deleteComment(
    rootCmt.id,
    "usr_pro_priya",
    "young_professional"
  );
  assert.equal(authorDeleteComment, true, "Author can delete their own comment");

  const remainingComments = db.community.getComments(post.id);
  assert.equal(remainingComments.length, 0, "Root comment and child replies must be removed");

  // Verify deletePost authorization: unauthorized user cannot delete post
  const unauthorizedPostDelete = db.community.deletePost(
    post.id,
    "usr_other_random",
    "student"
  );
  assert.equal(unauthorizedPostDelete, false, "Unauthorized user cannot delete post");

  // Admin can delete post (Moderator action)
  const adminDeletePost = db.community.deletePost(
    post.id,
    "usr_admin_root",
    "platform_admin"
  );
  assert.equal(adminDeletePost, true, "Platform admin can delete discussion");

  // Verify post is gone
  const deletedPostCheck = db.community.getPostById(post.id);
  assert.equal(deletedPostCheck, undefined, "Post should no longer exist");

  // Verify audit log for post deletion
  const auditLogs = db.admin.getAuditLogs();
  assert.ok(
    auditLogs.some(
      (l) => l.action === "COMMUNITY_POST_DELETED" && l.target === post.id
    ),
    "Audit log must record post deletion by moderator"
  );
});
