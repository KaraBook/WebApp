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

/* -------------------------------------------
   Amount to Words (safe, no dependency)
------------------------------------------- */
const numberToWords = (num) => {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six",
    "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = [
    "", "", "Twenty", "Thirty", "Forty",
    "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  if (num === 0) return "Zero";

  if (num < 20) return a[num];
  if (num < 100)
    return b[Math.floor(num / 10)] + (num % 10 ? " " + a[num % 10] : "");
  if (num < 1000)
    return (
      a[Math.floor(num / 100)] +
      " Hundred" +
      (num % 100 ? " " + numberToWords(num % 100) : "")
    );
  if (num < 100000)
    return (
      numberToWords(Math.floor(num / 1000)) +
      " Thousand" +
      (num % 1000 ? " " + numberToWords(num % 1000) : "")
    );

  return "";
};

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

  if (!invoice) return null;

  /* ----------------- SAFE DERIVED VALUES ----------------- */
  const guestsData = invoice.guests;

  let adults = 0;
  let children = 0;
  let totalGuests = 0;

  if (typeof guestsData === "number") {
    totalGuests = guestsData;
  } else if (typeof guestsData === "object" && guestsData !== null) {
    adults = Number(guestsData.adults || 0);
    children = Number(guestsData.children || 0);
    totalGuests = adults + children;
  }

  const subtotal = Number(invoice.totalAmount || 0);
  const tax = Number(invoice.taxAmount || 0);
  const grandTotal = Number(invoice.grandTotal || subtotal + tax);

  const amountInWords =
    grandTotal > 0
      ? `${numberToWords(grandTotal)} Rupees Only`
      : "—";

  const downloadPDF = async () => {
  const original = invoiceRef.current;
  if (!original) return;

  const clone = original.cloneNode(true);

  // 🔒 FORCE DESKTOP PDF MODE
  clone.classList.add("pdf-desktop");
  clone.querySelector(".invoice-pdf")?.classList.add("pdf-layout");

  clone.style.position = "fixed";
  clone.style.top = "0";
  clone.style.left = "-9999px";
  clone.style.background = "#fff";

  document.body.appendChild(clone);

  await new Promise((r) => setTimeout(r, 300));

  const canvas = await html2canvas(clone, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  document.body.removeChild(clone);

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = 210;
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
};



  return (
    <div className="min-h-screen px-0 md:px-4 py-6">
      {/* ACTION BAR */}
      <div className="max-w-[50rem] flex justify-between mb-4">
        <Link
          to="/account/bookings"
          className="flex items-center gap-2 bg-white border px-4 py-2 rounded-md text-sm"
        >
          <ArrowLeft size={16} /> Back
        </Link>

        <Button onClick={downloadPDF} className="bg-primary text-sm px-4">
          <FileDown size={16} className="mr-2" />
          Download Invoice
        </Button>
      </div>

      {/* INVOICE */}
      <div ref={invoiceRef} className="invoice-root pdf-scope">
        <div className="invoice-pdf max-w-[50rem] bg-white border rounded-xl p-8">
          {/* HEADER */}
          <div className="flex justify-between pb-2 md:pb-4 border-b">
            <div className="flex gap-3">
              <div
                className="w-10 h-10 bg-primary text-white rounded-md font-bold"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: "1",
                }}
              >
                {invoice.propertyName?.[0]}
              </div>
              <div>
                <p className="font-semibold">{invoice.propertyName}</p>
                <p className="text-xs text-muted-foreground">
                  {invoice.propertyAddress}
                </p>
              </div>
            </div>
            <p className="font-semibold text-sm tracking-wide">INVOICE</p>
          </div>

          {/* BILL TO */}
          <div className="bill-grid grid sm:grid-cols-2 gap-8 mt-6 text-sm">
            <div>
              <p className="uppercase text-xs text-muted-foreground mb-2">Bill To</p>
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
          <div
            className="mt-6 bg-gray-50 border rounded-lg"
            style={{ padding: "12px 16px" }}
          >
            <p className="uppercase text-xs font-semibold text-muted-foreground mb-2">
              Booking Details
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <BD label="Check-in" value="27 Nov 2025" sub="2:00 PM" />
              <BD label="Check-out" value="30 Nov 2025" sub="11:00 AM" />
              <BD label="Duration" value={`${invoice.nights} Nights`} />
              <BD
                label="Guests"
                value={`${totalGuests} Guests`}
                sub={
                  adults || children
                    ? `${adults} Adults, ${children} Children`
                    : "—"
                }
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="mt-6 overflow-x-auto">
            <table
              className="w-full text-sm border-t min-w-[685px] md:min-w-full"
              style={{
                borderCollapse: "collapse",
                tableLayout: "fixed",
              }}
            >
              <colgroup>
                <col style={{ width: "6%" }} />
                <col style={{ width: "44%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>

              <thead>
                <tr className="border-b" style={{ height: "48px" }}>
                  <th className="px-2 text-left">S.No</th>
                  <th className="px-2 text-left">Description</th>
                  <th className="px-2 text-right">Nights</th>
                  <th className="px-2 text-right">Rate</th>
                  <th className="px-2 text-right">Amount</th>
                </tr>
              </thead>

              {/* ===== TABLE BODY ===== */}
              <tbody>
                <tr className="border-b" style={{ height: "56px" }}>
                  <td className="px-2">
                    <div className="h-full flex items-center">1</div>
                  </td>

                  <td className="px-2">
                    <div className="h-full flex flex-col justify-center">
                      <p className="font-medium leading-tight">
                        Room / Accommodation Charges
                      </p>
                      <p className="text-xs text-muted-foreground leading-tight">
                        villa at {invoice.propertyName}
                      </p>
                    </div>
                  </td>

                  <td className="px-2 text-right">
                    <div className="h-full flex items-center justify-end">
                      {invoice.nights}
                    </div>
                  </td>

                  <td className="px-2 text-right">
                    <div className="h-full flex items-center justify-end">
                      ₹{(subtotal / invoice.nights).toLocaleString("en-IN")}
                    </div>
                  </td>

                  <td className="px-2 text-right">
                    <div className="h-full flex items-center justify-end">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

          </div>

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

          {/* AMOUNT IN WORDS */}
          <div className="mt-6 text-sm">
            <p className="text-muted-foreground mb-2">Amount in Words:</p>
            <div className="border-b pb-3">{amountInWords}</div>
          </div>

          {/* PAYMENT INFO */}
          <div className="booking-grid mt-6 pt-4 grid sm:grid-cols-2 text-sm">
            <div>
              <p className="uppercase text-xs font-semibold mb-2">
                Payment Information
              </p>
              <p>
                Status:{" "}
                <span className="font-semibold capitalize">
                  {invoice.paymentStatus}
                </span>
              </p>
              <p>Method:</p>
              <p>Transaction ID:</p>
            </div>

            {/* SIGNATURE */}
            <div className="text-right self-end">
              <div className="border-t w-40 ml-auto mb-1" />
              <p className="text-xs">Authorized Signatory</p>
              <p className="text-sm font-medium">{invoice.propertyName}</p>
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
      </div>
      );
}

      /* ---------- HELPERS ---------- */

      function KV({label, value, mono, bold}) {
  return (
      <div className="flex justify-between">
        <span className="text-muted-foreground">{label}:</span>
        <span className={`${mono ? "font-mono text-xs" : ""} ${bold ? "font-semibold" : ""}`}>
          {value}
        </span>
      </div>
      );
}

      function BD({label, value, sub}) {
  return (
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
      );
}
