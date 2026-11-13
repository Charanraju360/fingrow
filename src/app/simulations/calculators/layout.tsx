import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial Calculators (Compound Interest, SIP, EMI, Inflation) — FinGrow",
  description: "Accurate, mathematical calculators for compound growth, SIP wealth accumulation, loan EMI amortization, and inflation erosion.",
};

export default function CalculatorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
