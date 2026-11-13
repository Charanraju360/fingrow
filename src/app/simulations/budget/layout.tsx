import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monthly Budget Simulator (50/30/20) — FinGrow",
  description: "Master the 50/30/20 budget framework with realistic income brackets, fixed obligations, and lifestyle choices.",
};

export default function BudgetLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
