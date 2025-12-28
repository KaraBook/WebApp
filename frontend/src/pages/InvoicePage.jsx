import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useAuthStore } from "@/store/auth";

export default function InvoicePage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const componentRef = useRef();
  const { accessToken } = useAuthStore();

  const fetchInvoice = async () => {
    try {
      const res = await Axios.get(
        SummaryApi.getInvoice.url(id) + `?t=${Date.now()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
      if (res.data.success) setInvoice(res.data.data);
    } catch (err) {
      console.error("Invoice fetch error:", err);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Invoice_${invoice?.invoiceNumber}`,
  });

  const handleDownloadPDF = async () => {
    if (!invoice || !componentRef.current) return;

    const element = componentRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  };

  if (!invoice)
    return <p className="text-center py-20 text-gray-500">Loading...</p>;

  const breakdown = Array.isArray(invoice.priceBreakdown)
    ? invoice.priceBreakdown
    : [];

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
    <div className="min-h-screen flex flex-col items-start py-4 px-4">
      <div className="max-w-3xl w-full py-4 flex items-start justify-between">
        <Link
          to="/account/bookings"
          className="bg-gray-200 text-black px-4 py-2 rounded-[8px]"
        >
          Back
        </Link>
        <Button
          onClick={handleDownloadPDF}
          disabled={!invoice}
          className="flex items-center gap-2 bg-primary rounded-[8px]"
        >
          <FileDown className="w-4 h-4" />
          Download Invoice
        </Button>
      </div>

      <div
        className="bg-white rounded-[12px] shadow-md p-8 max-w-3xl w-full"
        ref={componentRef}
      >
        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-xl font-semibold">{invoice.propertyName}</h1>
            <p className="text-gray-600 text-sm">
              {invoice.propertyCity}, {invoice.propertyState}
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold">Invoice</h2>
            <p className="text-sm text-gray-500">
              Invoice No: {invoice.invoiceNumber}
            </p>
          </div>
        </div>

        {/* BOOKING DETAILS */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-6 border rounded-lg p-4">
          <div>
            <p>
              <strong>Check-in:</strong>{" "}
              {format(new Date(invoice.checkIn), "dd MMM yyyy")}
            </p>
            <p>
              <strong>Check-out:</strong>{" "}
              {format(new Date(invoice.checkOut), "dd MMM yyyy")}
            </p>
            <p>
              <strong>Nights:</strong> {invoice.nights}
            </p>
            <div className="grid grid-cols-2 gap-4">
              {/* Guests */}
              <div>
                <p className="text-gray-500 text-xs uppercase">Guests</p>
                <p className="text-sm font-medium mt-1">
                  Adults: {selectedBooking.guests.adults} | Children: {selectedBooking.guests.children}
                </p>
              </div>

              {/* Meals */}
              {selectedBooking.meals?.includeMeals && (
                <div>
                  <p className="text-gray-500 text-xs uppercase">Meals Included</p>
                  <p className="text-sm font-medium mt-1">
                    Veg: {selectedBooking.meals.veg || 0} | Non-Veg: {selectedBooking.meals.nonVeg || 0} | Combo: {selectedBooking.meals.combo || 0}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <p>
              <strong>Booking Date:</strong>{" "}
              {format(new Date(invoice.bookingDate), "dd MMM yyyy")}
            </p>
            <p>
              <strong>Payment Status:</strong> {invoice.paymentStatus}
            </p>
            <p>
              <strong>Sub Total:</strong> ₹{rawSubtotal.toLocaleString()}
            </p>
          </div>
        </div>

        {/* GUEST INFO */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-6 border rounded-lg p-4">
          <div>
            <h3 className="font-semibold mb-1">Guest Info</h3>
            <p>{invoice.user.name}</p>
            <p>{invoice.user.mobile}</p>
            <p>{invoice.user.email}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Room & Pricing Details</h3>
            <p>
              Base room charges include standard occupancy. Additional adult and
              child charges are applied per night where applicable.
            </p>
          </div>
        </div>

        {/* PRICE BREAKDOWN */}
        <table className="w-full text-sm border-t border-gray-200 mb-6">
          <thead>
            <tr className="font-semibold border-b">
              <th className="text-left py-2">Description</th>
              <th className="text-right py-2">Rate</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.length > 0 ? (
              breakdown.map((item, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2">{item.description}</td>
                  <td className="py-2 text-right">{item.rate}</td>
                  <td className="py-2 text-right">{item.total}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="py-4 text-center text-gray-500"
                >
                  No price breakdown available
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* TOTALS */}
        <div className="text-right text-sm">
          <p>
            <strong>Sub Total:</strong> ₹{rawSubtotal.toLocaleString()}
          </p>
          <p>
            <strong>Tax (10%):</strong> ₹{tax.toLocaleString()}
          </p>
          <p className="text-lg font-semibold mt-1">
            Grand Total: ₹{grandTotal.toLocaleString()}
          </p>
        </div>

        {/* FOOTER */}
        <div className="mt-10 text-center text-xs text-gray-500 border-t pt-4">
          <p>
            Terms & Conditions: Use of this website constitutes agreement with
            our policies.
          </p>
        </div>
      </div>
    </div>
  );
}
