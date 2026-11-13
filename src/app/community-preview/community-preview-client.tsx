"use client";

import React, { useState } from "react";
import { MessageSquare, ThumbsUp, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CommunityPost {
  id: string;
  category: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  title: string;
  content: string;
  likes: number;
  commentsCount: number;
}

interface CommunityPreviewClientProps {
  initialPosts: CommunityPost[];
}

export function CommunityPreviewClient({ initialPosts }: CommunityPreviewClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Investing", "Personal Finance", "Startups", "Career"];

  const filtered = selectedCategory === "All"
    ? initialPosts
    : initialPosts.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? "bg-fingrow-emerald text-white"
                : "bg-white text-fingrow-midnight/70 hover:bg-fingrow-midnight/5 border border-fingrow-midnight/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Discussion Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-fingrow-midnight/10 text-fingrow-midnight/60 text-sm">
            No discussions found in {selectedCategory}. Be the first to start a topic!
          </div>
        ) : (
          filtered.map((post) => (
            <a
              key={post.id}
              href={`/community/post/${post.id}`}
              className="block bg-white rounded-2xl p-6 border border-fingrow-midnight/10 shadow-finCard hover:border-fingrow-emerald hover:shadow-finElevated transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="emerald" size="sm">
                    {post.category}
                  </Badge>
                  <span className="text-xs font-semibold text-fingrow-midnight/60">
                    Posted by <strong>{post.authorName}</strong> ({post.authorRole})
                  </span>
                </div>
                <span className="text-xs text-fingrow-midnight/40">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-bold text-lg text-fingrow-midnight mb-2 hover:text-fingrow-emerald transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-fingrow-midnight/70 line-clamp-2 leading-relaxed">
                {post.content}
              </p>
              <div className="flex items-center gap-5 mt-4 pt-4 border-t border-fingrow-midnight/5 text-xs font-semibold text-fingrow-midnight/60">
                <span className="flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5 text-fingrow-emerald" />
                  <span>{post.likes} Likes</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-fingrow-midnight/60" />
                  <span>{post.commentsCount} Comments</span>
                </span>
                <span className="text-fingrow-emerald font-bold ml-auto flex items-center gap-1 hover:underline">
                  Join Discussion
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </a>
          ))
        )}
      </div>

      {/* Community Safety Pledge */}
      <div className="bg-fingrow-midnight text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-fingrow-lime text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Strict Educational Moderation</span>
          </div>
          <h4 className="text-xl font-bold text-white">Zero Tolerated Crypto Pump Schemes or Shills</h4>
          <p className="text-xs text-white/70 max-w-xl leading-relaxed">
            Every discussion topic is actively monitored. Affiliate schemes, speculative pump groups, and unauthorized solicitation are strictly blocked to protect learner safety.
          </p>
        </div>
        <a href="/community/new">
          <Button variant="accent" size="lg" className="whitespace-nowrap font-bold">
            Start a Topic
          </Button>
        </a>
      </div>
    </div>
  );
}
