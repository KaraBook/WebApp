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
      className="bg-white max-w-4xl mx-auto border rounded-lg px-4 sm:px-8 py-6 sm:py-10 text-sm text-gray-800"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
        <div className="flex gap-3">
          <div className="h-10 w-10 text-[20px] rounded-md bg-primary flex items-center justify-center text-white font-semibold uppercase">
            {invoice.propertyName?.charAt(0) || "P"}
          </div>
          <div>
            <h1 className="font-semibold text-[20px]">
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
      <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
        <div>
          <p className="text-xs text-gray-500 mb-1">BILL TO</p>
          <p className="font-[600] mb-[5px]">{user.name}</p>
          <p className="text-s mb-[5px]">{user.mobile}</p>
          <p className="text-s break-all">{user.email}</p>
        </div>

        <div className="text-xs space-y-2">
          <div className="flex gap-3">
            <span className="text-gray-500 text-s w-24 shrink-0">Invoice No:</span>
            <span className="font-[600]">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-500 text-s w-24 shrink-0">Invoice Date:</span>
            <span className="font-[600]">{safeFormat(invoice.invoiceDate)}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-500 text-s w-24 shrink-0">Booking Date:</span>
            <span className="font-[600]">{safeFormat(invoice.bookingDate)}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-500 text-s w-24 shrink-0">Order ID:</span>
            <span className="break-all font-[600]">{invoice.orderId}</span>
          </div>
        </div>
      </div>

      {/* ================= BOOKING DETAILS BOX ================= */}
      <div className="mt-6 bg-[#f9f9f9] border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <p className="col-span-full text-xs font-semibold text-gray-600 mb-1">
          BOOKING DETAILS
        </p>

        <div>
          <p className="text-gray-500 mb-1">Check-in</p>
          <p className="font-[600] text-[13px]">{safeFormat(invoice.checkIn)}</p>
          <p className="text-gray-400">2:00 PM</p>
        </div>

        <div>
          <p className="text-gray-500 mb-1">Check-out</p>
          <p className="font-[600] text-[13px]">{safeFormat(invoice.checkOut)}</p>
          <p className="text-gray-400">11:00 AM</p>
        </div>

        <div>
          <p className="text-gray-500 mb-1">Duration</p>
          <p className="font-[600] text-[13px]">{nights} Nights</p>
        </div>

        <div>
          <p className="text-gray-500 mb-1">Guests</p>
          <p className="font-[600] text-[13px]">
            {invoice.guests.adults + invoice.guests.children} Guests
          </p>
          <p className="text-gray-400">
            {invoice.guests.adults} Adults, {invoice.guests.children} Children
          </p>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] mt-8 text-xs border-t">
          <thead>
            <tr className="border-b text-left text-[14px]">
              <th className="py-4">S.No</th>
              <th>Description</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Rate</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b text-[14px]">
              <td className="py-3">1</td>
              <td className="py-3">
                <p className="font-[600]">Room / Accommodation Charges</p>
                <p className="text-gray-500 mt-1 text-[12px]">
                  {invoice.propertyType} at {invoice.propertyName}
                </p>
              </td>
              <td className="text-right">{nights} Nights</td>
              <td className="text-right">₹{rate.toFixed(2)}</td>
              <td className="text-right">
                ₹{invoice.totalAmount.toLocaleString("en-IN")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ================= TOTALS ================= */}
      <div className="flex justify-end mt-6">
        <div className="w-full sm:w-72 text-s space-y-2">
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
      <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-0 text-xs">
        <div className="space-y-1">
          <p className="text-gray-500">PAYMENT INFORMATION</p>
          <p>Status: <strong>{invoice.paymentStatus}</strong></p>
          <p>Method: {invoice.paymentMethod}</p>
          <p className="break-all">Transaction ID: {invoice.transactionId}</p>
        </div>

        <div className="text-right">
          <div className="border-t w-40 ml-auto mt-8 pt-1">
            Authorized Signatory
          </div>
          <p className="text-gray-500 mt-1">{invoice.propertyName}</p>
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
