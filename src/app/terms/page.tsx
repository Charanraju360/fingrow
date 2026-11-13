import React from "react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Terms of Service — FinGrow",
  description: "Terms and conditions governing the use of the FinGrow educational platform and simulations.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-sm text-fingrow-midnight/80 leading-relaxed">
      <div className="text-center space-y-2">
        <Badge variant="emerald" size="sm">TERMS OF SERVICE</Badge>
        <h1 className="text-4xl font-extrabold text-fingrow-midnight tracking-tight">Terms of Service</h1>
        <p className="text-fingrow-midnight/60 text-xs">Last updated: November 2026</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-fingrow-midnight">1. Acceptance of Terms</h2>
        <p>
          By creating an account or accessing the FinGrow platform, you agree to comply with these Terms of Service, our Community Guidelines, and our Educational Disclaimer.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-fingrow-midnight">2. Permitted Educational Use</h2>
        <p>
          FinGrow is provided strictly for educational, personal, non-commercial, and classroom instruction. You agree not to attempt reverse-engineering, exploit rate limits, submit false reports, or harass members of the educational community.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold text-fingrow-midnight">3. Community Conduct</h2>
        <p>
          Users may not promote high-risk speculative schemes, post affiliate links, share fraudulent trading signals, or offer unauthorized financial advice in community discussion forums. Content violating these standards will be immediately removed by moderators.
        </p>
      </section>
    </div>
  );
}

