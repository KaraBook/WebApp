import { Navigate, Outlet } from "react-router-dom";

function ProtectedAdminRoute({ allowPropertyAdmin = false }) {
  const token = localStorage.getItem("accessToken");

  if (!token) return <Navigate to="/login" replace />;

  let activeRole = null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    activeRole = payload.activeRole;
  } catch {
    return <Navigate to="/login" replace />;
  }

  if (!allowPropertyAdmin && activeRole !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedAdminRoute;