import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import {
  Calendar,
  Users,
  Phone,
  IndianRupee,
  MapPin,
  CreditCard,
} from "lucide-react";

export default function BookingDetailsDialog({ open, onOpenChange, booking }) {
  if (!booking) return null;

  const {
    userId,
    propertyId,
    checkIn,
    checkOut,
    guests,
    totalNights,
    totalAmount,
    taxAmount,
    grandTotal,
    paymentStatus,
    paymentMethod,
    contactNumber,
  } = booking;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] rounded-2xl p-0">
        {/* HEADER */}
        <DialogHeader className="px-6 pt-5 pb-3">
          <DialogTitle className="text-lg font-semibold">
            Booking Details
          </DialogTitle>
        </DialogHeader>

        <Separator />

        {/* BODY */}
        <div className="px-6 py-4 space-y-4 text-sm">
          {/* Traveller */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-gray-500 text-xs mb-1">Traveller</p>
              <p className="font-medium text-gray-900">
                {userId?.firstName} {userId?.lastName}
              </p>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <Phone className="w-3.5 h-3.5" />
                {contactNumber || userId?.mobile}
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                ${
                  paymentStatus === "paid"
                    ? "bg-emerald-50 text-emerald-700"
                    : paymentStatus === "pending"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-gray-100 text-gray-600"
                }`}
            >
              {paymentStatus}
            </span>
          </div>

          <Separator />

          {/* Property */}
          <div>
            <p className="text-gray-500 text-xs mb-1">Property</p>
            <div className="flex items-center gap-2 text-gray-900 font-medium">
              <MapPin className="w-4 h-4 text-primary" />
              {propertyId?.propertyName}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-gray-500 text-xs mb-1">Check-in</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {new Date(checkIn).toLocaleDateString("en-GB")}
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-xs mb-1">Check-out</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {new Date(checkOut).toLocaleDateString("en-GB")}
              </div>
            </div>
          </div>

          {/* Guests */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Users className="w-4 h-4 mx-auto text-primary mb-1" />
              <p className="text-xs text-gray-500">Adults</p>
              <p className="font-semibold">{guests?.adults}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Children</p>
              <p className="font-semibold">{guests?.children}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Infants</p>
              <p className="font-semibold">{guests?.infants}</p>
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-gray-500 text-xs mb-1">Nights</p>
              <p className="font-medium">{totalNights}</p>
            </div>

            <div>
              <p className="text-gray-500 text-xs mb-1">Payment Method</p>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                {paymentMethod}
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-xs mb-1">Amount</p>
              <p className="font-semibold">
                ₹{totalAmount?.toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-xs mb-1">Tax</p>
              <p className="font-semibold">
                ₹{taxAmount?.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
            <span className="text-gray-600">Grand Total</span>
            <span className="text-lg font-bold text-gray-900">
              ₹{grandTotal?.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
