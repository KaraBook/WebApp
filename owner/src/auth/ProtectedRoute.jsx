import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { ready } = useAuth();
  const access = localStorage.getItem("owner_access");
  if (!ready) return null; 
  return access ? children : <Navigate to="/login" replace />;
}
