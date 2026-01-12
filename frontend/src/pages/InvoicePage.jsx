import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileDown, ArrowLeft } from "lucide-react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { useAuthStore } from "@/store/auth";

export default function InvoicePage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const invoiceRef = useRef(null);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    (async () => {
      try {
        const res = await Axios.get(
          SummaryApi.getInvoice.url(id),
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Cache-Control": "no-cache",
            },
          }
        );
        if (res.data.success) setInvoice(res.data.data);
      } catch (err) {
        console.error("Invoice fetch error:", err);
      }
    })();
  }, [id]);

  const downloadPDF = async () => {
    if (!invoiceRef.current) return;
    const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = 210;
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  };

  if (!invoice) {
    return <p className="text-center py-20 text-gray-500">Loading...</p>;
  }

  const subtotal = Number(invoice.totalAmount || 0);
  const tax = Number(invoice.taxAmount || 0);
  const grandTotal = Number(invoice.grandTotal || subtotal + tax);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4">
      {/* HEADER ACTIONS */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-4">
        <Link
          to="/account/bookings"
          className="flex items-center gap-2 text-sm bg-white border px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <Button
          onClick={downloadPDF}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
        >
          <FileDown className="w-4 h-4" />
          Download Invoice
        </Button>
      </div>

      {/* INVOICE CARD */}
      <div
        ref={invoiceRef}
        className="max-w-4xl mx-auto bg-white border rounded-xl p-6 sm:p-8"
      >
        {/* HEADER */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-md bg-teal-600 text-white flex items-center justify-center font-bold">
              {invoice.propertyName?.[0]}
            </div>
            <div>
              <h2 className="font-semibold text-lg">
                {invoice.propertyName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {invoice.propertyCity}, {invoice.propertyState}
              </p>
            </div>
          </div>

          <div className="text-right">
            <h3 className="text-lg font-semibold">TAX INVOICE</h3>
          </div>
        </div>

        {/* BILL TO + META */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          <div className="text-sm">
            <p className="text-muted-foreground text-xs uppercase mb-1">
              Bill To
            </p>
            <p className="font-medium">{invoice.user?.name}</p>
            <p>{invoice.user?.mobile}</p>
            <p>{invoice.user?.email}</p>
          </div>

          <div className="text-sm space-y-1">
            <Meta label="Invoice No" value={invoice.invoiceNumber} />
            <Meta label="Invoice Date" value="—" />
            <Meta
              label="Booking Date"
              value={format(new Date(invoice.bookingDate), "dd MMM yyyy")}
            />
            <Meta label="Order ID" value={invoice.orderId} mono />
          </div>
        </div>

        {/* BOOKING DETAILS */}
        <div className="border rounded-xl p-4 mt-6">
          <p className="text-xs font-semibold uppercase mb-3 text-muted-foreground">
            Booking Details
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <Detail
              label="Check-in"
              value={format(new Date(invoice.checkIn), "dd MMM yyyy")}
              sub={invoice.checkInTime}
            />
            <Detail
              label="Check-out"
              value={format(new Date(invoice.checkOut), "dd MMM yyyy")}
              sub={invoice.checkOutTime}
            />
            <Detail label="Duration" value={`${invoice.nights} Nights`} />
            <Detail
              label="Guests"
              value={`${invoice.guests?.adults || 0 + invoice.guests?.children || 0}`}
              sub="Adults, Children"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm border-t">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3">S.No</th>
                <th>Description</th>
                <th className="text-right">Nights</th>
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
                  <p className="text-xs text-muted-foreground">
                    villa at {invoice.propertyName}
                  </p>
                </td>
                <td className="text-right">{invoice.nights}</td>
                <td className="text-right">
                  ₹{(subtotal / invoice.nights).toLocaleString("en-IN")}
                </td>
                <td className="text-right">
                  ₹{subtotal.toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TOTALS */}
        <div className="flex justify-end mt-6">
          <div className="w-full sm:w-1/2 space-y-2 text-sm">
            <Row label="Sub Total" value={subtotal} />
            <Row label="Tax (0%)" value={tax} />
            <Row label="Grand Total" value={grandTotal} bold />
          </div>
        </div>

        {/* PAYMENT INFO */}
        <div className="mt-6 border-t pt-4 text-sm">
          <p className="font-semibold uppercase text-xs mb-2">
            Payment Information
          </p>
          <p>Status: {invoice.paymentStatus}</p>
          <p>Method: {invoice.paymentMethod || "—"}</p>
        </div>

        {/* FOOTER */}
        <div className="mt-6 text-xs text-muted-foreground space-y-1">
          <p>• This is a computer-generated invoice.</p>
          <p>• Check-in and check-out times are subject to property policies.</p>
          <p>• Please retain this invoice for your records.</p>
        </div>

        <p className="text-center text-xs mt-4">
          Thank you for your stay at {invoice.propertyName}!
        </p>
      </div>
    </div>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function Meta({ label, value, mono }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}:</span>
      <span className={mono ? "font-mono text-xs" : ""}>{value}</span>
    </div>
  );
}

function Detail({ label, value, sub }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold" : ""}`}>
      <span>{label}</span>
      <span>₹{value.toLocaleString("en-IN")}</span>
    </div>
  );
}
