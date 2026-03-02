export const BOOKING_STATUS = {
  CONFIRMED: "confirmed",
  PENDING: "pending",
  CANCELLED: "cancelled",
};

export function getBookingStatus(booking) {
  if (!booking) return BOOKING_STATUS.PENDING;

  if (booking.cancelled === true || booking.status === "cancelled") {
    return BOOKING_STATUS.CANCELLED;
  }

  if (
    booking.paymentStatus === "paid" ||
    booking.paymentStatus === "captured" ||
    booking.status === "confirmed" ||
    booking.status === "paid" ||
    Boolean(booking.paymentId)
  ) {
    return BOOKING_STATUS.CONFIRMED;
  }

  return BOOKING_STATUS.PENDING;
}

export function isConfirmed(booking) {
  return getBookingStatus(booking) === BOOKING_STATUS.CONFIRMED;
}

export function isPending(booking) {
  return getBookingStatus(booking) === BOOKING_STATUS.PENDING;
}

export function isCancelled(booking) {
  return getBookingStatus(booking) === BOOKING_STATUS.CANCELLED;
}


export function getStatusMeta(booking) {
  const status = getBookingStatus(booking);

  const map = {
    confirmed: {
      label: "Confirmed",
      chip: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      dot: "bg-emerald-500",
      calendar: "bg-green-100 text-green-800",
      iconColor: "text-emerald-600",
    },
    pending: {
      label: "Pending Payment",
      chip: "bg-amber-50 text-amber-700 border border-amber-200",
      dot: "bg-amber-400",
      calendar: "bg-yellow-100 text-yellow-800",
      iconColor: "text-amber-600",
    },
    cancelled: {
      label: "Cancelled",
      chip: "bg-red-50 text-red-700 border border-red-200",
      dot: "bg-red-500",
      calendar: "bg-red-100 text-red-700",
      iconColor: "text-red-600",
    },
  };

  return map[status];
}