import { Link } from "react-router-dom";
import { formatINR } from "../lib/format";
import type { AdvanceOverview, SalaryTotals } from "../types/worker";

function PaidCheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 shrink-0" aria-label="Fully repaid">
      <circle cx="10" cy="10" r="9" fill="var(--color-status-active-fg)" />
      <path d="M6 10.3l2.4 2.4L14 7.3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EarningsSummaryCard({
  totals,
  monthLabel,
  workerId,
  advanceOverview,
}: {
  totals: SalaryTotals | null;
  monthLabel: string;
  workerId: string;
  advanceOverview: AdvanceOverview | null;
}) {
  const monthFullyRepaid = !!advanceOverview && advanceOverview.month.advanceTaken > 0 && advanceOverview.month.outstanding === 0;
  const yearFullyRepaid = !!advanceOverview && advanceOverview.year.advanceTaken > 0 && advanceOverview.year.outstanding === 0;

  const tiles = [
    { label: "GROSS EARNED", value: totals?.grossEarned, paid: false },
    { label: "NET EARNED", value: totals?.netEarned, paid: false },
    { label: "THIS MONTH ADVANCE", value: totals?.advanceThisMonth, paid: monthFullyRepaid },
    { label: "THIS YEAR ADVANCE", value: totals?.advanceThisYear, paid: yearFullyRepaid },
  ];

  return (
    <div className="rounded-[14px] bg-white p-3.5 shadow-[0_2px_8px_rgba(28,25,23,0.12),0_0_24px_rgba(15,118,110,0.18)]">
      <div className="mb-2.5 flex items-baseline justify-between">
        <p className="text-[11px] font-extrabold tracking-[0.04em] text-stone-400 uppercase">Earnings &amp; Advances</p>
        <p className="text-[11px] font-bold text-ink-faint">{monthLabel}</p>
      </div>

      <div className="mb-2.5 grid grid-cols-2 gap-2">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl bg-page p-3">
            <div className="mb-1 flex items-center gap-1">
              <p className="text-[10px] font-bold tracking-[0.03em] text-stone-400 uppercase">{tile.label}</p>
              {tile.paid && <PaidCheckIcon />}
            </div>
            <p className="text-base font-extrabold text-ink">{tile.value !== undefined ? formatINR(tile.value) : "—"}</p>
          </div>
        ))}
      </div>

      <Link to={`/workers/${workerId}/advance-details`} className="flex items-center justify-between rounded-xl bg-brand-tint p-3">
        <span className="text-[11px] font-bold text-brand">REMAINING OWED</span>
        <span className="text-[17px] font-extrabold text-brand">
          {totals ? formatINR(totals.remainingOwed) : "—"}
        </span>
      </Link>
    </div>
  );
}
