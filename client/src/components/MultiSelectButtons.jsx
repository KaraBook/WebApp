import React from "react";
import { cn } from "@/lib/utils"; 

const MultiSelectButtons = ({ label, options, selected, onChange }) => {
  const toggleOption = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="w-full">
      <label className="block mb-2 text-sm font-medium">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleOption(option.value)}
              className={cn(
                "px-4 py-1 rounded-[8px] text-sm border transition mt-2",
                isSelected
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MultiSelectButtons;
