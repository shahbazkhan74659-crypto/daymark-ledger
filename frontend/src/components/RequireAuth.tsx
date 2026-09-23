import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SkeletonBlock } from "./Skeleton";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex h-dvh w-full justify-center bg-stone-200 font-sans sm:items-center sm:py-8">
        <div className="flex h-dvh w-full max-w-md flex-col overflow-hidden bg-page sm:h-[min(844px,calc(100dvh-4rem))] sm:rounded-2xl sm:shadow-lg">
          <div className="flex shrink-0 items-center gap-3 border-b border-border bg-white px-4 py-4">
            <SkeletonBlock className="h-6 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
