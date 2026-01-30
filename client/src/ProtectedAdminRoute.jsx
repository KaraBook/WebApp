import { Navigate, Outlet } from "react-router-dom";

function ProtectedAdminRoute({ allowPropertyAdmin = false }) {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;

  if (!allowPropertyAdmin && role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedAdminRoute; 
