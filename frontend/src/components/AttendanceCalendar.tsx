import { useMemo } from "react";
import { buildMonthCells, countMonthStatuses, MONTH_NAMES, todayDateString } from "../lib/calendar";
import type { Advance, AttendanceRecord, AttendanceStatus } from "../types/worker";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const STATUS_TOKENS: Record<AttendanceStatus, { bg: string; fg: string }> = {
  PRESENT: { bg: "var(--color-status-present-bg)", fg: "var(--color-status-present-fg)" },
  HALF: { bg: "var(--color-status-half-bg)", fg: "var(--color-status-half-fg)" },
  ABSENT: { bg: "var(--color-status-absent-bg)", fg: "var(--color-status-absent-fg)" },
};

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-muted)" strokeWidth="2.5" className="h-3 w-3">
      <path d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AttendanceCalendar({
  year,
  month,
  attendance,
  advances,
  onMonthChange,
  onDayTap,
}: {
  year: number;
  month: number;
  attendance: AttendanceRecord[];
  advances: Advance[];
  onMonthChange: (year: number, month: number) => void;
  onDayTap: (date: string) => void;
}) {
  const attendanceByDate = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    for (const record of attendance) map.set(record.date, record.status);
    return map;
  }, [attendance]);

  const advanceDates = useMemo(() => new Set(advances.map((a) => a.date)), [advances]);

  const todayStr = todayDateString();
  const cells = useMemo(
    () => buildMonthCells(year, month, attendanceByDate, todayStr),
    [year, month, attendanceByDate, todayStr],
  );
  const counts = useMemo(() => countMonthStatuses(year, month, attendanceByDate), [year, month, attendanceByDate]);
  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
  const advanceCountThisMonth = useMemo(
    () => advances.filter((a) => a.date.startsWith(monthPrefix)).length,
    [advances, monthPrefix],
  );

  function goPrev() {
    if (month === 1) onMonthChange(year - 1, 12);
    else onMonthChange(year, month - 1);
  }

  function goNext() {
    if (month === 12) onMonthChange(year + 1, 1);
    else onMonthChange(year, month + 1);
  }

  return (
    <div className="rounded-[14px] bg-white p-3.5 shadow-[0_1px_2px_rgba(28,25,23,0.06)]">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={goPrev}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-white"
        >
          <ChevronIcon direction="left" />
        </button>
        <p className="text-[13px] font-extrabold text-ink">
          {MONTH_NAMES[month - 1]} {year}
        </p>
        <button
          type="button"
          aria-label="Next month"
          onClick={goNext}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-white"
        >
          <ChevronIcon direction="right" />
        </button>
      </div>

      <div className="mb-1.5 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <p key={label} className="text-center text-[10px] font-bold text-stone-400">
            {label}
          </p>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell.date) return <div key={i} className="invisible" />;
          const tokens = cell.status ? STATUS_TOKENS[cell.status] : null;
          const hasAdvance = advanceDates.has(cell.date);
          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => onDayTap(cell.date!)}
              className="relative flex aspect-square items-center justify-center rounded-lg text-xs font-bold"
              style={{
                backgroundColor: tokens?.bg ?? "#ffffff",
                color: tokens?.fg ?? "var(--color-ink-faint)",
                border: cell.isToday ? "2px solid var(--color-brand)" : tokens ? "1px solid transparent" : "1px solid var(--color-border)",
              }}
            >
              {Number(cell.date.slice(-2))}
              {hasAdvance && (
                <span
                  aria-label="Advance given"
                  className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[8px] font-black text-white shadow-[0_1px_2px_rgba(28,25,23,0.35)]"
                >
                  ₹
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3.5 flex justify-around border-t border-[#f0efed] pt-3">
        {(
          [
            { status: "PRESENT" as const, label: "Present" },
            { status: "HALF" as const, label: "Half" },
            { status: "ABSENT" as const, label: "Absent" },
          ]
        ).map(({ status, label }) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className="h-[9px] w-[9px] rounded-[3px]" style={{ backgroundColor: STATUS_TOKENS[status].bg }} />
            <span className="text-xs font-bold text-ink">{counts[status]}</span>
            <span className="text-[11px] text-stone-400">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="flex h-[13px] w-[13px] items-center justify-center rounded-full bg-amber-400 text-[7px] font-black text-white">
            ₹
          </span>
          <span className="text-xs font-bold text-ink">{advanceCountThisMonth}</span>
          <span className="text-[11px] text-stone-400">Advance</span>
        </div>
      </div>
    </div>
  );
}
