import React, { forwardRef } from "react";
import { format } from "date-fns";

const InvoicePreview = forwardRef(({ invoice }, ref) => {
  if (!invoice) return null;

  const user = invoice.user || {};
  const breakdown = Array.isArray(invoice.priceBreakdown)
    ? invoice.priceBreakdown
    : [];

  const formatGuests = (g) => {
    if (!g) return "-";

    if (typeof g === "number") return `${g} Guests`;

    const adults = g.adults || 0;
    const children = g.children || 0;
    const infants = g.infants || 0;

    const total = adults + children;

    return `${total} Guests${infants ? ` + ${infants} Infants` : ""} 
(${adults} Adults${children ? `, ${children} Children` : ""}${
      infants ? `, ${infants} Infants` : ""
    })`;
  };

  const rawSubtotal = Number(invoice.totalAmount || 0);
  const tax =
    invoice.taxAmount != null
      ? Number(invoice.taxAmount)
      : Math.round(rawSubtotal * 0.1);

  const grandTotal =
    invoice.grandTotal != null
      ? Number(invoice.grandTotal)
      : rawSubtotal + tax;

  return (
    <div
      ref={ref}
      className="bg-white rounded-xl border p-4 sm:p-6 md:p-8 max-w-3xl w-full text-sm"
      style={{ fontFamily: "sans-serif", color: "#333" }}
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">
            {invoice.propertyName || "Property"}
          </h1>
          <p className="text-gray-600 text-sm">
            {invoice.propertyCity || ""} {invoice.propertyState || ""}
          </p>
        </div>
        <div className="sm:text-right">
          <h2 className="text-xl sm:text-2xl font-bold">Invoice</h2>
          <p className="text-sm text-gray-500">
            Invoice No: {invoice.invoiceNumber || "-"}
          </p>
        </div>
      </div>

      {/* BOOKING DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6 border rounded-lg p-4">
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
          <p>
            <strong>Nights:</strong> {invoice.nights ?? "-"}
          </p>
          <p>
            <strong>Guests:</strong> {formatGuests(invoice.guests)}
          </p>
        </div>
        <div className="space-y-1">
          <p>
            <strong>Booking Date:</strong>{" "}
            {invoice.bookingDate
              ? format(new Date(invoice.bookingDate), "dd MMM yyyy")
              : "-"}
          </p>
          <p>
            <strong>Payment Status:</strong>{" "}
            {invoice.paymentStatus || "-"}
          </p>
          <p>
            <strong>Sub Total:</strong> ₹{rawSubtotal.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* GUEST INFO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6 border rounded-lg p-4">
        <div className="space-y-1">
          <h3 className="font-semibold mb-1">Guest Info</h3>
          <p>{user.name || "-"}</p>
          <p>{user.mobile || "-"}</p>
          <p className="break-all">{user.email || "-"}</p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">Room & Pricing Details</h3>
          <p className="text-gray-600">
            Base room charges include standard occupancy. Additional adult and
            child charges are applied per night where applicable.
          </p>
        </div>
      </div>

      {/* PRICE BREAKDOWN */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-[520px] w-full text-sm border-t border-gray-200">
          <thead>
            <tr className="font-semibold border-b bg-gray-50">
              <th className="text-left py-2 px-2">Description</th>
              <th className="text-right py-2 px-2">Rate</th>
              <th className="text-right py-2 px-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.length > 0 ? (
              breakdown.map((item, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 px-2">{item.description || "-"}</td>
                  <td className="py-2 px-2 text-right">{item.rate || "-"}</td>
                  <td className="py-2 px-2 text-right">{item.total || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-500">
                  No price breakdown available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* TOTALS */}
      <div className="text-right text-sm space-y-1">
        <p>
          <strong>Sub Total:</strong> ₹{rawSubtotal.toLocaleString("en-IN")}
        </p>
        <p>
          <strong>Tax (10%):</strong> ₹{tax.toLocaleString("en-IN")}
        </p>
        <p className="text-base sm:text-lg font-semibold mt-1">
          Grand Total: ₹{grandTotal.toLocaleString("en-IN")}
        </p>
      </div>

      {/* FOOTER */}
      <div className="mt-10 text-center text-xs text-gray-500 border-t pt-4">
        <p>Thank you for choosing {invoice.propertyName}!</p>
      </div>
    </div>
  );
});

export default InvoicePreview;
