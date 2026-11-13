import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  PlusCircle,
  MessageSquare,
  ThumbsUp,
  Search,
  ShieldCheck,
  Lock,
  Pin,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "FinGrow Community — Safe & Moderated Financial Discussions",
  description:
    "Discuss personal budgeting, stock mechanics, startup EBITDA, and career strategies with peers and educators in a safe, moderated environment.",
};

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category = "All", q = "" } = await searchParams;
  const session = await getCurrentUser();
  const posts = db.community.getPosts(category, q);

  const categories = [
    "All",
    "Personal Finance",
    "Stock Investing",
    "Startups & Business",
    "Career & Hustles",
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="emerald" size="sm">PEER EXCHANGE & INSIGHTS</Badge>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-fingrow-emerald bg-fingrow-emerald/10 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Moderated & Safe</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-fingrow-midnight tracking-tight">
            Financial Community Discussions
          </h1>
          <p className="text-sm text-fingrow-midnight/70 max-w-2xl">
            Ask questions, share financial milestones, and discuss investment concepts in a
            supportive, spam-free space protected by active moderation.
          </p>
        </div>

        <a href="/community/new">
          <Button size="lg" variant="primary" className="shadow-finButton font-bold">
            <PlusCircle className="w-5 h-5 mr-1.5" />
            <span>Start Discussion</span>
          </Button>
        </a>
      </div>

      {/* Community Safety & Privacy Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-fingrow-emerald/20 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-fingrow-emerald/15 text-fingrow-emerald shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-fingrow-midnight">
              FinGrow Community Trust & Privacy Guarantee
            </h4>
            <p className="text-xs text-fingrow-midnight/70 leading-relaxed">
              Every post is moderated. Private student records, grades, and contact emails are strictly protected
              and never published to feeds. Scam promotions, spam, and predatory schemes are swiftly reviewed and removed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs font-bold text-fingrow-midnight/70 border-t md:border-t-0 md:border-l border-fingrow-midnight/10 pt-3 md:pt-0 md:pl-5">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-fingrow-emerald" />
            <span>+25 XP per post</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-fingrow-lime" />
            <span>+10 XP per reply</span>
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-3">
        <form method="GET" action="/community" className="flex flex-col sm:flex-row gap-2">
          {category !== "All" && (
            <input type="hidden" name="category" value={category} />
          )}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-fingrow-midnight/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search discussions by topic, question, or keyword..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-fingrow-midnight/15 bg-white text-sm text-fingrow-midnight placeholder:text-fingrow-midnight/40 focus:outline-none focus:ring-2 focus:ring-fingrow-emerald focus:border-transparent transition-all shadow-sm"
            />
          </div>
          <Button type="submit" variant="outline" size="sm" className="font-semibold">
            Search
          </Button>
          {q && (
            <a href={`/community${category !== "All" ? `?category=${encodeURIComponent(category)}` : ""}`}>
              <Button type="button" variant="ghost" size="sm" className="text-xs">
                Clear
              </Button>
            </a>
          )}
        </form>

        {/* Categories Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {categories.map((cat) => {
            const isActive = category === cat;
            const queryParam = q ? `&q=${encodeURIComponent(q)}` : "";
            const href = `/community?category=${encodeURIComponent(cat)}${queryParam}`;

            return (
              <a
                key={cat}
                href={href}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-fingrow-emerald text-white shadow-sm ring-2 ring-fingrow-emerald/20"
                    : "bg-white border border-fingrow-midnight/15 text-fingrow-midnight/70 hover:border-fingrow-midnight/35 hover:text-fingrow-midnight shadow-sm"
                }`}
              >
                {cat}
              </a>
            );
          })}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="text-center p-12 space-y-4 bg-white/80 border-dashed">
            <MessageSquare className="w-12 h-12 text-fingrow-midnight/25 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-fingrow-midnight">
                No Discussions Found
              </h3>
              <p className="text-xs text-fingrow-midnight/60 max-w-md mx-auto">
                {q
                  ? `No discussions matched "${q}". Try adjusting your keywords or clearing the search query.`
                  : "Be the first to share an insight or ask a question in this topic!"}
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              {q ? (
                <a href="/community">
                  <Button size="sm" variant="outline">
                    View All Discussions
                  </Button>
                </a>
              ) : null}
              <a href="/community/new">
                <Button size="sm" variant="primary">
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  <span>Start Discussion</span>
                </Button>
              </a>
            </div>
          </Card>
        ) : (
          posts.map((post) => (
            <a
              key={post.id}
              href={`/community/post/${post.id}`}
              className="block bg-white rounded-2xl p-5 sm:p-6 border border-fingrow-midnight/10 shadow-finCard hover:border-fingrow-emerald hover:shadow-md transition-all space-y-3 group"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {post.isPinned && (
                    <Badge variant="lime" size="sm" className="font-bold inline-flex items-center gap-1">
                      <Pin className="w-3 h-3 fill-current" />
                      <span>PINNED</span>
                    </Badge>
                  )}
                  <Badge variant="emerald" size="sm">{post.category}</Badge>
                  <span className="text-xs font-semibold text-fingrow-midnight/70">
                    <strong>{post.authorName}</strong>{" "}
                    <span className="text-fingrow-midnight/50 font-normal">
                      ({post.authorRole})
                    </span>
                  </span>
                </div>
                <span className="text-[11px] text-fingrow-midnight/45 font-medium">
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h2 className="text-lg font-bold text-fingrow-midnight group-hover:text-fingrow-emerald transition-colors leading-snug">
                {post.title}
              </h2>

              <p className="text-xs sm:text-sm text-fingrow-midnight/75 line-clamp-2 leading-relaxed">
                {post.content}
              </p>

              <div className="flex items-center gap-4 pt-2 text-xs font-semibold text-fingrow-midnight/60">
                <span className="flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5 text-fingrow-emerald" />
                  <span>{post.likes} {post.likes === 1 ? "Like" : "Likes"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-fingrow-midnight/50" />
                  <span>{post.commentsCount} {post.commentsCount === 1 ? "Response" : "Responses"}</span>
                </span>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
