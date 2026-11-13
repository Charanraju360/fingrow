import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateCompoundInterest,
  calculateSIP,
  calculateEMI,
  calculateInflationImpact,
  getCompoundInterestSchedule,
  getSIPSchedule,
  getEMIAmortizationSchedule,
  getInflationSchedule,
  decimalRound,
  formatCurrency,
  formatPercent,
} from "../../src/lib/utils.ts";

test("src/lib/utils: calculateCompoundInterest with precision and schedules", () => {
  const res = calculateCompoundInterest(10000, 8, 10, 12);
  assert.equal(res.totalAmount, 22196.40);
  assert.equal(res.interestEarned, 12196.40);

  // Boundary 0%
  const zeroRate = calculateCompoundInterest(5000, 0, 5);
  assert.equal(zeroRate.totalAmount, 5000);
  assert.equal(zeroRate.interestEarned, 0);

  // Boundary 0 years
  const zeroYears = calculateCompoundInterest(5000, 10, 0);
  assert.equal(zeroYears.totalAmount, 5000);
  assert.equal(zeroYears.interestEarned, 0);

  // Negative inputs
  const negP = calculateCompoundInterest(-1000, 5, 5);
  assert.equal(negP.totalAmount, 0);
  assert.equal(negP.interestEarned, 0);

  // Schedule
  const schedule = getCompoundInterestSchedule(10000, 8, 10, 12);
  assert.ok(schedule.length > 0);
  const last = schedule[schedule.length - 1];
  assert.equal(last.year, 10);
  assert.equal(last.balance, 22196.40);
});

test("src/lib/utils: calculateSIP with precision, boundaries and schedules", () => {
  const res = calculateSIP(500, 12, 10);
  assert.equal(res.totalInvested, 60000);
  assert.equal(res.futureValue, 116169.54);
  assert.equal(res.wealthGain, 56169.54);

  // Boundary 0%
  const zeroRate = calculateSIP(500, 0, 10);
  assert.equal(zeroRate.totalInvested, 60000);
  assert.equal(zeroRate.futureValue, 60000);
  assert.equal(zeroRate.wealthGain, 0);

  // Boundary 0 tenure
  const zeroTenure = calculateSIP(500, 12, 0);
  assert.equal(zeroTenure.totalInvested, 0);
  assert.equal(zeroTenure.futureValue, 0);
  assert.equal(zeroTenure.wealthGain, 0);

  // Schedule
  const schedule = getSIPSchedule(500, 12, 10);
  assert.ok(schedule.length > 0);
  const last = schedule[schedule.length - 1];
  assert.equal(last.year, 10);
  assert.equal(last.futureValue, 116169.54);
});

test("src/lib/utils: calculateEMI with precision, zero interest and amortization", () => {
  const res = calculateEMI(200000, 6, 30);
  assert.equal(res.monthlyEMI, 1199.10);
  assert.equal(res.totalPayment, 431676.38);
  assert.equal(res.totalInterest, 231676.38);

  // 0% interest loan
  const zeroRate = calculateEMI(120000, 0, 10);
  assert.equal(zeroRate.monthlyEMI, 1000);
  assert.equal(zeroRate.totalPayment, 120000);
  assert.equal(zeroRate.totalInterest, 0);

  // 0 tenure
  const zeroTenure = calculateEMI(100000, 6, 0);
  assert.equal(zeroTenure.monthlyEMI, 0);
  assert.equal(zeroTenure.totalPayment, 0);
  assert.equal(zeroTenure.totalInterest, 0);

  // Amortization schedule
  const schedule = getEMIAmortizationSchedule(100000, 6, 15);
  assert.equal(schedule.length, 15);
  // Year 1 interest should be greater than Year 15 interest (front-loading)
  assert.ok(schedule[0].interestPaidYear > schedule[14].interestPaidYear);
  assert.ok(schedule[14].remainingBalance <= 1); // amortized near zero
});

test("src/lib/utils: calculateInflationImpact with purchasing power decay and schedule", () => {
  const res = calculateInflationImpact(1000, 5, 10);
  assert.equal(res.futureCost, 1628.89);
  assert.equal(res.purchasingPowerLossPct, 38.6);

  // 0% inflation
  const zeroInf = calculateInflationImpact(1000, 0, 10);
  assert.equal(zeroInf.futureCost, 1000);
  assert.equal(zeroInf.purchasingPowerLossPct, 0);

  // 0 years
  const zeroYears = calculateInflationImpact(1000, 5, 0);
  assert.equal(zeroYears.futureCost, 1000);
  assert.equal(zeroYears.purchasingPowerLossPct, 0);

  // Schedule
  const schedule = getInflationSchedule(1000, 5, 10);
  assert.ok(schedule.length > 0);
  const last = schedule[schedule.length - 1];
  assert.equal(last.year, 10);
  assert.equal(last.futureCost, 1628.89);
});
