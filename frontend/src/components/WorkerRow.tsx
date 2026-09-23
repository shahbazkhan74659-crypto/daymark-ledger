import { Link } from "react-router-dom";
import { AVATAR_PALETTE, getInitials, hashToIndex } from "../lib/avatar";
import type { AttendanceStatus, Worker } from "../types/worker";
import { StatusPill } from "./StatusPill";

const STATUSES: AttendanceStatus[] = ["PRESENT", "HALF", "ABSENT"];

export function WorkerRow({
  worker,
  onStatusChange,
}: {
  worker: Worker;
  onStatusChange: (status: AttendanceStatus | null) => void;
}) {
  const palette = AVATAR_PALETTE[hashToIndex(worker.id, AVATAR_PALETTE.length)];

  return (
    <div className="flex items-center justify-between gap-2 rounded-[16px] bg-white px-3 py-2.5 shadow-[0_2px_8px_rgba(28,25,23,0.12),0_0_24px_rgba(15,118,110,0.18)]">
      <Link to={`/workers/${worker.id}`} className="flex min-w-0 flex-1 items-center gap-2.5">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
          style={{ backgroundColor: palette.bg, color: palette.fg }}
        >
          {getInitials(worker.fullName)}
        </span>
        <span className="truncate text-[15px] font-bold text-ink">{worker.fullName}</span>
      </Link>

      <div className="flex shrink-0 items-center gap-1.5">
        {STATUSES.map((status) => (
          <StatusPill
            key={status}
            status={status}
            active={worker.todayStatus === status}
            onClick={() => onStatusChange(worker.todayStatus === status ? null : status)}
          />
        ))}
      </div>
    </div>
  );
}
