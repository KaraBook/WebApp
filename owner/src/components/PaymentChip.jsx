export default function PaymentChip({ status }) {
  const normalize = (s) => {
    if (["paid", "confirmed"].includes(s)) return "confirmed";
    if (["pending", "initiated", "failed"].includes(s)) return "pending";
    if (s === "cancelled") return "cancelled";
    return "pending";
  };

  const s = normalize(status);

  const base =
    "px-3 py-[2px] rounded-full text-[12px] font-semibold";

  const map = {
    confirmed: `${base} bg-emerald-100 text-emerald-700`,
    pending: `${base} bg-amber-100 text-amber-700`,
    cancelled: `${base} bg-gray-200 text-gray-600`,
  };

  return <span className={map[s]}>{s}</span>;
}