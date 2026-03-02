export function getBookingStatus(b) {
  if (!b) return "pending";

  if (b.cancelled === true) return "cancelled";

  if (b.paymentStatus === "paid") {
    if (b.checkOut && new Date(b.checkOut) < new Date()) {
      return "completed";
    }
    return "confirmed";
  }

  return "pending";
}


export function getStatusLabel(status) {
  switch (status) {
    case "confirmed":
      return "Confirmed";

    case "pending":
      return "Pending";

    case "cancelled":
      return "Cancelled";

    case "completed":
      return "Completed";

    default:
      return "Pending";
  }
}


export function getStatusColors(status) {
  switch (status) {
    case "confirmed":
      return {
        dot: "bg-emerald-500",
        chip: "border-emerald-300 bg-emerald-50 text-emerald-700",
        soft: "bg-emerald-100 text-emerald-700",
      };

    case "pending":
      return {
        dot: "bg-amber-500",
        chip: "border-amber-300 bg-amber-50 text-amber-700",
        soft: "bg-amber-100 text-amber-700",
      };

    case "cancelled":
      return {
        dot: "bg-rose-500",
        chip: "border-rose-300 bg-rose-50 text-rose-700",
        soft: "bg-rose-100 text-rose-700",
      };

    case "completed":
      return {
        dot: "bg-blue-500",
        chip: "border-blue-300 bg-blue-50 text-blue-700",
        soft: "bg-blue-100 text-blue-700",
      };

    default:
      return {
        dot: "bg-gray-400",
        chip: "border-gray-300 bg-gray-50 text-gray-700",
        soft: "bg-gray-100 text-gray-700",
      };
  }
}