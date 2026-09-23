import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { ApiError, getJson, postBlob } from "../lib/api";
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

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M6 3h12a1 1 0 0 1 1 1v16l-7-4-7 4V4a1 1 0 0 1 1-1Z" strokeLinecap="round" strokeLinejoin="round" />
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
  const inputRef = useRef<HTMLInputElement>(null);

  function openPicker() {
    const input = inputRef.current;
    if (input && typeof input.showPicker === "function") {
      try {
        input.showPicker();
      } catch {
        // Some browsers throw if showPicker() isn't allowed here (e.g. not a direct
        // user-gesture call) — the input itself is still directly tappable as a fallback.
      }
    }
  }

  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-page text-ink transition-colors focus-within:bg-black focus-within:text-white">
      <CalendarIcon />
      <input
        ref={inputRef}
        type="date"
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={openPicker}
        className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent text-transparent caret-transparent [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:opacity-0"
      />
    </div>
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
  const location = useLocation();
  const format = formatFromParam(formatParam);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fields, setFields] = useState<Record<ReportFieldKey, boolean>>(DEFAULT_REPORT_FIELDS);
  const [employees, setEmployees] = useState<ManageWorker[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());
  const [employeePickerOpen, setEmployeePickerOpen] = useState(false);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ workers: ManageWorker[] }>("/api/workers/all")
      .then(({ workers }) => setEmployees(workers))
      .catch((err) => console.error("Failed to load workers:", err))
      .finally(() => setEmployeesLoading(false));
  }, []);

  useEffect(() => {
    const state = location.state as {
      appliedFields?: Record<ReportFieldKey, boolean>;
      draft?: { from: string; to: string; selectedEmployeeIds: string[] };
    } | null;
    if (state?.appliedFields || state?.draft) {
      if (state.appliedFields) setFields(state.appliedFields);
      if (state.draft) {
        setFrom(state.draft.from);
        setTo(state.draft.to);
        setSelectedEmployeeIds(new Set(state.draft.selectedEmployeeIds));
      }
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

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

  async function handleSave() {
    if (selectedEmployeeIds.size === 0) {
      setSaveError("Select at least one employee.");
      return;
    }
    if (!from || !to) {
      setSaveError("Choose both a From and To date.");
      return;
    }
    if (!Object.values(fields).some(Boolean)) {
      setSaveError("Select at least one field to include.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const { blob, filename } = await postBlob("/api/workers/report", {
        format,
        from,
        to,
        fields,
        workerIds: Array.from(selectedEmployeeIds),
      });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename ?? `Attendance_Register.${format === "PDF" ? "pdf" : "xlsx"}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      navigate("/reports");
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to generate report. Please try again.");
    } finally {
      setSaving(false);
    }
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
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(28,25,23,0.12),0_0_24px_rgba(15,118,110,0.18)]">
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
            className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-[0_2px_8px_rgba(28,25,23,0.12),0_0_24px_rgba(15,118,110,0.18)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-page text-ink">
              <PersonIcon />
            </span>
            <span className="text-[14px] font-bold text-ink">Employee</span>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(`/reports/${formatParam}/preferences`, {
                state: { draft: { from, to, selectedEmployeeIds: Array.from(selectedEmployeeIds) } },
              })
            }
            className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-[0_2px_8px_rgba(28,25,23,0.12),0_0_24px_rgba(15,118,110,0.18)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-page text-ink">
              <BookmarkIcon />
            </span>
            <span className="text-[14px] font-bold text-ink">Field Preference</span>
          </button>

          <div className="rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(28,25,23,0.12),0_0_24px_rgba(15,118,110,0.18)]">
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

          {saveError && <p className="text-[12px] font-semibold text-red-600">{saveError}</p>}
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
              disabled={saving}
              className="h-[46px] flex-1 rounded-[10px] bg-brand text-[14px] font-bold text-white disabled:opacity-60"
            >
              {saving ? "Generating…" : "Save"}
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
