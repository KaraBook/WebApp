import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Link } from "react-router-dom";

const formatDate = (d) => (d ? format(new Date(d), "dd MMM yyyy") : "—");
const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const Section = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="text-sm font-semibold text-gray-700 border-b pb-1 mb-2">
      {title}
    </h3>
    <div className="flex flex-wrap gap-x-6 md:gap-x-8 gap-y-2 text-sm">
      {children}
    </div>
  </div>
);

const Field = ({ label, value }) => (
  <div className="min-w-auto md:min-w-[160px]">
    <p className="text-gray-500 text-xs">{label}</p>
    <p className="font-medium text-gray-800 break-words">
      {value || "—"}
    </p>
  </div>
);

const BookingDetailsDialog = ({ open, onClose, booking }) => {
  if (!booking) return null;
  const invoiceRef = useRef(null);

  const traveller = `${booking?.userId?.firstName || ""} ${booking?.userId?.lastName || ""}`.trim();
  const property = booking?.propertyId?.propertyName || "—";

  const statusColor =
    booking.paymentStatus === "paid"
      ? "bg-[#dcfce7] text-[#248a4a]"
      : booking.paymentStatus === "failed"
        ? "bg-red-100 text-red-800"
        : "bg-yellow-100 text-yellow-800";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="md:max-w-2xl max-w-[90%] bg-white rounded-xl shadow-lg border p-0">
        {/* HEADER */}
        <DialogHeader className="px-6 pt-5 pb-3 border-b relative">

          <DialogTitle className="text-lg font-semibold text-left">
            Booking Details —{" "}
            <span className="text-gray-600">
              #{String(booking._id).slice(-6).toUpperCase()}
            </span>
          </DialogTitle>

          <DialogDescription className="text-gray-500 mt-1 text-left flex flex-wrap w-full gap-1 justify-between items-center">
            Overview of traveller, property, stay, and payment information
            <Link to={`/invoice/${booking._id}`}>
            <Button
            className="text-[12px] px-4 h-7 pb-[10px]">
              Download Invoice
            </Button>
            </Link>
          </DialogDescription>

          <div className="flex justify-between items-center mt-3">
            <Badge className={`${statusColor} capitalize`}>
              {booking.paymentStatus}
            </Badge>
            <span className="text-xs text-gray-500">
              Created on: {formatDate(booking.createdAt)}
            </span>
          </div>
        </DialogHeader>

        {/* CONTENT */}
        <div className="px-6 py-4 md:max-h-[75vh] max-h-[60vh]  overflow-y-auto">
          <Section title="Traveller Information">
            <Field label="Name" value={traveller} />
            <Field label="Email" value={booking?.userId?.email} />
            <Field label="Phone" value={booking?.userId?.mobile || booking?.contactNumber} />
            <Field
              label="Guests"
              value={
                booking?.guests
                  ? `${booking.guests.adults} Adults, ${booking.guests.children} Children${booking.guests.infants ? `, ${booking.guests.infants} Infants` : ""
                  }`
                  : "—"
              }
            />
          </Section>

          <Section title="Property Information">
            <Field label="Property Name" value={property} />
            <Field label="Property ID" value={booking?.propertyId?._id} />
          </Section>

          <Section title="Stay Details">
            <Field label="Check-in" value={formatDate(booking.checkIn)} />
            <Field label="Check-out" value={formatDate(booking.checkOut)} />
            <Field label="Total Nights" value={booking?.totalNights || "—"} />
          </Section>

          <Section title="Payment Details">
            <Field label="Room Amount" value={formatCurrency(booking.totalAmount)} />
            <Field label="Tax" value={formatCurrency(booking.taxAmount)} />
            <Field label="Grand Total" value={formatCurrency(booking.grandTotal)} />
            <Field label="Payment Method" value={booking.paymentMethod} />
            <Field label="Order ID" value={booking.orderId || "—"} />
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsDialog;
