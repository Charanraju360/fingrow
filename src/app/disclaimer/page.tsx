import React from "react";
import { ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Educational Financial Disclaimer — FinGrow",
  description:
    "Official FinGrow statement on simulated virtual currency, absence of personalized financial advice, and educational safeguards.",
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="text-center space-y-3">
        <Badge variant="coral" size="sm">LEGAL & REGULATORY NOTICE</Badge>
        <h1 className="text-4xl font-extrabold text-fingrow-midnight tracking-tight">
          Educational & Financial Simulation Disclaimer
        </h1>
        <p className="text-fingrow-midnight/70 text-sm">
          Effective Date: November 2026 • FinGrow Platform Safeguards
        </p>
      </div>

      <Card className="border-fingrow-coral/30 bg-fingrow-coral/5">
        <CardContent className="pt-6 flex items-start gap-4">
          <ShieldAlert className="w-8 h-8 text-fingrow-coral flex-shrink-0 mt-1" />
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-fingrow-midnight">
              Summary of Platform Boundaries
            </h3>
            <p className="text-sm text-fingrow-midnight/80 leading-relaxed">
              FinGrow is an interactive educational simulation platform designed solely for informational, theoretical, and instructional purposes. FinGrow does NOT operate as a registered investment adviser, broker-dealer, financial planner, or bank.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6 text-sm text-fingrow-midnight/80 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-fingrow-midnight">1. 100% Simulated Virtual Funds</h2>
          <p>
            All financial figures, portfolio valuations, cash balances, startup revenues, and stock returns presented throughout the FinGrow website, mobile applications, and simulation scenarios represent fictional virtual currency with ZERO cash value. No real financial currency may be deposited, withdrawn, transferred, or exchanged.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-fingrow-midnight">2. No Personalized Investment Advice</h2>
          <p>
            Nothing contained in FinGrow courses, calculators, community discussions, or simulation results constitutes personalized financial, tax, accounting, or legal advice. Historical market scenarios and compound interest projections are illustrative only and cannot predict actual future performance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-fingrow-midnight">3. No Real Brokerage Transactions</h2>
          <p>
            FinGrow does not place live orders on the New York Stock Exchange, NASDAQ, or any other global exchange. Simulated order book bids and asks are designed to teach market mechanics without exposing users to counterparty risk, margin calls, or capital losses.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-fingrow-midnight">4. Consultation of Licensed Professionals</h2>
          <p>
            Before making any real-world investment, retirement contribution, debt refinancing, or significant financial decision, users should consult with a certified financial planner (CFP), licensed CPA, or registered fiduciary advisor who can assess their individual financial circumstances.
          </p>
        </section>
      </div>
    </div>
  );
}

