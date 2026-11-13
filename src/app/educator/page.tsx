import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  GraduationCap,
  PlusCircle,
  Users,
  ClipboardList,
  BarChart3,
  ArrowRight,
  QrCode,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Educator Dashboard — FinGrow",
  description: "Manage your financial literacy classrooms, assignments, and student rosters.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EducatorDashboardPage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/login");
  }

  const classrooms = db.classrooms.getByEducator(session.userId);

  const isEducatorRole =
    session.role === "educator" ||
    session.role === "institution_admin" ||
    session.role === "platform_admin";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="emerald" size="sm">EDUCATOR PORTAL</Badge>
          <h1 className="text-3xl font-extrabold text-fingrow-midnight tracking-tight">
            Classroom Management
          </h1>
          <p className="text-sm text-fingrow-midnight/70">
            {isEducatorRole
              ? `Welcome, Professor ${session.name}. Manage student rosters, assign financial quizzes, and export performance metrics.`
              : `Viewing Educator Console as ${session.name} (${session.role}). Note: To create classrooms or schedule assignments, sign in as an Educator (e.g. sarah.teacher@fingrow.dev).`}
          </p>
        </div>

        {isEducatorRole ? (
          <a href="/educator/classrooms/new">
            <Button size="lg" variant="primary">
              <PlusCircle className="w-5 h-5 mr-1.5" />
              <span>Create New Classroom</span>
            </Button>
          </a>
        ) : (
          <a href="/login">
            <Button size="sm" variant="outline">
              <span>Switch to Educator Account</span>
            </Button>
          </a>
        )}
      </div>

      {classrooms.length === 0 ? (
        <Card className="text-center p-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-fingrow-emerald/10 text-fingrow-emerald flex items-center justify-center mx-auto">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-fingrow-midnight">No Classrooms Created Yet</h3>
          <p className="text-sm text-fingrow-midnight/60 max-w-sm mx-auto">
            Create your first classroom to generate a unique join code and QR code for your students.
          </p>
          <a href="/educator/classrooms/new">
            <Button variant="primary">Create First Classroom</Button>
          </a>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map((cls) => {
            const assignments = db.classrooms.getAssignments(cls.id);
            const submissions = db.classrooms.getSubmissions(cls.id);

            return (
              <Card key={cls.id} className="hover:border-fingrow-emerald transition-all flex flex-col justify-between">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-fingrow-emerald bg-fingrow-emerald/10 px-2.5 py-1 rounded-md">
                      CODE: {cls.code}
                    </span>
                    <span className="text-xs font-semibold text-fingrow-midnight/60 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{cls.studentIds.length} Students</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-xl text-fingrow-midnight">{cls.name}</h3>
                    <p className="text-xs text-fingrow-midnight/60 mt-0.5">{cls.subject} • {cls.institution}</p>
                  </div>

                  <div className="p-3 bg-fingrow-ivory rounded-xl text-xs space-y-1.5 font-medium">
                    <div className="flex justify-between text-fingrow-midnight/70">
                      <span>Curriculum Assignments:</span>
                      <strong className="text-fingrow-midnight">{assignments.length}</strong>
                    </div>
                    <div className="flex justify-between text-fingrow-midnight/70">
                      <span>Submitted Quizzes:</span>
                      <strong className="text-fingrow-emerald">{submissions.length}</strong>
                    </div>
                  </div>
                </CardContent>

                <div className="p-6 pt-0 space-y-2">
                  <a href={`/educator/classrooms/${cls.id}`} className="block">
                    <Button variant="primary" className="w-full justify-between text-xs">
                      <span>Open Classroom Console</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                  <a href={`/educator/classrooms/${cls.id}/reports`} className="block">
                    <Button variant="outline" className="w-full justify-between text-xs">
                      <span>View Performance Reports</span>
                      <BarChart3 className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

