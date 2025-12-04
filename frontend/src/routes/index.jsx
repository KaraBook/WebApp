import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Signup from "@/pages/Signup";
import AccountLayout from "@/layouts/AccountLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Bookings from "@/components/accounts/Bookings";
import Wishlist from "@/components/accounts/Wishlist";
import Profile from "@/components/accounts/Profile";
import Ratings from "@/components/accounts/Ratings";
import Support from "@/components/accounts/Support";
import Properties from "@/pages/Properties";
import PropertyDetails from "@/pages/PropertyDetails";
import Checkout from "@/pages/Checkout";
import InvoicePage from "@/pages/InvoicePage";
import Contact from "@/pages/Contact";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="properties" element={<Properties />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/properties/:id" element={<PropertyDetails />} />
      <Route path="/checkout/:propertyId" element={<Checkout />} />

      {/* Dashboard-only area */}
      <Route element={<ProtectedRoute />}>
        <Route path="/account" element={<AccountLayout />}>
          <Route path="bookings" element={<Bookings />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="profile"  element={<Profile />} />
          <Route path="ratings"  element={<Ratings />} />
          <Route path="support"  element={<Support />} />
          <Route path="invoice/:id" element={<InvoicePage />} />
        </Route>
      </Route>
    </Routes>
  );
}
