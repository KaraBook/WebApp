import React, { forwardRef } from "react";
import { format } from "date-fns";

const InvoicePreview = forwardRef(({ invoice }, ref) => {
  if (!invoice) return null;

  const user = invoice.user || {};
  const breakdown = Array.isArray(invoice.priceBreakdown)
    ? invoice.priceBreakdown
    : [];

  const rawSubtotal = breakdown.length > 0
    ? Number(breakdown[0].total.replace(/₹|,/g, ""))
    : Number(invoice.totalAmount);

  const tax = Math.round(rawSubtotal * 0.10);
  const grandTotal = rawSubtotal + tax;


  return (
    <div
      ref={ref}
      className="bg-white rounded-xl border p-8 max-w-3xl w-full text-sm"
      style={{ fontFamily: "sans-serif", color: "#333" }}
    >
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-xl font-semibold">
            {invoice.propertyName || "Villa Gulposh"}
          </h1>
          <p className="text-gray-600 text-sm">
            {invoice.propertyCity || ""} {invoice.propertyState || ""}
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-900">Invoice</h2>
          <p className="text-sm text-gray-500">
            Invoice No: {invoice.invoiceNumber || "-"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-6 border rounded-lg p-4">
        <div>
          <p>
            <strong>Check-in:</strong>{" "}
            {invoice.checkIn ? format(new Date(invoice.checkIn), "dd MMM yyyy") : "-"}
          </p>
          <p>
            <strong>Check-out:</strong>{" "}
            {invoice.checkOut ? format(new Date(invoice.checkOut), "dd MMM yyyy") : "-"}
          </p>
          <p><strong>Nights:</strong> {invoice.nights ?? "-"}</p>
          <p>
            <strong>Guests:</strong>{" "}
            {typeof invoice.guests === "number"
              ? invoice.guests
              : invoice.guests.adults + invoice.guests.children}
          </p>


          {typeof invoice.guests === "object" && (
            <div className="mt-2 text-gray-700 space-y-1 pl-1">
              <p>• Adults: <strong>{invoice.guests.adults}</strong></p>
              <p>• Children: <strong>{invoice.guests.children}</strong></p>
              <p>• Infants: <strong>{invoice.guests.infants}</strong></p>
            </div>
          )}
        </div>
        <div>
          <p>
            <strong>Booking Date:</strong>{" "}
            {invoice.bookingDate
              ? format(new Date(invoice.bookingDate), "dd MMM yyyy")
              : "-"}
          </p>
          <p><strong>Payment Status:</strong> {invoice.paymentStatus || "-"}</p>
          <p><strong>Total:</strong> ₹{invoice.totalAmount?.toLocaleString() || "0"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-6 border rounded-lg p-4">
        <div>
          <h3 className="font-semibold mb-1">Guest Info:</h3>
          <p>{user.name || "-"}</p>
          <p>{user.mobile || "-"}</p>
          <p>{user.email || "-"}</p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">Room & Service Details:</h3>
          <p>Accommodation and service charges as applicable.</p>
        </div>
      </div>

      <table className="w-full text-sm border-t border-gray-200 mb-6">
        <thead>
          <tr className="text-gray-700 font-semibold border-b">
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

      <div className="text-right text-sm">
        <p><strong>Sub Total:</strong> ₹{rawSubtotal.toLocaleString()}</p>
        <p><strong>Tax (10%):</strong> ₹{tax.toLocaleString()}</p>
        <p className="text-lg font-semibold mt-1">
          Grand Total: ₹{grandTotal.toLocaleString()}
        </p>
      </div>

      <div className="mt-10 text-center text-xs text-gray-500 border-t pt-4">
        <p>Thank you for choosing {invoice.propertyName}!</p>
      </div>
    </div>
  );
});

export default InvoicePreview;
