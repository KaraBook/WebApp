import { Calendar, Moon, Users, MoreVertical } from "lucide-react";
import { format } from "date-fns";

export default function MobileBookingCard({ booking, onView }) {
  const nights = Math.max(
    1,
    (new Date(booking.checkOut) - new Date(booking.checkIn)) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className="
        bg-white
        rounded-[14px]
        border
        shadow-sm
        p-4
        flex flex-col gap-3
      "
    >
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
            className="
              text-xs font-semibold
              px-2 py-[2px]
              rounded-full
              bg-green-100 text-green-700
            "
          >
            Paid
          </span>

          <button onClick={() => onView(booking)}>
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* PROPERTY */}
      <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
        {booking.property?.propertyName}
      </div>

      {/* META ROW */}
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
    </div>
  );
}
