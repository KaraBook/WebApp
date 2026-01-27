export default function PaymentChip({ status }) {
  const normalize = (s) => {
    if (["paid", "confirmed"].includes(s)) return "confirmed";
    if (["pending", "initiated", "failed"].includes(s)) return "pending";
    if (s === "cancelled") return "cancelled";
    return "pending";
  };

  const s = normalize(status);
  const base = "px-3 py-1 rounded-full text-[11px] font-medium capitalize";

  const map = {
    confirmed: `${base} bg-emerald-50 text-emerald-700`,
    pending: `${base} bg-amber-50 text-amber-700`,
    cancelled: `${base} bg-gray-100 text-gray-600`,
  };

  return <span className={map[s]}>{s}</span>;
}