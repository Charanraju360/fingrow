import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investment Portfolio Simulator — FinGrow",
  description: "Practice allocating across stocks, index funds, bonds, and cash through realistic macroeconomic market cycles.",
};

export default function InvestingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
