import { useState } from "react";
import { formatDayLabel, formatINR } from "../lib/format";
import type { Repayment } from "../types/worker";

interface CollapsibleHistoryProps {
  history: Repayment[];
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-ink)"
      strokeWidth="2.5"
      className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-90" : "rotate-0"}`}
    >
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CollapsibleHistory({ history }: CollapsibleHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 text-left text-[11px] font-extrabold tracking-[0.04em] text-stone-400 uppercase transition-colors hover:text-stone-600"
      >
        <ChevronIcon expanded={expanded} />
        History
      </button>

      {expanded && (
        <div className="mt-2">
          {history.length === 0 ? (
            <p className="py-3 text-center text-xs text-stone-400 italic">No repayments recorded yet</p>
          ) : (
            <div className="divide-y divide-[#f0efed]">
              {history.map((repayment) => (
                <div key={repayment.id} className="flex items-center justify-between py-2.5">
                  <span className="text-[13px] text-ink-muted">{formatDayLabel(repayment.date)}</span>
                  <span className="text-[13px] font-extrabold text-ink">{formatINR(repayment.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
