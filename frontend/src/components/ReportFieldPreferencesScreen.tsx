import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { getJson } from "../lib/api";
import { REPORT_FIELD_DEFS } from "../types/report";
import type { ReportFieldKey, ReportFieldPreference, ReportFormat } from "../types/report";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" className="h-4 w-4">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" className="h-5 w-5">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function formatFromParam(param: string | undefined): ReportFormat | null {
  if (param === "pdf") return "PDF";
  if (param === "excel") return "EXCEL";
  return null;
}

function fieldsSummary(fields: Record<ReportFieldKey, boolean>): string {
  const labels = REPORT_FIELD_DEFS.filter((f) => fields[f.key]).map((f) => f.label);
  return labels.length > 0 ? labels.join(", ") : "No fields selected";
}

export function ReportFieldPreferencesScreen() {
  const { format: formatParam } = useParams<{ format: string }>();
  const navigate = useNavigate();
  const format = formatFromParam(formatParam);

  const [preferences, setPreferences] = useState<ReportFieldPreference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJson<{ preferences: ReportFieldPreference[] }>("/api/workers/report-preferences")
      .then(({ preferences }) => setPreferences(preferences))
      .catch((err) => console.error("Failed to load report field preferences:", err))
      .finally(() => setLoading(false));
  }, []);

  if (!format) {
    return <Navigate to="/reports" replace />;
  }

  function applyPreference(preference: ReportFieldPreference) {
    navigate(`/reports/${formatParam}`, { state: { appliedFields: preference.fields } });
  }

  return (
    <div className="flex h-dvh w-full justify-center bg-stone-200 font-sans sm:items-center sm:py-8">
      <div className="flex h-dvh w-full max-w-md flex-col overflow-hidden bg-page sm:h-[min(844px,calc(100dvh-4rem))] sm:rounded-2xl sm:shadow-lg">
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-white px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              to={`/reports/${formatParam}`}
              aria-label="Back to report config"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-page"
            >
              <BackIcon />
            </Link>
            <span className="text-base font-extrabold text-ink">Field Preferences</span>
          </div>
          <button
            type="button"
            aria-label="Create new preference"
            onClick={() => navigate(`/reports/${formatParam}/preferences/new`)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-page text-ink transition-colors hover:bg-brand hover:text-white"
          >
            <PlusIcon />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="py-2 text-[13px] text-ink-faint">Loading…</p>
          ) : preferences.length === 0 ? (
            <p className="py-2 text-[13px] text-ink-faint">
              No saved preferences yet. Tap + to create one for the Fields to Include section.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {preferences.map((preference) => (
                <button
                  key={preference.id}
                  type="button"
                  onClick={() => applyPreference(preference)}
                  className="flex flex-col gap-1 rounded-2xl bg-white p-4 text-left shadow-[0_1px_2px_rgba(28,25,23,0.06)]"
                >
                  <span className="text-[14px] font-bold text-ink">{preference.name}</span>
                  <span className="text-[12px] font-medium text-ink-faint">{fieldsSummary(preference.fields)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
