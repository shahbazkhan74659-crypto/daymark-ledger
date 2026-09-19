import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function HomePlaceholder() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-page p-4 font-sans">
      <p className="text-base font-semibold text-ink">Logged in as {user?.username}</p>
      <p className="text-sm text-ink-faint">
        The real home screen (worker list) isn&apos;t built yet — this is a Phase 8 placeholder.
      </p>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="rounded-full bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(15,118,110,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loggingOut ? "Logging out…" : "Log out"}
      </button>
    </div>
  );
}
