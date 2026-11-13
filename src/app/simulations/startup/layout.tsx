import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Startup Financial Builder & Runway Simulator — FinGrow",
  description: "Model cash burn rate, runway, unit economics, customer acquisition costs, and pricing strategies for a tech startup.",
};

export default function StartupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
