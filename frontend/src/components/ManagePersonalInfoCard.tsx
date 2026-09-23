import { useState } from "react";
import { ApiError, postJson } from "../lib/api";
import type { WorkerDetail } from "../types/worker";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold text-ink-faint">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-[10px] bg-page px-3 py-2.5 text-[13px] font-semibold text-ink outline-none";

export function ManagePersonalInfoCard({
  worker,
  onSave,
}: {
  worker: WorkerDetail;
  onSave: (updated: WorkerDetail) => void;
}) {
  const [fullName, setFullName] = useState(worker.fullName);
  const [designation, setDesignation] = useState(worker.designation);
  const [contact, setContact] = useState(worker.contact);
  const [joiningDate, setJoiningDate] = useState(worker.joiningDate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setFullName(worker.fullName);
    setDesignation(worker.designation);
    setContact(worker.contact);
    setJoiningDate(worker.joiningDate);
  }

  async function handleBlur() {
    if (!fullName.trim() || !designation.trim() || !contact.trim() || !joiningDate.trim()) {
      reset();
      return;
    }
    if (
      fullName === worker.fullName &&
      designation === worker.designation &&
      contact === worker.contact &&
      joiningDate === worker.joiningDate
    ) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const { worker: updated } = await postJson<{ worker: WorkerDetail }>(`/api/workers/${worker.id}`, {
        fullName,
        designation,
        contact,
        joiningDate,
      });
      onSave(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save changes.");
      reset();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(28,25,23,0.12),0_0_24px_rgba(15,118,110,0.18)]">
      <p className="text-[12px] font-extrabold tracking-[0.04em] text-stone-400 uppercase">
        Personal Information
      </p>
      <Field label="Employee code">
        <p className={`${inputClass} text-ink-muted`}>{worker.employeeCode}</p>
      </Field>
      <Field label="Full name">
        <input
          value={fullName}
          disabled={saving}
          onChange={(e) => setFullName(e.target.value)}
          onBlur={handleBlur}
          className={inputClass}
        />
      </Field>
      <Field label="Designation">
        <input
          value={designation}
          disabled={saving}
          onChange={(e) => setDesignation(e.target.value)}
          onBlur={handleBlur}
          className={inputClass}
        />
      </Field>
      <Field label="Contact">
        <input
          value={contact}
          disabled={saving}
          onChange={(e) => setContact(e.target.value)}
          onBlur={handleBlur}
          className={inputClass}
        />
      </Field>
      <Field label="Joining date">
        <input
          type="date"
          value={joiningDate}
          disabled={saving}
          onChange={(e) => setJoiningDate(e.target.value)}
          onBlur={handleBlur}
          className={inputClass}
        />
      </Field>
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
