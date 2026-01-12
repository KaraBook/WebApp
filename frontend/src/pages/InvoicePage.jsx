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
      const res = await Axios.get(SummaryApi.getInvoice.url(id), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.data.success) setInvoice(res.data.data);
    })();
  }, [id]);

  const downloadPDF = async () => {
    const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(img, "PNG", 0, 0, 210, (canvas.height * 210) / canvas.width);
    pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  };

  if (!invoice) return null;

  const subtotal = Number(invoice.totalAmount || 0);
  const tax = Number(invoice.taxAmount || 0);
  const grandTotal = Number(invoice.grandTotal || subtotal + tax);

  return (
    <div className="min-h-screen px-4 py-6">
      {/* ACTIONS */}
      <div className="max-w-4xl flex justify-between mb-4">
        <Link
          to="/account/bookings"
          className="flex items-center gap-2 bg-white border px-4 py-2 rounded-md text-sm"
        >
          <ArrowLeft size={16} /> Back
        </Link>

        <Button
          onClick={downloadPDF}
          className="bg-teal-600 hover:bg-teal-700 text-sm px-4"
        >
          <FileDown size={16} className="mr-2" />
          Download Invoice
        </Button>
      </div>

      {/* INVOICE */}
      <div
        ref={invoiceRef}
        className="max-w-4xl bg-white border rounded-xl p-8"
      >
        {/* HEADER */}
        <div className="flex justify-between items-start pb-4 border-b">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-teal-600 text-white rounded-md flex items-center justify-center font-bold">
              {invoice.propertyName?.[0]}
            </div>
            <div>
              <p className="font-semibold text-[16px]">
                {invoice.propertyName}
              </p>
              <p className="text-xs text-muted-foreground">
                {invoice.propertyCity}, {invoice.propertyState}
              </p>
            </div>
          </div>

          <p className="font-semibold text-sm tracking-wide">
            TAX INVOICE
          </p>
        </div>

        {/* BILL TO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-6 text-sm">
          <div>
            <p className="uppercase text-xs text-muted-foreground mb-2">
              Bill To
            </p>
            <p className="font-medium">{invoice.user?.name}</p>
            <p>{invoice.user?.mobile}</p>
            <p>{invoice.user?.email}</p>
          </div>

          <div className="space-y-1">
            <KV label="Invoice No" value={invoice.invoiceNumber} />
            <KV label="Invoice Date" value="—" />
            <KV
              label="Booking Date"
              value={format(new Date(invoice.bookingDate), "dd MMM yyyy")}
            />
            <KV label="Order ID" value={invoice.orderId} mono />
          </div>
        </div>

        {/* BOOKING DETAILS */}
        <div className="mt-6 bg-gray-50 border rounded-lg p-4">
          <p className="uppercase text-xs font-semibold text-muted-foreground mb-3">
            Booking Details
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <BD label="Check-in" value="27 Nov 2025" sub="2:00 PM" />
            <BD label="Check-out" value="30 Nov 2025" sub="11:00 AM" />
            <BD label="Duration" value={`${invoice.nights} Nights`} />
            <BD label="Guests" value="NaN Guests" sub="Adults, Children" />
          </div>
        </div>

        {/* TABLE */}
        <table className="w-full mt-6 text-sm border-t">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">S.No</th>
              <th className="text-left">Description</th>
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

        {/* TOTALS */}
        <div className="flex justify-end mt-4 text-sm">
          <div className="w-1/2 space-y-2">
            <KV label="Sub Total" value={`₹${subtotal.toLocaleString("en-IN")}`} />
            <KV label="Tax (0%)" value={`₹${tax.toLocaleString("en-IN")}`} />
            <KV
              label="Grand Total"
              value={`₹${grandTotal.toLocaleString("en-IN")}`}
              bold
            />
          </div>
        </div>

        {/* PAYMENT INFO */}
        <div className="mt-6 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 text-sm">
          <div>
            <p className="uppercase text-xs font-semibold mb-2">
              Payment Information
            </p>
            <p>Status: paid</p>
            <p>Method:</p>
            <p>Transaction ID:</p>
          </div>

          <div className="text-right self-end">
            <p className="text-xs">Authorized Signatory</p>
            <p className="text-sm font-medium">
              {invoice.propertyName}
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-6 text-xs text-muted-foreground space-y-1">
          <p>• This is a computer-generated invoice and does not require a physical signature.</p>
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

/* ===== Helpers ===== */

function KV({ label, value, mono, bold }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}:</span>
      <span className={`${mono ? "font-mono text-xs" : ""} ${bold ? "font-semibold" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function BD({ label, value, sub }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
