import { useEffect, useId, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { getJson } from "../lib/api";
import { MONTH_NAMES } from "../lib/calendar";
import { DEFAULT_REPORT_FIELDS, REPORT_FIELD_DEFS } from "../types/report";
import type { ReportFieldKey, ReportFormat } from "../types/report";
import type { ManageWorker } from "../types/worker";
import { SearchBar } from "./SearchBar";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" className="h-4 w-4">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-faint)" strokeWidth="2.5" className="h-4 w-4 shrink-0">
      <path d="M4 12h16M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-muted)" strokeWidth="2.2" className="h-4 w-4">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH_NAMES[m - 1].slice(0, 3)} ${y}`;
}

function rangeMessage(from: string, to: string): string {
  if (from && to) return `${formatShortDate(from)} → ${formatShortDate(to)}`;
  if (from) return `From ${formatShortDate(from)} — now choose an end date`;
  if (to) return `To ${formatShortDate(to)} — now choose a start date`;
  return "Tap a calendar icon to choose a date";
}

function DateIconButton({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  const id = useId();

  return (
    <>
      <label
        htmlFor={id}
        className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-[14px] bg-page text-ink transition-colors hover:bg-black hover:text-white active:bg-black active:text-white"
      >
        <CalendarIcon />
      </label>
      <input
        id={id}
        type="date"
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
      />
    </>
  );
}

function formatFromParam(param: string | undefined): ReportFormat | null {
  if (param === "pdf") return "PDF";
  if (param === "excel") return "EXCEL";
  return null;
}

export function ReportConfigScreen() {
  const { format: formatParam } = useParams<{ format: string }>();
  const navigate = useNavigate();
  const format = formatFromParam(formatParam);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fields, setFields] = useState<Record<ReportFieldKey, boolean>>(DEFAULT_REPORT_FIELDS);
  const [employees, setEmployees] = useState<ManageWorker[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());
  const [employeePickerOpen, setEmployeePickerOpen] = useState(false);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");

  useEffect(() => {
    getJson<{ workers: ManageWorker[] }>("/api/workers/all")
      .then(({ workers }) => {
        setEmployees(workers);
        setSelectedEmployeeIds(new Set(workers.map((w) => w.id)));
      })
      .catch((err) => console.error("Failed to load workers:", err))
      .finally(() => setEmployeesLoading(false));
  }, []);

  if (!format) {
    return <Navigate to="/reports" replace />;
  }

  const formatLabel = format === "PDF" ? "PDF Report" : "Excel Report";
  const allEmployeesSelected = employees.length > 0 && selectedEmployeeIds.size === employees.length;
  const filteredEmployees = employees.filter((worker) =>
    worker.fullName.toLowerCase().includes(employeeSearchQuery.trim().toLowerCase()),
  );

  function toggleField(key: ReportFieldKey) {
    setFields((current) => ({ ...current, [key]: !current[key] }));
  }

  function toggleEmployee(id: string) {
    setSelectedEmployeeIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllEmployees() {
    setSelectedEmployeeIds(allEmployeesSelected ? new Set() : new Set(employees.map((w) => w.id)));
  }

  function handleSave() {
    // Phase 17 is frontend-only — no backend report endpoint exists yet (Phase 18).
    // Matches the prototype's own saveReport(), which is a no-op that just returns to the list.
    navigate("/");
  }

  return (
    <div className="flex h-dvh w-full justify-center bg-stone-200 font-sans sm:items-center sm:py-8">
      <div className="relative flex h-dvh w-full max-w-md flex-col overflow-hidden bg-page sm:h-[min(844px,calc(100dvh-4rem))] sm:rounded-2xl sm:shadow-lg">
        <header className="flex shrink-0 items-center gap-3 border-b border-border bg-white px-4 py-4">
          <Link
            to="/reports"
            aria-label="Back to format selection"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-page"
          >
            <BackIcon />
          </Link>
          <span className="text-base font-extrabold text-ink">{formatLabel}</span>
        </header>

        <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-4">
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(28,25,23,0.06)]">
            <p className="text-[12px] font-extrabold tracking-[0.04em] text-stone-400 uppercase">Date Range</p>
            <div className="flex items-center justify-center gap-4 py-1">
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-bold text-ink-faint">From</span>
                <DateIconButton value={from} onChange={setFrom} ariaLabel="From date" />
              </div>
              <ArrowRightIcon />
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-bold text-ink-faint">To</span>
                <DateIconButton value={to} onChange={setTo} ariaLabel="To date" />
              </div>
            </div>
            <p className="text-center text-[12px] font-semibold text-ink-muted">{rangeMessage(from, to)}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEmployeeSearchQuery("");
              setEmployeePickerOpen(true);
            }}
            className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-[0_1px_2px_rgba(28,25,23,0.06)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-page text-ink">
              <PersonIcon />
            </span>
            <span className="text-[14px] font-bold text-ink">Employee</span>
          </button>

          <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(28,25,23,0.06)]">
            <p className="mb-1 text-[12px] font-extrabold tracking-[0.04em] text-stone-400 uppercase">
              Fields to Include
            </p>
            {REPORT_FIELD_DEFS.map((f) => (
              <label
                key={f.key}
                className="flex items-center gap-2.5 border-b border-[#f0efed] py-2 text-[13px] font-semibold text-ink-muted"
              >
                <input
                  type="checkbox"
                  checked={fields[f.key]}
                  onChange={() => toggleField(f.key)}
                  className="h-[18px] w-[18px] shrink-0 accent-brand"
                />
                {f.label}
              </label>
            ))}
          </div>

          <div className="mt-auto flex gap-2.5">
            <Link
              to="/reports"
              className="flex h-[46px] flex-1 items-center justify-center rounded-[10px] border-[1.5px] border-border bg-white text-[14px] font-bold text-ink-muted"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSave}
              className="h-[46px] flex-1 rounded-[10px] bg-brand text-[14px] font-bold text-white"
            >
              Save
            </button>
          </div>
        </div>

        {employeePickerOpen && (
          <>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setEmployeePickerOpen(false)}
              className="absolute inset-0 z-10 cursor-default bg-black/40"
            />
            <div className="absolute inset-x-0 top-10 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-[20px] bg-white">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3.5">
                <span className="text-[14px] font-bold text-ink">Employee</span>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setEmployeePickerOpen(false)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-page"
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <SearchBar
                  value={employeeSearchQuery}
                  onChange={setEmployeeSearchQuery}
                  placeholder="Search employee name"
                />
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-[12px] font-extrabold tracking-[0.04em] text-stone-400 uppercase">
                    Choose Employees to Print
                  </p>
                  {!employeesLoading && employees.length > 0 && (
                    <button type="button" onClick={toggleAllEmployees} className="text-[11px] font-bold text-brand">
                      {allEmployeesSelected ? "Clear all" : "Select all"}
                    </button>
                  )}
                </div>
                {employeesLoading ? (
                  <p className="py-2 text-[13px] text-ink-faint">Loading…</p>
                ) : employees.length === 0 ? (
                  <p className="py-2 text-[13px] text-ink-faint">No employees found.</p>
                ) : filteredEmployees.length === 0 ? (
                  <p className="py-2 text-[13px] text-ink-faint">No employees match "{employeeSearchQuery}".</p>
                ) : (
                  filteredEmployees.map((worker) => (
                    <label
                      key={worker.id}
                      className="flex items-center gap-2.5 border-b border-[#f0efed] py-2 text-[13px] font-semibold text-ink-muted last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmployeeIds.has(worker.id)}
                        onChange={() => toggleEmployee(worker.id)}
                        className="h-[18px] w-[18px] shrink-0 accent-brand"
                      />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-ink">{worker.fullName}</span>
                        <span className="truncate text-[11px] font-medium text-ink-faint">{worker.designation}</span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
