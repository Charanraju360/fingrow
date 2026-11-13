"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  Flag,
  Share2,
  CheckCircle2,
  Send,
  Trash2,
  CornerDownRight,
  ShieldAlert,
  AlertTriangle,
  X,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CommunityPostEntity, CommunityCommentEntity } from "@/lib/db/seed-data";
import { checkCommunityContentSafety } from "@/lib/community-safety";

interface PostDetailClientProps {
  post: CommunityPostEntity;
  initialComments: CommunityCommentEntity[];
  initialLiked: boolean;
  session?: any;
}

export function PostDetailClient({
  post,
  initialComments,
  initialLiked,
  session,
}: PostDetailClientProps) {
  const router = useRouter();
  const [likes, setLikes] = useState(post.likes);
  const [hasLiked, setHasLiked] = useState(initialLiked);
  const [comments, setComments] = useState<CommunityCommentEntity[]>(initialComments);
  const [commentText, setCommentText] = useState("");
  const [replyingToComment, setReplyingToComment] = useState<{
    id: string;
    authorName: string;
  } | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Deletion modal state
  const [deletingPost, setDeletingPost] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reporting modal state
  const [reportTarget, setReportTarget] = useState<{
    type: "post" | "comment";
    id: string;
    titleOrSnippet: string;
  } | null>(null);
  const [reportReason, setReportReason] = useState("Suspected spam or promotional link");
  const [reportNotes, setReportNotes] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const canModeratePost =
    session &&
    (session.userId === post.userId ||
      session.role === "platform_admin" ||
      session.role === "institution_admin");

  // Dynamic Likes handler
  async function handleToggleLike() {
    if (!session) {
      alert("Please sign in to like discussions.");
      return;
    }

    // Optimistic UI update
    const previousLikes = likes;
    const previousHasLiked = hasLiked;
    setHasLiked(!hasLiked);
    setLikes(hasLiked ? Math.max(0, likes - 1) : likes + 1);

    try {
      const res = await fetch("/api/community/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });
      const data = await res.json();
      if (data.success) {
        setLikes(data.likes);
        setHasLiked(data.hasLiked);
      } else {
        // Rollback
        setLikes(previousLikes);
        setHasLiked(previousHasLiked);
      }
    } catch (err) {
      console.error("Like toggle failed", err);
      setLikes(previousLikes);
      setHasLiked(previousHasLiked);
    }
  }

  // Add Comment or Threaded Reply handler
  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    setCommentError(null);

    if (!commentText.trim()) return;

    if (!session) {
      alert("Please sign in to join the conversation.");
      return;
    }

    // Student privacy validation: prevent leaking emails or phone numbers
    const safetyCheck = checkCommunityContentSafety(commentText);
    if (!safetyCheck.isSafe) {
      setCommentError(safetyCheck.reason || "Content contains private student contact data.");
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await fetch("/api/community/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          content: commentText.trim(),
          parentId: replyingToComment ? replyingToComment.id : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setComments((prev) => [...prev, data.comment]);
        setCommentText("");
        setReplyingToComment(null);
        router.refresh();
      } else {
        setCommentError(data.error || "Failed to post response");
      }
    } catch (err) {
      console.error("Add comment failed", err);
      setCommentError("Network error. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  }

  // Delete Post handler (Moderator or Author)
  async function handleDeletePost() {
    setDeletingPost(true);
    try {
      const res = await fetch(`/api/community/posts?id=${post.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        router.push("/community");
        router.refresh();
      } else {
        alert(data.error || "Failed to delete discussion");
        setDeletingPost(false);
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      console.error("Delete post error", err);
      alert("Failed to delete discussion");
      setDeletingPost(false);
      setShowDeleteConfirm(false);
    }
  }

  // Delete Comment handler (Moderator or Author)
  async function handleDeleteComment(commentId: string) {
    if (!confirm("Are you sure you want to delete this response?")) return;

    try {
      const res = await fetch(`/api/community/comments?id=${commentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) =>
          prev.filter((c) => c.id !== commentId && c.parentId !== commentId)
        );
        router.refresh();
      } else {
        alert(data.error || "Failed to delete response");
      }
    } catch (err) {
      console.error("Delete comment error", err);
      alert("Network error. Failed to delete response.");
    }
  }

  // Submit Scam/Spam Report
  async function handleSubmitReport() {
    if (!session) {
      alert("Please sign in to report content.");
      return;
    }

    if (!reportTarget) return;

    setSubmittingReport(true);
    try {
      await fetch("/api/community/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: reportTarget.type,
          targetId: reportTarget.id,
          reason: reportReason,
          notes: reportNotes.trim() || undefined,
        }),
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportTarget(null);
        setReportSuccess(false);
        setReportNotes("");
      }, 1800);
    } catch (err) {
      console.error("Report failed", err);
    } finally {
      setSubmittingReport(false);
    }
  }

  // Organize comments into parent threads and replies
  const { topLevelComments, repliesByParentId } = useMemo(() => {
    const topLevel: CommunityCommentEntity[] = [];
    const replies: Record<string, CommunityCommentEntity[]> = {};

    for (const c of comments) {
      if (c.parentId) {
        if (!replies[c.parentId]) replies[c.parentId] = [];
        replies[c.parentId].push(c);
      } else {
        topLevel.push(c);
      }
    }

    return { topLevelComments: topLevel, repliesByParentId: replies };
  }, [comments]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <a
          href="/community"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-fingrow-midnight/60 hover:text-fingrow-emerald transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Discussions</span>
        </a>
      </div>

      {/* Main Discussion Card */}
      <Card className="shadow-finCard border-fingrow-midnight/15 space-y-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-fingrow-midnight/5 pb-4">
          <div className="flex items-center gap-2.5">
            <Badge variant="emerald">{post.category}</Badge>
            <span className="text-xs text-fingrow-midnight/70 font-semibold">
              by <strong>{post.authorName}</strong>{" "}
              <span className="text-fingrow-midnight/50 font-normal">
                ({post.authorRole})
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-fingrow-midnight/40">
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-fingrow-midnight tracking-tight">
          {post.title}
        </h1>

        <div className="text-sm sm:text-base text-fingrow-midnight/80 leading-relaxed whitespace-pre-line">
          {post.content}
        </div>

        {/* Action Controls & Moderator Tools */}
        <div className="pt-4 border-t border-fingrow-midnight/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleLike}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                hasLiked
                  ? "bg-fingrow-emerald text-white shadow-sm"
                  : "bg-fingrow-midnight/5 text-fingrow-midnight/70 hover:bg-fingrow-midnight/10"
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{likes} {likes === 1 ? "Like" : "Likes"}</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById("comment-input-area");
                el?.focus();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-fingrow-midnight/70 hover:bg-fingrow-midnight/5 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-fingrow-midnight/50" />
              <span>{comments.length} Responses</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {canModeratePost && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 text-xs text-fingrow-coral hover:text-red-700 transition-colors font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-50"
                title="Delete discussion"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Post</span>
              </button>
            )}

            <button
              onClick={() =>
                setReportTarget({
                  type: "post",
                  id: post.id,
                  titleOrSnippet: post.title,
                })
              }
              className="inline-flex items-center gap-1.5 text-xs text-fingrow-midnight/50 hover:text-fingrow-coral transition-colors font-medium"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report Post</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-fingrow-midnight/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-fingrow-coral font-bold text-lg">
              <AlertTriangle className="w-5 h-5" />
              <span>Delete Discussion</span>
            </div>
            <p className="text-xs text-fingrow-midnight/70 leading-relaxed">
              Are you sure you want to permanently delete this discussion and all its responses?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deletingPost}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={handleDeletePost}
                isLoading={deletingPost}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Scam / Spam / Abuse Reporting Modal Dialog */}
      {reportTarget && (
        <div className="fixed inset-0 bg-fingrow-midnight/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 relative">
            <button
              onClick={() => setReportTarget(null)}
              className="absolute right-5 top-5 text-fingrow-midnight/40 hover:text-fingrow-midnight"
            >
              <X className="w-4 h-4" />
            </button>

            {reportSuccess ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-fingrow-emerald mx-auto" />
                <h3 className="font-bold text-lg text-fingrow-midnight">
                  Report Submitted
                </h3>
                <p className="text-xs text-fingrow-midnight/60">
                  Thank you for keeping FinGrow safe and educational. Our moderation team has
                  received this report.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-fingrow-midnight font-bold text-lg">
                  <ShieldAlert className="w-5 h-5 text-fingrow-coral" />
                  <span>Report Inappropriate Content</span>
                </div>
                <p className="text-xs text-fingrow-midnight/70">
                  Help us protect our learners and educators from deceptive schemes, spam, and harassment.
                </p>

                <div className="p-2.5 bg-fingrow-midnight/5 rounded-xl text-[11px] text-fingrow-midnight/70 truncate">
                  Reporting {reportTarget.type}: &ldquo;{reportTarget.titleOrSnippet}&rdquo;
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-fingrow-midnight">
                    Select Violation Category
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-fingrow-midnight/20 text-xs text-fingrow-midnight focus:outline-none focus:ring-2 focus:ring-fingrow-coral bg-white"
                  >
                    <option value="Suspected spam or promotional link">Suspected spam or promotional link</option>
                    <option value="Misleading or predatory financial scheme / crypto scam">Misleading or predatory financial scheme / crypto scam</option>
                    <option value="Inappropriate language or harassment">Inappropriate language or harassment</option>
                    <option value="Off-topic or low quality">Off-topic or low quality</option>
                    <option value="Revealing private student or personal information">Revealing private student or personal information</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-fingrow-midnight">
                    Additional Context (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    placeholder="Provide details for the moderator team..."
                    className="w-full px-3 py-2 rounded-xl border border-fingrow-midnight/20 text-xs text-fingrow-midnight focus:outline-none focus:ring-2 focus:ring-fingrow-coral placeholder:text-fingrow-midnight/40"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setReportTarget(null)}
                    disabled={submittingReport}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleSubmitReport}
                    isLoading={submittingReport}
                  >
                    Submit Report
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Responses & Threaded Comments Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-fingrow-midnight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-fingrow-emerald" />
            <span>Responses & Answers ({comments.length})</span>
          </h2>
          <span className="text-xs font-semibold text-fingrow-emerald inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>+10 XP per response</span>
          </span>
        </div>

        {/* Comment input form */}
        <Card className="shadow-sm border-fingrow-midnight/15">
          <CardContent className="pt-5 space-y-3">
            {replyingToComment && (
              <div className="flex items-center justify-between bg-fingrow-emerald/10 text-fingrow-emerald px-3 py-1.5 rounded-xl text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <CornerDownRight className="w-3.5 h-3.5" />
                  <span>Replying to <strong>@{replyingToComment.authorName}</strong></span>
                </span>
                <button
                  type="button"
                  onClick={() => setReplyingToComment(null)}
                  className="hover:underline text-[11px] font-bold"
                >
                  Cancel Reply
                </button>
              </div>
            )}

            {commentError && (
              <div className="p-3 rounded-xl bg-fingrow-coral/10 border border-fingrow-coral/20 text-fingrow-coral text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{commentError}</span>
              </div>
            )}

            <form onSubmit={handleAddComment} className="space-y-3">
              <textarea
                id="comment-input-area"
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={
                  session
                    ? replyingToComment
                      ? `Write your reply to ${replyingToComment.authorName}...`
                      : `Reply as ${session.name} (${session.role})...`
                    : "Sign in to join the discussion..."
                }
                disabled={!session}
                className="w-full px-4 py-2.5 rounded-xl border border-fingrow-midnight/20 bg-white text-fingrow-midnight text-sm placeholder:text-fingrow-midnight/40 focus:outline-none focus:ring-2 focus:ring-fingrow-emerald disabled:bg-fingrow-midnight/5"
                required
              />
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="text-[11px] text-fingrow-midnight/50">
                  {session
                    ? "Keep responses constructive. Never post private contact emails or IDs."
                    : "You must be signed in to contribute."}
                </span>
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={!session || !commentText.trim()}
                  isLoading={submittingComment}
                  className="font-bold"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  <span>{replyingToComment ? "Post Reply" : "Post Response"}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Threaded Comments List */}
        <div className="space-y-4">
          {topLevelComments.length === 0 ? (
            <div className="text-center py-8 bg-white/60 rounded-2xl border border-dashed border-fingrow-midnight/15 text-xs text-fingrow-midnight/60">
              No responses yet. Be the first to share an insight or answer!
            </div>
          ) : (
            topLevelComments.map((cmt) => {
              const childReplies = repliesByParentId[cmt.id] || [];
              const canModerateCmt =
                session &&
                (session.userId === cmt.userId ||
                  session.role === "platform_admin" ||
                  session.role === "institution_admin");

              return (
                <div
                  key={cmt.id}
                  className="bg-white rounded-2xl p-5 border border-fingrow-midnight/10 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-fingrow-midnight">
                      {cmt.authorName}{" "}
                      <span className="font-normal text-fingrow-midnight/50">
                        ({cmt.authorRole})
                      </span>
                    </span>
                    <span className="text-[11px] text-fingrow-midnight/40">
                      {new Date(cmt.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-fingrow-midnight/80 leading-relaxed whitespace-pre-line">
                    {cmt.content}
                  </p>

                  {/* Comment actions */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingToComment({
                          id: cmt.id,
                          authorName: cmt.authorName,
                        });
                        const el = document.getElementById("comment-input-area");
                        el?.focus();
                      }}
                      className="inline-flex items-center gap-1 font-semibold text-fingrow-emerald hover:underline"
                    >
                      <CornerDownRight className="w-3 h-3" />
                      <span>Reply</span>
                    </button>

                    <div className="flex items-center gap-3">
                      {canModerateCmt && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(cmt.id)}
                          className="text-fingrow-midnight/40 hover:text-fingrow-coral transition-colors"
                          title="Delete response"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setReportTarget({
                            type: "comment",
                            id: cmt.id,
                            titleOrSnippet: cmt.content.substring(0, 60),
                          })
                        }
                        className="text-fingrow-midnight/40 hover:text-fingrow-coral transition-colors"
                        title="Report response"
                      >
                        <Flag className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Nested child replies */}
                  {childReplies.length > 0 && (
                    <div className="border-l-2 border-fingrow-emerald/25 pl-4 sm:pl-5 space-y-2.5 mt-3 pt-2">
                      {childReplies.map((reply) => {
                        const canModerateReply =
                          session &&
                          (session.userId === reply.userId ||
                            session.role === "platform_admin" ||
                            session.role === "institution_admin");

                        return (
                          <div
                            key={reply.id}
                            className="bg-fingrow-midnight/[0.02] rounded-xl p-3.5 border border-fingrow-midnight/5 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-fingrow-midnight">
                                {reply.authorName}{" "}
                                <span className="font-normal text-fingrow-midnight/50">
                                  ({reply.authorRole})
                                </span>
                              </span>
                              <span className="text-[10px] text-fingrow-midnight/40">
                                {new Date(reply.createdAt).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>

                            <p className="text-xs text-fingrow-midnight/80 leading-relaxed whitespace-pre-line">
                              {reply.content}
                            </p>

                            <div className="flex justify-end gap-2 pt-1">
                              {canModerateReply && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(reply.id)}
                                  className="text-fingrow-midnight/40 hover:text-fingrow-coral transition-colors"
                                  title="Delete reply"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  setReportTarget({
                                    type: "comment",
                                    id: reply.id,
                                    titleOrSnippet: reply.content.substring(0, 60),
                                  })
                                }
                                className="text-fingrow-midnight/40 hover:text-fingrow-coral transition-colors"
                                title="Report reply"
                              >
                                <Flag className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
