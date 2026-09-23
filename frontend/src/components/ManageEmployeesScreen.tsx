import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJson } from "../lib/api";
import type { ManageWorker } from "../types/worker";
import { ManageWorkerRow } from "./ManageWorkerRow";
import { SearchBar } from "./SearchBar";
import { SkeletonListRow } from "./Skeleton";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" className="h-4 w-4">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ManageEmployeesScreen() {
  const [workers, setWorkers] = useState<ManageWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getJson<{ workers: ManageWorker[] }>("/api/workers/all")
      .then(({ workers }) => setWorkers(workers))
      .catch((err) => console.error("Failed to load workers:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredWorkers = workers.filter((worker) =>
    worker.fullName.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  return (
    <div className="flex h-dvh w-full justify-center bg-stone-200 font-sans sm:items-center sm:py-8">
      <div className="flex h-dvh w-full max-w-md flex-col overflow-hidden bg-page sm:h-[min(844px,calc(100dvh-4rem))] sm:rounded-2xl sm:shadow-lg">
        <header className="flex shrink-0 items-center gap-3 border-b border-border bg-white px-4 py-4">
          <Link
            to="/"
            aria-label="Back to home"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-page"
          >
            <BackIcon />
          </Link>
          <span className="text-base font-extrabold text-ink">Manage Employees</span>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pt-3.5 pb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search employee name" />
          <p className="mb-2.5 text-[12px] font-bold tracking-[0.06em] text-stone-400 uppercase">
            Workers ({filteredWorkers.length})
          </p>
          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonListRow key={i} avatarSize={38} lines={2} trailing="badge" />
              ))}
            </div>
          ) : filteredWorkers.length === 0 ? (
            <p className="text-sm text-ink-faint">No workers match "{searchQuery}".</p>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredWorkers.map((worker) => (
                <ManageWorkerRow key={worker.id} worker={worker} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
