import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Check, ChevronDown } from "lucide-react";

const MultiSelectDropdown = ({ label, options, selected, onChange }) => {
  const handleSelect = (value) => {
    const isSelected = selected.includes(value);
    if (isSelected) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const getLabel = (value) => {
    return options.find((option) => option.value === value)?.label || value;
  };

  return (
    <div className="w-full">
      <label className="block mb-2 text-sm font-medium">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between bg-transparent">
            {selected.length > 0
              ? selected.map(getLabel).join(", ")
              : "Select..."}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command className="w-full">
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <div className="flex items-center gap-2">
                    <Check
                      className={`h-4 w-4 ${
                        selected.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                    {option.label}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MultiSelectDropdown;
