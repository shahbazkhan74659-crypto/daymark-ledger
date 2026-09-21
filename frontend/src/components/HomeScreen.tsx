import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError, getJson, postJson } from "../lib/api";
import type { AttendanceStatus, Worker } from "../types/worker";
import { SearchBar } from "./SearchBar";
import { WorkerRow } from "./WorkerRow";

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="h-5 w-5">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-brand)"
      strokeWidth="2"
      className="h-4 w-4 shrink-0"
    >
      {children}
    </svg>
  );
}

const QUICK_ACTIONS = [
  {
    key: "manage-employees",
    label: "Manage Employees",
    icon: (
      <MenuIcon>
        <circle cx="9" cy="8" r="3" />
        <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" strokeLinecap="round" />
        <path d="M16 6.5a3 3 0 0 1 0 5.8M20 20c0-2.6-1.8-4.8-4.3-5.6" strokeLinecap="round" />
      </MenuIcon>
    ),
  },
  {
    key: "reporting",
    label: "Reporting",
    icon: (
      <MenuIcon>
        <path d="M4 20V10M12 20V4M20 20v-7" strokeLinecap="round" />
      </MenuIcon>
    ),
  },
  {
    key: "inactive-employees",
    label: "Inactive Employees",
    icon: (
      <MenuIcon>
        <circle cx="9" cy="8" r="3" />
        <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" strokeLinecap="round" />
        <path d="M16 8l4 4m0-4l-4 4" strokeLinecap="round" />
      </MenuIcon>
    ),
  },
  {
    key: "create-employee",
    label: "Create New Employee",
    icon: (
      <MenuIcon>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" strokeLinecap="round" />
      </MenuIcon>
    ),
  },
] as const;

export function HomeScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  useEffect(() => {
    getJson<{ workers: Worker[] }>("/api/workers")
      .then(({ workers }) => setWorkers(workers))
      .catch((err) => console.error("Failed to load workers:", err))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(workerId: string, status: AttendanceStatus | null) {
    const previous = workers;
    setWorkers((current) => current.map((w) => (w.id === workerId ? { ...w, todayStatus: status } : w)));

    try {
      await postJson<{ worker: Worker }>(`/api/workers/${workerId}/attendance/today`, { status });
    } catch (err) {
      console.error("Failed to update attendance:", err instanceof ApiError ? err.message : err);
      setWorkers(previous);
    }
  }

  const today = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(
    new Date(),
  );

  const filteredWorkers = workers.filter((worker) =>
    worker.fullName.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  return (
    <div className="flex h-dvh w-full justify-center bg-stone-200 font-sans sm:items-center sm:py-8">
    <div className="relative flex h-dvh w-full max-w-md flex-col overflow-hidden bg-page sm:h-[min(844px,calc(100dvh-4rem))] sm:rounded-2xl sm:shadow-lg">
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-white px-4 py-4">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="h-9 w-9 rounded-[10px]" />
          <span className="flex flex-col">
            <span className="text-base font-extrabold text-ink">{user?.username ?? "Admin"}</span>
            <span className="text-[11px] font-medium text-ink-faint">{today}</span>
          </span>
        </div>
        <button
          type="button"
          aria-label="Log out"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-page hover:text-ink disabled:opacity-50"
        >
          <LogoutIcon />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-3.5 pb-6">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search employee name" />
        <p className="mb-2.5 text-[12px] font-bold tracking-[0.06em] text-stone-400 uppercase">
          Workers ({filteredWorkers.length})
        </p>
        {loading ? (
          <p className="text-sm text-ink-faint">Loading…</p>
        ) : filteredWorkers.length === 0 ? (
          <p className="text-sm text-ink-faint">No workers match "{searchQuery}".</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredWorkers.map((worker) => (
              <WorkerRow
                key={worker.id}
                worker={worker}
                onStatusChange={(status) => handleStatusChange(worker.id, status)}
              />
            ))}
          </div>
        )}
      </div>

      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="absolute inset-0 z-10 cursor-default bg-transparent"
        />
      )}

      {menuOpen && (
        <div className="absolute right-5 bottom-[72px] z-20 flex flex-col items-end gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={() => {
                setMenuOpen(false);
                if (action.key === "create-employee") navigate("/workers/new");
                if (action.key === "manage-employees") navigate("/manage/workers");
                if (action.key === "reporting") navigate("/reports");
                if (action.key === "inactive-employees") navigate("/manage/inactive");
              }}
              className="flex items-center gap-2 rounded-xl border border-ink/40 bg-white px-4 py-2.5 text-[13px] font-bold text-ink shadow-[0_6px_16px_rgba(28,25,23,0.18)]"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        aria-label={menuOpen ? "Close quick actions" : "Open quick actions"}
        onClick={() => setMenuOpen((v) => !v)}
        className="absolute right-5 bottom-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-brand shadow-[0_8px_20px_rgba(15,118,110,0.45)]"
      >
        <span
          className="flex transition-transform duration-150 ease-out"
          style={{ transform: menuOpen ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          <PlusIcon />
        </span>
      </button>
    </div>
    </div>
  );
}
