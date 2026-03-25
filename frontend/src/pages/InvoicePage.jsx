import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { FileDown, ArrowLeft, Printer, MapPin, Globe, Mail, Phone, CheckCircle } from "lucide-react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { useAuthStore } from "@/store/auth";

/* ─────────────────────────────────────────
   Amount → Words  (no external dependency)
───────────────────────────────────────── */
const numberToWords = (num) => {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six",
    "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (num === 0) return "Zero";
  if (num < 20)  return a[num];
  if (num < 100) return b[Math.floor(num / 10)] + (num % 10 ? " " + a[num % 10] : "");
  if (num < 1000)
    return a[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + numberToWords(num % 100) : "");
  if (num < 100000)
    return numberToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + numberToWords(num % 1000) : "");
  if (num < 10000000)
    return numberToWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + numberToWords(num % 100000) : "");
  return "";
};

/* ─────────────────────────────────────────
   Design tokens
───────────────────────────────────────── */
const T = "#0D9488";          // primary teal
const T_DARK = "#0F766E";     // teal hover / dark
const BORDER = "#E5E7EB";
const BORDER_LIGHT = "#F3F4F6";
const MUTED = "#6B7280";
const DARK = "#111827";
const BODY = "#374151";

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
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

  /* ── guests ── */
  const guestsData = invoice.guests;
  let adults = 0, children = 0, totalGuests = 0;
  if (typeof guestsData === "number") {
    totalGuests = guestsData;
  } else if (typeof guestsData === "object" && guestsData !== null) {
    adults    = Number(guestsData.adults   || 0);
    children  = Number(guestsData.children || 0);
    totalGuests = adults + children;
  }

  /* ── meals ── */
  const meals     = invoice.meals || null;
  const hasMeals  = meals?.includeMeals === true;
  const vegCount  = Number(meals?.veg    || 0);
  const nonVegCount = Number(meals?.nonVeg || 0);

  /* ── financials ── */
  const subtotal   = Number(invoice.totalAmount  || 0);
  const cgst       = Number(invoice.cgstAmount   || 0);
  const sgst       = Number(invoice.sgstAmount   || 0);
  const tax        = cgst + sgst;
  const grandTotal = Number(invoice.grandTotal   || subtotal + tax);
  const roundedTotal = Math.round(grandTotal);
  const amountInWords = roundedTotal > 0 ? `${numberToWords(roundedTotal)} Rupees Only` : "—";

  /* ── dates ── */
  const fmtDate = (d) => format(new Date(d), "dd MMM yyyy");
  const fmtTime = (d) => format(new Date(d), "hh:mm a");
  const bookingDate = fmtDate(invoice.bookingDate);

  /* ── PDF download ── */
  const downloadPDF = async () => {
    const original = invoiceRef.current;
    if (!original) return;

    const clone = original.cloneNode(true);
    clone.style.cssText = "position:fixed;top:0;left:-9999px;background:#fff;width:800px;";
    document.body.appendChild(clone);
    await new Promise((r) => setTimeout(r, 300));

    const canvas = await html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    document.body.removeChild(clone);

    const imgData  = canvas.toDataURL("image/png");
    const pdf      = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  };

  /* ── line items (accommodation is always row 1; add more from invoice.lineItems if present) ── */
  const lineItems = invoice.lineItems?.length
    ? invoice.lineItems
    : [
        {
          description: "Room / Accommodation Charges",
          sub: `Villa at ${invoice.propertyName}`,
          hsn: "996311",
          qty: invoice.nights,
          rate: subtotal / invoice.nights,
          amount: subtotal,
        },
      ];

  /* ────────────────────────────────────────
     RENDER
  ──────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", padding: "32px 16px", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── ACTION BAR ── */}
      <div style={{ maxWidth: "820px",  display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link
          to="/account/bookings"
          style={{
            display: "flex", alignItems: "center", gap: "7px",
            background: "white", border: `1px solid ${BORDER}`, padding: "8px 18px",
            borderRadius: "8px", fontSize: "14px", color: BODY, textDecoration: "none",
            fontWeight: "500", boxShadow: "0 1px 2px rgba(0,0,0,.05)",
          }}
        >
          <ArrowLeft size={15} /> Back
        </Link>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => window.print()}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              background: "white", border: `1px solid ${BORDER}`, padding: "8px 18px",
              borderRadius: "8px", fontSize: "14px", color: BODY, cursor: "pointer",
              fontWeight: "500", boxShadow: "0 1px 2px rgba(0,0,0,.05)",
            }}
          >
            <Printer size={15} /> Print
          </button>
          <button
            onClick={downloadPDF}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              background: T, color: "white", border: "none", padding: "8px 22px",
              borderRadius: "8px", fontSize: "14px", cursor: "pointer", fontWeight: "600",
              boxShadow: `0 2px 8px rgba(13,148,136,.35)`,
            }}
          >
            <FileDown size={15} /> Download PDF
          </button>
        </div>
      </div>

      {/* ── INVOICE CARD ── */}
      <div
        ref={invoiceRef}
        style={{
          maxWidth: "820px", background: "white",
          borderRadius: "16px", border: `1px solid ${BORDER}`,
          overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,.06)",
        }}
      >

        {/* ══ HEADER ══ */}
        <div style={{ padding: "28px 36px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          {/* Brand */}
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{
              width: "52px", height: "52px", background: T, borderRadius: "12px",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9"  x2="8" y2="9"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "26px", fontWeight: "800", color: T, letterSpacing: "-0.5px", lineHeight: "1.1" }}>
                Karabook
              </div>
              <div style={{ fontSize: "12px", color: MUTED, marginTop: "3px" }}>
                A unit of Karabook Hospitality Pvt Ltd
              </div>
              {invoice.propertyGSTIN && (
                <div style={{ fontSize: "12px", color: BODY, marginTop: "3px" }}>
                  GSTIN:&nbsp;<span style={{ fontWeight: "500" }}>{invoice.propertyGSTIN}</span>
                </div>
              )}
            </div>
          </div>

          {/* Invoice meta */}
          <div style={{ textAlign: "right" }}>
            <div style={{
              display: "inline-block", background: T, color: "white",
              padding: "5px 20px", borderRadius: "7px", fontSize: "12px",
              fontWeight: "700", letterSpacing: "1.8px", marginBottom: "14px",
            }}>TAX INVOICE</div>
            <table style={{ borderCollapse: "collapse", marginLeft: "auto" }}>
              <tbody>
                {[
                  ["Invoice No",   invoice.invoiceNumber],
                  ["Invoice Date", bookingDate],
                  ["Booking ID",   invoice.orderId || "—"],
                ].map(([lbl, val]) => (
                  <tr key={lbl}>
                    <td style={{ fontSize: "13px", color: MUTED, paddingRight: "12px", paddingBottom: "3px", whiteSpace: "nowrap" }}>{lbl}:</td>
                    <td style={{ fontSize: "13px", fontWeight: "700", color: DARK, textAlign: "right", paddingBottom: "3px" }}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ══ SUPPLIER + BILL TO ══ */}
        <div style={{ margin: "4px 36px 24px", border: `1px solid ${BORDER}`, borderRadius: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>
          {/* Supplier */}
          <div style={{ padding: "20px 24px", borderRight: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: T, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "10px" }}>
              Karabook Hospitality Pvt Ltd
            </div>
            <div style={{ fontSize: "12.5px", color: MUTED, fontStyle: "italic", marginBottom: "10px" }}>
              Trade name: Karabook
            </div>
            <Row icon={<MapPin size={13} style={{ color: "#9CA3AF", flexShrink: 0, marginTop: "2px" }} />}>
              <span style={{ fontSize: "12.5px", color: BODY }}>
                123 Business Park, Andheri East,<br />Mumbai, Maharashtra – 400069
              </span>
            </Row>
            <Row icon={<Globe size={13} style={{ color: "#9CA3AF" }} />}>
              <span style={{ fontSize: "12.5px", color: BODY }}>karabook.in</span>
            </Row>
            <div style={{ fontSize: "12.5px", color: BODY, marginTop: "6px" }}>
              GSTIN:&nbsp;<span style={{ fontWeight: "500" }}>{invoice.propertyGSTIN || "27AABCK1234A1Z5"}</span>
            </div>
          </div>

          {/* Bill To */}
          <div style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: T, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "10px" }}>
              Bill To
            </div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: DARK, marginBottom: "10px" }}>
              {invoice.user?.name}
            </div>
            <Row icon={<Mail size={13} style={{ color: "#9CA3AF" }} />}>
              <span style={{ fontSize: "13px", color: BODY }}>{invoice.user?.email}</span>
            </Row>
            <Row icon={<Phone size={13} style={{ color: "#9CA3AF" }} />}>
              <span style={{ fontSize: "13px", color: BODY }}>{invoice.user?.mobile}</span>
            </Row>
          </div>
        </div>

        {/* ══ STAY DETAILS ══ */}
        <div style={{ margin: "0 36px 28px", border: `1px solid ${BORDER}`, borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ padding: "12px 24px", borderBottom: `1px solid ${BORDER}`, background: "#FAFAFA" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: T, letterSpacing: "1.5px", textTransform: "uppercase" }}>
              Stay Details
            </span>
          </div>
          <StayRow label="Property"  value={invoice.propertyName} />
          <StayRow
            label="Check-in"
            value={`${fmtDate(invoice.checkIn)} • ${fmtTime(invoice.checkIn)}`}
            right={<span style={{ fontSize: "13px", color: BODY }}>Nights:&nbsp;<strong style={{ color: DARK }}>{invoice.nights}</strong></span>}
          />
          <StayRow
            label="Check-out"
            value={`${fmtDate(invoice.checkOut)} • ${fmtTime(invoice.checkOut)}`}
            right={
              <span style={{ fontSize: "13px", color: BODY }}>
                Guests:&nbsp;
                <strong style={{ color: DARK }}>
                  {totalGuests}&nbsp;{adults ? "Adults" : "Guests"}
                </strong>
              </span>
            }
          />
          <StayRow label="Location" value={invoice.propertyAddress} />
          <StayRow label="SAC"      value="996311 (Accommodation Services)" last />
        </div>

        {/* ══ LINE ITEMS TABLE ══ */}
        <div style={{ margin: "0 36px 4px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <colgroup>
              <col style={{ width: "42%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "18%" }} />
            </colgroup>
            <thead>
              <tr style={{ borderBottom: `2px solid ${BORDER}` }}>
                {["Description", "HSN / SAC", "QTY", "Rate", "Amount"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      fontSize: "11.5px", fontWeight: "700", color: T,
                      letterSpacing: "1px", textTransform: "uppercase",
                      padding: "12px 6px", textAlign: i === 0 ? "left" : "right",
                      paddingLeft: i === 0 ? "0" : "6px",
                    }}
                  >{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                  <td style={{ padding: "16px 6px 16px 0", verticalAlign: "top" }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: DARK }}>
                      {item.description || "Room / Accommodation Charges"}
                    </div>
                    {item.sub && (
                      <div style={{ fontSize: "12px", color: "#9CA3AF", fontStyle: "italic", marginTop: "2px" }}>
                        {item.sub}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: "right", fontSize: "13px", color: BODY, padding: "16px 6px" }}>
                    {item.hsn || "996311"}
                  </td>
                  <td style={{ textAlign: "right", fontSize: "13px", color: BODY, padding: "16px 6px" }}>
                    {item.qty ?? invoice.nights}
                  </td>
                  <td style={{ textAlign: "right", fontSize: "13px", color: BODY, padding: "16px 6px" }}>
                    ₹{Number(item.rate ?? subtotal / invoice.nights).toLocaleString("en-IN")}
                  </td>
                  <td style={{ textAlign: "right", fontSize: "14px", fontWeight: "700", color: DARK, padding: "16px 6px" }}>
                    ₹{Number(item.amount ?? subtotal).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ══ NOTE + TOTALS ══ */}
        <div style={{ margin: "16px 36px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", alignItems: "end" }}>
          {/* GST Note */}
          <div style={{
            background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px",
            padding: "14px 18px", fontSize: "12px", color: "#92400E", fontStyle: "italic", lineHeight: "1.7",
          }}>
            Note: GST is calculated on the accommodation package subtotal at the applicable rate. All charges are inclusive of applicable taxes unless stated otherwise.
          </div>

          {/* Totals */}
          <div>
            <TotalRow label="Subtotal (Taxable Value)" value={`₹${subtotal.toLocaleString("en-IN")}`} />
            {tax > 0 && (
              <>
                <TotalRow label="CGST @ 9%" value={`₹${cgst.toLocaleString("en-IN")}`} />
                <TotalRow label="SGST @ 9%" value={`₹${sgst.toLocaleString("en-IN")}`} />
              </>
            )}
            {/* Grand total row */}
            <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "15px", fontWeight: "700", color: DARK }}>Total Payable</span>
              <span style={{ fontSize: "22px", fontWeight: "800", color: T }}>
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div style={{ fontSize: "11.5px", color: "#9CA3AF", marginTop: "7px", textAlign: "right", fontStyle: "italic" }}>
              Amount in words: {amountInWords}
            </div>
          </div>
        </div>

        {/* ══ PAYMENT DETAILS ══ */}
        <div style={{ margin: "0 36px 28px", border: `1px solid ${BORDER}`, borderRadius: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>
          {/* Left */}
          <div style={{ padding: "20px 24px", borderRight: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: T, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "14px" }}>
              Payment Details
            </div>
            <PayRow label="Mode"           value={invoice.paymentMethod  || "—"} />
            <PayRow label="Transaction ID" value={invoice.transactionId  || "—"} />
            {/* Status */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
              <span style={{ fontSize: "13px", color: MUTED }}>Payment Status:</span>
              {invoice.paymentStatus?.toLowerCase() === "paid" ? (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  background: "#DCFCE7", color: "#15803D", padding: "3px 11px",
                  borderRadius: "100px", fontSize: "12px", fontWeight: "700",
                  border: "1px solid #86EFAC",
                }}>
                  <CheckCircle size={13} /> PAID
                </span>
              ) : (
                <span style={{ fontSize: "13px", fontWeight: "600", color: BODY, textTransform: "capitalize" }}>
                  {invoice.paymentStatus}
                </span>
              )}
            </div>
          </div>

          {/* Right — Signatory */}
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "120px" }}>
            <div style={{ fontSize: "13.5px", color: BODY, lineHeight: "1.6" }}>
              For&nbsp;<strong style={{ color: DARK }}>Karabook Hospitality Pvt Ltd</strong>
              <br />
              <span style={{ fontSize: "12px", color: MUTED, fontStyle: "italic" }}>(Trade name: Karabook)</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "8px", display: "inline-block", minWidth: "140px" }}>
                <span style={{ fontSize: "12px", color: MUTED, fontStyle: "italic" }}>Authorised Signatory</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══ FOOTER ══ */}
        <div style={{ borderTop: `1px solid ${BORDER_LIGHT}`, padding: "22px 36px 26px", textAlign: "center" }}>
          <p style={{ fontSize: "14px", fontWeight: "600", color: T, marginBottom: "6px" }}>
            Thank you for choosing Karabook. We wish you a happy and comfortable stay!
          </p>
          <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
            This is a system-generated invoice and does not require a physical signature.
          </p>
        </div>

      </div>
    </div>
  );
}



/** Icon + content row */
function Row({ icon, children }) {
  return (
    <div style={{ display: "flex", gap: "7px", alignItems: "center", marginBottom: "7px" }}>
      {icon}
      {children}
    </div>
  );
}

function StayRow({ label, value, right, last }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "11px 24px",
      borderBottom: last ? "none" : "1px solid #F9FAFB",
    }}>
      <div style={{ display: "flex", gap: "0", flex: 1, alignItems: "center" }}>
        <span style={{ fontSize: "13px", color: MUTED, minWidth: "100px" }}>{label}</span>
        <span style={{ fontSize: "13px", color: BODY, fontWeight: "500" }}>{value}</span>
      </div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  );
}

/** Totals key-value row */
function TotalRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", color: BODY, marginBottom: "7px" }}>
      <span>{label}</span>
      <span style={{ fontWeight: "500" }}>{value}</span>
    </div>
  );
}

/** Payment key-value row */
function PayRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "9px" }}>
      <span style={{ color: MUTED }}>{label}:</span>
      <span style={{ fontWeight: "600", color: DARK }}>{value}</span>
    </div>
  );
}