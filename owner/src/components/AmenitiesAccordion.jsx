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
    <div className="space-y-4">
      {options.map((group) => (
        <div
          key={group.key}
          className="border rounded-xl overflow-hidden"
        >
          {/* HEADER */}
          <button
            type="button"
            onClick={() =>
              setOpenKey(openKey === group.key ? null : group.key)
            }
            className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 text-sm font-medium"
          >
            {group.label}
            <ChevronDown
              className={`w-4 h-4 transition ${
                openKey === group.key ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* BODY */}
          {openKey === group.key && (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-2 gap-3">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = selected.includes(item.value);

                return (
                  <button
                    type="button"
                    key={item.value}
                    onClick={() => toggleAmenity(item.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm transition
                      ${
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
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
