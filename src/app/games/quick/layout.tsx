import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fast-Paced Financial Quiz Battle — FinGrow Games",
  description: "Test your financial instincts in rapid 60-second quiz sessions. Master stocks, compounding, and budgeting concepts.",
};

export default function QuickGameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
