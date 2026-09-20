import { useState } from "react";
import { formatINR } from "../lib/format";

export function SalaryConfigCard({
  perDayRate,
  onSave,
}: {
  perDayRate: number;
  onSave: (newRate: number) => Promise<void>;
}) {
  const [value, setValue] = useState(String(perDayRate));
  const [saving, setSaving] = useState(false);

  async function handleBlur() {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setValue(String(perDayRate));
      return;
    }
    if (parsed === perDayRate) return;

    setSaving(true);
    try {
      await onSave(parsed);
    } catch {
      setValue(String(perDayRate));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[14px] bg-white p-3.5 shadow-[0_1px_2px_rgba(28,25,23,0.06)]">
      <p className="mb-2.5 text-[11px] font-extrabold tracking-[0.04em] text-stone-400 uppercase">
        Salary Configuration
      </p>

      <div className="flex items-center justify-between py-1.5">
        <span className="text-[13px] text-ink-muted">Per-day rate</span>
        <div className="flex items-center gap-1 rounded-[10px] bg-page px-2.5 py-1.5">
          <span className="text-[13px] font-bold text-ink-faint">₹</span>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            disabled={saving}
            className="w-16 border-none bg-transparent text-right text-[13px] font-extrabold text-ink outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between py-1.5">
        <span className="text-[13px] text-ink-muted">
          Half-day pay <span className="text-stone-400">(0.5×)</span>
        </span>
        <span className="text-[13px] font-bold text-ink">{formatINR(perDayRate * 0.5)}</span>
      </div>
    </div>
  );
}
