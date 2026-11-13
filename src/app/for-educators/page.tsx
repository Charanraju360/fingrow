import React from "react";
import { GraduationCap, QrCode, ClipboardList, BarChart3, Users, CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QRCode } from "@/components/ui/qr-code";

export const metadata = {
  title: "FinGrow for Educators & Schools — Gamified Classroom Finance",
  description:
    "Empower your students with hands-on personal finance and economics. Create instant classrooms, generate join QR codes, assign quizzes, and track mastery.",
};

export default function ForEducatorsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-5">
        <Badge variant="emerald" size="sm">EDUCATOR & INSTITUTION SOLUTIONS</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-fingrow-midnight tracking-tight">
          Bring financial literacy to life in your classroom.
        </h1>
        <p className="text-lg text-fingrow-midnight/70 leading-relaxed font-normal">
          Assign bite-sized modules, launch live multiplayer competitions, and monitor student comprehension through exportable analytics—all 100% free for verified educators.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a href="/register?role=educator">
            <Button size="lg" variant="primary">
              Create Teacher Account
            </Button>
          </a>
          <a href="/contact">
            <Button size="lg" variant="outline">
              Request School Pilot
            </Button>
          </a>
        </div>
      </div>

      {/* Classroom Join Preview */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-fingrow-midnight/10 shadow-finElevated grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <Badge variant="lime">INSTANT ONBOARDING</Badge>
          <h2 className="text-3xl font-extrabold text-fingrow-midnight">
            Zero student email required to join.
          </h2>
          <p className="text-sm text-fingrow-midnight/70 leading-relaxed">
            Protecting student privacy is central to our platform. Teachers create a classroom in seconds and project a unique QR code on the classroom board. Students scan or enter the 6-character code to enroll instantly.
          </p>
          <ul className="space-y-2.5 pt-2 text-sm text-fingrow-midnight/80">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-fingrow-emerald" />
              <span>Unique class join codes with 1-click teacher revocation</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-fingrow-emerald" />
              <span>Compliant with student data privacy frameworks</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-fingrow-emerald" />
              <span>Real-time roster visibility & assignment progress</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col items-center justify-center p-8 bg-fingrow-ivory rounded-2xl border border-fingrow-midnight/10 text-center space-y-4">
          <span className="text-xs font-bold text-fingrow-midnight/60 uppercase tracking-wider">
            Sample Live Classroom Code
          </span>
          <QRCode value="OAK-ECON" size={160} />
          <p className="text-xs text-fingrow-midnight/60">
            Students visit <a href="/join?code=OAK-ECON" className="underline hover:text-fingrow-emerald"><code className="bg-white px-2 py-0.5 rounded font-mono text-fingrow-emerald">fingrow.dev/join</code></a> and enter code <strong>OAK-ECON</strong>
          </p>
        </div>
      </div>

      {/* Educator Features */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-fingrow-midnight">Everything You Need to Teach Finance</h2>
          <p className="text-sm text-fingrow-midnight/70">Engineered for high school economics, university business clubs, and financial literacy electives.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-fingrow-emerald/10 text-fingrow-emerald flex items-center justify-center">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-fingrow-midnight">Curated Assignments</h3>
              <p className="text-sm text-fingrow-midnight/70 leading-relaxed">
                Set due dates for specific lessons or quizzes. Students see pending deadlines directly on their dashboard.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-fingrow-lime/20 text-[#3f7700] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-fingrow-midnight">Mastery Analytics</h3>
              <p className="text-sm text-fingrow-midnight/70 leading-relaxed">
                Identify which financial concepts your class struggles with. Export clean CSV reports for your gradebook.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-fingrow-midnight/10 text-fingrow-midnight flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-fingrow-midnight">Class Competitions</h3>
              <p className="text-sm text-fingrow-midnight/70 leading-relaxed">
                Run classroom 1v1 battles or startup simulation challenges. Watch engagement skyrocket with classroom leaderboards.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

