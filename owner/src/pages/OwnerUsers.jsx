import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { MoreVertical, Mail, Phone, Eye, Copy } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function OwnerUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // all | traveller | owner

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(SummaryApi.getOwnerBookedUsers.url);
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ================= FILTER + SEARCH ================= */
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();

      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.mobile?.includes(q) ||
        u.city?.toLowerCase().includes(q) ||
        u.state?.toLowerCase().includes(q);

      const role = u.role || "traveller";

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "traveller" && role === "traveller") ||
        (roleFilter === "owner" && role !== "traveller");

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const copy = async (text) => {
    await navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Users</h1>
        <button
          onClick={fetchUsers}
          className="border rounded-lg px-4 py-2 text-sm hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {/* ================= SEARCH + FILTER ================= */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search: name / email / mobile / city / state"
          className="border rounded-lg px-4 py-2 w-full"
        />

        {/* SHADCN FILTER DROPDOWN */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="border rounded-lg px-4 py-2 w-full sm:w-44 flex justify-between items-center text-sm">
              {roleFilter === "all"
                ? "All Users"
                : roleFilter === "traveller"
                ? "Traveller"
                : "Resort Owner"}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-80 py-2 md:w-44">
            <DropdownMenuItem onClick={() => setRoleFilter("all")} className="mb-1">
              All Users
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRoleFilter("traveller")} className="mb-1">
              Traveller
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRoleFilter("owner")} className="mb-1">
              Resort Owner
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Sr. No</th>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Mobile</th>
              <th className="text-left px-4 py-3">Bookings</th>
              <th className="text-left px-4 py-3">Last Booking</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u, i) => (
              <tr key={u.userId} className="border-t">
                <td className="px-4 py-4 text-center">{i + 1}</td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
                      {u.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-gray-500">
                        {u.role || "Traveller"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">{u.email || "—"}</td>
                <td className="px-4 py-4">{u.mobile}</td>
                <td className="px-4 py-4">{u.totalBookings}</td>
                <td className="px-4 py-4">
                  {u.lastBookingDate
                    ? format(new Date(u.lastBookingDate), "dd MMM yy")
                    : "—"}
                </td>

                {/* ACTION MENU */}
                <td className="px-4 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button>
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye size={14} className="mr-2" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copy(u.email)}>
                        <Copy size={14} className="mr-2" /> Copy Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copy(u.mobile)}>
                        <Copy size={14} className="mr-2" /> Copy Mobile
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden space-y-3">
        {filteredUsers.map((u) => (
          <div
            key={u.userId}
            className="bg-white border rounded-xl p-4 flex justify-between items-start"
          >
            <div className="flex gap-3">
              <div className="h-11 w-11 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                {u.name?.charAt(0)}
              </div>

              <div>
                <p className="font-semibold">{u.name}</p>

                <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  <Mail size={14} /> {u.email || "—"}
                </div>

                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Phone size={14} /> {u.mobile}
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  {u.totalBookings} bookings
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button>
                  <MoreVertical className="text-gray-500" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye size={14} className="mr-2" /> View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => copy(u.email)}>
                  <Copy size={14} className="mr-2" /> Copy Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => copy(u.mobile)}>
                  <Copy size={14} className="mr-2" /> Copy Mobile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}
