"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, ArrowRight, UserCheck, ShieldCheck, GraduationCap, Building2, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "young_professional" | "educator" | "institution_admin">("student");
  const [institution, setInstitution] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: "student",
      label: "Student",
      desc: "High school or college learner (Ages 16–25)",
      icon: UserCheck,
    },
    {
      id: "young_professional",
      label: "Young Professional",
      desc: "Early career budgeting & investing (Ages 22–30)",
      icon: ShieldCheck,
    },
    {
      id: "educator",
      label: "Educator / Teacher",
      desc: "Classrooms, assignments & student reports",
      icon: GraduationCap,
    },
    {
      id: "institution_admin",
      label: "Institution Admin",
      desc: "School or district leadership & oversight",
      icon: Building2,
    },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          institution: institution ? institution.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account. Please check your details.");
      }

      router.push("/onboarding");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-fingrow-emerald flex items-center justify-center text-white mx-auto shadow-sm">
            <TrendingUp className="w-6 h-6 text-fingrow-lime" />
          </div>
          <h1 className="text-3xl font-extrabold text-fingrow-midnight">Join FinGrow Free</h1>
          <p className="text-sm text-fingrow-midnight/70">
            Start experiencing how money works with zero real-money risk
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {error && (
              <div 
                role="alert" 
                className="mb-4 p-3 rounded-xl bg-fingrow-coral/10 border border-fingrow-coral/20 text-fingrow-coral text-xs font-semibold leading-relaxed"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-fingrow-midnight/70">
                    Select Your Primary Path
                  </label>
                  <span className="text-[11px] text-fingrow-midnight/60">Choose your personalized curriculum</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="radiogroup" aria-label="Account role selection">
                  {roles.map((r) => {
                    const Icon = r.icon;
                    const isSelected = role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setRole(r.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 focus:outline-none focus:ring-2 focus:ring-fingrow-emerald ${
                          isSelected
                            ? "border-fingrow-emerald bg-fingrow-emerald/5 ring-2 ring-fingrow-emerald/20"
                            : "border-fingrow-midnight/15 hover:border-fingrow-midnight/30 bg-white"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? "bg-fingrow-emerald text-white"
                              : "bg-fingrow-midnight/5 text-fingrow-midnight"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-fingrow-midnight">{r.label}</div>
                          <div className="text-[10px] text-fingrow-midnight/60 leading-tight mt-0.5 line-clamp-2">
                            {r.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="e.g. Alex Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <Input
                  label="Create Password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <div className="flex items-center gap-1.5 text-[11px] text-fingrow-midnight/60 pt-0.5">
                  <Shield className="w-3 h-3 text-fingrow-emerald" />
                  <span>Secured with 100,000-iteration PBKDF2 salt hashing</span>
                </div>
              </div>

              {(role === "educator" || role === "institution_admin") && (
                <Input
                  label="School or District Name"
                  placeholder="e.g. Oakridge High School"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  required
                  disabled={loading}
                />
              )}

              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
                <span>Create Account & Continue</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-fingrow-midnight/10 text-center">
              <p className="text-xs text-fingrow-midnight/60">
                Already have an account?{" "}
                <a href="/login" className="font-bold text-fingrow-emerald hover:underline">
                  Sign In
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
