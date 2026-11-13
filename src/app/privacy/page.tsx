import React from "react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Privacy Policy — FinGrow",
  description: "Learn how FinGrow safeguards learner, student, and educator data with strict privacy controls.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-sm text-fingrow-midnight/80 leading-relaxed">
      <div className="text-center space-y-2">
        <Badge variant="emerald" size="sm">PRIVACY MATTERS</Badge>
        <h1 className="text-4xl font-extrabold text-fingrow-midnight tracking-tight">Privacy Policy</h1>
        <p className="text-fingrow-midnight/60 text-xs">Last updated: November 2026</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-fingrow-midnight">1. Data Minimization Principle</h2>
        <p>
          FinGrow collects only the minimum information necessary to maintain your account, personalize your educational progress, and deliver classroom tools. We do not sell, rent, or monetize your personal information to third-party ad networks or brokers.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-fingrow-midnight">2. Information We Collect</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Account credentials (display name, email address, cryptographic password hash).</li>
          <li>Learning progress, quiz completion scores, earned XP, and simulation run history.</li>
          <li>Classroom enrollment codes and educator assignment submissions.</li>
          <li>Community discussion posts, comments, and reported content.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-fingrow-midnight">3. Student & Minor Privacy Safeguards</h2>
        <p>
          Students who join classrooms through an educator&apos;s unique join code or QR code are protected by strict institutional privacy bounds. Classroom progress and quiz answers are never exposed to public community feeds or search engines.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-fingrow-midnight">4. Data Deletion and Portability</h2>
        <p>
          You retain full ownership of your data. You may request account deletion or an export of your progress records at any time by contacting privacy@fingrow.dev.
        </p>
      </section>
    </div>
  );
}

