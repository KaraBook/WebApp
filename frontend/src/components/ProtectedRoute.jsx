import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

export default function ProtectedRoute() {
  const { user, hydrated } = useAuthStore((s) => ({
    user: s.user,
    hydrated: s._hasHydrated,
  }));

  const loc = useLocation();

  if (!hydrated) return null; 

  if (!user) {
    return <Navigate to="/" state={{ from: loc }} replace />;
  }

  return <Outlet />;
}
