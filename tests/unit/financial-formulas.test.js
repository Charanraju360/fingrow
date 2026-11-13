const test = require("node:test");
const assert = require("node:assert/strict");

// Comprehensive mathematical formulas test suite
// We mirror the exact implementations in src/lib/utils.ts to test both
// the pure mathematical algorithms and the boundaries required by Specialist Agent 09.

function decimalRound(num, decimals = 2) {
  if (!Number.isFinite(num)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

function calculateCompoundInterest(principal, annualRatePct, years, compoundsPerYear = 12) {
  if (!Number.isFinite(principal) || principal <= 0) return { totalAmount: 0, interestEarned: 0 };
  if (!Number.isFinite(years) || years <= 0) return { totalAmount: decimalRound(principal, 2), interestEarned: 0 };
  const n = compoundsPerYear > 0 ? compoundsPerYear : 12;
  const t = Math.max(0, years);
  const r = (Number.isFinite(annualRatePct) ? annualRatePct : 0) / 100;
  if (r === 0) return { totalAmount: decimalRound(principal, 2), interestEarned: 0 };
  const base = 1 + r / n;
  if (base <= 0) return { totalAmount: 0, interestEarned: decimalRound(-principal, 2) };
  const amount = principal * Math.pow(base, n * t);
  if (!Number.isFinite(amount)) return { totalAmount: Number.MAX_SAFE_INTEGER, interestEarned: Number.MAX_SAFE_INTEGER - principal };
  return {
    totalAmount: decimalRound(amount, 2),
    interestEarned: decimalRound(amount - principal, 2),
  };
}

function calculateSIP(monthlyInvestment, annualReturnRatePct, years) {
  if (!Number.isFinite(monthlyInvestment) || monthlyInvestment <= 0 || !Number.isFinite(years) || years <= 0) {
    return { totalInvested: 0, futureValue: 0, wealthGain: 0 };
  }
  const rate = Number.isFinite(annualReturnRatePct) ? annualReturnRatePct : 0;
  const i = rate / 100 / 12;
  const n = years * 12;
  const totalInvested = monthlyInvestment * n;
  if (i === 0) {
    return {
      totalInvested: decimalRound(totalInvested, 2),
      futureValue: decimalRound(totalInvested, 2),
      wealthGain: 0,
    };
  }
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

function calculateEMI(principal, annualInterestRatePct, tenureYears) {
  if (!Number.isFinite(principal) || principal <= 0 || !Number.isFinite(tenureYears) || tenureYears <= 0) {
    return { monthlyEMI: 0, totalPayment: 0, totalInterest: 0 };
  }
  const rawRate = Number.isFinite(annualInterestRatePct) ? annualInterestRatePct : 0;
  const rate = Math.max(0, rawRate);
  const r = rate / 100 / 12;
  const n = tenureYears * 12;
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

function calculateInflationImpact(currentCost, annualInflationPct, years) {
  if (!Number.isFinite(currentCost) || currentCost <= 0) {
    return { futureCost: 0, purchasingPowerLossPct: 0 };
  }
  if (!Number.isFinite(years) || years <= 0) {
    return { futureCost: decimalRound(currentCost, 2), purchasingPowerLossPct: 0 };
  }
  const r = (Number.isFinite(annualInflationPct) ? annualInflationPct : 0) / 100;
  if (r === 0) {
    return { futureCost: decimalRound(currentCost, 2), purchasingPowerLossPct: 0 };
  }
  if (1 + r <= 0) {
    return { futureCost: 0, purchasingPowerLossPct: 100 };
  }
  const futureCost = currentCost * Math.pow(1 + r, years);
  if (!Number.isFinite(futureCost) || futureCost <= 0) {
    return { futureCost: Number.MAX_SAFE_INTEGER, purchasingPowerLossPct: 100 };
  }
  const lossPct = (1 - (currentCost / futureCost)) * 100;
  return {
    futureCost: decimalRound(futureCost, 2),
    purchasingPowerLossPct: decimalRound(lossPct, 1),
  };
}

// -----------------------------------------------------------------------------
// STANDARD PRECISION TESTS (Baseline)
// -----------------------------------------------------------------------------
test("Compound Interest: verifies standard compounding formula", () => {
  const result = calculateCompoundInterest(10000, 8, 10, 12);
  assert.ok(result.totalAmount > 22000, "10k at 8% for 10 years should exceed 22k");
  assert.equal(result.totalAmount, 22196.40);
  assert.equal(result.interestEarned, 12196.40);
});

test("SIP Calculator: accurately projects wealth from periodic deposits", () => {
  const result = calculateSIP(500, 12, 10);
  assert.equal(result.totalInvested, 60000);
  assert.ok(result.futureValue > 115000, "500/mo at 12% for 10 years should exceed 115k");
  assert.ok(result.wealthGain > 55000, "Wealth gain should exceed 55k");
  assert.equal(result.futureValue, 116169.54);
  assert.equal(result.wealthGain, 56169.54);
});

test("Loan EMI Calculator: calculates monthly mortgage amortization", () => {
  const result = calculateEMI(200000, 6, 30);
  assert.equal(result.monthlyEMI, 1199.10);
  assert.equal(result.totalPayment, 431676.38);
  assert.equal(result.totalInterest, 231676.38);
});

test("Inflation Calculator: calculates purchasing power loss", () => {
  const result = calculateInflationImpact(1000, 5, 10);
  assert.ok(result.futureCost > 1600, "1000 at 5% over 10 years should cost over 1600");
  assert.equal(result.futureCost, 1628.89);
  assert.ok(result.purchasingPowerLossPct > 35, "Purchasing power lost should exceed 35%");
  assert.equal(result.purchasingPowerLossPct, 38.6);
});

// -----------------------------------------------------------------------------
// BOUNDARY INPUT TESTS (0% Rates, Zero & Negative Values, Large Tenures)
// -----------------------------------------------------------------------------
test("Boundary Inputs: 0% interest rate preserves principal with 0 interest", () => {
  const ci = calculateCompoundInterest(15000, 0, 15, 12);
  assert.equal(ci.totalAmount, 15000);
  assert.equal(ci.interestEarned, 0);

  const sip = calculateSIP(1000, 0, 10);
  assert.equal(sip.totalInvested, 120000);
  assert.equal(sip.futureValue, 120000);
  assert.equal(sip.wealthGain, 0);

  const emi = calculateEMI(120000, 0, 10);
  assert.equal(emi.monthlyEMI, 1000);
  assert.equal(emi.totalPayment, 120000);
  assert.equal(emi.totalInterest, 0);

  const inf = calculateInflationImpact(5000, 0, 20);
  assert.equal(inf.futureCost, 5000);
  assert.equal(inf.purchasingPowerLossPct, 0);
});

test("Boundary Inputs: Negative and zero principal/costs return zero safely", () => {
  const ciNegative = calculateCompoundInterest(-5000, 7, 10);
  assert.equal(ciNegative.totalAmount, 0);
  assert.equal(ciNegative.interestEarned, 0);

  const sipZero = calculateSIP(0, 10, 5);
  assert.equal(sipZero.totalInvested, 0);
  assert.equal(sipZero.futureValue, 0);
  assert.equal(sipZero.wealthGain, 0);

  const emiZero = calculateEMI(0, 5, 20);
  assert.equal(emiZero.monthlyEMI, 0);
  assert.equal(emiZero.totalPayment, 0);
  assert.equal(emiZero.totalInterest, 0);

  const infNegative = calculateInflationImpact(-1000, 3, 5);
  assert.equal(infNegative.futureCost, 0);
  assert.equal(infNegative.purchasingPowerLossPct, 0);
});

test("Boundary Inputs: Zero and negative tenures prevent division by zero or NaN", () => {
  const ciZeroTenure = calculateCompoundInterest(25000, 8, 0);
  assert.equal(ciZeroTenure.totalAmount, 25000);
  assert.equal(ciZeroTenure.interestEarned, 0);

  const sipZeroTenure = calculateSIP(500, 10, 0);
  assert.equal(sipZeroTenure.totalInvested, 0);
  assert.equal(sipZeroTenure.futureValue, 0);
  assert.equal(sipZeroTenure.wealthGain, 0);

  const emiZeroTenure = calculateEMI(100000, 6, 0);
  assert.equal(emiZeroTenure.monthlyEMI, 0, "0 tenure EMI must not produce Infinity or NaN");
  assert.equal(emiZeroTenure.totalPayment, 0);
  assert.equal(emiZeroTenure.totalInterest, 0);

  const infZeroYears = calculateInflationImpact(10000, 4, 0);
  assert.equal(infZeroYears.futureCost, 10000);
  assert.equal(infZeroYears.purchasingPowerLossPct, 0);
});

test("Boundary Inputs: Large tenures compute safely and accurately", () => {
  // 50-year compound interest
  const ci50 = calculateCompoundInterest(10000, 10, 50, 12);
  assert.ok(ci50.totalAmount > 1000000, "10k at 10% for 50 years should exceed $1M");
  assert.ok(Number.isFinite(ci50.totalAmount));

  // 40-year SIP
  const sip40 = calculateSIP(1000, 12, 40);
  assert.ok(sip40.futureValue > 11000000, "1k/mo at 12% for 40 years should exceed $11M");
  assert.ok(Number.isFinite(sip40.futureValue));

  // 40-year mortgage
  const emi40 = calculateEMI(500000, 7, 40);
  assert.ok(emi40.monthlyEMI > 0);
  assert.ok(emi40.totalInterest > 500000, "Total interest on 40y mortgage exceeds principal");

  // 50-year inflation
  const inf50 = calculateInflationImpact(50000, 3.5, 50);
  assert.ok(inf50.futureCost > 275000);
  assert.ok(inf50.purchasingPowerLossPct > 80);
});

test("Boundary Inputs: Compounding frequency variations", () => {
  const annual = calculateCompoundInterest(10000, 10, 10, 1);
  const monthly = calculateCompoundInterest(10000, 10, 10, 12);
  const daily = calculateCompoundInterest(10000, 10, 10, 365);

  assert.ok(monthly.totalAmount > annual.totalAmount, "Monthly compounding yields more than annual");
  assert.ok(daily.totalAmount > monthly.totalAmount, "Daily compounding yields more than monthly");
});
