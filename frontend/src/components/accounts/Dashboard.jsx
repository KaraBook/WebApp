import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    Heart,
    Building2,
    Wallet,
    MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { format } from "date-fns";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ======================================================
   DASHBOARD
====================================================== */

export default function Dashboard() {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [loading, setLoading] = useState(true);

    /* ---------------- FETCH REAL DATA ---------------- */
    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const [bookingRes, wishlistRes] = await Promise.all([
                Axios.get(SummaryApi.getUserBookings.url),
                Axios.get(SummaryApi.getWishlist.url),
            ]);

            if (bookingRes.data?.success) {
                setBookings(bookingRes.data.data || []);
            }

            if (wishlistRes.data?.success) {
                setWishlistCount(wishlistRes.data.data?.length || 0);
            }
        } catch (err) {
            console.error("Dashboard fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    /* ---------------- DERIVED STATS ---------------- */
    const totalBookings = bookings.length;

    const confirmed = bookings.filter(
        b =>
            ["paid", "confirmed", "completed"].includes(b.status) ||
            !!b.paymentId
    ).length;

    const pending = bookings.filter(
        b => ["initiated", "pending"].includes(b.status)
    ).length;

    const cancelled = bookings.filter(
        b => b.status === "cancelled"
    ).length;

    const totalSpent = bookings
        .filter(
            b =>
                ["paid", "confirmed", "completed"].includes(b.status) ||
                !!b.paymentId
        )
        .reduce((sum, b) => sum + Number(b.amount || 0), 0);

    const uniqueVisited = new Set(
        bookings.map(b => b.propertyId?._id || b.propertyId)
    ).size;

    const recentBookings = bookings.slice(0, 5);

    /* ---------------- ACTIONS ---------------- */
    const cancelBooking = async (id) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;

        try {
            await Axios.put(`/api/bookings/${id}/cancel`);
            fetchDashboardData();
        } catch (err) {
            alert("Failed to cancel booking");
        }
    };

    /* ---------------- UI ---------------- */
    return (
        <div className="px-4 min-h-screen">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold uppercase tracking-wide text-[#233b19]">
                    Dashboard Overview
                </h1>

                <Button variant="outline" size="sm" onClick={fetchDashboardData}>
                    Refresh
                </Button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
                <StatCard title="Total Bookings" value={totalBookings} icon={<Calendar />} dark />
                <StatCard title="Confirmed" value={confirmed} icon={<CheckCircle2 />} />
                <StatCard title="Pending" value={pending} icon={<Clock />} />
                <StatCard title="Cancelled" value={cancelled} icon={<XCircle />} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <StatCard title="Wishlist Items" value={wishlistCount} icon={<Heart />} />
                <StatCard title="Properties Visited" value={uniqueVisited} icon={<Building2 />} />
                <StatCard
                    title="Total Spent"
                    value={`₹${totalSpent.toLocaleString("en-IN")}`}
                    subtitle="Confirmed bookings"
                    icon={<Wallet />}
                    dark
                />
            </div>

            {/* RECENT BOOKINGS */}
            <div className="bg-white rounded-xl border shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/account/bookings")}
                    >
                        All Bookings
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr className="text-left text-gray-600">
                                <th className="px-6 py-3">Property</th>
                                <th>Check-in</th>
                                <th>Check-out</th>
                                <th>Nights</th>
                                <th>Guests</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th className="text-right px-6">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {!loading && recentBookings.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-gray-500">
                                        No bookings yet
                                    </td>
                                </tr>
                            )}

                            {recentBookings.map((b) => (
                                <tr
                                    key={b._id}
                                    className="border-b last:border-0 hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 font-medium">
                                        {b.propertyName || b.propertyId?.propertyName}
                                    </td>
                                    <td>{format(new Date(b.checkIn), "dd MMM yyyy")}</td>
                                    <td>{format(new Date(b.checkOut), "dd MMM yyyy")}</td>
                                    <td>{b.nights}</td>
                                    <td>{b.guests?.adults + (b.guests?.children || 0)}</td>
                                    <td><StatusChip status={b.status} /></td>
                                    <td className="text-gray-500">
                                        {format(new Date(b.createdAt), "dd MMM yyyy")}
                                    </td>

                                    {/* ACTION MENU */}
                                    <td className="px-6 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-2 rounded hover:bg-gray-100">
                                                    <MoreVertical className="w-4 h-4 text-gray-500" />
                                                </button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem
                                                    onClick={() => navigate(`/account/bookings/${b._id}`)}
                                                >
                                                    View Booking
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => navigate(`/account/invoice/${b._id}`)}
                                                >
                                                    View Invoice
                                                </DropdownMenuItem>

                                                {b.status === "confirmed" && (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            navigate(`/account/ratings?booking=${b._id}`)
                                                        }
                                                    >
                                                        Rate this Resort
                                                    </DropdownMenuItem>
                                                )}

                                                {b.ownerPhone && (
                                                    <DropdownMenuItem
                                                        onClick={() => window.open(`tel:${b.ownerPhone}`)}
                                                    >
                                                        Call Resort
                                                    </DropdownMenuItem>
                                                )}

                                                {b.status === "pending" && (
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => cancelBooking(b._id)}
                                                    >
                                                        Cancel Booking
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/* ======================================================
   COMPONENTS
====================================================== */

function StatCard({ title, value, subtitle, icon, dark }) {
    return (
        <div
            className={cn(
                "rounded-xl border p-5 flex justify-between items-start",
                dark ? "bg-primary text-white border-none" : "bg-white"
            )}
        >
            <div>
                <p className={cn("text-sm", dark ? "text-gray-300" : "text-gray-500")}>
                    {title}
                </p>
                <p className="text-3xl font-semibold mt-2">{value}</p>
                {subtitle && <p className="text-xs mt-1 text-green-400">{subtitle}</p>}
            </div>

            <div
                className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    dark ? "bg-white/10" : "bg-gray-100"
                )}
            >
                {icon}
            </div>
        </div>
    );
}

function StatusChip({ status }) {
    const normalized =
        status === "initiated" ? "pending" : status;

    const map = {
        pending: "bg-orange-100 text-orange-600 border-orange-300",
        confirmed: "bg-green-100 text-green-600 border-green-300",
        cancelled: "bg-red-100 text-red-600 border-red-300",
    };

    return (
        <span
            className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border capitalize",
                map[normalized]
            )}
        >
            {normalized}
        </span>
    );
}
