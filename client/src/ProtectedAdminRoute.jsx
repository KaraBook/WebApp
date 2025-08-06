import { Navigate, Outlet } from "react-router-dom";

function ProtectedAdminRoute() {
  const token = localStorage.getItem("accessToken");

  // You can also decode and check token role here if needed

  return token ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

export default ProtectedAdminRoute;
