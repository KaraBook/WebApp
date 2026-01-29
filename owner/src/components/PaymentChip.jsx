export default function PaymentChip({ booking }) {
  const normalize = (b) => {
    if (b?.cancelled === true) return "cancelled";

    if (
      b?.paymentStatus === "paid" ||
      b?.paymentStatus === "captured" ||
      b?.status === "confirmed" ||
      b?.status === "paid" ||
      b?.paymentId
    ) {
      return "confirmed";
    }

    return "pending";
  };

  const s = normalize(booking);

  const base =
    "px-3 py-[2px] rounded-full text-[12px] font-semibold capitalize";

  const map = {
    confirmed: `${base} bg-emerald-100 text-emerald-700`,
    pending: `${base} bg-amber-100 text-amber-700`,
    cancelled: `${base} bg-red-100 text-red-700`,
  };

  return <span className={map[s]}>{s}</span>;
}