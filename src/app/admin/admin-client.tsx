"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  Shield,
  Activity,
  ArrowRight,
  Search,
  Filter,
  RefreshCw,
  Clock,
  UserCheck,
  Flame,
  Award,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "young_professional" | "educator" | "institution_admin" | "platform_admin";
  xp: number;
  streakDays: number;
  createdAt?: string;
}

export interface AdminReport {
  id: string;
  targetType: string;
  targetId: string;
  reporterUserId: string;
  reporterName: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  target: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

interface AdminConsoleClientProps {
  initialUsers: AdminUser[];
  initialReports: AdminReport[];
  initialLogs: AdminAuditLog[];
}

export function AdminConsoleClient({
  initialUsers,
  initialReports,
  initialLogs,
}: AdminConsoleClientProps) {
  const router = useRouter();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"moderation" | "users" | "audit">("moderation");

  // State
  const [reports, setReports] = useState<AdminReport[]>(initialReports);
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [logs, setLogs] = useState<AdminAuditLog[]>(initialLogs);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Moderation filtering & notes
  const [reportStatusFilter, setReportStatusFilter] = useState<"all" | "pending" | "resolved" | "dismissed">("all");
  const [reportSearch, setReportSearch] = useState("");
  const [customNotes, setCustomNotes] = useState<Record<string, string>>({});

  // Users filtering
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [pendingPromotion, setPendingPromotion] = useState<{ user: AdminUser; newRole: AdminUser["role"] } | null>(null);

  // Audit filtering
  const [auditSearch, setAuditSearch] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState<string>("all");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Clear feedback helper
  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 6000);
  };

  // 1. MODERATION RESOLUTION
  async function handleResolveReport(reportId: string, decision: "resolved" | "dismissed") {
    setActionLoading(true);
    setFeedback(null);
    try {
      const noteText = customNotes[reportId]?.trim() || `Actioned as ${decision} per platform compliance guidelines`;
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          decision,
          notes: noteText,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update report");
      }

      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? {
                ...r,
                status: decision,
                resolutionNotes: noteText,
                resolvedAt: new Date().toISOString(),
              }
            : r
        )
      );

      // Refresh audit logs
      fetchAuditLogs();
      showFeedback("success", `Report #${reportId} marked as ${decision}.`);
      router.refresh();
    } catch (err: any) {
      console.error("Moderation resolution error:", err);
      showFeedback("error", err.message || "Failed to resolve report.");
    } finally {
      setActionLoading(false);
    }
  }

  // 2. USER ROLE MODIFICATION
  async function executeRoleChange(userId: string, newRole: AdminUser["role"]) {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update user role");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );

      // Refresh audit logs
      fetchAuditLogs();
      showFeedback("success", `User role successfully updated to ${newRole.replace("_", " ")}.`);
      setPendingPromotion(null);
      router.refresh();
    } catch (err: any) {
      console.error("Change role error:", err);
      showFeedback("error", err.message || "Failed to change user role.");
    } finally {
      setActionLoading(false);
    }
  }

  function handleRoleSelect(user: AdminUser, newRole: AdminUser["role"]) {
    if (user.role === newRole) return;
    // Require explicit confirmation when promoting to platform_admin or modifying an admin
    if (newRole === "platform_admin" || user.role === "platform_admin") {
      setPendingPromotion({ user, newRole });
    } else {
      executeRoleChange(user.id, newRole);
    }
  }

  // 3. AUDIT LOGS REFRESH
  async function fetchAuditLogs() {
    try {
      const res = await fetch("/api/admin/audit");
      if (res.ok) {
        const data = await res.json();
        if (data.logs) {
          setLogs(data.logs);
        }
      }
    } catch (err) {
      console.error("Failed to refresh audit trail:", err);
    }
  }

  // FILTERED LISTS
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesStatus =
        reportStatusFilter === "all" ? true : r.status === reportStatusFilter;
      const q = reportSearch.toLowerCase();
      const matchesSearch =
        !q ||
        r.reason.toLowerCase().includes(q) ||
        r.reporterName.toLowerCase().includes(q) ||
        r.targetId.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [reports, reportStatusFilter, reportSearch]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole =
        userRoleFilter === "all" ? true : u.role === userRoleFilter;
      const q = userSearch.toLowerCase();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, userRoleFilter, userSearch]);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesAction =
        auditActionFilter === "all" ? true : l.action === auditActionFilter;
      const q = auditSearch.toLowerCase();
      const matchesSearch =
        !q ||
        l.actorName.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q);
      return matchesAction && matchesSearch;
    });
  }, [logs, auditActionFilter, auditSearch]);

  // Unique actions in logs
  const uniqueAuditActions = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => set.add(l.action));
    return Array.from(set);
  }, [logs]);

  const pendingReportsCount = reports.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Toast / Notification Banner */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold transition-all shadow-sm ${
            feedback.type === "success"
              ? "bg-fingrow-emerald/10 text-fingrow-emerald border border-fingrow-emerald/20"
              : "bg-fingrow-coral/15 text-fingrow-coral border border-fingrow-coral/25"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-current opacity-70 hover:opacity-100 px-2 py-0.5 rounded"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Confirmation Modal for Privileged Role Change */}
      {pendingPromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-fingrow-midnight/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-fingrow-midnight/15 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-fingrow-coral">
              <Shield className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-extrabold text-fingrow-midnight">
                Confirm Privileged Role Promotion
              </h3>
            </div>
            <p className="text-xs text-fingrow-midnight/70 leading-relaxed">
              You are modifying the role of <strong>{pendingPromotion.user.name}</strong> (
              <span className="font-mono">{pendingPromotion.user.email}</span>) from{" "}
              <strong className="uppercase">{pendingPromotion.user.role.replace("_", " ")}</strong> to{" "}
              <strong className="uppercase text-fingrow-coral">
                {pendingPromotion.newRole.replace("_", " ")}
              </strong>
              . This grants critical platform permissions and cannot be silently undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={actionLoading}
                onClick={() => setPendingPromotion(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={actionLoading}
                onClick={() =>
                  executeRoleChange(pendingPromotion.user.id, pendingPromotion.newRole)
                }
              >
                Confirm Privilege Change
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-fingrow-midnight/10 shadow-sm">
        <button
          onClick={() => setActiveTab("moderation")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "moderation"
              ? "bg-fingrow-emerald text-white shadow-sm"
              : "text-fingrow-midnight/70 hover:bg-fingrow-midnight/5"
          }`}
          aria-current={activeTab === "moderation" ? "page" : undefined}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Moderation Queue</span>
          {pendingReportsCount > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === "moderation"
                  ? "bg-white text-fingrow-emerald"
                  : "bg-fingrow-coral text-white"
              }`}
            >
              {pendingReportsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "users"
              ? "bg-fingrow-emerald text-white shadow-sm"
              : "text-fingrow-midnight/70 hover:bg-fingrow-midnight/5"
          }`}
          aria-current={activeTab === "users" ? "page" : undefined}
        >
          <Users className="w-4 h-4" />
          <span>User Role Management</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === "users"
                ? "bg-white text-fingrow-emerald"
                : "bg-fingrow-midnight/10 text-fingrow-midnight"
            }`}
          >
            {users.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("audit");
            fetchAuditLogs();
          }}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "audit"
              ? "bg-fingrow-emerald text-white shadow-sm"
              : "text-fingrow-midnight/70 hover:bg-fingrow-midnight/5"
          }`}
          aria-current={activeTab === "audit" ? "page" : undefined}
        >
          <Activity className="w-4 h-4" />
          <span>Platform Audit Trail</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === "audit"
                ? "bg-white text-fingrow-emerald"
                : "bg-fingrow-midnight/10 text-fingrow-midnight"
            }`}
          >
            {logs.length}
          </span>
        </button>
      </div>

      {/* 1. MODERATION QUEUE TAB */}
      {activeTab === "moderation" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-lg text-fingrow-midnight">
                Community Reports & Flag Review Queue
              </h2>
              <p className="text-xs text-fingrow-midnight/60">
                Review flagged posts, abusive comments, or reported materials for platform compliance.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-fingrow-midnight/10 self-start sm:self-auto">
              {(["all", "pending", "resolved", "dismissed"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setReportStatusFilter(status)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg capitalize transition-colors ${
                    reportStatusFilter === status
                      ? "bg-fingrow-midnight text-white"
                      : "text-fingrow-midnight/60 hover:text-fingrow-midnight"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fingrow-midnight/40" />
            <Input
              type="text"
              placeholder="Filter reports by reason, reporter, or ID..."
              value={reportSearch}
              onChange={(e) => setReportSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          {/* Reports List */}
          {filteredReports.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-fingrow-midnight/10 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-fingrow-emerald mx-auto" />
              <div className="font-bold text-sm text-fingrow-midnight">
                No reports found matching criteria
              </div>
              <p className="text-xs text-fingrow-midnight/50">
                All community content in this view is verified and compliant.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((rep) => {
                const isPending = rep.status === "pending";
                return (
                  <div
                    key={rep.id}
                    className="bg-white rounded-2xl p-5 border border-fingrow-midnight/10 shadow-finCard space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            rep.status === "pending"
                              ? "coral"
                              : rep.status === "resolved"
                              ? "emerald"
                              : "outline"
                          }
                          size="sm"
                        >
                          {rep.status.toUpperCase()}
                        </Badge>
                        <Badge variant="midnight" size="sm">
                          {rep.targetType.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-fingrow-midnight/60">
                          Reported by <strong className="text-fingrow-midnight">{rep.reporterName}</strong>
                        </span>
                      </div>
                      <span className="text-[11px] text-fingrow-midnight/50 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(rep.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-1 bg-fingrow-ivory/60 p-3.5 rounded-xl border border-fingrow-midnight/5">
                      <div className="text-xs font-semibold text-fingrow-midnight/60 uppercase tracking-wide">
                        Flag Reason:
                      </div>
                      <p className="text-sm font-bold text-fingrow-midnight leading-relaxed">
                        &quot;{rep.reason}&quot;
                      </p>
                      <div className="text-[11px] text-fingrow-midnight/50 pt-1">
                        Target Resource ID:{" "}
                        <code className="bg-white px-1.5 py-0.5 rounded border border-fingrow-midnight/10 font-mono text-fingrow-midnight">
                          {rep.targetId}
                        </code>
                      </div>
                    </div>

                    {isPending ? (
                      <div className="space-y-3 pt-1 border-t border-fingrow-midnight/5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <Input
                            type="text"
                            placeholder="Optional custom moderation notes..."
                            value={customNotes[rep.id] || ""}
                            onChange={(e) =>
                              setCustomNotes((prev) => ({
                                ...prev,
                                [rep.id]: e.target.value,
                              }))
                            }
                            className="text-xs flex-1"
                          />
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="danger"
                              disabled={actionLoading}
                              isLoading={actionLoading}
                              onClick={() => handleResolveReport(rep.id, "resolved")}
                            >
                              Resolve & Action
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionLoading}
                              onClick={() => handleResolveReport(rep.id, "dismissed")}
                            >
                              Dismiss Flag
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-fingrow-midnight/70 bg-fingrow-emerald/5 p-3 rounded-xl border border-fingrow-emerald/10">
                        <span className="flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-fingrow-emerald shrink-0" />
                          <span>
                            Resolution note: <em>{rep.resolutionNotes || "Actioned by administrator"}</em>
                          </span>
                        </span>
                        {rep.resolvedAt && (
                          <span className="text-[11px] text-fingrow-midnight/50 font-mono">
                            {new Date(rep.resolvedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. USER ROLE MANAGEMENT TAB */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-lg text-fingrow-midnight">
                User Directory & Role Promotion
              </h2>
              <p className="text-xs text-fingrow-midnight/60">
                Grant or revoke privileged roles (Educator, Institution Admin, Platform Admin).
              </p>
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-fingrow-midnight/60 font-semibold">Filter Role:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-fingrow-midnight/20 text-xs font-semibold bg-white text-fingrow-midnight focus:ring-2 focus:ring-fingrow-emerald"
              >
                <option value="all">All Roles ({users.length})</option>
                <option value="student">Students ({users.filter((u) => u.role === "student").length})</option>
                <option value="young_professional">Young Professionals ({users.filter((u) => u.role === "young_professional").length})</option>
                <option value="educator">Educators ({users.filter((u) => u.role === "educator").length})</option>
                <option value="institution_admin">Institution Admins ({users.filter((u) => u.role === "institution_admin").length})</option>
                <option value="platform_admin">Platform Admins ({users.filter((u) => u.role === "platform_admin").length})</option>
              </select>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fingrow-midnight/40" />
            <Input
              type="text"
              placeholder="Search users by name, email, or user ID..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-fingrow-midnight/10 shadow-finCard overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-fingrow-midnight text-white font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Current Role</th>
                    <th className="py-3.5 px-4">XP Points</th>
                    <th className="py-3.5 px-4">Streak</th>
                    <th className="py-3.5 px-4 text-right">Promote / Reassign Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fingrow-midnight/5 font-medium">
                  {filteredUsers.map((u) => {
                    const initials = u.name
                      ? u.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "U";

                    const roleBadgeVariant: "emerald" | "lime" | "midnight" | "coral" | "tangerine" | "yellow" =
                      u.role === "platform_admin"
                        ? "coral"
                        : u.role === "institution_admin"
                        ? "tangerine"
                        : u.role === "educator"
                        ? "lime"
                        : u.role === "young_professional"
                        ? "yellow"
                        : "emerald";

                    return (
                      <tr key={u.id} className="hover:bg-fingrow-ivory transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-fingrow-emerald/10 text-fingrow-emerald font-extrabold flex items-center justify-center text-xs shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="font-bold text-fingrow-midnight">{u.name}</div>
                              <div className="text-[11px] text-fingrow-midnight/50 font-mono">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={roleBadgeVariant} size="sm">
                            {u.role.replace("_", " ").toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-fingrow-emerald">
                          <span className="flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            {u.xp} XP
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-fingrow-midnight font-bold">
                          <span className="flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-fingrow-coral" />
                            {u.streakDays}d
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <select
                            value={u.role}
                            disabled={actionLoading}
                            onChange={(e) =>
                              handleRoleSelect(u, e.target.value as AdminUser["role"])
                            }
                            aria-label={`Change role for ${u.name}`}
                            className="px-2.5 py-1.5 rounded-xl border border-fingrow-midnight/20 text-xs font-semibold bg-white text-fingrow-midnight focus:outline-none focus:ring-2 focus:ring-fingrow-emerald disabled:opacity-50"
                          >
                            <option value="student">Student</option>
                            <option value="young_professional">Young Professional</option>
                            <option value="educator">Educator</option>
                            <option value="institution_admin">Institution Admin</option>
                            <option value="platform_admin">Platform Admin (Privileged)</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. PLATFORM AUDIT TRAIL TAB */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-lg text-fingrow-midnight">
                Immutable Platform Audit Trail
              </h2>
              <p className="text-xs text-fingrow-midnight/60">
                Complete record of security-critical actions, role alterations, and moderation updates.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAuditLogs}
                className="gap-1.5"
                aria-label="Refresh audit logs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Log</span>
              </Button>
            </div>
          </div>

          {/* Search & Action Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fingrow-midnight/40" />
              <Input
                type="text"
                placeholder="Search audit trail by actor, target, or action..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <select
              value={auditActionFilter}
              onChange={(e) => setAuditActionFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-fingrow-midnight/20 text-xs font-semibold bg-white text-fingrow-midnight focus:ring-2 focus:ring-fingrow-emerald"
            >
              <option value="all">All Actions ({logs.length})</option>
              {uniqueAuditActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-3xl border border-fingrow-midnight/10 shadow-finCard overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-fingrow-midnight text-white font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Actor</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Target Aggregate</th>
                    <th className="py-3.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fingrow-midnight/5 font-medium">
                  {filteredLogs.map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    const actionBadgeVariant: "emerald" | "coral" | "tangerine" | "midnight" =
                      log.action.includes("ROLE")
                        ? "tangerine"
                        : log.action.includes("MODERATION")
                        ? "coral"
                        : "emerald";

                    return (
                      <React.Fragment key={log.id}>
                        <tr className="hover:bg-fingrow-ivory transition-colors">
                          <td className="py-3.5 px-4 text-fingrow-midnight/60 font-mono text-[11px] whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-fingrow-midnight">{log.actorName}</div>
                            <div className="text-[10px] text-fingrow-midnight/50 font-mono">
                              {log.actorId}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant={actionBadgeVariant} size="sm">
                              {log.action}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-fingrow-midnight/70 font-mono text-[11px]">
                            {log.target}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {log.metadata && Object.keys(log.metadata).length > 0 ? (
                              <button
                                onClick={() =>
                                  setExpandedLogId(isExpanded ? null : log.id)
                                }
                                className="text-xs text-fingrow-emerald font-bold hover:underline inline-flex items-center gap-1"
                              >
                                <span>{isExpanded ? "Hide" : "Inspect"}</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>
                            ) : (
                              <span className="text-[11px] text-fingrow-midnight/40">—</span>
                            )}
                          </td>
                        </tr>

                        {isExpanded && log.metadata && (
                          <tr className="bg-fingrow-ivory/50">
                            <td colSpan={5} className="py-3 px-6">
                              <div className="bg-white p-3 rounded-xl border border-fingrow-midnight/10 font-mono text-[11px] text-fingrow-midnight space-y-1">
                                <div className="font-bold text-fingrow-midnight/60 uppercase text-[10px]">
                                  Payload Metadata:
                                </div>
                                <pre className="overflow-x-auto whitespace-pre-wrap">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
