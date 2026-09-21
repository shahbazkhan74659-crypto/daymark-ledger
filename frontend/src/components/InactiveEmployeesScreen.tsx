import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AVATAR_PALETTE, getInitials, hashToIndex } from "../lib/avatar";
import { ApiError, getJson, postJson } from "../lib/api";
import { SearchBar } from "./SearchBar";
import type { ManageWorker } from "../types/worker";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" className="h-4 w-4">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path
        d="M4 7h16M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3m2 0-.8 12.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 11v6M14 11v6" strokeLinecap="round" />
    </svg>
  );
}

export function InactiveEmployeesScreen() {
  const [workers, setWorkers] = useState<ManageWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<ManageWorker | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ workers: ManageWorker[] }>("/api/workers/all")
      .then(({ workers }) => setWorkers(workers.filter((w) => w.status === "INACTIVE")))
      .catch((err) => console.error("Failed to load workers:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredWorkers = workers.filter((worker) =>
    worker.fullName.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  async function confirmDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    setError(null);
    try {
      await postJson(`/api/workers/${pendingDelete.id}/delete`, {});
      setWorkers((current) => current.filter((w) => w.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete employee. Please try again.");
    } finally {
      setDeleting(false);
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
          <span className="text-base font-extrabold text-ink">Inactive Employees</span>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pt-3.5 pb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search employee name" />
          <p className="mb-2.5 text-[12px] font-bold tracking-[0.06em] text-stone-400 uppercase">
            Inactive Workers ({filteredWorkers.length})
          </p>
          {loading ? (
            <p className="text-sm text-ink-faint">Loading…</p>
          ) : filteredWorkers.length === 0 ? (
            <p className="text-sm text-ink-faint">
              {workers.length === 0
                ? "No inactive employees. Mark a worker Inactive from Manage Employees first."
                : `No inactive employees match "${searchQuery}".`}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredWorkers.map((worker) => {
                const palette = AVATAR_PALETTE[hashToIndex(worker.id, AVATAR_PALETTE.length)];
                return (
                  <div
                    key={worker.id}
                    className="flex items-center gap-2.5 rounded-[14px] bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(28,25,23,0.06)]"
                  >
                    <span
                      className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
                      style={{ backgroundColor: palette.bg, color: palette.fg }}
                    >
                      {getInitials(worker.fullName)}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[14px] font-bold text-ink">{worker.fullName}</span>
                      <span className="truncate text-[11px] font-medium text-ink-faint">{worker.designation}</span>
                    </span>
                    <button
                      type="button"
                      aria-label={`Delete ${worker.fullName}`}
                      onClick={() => {
                        setError(null);
                        setPendingDelete(worker);
                      }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-50"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {pendingDelete && (
          <>
            <button
              type="button"
              aria-label="Close"
              onClick={() => !deleting && setPendingDelete(null)}
              className="absolute inset-0 z-10 cursor-default bg-black/40"
            />
            <div className="absolute inset-x-4 bottom-6 z-20 flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-[0_12px_32px_rgba(28,25,23,0.25)]">
              <p className="text-[15px] font-extrabold text-ink">Permanently delete {pendingDelete.fullName}?</p>
              <p className="text-[12px] font-medium text-ink-faint">
                This erases their profile and their entire attendance, advance, and document history for good.
                This cannot be undone.
              </p>
              {error && <p className="text-[12px] font-semibold text-red-600">{error}</p>}
              <div className="mt-1 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setPendingDelete(null)}
                  disabled={deleting}
                  className="flex h-[44px] flex-1 items-center justify-center rounded-[10px] border-[1.5px] border-border bg-white text-[13px] font-bold text-ink-muted disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="h-[44px] flex-1 rounded-[10px] bg-red-600 text-[13px] font-bold text-white disabled:opacity-60"
                >
                  {deleting ? "Deleting…" : "Delete Permanently"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
