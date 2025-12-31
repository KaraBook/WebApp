import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function AmenitiesAccordion({
  options = [],
  selected = [],
  onChange,
}) {
  // allow multiple open sections
  const [openKeys, setOpenKeys] = useState(["basics"]);

  const toggleSection = (key) => {
    setOpenKeys((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key) // close
        : [...prev, key]                // open
    );
  };

  const toggleAmenity = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      {options.map((group) => {
        const isOpen = openKeys.includes(group.key);

        return (
          <div
            key={group.key}
            className="bg-white border border-gray-200 rounded-[12px] overflow-hidden w-[48%]"
          >
            {/* HEADER */}
            <button
              type="button"
              onClick={() => toggleSection(group.key)}
              className="w-full flex justify-between items-center px-5 py-4 bg-gray-50 text-sm font-semibold text-gray-800"
            >
              <span>{group.label}</span>

              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* BODY */}
            {isOpen && (
              <div className="px-5 pt-3 pb-5 grid grid-cols-2 gap-3">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = selected.includes(item.value);

                  return (
                    <button
                      key={item.value}
                      type="button"
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
        );
      })}
    </div>
  );
}
