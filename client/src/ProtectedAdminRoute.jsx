import { Navigate, Outlet } from "react-router-dom";

function ProtectedAdminRoute() {
  const token = localStorage.getItem("accessToken");


  return token ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

export default ProtectedAdminRoute;
