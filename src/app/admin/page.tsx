import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  Shield,
  Users,
  AlertTriangle,
  FileText,
  Activity,
  CheckCircle2,
  XCircle,
  GraduationCap,
  BookOpen,
  School,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AdminConsoleClient, AdminUser, AdminReport, AdminAuditLog } from "./admin-client";

export const metadata = {
  title: "Platform Administration — FinGrow",
  description: "Administrative oversight, moderation review queue, user role management, and audit logs.",
};

export default async function AdminPortalPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/login?redirect=/admin");
  }

  // Strict role gating: only platform_admin permitted
  if (session.role !== "platform_admin") {
    redirect("/dashboard");
  }

  // Real aggregated metrics from persistent database
  const metrics = db.admin.getPlatformMetrics();
  const moderationQueue: AdminReport[] = db.admin.getModerationQueue().map((r) => ({
    id: r.id,
    targetType: r.targetType,
    targetId: r.targetId,
    reporterUserId: r.reporterUserId,
    reporterName: r.reporterName,
    reason: r.reason,
    status: r.status,
    resolutionNotes: r.resolutionNotes,
    resolvedAt: r.resolvedAt,
    createdAt: r.createdAt,
  }));

  const allUsers: AdminUser[] = db.users.getAll().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    xp: u.xp,
    streakDays: u.streakDays,
    createdAt: u.createdAt,
  }));

  const auditLogs: AdminAuditLog[] = db.admin.getAuditLogs().map((l) => ({
    id: l.id,
    actorId: l.actorId,
    actorName: l.actorName,
    action: l.action,
    target: l.target,
    metadata: l.metadata,
    timestamp: l.timestamp,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Platform Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-fingrow-midnight/10 shadow-finCard space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="coral" size="sm" className="font-extrabold uppercase">
                <Shield className="w-3 h-3" />
                Platform Administration
              </Badge>
              <span className="text-xs text-fingrow-midnight/60 font-semibold">
                Strict Role-Gated Access
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-fingrow-midnight tracking-tight">
              Platform Oversight & Moderation Console
            </h1>
            <p className="text-xs sm:text-sm text-fingrow-midnight/70 max-w-2xl">
              Centralized platform governance: inspect live metrics, review community moderation reports, manage user permissions, and audit security events.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-fingrow-ivory px-4 py-2.5 rounded-2xl border border-fingrow-midnight/10">
            <div className="w-2.5 h-2.5 rounded-full bg-fingrow-emerald animate-pulse" />
            <div className="text-xs">
              <span className="font-bold text-fingrow-midnight">{session.name}</span>
              <div className="text-[10px] text-fingrow-midnight/50 font-mono">Platform Admin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Real Aggregated Platform KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-white border-fingrow-midnight/10 shadow-finCard">
          <CardContent className="pt-4 pb-4 px-4 space-y-1">
            <div className="flex items-center justify-between text-fingrow-midnight/60">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Users</span>
              <Users className="w-4 h-4 text-fingrow-midnight" />
            </div>
            <div className="text-2xl font-extrabold text-fingrow-midnight">
              {metrics.totalUsers}
            </div>
            <div className="text-[10px] text-fingrow-midnight/50">Registered accounts</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-fingrow-midnight/10 shadow-finCard">
          <CardContent className="pt-4 pb-4 px-4 space-y-1">
            <div className="flex items-center justify-between text-fingrow-emerald">
              <span className="text-[10px] font-bold uppercase tracking-wider text-fingrow-midnight/60">Students</span>
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold text-fingrow-emerald">
              {metrics.studentsCount}
            </div>
            <div className="text-[10px] text-fingrow-midnight/50">Active learners</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-fingrow-midnight/10 shadow-finCard">
          <CardContent className="pt-4 pb-4 px-4 space-y-1">
            <div className="flex items-center justify-between text-[#3f7700]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-fingrow-midnight/60">Educators</span>
              <School className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold text-[#3f7700]">
              {metrics.educatorsCount}
            </div>
            <div className="text-[10px] text-fingrow-midnight/50">Teachers & faculty</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-fingrow-midnight/10 shadow-finCard">
          <CardContent className="pt-4 pb-4 px-4 space-y-1">
            <div className="flex items-center justify-between text-fingrow-midnight">
              <span className="text-[10px] font-bold uppercase tracking-wider text-fingrow-midnight/60">Classrooms</span>
              <BookOpen className="w-4 h-4 text-fingrow-midnight" />
            </div>
            <div className="text-2xl font-extrabold text-fingrow-midnight">
              {metrics.classroomsCount}
            </div>
            <div className="text-[10px] text-fingrow-midnight/50">Active cohorts</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-fingrow-midnight/10 shadow-finCard">
          <CardContent className="pt-4 pb-4 px-4 space-y-1">
            <div className="flex items-center justify-between text-fingrow-emerald">
              <span className="text-[10px] font-bold uppercase tracking-wider text-fingrow-midnight/60">Completed Lessons</span>
              <CheckCircle2 className="w-4 h-4 text-fingrow-emerald" />
            </div>
            <div className="text-2xl font-extrabold text-fingrow-emerald">
              {metrics.completedLessonsCount}
            </div>
            <div className="text-[10px] text-fingrow-midnight/50">Finished quizzes</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-fingrow-midnight/10 shadow-finCard">
          <CardContent className="pt-4 pb-4 px-4 space-y-1">
            <div className="flex items-center justify-between text-fingrow-coral">
              <span className="text-[10px] font-bold uppercase tracking-wider text-fingrow-midnight/60">Flagged Reports</span>
              <AlertTriangle className="w-4 h-4 text-fingrow-coral" />
            </div>
            <div className="text-2xl font-extrabold text-fingrow-coral">
              {metrics.pendingReportsCount}
            </div>
            <div className="text-[10px] text-fingrow-midnight/50">Pending resolution</div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Admin Console (Moderation, Users, Audit) */}
      <AdminConsoleClient
        initialUsers={allUsers}
        initialReports={moderationQueue}
        initialLogs={auditLogs}
      />
    </div>
  );
}
