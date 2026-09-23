import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AVATAR_PALETTE, getInitials, hashToIndex } from "../lib/avatar";
import { ApiError, getJson, postJson } from "../lib/api";
import { formatINR } from "../lib/format";
import type { AdvanceOverview, Repayment, WorkerDetail } from "../types/worker";
import { RepaymentBucketCard } from "./RepaymentBucketCard";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" className="h-4 w-4">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NotFoundScreen() {
  return (
    <div className="flex h-dvh w-full justify-center bg-stone-200 font-sans sm:items-center sm:py-8">
      <div className="flex h-dvh w-full max-w-md flex-col items-center justify-center gap-4 bg-page p-6 text-center sm:h-[min(844px,calc(100dvh-4rem))] sm:rounded-2xl sm:shadow-lg">
        <p className="text-sm text-ink-faint">Worker not found</p>
        <Link
          to="/"
          className="rounded-full bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(15,118,110,0.25)]"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

export function AdvanceDetailsScreen() {
  const { id } = useParams<{ id: string }>();
  const workerId = String(id);

  const [worker, setWorker] = useState<WorkerDetail | null>(null);
  const [overview, setOverview] = useState<AdvanceOverview | null>(null);
  const [monthHistory, setMonthHistory] = useState<Repayment[]>([]);
  const [yearHistory, setYearHistory] = useState<Repayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getJson<{ worker: WorkerDetail }>(`/api/workers/${workerId}`),
      getJson<{ worker: AdvanceOverview }>(`/api/workers/${workerId}/advance-overview`),
      getJson<{ repayments: Repayment[] }>(`/api/workers/${workerId}/repayments/MONTH`),
      getJson<{ repayments: Repayment[] }>(`/api/workers/${workerId}/repayments/YEAR`),
    ])
      .then(([workerRes, overviewRes, monthRes, yearRes]) => {
        setWorker(workerRes.worker);
        setOverview(overviewRes.worker);
        setMonthHistory(monthRes.repayments);
        setYearHistory(yearRes.repayments);
      })
      .catch((err) => {
        console.error("Failed to load advance details:", err);
        if (err instanceof ApiError) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [workerId]);

  async function handleRepaymentSave(bucket: "MONTH" | "YEAR", amount: number) {
    setError(null);
    try {
      const response = await postJson<{ repayment: Repayment; overview: AdvanceOverview }>(
        `/api/workers/${workerId}/repayments`,
        { bucket, amount },
      );
      if (bucket === "MONTH") {
        setMonthHistory([response.repayment, ...monthHistory]);
      } else {
        setYearHistory([response.repayment, ...yearHistory]);
      }
      setOverview(response.overview);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to save repayment — try again";
      setError(message);
      throw err;
    }
  }

  if (notFound) return <NotFoundScreen />;

  const palette = AVATAR_PALETTE[hashToIndex(workerId, AVATAR_PALETTE.length)];

  return (
    <div className="flex h-dvh w-full justify-center bg-stone-200 font-sans sm:items-center sm:py-8">
      <div className="relative flex h-dvh w-full max-w-md flex-col overflow-hidden bg-page sm:h-[min(844px,calc(100dvh-4rem))] sm:rounded-2xl sm:shadow-lg">
        <header className="flex shrink-0 items-center gap-3 border-b border-border bg-white px-4 py-4">
          <Link
            to={`/workers/${workerId}`}
            aria-label="Back to worker detail"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-page"
          >
            <BackIcon />
          </Link>
          {worker && (
            <>
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ backgroundColor: palette.bg, color: palette.fg }}
              >
                {getInitials(worker.fullName)}
              </span>
              <span className="truncate text-base font-extrabold text-ink">{worker.fullName}</span>
            </>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-4 pt-3.5 pb-6">
          {loading ? (
            <p className="text-sm text-ink-faint">Loading…</p>
          ) : overview ? (
            <div className="flex flex-col gap-3.5">
              <div className="rounded-xl bg-brand-tint p-3">
                <p className="mb-1 text-[11px] font-bold text-brand">TOTAL ADVANCE</p>
                <p className="text-[24px] font-extrabold text-brand">{formatINR(overview.totalAdvance)}</p>
              </div>

              {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

              <RepaymentBucketCard
                title="This Month Advance"
                bucket="MONTH"
                advanceTaken={overview.month.advanceTaken}
                outstanding={overview.month.outstanding}
                history={monthHistory}
                onSave={(amount) => handleRepaymentSave("MONTH", amount)}
              />

              <RepaymentBucketCard
                title="Year Advance"
                bucket="YEAR"
                advanceTaken={overview.year.advanceTaken}
                outstanding={overview.year.outstanding}
                history={yearHistory}
                onSave={(amount) => handleRepaymentSave("YEAR", amount)}
              />
            </div>
          ) : (
            <p className="text-sm text-ink-faint">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
