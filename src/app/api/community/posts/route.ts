import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { checkCommunityContentSafety } from "@/lib/community-safety";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "All";
  const query = searchParams.get("q") || searchParams.get("query") || "";
  const posts = db.community.getPosts(category, query);
  return NextResponse.json({ success: true, posts });
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { error: "Please sign in to post in the community" },
        { status: 401 }
      );
    }

    const rateCheck = checkRateLimit(`post_${session.userId}`, 5, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Posting too quickly. Please wait a minute." },
        { status: 429 }
      );
    }

    const { title, content, category } = await request.json();

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "Title, content, and category are required" },
        { status: 400 }
      );
    }

    if (title.trim().length < 5 || content.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a more descriptive title (min 5 chars) and content (min 10 chars)" },
        { status: 400 }
      );
    }

    // Safety & Student Privacy validation: detect accidental leaks of PII
    const titleSafety = checkCommunityContentSafety(title);
    if (!titleSafety.isSafe) {
      return NextResponse.json({ error: titleSafety.reason }, { status: 400 });
    }

    const contentSafety = checkCommunityContentSafety(content);
    if (!contentSafety.isSafe) {
      return NextResponse.json({ error: contentSafety.reason }, { status: 400 });
    }

    // Role display name
    const roleLabels: Record<string, string> = {
      student: "Student",
      young_professional: "Young Professional",
      educator: "Educator",
      institution_admin: "Institution Leader",
      platform_admin: "Admin",
    };

    const post = db.community.createPost({
      userId: session.userId,
      authorName: session.name,
      authorRole: roleLabels[session.role] || "Member",
      category,
      title: title.trim(),
      content: content.trim(),
    });

    return NextResponse.json({ success: true, post });
  } catch (err: any) {
    console.error("Create post error", err);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { error: "Please sign in to perform this action" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    let postId = searchParams.get("id");

    if (!postId) {
      try {
        const body = await request.json();
        postId = body.postId || body.id;
      } catch {
        // body might be empty if query param used
      }
    }

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const post = db.community.getPostById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const canDelete =
      session.userId === post.userId ||
      session.role === "platform_admin" ||
      session.role === "institution_admin";

    if (!canDelete) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to delete this discussion" },
        { status: 403 }
      );
    }

    const deleted = db.community.deletePost(postId, session.userId, session.role);
    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Discussion removed successfully",
    });
  } catch (err: any) {
    console.error("Delete post error", err);
    return NextResponse.json({ error: "Failed to delete discussion" }, { status: 500 });
  }
}
