import React, { forwardRef } from "react";
import { format } from "date-fns";

const InvoicePreview = forwardRef(({ invoice }, ref) => {
  if (!invoice) return null;

  const safeFormat = (date, pattern = "dd MMM yyyy") => {
    if (!date) return "—";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "—" : format(d, pattern);
  };

  const user = invoice.user || {};
  const nights = invoice.nights || 0;
  const rate = nights ? invoice.totalAmount / nights : 0;

  return (
    <div
      ref={ref}
      className="bg-white max-w-4xl mx-auto border rounded-lg px-8 py-10 text-sm text-gray-800"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="h-10 w-10 bg-emerald-600 rounded-md flex items-center justify-center text-white font-bold">
            🧾
          </div>
          <div>
            <h1 className="font-semibold text-base">
              {invoice.propertyName}
            </h1>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              {invoice.propertyAddress || "—"}
            </p>
          </div>
        </div>

        <h2 className="text-lg font-bold tracking-wide">
          TAX INVOICE
        </h2>
      </div>

      <hr className="my-6" />

      {/* ================= BILL TO + META ================= */}
      <div className="flex justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">BILL TO</p>
          <p className="font-600 mb-[5px]">{user.name}</p>
          <p className="text-s mb-[5px]">{user.mobile}</p>
          <p className="text-s">{user.email}</p>
        </div>

        <div className="text-xs space-y-1">
          <div className="flex gap-3">
            <span className="text-gray-500 w-24">Invoice No:</span>
            <span className="font-medium">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-500 w-24">Invoice Date:</span>
            <span>{safeFormat(invoice.invoiceDate)}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-500 w-24">Booking Date:</span>
            <span>{safeFormat(invoice.bookingDate)}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-500 w-24">Order ID:</span>
            <span className="break-all">{invoice.orderId}</span>
          </div>
        </div>
      </div>

      {/* ================= BOOKING DETAILS BOX ================= */}
      <div className="mt-6 border rounded-lg p-4 grid grid-cols-4 gap-4 text-xs">
        <div>
          <p className="text-gray-500 mb-1">Check-in</p>
          <p className="font-medium">
            {safeFormat(invoice.checkIn)}
          </p>
          <p className="text-gray-400">2:00 PM</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Check-out</p>
          <p className="font-medium">
            {safeFormat(invoice.checkOut)}
          </p>
          <p className="text-gray-400">11:00 AM</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Duration</p>
          <p className="font-medium">{nights} Nights</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Guests</p>
          <p className="font-medium">
            {invoice.guests.adults + invoice.guests.children} Guests
          </p>
          <p className="text-gray-400">
            {invoice.guests.adults} Adults
          </p>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <table className="w-full mt-8 text-xs border-t">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">S.No</th>
            <th>Description</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Rate</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="py-3">1</td>
            <td>
              <p className="font-medium">
                Room / Accommodation Charges
              </p>
              <p className="text-gray-500">
                Tent at {invoice.propertyName}
              </p>
            </td>
            <td className="text-right">{nights} Nights</td>
            <td className="text-right">
              ₹{rate.toFixed(2)}
            </td>
            <td className="text-right">
              ₹{invoice.totalAmount.toLocaleString("en-IN")}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= TOTALS ================= */}
      <div className="flex justify-end mt-6">
        <div className="w-72 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Sub Total</span>
            <span>₹{invoice.totalAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tax (0%)</span>
            <span>₹0.00</span>
          </div>
          <div className="flex justify-between font-semibold text-sm border-t pt-2">
            <span>Grand Total</span>
            <span>₹{invoice.totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* ================= AMOUNT IN WORDS ================= */}
      <p className="mt-6 text-xs">
        <span className="text-gray-500">Amount in Words:</span>{" "}
        <strong>{invoice.amountInWords}</strong>
      </p>

      <hr className="my-6" />

      {/* ================= PAYMENT + SIGN ================= */}
      <div className="flex justify-between text-xs">
        <div className="space-y-1">
          <p className="text-gray-500">PAYMENT INFORMATION</p>
          <p>Status: <strong>{invoice.paymentStatus}</strong></p>
          <p>Method: {invoice.paymentMethod}</p>
          <p>Transaction ID: {invoice.transactionId}</p>
        </div>

        <div className="text-right">
          <div className="border-t w-40 ml-auto mt-8 pt-1">
            Authorized Signatory
          </div>
          <p className="text-gray-500 mt-1">
            {invoice.propertyName}
          </p>
        </div>
      </div>

      <hr className="my-6" />

      {/* ================= TERMS ================= */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• This is a computer-generated invoice and does not require a physical signature.</p>
        <p>• Check-in and check-out times are subject to property policies.</p>
        <p>• Please retain this invoice for your records.</p>
      </div>

      <p className="text-center text-xs text-gray-500 mt-6">
        Thank you for your stay at {invoice.propertyName}!
      </p>
    </div>
  );
});

export default InvoicePreview;
