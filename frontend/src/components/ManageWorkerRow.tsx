import { Link } from "react-router-dom";
import { AVATAR_PALETTE, getInitials, hashToIndex } from "../lib/avatar";
import type { ManageWorker } from "../types/worker";

export function ManageWorkerRow({ worker }: { worker: ManageWorker }) {
  const palette = AVATAR_PALETTE[hashToIndex(worker.id, AVATAR_PALETTE.length)];
  const isActive = worker.status === "ACTIVE";

  return (
    <Link
      to={`/manage/workers/${worker.id}`}
      className="flex items-center gap-2.5 rounded-[14px] bg-white px-3 py-2.5 shadow-[0_2px_8px_rgba(28,25,23,0.12),0_0_24px_rgba(15,118,110,0.18)]"
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
      <span
        className="shrink-0 rounded-full px-[9px] py-1 text-[10px] font-extrabold"
        style={{
          backgroundColor: isActive ? "var(--color-status-active-bg)" : "var(--color-status-inactive-bg)",
          color: isActive ? "var(--color-status-active-fg)" : "var(--color-status-inactive-fg)",
        }}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    </Link>
  );
}
