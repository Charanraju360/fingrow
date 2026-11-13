import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Please sign in to like posts" }, { status: 401 });
    }

    const { postId } = await request.json();
    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const result = db.community.toggleLike(postId, session.userId);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("Toggle like error", err);
    return NextResponse.json({ error: "Failed to like post" }, { status: 500 });
  }
}

