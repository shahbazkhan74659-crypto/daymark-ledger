import type { AttendanceStatus } from "../types/worker";

const STATUS_META: Record<AttendanceStatus, { label: string; bg: string; fg: string }> = {
  PRESENT: { label: "P", bg: "var(--color-status-present-bg)", fg: "var(--color-status-present-fg)" },
  HALF: { label: "H", bg: "var(--color-status-half-bg)", fg: "var(--color-status-half-fg)" },
  ABSENT: { label: "A", bg: "var(--color-status-absent-bg)", fg: "var(--color-status-absent-fg)" },
};

export function StatusPill({
  status,
  active,
  onClick,
}: {
  status: AttendanceStatus;
  active: boolean;
  onClick: () => void;
}) {
  const meta = STATUS_META[status];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Mark ${meta.label === "P" ? "Present" : meta.label === "H" ? "Half day" : "Absent"}`}
      aria-pressed={active}
      className="flex h-8 w-8 items-center justify-center rounded-lg border-[1.5px] text-[12px] font-extrabold transition-colors"
      style={
        active
          ? { backgroundColor: meta.bg, color: meta.fg, borderColor: meta.fg }
          : {
              backgroundColor: "white",
              color: "var(--color-status-neutral-fg)",
              borderColor: "var(--color-status-neutral-border)",
            }
      }
    >
      {meta.label}
    </button>
  );
}
