import { Home, LayoutDashboard, Calendar, Users } from "lucide-react";

const sidebarMenu = [
  {
    label: "Dashboard",
    icon: LayoutDashboard, 
    path: "/dashboard",
  },
  {
    label: "Properties",
    icon: Home,
    path: "/properties",
    children: [
      { label: "All Properties", path: "/properties" },
      { label: "Blocked Properties", path: "/properties/blocked" },
      { label: "Draft Properties", path: "/properties/drafts" },
      { label: "Add Property", path: "/add-property" },
    ],
  },
  {
    label: "Bookings",
    icon: Calendar,
    path: "/bookings",
  },
  {
    label: "Users",
    icon: Users,
    path: "/users",
  },
];

export default sidebarMenu;
