import React from "react";
import { ShieldCheck, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function VirtualDisclaimerBanner({
  scenarioName,
  assumptions = [],
}: {
  scenarioName?: string;
  assumptions?: string[];
}) {
  return (
    <div className="rounded-2xl border border-fingrow-emerald/20 bg-fingrow-emerald/5 p-4 sm:p-5 text-fingrow-midnight space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="lime" size="sm" className="font-extrabold tracking-wider uppercase text-[10px]">
            100% VIRTUAL PLAY CURRENCY
          </Badge>
          <span className="text-xs font-bold text-fingrow-emerald flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-fingrow-emerald" />
            Zero Real Money Involved
          </span>
        </div>
        <span className="text-[11px] font-medium text-fingrow-midnight/60">
          Educational Sandbox • Non-Advisory
        </span>
      </div>

      <p className="text-xs text-fingrow-midnight/80 leading-relaxed">
        {scenarioName ? <strong>{scenarioName}: </strong> : null}
        All monetary balances, assets, returns, and transactions in this simulator are strictly virtual play numbers generated for financial literacy training. FinGrow is an educational platform, not a registered broker-dealer, financial advisor, or bank. Past simulated outcomes do not predict real-world financial performance.
      </p>

      {assumptions.length > 0 && (
        <div className="pt-2 border-t border-fingrow-midnight/10 space-y-1">
          <div className="text-[11px] font-bold text-fingrow-midnight/70 flex items-center gap-1 uppercase tracking-wider">
            <Info className="w-3.5 h-3.5 text-fingrow-emerald" /> Transparent Simulation Assumptions:
          </div>
          <ul className="list-disc list-inside text-xs text-fingrow-midnight/70 space-y-0.5">
            {assumptions.map((asm, i) => (
              <li key={i}>{asm}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function VirtualFundsBadge({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-fingrow-lime/20 text-[#2f5a00] border border-fingrow-lime/40 ${className || ""}`}
      title="This figure is 100% virtual currency for learning purposes."
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#3f7700] animate-pulse" />
      Virtual Play Money
    </span>
  );
}
