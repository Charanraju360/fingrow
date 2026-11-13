import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "1v1 Financial Arena Battle — FinGrow Games",
  description: "Challenge friends or classmates with 6-character room codes in real-time synchronized finance battles.",
};

export default function BattleGameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
