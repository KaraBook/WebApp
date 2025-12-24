import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MobileHeader from "../components/MobileHeader";
import MobileDrawer from "../components/MobileDrawer";
import BottomNav from "../components/BottomNav";

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <MobileHeader onMenuClick={() => setDrawerOpen(true)} />

      {/* Mobile Drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block sticky top-0 h-screen">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-x-hidden sm:p-6 bg-white pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
