import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AVATAR_PALETTE, getInitials, hashToIndex } from "../lib/avatar";
import { ApiError, getJson, postJson } from "../lib/api";
import type { WorkerDetail, WorkerDocument } from "../types/worker";
import { ManageDocumentsCard } from "./ManageDocumentsCard";
import { ManagePersonalInfoCard } from "./ManagePersonalInfoCard";
import { SkeletonBlock, SkeletonCircle } from "./Skeleton";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" className="h-4 w-4">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NotFoundScreen() {
  return (
    <div className="flex h-dvh w-full justify-center bg-stone-200 font-sans sm:items-center sm:py-8">
      <div className="flex h-dvh w-full max-w-md flex-col items-center justify-center gap-4 bg-page p-6 text-center sm:h-[min(844px,calc(100dvh-4rem))] sm:rounded-2xl sm:shadow-lg">
        <p className="text-sm text-ink-faint">Worker not found</p>
        <Link
          to="/manage/workers"
          className="rounded-full bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(15,118,110,0.25)]"
        >
          Back to Manage Employees
        </Link>
      </div>
    </div>
  );
}

export function ManageEmployeeDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const workerId = String(id);

  const [worker, setWorker] = useState<WorkerDetail | null>(null);
  const [documents, setDocuments] = useState<WorkerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => {
    Promise.all([
      getJson<{ worker: WorkerDetail }>(`/api/workers/${workerId}`),
      getJson<{ documents: WorkerDocument[] }>(`/api/workers/${workerId}/documents`),
    ])
      .then(([workerRes, documentsRes]) => {
        setWorker(workerRes.worker);
        setDocuments(documentsRes.documents);
      })
      .catch((err) => {
        if (err instanceof ApiError) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [workerId]);

  async function handleToggleStatus() {
    if (!worker) return;
    const nextStatus = worker.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setTogglingStatus(true);
    try {
      await postJson<{ worker: { id: string; status: string } }>(`/api/workers/${workerId}/status`, {
        status: nextStatus,
      });
      setWorker((current) => (current ? { ...current, status: nextStatus } : current));
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setTogglingStatus(false);
    }
  }

  if (notFound) return <NotFoundScreen />;

  const palette = AVATAR_PALETTE[hashToIndex(workerId, AVATAR_PALETTE.length)];
  const isActive = worker?.status === "ACTIVE";

  return (
    <div className="flex h-dvh w-full justify-center bg-stone-200 font-sans sm:items-center sm:py-8">
      <div className="flex h-dvh w-full max-w-md flex-col overflow-hidden bg-page sm:h-[min(844px,calc(100dvh-4rem))] sm:rounded-2xl sm:shadow-lg">
        <header className="flex shrink-0 items-center gap-3 border-b border-border bg-white px-4 py-4">
          <Link
            to="/manage/workers"
            aria-label="Back to Manage Employees"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-page"
          >
            <BackIcon />
          </Link>
          {worker ? (
            <>
              <span
                className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
                style={{ backgroundColor: palette.bg, color: palette.fg }}
              >
                {getInitials(worker.fullName)}
              </span>
              <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-ink">{worker.fullName}</span>
              <button
                type="button"
                disabled={togglingStatus}
                onClick={handleToggleStatus}
                className="shrink-0 rounded-full px-[10px] py-[5px] text-[10px] font-extrabold disabled:opacity-50"
                style={{
                  backgroundColor: isActive ? "var(--color-status-active-bg)" : "var(--color-status-inactive-bg)",
                  color: isActive ? "var(--color-status-active-fg)" : "var(--color-status-inactive-fg)",
                }}
              >
                {isActive ? "Active" : "Inactive"}
              </button>
            </>
          ) : (
            loading && (
              <>
                <SkeletonCircle size={38} />
                <SkeletonBlock className="h-4 w-32 flex-1" />
                <SkeletonBlock className="h-5 w-14 shrink-0 rounded-full" />
              </>
            )
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-4 pt-3.5 pb-6">
          {loading ? (
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-2.5 rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(28,25,23,0.12),0_0_24px_rgba(15,118,110,0.18)]">
                <SkeletonBlock className="mb-1 h-3 w-32" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <SkeletonBlock className="h-3 w-20" />
                    <SkeletonBlock className="h-3 w-24" />
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(28,25,23,0.12),0_0_24px_rgba(15,118,110,0.18)]">
                <SkeletonBlock className="mb-2.5 h-3 w-28" />
                <SkeletonBlock className="h-9 w-full rounded-xl" />
              </div>
            </div>
          ) : (
            worker && (
              <div className="flex flex-col gap-3.5">
                <ManagePersonalInfoCard worker={worker} onSave={setWorker} />
                <ManageDocumentsCard workerId={workerId} documents={documents} onChange={setDocuments} />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
