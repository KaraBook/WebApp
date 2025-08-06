import React, { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Convert 24-hour to 12-hour format with AM/PM
const formatTo12Hour = (hour, minute) => {
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  const paddedMinute = String(minute).padStart(2, "0");
  return `${hour12}:${paddedMinute} ${period}`;
};

const times = Array.from({ length: 24 }, (_, hour) =>
  [0, 30].map((minute) => formatTo12Hour(hour, minute))
).flat();

const CustomTimePicker = ({ label, value, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-[48%]">
      <Label className="mb-1 block font-medium">
        {label} <span className="text-red-500">*</span>
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between bg-transparent mt-2">
            {value || "Select time"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-0">
          <ScrollArea className="h-60">
            <div className="flex flex-col">
              {times.map((t) => (
                <button
                  key={t}
                  className={cn(
                    "w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground",
                    t === value && "bg-muted"
                  )}
                  onClick={() => {
                    onChange(t);
                    setOpen(false);
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CustomTimePicker;
