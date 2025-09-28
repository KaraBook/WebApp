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

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />

       
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="properties/blocked" element={<BlockedProperties/>}/>
            <Route path="add-property" element={<AddProperty />} />
            <Route path="edit-property/:id" element={<EditProperty />} />
            <Route path="/admin/view-property/:id" element={<ViewProperty />} />
            <Route path="properties/drafts" element={<DraftPropertiesPage />} />
            <Route path="/admin/properties/:id/media" element={<FinalizeMedia />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default AppRoutes;
