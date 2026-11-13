import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  if (!Number.isFinite(amount)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyWithCents(amount: number, currency: string = "USD"): string {
  if (!Number.isFinite(amount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (!Number.isFinite(num)) return "0";
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatPercent(value: number, decimals: number = 1): string {
  if (!Number.isFinite(value)) return "0.0%";
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

// Decimal-safe calculations to avoid floating point inaccuracies in simulations
export function decimalRound(num: number, decimals: number = 2): number {
  if (!Number.isFinite(num)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

// -----------------------------------------------------------------------------
// 1. COMPOUND INTEREST FORMULA: A = P * (1 + r/n)^(nt)
// -----------------------------------------------------------------------------
export function calculateCompoundInterest(
  principal: number,
  annualRatePct: number,
  years: number,
  compoundsPerYear: number = 12
): { totalAmount: number; interestEarned: number } {
  // Boundary validation
  if (!Number.isFinite(principal) || principal <= 0) {
    return { totalAmount: 0, interestEarned: 0 };
  }
  if (!Number.isFinite(years) || years <= 0) {
    return {
      totalAmount: decimalRound(principal, 2),
      interestEarned: 0,
    };
  }

  const n = compoundsPerYear > 0 ? compoundsPerYear : 12;
  const t = Math.max(0, years);
  const r = (Number.isFinite(annualRatePct) ? annualRatePct : 0) / 100;

  // 0% interest rate boundary
  if (r === 0) {
    return {
      totalAmount: decimalRound(principal, 2),
      interestEarned: 0,
    };
  }

  // Handle negative interest rate or depreciation
  const base = 1 + r / n;
  if (base <= 0) {
    return {
      totalAmount: 0,
      interestEarned: decimalRound(-principal, 2),
    };
  }

  const exponent = n * t;
  const amount = principal * Math.pow(base, exponent);

  if (!Number.isFinite(amount)) {
    return {
      totalAmount: Number.MAX_SAFE_INTEGER,
      interestEarned: Number.MAX_SAFE_INTEGER - principal,
    };
  }

  return {
    totalAmount: decimalRound(amount, 2),
    interestEarned: decimalRound(amount - principal, 2),
  };
}

export interface CompoundMilestone {
  year: number;
  principal: number;
  balance: number;
  interestEarned: number;
}

export function getCompoundInterestSchedule(
  principal: number,
  annualRatePct: number,
  years: number,
  compoundsPerYear: number = 12
): CompoundMilestone[] {
  const safeYears = Math.min(100, Math.max(1, Math.round(years || 1)));
  const milestones: CompoundMilestone[] = [];
  
  // Choose key milestone years based on duration
  const step = safeYears <= 10 ? 1 : safeYears <= 25 ? 2 : safeYears <= 50 ? 5 : 10;
  
  for (let y = step; y <= safeYears; y += step) {
    const res = calculateCompoundInterest(principal, annualRatePct, y, compoundsPerYear);
    milestones.push({
      year: y,
      principal: decimalRound(principal, 2),
      balance: res.totalAmount,
      interestEarned: res.interestEarned,
    });
  }

  // Ensure final year is included
  if (milestones.length === 0 || milestones[milestones.length - 1].year !== safeYears) {
    const finalRes = calculateCompoundInterest(principal, annualRatePct, safeYears, compoundsPerYear);
    milestones.push({
      year: safeYears,
      principal: decimalRound(principal, 2),
      balance: finalRes.totalAmount,
      interestEarned: finalRes.interestEarned,
    });
  }

  return milestones;
}

// -----------------------------------------------------------------------------
// 2. SIP WEALTH FORMULA: FV = P * [((1 + i)^n - 1) / i] * (1 + i)
// -----------------------------------------------------------------------------
export function calculateSIP(
  monthlyInvestment: number,
  annualReturnRatePct: number,
  years: number
): {
  totalInvested: number;
  futureValue: number;
  wealthGain: number;
} {
  // Boundary validation
  if (!Number.isFinite(monthlyInvestment) || monthlyInvestment <= 0 || !Number.isFinite(years) || years <= 0) {
    return {
      totalInvested: 0,
      futureValue: 0,
      wealthGain: 0,
    };
  }

  const rate = Number.isFinite(annualReturnRatePct) ? annualReturnRatePct : 0;
  const i = rate / 100 / 12;
  const n = years * 12;
  const totalInvested = monthlyInvestment * n;

  // 0% return boundary
  if (i === 0) {
    return {
      totalInvested: decimalRound(totalInvested, 2),
      futureValue: decimalRound(totalInvested, 2),
      wealthGain: 0,
    };
  }

  // Handle severe negative return boundary
  if (1 + i <= 0) {
    return {
      totalInvested: decimalRound(totalInvested, 2),
      futureValue: 0,
      wealthGain: decimalRound(-totalInvested, 2),
    };
  }

  const fv = monthlyInvestment * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);

  if (!Number.isFinite(fv)) {
    return {
      totalInvested: decimalRound(totalInvested, 2),
      futureValue: Number.MAX_SAFE_INTEGER,
      wealthGain: Number.MAX_SAFE_INTEGER - totalInvested,
    };
  }

  return {
    totalInvested: decimalRound(totalInvested, 2),
    futureValue: decimalRound(Math.max(0, fv), 2),
    wealthGain: decimalRound(Math.max(0, fv) - totalInvested, 2),
  };
}

export interface SIPMilestone {
  year: number;
  totalInvested: number;
  futureValue: number;
  wealthGain: number;
}

export function getSIPSchedule(
  monthlyInvestment: number,
  annualReturnRatePct: number,
  years: number
): SIPMilestone[] {
  const safeYears = Math.min(100, Math.max(1, Math.round(years || 1)));
  const milestones: SIPMilestone[] = [];
  const step = safeYears <= 10 ? 1 : safeYears <= 25 ? 2 : safeYears <= 50 ? 5 : 10;

  for (let y = step; y <= safeYears; y += step) {
    const res = calculateSIP(monthlyInvestment, annualReturnRatePct, y);
    milestones.push({
      year: y,
      totalInvested: res.totalInvested,
      futureValue: res.futureValue,
      wealthGain: res.wealthGain,
    });
  }

  if (milestones.length === 0 || milestones[milestones.length - 1].year !== safeYears) {
    const finalRes = calculateSIP(monthlyInvestment, annualReturnRatePct, safeYears);
    milestones.push({
      year: safeYears,
      totalInvested: finalRes.totalInvested,
      futureValue: finalRes.futureValue,
      wealthGain: finalRes.wealthGain,
    });
  }

  return milestones;
}

// -----------------------------------------------------------------------------
// 3. LOAN EMI FORMULA: EMI = [P * r * (1+r)^n] / [(1+r)^n - 1]
// -----------------------------------------------------------------------------
export function calculateEMI(
  principal: number,
  annualInterestRatePct: number,
  tenureYears: number
): {
  monthlyEMI: number;
  totalPayment: number;
  totalInterest: number;
} {
  // Boundary validation
  if (!Number.isFinite(principal) || principal <= 0 || !Number.isFinite(tenureYears) || tenureYears <= 0) {
    return {
      monthlyEMI: 0,
      totalPayment: 0,
      totalInterest: 0,
    };
  }

  const rawRate = Number.isFinite(annualInterestRatePct) ? annualInterestRatePct : 0;
  const rate = Math.max(0, rawRate);
  const r = rate / 100 / 12;
  const n = tenureYears * 12;

  // 0% interest rate boundary (0% promotional financing)
  if (r === 0) {
    const emi = n > 0 ? principal / n : 0;
    return {
      monthlyEMI: decimalRound(emi, 2),
      totalPayment: decimalRound(principal, 2),
      totalInterest: 0,
    };
  }

  const factor = Math.pow(1 + r, n);
  if (!Number.isFinite(factor) || factor <= 1) {
    const emi = principal / n;
    return {
      monthlyEMI: decimalRound(emi, 2),
      totalPayment: decimalRound(principal, 2),
      totalInterest: 0,
    };
  }

  const emi = (principal * r * factor) / (factor - 1);
  const totalPayment = emi * n;

  return {
    monthlyEMI: decimalRound(emi, 2),
    totalPayment: decimalRound(totalPayment, 2),
    totalInterest: decimalRound(totalPayment - principal, 2),
  };
}

export interface EMIAmortizationMilestone {
  year: number;
  yearlyPaid: number;
  principalPaidYear: number;
  interestPaidYear: number;
  remainingBalance: number;
}

export function getEMIAmortizationSchedule(
  principal: number,
  annualInterestRatePct: number,
  tenureYears: number
): EMIAmortizationMilestone[] {
  const safeYears = Math.min(50, Math.max(1, Math.round(tenureYears || 1)));
  const { monthlyEMI } = calculateEMI(principal, annualInterestRatePct, safeYears);
  
  if (monthlyEMI <= 0) return [];

  const r = Math.max(0, annualInterestRatePct || 0) / 100 / 12;
  let currentBalance = principal;
  const milestones: EMIAmortizationMilestone[] = [];

  for (let y = 1; y <= safeYears; y++) {
    let yearPrincipal = 0;
    let yearInterest = 0;

    for (let m = 0; m < 12; m++) {
      if (currentBalance <= 0) break;
      const monthInterest = currentBalance * r;
      const monthPrincipal = Math.min(currentBalance, monthlyEMI - monthInterest);
      yearInterest += monthInterest;
      yearPrincipal += monthPrincipal;
      currentBalance -= monthPrincipal;
    }

    milestones.push({
      year: y,
      yearlyPaid: decimalRound(yearPrincipal + yearInterest, 2),
      principalPaidYear: decimalRound(yearPrincipal, 2),
      interestPaidYear: decimalRound(yearInterest, 2),
      remainingBalance: decimalRound(Math.max(0, currentBalance), 2),
    });
  }

  return milestones;
}

// -----------------------------------------------------------------------------
// 4. INFLATION PURCHASING POWER: Future value adjusted for inflation
// -----------------------------------------------------------------------------
export function calculateInflationImpact(
  currentCost: number,
  annualInflationPct: number,
  years: number
): {
  futureCost: number;
  purchasingPowerLossPct: number;
} {
  // Boundary validation
  if (!Number.isFinite(currentCost) || currentCost <= 0) {
    return {
      futureCost: 0,
      purchasingPowerLossPct: 0,
    };
  }
  if (!Number.isFinite(years) || years <= 0) {
    return {
      futureCost: decimalRound(currentCost, 2),
      purchasingPowerLossPct: 0,
    };
  }

  const r = (Number.isFinite(annualInflationPct) ? annualInflationPct : 0) / 100;

  // 0% inflation boundary
  if (r === 0) {
    return {
      futureCost: decimalRound(currentCost, 2),
      purchasingPowerLossPct: 0,
    };
  }

  // Handle severe negative inflation (deflation beyond -100%)
  if (1 + r <= 0) {
    return {
      futureCost: 0,
      purchasingPowerLossPct: 100,
    };
  }

  const futureCost = currentCost * Math.pow(1 + r, years);

  if (!Number.isFinite(futureCost) || futureCost <= 0) {
    return {
      futureCost: Number.MAX_SAFE_INTEGER,
      purchasingPowerLossPct: 100,
    };
  }

  const lossPct = (1 - (currentCost / futureCost)) * 100;

  return {
    futureCost: decimalRound(futureCost, 2),
    purchasingPowerLossPct: decimalRound(lossPct, 1),
  };
}

export interface InflationMilestone {
  year: number;
  futureCost: number;
  purchasingPowerMultiplier: number;
  lossPct: number;
}

export function getInflationSchedule(
  currentCost: number,
  annualInflationPct: number,
  years: number
): InflationMilestone[] {
  const safeYears = Math.min(60, Math.max(1, Math.round(years || 1)));
  const milestones: InflationMilestone[] = [];
  const step = safeYears <= 10 ? 1 : safeYears <= 25 ? 2 : safeYears <= 50 ? 5 : 10;

  for (let y = step; y <= safeYears; y += step) {
    const res = calculateInflationImpact(currentCost, annualInflationPct, y);
    const multiplier = res.futureCost > 0 ? decimalRound(currentCost / res.futureCost, 2) : 0;
    milestones.push({
      year: y,
      futureCost: res.futureCost,
      purchasingPowerMultiplier: multiplier,
      lossPct: res.purchasingPowerLossPct,
    });
  }

  if (milestones.length === 0 || milestones[milestones.length - 1].year !== safeYears) {
    const finalRes = calculateInflationImpact(currentCost, annualInflationPct, safeYears);
    const multiplier = finalRes.futureCost > 0 ? decimalRound(currentCost / finalRes.futureCost, 2) : 0;
    milestones.push({
      year: safeYears,
      futureCost: finalRes.futureCost,
      purchasingPowerMultiplier: multiplier,
      lossPct: finalRes.purchasingPowerLossPct,
    });
  }

  return milestones;
}
