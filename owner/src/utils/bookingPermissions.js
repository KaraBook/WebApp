import { getBookingStatus, BOOKING_STATUS } from "./bookingStatus";


export function getOwnerBookingPermissions(booking) {
  const status = getBookingStatus(booking);

  return {
    canViewBooking: true,

    canViewInvoice: status === BOOKING_STATUS.CONFIRMED,

    canCancel: status === BOOKING_STATUS.CONFIRMED,

    canSendWelcomeMessage:
      status === BOOKING_STATUS.CONFIRMED,

    canSendReminder:
      status === BOOKING_STATUS.PENDING,

    canSendCancelledMessage:
      status === BOOKING_STATUS.CANCELLED,
  };
}