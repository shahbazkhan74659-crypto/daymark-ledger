import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { ApiError, postJson } from "../lib/api";
import { DEFAULT_REPORT_FIELDS, REPORT_FIELD_DEFS } from "../types/report";
import type { ReportFieldKey, ReportFieldPreference, ReportFormat } from "../types/report";

type ConfigDraft = { from: string; to: string; selectedEmployeeIds: string[] };

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" className="h-4 w-4">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatFromParam(param: string | undefined): ReportFormat | null {
  if (param === "pdf") return "PDF";
  if (param === "excel") return "EXCEL";
  return null;
}

export function CreateReportPreferenceScreen() {
  const { format: formatParam } = useParams<{ format: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const format = formatFromParam(formatParam);
  const draft = (location.state as { draft?: ConfigDraft } | null)?.draft;

  const [name, setName] = useState("");
  const [fields, setFields] = useState<Record<ReportFieldKey, boolean>>(DEFAULT_REPORT_FIELDS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!format) {
    return <Navigate to="/reports" replace />;
  }

  function toggleField(key: ReportFieldKey) {
    setFields((current) => ({ ...current, [key]: !current[key] }));
  }

  async function handleSave() {
    if (name.trim().length === 0) {
      setError("Give this preference a name.");
      return;
    }
    if (!Object.values(fields).some(Boolean)) {
      setError("Select at least one field to include.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const { preference } = await postJson<{ preference: ReportFieldPreference }>(
        "/api/workers/report-preferences",
        { name, fields },
      );

      navigate(`/reports/${formatParam}`, { state: { appliedFields: preference.fields, draft } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save preference. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-dvh w-full justify-center bg-stone-200 font-sans sm:items-center sm:py-8">
      <div className="flex h-dvh w-full max-w-md flex-col overflow-hidden bg-page sm:h-[min(844px,calc(100dvh-4rem))] sm:rounded-2xl sm:shadow-lg">
        <header className="flex shrink-0 items-center gap-3 border-b border-border bg-white px-4 py-4">
          <Link
            to={`/reports/${formatParam}/preferences`}
            state={{ draft }}
            aria-label="Back to field preferences"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-page"
          >
            <BackIcon />
          </Link>
          <span className="text-base font-extrabold text-ink">New Preference</span>
        </header>

        <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-4">
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(28,25,23,0.06)]">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-ink-faint">Preference name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Monthly Payroll Summary"
                className="w-full rounded-[10px] bg-page px-3 py-2.5 text-[13px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink-faint"
              />
            </label>
          </div>

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

          {error && <p className="text-[12px] font-semibold text-red-600">{error}</p>}
          <div className="mt-auto flex gap-2.5">
            <Link
              to={`/reports/${formatParam}/preferences`}
              state={{ draft }}
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
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
