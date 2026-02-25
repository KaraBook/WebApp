import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { MoreVertical, Mail, Phone, Eye, Copy, ChevronDown, Users } from "lucide-react";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import OwnerUserDetailsDrawer from "@/components/OwnerUserDetailsDrawer";

export default function OwnerUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const ITEMS_PER_PAGE = 8;
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [openUserDialog, setOpenUserDialog] = useState(false);

    const openUser = (u) => {
        setSelectedUser(u);
        setOpenUserDialog(true);
    };


    const [search, setSearch] = useState("");
    const [searchParams] = useSearchParams();
    const [roleFilter, setRoleFilter] = useState("all");

    const getFullName = (u) =>
        `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Guest";

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

    useEffect(() => {
        const roleFromUrl = searchParams.get("role");

        if (roleFromUrl && ["traveller", "owner", "manager"].includes(roleFromUrl)) {
            setRoleFilter(roleFromUrl);
        }
    }, [searchParams]);

    /* ================= FILTER + SEARCH ================= */
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const q = search.toLowerCase();

            const matchesSearch =
                !q ||
                `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.mobile?.includes(q) ||
                u.city?.toLowerCase().includes(q) ||
                u.state?.toLowerCase().includes(q);

            const role = u.relationshipRole || "traveller";

            const matchesRole =
                roleFilter === "all" ||
                roleFilter === role;

            return matchesSearch && matchesRole;
        });
    }, [users, search, roleFilter]);


    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, roleFilter]);

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

    const getRoleLabel = (role) => ({
        traveller: "Traveller",
        manager: "Manager",
        owner: "Owner",
    }[role] || "Traveller");

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
                        <button
                            className="
        w-full sm:w-[225px]
        bg-white
        border border-gray-300
        rounded-lg
        px-4 py-2
        flex items-center justify-between
        text-sm font-medium text-gray-800
        hover:bg-gray-50
        focus:outline-none focus:ring-2 focus:ring-gray-200
      "
                        >
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span>
                                    {roleFilter === "all"
                                        ? "All Users"
                                        : roleFilter === "traveller"
                                            ? "Traveller"
                                            : roleFilter === "owner"
                                                ? "Resort Owner"
                                                : "Manager"}
                                </span>
                            </div>

                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="start"
                        className="
      w-80 md:w-44
      py-2
      bg-white
      border border-gray-200
      rounded-lg
      shadow-lg
      p-1
    "
                    >
                        <DropdownMenuItem onClick={() => setRoleFilter("all")}>
                            All Users
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => setRoleFilter("traveller")}>
                            Traveller
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => setRoleFilter("owner")}>
                            Resort Owner
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => setRoleFilter("manager")}>
                            Manager
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
                        {paginatedUsers.map((u, i) => (
                            <tr
                                key={u.userId}
                                onClick={() => openUser(u)}
                                className="border-t hover:bg-gray-50 transition cursor-pointer"
                            >
                                <td className="px-4 py-4">{i + 1}</td>

                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
                                            {getFullName(u).charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium">{getFullName(u)}</p>
                                            <p className="text-xs text-gray-500">
                                                {getRoleLabel(u.relationshipRole)}
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
                                <td
                                    className="px-4 py-4 text-right"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button>
                                                <MoreVertical className="w-4 h-4 text-gray-500" />
                                            </button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openUser(u)}>
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
                {paginatedUsers.map((u) => (
                    <div
                        key={u.userId}
                        onClick={() => openUser(u)}
                        className="
    bg-white border rounded-xl p-4
    flex justify-between items-start
    hover:bg-gray-50 transition
    cursor-pointer
  "
                    >
                        <div className="flex gap-3">
                            <div className="h-11 w-11 rounded-full bg-[#dbdbdb] text-black flex items-center justify-center font-semibold">
                                {getFullName(u).charAt(0)}
                            </div>

                            <div>
                                <p className="font-semibold">{getFullName(u)}</p>

                                <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                    <Mail size={14} /> {u.email || "—"}
                                </div>

                                <div className="flex items-center justify-start gap-3">
                                    <div className="text-sm text-gray-600 flex items-center gap-2">
                                        <Phone size={14} /> {u.mobile}
                                    </div>
                                    <p className="text-center text-[12px]">.</p>
                                    <p className="text-xs text-gray-500 font-600 mt-1">
                                        {u.totalBookings} bookings
                                    </p>
                                </div>
                            </div>
                        </div>

                        <DropdownMenu className="w-44">
                            <DropdownMenuTrigger asChild>
                                <button>
                                    <MoreVertical className="text-gray-500" />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openUser(u)} className="mb-2 mt-1">
                                    <Eye size={14} className="mr-2" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => copy(u.email)} className="mb-2">
                                    <Copy size={14} className="mr-2" /> Copy Email
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => copy(u.mobile)} className="mb-2">
                                    <Copy size={14} className="mr-2" /> Copy Mobile
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))}
            </div>


            {/* ================= PAGINATION ================= */}
            {totalPages > 1 && (
                <div className="flex md:justify-end justify-center mt-6">
                    <div className="flex items-center gap-2 text-sm">

                        {/* Previous */}
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className={`
          px-3 py-2 rounded-lg border
          ${currentPage === 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white hover:bg-gray-50"}
        `}
                        >
                            Previous
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p =>
                                p === 1 ||
                                p === totalPages ||
                                Math.abs(p - currentPage) <= 1
                            )
                            .map((page, idx, arr) => (
                                <span key={page} className="flex items-center gap-2">
                                    {idx > 0 && page - arr[idx - 1] > 1 && (
                                        <span className="px-1 text-gray-400">…</span>
                                    )}

                                    <button
                                        onClick={() => setCurrentPage(page)}
                                        className={`
                w-9 h-9 rounded-lg border
                ${page === currentPage
                                                ? "bg-black text-white border-black"
                                                : "bg-white hover:bg-gray-50"}
              `}
                                    >
                                        {page}
                                    </button>
                                </span>
                            ))}

                        {/* Next */}
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() =>
                                setCurrentPage(p => Math.min(totalPages, p + 1))
                            }
                            className={`
          px-3 py-2 rounded-lg border
          ${currentPage === totalPages
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white hover:bg-gray-50"}
        `}
                        >
                            Next
                        </button>

                    </div>
                </div>
            )}

            <OwnerUserDetailsDrawer
                open={openUserDialog}
                user={selectedUser}
                onClose={() => setOpenUserDialog(false)}
            />

        </div>
    );
}
