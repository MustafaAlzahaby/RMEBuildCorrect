import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" />;
  return <>{children}</>;
}

export function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
