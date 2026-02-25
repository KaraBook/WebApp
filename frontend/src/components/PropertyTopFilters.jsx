import { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";

export default function PropertyTopFilters({ total, value, onChange }) {
  return (
    <div className="w-full hidden md:block bg-white rounded-2xl border border-[#E5EAF1] px-4 md:px-6 py-4 mb-6">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">

          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters:</span>
          </div>

          <FilterDropdown
            full
            label={value.type}
            options={["All Types", "Villa", "Tent", "Cottage", "Hotel", "Apartment"]}
            onSelect={(v) => onChange({ ...value, type: v })}
          />

          <FilterDropdown
            full
            label={value.price}
            options={[
              "All Prices",
              "Under ₹5,000",
              "₹5,000 - ₹10,000",
              "₹10,000+",
            ]}
            onSelect={(v) => onChange({ ...value, price: v })}
          />
        </div>

        <div className="md:ml-auto">
          <FilterDropdown
            full
            align="right"
            icon
            label={value.sort}
            options={[
              "Recently Added",
              "Price: Low to High",
              "Price: High to Low",
              "Highest Rated",
            ]}
            onSelect={(v) => onChange({ ...value, sort: v })}
          />
        </div>

      </div>
    </div>
  );
}



function FilterDropdown({
  label,
  options,
  onSelect,
  align = "left",
  icon = false,
  full = false,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={`relative ${full ? "w-full md:w-auto" : ""}`}
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`
          flex items-center justify-between gap-2
          px-4 py-[10px]
          rounded-lg
          border border-[#E5EAF1]
          bg-white
          text-sm text-[#0F172A]
          hover:bg-[#F8FAFC]
          transition
          ${full ? "w-full md:w-auto" : ""}
        `}
      >
        <div className="flex items-center gap-2">
          {icon && <SlidersHorizontal className="w-4 h-4 text-[#64748B]" />}
          <span>{label}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-[#64748B]" />
      </button>

      {open && (
        <div
          className={`
            absolute z-50 mt-2 w-full md:min-w-[220px]
            bg-white
            border border-[#E5EAF1]
            rounded-xl
            shadow-[0_8px_24px_rgba(15,23,42,0.08)]
            ${align === "right" ? "right-0" : "left-0"}
          `}
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
              className="
                w-full flex items-center justify-between
                px-4 py-2.5
                text-sm text-[#0F172A]
                hover:bg-[#F1F5F9]
              "
            >
              <span>{opt}</span>
              {opt === label && (
                <Check className="w-4 h-4 text-[#16A34A]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
