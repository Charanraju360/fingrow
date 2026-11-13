"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, UserCheck, GraduationCap, Building2, Terminal, Loader2 } from "lucide-react";

interface RoleBannerProps {
  currentUser?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export function RoleBanner({ currentUser }: RoleBannerProps) {
  const router = useRouter();
  const [switching, setSwitching] = useState<string | null>(null);

  const demoAccounts = [
    { label: "Alex (Student)", email: "alex.student@fingrow.dev", role: "student", icon: UserCheck },
    { label: "Priya (Young Pro)", email: "priya.pro@fingrow.dev", role: "young_professional", icon: ShieldCheck },
    { label: "Sarah (Educator)", email: "sarah.teacher@fingrow.dev", role: "educator", icon: GraduationCap },
    { label: "Marcus (Institution)", email: "marcus.admin@fingrow.dev", role: "institution_admin", icon: Building2 },
    { label: "Admin (Platform)", email: "admin@fingrow.dev", role: "platform_admin", icon: Terminal },
  ];

  async function handleQuickSwitch(email: string) {
    try {
      setSwitching(email);
      const res = await fetch("/api/auth/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        // Fallback to standard login endpoint if needed
        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: "FinGrowDemo2026!" }),
        });
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to switch role", err);
    } finally {
      setSwitching(null);
    }
  }

  return (
    <aside aria-label="Demo Role Simulator" className="bg-fingrow-midnight text-white text-xs border-b border-white/10 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 z-50 relative">
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-fingrow-lime animate-pulse" />
        <span className="font-semibold text-fingrow-lime tracking-wide">FinGrow Sandbox</span>
        <span className="text-white/60 hidden sm:inline">|</span>
        <span className="text-white/80">
          Current: <strong className="text-white">{currentUser?.name || "Visitor"}</strong> ({currentUser?.role || "Guest"})
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
        <span className="text-white/60 mr-1 hidden md:inline">Instant Role Switch:</span>
        {demoAccounts.map((acc) => {
          const Icon = acc.icon;
          const isActive = currentUser?.email === acc.email;
          const isThisSwitching = switching === acc.email;
          return (
            <button
              key={acc.email}
              disabled={switching !== null}
              onClick={() => handleQuickSwitch(acc.email)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all font-medium select-none focus:outline-none focus:ring-1 focus:ring-fingrow-lime ${
                isActive
                  ? "bg-fingrow-emerald text-white font-bold"
                  : "bg-white/10 text-white/90 hover:bg-white/20 hover:text-white"
              }`}
            >
              {isThisSwitching ? (
                <Loader2 className="w-3 h-3 animate-spin text-fingrow-lime" />
              ) : (
                <Icon className="w-3 h-3" />
              )}
              <span>{acc.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
