import { useEffect, useState } from "react";
import { getJson } from "../lib/api";
import { formatDayLabel, formatINR } from "../lib/format";
import type { PaginatedAdvances } from "../types/worker";

const PAGE_SIZE = 10;

export function AdvanceHistoryList({ workerId, refreshKey }: { workerId: string; refreshKey: number }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedAdvances | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [workerId, refreshKey]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getJson<PaginatedAdvances>(`/api/workers/${workerId}/advances?page=${page}&limit=${PAGE_SIZE}`)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => console.error("Failed to load advance history:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workerId, page, refreshKey]);

  const advances = data?.advances ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div className="rounded-[14px] bg-white p-3.5 shadow-[0_2px_8px_rgba(28,25,23,0.12),0_0_24px_rgba(15,118,110,0.18)]">
      <p className="mb-1 text-[11px] font-extrabold tracking-[0.04em] text-stone-400 uppercase">Advance History</p>

      {loading && advances.length === 0 ? (
        <p className="py-3 text-center text-xs text-stone-400 italic">Loading…</p>
      ) : advances.length === 0 ? (
        <p className="py-3 text-center text-xs text-stone-400 italic">No advances recorded yet</p>
      ) : (
        <div className="divide-y divide-[#f0efed]">
          {advances.map((advance) => (
            <div key={advance.date} className="flex items-center justify-between py-2.5">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[13px] font-extrabold text-ink">
                  {advance.reason ?? "—"}
                </span>
                <span className="text-[11px] text-ink-faint">{formatDayLabel(advance.date)}</span>
              </div>
              <span className="shrink-0 pl-2 text-[13px] font-extrabold text-ink">{formatINR(advance.amount)}</span>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-2.5 flex items-center justify-between border-t border-[#f0efed] pt-2.5">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="rounded-[8px] px-2.5 py-1.5 text-[12px] font-bold text-ink-muted disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[11px] text-stone-400">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="rounded-[8px] px-2.5 py-1.5 text-[12px] font-bold text-ink-muted disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
