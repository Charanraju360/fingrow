"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, ArrowRight, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function JoinClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successClassroom, setSuccessClassroom] = useState<any | null>(null);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/classrooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          // Redirect to register/login with return URL
          router.push(`/register?role=student&code=${encodeURIComponent(code.trim().toUpperCase())}`);
          return;
        }
        setError(data.error || "Failed to join classroom");
        return;
      }

      setSuccessClassroom(data.classroom);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {successClassroom ? (
        <div className="bg-fingrow-emerald/10 border border-fingrow-emerald/30 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-fingrow-emerald text-white flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-fingrow-midnight">
            Successfully Enrolled!
          </h3>
          <p className="text-sm text-fingrow-midnight/70">
            Welcome to <strong>{successClassroom.name}</strong>. Redirecting you to your learning dashboard...
          </p>
        </div>
      ) : (
        <form onSubmit={handleJoin} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-fingrow-coral/10 border border-fingrow-coral/30 text-fingrow-coral text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-fingrow-midnight">
              Enter 6-8 Character Join Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. OAK-ECON"
              className="w-full px-4 py-3 text-center uppercase tracking-widest text-lg font-bold rounded-xl border border-fingrow-midnight/20 bg-white text-fingrow-midnight placeholder:text-fingrow-midnight/30 focus:outline-none focus:ring-2 focus:ring-fingrow-emerald"
              maxLength={12}
              required
            />
            <p className="text-xs text-fingrow-midnight/50 text-center pt-1">
              Provided by your teacher or economics instructor.
            </p>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full justify-center" disabled={loading}>
            <span>{loading ? "Joining Classroom..." : "Join Classroom"}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      )}

      <div className="pt-4 border-t border-fingrow-midnight/10 text-center space-y-2">
        <p className="text-xs text-fingrow-midnight/60">
          New to FinGrow?{" "}
          <a
            href={`/register?role=student${code ? `&code=${encodeURIComponent(code)}` : ""}`}
            className="text-fingrow-emerald font-semibold hover:underline"
          >
            Create free student account
          </a>
        </p>
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-fingrow-midnight/50">
          <ShieldCheck className="w-3.5 h-3.5 text-fingrow-emerald" />
          <span>Zero financial info or credit cards required.</span>
        </div>
      </div>
    </div>
  );
}
