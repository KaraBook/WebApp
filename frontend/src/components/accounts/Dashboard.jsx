import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Clock, XCircle, Heart, Building2, Wallet, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import BookingDetailsDialog from "@/components/BookingDetailsDialog";
import MobileBookingCard from "../MobileBookingCard";


function resolveBookingStatus(b) {
    if (b.status === "cancelled") return "cancelled";

    if (
        b.paymentStatus === "paid" ||
        b.status === "paid" ||
        b.status === "confirmed" ||
        b.paymentId
    ) {
        return "confirmed";
    }
    return "pending";
}

function canViewInvoice(b) {
    return resolveBookingStatus(b) === "confirmed";
}

function getNights(checkIn, checkOut) {
    if (!checkIn || !checkOut) return "—";

    const diff =
        (new Date(checkOut) - new Date(checkIn)) /
        (1000 * 60 * 60 * 24);

    return Math.max(1, Math.round(diff));
}



export default function Dashboard() {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

    const goToBookings = (filter) => {
        navigate("/account/bookings", {
            state: { statusFilter: filter },
        });
    };


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

    const isPaidBooking = (b) =>
        b.paymentStatus === "paid" ||
        b.status === "confirmed" ||
        b.status === "paid" ||
        !!b.paymentId;

    const totalBookings = bookings.length;

    const confirmed = bookings.filter(
        b => resolveBookingStatus(b) === "confirmed"
    ).length;

    const pending = bookings.filter(
        b => resolveBookingStatus(b) === "pending"
    ).length;

    const cancelled = bookings.filter(
        b => resolveBookingStatus(b) === "cancelled"
    ).length;

    const totalSpent = bookings
        .filter(isPaidBooking)
        .reduce((sum, b) => {
            const value =
                b.grandTotal ??
                b.totalAmount ??
                b.amount ??
                0;
            return sum + Number(value);
        }, 0);

    const uniqueVisited = new Set(
        bookings.map(b => b.propertyId?._id || b.propertyId)
    ).size;


    const recentBookings = bookings.slice(0, 5);

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
        <div className="px-0 md:px-4 min-h-screen">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-5 mb-2 md:mb-6">
                <StatCard
                    title="Total Bookings"
                    value={totalBookings}
                    icon={<Calendar />}
                    dark
                    onClick={() => goToBookings("all")}
                />
                <StatCard
                    title="Confirmed"
                    value={confirmed}
                    icon={<CheckCircle2 />}
                    onClick={() => goToBookings("confirmed")}
                />
                <StatCard
                    title="Pending"
                    value={pending}
                    icon={<Clock />}
                    onClick={() => goToBookings("pending")}
                />
                <StatCard
                    title="Cancelled"
                    value={cancelled}
                    icon={<XCircle />}
                    onClick={() => goToBookings("cancelled")}
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-5 mb-8">
                <StatCard
                    title="Wishlist Items"
                    value={wishlistCount}
                    icon={<Heart />}
                    onClick={() => navigate("/account/wishlist")}
                />

                <StatCard
                    title="Properties Visited"
                    value={uniqueVisited}
                    icon={<Building2 />}
                />

                <div className="col-span-2 md:col-span-1">
                    <StatCard
                        title="Total Spent"
                        value={`₹${totalSpent.toLocaleString("en-IN")}`}
                        subtitle="Confirmed bookings"
                        icon={<Wallet />}
                        dark
                    />
                </div>
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

                <div className="md:hidden space-y-4 px-2 pt-2 pb-4">
                    {!loading && recentBookings.length === 0 && (
                        <p className="text-center text-gray-500 py-10">
                            No bookings yet
                        </p>
                    )}

                    {recentBookings.map((b) => (
                        <MobileBookingCard
                            key={b._id}
                            booking={b}
                            onView={(booking) => {
                                setSelectedBooking(booking);
                                setBookingDialogOpen(true);
                            }}
                            onRate={(booking) =>
                                navigate(`/account/ratings?booking=${booking._id}`)
                            }
                        />
                    ))}
                </div>

                <div className="hidden md:block overflow-x-auto">
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
                                <th className="px-0">Actions</th>
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
                                    <td>{getNights(b.checkIn, b.checkOut)}</td>
                                    <td>{b.guests?.adults + (b.guests?.children || 0)}</td>
                                    <td>
                                        <StatusChip status={resolveBookingStatus(b)} />
                                    </td>
                                    <td className="text-gray-500">
                                        {format(new Date(b.createdAt), "dd MMM yyyy")}
                                    </td>

                                    {/* ACTION MENU */}
                                    <td className="px-0 text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-2 rounded hover:bg-gray-100">
                                                    <MoreVertical className="w-4 h-4 text-gray-500" />
                                                </button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedBooking(b);
                                                        setBookingDialogOpen(true);
                                                    }}
                                                >
                                                    View Booking
                                                </DropdownMenuItem>

                                                {canViewInvoice(b) ? (
                                                    <DropdownMenuItem
                                                        onClick={() => navigate(`/account/invoice/${b._id}`)}
                                                    >
                                                        View Invoice
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        disabled
                                                        className="text-gray-400 cursor-not-allowed"
                                                    >
                                                        Invoice available after payment confirmation
                                                    </DropdownMenuItem>
                                                )}

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

            <BookingDetailsDialog
                open={bookingDialogOpen}
                onOpenChange={(open) => {
                    setBookingDialogOpen(open);
                    if (!open) setSelectedBooking(null);
                }}
                booking={selectedBooking}
            />

        </div>
    );
}



function StatCard({ title, value, subtitle, icon, dark, onClick }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "rounded-xl border p-3 md:p-5 flex justify-between items-start cursor-pointer transition",
                dark ? "bg-primary text-white border-none" : "bg-white hover:bg-gray-50"
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
                    "h-8 w-8 md:h-10 p-1 md:p-0 md:w-10 rounded-lg flex items-center justify-center",
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
        status === "initiated" ? "pending" :
            status === "paid" ? "confirmed" :
                status || "pending";

    const label =
        normalized === "confirmed"
            ? "Confirmed"
            : normalized === "pending"
                ? "Pending"
                : "Cancelled";

    const styles = {
        confirmed: "border-green-300 bg-green-50 text-green-700",
        pending: "border-orange-300 bg-orange-50 text-orange-700",
        cancelled: "border-red-300 bg-red-50 text-red-700",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center justify-center",
                "min-w-[88px] min-h-[26px]",
                "rounded-full border px-3 text-xs font-medium capitalize",
                styles[normalized] || styles.pending
            )}
        >
            {label}
        </span>
    );
}
