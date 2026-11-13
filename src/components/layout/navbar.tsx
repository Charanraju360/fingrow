"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  TrendingUp,
  Flame,
  Award,
  BookOpen,
  Gamepad2,
  Cpu,
  GraduationCap,
  Users,
  Menu,
  X,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  user?: {
    userId: string;
    email: string;
    name: string;
    role: string;
  } | null;
  userStats?: {
    xp: number;
    streakDays: number;
  } | null;
}

export function Navbar({ user, userStats }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navLinks = [
    { href: "/learn", label: "Curriculum", icon: BookOpen },
    { href: "/games", label: "Play & Compete", icon: Gamepad2 },
    { href: "/simulations", label: "Simulators", icon: Cpu },
    { href: user?.role === "educator" || user?.role === "institution_admin" ? "/educator" : "/for-educators", label: "Educators", icon: GraduationCap },
    { href: "/community", label: "Community", icon: Users },
  ];

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-fingrow-ivory/90 backdrop-blur-md border-b border-fingrow-midnight/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fingrow-emerald to-fingrow-darkEmerald flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <TrendingUp className="w-5 h-5 text-fingrow-lime" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-fingrow-midnight">
              Fin<span className="text-fingrow-emerald">Grow</span>
            </span>
            <span className="text-[10px] tracking-wide text-fingrow-midnight/60 font-medium -mt-1 hidden sm:inline">
              Learn Money. Play Smart.
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <a
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-fingrow-emerald/10 text-fingrow-emerald"
                    : "text-fingrow-midnight/80 hover:text-fingrow-midnight hover:bg-fingrow-midnight/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-fingrow-emerald" : "text-fingrow-midnight/50"}`} />
                <span>{link.label}</span>
              </a>
            );
          })}
        </nav>

        {/* User Stats & Auth Controls */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Gamification Pills */}
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-fingrow-midnight/10 shadow-sm">
                <div className="flex items-center gap-1 text-xs font-bold text-fingrow-midnight">
                  <Flame className="w-4 h-4 text-fingrow-tangerine fill-fingrow-tangerine" />
                  <span>{userStats?.streakDays || 1}d</span>
                </div>
                <div className="w-px h-3.5 bg-fingrow-midnight/15" />
                <div className="flex items-center gap-1 text-xs font-bold text-fingrow-emerald">
                  <Award className="w-4 h-4 text-fingrow-lime" />
                  <span>{userStats?.xp || 0} XP</span>
                </div>
              </div>

              {/* Dashboard Link */}
              <a href="/dashboard">
                <Button size="sm" variant="primary">
                  Dashboard
                </Button>
              </a>

              {/* Admin Badge link if platform_admin */}
              {user.role === "platform_admin" && (
                <a href="/admin">
                  <Button size="sm" variant="accent" className="gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Button>
                </a>
              )}

              {/* Profile & Logout */}
              <a
                href="/profile"
                title="Profile"
                className="w-9 h-9 rounded-full bg-white border border-fingrow-midnight/10 flex items-center justify-center text-fingrow-midnight/80 hover:text-fingrow-midnight hover:border-fingrow-emerald transition-colors"
              >
                <User className="w-4 h-4" />
              </a>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                title="Sign Out"
                className="w-9 h-9 rounded-full bg-white border border-fingrow-midnight/10 flex items-center justify-center text-fingrow-midnight/60 hover:text-fingrow-coral hover:border-fingrow-coral transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a href="/login">
                <Button size="sm" variant="ghost">
                  Sign In
                </Button>
              </a>
              <a href="/register">
                <Button size="sm" variant="primary">
                  Start Free
                </Button>
              </a>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-fingrow-midnight/10 text-xs font-bold text-fingrow-midnight">
              <Flame className="w-3.5 h-3.5 text-fingrow-tangerine fill-fingrow-tangerine" />
              <span>{userStats?.streakDays || 1}d</span>
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-fingrow-midnight/80 hover:bg-fingrow-midnight/5"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-fingrow-midnight/10 bg-fingrow-ivory px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold ${
                    isActive
                      ? "bg-fingrow-emerald text-white"
                      : "text-fingrow-midnight hover:bg-fingrow-midnight/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </a>
              );
            })}

            {user && (
              <>
                <a
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-fingrow-midnight hover:bg-fingrow-midnight/5"
                >
                  <Award className="w-5 h-5 text-fingrow-emerald" />
                  <span>My Dashboard</span>
                </a>
                <a
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-fingrow-midnight hover:bg-fingrow-midnight/5"
                >
                  <User className="w-5 h-5" />
                  <span>Profile & Achievements</span>
                </a>
                {user.role === "platform_admin" && (
                  <a
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-fingrow-emerald hover:bg-fingrow-midnight/5"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Admin Panel</span>
                  </a>
                )}
              </>
            )}
          </nav>

          <div className="pt-3 border-t border-fingrow-midnight/10 flex flex-col gap-2">
            {user ? (
              <Button
                variant="outline"
                className="w-full justify-center text-fingrow-coral border-fingrow-coral hover:bg-fingrow-coral/10"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out ({user.name})
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <a href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </a>
                <a href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Start Free
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

