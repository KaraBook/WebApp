import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./auth/ProtectedRoute";
import Properties from "./pages/Properties";
import EditProperty from "./pages/EditProperty";
import OfflineBooking from "./pages/OfflineBooking";
import Calendar from "./pages/Calendar";
import OwnerBookings from "./pages/OwnerBookings";
import ViewInvoice from "./pages/ViewInvoice";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainContainer /> 
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="view-property/:id" element={<Properties />} />
        <Route path="edit-property/:id" element={<EditProperty />} />
        <Route path="offline-booking/:id" element={<OfflineBooking />} />
        <Route path="bookings" element={<OwnerBookings />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="invoice/:id" element={<ViewInvoice />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

import { Outlet } from "react-router-dom";
import Header from "./components/Header";

function MainContainer() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-0">
        <Outlet />
      </main>
    </div>
  );
}
