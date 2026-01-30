import { Home, LayoutDashboard, Calendar, Users } from "lucide-react";

const sidebarMenu = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: ["admin"],            
  },
  {
    label: "Properties",
    icon: Home,
    path: "/properties",
    roles: ["admin", "property_admin"], 
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
    roles: ["admin"],             
  },
  {
    label: "Users",
    icon: Users,
    path: "/users",
    roles: ["admin"],             
  },
];

export default sidebarMenu;
