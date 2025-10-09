import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function InvoicePage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const componentRef = useRef();

  const fetchInvoice = async () => {
    try {
      const res = await Axios.get(SummaryApi.getInvoice.url(id));
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
  const imgWidth = 210; // A4 width
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

  if (!invoice) return <p className="text-center py-20 text-gray-500">Loading...</p>;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center py-10 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-3xl w-full" ref={componentRef}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-xl font-semibold">{invoice.propertyName}</h1>
            <p className="text-gray-600 text-sm">{invoice.propertyCity}, {invoice.propertyState}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900">Invoice</h2>
            <p className="text-sm text-gray-500">Invoice No: {invoice.invoiceNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6 border rounded-lg p-4">
          <div>
            <p><strong>Check-in:</strong> {format(new Date(invoice.checkIn), "dd MMM yyyy")}</p>
            <p><strong>Check-out:</strong> {format(new Date(invoice.checkOut), "dd MMM yyyy")}</p>
            <p><strong>Nights:</strong> {invoice.nights}</p>
            <p><strong>Guests:</strong> {invoice.guests}</p>
          </div>
          <div>
            <p><strong>Booking Date:</strong> {format(new Date(invoice.bookingDate), "dd MMM yyyy")}</p>
            <p><strong>Payment Status:</strong> {invoice.paymentStatus}</p>
            <p><strong>Total:</strong> ₹{invoice.totalAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6 border rounded-lg p-4">
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Guest Info:</h3>
            <p>{invoice.user.name}</p>
            <p>{invoice.user.mobile}</p>
            <p>{invoice.user.email}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Room & Service Details:</h3>
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
            {invoice.priceBreakdown.map((item, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-2">{item.description}</td>
                <td className="py-2 text-right">{item.rate}</td>
                <td className="py-2 text-right">{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right text-sm">
          <p><strong>SubTotal:</strong> ₹{invoice.totalAmount.toLocaleString()}</p>
          <p><strong>Tax (10%):</strong> ₹{(invoice.totalAmount * 0.1).toLocaleString()}</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            Grand Total: ₹{(invoice.totalAmount * 1.1).toLocaleString()}
          </p>
        </div>

        <div className="mt-10 text-center text-xs text-gray-500 border-t pt-4">
          <p>Terms & Conditions: Use of this website constitutes agreement with our policies.</p>
        </div>
      </div>

      <Button
  onClick={handleDownloadPDF}
  disabled={!invoice}
  className="mt-6 flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50"
>
  <FileDown className="w-4 h-4" />
  Download Invoice
</Button>

    </div>
  );
}
