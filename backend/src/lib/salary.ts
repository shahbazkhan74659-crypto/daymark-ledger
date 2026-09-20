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
  perDayRate: number,
  now: Date = new Date(),
): SalaryTotals {
  let grossEarned = 0;
  for (const attendance of attendances) {
    if (attendance.status === "PRESENT") grossEarned += perDayRate;
    else if (attendance.status === "HALF") grossEarned += perDayRate * 0.5;
  }

  const nowYear = now.getUTCFullYear();
  const nowMonth = now.getUTCMonth();

  let advanceAll = 0;
  let advanceThisMonth = 0;
  let advanceThisYear = 0;
  for (const advance of advances) {
    advanceAll += advance.amount;
    const year = advance.date.getUTCFullYear();
    const month = advance.date.getUTCMonth();
    if (year === nowYear) {
      advanceThisYear += advance.amount;
      if (month === nowMonth) advanceThisMonth += advance.amount;
    }
  }

  return {
    grossEarned: round2(grossEarned),
    netEarned: round2(grossEarned - advanceAll),
    advanceThisMonth: round2(advanceThisMonth),
    advanceThisYear: round2(advanceThisYear),
    remainingOwed: round2(advanceAll),
  };
}
