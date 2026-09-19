import { Link, useParams } from "react-router-dom";

export function WorkerDetailStub() {
  const { id } = useParams();

  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-4 bg-page p-6 text-center font-sans">
      <p className="text-sm text-ink-faint">Worker</p>
      <p className="text-base font-semibold text-ink break-all">{id}</p>
      <p className="max-w-xs text-sm text-ink-faint">
        The full worker detail view (calendar, salary, advances) isn&apos;t built yet — this is a
        placeholder route.
      </p>
      <Link
        to="/"
        className="rounded-full bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(15,118,110,0.25)]"
      >
        Back to home
      </Link>
    </div>
  );
}
