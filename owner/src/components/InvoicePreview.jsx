import React, { forwardRef } from "react";
import { format } from "date-fns";

const InvoicePreview = forwardRef(({ invoice }, ref) => {
  if (!invoice) return null;

  const user = invoice.user || {};
  const breakdown = Array.isArray(invoice.priceBreakdown)
    ? invoice.priceBreakdown
    : [];

  const rawSubtotal = Number(invoice.totalAmount || 0);
  const tax = Math.round(rawSubtotal * 0.1);
  const grandTotal = rawSubtotal + tax;

  return (
    <div
      ref={ref}
      className="
        bg-white border rounded-xl
        p-4 sm:p-6 md:p-8
        w-full max-w-3xl mx-auto
        text-[13px] sm:text-sm
        text-gray-800
      "
      style={{ fontFamily: "sans-serif" }}
    >
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">
            {invoice.propertyName || "Villa Gulposh"}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            {invoice.propertyCity || ""} {invoice.propertyState || ""}
          </p>
        </div>

        <div className="sm:text-right">
          <h2 className="text-xl sm:text-2xl font-bold">Invoice</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Invoice No: {invoice.invoiceNumber || "-"}
          </p>
        </div>
      </div>

      {/* ================= BOOKING INFO ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border rounded-lg p-4 mb-5">
        <div className="space-y-1">
          <p>
            <strong>Check-in:</strong>{" "}
            {invoice.checkIn
              ? format(new Date(invoice.checkIn), "dd MMM yyyy")
              : "-"}
          </p>
          <p>
            <strong>Check-out:</strong>{" "}
            {invoice.checkOut
              ? format(new Date(invoice.checkOut), "dd MMM yyyy")
              : "-"}
          </p>
          <p><strong>Nights:</strong> {invoice.nights ?? "-"}</p>
          <p>
            <strong>Guests:</strong>{" "}
            {typeof invoice.guests === "number"
              ? invoice.guests
              : (invoice.guests?.adults || 0) +
                (invoice.guests?.children || 0)}
          </p>

          {typeof invoice.guests === "object" && (
            <div className="mt-2 text-xs text-gray-600 space-y-0.5">
              <p>• Adults: <strong>{invoice.guests.adults}</strong></p>
              <p>• Children: <strong>{invoice.guests.children}</strong></p>
              <p>• Infants: <strong>{invoice.guests.infants}</strong></p>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p>
            <strong>Booking Date:</strong>{" "}
            {invoice.bookingDate
              ? format(new Date(invoice.bookingDate), "dd MMM yyyy")
              : "-"}
          </p>
          <p><strong>Payment Status:</strong> {invoice.paymentStatus || "-"}</p>
          <p>
            <strong>Total:</strong>{" "}
            ₹{rawSubtotal.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* ================= GUEST INFO ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border rounded-lg p-4 mb-5">
        <div>
          <h3 className="font-semibold mb-1">Guest Info</h3>
          <p>{user.name || "-"}</p>
          <p>{user.mobile || "-"}</p>
          <p className="break-all">{user.email || "-"}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-1">Room & Service</h3>
          <p className="text-gray-600">
            Accommodation and service charges as applicable.
          </p>
        </div>
      </div>

      {/* ================= PRICE TABLE ================= */}
      <div className="overflow-x-auto mb-5">
        <table className="min-w-[480px] w-full border-t text-sm">
          <thead>
            <tr className="border-b font-semibold text-gray-700">
              <th className="text-left py-2">Description</th>
              <th className="text-right py-2">Rate</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((item, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-2">{item.description || "-"}</td>
                <td className="py-2 text-right">{item.rate || "-"}</td>
                <td className="py-2 text-right">{item.total || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= TOTALS ================= */}
      <div className="text-right space-y-1">
        <p><strong>Sub Total:</strong> ₹{rawSubtotal.toLocaleString("en-IN")}</p>
        <p><strong>Tax (10%):</strong> ₹{tax.toLocaleString("en-IN")}</p>
        <p className="text-base sm:text-lg font-semibold mt-1">
          Grand Total: ₹{grandTotal.toLocaleString("en-IN")}
        </p>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="mt-8 pt-4 border-t text-center text-xs text-gray-500">
        Thank you for choosing {invoice.propertyName || "our property"}!
      </div>
    </div>
  );
});

export default InvoicePreview;
