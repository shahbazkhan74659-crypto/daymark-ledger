import { formatINR } from "../lib/format";
import type { SalaryTotals } from "../types/worker";

export function EarningsSummaryCard({ totals, monthLabel }: { totals: SalaryTotals | null; monthLabel: string }) {
  const tiles = [
    { label: "GROSS EARNED", value: totals?.grossEarned },
    { label: "NET EARNED", value: totals?.netEarned },
    { label: "THIS MONTH ADVANCE", value: totals?.advanceThisMonth },
    { label: "THIS YEAR ADVANCE", value: totals?.advanceThisYear },
  ];

  return (
    <div className="rounded-[14px] bg-white p-3.5 shadow-[0_1px_2px_rgba(28,25,23,0.06)]">
      <div className="mb-2.5 flex items-baseline justify-between">
        <p className="text-[11px] font-extrabold tracking-[0.04em] text-stone-400 uppercase">Earnings &amp; Advances</p>
        <p className="text-[11px] font-bold text-ink-faint">{monthLabel}</p>
      </div>

      <div className="mb-2.5 grid grid-cols-2 gap-2">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl bg-page p-3">
            <p className="mb-1 text-[10px] font-bold tracking-[0.03em] text-stone-400 uppercase">{tile.label}</p>
            <p className="text-base font-extrabold text-ink">{tile.value !== undefined ? formatINR(tile.value) : "—"}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl bg-brand-tint p-3">
        <span className="text-[11px] font-bold text-brand">REMAINING OWED</span>
        <span className="text-[17px] font-extrabold text-brand">
          {totals ? formatINR(totals.remainingOwed) : "—"}
        </span>
      </div>
    </div>
  );
}
