import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { PostDetailClient } from "./post-client";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostPageProps) {
  const { id } = await params;
  const post = db.community.getPostById(id);
  if (!post) return { title: "Discussion Not Found" };
  return {
    title: `${post.title} — FinGrow Community`,
    description: post.content.substring(0, 150),
  };
}

export default async function CommunityPostDetailPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = db.community.getPostById(id);
  if (!post) {
    notFound();
  }

  const session = await getCurrentUser();
  const comments = db.community.getComments(id);
  const hasLiked = session ? post.likedBy.includes(session.userId) : false;

  return (
    <PostDetailClient
      post={post}
      initialComments={comments}
      initialLiked={hasLiked}
      session={session}
    />
  );
}

