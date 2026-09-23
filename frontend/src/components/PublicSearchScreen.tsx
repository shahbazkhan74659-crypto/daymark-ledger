import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AVATAR_PALETTE, getInitials, hashToIndex } from "../lib/avatar";
import { getJson } from "../lib/api";
import { formatINR } from "../lib/format";
import { AttendanceCalendar } from "./AttendanceCalendar";
import { SearchBar } from "./SearchBar";
import type { AttendanceRecord, PublicAdvanceDate, PublicWorker } from "../types/worker";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" className="h-4 w-4">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileDetail({ worker, onBack }: { worker: PublicWorker; onBack: () => void }) {
  const palette = AVATAR_PALETTE[hashToIndex(worker.id, AVATAR_PALETTE.length)];
  const isActive = worker.status === "ACTIVE";

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [advances, setAdvances] = useState<PublicAdvanceDate[]>([]);
  const [netSalary, setNetSalary] = useState<number | null>(null);
  const [totalAdvance, setTotalAdvance] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      getJson<{ attendance: AttendanceRecord[] }>(`/api/public/workers/${worker.id}/attendance`),
      getJson<{ advances: PublicAdvanceDate[] }>(`/api/public/workers/${worker.id}/advances`),
    ])
      .then(([attendanceRes, advancesRes]) => {
        setAttendance(attendanceRes.attendance);
        setAdvances(advancesRes.advances);
      })
      .catch((err) => console.error("Failed to load public calendar data:", err));
  }, [worker.id]);

  useEffect(() => {
    getJson<{ netSalary: number; totalAdvance: number }>(
      `/api/public/workers/${worker.id}/salary-summary?year=${year}&month=${month}`,
    )
      .then(({ netSalary, totalAdvance }) => {
        setNetSalary(netSalary);
        setTotalAdvance(totalAdvance);
      })
      .catch((err) => console.error("Failed to load public salary summary:", err));
  }, [worker.id, year, month]);

  return (
    <div className="flex flex-col gap-3.5">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 self-start text-[13px] font-bold text-ink-muted"
      >
        <BackIcon />
        Back to results
      </button>

      <div className="flex flex-col items-center gap-2.5 rounded-2xl bg-white p-5 text-center shadow-[0_2px_8px_rgba(28,25,23,0.12),0_0_24px_rgba(15,118,110,0.18)]">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold"
          style={{ backgroundColor: palette.bg, color: palette.fg }}
        >
          {getInitials(worker.fullName)}
        </span>
        <p className="text-lg font-extrabold text-ink">{worker.fullName}</p>
        <p className="text-[13px] font-semibold text-ink-faint">{worker.designation}</p>
        <span
          className="rounded-full px-[10px] py-[4px] text-[11px] font-extrabold"
          style={{
            backgroundColor: isActive ? "var(--color-status-active-bg)" : "var(--color-status-inactive-bg)",
            color: isActive ? "var(--color-status-active-fg)" : "var(--color-status-inactive-fg)",
          }}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <AttendanceCalendar
        year={year}
        month={month}
        attendance={attendance}
        advances={advances}
        onMonthChange={(y, m) => {
          setYear(y);
          setMonth(m);
        }}
      />

      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-page p-3">
          <p className="mb-1 text-[10px] font-bold tracking-[0.03em] text-stone-400 uppercase">Total Advance</p>
          <p className="text-base font-extrabold text-ink">{totalAdvance !== null ? formatINR(totalAdvance) : "—"}</p>
        </div>
        <div className="rounded-xl bg-page p-3">
          <p className="mb-1 text-[10px] font-bold tracking-[0.03em] text-stone-400 uppercase">Net Salary</p>
          <p className="text-base font-extrabold text-ink">{netSalary !== null ? formatINR(netSalary) : "—"}</p>
        </div>
      </div>
    </div>
  );
}

export function PublicSearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicWorker[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<PublicWorker | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      getJson<{ workers: PublicWorker[] }>(`/api/public/workers/search?q=${encodeURIComponent(trimmed)}`)
        .then(({ workers }) => setResults(workers))
        .catch((err) => console.error("Public search failed:", err))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="flex h-dvh w-full justify-center bg-stone-200 font-sans sm:items-center sm:py-8">
      <div className="flex h-dvh w-full max-w-md flex-col overflow-hidden bg-page sm:h-[min(844px,calc(100dvh-4rem))] sm:rounded-2xl sm:shadow-lg">
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-white px-4 py-4">
          <span className="text-base font-extrabold text-ink">Employee Search</span>
          <Link to="/login" className="text-[12px] font-bold text-brand">
            Admin Login
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pt-3.5 pb-6">
          {selected ? (
            <ProfileDetail worker={selected} onBack={() => setSelected(null)} />
          ) : (
            <>
              <SearchBar value={query} onChange={setQuery} placeholder="Search by name, phone, or employee code" />

              {!query.trim() ? (
                <p className="text-sm text-ink-faint">Start typing to find an employee.</p>
              ) : loading ? (
                <p className="text-sm text-ink-faint">Searching…</p>
              ) : results.length === 0 ? (
                <p className="text-sm text-ink-faint">No employees match "{query}".</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {results.map((worker) => {
                    const palette = AVATAR_PALETTE[hashToIndex(worker.id, AVATAR_PALETTE.length)];
                    return (
                      <button
                        key={worker.id}
                        type="button"
                        onClick={() => setSelected(worker)}
                        className="flex items-center gap-2.5 rounded-[16px] bg-white px-3 py-2.5 text-left shadow-[0_2px_8px_rgba(28,25,23,0.12),0_0_24px_rgba(15,118,110,0.18)]"
                      >
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                          style={{ backgroundColor: palette.bg, color: palette.fg }}
                        >
                          {getInitials(worker.fullName)}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-[15px] font-bold text-ink">{worker.fullName}</span>
                          <span className="truncate text-[12px] font-medium text-ink-faint">
                            {worker.designation} · {worker.employeeCode}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
