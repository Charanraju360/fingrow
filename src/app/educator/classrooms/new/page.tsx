"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, GraduationCap, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function CreateClassroomPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("Economics & Personal Finance");
  const [institution, setInstitution] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subject,
          institution: institution || undefined,
          customCode: customCode || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create classroom");
      }

      router.push(`/educator/classrooms/${data.classroom.id}`);
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
          href="/educator"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-fingrow-midnight/60 hover:text-fingrow-emerald transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Educator Dashboard</span>
        </a>
      </div>

      <div className="space-y-2">
        <Badge variant="emerald" size="sm">NEW CLASSROOM</Badge>
        <h1 className="text-3xl font-extrabold text-fingrow-midnight tracking-tight">
          Create a New Classroom
        </h1>
        <p className="text-sm text-fingrow-midnight/70">
          Set up a classroom environment to generate unique student join codes and printable QR codes.
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
              label="Classroom Name"
              placeholder="e.g. AP Economics & Personal Finance (Period 3)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-fingrow-midnight">
                Subject Focus
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-fingrow-midnight/20 bg-white text-fingrow-midnight text-sm focus:outline-none focus:ring-2 focus:ring-fingrow-emerald"
              >
                <option value="Economics & Personal Finance">Economics & Personal Finance</option>
                <option value="Stock Market & Investments">Stock Market & Investments</option>
                <option value="Business Fundamentals & Entrepreneurship">Business Fundamentals & Entrepreneurship</option>
                <option value="General Financial Literacy">General Financial Literacy</option>
              </select>
            </div>

            <Input
              label="School / Institution Name"
              placeholder="e.g. Oakridge High School"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
            />

            <Input
              label="Custom Join Code (Optional)"
              placeholder="e.g. OAK-2026 (leave blank to auto-generate)"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
              maxLength={12}
              hint="Alphanumeric code (letters, numbers, hyphens) unique across FinGrow."
            />

            <div className="pt-2">
              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
                <span>Create Classroom & Generate QR</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

