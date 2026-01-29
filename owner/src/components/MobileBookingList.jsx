import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CalendarCheck,
    Clock,
    Users,
    MoreVertical,
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";


function normalizeBookingStatus(booking) {
    if (booking.cancelled) return "cancelled";
    if (["paid", "confirmed"].includes(booking.paymentStatus)) return "confirmed";
    return "pending";
}

function PaymentChip({ booking }) {
    const s = normalizeBookingStatus(booking);
    const base = "px-3 py-1 rounded-full text-[11px] font-medium capitalize";
    const map = {
        confirmed: `${base} bg-emerald-50 text-emerald-700`,
        pending: `${base} bg-amber-50 text-amber-700`,
        cancelled: `${base} bg-red-50 text-red-600`,
    };
    return <span className={map[s]}>{s}</span>;
}



export default function MobileBookingsList({
    bookings = [],
    onOpenBooking,
    showHeader = true,
}) {
    const navigate = useNavigate();

    /* ---------- Pagination ---------- */
    const PER_PAGE = 4;
    const [page, setPage] = useState(1);

    const totalPages = Math.ceil(bookings.length / PER_PAGE);

    const paginated = useMemo(() => {
        const start = (page - 1) * PER_PAGE;
        return bookings.slice(start, start + PER_PAGE);
    }, [bookings, page]);

    return (
        <div className="md:hidden space-y-4">
            {/* Header (optional) */}
            {showHeader && (
                <h2 className="text-lg font-semibold text-gray-900 px-1">
                    All Bookings
                </h2>
            )}

            {/* Cards */}
            <div className="space-y-4">
                {paginated.map((b) => {
                    const name =
                        `${b.userId?.firstName || ""} ${b.userId?.lastName || ""}`.trim() ||
                        "Guest";

                    const email = b.userId?.email || "";
                    const mobile = b.userId?.mobile || "";

                    const nights = b.totalNights || 1;
                    const guests =
                        typeof b.guests === "number"
                            ? b.guests
                            : (b.guests?.adults || 0) + (b.guests?.children || 0);

                    return (
                        <div
                            key={b._id}
                            onClick={() => onOpenBooking?.(b)}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 md:p-4 cursor-pointer active:scale-[0.99] transition"
                        >

                            {/* Top Row */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-base font-semibold text-gray-900">
                                        {name}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">
                                        {email}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <PaymentChip booking={b} />

                                    {/* 3-dot menu */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-1 rounded-full hover:bg-gray-100">
                                                <MoreVertical className="w-5 h-5 text-gray-500" />
                                            </button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="end" className="w-[218px]">
                                            <DropdownMenuItem
                                                onSelect={() => onOpenBooking?.(b)}
                                                className="p-[14px] text-[16px]"
                                            >
                                                View Booking
                                            </DropdownMenuItem>

                                            {normalizeBookingStatus(b) === "confirmed" ? (
                                                <DropdownMenuItem
                                                    className="p-[14px] text-[16px]"
                                                    onSelect={() => navigate(`/invoice/${b._id}`)}
                                                >
                                                    View Invoice
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem
                                                    disabled
                                                    className="p-[14px] text-[16px] text-gray-400 italic"
                                                >
                                                    Invoice available after payment
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuItem
                                                className="p-[14px] text-[16px]"
                                                onSelect={() => navigator.clipboard.writeText(email)}
                                            >
                                                Copy Email
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                className="p-[14px] text-[16px]"
                                                onSelect={() => navigator.clipboard.writeText(mobile)}
                                            >
                                                Copy Mobile
                                            </DropdownMenuItem>

                                            {/* LAST LINE */}
                                            {b.cancelled ? (
                                                <DropdownMenuItem
                                                    disabled
                                                    className="p-[14px] text-[16px] text-gray-400 italic"
                                                >
                                                    Cancelled
                                                </DropdownMenuItem>
                                            ) : b.paymentStatus === "paid" ? (
                                                <DropdownMenuItem
                                                    className="p-[14px] text-[16px] text-red-600"
                                                    onSelect={() => onCancelBooking?.(b)}
                                                >
                                                    Cancel Booking
                                                </DropdownMenuItem>
                                            ) : null}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {mobile && (
                                <div className="mt-[5px] flex items-center gap-3 ">
                                    <a
                                        href={`tel:${mobile}`}
                                        className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition"
                                    >
                                        📞 {mobile}
                                    </a>
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        <span>{guests} guests</span>
                                    </div>
                                </div>
                            )}
                            {/* Meta */}
                            <div className="flex items-center gap-4 mt-[5px] text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <CalendarCheck className="w-4 h-4" />
                                    <span>
                                        {new Date(b.checkIn).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "2-digit",
                                        })}{" "}
                                        -{" "}
                                        {new Date(b.checkOut).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "2-digit",
                                        })}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{nights} nights</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white p-[10px] rounded-[12px] pt-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-4 py-2 text-sm rounded-lg bg-gray-100 disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <span className="text-sm text-gray-500">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-4 py-2 text-sm rounded-lg bg-gray-100 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
