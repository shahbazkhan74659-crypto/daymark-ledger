import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, postForm, postJson } from "../lib/api";
import type { CreatedWorker } from "../types/worker";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" className="h-4 w-4">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" className="h-3.5 w-3.5 shrink-0">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-muted)" strokeWidth="2.4" className="h-2.5 w-2.5">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold text-ink-faint">
        {label} <span className="text-red-500">*</span>
      </span>
      {children}
    </label>
  );
}

const textInputClass =
  "w-full rounded-[10px] bg-page px-3 py-2.5 text-[13px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink-faint";

export function CreateEmployeeScreen() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [designation, setDesignation] = useState("");
  const [contact, setContact] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [perDayRateInput, setPerDayRateInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const perDayRate = Number(perDayRateInput);
  const canSave =
    fullName.trim().length > 0 &&
    designation.trim().length > 0 &&
    contact.trim().length > 0 &&
    joiningDate.trim().length > 0 &&
    Number.isFinite(perDayRate) &&
    perDayRate > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;

    setError(null);
    setSubmitting(true);
    try {
      const { worker } = await postJson<{ worker: CreatedWorker }>("/api/workers", {
        fullName,
        designation,
        contact,
        joiningDate,
        perDayRate,
      });

      if (selectedFiles.length > 0) {
        await Promise.all(
          selectedFiles.map(async (file) => {
            try {
              const formData = new FormData();
              formData.append("file", file);
              await postForm(`/api/workers/${worker.id}/documents`, formData);
            } catch (uploadErr) {
              console.error(`Failed to upload document "${file.name}" for new employee:`, uploadErr);
            }
          }),
        );
      }

      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

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
          <span className="truncate text-base font-extrabold text-ink">New Employee</span>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-4" noValidate>
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(28,25,23,0.06)]">
            <Field label="Full name">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Yadav"
                className={textInputClass}
              />
            </Field>

            <Field label="Designation">
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Mason"
                className={textInputClass}
              />
            </Field>

            <Field label="Contact">
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+91 90000 00000"
                className={textInputClass}
              />
            </Field>

            <Field label="Joining date">
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className={textInputClass}
              />
            </Field>

            <Field label="Per-day rate">
              <div className="flex items-center gap-1.5 rounded-[10px] bg-page px-3 py-2.5">
                <span className="text-[13px] font-bold text-ink-faint">₹</span>
                <input
                  type="number"
                  value={perDayRateInput}
                  onChange={(e) => setPerDayRateInput(e.target.value)}
                  placeholder="0"
                  className="w-full border-none bg-transparent text-[13px] font-extrabold text-ink outline-none"
                />
              </div>
            </Field>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-ink-faint">Documents (optional)</span>
              {selectedFiles.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center gap-2 rounded-[10px] bg-page px-3 py-2.5"
                    >
                      <DocIcon />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${file.name}`}
                        onClick={() => setSelectedFiles((files) => files.filter((_, i) => i !== index))}
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-border"
                      >
                        <RemoveIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed border-border py-2.5 text-[12px] font-bold text-brand"
              >
                <DocIcon />
                Add document
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  if (files.length > 0) setSelectedFiles((current) => [...current, ...files]);
                }}
                className="hidden"
              />
            </label>
          </div>

          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

          <div className="mt-auto flex gap-2.5">
            <Link
              to="/"
              className="flex h-[46px] flex-1 items-center justify-center rounded-[10px] border-[1.5px] border-border bg-white text-[14px] font-bold text-ink-muted"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!canSave || submitting}
              className="h-[46px] flex-1 rounded-[10px] bg-brand text-[14px] font-bold text-white disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
