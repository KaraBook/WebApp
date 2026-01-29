import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerOverlay} from "@/components/ui/drawer";
import { Mail, Phone, Home, CalendarDays, Users, Moon, Hash, Clock} from "lucide-react";
import { format } from "date-fns";


const Badge = ({ children, tone = "green" }) => {
  const styles =
    tone === "green"
      ? "bg-green-100 text-green-700 border-green-200"
      : tone === "yellow"
      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
      : "bg-red-100 text-red-700 border-red-200";

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${styles}`}>
      {children}
    </span>
  );
};

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 text-[13px] py-2">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-900 font-medium text-right break-all">{value}</span>
  </div>
);

const InfoLine = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 text-[13px] text-gray-800">
    <Icon className="w-4 h-4 text-gray-400" />
    <span className="break-all">{text}</span>
  </div>
);


function normalizeStatus(b) {
  if (b?.cancelled) return "cancelled";
  if (
    b?.paymentStatus === "paid" ||
    b?.status === "paid" ||
    b?.status === "confirmed" ||
    b?.paymentId
  ) return "confirmed";
  return "pending";
}

function getStatusTone(status) {
  if (status === "confirmed") return "green";
  if (status === "pending") return "yellow";
  if (status === "cancelled") return "red";
  return "yellow";
}

function guestsText(guests) {
  if (!guests) return "—";
  if (typeof guests === "number") return `${guests} Guests`;
  return `${guests.adults || 0} Adults, ${guests.children || 0} Children`;
}

function money(n) {
  if (typeof n !== "number") return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}


export default function BookingDetailsDrawer({
  open,
  onClose,
  booking,
}) {
  if (!booking) return null;

  const isMobile = window.innerWidth < 768;

  const userName =
    booking?.user?.firstName || booking?.user?.lastName
      ? `${booking.user?.firstName || ""} ${booking.user?.lastName || ""}`.trim()
      : booking?.user?.name || "Traveller";

  const email = booking?.user?.email || booking?.contactEmail || "—";
  const phone = booking?.user?.mobile || booking?.contactPhone || "—";
  const propertyName = booking?.property?.propertyName || "—";

  const status = normalizeStatus(booking);
  const paymentMethod = booking?.paymentMethod || "—";
  const amount = booking?.amount ?? booking?.totalAmount ?? 0;
  const tax = booking?.taxAmount ?? 0;
  const grandTotal = booking?.grandTotal ?? amount + tax;

  const Content = (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="relative border-b pb-3">
        <button
          onClick={onClose}
          className="absolute right-0 top-0 text-black"
        >
          ✕
        </button>

        <p className="text-[16px] font-semibold">{userName}</p>
        <p className="text-sm text-gray-500">{email}</p>
      </div>

      {/* Property */}
      <div className="rounded-xl border p-3">
        <div className="flex gap-2">
          <Home className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Property</p>
            <p className="font-medium">{propertyName}</p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-3">
          <CalendarDays className="w-4 h-4 text-gray-400" />
          <p className="text-xs text-gray-500">Check-in</p>
          <p>{format(new Date(booking.checkIn), "dd MMM yyyy")}</p>
        </div>

        <div className="rounded-xl border p-3">
          <CalendarDays className="w-4 h-4 text-gray-400" />
          <p className="text-xs text-gray-500">Check-out</p>
          <p>{format(new Date(booking.checkOut), "dd MMM yyyy")}</p>
        </div>

        <div className="rounded-xl border p-3">
          <Moon className="w-4 h-4 text-gray-400" />
          <p className="text-xs text-gray-500">Nights</p>
          <p>{booking.totalNights}</p>
        </div>

        <div className="rounded-xl border p-3">
          <Users className="w-4 h-4 text-gray-400" />
          <p className="text-xs text-gray-500">Guests</p>
          <p>{guestsText(booking.guests)}</p>
        </div>
      </div>

      {/* Contact */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase">Contact</p>
        <div className="mt-2 space-y-1">
          <InfoLine icon={Mail} text={email} />
          <InfoLine icon={Phone} text={phone} />
        </div>
      </div>

      {/* Payment */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase">Payment</p>
        <div className="rounded-xl border mt-2">
          <div className="px-3 py-2 flex justify-between">
            <span>Status</span>
            <Badge tone={getStatusTone(status)}>{status}</Badge>
          </div>
          <div className="border-t px-3">
            <Row label="Method" value={paymentMethod} />
            <Row label="Amount" value={money(amount)} />
            <Row label="Tax" value={money(tax)} />
          </div>
          <div className="border-t px-3 py-2 flex justify-between">
            <span>Grand Total</span>
            <span className="font-semibold">{money(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
        <DrawerOverlay className="bg-black/40" />
        <DrawerContent className="rounded-t-2xl max-h-[75vh] overflow-y-auto">
          {Content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="
          fixed inset-y-0 right-0 h-full
          w-[420px] max-w-[90vw]
          p-0 rounded-none border-l
          bg-white shadow-xl
        "
      >
        {Content}
      </DialogContent>
    </Dialog>
  );
}