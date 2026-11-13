import React, { Suspense } from "react";
import type { Metadata } from "next";
import { JoinClassroomForm } from "./join-form";

export const metadata: Metadata = {
  title: "Join Classroom — FinGrow",
  description:
    "Enter your unique 6-character classroom code to join your teacher's economics and financial literacy class.",
  openGraph: {
    title: "Join Classroom — FinGrow",
    description: "Enroll in your educator's classroom with your join code.",
    url: "https://fingrow.dev/join",
  },
};

export default function JoinClassroomPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-center text-sm text-fingrow-midnight/60">Loading classroom join portal...</div>}>
        <JoinClassroomForm />
      </Suspense>
    </div>
  );
}
