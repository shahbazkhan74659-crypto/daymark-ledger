import { formatDayLabel, formatINR } from "../lib/format";
import type { Advance } from "../types/worker";

export function AdvanceHistoryList({ advances }: { advances: Advance[] }) {
  const sorted = [...advances].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return (
    <div className="rounded-[14px] bg-white p-3.5 shadow-[0_1px_2px_rgba(28,25,23,0.06)]">
      <p className="mb-1 text-[11px] font-extrabold tracking-[0.04em] text-stone-400 uppercase">Advance History</p>

      {sorted.length === 0 ? (
        <p className="py-3 text-center text-xs text-stone-400 italic">No advances recorded yet</p>
      ) : (
        <div className="divide-y divide-[#f0efed]">
          {sorted.map((advance) => (
            <div key={advance.date} className="flex items-center justify-between py-2.5">
              <span className="text-[13px] text-ink-muted">{formatDayLabel(advance.date)}</span>
              <span className="text-[13px] font-extrabold text-ink">{formatINR(advance.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
