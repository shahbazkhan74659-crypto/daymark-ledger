export interface BucketOverview {
  advanceTaken: number;
  repaid: number;
  outstanding: number;
}

export interface AdvanceOverview {
  totalAdvance: number;
  month: BucketOverview;
  year: BucketOverview;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeAdvanceOverview(
  advances: { date: Date; amount: number }[],
  monthRepayments: { amount: number }[],
  yearRepayments: { amount: number }[],
  year: number,
  month: number,
): AdvanceOverview {
  const targetMonth = month - 1;

  let advanceAll = 0;
  let advanceThisMonth = 0;
  let advanceThisYearExcludingMonth = 0;
  for (const advance of advances) {
    advanceAll += advance.amount;
    const advanceYear = advance.date.getUTCFullYear();
    const advanceMonth = advance.date.getUTCMonth();
    if (advanceYear === year && advanceMonth === targetMonth) {
      advanceThisMonth += advance.amount;
    } else if (advanceYear === year) {
      advanceThisYearExcludingMonth += advance.amount;
    }
  }

  let monthRepaid = 0;
  for (const r of monthRepayments) monthRepaid += r.amount;
  let yearRepaid = 0;
  for (const r of yearRepayments) yearRepaid += r.amount;

  return {
    totalAdvance: round2(Math.max(0, advanceAll - (monthRepaid + yearRepaid))),
    month: {
      advanceTaken: round2(advanceThisMonth),
      repaid: round2(monthRepaid),
      outstanding: round2(Math.max(0, advanceThisMonth - monthRepaid)),
    },
    year: {
      advanceTaken: round2(advanceThisYearExcludingMonth),
      repaid: round2(yearRepaid),
      outstanding: round2(Math.max(0, advanceThisYearExcludingMonth - yearRepaid)),
    },
  };
}
