import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLogin from "../pages/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard";
import AdminLayout from "../layouts/AdminLayout";
import PropertiesPage from "../pages/PropertiesPage";
import ProtectedAdminRoute from "../ProtectedAdminRoute"; 
import AddProperty from "../pages/AddProperty";
import EditProperty from "../pages/EditProperty";
import ViewProperty from "../pages/ViewProperty";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />

       
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="properties/blocked" element={<div>Blocked Page</div>} />
            <Route path="add-property" element={<AddProperty />} />
            <Route path="edit-property/:id" element={<EditProperty />} />
            <Route path="/admin/view-property/:id" element={<ViewProperty />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default AppRoutes;
