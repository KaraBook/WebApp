import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLogin from "../pages/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard";
import AdminLayout from "../layouts/AdminLayout";
import PropertiesPage from "../pages/PropertiesPage";
import ProtectedAdminRoute from "../ProtectedAdminRoute"; 
import AddProperty from "../pages/AddProperty";
import EditProperty from "../pages/EditProperty";
import ViewProperty from "../pages/ViewProperty";
import DraftPropertiesPage from "@/pages/DraftPropertiesPage";
import FinalizeMedia from "@/pages/FinalizeMedia";
import BlockedProperties from "@/pages/BlockedProperties";
import { BrowserRouter } from "react-router-dom";
import BookingsPage from "@/pages/BookingsPage";

function AppRoutes() {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route path="/login" element={<AdminLogin />} />

        <Route element={<ProtectedAdminRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="properties/blocked" element={<BlockedProperties />} />
            <Route path="add-property" element={<AddProperty />} />
            <Route path="edit-property/:id" element={<EditProperty />} />
            <Route path="view-property/:id" element={<ViewProperty />} />
            <Route path="properties/drafts" element={<DraftPropertiesPage />} />
            <Route path="properties/:id/media" element={<FinalizeMedia />} />
            <Route path="bookings" element={<BookingsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
