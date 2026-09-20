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
    <div className="flex items-center justify-between gap-1.5 rounded-[14px] bg-white px-2.5 py-2 shadow-[0_1px_2px_rgba(28,25,23,0.06)]">
      <Link to={`/workers/${worker.id}`} className="flex min-w-0 flex-1 items-center gap-2">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
          style={{ backgroundColor: palette.bg, color: palette.fg }}
        >
          {getInitials(worker.fullName)}
        </span>
        <span className="truncate text-[13px] font-bold text-ink">{worker.fullName}</span>
      </Link>

      <div className="flex shrink-0 items-center gap-1">
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
