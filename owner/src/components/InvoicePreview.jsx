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
      className="bg-white max-w-4xl mx-auto border rounded-lg 
      px-4 sm:px-6 md:px-8 
      py-6 sm:py-8 md:py-10 
      text-sm text-gray-800"
      style={{ fontFamily: "Inter, sans-serif" }}
    >

      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex gap-3">
          <div className="h-10 w-10 sm:h-11 sm:w-11 text-lg rounded-md bg-primary flex items-center justify-center text-white font-semibold uppercase shrink-0">
            {invoice.propertyName?.charAt(0) || "P"}
          </div>
          <div>
            <h1 className="font-semibold text-base sm:text-lg">
              {invoice.propertyName}
            </h1>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              {invoice.propertyAddress || "—"}
            </p>
          </div>
        </div>

        <h2 className="text-base sm:text-lg font-bold tracking-wide text-right">
          TAX INVOICE
        </h2>
      </div>

      <hr className="my-6" />

      {/* ================= BILL TO + META ================= */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-6">
        <div>
          <p className="text-xs text-gray-500 mb-1">BILL TO</p>
          <p className="font-semibold">{user.name}</p>
          <p className="text-xs">{user.mobile}</p>
          <p className="text-xs break-all">{user.email}</p>
        </div>

        <div className="text-xs space-y-2">
          {[
            ["Invoice No", invoice.invoiceNumber],
            ["Invoice Date", safeFormat(invoice.invoiceDate)],
            ["Booking Date", safeFormat(invoice.bookingDate)],
            ["Order ID", invoice.orderId],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <span className="text-gray-500 w-24 shrink-0">{label}:</span>
              <span className="font-semibold break-all">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= BOOKING DETAILS ================= */}
      <div
        className="mt-6 bg-[#f9f9f9] border rounded-lg p-4 
        grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs"
      >
        <p className="col-span-full font-semibold text-gray-600">
          BOOKING DETAILS
        </p>

        <Detail label="Check-in" value={safeFormat(invoice.checkIn)} sub="2:00 PM" />
        <Detail label="Check-out" value={safeFormat(invoice.checkOut)} sub="11:00 AM" />
        <Detail label="Duration" value={`${nights} Nights`} />
        <Detail
          label="Guests"
          value={`${invoice.guests.adults + invoice.guests.children} Guests`}
          sub={`${invoice.guests.adults} Adults, ${invoice.guests.children} Children`}
        />
      </div>

      {/* ================= TABLE ================= */}
      <div className="mt-8">
        {/* Desktop table */}
        <table className="hidden md:table w-full text-xs border-t">
          <thead>
            <tr className="border-b text-left text-sm">
              <th className="py-4">S.No</th>
              <th>Description</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Rate</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b text-sm">
              <td className="py-3">1</td>
              <td>
                <p className="font-semibold">Room / Accommodation Charges</p>
                <p className="text-gray-500 text-xs">
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

        {/* Mobile card */}
        <div className="md:hidden border rounded-lg p-4 space-y-2 text-xs">
          <p className="font-semibold">Room / Accommodation Charges</p>
          <p className="text-gray-500">
            {invoice.propertyType} at {invoice.propertyName}
          </p>
          <div className="flex justify-between">
            <span>Qty</span>
            <span>{nights} Nights</span>
          </div>
          <div className="flex justify-between">
            <span>Rate</span>
            <span>₹{rate.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Amount</span>
            <span>₹{invoice.totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* ================= TOTALS ================= */}
      <div className="flex justify-end mt-6">
        <div className="w-full sm:w-72 text-xs space-y-2">
          <Row label="Sub Total" value={invoice.totalAmount} />
          <Row label="Tax (0%)" value="0.00" />
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Grand Total</span>
            <span>₹{invoice.totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <p className="mt-6 text-xs">
        <span className="text-gray-500">Amount in Words:</span>{" "}
        <strong>{invoice.amountInWords}</strong>
      </p>

      <hr className="my-6" />

      <div className="flex flex-col sm:flex-row sm:justify-between gap-6 text-xs">
        <div>
          <p className="text-gray-500">PAYMENT INFORMATION</p>
          <p>Status: <strong>{invoice.paymentStatus}</strong></p>
          <p>Method: {invoice.paymentMethod}</p>
          <p className="break-all">Transaction ID: {invoice.transactionId}</p>
        </div>

        <div className="text-right">
          <div className="border-t w-40 ml-auto pt-1">
            Authorized Signatory
          </div>
          <p className="text-gray-500">{invoice.propertyName}</p>
        </div>
      </div>

      <p className="text-center text-xs text-gray-500 mt-6">
        Thank you for your stay at {invoice.propertyName}!
      </p>
    </div>
  );
});

const Detail = ({ label, value, sub }) => (
  <div>
    <p className="text-gray-500 mb-1">{label}</p>
    <p className="font-semibold text-sm">{value}</p>
    {sub && <p className="text-gray-400">{sub}</p>}
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-500">{label}</span>
    <span>₹{typeof value === "number" ? value.toLocaleString("en-IN") : value}</span>
  </div>
);

export default InvoicePreview;
