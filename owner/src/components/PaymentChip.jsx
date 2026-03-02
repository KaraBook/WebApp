import { getStatusMeta } from "@/utils/bookingStatus";

export default function PaymentChip({ booking, small = false }) {
  const meta = getStatusMeta(booking);

  if (!meta) return null;

  return (
    <span
      className={`
        inline-flex items-center justify-center
        rounded-full border
        ${small ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]"}
        font-medium
        ${meta.chip}
      `}
    >
      {meta.label}
    </span>
  );
}