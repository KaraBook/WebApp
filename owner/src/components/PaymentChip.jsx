import { getBookingStatus } from "@/utils/bookingStatus";

export default function PaymentChip({ booking }) {
  const status = getBookingStatus(booking);

  const base = "px-3 py-1 rounded-full text-[11px] font-medium capitalize";

  const map = {
    confirmed: `${base} bg-emerald-50 text-emerald-700`,
    pending: `${base} bg-amber-50 text-amber-700`,
    cancelled: `${base} bg-red-50 text-red-600`,
    completed: `${base} bg-blue-50 text-blue-700`,
  };

  return <span className={map[status]}>{status}</span>;
}