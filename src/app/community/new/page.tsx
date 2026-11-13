"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { checkCommunityContentSafety } from "@/lib/community-safety";

export default function NewCommunityPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Personal Finance");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    "Personal Finance",
    "Stock Investing",
    "Startups & Business",
    "Career & Hustles",
    "General",
  ];

  // Real-time student privacy & sensitive data check
  const privacyWarning = useMemo(() => {
    const titleCheck = checkCommunityContentSafety(title);
    if (!titleCheck.isSafe) return titleCheck.reason;
    const contentCheck = checkCommunityContentSafety(content);
    if (!contentCheck.isSafe) return contentCheck.reason;
    return null;
  }, [title, content]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (privacyWarning) {
      setError(privacyWarning);
      return;
    }

    if (title.trim().length < 5) {
      setError("Please provide a title with at least 5 characters.");
      return;
    }

    if (content.trim().length < 10) {
      setError("Please provide discussion content with at least 10 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create post");
      }

      router.push(`/community/post/${data.post.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <a
          href="/community"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-fingrow-midnight/60 hover:text-fingrow-emerald transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Discussions</span>
        </a>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="emerald" size="sm">NEW DISCUSSION</Badge>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-fingrow-emerald bg-fingrow-emerald/10 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Earn +25 XP</span>
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-fingrow-midnight tracking-tight">
          Start a Community Discussion
        </h1>
        <p className="text-sm text-fingrow-midnight/70">
          Share your experience, ask a budgeting question, or discuss an investment concept with peers.
        </p>
      </div>

      {/* Guidelines & Privacy Callout */}
      <div className="bg-emerald-50/60 border border-fingrow-emerald/20 rounded-2xl p-4 space-y-2 text-xs text-fingrow-midnight/80">
        <div className="flex items-center gap-2 font-bold text-fingrow-emerald">
          <ShieldCheck className="w-4 h-4" />
          <span>FinGrow Community Safety Standards</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] list-disc list-inside text-fingrow-midnight/70">
          <li>Keep advice educational & constructive</li>
          <li>Zero tolerance for spam or crypto pump schemes</li>
          <li>Protect student privacy: never share phone or emails</li>
          <li>Be supportive of beginners asking questions</li>
        </ul>
      </div>

      <Card className="shadow-finCard border-fingrow-midnight/10">
        <CardContent className="pt-6">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-fingrow-coral/10 border border-fingrow-coral/20 text-fingrow-coral text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {privacyWarning && !error && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{privacyWarning}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-fingrow-midnight uppercase tracking-wider">
                Select Topic Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-fingrow-midnight/20 bg-white text-fingrow-midnight text-sm focus:outline-none focus:ring-2 focus:ring-fingrow-emerald"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-fingrow-midnight uppercase tracking-wider">
                Discussion Title
              </label>
              <Input
                placeholder="e.g. How do you decide between a High Yield Savings Account vs Index Funds?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={150}
              />
              <div className="flex justify-between text-[11px] text-fingrow-midnight/50">
                <span>Make your question specific and clear</span>
                <span>{title.length}/150</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-fingrow-midnight uppercase tracking-wider">
                Discussion Content
              </label>
              <textarea
                rows={7}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Provide context, share what you've learned from simulations or where you need advice..."
                className="w-full px-4 py-3 rounded-xl border border-fingrow-midnight/20 bg-white text-fingrow-midnight text-sm placeholder:text-fingrow-midnight/40 focus:outline-none focus:ring-2 focus:ring-fingrow-emerald"
                required
              />
              <div className="flex justify-between text-[11px] text-fingrow-midnight/50">
                <span>Markdown formatting supported</span>
                <span>{content.length} characters</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-finButton"
                isLoading={loading}
                disabled={Boolean(privacyWarning)}
              >
                <span>Publish Discussion (+25 XP)</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
