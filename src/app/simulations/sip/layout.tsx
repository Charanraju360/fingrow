import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SIP Growth Simulator — FinGrow",
  description: "Simulate systematic investment plan returns across 5 to 30 year horizons with disciplined compounding.",
};

export default function SipLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
