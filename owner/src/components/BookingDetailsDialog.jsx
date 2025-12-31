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
      <DialogContent
  className="
    fixed
    inset-y-0
    right-0
    z-50
    h-full
    w-[420px]
    max-w-[95vw]
    p-0
    rounded-none
    border-l
    bg-white
    shadow-xl

    !translate-x-0
    !translate-y-0
    !left-auto
    !top-0

    data-[state=open]:animate-in
    data-[state=open]:slide-in-from-right
    data-[state=closed]:animate-out
    data-[state=closed]:slide-out-to-right
    duration-300
  "
>

        {/* HEADER */}
        <DialogHeader className="px-5 py-4 border-b">
  <div className="flex items-start justify-between">
    <div>
      <DialogTitle className="text-lg font-semibold">
        {userId?.firstName} {userId?.lastName}
      </DialogTitle>

      <p className="text-sm text-gray-500">
        {userId?.email}
      </p>
    </div>

    <span
      className={`px-3 py-1 rounded-full text-xs font-medium capitalize
        ${
          paymentStatus === "paid"
            ? "bg-emerald-100 text-emerald-700"
            : paymentStatus === "confirmed"
            ? "bg-blue-100 text-blue-700"
            : "bg-gray-100 text-gray-600"
        }`}
    >
      {paymentStatus}
    </span>
  </div>
</DialogHeader>


        <Separator />

        {/* BODY (SCROLLABLE) */}
        <div
          className="
            flex-1
            overflow-y-auto
            px-4 md:px-6
            py-0
            pb-[20px]
            text-sm
            space-y-4
          "
        >
          {/* TRAVELLER INFO */}
          <section>
            <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase">
              Traveller Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-medium">
                  {userId?.firstName} {userId?.lastName}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium break-all">{userId?.email}</p>
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
            <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase">
              Property Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-xs text-gray-500">Property Name</p>
                <p className="font-medium">{propertyId?.propertyName}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Property ID</p>
                <p className="font-medium break-all">{propertyId?._id}</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* STAY DETAILS */}
          <section>
            <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase">
              Stay Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
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
            <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase">
              Payment Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-x-4 gap-y-2">
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
