import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./auth/ProtectedRoute";
import OwnerLayout from "./pages/OwnerLayout"; 

export default function App() {
  return (
    <Routes>

      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <OwnerLayout /> 
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        {/* You can add other routes here later */}
        {/* <Route path="properties" element={<Properties />} /> */}
        {/* <Route path="bookings" element={<Bookings />} /> */}
        {/* <Route path="calendar" element={<Calendar />} /> */}
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
