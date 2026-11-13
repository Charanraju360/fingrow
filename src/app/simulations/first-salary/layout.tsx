import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "First Salary Simulator — FinGrow",
  description: "Interactive simulation for managing your first paycheck, taxes, rent, living costs, and emergency funds.",
};

export default function FirstSalaryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
