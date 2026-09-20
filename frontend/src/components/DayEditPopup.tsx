import { useState } from "react";
import { formatDayLabel } from "../lib/format";
import type { AttendanceStatus } from "../types/worker";

const STATUS_OPTIONS: { status: AttendanceStatus; label: string; bg: string; fg: string }[] = [
  { status: "PRESENT", label: "Present", bg: "var(--color-status-present-bg)", fg: "var(--color-status-present-fg)" },
  { status: "HALF", label: "Half day", bg: "var(--color-status-half-bg)", fg: "var(--color-status-half-fg)" },
  { status: "ABSENT", label: "Absent", bg: "var(--color-status-absent-bg)", fg: "var(--color-status-absent-fg)" },
];

export function DayEditPopup({
  date,
  initialStatus,
  initialAdvanceAmount,
  onCancel,
  onSave,
}: {
  date: string;
  initialStatus: AttendanceStatus | null;
  initialAdvanceAmount: number | null;
  onCancel: () => void;
  onSave: (status: AttendanceStatus | null, advanceAmount: number | null) => Promise<void>;
}) {
  const [status, setStatus] = useState<AttendanceStatus | null>(initialStatus);
  const [advanceChecked, setAdvanceChecked] = useState(initialAdvanceAmount !== null);
  const [amountInput, setAmountInput] = useState(initialAdvanceAmount !== null ? String(initialAdvanceAmount) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const amount = advanceChecked ? Number(amountInput) : null;
    if (advanceChecked && (!Number.isFinite(amount) || (amount ?? 0) <= 0)) {
      setError("Enter a valid advance amount");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(status, amount);
    } catch {
      setError("Failed to save — try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close"
        onClick={onCancel}
        className="absolute inset-0 z-10 cursor-default bg-black/40"
      />
      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-3.5 rounded-t-[20px] bg-white px-[18px] pt-[18px] pb-[22px]">
        <p className="text-[15px] font-extrabold text-ink">{formatDayLabel(date)}</p>

        <div className="flex gap-2">
          {STATUS_OPTIONS.map((option) => {
            const selected = status === option.status;
            return (
              <button
                key={option.status}
                type="button"
                onClick={() => setStatus((current) => (current === option.status ? null : option.status))}
                className="h-[46px] flex-1 rounded-[10px] border-2 text-[13px] font-bold transition-colors"
                style={
                  selected
                    ? { backgroundColor: option.bg, color: option.fg, borderColor: option.fg }
                    : { backgroundColor: "white", color: "var(--color-ink-muted)", borderColor: "var(--color-status-neutral-border)" }
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="h-px bg-[#f0efed]" />

        <label className="flex items-center gap-2.5 text-[13px] font-semibold text-ink-muted">
          <input
            type="checkbox"
            checked={advanceChecked}
            onChange={(e) => setAdvanceChecked(e.target.checked)}
            className="h-[18px] w-[18px] accent-brand"
          />
          Advance salary given on this day
        </label>

        {advanceChecked && (
          <div className="flex items-center gap-1.5 rounded-[10px] bg-page px-3 py-2.5">
            <span className="text-[15px] font-bold text-ink-faint">₹</span>
            <input
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="0"
              className="w-full border-none bg-transparent text-[15px] font-extrabold text-ink outline-none"
            />
          </div>
        )}

        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

        <div className="mt-1 flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="h-[46px] flex-1 rounded-[10px] border-[1.5px] border-border bg-white text-[14px] font-bold text-ink-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-[46px] flex-1 rounded-[10px] bg-brand text-[14px] font-bold text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </>
  );
}
