import { useState } from "react";
import { formatINR } from "../lib/format";
import type { Repayment, RepaymentBucket } from "../types/worker";
import { CollapsibleHistory } from "./CollapsibleHistory";

function PaidCheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 shrink-0" aria-label="Fully repaid">
      <circle cx="10" cy="10" r="9" fill="var(--color-status-active-fg)" />
      <path d="M6 10.3l2.4 2.4L14 7.3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface RepaymentBucketCardProps {
  title: string;
  bucket: RepaymentBucket;
  advanceTaken: number;
  outstanding: number;
  history: Repayment[];
  onSave: (amount: number) => Promise<void>;
}

export function RepaymentBucketCard({
  title,
  bucket: _bucket,
  advanceTaken,
  outstanding,
  history,
  onSave,
}: RepaymentBucketCardProps) {
  const [amountInput, setAmountInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fullyRepaid = advanceTaken > 0 && outstanding === 0;

  async function handleSave() {
    setError(null);
    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be a positive number");
      return;
    }
    if (amount > outstanding) {
      setError(`Repayment cannot exceed pending balance (₹${formatINR(outstanding)})`);
      return;
    }
    setSaving(true);
    try {
      await onSave(amount);
      setAmountInput("");
    } catch {
      // Error is already set by the parent component
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[14px] bg-white p-3.5 shadow-[0_2px_8px_rgba(28,25,23,0.12),0_0_24px_rgba(15,118,110,0.18)]">
      <div className="mb-2.5">
        <p className="text-[11px] font-extrabold tracking-[0.04em] text-stone-400 uppercase">{title}</p>
      </div>

      <div className="mb-2.5 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-page p-3">
          <div className="mb-1 flex items-center gap-1">
            <p className="text-[10px] font-bold tracking-[0.03em] text-stone-400 uppercase">Advance Taken</p>
            {fullyRepaid && <PaidCheckIcon />}
          </div>
          <p className="text-base font-extrabold text-ink">{formatINR(advanceTaken)}</p>
        </div>
        <div className="rounded-xl bg-page p-3">
          <p className="mb-1 text-[10px] font-bold tracking-[0.03em] text-stone-400 uppercase">Pending</p>
          <p className="text-base font-extrabold text-ink">{formatINR(outstanding)}</p>
        </div>
      </div>

      <div className="mb-2.5 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-1.5 rounded-[10px] bg-page px-3 py-2.5">
          <span className="text-[15px] font-bold text-ink-faint">₹</span>
          <input
            type="number"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            placeholder="Repayment"
            className="w-full border-none bg-transparent text-[15px] font-extrabold text-ink outline-none placeholder:text-stone-300"
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-[46px] shrink-0 rounded-[10px] bg-brand px-5 text-[14px] font-bold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {error && <div className="mb-2.5 rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</div>}

      <CollapsibleHistory history={history} />
    </div>
  );
}
