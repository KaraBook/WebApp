export default function PaymentChip({ status }) {
  const normalize = (s) => {
    if (["paid", "confirmed"].includes(s)) return "confirmed";
    if (["pending", "initiated", "failed"].includes(s)) return "pending";
    if (s === "cancelled") return "cancelled";
    return "pending";
  };

  const s = normalize(status);

  const base =
    "px-3 py-[3px] rounded-full text-[11px] font-medium leading-none";

  const map = {
    confirmed: `${base} bg-emerald-50 text-emerald-700 border border-emerald-100`,
    pending: `${base} bg-amber-50 text-amber-700 border border-amber-100`,
    cancelled: `${base} bg-gray-100 text-gray-600 border border-gray-200`,
  };

  return <span className={map[s]}>{s}</span>;
}