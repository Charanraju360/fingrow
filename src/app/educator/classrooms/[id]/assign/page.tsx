"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function AssignLessonPage() {
  const params = useParams();
  const router = useRouter();
  const classroomId = params.id as string;

  const [title, setTitle] = useState("Complete: What Owning a Stock Actually Means");
  const [courseSlug, setCourseSlug] = useState("stock-market-fundamentals");
  const [lessonSlug, setLessonSlug] = useState("what-is-a-stock");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(Date.now() + 7 * 86400000);
    return d.toISOString().split("T")[0];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableLessons = [
    { course: "stock-market-fundamentals", lesson: "what-is-a-stock", title: "What Owning a Stock Actually Means" },
    { course: "stock-market-fundamentals", lesson: "how-order-books-work", title: "Bids, Asks & Price Discovery" },
    { course: "mutual-funds-and-sips", lesson: "index-funds-vs-active-funds", title: "Index Funds vs Actively Managed Funds" },
    { course: "mutual-funds-and-sips", lesson: "dollar-cost-averaging-sip", title: "The Magic of SIP & Dollar-Cost Averaging" },
    { course: "risk-and-diversification", lesson: "asset-allocation-and-correlation", title: "Asset Allocation: The Only Free Lunch" },
    { course: "inflation-and-compound-interest", lesson: "rule-of-72-and-compound-growth", title: "The Rule of 72 & Geometric Growth" },
    { course: "credit-and-debit-mastery", lesson: "credit-utilization-and-apr", title: "Credit Scores, Utilization & APR Traps" },
    { course: "personal-finance-and-budgeting", lesson: "the-50-30-20-framework", title: "The 50/30/20 Budgeting Blueprint" },
    { course: "business-fundamentals-and-ebitda", lesson: "understanding-ebitda-and-margins", title: "Decoding EBITDA & Financial Statements" },
    { course: "career-skills-and-side-hustles", lesson: "unit-economics-of-freelancing", title: "Unit Economics of Skills & Side Hustles" },
  ];

  function handleLessonSelect(index: number) {
    const item = availableLessons[index];
    setCourseSlug(item.course);
    setLessonSlug(item.lesson);
    setTitle(`Complete: ${item.title}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/classrooms/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classroomId,
          title: title.trim(),
          courseSlug,
          lessonSlug,
          dueDate: new Date(dueDate).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create assignment");
      }

      router.push(`/educator/classrooms/${classroomId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div>
        <a
          href={`/educator/classrooms/${classroomId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-fingrow-midnight/60 hover:text-fingrow-emerald transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Classroom Console</span>
        </a>
      </div>

      <div className="space-y-2">
        <Badge variant="emerald" size="sm">NEW HOMEWORK</Badge>
        <h1 className="text-3xl font-extrabold text-fingrow-midnight tracking-tight">
          Assign Module to Classroom
        </h1>
        <p className="text-sm text-fingrow-midnight/70">
          Enrolled students will see this assignment and due date directly on their personal learning dashboard.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-fingrow-coral/10 border border-fingrow-coral/20 text-fingrow-coral text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Assignment Title"
              placeholder="e.g. Master Equity Ownership & Order Books"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-fingrow-midnight">
                Select Lesson & Quiz
              </label>
              <select
                onChange={(e) => handleLessonSelect(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-fingrow-midnight/20 bg-white text-fingrow-midnight text-sm focus:outline-none focus:ring-2 focus:ring-fingrow-emerald"
              >
                {availableLessons.map((l, idx) => (
                  <option key={idx} value={idx}>
                    {l.title} ({l.course})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Submission Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />

            <div className="pt-2">
              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
                Schedule Assignment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

