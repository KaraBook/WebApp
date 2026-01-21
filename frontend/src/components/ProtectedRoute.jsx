import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

export default function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore.persist.hasHydrated();
  const loc = useLocation();

  if (!hasHydrated) {
    return null; 
  }

  if (!user) {
    return <Navigate to="/" state={{ from: loc }} replace />;
  }

  return <Outlet />;
}
