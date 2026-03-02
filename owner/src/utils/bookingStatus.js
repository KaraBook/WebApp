
export const BOOKING_STATUS = {
    CONFIRMED: "confirmed",
    PENDING: "pending",
    CANCELLED: "cancelled",
    COMPLETED: "completed",
};


export function getBookingStatus(b) {
    if (!b) return BOOKING_STATUS.PENDING;

    if (b.cancelled === true || b.status === "cancelled") {
        return BOOKING_STATUS.CANCELLED;
    }

    const isPaid =
        b.paymentStatus === "paid" ||
        b.paymentStatus === "captured" ||
        b.paymentStatus === "success" ||
        b.status === "confirmed";

    if (isPaid) {
        if (b.checkOut) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const checkout = new Date(b.checkOut);
            checkout.setHours(23, 59, 59, 999);

            if (checkout <= today) {
                return BOOKING_STATUS.COMPLETED;
            }
        }

        return BOOKING_STATUS.CONFIRMED;
    }

    return BOOKING_STATUS.PENDING;
}


export const isConfirmed = (b) => getBookingStatus(b) === BOOKING_STATUS.CONFIRMED;
export const isPending = (b) => getBookingStatus(b) === BOOKING_STATUS.PENDING;
export const isCancelled = (b) => getBookingStatus(b) === BOOKING_STATUS.CANCELLED;
export const isCompleted = (b) => getBookingStatus(b) === BOOKING_STATUS.COMPLETED;


export function getStatusMeta(b) {
    const status = getBookingStatus(b);

    const map = {
        confirmed: {
            label: "Confirmed",
            chip: "border-emerald-300 bg-emerald-50 text-emerald-700",
            dot: "bg-emerald-500",
            soft: "bg-emerald-100 text-emerald-700",
            calendar: "bg-emerald-100 text-emerald-800",
            iconColor: "text-emerald-600",
        },

        pending: {
            label: "Pending Payment",
            chip: "border-amber-300 bg-amber-50 text-amber-700",
            dot: "bg-amber-500",
            soft: "bg-amber-100 text-amber-700",
            calendar: "bg-amber-100 text-amber-800",
            iconColor: "text-amber-600",
        },

        cancelled: {
            label: "Cancelled",
            chip: "border-rose-300 bg-rose-50 text-rose-700",
            dot: "bg-rose-500",
            soft: "bg-rose-100 text-rose-700",
            calendar: "bg-rose-100 text-rose-700",
            iconColor: "text-rose-600",
        },

        completed: {
            label: "Completed",
            chip: "border-blue-300 bg-blue-50 text-blue-700",
            dot: "bg-blue-500",
            soft: "bg-blue-100 text-blue-700",
            calendar: "bg-blue-100 text-blue-800",
            iconColor: "text-blue-600",
        },
    };

    return map[status];
}