import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { checkCommunityContentSafety } from "@/lib/community-safety";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");
  if (!postId) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  const comments = db.community.getComments(postId);
  return NextResponse.json({ success: true, comments });
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Please sign in to comment" }, { status: 401 });
    }

    const { postId, content, parentId } = await request.json();
    if (!postId || !content || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment content cannot be empty" }, { status: 400 });
    }

    // Safety & Student Privacy validation: detect accidental leaks of PII
    const safetyCheck = checkCommunityContentSafety(content);
    if (!safetyCheck.isSafe) {
      return NextResponse.json({ error: safetyCheck.reason }, { status: 400 });
    }

    const post = db.community.getPostById(postId);
    if (!post) {
      return NextResponse.json({ error: "Discussion post not found" }, { status: 404 });
    }

    const roleLabels: Record<string, string> = {
      student: "Student",
      young_professional: "Young Professional",
      educator: "Educator",
      institution_admin: "Institution Leader",
      platform_admin: "Admin",
    };

    const comment = db.community.addComment({
      postId,
      parentId: parentId || undefined,
      userId: session.userId,
      authorName: session.name,
      authorRole: roleLabels[session.role] || "Member",
      content: content.trim(),
    });

    return NextResponse.json({ success: true, comment });
  } catch (err: any) {
    console.error("Add comment error", err);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { error: "Please sign in to delete comments" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    let commentId = searchParams.get("id");

    if (!commentId) {
      try {
        const body = await request.json();
        commentId = body.commentId || body.id;
      } catch {
        // body might be empty if query parameter used
      }
    }

    if (!commentId) {
      return NextResponse.json({ error: "Comment ID is required" }, { status: 400 });
    }

    const deleted = db.community.deleteComment(commentId, session.userId, session.role);
    if (!deleted) {
      return NextResponse.json(
        { error: "Comment not found or you are not authorized to delete it" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Comment removed successfully",
    });
  } catch (err: any) {
    console.error("Delete comment error", err);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
