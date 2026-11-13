"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function JoinClassroomForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCode = searchParams.get("code") || "";

  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinedClassroom, setJoinedClassroom] = useState<any | null>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode.toUpperCase());
    }
  }, [initialCode]);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/classrooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?redirect=/join?code=${encodeURIComponent(code.trim().toUpperCase())}`);
          return;
        }
        throw new Error(data.error || "Failed to join classroom");
      }

      setJoinedClassroom(data.classroom);
    } catch (err: any) {
      setError(err.message || "Something went wrong while joining");
    } finally {
      setLoading(false);
    }
  }

  if (joinedClassroom) {
    return (
      <Card className="max-w-lg mx-auto border-fingrow-emerald/30 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-fingrow-emerald text-white p-6 text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-white/20 text-white flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <Badge variant="lime" size="sm">ENROLLMENT CONFIRMED</Badge>
          <h2 className="text-2xl font-extrabold text-white">Welcome to Class!</h2>
          <p className="text-xs text-white/80">
            You are now enrolled in <strong>{joinedClassroom.name}</strong>.
          </p>
        </div>

        <CardContent className="p-6 space-y-6">
          <div className="p-4 rounded-2xl bg-fingrow-ivory border border-fingrow-midnight/10 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-fingrow-midnight/60 font-medium">Instructor:</span>
              <strong className="text-fingrow-midnight">{joinedClassroom.educatorName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-fingrow-midnight/60 font-medium">Subject:</span>
              <strong className="text-fingrow-midnight">{joinedClassroom.subject}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-fingrow-midnight/60 font-medium">Institution:</span>
              <strong className="text-fingrow-midnight">{joinedClassroom.institution}</strong>
            </div>
            <div className="flex justify-between pt-1 border-t border-fingrow-midnight/10">
              <span className="text-fingrow-emerald font-bold">Bonus XP Awarded:</span>
              <span className="font-mono font-bold text-fingrow-emerald bg-fingrow-emerald/10 px-2 py-0.5 rounded">
                +100 XP (Classroom Scholar)
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <a href="/dashboard" className="block">
              <Button variant="primary" size="lg" className="w-full justify-between">
                <span>View Dashboard & Assignments</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <a href="/learn" className="block">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Browse Full Course Catalog
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto shadow-finElevated">
      <CardContent className="pt-8 p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-fingrow-emerald/10 text-fingrow-emerald flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <Badge variant="emerald" size="sm">STUDENT PORTAL</Badge>
          <h1 className="text-2xl font-extrabold text-fingrow-midnight tracking-tight">
            Join Your Classroom
          </h1>
          <p className="text-xs text-fingrow-midnight/65 max-w-xs mx-auto">
            Enter the 6 to 10-character code provided by your teacher or projected on the classroom screen.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-fingrow-coral/10 border border-fingrow-coral/20 text-fingrow-coral text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-fingrow-midnight">
              Classroom Join Code
            </label>
            <input
              type="text"
              placeholder="e.g. OAK-ECON or CLS-4B21"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
              maxLength={12}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-fingrow-midnight/20 focus:border-fingrow-emerald focus:ring-2 focus:ring-fingrow-emerald font-mono text-center text-xl font-extrabold tracking-widest uppercase text-fingrow-midnight bg-white"
            />
            <p className="text-[11px] text-fingrow-midnight/50 text-center">
              Codes are case-insensitive and generated by your teacher.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            <span>{loading ? "Joining Classroom..." : "Join Classroom Now"}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="pt-2 border-t border-fingrow-midnight/10 text-center text-xs text-fingrow-midnight/60">
          <span>Are you a teacher looking to create a class? </span>
          <a
            href="/educator/classrooms/new"
            className="font-bold text-fingrow-emerald hover:underline"
          >
            Create Classroom
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
