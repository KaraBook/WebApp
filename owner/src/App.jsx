import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./auth/ProtectedRoute";
import Properties from "./pages/Properties";
import EditProperty from "./pages/EditProperty";
import OfflineBooking from "./pages/OfflineBooking";
import Calendar from "./pages/Calendar";
import OwnerBookings from "./pages/OwnerBookings";
import ViewInvoice from "./pages/ViewInvoice";
import api from "./api/axios";
import SummaryApi from "./common/SummaryApi";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import MyProfile from "./pages/MyProfile";
import CreateManager from "./pages/CreateManager";
import MobileBottomNav from "./components/MobileBottomNav";


/* -----------------------------------------
   AUTO-REDIRECT TO FIRST PROPERTY
------------------------------------------ */
function AutoPropertyRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerProperties.url);
        const list = res.data?.data || [];

        if (list.length > 0) {
          navigate(`/view-property/${list[0]._id}`, { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        navigate("/dashboard", { replace: true });
      }
    })();
  }, []);

  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full"></div>
    </div>
  );
}



function MainContainer() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="p-0 pb-16 md:pb-0">
        <Outlet />
      </main>

      <MobileBottomNav />
    </div>
  );
}


export default function App() {
  return (
    <Routes>

      <Route path="/login" element={<Login userType="owner" />} />
      <Route path="/manager/login" element={<Login userType="manager" />} />

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
        <Route path="properties" element={<AutoPropertyRedirect />} />
        <Route path="view-property/:id" element={<Properties />} />
        <Route path="edit-property/:id" element={<EditProperty />} />
        <Route path="offline-booking/:id" element={<OfflineBooking />} />
        <Route path="bookings" element={<OwnerBookings />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="my-profile" element={<MyProfile />} />
        <Route path="invoice/:id" element={<ViewInvoice />} />
        <Route path="/manager/create" element={<CreateManager />} />
      </Route>

      {/* CATCH-ALL */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
