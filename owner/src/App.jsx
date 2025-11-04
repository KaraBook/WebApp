import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./auth/ProtectedRoute";
import OwnerLayout from "./pages/OwnerLayout"; // Import your layout
// You can later add Property, Booking, Calendar pages here too.

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Owner Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <OwnerLayout /> {/* ✅ Wrap all owner pages inside sidebar layout */}
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
