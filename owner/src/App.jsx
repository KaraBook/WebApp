import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./auth/ProtectedRoute";
import OwnerLayout from "./pages/OwnerLayout"; 
import Properties from "./pages/Properties";
import ViewProperty from "./pages/ViewProperty";
import EditProperty from "./pages/EditProperty";
import EditPropertyTwo from "./pages/EditPropertyTwo";

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
        <Route path="properties" element={<Properties />} />
        <Route path="view-property/:id" element={<ViewProperty />} /> 
        <Route path="edit-property/:id" element={<EditProperty />} />
        <Route path="edit-property-two/:id" element={<EditPropertyTwo />} />
        {/* <Route path="bookings" element={<Bookings />} /> */}
        {/* <Route path="calendar" element={<Calendar />} /> */}
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
