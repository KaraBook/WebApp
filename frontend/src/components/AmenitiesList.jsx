import { CheckCircle2 } from "lucide-react";

export default function AmenitiesList({ amenities = [] }) {
  if (!amenities.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
      {amenities.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2 hover:bg-[#efcc6154] transition"
        >
          <CheckCircle2 className="w-4 h-4 text-[#efcc61]" />
          {item}
        </div>
      ))}
    </div>
  );
}
