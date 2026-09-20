import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AVATAR_PALETTE, getInitials, hashToIndex } from "../lib/avatar";
import { ApiError, getJson, postJson } from "../lib/api";
import { MONTH_NAMES } from "../lib/calendar";
import type { Advance, AttendanceRecord, AttendanceStatus, SalaryTotals, WorkerDetail } from "../types/worker";
import { AdvanceHistoryList } from "./AdvanceHistoryList";
import { AttendanceCalendar } from "./AttendanceCalendar";
import { DayEditPopup } from "./DayEditPopup";
import { EarningsSummaryCard } from "./EarningsSummaryCard";
import { SalaryConfigCard } from "./SalaryConfigCard";

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

export function WorkerDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const workerId = String(id);

  const [worker, setWorker] = useState<WorkerDetail | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [totals, setTotals] = useState<SalaryTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getJson<{ worker: WorkerDetail }>(`/api/workers/${workerId}`),
      getJson<{ attendance: AttendanceRecord[] }>(`/api/workers/${workerId}/attendance`),
      getJson<{ advances: Advance[] }>(`/api/workers/${workerId}/advances`),
    ])
      .then(([workerRes, attendanceRes, advancesRes]) => {
        setWorker(workerRes.worker);
        setAttendance(attendanceRes.attendance);
        setAdvances(advancesRes.advances);
      })
      .catch((err) => {
        console.error("Failed to load worker detail:", err);
        if (err instanceof ApiError) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [workerId]);

  useEffect(() => {
    getJson<{ worker: { id: string } & SalaryTotals }>(
      `/api/workers/${workerId}/salary-summary?year=${year}&month=${month}`,
    )
      .then(({ worker: totalsRes }) => setTotals(totalsRes))
      .catch((err) => console.error("Failed to load salary summary:", err));
  }, [workerId, year, month]);

  async function refreshSalarySummary() {
    try {
      const { worker: totalsRes } = await getJson<{ worker: { id: string } & SalaryTotals }>(
        `/api/workers/${workerId}/salary-summary?year=${year}&month=${month}`,
      );
      setTotals(totalsRes);
    } catch (err) {
      console.error("Failed to refresh salary summary:", err);
    }
  }

  async function handleDaySave(status: AttendanceStatus | null, advanceAmount: number | null) {
    await Promise.all([
      postJson(`/api/workers/${workerId}/attendance/${selectedDate}`, { status }),
      postJson(`/api/workers/${workerId}/advances/${selectedDate}`, { amount: advanceAmount }),
    ]);

    setAttendance((current) => {
      const rest = current.filter((a) => a.date !== selectedDate);
      return status ? [...rest, { date: selectedDate!, status }] : rest;
    });
    setAdvances((current) => {
      const rest = current.filter((a) => a.date !== selectedDate);
      return advanceAmount ? [...rest, { date: selectedDate!, amount: advanceAmount }] : rest;
    });

    setSelectedDate(null);
    await refreshSalarySummary();
  }

  async function handleRateSave(newRate: number) {
    const { worker: updated } = await postJson<{ worker: { id: string; perDayRate: number } }>(
      `/api/workers/${workerId}/rate`,
      { perDayRate: newRate },
    );
    setWorker((current) => (current ? { ...current, perDayRate: updated.perDayRate } : current));
    await refreshSalarySummary();
  }

  if (notFound) return <NotFoundScreen />;

  const palette = AVATAR_PALETTE[hashToIndex(workerId, AVATAR_PALETTE.length)];
  const selectedAttendance = attendance.find((a) => a.date === selectedDate);
  const selectedAdvance = advances.find((a) => a.date === selectedDate);

  return (
    <div className="flex h-dvh w-full justify-center bg-stone-200 font-sans sm:items-center sm:py-8">
      <div className="relative flex h-dvh w-full max-w-md flex-col overflow-hidden bg-page sm:h-[min(844px,calc(100dvh-4rem))] sm:rounded-2xl sm:shadow-lg">
        <header className="flex shrink-0 items-center gap-3 border-b border-border bg-white px-4 py-4">
          <Link
            to="/"
            aria-label="Back to home"
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
          ) : (
            worker && (
              <div className="flex flex-col gap-3.5">
                <AttendanceCalendar
                  year={year}
                  month={month}
                  attendance={attendance}
                  advances={advances}
                  onMonthChange={(y, m) => {
                    setYear(y);
                    setMonth(m);
                  }}
                  onDayTap={(date) => setSelectedDate(date)}
                />
                <SalaryConfigCard perDayRate={worker.perDayRate} onSave={handleRateSave} />
                <EarningsSummaryCard totals={totals} monthLabel={`${MONTH_NAMES[month - 1]} ${year}`} />
                <AdvanceHistoryList advances={advances} />
              </div>
            )
          )}
        </div>

        {selectedDate && (
          <DayEditPopup
            date={selectedDate}
            initialStatus={selectedAttendance?.status ?? null}
            initialAdvanceAmount={selectedAdvance?.amount ?? null}
            onCancel={() => setSelectedDate(null)}
            onSave={handleDaySave}
          />
        )}
      </div>
    </div>
  );
}
