import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const formatDate = (d) => (d ? format(new Date(d), "dd MMM yyyy") : "—");
const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const Section = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="text-sm font-semibold text-gray-700 border-b pb-1 mb-2">{title}</h3>
    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">{children}</div>
  </div>
);

const Field = ({ label, value }) => (
  <div>
    <p className="text-gray-500">{label}</p>
    <p className="font-medium text-gray-800">{value || "—"}</p>
  </div>
);

const BookingDetailsDialog = ({ open, onClose, booking }) => {
  if (!booking) return null;

  const traveller = `${booking?.userId?.firstName || ""} ${booking?.userId?.lastName || ""}`.trim();
  const property = booking?.propertyId?.propertyName || "—";

  const statusColor =
    booking.paymentStatus === "paid"
      ? "bg-green-100 text-green-800"
      : booking.paymentStatus === "failed"
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800";

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl bg-white rounded-xl shadow-lg border">
        <AlertDialogHeader className="flex justify-between items-start">
          <div>
            <AlertDialogTitle className="text-lg font-semibold">
              Booking Details — <span className="text-gray-600">#{String(booking._id).slice(-6).toUpperCase()}</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Overview of traveller, property, stay, and payment information
            </AlertDialogDescription>
          </div>
          <Badge className={`${statusColor} capitalize`}>{booking.paymentStatus}</Badge>
        </AlertDialogHeader>

        <div className="mt-6 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          <Section title="Traveller Information">
            <Field label="Name" value={traveller} />
            <Field label="Email" value={booking?.userId?.email} />
            <Field label="Phone" value={booking?.userId?.mobile || booking?.contactNumber} />
            <Field label="Guests" value={booking?.guests} />
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
            <Field label="Amount" value={formatCurrency(booking.totalAmount)} />
            <Field label="Order ID" value={booking.orderId || "—"} />
            <Field label="Payment Status" value={booking.paymentStatus} />
          </Section>

          <Section title="System Info">
            <Field label="Booking Created" value={formatDate(booking.createdAt)} />
            <Field label="Booking ID" value={booking._id} />
          </Section>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg"
          >
            Close
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BookingDetailsDialog;
