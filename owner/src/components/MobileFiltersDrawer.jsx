import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";

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

      <DrawerContent className="h-auto max-h-[85vh] rounded-t-2xl px-5 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold">Filters</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setTimeFilter("upcoming");
                setStatusFilter("all");
              }}
              className="text-sm text-primary font-medium"
            >
              Reset
            </button>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
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

        <Button className="w-full mt-6 h-12 text-base" onClick={onApply}>
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
      <p className="text-sm font-medium mb-3 text-gray-600">
        {title}
      </p>
      <div className="flex gap-3 flex-wrap">
        {children}
      </div>
    </div>
  );
}

function Chip({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2
        px-4 py-2 rounded-full text-sm border
        transition
        ${active
          ? "bg-primary text-white border-primary"
          : "bg-white text-gray-700 border-gray-200"}
      `}
    >
      {active && <Check className="w-4 h-4" />}
      {children}
    </button>
  );
}