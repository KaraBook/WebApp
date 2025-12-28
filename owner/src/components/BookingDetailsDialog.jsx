import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function BookingDetailsDialog({ open, onOpenChange, booking }) {
  if (!booking) return null;

  const {
    _id,
    createdAt,
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
    orderId,
    contactNumber,
  } = booking;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] rounded-xl p-0">
        {/* HEADER */}
        <DialogHeader className="px-6 pt-5 pb-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-lg font-semibold">
                Booking Details — #{_id?.slice(-6).toUpperCase()}
              </DialogTitle>

              <p className="text-sm text-gray-500 mt-1">
                Overview of traveller, property, stay, and payment information
              </p>

              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium capitalize
                  ${
                    paymentStatus === "paid"
                      ? "bg-black text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
              >
                {paymentStatus}
              </span>
            </div>

            <div className="flex flex-col items-end gap-2">
              <Button size="sm" className="bg-black hover:bg-black/90">
                Download Invoice
              </Button>

              <p className="text-xs text-gray-500">
                Created on: {formatDate(createdAt)}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* BODY */}
        <div className="px-6 py-2 space-y-6 text-sm">

          {/* TRAVELLER INFO */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Traveller Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-medium">
                  {userId?.firstName} {userId?.lastName}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{userId?.email}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">
                  {contactNumber || userId?.mobile}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Guests</p>
                <p className="font-medium">
                  {guests?.adults} Adults, {guests?.children} Children
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* PROPERTY INFO */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Property Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Property Name</p>
                <p className="font-medium">{propertyId?.propertyName}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Property ID</p>
                <p className="font-medium">{propertyId?._id}</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* STAY DETAILS */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Stay Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Check-in</p>
                <p className="font-medium">{formatDate(checkIn)}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Check-out</p>
                <p className="font-medium">{formatDate(checkOut)}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Total Nights</p>
                <p className="font-medium">{totalNights}</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* PAYMENT DETAILS */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Payment Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Room Amount</p>
                <p className="font-medium">
                  ₹{totalAmount?.toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Tax</p>
                <p className="font-medium">
                  ₹{taxAmount?.toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Grand Total</p>
                <p className="font-semibold">
                  ₹{grandTotal?.toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Payment Method</p>
                <p className="font-medium capitalize">{paymentMethod}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Order ID</p>
                <p className="font-medium break-all">{orderId}</p>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
