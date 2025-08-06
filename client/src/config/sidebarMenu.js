import { Home, LayoutDashboard, Calendar, Users } from "lucide-react";

const sidebarMenu = [
  {
    label: "Dashboard",
    icon: LayoutDashboard, 
    path: "/admin/dashboard",
  },
  {
    label: "Properties",
    icon: Home,
    path: "/admin/properties",
    children: [
      { label: "All Properties", path: "/admin/properties" },
      { label: "Blocked Properties", path: "/admin/properties/blocked" },
      { label: "Add Property", path: "/admin/add-property" },
    ],
  },
  {
    label: "Bookings",
    icon: Calendar,
    path: "/admin/bookings",
  },
  {
    label: "Users",
    icon: Users,
    path: "/admin/users",
  },
];

export default sidebarMenu;
