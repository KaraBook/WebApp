import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function MobileFiltersDrawer({
  open,
  onClose,
  timeFilter,
  setTimeFilter,
  statusFilter,
  setStatusFilter,
  onApply,
}) {
  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerOverlay className="bg-black/40" />

      <DrawerContent className="h-[70vh] rounded-t-2xl px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Filters</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Time */}
        <Section title="Time Period">
          <Chip
            active={timeFilter === "upcoming"}
            onClick={() => setTimeFilter("upcoming")}
          >
            Upcoming
          </Chip>
          <Chip
            active={timeFilter === "past"}
            onClick={() => setTimeFilter("past")}
          >
            Past
          </Chip>
          <Chip
            active={timeFilter === "all"}
            onClick={() => setTimeFilter("all")}
          >
            All
          </Chip>
        </Section>

        {/* Status */}
        <Section title="Booking Status">
          <Chip
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          >
            All Statuses
          </Chip>
          <Chip
            active={statusFilter === "confirmed"}
            onClick={() => setStatusFilter("confirmed")}
          >
            Confirmed
          </Chip>
          <Chip
            active={statusFilter === "pending"}
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </Chip>
          <Chip
            active={statusFilter === "cancelled"}
            onClick={() => setStatusFilter("cancelled")}
          >
            Cancelled
          </Chip>
        </Section>

        <Button className="w-full mt-8" onClick={onApply}>
          Apply Filters
        </Button>
      </DrawerContent>
    </Drawer>
  );
}

/* ---------- UI helpers ---------- */

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <p className="text-sm font-medium mb-2">{title}</p>
      <div className="flex gap-2 flex-wrap">{children}</div>
    </div>
  );
}

function Chip({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm border
        ${active
          ? "bg-emerald-600 text-white border-emerald-600"
          : "bg-white text-gray-700"}
      `}
    >
      {children}
    </button>
  );
}