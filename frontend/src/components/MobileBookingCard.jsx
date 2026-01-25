import {
  Calendar,
  Moon,
  Users,
  MoreVertical,
  Eye,
  FileDown,
  Star,
  Phone,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import RateBookingDialog from "./RateBookingDialog";


function resolveBookingStatus(b) {
  if (b?.cancelled === true) return "cancelled";

  if (
    b?.paymentStatus === "paid" ||
    b?.status === "paid" ||
    b?.status === "confirmed" ||
    b?.paymentId
  ) {
    return "confirmed";
  }

  return "pending";
}

function getStatusLabel(status) {
  if (status === "confirmed") return "Confirmed";
  if (status === "pending") return "Pending";
  if (status === "cancelled") return "Cancelled";
  return status;
}



export default function MobileBookingCard({
  booking,
  onView,
  onRate,
}) {
  const nights = Math.max(
    1,
    (new Date(booking.checkOut) - new Date(booking.checkIn)) /
    (1000 * 60 * 60 * 24)
  );
  const bookingStatus = resolveBookingStatus(booking);

  return (
    <div onClick={() => onView(booking)} className="bg-white rounded-[14px] border shadow-sm p-4 flex flex-col gap-3">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-[15px] text-gray-900">
            {booking.user?.firstName} {booking.user?.lastName}
          </p>
          <p className="text-xs text-gray-500">
            {booking.user?.email}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`
    text-xs font-semibold px-2 py-[2px] rounded-full capitalize
    ${bookingStatus === "confirmed"
                ? "bg-green-100 text-green-700"
                : bookingStatus === "pending"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-red-100 text-red-700"
              }
  `}
          >
            {getStatusLabel(bookingStatus)}
          </span>

          {/* DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button onClick={(e) => e.stopPropagation()} className="p-1 rounded-md hover:bg-gray-100">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="
                w-48
                rounded-[12px]
                border
                shadow-lg
                bg-white
                p-2
              "
            >
              <DropdownMenuItem
                className="py-3 gap-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(booking);
                }}
              >
                <Eye className="w-4 h-4" />
                View Booking
              </DropdownMenuItem>

              {(
                booking?.paymentStatus === "paid" ||
                booking?.status === "paid" ||
                !!booking?.paymentId
              ) ? (
                <DropdownMenuItem asChild className="py-3 gap-3">
                  <Link to={`/account/invoice/${booking._id}`}>
                    <FileDown className="w-4 h-4" />
                    View Invoice
                  </Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  disabled
                  className="py-3 gap-3 text-gray-400 cursor-not-allowed"
                >
                  <FileDown className="w-4 h-4" />
                  Invoice available after payment confirmation
                </DropdownMenuItem>
              )}
              {/* RATE / REVIEW */}
              {booking.hasReview ? (
                <DropdownMenuItem
                  disabled
                  className="py-3 gap-3 text-green-600 cursor-not-allowed"
                >
                  <Star className="w-4 h-4 fill-green-600 text-green-600" />
                  Review submitted
                </DropdownMenuItem>
              ) : (
                (booking?.paymentStatus === "paid" ||
                  booking?.status === "paid" ||
                  !!booking?.paymentId) && (
                  <DropdownMenuItem
                    className="py-3 gap-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRate(booking);
                    }}
                  >
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    Rate this Resort
                  </DropdownMenuItem>
                )
              )}

              <DropdownMenuItem
                className="py-3 gap-3"
                onClick={(e) => {
                  e.stopPropagation(e);
                  window.open(`tel:${booking.property?.contactNumber}`)
                }}
              >
                <Phone className="w-4 h-4" />
                Call Resort
              </DropdownMenuItem>

              {bookingStatus === "pending" ? (
                <DropdownMenuItem
                  className="py-3 gap-3 text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    // open cancel modal here if you have one
                  }}
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Booking
                </DropdownMenuItem>
              ) : bookingStatus === "cancelled" ? (
                <DropdownMenuItem
                  disabled
                  className="py-3 gap-3 text-gray-400 cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4" />
                  Booking Cancelled
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* PROPERTY */}
      <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
        {booking.property?.propertyName}
      </div>

      {/* META */}
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {format(new Date(booking.checkIn), "dd MMM")} –{" "}
          {format(new Date(booking.checkOut), "dd MMM")}
        </div>

        <div className="flex items-center gap-1">
          <Moon className="w-4 h-4" />
          {nights} nights
        </div>

        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {typeof booking.guests === "number"
            ? booking.guests
            : booking.guests.adults + booking.guests.children}{" "}
          guests
        </div>
      </div>

      <RateBookingDialog
        open={!!booking.isRating}
        booking={booking.isRating}
        onClose={() => onRate(null)}
      />
    </div>
  );
}
