"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, ArrowRight, UserCheck, ShieldCheck, GraduationCap, Building2, Terminal, Loader2, Sparkles, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [switchingEmail, setSwitchingEmail] = useState<string | null>(null);

  const demoAccounts = [
    { name: "Alex Chen", role: "Student", email: "alex.student@fingrow.dev", icon: UserCheck, desc: "Learner courses & simulations" },
    { name: "Priya Sharma", role: "Young Pro", email: "priya.pro@fingrow.dev", icon: ShieldCheck, desc: "Salary, SIP & Budget tools" },
    { name: "Sarah Jenkins", role: "Educator", email: "sarah.teacher@fingrow.dev", icon: GraduationCap, desc: "Classroom rosters & assignments" },
    { name: "Marcus Vance", role: "Institution Admin", email: "marcus.admin@fingrow.dev", icon: Building2, desc: "School district oversight" },
    { name: "FinGrow Admin", role: "Platform Admin", email: "admin@fingrow.dev", icon: Terminal, desc: "Platform moderation & analytics" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in. Please verify your credentials.");
      }

      const target = data.redirectUrl || "/dashboard";
      router.push(target);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Instant 1-Click Demo Sign In
  async function handleInstantDemoSwitch(demoEmail: string) {
    setError(null);
    setSwitchingEmail(demoEmail);
    setEmail(demoEmail);
    setPassword("FinGrowDemo2026!");

    try {
      const res = await fetch("/api/auth/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to switch demo account");
      }

      const destination = data.redirectUrl || "/dashboard";
      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setSwitchingEmail(null);
    }
  }

  function handleFillDemoCredentials(e: React.MouseEvent, demoEmail: string) {
    e.stopPropagation();
    setEmail(demoEmail);
    setPassword("FinGrowDemo2026!");
    setError(null);
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-fingrow-emerald flex items-center justify-center text-white mx-auto shadow-sm">
            <TrendingUp className="w-6 h-6 text-fingrow-lime" />
          </div>
          <h1 className="text-2xl font-extrabold text-fingrow-midnight">Welcome Back</h1>
          <p className="text-sm text-fingrow-midnight/70">
            Sign in to continue your financial learning journey
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || switchingEmail !== null}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || switchingEmail !== null}
              />

              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                className="w-full" 
                isLoading={loading}
                disabled={loading || switchingEmail !== null}
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-fingrow-midnight/10 text-center">
              <p className="text-xs text-fingrow-midnight/60">
                Don&apos;t have an account?{" "}
                <a href="/register" className="font-bold text-fingrow-emerald hover:underline">
                  Create Account Free
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 1-Click Demo Profiles Switcher */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-fingrow-midnight/10 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-fingrow-emerald" />
              <span className="text-xs font-bold text-fingrow-midnight/80 uppercase tracking-wider">
                Instant 1-Click Demo Switcher
              </span>
            </div>
            <Badge variant="lime" size="sm">No password needed</Badge>
          </div>
          <p className="text-[11px] text-fingrow-midnight/60">
            Click any demo profile to switch and log in instantly without typing:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {demoAccounts.map((d) => {
              const Icon = d.icon;
              const isSwitchingThis = switchingEmail === d.email;
              return (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => handleInstantDemoSwitch(d.email)}
                  disabled={switchingEmail !== null || loading}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl text-left border transition-all text-xs focus:outline-none focus:ring-2 focus:ring-fingrow-emerald ${
                    isSwitchingThis
                      ? "bg-fingrow-emerald text-white border-fingrow-emerald"
                      : "bg-white border-fingrow-midnight/10 hover:border-fingrow-emerald hover:bg-fingrow-emerald/5 text-fingrow-midnight"
                  }`}
                  aria-label={`Instant sign in as ${d.name} (${d.role})`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSwitchingThis ? "bg-white/20 text-white" : "bg-fingrow-midnight/5 text-fingrow-emerald group-hover:bg-fingrow-emerald group-hover:text-white transition-colors"
                    }`}>
                      {isSwitchingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      ) : (
                        <Icon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="font-bold truncate">{d.name}</div>
                      <div className={`text-[10px] truncate ${isSwitchingThis ? "text-white/80" : "text-fingrow-midnight/60"}`}>
                        {d.role}
                      </div>
                    </div>
                  </div>

                  <span
                    onClick={(e) => handleFillDemoCredentials(e, d.email)}
                    title="Fill form only"
                    className={`ml-1 p-1 rounded hover:bg-black/10 transition-colors flex-shrink-0 ${
                      isSwitchingThis ? "text-white" : "text-fingrow-midnight/40 hover:text-fingrow-midnight"
                    }`}
                  >
                    <KeyRound className="w-3 h-3" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
