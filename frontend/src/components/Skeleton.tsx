export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-stone-200 ${className}`} />;
}

export function SkeletonCircle({ size }: { size: number }) {
  return (
    <div
      className="shrink-0 animate-pulse rounded-full bg-stone-200"
      style={{ width: size, height: size }}
    />
  );
}

export function SkeletonListRow({
  avatarSize = 40,
  lines = 1,
  trailing,
}: {
  avatarSize?: number;
  lines?: 1 | 2;
  trailing?: "pills" | "badge" | "icons" | "none";
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-[16px] bg-white px-3 py-2.5 shadow-[0_2px_8px_rgba(28,25,23,0.12),0_0_24px_rgba(15,118,110,0.18)]">
      <SkeletonCircle size={avatarSize} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <SkeletonBlock className="h-3.5 w-[60%]" />
        {lines === 2 && <SkeletonBlock className="h-2.5 w-[35%]" />}
      </div>
      {trailing === "pills" && (
        <div className="flex shrink-0 items-center gap-1.5">
          <SkeletonBlock className="h-7 w-9 rounded-lg" />
          <SkeletonBlock className="h-7 w-9 rounded-lg" />
          <SkeletonBlock className="h-7 w-9 rounded-lg" />
        </div>
      )}
      {trailing === "badge" && <SkeletonBlock className="h-5 w-14 shrink-0 rounded-full" />}
      {trailing === "icons" && (
        <div className="flex shrink-0 items-center gap-1.5">
          <SkeletonCircle size={32} />
          <SkeletonCircle size={32} />
        </div>
      )}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-[14px] bg-white p-3.5 shadow-[0_2px_8px_rgba(28,25,23,0.12),0_0_24px_rgba(15,118,110,0.18)] ${className}`}
    >
      <div className="flex flex-col gap-2.5">
        <SkeletonBlock className="h-3 w-[40%]" />
        <SkeletonBlock className="h-3 w-[80%]" />
        <SkeletonBlock className="h-3 w-[60%]" />
      </div>
    </div>
  );
}
