import {
    Users,
    CalendarCheck,
    Clock,
    Phone,
    MoreVertical,
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

function StatusBadge({ status }) {
    const map = {
        paid: "bg-emerald-50 text-emerald-700",
        initiated: "bg-amber-50 text-amber-700",
        pending: "bg-amber-50 text-amber-700",
        failed: "bg-red-50 text-red-700",
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-[11px] font-medium capitalize ${map[status] || "bg-gray-100 text-gray-600"
                }`}
        >
            {status}
        </span>
    );
}


/* ---------------- CARD ---------------- */
export default function MobileBookingCard({
    booking,
    onView,
    onInvoice,
}) {
    if (!booking) return null;

    const {
        userId = {},
        guests = {},
        checkIn,
        checkOut,
        totalNights,
        paymentStatus,
    } = booking;

    const mobileNumber = userId.mobile || "—";


    const totalGuests =
        (guests.adults || 0) +
        (guests.children || 0) +
        (guests.infants || 0);

    const formatDate = (d) =>
        new Date(d).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
        });

    return (
        <div className="bg-white border rounded-xl p-4 shadow-sm">
            {/* ---------- HEADER ---------- */}
            <div className="flex items-start justify-between">
                <h3 className="font-semibold text-sm leading-tight">
                    {userId?.firstName} {userId?.lastName}
                </h3>

                <div className="flex items-center gap-4">
                    <StatusBadge status={paymentStatus} />

                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 rounded-full hover:bg-neutral-100"
                            >
                                <MoreVertical className="w-4 h-4 text-neutral-600" />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48 flex flex-col gap-3 text-lg">
                            <DropdownMenuItem
                                onClick={() => {
                                    setTimeout(() => {
                                        onView?.(booking);
                                    }, 0);
                                }}
                            >
                                View Booking
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={onInvoice}>
                                View Invoice
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    navigator.clipboard.writeText(
                                        userId?.email || ""
                                    )
                                }
                            >
                                Copy Email
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() =>
                                    navigator.clipboard.writeText(mobileNumber || "")
                                }
                            >
                                Copy Mobile
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* ---------- PHONE + GUESTS ---------- */}
            <div className="flex items-center gap-4 mt-3 text-sm text-neutral-700">
                <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {mobileNumber}
                </div>

                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {totalGuests} guests
                </div>
            </div>

            {/* ---------- DATES ---------- */}
            <div className="flex justify-start gap-6">
            <div className="flex items-center gap-2 mt-3 text-sm text-neutral-700">
                <CalendarCheck className="w-4 h-4" />
                {formatDate(checkIn)} - {formatDate(checkOut)}
            </div>

            {/* ---------- NIGHTS ---------- */}
            <div className="flex items-center gap-2 mt-2 text-sm text-neutral-700">
                <Clock className="w-4 h-4" />
                {totalNights} nights
            </div>
            </div>
        </div>
    );
}
