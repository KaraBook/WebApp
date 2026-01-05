import {
  Calendar,
  Moon,
  Users,
  MoreVertical,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

/* ---------- STATUS PILL (EXACT STYLE) ---------- */
function StatusPill({ status }) {
  const normalizedStatus =
    status === "initiated" ? "pending" : status;

  const map = {
    confirmed: "border-green-300 text-green-600 bg-green-50",
    paid: "border-green-300 text-green-600 bg-green-50",
    pending: "border-orange-300 text-orange-600 bg-orange-50",
    failed: "border-red-300 text-red-600 bg-red-50",
  };

  return (
    <span
      className={`
        px-3 py-[2px]
        rounded-full
        text-[11px]
        font-medium
        capitalize
        border
        ${map[normalizedStatus] || "border-neutral-300 text-neutral-600"}
      `}
    >
      {normalizedStatus}
    </span>
  );
}


/* ---------- MOBILE CARD ---------- */
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
    totalNights,
    paymentStatus,
    propertyId,
  } = booking;

  const totalGuests =
    (guests.adults || 0) + (guests.children || 0);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });

  return (
    <div className="md:hidden bg-white border rounded-xl p-4 shadow-sm space-y-3">
      {/* ---------- HEADER ---------- */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-sm text-neutral-900">
            {userId?.firstName} {userId?.lastName}
          </h3>
          <p className="text-xs text-neutral-500">
            {userId?.email}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusPill status={paymentStatus} />

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-full hover:bg-neutral-100">
                <MoreVertical className="w-4 h-4 text-neutral-600" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48 py-2 ">
              <DropdownMenuItem onClick={() => onView?.(booking)} className="mb-1">
                View Booking
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onInvoice} className="mb-1"> 
                View Invoice
              </DropdownMenuItem>
              <DropdownMenuItem className="mb-1"
                onClick={() =>
                  navigator.clipboard.writeText(userId?.email || "")
                }
              >
                Copy Email
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(userId?.mobile || "")
                }
              >
                Copy Mobile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ---------- PROPERTY PILL ---------- */}
      <div className="bg-neutral-50 rounded-lg px-3 py-2 text-sm font-medium text-neutral-800">
        {propertyId?.propertyName}
      </div>

      {/* ---------- META ROW ---------- */}
      <div className="flex items-center gap-5 text-sm text-neutral-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {formatDate(checkIn)} - {formatDate(booking.checkOut)}
        </div>

        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4" />
          {totalNights} nights
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          {totalGuests} guests
        </div>
      </div>
    </div>
  );
}
