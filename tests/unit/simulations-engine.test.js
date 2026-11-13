const test = require("node:test");
const assert = require("node:assert/strict");

// Helpers matching our decimal-safe calculations
function decimalRound(num, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

function calculateSIP(monthlyInvestment, annualReturnRatePct, years) {
  const i = annualReturnRatePct / 100 / 12;
  const n = years * 12;
  const totalInvested = monthlyInvestment * n;

  if (i === 0) {
    return {
      totalInvested: decimalRound(totalInvested, 2),
      futureValue: decimalRound(totalInvested, 2),
      wealthGain: 0,
    };
  }

  const fv = monthlyInvestment * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  return {
    totalInvested: decimalRound(totalInvested, 2),
    futureValue: decimalRound(fv, 2),
    wealthGain: decimalRound(fv - totalInvested, 2),
  };
}

test("Simulations Suite — First Salary 50/30/20 Calculations", () => {
  const monthlySalary = 4500;
  const rent = 1400;
  const groceriesUtilities = 600;
  const minimumDebt = 250;
  const diningEntertainment = 700;
  const hobbiesSubscriptions = 400;
  const emergencySavings = 500;
  const investments = 650;

  const totalNeeds = decimalRound(rent + groceriesUtilities + minimumDebt, 2);
  const totalWants = decimalRound(diningEntertainment + hobbiesSubscriptions, 2);
  const totalFreedom = decimalRound(emergencySavings + investments, 2);
  const totalAllocated = decimalRound(totalNeeds + totalWants + totalFreedom, 2);
  const unallocated = decimalRound(monthlySalary - totalAllocated, 2);

  assert.equal(totalNeeds, 2250);
  assert.equal(totalWants, 1100);
  assert.equal(totalFreedom, 1150);
  assert.equal(totalAllocated, 4500);
  assert.equal(unallocated, 0);

  const needsPct = Math.round((totalNeeds / monthlySalary) * 100);
  const wantsPct = Math.round((totalWants / monthlySalary) * 100);
  const freedomPct = Math.round((totalFreedom / monthlySalary) * 100);

  assert.equal(needsPct, 50);
  assert.equal(wantsPct, 24);
  assert.equal(freedomPct, 26);

  // Emergency runway calculation
  const emergencyRunwayMonths = decimalRound((emergencySavings * 12) / totalNeeds, 1);
  assert.equal(emergencyRunwayMonths, 2.7);
});

test("Simulations Suite — Monthly Budget Emergency Shocks & Interest Penalty", () => {
  let cashBuffer = 3000;
  let creditCardDebt = 0;
  let totalInterestPaid = 0;

  // Month 1: Shock of $950 paid with debt
  creditCardDebt += 950;
  assert.equal(creditCardDebt, 950);

  // Month 2: Interest applied at 2% monthly (24% APR)
  const interestM2 = decimalRound(creditCardDebt * 0.02, 2);
  totalInterestPaid += interestM2;
  creditCardDebt = decimalRound(creditCardDebt + interestM2, 2);
  assert.equal(interestM2, 19.00);
  assert.equal(creditCardDebt, 969.00);

  // Dental shock of $750 paid with cash
  cashBuffer = decimalRound(cashBuffer - 750, 2);
  assert.equal(cashBuffer, 2250.00);

  // Month 3: Bonus of $1200 pays down debt first
  const interestM3 = decimalRound(creditCardDebt * 0.02, 2);
  creditCardDebt = decimalRound(creditCardDebt + interestM3, 2);
  totalInterestPaid += interestM3;
  assert.equal(interestM3, 19.38);
  assert.equal(creditCardDebt, 988.38);

  const debtPaid = Math.min(creditCardDebt, 1200);
  creditCardDebt = decimalRound(creditCardDebt - debtPaid, 2);
  const remainingCash = decimalRound(1200 - debtPaid, 2);
  cashBuffer = decimalRound(cashBuffer + remainingCash, 2);

  assert.equal(creditCardDebt, 0);
  assert.equal(cashBuffer, 2461.62);
  assert.ok(totalInterestPaid > 38);
});

test("Simulations Suite — $50,000 Investment Challenge Asset Scenarios", () => {
  const TOTAL_CAPITAL = 50000;
  const indexAllocation = 35;
  const techAllocation = 15;
  const bondsAllocation = 35;
  const cashAllocation = 15;

  assert.equal(indexAllocation + techAllocation + bondsAllocation + cashAllocation, 100);

  const indexAmount = decimalRound((TOTAL_CAPITAL * indexAllocation) / 100, 2);
  const techAmount = decimalRound((TOTAL_CAPITAL * techAllocation) / 100, 2);
  const bondsAmount = decimalRound((TOTAL_CAPITAL * bondsAllocation) / 100, 2);
  const cashAmount = decimalRound((TOTAL_CAPITAL * cashAllocation) / 100, 2);

  assert.equal(indexAmount, 17500);
  assert.equal(techAmount, 7500);
  assert.equal(bondsAmount, 17500);
  assert.equal(cashAmount, 7500);

  // Recession Scenario: -22% index, -38% tech, +12% bonds, +4% cash
  const newIndex = decimalRound(indexAmount * (1 - 0.22), 2);
  const newTech = decimalRound(techAmount * (1 - 0.38), 2);
  const newBonds = decimalRound(bondsAmount * (1 + 0.12), 2);
  const newCash = decimalRound(cashAmount * (1 + 0.04), 2);

  assert.equal(newIndex, 13650);
  assert.equal(newTech, 4650);
  assert.equal(newBonds, 19600);
  assert.equal(newCash, 7800);

  const finalTotal = decimalRound(newIndex + newTech + newBonds + newCash, 2);
  const drawdown = decimalRound(finalTotal - TOTAL_CAPITAL, 2);
  const drawdownPct = decimalRound((drawdown / TOTAL_CAPITAL) * 100, 2);

  assert.equal(finalTotal, 45700);
  assert.equal(drawdown, -4300);
  assert.equal(drawdownPct, -8.6); // Dramatically cushions the -38% tech drop!
});

test("Simulations Suite — SIP Wealth Projector and Inflation Adjustment", () => {
  const monthly = 500;
  const rate = 12;
  const years = 15;

  const res = calculateSIP(monthly, rate, years);
  assert.equal(res.totalInvested, 90000);
  assert.ok(res.futureValue > 240000);
  assert.ok(res.wealthGain > 150000);

  // Inflation discounting at 3.5%
  const inflationRate = 3.5;
  const realFutureValue = decimalRound(res.futureValue / Math.pow(1 + inflationRate / 100, years), 2);
  assert.ok(realFutureValue < res.futureValue);
  assert.ok(realFutureValue > res.totalInvested);

  // Rule of 72
  const doublingYears = decimalRound(72 / rate, 1);
  assert.equal(doublingYears, 6.0);
});

test("Simulations Suite — Startup Builder Unit Economics & Runway", () => {
  let cashTreasury = 100000;
  let activeCustomers = 150;
  const pricePerUser = 49;
  const marketingBudget = 4000;
  const engineeringBudget = 7000;
  const cac = 80;
  const churnRate = 0.05;

  const newCustomers = Math.floor(marketingBudget / cac); // 50
  const churned = Math.floor(activeCustomers * churnRate); // 7
  const netCustomers = activeCustomers + newCustomers - churned; // 193

  const revenue = decimalRound(netCustomers * pricePerUser, 2); // 193 * 49 = 9457
  const cogs = decimalRound(revenue * 0.15, 2); // 1418.55
  const grossProfit = decimalRound(revenue - cogs, 2); // 8038.45
  const opex = decimalRound(marketingBudget + engineeringBudget, 2); // 11000
  const monthlyEBITDA = decimalRound(grossProfit - opex, 2); // -2961.55

  assert.equal(newCustomers, 50);
  assert.equal(churned, 7);
  assert.equal(netCustomers, 193);
  assert.equal(revenue, 9457);
  assert.equal(opex, 11000);
  assert.equal(monthlyEBITDA, -2961.55);

  const runwayMonths = (cashTreasury / Math.abs(monthlyEBITDA)).toFixed(1);
  assert.equal(runwayMonths, "33.8");

  // Advance 1 month
  cashTreasury = decimalRound(cashTreasury + monthlyEBITDA, 2);
  assert.equal(cashTreasury, 97038.45);
});
