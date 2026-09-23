export interface SalaryTotals {
  grossEarned: number;
  netEarned: number;
  advanceThisMonth: number;
  advanceThisYear: number;
  remainingOwed: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeSalaryTotals(
  attendances: { status: "PRESENT" | "HALF" | "ABSENT" }[],
  advances: { date: Date; amount: number }[],
  repayments: { amount: number }[],
  perDayRate: number,
  year: number,
  month: number,
): SalaryTotals {
  let grossEarned = 0;
  for (const attendance of attendances) {
    if (attendance.status === "PRESENT") grossEarned += perDayRate;
    else if (attendance.status === "HALF") grossEarned += perDayRate * 0.5;
  }

  const targetMonth = month - 1;

  let advanceAll = 0;
  let advanceThisMonth = 0;
  let advanceThisYear = 0;
  for (const advance of advances) {
    advanceAll += advance.amount;
    const advanceYear = advance.date.getUTCFullYear();
    const advanceMonth = advance.date.getUTCMonth();
    if (advanceYear === year) {
      advanceThisYear += advance.amount;
      if (advanceMonth === targetMonth) advanceThisMonth += advance.amount;
    }
  }

  let repaidAll = 0;
  for (const repayment of repayments) {
    repaidAll += repayment.amount;
  }

  return {
    grossEarned: round2(grossEarned),
    netEarned: round2(grossEarned - advanceThisMonth),
    advanceThisMonth: round2(advanceThisMonth),
    advanceThisYear: round2(advanceThisYear),
    remainingOwed: round2(Math.max(0, advanceAll - repaidAll)),
  };
}
