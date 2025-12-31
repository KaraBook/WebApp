import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function AmenitiesAccordion({
  options,
  selected,
  onChange,
}) {
  const [openKey, setOpenKey] = useState("basics");

  const toggleAmenity = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {options.map((group) => (
        <div
          key={group.key}
          className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
        >
          {/* HEADER */}
          <button
            type="button"
            onClick={() =>
              setOpenKey(openKey === group.key ? null : group.key)
            }
            className="w-full flex justify-between items-center px-5 py-4 bg-gray-50 text-sm font-semibold text-gray-800"
          >
            {group.label}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                openKey === group.key ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* BODY */}
          {openKey === group.key && (
            <div className="px-5 pt-3 pb-5 grid grid-cols-2 gap-3">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = selected.includes(item.value);

                return (
                  <button
                    type="button"
                    key={item.value}
                    onClick={() => toggleAmenity(item.value)}
                    className={`
                      flex items-center gap-3
                      px-3 py-2.5
                      rounded-xl border text-sm
                      transition-all
                      ${
                        active
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-left">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
