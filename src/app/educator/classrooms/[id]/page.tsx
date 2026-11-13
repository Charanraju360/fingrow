import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import {
  ArrowLeft,
  Users,
  PlusCircle,
  BarChart3,
  QrCode,
  Clock,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QRCode } from "@/components/ui/qr-code";

interface ClassroomPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassroomDetailPage({ params }: ClassroomPageProps) {
  const { id } = await params;
  const classroom = db.classrooms.getById(id);
  if (!classroom) {
    notFound();
  }

  const session = await getCurrentUser();
  const assignments = db.classrooms.getAssignments(id);
  const submissions = db.classrooms.getSubmissions(id);
  const enrolledStudents = classroom.studentIds
    .map((sId) => db.users.getById(sId))
    .filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <a
          href="/educator"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-fingrow-midnight/60 hover:text-fingrow-emerald transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Classrooms</span>
        </a>
      </div>

      {/* Classroom Header Banner */}
      <div className="bg-white rounded-3xl p-8 border border-fingrow-midnight/10 shadow-finCard flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="emerald">{classroom.subject}</Badge>
            <span className="text-xs text-fingrow-midnight/60 font-semibold">{classroom.institution}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-fingrow-midnight">{classroom.name}</h1>
          <p className="text-xs text-fingrow-midnight/60">
            Instructor: <strong>{classroom.educatorName}</strong> • Created {new Date(classroom.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a href={`/educator/classrooms/${classroom.id}/assign`}>
            <Button size="md" variant="primary">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>Assign Lesson</span>
            </Button>
          </a>
          <a href={`/educator/classrooms/${classroom.id}/reports`}>
            <Button size="md" variant="outline">
              <BarChart3 className="w-4 h-4 mr-1.5" />
              <span>Student Reports</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Join Code & QR Projection Card */}
      <div className="bg-fingrow-midnight text-white rounded-3xl p-8 border border-white/10 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-2 space-y-3">
          <Badge variant="lime" size="sm">STUDENT JOIN CODE</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Project this in your classroom
          </h2>
          <p className="text-sm text-white/70 leading-relaxed max-w-lg">
            Students visit <a href={`/join?code=${classroom.code}`} className="bg-white/10 px-2 py-0.5 rounded font-mono text-fingrow-lime underline hover:text-white transition-colors">fingrow.dev/join</a> on phone or laptop, tap &quot;Join Classroom&quot;, and scan this SVG QR or type code:
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="font-mono text-3xl font-extrabold tracking-widest text-fingrow-lime bg-white/10 px-5 py-2.5 rounded-2xl border border-white/20 select-all">
              {classroom.code}
            </div>
            <a
              href={`/join?code=${classroom.code}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-fingrow-lime hover:underline inline-flex items-center gap-1"
            >
              <span>Test student join link</span>
              <span>&rarr;</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2">
          <QRCode value={classroom.code} size={150} label={`Join Code ${classroom.code}`} />
          <span className="text-[11px] text-white/50 text-center">
            Scan with camera to auto-join
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignments List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl text-fingrow-midnight">Class Assignments ({assignments.length})</h3>
            <a href={`/educator/classrooms/${classroom.id}/assign`}>
              <Button size="sm" variant="outline" className="text-xs">
                + New Assignment
              </Button>
            </a>
          </div>

          {assignments.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-fingrow-midnight/10 text-center text-xs text-fingrow-midnight/60">
              No assignments scheduled yet. Assign your first lesson or quiz above!
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((asg) => {
                const subCount = submissions.filter((s) => s.assignmentId === asg.id).length;
                return (
                  <div
                    key={asg.id}
                    className="bg-white rounded-2xl p-5 border border-fingrow-midnight/10 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-fingrow-emerald uppercase">
                        {asg.courseSlug.replace(/-/g, " ")}
                      </span>
                      <h4 className="font-bold text-base text-fingrow-midnight">{asg.title}</h4>
                      <p className="text-xs text-fingrow-midnight/60 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Due {new Date(asg.dueDate).toLocaleDateString()}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-fingrow-emerald">
                        {subCount} / {classroom.studentIds.length} Submitted
                      </div>
                      <span className="text-[11px] text-fingrow-midnight/50">
                        {classroom.studentIds.length > 0
                          ? `${Math.round((subCount / classroom.studentIds.length) * 100)}% Complete`
                          : "Awaiting students"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Student Roster */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl text-fingrow-midnight">
            Enrolled Students ({enrolledStudents.length})
          </h3>

          <div className="bg-white rounded-3xl border border-fingrow-midnight/10 shadow-finCard divide-y divide-fingrow-midnight/5">
            {enrolledStudents.length === 0 ? (
              <div className="p-6 text-center text-xs text-fingrow-midnight/60">
                No students have joined with code <strong>{classroom.code}</strong> yet.
              </div>
            ) : (
              enrolledStudents.map((st: any) => (
                <div key={st.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-fingrow-midnight">{st.name}</h5>
                    <p className="text-xs text-fingrow-midnight/50">{st.email}</p>
                  </div>
                  <Badge variant="emerald" size="sm">{st.xp} XP</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

