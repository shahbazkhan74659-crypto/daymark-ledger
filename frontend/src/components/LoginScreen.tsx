import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path
        d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-7-11-7a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 7 11 7a20.4 20.4 0 0 1-3.22 4.24M14.12 14.12a3 3 0 1 1-4.24-4.24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M1 1l22 22" strokeLinecap="round" />
    </svg>
  );
}

export function LoginScreen() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh w-full justify-center bg-stone-200 font-sans sm:items-center sm:py-8">
      <div className="flex w-full max-w-md flex-col bg-white sm:rounded-2xl sm:shadow-lg">
        <div className="relative h-64 w-full overflow-hidden sm:h-56 sm:rounded-t-2xl">
          <svg
            viewBox="0 0 400 356"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <defs>
              <linearGradient id="loginHeaderGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-login-header-start)" />
                <stop offset="35%" stopColor="var(--color-login-header-end)" />
                <stop offset="100%" stopColor="var(--color-login-header-end)" />
              </linearGradient>
            </defs>
            <path
              d="M0,264 C10,330 50,356 90,356 L400,356 L400,0 L0,0 Z"
              fill="url(#loginHeaderGradient)"
            />
          </svg>
          <div className="relative flex h-full flex-col items-center justify-center gap-2">
            <img src="/logo.png" alt="" className="h-20 w-20" />
            <span className="text-lg font-bold tracking-wide text-white">Daymark Ledger</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-8 pt-8 pb-6" autoComplete="off" noValidate>
          <label className="flex flex-col gap-1">
            <input
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-b border-stone-300 bg-transparent px-1 py-2 text-sm text-ink outline-none placeholder:text-stone-400 focus:border-login-accent"
              placeholder="Username"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <div className="flex items-center border-b border-stone-300 focus-within:border-login-accent">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-ink outline-none placeholder:text-stone-400"
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="p-1 text-login-accent"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </label>

          {error && <p className="-mt-2 text-sm font-medium text-red-600">{error}</p>}

          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 accent-login-accent"
            />
            Remember Me
          </label>
          {/* "See Your Attendance" public search entry point temporarily hidden per owner request — route/backend left intact, see DECISIONS.md */}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 w-full rounded-full bg-login-accent px-4 py-3 text-sm font-bold tracking-wide text-white uppercase shadow-[0_8px_20px_rgba(30,76,137,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Logging in…" : "Login"}
          </button>

          <span className="text-center text-sm text-login-accent underline decoration-1 underline-offset-2 select-none">
            Forgot Password?
          </span>
        </form>

        <p className="pb-6 text-center text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
          Daily Attendance &amp; Advance Tracking
        </p>
      </div>
    </div>
  );
}
