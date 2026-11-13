import React from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  ArrowLeft,
  BarChart3,
  Users,
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExportGradebookButton, GradebookRow } from "@/components/educator/export-gradebook-button";

interface ClassroomReportsPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Classroom Gradebook & Reports — FinGrow",
  description: "Detailed student progress, quiz comprehension, and CSV gradebook export.",
};

export default async function ClassroomReportsPage({ params }: ClassroomReportsPageProps) {
  const { id } = await params;
  const session = await getCurrentUser();
  if (!session) {
    redirect("/login");
  }

  const classroom = db.classrooms.getById(id);
  if (!classroom) {
    notFound();
  }

  const assignments = db.classrooms.getAssignments(id);
  const submissions = db.classrooms.getSubmissions(id);
  const enrolledStudents = classroom.studentIds
    .map((sId) => db.users.getById(sId))
    .filter(Boolean);

  // Compute live student rows
  const realRows: GradebookRow[] = enrolledStudents.map((st: any) => {
    const studentSubs = submissions.filter((s) => s.studentId === st.id);
    const completedCount = studentSubs.length;
    const avgScore =
      completedCount > 0
        ? Math.round(studentSubs.reduce((sum, s) => sum + s.score, 0) / completedCount)
        : 0;

    const lastActive =
      studentSubs.length > 0
        ? new Date(studentSubs[studentSubs.length - 1].completedAt).toISOString().split("T")[0]
        : st.lastActiveDate || "Awaiting submission";

    let status = "Pending";
    if (completedCount > 0) {
      if (avgScore >= 90) status = "Mastery";
      else if (avgScore >= 70) status = "On Track";
      else status = "Needs Support";
    }

    return {
      studentName: st.name,
      studentEmail: st.email,
      completedCount,
      averageScore: completedCount > 0 ? avgScore : "N/A",
      lastActive,
      status,
    };
  });

  // Sample cohort data fallback for previewing gradebook when no students are enrolled yet
  const sampleFallbackRows: GradebookRow[] = [
    { studentName: "Alex Chen (Sample)", studentEmail: "alex.student@fingrow.dev", completedCount: 2, averageScore: 92, lastActive: "2026-11-12", status: "Mastery" },
    { studentName: "Jordan Hayes (Sample)", studentEmail: "jordan.h@school.edu", completedCount: 2, averageScore: 85, lastActive: "2026-11-10", status: "On Track" },
    { studentName: "Maya Lin (Sample)", studentEmail: "maya.l@school.edu", completedCount: 2, averageScore: 100, lastActive: "2026-11-11", status: "Mastery" },
    { studentName: "Ethan Morales (Sample)", studentEmail: "ethan.m@school.edu", completedCount: 1, averageScore: 68, lastActive: "2026-11-05", status: "Needs Support" },
  ];

  const hasRealStudents = realRows.length > 0;
  const activeRows = hasRealStudents ? realRows : sampleFallbackRows;

  // KPI Calculations
  let classAverageScore = "N/A";
  let completionRate = "0%";
  let passingPercentage = "100%";

  if (hasRealStudents) {
    if (submissions.length > 0) {
      const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
      classAverageScore = `${Math.round(totalScore / submissions.length)}%`;
      const passingSubs = submissions.filter((s) => s.score >= 70).length;
      passingPercentage = `${Math.round((passingSubs / submissions.length) * 100)}%`;
    }

    if (assignments.length > 0 && enrolledStudents.length > 0) {
      const maxPossible = assignments.length * enrolledStudents.length;
      completionRate = `${Math.min(100, Math.round((submissions.length / maxPossible) * 100))}%`;
    }
  } else {
    // Demo metrics based on sample cohort
    classAverageScore = "86.3%";
    completionRate = "87.5%";
    passingPercentage = "75%";
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <a
          href={`/educator/classrooms/${classroom.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-fingrow-midnight/60 hover:text-fingrow-emerald transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Classroom Console</span>
        </a>

        <ExportGradebookButton
          classroomId={classroom.id}
          classroomName={classroom.name}
          rows={activeRows}
        />
      </div>

      {/* Classroom Banner */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="emerald" size="sm">ANALYTICS & GRADEBOOK</Badge>
          <span className="font-mono text-xs font-bold text-fingrow-emerald bg-fingrow-emerald/10 px-2 py-0.5 rounded">
            CODE: {classroom.code}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-fingrow-midnight tracking-tight">
          {classroom.name} — Progress Report
        </h1>
        <p className="text-sm text-fingrow-midnight/70">
          {classroom.subject} • {classroom.institution} • Instructor: {classroom.educatorName}
        </p>
      </div>

      {!hasRealStudents && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 flex items-start gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Cohort Preview Mode:</span>
            <p className="text-amber-800">
              No students have enrolled in <strong>{classroom.code}</strong> yet. You are viewing sample cohort analytics below so you can preview gradebook scoring and test the CSV export.
            </p>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="bg-white">
          <CardContent className="pt-6 space-y-1">
            <span className="text-xs font-bold text-fingrow-midnight/60 uppercase">Class Average Score</span>
            <div className="text-3xl font-extrabold text-fingrow-emerald">{classAverageScore}</div>
            <p className="text-[11px] text-fingrow-midnight/60">
              {hasRealStudents ? `${submissions.length} completed quiz submissions` : "Based on sample cohort"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="pt-6 space-y-1">
            <span className="text-xs font-bold text-fingrow-midnight/60 uppercase">Assignment Completion</span>
            <div className="text-3xl font-extrabold text-fingrow-midnight">{completionRate}</div>
            <p className="text-[11px] text-fingrow-midnight/60">
              {assignments.length} assignments scheduled
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="pt-6 space-y-1">
            <span className="text-xs font-bold text-fingrow-midnight/60 uppercase">Mastery Benchmark</span>
            <div className="text-3xl font-extrabold text-[#3f7700]">{passingPercentage} Passing</div>
            <p className="text-[11px] text-fingrow-midnight/60">Benchmark: ≥70% score on quizzes</p>
          </CardContent>
        </Card>
      </div>

      {/* Student Performance Table */}
      <div className="bg-white rounded-3xl border border-fingrow-midnight/10 shadow-finCard overflow-hidden">
        <div className="px-6 py-4 border-b border-fingrow-midnight/10 flex items-center justify-between">
          <h2 className="font-bold text-base text-fingrow-midnight flex items-center gap-2">
            <Users className="w-4 h-4 text-fingrow-emerald" />
            <span>Student Gradebook ({activeRows.length})</span>
          </h2>
          <span className="text-xs text-fingrow-midnight/60 font-medium">
            Export format: CSV UTF-8
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-fingrow-midnight text-white font-bold uppercase tracking-wider">
                <th className="py-3.5 px-6">Student</th>
                <th className="py-3.5 px-6">Quizzes Finished</th>
                <th className="py-3.5 px-6">Average Score</th>
                <th className="py-3.5 px-6">Last Activity</th>
                <th className="py-3.5 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fingrow-midnight/5 font-medium">
              {activeRows.map((row, i) => (
                <tr key={i} className="hover:bg-fingrow-ivory transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-fingrow-midnight">{row.studentName}</div>
                    <div className="text-[11px] text-fingrow-midnight/50">{row.studentEmail}</div>
                  </td>
                  <td className="py-4 px-6 text-fingrow-midnight font-bold">
                    {row.completedCount} / {Math.max(1, assignments.length)}
                  </td>
                  <td className="py-4 px-6 font-bold text-fingrow-emerald">
                    {typeof row.averageScore === "number" ? `${row.averageScore}%` : row.averageScore}
                  </td>
                  <td className="py-4 px-6 text-fingrow-midnight/60">{row.lastActive}</td>
                  <td className="py-4 px-6 text-right">
                    <Badge
                      variant={
                        row.status === "Mastery"
                          ? "lime"
                          : row.status === "On Track"
                          ? "emerald"
                          : row.status === "Needs Support"
                          ? "coral"
                          : "outline"
                      }
                      size="sm"
                    >
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
