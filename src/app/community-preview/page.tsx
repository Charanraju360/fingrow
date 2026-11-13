import React from "react";
import type { Metadata } from "next";
import { Users, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommunityPreviewClient } from "./community-preview-client";

export const metadata: Metadata = {
  title: "FinGrow Community — Peer Financial Discussions & Wisdom",
  description:
    "Engage with fellow learners, young professionals, and educators. Discuss stock investing, personal budgeting, entrepreneurship, and career strategies safely.",
  openGraph: {
    title: "FinGrow Community — Peer Financial Discussions & Wisdom",
    description: "A safe, spam-free space to ask real financial questions and learn alongside peers.",
    url: "https://fingrow.dev/community-preview",
  },
};

export default function CommunityPreviewPage() {
  const posts = db.community.getPosts("All").map((p) => ({
    id: p.id,
    category: p.category,
    authorName: p.authorName,
    authorRole: p.authorRole,
    createdAt: p.createdAt,
    title: p.title,
    content: p.content,
    likes: p.likes,
    commentsCount: p.commentsCount,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="emerald" size="sm">PEER LEARNING</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-fingrow-midnight tracking-tight">
          A Safe Space to Talk Money
        </h1>
        <p className="text-fingrow-midnight/70 text-base leading-relaxed">
          Ask questions, share budgeting tips, and discuss market trends without fear of spam, crypto shills, or predatory advice.
        </p>
        <div className="pt-2">
          <a href="/community">
            <Button size="lg" variant="primary">
              <span>View Full Community Feed</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
        </div>
      </div>

      <CommunityPreviewClient initialPosts={posts} />
    </div>
  );
}
