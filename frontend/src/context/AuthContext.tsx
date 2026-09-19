import { createContext, use, useCallback, useEffect, useState, type ReactNode } from "react";
import { getJson, postJson } from "../lib/api";

type User = { id: string; username: string };
type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getJson<{ user: User }>("/api/auth/me")
      .then(({ user }) => {
        setUser(user);
        setStatus("authenticated");
      })
      .catch(() => {
        setUser(null);
        setStatus("unauthenticated");
      });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    await postJson("/api/auth/login", { username, password });
    const { user } = await getJson<{ user: User }>("/api/auth/me");
    setUser(user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    await postJson("/api/auth/logout");
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return <AuthContext value={{ status, user, login, logout }}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
